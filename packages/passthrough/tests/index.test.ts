import { describe, it, expect } from 'vitest';
import { normalize, validate } from '../src/index';

describe('Passthrough schema (TypeScript)', () => {
  it('should normalize input unchanged', () => {
    const input = { data: 'test data' };
    const output = normalize(input);
    expect(output.result).toBe('test data');
  });

  it('should handle complex objects', () => {
    const input = { data: { nested: { value: 123 } } };
    const output = normalize(input);
    expect(output.result).toEqual({ nested: { value: 123 } });
  });

  it('should validate input with data', () => {
    expect(validate({ data: 'test' })).toBe(true);
  });

  it('should invalidate input without data', () => {
    expect(validate({} as any)).toBe(false);
  });
});

// Note: WASM tests would require building and loading the WASM module
// This is tested separately in the build process