use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json;

// ── Input types ──────────────────────────────────────────────────────
// agent-identity-v1: Generic agent identity schema
// Schema ID: "agent-identity-v1"
// Raw document structure for issuer → holder identity credential

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentIdentity {
    // Issuer identity (who signs the identity credential)
    issuer_id: String,
    // Subject/Holder identifier (the agent that holds this identity)
    subject_id: String,
    // Authorization class: "act" (direct action) or "delegate" (delegation authority)
    #[serde(rename = "authorizationClass")]
    authorization_class: Option<String>, // "act" or "delegate"
    // Specific action allowed (e.g., "purchase", "negotiate", "query")
    action: Option<String>,
    // Validity start time (ISO 8601)
    not_before: String,
    // Validity end time (ISO 8601)
    expires_at: String,
    // Optional metadata for future extensions
    metadata: Option<serde_json::Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentCredentialInput {
    schema: String,
    identity: AgentIdentity,
}

// ── Normalized output types ──────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NormalizedIdentity {
    issuer_id: String,
    subject_id: String,
    authorization_class: String, // "act", "delegate", or empty
    action: String, // action string or empty
    not_before: String,
    expires_at: String,
    metadata: String, // JSON string or empty
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NormalizedAgentCredential {
    schema: String,
    identity: NormalizedIdentity,
}

// ── Validation helpers ───────────────────────────────────────────────

fn canonicalize_string(s: &str) -> String {
    if s.starts_with("0x") {
        s.to_lowercase()
    } else {
        s.trim().to_string()
    }
}

fn canonicalize_optional(s: &Option<String>) -> String {
    match s {
        Some(ref val) => canonicalize_string(val.as_str()),
        None => String::new(),
    }
}

fn validate_iso8601(date_str: &str) -> bool {
    // Simple ISO 8601 validation (YYYY-MM-DDTHH:MM:SSZ)
    // Basic format check without regex dependency
    if date_str.len() != 20 {
        return false;
    }
    
    let chars: Vec<char> = date_str.chars().collect();
    // Check format: YYYY-MM-DDTHH:MM:SSZ
    // 01234567890123456789
    // 2026-05-31T23:59:59Z
    
    // Check positions of separators
    if chars[4] != '-' || chars[7] != '-' || chars[10] != 'T' || 
       chars[13] != ':' || chars[16] != ':' || chars[19] != 'Z' {
        return false;
    }
    
    // Check all other characters are digits
    let digit_positions = [0,1,2,3,5,6,8,9,11,12,14,15,17,18];
    for &pos in &digit_positions {
        if !chars[pos].is_ascii_digit() {
            return false;
        }
    }
    
    // Basic month/day validation
    let month_str: String = chars[5..7].iter().collect();
    let month = month_str.parse::<u32>().unwrap_or(0);
    if month < 1 || month > 12 {
        return false;
    }
    
    // Day validation (simplified)
    let day_str: String = chars[8..10].iter().collect();
    let day = day_str.parse::<u32>().unwrap_or(0);
    if day < 1 || day > 31 {
        return false;
    }
    
    // Hour validation
    let hour_str: String = chars[11..13].iter().collect();
    let hour = hour_str.parse::<u32>().unwrap_or(0);
    if hour > 23 {
        return false;
    }
    
    // Minute/second validation
    let minute_str: String = chars[14..16].iter().collect();
    let minute = minute_str.parse::<u32>().unwrap_or(0);
    if minute > 59 {
        return false;
    }
    
    let second_str: String = chars[17..19].iter().collect();
    let second = second_str.parse::<u32>().unwrap_or(0);
    if second > 59 {
        return false;
    }
    
    true
}

fn canonicalize_metadata(value: &Option<serde_json::Value>) -> String {
    match value {
        Some(ref val) => {
            // Serialize to compact JSON string
            match serde_json::to_string(val) {
                Ok(s) => s,
                Err(_) => String::new(),
            }
        }
        None => String::new(),
    }
}

// ── Core functions ───────────────────────────────────────────────────

#[wasm_bindgen]
pub fn normalize(input: JsValue) -> JsValue {
    let input_str = match js_sys::JSON::stringify(&input) {
        Ok(s) => s.as_string().unwrap_or_else(|| String::from("{}")),
        Err(_) => {
            let err = serde_json::json!({"error": "Failed to stringify input"});
            return JsValue::from_str(&err.to_string());
        }
    };

    let cred: AgentCredentialInput = match serde_json::from_str(&input_str) {
        Ok(c) => c,
        Err(e) => {
            let err = serde_json::json!({"error": format!("Failed to parse credential: {}", e)});
            return JsValue::from_str(&err.to_string());
        }
    };

    // Normalize fields
    let identity = NormalizedIdentity {
        issuer_id: canonicalize_string(&cred.identity.issuer_id),
        subject_id: canonicalize_string(&cred.identity.subject_id),
        authorization_class: canonicalize_optional(&cred.identity.authorization_class),
        action: canonicalize_optional(&cred.identity.action),
        not_before: canonicalize_string(&cred.identity.not_before),
        expires_at: canonicalize_string(&cred.identity.expires_at),
        metadata: canonicalize_metadata(&cred.identity.metadata),
    };

    let output = NormalizedAgentCredential {
        schema: cred.schema,
        identity,
    };

    let output_json = match serde_json::to_string(&output) {
        Ok(s) => s,
        Err(e) => {
            let err = serde_json::json!({"error": format!("Failed to serialize output: {}", e)});
            return JsValue::from_str(&err.to_string());
        }
    };

    // Return the normalized JSON as a string; Lemma SDK's define() handles JSON.parse
    JsValue::from_str(&output_json)
}

#[wasm_bindgen]
pub fn validate(input: JsValue) -> JsValue {
    let input_str = match js_sys::JSON::stringify(&input) {
        Ok(s) => s.as_string().unwrap_or_else(|| String::from("{}")),
        Err(_) => {
            let err = serde_json::json!({"valid": false, "error": "Failed to stringify input"});
            return JsValue::from_str(&err.to_string());
        }
    };

    let cred: AgentCredentialInput = match serde_json::from_str(&input_str) {
        Ok(c) => c,
        Err(e) => {
            let err = serde_json::json!({"valid": false, "error": format!("Failed to parse credential: {}", e)});
            return JsValue::from_str(&err.to_string());
        }
    };

    // Validate schema field
    if cred.schema != "agent-identity-v1" {
        let err = serde_json::json!({
            "valid": false,
            "error": format!("schema must be \"agent-identity-v1\", got \"{}\"", cred.schema)
        });
        return JsValue::from_str(&err.to_string());
    }

    // Validate identity fields
    if cred.identity.issuer_id.is_empty() {
        let err = serde_json::json!({"valid": false, "error": "identity.issuer_id must be a non-empty string"});
        return JsValue::from_str(&err.to_string());
    }
    
    if cred.identity.subject_id.is_empty() {
        let err = serde_json::json!({"valid": false, "error": "identity.subject_id must be a non-empty string"});
        return JsValue::from_str(&err.to_string());
    }
    
    // Validate authorization_class if present
    if let Some(ref auth_class) = cred.identity.authorization_class {
        if auth_class != "act" && auth_class != "delegate" {
            let err = serde_json::json!({"valid": false, "error": "identity.authorizationClass must be either \"act\" or \"delegate\" if provided"});
            return JsValue::from_str(&err.to_string());
        }
    }
    
    if cred.identity.not_before.is_empty() {
        let err = serde_json::json!({"valid": false, "error": "identity.not_before must be a non-empty ISO 8601 string"});
        return JsValue::from_str(&err.to_string());
    }
    
    if cred.identity.expires_at.is_empty() {
        let err = serde_json::json!({"valid": false, "error": "identity.expires_at must be a non-empty ISO 8601 string"});
        return JsValue::from_str(&err.to_string());
    }
    
    // Validate timestamps are ISO 8601 format
    if !validate_iso8601(&cred.identity.not_before) {
        let err = serde_json::json!({"valid": false, "error": "identity.not_before must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)"});
        return JsValue::from_str(&err.to_string());
    }
    
    if !validate_iso8601(&cred.identity.expires_at) {
        let err = serde_json::json!({"valid": false, "error": "identity.expires_at must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)"});
        return JsValue::from_str(&err.to_string());
    }
    
    // Validate expires_at > not_before (simple string comparison works for ISO 8601)
    if cred.identity.expires_at <= cred.identity.not_before {
        let err = serde_json::json!({"valid": false, "error": "identity.expires_at must be after identity.not_before"});
        return JsValue::from_str(&err.to_string());
    }

    // All validations passed
    let ok = serde_json::json!({"valid": true});
    JsValue::from_str(&ok.to_string())
}

/// Lemma schema entry point
/// Format: { result: normalized_json_string, valid: bool }
#[wasm_bindgen]
pub fn process(input: JsValue) -> JsValue {
    let normalized = normalize(input.clone());
    let is_valid = validate(input);

    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"result".into(), &normalized).unwrap();
    js_sys::Reflect::set(&obj, &"valid".into(), &is_valid).unwrap();

    obj.into()
}