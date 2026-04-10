/**
 * Node.js HTTP server for Lemma Relay.
 *
 * Stateless server that routes requests to appropriate handlers.
 */

import * as R from "ramda";
import { createServer } from "node:http";
import { URL } from "node:url";
import type {
  HttpMethod,
  HttpHeaders,
  EnhancedRequest,
  RequestHandler,
  Route,
} from "./types/http.js";
import { proveHandler } from "./routes/prover/prove.js";

/** Server configuration. */
const CONFIG = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || "0.0.0.0",
} as const;

/** Health check handler. */
const healthHandler: RequestHandler = (_request) => ({
  status: 200,
  body: { status: "ok", timestamp: new Date().toISOString() },
});

/** Route definitions. */
const ROUTES: readonly Route[] = [
  {
    method: "GET",
    path: "/health",
    handler: healthHandler,
  },
  {
    method: "POST",
    path: "/prover/prove",
    handler: proveHandler,
  },
] as const;

/** Parse request body as JSON. */
const parseRequestBody = async (req: NodeJS.ReadableStream): Promise<unknown> =>
  new Promise<unknown>((resolve) => {
    const chunks: Buffer[] = [];
    
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString();
      
      if (!body) {
        resolve(undefined);
        return;
      }
      
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(undefined);
      }
    });
    
    req.on("error", () => {
      resolve(undefined);
    });
  });

/** Convert headers object to record. */
const headersToRecord = (headers: NodeJS.Dict<string | string[]>): Readonly<Record<string, string>> =>
  Object.entries(headers).reduce<Record<string, string>>(
    (acc, [key, value]) =>
      value !== undefined
        ? { ...acc, [key]: Array.isArray(value) ? value.join(", ") : value }
        : acc,
    {},
  );

/** Create enhanced request object. */
const createEnhancedRequest = (
  req: import("node:http").IncomingMessage,
  body: unknown,
): EnhancedRequest => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  
  return {
    req,
    method: (req.method || "GET") as HttpMethod,
    url: url.pathname,
    headers: headersToRecord(req.headers),
    body,
  };
};

/** Find matching route for request. */
const findMatchingRoute = (request: EnhancedRequest): Route | undefined =>
  R.find(
    (route: Route) =>
      route.method === request.method && route.path === request.url,
  )(ROUTES);

/** Send HTTP response. */
const sendResponse = (
  res: import("node:http").ServerResponse,
  status: number,
  headers: HttpHeaders = {},
  body?: unknown,
): void => {
  res.statusCode = status;
  
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  body !== undefined
    ? (() => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(body));
      })()
    : res.end();
};

/** Handle incoming request. */
const handleRequest = async (
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
): Promise<void> => {
  // Parse request body
  const body = await parseRequestBody(req);
  
  // Create enhanced request
  const request = createEnhancedRequest(req, body);
  
  // Find matching route
  const route = findMatchingRoute(request);
  
  // Handle route not found
  if (route === undefined) {
    sendResponse(res, 404, {}, { error: "Not found" });
    return;
  }

  // Execute handler
  const handlerResult = route.handler(request);
  
  // Handle both sync and async handlers
  const handleResult = handlerResult instanceof Promise
    ? await handlerResult.catch((error: unknown) => ({
        status: 500,
        headers: {},
        body: {
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error),
        },
      }))
    : handlerResult;
  
  sendResponse(res, handleResult.status, handleResult.headers, handleResult.body);
};

/** Create and start HTTP server. */
const startServer = (): void => {
  const server = createServer(handleRequest);
  
  server.listen(CONFIG.port, CONFIG.host, () => {
    console.log(`Lemma Relay server running at http://${CONFIG.host}:${CONFIG.port}`);
    console.log("Available routes:");
    
    ROUTES.forEach((route) => {
      console.log(`  ${route.method} ${route.path}`);
    });
  });
  
  // Graceful shutdown
  const shutdown = (signal: string): (() => void) => () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
    
    // Force shutdown after 5 seconds
    setTimeout(() => {
      console.error("Force shutdown after timeout");
      process.exit(1);
    }, 5000);
  };
  
  process.on("SIGTERM", shutdown("SIGTERM"));
  process.on("SIGINT", shutdown("SIGINT"));
};

// Start server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}