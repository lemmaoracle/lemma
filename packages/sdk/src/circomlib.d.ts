declare module "circomlib" {
  export interface Poseidon {
    (inputs: bigint[]): bigint;
    F: {
      toObject: (n: bigint) => bigint;
      fromObject: (n: bigint) => bigint;
      zero: bigint;
      one: bigint;
    };
  }

  export function buildPoseidon(): Promise<Poseidon>;
}
