import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { whir } from "./whir-runtime.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// WHIR WASM artifacts produced by each circuit's
// `circuits-whir/scripts/build.sh` (wasm-pack). One generic loader drives all
// four because they share the same prove/verify export signatures. Tests are
// skipped when the artifacts have not been built, so `pnpm test` stays green
// without the Rust/wasm toolchain.
const circuitWasm = (pkg: string, name: string): string =>
  path.resolve(__dirname, `../../${pkg}/circuits-whir/pkg/${name}_bg.wasm`);

type Circuit = Readonly<{
  label: string;
  wasm: string;
  witness: Readonly<Record<string, string>>;
  tamperIndex: number;
  expectedPublicInputs?: ReadonlyArray<string>;
}>;

const circuits: ReadonlyArray<Circuit> = [
  {
    label: "seal-identity-v1-whir",
    wasm: circuitWasm("seal", "seal_identity_whir"),
    witness: { key: "81985529216486895", nonce: "987654321" },
    tamperIndex: 1, // nullifier
  },
  {
    label: "attestation-commitment-v1-whir",
    wasm: circuitWasm("attestation", "attestation_commitment_whir"),
    witness: {
      model: "100",
      token: "200",
      claim: "300",
      output: "400",
      nonce: "500",
      timestampMin: "1700000000",
      timestampMax: "1800000000",
    },
    tamperIndex: 0, // claimedRoot
  },
  {
    label: "role-spend-limit-v1-whir",
    wasm: circuitWasm("roles", "role_spend_limit_whir"),
    witness: {
      credentialCommitment: "111",
      roleHash: "222",
      spendLimit: "50000",
      salt: "333",
      requiredRoleHash: "222",
      maxSpend: "100000",
      nowSec: "1750000000",
    },
    tamperIndex: 0, // requiredRoleHash
  },
  {
    label: "agent-identity-v1-whir",
    wasm: circuitWasm("agent", "agent_identity_whir"),
    witness: {
      identity: "11",
      authority: "22",
      financial: "33",
      lifecycle: "44",
      provenance: "55",
      salt: "66",
      secretKey: "777",
      issuedAt: "1700000000",
      expiresAt: "1800000000",
      revoked: "0",
      nowSec: "1750000000",
    },
    tamperIndex: 1, // issuerPublicKey
  },
];

const bytes = (p: string): Uint8Array => new Uint8Array(fs.readFileSync(p));

// `params` is a DISTINCT artifact from `wasm` — deliberately not a valid wasm
// module. If the runtime ever instantiated `params` as if it were the module,
// `WebAssembly.compile` would throw on these bytes and the tests below would
// fail, so the contract can no longer regress silently.
const PARAMS = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);

circuits.forEach((c) => {
  const built = fs.existsSync(c.wasm);

  describe.skipIf(!built)(`whir-runtime · ${c.label}`, () => {
    it("proves and verifies a valid witness", async () => {
      const w = bytes(c.wasm);
      const { proof, publicInputs } = await whir.prove(c.witness, w, PARAMS);

      expect(proof.length).toBeGreaterThan(0);
      if (c.expectedPublicInputs) {
        expect(publicInputs).toEqual(c.expectedPublicInputs);
      }

      const ok = await whir.verify(w, PARAMS, publicInputs, proof);
      expect(ok).toBe(true);
    }, 60000);

    it("rejects tampered public inputs", async () => {
      const w = bytes(c.wasm);
      const { proof, publicInputs } = await whir.prove(c.witness, w, PARAMS);

      const tampered = publicInputs.map((v, i) =>
        i === c.tamperIndex ? (v === "1" ? "2" : "1") : v,
      );
      const ok = await whir.verify(w, PARAMS, tampered, proof);
      expect(ok).toBe(false);
    }, 60000);
  });

  describe.runIf(!built)(`whir-runtime · ${c.label} (WASM not built)`, () => {
    it("is skipped until the WASM is compiled", () => {
      expect(built).toBe(false);
    });
  });
});
