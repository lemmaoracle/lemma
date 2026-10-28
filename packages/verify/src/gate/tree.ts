import { poseidon3 } from "poseidon-lite";
import { domains, emptySlot, grantDepth, memberDepth, validField } from "./scheme.js";

/**
 * Domain-separated fixed-depth Merkle trees for the agent gate (INTERNAL).
 *
 * One shared builder instantiated per axis (member / grant). Node hash is
 * Poseidon(DOM_NODE, left, right); the empty chain starts at the slot value 0.
 * Revocation sets a slot leaf to 0: the slot stays allocated (positions never
 * shift) and the CIRCUIT rejects proving with it. `holds` is pure inclusion —
 * a true result for a 0 leaf does NOT mean the leaf is provable.
 */

type Result<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; reason: string }>;

export type Path = Readonly<{
  siblings: ReadonlyArray<bigint>;
  directions: ReadonlyArray<0 | 1>;
}>;

// Malformed runtime paths fail inclusion before any array operation.
const pathArraysOk = (value: unknown): value is Path =>
  value !== null &&
  typeof value === "object" &&
  "siblings" in value &&
  "directions" in value &&
  Array.isArray(value.siblings) &&
  Array.isArray(value.directions);

export type Tree = Readonly<{
  root: bigint;
  path: (index: number) => Result<Path>;
}>;

const parent = (left: bigint, right: bigint): bigint =>
  poseidon3([domains.node, left, right]);

/** Empty chain E0 = 0, E_{i+1} = H(E_i, E_i); entries 0..depth. */
const emptyChain = (depth: number): ReadonlyArray<bigint> =>
  Array.from({ length: depth }).reduce<ReadonlyArray<bigint>>(
    (values) => [...values, parent(values[values.length - 1] ?? emptySlot, values[values.length - 1] ?? emptySlot)],
    [emptySlot],
  );

const atDepth = (depth: number): Readonly<{ tree: (leaves: ReadonlyArray<bigint>) => Result<Tree>; holds: (leaf: bigint, path: Path, root: bigint) => boolean }> => {
  const zeros = emptyChain(depth);
  const at = (values: ReadonlyArray<bigint>, index: number, level: number): bigint =>
    values[index] ?? zeros[level] ?? emptySlot;

  const tree = (leaves: ReadonlyArray<bigint>): Result<Tree> => {
    const input = [...leaves];
    const levels = (base: ReadonlyArray<bigint>): ReadonlyArray<ReadonlyArray<bigint>> =>
      Array.from({ length: depth }).reduce<ReadonlyArray<ReadonlyArray<bigint>>>(
        (rows, _, level) => {
          const row = rows[level] ?? [];
          return [
            ...rows,
            Array.from({ length: Math.ceil(row.length / 2) }, (_, index) =>
              parent(at(row, index * 2, level), at(row, index * 2 + 1, level)),
            ),
          ];
        },
        [base],
      );
    const build = (base: ReadonlyArray<bigint>): Tree => {
      const rows = levels(base);
      return {
        root: rows[depth]?.[0] ?? zeros[depth] ?? emptySlot,
        path: (index) =>
          Number.isInteger(index) && index >= 0 && index < input.length
            ? {
                ok: true,
                value: {
                  siblings: Array.from(
                    { length: depth },
                    (_, level) =>
                      (rows[level] ?? [])[Math.floor(index / 2 ** level) ^ 1] ??
                      zeros[level] ??
                      emptySlot,
                  ),
                  directions: Array.from({ length: depth }, (_, level) =>
                    Math.floor(index / 2 ** level) % 2 === 0 ? 0 : 1,
                  ),
                },
              }
            : { ok: false, reason: "Position is not allocated" },
      };
    };
    return input.length <= 2 ** depth && input.every(validField)
      ? { ok: true, value: build(input) }
      : { ok: false, reason: "Invalid leaves or capacity exceeded" };
  };

  /** Inclusion only: no non-emptiness, epoch, or authorization checks. */
  const holds = (leaf: bigint, path: Path, root: bigint): boolean =>
    validField(leaf) &&
    validField(root) &&
    pathArraysOk(path) &&
    path.siblings.length === depth &&
    path.directions.length === depth &&
    Array.from(path.siblings).every(validField) &&
    Array.from(path.directions).every((direction: unknown) => direction === 0 || direction === 1) &&
    path.siblings.reduce(
      (node, sibling, level) =>
        path.directions[level] === 0 ? parent(node, sibling) : parent(sibling, node),
      leaf,
    ) === root;

  return { tree, holds };
};

const member = atDepth(memberDepth);
const grant = atDepth(grantDepth);

/** Build a member tree over fixed depth 20. Zero leaves (revoked slots) allowed. */
export const memberTree = member.tree;

/** Build a grant tree over fixed depth 20. Zero leaves (revoked slots) allowed. */
export const grantTree = grant.tree;

/** Member-axis inclusion check. See module note on 0 leaves. */
export const memberHolds = member.holds;

/** Grant-axis inclusion check. See module note on 0 leaves. */
export const grantHolds = grant.holds;
