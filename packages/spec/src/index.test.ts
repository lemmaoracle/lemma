import { describe, expect, it } from "vitest";
import type { RegisterDocumentRequest, SubmitProofRequest } from "./index";

describe("spec types", () => {
  it("accepts a valid RegisterDocumentRequest shape", () => {
    const req: RegisterDocumentRequest = {
      schema: "user-kyc-v1",
      docHash: "0xabc",
      cid: "bafy...",
      issuerId: "issuer-1",
      subjectId: "subject-1",
      commitments: { attrCommitmentRoot: "0xroot", scheme: "poseidon" },
      revocation: { revocationRoot: "0x0", scheme: "bitmask-merkle-v1" },
      signature: { format: "bbs+", payload: "sig", issuerId: "issuer-1" },
    };
    expect(req.schema).toBe("user-kyc-v1");
  });

  it("accepts a valid SubmitProofRequest shape", () => {
    const req: SubmitProofRequest = {
      docHash: "0xabc",
      circuitId: "age-over-18",
      proofBytes: "base64...",
      publicInputs: ["0xroot"],
      verifyOnchain: true,
    };
    expect(req.circuitId).toBe("age-over-18");
  });
});
