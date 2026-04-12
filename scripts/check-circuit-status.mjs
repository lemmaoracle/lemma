#!/usr/bin/env node
/**
 * Check status of circuits registered with Lemma
 */

import { Lemma } from '@lemma/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const LEMMA_API_KEY = process.env.LEMMA_API_KEY;

if (!LEMMA_API_KEY) {
  console.error('❌ LEMMA_API_KEY is not set in environment variables');
  process.exit(1);
}

const lemma = new Lemma({
  apiKey: LEMMA_API_KEY
});

async function checkCircuitStatus() {
  console.log('🔍 Checking circuit status on Lemma...\n');
  
  try {
    // Check passthrough schema
    console.log('1. Checking passthrough-v1 schema:');
    try {
      const schema = await lemma.schemas.get('passthrough-v1');
      console.log('   ✅ Found: passthrough-v1');
      console.log('   📝 WASM Hash:', schema.wasmHash);
      console.log('   🔗 IPFS:', schema.wasmIpfsUrl || 'Not set');
    } catch (error) {
      console.log('   ❌ Not found or error:', error.message);
    }
    
    console.log('\n2. Checking x402-payment-v1.1 circuit:');
    try {
      const circuit = await lemma.circuits.get('x402-payment-v1.1');
      console.log('   ✅ Found: x402-payment-v1.1');
      console.log('   📝 Schema:', circuit.schema);
      console.log('   🔗 Verifier:', circuit.verifier || 'Not set');
      console.log('   📦 WASM IPFS:', circuit.wasmIpfsUrl || 'Not set');
      console.log('   🔑 zKey IPFS:', circuit.zkeyIpfsUrl || 'Not set');
    } catch (error) {
      console.log('   ❌ Not found or error:', error.message);
    }
    
    console.log('\n3. Checking example-circuit-v1.1 circuit:');
    try {
      const circuit = await lemma.circuits.get('example-circuit-v1.1');
      console.log('   ✅ Found: example-circuit-v1.1');
      console.log('   📝 Schema:', circuit.schema);
      console.log('   🔗 Verifier:', circuit.verifier || 'Not set');
      console.log('   📦 WASM IPFS:', circuit.wasmIpfsUrl || 'Not set');
      console.log('   🔑 zKey IPFS:', circuit.zkeyIpfsUrl || 'Not set');
    } catch (error) {
      console.log('   ❌ Not found or error:', error.message);
    }
    
    console.log('\n📊 Summary:');
    console.log('   ✅ passthrough-v1 schema should be registered');
    console.log('   ✅ x402-payment-v1.1 circuit should have verifier: 0x02eC0F2b3C42E5696C0F8DAaE78b76ed28A4eE62');
    console.log('   ✅ example-circuit-v1.1 circuit should have verifier: 0x354cc716ffc02F57Ff7B0bDd465E9C7f12b785E9');
    
  } catch (error) {
    console.error('❌ Error checking circuit status:', error.message);
    process.exit(1);
  }
}

checkCircuitStatus();