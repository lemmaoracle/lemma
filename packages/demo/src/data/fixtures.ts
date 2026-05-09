/**
 * Six bundled samples covering three industries × valid/invalid pair.
 *
 * v0.1 — these objects are structurally close to the real proof bundle shape
 * the issuance API will emit, but the cryptographic fields (root hashes,
 * signatures, proof bytes) are illustrative placeholders. Phase 2 will
 * regenerate these from real Poseidon / BBS+ / Groth16 outputs.
 *
 * The mock verifier in `src/lib/verify.ts` reads `expectedResult` and
 * `failureMode` to produce a deterministic breakdown that mirrors the
 * shape real verification will return.
 */

export type Industry = "Financial" | "Manufacturing" | "Agent";
export type ExpectedResult = "pass" | "fail";

export type FailureMode =
  | "output_hash_mismatch"
  | "model_hash_mismatch"
  | "proof_id_replay";

export interface ProofBundle {
  readonly proof_id: string;
  readonly issued_at: string;
  readonly schema_id: string;
  readonly model_hash: string;
  readonly input_commitment: string;
  readonly output_commitment: string;
  readonly envelope: {
    readonly scheme: "BBS+ over BLS12-381" | "Groth16";
    readonly signature: string;
  };
  readonly policy_compliance?: {
    readonly scheme: "Groth16";
    readonly policy_ref: string;
    readonly proof: string;
  };
  readonly payment_proof?: {
    readonly scheme: "x402";
    readonly tx: string;
  };
}

export interface Sample {
  readonly id: string;
  readonly label: string;
  readonly industry: Industry;
  readonly expectedResult: ExpectedResult;
  readonly failureMode?: FailureMode;
  readonly summary: string;
  readonly bundle: ProofBundle;
}

