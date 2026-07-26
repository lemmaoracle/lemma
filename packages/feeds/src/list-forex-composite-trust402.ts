/**
 * Forex composite → Trust402 listing helpers.
 *
 * Fetches `/v1/suites/feeds/forex/composite/latest` via fetcher Workers,
 * archives the envelope by `request.date`, and publishes a Trust402 dataset
 * listing whose commitment is the fetcher Merkle root.
 */
import { create as createTrust402, publish } from "@trust402/sdk";
import type { Listing } from "@trust402/sdk";
import type { FetchResult } from "@lemmaoracle/fetcher";
import type { CommitResult, InclusionProof, Json, LeafPreimage } from "@lemmaoracle/sdk";
import { create as createLemma, proofs, prover } from "@lemmaoracle/sdk";
import { poseidon2 } from "poseidon-lite";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";

// ── constants ─────────────────────────────────────────────────────────────

export const DEFAULT_FETCHER_URL = "https://fetcher.lemma.workers.dev";
export const DEFAULT_LATEST_URL =
  "https://workers.lemma.workers.dev/v1/suites/feeds/forex/composite/latest";
export const DEFAULT_CIRCUIT_ID = "data-commitment-v1.1";
export const DEFAULT_MAX_DEPTH = 16;
export const REQUEST_DATE_PATH = '$["request"]["date"]';
export const REQUEST_URL_PATH = '$["request"]["url"]';

// ── types ─────────────────────────────────────────────────────────────────

export type ListingReceipt = Readonly<{
  date: string;
  listingRoot: string;
  commitment: string;
  cardId?: string;
  title: string;
  createdAt: number;
}>;

export type ArchivePaths = Readonly<{
  envelope: string;
  listing: string;
}>;

export type ListForexCompositeConfig = Readonly<{
  /** UTC YYYY-MM-DD; defaults to today. */
  date: string;
  archiveDir: string;
  fetcherUrl: string;
  latestUrl: string;
  apiBase: string;
  apiKey: string;
  circuitId: string;
  maxDepth: number;
  dryRun: boolean;
  did: string;
  priceUsdc: number;
  environment: "sandbox" | "production";
  payoutAddress: string;
  /** When set, publish() uploads the envelope file to the storefront. */
  uploadFile: boolean;
}>;

export type ListForexCompositeResult = Readonly<{
  status: "already-listed" | "listed" | "dry-run";
  date: string;
  commitment: string;
  listingRoot?: string;
  cardId?: string;
  title: string;
  envelopePath: string;
  listingPath: string;
}>;

// ── pure helpers ──────────────────────────────────────────────────────────

/** UTC calendar date `YYYY-MM-DD` for an instant (default: now). */
export const utcDate = (ms: number = Date.now()): string =>
  new Date(ms).toISOString().slice(0, 10);

export const listingTitle = (date: string): string => `forex/composite@${date}`;

export const archivePaths = (archiveDir: string, date: string): ArchivePaths =>
  Object.freeze({
    envelope: join(archiveDir, `${date}.envelope.json`),
    listing: join(archiveDir, `${date}.listing.json`),
  });

const isRecord = (v: unknown): v is Readonly<Record<string, unknown>> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isCommitResult = (v: unknown): v is CommitResult =>
  isRecord(v) &&
  typeof v["root"] === "string" &&
  typeof v["randomness"] === "string" &&
  Array.isArray(v["leafPreimages"]) &&
  Array.isArray(v["inclusionProofs"]);

/**
 * Validate and narrow a JSON body to FetchResult.
 * Rejects envelopes missing request provenance or commitment root.
 */
export const parseEnvelope = (body: unknown): Promise<FetchResult> => {
  const obj = isRecord(body) ? body : undefined;
  const request = obj !== undefined && isRecord(obj["request"]) ? obj["request"] : undefined;
  const response =
    obj !== undefined && isRecord(obj["response"]) ? obj["response"] : undefined;
  const commitment = obj !== undefined ? obj["commitment"] : undefined;

  return request === undefined ||
    response === undefined ||
    !isCommitResult(commitment) ||
    typeof request["url"] !== "string" ||
    typeof request["date"] !== "string" ||
    typeof request["fetchedAt"] !== "number" ||
    response["data"] === undefined
    ? Promise.reject(new Error("invalid fetcher envelope"))
    : Promise.resolve({
        request: {
          url: request["url"],
          fetchedAt: request["fetchedAt"],
          date: request["date"],
        },
        response: {
          data: response["data"] as Json,
          canonical:
            typeof response["canonical"] === "string" ? response["canonical"] : "",
        },
        commitment,
      });
};

export const toHex64 = (hex: string): string => {
  const stripped = hex.startsWith("0x") ? hex.slice(2) : hex;
  return `0x${stripped.padStart(64, "0")}`;
};

