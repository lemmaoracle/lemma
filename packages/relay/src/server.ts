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
import { prepareHandler } from "./routes/prepare/prepare.js";

/** Server configuration. */
const CONFIG: Readonly<{
  port: number;
  host: string;
}> = {
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
  {
    method: "POST",
    path: "/prepare",
    handler: prepareHandler,
  },
] as const;

/** Parse request body as JSON. */
const parseRequestBody = (req: NodeJS.ReadableStream): Promise<unknown> =>
  new Promise<unknown>((resolve) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer) => {
      // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
      chunks.push(chunk);
    });

    req.on("end", (_: unknown) => {
      const body = Buffer.concat(chunks).toString();
      // eslint-disable-next-line functional/no-expression-statements
      resolve(
        R.ifElse(
          (s: string) => s === "",
          R.always(undefined),
          (s: string) => {
            // eslint-disable-next-line functional/no-try-statements
            try {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return JSON.parse(s);
            } catch {
              return undefined;
            }
          },
        )(body),
      );
    });

    req.on("error", (_err: unknown) => {
      // eslint-disable-next-line functional/no-expression-statements
      resolve(undefined);
    });
  });

/** Convert headers object to record. */
const headersToRecord = (
  headers: NodeJS.Dict<string | string[]>,
): Readonly<Record<string, string>> =>
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
  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`,
  );

  return {
    req,
    method: (req.method ?? "GET") as HttpMethod,
    url: url.pathname,
    headers: headersToRecord(req.headers),
    body,
  };
};

/** Find matching route for request. */
const findMatchingRoute = (request: EnhancedRequest): Route | undefined =>
  ROUTES.find(
    (route) => route.method === request.method && route.path === request.url,
  );

/** Send HTTP response. */
const sendResponse = (
  res: import("node:http").ServerResponse,
  status: number,
  headers: HttpHeaders = {},
  body?: unknown,
): void => {
  // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
  res.statusCode = status;

  Object.entries(headers).forEach(([key, value]) => {
    // eslint-disable-next-line functional/no-expression-statements
    res.setHeader(key, value);
  });

  // eslint-disable-next-line functional/no-expression-statements
  R.ifElse(
    (b: unknown) => b !== undefined,
    (b: unknown) => {
      // eslint-disable-next-line functional/no-expression-statements
      res.setHeader("Content-Type", "application/json");
      // eslint-disable-next-line functional/no-expression-statements
      res.end(JSON.stringify(b));
    },
    (_: unknown) => {
      // eslint-disable-next-line functional/no-expression-statements
      res.end();
    },
  )(body);
};

/** Handle incoming request. */
const handleRequest = (
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
): Promise<void> =>
  parseRequestBody(req)
    .then((body: unknown) => createEnhancedRequest(req, body))
    .then((request: EnhancedRequest) => {
      const route = findMatchingRoute(request);
      return R.ifElse(
        (r: Route | undefined) => r === undefined,
        (_r: Route | undefined) => {
          // eslint-disable-next-line functional/no-expression-statements
          sendResponse(res, 404, {}, { error: "Not found" });
          return Promise.resolve();
        },
        (r: Route) =>
          Promise.resolve(r.handler(request))
            .catch((error: unknown) => ({
              status: 500,
              headers: {},
              body: {
                error: "Internal server error",
                message: error instanceof Error ? error.message : String(error),
              },
            }))
            .then((result) => {
              // eslint-disable-next-line functional/no-expression-statements
              sendResponse(res, result.status, result.headers, result.body);
            }),
      )(route);
    });

/** Create and start HTTP server. */
const startServer = (_: unknown): void => {
  const server = createServer((req, res) => {
    // eslint-disable-next-line functional/no-expression-statements
    void handleRequest(req, res);
  });

  server.listen({ port: CONFIG.port, host: CONFIG.host }, () => {
    // eslint-disable-next-line functional/no-expression-statements
    console.log(
      `Lemma Relay server running at http://${CONFIG.host}:${CONFIG.port.toString()}`,
    );
    // eslint-disable-next-line functional/no-expression-statements
    console.log("Available routes:");
    ROUTES.forEach((route) => {
      // eslint-disable-next-line functional/no-expression-statements
      console.log(`  ${route.method} ${route.path}`);
    });
  });

  const shutdown = (signal: string) => (_: unknown) => {
    // eslint-disable-next-line functional/no-expression-statements
    console.log(`Received ${signal}, shutting down gracefully...`);

    server.close((_err: unknown) => {
      // eslint-disable-next-line functional/no-expression-statements
      console.log("Server closed");
      // eslint-disable-next-line functional/no-expression-statements
      process.exit(0);
    });

    setTimeout((_timer: unknown) => {
      // eslint-disable-next-line functional/no-expression-statements
      console.error("Force shutdown after timeout");
      // eslint-disable-next-line functional/no-expression-statements
      process.exit(1);
    }, 5000);
  };

  // eslint-disable-next-line functional/no-expression-statements
  process.on("SIGTERM", shutdown("SIGTERM"));
  // eslint-disable-next-line functional/no-expression-statements
  process.on("SIGINT", shutdown("SIGINT"));
};

// Start server if this is the main module
// eslint-disable-next-line functional/no-expression-statements
R.ifElse(
  (url: string) => url === `file://${process.argv[1] ?? ""}`,
  (url: string) => {
    // eslint-disable-next-line functional/no-expression-statements
    startServer(url);
  },
  R.always(undefined),
)(import.meta.url);
