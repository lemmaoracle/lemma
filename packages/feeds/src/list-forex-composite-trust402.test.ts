import { describe, expect, it } from "vitest";
import { commitDeep } from "@lemmaoracle/sdk";
import type { FetchResult } from "@lemmaoracle/fetcher";
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  archivePaths,
  findLeaf,
  inclusionWitness,
  listingTitle,
  listForexCompositeTrust402,
  parseEnvelope,
  REQUEST_DATE_PATH,
  REQUEST_URL_PATH,
  toHex64,
  utcDate,
} from "./list-forex-composite-trust402.js";

const buildEnvelope = (date: string, url: string): FetchResult => {
  const request = {
    url,
    fetchedAt: Date.parse(`${date}T12:00:00.000Z`),
    date,
  };
  const data = {
    feedId: "forex/composite",
    attributes: { date: "2026-07-24", base: "USD" },
  };
  const commitment = commitDeep(
    { request, response: { data } },
    { maxDepth: 16 },
  );
  return {
    request,
    response: { data, canonical: JSON.stringify(data) },
    commitment,
  };
};

describe("list-forex-composite-trust402 helpers", () => {
  it("utcDate formats UTC YYYY-MM-DD", () => {
    expect(utcDate(Date.parse("2026-07-26T01:00:00.000Z"))).toBe("2026-07-26");
  });

  it("listingTitle encodes date", () => {
    expect(listingTitle("2026-07-26")).toBe("forex/composite@2026-07-26");
  });

  it("archivePaths are date-keyed", () => {
    const paths = archivePaths("/tmp/archives", "2026-07-26");
    expect(paths.envelope).toBe("/tmp/archives/2026-07-26.envelope.json");
    expect(paths.listing).toBe("/tmp/archives/2026-07-26.listing.json");
  });

  it("toHex64 pads to 32 bytes", () => {
    expect(toHex64("0x1")).toBe(`0x${"0".repeat(63)}1`);
  });

  it("parseEnvelope accepts a valid FetchResult", async () => {
    const envelope = buildEnvelope(
      "2026-07-26",
      "https://workers.lemma.workers.dev/v1/suites/feeds/forex/composite/latest",
    );
    const parsed = await parseEnvelope(envelope);
    expect(parsed.request.date).toBe("2026-07-26");
    expect(parsed.commitment.root).toBe(envelope.commitment.root);
  }, 30_000);

  it("parseEnvelope rejects missing request", async () => {
    await expect(parseEnvelope({ response: { data: {} } })).rejects.toThrow(
      /invalid fetcher envelope/,
    );
  });

  it("findLeaf locates request date and url paths", async () => {
    const envelope = buildEnvelope(
      "2026-07-26",
      "https://workers.lemma.workers.dev/v1/suites/feeds/forex/composite/latest",
    );
    const dateLeaf = await findLeaf(envelope.commitment, REQUEST_DATE_PATH);
    expect(dateLeaf.preimage.name).toBe(REQUEST_DATE_PATH);
    expect(String(dateLeaf.preimage.value)).toContain("2026-07-26");

    const urlLeaf = await findLeaf(envelope.commitment, REQUEST_URL_PATH);
    expect(urlLeaf.preimage.name).toBe(REQUEST_URL_PATH);
  }, 30_000);

  it("inclusionWitness builds bigint witness fields", async () => {
    const envelope = buildEnvelope(
      "2026-07-26",
      "https://workers.lemma.workers.dev/v1/suites/feeds/forex/composite/latest",
    );
    const { preimage, proof } = await findLeaf(
      envelope.commitment,
      REQUEST_DATE_PATH,
    );
    const witness = inclusionWitness(envelope.commitment, preimage, proof, 16);
    expect(typeof witness["root"]).toBe("bigint");
    expect(Array.isArray(witness["siblings"])).toBe(true);
    expect((witness["siblings"] as ReadonlyArray<bigint>).length).toBe(16);
    expect((witness["indices"] as ReadonlyArray<number>).length).toBe(16);
  }, 30_000);
});

describe("listForexCompositeTrust402 idempotency", () => {
  it("returns already-listed when receipt exists", async () => {
    const dir = await mkdtemp(join(tmpdir(), "forex-t402-"));
    const date = "2026-07-26";
    const paths = archivePaths(dir, date);
    await writeFile(
      paths.listing,
      JSON.stringify({
        date,
        listingRoot: "0xlist",
        commitment: "0xcommit",
        title: listingTitle(date),
        createdAt: 1,
      }),
      "utf8",
    );

    const result = await listForexCompositeTrust402({
      date,
      archiveDir: dir,
      fetcherUrl: "https://fetcher.example",
      latestUrl: "https://workers.example/latest",
      apiBase: "https://trust402.example",
      apiKey: "",
      circuitId: "data-commitment-v1.1",
      maxDepth: 16,
      dryRun: true,
      did: "did:test",
      priceUsdc: 0,
      environment: "sandbox",
      payoutAddress: "",
      uploadFile: false,
    });

    expect(result.status).toBe("already-listed");
    expect(result.listingRoot).toBe("0xlist");
    expect(result.commitment).toBe("0xcommit");
  });

  it(
    "dry-runs from archive without re-fetching",
    async () => {
      const dir = await mkdtemp(join(tmpdir(), "forex-t402-"));
      const date = "2026-07-20";
      const url =
        "https://workers.lemma.workers.dev/v1/suites/feeds/forex/composite/latest";
      const envelope = buildEnvelope(date, url);
      const paths = archivePaths(dir, date);
      await mkdir(dir, { recursive: true });
      await writeFile(paths.envelope, `${JSON.stringify(envelope)}\n`, "utf8");

      const result = await listForexCompositeTrust402({
        date,
        archiveDir: dir,
        fetcherUrl: "https://fetcher.invalid",
        latestUrl: url,
        apiBase: "https://trust402.invalid",
        apiKey: "",
        circuitId: "data-commitment-v1.1",
        maxDepth: 16,
        dryRun: true,
        did: "did:test",
        priceUsdc: 0,
        environment: "sandbox",
        payoutAddress: "",
        uploadFile: false,
      });

      expect(result.status).toBe("dry-run");
      expect(result.commitment).toBe(envelope.commitment.root);
      expect(result.title).toBe(listingTitle(date));
      expect(result.listingRoot).toBe("0xdryrun");
    },
    30_000,
  );

  it("rejects past date without archive", async () => {
    const dir = await mkdtemp(join(tmpdir(), "forex-t402-"));
    await expect(
      listForexCompositeTrust402({
        date: "2020-01-01",
        archiveDir: dir,
        fetcherUrl: "https://fetcher.invalid",
        latestUrl: "https://workers.invalid/latest",
        apiBase: "https://trust402.invalid",
        apiKey: "",
        circuitId: "data-commitment-v1.1",
        maxDepth: 16,
        dryRun: true,
        did: "did:test",
        priceUsdc: 0,
        environment: "sandbox",
        payoutAddress: "",
        uploadFile: false,
      }),
    ).rejects.toThrow(/no archive for 2020-01-01/);
  });
});
