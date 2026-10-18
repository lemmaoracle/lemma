import { describe, expect, expectTypeOf, it } from "vitest";
import * as root from "../index.js";
import * as policy from "./index.js";
import { empty, grant, holds, member, tree } from "./index.js";
import type { Grant, Member, Path, Policy, Tree } from "./index.js";

type Outcome<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; reason: string }>;
type Absent<T, K extends PropertyKey> = Extract<K, keyof T> extends never ? true : false;

// These imports must fail at compile time, including the type-only boundaries.
// @ts-expect-error Policy is available only from the policy subpath.
import type { Policy as RootPolicy } from "../index.js";
// @ts-expect-error No generic Result is public.
import type { Result } from "./index.js";
// @ts-expect-error The decoder is available only from the policy subpath.
import type { decode as RootDecode } from "../index.js";

describe("policy public boundary", () => {
  it("exports exactly the approved runtime names", () => {
    expect(Object.keys(policy).sort()).toEqual(["decode", "empty", "grant", "holds", "member", "tree"]);
    expectTypeOf<Absent<typeof policy, "field" | "valid" | "witness" | "signals" | "adapter">>().toEqualTypeOf<true>();
  });

  it("exposes the approved function and readonly snapshot types", () => {
    expectTypeOf(member).toEqualTypeOf<(value: Member) => bigint | null>();
    expectTypeOf(grant).toEqualTypeOf<(value: Grant) => bigint | null>();
    expectTypeOf(tree).toEqualTypeOf<(leaves: ReadonlyArray<bigint>) => Outcome<Tree>>();
    expectTypeOf(holds).toEqualTypeOf<(leaf: bigint, path: Path, root: bigint) => boolean>();
    expectTypeOf(empty).toEqualTypeOf<bigint>();
    expectTypeOf<Tree>().toEqualTypeOf<Readonly<{ root: bigint; path: (index: number) => Outcome<Path> }>>();
    expectTypeOf<Path>().toEqualTypeOf<Readonly<{ siblings: ReadonlyArray<bigint>; directions: ReadonlyArray<0 | 1> }>>();
    const snapshot: Policy = {
      version: 1, scheme: "member-grant-v1", scope: "test", epoch: 1n,
      publishedAt: "2026-10-17T00:00:00.000Z",
      member: { root: empty, leafCount: 0, revokedCount: 0 },
      grant: { root: empty, leafCount: 0, revokedCount: 0 },
    };
    expectTypeOf(snapshot.epoch).toEqualTypeOf<bigint>();
    expect(snapshot.member.root).toBe(empty);
  });

  it("supports inclusion and null rejection through the public boundary", () => {
    const leaf = member({ idCommitment: 1n, roleId: 2n });
    const permission = grant({ roleId: 2n, templateId: 3n, dbTargetId: 4n, actionId: 5n, maxAmount: 6n, startDay: 7n, endDay: 8n });
    expect(permission).toBeTypeOf("bigint");
    expect(member({ idCommitment: -1n, roleId: 2n })).toBeNull();
    expect(grant({ roleId: -1n, templateId: 3n, dbTargetId: 4n, actionId: 5n, maxAmount: 6n, startDay: 7n, endDay: 8n })).toBeNull();
    if (leaf === null) throw new Error("Expected valid member");
    const result = tree([leaf]);
    if (!result.ok) throw new Error(result.reason);
    const path = result.value.path(0);
    if (!path.ok) throw new Error(path.reason);
    expect(holds(leaf, path.value, result.value.root)).toBe(true);
  });

  it("keeps policy names out of the root exports", () => {
    expectTypeOf<Absent<typeof root, "member" | "grant" | "tree" | "holds" | "empty" | "decode" | "Policy">>().toEqualTypeOf<true>();
    for (const name of ["member", "grant", "tree", "holds", "empty", "decode", "Policy"]) {
      expect(root).not.toHaveProperty(name);
    }
  });
});
