/**
 * Tests for discovery.ts — Bazaar discovery extension
 *
 * Test files are exempt from functional programming rules.
 */

import { describe, it, expect } from "vitest";
import { buildDiscoveryExtension } from "../lib/discovery.js";

describe("buildDiscoveryExtension", () => {
  it("returns a discovery extension with output and metadata", () => {
    const ext = buildDiscoveryExtension();

    expect(ext.output).toBeDefined();
    expect(ext.output.example).toBeDefined();
    expect(ext.output.schema).toBeDefined();
    expect(ext.metadata).toBeDefined();
  });

  it("includes a sample proof in output.example", () => {
    const ext = buildDiscoveryExtension();
    const sample = ext.output.example;

    expect(sample.proof_id).toBeDefined();
    expect(sample.lemma_version).toBe("v0.1.0");
    expect(sample.cryptographic_envelope).toBeDefined();
    expect(sample.schema_ref).toContain("financial");
  });

  it("includes a valid JSON Schema in output.schema", () => {
    const ext = buildDiscoveryExtension();
    const schema = ext.output.schema;

    expect(schema.$schema).toBe(
      "https://json-schema.org/draft/2020-12/schema",
    );
    expect(schema.type).toBe("object");
    expect(schema.required).toBeInstanceOf(Array);
    expect(schema.required).toContain("proof_id");
    expect(schema.required).toContain("cryptographic_envelope");
  });

  it("includes correct metadata for Bazaar listing", () => {
    const ext = buildDiscoveryExtension();
    const meta = ext.metadata;

    expect(meta.title).toBe("Lemma Proof Issuance");
    expect(meta.description).toContain("Models change. Proofs remain.");
    expect(meta.tags).toContain("verifiable-ai");
    expect(meta.tags).toContain("provenance");
    expect(meta.tags).toContain("attestation");
  });
});