const padToDepth = <T>(
  arr: readonly T[],
  depth: number,
  pad: T,
): ReadonlyArray<T> =>
  arr.length >= depth
    ? arr
    : [...arr, ...Array.from({ length: depth - arr.length }, (_i: number) => pad)];

export const findLeaf = (
  commitment: CommitResult,
  path: string,
): Promise<Readonly<{ preimage: LeafPreimage; proof: InclusionProof }>> => {
  const idx = commitment.leafPreimages.findIndex(
    (p: LeafPreimage) => p.name === path,
  );
  const preimage = idx === -1 ? undefined : commitment.leafPreimages[idx];
  const proof = idx === -1 ? undefined : commitment.inclusionProofs[idx];
  return preimage === undefined || proof === undefined
    ? Promise.reject(new Error(`leaf not found: ${path}`))
    : Promise.resolve({ preimage, proof });
};

/** Build data-commitment-v1.1 witness for one leaf. */
export const inclusionWitness = (
  commitment: CommitResult,
  preimage: LeafPreimage,
  proof: InclusionProof,
  maxDepth: number,
): Readonly<Record<string, unknown>> =>
  Object.freeze({
    root: BigInt(toHex64(commitment.root)),
    randomness: BigInt(toHex64(commitment.randomness)),
    pathHash: BigInt(toHex64(preimage.nameHash)),
    valueHash: BigInt(toHex64(preimage.valueHash)),
    siblings: padToDepth(proof.siblings, maxDepth, "0x0").map((s) =>
      BigInt(toHex64(s)),
    ),
    indices: padToDepth(proof.indices, maxDepth, 0),
  });

export const envelopeBytes = (envelope: FetchResult): Uint8Array =>
  new TextEncoder().encode(`${JSON.stringify(envelope, null, 2)}\n`);

// ── filesystem ────────────────────────────────────────────────────────────

const fileExists = (path: string): Promise<boolean> =>
  access(path).then(
    (_value: unknown) => true,
    (_err: unknown) => false,
  );

export const readJsonFile = <T>(path: string): Promise<T> =>
  readFile(path, "utf8").then((text) => JSON.parse(text) as T);

export const writeJsonFile = (path: string, value: unknown): Promise<void> =>
  mkdir(dirname(path), { recursive: true }).then((_value: unknown) =>
    writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8"),
  );

export const loadListingReceipt = (
  path: string,
): Promise<ListingReceipt | undefined> =>
  fileExists(path).then((exists) =>
    exists ? readJsonFile<ListingReceipt>(path) : Promise.resolve(undefined),
  );

export const loadEnvelopeArchive = (
  path: string,
): Promise<FetchResult | undefined> =>
  fileExists(path).then((exists) =>
    exists
      ? readJsonFile<unknown>(path).then(parseEnvelope)
      : Promise.resolve(undefined),
  );

// ── fetch ─────────────────────────────────────────────────────────────────

/**
 * Fetch the suite latest URL through fetcher Workers `/fetch`.
 */
export const fetchForexCompositeEnvelope = (
  fetcherUrl: string,
  latestUrl: string,
  maxDepth: number = DEFAULT_MAX_DEPTH,
): Promise<FetchResult> => {
  const endpoint = `${fetcherUrl.replace(/\/$/, "")}/fetch?url=${encodeURIComponent(latestUrl)}&maxDepth=${String(maxDepth)}`;
  return fetch(endpoint).then((res) =>
    !res.ok
      ? Promise.reject(
          new Error(`fetcher: HTTP ${String(res.status)} from ${endpoint}`),
        )
      : res.json().then(parseEnvelope),
  );
};

/**
 * Resolve the envelope for `date`: archive hit, or fetch when date is today.
 */
export const resolveEnvelope = (
  config: Readonly<{
    date: string;
    archiveDir: string;
    fetcherUrl: string;
    latestUrl: string;
    maxDepth: number;
    today: string;
  }>,
): Promise<Readonly<{ envelope: FetchResult; fromArchive: boolean }>> => {
  const paths = archivePaths(config.archiveDir, config.date);
  return loadEnvelopeArchive(paths.envelope).then((archived) =>
    archived !== undefined
      ? archived.request.date !== config.date
        ? Promise.reject(
            new Error(
              `archive date mismatch: expected ${config.date}, got ${archived.request.date}`,
            ),
          )
        : Promise.resolve({ envelope: archived, fromArchive: true })
      : config.date !== config.today
        ? Promise.reject(
            new Error(
              `no archive for ${config.date} (historical fetch is out of scope; archive today's envelope first)`,
            ),
          )
        : fetchForexCompositeEnvelope(
            config.fetcherUrl,
            config.latestUrl,
            config.maxDepth,
          ).then((envelope) =>
            envelope.request.date !== config.date
              ? Promise.reject(
                  new Error(
                    `fetched request.date ${envelope.request.date} !== requested ${config.date}`,
                  ),
                )
              : writeJsonFile(paths.envelope, envelope).then((_value: unknown) => ({
                  envelope,
                  fromArchive: false,
                })),
          ),
  );
};

