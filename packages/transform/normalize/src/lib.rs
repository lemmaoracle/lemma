use serde::{Deserialize, Serialize};
use serde_json;
use wasm_bindgen::prelude::*;

// ── Input type: raw ExecutionRecord ──────────────────────────────────

/// Raw execution record as produced by the transform runner.
/// Fields may arrive as numbers, strings, or mixed types.
/// The normalizer canonicalizes everything to strings (field-element
/// decimal representation) for circuit consumption.
#[derive(Deserialize)]
struct RawExecutionRecord {
    #[serde(default)]
    transformer_id: Option<serde_json::Value>,
    #[serde(default, rename = "transformerId")]
    transformer_id_camel: Option<serde_json::Value>,
    #[serde(default)]
    runtime: Option<serde_json::Value>,
    #[serde(default, rename = "inputCommitment")]
    input_commitment: Option<serde_json::Value>,
    #[serde(default, rename = "outputCommitment")]
    output_commitment: Option<serde_json::Value>,
    #[serde(default, rename = "inputByteCount")]
    input_byte_count: Option<serde_json::Value>,
    #[serde(default, rename = "outputByteCount")]
    output_byte_count: Option<serde_json::Value>,
    #[serde(default, rename = "argsHash")]
    args_hash: Option<serde_json::Value>,
    #[serde(default, rename = "prevOutputCommitment")]
    prev_output_commitment: Option<serde_json::Value>,
}

// ── Normalized output type ───────────────────────────────────────────

/// Canonical ExecutionRecord — all fields are decimal strings
/// (field-element representation for BN254 circuits).
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NormalizedExecutionRecord {
    transformer_id: String,
    runtime: String,
    input_commitment: String,
    output_commitment: String,
    input_byte_count: String,
    output_byte_count: String,
    args_hash: String,
    prev_output_commitment: String,
}

// ── Structured error type ────────────────────────────────────────────

#[derive(Serialize)]
#[serde(tag = "error", content = "message")]
enum NormalizeError {
    ParseFailed(String),
    MissingField(String),
    InvalidType(String),
}

// ── Helpers ──────────────────────────────────────────────────────────

/// Convert a serde_json::Value to a decimal string.
/// - Numbers → decimal string directly
/// - Strings → passed through as-is (already field-element representation)
/// - Null/None → error (required fields must not be null)
fn value_to_decimal_string(
    val: Option<&serde_json::Value>,
    field_name: &str,
) -> Result<String, NormalizeError> {
    match val {
        Some(serde_json::Value::Number(n)) => {
            if n.is_u64() {
                Ok(n.as_u64().unwrap().to_string())
            } else if n.is_i64() {
                Err(NormalizeError::InvalidType(format!(
                    "{} must be a non-negative integer, got {}",
                    field_name, n
                )))
            } else if n.is_f64() {
                Err(NormalizeError::InvalidType(format!(
                    "{} must be an integer, got fractional value",
                    field_name
                )))
            } else {
                Ok(n.to_string())
            }
        }
        Some(serde_json::Value::String(s)) => Ok(s.clone()),
        Some(serde_json::Value::Null) | None => {
            Err(NormalizeError::MissingField(field_name.to_string()))
        }
        Some(other) => Err(NormalizeError::InvalidType(format!(
            "{} must be a number or string, got {}",
            field_name, other
        ))),
    }
}

/// Pick a value from camelCase or snake_case field, preferring camelCase
/// (the canonical wire format from the TS SDK).
fn pick_field<'a>(
    camel: &'a Option<serde_json::Value>,
    snake: &'a Option<serde_json::Value>,
) -> Option<&'a serde_json::Value> {
    camel.as_ref().or(snake.as_ref())
}

// ── Entry point ──────────────────────────────────────────────────────

