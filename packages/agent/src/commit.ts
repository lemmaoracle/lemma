/**
 * Sectioned Poseidon commitment for agent-identity.circom.
 *
 * Groups normalized fields into 5 sections (identity, authority, financial,
 * lifecycle, provenance), computes each section hash as
 * `toScalar(JSON.stringify(sectionObj))`, and computes the root as
 * `poseidon([identityHash, authorityHash, financialHash, lifecycleHash,
 * provenanceHash, saltScalar])`.
 *
 * imperative: uses dynamic import and SDK types that eslint's projectService
 * cannot resolve across workspace packages — no functional alternative.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { randomBytes } from "node:crypto";
import * as R from "ramda";
import { poseidon6 } from "poseidon-lite";
import { toScalar } from "@lemmaoracle/sdk";
import type { LemmaClient } from "@lemmaoracle/spec";
import type {
  AgentCredential,
  CommitOutput,
  NormalizedAgentCredential,
  SectionedCommitResult,
} from "./types.js";

// ── Section grouping ────────────────────────────────────────────────────

type SectionKey = "identityHash" | "authorityHash" | "financialHash" | "lifecycleHash" | "provenanceHash";

const SECTION_KEYS: ReadonlyArray<SectionKey> = [
  "identityHash",
  "authorityHash",
  "financialHash",
  "lifecycleHash",
  "provenanceHash",
];

/** Extract a section object for hashing from the normalized credential. */
const extractSection = (
  normalized: NormalizedAgentCredential,
  sectionKey: SectionKey,
): Record<string, unknown> => {
  const sectionMap: Readonly<Record<SectionKey, Record<string, unknown>>> = {
    identityHash: normalized.identity,
    authorityHash: normalized.authority,
    financialHash: normalized.financial,
    lifecycleHash: normalized.lifecycle,
    provenanceHash: normalized.provenance,
  };
  return sectionMap[sectionKey];
};

// ── computeCredentialCommitment ─────────────────────────────────────────

/**
 * Compute the sectioned Poseidon commitment for a normalized credential.
 *
 * Pure function: groups fields into 5 sections, hashes each section via
 * `toScalar(JSON.stringify(sectionObj))`, then computes the root as
 * `poseidon([identityHash, authorityHash, financialHash, lifecycleHash,
 * provenanceHash, saltScalar])`.
 */
export const computeCredentialCommitment = (
  normalized: NormalizedAgentCredential,
  salt?: string,
): SectionedCommitResult => {
  const saltHex = salt ?? randomBytes(32).toString("hex");
  const saltScalar = BigInt(`0x${saltHex}`);

  const sectionHashes = R.reduce(
    (acc: Record<string, string>, key: SectionKey) => {
      const sectionObj = extractSection(normalized, key);
      const hash: { toString: () => string } = toScalar(JSON.stringify(sectionObj));
      return { ...acc, [key]: hash.toString() };
    },
    {} as Record<string, string>,
    SECTION_KEYS,
  );

  const identityHash = BigInt(sectionHashes.identityHash ?? "0");
  const authorityHash = BigInt(sectionHashes.authorityHash ?? "0");
  const financialHash = BigInt(sectionHashes.financialHash ?? "0");
  const lifecycleHash = BigInt(sectionHashes.lifecycleHash ?? "0");
  const provenanceHash = BigInt(sectionHashes.provenanceHash ?? "0");

  const root = poseidon6([
    identityHash,
    authorityHash,
    financialHash,
    lifecycleHash,
    provenanceHash,
    saltScalar,
  ]);

  return {
    root: root.toString(),
    sectionHashes: sectionHashes,
    salt: `0x${saltHex}`,
  };
};

// ── commit ──────────────────────────────────────────────────────────────

/**
 * Normalize a credential via SDK `normalize`, then compute the sectioned
 * Poseidon commitment matching `agent-identity.circom`.
 */
export const commit = async (
  client: LemmaClient,
  credential: AgentCredential,
): Promise<CommitOutput> => {
  const { normalize } = await import("@lemmaoracle/sdk");
  const normalized = await normalize<AgentCredential, NormalizedAgentCredential>(
    client,
    { schema: credential.schema, payload: credential },
  );

  const commitment = computeCredentialCommitment(normalized);

  return {
    normalized,
    root: commitment.root,
    sectionHashes: commitment.sectionHashes,
    salt: commitment.salt,
  };
};
