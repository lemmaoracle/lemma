import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { poseidon2 } from "poseidon-lite";
import { empty, field, member, grant } from "./leaves.js";
import { holds, tree, type Path } from "./merkle.js";

const fixture = JSON.parse(
  readFileSync(new URL("../../../../fixtures/policy-sharing/v1.json", import.meta.url), "utf8"),
);
const value = <T>(
  result: Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; reason: string }>,
): T => {
  if (!result.ok) throw new Error(result.reason);
  return result.value;
};
const path = (v: any): Path => ({ siblings: v.siblings.map(BigInt), directions: v.directions });

describe.each(["member", "grant"])("%s shared tree vectors", (axis) => {
  it.each(["empty", "single", "odd", "revoked"])(
    "matches %s root and every allocated path",
    (state) => {
      const vector = fixture.trees[axis][state];
      const leaves = vector.leaves.map(BigInt);
      const built = value(tree(leaves));
      expect(built.root.toString()).toBe(vector.root);
      for (const p of vector.paths) {
        const actual = value(built.path(p.index));
        expect(actual).toEqual(path(p));
        expect(holds(leaves[p.index], actual, built.root)).toBe(true);
        const computed = actual.siblings.reduce(
          (node, sibling, i) =>
            poseidon2(actual.directions[i] === 0 ? [node, sibling] : [sibling, node]),
          leaves[p.index],
        );
        expect(computed).toBe(built.root);
        expect(actual.directions.reduce((position, bit, i) => position + bit * 2 ** i, 0)).toBe(
          p.index,
        );
      }
      expect(built.path(leaves.length).ok).toBe(false);
    },
  );
  it("keeps index 2 through append and revocation and invalidates stale siblings", () => {
    const odd = fixture.trees[axis].odd;
    const revoked = fixture.trees[axis].revoked;
    const before = value(tree(odd.leaves.map(BigInt)));
    const after = value(tree(revoked.leaves.map(BigInt)));
    const previous = value(tree(odd.leaves.slice(0, 2).map(BigInt)));
    expect(value(previous.path(1)).directions).toEqual(value(before.path(1)).directions);
    expect(value(after.path(2)).directions).toEqual(value(before.path(2)).directions);
    expect(after.root).not.toBe(before.root);
    expect(revoked.leaves[1]).toBe(empty.toString());
    expect(holds(BigInt(odd.leaves[1]), value(after.path(1)), after.root)).toBe(false);
    expect(holds(empty, value(after.path(1)), after.root)).toBe(true);
    expect(holds(BigInt(odd.leaves[2]), value(before.path(2)), after.root)).toBe(false);
  });
});

describe("inclusion rejection", () => {
  const vector = fixture.trees.member.odd;
  const leaf = BigInt(vector.leaves[2]);
  const root = BigInt(vector.root);
  const p = path(vector.paths[2]);
  it.each([-1n, field, field + 1n])("rejects invalid field %s in leaf, root or siblings", (bad) => {
    expect(holds(bad, p, root)).toBe(false);
    expect(holds(leaf, p, bad)).toBe(false);
    expect(holds(leaf, { ...p, siblings: [bad, ...p.siblings.slice(1)] }, root)).toBe(false);
    expect(tree([bad]).ok).toBe(false);
  });
  it.each([0, 19, 21])("rejects path length %s", (length) => {
    expect(holds(leaf, { ...p, siblings: Array(length).fill(0n) }, root)).toBe(false);
    expect(holds(leaf, { ...p, directions: Array(length).fill(0) }, root)).toBe(false);
  });
  it.each([2, -1, 0.5, NaN, "0", 1n, undefined])("rejects non-bit %s", (direction) => {
    expect(
      holds(leaf, { ...p, directions: [direction, ...p.directions.slice(1)] } as Path, root),
    ).toBe(false);
  });
  it("rejects a different root and invalid positions", () => {
    expect(holds(leaf, p, 0n)).toBe(false);
    const built = value(tree(vector.leaves.map(BigInt)));
    for (const index of [-1, 0.5, NaN, Infinity, 3, 2 ** 20])
      expect(built.path(index).ok).toBe(false);
    expect(tree(Array(2 ** 20 + 1).fill(empty)).ok).toBe(false);
  });
  it("copies caller leaves and isolates returned paths", () => {
    const leaves = vector.leaves.map(BigInt);
    const built = value(tree(leaves));
    leaves[0] = empty;
    const old = value(built.path(2));
    (old.siblings as bigint[])[0] = 0n;
    expect(value(built.path(2))).toEqual(p);
    expect(holds(leaf, value(built.path(2)), built.root)).toBe(true);
  });
  it("rejects role confusion across axes", () => {
    const m = fixture.member[2].input;
    const g = fixture.grant[2].input;
    const mixedMember = member({
      idCommitment: BigInt(m.idCommitment),
      roleId: BigInt(fixture.grant[0].input.roleId),
    })!;
    const mixedGrant = grant(
      Object.fromEntries(
        Object.entries(g).map(([key, val]) => [key, BigInt(val as string)]),
      ) as Parameters<typeof grant>[0],
    )!;
    expect(holds(mixedMember, p, root)).toBe(false);
    const gp = path(fixture.trees.grant.odd.paths[2]);
    const groot = BigInt(fixture.trees.grant.odd.root);
    expect(holds(mixedGrant, gp, groot)).toBe(true);
    expect(
      holds(
        grant({
          ...Object.fromEntries(Object.entries(g).map(([k, v]) => [k, BigInt(v as string)])),
          roleId: BigInt(fixture.member[0].input.roleId),
        } as Parameters<typeof grant>[0])!,
        gp,
        groot,
      ),
    ).toBe(false);
  });
  it.each(
    fixture.cases.filter((c: any) =>
      ["valid", "omittedPosition", "nonBitDirection"].includes(c.name),
    ),
  )("consumes path case $name", (c) => {
    const witness = { ...fixture.witness, ...c.patch };
    expect(
      holds(
        leaf,
        {
          siblings: witness.subjectPathElements.map(BigInt),
          directions: witness.subjectPathIndices,
        },
        root,
      ),
    ).toBe(c.expected);
  });
});

it("rejects sparse sibling and direction arrays", () => {
  const v = fixture.trees.member.odd;
  const p = path(v.paths[2]);
  const directions = [...p.directions];
  const siblings = [...p.siblings];
  delete directions[0];
  delete siblings[0];
  expect(holds(BigInt(v.leaves[2]), { ...p, directions }, BigInt(v.root))).toBe(false);
  expect(holds(BigInt(v.leaves[2]), { ...p, siblings }, BigInt(v.root))).toBe(false);
});
