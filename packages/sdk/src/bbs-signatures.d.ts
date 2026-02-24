declare module "@grottonetworking/bbs-signatures" {
  type Generators = Readonly<{
    Q1: { readonly toHex: (compressed: boolean) => string };
    Q2: { readonly toHex: (compressed: boolean) => string };
    H: ReadonlyArray<{ readonly toHex: (compressed: boolean) => string }>;
  }>;

  export const API_ID_BBS_SHAKE: string;
  export const API_ID_BBS_SHA: string;

  export function keyGen(
    key_material: Uint8Array,
    key_info: Uint8Array,
    key_dst?: string,
    api_id?: string,
  ): Promise<Uint8Array>;

  export function publicFromPrivate(privateBytes: Uint8Array): Uint8Array;

  export function sign(
    SK: Uint8Array | bigint,
    PK: Uint8Array,
    header: Uint8Array,
    messages: ReadonlyArray<bigint>,
    generators: Generators,
    api_id: string,
  ): Promise<Uint8Array>;

  export function verify(
    PK: Uint8Array,
    signature: Uint8Array,
    header: Uint8Array,
    messages: ReadonlyArray<bigint>,
    generators: Generators,
    api_id: string,
  ): Promise<boolean>;

  export function proofGen(
    PK: Uint8Array,
    signature: Uint8Array,
    header: Uint8Array,
    ph: Uint8Array,
    messages: ReadonlyArray<bigint>,
    disclosed_indexes: ReadonlyArray<number>,
    generators: Generators,
    api_id: string,
    rand_scalars?: () => ReadonlyArray<bigint>,
  ): Promise<Uint8Array>;

  export function proofVerify(
    PK: Uint8Array,
    proof: Uint8Array,
    header: Uint8Array,
    ph: Uint8Array,
    disclosed_messages: ReadonlyArray<bigint>,
    disclosed_indexes: ReadonlyArray<number>,
    generators: Generators,
    api_id: string,
  ): Promise<boolean>;

  export function numUndisclosed(proofOctets: Uint8Array): number;

  export function messages_to_scalars(
    messages: ReadonlyArray<Uint8Array>,
    api_id?: string,
  ): Promise<ReadonlyArray<bigint>>;

  export function prepareGenerators(
    L: number,
    api_id: string,
  ): Promise<Generators>;

  export function bytesToHex(uint8a: Uint8Array): string;
  export function hexToBytes(hex: string): Uint8Array;
  export function numberToHex(num: bigint, byteLength: number): string;
  export function numberToBytesBE(num: bigint, byteLength: number): Uint8Array;
}
