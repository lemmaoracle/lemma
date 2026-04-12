use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize)]
pub struct PassthroughInput {
    #[wasm_bindgen(skip)]
    pub data: JsValue,
}

#[wasm_bindgen]
impl PassthroughInput {
    #[wasm_bindgen(constructor)]
    pub fn new(data: JsValue) -> Self {
        Self { data }
    }
}

#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize)]
pub struct PassthroughOutput {
    #[wasm_bindgen(skip)]
    pub result: JsValue,
}

#[wasm_bindgen]
impl PassthroughOutput {
    #[wasm_bindgen(constructor)]
    pub fn new(result: JsValue) -> Self {
        Self { result }
    }
}

/// Passthrough normalization function
/// Returns input data unchanged
#[wasm_bindgen]
pub fn normalize(input: JsValue) -> Result<JsValue, JsValue> {
    // Simply return the input data unchanged
    // In a real implementation, you might want to validate or clone
    Ok(input)
}

/// Validate input data
/// Returns true if input is valid (has data field)
#[wasm_bindgen]
pub fn validate(input: JsValue) -> Result<bool, JsValue> {
    // Check if input is an object
    if input.is_object() {
        // Try to get "data" property
        let obj = js_sys::Object::from(input);
        let has_data = js_sys::Reflect::has(&obj, &"data".into());
        Ok(has_data.unwrap_or(false))
    } else {
        Ok(false)
    }
}

/// Main entry point for Lemma schema
#[wasm_bindgen]
pub fn process(input: JsValue) -> Result<JsValue, JsValue> {
    // For Lemma compatibility, we need to implement the expected interface
    // This is a simple passthrough that returns the input
    Ok(input)
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_normalize() {
        let input = JsValue::from_str(r#"{"data": "test value"}"#);
        let output = normalize(input.clone()).unwrap();
        assert_eq!(input.as_string(), output.as_string());
    }

    #[wasm_bindgen_test]
    fn test_validate() {
        // Valid input with data field
        let valid_input = JsValue::from_str(r#"{"data": "test"}"#);
        assert_eq!(validate(valid_input).unwrap(), true);

        // Invalid input without data field
        let invalid_input = JsValue::from_str(r#"{"other": "field"}"#);
        assert_eq!(validate(invalid_input).unwrap(), false);
    }
}