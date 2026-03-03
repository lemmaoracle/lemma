declare module "circomlibjs" {
  type BigNumberish = string | number | bigint;
  
  export interface Poseidon {
    (inputs: ReadonlyArray<BigNumberish>): Uint8Array;
    readonly F: {
      e(value: BigNumberish): any;
      toObject(fieldElement: any): bigint;
      toString(fieldElement: any, radix?: number): string;
      add(a: any, b: any): any;
      sub(a: any, b: any): any;
      mul(a: any, b: any): any;
      square(a: any): any;
      inv(a: any): any;
      neg(a: any): any;
      toRprLE(buffer: Uint8Array, offset: number, fieldElement: any): void;
      fromRprLE(buffer: Uint8Array, offset: number): any;
      zero: any;
      one: any;
    };
  }
  
  export function buildPoseidon(): Promise<Poseidon>;
}