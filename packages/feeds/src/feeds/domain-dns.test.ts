import { describe, it, expect } from "vitest";
import {
  lemmaTxtName,
  concatTxtChunks,
  parseLemmaTxt,
  resolveOid,
  txtAnswers,
  lemmaAnswer,
  buildSnapshot,
} from "./domain-dns.js";
import type { Json } from "@lemmaoracle/sdk";

describe("lemmaTxtName", () => {
  it("prefixes _lemma and strips the root dot", () => {
    expect(lemmaTxtName("example.com")).toBe("_lemma.example.com");
    expect(lemmaTxtName("example.com.")).toBe("_lemma.example.com");
  });
});

describe("concatTxtChunks", () => {
  it("joins quoted 255-byte wire chunks with no separator (byte-boundary split)", () => {
    // A split at an arbitrary byte boundary must reassemble losslessly.
    expect(concatTxtChunks('"v=lemma1 d" "id=abc"')).toBe("v=lemma1 did=abc");
    expect(concatTxtChunks('"v=lemma1" "did=abc"')).toBe("v=lemma1did=abc");
    expect(concatTxtChunks('"v=lem" "ma1 did=abc"')).toBe("v=lemma1 did=abc");
  });

  it("passes an unquoted (single-string) answer through", () => {
    expect(concatTxtChunks("v=lemma1 did=abc")).toBe("v=lemma1 did=abc");
  });
});

describe("parseLemmaTxt", () => {
  it("parses did and optional verified tags (backward compat: no oid)", () => {
    expect(parseLemmaTxt("v=lemma1 did=0xabc", "example.com")).toEqual({
      domain: "example.com",
      orgDid: "0xabc",
      orgIdentityDocHash: null,
      verifiedAt: null,
    });
    expect(
      parseLemmaTxt(
        "v=lemma1 did=0xabc verified=2026-08-28T00:00:00Z",
        "example.com",
      ),
    ).toEqual({
      domain: "example.com",
      orgDid: "0xabc",
      orgIdentityDocHash: null,
      verifiedAt: "2026-08-28T00:00:00Z",
    });
  });

  it("parses the optional oid tag (org-identity document hash)", () => {
    expect(
      parseLemmaTxt(
        "v=lemma1 did=0xabc oid=0x" + "ab".repeat(32),
        "example.com",
      ),
    ).toEqual({
      domain: "example.com",
      orgDid: "0xabc",
      orgIdentityDocHash: "0x" + "ab".repeat(32),
      verifiedAt: null,
    });
  });

describe("resolveOid", () => {
  it("keeps the live oid when only the record carries one", () => {
    expect(resolveOid("0xabc", "")).toBe("0xabc");
    expect(resolveOid("0xabc", "   ")).toBe("0xabc");
  });

  it("pins the env oid when the record does not carry one yet", () => {
    expect(resolveOid(null, "0xabc")).toBe("0xabc");
  });

  it("accepts an env oid that agrees with the record", () => {
    expect(resolveOid("0xabc", "0xabc")).toBe("0xabc");
  });

  it("returns null when neither the record nor the env carries an oid", () => {
    expect(resolveOid(null, "")).toBeNull();
    expect(resolveOid(null, "   ")).toBeNull();
  });

  it("rejects a record oid that disagrees with ORG_IDENTITY_DOC_HASH", () => {
    expect(() => resolveOid("0xaaa", "0xbbb")).toThrow(
      "does not match ORG_IDENTITY_DOC_HASH",
    );
  });
});

  it("rejects a record that does not start with v=lemma1", () => {
    expect(() => parseLemmaTxt("v=DKIM1 k=rsa", "example.com")).toThrow();
    expect(() => parseLemmaTxt("", "example.com")).toThrow();
  });

  it("rejects a missing did tag and unknown tags (no silent skipping)", () => {
    expect(() => parseLemmaTxt("v=lemma1", "example.com")).toThrow();
    expect(() => parseLemmaTxt("v=lemma1 did=x extra=y", "example.com")).toThrow();
  });

  it("rejects a tag without =", () => {
    expect(() => parseLemmaTxt("v=lemma1 did", "example.com")).toThrow();
  });
});

// RFC 8484 §4.2 shaped DoH responses.
const dohResponse = (answers: Json): Json => ({
  Status: 0,
  Answer: answers,
});

describe("txtAnswers", () => {
  const name = "_lemma.example.com";

  it("returns only TXT (type 16) answers on the exact query name", () => {
    const rows = txtAnswers(
      dohResponse([
        { name: `${name}.`, type: 16, data: '"v=lemma1 did=abc"' },
        { name: `${name}.`, type: 16, TTL: 300, data: '"v=lemma1 did=abc"' },
        { name: "example.com.", type: 16, data: '"v=spf1 -all"' },
        { name: `${name}.`, type: 1, data: "93.184.216.34" },
      ]),
      name,
    );
    expect(rows).toEqual(['"v=lemma1 did=abc"', '"v=lemma1 did=abc"']);
  });

  it("throws when the response has no Answer array", () => {
    expect(() => txtAnswers(dohResponse("NXDOMAIN" as unknown as Json), name)).toThrow();
    expect(() => txtAnswers({ Status: 3 } as Json, name)).toThrow();
  });

  it("ignores unrelated names rather than throwing", () => {
    const rows = txtAnswers(
      dohResponse([{ name: "other.example.com.", type: 16, data: '"v=lemma1"' }]),
      name,
    );
    expect(rows).toEqual([]);
  });
});

describe("lemmaAnswer", () => {
  it("returns the single v=lemma1 record among unrelated TXT strings", () => {
    expect(lemmaAnswer(['"v=spf1 -all"', '"v=lemma1 did=xyz"'], "example.com")).toBe(
      '"v=lemma1 did=xyz"',
    );
  });

  it("throws on zero or multiple lemma records (no arbitrary pick)", () => {
    expect(() => lemmaAnswer(['"v=spf1"'], "example.com")).toThrow(/got 0/);
    expect(() =>
      lemmaAnswer(['"v=lemma1 did=a"', '"v=lemma1 did=b"'], "example.com"),
    ).toThrow(/got 2/);
  });
});

describe("buildSnapshot", () => {
  it("commits a ~6-field compact structure with domain and orgDid", () => {
    const { compact, record } = buildSnapshot(
      {
        domain: "example.com",
        orgDid: "0xabc",
        orgIdentityDocHash: "0x" + "ab".repeat(32),
        verifiedAt: null,
      },
      "2026-08-28T01:02:03.000Z",
      "https://cloudflare-dns.com/dns-query",
    );
    expect(Object.keys(compact).sort()).toEqual([
      "doh",
      "domain",
      "orgDid",
      "orgIdentityDocHash",
      "queriedAt",
      "type",
      "verifiedAt",
    ]);
    expect(compact["domain"]).toBe("example.com");
    expect(compact["orgDid"]).toBe("0xabc");
    expect(compact["orgIdentityDocHash"]).toBe("0x" + "ab".repeat(32));
    expect(compact["verifiedAt"]).toBe("");
    expect(record.orgDid).toBe("0xabc");
    expect(record.orgIdentityDocHash).toBe("0x" + "ab".repeat(32));
  });
});
