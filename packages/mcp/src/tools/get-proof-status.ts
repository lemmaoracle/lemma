import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as proofs from "@lemmaoracle/sdk/proofs";
import type { LemmaClient } from "@lemmaoracle/spec";
import { runTool } from "../errors.js";

export type GetProofStatusInput = Readonly<{ verificationId: string }>;

export type ProofStatusResult = Readonly<{
  verificationId: string;
  status?: string;
  circuitId?: string;
  docHash?: string;
  registeredAt?: string;
}>;

/**
 * Get the verification status of a proof by its verificationId.
 *
 * Calls `GET /v1/proofs/{verificationId}` (the proof-centric lookup). The
 * unauthenticated public response is redacted (no `proof`/`inputs`), which is
 * sufficient for a status check. Returns `undefined` when the verificationId
 * is unknown.
 */
export const getProofStatus = async (
  client: LemmaClient,
  input: GetProofStatusInput,
): Promise<ProofStatusResult | undefined> => {
  try {
    const record = await proofs.getById(client, input.verificationId);
    return {
      verificationId: record.verificationId,
      status: record.status,
      circuitId: record.circuitId,
      docHash: record.docHash,
      registeredAt: record.registeredAt,
    };
  } catch {
    return undefined;
  }
};

export const getProofStatusTool = (server: McpServer, client: LemmaClient): RegisteredTool =>
  server.registerTool(
    "lemma_get_proof_status",
    {
      description:
        "Get the verification status of a proof by its verificationId. " +
        "Calls GET /v1/proofs/{verificationId}, the primary proof lookup. " +
        "Returns { verificationId, status, circuitId, docHash, registeredAt }, or undefined if the verificationId is unknown. " +
        "Status enum: received | verified | onchain-verified | rejected. " +
        "Use the SDK's isVerified() helper (or check status === 'verified' || status === 'onchain-verified') to determine cryptographic validity.",
      inputSchema: {
        verificationId: z
          .string()
          .describe("verificationId returned by lemma_submit_proof."),
      },
      outputSchema: {
        verificationId: z
          .string()
          .describe("Primary lookup key for this proof."),
        status: z
          .string()
          .optional()
          .describe(
            "Verification status enum: 'received' | 'verified' | 'onchain-verified' | 'rejected'. Use the SDK's isVerified() helper (or check status === 'verified' || status === 'onchain-verified') for cryptographic validity.",
          ),
        circuitId: z
          .string()
          .optional()
          .describe("Circuit ID this proof was generated against."),
        docHash: z
          .string()
          .optional()
          .describe("Document hash this proof attests to, when one was supplied."),
        registeredAt: z
          .string()
          .optional()
          .describe("ISO-8601 timestamp when the proof was registered."),
      },
      annotations: {
        title: "Lemma — get proof status",
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
        destructiveHint: false,
      },
    },
    (input) => runTool(getProofStatus(client, input)),
  );
