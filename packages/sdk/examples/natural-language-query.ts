/**
 * Example: Natural Language Query Parsing with Lemma SDK
 *
 * Demonstrates client-side natural language query parsing using @mlc-ai/web-llm
 * with grammar-constrained JSON output.
 */

import * as R from "ramda";
import { create, attributes, queryParser } from "@lemma/sdk";

// Example usage - in a real application, this would be in a browser environment
async function demonstrateNaturalLanguageQuery() {
  try {
    console.log("=== Natural Language Query Parser Demo ===\n");

    // Create a client (in real usage, you'd use your actual API endpoint)
    const client = create({
      apiBase: "https://api.lemmaoracle.com",
      apiKey: "your-api-key-here",
    });

    // Example 1: Initialize parser with progress callback
    console.log("1. Initializing query parser...");
    await queryParser.init("Phi-3.5-mini-instruct-q4f16_1-MLC", (progress) => {
      console.log(`   Model loading: ${(progress.progress * 100).toFixed(1)}%`);
    });
    console.log("   ✓ Parser initialized\n");

    // Example 2: Parse natural language queries
    console.log("2. Parsing natural language queries:\n");

    const testQueries = [
      "users over 18 in Japan",
      "verified documents from issuer-123",
      "employees with salary greater than 50000 in USA or Canada",
      "people aged 21 to 35 with verified credentials",
    ] as const;

    const processQuery = async (query: string): Promise<void> => {
      console.log(`   Query: "${query}"`);

      // Parse the natural language query
      const structured = await queryParser.parseNaturalQuery(query);

      console.log(`   → Structured:`, JSON.stringify(structured, null, 2));
      console.log();
    };

    // Process queries sequentially using functional composition
    await testQueries.reduce<Promise<void>>(async (accPromise, query) => {
      await accPromise;
      return processQuery(query);
    }, Promise.resolve());

    // Example 3: Using attributes.query with natural language
    console.log("3. Using attributes.query with natural language:\n");

    console.log("   Note: In a real application, this would call the actual API");
    console.log("   const results = await attributes.query(client, {");
    console.log('     query: "users over 18 in Japan",');
    console.log('     mode: "natural",');
    console.log('     proof: { required: true, type: "zk-snark" },');
    console.log('     targets: { schemas: ["user-kyc-v1"] },');
    console.log("   });\n");

    // Example 4: Cleanup
    console.log("4. Cleaning up parser resources...");
    await queryParser.cleanup();
    console.log("   ✓ Parser cleaned up\n");

    console.log("=== Demo Complete ===");
    console.log("\nSummary:");
    console.log("- Natural language queries are parsed client-side");
    console.log("- Uses @mlc-ai/web-llm with WebGPU acceleration");
    console.log("- Grammar-constrained output guarantees valid JSON");
    console.log("- No server-side query parsing required (privacy-preserving)");
    console.log("- Lazy loading: Model only loads on first natural query");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Note: This example requires a browser environment with WebGPU support
// To run in Node.js, you would need a different setup
console.log("Note: This example is designed for browser environments.");
console.log("It uses @mlc-ai/web-llm which requires WebGPU support.\n");

// Export for documentation purposes
export { demonstrateNaturalLanguageQuery };
