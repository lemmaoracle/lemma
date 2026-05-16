/**
 * ZK proof verification.
 *
 * Verifies a proof against a circuit verification key, abstracted over
 * proof algorithms so that groth16, PLONK, and future schemes share the
 * same `verifier.verify({ alg, inputs })` interface.
 *
 * Requires `snarkjs` (dynamic import) for `groth16.verify`.
 */

import type { ProofAlgId } from "@lemmaoracle/spec";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Algorithm-specific inputs — the shape depends on {@link ProofAlgId}. */
export type VerifyInput = Readonly<{
  alg: ProofAlgId;
  inputs: Readonly<Record<string, unknown>>;
}>;

export type VerifyOutput = Readonly<{
  ok: boolean;
}>;

/* ------------------------------------------------------------------ */
/*  Per-algorithm dispatchers                                           */
/* ------------------------------------------------------------------ */

type Groth16Inputs = Readonly<{
  vkey: Readonly<Record<string, unknown>>;
  proof: unknown;
  publicSignals: ReadonlyArray<string>;
}>;

const isGroth16Inputs = (i: Record<string, unknown>): i is Groth16Inputs =>
  typeof i["vkey"] === "object" &&
  i["vkey"] !== null &&
  i["proof"] !== undefined &&
  Array.isArray(i["publicSignals"]);

type Groth16Verifier = (
  vkey: Readonly<Record<string, unknown>>,
  publicSignals: readonly string[],
  proof: unknown,
) => Promise<boolean>;

const verifyGroth16 = (i: Groth16Inputs): Promise<boolean> =>
  import("snarkjs").then(
    (mod: unknown) =>
      (mod as { readonly groth16: { readonly verify: Groth16Verifier } })
        .groth16.verify(i.vkey, [...i.publicSignals], i.proof),
  );

/* ------------------------------------------------------------------ */
/*  verify                                                             */
/* ------------------------------------------------------------------ */

export const verify = (input: VerifyInput): Promise<VerifyOutput> =>
  input.alg === "groth16-bn254-snarkjs" && isGroth16Inputs(input.inputs)
    ? verifyGroth16(input.inputs).then((ok) => ({ ok }))
    : Promise.resolve({ ok: false });
