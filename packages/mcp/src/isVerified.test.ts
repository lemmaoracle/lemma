import { describe, it, expect } from "vitest";
import { isVerified } from "./isVerified.js";

describe("isVerified", () => {
  it("returns true for 'verified' status", () => {
    expect(isVerified("verified")).toBe(true);
  });

  it("returns true for 'onchain-verified' status", () => {
    expect(isVerified("onchain-verified")).toBe(true);
  });

  it("returns false for 'rejected' status", () => {
    expect(isVerified("rejected")).toBe(false);
  });

  it("returns false for 'received' status", () => {
    expect(isVerified("received")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isVerified(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isVerified("")).toBe(false);
  });

  it("returns false for any other string", () => {
    expect(isVerified("pending")).toBe(false);
    expect(isVerified("verifying")).toBe(false);
  });
});
