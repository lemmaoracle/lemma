//! Execution binding — computes the canonical `ExecutionRecord` from raw
//! input/output bytes, the transform code, and canonical args, entirely
//! inside WASM.
//!
//! This binds **input file + transform logic + output file** together:
//!
//!   inputCommitment  = Poseidon1(fileHash(inputBytes))
//!   outputCommitment = Poseidon1(fileHash(outputBytes))
//!   transformerId    = SHA-256(transformCode)          (full 256-bit integer)
//!   argsHash         = Poseidon1(SHA-256(canonicalArgs))
//!
//! `fileHash` is the content-commitment-v1 pipeline: 31-byte big-endian
//! chunks with PKCS7 padding, folded with iterative Poseidon(2). The
//! Poseidon here is bit-identical to circomlib / poseidon-lite (same round
//! constants, MDS matrix, and round counts — see `poseidon_constants.rs`).

use crate::poseidon_constants::{C_T2, C_T3, M_T2, M_T3};
use num_bigint::BigUint;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::sync::OnceLock;
use wasm_bindgen::prelude::*;

// ── BN254 scalar field ───────────────────────────────────────────────

const BN254_PRIME_DEC: &[u8] =
    b"21888242871839275222246405745257275088548364400416034343698204186575808495617";

fn prime() -> &'static BigUint {
    static P: OnceLock<BigUint> = OnceLock::new();
    P.get_or_init(|| BigUint::parse_bytes(BN254_PRIME_DEC, 10).expect("valid prime literal"))
}

// ── Poseidon (circomlib parameters) ──────────────────────────────────

const N_ROUNDS_F: usize = 8;

struct PoseidonParams {
    t: usize,
    n_rounds_p: usize,
    c: Vec<BigUint>,
    m: Vec<Vec<BigUint>>,
}

fn parse(s: &str) -> BigUint {
    BigUint::parse_bytes(s.as_bytes(), 10).expect("valid decimal constant")
}

fn params_t2() -> &'static PoseidonParams {
    static PARAMS: OnceLock<PoseidonParams> = OnceLock::new();
    PARAMS.get_or_init(|| PoseidonParams {
        t: 2,
        n_rounds_p: 56,
        c: C_T2.iter().map(|s| parse(s)).collect(),
        m: M_T2
            .iter()
            .map(|row| row.iter().map(|s| parse(s)).collect())
            .collect(),
    })
}

fn params_t3() -> &'static PoseidonParams {
    static PARAMS: OnceLock<PoseidonParams> = OnceLock::new();
    PARAMS.get_or_init(|| PoseidonParams {
        t: 3,
        n_rounds_p: 57,
        c: C_T3.iter().map(|s| parse(s)).collect(),
        m: M_T3
            .iter()
            .map(|row| row.iter().map(|s| parse(s)).collect())
            .collect(),
    })
}

fn pow5(v: &BigUint, p: &BigUint) -> BigUint {
    v.modpow(&BigUint::from(5u8), p)
}

fn mix(state: &[BigUint], m: &[Vec<BigUint>], p: &BigUint) -> Vec<BigUint> {
    (0..state.len())
        .map(|x| {
            state
                .iter()
                .enumerate()
                .fold(BigUint::from(0u8), |acc, (y, s)| acc + &m[x][y] * s)
                % p
        })
        .collect()
}

/// Poseidon permutation over BN254, identical to poseidon-lite / circomlib:
/// state = [0, ...inputs]; full/partial rounds with x^5 S-box; returns state[0].
fn poseidon(inputs: &[BigUint], params: &PoseidonParams) -> BigUint {
    assert_eq!(inputs.len() + 1, params.t, "input arity must match t - 1");
    let p = prime();
    let t = params.t;
    let mut state: Vec<BigUint> = std::iter::once(BigUint::from(0u8))
        .chain(inputs.iter().map(|i| i % p))
        .collect();
    let half_f = N_ROUNDS_F / 2;
    for x in 0..(N_ROUNDS_F + params.n_rounds_p) {
        for (y, slot) in state.iter_mut().enumerate() {
            let s = (&*slot + &params.c[x * t + y]) % p;
            *slot = if x < half_f || x >= half_f + params.n_rounds_p || y == 0 {
                pow5(&s, p)
            } else {
                s
            };
        }
        state = mix(&state, &params.m, p);
    }
    state.swap_remove(0)
}

/// Poseidon(1) — matches poseidon-lite `poseidon1`.
pub fn poseidon1(input: &BigUint) -> BigUint {
    poseidon(std::slice::from_ref(input), params_t2())
}

