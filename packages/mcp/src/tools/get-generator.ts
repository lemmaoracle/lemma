import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as generators from "@lemmaoracle/sdk/generators";
import type { LemmaClient, GeneratorMeta } from "@lemmaoracle/spec";
import { runTool } from "../errors.js";

export type GetGeneratorInput = Readonly<{ generatorId: string }>;

export const getGenerator = (client: LemmaClient, input: GetGeneratorInput): Promise<GeneratorMeta> =>
  generators.getById(client, input.generatorId);

export const getGeneratorTool = (server: McpServer, client: LemmaClient): RegisteredTool =>
  server.registerTool(
    "lemma_get_generator",
    {
      description:
        "Retrieve a Lemma document generator by generatorId via GET /v1/doc-generators/{generatorId}. " +
        "A generator describes how a class of source documents is produced (e.g., what fields a 'KYC-v2' issuer must populate). " +
        "Returns GeneratorMeta { generatorId, schema, description?, language?, source?: { type: 'url', uri }, inputsSpec?, outputsSpec? }. " +
        "Each generator is bound to one schema. Use this when onboarding a new issuer or auditing how an existing schema is being populated.",
      inputSchema: {
        generatorId: z
          .string()
          .describe(
            "Generator ID. Each generator is bound to a single schema and describes how source documents are produced. Registered via POST /v1/doc-generators. NOTE: this matches the OpenAPI field name `generatorId`, not a generic `id`.",
          ),
      },
      outputSchema: {
        generatorId: z.string().describe("Generator ID, echoing the request."),
        schema: z.string().describe("Schema ID this generator is bound to (1:1 binding)."),
        description: z.string().optional(),
        language: z.string().optional().describe("Implementation language (e.g. 'rust', 'typescript')."),
        source: z
          .object({
            type: z.literal("url"),
            uri: z.string().describe("Source URL (git, IPFS, etc.)."),
          })
          .optional()
          .describe("Reference to the generator's source code."),
        inputsSpec: z
          .record(z.unknown())
          .optional()
          .describe("Specification of fields the issuer must populate."),
        outputsSpec: z
          .record(z.unknown())
          .optional()
          .describe("Specification of fields the generator produces."),
      },
      annotations: {
        title: "Lemma — get generator",
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
        destructiveHint: false,
      },
    },
    (input) => runTool(getGenerator(client, input)),
  );
