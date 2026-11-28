import { describe, expect, it } from "vitest";
import type { ExecutionRecord, TransformWitness } from "./schema.js";
import { toPrivateInputs, toPublicSignals, toWitnessInput } from "./schema.js";

const record: ExecutionRecord = {
  transformerId: "11",
  runtime: "22",
  inputCommitment: "33",
  outputCommitment: "44",
  inputByteCount: 10,
  outputByteCount: 20,
  argsHash: "55",
  prevOutputCommitment: "66",
};

const witness: TransformWitness = {
  inputFileHash: 111n,
  outputFileHash: 222n,
};

describe("schema circuit input-ordering contract", () => {
  it("toPublicSignals returns the 8 public signals in circuit declaration order", () => {
    expect(toPublicSignals(record)).toEqual(["11", "22", "33", "44", "10", "20", "55", "66"]);
  });

  it("toPrivateInputs returns exactly the 2 private inputs as decimal strings", () => {
    expect(toPrivateInputs(witness)).toEqual({ inputFileHash: "111", outputFileHash: "222" });
    expect(Object.keys(toPrivateInputs(witness)).sort()).toEqual(["inputFileHash", "outputFileHash"]);
  });

  it("toWitnessInput returns exactly the 10 witness keys with correct values", () => {
    const input = toWitnessInput({ record, witness });
    expect(input).toEqual({
      inputFileHash: "111",
      outputFileHash: "222",
      transformerId: "11",
      runtime: "22",
      inputCommitment: "33",
      outputCommitment: "44",
      inputByteCount: "10",
      outputByteCount: "20",
      argsHash: "55",
      prevOutputCommitment: "66",
    });
    expect(Object.keys(input).length).toBe(10);
  });

  it("toWitnessInput contains every public signal verbatim", () => {
    const values = Object.values(toWitnessInput({ record, witness }));
    expect(values).toEqual(expect.arrayContaining(toPublicSignals(record)));
  });

  it("zero byte counts stringify to \"0\" in public signals and witness input", () => {
    const zero: ExecutionRecord = { ...record, inputByteCount: 0, outputByteCount: 0 };
    expect(toPublicSignals(zero)).toEqual(["11", "22", "33", "44", "0", "0", "55", "66"]);
    const input = toWitnessInput({ record: zero, witness });
    expect(input.inputByteCount).toBe("0");
    expect(input.outputByteCount).toBe("0");
  });
});
