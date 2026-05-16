declare module "snarkjs" {
  type Groth16Proof = {
    readonly pi_a: readonly bigint[];
    readonly pi_b: readonly (readonly bigint[])[];
    readonly pi_c: readonly bigint[];
    readonly protocol: string;
    readonly curve: string;
  };

  type FullProveResult = Readonly<{
    proof: Groth16Proof;
    publicSignals: readonly string[];
  }>;

  type Groth16 = {
    readonly fullProve: (
      witness: Readonly<Record<string, unknown>>,
      wasm: Uint8Array | string,
      zkey: Uint8Array | string,
    ) => Promise<FullProveResult>;
    readonly verify: (
      vkey: unknown,
      publicSignals: readonly string[],
      proof: Groth16Proof,
    ) => Promise<boolean>;
    readonly exportSolidityCallData: (
      proof: Groth16Proof,
      publicSignals: readonly string[],
    ) => Promise<string>;
  };

  const groth16: Groth16;

  type Plonk = {
    readonly fullProve: (
      witness: Readonly<Record<string, unknown>>,
      wasm: Uint8Array | string,
      zkey: Uint8Array | string,
    ) => Promise<FullProveResult>;
    readonly verify: (
      vkey: unknown,
      publicSignals: readonly string[],
      proof: unknown,
    ) => Promise<boolean>;
  };

  const plonk: Plonk;

  type ZKey = {
    readonly exportVerificationKey: (
      zkey: Uint8Array | string,
    ) => Promise<unknown>;
  };

  const zkey: ZKey;
}
