import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { attributes } from "@lemmaoracle/sdk";
import type { LemmaClient } from "@lemmaoracle/sdk";
import { runTool } from "../errors.js";

export type GetProofStatusInput = Readonly<{ verificationId: string }>;

export type ProofStatusResult = Readonly<{
  status?: string;
  circuitId?: string;
  chainId?: number;
  docHash?: string;
}>;

/**
 * Get the verification status of a proof by its verificationId.
 *
 * The SDK `proofs` namespace only exposes `submit`; there is no dedicated status endpoint.
 * Fallback: query `attributes.query` filtered by docHash and extract `proof.status`.
 * Since the verificationId is returned by proofs.submit, we treat it as a docHash filter.
 */
export const getProofStatus = async (
  client: LemmaClient,
  input: GetProofStatusInput,
): Promise<ProofStatusResult | undefined> => {
  const response = await attributes.query(client, {
    attributes: [],
    docHash: input.verificationId,
  });

  const first = response.results[0];

  return first
    ? {
        status: first.proof?.status,
        circuitId: first.proof?.circuitId,
        chainId: first.proof?.chainId ?? first.chainId,
        docHash: first.docHash,
      }
    : undefined;
};

export const getProofStatusTool = (server: McpServer, client: LemmaClient): RegisteredTool =>
  server.registerTool(
    "lemma_get_proof_status",
    {
      description: "Get the verification status of a proof by its verificationId. Proof states: received → verifying → verified → onchain-verifying → onchain-verified | rejected",
      inputSchema: { verificationId: z.string() },
    },
    (input) => runTool(getProofStatus(client, input)),
  );
