import { describe, it, expect } from "vitest";
import { credential } from "./credential.js";

describe("credential factory", () => {
  it("creates a valid credential with required-only input", () => {
    const result = credential({
      agentId: "agent-1",
      subjectId: "subject-1",
      roles: ["admin"],
      issuerId: "issuer-1",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.credential.schema).toBe("agent-identity-authority-v1");
      expect(result.credential.identity.agentId).toBe("agent-1");
      expect(result.credential.identity.subjectId).toBe("subject-1");
      expect(result.credential.identity.controllerId).toBe("");
      expect(result.credential.identity.orgId).toBe("");
      expect(result.credential.authority.roles).toEqual([{ name: "admin" }]);
      expect(result.credential.authority.scopes).toEqual([]);
      expect(result.credential.authority.permissions).toEqual([]);
      expect(result.credential.financial?.currency).toBe("USD");
      expect(result.credential.financial?.paymentPolicy).toBe("");
      expect(result.credential.lifecycle.issuedAt).toBeGreaterThan(0);
      expect(result.credential.provenance.issuerId).toBe("issuer-1");
      expect(result.credential.provenance.sourceSystem).toBe("");
      expect(result.credential.provenance.generatorId).toBe("");
      expect(result.credential.provenance.chainContext?.network).toBe("");
    }
  });

  it("creates a valid credential with all optional fields", () => {
    const result = credential({
      agentId: "agent-1",
      subjectId: "subject-1",
      roles: ["admin", "user"],
      issuerId: "issuer-1",
      controllerId: "ctrl-1",
      orgId: "org-1",
      scopes: ["read", "write"],
      permissions: [{ resource: "doc", action: "read" }],
      spendLimit: 50000,
      currency: "EUR",
      paymentPolicy: "prepaid",
      issuedAt: 1714500000,
      expiresAt: 1717100000,
      revoked: false,
      revocationRef: "",
      sourceSystem: "system-a",
      generatorId: "gen-1",
      chainId: 1,
      network: "ethereum",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.credential.identity.controllerId).toBe("ctrl-1");
      expect(result.credential.identity.orgId).toBe("org-1");
      expect(result.credential.authority.scopes).toEqual([
        { name: "read" },
        { name: "write" },
      ]);
      expect(result.credential.authority.permissions).toEqual([
        { resource: "doc", action: "read" },
      ]);
      expect(result.credential.financial?.spendLimit).toBe(50000);
      expect(result.credential.financial?.currency).toBe("EUR");
      expect(result.credential.financial?.paymentPolicy).toBe("prepaid");
      expect(result.credential.lifecycle.issuedAt).toBe(1714500000);
      expect(result.credential.lifecycle.expiresAt).toBe(1717100000);
      expect(result.credential.provenance.sourceSystem).toBe("system-a");
      expect(result.credential.provenance.generatorId).toBe("gen-1");
      expect(result.credential.provenance.chainContext?.chainId).toBe(1);
      expect(result.credential.provenance.chainContext?.network).toBe("ethereum");
    }
  });

  it("creates a credential with custom schemaId", () => {
    const result = credential(
      {
        agentId: "a",
        subjectId: "s",
        roles: ["admin"],
        issuerId: "i",
      },
      { schemaId: "agent-identity-authority-v2" },
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.credential.schema).toBe("agent-identity-authority-v2");
    }
  });

  it("returns validation errors for missing required fields", () => {
    const result = credential({
      agentId: "",
      subjectId: "",
      roles: [],
      issuerId: "",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      const kinds = result.errors.map((e) => e.kind);
      expect(kinds).toContain("EmptyAgentId");
      expect(kinds).toContain("EmptySubjectId");
      expect(kinds).toContain("EmptyRoles");
      expect(kinds).toContain("EmptyIssuerId");
    }
  });

  it("defaults issuedAt to current time when not provided", () => {
    const before = Math.floor(Date.now() / 1000);
    const result = credential({
      agentId: "a",
      subjectId: "s",
      roles: ["admin"],
      issuerId: "i",
    });
    const after = Math.floor(Date.now() / 1000);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.credential.lifecycle.issuedAt).toBeGreaterThanOrEqual(before);
      expect(result.credential.lifecycle.issuedAt).toBeLessThanOrEqual(after);
    }
  });

  it("defaults financial.currency to USD when not provided", () => {
    const result = credential({
      agentId: "a",
      subjectId: "s",
      roles: ["admin"],
      issuerId: "i",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.credential.financial?.currency).toBe("USD");
    }
  });
});
