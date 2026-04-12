#!/usr/bin/env node
/**
 * Fix G2 point encoding bug in snarkjs-generated verifier contracts
 * 
 * This script swaps the coordinate order in G2 points to match EIP-197 compatibility.
 * Required for snarkjs-generated verifiers to work with Ethereum.
 */

import fs from 'fs';
import path from 'path';

const VERIFIER_PATH = path.join(process.cwd(), 'build', 'PaymentVerifier.sol');

function fixG2Encoding(content) {
  // Pattern to match G2 points in the verifier
  // Looking for lines like: vk.gamma[0] = Pairing.G2Point([...], [...]);
  const g2PointPattern = /(vk\.(gamma|gamma_2|gamma_abc\[0\]) = Pairing\.G2Point\()\[(0x[0-9a-fA-F, ]+)\],\s*\[(0x[0-9a-fA-F, ]+)\]\);/g;
  
  let fixedContent = content;
  let replacements = 0;
  
  // Find and fix all G2 points
  fixedContent = fixedContent.replace(g2PointPattern, (match, prefix, pointType, xCoord, yCoord) => {
    replacements++;
    console.log(`🔧 Fixing ${pointType} G2 point (swap coordinates)`);
    // Swap the coordinates
    return `${prefix}[${yCoord}], [${xCoord}]);`;
  });
  
  if (replacements > 0) {
    console.log(`✅ Fixed ${replacements} G2 point(s)`);
  } else {
    console.log('⚠️  No G2 points found to fix');
  }
  
  return fixedContent;
}

function main() {
  console.log(`🔍 Checking verifier: ${VERIFIER_PATH}`);
  
  if (!fs.existsSync(VERIFIER_PATH)) {
    console.error(`❌ Verifier file not found: ${VERIFIER_PATH}`);
    console.error('   Run build.sh first to generate the verifier.');
    process.exit(1);
  }
  
  // Read the verifier contract
  const content = fs.readFileSync(VERIFIER_PATH, 'utf8');
  
  // Fix G2 encoding
  const fixedContent = fixG2Encoding(content);
  
  // Write back if changes were made
  if (content !== fixedContent) {
    fs.writeFileSync(VERIFIER_PATH, fixedContent, 'utf8');
    console.log('✅ Verifier contract fixed and saved.');
  } else {
    console.log('✅ No changes needed.');
  }
}

// Run the script
main();