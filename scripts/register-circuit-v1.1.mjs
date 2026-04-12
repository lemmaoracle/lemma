#!/usr/bin/env node
/**
 * Register circuits with Lemma (v1.1 version)
 * 
 * This script registers circuits with actual verifier addresses.
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
  console.log('🚀 Registering circuits with Lemma (v1.1)...\n');
  
  try {
    // 1. Register x402-payment-v1.1 circuit
    console.log('1. Registering x402-payment-v1.1 circuit:');
    const x402Circuit = {
      circuitId: 'x402-payment-v1.1',
      schema: 'passthrough-v1',
      verifier: '0x02eC0F2b3C42E5696C0F8DAaE78b76ed28A4eE62', // Actual deployed address
      wasmIpfsUrl: 'ipfs://QmUBS1c1MAy7aKihjBcqeHk4H8ciiuN2k7tQvn7bAKq9wn',
      zkeyIpfsUrl: 'ipfs://QmPQT19nho2hPA7reWUurWtzazvuGMudY2CSo1S1Jgdm79',
      description: 'x402 payment circuit with actual verifier address',
      metadata: {
        network: 'monad-testnet',
        chainId: 10143,
        deploymentTx: '0x...' // TODO: Add actual transaction hash
      }
    };
    
    const registeredX402 = await lemma.circuits.create(x402Circuit);
    console.log('   ✅ Registered: x402-payment-v1.1');
    console.log('   🔗 Verifier:', registeredX402.verifier);
    
    // 2. Register example-circuit-v1.1 circuit
    console.log('\n2. Registering example-circuit-v1.1 circuit:');
    const exampleCircuit = {
      circuitId: 'example-circuit-v1.1',
      schema: 'blog-article-v1',
      verifier: '0x354cc716ffc02F57Ff7B0bDd465E9C7f12b785E9', // Actual deployed address
      wasmIpfsUrl: 'ipfs://QmPipdcWcx7CFXfQDGKpMSJRPyRpcLt4Yqfs1VgvvQ664h',
      zkeyIpfsUrl: 'ipfs://QmWoHWvBKFgYTEZHGGQWK36EMjzcJVycabqmqTKshL3vgT',
      description: 'Example circuit with actual verifier address',
      metadata: {
        network: 'monad-testnet',
        chainId: 10143,
        example: true
      }
    };
    
    const registeredExample = await lemma.circuits.create(exampleCircuit);
    console.log('   ✅ Registered: example-circuit-v1.1');
    console.log('   🔗 Verifier:', registeredExample.verifier);
    
    console.log('\n🎉 All circuits registered successfully!');
    console.log('\n📋 Summary:');
    console.log('   - x402-payment-v1.1 → 0x02eC0F2b3C42E5696C0F8DAaE78b76ed28A4eE62');
    console.log('   - example-circuit-v1.1 → 0x354cc716ffc02F57Ff7B0bDd465E9C7f12b785E9');
    console.log('\n⚠️  Note: These replace v1 versions with placeholder verifiers.');
    
  } catch (error) {
    console.error('❌ Error registering circuits:', error.message);
    
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

registerCircuits();