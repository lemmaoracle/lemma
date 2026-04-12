#!/usr/bin/env node
/**
 * Simple version: Register passthrough schema with placeholder WASM hash
 * For testing without building WASM
 */

import { Lemma } from '@lemma/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const LEMMA_API_KEY = process.env.LEMMA_API_KEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

if (!LEMMA_API_KEY) {
  console.error('❌ Missing required environment variable: LEMMA_API_KEY');
  process.exit(1);
}

const lemma = new Lemma({
  apiKey: LEMMA_API_KEY
});

async function registerPassthroughSchema() {
  console.log('🚀 Registering passthrough schema (simple version)...\n');
  
  try {
    // Use a placeholder WASM hash for testing
    // In production, you should build the actual WASM and calculate the real hash
    const wasmHash = '0x93a44bbb96c751218e4c00d479e4c14358122a389acca16205b1e4d0dc5f9476';
    
    console.log('1. Registering passthrough-v1 schema:');
    const schema = {
      schemaId: 'passthrough-v1',
      description: 'Passthrough schema that returns input unchanged',
      wasmHash: wasmHash,
      metadata: {
        type: 'passthrough',
        version: '1.0.0',
        purpose: 'Circuit compatibility when no transformation is needed',
        note: 'This uses a placeholder WASM hash for testing. For production, use the full version.'
      }
    };
    
    const registeredSchema = await lemma.schemas.create(schema);
    console.log('   ✅ Registered: passthrough-v1');
    console.log('   📝 Schema ID:', registeredSchema.schemaId);
    console.log('   🔗 WASM Hash:', registeredSchema.wasmHash);
    
    console.log('\n🎉 Passthrough schema registered successfully!');
    console.log('\n⚠️  Note: This uses a placeholder WASM hash.');
    console.log('   For production use, run: node scripts/register-schema-passthrough.mjs');
    console.log('   That will build the actual WASM and calculate the real hash.');
    
  } catch (error) {
    console.error('❌ Error registering schema:', error.message);
    
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Check if schema already exists
    if (error.message.includes('already exists') || error.message.includes('409')) {
      console.log('\nℹ️  Schema may already be registered. Checking...');
      try {
        const existingSchema = await lemma.schemas.get('passthrough-v1');
        console.log('   ✅ Schema already exists:', existingSchema.schemaId);
        console.log('   🔗 Existing WASM hash:', existingSchema.wasmHash);
        console.log('\n💡 You can reference this existing schema in circuits.');
      } catch (checkError) {
        console.error('   ❌ Schema check failed:', checkError.message);
      }
    }
    
    process.exit(1);
  }
}

// Main execution
registerPassthroughSchema();