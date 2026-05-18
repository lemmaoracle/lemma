import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as circuits from "@lemmaoracle/sdk/circuits";
import type { LemmaClient, CircuitMeta } from "@lemmaoracle/spec";
import { runTool } from "../errors.js";

export type GetCircuitInput = Readonly<{ circuitId: string }>;

export const getCircuit = (client: LemmaClient, input: GetCircuitInput): Promise<CircuitMeta> =>
  circuits.getById(client, input.circuitId);

export const getCircuitTool = (server: McpServer, client: LemmaClient): RegisteredTool =>
  server.registerTool(
    "lemma_get_circuit",
    {
      description:
        "Retrieve a zero-knowledge proof circuit by its circuitId via GET /v1/circuits/{circuitId}. " +
        "A circuit defines the constraints that proofs must satisfy and binds to a single schema. " +
        "Returns CircuitMeta { circuitId, schema, description?, inputs?, verifier?: { type: 'onchain'|'offchain', address?, chainId? }, artifact?: { location: { type: 'ipfs'|'https', wasm, zkey } } }. " +
        "Use this before lemma_submit_proof to confirm the circuit's schema, public inputs, and verifier configuration. " +
        "Circuits are immutable; new variants get new circuitIds.",
      inputSchema: {
        circuitId: z
          .string()
          .describe(
            "Circuit ID. Returned in the `proof.circuitId` field of VerifiedAttributesQueryResponseItem from lemma_query_verified_attributes, or registered via POST /v1/circuits. NOTE: this matches the OpenAPI field name `circuitId`, not a generic `id`.",
          ),
      },
      outputSchema: {
        circuitId: z.string().describe("Circuit ID, echoing the request."),
        schema: z.string().describe("Schema ID this circuit is bound to."),
        description: z.string().optional(),
        inputs: z
          .array(z.string())
          .optional()
          .describe("Ordered names of the circuit's public/private inputs."),
        verifiers: z
          .array(
            z.object({
              type: z.enum(["onchain", "offchain"]).describe("Verifier location."),
              address: z.string().optional().describe("Verifier contract address (onchain only)."),
              chainId: z.number().optional().describe("EVM chain ID (onchain only)."),
              alg: z
                .string()
                .optional()
                .describe("Proof algorithm identifier (e.g. 'groth16-bn254-snarkjs')."),
            }),
          )
          .optional()
          .describe("Available verifier configurations for this circuit."),
        artifact: z
          .object({
            location: z.object({
              type: z.enum(["ipfs", "https"]),
              wasm: z.string().describe("Circuit WASM artifact URL/CID."),
              zkey: z.string().describe("Circuit proving key URL/CID."),
            }),
          })
          .optional()
          .describe("Circuit artifact location (WASM + zkey)."),
      },
      annotations: {
        title: "Lemma — get circuit",
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
        destructiveHint: false,
      },
    },
    (input) => runTool(getCircuit(client, input)),
  );
