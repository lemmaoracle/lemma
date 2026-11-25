import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { payFetch } from "./pay-fetch.js";
import type { Signer } from "./pay-fetch.js";
import type { PaymentRequirements } from "./pay-types.js";

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const PROOFS_URL = "https://trust402.lemma.workers.dev/v1/proofs";
const API_BASE = "https://trust402.lemma.workers.dev";
const PAY_TO = `0x${"1".repeat(40)}`;
const ADDRESS_A = `0x${"a".repeat(40)}`;
const ADDRESS_B = `0x${"b".repeat(40)}`;
const MOCK_SIG = `0x${"ab".repeat(65)}`;

const exactFixture = (
  overrides: Partial<PaymentRequirements> = {},
): PaymentRequirements => ({
  scheme: "exact",
  network: "base-sepolia",
  maxAmountRequired: "5000",
  payTo: PAY_TO,
  asset: USDC_BASE_SEPOLIA,
  resource: PROOFS_URL,
  description: "proof submission",
  mimeType: "application/json",
  maxTimeoutSeconds: 1234,
  extra: { name: "USDC", version: "2" },
  ...overrides,
});

const fetchMock = vi.fn();

const res402 = (headers: Record<string, string> = {}, body = ""): Response =>
  new Response(body, { status: 402, headers });

const res402Header = (value: unknown): Response =>
  res402({ "X-PAYMENT-REQUIREMENTS": JSON.stringify(value) });

const okRes = (): Response => new Response("paid", { status: 200 });

const postInit = (): RequestInit => ({ method: "POST", body: "{}" });

const makeViemSigner = (address: string, signature: string = MOCK_SIG) => {
  const providerRequest = vi.fn().mockResolvedValue(undefined);
  const signTypedData = vi.fn().mockResolvedValue(signature);
  const signer: Signer = {
    provider: { request: providerRequest },
    address,
    signTypedData,
  };
  return { signer, providerRequest, signTypedData };
};

const makeProviderSigner = (address: string, signature: string = MOCK_SIG) => {
  const providerRequest = vi.fn().mockResolvedValue(signature);
  const signer: Signer = { provider: { request: providerRequest }, address };
  return { signer, providerRequest };
};

type TypedDataParams = {
  domain: Record<string, unknown>;
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, string>;
};

const signedParams = (signTypedData: ReturnType<typeof vi.fn>): TypedDataParams =>
  signTypedData.mock.calls[0]?.[0] as TypedDataParams;

type X402Payment = {
  x402Version: number;
  scheme: string;
  network: string;
  payload: { signature: string; authorization: Record<string, string> };
};

const xPaymentOf = (init: RequestInit): { raw: string; decoded: X402Payment } => {
  const raw = (init.headers as Headers).get("X-PAYMENT");
  if (raw === null) throw new Error("retry is missing the X-PAYMENT header");
  return { raw, decoded: JSON.parse(atob(raw)) as X402Payment };
};

