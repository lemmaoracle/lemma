/**
 * Extract the upstream JSON payload from a fetcher Workers `/fetch` response.
 *
 * Accepts both:
 * - current: `{ request, response: { data }, commitment }`
 * - legacy:  `{ source, fetchedAt, data, canonical, commitment }`
 *
 * so feeds keep working across fetcher/feeds deploy order.
 */
import type { Json } from "@lemmaoracle/sdk";

export const fetcherPayload = (body: unknown): Json | undefined => {
  const obj = body as Readonly<Record<string, unknown>>;
  const response = obj["response"] as Readonly<Record<string, unknown>> | undefined;
  const data = response?.["data"] ?? obj["data"];
  return data === undefined ? undefined : (data as Json);
};
