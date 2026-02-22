/**

* Whitepaper §2.1 — Encrypted Documents and docHash.
* 
* Production: ECDH+HKDF → AES-GCM → SHA3-256(encryptedDoc).
* Local-dev: deterministic placeholder (NOT real encryption).
*/
import { createHash, randomBytes } from "node:crypto";
import type { LemmaClient } from "@lemma/spec";

export type EncryptInput = Readonly<{
  payload: unknown;
  holderKey: string;
}>;

export type EncryptOutput = Readonly<{
  docHash: string;
  cid: string;
  encryptedDocBase64: string;
}>;

const sha256 = (buf: Buffer): Buffer => createHash("sha256").update(buf).digest();
const sha3_256Hex = (buf: Buffer): string => createHash("sha3-256").update(buf).digest("hex");
const utf8 = (s: string): Buffer => Buffer.from(s, "utf8");

export const encrypt = async (
  _client: LemmaClient,
  input: EncryptInput,
): Promise<EncryptOutput> => {
  const nonce = randomBytes(16);
  const material = Buffer.concat([
    utf8(input.holderKey),
    utf8(JSON.stringify(input.payload)),
    nonce,
  ]);
  const encrypted = sha256(material);
  const docHash = `0x${sha3_256Hex(encrypted)}`;
  const cid = `bafy${sha256(encrypted).toString("hex").slice(0, 40)}`;

  return { docHash, cid, encryptedDocBase64: encrypted.toString("base64") };
};
