import { describe, expect, it } from "vitest";
import type { LemmaClient, VerifiedAttributesQueryResponse } from "@lemmaoracle/spec";
import { queryVerifiedAttributes } from "./query-verified-attributes.js";

const API_BASE = "https://workers.lemma.test";
const QUERY_URL = "https://workers.lemma.test/v1/verified-attributes/query";

type Seen = {
  url: string;
  method: string | undefined;
  body: unknown;
};

const makeSeen = (): Seen => ({ url: "", method: undefined, body: undefined });

const makeClient = (canned: unknown, seen: Seen): LemmaClient => ({
  apiBase: API_BASE,
  fetcher: (async (url: unknown, init?: RequestInit) => {
    seen.url = String(url);
    seen.method = init?.method;
    seen.body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify(canned), { status: 200 });
  }) as unknown as typeof fetch,
});

const makeVerifiedItem = () => ({
  docHash: "0xaaa",
  schema: "kyc-v1",
  issuerId: "did:example:issuer",
  subjectId: "did:example:alice",
  chainId: 8453,
  attributes: { birthYear: 2001, country: "JP" },
  proof: { status: "verified", circuitId: "account-change-v1", chainId: 8453 },
});

const makeReceivedItem = () => ({
  docHash: "0xbbb",
  schema: "kyc-v1",
  issuerId: "did:example:issuer",
  subjectId: "did:example:bob",
  attributes: { birthYear: 1998 },
  proof: { status: "received", circuitId: "account-change-v1" },
});

const makeBaseCanned = (): VerifiedAttributesQueryResponse => ({
  results: [makeVerifiedItem(), makeReceivedItem()],
  hasMore: false,
});

describe("queryVerifiedAttributes", () => {
  it("sends empty attributes with no targets, limit, or offset for empty input and returns enriched results", async () => {
    const seen = makeSeen();
    const client = makeClient(makeBaseCanned(), seen);
    const out = await queryVerifiedAttributes(client, {});
    expect(seen.url).toBe(QUERY_URL);
    expect(seen.method).toBe("POST");
    expect(seen.body).toEqual({ attributes: [] });
    expect(seen.body).not.toHaveProperty("targets");
    expect(seen.body).not.toHaveProperty("limit");
    expect(seen.body).not.toHaveProperty("offset");
    expect(out.results).toHaveLength(2);
    expect(out.hasMore).toBe(false);
  });

  it("maps attribute predicates with missing value to null and preserves operator", async () => {
    const seen = makeSeen();
    const client = makeClient(makeBaseCanned(), seen);
    const out = await queryVerifiedAttributes(client, {
      attributes: [
        { name: "birthYear", operator: "lt", value: 2008 },
        { name: "nick" },
      ],
    });
    expect(seen.url).toBe(QUERY_URL);
    expect(seen.body).toEqual({
      attributes: [
        { name: "birthYear", operator: "lt", value: 2008 },
        { name: "nick", value: null },
      ],
    });
    expect(out.results).toHaveLength(2);
    expect(out.hasMore).toBe(false);
  });

  it("includes targets with schemas and chainIds when schemas is non-empty", async () => {
    const seen = makeSeen();
    const client = makeClient(makeBaseCanned(), seen);
    const out = await queryVerifiedAttributes(client, { schemas: ["kyc-v1"], chainIds: [1, 8453] });
    expect(seen.url).toBe(QUERY_URL);
    expect(seen.body).toEqual({
      attributes: [],
      targets: { schemas: ["kyc-v1"], chainIds: [1, 8453] },
    });
    expect(out.hasMore).toBe(false);
  });

  it("omits targets when schemas is an empty array even if chainIds are provided", async () => {
    const seen = makeSeen();
    const client = makeClient(makeBaseCanned(), seen);
    const out = await queryVerifiedAttributes(client, { schemas: [], chainIds: [1] });
    expect(seen.url).toBe(QUERY_URL);
    expect(seen.body).toEqual({ attributes: [] });
    expect(out.results).toHaveLength(2);
    expect(out.hasMore).toBe(false);
  });

  it("omits targets when schemas is undefined even if chainIds are provided", async () => {
    const seen = makeSeen();
    const client = makeClient(makeBaseCanned(), seen);
    const out = await queryVerifiedAttributes(client, { chainIds: [1] });
    expect(seen.url).toBe(QUERY_URL);
    expect(seen.body).toEqual({ attributes: [] });
    expect(out.hasMore).toBe(false);
  });

  it("clamps limit above 200 to 200 and passes offset through", async () => {
    const seen = makeSeen();
    const client = makeClient(makeBaseCanned(), seen);
    const out = await queryVerifiedAttributes(client, { limit: 999, offset: 25 });
    expect(seen.url).toBe(QUERY_URL);
    expect(seen.body).toEqual({ attributes: [], limit: 200, offset: 25 });
    expect(out.hasMore).toBe(false);
  });

  it("clamps limit below 1 to 1 and floors negative offset to 0", async () => {
    const seen = makeSeen();
    const client = makeClient(makeBaseCanned(), seen);
    const out = await queryVerifiedAttributes(client, { limit: 0, offset: -5 });
    expect(seen.url).toBe(QUERY_URL);
    expect(seen.body).toEqual({ attributes: [], limit: 1, offset: 0 });
    expect(out.results).toHaveLength(2);
    expect(out.hasMore).toBe(false);
  });

  it("enriches results with isVerified from proof.status and passes disclosure through unchanged", async () => {
    const seen = makeSeen();
    const disclosure = {
      format: "bbs+",
      attributes: { country: "JP" },
      proof: "0xdisclosure-proof",
      publicKey: "0xdisclosure-pubkey",
      indexes: [0],
      count: 1,
    };
    const verifiedProof = { status: "verified", circuitId: "account-change-v1", chainId: 8453 };
    const canned = {
      results: [
        {
          docHash: "0xaaa",
          schema: "kyc-v1",
          issuerId: "did:example:issuer",
          subjectId: "did:example:alice",
          chainId: 8453,
          attributes: { birthYear: 2001, country: "JP" },
          proof: verifiedProof,
          disclosure,
        },
        {
          docHash: "0xccc",
          schema: "kyc-v1",
          issuerId: "did:example:issuer",
          subjectId: "did:example:carol",
          attributes: { birthYear: 2000 },
          proof: { status: "onchain-verified", circuitId: "account-change-v1" },
        },
        {
          docHash: "0xbbb",
          schema: "kyc-v1",
          issuerId: "did:example:issuer",
          subjectId: "did:example:bob",
          attributes: { birthYear: 1998 },
          proof: { status: "received", circuitId: "account-change-v1" },
        },
        {
          docHash: "0xddd",
          schema: "kyc-v1",
          issuerId: "did:example:issuer",
          subjectId: "did:example:dave",
          attributes: { birthYear: 2005 },
        },
      ],
      hasMore: true,
    } as unknown as VerifiedAttributesQueryResponse;
    const client = makeClient(canned, seen);
    const out = await queryVerifiedAttributes(client, {});
    expect(seen.url).toBe(QUERY_URL);
    expect(seen.body).toEqual({ attributes: [] });
    expect(out.results[0]?.isVerified).toBe(true);
    expect(out.results[1]?.isVerified).toBe(true);
    expect(out.results[2]?.isVerified).toBe(false);
    expect(out.results[3]?.isVerified).toBe(false);
    expect(out.results[0]?.disclosure).toEqual(disclosure);
    expect(out.results[0]?.proof).toEqual(verifiedProof);
    expect(out.hasMore).toBe(true);
  });
});
