import { create, circuits } from "@lemmaoracle/sdk";

const main = async (): Promise<void> => {
  const m = await circuits.getById(create({}), "role-spend-limit-v2");
  console.log("circuitId:", m.circuitId);
  console.log("schema:", m.schema);
  console.log("verifiers:", JSON.stringify(m.verifiers));
  console.log("artifact.location:", JSON.stringify(m.artifact?.location, null, 2));
};

main().catch((e: unknown) => {
  console.error("FAILED:", e instanceof Error ? e.message : String(e));
  process.exit(1);
});
