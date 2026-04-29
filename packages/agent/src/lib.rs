use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json;

// ── Input types ──────────────────────────────────────────────────────

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentIdentity {
    #[serde(rename = "agentId")]
    agent_id: String,
    #[serde(rename = "subjectId")]
    subject_id: String,
    #[serde(rename = "controllerId")]
    controller_id: Option<String>,
    #[serde(rename = "orgId")]
    org_id: Option<String>,
}

#[derive(Deserialize)]
struct Role {
    name: String,
}

#[derive(Deserialize)]
struct Scope {
    name: String,
}

#[derive(Deserialize)]
struct Permission {
    resource: String,
    action: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentAuthority {
    roles: Vec<Role>,
    scopes: Vec<Scope>,
    permissions: Vec<Permission>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentFinancialAuthority {
    #[serde(rename = "spendLimit")]
    spend_limit: Option<f64>,
    currency: Option<String>,
    #[serde(rename = "paymentPolicy")]
    payment_policy: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentLifecycle {
    #[serde(rename = "issuedAt")]
    issued_at: f64,
    #[serde(rename = "expiresAt")]
    expires_at: Option<f64>,
    revoked: Option<bool>,
    #[serde(rename = "revocationRef")]
    revocation_ref: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChainContext {
    #[serde(rename = "chainId")]
    chain_id: Option<f64>,
    network: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentProvenance {
    #[serde(rename = "issuerId")]
    issuer_id: String,
    #[serde(rename = "sourceSystem")]
    source_system: Option<String>,
    #[serde(rename = "generatorId")]
    generator_id: Option<String>,
    #[serde(rename = "chainContext")]
    chain_context: Option<ChainContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentCredentialInput {
    schema: String,
    identity: AgentIdentity,
    authority: AgentAuthority,
    financial: Option<AgentFinancialAuthority>,
    lifecycle: AgentLifecycle,
    provenance: AgentProvenance,
}

// ── Normalized output types ──────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NormalizedIdentity {
    #[serde(rename = "agentId")]
    agent_id: String,
    #[serde(rename = "subjectId")]
    subject_id: String,
    #[serde(rename = "controllerId")]
    controller_id: String,
    #[serde(rename = "orgId")]
    org_id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NormalizedAuthority {
    roles: String,
    scopes: String,
    permissions: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NormalizedFinancial {
    #[serde(rename = "spendLimit")]
    spend_limit: String,
    currency: String,
    #[serde(rename = "paymentPolicy")]
    payment_policy: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NormalizedLifecycle {
    #[serde(rename = "issuedAt")]
    issued_at: String,
    #[serde(rename = "expiresAt")]
    expires_at: String,
    revoked: String,
    #[serde(rename = "revocationRef")]
    revocation_ref: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NormalizedProvenance {
    #[serde(rename = "issuerId")]
    issuer_id: String,
    #[serde(rename = "sourceSystem")]
    source_system: String,
    #[serde(rename = "generatorId")]
    generator_id: String,
    #[serde(rename = "chainId")]
    chain_id: String,
    network: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NormalizedAgentCredential {
    schema: String,
    identity: NormalizedIdentity,
    authority: NormalizedAuthority,
    financial: NormalizedFinancial,
    lifecycle: NormalizedLifecycle,
    provenance: NormalizedProvenance,
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

fn normalize_array_field<T, F>(items: &[T], accessor: F) -> String
where
    F: Fn(&T) -> String,
{
    let mut strings: Vec<String> = items.iter().map(accessor).collect();
    strings.sort();
    strings.dedup();
    strings.join(",")
}

fn normalize_timestamp(ts: f64) -> String {
    // Convert Unix seconds to ISO 8601 in UTC
    // We use a simple approach: compute date parts from epoch
    let total_seconds = ts as i64;
    let days = total_seconds / 86400;
    let remaining = total_seconds % 86400;
    let hours = remaining / 3600;
    let minutes = (remaining % 3600) / 60;
    let seconds = remaining % 60;
    let millis = ((ts - (total_seconds as f64)) * 1000.0) as u32;

    // Julian day to Gregorian conversion
    let (year, month, day) = julian_to_gregorian(days + 2440588);

    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}.{:03}Z",
        year, month, day, hours, minutes, seconds, millis
    )
}

fn julian_to_gregorian(jd: i64) -> (i32, i32, i32) {
    let l = jd + 68569;
    let n = 4 * l / 146097;
    let l = l - (146097 * n + 3) / 4;
    let i = 4000 * (l + 1) / 1461001;
    let l = l - 1461 * i / 4 + 31;
    let j = 80 * l / 2447;
    let day = l - 2447 * j / 80;
    let l = j / 11;
    let month = j + 2 - 12 * l;
    let year = 100 * (n - 49) + i + l;
    (year as i32, month as i32, day as i32)
}

fn normalize_optional_timestamp(ts: &Option<f64>) -> String {
    match ts {
        Some(ref val) => normalize_timestamp(*val),
        None => String::from("none"),
    }
}

fn normalize_spend_limit(limit: &Option<f64>) -> String {
    match limit {
        Some(ref val) => val.to_string(),
        None => String::from("unlimited"),
    }
}

fn normalize_bool(b: &Option<bool>) -> String {
    match b {
        Some(true) => String::from("true"),
        _ => String::from("false"),
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

    let identity = NormalizedIdentity {
        agent_id: canonicalize_string(&cred.identity.agent_id),
        subject_id: canonicalize_string(&cred.identity.subject_id),
        controller_id: canonicalize_optional(&cred.identity.controller_id),
        org_id: canonicalize_optional(&cred.identity.org_id),
    };

    let authority = NormalizedAuthority {
        roles: normalize_array_field(&cred.authority.roles, |r| r.name.clone()),
        scopes: normalize_array_field(&cred.authority.scopes, |s| s.name.clone()),
        permissions: normalize_array_field(&cred.authority.permissions, |p| {
            format!("{}:{}", p.resource, p.action)
        }),
    };

    let fin = cred.financial.unwrap_or(AgentFinancialAuthority {
        spend_limit: None,
        currency: Some(String::from("USD")),
        payment_policy: None,
    });

    let financial = NormalizedFinancial {
        spend_limit: normalize_spend_limit(&fin.spend_limit),
        currency: fin.currency.unwrap_or_else(|| String::from("USD")),
        payment_policy: fin.payment_policy.unwrap_or_default(),
    };

    let lifecycle = NormalizedLifecycle {
        issued_at: normalize_timestamp(cred.lifecycle.issued_at),
        expires_at: normalize_optional_timestamp(&cred.lifecycle.expires_at),
        revoked: normalize_bool(&cred.lifecycle.revoked),
        revocation_ref: cred.lifecycle.revocation_ref.unwrap_or_default(),
    };

    let cc = cred.provenance.chain_context;

    let provenance = NormalizedProvenance {
        issuer_id: canonicalize_string(&cred.provenance.issuer_id),
        source_system: canonicalize_optional(&cred.provenance.source_system),
        generator_id: canonicalize_optional(&cred.provenance.generator_id),
        chain_id: cc.as_ref()
            .and_then(|c| c.chain_id)
            .map(|id| id.to_string())
            .unwrap_or_default(),
        network: cc.as_ref()
            .and_then(|c| c.network.as_ref().cloned())
            .unwrap_or_default(),
    };

    let output = NormalizedAgentCredential {
        schema: cred.schema,
        identity,
        authority,
        financial,
        lifecycle,
        provenance,
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
    if cred.schema != "agent-identity-authority-v1" {
        let err = serde_json::json!({
            "valid": false,
            "error": format!("schema must be \"agent-identity-authority-v1\", got \"{}\"", cred.schema)
        });
        return JsValue::from_str(&err.to_string());
    }

    // Validate identity
    if cred.identity.agent_id.is_empty() {
        let err = serde_json::json!({"valid": false, "error": "identity.agentId must be a non-empty string"});
        return JsValue::from_str(&err.to_string());
    }
    if cred.identity.subject_id.is_empty() {
        let err = serde_json::json!({"valid": false, "error": "identity.subjectId must be a non-empty string"});
        return JsValue::from_str(&err.to_string());
    }

    // Validate lifecycle
    if cred.lifecycle.issued_at < 0.0 || cred.lifecycle.issued_at.fract() != 0.0 {
        let err = serde_json::json!({"valid": false, "error": "lifecycle.issuedAt must be a non-negative integer"});
        return JsValue::from_str(&err.to_string());
    }
    if let Some(ref exp) = cred.lifecycle.expires_at {
        if *exp < 0.0 || exp.fract() != 0.0 {
            let err = serde_json::json!({"valid": false, "error": "lifecycle.expiresAt must be a non-negative integer"});
            return JsValue::from_str(&err.to_string());
        }
        if *exp > 4102444800.0 {
            let err = serde_json::json!({"valid": false, "error": "lifecycle.expiresAt must be ≤ 4102444800"});
            return JsValue::from_str(&err.to_string());
        }
        if *exp < cred.lifecycle.issued_at {
            let err = serde_json::json!({"valid": false, "error": "lifecycle.expiresAt must be ≥ lifecycle.issuedAt"});
            return JsValue::from_str(&err.to_string());
        }
    }

    // Validate provenance
    if cred.provenance.issuer_id.is_empty() {
        let err = serde_json::json!({"valid": false, "error": "provenance.issuerId must be a non-empty string"});
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
