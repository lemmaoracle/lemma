import { verifier } from "@lemmaoracle/sdk";
import * as R from "ramda";
import type {
  GuardrailConfig,
  GuardrailOptions,
  GuardrailResult,
} from "./types.js";
import { createCircuitResolver } from "./resolver.js";

/** Error shape for a failed guardrail check (`throw: true`). */
export type GuardrailError = Error & Readonly<{ circuitId: string }>;

/** Build a GuardrailError (functional style — no class). */
export const guardrailError = (
  circuitId: string,
  reason: string,
): GuardrailError =>
  Object.assign(new Error(`guardrail: ${reason} (circuit "${circuitId}")`), {
    name: "GuardrailError",
    circuitId,
  });

const defaultResolver = createCircuitResolver();

const fail = (circuitId: string, reason: string): Promise<never> =>
  Promise.reject(guardrailError(circuitId, reason));

/**
 * Decode a wire-format proof (base64 JSON, as `prover.prove` emits) into the
 * object shape `groth16.verify` expects. Non-string proofs (already decoded)
 * pass through. Invalid base64/JSON falls back to the raw value so the
 * verifier rejects it as an ordinary proof failure.
 */
const decodeProof = (proof: unknown): unknown =>
  typeof proof === "string"
    ? R.tryCatch(
        (p: string): unknown => JSON.parse(atob(p)),
        (_e: unknown): unknown => proof,
      )(proof)
    : proof;

/**
 * Verify a ZK proof against the circuit named by `circuitId`.
 *
 * Circuit-agnostic: the guardrail never interprets `publicSignals`. It
 * resolves `circuitId → { alg, vkey }` (via {@link GuardrailConfig.resolveCircuit}),
 * delegates to the verification backend, and returns a result (or rejects when
 * `throw: true`).
 */
export const guardrail = (
  options: GuardrailOptions,
  config: GuardrailConfig = {},
): Promise<GuardrailResult> =>
  (config.resolveCircuit ?? defaultResolver)(options.circuitId)
    .then(({ alg, vkey }) =>
      (config.verify ?? verifier.verify)({
        alg,
        inputs: {
          vkey,
          proof: decodeProof(options.proof),
          publicSignals: [...options.publicSignals],
        },
      }).catch((_e: unknown) => ({ ok: false } as const)),
    )
    .then(({ ok }) =>
      ok
        ? ({ ok: true } as const)
        : config.throw
          ? fail(
              options.circuitId,
              `proof invalid for circuit "${options.circuitId}"`,
            )
          : ({
              ok: false,
              reason: `proof invalid for circuit "${options.circuitId}"`,
            } as const),
    );
