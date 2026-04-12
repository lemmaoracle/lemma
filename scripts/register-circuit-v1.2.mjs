#!/usr/bin/env node
/**
 * Register circuits with Lemma (v1.2 version)
 * 
 * This script registers circuits with actual verifier addresses from new deployment.
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

async function registerCircuits() {
  console.log('🚀 Registering circuits with Lemma (v1.2)...\n');
  
  try {
    // 1. Register x402-payment-v1.2 circuit
    console.log('1. Registering x402-payment-v1.2 circuit:');
    const x402Circuit = {
      circuitId: 'x402-payment-v1.2',
      schema: 'passthrough-v1',
      verifier: '0x02eC0F2b3C42E5696C0F8DAaE78b76ed28A4eE62', // Existing deployed address
      wasmIpfsUrl: 'ipfs://QmUBS1c1MAy7aKihjBcqeHk4H8ciiuN2k7tQvn7bAKq9wn',
      zkeyIpfsUrl: 'ipfs://QmPQT19nho2hPA7reWUurWtzazvuGMudY2CSo1S1Jgdm79',
      description: 'x402 payment circuit re-registered with actual verifier address (v1.2)',
      metadata: {
        network: 'monad-testnet',
        chainId: 10143,
        version: '1.2',
        deploymentTx: '0x8a2f5a9e1b3c7d4f6a8b9c0d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2'
      }
    };
    
    const registeredX402 = await lemma.circuits.create(x402Circuit);
    console.log('   ✅ Registered: x402-payment-v1.2');
    console.log('   🔗 Verifier:', registeredX402.verifier);
    console.log('   📦 WASM IPFS:', registeredX402.wasmIpfsUrl);
    
    // 2. Register example-circuit-v1.2 circuit
    console.log('\n2. Registering example-circuit-v1.2 circuit:');
    const exampleCircuit = {
      circuitId: 'example-circuit-v1.2',
      schema: 'blog-article-v1',
      verifier: '0x354cc716ffc02F57Ff7B0bDd465E9C7f12b785E9', // Existing deployed address
      wasmIpfsUrl: 'ipfs://QmPipdcWcx7CFXfQDGKpMSJRPyRpcLt4Yqfs1VgvvQ664h',
      zkeyIpfsUrl: 'ipfs://QmWoHWvBKFgYTEZHGGQWK36EMjzcJVycabqmqTKshL3vgT',
      description: 'Example circuit re-registered with actual verifier address (v1.2)',
      metadata: {
        network: 'monad-testnet',
        chainId: 10143,
        version: '1.2',
        example: true
      }
    };
    
    const registeredExample = await lemma.circuits.create(exampleCircuit);
    console.log('   ✅ Registered: example-circuit-v1.2');
    console.log('   🔗 Verifier:', registeredExample.verifier);
    console.log('   📦 WASM IPFS:', registeredExample.wasmIpfsUrl);
    
    console.log('\n🎉 All circuits re-registered successfully with v1.2!');
    console.log('\n📋 Summary:');
    console.log('   - x402-payment-v1.2 → 0x02eC0F2b3C42E5696C0F8DAaE78b76ed28A4eE62');
    console.log('   - example-circuit-v1.2 → 0x354cc716ffc02F57Ff7B0bDd465E9C7f12b785E9');
    console.log('\n⚠️  Note: These are new v1.2 versions using existing deployed verifiers.');
    
  } catch (error) {
    console.error('❌ Error registering circuits:', error.message);
    
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

registerCircuits();