# @lemmaoracle/x402

Drop-in replacement for `@x402/*` on the resource-server side, with Lemma
discovery + proof submission wired in automatically.

For the basic x402 surface (`HTTPFacilitatorClient`, `x402ResourceServer`,
`paymentMiddleware`, `ExactEvmScheme`, `x402Client`), see the top-level
package documentation. This README focuses on the **Bazaar Discovery
Layer** extension.

## Bazaar Discovery — `bazaarPaymentMiddleware`

`bazaarPaymentMiddleware` is a thin wrapper around the upstream
`paymentMiddlewareFromConfig` from `@x402/hono`. When a route is marked
`discoverable: true`, the middleware:

1. **Injects** a `bazaar` extension input into the 402 challenge's
   `accepts[].extra` — name / description / category / tags / inputSchema
   / outputSchema. The CDP facilitator consumes this on settle to populate
   the Discovery Layer catalog entry.
2. **Parses** the `EXTENSION-RESPONSES` header returned by the CDP
   facilitator on settle (`status=accepted|processing|rejected|...`) and
   emits a structured `BazaarStatusEvent` to the configured observability
   sink. Discovery failures never break the settle pipeline.
3. **Emits** `X-Lemma-Bazaar-Schema` / `X-Lemma-Bazaar-Category` response
   headers for transparent downstream consumption (curated tooling,
   `agentic.market`, etc.).

### Important — Bazaar Discovery requires the CDP facilitator

`LemmaRouteConfig.discoverable: true` only activates Discovery Layer
indexing when the route's settle is observed by the **CDP facilitator**
(`https://api.cdp.coinbase.com/platform/v2/x402`). The `x402.org`
community facilitator and any self-hosted facilitator implementations do
**not** index to the CDP Discovery Layer — there is no separate
discovery push API to fall back on.

When a route is `discoverable: true`, pin the CDP facilitator via your
route config or environment, otherwise the indexing will silently no-op
(the `EXTENSION-RESPONSES` header will be absent and the emitter sink
will receive no events).

Reference: <https://docs.cdp.coinbase.com/x402/bazaar>

### `discoverable` contract (runtime-checked)

When `discoverable: true`, the following fields are **all required**:

| field | purpose |
|---|---|
| `schema` | Bazaar extension input `name` (kebab-case + version suffix). |
| `bazaarCategory` | One of the 7 official Bazaar categories. |
| `bazaarDescription` | 1-sentence semantic-search-friendly description, ≤ 256 chars. |

`assertDiscoverableConfigured` is called at construction time and throws
synchronously on misconfiguration — the failure surfaces at deploy time,
not on first incoming request.

Compile-time strict union enforcement (i.e. making `bazaarCategory`
non-optional when `discoverable: true`) is deferred to `LemmaRouteConfig`
v0.3.

### Update / removal

CDP's published API does **not** expose an explicit "remove from Bazaar"
endpoint. Operationally:

- **Update** description / price / tags → next settle refreshes the
  catalog entry.
- **Remove** → set `discoverable: false` so subsequent settles stop
  refreshing the entry; entries time out passively. If active removal is
  required, contact the CDP devrel team directly.

### Observability — `BazaarStatusEmitter`

The emitter is a process-wide singleton. Override via the
`LEMMA_BAZAAR_EMITTER` env var:

- `"console"` (default) — emits JSON-line logs via `console.info`.
- `"noop"` — silent; useful in tests.
- (Future) `"datadog"` — wired to a Datadog metrics agent, TODO W2.

For unit tests, inject a mock with `setBazaarStatusEmitterForTesting(...)`
and restore with `setBazaarStatusEmitterForTesting(undefined)`.

### Example

```ts
import { Hono } from "hono";
import { bazaarPaymentMiddleware } from "@lemmaoracle/x402";

const app = new Hono();

app.use(
  "/v1/bazaar/inference/attest",
  bazaarPaymentMiddleware({
    accepts: [
      {
        recipient: env.LEMMA_ATTESTATION_WALLET,
        amount: "70000", // 0.07 USDC, 6 decimals
        network: "base",
      },
    ],
    discoverable: true,
    schema: "inference-attestation-v1",
    bazaarCategory: "Inference",
    bazaarDescription:
      "For AI agents running their own inference, generate a Groth16 attestation that proves which model produced which output, anchored on Base mainnet. Lemma never sees raw data.",
    bazaarSubTags: ["verifiable-ai", "audit-trail", "claim-check"],
    bazaarInputSchemaRef:
      "https://schemas.lemma.frame00.com/bazaar/product-b-input.json",
    bazaarOutputSchemaRef:
      "https://schemas.lemma.frame00.com/bazaar/product-b-output.json",
  })
);
```
