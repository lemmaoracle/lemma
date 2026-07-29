import { forexComposite } from './src/index.js';
import { runAverageProofPipeline } from './src/pipeline.js';

const DRY = true;
const API_BASE = 'https://workers.lemma.workers.dev';
const apiKey = process.env.LEMMA_API_KEY || '';

const config = {
  apiBase: API_BASE,
  apiKey,
  circuitId: 'forex-average-v1',
  schema: 'canonical-sort-v1',
  maxDepth: 16,
  dryRun: DRY,
};

console.log('Running composite pipeline DRY RUN...\n');
try {
  const result = await runAverageProofPipeline(forexComposite, config);
  console.log('\nRESULT:', JSON.stringify(result, null, 2));
} catch(e) {
  console.error('FAILED:', (e as Error).message);
  console.error('Stack:', (e as Error).stack);
  process.exit(1);
}
