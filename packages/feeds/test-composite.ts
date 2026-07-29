import { forexComposite, frankfurterForex, erApiForex } from './src/index.js';

console.log('=== Testing source fetches ===');
try {
  const srcA = await frankfurterForex.fetch();
  console.log('Frankfurter OK. Rates count:', Object.keys((srcA.data as any).rates ?? {}).length);
  console.log('Sample JPY:', (srcA.data as any).rates?.JPY);
  console.log('Leaf paths sample:', srcA.commitment.leafPreimages.slice(0,3).map((l: any) => l.name));
} catch(e) { console.error('Frankfurter FAIL:', (e as Error).message); }

try {
  const srcB = await erApiForex.fetch();
  console.log('erApi OK. Rates count:', Object.keys((srcB.data as any).rates ?? {}).length);
  console.log('Sample JPY:', (srcB.data as any).rates?.JPY);
} catch(e) { console.error('erApi FAIL:', (e as Error).message); }

// Test composite
try {
  const { fetchComposite } = await import('./src/index.js');
  const comp = await fetchComposite();
  console.log('\n=== Composite ===');
  console.log('Currencies:', Object.keys(comp.averagedRates).length);
  console.log('Sample JPY avg:', comp.averagedRates['JPY']);
  const srcA = comp.sources['frankfurter'];
  console.log('Frankfurter root:', srcA?.root?.slice(0, 20) + '...');
  console.log('Frankfurter leafPreimages count:', srcA?.leafPreimages?.length);
  
  // Test findLeaf
  const ccy = 'JPY';
  const targetPath = `$["rates"]["${ccy}"]`;
  const idx = srcA?.leafPreimages?.findIndex((p: any) => p.name === targetPath);
  console.log(`findLeaf('${ccy}') -> index: ${idx}, name: ${idx >= 0 ? srcA?.leafPreimages[idx]?.name : 'NOT FOUND'}`);
  if (idx >= 0) {
    console.log(`  valueHash: ${srcA?.leafPreimages[idx]?.valueHash?.slice(0,20)}...`);
    console.log(`  nameHash: ${srcA?.leafPreimages[idx]?.nameHash?.slice(0,20)}...`);
  }
} catch(e) { console.error('Composite FAIL:', (e as Error).message); }
