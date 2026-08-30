/**
 * DNS domain-verification feed (identity/dns).
 *
 * Fetches a domain's `_lemma.<domain>` TXT record via DNS-over-HTTPS (JSON)
 * and commits it with data-commitment-v1. This is the Level-2 layer of issuer
 * verification (#766 discussion): the commitment binds
 * `{ request: { url, fetchedAt, date }, response: { data } }`, so the queried
 * domain and the DNS answer are tamper-evident afterwards — the same trust
 * model as the forex feeds, applied to issuer identity.
 *
 * Trust note: identical to Web PKI domain validation — whoever controls the
 * zone publishes the orgDid. The registry consumer (workers API / verify
 * page) matches `attributes.orgDid` against an org-identity-v1 commitment
 * for the same domain, closing the self-attestation gap the spec flags
 * (packages/spec §SubmitProof — "DNS-verified domain").
 *
 * DNS record contract:
 *   _lemma.example.com  TXT  "v=lemma1 did=<poseidon-hex>" [verified=<iso8601>]
 *
 * Long TXT values are split into 255-byte character-strings on the wire; the
 * DoH JSON answer concatenates them back as quoted chunks ("…" "…"), which
 * this feed re-joins before parsing. Tags are space-separated `key=value`
 * pairs; `v=lemma1` must be the first tag. Unknown tags are rejected rather
 * than skipped — a malformed record is a corruption signal, not a value to
 * ignore (same policy as jp-holidays).
 */

import type { FeedSource } from "../types.js";
import type { FetchResult, FetcherConfig } from "@lemmaoracle/fetcher";
import type { Json } from "@lemmaoracle/sdk";
import { canonicalSort, commitDeep } from "@lemmaoracle/sdk";

const DEFAULT_DOH = "https://cloudflare-dns.com/dns-query";
const TYPE = "dns-domain-verify-v1";

export type DomainVerifyRecord = Readonly<{
  /** The domain the `_lemma.` label was queried under (no trailing dot). */
  readonly domain: string;
  /** The orgDid published by the domain (`did=` tag value). */
  readonly orgDid: string;
  /** Optional timestamp the domain operator set (`verified=` tag). */
  readonly verifiedAt: string | null;
}>;

export type DomainVerifySnapshot = Readonly<{
  /** The committed compact structure (~6 Merkle leaves). */
  readonly compact: Readonly<Record<string, string>>;
  readonly record: DomainVerifyRecord;
}>;

// ── helpers ─────────────────────────────────────────────────────────────────

/** Sync validation boundary for parsers — no Promise-returning alternative. */
const fail = (message: string): never => {
  // imperative: sync parser API must throw — no functional alternative
  // eslint-disable-next-line functional/no-throw-statements
  throw new Error(message);
};

const isRecord = (v: unknown): v is Readonly<Record<string, Json>> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const jsonString = (v: Json | undefined, fallback: string): string =>
  typeof v === "string" ? v : fallback;

/** `example.com.` → `example.com` (DoH answers carry a trailing root dot). */
const stripRootDot = (name: string): string =>
  name.endsWith(".") ? name.slice(0, -1) : name;

/** The query name for a domain's Lemma TXT record. */
export const lemmaTxtName = (domain: string): string =>
  `_lemma.${stripRootDot(domain)}`;

/**
 * Re-join the wire-format 255-byte chunks of a TXT record. The DoH JSON
 * answer renders them as adjacent quoted strings (`"part1" "part2"`); the
 * split point is an arbitrary byte boundary, so chunks are concatenated with
 * no separator. A payload that is not entirely quoted (e.g. a single
 * unquoted string from another resolver) is returned trimmed as-is.
 */
export const concatTxtChunks = (data: string): string => {
  const t = data.trim();
  const quoted = t.startsWith('"') && t.endsWith('"');
  const chunks = quoted ? t.match(/"[^"]*"/g) : null;
  return chunks === null ? t : chunks.map((c) => c.slice(1, -1)).join("");
};

/**
 * Parse the concatenated `_lemma` TXT payload into the record.
 *
 * `v=lemma1` must be the first tag; `did=` is required; `verified=` is
 * optional; anything else is rejected.
 */
export const parseLemmaTxt = (
  txt: string,
  domain: string,
): DomainVerifyRecord => {
  const joined = concatTxtChunks(txt);
  const tags = joined
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const first = tags[0];
  // imperative: sync validation boundary must throw (see `fail`) — expressed
  // as a conditional expression per FP style; `_vTagChecked` is never used.
  const _vTagChecked: undefined =
    first !== "v=lemma1"
      ? fail(`domain-dns: record does not start with v=lemma1: "${joined}"`)
      : undefined;

  const pairs = tags
    .slice(1)
    .map((tag): readonly [string, string] => {
      const eq = tag.indexOf("=");
      return eq < 0
        ? fail(`domain-dns: unparsable tag "${tag}"`)
        : [tag.slice(0, eq), tag.slice(eq + 1)];
    });
  const unknownTag = pairs.find(([k]) => k !== "did" && k !== "verified");
  // imperative: sync validation boundary must throw (see `fail`)
  const _knownTagsChecked: undefined =
    unknownTag !== undefined
      ? fail(`domain-dns: unknown tag "${unknownTag[0]}"`)
      : undefined;

  const orgDid = pairs.find(([k]) => k === "did")?.[1];
  // imperative: sync validation boundary must throw (see `fail`)
  const _didChecked: undefined =
    orgDid === undefined || orgDid === ""
      ? fail("domain-dns: missing did= tag")
      : undefined;
  const verifiedAt = pairs.find(([k]) => k === "verified")?.[1] ?? null;

  return { domain: stripRootDot(domain), orgDid: orgDid ?? "", verifiedAt };
};

