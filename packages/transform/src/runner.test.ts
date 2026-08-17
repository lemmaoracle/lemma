/**
 * Tests for the transform runner and chain verification.
 */
import { readFile } from "node:fs/promises";
import { describe, it, expect } from "vitest";
import {
  fileHash,
  fileCommitment,
  sha256Field,
  computeArgsHash,
  buildGenesisRecord,
  buildChainedRecord,
  verifyChain,
} from "../src/index.js";
import type { ExecutionRecord } from "../src/index.js";

const encoder = new TextEncoder();

// The runner is environment-agnostic: the caller supplies the WASM binary.
// Tests run in Node, so load it from the wasm-pack output directory.
const wasmBytes = new Uint8Array(
  await readFile(
    new URL("../normalize/pkg/lemma_transform_bg.wasm", import.meta.url),
  ),
);

describe("fileHash", () => {
  it("produces deterministic results for same input", () => {
    const data = encoder.encode("hello world");
    const a = fileHash(data);
    const b = fileHash(data);
    expect(a).toBe(b);
  });

  it("produces different results for different input", () => {
    const a = fileHash(encoder.encode("hello"));
    const b = fileHash(encoder.encode("world"));
    expect(a).not.toBe(b);
  });

  it("handles empty input", () => {
    const result = fileHash(new Uint8Array(0));
    expect(typeof result).toBe("bigint");
    expect(result).toBeGreaterThan(0n);
  });

  it("handles large input (multiple chunks)", () => {
    const data = new Uint8Array(1000);
    data.fill(0x42);
    const result = fileHash(data);
    expect(typeof result).toBe("bigint");
  });
});

describe("fileCommitment", () => {
  it("wraps fileHash in Poseidon1", () => {
    const data = encoder.encode("test");
    const fh = fileHash(data);
    const fc = fileCommitment(data);
    // fileCommitment = Poseidon1(fileHash), so it should differ from fileHash
    expect(fc).not.toBe(fh);
    expect(typeof fc).toBe("bigint");
  });
});

describe("sha256Field", () => {
  it("produces deterministic decimal string output", () => {
    const data = encoder.encode("transform-code");
    const a = sha256Field(data);
    const b = sha256Field(data);
    expect(a).toBe(b);
    expect(a).toMatch(/^\d+$/);
  });

  it("produces different output for different input", () => {
    const a = sha256Field(encoder.encode("code-a"));
    const b = sha256Field(encoder.encode("code-b"));
    expect(a).not.toBe(b);
  });
});

describe("computeArgsHash", () => {
  it("produces deterministic hash for same args", () => {
    const a = computeArgsHash({ indent: 2 });
    const b = computeArgsHash({ indent: 2 });
    expect(a).toBe(b);
  });

  it("produces different hash for different args", () => {
    const a = computeArgsHash({ indent: 2 });
    const b = computeArgsHash({ indent: 4 });
    expect(a).not.toBe(b);
  });

  it("handles null args", () => {
    const result = computeArgsHash(null);
    expect(typeof result).toBe("bigint");
  });
});

describe("buildGenesisRecord", () => {
  it("sets prevOutputCommitment = inputCommitment for genesis", async () => {
    const transformFn = (input: Uint8Array): Uint8Array =>
      new TextEncoder().encode(`transformed:${new TextDecoder().decode(input)}`);
    const result = await buildGenesisRecord(
      wasmBytes,
      transformFn,
      encoder.encode("test-transform"),
      encoder.encode("input-data"),
      { foo: "bar" },
    );

    expect(result.record.prevOutputCommitment).toBe(
      result.record.inputCommitment,
    );
    expect(result.record.inputCommitment).not.toBe(
      result.record.outputCommitment,
    );
    expect(result.record.inputByteCount).toBe(10);
    expect(result.record.outputByteCount).toBe(22);
    expect(result.witness.inputFileHash).toBeGreaterThan(0n);
    expect(result.witness.outputFileHash).toBeGreaterThan(0n);
  });

  it("produces consistent commitments with fileCommitment helper", async () => {
    const inputBytes = encoder.encode("test-input");
    const transformFn = (input: Uint8Array): Uint8Array =>
      new TextEncoder().encode(`out:${new TextDecoder().decode(input)}`);
    const result = await buildGenesisRecord(
      wasmBytes,
      transformFn,
      encoder.encode("t"),
      inputBytes,
      {},
    );

    expect(result.record.inputCommitment).toBe(
      fileCommitment(inputBytes).toString(),
    );
  });
});

describe("buildChainedRecord", () => {
  it("sets prevOutputCommitment to the provided previous output", async () => {
    const prevOutputCommitment = "12345678901234567890";
    const transformFn = (input: Uint8Array): Uint8Array =>
      new TextEncoder().encode("output");
    const result = await buildChainedRecord(
      wasmBytes,
      transformFn,
      encoder.encode("t"),
      encoder.encode("input"),
      {},
      prevOutputCommitment,
    );

    expect(result.record.prevOutputCommitment).toBe(prevOutputCommitment);
  });
});

describe("verifyChain", () => {
  const makeRecord = (
    input: string,
    output: string,
    prev: string,
  ): ExecutionRecord => ({
    transformerId: "1",
    runtime: "1",
    inputCommitment: input,
    outputCommitment: output,
    inputByteCount: 10,
    outputByteCount: 20,
    argsHash: "0",
    prevOutputCommitment: prev,
  });

  it("validates a correct genesis record", () => {
    const record = makeRecord("100", "200", "100"); // genesis: prev = input
    expect(verifyChain([record])).toBe(true);
  });

  it("rejects genesis with mismatched prevOutputCommitment", () => {
    const record = makeRecord("100", "200", "999"); // genesis: prev ≠ input
    expect(verifyChain([record])).toBe(false);
  });

  it("validates a correct 3-stage chain", () => {
    const records = [
      makeRecord("100", "200", "100"), // genesis
      makeRecord("200", "300", "200"), // stage 2: prev = stage1.output
      makeRecord("300", "400", "300"), // stage 3: prev = stage2.output
    ];
    expect(verifyChain(records)).toBe(true);
  });

  it("rejects a broken chain (stage 2 prev ≠ stage 1 output)", () => {
    const records = [
      makeRecord("100", "200", "100"), // genesis
      makeRecord("200", "300", "999"), // broken: prev ≠ stage1.output
      makeRecord("300", "400", "300"), // stage 3
    ];
    expect(verifyChain(records)).toBe(false);
  });

  it("rejects an empty chain", () => {
    expect(verifyChain([])).toBe(false);
  });

  it("validates a single-stage genesis chain", () => {
    const record = makeRecord("100", "200", "100");
    expect(verifyChain([record])).toBe(true);
  });

  it("validates a 5-stage chain (infinite depth)", () => {
    const records = [
      makeRecord("100", "200", "100"),
      makeRecord("200", "300", "200"),
      makeRecord("300", "400", "300"),
      makeRecord("400", "500", "400"),
      makeRecord("500", "600", "500"),
    ];
    expect(verifyChain(records)).toBe(true);
  });
});
