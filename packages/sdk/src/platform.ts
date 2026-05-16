/**
 * Cross-platform utilities for Node.js and browser environments.
 *
 * Replaces Node-only APIs:
 *   - `node:crypto` → Web Crypto API + @noble/hashes
 *   - `Buffer`      → TextEncoder / TextDecoder / Uint8Array helpers
 *
 * Also provides a Buffer polyfill injection for third-party packages
 * (e.g. @docknetwork/crypto-wasm) that unconditionally reference `Buffer`.
 */

import { sha256 } from "@noble/hashes/sha2";
import { randomBytes as nobleRandomBytes } from "@noble/hashes/utils";
import { Buffer as BufferPolyfill } from "buffer/index.js";

const te = new TextEncoder();
const td = new TextDecoder();

/* ------------------------------------------------------------------ */
/*  Buffer polyfill injection                                          */
/* ------------------------------------------------------------------ */

/**
 * Ensure `globalThis.Buffer` exists for third-party packages that
 * reference it at module-load time (e.g. @docknetwork/crypto-wasm).
 *
 * In Node.js `Buffer` is already a global; in browsers it is not.
 * Call this before any code that depends on `@docknetwork/crypto-wasm`
 * or other Node-oriented packages.
 */
export const ensureBufferPolyfill = (): void => {
  // eslint-disable-next-line functional/no-conditional-statements
  if (typeof globalThis.Buffer === "undefined") {
    // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
    (globalThis as Record<string, unknown>).Buffer = BufferPolyfill;
  }
};

// Auto-inject on import so that any consumer gets the polyfill
// before third-party modules evaluate their top-level code.
ensureBufferPolyfill();

/* ------------------------------------------------------------------ */
/*  Encoding helpers (replace Buffer)                                  */
/* ------------------------------------------------------------------ */

/** Encode a string as UTF-8 Uint8Array. */
export const utf8ToBytes = (str: string): Uint8Array => te.encode(str);

/** Decode UTF-8 bytes to a string. */
export const bytesToUtf8 = (bytes: Uint8Array | ArrayBuffer): string =>
  td.decode(bytes);

/** Encode a hex string (with or without `0x` prefix) to Uint8Array. */
export const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
};

/** Encode Uint8Array to hex string (no `0x` prefix). */
export const bytesToHex = (bytes: Uint8Array): string => {
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += 1) {
    parts.push(bytes[i]!.toString(16).padStart(2, "0"));
  }
  return parts.join("");
};

/** Encode a string to base64 (UTF-8 safe, works in browser and Node). */
export const toBase64 = (source: string): string =>
  typeof Buffer !== "undefined"
    ? Buffer.from(source).toString("base64")
    : btoa(
        encodeURIComponent(source).replace(
          /%([0-9A-F]{2})/g,
          (_match, p1: string) => String.fromCharCode(parseInt(p1, 16)),
        ),
      );

/* ------------------------------------------------------------------ */
/*  Crypto helpers (replace node:crypto)                               */
/* ------------------------------------------------------------------ */

/** SHA-256 hash, returned as Uint8Array. */
export const sha256Bytes = (data: Uint8Array): Uint8Array => sha256(data);

/** SHA-256 hash, returned as hex string (no `0x` prefix). */
export const sha256Hex = (data: Uint8Array): string =>
  bytesToHex(sha256(data));

/** SHA-256 hash of a string, returned as base64. */
export const sha256Base64 = (s: string): string =>
  toBase64(String.fromCharCode(...sha256(te.encode(s))));

/** Cryptographically secure random bytes (32 bytes by default). */
export const randomBytes = (length: number = 32): Uint8Array =>
  nobleRandomBytes(length);

/** Cryptographically secure random bytes as hex string (no `0x` prefix). */
export const randomHex = (length: number = 32): string =>
  bytesToHex(nobleRandomBytes(length));
