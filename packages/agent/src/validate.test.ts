import { describe, it, expect } from "vitest";
import {
  validate,
  validateRequiredFields,
  validateSpendLimit,
  validateCurrency,
  validateTimestamps,
} from "./validate.js";

const validCredential = {
  schema: "agent-identity-authority-v1",
  identity: {
    agentId: "agent-1",
    subjectId: "subject-1",
  },
  authority: {
    roles: [{ name: "admin" }],
    scopes: [],
    permissions: [],
  },
  lifecycle: {
    issuedAt: 1714500000,
    expiresAt: 1717100000,
  },
  provenance: {
    issuerId: "issuer-1",
  },
};

describe("validateRequiredFields", () => {
  it("returns no errors for valid credential", () => {
    const errors = validateRequiredFields(validCredential as Record<string, unknown>);
    expect(errors).toHaveLength(0);
  });

  it("returns EmptyAgentId when agentId is empty", () => {
    const input = {
      ...validCredential,
      identity: { agentId: "", subjectId: "subject-1" },
    };
    const errors = validateRequiredFields(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "EmptyAgentId")).toBe(true);
  });

  it("returns EmptySubjectId when subjectId is empty", () => {
    const input = {
      ...validCredential,
      identity: { agentId: "agent-1", subjectId: "" },
    };
    const errors = validateRequiredFields(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "EmptySubjectId")).toBe(true);
  });

  it("returns EmptyRoles when roles is empty", () => {
    const input = {
      ...validCredential,
      authority: { roles: [], scopes: [], permissions: [] },
    };
    const errors = validateRequiredFields(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "EmptyRoles")).toBe(true);
  });

  it("returns EmptyIssuerId when issuerId is empty", () => {
    const input = {
      ...validCredential,
      provenance: { issuerId: "" },
    };
    const errors = validateRequiredFields(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "EmptyIssuerId")).toBe(true);
  });
});

describe("validateSpendLimit", () => {
  it("returns no errors when spendLimit is absent", () => {
    const errors = validateSpendLimit(validCredential as Record<string, unknown>);
    expect(errors).toHaveLength(0);
  });

  it("returns no errors for valid spendLimit", () => {
    const input = {
      ...validCredential,
      financial: { spendLimit: 50000 },
    };
    const errors = validateSpendLimit(input as Record<string, unknown>);
    expect(errors).toHaveLength(0);
  });

  it("returns error when spendLimit exceeds 1 trillion", () => {
    const input = {
      ...validCredential,
      financial: { spendLimit: 1_000_000_000_001 },
    };
    const errors = validateSpendLimit(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "SpendLimitExceeded")).toBe(true);
  });

  it("returns error for fractional spend limit", () => {
    const input = {
      ...validCredential,
      financial: { spendLimit: 100.5 },
    };
    const errors = validateSpendLimit(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "SpendLimitExceeded")).toBe(true);
  });

  it("returns error for negative spend limit", () => {
    const input = {
      ...validCredential,
      financial: { spendLimit: -1 },
    };
    const errors = validateSpendLimit(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "SpendLimitExceeded")).toBe(true);
  });

  it("returns no error for zero spend limit", () => {
    const input = {
      ...validCredential,
      financial: { spendLimit: 0 },
    };
    const errors = validateSpendLimit(input as Record<string, unknown>);
    expect(errors).toHaveLength(0);
  });
});

describe("validateCurrency", () => {
  it("returns no errors when currency is absent", () => {
    const errors = validateCurrency(validCredential as Record<string, unknown>);
    expect(errors).toHaveLength(0);
  });

  it("returns no errors for valid uppercase currency", () => {
    const input = {
      ...validCredential,
      financial: { currency: "USD" },
    };
    const errors = validateCurrency(input as Record<string, unknown>);
    expect(errors).toHaveLength(0);
  });

  it("returns error for lowercase currency", () => {
    const input = {
      ...validCredential,
      financial: { currency: "usd" },
    };
    const errors = validateCurrency(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "InvalidCurrency")).toBe(true);
  });

  it("returns error for 2-letter currency", () => {
    const input = {
      ...validCredential,
      financial: { currency: "US" },
    };
    const errors = validateCurrency(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "InvalidCurrency")).toBe(true);
  });

  it("returns error for 4-letter currency", () => {
    const input = {
      ...validCredential,
      financial: { currency: "DOLL" },
    };
    const errors = validateCurrency(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "InvalidCurrency")).toBe(true);
  });
});

