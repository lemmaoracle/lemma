import { circuits } from "@lemmaoracle/sdk";
import type { LemmaClient, CircuitMeta } from "@lemmaoracle/sdk";

export type GetCircuitInput = Readonly<{ id: string }>;

export const getCircuit = (client: LemmaClient, input: GetCircuitInput): Promise<CircuitMeta> =>
  circuits.getById(client, input.id);
