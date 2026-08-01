import { describe, it, expect } from "vitest";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import {
  bytesToHex,
  utf8ToBytes,
  concatBytes,
} from "@noble/hashes/utils";
import { poseidon1 } from "poseidon-lite";
import {
  signCommitment,
  verifyCommitment,
  signatureToRandomness,
  generateOrgSecret,
  deriveOrgDid,
  type CommitmentSigner,
  type SignedCommitment,
} from "./signing.js";

const FIELD_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

const COMMITMENT =
  "0x1a2b3c4d5e6f7890abcdef012345678901234567890abcdef012345678901234";

/** Local EIP-191 personal_sign mock — no wallet required. */
const createMockSigner = (): {
  signer: CommitmentSigner;
  address: string;
  privateKey: Uint8Array;
} => {
  const privateKey = secp256k1.utils.randomPrivateKey();
  const pubUncompressed = secp256k1.getPublicKey(privateKey, false);
  const address =
    "0x" +
    bytesToHex(keccak_256(pubUncompressed.slice(1)).slice(-20));

  const provider = {
    request: async (args: {
      method: string;
      params?: readonly unknown[];
    }): Promise<unknown> => {
      if (args.method !== "personal_sign") {
        throw new Error(`Unexpected method: ${args.method}`);
      }
      const [messageHex] = args.params ?? [];
      if (typeof messageHex !== "string") {
        throw new Error("personal_sign requires a hex message");
      }
      // Decode hex-encoded UTF-8 back to the commitment string
      const msgBytes = Uint8Array.from(
        (messageHex.startsWith("0x") ? messageHex.slice(2) : messageHex)
          .match(/.{1,2}/g)!
          .map((b) => parseInt(b, 16)),
      );
      const message = new TextDecoder().decode(msgBytes);
      const prefix = utf8ToBytes(
        `\x19Ethereum Signed Message:\n${msgBytes.length}`,
      );
      const hash = keccak_256(concatBytes(prefix, utf8ToBytes(message)));
      const signed = secp256k1.sign(hash, privateKey);
      const v = 27 + (signed.recovery ?? 0);
      return (
        "0x" +
        bytesToHex(signed.toCompactRawBytes()) +
        v.toString(16).padStart(2, "0")
      );
    },
  };

  return {
    signer: Object.freeze({ provider, address }),
    address,
    privateKey,
  };
};

describe("signatureToRandomness", () => {
  it("returns a 0x-prefixed hex field element", () => {
    const sig =
      "0x" +
      "11".repeat(32) +
      "22".repeat(32) +
      "1b";
    const randomness = signatureToRandomness(sig);
    expect(randomness).toMatch(/^0x[0-9a-f]+$/);
    expect(BigInt(randomness) < FIELD_PRIME).toBe(true);
  });

  it("is deterministic", () => {
    const sig =
      "0x" +
      "aa".repeat(32) +
      "bb".repeat(32) +
      "1c";
    expect(signatureToRandomness(sig)).toBe(signatureToRandomness(sig));
  });

  it("produces different randomness for different signatures", () => {
    const sig1 = "0x" + "11".repeat(65);
    const sig2 = "0x" + "22".repeat(65);
    expect(signatureToRandomness(sig1)).not.toBe(signatureToRandomness(sig2));
  });
});

describe("signCommitment", () => {
  it("returns signature, recovered address, and randomness", async () => {
    const { signer, address } = createMockSigner();
    const signed = await signCommitment(signer, COMMITMENT);

    expect(signed.commitment).toBe(COMMITMENT);
    expect(signed.signature).toMatch(/^0x[0-9a-f]{130}$/);
    expect(signed.recoveredAddress.toLowerCase()).toBe(address.toLowerCase());
    expect(signed.randomness).toBe(signatureToRandomness(signed.signature));
  });

  it("recovered address matches signer", async () => {
    const { signer, address } = createMockSigner();
    const signed = await signCommitment(signer, COMMITMENT);
    expect(signed.recoveredAddress.toLowerCase()).toBe(address.toLowerCase());
  });
});

describe("verifyCommitment", () => {
  it("returns true for a valid signature", async () => {
    const { signer, address } = createMockSigner();
    const signed = await signCommitment(signer, COMMITMENT);
    expect(await verifyCommitment(signed, address)).toBe(true);
  });

  it("returns false for a wrong expected address", async () => {
    const { signer } = createMockSigner();
    const signed = await signCommitment(signer, COMMITMENT);
    expect(
      await verifyCommitment(
        signed,
        "0x0000000000000000000000000000000000000001",
      ),
    ).toBe(false);
  });

  it("returns false when randomness is tampered", async () => {
    const { signer, address } = createMockSigner();
    const signed = await signCommitment(signer, COMMITMENT);
    const tampered: SignedCommitment = Object.freeze({
      ...signed,
      randomness: "0xdeadbeef",
    });
    expect(await verifyCommitment(tampered, address)).toBe(false);
  });

  it("returns false for an invalid signature", async () => {
    const { address } = createMockSigner();
    const bogus: SignedCommitment = Object.freeze({
      commitment: COMMITMENT,
      signature: "0x" + "00".repeat(65),
      recoveredAddress: address,
      randomness: "0x0",
    });
    expect(await verifyCommitment(bogus, address)).toBe(false);
  });
});

describe("generateOrgSecret", () => {
  it("returns a valid 0x-prefixed field element", () => {
    const secret = generateOrgSecret();
    expect(secret).toMatch(/^0x[0-9a-f]+$/);
    expect(BigInt(secret) < FIELD_PRIME).toBe(true);
    expect(BigInt(secret) > 0n).toBe(true);
  });

  it("produces different secrets on each call", () => {
    expect(generateOrgSecret()).not.toBe(generateOrgSecret());
  });
});

describe("deriveOrgDid", () => {
  it("equals Poseidon1(orgSecret)", () => {
    const orgSecret = generateOrgSecret();
    const orgDid = deriveOrgDid(orgSecret);
    expect(orgDid).toBe(`0x${poseidon1([BigInt(orgSecret)]).toString(16)}`);
  });

  it("is deterministic", () => {
    const orgSecret = generateOrgSecret();
    expect(deriveOrgDid(orgSecret)).toBe(deriveOrgDid(orgSecret));
  });
});
