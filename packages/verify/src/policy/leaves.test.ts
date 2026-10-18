import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { poseidon1, poseidon2, poseidon7 } from "poseidon-lite";
import { empty, field, member, grant } from "./leaves.js";

const fixture = JSON.parse(
  readFileSync(new URL("../../../../fixtures/policy-sharing/v1.json", import.meta.url), "utf8"),
);
const fields = (input: Record<string, string>) =>
  Object.fromEntries(Object.entries(input).map(([k, v]) => [k, BigInt(v)]));

describe("shared leaf vectors", () => {
  it("pins scalar field, depth, empty and hash arities", () => {
    expect(field.toString()).toBe(fixture.constants.field);
    expect(fixture.constants.depth).toBe(20);
    expect(empty.toString()).toBe(fixture.constants.empty);
    expect(empty).toBe(poseidon1([0n]));
    expect(fixture.constants.arities).toMatchObject({ empty: 1, member: 2, grant: 7, parent: 2 });
  });
  it.each(fixture.member)("hashes member in canonical order", (vector) => {
    const input = fields(vector.input) as Parameters<typeof member>[0];
    expect(member(input)?.toString()).toBe(vector.hash);
    expect(member(input)).toBe(poseidon2([input.idCommitment, input.roleId]));
    expect(member({ idCommitment: input.roleId, roleId: input.idCommitment })).not.toBe(
      member(input),
    );
    expect(poseidon2([BigInt(vector.subjectSecret), BigInt(vector.subjectId)])).toBe(
      input.idCommitment,
    );
  });
  it.each(fixture.grant)("hashes grant in ABI order", (vector) => {
    const input = fields(vector.input) as Parameters<typeof grant>[0];
    expect(grant(input)?.toString()).toBe(vector.hash);
    expect(grant(input)).toBe(
      poseidon7(
        fixture.constants.grantOrder.map((key: string) => input[key as keyof typeof input]),
      ),
    );
    expect(grant({ ...input, roleId: input.templateId, templateId: input.roleId })).not.toBe(
      grant(input),
    );
  });
  it.each([-1n, field, field + 1n, 1 as unknown as bigint])(
    "rejects invalid field %s at every leaf input",
    (bad) => {
      const m = fields(fixture.member[0].input) as Parameters<typeof member>[0];
      const g = fields(fixture.grant[0].input) as Parameters<typeof grant>[0];
      for (const key of Object.keys(m)) expect(member({ ...m, [key]: bad })).toBeNull();
      for (const key of Object.keys(g)) expect(grant({ ...g, [key]: bad })).toBeNull();
    },
  );
  it("accepts field boundaries without modular reduction", () => {
    expect(member({ idCommitment: 0n, roleId: field - 1n })).toBeTypeOf("bigint");
  });
});

// Fixture consistency checks only; these do not implement authorization adapters.
describe("experimental ABI fixture metadata", () => {
  it("pins the thirteen names and matching public values", async () => {
    const { poseidon4 } = await import("poseidon-lite");
    const names = [
      "nullifier",
      "requestTag",
      "subjectRoot",
      "permRoot",
      "epoch",
      "today",
      "maxAmount",
      "actionId",
      "dbTargetId",
      "requestDigestLo",
      "requestDigestHi",
      "challenge",
      "idCommitment",
    ];
    expect(fixture.publicSignals.names).toEqual(names);
    const w = fixture.witness;
    expect(fixture.publicSignals.values).toEqual([
      poseidon2([BigInt(w.subjectSecret), BigInt(w.epoch)]).toString(),
      poseidon4([
        BigInt(w.subjectSecret),
        BigInt(w.requestDigestLo),
        BigInt(w.requestDigestHi),
        BigInt(w.challenge),
      ]).toString(),
      ...names.slice(2).map((name) => w[name]),
    ]);
    expect(w.subjectRoot).toBe(fixture.trees.member.odd.root);
    expect(w.permRoot).toBe(fixture.trees.grant.odd.root);
    expect(fixture.warning).toContain("TEST ONLY");
    expect(fixture.circuitStatus).toContain("NOT CONNECTED");
    expect(fixture.artifacts).toMatchObject({ circuit: null, wasm: null, zkey: null, vkey: null });
  });
  it.each(
    fixture.cases.filter((c: any) =>
      ["valid", "notStarted", "expired", "amountExceeded", "amountOverflow"].includes(c.name),
    ),
  )("keeps $name range expectation consistent with witness values", (c) => {
    const w = { ...fixture.witness, ...c.patch };
    const day = BigInt(w.today),
      start = BigInt(w.startDay),
      end = BigInt(w.endDay);
    const amount = BigInt(w.amount),
      max = BigInt(w.maxAmount);
    const inRange =
      day >= start &&
      day <= end &&
      day < 2n ** 32n &&
      amount >= 0n &&
      amount <= max &&
      amount < 2n ** 64n;
    expect(inRange).toBe(c.expected);
  });
});
