import type { LemmaClient } from "@lemmaoracle/spec";
import { fetchHint, reject, resolveFetch, toErrorMessage, withApiKey } from "./internal.js";

export type HttpMethod = "GET" | "POST";

const asJson = (res: Response): Promise<unknown> =>
  res.json().catch((_e: unknown) => Promise.resolve({ error: "Invalid JSON" }));

export const requestJson =
  <T>(client: LemmaClient) =>
  (method: HttpMethod) =>
  (path: string) =>
  (body?: unknown): Promise<T> => {
    const url = `${client.apiBase}${path}`;
    const headers = withApiKey(client, { "content-type": "application/json" });
    const init: RequestInit = {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    };

    return resolveFetch(client)(url, init).then(
      (res) =>
        res.ok
          ? (asJson(res) as Promise<T>)
          : asJson(res).then((b) => reject<T>(`HTTP ${String(res.status)}: ${JSON.stringify(b)}`)),
      (e: unknown) => reject<T>(`${toErrorMessage(e)} ${fetchHint(client)}`),
    );
  };

export const get = <T>(client: LemmaClient) => requestJson<T>(client)("GET");
export const post = <T>(client: LemmaClient) => requestJson<T>(client)("POST");