describe("validateTimestamps", () => {
  it("returns no errors for valid timestamps", () => {
    const errors = validateTimestamps(validCredential as Record<string, unknown>);
    expect(errors).toHaveLength(0);
  });

  it("returns error for negative issuedAt", () => {
    const input = {
      ...validCredential,
      lifecycle: { issuedAt: -1, expiresAt: 1717100000 },
    };
    const errors = validateTimestamps(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "InvalidTimestamp")).toBe(true);
  });

  it("returns error for null issuedAt", () => {
    const input = {
      ...validCredential,
      lifecycle: { issuedAt: null, expiresAt: 1717100000 },
    };
    const errors = validateTimestamps(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "InvalidTimestamp")).toBe(true);
  });

  it("returns error when expiresAt <= issuedAt", () => {
    const input = {
      ...validCredential,
      lifecycle: { issuedAt: 1717100000, expiresAt: 1714500000 },
    };
    const errors = validateTimestamps(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "InvalidTimestamp")).toBe(true);
  });

  it("returns error when expiresAt equals issuedAt", () => {
    const input = {
      ...validCredential,
      lifecycle: { issuedAt: 1714500000, expiresAt: 1714500000 },
    };
    const errors = validateTimestamps(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "InvalidTimestamp")).toBe(true);
  });

  it("returns error when expiresAt exceeds 4102444800", () => {
    const input = {
      ...validCredential,
      lifecycle: { issuedAt: 1714500000, expiresAt: 4102444801 },
    };
    const errors = validateTimestamps(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "InvalidTimestamp")).toBe(true);
  });

  it("returns error for fractional issuedAt", () => {
    const input = {
      ...validCredential,
      lifecycle: { issuedAt: 1714500000.5 },
    };
    const errors = validateTimestamps(input as Record<string, unknown>);
    expect(errors.some((e) => e.kind === "InvalidTimestamp")).toBe(true);
  });
});

describe("validate (composed)", () => {
  it("returns valid: true for a valid credential", () => {
    const result = validate(validCredential);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.credential.identity.agentId).toBe("agent-1");
    }
  });

  it("returns valid: false with errors for invalid input", () => {
    const result = validate({
      schema: "agent-identity-authority-v1",
      identity: { agentId: "", subjectId: "" },
      authority: { roles: [], scopes: [], permissions: [] },
      lifecycle: { issuedAt: -1 },
      provenance: { issuerId: "" },
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThan(0);
      const kinds = result.errors.map((e) => e.kind);
      expect(kinds).toContain("EmptyAgentId");
      expect(kinds).toContain("EmptySubjectId");
      expect(kinds).toContain("EmptyRoles");
      expect(kinds).toContain("EmptyIssuerId");
      expect(kinds).toContain("InvalidTimestamp");
    }
  });

  it("returns InvalidSchema for wrong schema", () => {
    const result = validate({
      ...validCredential,
      schema: "wrong-schema",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.kind === "InvalidSchema")).toBe(true);
    }
  });

  it("accepts custom schemaId when matching", () => {
    const result = validate(
      { ...validCredential, schema: "agent-identity-authority-v2" },
      { schemaId: "agent-identity-authority-v2" },
    );
    expect(result.valid).toBe(true);
  });

  it("rejects custom schemaId when not matching", () => {
    const result = validate(
      { ...validCredential, schema: "agent-identity-authority-v1" },
      { schemaId: "agent-identity-authority-v2" },
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.kind === "InvalidSchema")).toBe(true);
    }
  });

  it("validates all financial edge cases together", () => {
    const result = validate({
      ...validCredential,
      financial: { spendLimit: 100.5, currency: "usd" },
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      const kinds = result.errors.map((e) => e.kind);
      expect(kinds).toContain("SpendLimitExceeded");
      expect(kinds).toContain("InvalidCurrency");
    }
  });

  it("validates expiration before issuance", () => {
    const result = validate({
      ...validCredential,
      lifecycle: { issuedAt: 1717100000, expiresAt: 1714500000 },
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.kind === "InvalidTimestamp")).toBe(true);
    }
  });
});
