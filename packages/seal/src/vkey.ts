/**
 * The groth16 verification key for seal-identity-v1.
 *
 * This is public information — it can only verify proofs, not generate them.
 * Imported as a static JSON module — Vite / Astro will inline it at build
 * time, so no filesystem access is needed at runtime (Cloudflare Workers).
 */

import vkey from "./vkeys/seal-identity-v1.json" with { type: "json" };

export default vkey as Readonly<Record<string, unknown>>;
