/**
 * HTTP request/response types for Node.js server.
 */

import type { IncomingMessage } from "node:http";

/** HTTP method type. */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/** HTTP headers as a readonly record. */
export type HttpHeaders = Readonly<Record<string, string>>;

/** HTTP response configuration. */
export type HttpResponse = Readonly<{
  /** HTTP status code. */
  status: number;
  /** Response headers. */
  headers?: HttpHeaders;
  /** Response body (JSON-serializable). */
  body?: unknown;
}>;

/** Parsed request body. */
export type RequestBody = unknown;

/** Enhanced request object with parsed body. */
export type EnhancedRequest = Readonly<{
  /** Original Node.js request. */
  req: IncomingMessage;
  /** HTTP method. */
  method: HttpMethod;
  /** Request URL. */
  url: string;
  /** Request headers. */
  headers: HttpHeaders;
  /** Parsed request body (if any). */
  body?: RequestBody;
  /** Path parameters extracted from the route pattern (e.g. `:jobId`). */
  params?: Readonly<Record<string, string>>;
}>;

/** Request handler function type. */
export type RequestHandler = (
  request: EnhancedRequest,
) => Promise<HttpResponse> | HttpResponse;

/** Route definition. */
export type Route = Readonly<{
  /** HTTP method. */
  method: HttpMethod;
  /** URL path pattern, may include `:param` segments. */
  path: string;
  /** Request handler. */
  handler: RequestHandler;
}>;

/**
 * Compile a route path pattern (`/prover/prove/:jobId`) into a RegExp and
 * the ordered list of parameter names. Each `:param` segment matches
 * `[^/]+` so it never crosses a path separator.
 */
export const compilePathPattern = (
  path: string,
): Readonly<{ regex: RegExp; paramNames: readonly string[] }> => {
   
  const paramNames: string[] = [];
  const pattern = path
    .split("/")
    .map((segment) =>
      segment.startsWith(":")
        ? (() => {
            // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
            paramNames.push(segment.slice(1));
            return "([^/]+)";
          })()
        : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    )
    .join("/");
  return {
    regex: new RegExp(`^${pattern}$`),
    paramNames,
  } as const;
};