// ── Trust402 publish ──────────────────────────────────────────────────────

const trust402DocHash = (
  commitment: string,
  environment: "sandbox" | "production",
): string => {
  const chainId = environment === "production" ? 8453 : 84532;
  return `0x${poseidon2([BigInt(commitment), BigInt(chainId)]).toString(16)}`;
};

const submitUrlLeafProof = (
  config: ListForexCompositeConfig,
  envelope: FetchResult,
  listing: Listing,
): Promise<void> =>
  config.dryRun
    ? Promise.resolve(undefined)
    : findLeaf(envelope.commitment, REQUEST_URL_PATH).then(({ preimage, proof }) => {
        const client = createLemma({
          apiBase: config.apiBase,
          apiKey: config.apiKey,
        });
        const witness = inclusionWitness(
          envelope.commitment,
          preimage,
          proof,
          config.maxDepth,
        );
        return prover
          .prove(client, { circuitId: config.circuitId, witness })
          .then((proved: Readonly<{ proof: string; inputs: ReadonlyArray<string> }>) =>
            proofs.submit(client, {
              docHash: trust402DocHash(listing.commitment, config.environment),
              circuitId: config.circuitId,
              proof: proved.proof,
              inputs: proved.inputs,
            }),
          )
          .then((_value: unknown) => undefined);
      });

const publishEnvelope = (
  config: ListForexCompositeConfig,
  envelope: FetchResult,
): Promise<Listing> =>
  findLeaf(envelope.commitment, REQUEST_DATE_PATH).then(({ preimage, proof }) => {
    const witness = inclusionWitness(
      envelope.commitment,
      preimage,
      proof,
      config.maxDepth,
    );
    const title = listingTitle(envelope.request.date);
    const body = new TextDecoder().decode(envelopeBytes(envelope));
    const client = createTrust402({
      apiBase: config.apiBase,
      apiKey: config.apiKey,
    });

    return config.dryRun
      ? Promise.resolve(
          Object.freeze({
            listingRoot: "0xdryrun",
            schemaId: config.circuitId,
            commitment: envelope.commitment.root,
            did: config.did,
            price: Object.freeze({
              amount: config.priceUsdc,
              currency: "USDC" as const,
            }),
            perSchemaProof: null,
            metadata: Object.freeze({ title, version: "1" }),
            environment: config.environment,
            createdAt: Date.now(),
          }) satisfies Listing,
        )
      : publish(client, {
          circuitId: config.circuitId,
          witness,
          commitment: envelope.commitment.root,
          price: { amount: config.priceUsdc, currency: "USDC" },
          did: config.did,
          metadata: { title, version: "1", description: envelope.request.url },
          environment: config.environment,
          ...(config.uploadFile
            ? {
                file: {
                  body,
                  name: `forex-composite-${envelope.request.date}.json`,
                  type: "application/json",
                } as const,
                category: "dataset" as const,
                payoutAddress: config.payoutAddress,
              }
            : {}),
        });
  });

/**
 * Idempotent list: archive → Trust402 listing for one UTC day.
 */
export const listForexCompositeTrust402 = (
  config: ListForexCompositeConfig,
): Promise<ListForexCompositeResult> => {
  const paths = archivePaths(config.archiveDir, config.date);
  const title = listingTitle(config.date);

  return loadListingReceipt(paths.listing).then((receipt) =>
    receipt !== undefined
      ? Promise.resolve({
          status: "already-listed" as const,
          date: config.date,
          commitment: receipt.commitment,
          listingRoot: receipt.listingRoot,
          cardId: receipt.cardId,
          title: receipt.title,
          envelopePath: paths.envelope,
          listingPath: paths.listing,
        })
      : resolveEnvelope({
          date: config.date,
          archiveDir: config.archiveDir,
          fetcherUrl: config.fetcherUrl,
          latestUrl: config.latestUrl,
          maxDepth: config.maxDepth,
          today: utcDate(),
        }).then(({ envelope }) =>
          publishEnvelope(config, envelope).then((listing) => {
            const nextReceipt: ListingReceipt = Object.freeze({
              date: config.date,
              listingRoot: listing.listingRoot,
              commitment: listing.commitment,
              ...(listing.cardId !== undefined ? { cardId: listing.cardId } : {}),
              title,
              createdAt: listing.createdAt,
            });
            return (
              config.dryRun
                ? Promise.resolve(undefined)
                : writeJsonFile(paths.listing, nextReceipt).then((_value: unknown) =>
                    submitUrlLeafProof(config, envelope, listing),
                  )
            ).then((_value: unknown) => ({
              status: config.dryRun ? ("dry-run" as const) : ("listed" as const),
              date: config.date,
              commitment: listing.commitment,
              listingRoot: listing.listingRoot,
              cardId: listing.cardId,
              title,
              envelopePath: paths.envelope,
              listingPath: paths.listing,
            }));
          }),
        ),
  );
};
