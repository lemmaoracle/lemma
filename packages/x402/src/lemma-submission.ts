/**
 * Lemma submission orchestration -- internal handler invoked by the
 * augmented x402ResourceServer onAfterSettle hook.
 *
 * Composes the Lemma proof flow:
 *   documents.register (via @lemmaoracle/sdk/documents -- pure HTTP, Workers-safe)
 *   -> prover.prove (via Relay -- requires Node.js for snarkjs/ffjavascript)
 *   -> proofs.submit (via @lemmaoracle/sdk/proofs -- pure HTTP, Workers-safe)
 *
 * Not exported from root. Exported from ./advanced for customisation.
 */

import { register } from "@lemmaoracle/sdk/documents";
import { submit } from "@lemmaoracle/sdk/proofs";
import { create as createLemmaClient } from "@lemmaoracle/sdk/client";
import type { LemmaClient } from "@lemmaoracle/sdk";
import type { LemmaConfig } from "./lemma-config.js";

/** Context passed to the submission handler from onAfterSettle. */
type SubmissionContext = Readonly<{
  /** Doc hash (e.g. content SHA-256) */
  docHash: string;
  /** Schema identifier */
  schema: string;
  /** Issuer identifier */
  issuerId: string;
  /** Content CID (IPFS or other storage identifier) */
  cid?: string;
  /** Attributes to register with the document */
  attributes?: Readonly<Record<string, unknown>>;
  /** Witness data for ZK proof generation */
  witness?: Readonly<Record<string, unknown>>;
  /** Additional metadata from the settlement */
  metadata?: Readonly<Record<string, unknown>>;
}>;

/** Call the Relay /prover/prove endpoint. */
const proveViaRelay = (
  relayUrl: string,
  apiBase: string,
  apiKey: string | undefined,
  circuitId: string,
  witness: Readonly<Record<string, unknown>>,
): Promise<{ proof: string; inputs: ReadonlyArray<string> }> => {
  const url = `${relayUrl.replace(/\/$/, "")}/prover/prove`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiBase,
      apiKey,
      input: { circuitId, witness },
    }),
  }).then(async (res) => {
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Relay /prover/prove failed: ${String(res.status)} ${errBody}`);
    }
    const json = (await res.json()) as { proof: string; inputs: ReadonlyArray<string> };
    return json;
  });
};

/**
 * Create a Lemma submission handler.
 *
 * Uses @lemmaoracle/sdk/documents and @lemmaoracle/sdk/proofs sub-path imports
 * to avoid pulling snarkjs/ffjavascript into the Workers bundle.
 * prover.prove is delegated to the Relay (Node.js server).
 */
const createLemmaSubmissionHandler = (
  config: LemmaConfig,
  lemmaClientOverride?: LemmaClient,
): ((ctx: SubmissionContext) => Promise<{ proof: string; inputs: ReadonlyArray<string> }>) => {
  const client: LemmaClient =
    lemmaClientOverride ??
    createLemmaClient({
      apiBase: config.apiBase,
      apiKey: config.apiKey,
    });

  const relayUrl = config.relayUrl ?? "https://p01--lemma-relay-api--svxwx5jzx.code.run/";

  return async (ctx: SubmissionContext): Promise<{ proof: string; inputs: ReadonlyArray<string> }> => {
    // Step 1: Register document (pure HTTP — Workers-safe via sub-path import)
    const _docResult = await register(client, {
      schema: ctx.schema,
      docHash: ctx.docHash,
      cid: ctx.cid ?? ctx.docHash,
      issuerId: ctx.issuerId ?? "lemma-x402",
      subjectId: (ctx.metadata?.payer as string) ?? "anonymous",
      attributes: ctx.attributes ?? {},
      commitments: {
        scheme: "poseidon",
        root: ctx.docHash,
        leaves: [],
        randomness: ctx.docHash,
      },
      revocation: {
        root: ctx.docHash,
      },
    });

    // Step 2: Generate ZK proof via Relay
    const proofOutput = await proveViaRelay(
      relayUrl,
      config.apiBase,
      config.apiKey,
      config.circuitId,
      ctx.witness ?? { docHash: ctx.docHash },
    );

    // Step 3: Submit proof (pure HTTP — Workers-safe via sub-path import)
    const _submitResult = await submit(client, {
      docHash: ctx.docHash,
      circuitId: config.circuitId,
      proof: proofOutput.proof,
      inputs: proofOutput.inputs,
    });

    return proofOutput;
  };
};

export type { SubmissionContext };
export { createLemmaSubmissionHandler };
