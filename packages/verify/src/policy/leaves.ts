import { poseidon1, poseidon2, poseidon7 } from "poseidon-lite";

/** BN254 scalar field (not the base field). Never reduce invalid inputs. */
export const field = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
export const valid = (value: unknown): value is bigint =>
  typeof value === "bigint" && value >= 0n && value < field;

export type Member = Readonly<{ idCommitment: bigint; roleId: bigint }>;
export type Grant = Readonly<{
  roleId: bigint;
  templateId: bigint;
  dbTargetId: bigint;
  actionId: bigint;
  maxAmount: bigint;
  startDay: bigint;
  endDay: bigint;
}>;

/** Invalid fields return null; synchronous calculations never throw. */
export const member = (value: Member): bigint | null =>
  [value.idCommitment, value.roleId].every(valid)
    ? poseidon2([value.idCommitment, value.roleId])
    : null;

export const grant = (value: Grant): bigint | null => {
  const inputs = [
    value.roleId,
    value.templateId,
    value.dbTargetId,
    value.actionId,
    value.maxAmount,
    value.startDay,
    value.endDay,
  ];
  return inputs.every(valid) ? poseidon7(inputs) : null;
};

export const empty: bigint = poseidon1([0n]);
