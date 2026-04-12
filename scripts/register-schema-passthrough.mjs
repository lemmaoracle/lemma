#!/usr/bin/env node
/**
 * Register passthrough schema with Lemma
 */

import { Lemma } from '@lemma/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const LEMMA_API_KEY = process.env.LEMMA_API_KEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

if (!LEMMA_API_KEY || !PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('   Required: LEMMA_API_KEY, PINATA_API_KEY, PINATA_SECRET_API_KEY');
  process.exit(1);
}

const lemma = new Lemma({
  apiKey: LEMMA_API_KEY
});

async function registerPassthroughSchema() {
  console.log('🚀 Registering passthrough schema with Lemma...\n');
  
  try {
    // First, build the passthrough package to generate WASM
    console.log('1. Building passthrough package...');
    // Note: In a real scenario, you would compile to WASM here
    // For now, we'll use a placeholder hash
    
    // 2. Register the schema
    console.log('2. Registering passthrough-v1 schema:');
    const schema = {
      schemaId: 'passthrough-v1',
      description: 'Passthrough schema that returns input unchanged',
      wasmHash: '0x93a44bbb96c751218e4c00d479e4c14358122a389acca16205b1e4d0dc5f9476', // Placeholder
      metadata: {
        type: 'passthrough',
        version: '1.0.0',
        purpose: 'Circuit compatibility when no transformation is needed'
      }
    };
    
    const registeredSchema = await lemma.schemas.create(schema);
    console.log('   ✅ Registered: passthrough-v1');
    console.log('   📝 Schema ID:', registeredSchema.schemaId);
    console.log('   🔗 WASM Hash:', registeredSchema.wasmHash);
    
    console.log('\n🎉 Passthrough schema registered successfully!');
    console.log('\n📋 Usage:');
    console.log('   This schema can be referenced by circuits that need');
    console.log('   a schema but don\'t require data transformation.');
    
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
      } catch (checkError) {
        console.error('   ❌ Schema check failed:', checkError.message);
      }
    }
    
    process.exit(1);
  }
}

registerPassthroughSchema();