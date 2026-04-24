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
