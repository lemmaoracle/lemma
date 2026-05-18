export type LemmaMcpError =
  | { readonly code: "invalid_input"; readonly message: string }
  | { readonly code: "auth_error"; readonly message: string }
  | { readonly code: "rate_limited"; readonly message: string }
  | { readonly code: "upstream_error"; readonly message: string };

const parseStatusFromMessage = (message: string): number | undefined => {
  const match = message.match(/HTTP (\d{3}):/);
  return match ? Number(match[1]) : undefined;
};

const statusToCode = (status: number): LemmaMcpError["code"] =>
  status === 400 || status === 422
    ? "invalid_input"
    : status === 401 || status === 403
      ? "auth_error"
      : status === 429
        ? "rate_limited"
        : "upstream_error";

export const normalizeError = (error: unknown): LemmaMcpError => {
  const message = error instanceof Error ? error.message : String(error);
  const status = parseStatusFromMessage(message);
  const code = status !== undefined ? statusToCode(status) : "upstream_error";

  return { code, message };
};

/**
 * MCP SDK boundary type. `content` and `structuredContent` are kept mutable to
 * satisfy the SDK's `CallToolResult` signature; internal Lemma types remain
 * `Readonly<>` per repo FP conventions.
 */
export type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

/**
 * Wrap a Lemma SDK promise into an MCP tool result.
 *
 * Success path returns both `content` (stringified JSON for legacy MCP clients
 * and visibility in inspectors) and `structuredContent` (a typed object that
 * the SDK validates against the registered tool's `outputSchema`). `undefined`
 * and non-object results are coerced to `{}` so that all-optional output
 * schemas validate cleanly.
 *
 * Error path returns `isError: true` so the SDK skips outputSchema validation.
 */
export const runTool = <T>(promise: Promise<T>): Promise<ToolResult> =>
  promise.then(
    (result): ToolResult => {
      const isObject = typeof result === "object" && result !== null;
      return {
        content: [{ type: "text", text: JSON.stringify(result ?? null, null, 2) }],
        structuredContent: isObject ? (result as Record<string, unknown>) : {},
      };
    },
    (error: unknown): ToolResult => ({
      content: [{ type: "text", text: JSON.stringify({ error: normalizeError(error) }, null, 2) }],
      isError: true,
    }),
  );
