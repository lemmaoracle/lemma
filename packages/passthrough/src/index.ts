/**
 * Passthrough schema for Lemma circuits
 * 
 * This schema simply returns the input data unchanged.
 * Used when a circuit needs a schema reference but no transformation is required.
 * 
 * The actual implementation is in Rust/WASM (src/lib.rs).
 * This TypeScript file provides interface definitions only.
 */

export interface PassthroughInput {
  data: any;
}

export interface PassthroughOutput {
  result: any;
}

/**
 * Passthrough normalization function (TypeScript fallback)
 * @param input Input data
 * @returns Input data unchanged
 */
export function normalize(input: PassthroughInput): PassthroughOutput {
  return {
    result: input.data
  };
}

/**
 * Validate input data (TypeScript fallback)
 * @param input Input data to validate
 * @returns True if input is valid
 */
export function validate(input: PassthroughInput): boolean {
  return input.data !== undefined;
}

export default {
  normalize,
  validate
};