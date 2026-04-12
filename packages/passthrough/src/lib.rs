use wasm_bindgen::prelude::*;

/// Passthrough schema for Lemma circuits
/// 
/// This schema implements the required interface for Lemma schemas:
/// - normalize: transforms input data (passthrough in this case)
/// - validate: validates input data structure
/// 
/// The input and output are generic JSON values that Lemma handles.
#[wasm_bindgen]
pub fn normalize(input: JsValue) -> JsValue {
    // Simply return the input unchanged
    input
}

#[wasm_bindgen]
pub fn validate(input: JsValue) -> JsValue {
    // Always return true for passthrough schema
    // In a real implementation, you might validate JSON structure
    JsValue::from_bool(true)
}

/// Lemma schema entry point
/// This is the function that Lemma will call
#[wasm_bindgen]
pub fn process(input: JsValue) -> JsValue {
    // For Lemma, we need to return a structured response
    // Format: { result: normalized_data, valid: boolean }
    let normalized = normalize(input.clone());
    let is_valid = validate(input);
    
    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"result".into(), &normalized).unwrap();
    js_sys::Reflect::set(&obj, &"valid".into(), &is_valid).unwrap();
    
    obj.into()
}