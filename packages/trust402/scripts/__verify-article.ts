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
  } else {
    console.log(`\n=== Live publish (direct Lemma API, no x402) ===`);
  }

  // PRIVATE_KEY → Trust402 proxy (default apiBase) with x402
  //   Uses LEMMA_API_KEY if available (real API key), otherwise falls back
  //   to the trust402-dashboard system key (must be seeded in D1).
  // LEMMA_API_KEY → direct Lemma API with the provided key
  const proxyApiKey = apiKey ?? "trust402-dashboard";
  const client = create(
    privateKey !== undefined
      ? {
          apiKey: proxyApiKey,
          getSigner,
          onPayment: (info) => console.log(`  paying ${info.amount} micro-USDC…`),
        }
      : {
          apiBase: "https://workers.lemma.workers.dev",
          apiKey: apiKey!,
        },
  );

  const listing = await publish(client, {
    circuitId: "blog-article-v1.2",
    witness,
    commitment: commitmentB,
    price: { amount: 10000, currency: "USDC" },
    did: "did:pkh:eip155:84532:0x0000000000000000000000000000000000000000",
    metadata: { title: "verify-article.ts", version: "1.0" },
    environment: "sandbox",
  });

  console.log(`  listingRoot: ${listing.listingRoot}`);
  console.log(`  schemaId:    ${listing.schemaId}`);
  console.log(`  createdAt:   ${new Date(listing.createdAt).toISOString()}`);
  console.log(`\n✓ Live publish succeeded (S1: proof + document + listingRoot)`);

  // ── S2: Upload to storefront via list() ────────────────────────────
  const { list } = await import("@trust402/sdk");

  // Build a File from the article body (Node.js: Blob → File-compatible).
  const fileContent = article.body;
  const file = new Blob([fileContent], { type: "text/markdown" });

  // payoutAddress: use the wallet address if available, else zero address.
  const payoutAddress = privateKey !== undefined
    ? (await getSigner!()).address
    : "0x0000000000000000000000000000000000000000";

  console.log(`\n=== S2: Upload to storefront (POST /api/cards) ===`);
  const result = await list(client, {
    listing,
    file: file as File,
    category: "article",
    priceUsdc: 10000,
    environment: "sandbox",
    payoutAddress,
  });

  console.log(`  card id: ${result.id}`);
  console.log(`\n✓ Storefront upload succeeded (S2: listing visible to buyers)`);
} else {
  console.log("\n(skip live publish — set LEMMA_API_KEY or PRIVATE_KEY to enable)");
}
