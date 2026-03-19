/**
 * Example: Natural Language Query Parsing with @lemmaoracle/parser
 *
 * Demonstrates using the separate @lemmaoracle/parser package to
 * convert natural language queries into structured format, then
 * querying via @lemmaoracle/sdk's attributes.query API.
 *
 * Note: The parser is a separate package to keep the SDK lightweight.
 * Install both: pnpm add @lemmaoracle/sdk @lemmaoracle/parser
 */

import { create, attributes } from "@lemmaoracle/sdk";
import { initParser, parseNaturalQuery, cleanup } from "@lemmaoracle/parser";

// Example usage - in a real application, this would be in a browser environment
async function demonstrateNaturalLanguageQuery() {
  try {
    console.log("=== Natural Language Query Parser Demo ===\n");

    // Create a client (in real usage, you'd use your actual API endpoint)
    const client = create({
      apiBase: "https://api.lemmaoracle.com",
      apiKey: "your-api-key-here",
    });

    // Step 1: Initialize parser (from @lemmaoracle/parser)
    console.log("1. Initializing query parser...");
    await initParser("onnx-community/Qwen3-0.6B-ONNX", (progress) => {
      console.log(`   Model loading: ${progress.status}${progress.progress ? ` ${(progress.progress * 100).toFixed(1)}%` : ""}`);
    });
    console.log("   ✓ Parser initialized\n");

    // Step 2: Parse natural language → structured query
    console.log("2. Parsing natural language queries:\n");

    const testQueries = [
      "users over 18 in Japan",
      "verified documents from issuer-123",
      "employees with salary greater than 50000 in USA or Canada",
      "people aged 21 to 35 with verified credentials",
    ] as const;

    const processQuery = async (query: string): Promise<void> => {
      console.log(`   Query: "${query}"`);

      // Parse the natural language query (client-side, via @lemmaoracle/parser)
      const structured = await parseNaturalQuery(query);

      console.log(`   → Structured:`, JSON.stringify(structured, null, 2));
      console.log();
    };

    // Process queries sequentially
    await testQueries.reduce<Promise<void>>(async (accPromise, query) => {
      await accPromise;
      return processQuery(query);
    }, Promise.resolve());

    // Step 3: Send structured query to API (via @lemmaoracle/sdk)
    console.log("3. Using attributes.query with structured data:\n");

    console.log("   Note: In a real application, this would call the actual API");
    console.log("   const results = await attributes.query(client, {");
    console.log('     attributes: [');
    console.log('       { name: "age", operator: "gt", value: 18 },');
    console.log('       { name: "country", operator: "eq", value: "Japan" },');
    console.log("     ],");
    console.log('     proof: { required: true, type: "zk-snark" },');
    console.log('     targets: { schemas: ["user-kyc-v1"] },');
    console.log("   });\n");

    // Step 4: Cleanup
    console.log("4. Cleaning up parser resources...");
    await cleanup();
    console.log("   ✓ Parser cleaned up\n");

    console.log("=== Demo Complete ===");
    console.log("\nSummary:");
    console.log("- Natural language parsing: @lemmaoracle/parser (separate package)");
    console.log("- Structured query API: @lemmaoracle/sdk (attributes.query)");
    console.log("- Parser uses @huggingface/transformers (Transformers.js v3)");
    console.log("- Works in both browser and Node.js environments");
    console.log("- No server-side query parsing required (privacy-preserving)");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Note: This example works in both browser and Node.js environments
console.log("Note: This example requires both @lemmaoracle/sdk and @lemmaoracle/parser.");
console.log("Install: pnpm add @lemmaoracle/sdk @lemmaoracle/parser\n");

// Export for documentation purposes
export { demonstrateNaturalLanguageQuery };
