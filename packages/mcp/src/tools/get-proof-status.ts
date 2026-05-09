import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as attributes from "@lemmaoracle/sdk/attributes";
import type { LemmaClient } from "@lemmaoracle/spec";
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
      description:
        "Get the verification status of a proof. " +
        "NOTE: the v2 API does not yet expose a dedicated GET /v1/proofs/{id} endpoint, so this tool internally calls POST /v1/verified-attributes/query filtered by docHash (treating the verificationId returned from lemma_submit_proof as a docHash filter). " +
        "Returns { status, circuitId, chainId, docHash } extracted from the matched item, or undefined if the verificationId is unknown. " +
        "Status enum: received | verified | onchain-verified | rejected. " +
        "Use the SDK's isVerified() helper (or check status === 'verified' || status === 'onchain-verified') to determine cryptographic validity.",
      inputSchema: {
        verificationId: z
          .string()
          .describe(
            "verificationId returned by lemma_submit_proof. Internally treated as a docHash filter on POST /v1/verified-attributes/query (no dedicated GET /v1/proofs/{id} endpoint in v2 API).",
          ),
      },
    },
    (input) => runTool(getProofStatus(client, input)),
  );