const stubBrowser = (): void => {
  vi.stubGlobal("location", { href: PROOFS_URL, origin: API_BASE });
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/* ------------------------------------------------------------------ */
/*  A. Pass-through                                                    */
/* ------------------------------------------------------------------ */

describe("payFetch pass-through", () => {
  it("returns a non-402 response as-is without calling getSigner", async () => {
    const original = okRes();
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({ getSigner, apiBase: API_BASE })(
      PROOFS_URL,
      postInit(),
    );

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });

  it("returns the original 402 when requirements cannot be parsed", async () => {
    const original = res402(
      { "X-PAYMENT-REQUIREMENTS": "not-json{" },
      "not json either{",
    );
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({ getSigner, apiBase: API_BASE })(
      PROOFS_URL,
      postInit(),
    );

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });

  it("returns the original 402 when the request origin is not the apiBase origin", async () => {
    const original = res402Header(exactFixture());
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({
      getSigner,
      apiBase: "https://evil.example.com",
    })(PROOFS_URL, postInit());

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });

  it("returns the original 402 when apiBase is malformed in Node", async () => {
    const original = res402Header(exactFixture());
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({ getSigner, apiBase: "not a url" })(
      PROOFS_URL,
      postInit(),
    );

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });

  it("returns the original 402 for a GET request", async () => {
    const original = res402Header(exactFixture());
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL);

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });

  it("returns the original 402 when maxAmountRequired exceeds the default cap", async () => {
    const original = res402Header(exactFixture({ maxAmountRequired: "5001" }));
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({ getSigner, apiBase: API_BASE })(
      PROOFS_URL,
      postInit(),
    );

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });

  it("returns the original 402 for an unknown network", async () => {
    const original = res402Header({ ...exactFixture(), network: "ethereum" });
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({ getSigner, apiBase: API_BASE })(
      PROOFS_URL,
      postInit(),
    );

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });

  it("returns the original 402 for a non-USDC asset", async () => {
    const original = res402Header(exactFixture({ asset: `0x${"2".repeat(40)}` }));
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({ getSigner, apiBase: API_BASE })(
      PROOFS_URL,
      postInit(),
    );

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });

  it("returns the original 402 when extra is missing version", async () => {
    const original = res402Header({
      ...exactFixture(),
      extra: { name: "USDC" },
    });
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({ getSigner, apiBase: API_BASE })(
      PROOFS_URL,
      postInit(),
    );

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });

  it("returns the original 402 for a non-string request body", async () => {
    const original = res402Header(exactFixture());
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, {
      method: "POST",
      body: new FormData(),
    });

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });

  it("returns the original 402 for a path outside /v1/", async () => {
    const original = res402Header(exactFixture());
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({ getSigner, apiBase: API_BASE })(
      "https://trust402.lemma.workers.dev/l/abc",
      postInit(),
    );

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  B. Requirements parsing                                            */
/* ------------------------------------------------------------------ */

describe("payFetch requirements parsing", () => {
  it("pays from the X-PAYMENT-REQUIREMENTS header when present", async () => {
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(okRes());
    const { signer, signTypedData } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);

    await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, postInit());

    expect(signTypedData).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to the body accepts array and pays the exact entry", async () => {
    const body = JSON.stringify({
      accepts: [{ ...exactFixture(), scheme: "other" }, exactFixture()],
    });
    fetchMock.mockResolvedValueOnce(res402({}, body)).mockResolvedValueOnce(okRes());
    const { signer, signTypedData } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);

    await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, postInit());

    expect(signTypedData).toHaveBeenCalledTimes(1);
    const message = signedParams(signTypedData).message;
    expect(message["to"]).toBe(PAY_TO);
    expect(message["value"]).toBe("5000");
  });

  it("returns the 402 without signing when the body has no exact entry", async () => {
    const original = res402({}, JSON.stringify({ accepts: [] }));
    fetchMock.mockResolvedValueOnce(original);
    const { signer, signTypedData } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);

    const out = await payFetch({ getSigner, apiBase: API_BASE })(
      PROOFS_URL,
      postInit(),
    );

    expect(out).toBe(original);
    expect(signTypedData).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  C. Payment signing — Node/viem path                                */
/* ------------------------------------------------------------------ */

describe("payFetch Node signing", () => {
  it("signs TransferWithAuthorization with the fixture domain and a fresh nonce", async () => {
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(okRes());
    const { signer, signTypedData } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);

    const nowBefore = Math.floor(Date.now() / 1000);
    await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, postInit());
    const nowAfter = Math.floor(Date.now() / 1000);

    expect(signTypedData).toHaveBeenCalledTimes(1);
    const params = signedParams(signTypedData);
    expect(params.domain).toEqual({
      name: "USDC",
      version: "2",
      chainId: 84532,
      verifyingContract: USDC_BASE_SEPOLIA,
    });
    expect(params.primaryType).toBe("TransferWithAuthorization");
    expect(params.types["EIP712Domain"]).toEqual([
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ]);
    expect(params.types["TransferWithAuthorization"]).toEqual([
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ]);
    expect(params.message["from"]).toBe(ADDRESS_A);
    expect(params.message["to"]).toBe(PAY_TO);
    expect(params.message["value"]).toBe("5000");
    expect(params.message["validAfter"]).toBe("0");
    const validBefore = Number(params.message["validBefore"]);
    expect(validBefore).toBeGreaterThanOrEqual(nowBefore + 1234);
    expect(validBefore).toBeLessThanOrEqual(nowAfter + 1234);
    expect(params.message["nonce"]).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("retries with an X-PAYMENT header encoding the signed payment", async () => {
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(okRes());
    const { signer, signTypedData } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);

    await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, postInit());

    const retryInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const { raw, decoded } = xPaymentOf(retryInit);
    expect(raw).toBe(btoa(JSON.stringify(decoded)));
    expect(decoded).toEqual({
      x402Version: 1,
      scheme: "exact",
      network: "base-sepolia",
      payload: {
        signature: MOCK_SIG,
        authorization: signedParams(signTypedData).message,
      },
    });
  });

  it("returns the retry response", async () => {
    const retry = okRes();
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(retry);
    const { signer } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);

    const out = await payFetch({ getSigner, apiBase: API_BASE })(
      PROOFS_URL,
      postInit(),
    );

    expect(out).toBe(retry);
  });

  it("uses the second resolved signer address as authorization.from", async () => {
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(okRes());
    const first = makeViemSigner(ADDRESS_A);
    const second = makeViemSigner(ADDRESS_B);
    const getSigner = vi
      .fn()
      .mockResolvedValueOnce(first.signer)
      .mockResolvedValueOnce(second.signer);

    await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, postInit());

    expect(getSigner).toHaveBeenCalledTimes(2);
    expect(signedParams(second.signTypedData).message["from"]).toBe(ADDRESS_B);
    expect(first.signTypedData).not.toHaveBeenCalled();
  });

  it("calls onPayment once with the amount and resource", async () => {
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(okRes());
    const { signer } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);
    const onPayment = vi.fn();

    await payFetch({ getSigner, apiBase: API_BASE, onPayment })(
      PROOFS_URL,
      postInit(),
    );

    expect(onPayment).toHaveBeenCalledTimes(1);
    expect(onPayment).toHaveBeenCalledWith({
      amount: "5000",
      resource: PROOFS_URL,
    });
  });

  it("makes a larger amount payable when maxAmountMicroUsdc is raised", async () => {
    fetchMock
      .mockResolvedValueOnce(
        res402Header(exactFixture({ maxAmountRequired: "9000" })),
      )
      .mockResolvedValueOnce(okRes());
    const { signer, signTypedData } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);

    await payFetch({ getSigner, apiBase: API_BASE, maxAmountMicroUsdc: 10000 })(
      PROOFS_URL,
      postInit(),
    );

    expect(signTypedData).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("never calls provider.request on the Node/viem path", async () => {
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(okRes());
    const { signer, providerRequest } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);

    await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, postInit());

    expect(providerRequest).not.toHaveBeenCalled();
  });

  it("retries exactly once when the retry is also a 402", async () => {
    const second = res402({}, "still unpaid");
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(second);
    const { signer, signTypedData } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);

    const out = await payFetch({ getSigner, apiBase: API_BASE })(
      PROOFS_URL,
      postInit(),
    );

    expect(out).toBe(second);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(signTypedData).toHaveBeenCalledTimes(1);
  });
});

