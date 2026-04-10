#!/usr/bin/env node
/**
 * Combined test script that runs both TypeScript tests and circuit tests
 * Usage: node scripts/test-with-circuit.mjs
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

// Check if build files exist
function checkBuildFiles() {
  const requiredFiles = [
    'build/payment_js/payment.wasm',
    'build/payment_final.zkey',
    'build/verification_key.json'
  ];
  
  const missingFiles = requiredFiles.filter(file => !existsSync(resolve(ROOT_DIR, file)));
  return missingFiles;
}

// Helper function to run commands
function runCommand(command, args = [], cwd = ROOT_DIR) {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  console.log('=== Running X402 Package Tests ===\n');
  
  try {
    // 1. Run TypeScript tests (direct vitest execution)
    console.log('1. Running TypeScript tests with Vitest...');
    await runCommand('npx', ['vitest', 'run']);
    
    // 2. Check circuit build files
    console.log('\n2. Checking circuit build files...');
    const missingFiles = checkBuildFiles();
    
    if (missingFiles.length > 0) {
      console.log('⚠️  Circuit build files missing. Building circuit...');
      await runCommand('npm', ['run', 'build:circuit']);
    } else {
      console.log('✅ Circuit build files are present.');
    }
    
    // 3. Run circuit tests
    console.log('\n3. Running circuit tests...');
    await runCommand('node', ['circuits/payment.test.mjs']);
    
    console.log('\n✅ All tests passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Execute main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});