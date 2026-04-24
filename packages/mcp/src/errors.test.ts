import { describe, it, expect } from "vitest";
import { normalizeError } from "./errors.js";

describe("normalizeError", () => {
  it('maps HTTP 400 to "invalid_input"', () => {
    const result = normalizeError(new Error("HTTP 400: bad request"));
    expect(result.code).toBe("invalid_input");
  });

  it('maps HTTP 422 to "invalid_input"', () => {
    const result = normalizeError(new Error("HTTP 422: validation failed"));
    expect(result.code).toBe("invalid_input");
  });

  it('maps HTTP 401 to "auth_error"', () => {
    const result = normalizeError(new Error("HTTP 401: unauthorized"));
    expect(result.code).toBe("auth_error");
  });

  it('maps HTTP 403 to "auth_error"', () => {
    const result = normalizeError(new Error("HTTP 403: forbidden"));
    expect(result.code).toBe("auth_error");
  });

  it('maps HTTP 429 to "rate_limited"', () => {
    const result = normalizeError(new Error("HTTP 429: too many requests"));
    expect(result.code).toBe("rate_limited");
  });

  it('maps unknown HTTP status to "upstream_error"', () => {
    const result = normalizeError(new Error("HTTP 500: server error"));
    expect(result.code).toBe("upstream_error");
  });

  it('maps non-Error values to "upstream_error"', () => {
    const result = normalizeError("something went wrong");
    expect(result.code).toBe("upstream_error");
    expect(result.message).toBe("something went wrong");
  });
});
