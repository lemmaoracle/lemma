use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json;

// ── Custom serde deserializers ──────────────────────────────────────

mod strict_u64 {
    use serde::de::{self, Deserialize, Deserializer};
    use serde_json::Value;

    pub fn deserialize<'de, D>(deserializer: D) -> Result<u64, D::Error>
    where
        D: Deserializer<'de>,
    {
        let val = Value::deserialize(deserializer)?;
        val.as_u64().ok_or_else(|| {
            de::Error::custom("expected a non-negative integer")
        })
    }
}

mod strict_optional_u64 {
    use serde::de::{self, Deserialize, Deserializer};
    use serde_json::Value;

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<u64>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let val: Option<Value> = Option::deserialize(deserializer)?;
        match val {
            None => Ok(None),
            Some(v) => v.as_u64().map(Some).ok_or_else(|| {
                de::Error::custom("expected a non-negative integer")
            }),
        }
    }
}

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
    #[serde(rename = "spendLimit", default, deserialize_with = "strict_optional_u64::deserialize")]
    spend_limit: Option<u64>,
    currency: Option<String>,
    #[serde(rename = "paymentPolicy")]
    payment_policy: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentLifecycle {
    #[serde(rename = "issuedAt", deserialize_with = "strict_u64::deserialize")]
    issued_at: u64,
    #[serde(rename = "expiresAt", default, deserialize_with = "strict_optional_u64::deserialize")]
    expires_at: Option<u64>,
    revoked: Option<bool>,
    #[serde(rename = "revocationRef")]
    revocation_ref: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChainContext {
    #[serde(rename = "chainId", default, deserialize_with = "strict_optional_u64::deserialize")]
    chain_id: Option<u64>,
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

fn normalize_timestamp(ts: u64) -> String {
    let total_seconds = ts as i64;
    let days = total_seconds / 86400;
    let remaining = total_seconds % 86400;
    let hours = remaining / 3600;
    let minutes = (remaining % 3600) / 60;
    let seconds = remaining % 60;

    let (year, month, day) = julian_to_gregorian(days + 2440588);

    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}.000Z",
        year, month, day, hours, minutes, seconds
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

fn normalize_optional_timestamp(ts: &Option<u64>) -> String {
    match ts {
        Some(ref val) => normalize_timestamp(*val),
        None => String::from("none"),
    }
}

fn normalize_spend_limit(limit: &Option<u64>) -> String {
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

// ── Structured error types ──────────────────────────────────────────

#[derive(Serialize)]
#[serde(tag = "error")]
enum NormalizeError {
    StringifyFailed,
    ParseFailed(String),
    SerializeFailed(String),
}

#[derive(Serialize)]
#[serde(tag = "error")]
enum ValidationError {
    StringifyFailed,
    ParseFailed(String),
    InvalidSchema(String),
    EmptyAgentId,
    EmptySubjectId,
    EmptyRoles,
    SpendLimitExceeded,
    InvalidCurrency,
    InvalidTimestamp(String),
    EmptyIssuerId,
}

impl ValidationError {
    fn to_js_value(&self) -> JsValue {
        let json = serde_json::to_string(self).unwrap_or_else(|_| {
            r#"{"error":"SerializeFailed"}"#.to_string()
        });
        let obj = js_sys::Object::new();
        js_sys::Reflect::set(&obj, &"valid".into(), &false.into()).unwrap();
        let parsed = js_sys::JSON::parse(&json).unwrap_or_else(|_| {
            js_sys::Object::new().into()
        });
        if let Ok(err_obj) = parsed.dyn_into::<js_sys::Object>() {
            js_sys::Reflect::set(&obj, &"error".into(), &js_sys::Reflect::get(&err_obj, &"error".into()).unwrap_or_else(|_| "unknown".into())).unwrap();
        }
        obj.into()
    }
}

impl NormalizeError {
    fn to_js_value(&self) -> JsValue {
        let json = serde_json::to_string(self).unwrap_or_else(|_| {
            r#"{"error":"SerializeFailed"}"#.to_string()
        });
        JsValue::from_str(&json)
    }
}

// ── Core functions ───────────────────────────────────────────────────

#[wasm_bindgen]
pub fn normalize(input: JsValue) -> JsValue {
    let input_str = match js_sys::JSON::stringify(&input) {
        Ok(s) => s.as_string().unwrap_or_else(|| String::from("{}")),
        Err(_) => {
            return NormalizeError::StringifyFailed.to_js_value();
        }
    };

    let cred: AgentCredentialInput = match serde_json::from_str(&input_str) {
        Ok(c) => c,
        Err(e) => {
            return NormalizeError::ParseFailed(e.to_string()).to_js_value();
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
            return NormalizeError::SerializeFailed(e.to_string()).to_js_value();
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
            return ValidationError::StringifyFailed.to_js_value();
        }
    };

    let cred: AgentCredentialInput = match serde_json::from_str(&input_str) {
        Ok(c) => c,
        Err(e) => {
            return ValidationError::ParseFailed(e.to_string()).to_js_value();
        }
    };

    // Validate schema field
    if cred.schema != "agent-identity-authority-v1" {
        return ValidationError::InvalidSchema(cred.schema).to_js_value();
    }

    // Validate identity
    if cred.identity.agent_id.is_empty() {
        return ValidationError::EmptyAgentId.to_js_value();
    }
    if cred.identity.subject_id.is_empty() {
        return ValidationError::EmptySubjectId.to_js_value();
    }

    // Validate lifecycle (fract/negative checks removed — enforced by u64 deserializer)
    if let Some(ref exp) = cred.lifecycle.expires_at {
        if *exp > 4102444800u64 {
            return ValidationError::InvalidTimestamp("lifecycle.expiresAt must be ≤ 4102444800".to_string()).to_js_value();
        }
        if *exp <= cred.lifecycle.issued_at {
            return ValidationError::InvalidTimestamp("lifecycle.expiresAt must be > lifecycle.issuedAt".to_string()).to_js_value();
        }
    }

    // Validate authority
    if cred.authority.roles.is_empty() {
        return ValidationError::EmptyRoles.to_js_value();
    }

    // Validate financial
    if let Some(ref fin) = cred.financial {
        if let Some(limit) = fin.spend_limit {
            if limit > 1_000_000_000_000u64 {
                return ValidationError::SpendLimitExceeded.to_js_value();
            }
        }
        if let Some(ref currency) = fin.currency {
            if currency.len() != 3 || !currency.chars().all(|c| c.is_ascii_uppercase()) {
                return ValidationError::InvalidCurrency.to_js_value();
            }
        }
    }

    // Validate provenance
    if cred.provenance.issuer_id.is_empty() {
        return ValidationError::EmptyIssuerId.to_js_value();
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

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Deserialize)]
    struct TestRequired {
        #[serde(deserialize_with = "strict_u64::deserialize")]
        value: u64,
    }

    #[derive(Deserialize)]
    struct TestOptional {
        #[serde(default, deserialize_with = "strict_optional_u64::deserialize")]
        value: Option<u64>,
    }

    #[test]
    fn strict_u64_accepts_valid_integer() {
        let data: TestRequired = serde_json::from_str(r#"{"value": 42}"#).unwrap();
        assert_eq!(data.value, 42u64);
    }

    #[test]
    fn strict_u64_rejects_fractional() {
        let result = serde_json::from_str::<TestRequired>(r#"{"value": 1.0}"#);
        assert!(result.is_err());
    }

    #[test]
    fn strict_u64_rejects_negative() {
        let result = serde_json::from_str::<TestRequired>(r#"{"value": -1}"#);
        assert!(result.is_err());
    }

    #[test]
    fn strict_u64_rejects_null() {
        let result = serde_json::from_str::<TestRequired>(r#"{"value": null}"#);
        assert!(result.is_err());
    }

    #[test]
    fn strict_u64_rejects_overflow() {
        let result = serde_json::from_str::<TestRequired>(r#"{"value": 18446744073709551616}"#);
        assert!(result.is_err());
    }

    #[test]
    fn strict_optional_u64_accepts_valid_integer() {
        let data: TestOptional = serde_json::from_str(r#"{"value": 42}"#).unwrap();
        assert_eq!(data.value, Some(42u64));
    }

    #[test]
    fn strict_optional_u64_accepts_absent() {
        let data: TestOptional = serde_json::from_str(r#"{}"#).unwrap();
        assert_eq!(data.value, None);
    }

    #[test]
    fn strict_optional_u64_rejects_fractional() {
        let result = serde_json::from_str::<TestOptional>(r#"{"value": 100.5}"#);
        assert!(result.is_err());
    }

    #[test]
    fn strict_optional_u64_accepts_null_as_none() {
        let data: TestOptional = serde_json::from_str(r#"{"value": null}"#).unwrap();
        assert_eq!(data.value, None);
    }

    #[test]
    fn strict_optional_u64_rejects_negative() {
        let result = serde_json::from_str::<TestOptional>(r#"{"value": -1}"#);
        assert!(result.is_err());
    }

    // ── Integration tests ──────────────────────────────────────────

    fn sample_credential_json() -> &'static str {
        r#"{
            "schema": "agent-identity-authority-v1",
            "identity": {
                "agentId": "agent-1",
                "subjectId": "subject-1"
            },
            "authority": {
                "roles": [{"name": "admin"}],
                "scopes": [],
                "permissions": []
            },
            "lifecycle": {
                "issuedAt": 1714500000,
                "expiresAt": 1717100000
            },
            "provenance": {
                "issuerId": "issuer-1"
            }
        }"#
    }

    #[test]
    fn fractional_spend_limit_rejected_at_deserialization() {
        let json = r#"{
            "schema": "agent-identity-authority-v1",
            "identity": {"agentId": "a", "subjectId": "s"},
            "authority": {"roles": [{"name": "admin"}], "scopes": [], "permissions": []},
            "lifecycle": {"issuedAt": 1714500000},
            "provenance": {"issuerId": "i"},
            "financial": {"spendLimit": 100.5}
        }"#;
        let result = serde_json::from_str::<AgentCredentialInput>(json);
        assert!(result.is_err(), "Expected deserialization failure for fractional spendLimit");
    }

    #[test]
    fn valid_credential_deserializes_with_u64_fields() {
        let cred: AgentCredentialInput = serde_json::from_str(sample_credential_json()).unwrap();
        assert_eq!(cred.lifecycle.issued_at, 1714500000u64);
        assert_eq!(cred.lifecycle.expires_at, Some(1717100000u64));
    }

    #[test]
    fn normalize_produces_deterministic_output() {
        let cred: AgentCredentialInput = serde_json::from_str(sample_credential_json()).unwrap();
        let output1 = normalize_credential(&cred);
        let output2 = normalize_credential(&cred);
        assert_eq!(output1, output2, "Normalized output must be deterministic");
        assert_eq!(output1.as_bytes(), output2.as_bytes(), "Normalized output must be byte-identical across invocations");
    }

    #[test]
    fn normalize_output_matches_expected_format() {
        let cred: AgentCredentialInput = serde_json::from_str(sample_credential_json()).unwrap();
        let output = normalize_credential(&cred);
        let parsed: serde_json::Value = serde_json::from_str(&output).unwrap();
        assert_eq!(parsed["lifecycle"]["issuedAt"], "2024-04-30T18:00:00.000Z");
        assert_eq!(parsed["lifecycle"]["expiresAt"], "2024-05-30T20:13:20.000Z");
        assert_eq!(parsed["financial"]["spendLimit"], "unlimited");
        assert_eq!(parsed["provenance"]["chainId"], "");
    }

    #[test]
    fn spend_limit_normalization_uses_integer_string() {
        let cred: AgentCredentialInput = serde_json::from_str(r#"{
            "schema": "agent-identity-authority-v1",
            "identity": {"agentId": "a", "subjectId": "s"},
            "authority": {"roles": [{"name": "admin"}], "scopes": [], "permissions": []},
            "lifecycle": {"issuedAt": 1714500000},
            "provenance": {"issuerId": "i"},
            "financial": {"spendLimit": 999999999999}
        }"#).unwrap();
        let output = normalize_credential(&cred);
        assert!(output.contains(r#""spendLimit":"999999999999""#), "Spend limit should be plain integer string, got: {}", output);
        assert!(!output.contains("e+") && !output.contains("E+"), "Spend limit must not use scientific notation");
    }

    #[test]
    fn absent_spend_limit_normalizes_to_unlimited() {
        let cred: AgentCredentialInput = serde_json::from_str(sample_credential_json()).unwrap();
        let output = normalize_credential(&cred);
        assert!(output.contains(r#""spendLimit":"unlimited""#), "Absent spend limit should normalize to 'unlimited'");
    }

    #[test]
    fn zero_spend_limit_normalizes_to_zero() {
        let cred: AgentCredentialInput = serde_json::from_str(r#"{
            "schema": "agent-identity-authority-v1",
            "identity": {"agentId": "a", "subjectId": "s"},
            "authority": {"roles": [{"name": "admin"}], "scopes": [], "permissions": []},
            "lifecycle": {"issuedAt": 1714500000},
            "provenance": {"issuerId": "i"},
            "financial": {"spendLimit": 0}
        }"#).unwrap();
        let output = normalize_credential(&cred);
        assert!(output.contains(r#""spendLimit":"0""#), "Zero spend limit should normalize to '0'");
    }

    #[test]
    fn chain_id_normalizes_to_integer_string() {
        let cred: AgentCredentialInput = serde_json::from_str(r#"{
            "schema": "agent-identity-authority-v1",
            "identity": {"agentId": "a", "subjectId": "s"},
            "authority": {"roles": [{"name": "admin"}], "scopes": [], "permissions": []},
            "lifecycle": {"issuedAt": 1714500000},
            "provenance": {"issuerId": "i", "chainContext": {"chainId": 1, "network": "ethereum"}}
        }"#).unwrap();
        let output = normalize_credential(&cred);
        assert!(output.contains(r#""chainId":"1""#), "Chain ID should normalize to '1'");
    }

    #[test]
    fn absent_chain_id_normalizes_to_empty() {
        let cred: AgentCredentialInput = serde_json::from_str(sample_credential_json()).unwrap();
        let output = normalize_credential(&cred);
        assert!(output.contains(r#""chainId":""#), "Absent chain ID should normalize to empty string");
    }

    fn normalize_credential(cred: &AgentCredentialInput) -> String {
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

        let default_fin = AgentFinancialAuthority {
            spend_limit: None,
            currency: Some(String::from("USD")),
            payment_policy: None,
        };
        let fin = cred.financial.as_ref().unwrap_or(&default_fin);

        let financial = NormalizedFinancial {
            spend_limit: normalize_spend_limit(&fin.spend_limit),
            currency: fin.currency.clone().unwrap_or_else(|| String::from("USD")),
            payment_policy: fin.payment_policy.clone().unwrap_or_default(),
        };

        let lifecycle = NormalizedLifecycle {
            issued_at: normalize_timestamp(cred.lifecycle.issued_at),
            expires_at: normalize_optional_timestamp(&cred.lifecycle.expires_at),
            revoked: normalize_bool(&cred.lifecycle.revoked),
            revocation_ref: cred.lifecycle.revocation_ref.clone().unwrap_or_default(),
        };

        let cc = &cred.provenance.chain_context;

        let provenance = NormalizedProvenance {
            issuer_id: canonicalize_string(&cred.provenance.issuer_id),
            source_system: canonicalize_optional(&cred.provenance.source_system),
            generator_id: canonicalize_optional(&cred.provenance.generator_id),
            chain_id: cc.as_ref()
                .and_then(|c| c.chain_id)
                .map(|id| id.to_string())
                .unwrap_or_default(),
            network: cc.as_ref()
                .and_then(|c| c.network.clone())
                .unwrap_or_default(),
        };

        let output = NormalizedAgentCredential {
            schema: cred.schema.clone(),
            identity,
            authority,
            financial,
            lifecycle,
            provenance,
        };

        serde_json::to_string(&output).unwrap()
    }
}
