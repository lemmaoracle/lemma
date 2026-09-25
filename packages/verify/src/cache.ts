/**
 * CID-keyed caching fetch for IPFS gateway artifacts.
 *
 * The Lemma SDK resolves circuit artifacts through several IPFS gateways.
 * This fetcher wraps `globalThis.fetch` and caches successful GET responses
 * by CID so the agent (Node) or the page (browser) does not re-download the
 * multi-MB wasm/zkey on every call.
 *
 * - memory cache always (per module instance)
 * - filesystem cache (Node only) when `cacheDir` is set — persists across runs
 *
 * The module is otherwise pure: the single unavoidable mutation — the
 * in-memory `Map` write inside `write` — carries a narrowly scoped
 * `eslint-disable-next-line` (imperative: Map cache mutation, no functional
 * alternative). This mirrors the SDK's own whir-runtime / platform
 * exceptions for unavoidable stateful code.
 */

export type CachingFetcherConfig = Readonly<{
  cacheDir?: string;
}>;

const cidFromUrl = (url: string): string | null => {
  const m = url.match(/(?:ipfs\/|ipfs:\/\/)([A-Za-z0-9]{20,})/);
  return m?.[1] ?? null;
};

const toResponse = (bytes: Uint8Array): Response =>
  new Response(bytes, {
    status: 200,
    headers: { "content-type": "application/octet-stream" },
  });

export const createCachingFetcher = (
  config: CachingFetcherConfig = {},
): typeof fetch => {
  const memory = new Map<string, Uint8Array>();

  const read = (cid: string): Promise<Uint8Array | null> => {
    const hit = memory.get(cid);
    const dir = config.cacheDir;
    return hit !== undefined
      ? Promise.resolve(hit)
      : dir === undefined
        ? Promise.resolve(null)
        : Promise.all([import("node:fs/promises"), import("node:path")])
            .then(([fs, path]) => fs.readFile(path.join(dir, cid)))
            .then((buf) => new Uint8Array(buf))
            .catch((_e: unknown) => null);
  };

  const write = (cid: string, bytes: Uint8Array): Promise<void> => {
    // imperative: Map cache mutation — no functional alternative
    // eslint-disable-next-line functional/immutable-data
    const _cached = memory.set(cid, bytes);
    const dir = config.cacheDir;
    return dir === undefined
      ? Promise.resolve()
      : Promise.all([import("node:fs/promises"), import("node:path")])
          .then(([fs, path]) =>
            fs
              .mkdir(dir, { recursive: true })
              .then((_x: unknown) =>
                fs.writeFile(path.join(dir, cid), bytes),
              ),
          )
          .catch((_e: unknown) => undefined);
  };

  return (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = (init?.method ?? "GET").toUpperCase();
    const cid = method === "GET" ? cidFromUrl(url) : null;
    return cid === null
      ? fetch(input, init)
      : read(cid).then((hit) =>
          hit !== null
            ? toResponse(hit)
            : fetch(input, init).then((res) =>
                res.ok
                  ? res
                      .arrayBuffer()
                      .then((ab) => new Uint8Array(ab))
                      .then((bytes) =>
                        write(cid, bytes).then((_x: unknown) => toResponse(bytes)),
                      )
                  : res,
              ),
        );
  };
};