/// Entry point called by Lemma SDK's `define()`.
/// Must be exported as `normalize` and accept/return JSON strings.
///
/// Input: raw ExecutionRecord JSON (fields may be numbers or strings)
/// Output: canonical ExecutionRecord JSON (all fields as decimal strings)
///
/// The canonical form ensures deterministic field-element representation
/// regardless of how the runner serialized the record (JS number vs string).
#[wasm_bindgen]
pub fn normalize(raw_json: &str) -> String {
    let raw: RawExecutionRecord = match serde_json::from_str(raw_json) {
        Ok(r) => r,
        Err(e) => {
            let err = NormalizeError::ParseFailed(e.to_string());
            return serde_json::to_string(&err)
                .unwrap_or_else(|_| r#"{"error":"SerializeFailed"}"#.to_string());
        }
    };

    let transformer_id = match value_to_decimal_string(
        pick_field(&raw.transformer_id_camel, &raw.transformer_id),
        "transformerId",
    ) {
        Ok(s) => s,
        Err(e) => return serde_json::to_string(&e).unwrap_or_default(),
    };

    let runtime = match value_to_decimal_string(raw.runtime.as_ref(), "runtime") {
        Ok(s) => s,
        Err(e) => return serde_json::to_string(&e).unwrap_or_default(),
    };

    let input_commitment =
        match value_to_decimal_string(raw.input_commitment.as_ref(), "inputCommitment") {
            Ok(s) => s,
            Err(e) => return serde_json::to_string(&e).unwrap_or_default(),
        };

    let output_commitment =
        match value_to_decimal_string(raw.output_commitment.as_ref(), "outputCommitment") {
            Ok(s) => s,
            Err(e) => return serde_json::to_string(&e).unwrap_or_default(),
        };

    let input_byte_count =
        match value_to_decimal_string(raw.input_byte_count.as_ref(), "inputByteCount") {
            Ok(s) => s,
            Err(e) => return serde_json::to_string(&e).unwrap_or_default(),
        };

    let output_byte_count =
        match value_to_decimal_string(raw.output_byte_count.as_ref(), "outputByteCount") {
            Ok(s) => s,
            Err(e) => return serde_json::to_string(&e).unwrap_or_default(),
        };

    let args_hash = match value_to_decimal_string(raw.args_hash.as_ref(), "argsHash") {
        Ok(s) => s,
        Err(e) => return serde_json::to_string(&e).unwrap_or_default(),
    };

    let prev_output_commitment = match value_to_decimal_string(
        raw.prev_output_commitment.as_ref(),
        "prevOutputCommitment",
    ) {
        Ok(s) => s,
        Err(e) => return serde_json::to_string(&e).unwrap_or_default(),
    };

    let normalized = NormalizedExecutionRecord {
        transformer_id,
        runtime,
        input_commitment,
        output_commitment,
        input_byte_count,
        output_byte_count,
        args_hash,
        prev_output_commitment,
    };

    serde_json::to_string(&normalized)
        .unwrap_or_else(|_| r#"{"error":"SerializeFailed"}"#.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalize_accepts_string_fields() {
        let input = r#"{
            "transformerId": "12345",
            "runtime": "1",
            "inputCommitment": "99999",
            "outputCommitment": "88888",
            "inputByteCount": "1024",
            "outputByteCount": "2048",
            "argsHash": "77777",
            "prevOutputCommitment": "99999"
        }"#;
        let result = normalize(input);
        assert!(result.contains("\"transformerId\":\"12345\""));
        assert!(result.contains("\"runtime\":\"1\""));
        assert!(result.contains("\"inputByteCount\":\"1024\""));
    }

    #[test]
    fn normalize_accepts_number_fields() {
        let input = r#"{
            "transformerId": 12345,
            "runtime": 1,
            "inputCommitment": "99999",
            "outputCommitment": "88888",
            "inputByteCount": 1024,
            "outputByteCount": 2048,
            "argsHash": "77777",
            "prevOutputCommitment": "99999"
        }"#;
        let result = normalize(input);
        assert!(result.contains("\"transformerId\":\"12345\""));
        assert!(result.contains("\"runtime\":\"1\""));
        assert!(result.contains("\"inputByteCount\":\"1024\""));
        assert!(result.contains("\"outputByteCount\":\"2048\""));
    }

    #[test]
    fn normalize_rejects_missing_field() {
        let input = r#"{
            "transformerId": "12345",
            "runtime": "1"
        }"#;
        let result = normalize(input);
        assert!(result.contains("MissingField"));
    }

    #[test]
    fn normalize_rejects_negative_number() {
        let input = r#"{
            "transformerId": -1,
            "runtime": "1",
            "inputCommitment": "99999",
            "outputCommitment": "88888",
            "inputByteCount": 1024,
            "outputByteCount": 2048,
            "argsHash": "77777",
            "prevOutputCommitment": "99999"
        }"#;
        let result = normalize(input);
        assert!(result.contains("InvalidType"));
    }

    #[test]
    fn normalize_rejects_fractional_number() {
        let input = r#"{
            "transformerId": "12345",
            "runtime": "1",
            "inputCommitment": "99999",
            "outputCommitment": "88888",
            "inputByteCount": 1024.5,
            "outputByteCount": 2048,
            "argsHash": "77777",
            "prevOutputCommitment": "99999"
        }"#;
        let result = normalize(input);
        assert!(result.contains("InvalidType"));
    }

    #[test]
    fn normalize_handles_genesis_record() {
        let input = r#"{
            "transformerId": "12345",
            "runtime": "1",
            "inputCommitment": "99999",
            "outputCommitment": "88888",
            "inputByteCount": 1024,
            "outputByteCount": 2048,
            "argsHash": "77777",
            "prevOutputCommitment": "99999"
        }"#;
        let result = normalize(input);
        assert!(result.contains("\"prevOutputCommitment\":\"99999\""));
        assert!(result.contains("\"inputCommitment\":\"99999\""));
    }

    #[test]
    fn normalize_handles_chained_record() {
        let input = r#"{
            "transformerId": "67890",
            "runtime": "1",
            "inputCommitment": "88888",
            "outputCommitment": "77777",
            "inputByteCount": 2048,
            "outputByteCount": 4096,
            "argsHash": "66666",
            "prevOutputCommitment": "88888"
        }"#;
        let result = normalize(input);
        assert!(result.contains("\"prevOutputCommitment\":\"88888\""));
    }
}