/* ------------------------------------------------------------------ */
/*  D. Provider path and browser chain switch                          */
/* ------------------------------------------------------------------ */

describe("payFetch provider signing and browser chain", () => {
  it("signs via eth_signTypedData_v4 when the signer has no signTypedData", async () => {
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(okRes());
    const providerSig = `0x${"ef".repeat(65)}`;
    const { signer, providerRequest } = makeProviderSigner(
      ADDRESS_A,
      providerSig,
    );
    const getSigner = vi.fn().mockResolvedValue(signer);

    await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, postInit());

    expect(providerRequest).toHaveBeenCalledTimes(1);
    const args = providerRequest.mock.calls[0]?.[0] as {
      method: string;
      params: [string, string];
    };
    expect(args.method).toBe("eth_signTypedData_v4");
    expect(args.params[0]).toBe(ADDRESS_A);
    const typed = JSON.parse(args.params[1]) as {
      primaryType: string;
      domain: { chainId: number };
    };
    expect(typed.primaryType).toBe("TransferWithAuthorization");
    expect(typed.domain.chainId).toBe(84532);
    const { decoded } = xPaymentOf(fetchMock.mock.calls[1]?.[1] as RequestInit);
    expect(decoded.payload.signature).toBe(providerSig);
  });

  it("switches to the payment chain in the browser", async () => {
    stubBrowser();
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(okRes());
    const { signer, providerRequest } = makeViemSigner(ADDRESS_A);
    const getSigner = vi.fn().mockResolvedValue(signer);

    await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, postInit());

    expect(providerRequest).toHaveBeenCalledWith({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x14a34" }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("adds an unknown chain when the browser switch reports 4902", async () => {
    stubBrowser();
    fetchMock
      .mockResolvedValueOnce(res402Header(exactFixture()))
      .mockResolvedValueOnce(okRes());
    const { signer, providerRequest } = makeViemSigner(ADDRESS_A);
    providerRequest
      .mockRejectedValueOnce({ code: 4902 })
      .mockResolvedValueOnce(undefined);
    const getSigner = vi.fn().mockResolvedValue(signer);

    await payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, postInit());

    expect(providerRequest).toHaveBeenNthCalledWith(1, {
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x14a34" }],
    });
    expect(providerRequest).toHaveBeenNthCalledWith(2, {
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x14a34",
          chainName: "Base Sepolia",
          nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://sepolia.base.org"],
          blockExplorerUrls: ["https://sepolia.basescan.org"],
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects when the browser chain switch is rejected by the user", async () => {
    stubBrowser();
    fetchMock.mockResolvedValueOnce(res402Header(exactFixture()));
    const { signer, providerRequest } = makeViemSigner(ADDRESS_A);
    const err = Object.assign(new Error("user rejected"), { code: 4001 });
    providerRequest.mockRejectedValue(err);
    const getSigner = vi.fn().mockResolvedValue(signer);

    await expect(
      payFetch({ getSigner, apiBase: API_BASE })(PROOFS_URL, postInit()),
    ).rejects.toBe(err);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ignores apiBase in the browser and requires same-origin", async () => {
    stubBrowser();
    const original = res402Header(exactFixture());
    fetchMock.mockResolvedValueOnce(original);
    const getSigner = vi.fn();

    const out = await payFetch({
      getSigner,
      apiBase: "https://other.example.com",
    })("https://other.example.com/v1/proofs", postInit());

    expect(out).toBe(original);
    expect(getSigner).not.toHaveBeenCalled();
  });
});