export const SAMPLES: ReadonlyArray<Sample> = [
  {
    id: "financial_valid_approval",
    label: "Loan approval (valid)",
    industry: "Financial",
    expectedResult: "pass",
    summary: "Selective-disclosure approval. All checks pass.",
    bundle: {
      proof_id: "fp-7a2c91d4-0001",
      issued_at: "2026-04-30T07:14:22Z",
      schema_id: "lemma.financial.approval.v0.1",
      model_hash:
        "0x8a3f2c7e9b41d6a5c0f81e94b22d77a3c5e1f9a8b6d4c3e2f17a9b8c5d4e3f12",
      input_commitment:
        "0x1a4c5b6d7e8f9012345678901234567890abcdef1234567890abcdef12345678",
      output_commitment:
        "0xc0ffee0011223344556677889900112233445566778899aabbccddeeff001122",
      envelope: {
        scheme: "BBS+ over BLS12-381",
        signature: "bbs:01ff…a92c",
      },
      policy_compliance: {
        scheme: "Groth16",
        policy_ref: "policy://lemma/financial/approval@v0.1",
        proof: "groth16:abcd…7821",
      },
    },
  },
  {
    id: "financial_tampered_output",
    label: "Loan approval (tampered output)",
    industry: "Financial",
    expectedResult: "fail",
    failureMode: "output_hash_mismatch",
    summary: "Output altered after signing. Hash check rejects.",
    bundle: {
      proof_id: "fp-7a2c91d4-0002",
      issued_at: "2026-04-30T07:14:22Z",
      schema_id: "lemma.financial.approval.v0.1",
      model_hash:
        "0x8a3f2c7e9b41d6a5c0f81e94b22d77a3c5e1f9a8b6d4c3e2f17a9b8c5d4e3f12",
      input_commitment:
        "0x1a4c5b6d7e8f9012345678901234567890abcdef1234567890abcdef12345678",
      output_commitment:
        "0xdeadbeef00000000000000000000000000000000000000000000000000000000",
      envelope: {
        scheme: "BBS+ over BLS12-381",
        signature: "bbs:01ff…a92c",
      },
    },
  },
  {
    id: "manufacturing_valid_process",
    label: "Process compliance (valid)",
    industry: "Manufacturing",
    expectedResult: "pass",
    summary: "Groth16 policy proof against the registered process spec.",
    bundle: {
      proof_id: "fp-91b3c4d5-0010",
      issued_at: "2026-04-30T09:42:55Z",
      schema_id: "lemma.manufacturing.process.v0.1",
      model_hash:
        "0x4f8d2a1c9e7b3d5f0a6c8e2d4f7b1c9a3e6d5f8c2b4a1d7e9f0c3b6a8d2e4f17",
      input_commitment:
        "0x2b5c6d7e8f9012345678901234567890abcdef1234567890abcdef1234567890",
      output_commitment:
        "0xfeedbeef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
      envelope: {
        scheme: "Groth16",
        signature: "groth16:envelope:1234…ab",
      },
      policy_compliance: {
        scheme: "Groth16",
        policy_ref: "policy://lemma/manufacturing/process@v0.1",
        proof: "groth16:proc…3142",
      },
    },
  },
  {
    id: "manufacturing_model_swap",
    label: "Process compliance (model swap)",
    industry: "Manufacturing",
    expectedResult: "fail",
    failureMode: "model_hash_mismatch",
    summary: "Different model substituted post-issuance. Envelope rejects.",
    bundle: {
      proof_id: "fp-91b3c4d5-0011",
      issued_at: "2026-04-30T09:42:55Z",
      schema_id: "lemma.manufacturing.process.v0.1",
      model_hash:
        "0x0000000000000000000000000000000000000000000000000000000000000bad",
      input_commitment:
        "0x2b5c6d7e8f9012345678901234567890abcdef1234567890abcdef1234567890",
      output_commitment:
        "0xfeedbeef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
      envelope: {
        scheme: "Groth16",
        signature: "groth16:envelope:1234…ab",
      },
      policy_compliance: {
        scheme: "Groth16",
        policy_ref: "policy://lemma/manufacturing/process@v0.1",
        proof: "groth16:proc…3142",
      },
    },
  },
  {
    id: "agent_valid_chain_with_x402",
    label: "Agent chain + x402 payment (valid)",
    industry: "Agent",
    expectedResult: "pass",
    summary: "Multi-agent chain with x402 payment_proof attached.",
    bundle: {
      proof_id: "fp-c7e8f9a0-0100",
      issued_at: "2026-04-30T11:08:01Z",
      schema_id: "lemma.agent.chain.v0.1",
      model_hash:
        "0x9c7e2f4d6a8b1c3e5f7a9b0c2d4e6f8a1c3e5f7a9b0c2d4e6f8a1c3e5f7a9b0c",
      input_commitment:
        "0x3c6d7e8f9012345678901234567890abcdef1234567890abcdef12345678901a",
      output_commitment:
        "0xbabe0000111122223333444455556666777788889999aaaabbbbccccddddeeee",
      envelope: {
        scheme: "BBS+ over BLS12-381",
        signature: "bbs:09ad…f45c",
      },
      payment_proof: {
        scheme: "x402",
        tx: "0xpayment:0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3",
      },
    },
  },
  {
    id: "agent_replay_attack",
    label: "Agent chain (replay)",
    industry: "Agent",
    expectedResult: "fail",
    failureMode: "proof_id_replay",
    summary: "Same proof_id replayed across two settlement steps.",
    bundle: {
      // Same proof_id as #5 to demonstrate de-dup at receive time.
      proof_id: "fp-c7e8f9a0-0100",
      issued_at: "2026-04-30T11:08:01Z",
      schema_id: "lemma.agent.chain.v0.1",
      model_hash:
        "0x9c7e2f4d6a8b1c3e5f7a9b0c2d4e6f8a1c3e5f7a9b0c2d4e6f8a1c3e5f7a9b0c",
      input_commitment:
        "0x3c6d7e8f9012345678901234567890abcdef1234567890abcdef12345678901a",
      output_commitment:
        "0xbabe0000111122223333444455556666777788889999aaaabbbbccccddddeeee",
      envelope: {
        scheme: "BBS+ over BLS12-381",
        signature: "bbs:09ad…f45c",
      },
      payment_proof: {
        scheme: "x402",
        tx: "0xpayment:0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3",
      },
    },
  },
];

export function getSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id);
}
