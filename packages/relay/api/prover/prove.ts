/**
 * POST /prover/prove
 *
 * Relay for `@lemmaoracle/sdk` → `prover.prove()`.
 *
 * This function requires `snarkjs` / `ffjavascript` which use
 * `URL.createObjectURL()` internally.  That API is unavailable on
 * Cloudflare Workers (and other edge runtimes), so this endpoint
 * runs on a Node.js serverless function (Vercel) instead.
 *
 * Stateless — no env vars, no DB, no logger.
 * All parameters are supplied in the request body.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { create, prover } from "@lemmaoracle/sdk";

/** Request body mirrors the arguments of `prover.prove`. */
type RequestBody = Readonly<{
  /** Lemma API base URL (used to construct the SDK client). */
  apiBase: string;
  /** Lemma API key (optional). */
  apiKey?: string;
  /** `prover.prove` input. */
  input: Readonly<{
    circuitId: string;
    witness: Readonly<Record<string, unknown>>;
  }>;
}>;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body as RequestBody | undefined;

  if (!body?.apiBase || !body?.input?.circuitId || !body?.input?.witness) {
    res.status(400).json({
      error: "Bad request",
      expected: {
        apiBase: "string",
        apiKey: "string (optional)",
        input: { circuitId: "string", witness: "Record<string, unknown>" },
      },
    });
    return;
  }

  const client = create({ apiBase: body.apiBase, apiKey: body.apiKey });

  try {
    const result = await prover.prove(client, body.input);
    res.status(200).json(result);
  } catch (err) {
    res.status(502).json({
      error: "Proof generation failed",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
