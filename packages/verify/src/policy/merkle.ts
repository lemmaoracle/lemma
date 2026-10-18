import { poseidon2 } from "poseidon-lite";
import { empty, valid } from "./leaves.js";

type Result<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; reason: string }>;
export type Path = Readonly<{
  siblings: ReadonlyArray<bigint>;
  directions: ReadonlyArray<0 | 1>;
}>;
export type Tree = Readonly<{
  root: bigint;
  path: (index: number) => Result<Path>;
}>;

const depth = 20;
const zeros = Array.from({ length: depth }).reduce<ReadonlyArray<bigint>>(
  (values) => [
    ...values,
    poseidon2([values[values.length - 1] ?? empty, values[values.length - 1] ?? empty]),
  ],
  [empty],
);

/** Only allocated nodes are stored; absent siblings use the level's empty root. */
export const tree = (leaves: ReadonlyArray<bigint>): Result<Tree> => {
  const input = [...leaves];
  const levels = (leaves: ReadonlyArray<bigint>): ReadonlyArray<ReadonlyArray<bigint>> =>
    Array.from({ length: depth }).reduce<ReadonlyArray<ReadonlyArray<bigint>>>(
      (rows, _, level) => {
        const row = rows[level] ?? [];
        return [
          ...rows,
          Array.from({ length: Math.ceil(row.length / 2) }, (_, index) =>
            poseidon2([
              row[index * 2] ?? zeros[level] ?? empty,
              row[index * 2 + 1] ?? zeros[level] ?? empty,
            ]),
          ),
        ];
      },
      [leaves],
    );
  const build = (leaves: ReadonlyArray<bigint>): Tree => {
    const rows = levels(leaves);
    return {
      root: rows[depth]?.[0] ?? zeros[depth] ?? empty,
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
                    empty,
                ),
                directions: Array.from({ length: depth }, (_, level) =>
                  Math.floor(index / 2 ** level) % 2 === 0 ? 0 : 1,
                ),
              },
            }
          : { ok: false, reason: "Position is not allocated" },
    };
  };
  return input.length <= 2 ** depth && input.every(valid)
    ? { ok: true, value: build(input) }
    : { ok: false, reason: "Invalid leaves or capacity exceeded" };
};

/** Inclusion only: no authorization, epoch or scope checks. */
export const holds = (leaf: bigint, path: Path, root: bigint): boolean =>
  valid(leaf) &&
  valid(root) &&
  path.siblings.length === depth &&
  path.directions.length === depth &&
  Array.from(path.siblings).every(valid) &&
  Array.from(path.directions).every((direction: unknown) => direction === 0 || direction === 1) &&
  path.siblings.reduce(
    (node, sibling, level) =>
      poseidon2(path.directions[level] === 0 ? [node, sibling] : [sibling, node]),
    leaf,
  ) === root;
