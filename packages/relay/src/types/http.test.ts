import { describe, it, expect } from "vitest";
import { compilePathPattern } from "./http.js";

describe("compilePathPattern", () => {
  it("compiles a static path anchored at both ends", () => {
    const { regex, paramNames } = compilePathPattern("/health");
    expect(paramNames).toEqual([]);
    expect(regex.test("/health")).toBe(true);
    expect(regex.test("/health/")).toBe(false);
    expect(regex.test("/healthx")).toBe(false);
    expect(regex.test("/x/health")).toBe(false);
  });

  it("compiles a single param that never crosses a slash", () => {
    const { regex, paramNames } = compilePathPattern("/prover/prove/:jobId");
    expect(paramNames).toEqual(["jobId"]);
    expect(regex.test("/prover/prove/job-123")).toBe(true);
    const match = regex.exec("/prover/prove/job-123");
    expect(match?.[1]).toBe("job-123");
    expect(regex.test("/prover/prove/a/b")).toBe(false);
    expect(regex.test("/prover/prove/")).toBe(false);
    expect(regex.test("/prover/prove")).toBe(false);
  });

  it("compiles multiple params in declaration order", () => {
    const { regex, paramNames } = compilePathPattern("/x/:a/:b");
    expect(paramNames).toEqual(["a", "b"]);
    const match = regex.exec("/x/1/2");
    expect(match?.[1]).toBe("1");
    expect(match?.[2]).toBe("2");
    expect(regex.test("/x/1")).toBe(false);
    expect(regex.test("/x/1/2/3")).toBe(false);
  });

  it("escapes regex metacharacters in static segments", () => {
    const { regex, paramNames } = compilePathPattern("/a.b+c");
    expect(paramNames).toEqual([]);
    expect(regex.test("/a.b+c")).toBe(true);
    expect(regex.test("/axb+c")).toBe(false);
    expect(regex.test("/a.bc")).toBe(false);
    expect(regex.test("/a.b+cc")).toBe(false);
  });

  it("compiles a versioned route with a trailing param", () => {
    const { regex, paramNames } = compilePathPattern("/v1/schemas/:id");
    expect(paramNames).toEqual(["id"]);
    expect(regex.test("/v1/schemas/s-1")).toBe(true);
    expect(regex.test("/v1/schemas/")).toBe(false);
  });
});
