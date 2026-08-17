//! Bit-exactness tests against the JS reference implementation.
//!
//! `vectors.json` is generated from poseidon-lite + @lemmaoracle/content by
//! `scripts/generate-test-vectors.mjs`. Every value here MUST match — the
//! commitments are verified against the circomlib Poseidon circuit.

use lemma_transform::binding::{
    args_hash, bind, file_commitment, file_hash, poseidon1, poseidon2, sha256_scalar,
};
use num_bigint::BigUint;

const VECTORS: &str = include_str!("vectors.json");

fn vectors() -> serde_json::Value {
    serde_json::from_str(VECTORS).expect("vectors.json parses")
}

fn big(s: &str) -> BigUint {
    BigUint::parse_bytes(s.as_bytes(), 10).expect("decimal")
}

fn hex_bytes(s: &str) -> Vec<u8> {
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&s[i..i + 2], 16).expect("hex"))
        .collect()
}

#[test]
fn poseidon_matches_poseidon_lite() {
    let v = vectors();
    for case in v["poseidon"].as_array().expect("array") {
        let inputs: Vec<BigUint> = case["inputs"]
            .as_array()
            .expect("inputs")
            .iter()
            .map(|s| big(s.as_str().expect("str")))
            .collect();
        let expected = big(case["out"].as_str().expect("out"));
        let actual = match case["fn"].as_str().expect("fn") {
            "poseidon1" => poseidon1(&inputs[0]),
            "poseidon2" => poseidon2(&inputs[0], &inputs[1]),
            other => panic!("unknown fn {other}"),
        };
        assert_eq!(actual, expected, "poseidon mismatch for {case}");
    }
}

#[test]
fn file_hash_and_commitment_match_content_normalizer() {
    let v = vectors();
    for case in v["files"].as_array().expect("array") {
        let bytes = hex_bytes(case["bytesHex"].as_str().expect("hex"));
        assert_eq!(
            file_hash(&bytes),
            big(case["fileHash"].as_str().expect("fileHash")),
            "fileHash mismatch for {} bytes",
            bytes.len()
        );
        assert_eq!(
            file_commitment(&bytes),
            big(case["fileCommitment"].as_str().expect("fileCommitment")),
            "fileCommitment mismatch for {} bytes",
            bytes.len()
        );
    }
}

#[test]
fn args_hash_matches_js() {
    let v = vectors();
    for case in v["args"].as_array().expect("array") {
        let canonical = case["canonical"].as_str().expect("canonical");
        assert_eq!(
            args_hash(canonical),
            big(case["argsHash"].as_str().expect("argsHash")),
            "argsHash mismatch for {canonical}"
        );
    }
}

#[test]
fn transformer_id_matches_js() {
    let v = vectors();
    let code = v["transformCode"]["codeUtf8"].as_str().expect("code");
    let expected = v["transformCode"]["transformerId"]
        .as_str()
        .expect("transformerId");
    assert_eq!(sha256_scalar(code.as_bytes()), big(expected));
}

/// Acceptance test: reproduce the commitments of the real demo proof
/// (/root/demo-files/proof-result.json). Skips if the demo files are not
/// present on this machine.
#[test]
fn demo_commitments_reproduce() {
    let v = vectors();
    let demo = &v["demo"];
    if demo.is_null() {
        eprintln!("demo vector absent — skipping");
        return;
    }
    let input = match std::fs::read(demo["inputPath"].as_str().expect("path")) {
        Ok(b) => b,
        Err(e) => {
            eprintln!("demo input unreadable ({e}) — skipping");
            return;
        }
    };
    let output = std::fs::read(demo["outputPath"].as_str().expect("path")).expect("demo output");

    assert_eq!(
        input.len() as u64,
        demo["inputByteCount"].as_u64().expect("count")
    );
    assert_eq!(
        output.len() as u64,
        demo["outputByteCount"].as_u64().expect("count")
    );

    let bound: serde_json::Value = serde_json::from_str(&bind(
        &input,
        &output,
        "frame00-demo:derive-reference".as_bytes(),
        r#"{"source":"frame00-demo"}"#,
        "1",
        None,
    ))
    .expect("bind returns JSON");

    let record = &bound["record"];
    assert_eq!(
        record["inputCommitment"].as_str().expect("str"),
        demo["inputCommitment"].as_str().expect("str"),
        "inputCommitment must reproduce the registered demo proof"
    );
    assert_eq!(
        record["outputCommitment"].as_str().expect("str"),
        demo["outputCommitment"].as_str().expect("str"),
        "outputCommitment must reproduce the registered demo proof"
    );
    assert_eq!(
        record["transformerId"].as_str().expect("str"),
        v["transformCode"]["transformerId"].as_str().expect("str"),
    );
    assert_eq!(
        record["argsHash"].as_str().expect("str"),
        v["args"][0]["argsHash"].as_str().expect("str"),
    );
    assert_eq!(
        record["inputByteCount"].as_u64(),
        demo["inputByteCount"].as_u64()
    );
    assert_eq!(
        record["outputByteCount"].as_u64(),
        demo["outputByteCount"].as_u64()
    );
    // genesis: prev = inputCommitment
    assert_eq!(record["prevOutputCommitment"], record["inputCommitment"]);
}

#[test]
fn bind_chained_uses_given_prev() {
    let bound: serde_json::Value = serde_json::from_str(&bind(
        b"input",
        b"output",
        b"code",
        "{}",
        "1",
        Some("12345".to_string()),
    ))
    .expect("bind returns JSON");
    assert_eq!(bound["record"]["prevOutputCommitment"], "12345");
    assert_ne!(bound["record"]["inputCommitment"], "12345");
}
