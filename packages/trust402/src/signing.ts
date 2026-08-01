/**
 * Commitment signing — binds a seller's wallet to a content commitment
 * via EIP-191 personal_sign. The signature becomes the `randomness` field
 * in documents.register, and the `salt` in listing-binding-v2.
 *
 * This creates a chain of trust:
 *   wallet (EIP-1193) → sign(commitment) → randomness → listing-binding-v2 salt
 *   → listingRoot includes orgDid → memberRoot (documents.register) → DNS TXT
 */
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import {
  bytesToHex,
  hexToBytes,
  utf8ToBytes,
  concatBytes,
  randomBytes,
} from "@noble/hashes/utils";
import { poseidon1, poseidon2, poseidon3 } from "poseidon-lite";
import { toScalar } from "@lemmaoracle/sdk";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** BN254 scalar field prime. */
const FIELD_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** EIP-1193 signing provider — reuses the existing Signer pattern from pay-fetch.ts. */
export type CommitmentSigner = Readonly<{
  /** EIP-1193 provider (browser wallet, viem, etc.) */
  provider: Readonly<{
    request: (args: Readonly<{ method: string; params?: readonly unknown[] }>) => Promise<unknown>;
  }>;
  /** Signer's Ethereum address (0x-prefixed). */
  address: string;
}>;

/** Result of signing a commitment. */
export type SignedCommitment = Readonly<{
  /** The original commitment (hex, 0x-prefixed). */
  commitment: string;
  /** EIP-191 personal_sign signature (hex, 0x-prefixed, 65 bytes + v). */
  signature: string;
  /** Signer address recovered from the signature (0x-prefixed). */
  recoveredAddress: string;
  /** Field-element representation of the signature for use as `randomness` in circuits. */
  randomness: string;
}>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const strip0x = (hex: string): string =>
  hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex;

const normalizeHex = (hex: string): string => `0x${strip0x(hex).toLowerCase()}`;

const normalizeAddress = (address: string): string =>
  normalizeHex(address);

/**
 * EIP-191 personal_sign message hash for a UTF-8 string.
 * hash = keccak256("\x19Ethereum Signed Message:\n" || len || message)
 */
const personalSignHash = (message: string): Uint8Array => {
  const msgBytes = utf8ToBytes(message);
  const prefix = utf8ToBytes(
    `\x19Ethereum Signed Message:\n${String(msgBytes.length)}`,
  );
  return keccak_256(concatBytes(prefix, msgBytes));
};

/**
 * Convert an Ethereum (r||s||v) signature to noble recovered format (rec||r||s).
 * Returns null when the signature is not 65 bytes or recovery is out of range.
 */
const toNobleRecoveredSig = (signature: string): Uint8Array | null => {
  const sigBytes = hexToBytes(strip0x(signature));
  const recoveryByte = sigBytes[64];
  const recovery =
    recoveryByte === undefined
      ? undefined
      : recoveryByte >= 27
        ? recoveryByte - 27
        : recoveryByte;
  return sigBytes.length !== 65 || recovery === undefined || recovery > 3
    ? null
    : concatBytes(new Uint8Array([recovery]), sigBytes.slice(0, 64));
};

/**
 * Recover the Ethereum address that produced an EIP-191 personal_sign signature.
 * Rejects when the signature is malformed or recovery fails.
 */
const recoverPersonalSignAddress = (
  message: string,
  signature: string,
): Promise<string> => {
  const nobleSig = toNobleRecoveredSig(signature);
  // recoverPublicKey exists at runtime on secp256k1 but is missing from CurveFn types.
  type SecpRecover = Readonly<{
    recoverPublicKey: (sig: Uint8Array, msg: Uint8Array) => Uint8Array;
    Point: { fromBytes: (bytes: Uint8Array) => { toBytes: (compressed: boolean) => Uint8Array } };
  }>;
  const secp = secp256k1 as unknown as SecpRecover;
  return nobleSig === null
    ? Promise.reject(new Error("Invalid signature length or recovery id"))
    : Promise.resolve(undefined).then((_unit: undefined) => {
        const hash = personalSignHash(message);
        const pubCompressed = secp.recoverPublicKey(nobleSig, hash);
        const uncompressed = secp.Point.fromBytes(pubCompressed).toBytes(false);
        const addrBytes = keccak_256(uncompressed.slice(1)).slice(-20);
        return normalizeHex(bytesToHex(addrBytes));
      });
};

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Convert an EIP-191 signature (65 bytes hex) to a BN254 field element
 * suitable for use as `randomness` in circuits.
 *
 * Splits keccak256(signature) into two 128-bit halves, each well below
 * the BN254 field prime (~254 bit), so no modular reduction bias occurs.
 * Poseidon2 uniformly maps the pair to a single field element.
 */
