/**
 * v0.1 mock verifier.
 *
 * Returns the breakdown shape that the real verifier (Phase 2) will produce,
 * driven entirely by the fixture's declared `expectedResult` and
 * `failureMode`. No real cryptography here — Phase 2 will swap this file's
 * contents for `circomlibjs` + `@mattrglobal/bbs-signatures` + `snarkjs`
 * without changing the public shape or the UI.
 */

import type {
  FailureMode,
  ProofBundle,
  Sample,
} from "../data/fixtures";

export type CheckStatus = "pass" | "fail" | "skip";

export interface CheckResult {
  readonly id:
    | "schema"
    | "envelope"
    | "input_commitment"
    | "output_commitment"
    | "policy_compliance"
    | "replay_protection";
  readonly label: string;
  readonly scheme?: string;
  readonly status: CheckStatus;
}

export interface VerificationResult {
  readonly overall: "pass" | "fail";
  readonly durationMs: number;
  readonly checks: ReadonlyArray<CheckResult>;
  readonly failureReason?: string;
}

const FAILURE_LABELS: Readonly<Record<FailureMode, string>> = {
  output_hash_mismatch:
    "Output commitment does not match the value bound at issuance.",
  model_hash_mismatch:
    "Envelope was signed under a different model hash than the one declared.",
  proof_id_replay:
    "This proof_id has already been seen. Replay rejected.",
};

function statusFor(
  checkId: CheckResult["id"],
  failureMode: FailureMode | undefined,
): CheckStatus {
  if (!failureMode) return "pass";
  switch (failureMode) {
    case "output_hash_mismatch":
      return checkId === "output_commitment" ? "fail" : "pass";
    case "model_hash_mismatch":
      return checkId === "envelope" ? "fail" : "pass";
    case "proof_id_replay":
      return checkId === "replay_protection" ? "fail" : "pass";
  }
}

function buildChecks(
  bundle: ProofBundle,
  failureMode: FailureMode | undefined,
): ReadonlyArray<CheckResult> {
  const hasPolicy = Boolean(bundle.policy_compliance);
  return [
    {
      id: "schema",
      label: "Schema validation",
      scheme: bundle.schema_id,
      status: statusFor("schema", failureMode),
    },
    {
      id: "envelope",
      label: "Cryptographic envelope verification",
      scheme: bundle.envelope.scheme,
      status: statusFor("envelope", failureMode),
    },
    {
      id: "input_commitment",
      label: "Input commitment integrity",
      scheme: "Poseidon over BN254",
      status: statusFor("input_commitment", failureMode),
    },
    {
      id: "output_commitment",
      label: "Output commitment integrity",
      scheme: "Poseidon over BN254",
      status: statusFor("output_commitment", failureMode),
    },
    {
      id: "policy_compliance",
      label: "Policy compliance proof",
      scheme: hasPolicy ? "Groth16" : undefined,
      status: hasPolicy
        ? statusFor("policy_compliance", failureMode)
        : "skip",
    },
    {
      id: "replay_protection",
      label: "Replay protection (proof_id de-duplication)",
      status: statusFor("replay_protection", failureMode),
    },
  ];
}

/**
 * Verify a known fixture. Deterministic; produces a small artificial
 * latency so the result panel feels like real verification work happened.
 */
export async function verifySample(
  sample: Sample,
): Promise<VerificationResult> {
  const start = performance.now();
  // Simulate verification work (mock — real Poseidon/BBS+/Groth16 lands in v0.2).
  await new Promise<void>((resolve) => setTimeout(resolve, 180));
  const checks = buildChecks(sample.bundle, sample.failureMode);
  const overall: "pass" | "fail" =
    sample.expectedResult === "pass" ? "pass" : "fail";
  const durationMs = Math.round(performance.now() - start);
  return {
    overall,
    durationMs,
    checks,
    failureReason:
      sample.failureMode !== undefined
        ? FAILURE_LABELS[sample.failureMode]
        : undefined,
  };
}

/**
 * Verify an arbitrary uploaded JSON. v0.1 mock: rejects when the JSON is
 * unparseable or missing required fields, otherwise returns a pass with
 * a `policy_compliance: skip` row when no policy_compliance field is
 * present. Phase 2 swaps this for real cryptographic verification.
 */
export async function verifyCustom(
  raw: string,
): Promise<VerificationResult> {
  const start = performance.now();
  await new Promise<void>((resolve) => setTimeout(resolve, 220));
  const parsed = parseBundle(raw);
  if ("error" in parsed) {
    return {
      overall: "fail",
      durationMs: Math.round(performance.now() - start),
      checks: [
        {
          id: "schema",
          label: "Schema validation",
          status: "fail",
        },
      ],
      failureReason: parsed.error,
    };
  }
  const bundle = parsed.bundle;
  const checks = buildChecks(bundle, undefined);
  return {
    overall: "pass",
    durationMs: Math.round(performance.now() - start),
    checks,
  };
}

type ParseOk = { readonly bundle: ProofBundle };
type ParseErr = { readonly error: string };

function parseBundle(raw: string): ParseOk | ParseErr {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const required = [
      "proof_id",
      "issued_at",
      "schema_id",
      "model_hash",
      "input_commitment",
      "output_commitment",
      "envelope",
    ] as const;
    const missing = required.filter((k) => !(k in data));
    if (missing.length > 0) {
      return {
        error: `Missing required fields: ${missing.join(", ")}.`,
      };
    }
    return { bundle: data as unknown as ProofBundle };
  } catch (e) {
    return {
      error: `Could not parse JSON: ${
        e instanceof Error ? e.message : String(e)
      }`,
    };
  }
}
