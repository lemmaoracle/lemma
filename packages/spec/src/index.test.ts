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
      commitments: { root: "0xroot", scheme: "poseidon" },
      revocation: { root: "0x0", scheme: "bitmask-merkle-v1" },
      signature: { format: "bbs+", payload: "sig", issuerId: "issuer-1" },
    };
    expect(req.schema).toBe("user-kyc-v1");
  });

  it("accepts a valid SubmitProofRequest shape", () => {
    const req: SubmitProofRequest = {
      docHash: "0xabc",
      circuitId: "age-over-18",
      proof: "base64...",
      inputs: ["0xroot"],
      onchain: true,
    };
    expect(req.circuitId).toBe("age-over-18");
  });
});