/// Poseidon(2) — matches poseidon-lite `poseidon2`.
pub fn poseidon2(a: &BigUint, b: &BigUint) -> BigUint {
    poseidon(&[a.clone(), b.clone()], params_t3())
}

// ── content-commitment-v1 byte → field pipeline ──────────────────────

const CHUNK_SIZE: usize = 31;

/// 31-byte big-endian chunks with PKCS7 padding (mirrors
/// `@lemmaoracle/content` `bytesToFieldElements`). Each chunk is < 2^248,
/// so it fits the BN254 field without reduction. `len % 31 == 0` (including
/// empty input) appends a full block of 31 × 0x1f.
pub fn bytes_to_field_elements(data: &[u8]) -> Vec<BigUint> {
    let pad_len = CHUNK_SIZE - (data.len() % CHUNK_SIZE);
    let padded: Vec<u8> = data
        .iter()
        .copied()
        .chain(std::iter::repeat(pad_len as u8).take(pad_len))
        .collect();
    padded
        .chunks(CHUNK_SIZE)
        .map(BigUint::from_bytes_be)
        .collect()
}

/// Iterative Poseidon(2) left-fold (mirrors `reduceElements`).
pub fn file_hash(data: &[u8]) -> BigUint {
    let elements = bytes_to_field_elements(data);
    let (first, rest) = elements.split_first().expect("padding yields >= 1 chunk");
    rest.iter().fold(first.clone(), |acc, e| poseidon2(&acc, e))
}

/// Poseidon1(fileHash(bytes)) — the public commitment.
pub fn file_commitment(data: &[u8]) -> BigUint {
    poseidon1(&file_hash(data))
}

// ── SHA-256 helpers ──────────────────────────────────────────────────

/// SHA-256 as a big-endian 256-bit integer (NOT reduced mod the prime —
/// matches the JS `sha256Field` / argsHash scalar behaviour).
pub fn sha256_scalar(bytes: &[u8]) -> BigUint {
    BigUint::from_bytes_be(&Sha256::digest(bytes))
}

/// argsHash = Poseidon1(SHA-256(canonicalArgs UTF-8)).
pub fn args_hash(canonical_args: &str) -> BigUint {
    poseidon1(&sha256_scalar(canonical_args.as_bytes()))
}

// ── Bound record output ──────────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct BoundRecord {
    transformer_id: String,
    runtime: String,
    input_commitment: String,
    output_commitment: String,
    input_byte_count: u64,
    output_byte_count: u64,
    args_hash: String,
    prev_output_commitment: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct BoundWitness {
    input_file_hash: String,
    output_file_hash: String,
}

#[derive(Serialize)]
struct Bound {
    record: BoundRecord,
    witness: BoundWitness,
}

// ── Entry point ──────────────────────────────────────────────────────

/// Bind input file + transform logic + output file into the canonical
/// ExecutionRecord. All commitments and the transformer id are computed
/// here, inside WASM — the JS runner only executes the transform and
/// canonicalizes args.
///
/// `prev_output_commitment`: pass the previous stage's outputCommitment,
/// or `None` for a genesis record (prev = inputCommitment, trivially
/// satisfying the circuit's chain-binding constraint).
///
/// Returns `{"record": ExecutionRecord, "witness": {inputFileHash, outputFileHash}}`
/// as a JSON string; all field elements are decimal strings.
#[wasm_bindgen]
pub fn bind(
    input_bytes: &[u8],
    output_bytes: &[u8],
    transform_code: &[u8],
    canonical_args: &str,
    runtime: &str,
    prev_output_commitment: Option<String>,
) -> String {
    let input_file_hash = file_hash(input_bytes);
    let output_file_hash = file_hash(output_bytes);
    let input_commitment = poseidon1(&input_file_hash).to_string();
    let output_commitment = poseidon1(&output_file_hash).to_string();

    let bound = Bound {
        record: BoundRecord {
            transformer_id: sha256_scalar(transform_code).to_string(),
            runtime: runtime.to_string(),
            input_commitment: input_commitment.clone(),
            output_commitment,
            input_byte_count: input_bytes.len() as u64,
            output_byte_count: output_bytes.len() as u64,
            args_hash: args_hash(canonical_args).to_string(),
            prev_output_commitment: prev_output_commitment.unwrap_or(input_commitment),
        },
        witness: BoundWitness {
            input_file_hash: input_file_hash.to_string(),
            output_file_hash: output_file_hash.to_string(),
        },
    };

    serde_json::to_string(&bound).unwrap_or_else(|_| r#"{"error":"SerializeFailed"}"#.to_string())
}
