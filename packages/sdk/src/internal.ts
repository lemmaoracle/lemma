import * as R from "ramda";
import type { LemmaClient } from "@lemma/spec";

export type Json =
| null
| boolean
| number
| string
| ReadonlyArray<Json>
| Readonly<{ [k: string]: Json }>;

export type Result<T> =
| Readonly<{ ok: true; value: T }>
| Readonly<{ ok: false; error: Error }>;

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = (error: Error): Result<never> => ({ ok: false, error });

export const resolveFetch = (client: LemmaClient): typeof fetch =>
client.fetchFn ?? globalThis.fetch;

export const withApiKey = (
client: LemmaClient,
headers: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> =>
client.apiKey
? { ...headers, "x-api-key": client.apiKey }
: headers;

export const toErrorMessage = (e: unknown): string =>
R.cond<readonly [unknown], string>([
[R.is(Error), (x: unknown) => (x as Error).message],
[R.is(String), (x: unknown) => x as string],
[R.T, R.always("Unknown error")],
])(e);

export const reject = <T = never>(message: string): Promise<T> =>
Promise.reject(new Error(message));
