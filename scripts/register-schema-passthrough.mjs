#!/usr/bin/env node
/**
 * Register passthrough schema with Lemma
 * 
 * This script:
 * 1. Builds the passthrough WASM
 * 2. Calculates the WASM hash
 * 3. Registers the schema with Lemma
 */

import { Lemma } from '@lemma/sdk';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

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

function buildWasm() {
  console.log('1. Building passthrough WASM...');
  
  const passthroughDir = path.join(process.cwd(), 'packages/passthrough');
  
  try {
    // Check if build script exists
    const buildScript = path.join(passthroughDir, 'scripts/build-wasm.sh');
    if (!fs.existsSync(buildScript)) {
      throw new Error(`Build script not found: ${buildScript}`);
    }
    
    // Make script executable
    fs.chmodSync(buildScript, '755');
    
    // Run build script
    execSync(`cd ${passthroughDir} && ./scripts/build-wasm.sh`, {
      stdio: 'inherit',
      encoding: 'utf8'
    });
    
    console.log('   ✅ WASM build complete');
  } catch (error) {
    console.error('   ❌ WASM build failed:', error.message);
    throw error;
  }
}

function calculateWasmHash() {
  console.log('2. Calculating WASM hash...');
  
  const wasmPath = path.join(process.cwd(), 'packages/passthrough/dist/wasm/passthrough.wasm');
  
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`WASM file not found: ${wasmPath}. Run build first.`);
  }
  
  // Read WASM file
  const wasmBuffer = fs.readFileSync(wasmPath);
  
  // Calculate SHA256 hash
  const hash = createHash('sha256');
  hash.update(wasmBuffer);
  const wasmHash = `0x${hash.digest('hex')}`;
  
  console.log('   ✅ WASM hash calculated:', wasmHash);
  console.log('   📊 WASM file size:', wasmBuffer.length, 'bytes');
  
  return wasmHash;
}

async function uploadToIpfs(wasmPath) {
  console.log('3. Uploading WASM to IPFS...');
  
  // Note: In a real implementation, you would upload to Pinata/IPFS here
  // For now, we'll return a placeholder
  console.log('   ⚠️  IPFS upload would happen here with Pinata');
  console.log('   📁 WASM file:', wasmPath);
  
  // Return a placeholder IPFS URL
  return 'ipfs://Qm...'; // Placeholder
}

async function registerPassthroughSchema() {
  console.log('🚀 Registering passthrough schema with Lemma...\n');
  
  try {
    // Step 1: Build WASM
    buildWasm();
    
    // Step 2: Calculate WASM hash
    const wasmHash = calculateWasmHash();
    
    // Step 3: Upload to IPFS (placeholder for now)
    const wasmPath = path.join(process.cwd(), 'packages/passthrough/dist/wasm/passthrough.wasm');
    const ipfsUrl = await uploadToIpfs(wasmPath);
    
    // Step 4: Register the schema
    console.log('4. Registering passthrough-v1 schema:');
    const schema = {
      schemaId: 'passthrough-v1',
      description: 'Passthrough schema that returns input unchanged',
      wasmHash: wasmHash,
      wasmIpfsUrl: ipfsUrl,
      metadata: {
        type: 'passthrough',
        version: '1.0.0',
        purpose: 'Circuit compatibility when no transformation is needed',
        implementation: 'rust-wasm',
        wasmSize: fs.statSync(wasmPath).size
      }
    };
    
    const registeredSchema = await lemma.schemas.create(schema);
    console.log('   ✅ Registered: passthrough-v1');
    console.log('   📝 Schema ID:', registeredSchema.schemaId);
    console.log('   🔗 WASM Hash:', registeredSchema.wasmHash);
    if (registeredSchema.wasmIpfsUrl) {
      console.log('   📦 IPFS URL:', registeredSchema.wasmIpfsUrl);
    }
    
    console.log('\n🎉 Passthrough schema registered successfully!');
    console.log('\n📋 Usage:');
    console.log('   Circuits can now reference schema: passthrough-v1');
    console.log('   Example circuit registration:');
    console.log('   { schema: "passthrough-v1", ... }');
    
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
      } catch (checkError) {
        console.error('   ❌ Schema check failed:', checkError.message);
      }
    }
    
    process.exit(1);
  }
}

// Main execution
registerPassthroughSchema();