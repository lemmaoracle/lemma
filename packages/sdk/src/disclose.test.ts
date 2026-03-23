import { describe, it, expect, beforeAll } from "vitest";
import { create } from "./client.js";
import { initializeWasm } from "@docknetwork/crypto-wasm";
import {
  generateKeyPair,
  sign,
  verify,
  reveal,
  verifyProof,
  toSelectiveDisclosure,
  fromSelectiveDisclosure,
  payloadToMessages,
  messagesToDisclosedMap,
} from "./disclose.js";

describe("disclose", () => {
  // Initialize WASM before running any tests
  beforeAll(async () => {
    await initializeWasm();
  }, 30000);

  const client = create({ apiBase: "http://localhost:8787" });
  const header = new TextEncoder().encode("test-header");

  describe("generateKeyPair", () => {
    it("returns a valid BBS+ key pair", async () => {
      const kp = await generateKeyPair({ keyInfo: header });
      expect(kp.secretKey).toBeInstanceOf(Uint8Array);
      expect(kp.publicKey).toBeInstanceOf(Uint8Array);
      expect(kp.secretKey.length).toBe(32);
      expect(kp.publicKey.length).toBe(96);
    });
  });

  describe("payloadToMessages", () => {
    it("converts an object to sorted key:value messages", () => {
      const msgs = payloadToMessages({ name: "Alice", age: 25, country: "JP" });
      expect(msgs).toEqual(["age:25", "country:JP", "name:Alice"]);
    });

    it("is deterministic regardless of insertion order", () => {
      const a = payloadToMessages({ z: 1, a: 2, m: 3 });
      const b = payloadToMessages({ m: 3, z: 1, a: 2 });
      expect(a).toEqual(b);
    });
  });

  describe("messagesToDisclosedMap", () => {
    it("reconstructs attribute map from messages and indexes", () => {
      const messages = ["age:25", "country:JP", "name:Alice"];
      const result = messagesToDisclosedMap(messages, [0, 2]);
      expect(result).toEqual({ age: "25", name: "Alice" });
    });
  });

  describe("sign + verify", () => {
    it("creates a valid BBS+ signature", async () => {
      const kp = await generateKeyPair({ keyInfo: header });
      const messages = ["age:25", "country:JP", "name:Alice"];

      const output = await sign(client, {
        messages,
        secretKey: kp.secretKey,
        header,
        issuerId: "issuer-1",
      });

      expect(output.signature).toBeInstanceOf(Uint8Array);
      expect(output.signature.length).toBeGreaterThan(0);
      expect(output.messages).toEqual(messages);
      expect(output.issuerId).toBe("issuer-1");
    });

    it("rejects empty messages", async () => {
      const kp = await generateKeyPair({ keyInfo: header });
      await expect(
        sign(client, {
          messages: [],
          secretKey: kp.secretKey,
          header,
          issuerId: "issuer-1",
        }),
      ).rejects.toThrow("messages must not be empty");
    });

    it("signature verifies against the issuer public key", async () => {
      const kp = await generateKeyPair({ keyInfo: header });
      const messages = ["age:25", "country:JP"];

      const output = await sign(client, {
        messages,
        secretKey: kp.secretKey,
        header,
        issuerId: "issuer-1",
      });

      const valid = await verify(client, output);
      expect(valid).toBe(true);
    });
  });

  describe("reveal + verifyProof", () => {
    it("full round-trip: sign -> reveal -> verifyProof", async () => {
      const kp = await generateKeyPair();
      const messages = ["age:25", "country:JP", "name:Alice"];

      const signed = await sign(client, {
        messages,
        secretKey: kp.secretKey,
        header,
        issuerId: "issuer-1",
      });

      const revealed = await reveal(client, {
        signature: signed.signature,
        messages,
        publicKey: signed.publicKey,
        indexes: [0, 2],
        header,
      });

      expect(revealed.messages).toEqual(["age:25", "name:Alice"]);
      expect(revealed.disclosed).toEqual({ age: "25", name: "Alice" });
      expect(revealed.proof).toBeInstanceOf(Uint8Array);
      expect(revealed.proof.length).toBeGreaterThan(0);

      const valid = await verifyProof(client, {
        proof: revealed.proof,
        publicKey: signed.publicKey,
        messages: [...revealed.messages],
        indexes: [...revealed.indexes],
        count: messages.length,
        header,
      });

      expect(valid).toBe(true);
    });

    it("rejects empty indexes", async () => {
      const kp = await generateKeyPair({ keyInfo: header });
      const messages = ["age:25"];

      const signed = await sign(client, {
        messages,
        secretKey: kp.secretKey,
        header,
        issuerId: "issuer-1",
      });

      await expect(
        reveal(client, {
          signature: signed.signature,
          messages,
          publicKey: signed.publicKey,
          indexes: [],
          header,
        }),
      ).rejects.toThrow("indexes must not be empty");
    });

    it("proof verification fails with wrong public key", async () => {
      const kp1 = await generateKeyPair({ keyInfo: header });
      const kp2 = await generateKeyPair({ keyInfo: header });
      const messages = ["age:25", "name:Alice"];

      const signed = await sign(client, {
        messages,
        secretKey: kp1.secretKey,
        header,
        issuerId: "issuer-1",
      });

      const revealed = await reveal(client, {
        signature: signed.signature,
        messages,
        publicKey: signed.publicKey,
        indexes: [0],
        header,
      });

      const valid = await verifyProof(client, {
        proof: revealed.proof,
        publicKey: kp2.publicKey,
        messages: [...revealed.messages],
        indexes: [...revealed.indexes],
        count: messages.length,
        header,
      });

      expect(valid).toBe(false);
    });
  });

  describe("toSelectiveDisclosure", () => {
    it("wraps RevealOutput in spec-compliant format with verification metadata", async () => {
      const kp = await generateKeyPair({ keyInfo: header });
      const messages = ["age:25", "name:Alice"];

      const signed = await sign(client, {
        messages,
        secretKey: kp.secretKey,
        header,
        issuerId: "issuer-1",
      });

      const revealed = await reveal(client, {
        signature: signed.signature,
        messages,
        publicKey: signed.publicKey,
        indexes: [0],
        header,
      });

      const sd = toSelectiveDisclosure(revealed, {
        publicKey: signed.publicKey,
        header,
        count: messages.length,
      });
      expect(sd.format).toBe("bbs+");
      expect(sd.attributes).toEqual(revealed.disclosed);
      expect(typeof sd.proof).toBe("string");
      expect(sd.proof.length).toBeGreaterThan(0);
      expect(typeof sd.publicKey).toBe("string");
      expect(sd.publicKey.length).toBe(192); // 96 bytes = 192 hex chars
      expect(sd.indexes).toEqual([0]);
      expect(sd.count).toBe(2);
      expect(typeof sd.header).toBe("string");
      expect(sd.header.length).toBeGreaterThan(0);
    });
  });

  describe("fromSelectiveDisclosure", () => {
    it("round-trip: toSelectiveDisclosure -> fromSelectiveDisclosure -> verifyProof", async () => {
      const kp = await generateKeyPair();
      const messages = ["age:25", "country:JP", "name:Alice"];

      const signed = await sign(client, {
        messages,
        secretKey: kp.secretKey,
        header,
        issuerId: "issuer-1",
      });

      const revealed = await reveal(client, {
        signature: signed.signature,
        messages,
        publicKey: signed.publicKey,
        indexes: [0, 2],
        header,
      });

      // Serialize to SelectiveDisclosure (as stored in D1)
      const sd = toSelectiveDisclosure(revealed, {
        publicKey: signed.publicKey,
        header,
        count: messages.length,
      });

      // Deserialize back to VerifyProofInput (as a third-party verifier would)
      const verifyInput = fromSelectiveDisclosure(sd);

      // Verify the BBS+ proof using only data from the envelope
      const valid = await verifyProof(client, verifyInput);
      expect(valid).toBe(true);
    });

    it("verification fails when attributes are tampered with", async () => {
      const kp = await generateKeyPair();
      const messages = ["age:25", "name:Alice"];

      const signed = await sign(client, {
        messages,
        secretKey: kp.secretKey,
        header,
        issuerId: "issuer-1",
      });

      const revealed = await reveal(client, {
        signature: signed.signature,
        messages,
        publicKey: signed.publicKey,
        indexes: [0],
        header,
      });

      const sd = toSelectiveDisclosure(revealed, {
        publicKey: signed.publicKey,
        header,
        count: messages.length,
      });

      // Tamper with the disclosed attribute value
      const tampered = { ...sd, attributes: { age: "99" } };
      const verifyInput = fromSelectiveDisclosure(tampered);

      const valid = await verifyProof(client, verifyInput);
      expect(valid).toBe(false);
    });
  });
});