export const signatureToRandomness = (signature: string): string => {
  const sigBytes = hexToBytes(strip0x(signature));
  const hash = keccak_256(sigBytes); // 32 bytes = 256 bits

  // Split into two 128-bit halves — each < 2^128 << FIELD_PRIME (~2^254),
  // so no modular reduction bias. Poseidon2 uniformly combines them.
  const lo = BigInt(`0x${bytesToHex(hash.slice(0, 16))}`);
  const hi = BigInt(`0x${bytesToHex(hash.slice(16, 32))}`);
  const fieldElement = poseidon2([lo, hi]);
  return `0x${fieldElement.toString(16)}`;
};

/**
 * Sign a commitment using EIP-191 personal_sign.
 *
 * The commitment is signed as a UTF-8 hex string prefixed with the standard
 * "\x19Ethereum Signed Message:\n" prefix. The resulting signature is converted
 * to a BN254 field element (via keccak256 mod FIELD_PRIME) for use as
 * `randomness` in listing-binding-v2 and `commitments.randomness` in
 * documents.register.
 *
 * @param signer - EIP-1193 signer (browser wallet or viem)
 * @param commitment - The content commitment (hex, 0x-prefixed)
 * @returns Signed commitment with signature, recovered address, and field-element randomness
 */
export const signCommitment = async (
  signer: CommitmentSigner,
  commitment: string,
): Promise<SignedCommitment> => {
  // personal_sign params: [hex-encoded UTF-8 message, address]
  // Signing the UTF-8 commitment string so the wallet shows the hash to the user.
  const messageHex = `0x${bytesToHex(utf8ToBytes(commitment))}`;
  const address = normalizeAddress(signer.address);

  const rawSig = await signer.provider.request({
    method: "personal_sign",
    params: [messageHex, address],
  });

  return typeof rawSig !== "string"
    ? Promise.reject(new Error("personal_sign did not return a hex signature"))
    : recoverPersonalSignAddress(commitment, normalizeHex(rawSig)).then(
        (recoveredAddress) =>
          Object.freeze({
            commitment,
            signature: normalizeHex(rawSig),
            recoveredAddress,
            randomness: signatureToRandomness(normalizeHex(rawSig)),
          }),
      );
};

/**
 * Verify a signed commitment off-chain.
 *
 * Uses ecrecover to verify the signature matches the claimed address.
 * This is the off-chain verification path. For on-chain / in-circuit
 * verification, the `randomness` field element is used.
 *
 * @param signed - The signed commitment to verify
 * @param expectedAddress - The address that should have signed
 * @returns true if the signature is valid and matches the expected address
 */
export const verifyCommitmentSignature = (
  signed: SignedCommitment,
  expectedAddress: string,
): Promise<boolean> =>
  recoverPersonalSignAddress(signed.commitment, signed.signature).then(
    (recovered) =>
      recovered === normalizeAddress(expectedAddress) &&
      recovered === normalizeAddress(signed.recoveredAddress) &&
      signatureToRandomness(signed.signature) === signed.randomness,
    (_err: unknown) => false,
  );

/* ------------------------------------------------------------------ */
/*  Org-identity Poseidon keypair + signature                          */
/* ------------------------------------------------------------------ */

/** Parse a hex string (with or without 0x) to bigint. */
const hexToBigInt = (hex: string): bigint =>
  BigInt(hex.startsWith("0x") || hex.startsWith("0X") ? hex : `0x${hex}`);

const bigintToHex = (n: bigint): string => `0x${n.toString(16)}`;

/**
 * Generate a random field element suitable as an org secret key.
 *
 * Uses the bias-free split+Poseidon2 approach from signatureToRandomness:
 * 32 random bytes → two 128-bit halves → Poseidon2 → uniform field element.
 */
export const generateOrgSecret = (): string => {
  const bytes = randomBytes(32);
  const lo = BigInt(`0x${bytesToHex(bytes.slice(0, 16))}`);
  const hi = BigInt(`0x${bytesToHex(bytes.slice(16, 32))}`);
  return bigintToHex(poseidon2([lo, hi]));
};

/**
 * Derive the public key (orgDid) from an org secret key.
 * pk = Poseidon1(secret) — the orgDid is this field element as hex.
 */
export const deriveOrgDid = (orgSecret: string): string =>
  bigintToHex(poseidon1([hexToBigInt(orgSecret)]));

/**
 * Sign a message (memberRoot + domain + timestamp) with an org secret key.
 *
 * Returns (signatureR, signatureS) where:
 *   message = Poseidon3(memberRoot, domain, timestamp)
 *   signatureS = Poseidon3(orgSecret, message, signatureR)
 */
export const signOrgIdentity = (
  params: Readonly<{
    orgSecret: string;
    memberRoot: string;
    domain: string;
    timestamp: number;
  }>,
): Readonly<{ signatureR: string; signatureS: string; message: string }> => {
  const message = poseidon3([
    hexToBigInt(params.memberRoot),
    toScalar(params.domain),
    BigInt(params.timestamp),
  ]);
  const signatureR = generateOrgSecret();
  const signatureS = poseidon3([
    hexToBigInt(params.orgSecret),
    message,
    hexToBigInt(signatureR),
  ]);
  return Object.freeze({
    signatureR,
    signatureS: bigintToHex(signatureS),
    message: bigintToHex(message),
  });
};
