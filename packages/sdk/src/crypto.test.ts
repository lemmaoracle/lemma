import { describe, it, expect } from "vitest";
import { create } from "./client.js";
import { encrypt, decrypt } from "./crypto.js";
import { secp256k1 } from "@noble/curves/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";

describe("encrypt", () => {
  const client = create({ apiBase: "http://localhost:8787" });

  it("returns docHash starting with 0x and a cid starting with bafkrei", async () => {
    const privKey = secp256k1.utils.randomPrivateKey();
    const holderPubKey = "0x" + bytesToHex(secp256k1.getPublicKey(privKey, true));

    const result = await encrypt(client, {
      payload: { age: 25, country: "JP" },
      holderKey: holderPubKey,
    });

    expect(result.docHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.cid).toMatch(/^bafkrei/);
    expect(result.ciphertext).toBeTruthy();
  });

  it("produces different docHash for different payloads", async () => {
    const privKey = secp256k1.utils.randomPrivateKey();
    const holderPubKey = "0x" + bytesToHex(secp256k1.getPublicKey(privKey, true));

    const a = await encrypt(client, { payload: { x: 1 }, holderKey: holderPubKey });
    const b = await encrypt(client, { payload: { x: 2 }, holderKey: holderPubKey });
    expect(a.docHash).not.toBe(b.docHash);
  });

  it("roundtrip encrypt/decrypt recovers the original payload", async () => {
    const privKey = secp256k1.utils.randomPrivateKey();
    const holderPubKey = "0x" + bytesToHex(secp256k1.getPublicKey(privKey, true));

    const originalPayload = { age: 25, country: "JP", name: "Alice" };

    const result = await encrypt(client, {
      payload: originalPayload,
      holderKey: holderPubKey,
    });

    const decrypted = await decrypt({
      ciphertext: result.ciphertext,
      holderPrivateKey: "0x" + bytesToHex(privKey),
    });

    expect(decrypted.payload).toEqual(originalPayload);
  });

  it("rejects with invalid holderKey format", async () => {
    let error: Error | undefined;
    try {
      await encrypt(client, {
        payload: { x: 1 },
        holderKey: "invalid-key",
      });
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeDefined();
    expect(error?.message).toBe("Invalid secp256k1 public key");
  });

  it("accepts compressed public key without 0x prefix", async () => {
    const privKey = secp256k1.utils.randomPrivateKey();
    const holderPubKey = bytesToHex(secp256k1.getPublicKey(privKey, true));

    const result = await encrypt(client, {
      payload: { x: 1 },
      holderKey: holderPubKey,
    });

    expect(result.docHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.cid).toMatch(/^bafkrei/);
  });
});

describe("decrypt", () => {
  it("decrypts with the same private key that was used for encryption", async () => {
    const privKey = secp256k1.utils.randomPrivateKey();
    const holderPubKey = "0x" + bytesToHex(secp256k1.getPublicKey(privKey, true));

    const originalPayload = { test: "data", number: 42 };

    const client = create({ apiBase: "http://localhost:8787" });
    const result = await encrypt(client, {
      payload: originalPayload,
      holderKey: holderPubKey,
    });

    const decrypted = await decrypt({
      ciphertext: result.ciphertext,
      holderPrivateKey: "0x" + bytesToHex(privKey),
    });

    expect(decrypted.payload).toEqual(originalPayload);
  });

  it("throws error for invalid ciphertext", async () => {
    let error: Error | undefined;
    try {
      await decrypt({
        ciphertext: "invalid-base64",
        holderPrivateKey: "0x" + bytesToHex(secp256k1.utils.randomPrivateKey()),
      });
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeDefined();
  });

  it("throws error for ciphertext that is too short", async () => {
    const shortCiphertext = "AAAAAAAA"; // Too short to contain ephemeralPubKey + nonce + ciphertext

    let error: Error | undefined;
    try {
      await decrypt({
        ciphertext: shortCiphertext,
        holderPrivateKey: "0x" + bytesToHex(secp256k1.utils.randomPrivateKey()),
      });
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeDefined();
    expect(error?.message).toBe("Encrypted document too short");
  });
});
