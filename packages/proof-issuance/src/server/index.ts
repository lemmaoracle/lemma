/**
 * Proof Issuance API — Server entry point
 *
 * Starts a standalone Hono server on the configured port.
 * Default: http://localhost:8787
 */

/* eslint-disable functional/no-expression-statements */

import { serve } from "@hono/node-server";
import { app } from "./app.js";

const getPort = (envPort?: string): number =>
  envPort != null ? Number(envPort) : 8787;

const port =
  typeof process !== "undefined"
    ? getPort(process.env.PORT)
    : getPort();

const portStr = String(port);

console.log(
  `[Proof Issuance API] Stage A (Sepolia trial) starting on http://localhost:${portStr}`,
);
console.log(
  `[Proof Issuance API] Health: http://localhost:${portStr}/v1/health`,
);
console.log(
  `[Proof Issuance API] Discovery: http://localhost:${portStr}/v1/discover`,
);

serve({ fetch: app.fetch, port });
