/**
 * verify-article.ts — Verify that the pure Lemma SDK path and the Trust402 SDK
 * path produce identical commitments for the same blog article.
 *
 * No environment variables required for the local comparison.
 * Set LEMMA_API_KEY for direct Lemma API publish (no x402).
 * Set PRIVATE_KEY (0x...) for Trust402 proxy publish with x402 payment.
 *
 * Usage:
 *   npx tsx scripts/__verify-article.ts                              # local only
 *   LEMMA_API_KEY=xxx npx tsx scripts/__verify-article.ts            # live, direct
 *   PRIVATE_KEY=0x... npx tsx scripts/__verify-article.ts            # live, x402
 */
import { toScalar } from "@lemmaoracle/sdk";
import { blogArticle } from "@trust402/sdk";
import { poseidon5 } from "poseidon-lite";

// ── Sample article ───────────────────────────────────────────────────

const article = {
  author: "did:example:author",
  body: "Zero-knowledge proofs enable privacy-preserving verification.",
  published: 1751827200,
  words: 7,
  lang: "en",
};

// ── Path A: Pure Lemma SDK (no Trust402 dependency) ──────────────────

const authorHash = toScalar(article.author);
const published = BigInt(article.published);
const integrityHash = toScalar(article.body);
const words = BigInt(article.words);
const langCode = 1n; // "en" → 1

const commitmentA = poseidon5([
  authorHash,
  published,
  integrityHash,
  words,
  langCode,
]);

console.log("=== Path A: Pure Lemma SDK ===");
console.log(`  authorHash:    0x${authorHash.toString(16)}`);
console.log(`  published:     ${published}`);
console.log(`  integrityHash: 0x${integrityHash.toString(16)}`);
console.log(`  words:         ${words}`);
console.log(`  langCode:      ${langCode}`);
console.log(`  commitment:    0x${commitmentA.toString(16)}`);

// ── Path B: Trust402 SDK ─────────────────────────────────────────────

const { witness, commitment: commitmentB } = blogArticle(article);

console.log("\n=== Path B: Trust402 SDK (blogArticle) ===");
console.log(`  witness:       ${JSON.stringify(witness, null, 2)}`);
console.log(`  commitment:    ${commitmentB}`);

// ── Assert equality ──────────────────────────────────────────────────

const a = `0x${commitmentA.toString(16)}`;
const b = commitmentB;

if (a !== b) {
  console.error(`\n✗ MISMATCH: ${a} !== ${b}`);
  process.exit(1);
}

console.log(`\n✓ Commitments match: ${a}`);

// ── Optional: Live publish ───────────────────────────────────────────

const apiKey = process.env.LEMMA_API_KEY;
const privateKey = process.env.PRIVATE_KEY;
const live = apiKey !== undefined || privateKey !== undefined;

if (live) {
  const { create, publish } = await import("@trust402/sdk");

  // Build getSigner if a private key is provided (Node.js + viem).
  let getSigner: (() => Promise<{ provider: unknown; address: string; signTypedData?: (params: unknown) => Promise<string> }>) | undefined;
  let signerAddress = "0x0000000000000000000000000000000000000000";
  if (privateKey) {
    const { createWalletClient, http } = await import("viem");
    const { privateKeyToAccount } = await import("viem/accounts");
    const { baseSepolia } = await import("viem/chains");
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });
    getSigner = async () => ({
      provider: walletClient,
      address: account.address,
      // viem WalletClient doesn't support eth_signTypedData_v4 via
      // provider.request — expose the native action instead.
      signTypedData: (params: unknown) =>
        walletClient.signTypedData(params as Parameters<typeof walletClient.signTypedData>[0]),
    });
    console.log(`\n=== Live publish (x402 via Trust402 proxy, ${account.address}) ===`);
    signerAddress = account.address;
  } else {
    console.log(`\n=== Live publish (direct Lemma API, no x402) ===`);
  }

  // LEMMA_API_KEY only → Trust402 proxy (no x402 signer, skips S2 storefront)
  const proxyApiKey = apiKey ?? "trust402-dashboard";
  const client = create(
    privateKey !== undefined
      ? {
          apiKey: proxyApiKey,
          getSigner,
          onPayment: (info) => console.log(`  paying ${info.amount} micro-USDC…`),
        }
      : {
          apiKey: apiKey!,
        },
  );

  // Live publish uses a unique article body so each run produces a distinct
  // docHash → distinct document in the bundle queue (threshold = 3).
  const liveBody = `verify-article.ts · ${Date.now()}`;
  const liveArticle = { ...article, body: liveBody, words: liveBody.split(/\\s+/).length };
  const { witness: liveWitness, commitment: liveCommitment } = blogArticle(liveArticle);

  const listing = await publish(client, {
    circuitId: "blog-article-v1.2",
    witness: liveWitness,
    commitment: liveCommitment,
    price: { amount: 10000, currency: "USDC" },
    did: `did:pkh:eip155:84532:${signerAddress}`,
    metadata: { title: "verify-article.ts", version: "1.0" },
    environment: "sandbox",
    // FileInput — only when PRIVATE_KEY is set (x402 required for proof submission
    // through Trust402 proxy; without it, S2 storefront upload is skipped)
    ...(privateKey !== undefined
      ? {
          file: { body: liveBody, name: "article.md", type: "text/markdown" } as const,
          category: "document" as const,
          payoutAddress: (await getSigner!()).address,
        }
      : {}),
  });

  console.log(`  listingRoot: ${listing.listingRoot}`);
  console.log(`  schemaId:    ${listing.schemaId}`);
  console.log(`  cardId:      ${listing.cardId ?? "(not uploaded)"}`);
  console.log(`  createdAt:   ${new Date(listing.createdAt).toISOString()}`);
  console.log(`\n✓ publish() completed S1 (proof + document) + S2 (storefront upload)`);
} else {
  console.log("\n(skip live publish — set LEMMA_API_KEY or PRIVATE_KEY to enable)");
}
