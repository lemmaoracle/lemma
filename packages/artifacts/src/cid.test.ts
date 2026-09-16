import { describe, expect, it } from "vitest";
import { isIpfsCid } from "./cid.js";

const CID_V0 = "QmbWqxBEKC3P8tqsKc98xmWNzrzztMQ2BXkqL2Ldc8uAtu";
const CID_V1 = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

describe("isIpfsCid", () => {
  it("accepts a 46-char CIDv0", () => {
    expect(CID_V0).toHaveLength(46);
    expect(isIpfsCid(CID_V0)).toBe(true);
  });

  it("accepts a base32 CIDv1", () => {
    expect(isIpfsCid(CID_V1)).toBe(true);
  });

  it("rejects truncated, wrong-alphabet, and non-CID strings", () => {
    expect(isIpfsCid("Qm")).toBe(false);
    expect(isIpfsCid("Qm00000000000000000000000000000000000000000000")).toBe(
      false,
    );
    expect(isIpfsCid(CID_V0.slice(0, 45))).toBe(false);
    expect(isIpfsCid(`x${CID_V0}`)).toBe(false);
    expect(isIpfsCid("bafy")).toBe(false);
    expect(isIpfsCid(CID_V1.toUpperCase())).toBe(false);
    expect(isIpfsCid("https://example.com/ipfs/foo")).toBe(false);
    expect(isIpfsCid("../../etc/passwd")).toBe(false);
    expect(isIpfsCid("")).toBe(false);
  });
});
