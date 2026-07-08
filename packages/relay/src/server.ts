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
import { compilePathPattern } from "./types/http.js";
import { proveHandler } from "./routes/prover/prove.js";
import { prepareHandler } from "./routes/prepare/prepare.js";
import { verifyHandler } from "./routes/verifier/verify.js";

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
    method: "GET",
    path: "/prover/prove/:jobId",
    handler: proveHandler,
  },
  {
    method: "POST",
    path: "/prepare",
    handler: prepareHandler,
  },
  {
    method: "POST",
    path: "/verifier/verify",
    handler: verifyHandler,
  },
] as const;

/** Compiled route: route + RegExp + parameter names. */
type CompiledRoute = Readonly<{
  route: Route;
  regex: RegExp;
  paramNames: readonly string[];
}>;

/** Pre-compile route patterns once at startup. */
const COMPILED_ROUTES: readonly CompiledRoute[] = ROUTES.map((route) => {
  const { regex, paramNames } = compilePathPattern(route.path);
  return { route, regex, paramNames } as const;
});

/** Parse request body as JSON. */
const parseRequestBody = (req: NodeJS.ReadableStream): Promise<unknown> =>
  new Promise<unknown>((resolve) => {
    const chunks: Buffer[] = [];

    // eslint-disable-next-line functional/no-expression-statements
    req.on("data", (chunk: Buffer) => {
      // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
      chunks.push(chunk);
    });

    // eslint-disable-next-line functional/no-expression-statements
    req.on("end", (_: unknown) => {
      const body = Buffer.concat(chunks).toString();
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

    // eslint-disable-next-line functional/no-expression-statements
    req.on("error", (_err: unknown) => {
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

/** Extract parameter values from a URL pathname against a compiled route. */
const extractParams = (
  compiled: CompiledRoute,
  pathname: string,
): Readonly<Record<string, string>> | undefined => {
  const match = compiled.regex.exec(pathname);
  return match
    ? compiled.paramNames.reduce<Record<string, string>>(
        (acc, name, i) => ({ ...acc, [name]: match[i + 1] ?? "" }),
        {},
      )
    : undefined;
};

/** Attempt to match a compiled route against the request. */
const tryMatch = (
  compiled: Readonly<{
    route: Route;
    regex: RegExp;
    paramNames: readonly string[];
  }>,
  request: EnhancedRequest,
): Readonly<{ route: Route; params?: Readonly<Record<string, string>> }> | undefined =>
  compiled.route.method !== request.method
    ? undefined
    : (() => {
        const params = extractParams(compiled, request.url);
        return params !== undefined
          ? { route: compiled.route, params }
          : undefined;
      })();

/** Find matching route for a request, populating path params when present. */
const findMatchingRoute = (
  request: EnhancedRequest,
): Readonly<{ route: Route; params?: Readonly<Record<string, string>> }> | undefined =>
  COMPILED_ROUTES.reduce<
    Readonly<{ route: Route; params?: Readonly<Record<string, string>> }> | undefined
  >((acc, compiled) => acc ?? tryMatch(compiled, request), undefined);

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
      const match = findMatchingRoute(request);
      return R.ifElse(
        (m: typeof match) => m === undefined,
        (_m: typeof match) => {
          sendResponse(res, 404, {}, { error: "Not found" });
          return Promise.resolve();
        },
        (m: NonNullable<typeof match>) => {
          const enriched: EnhancedRequest = { ...request, params: m.params };
          return Promise.resolve(m.route.handler(enriched))
            .catch((error: unknown) => ({
              status: 500,
              headers: {},
              body: {
                error: "Internal server error",
                message: error instanceof Error ? error.message : String(error),
              },
            }))
            .then((result) => {
              sendResponse(res, result.status, result.headers, result.body);
            });
        },
      )(match);
    });

/** Create and start HTTP server. */
const startServer = (_: unknown): void => {
  const server = createServer((req, res) => {
    // eslint-disable-next-line functional/no-expression-statements
    void handleRequest(req, res);
  });

  // eslint-disable-next-line functional/no-expression-statements
  server.listen({ port: CONFIG.port, host: CONFIG.host }, (_?: undefined) => {
    console.log(
      `Lemma Relay server running at http://${CONFIG.host}:${CONFIG.port.toString()}`,
    );
    console.log("Available routes:");
    ROUTES.forEach((route) => {
      console.log(`  ${route.method} ${route.path}`);
    });
  });

  const shutdown = (signal: string) => (_: unknown) => {
    console.log(`Received ${signal}, shutting down gracefully...`);

    // eslint-disable-next-line functional/no-expression-statements
    server.close((_err: unknown) => {
      console.log("Server closed");
      // eslint-disable-next-line functional/no-expression-statements
      process.exit(0);
    });

    // eslint-disable-next-line functional/no-expression-statements
    setTimeout((_timer: unknown) => {
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

// eslint-disable-next-line functional/no-expression-statements
R.ifElse(
  (url: string) => url === `file://${process.argv[1] ?? ""}`,
  startServer,
  R.always(undefined),
)(import.meta.url);
