import type { VerifyInput, VerifyOutput } from "@lemmaoracle/sdk";
import type { ProofAlgId } from "@lemmaoracle/spec";

/**
 * A circuit resolved to what verification needs: the proof algorithm and the
 * algorithm-specific verification key (groth16 JSON vkey, whir params, …).
 */
export type ResolvedCircuit = Readonly<{
  alg: ProofAlgId;
  vkey: unknown;
}>;

/** Resolves a `circuitId` to its algorithm + verification key. */
export type CircuitResolver = (circuitId: string) => Promise<ResolvedCircuit>;

/** A verification backend, matching `@lemmaoracle/sdk` `verifier.verify`. */
export type Verifier = (input: VerifyInput) => Promise<VerifyOutput>;

/** What a caller supplies: everything `verifier.verify` needs, minus alg/vkey. */
export type GuardrailOptions = Readonly<{
  circuitId: string;
  proof: unknown;
  publicSignals: ReadonlyArray<string>;
}>;

export type GuardrailConfig = Readonly<{
  /** `true` → reject with {@link GuardrailError} on failure; default returns `{ ok: false }`. */
  throw?: boolean;
  /** Injectable circuit→vkey resolver. Default fetches from the Lemma oracle + IPFS. */
  resolveCircuit?: CircuitResolver;
  /** Injectable verification backend. Default is `@lemmaoracle/sdk` `verifier.verify`. */
  verify?: Verifier;
}>;

export type GuardrailResult =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; reason: string }>;
