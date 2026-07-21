//! canonical-sort-v1 — Deterministic JSON serialisation for commitments.
//!
//! Produces a canonical byte string from arbitrary JSON so that the same logical
//! data always yields the same commitment, regardless of key ordering or number
//! formatting in the source response.
//!
//! Rules (subset of RFC 8785 / JCS):
//!  1. Object keys sorted by Unicode code point (UTF-8 byte order ≈ code point order).
//!  2. Deep objects: recursively sorted (NOT flattened).
//!  3. Arrays: order preserved (NOT sorted); elements recursively canonicalised.
//!  4. Numbers: shortest round-trip representation matching JS `String(n)`; `-0` → `"0"`.
//!  5. Strings: standard JSON escaping.
//!  6. No whitespace.

use wasm_bindgen::prelude::*;
use serde_json::Value;

// ── string escaping ──────────────────────────────────────────────────────

/// Escape a string for JSON output, matching the TS canonical-sort-v1 rules.
///
/// Escapes: `"`, `\`, `\b`, `\t`, `\n`, `\f`, `\r`, and other control
/// characters (< 0x20) as `\uXXXX`.
fn serialize_string(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('"');
    for ch in s.chars() {
        match ch {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\u{0008}' => out.push_str("\\b"),
            '\u{0009}' => out.push_str("\\t"),
            '\u{000A}' => out.push_str("\\n"),
            '\u{000C}' => out.push_str("\\f"),
            '\u{000D}' => out.push_str("\\r"),
            c if (c as u32) < 0x20 => {
                out.push_str(&format!("\\u{:04x}", c as u32));
            }
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

// ── number serialisation ────────────────────────────────────────────────

/// Serialise a number matching JS `String(n)`:
/// - Integers → plain integer string
/// - `-0` → `"0"`
/// - Floats → shortest round-trip via `ryu`, with trailing `.0` stripped
fn serialize_number(n: &serde_json::Number) -> String {
    if let Some(i) = n.as_i64() {
        return i.to_string();
    }
    if let Some(u) = n.as_u64() {
        return u.to_string();
    }
    // Float path
    let f = match n.as_f64() {
        Some(v) => v,
        None => return "null".to_string(), // shouldn't happen
    };
    if !f.is_finite() {
        // serde_json should not produce non-finite, but guard anyway
        return "null".to_string();
    }
    if f == -0.0 {
        return "0".to_string();
    }
    // ryu produces shortest round-trip representation.
    // For whole-number floats like 1.0, ryu gives "1.0" — strip the ".0"
    // to match JS String(1.0) === "1".
    let mut buf = ryu::Buffer::new();
    let s = buf.format_finite(f);
    if s.ends_with(".0") {
        s[..s.len() - 2].to_string()
    } else {
        s.to_string()
    }
}

// ── recursive canonicalisation ──────────────────────────────────────────

fn canonicalize(value: &Value) -> String {
    match value {
        Value::Null => "null".to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Number(n) => serialize_number(n),
        Value::String(s) => serialize_string(s),
        Value::Array(arr) => {
            let parts: Vec<String> = arr.iter().map(canonicalize).collect();
            format!("[{}]", parts.join(","))
        }
        // serde_json with default features uses BTreeMap, so keys are already
        // sorted by Unicode code point (UTF-8 byte order).
        Value::Object(obj) => {
            let pairs: Vec<String> = obj
                .iter()
                .map(|(k, v)| format!("{}:{}", serialize_string(k), canonicalize(v)))
                .collect();
            format!("{{{}}}", pairs.join(","))
        }
    }
}

// ── WASM entry point ────────────────────────────────────────────────────

/// Entry point called by Lemma SDK's `define()`.
/// Accepts a raw JSON string and returns the canonical-form JSON string.
#[wasm_bindgen]
pub fn normalize(raw_json: &str) -> String {
    match serde_json::from_str::<Value>(raw_json) {
        Ok(value) => canonicalize(&value),
        Err(_) => {
            // Return an error object so callers can detect parse failures
            r#"{"error":"ParseFailed"}"#.to_string()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sorts_object_keys() {
        let input = r#"{"b":2,"a":1}"#;
        assert_eq!(normalize(input), r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn sorts_nested_keys() {
        let input = r#"{"z":{"y":2,"x":1},"a":0}"#;
        assert_eq!(normalize(input), r#"{"a":0,"z":{"x":1,"y":2}}"#);
    }

    #[test]
    fn preserves_array_order() {
        let input = r#"[3,1,2]"#;
        assert_eq!(normalize(input), r#"[3,1,2]"#);
    }

    #[test]
    fn handles_negative_zero() {
        let input = r#"{"v":-0.0}"#;
        assert_eq!(normalize(input), r#"{"v":0}"#);
    }

    #[test]
    fn strips_trailing_zero_from_float() {
        let input = r#"{"v":1.0}"#;
        assert_eq!(normalize(input), r#"{"v":1}"#);
    }

    #[test]
    fn preserves_float_precision() {
        let input = r#"{"rate":162.38}"#;
        assert_eq!(normalize(input), r#"{"rate":162.38}"#);
    }

    #[test]
    fn no_whitespace() {
        let input = r#"{"a": 1, "b": 2}"#;
        assert_eq!(normalize(input), r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn escapes_control_chars() {
        let input = r#"{"k":"a\nb"}"#;
        assert_eq!(normalize(input), r#"{"k":"a\nb"}"#);
    }

    #[test]
    fn handles_null_bool() {
        let input = r#"{"a":null,"b":true,"c":false}"#;
        assert_eq!(normalize(input), r#"{"a":null,"b":true,"c":false}"#);
    }

    #[test]
    fn nested_arrays_in_objects() {
        let input = r#"{"data":[1,[2,3],{"z":1,"a":0}]}"#;
        assert_eq!(
            normalize(input),
            r#"{"data":[1,[2,3],{"a":0,"z":1}]}"#
        );
    }

    #[test]
    fn empty_object_and_array() {
        assert_eq!(normalize("{}"), "{}");
        assert_eq!(normalize("[]"), "[]");
    }

    #[test]
    fn parse_error_returns_error_object() {
        let result = normalize("not json");
        assert!(result.contains("ParseFailed"));
    }
}