// ── DoH response → TXT strings ──────────────────────────────────────────────

/**
 * Extract the TXT (type 16) answers for `name` from a DoH JSON response
 * (RFC 8484 §4.2). A zone can carry unrelated TXT strings; only records on
 * the exact query name are returned.
 */
export const txtAnswers = (
  response: Json,
  name: string,
): ReadonlyArray<string> => {
  // imperative: sync validation boundary must throw (see `fail`)
  const obj: Readonly<Record<string, Json>> = isRecord(response)
    ? response
    : fail("domain-dns: DoH response is not an object");
  const answers = obj["Answer"];
  // imperative: sync validation boundary must throw (see `fail`)
  const list: ReadonlyArray<unknown> =
    answers === undefined || answers === null || !Array.isArray(answers)
      ? fail("domain-dns: DoH response has no Answer")
      : (answers as ReadonlyArray<unknown>);

  const want = stripRootDot(name);
  const rows: ReadonlyArray<Readonly<Record<string, Json>>> = list.filter(
    (a): a is Readonly<Record<string, Json>> => isRecord(a),
  );
  return rows
    .filter((a) => a["type"] === 16)
    .filter((a) => stripRootDot(jsonString(a["name"], "")) === want)
    .map((a) => jsonString(a["data"], ""));
};

/**
 * Pick the one Lemma record out of all TXT answers for `_lemma.<domain>`.
 * Zero or several `v=lemma1` records is an error, not an arbitrary pick.
 */
export const lemmaAnswer = (
  answers: ReadonlyArray<string>,
  domain: string,
): string => {
  const lemma = answers.filter((d) => concatTxtChunks(d).startsWith("v=lemma1"));
  const single = lemma.length === 1 ? lemma[0] : undefined;
  return (
    single ??
    fail(
      `domain-dns: expected exactly one v=lemma1 TXT for _lemma.${domain}, got ${String(lemma.length)}`,
    )
  );
};

// ── snapshot ────────────────────────────────────────────────────────────────

/**
 * The committed compact structure (~6 leaves): type, domain, orgDid,
 * verifiedAt, queriedAt, doh. The raw DoH answer travels in `data.answer`
 * (uncommitted) so a client can re-derive the tags without re-querying.
 */
export const buildSnapshot = (
  record: DomainVerifyRecord,
  queriedAt: string,
  dohUrl: string,
): DomainVerifySnapshot => ({
  compact: {
    type: TYPE,
    domain: record.domain,
    orgDid: record.orgDid,
    verifiedAt: record.verifiedAt ?? "",
    queriedAt,
    doh: dohUrl,
  },
  record,
});

// ── feed source ──────────────────────────────────────────────────────────────

const env = (name: string, fallback: string): string =>
  process.env[name] ?? fallback;

export const domainDns: FeedSource = {
  id: "identity/dns",
  label: "DNS domain verification (DoH)",
  category: "identity",

  fetch: async (config?: FetcherConfig): Promise<FetchResult> => {
    const domain = env("LEMMA_DOMAIN", "");
    // imperative: fetch entry point must throw on misconfiguration (see `fail`)
    // — expressed as a conditional expression per FP style; `_domainChecked`
    // is never used.
    const _domainChecked: undefined =
      domain === ""
        ? fail("domain-dns: LEMMA_DOMAIN env is required")
        : undefined;
    const doh = env("LEMMA_DOH_URL", DEFAULT_DOH);
    const name = lemmaTxtName(domain);
    const url = `${doh}?name=${encodeURIComponent(name)}&type=TXT`;

    const headers = {
      accept: "application/dns-json",
      ...(config?.headers ?? {}),
    };
    const resp = await fetch(url, { headers }).then((r) =>
      r.ok
        ? r
        : Promise.reject(
            new Error(`domain-dns: DoH fetch ${url} → ${String(r.status)}`),
          ),
    );
    const response = (await resp.json()) as Json;

    const answerData = lemmaAnswer(txtAnswers(response, name), domain);
    const record = parseLemmaTxt(answerData, domain);
    const queriedAt = new Date().toISOString();

    // Commit the compact structure; the raw DoH answer rides along uncommitted.
    const snap = buildSnapshot(record, queriedAt, doh);
    const compactJson = snap.compact as unknown as Json;
    const { canonical } = canonicalSort(compactJson);
    const maxDepth = Number(env("FEED_MAX_DEPTH", "16"));
    const commitment = commitDeep(compactJson, { maxDepth });

    return {
      request: {
        url,
        fetchedAt: Date.now(),
        date: new Date().toISOString().slice(0, 10),
      },
      response: {
        data: { ...snap.compact, answer: response },
        canonical,
      },
      commitment,
    };
  },

  // Content-derived (domain + orgDid), so re-running against an unchanged
  // record yields the same docHash — freshness re-verification is idempotent.
  getDocumentId: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    return `${jsonString(obj["domain"], "unknown")}-${jsonString(obj["orgDid"], "unknown")}`;
  },

  getAttributes: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    return {
      "meta.type": jsonString(obj["type"], TYPE),
      "meta.domain": jsonString(obj["domain"], ""),
      "meta.orgDid": jsonString(obj["orgDid"], ""),
      "meta.verifiedAt": jsonString(obj["verifiedAt"], ""),
      "meta.queriedAt": jsonString(obj["queriedAt"], ""),
      "meta.doh": jsonString(obj["doh"], ""),
    };
  },
};
