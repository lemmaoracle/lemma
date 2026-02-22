import { describe, it, expect } from "vitest";
import { create } from "./client";
import { sign, reveal, toSelectiveDisclosure } from "./disclose";

describe("disclose", () => {
  const client = create({ apiBase: "http://localhost:8787" });

  it("sign returns a bbs+ signature string", async () => {
    const result = await sign(client, {
      payload: { age: 25 },
      issuerKey: "issuer-priv-key",
      issuerId: "issuer-1",
    });
    expect(result.signature).toMatch(/^bbs\+:localdev:/);
  });

  it("reveal returns disclosed attrs and proof", async () => {
    const signed = await sign(client, {
      payload: { age: 25, country: "JP" },
      issuerKey: "key",
      issuerId: "iss",
    });
    const revealed = await reveal(client, {
      signedPayload: signed.signature,
      attributes: ["age"],
    });
    expect(revealed.disclosed).toHaveProperty("age");
    expect(revealed.proof).toMatch(/^bbs\+-sd:localdev:/);
  });

  it("toSelectiveDisclosure wraps output in spec format", async () => {
    const revealed = await reveal(client, {
      signedPayload: "sig",
      attributes: ["x"],
    });
    const sd = toSelectiveDisclosure(revealed);
    expect(sd.format).toBe("bbs+");
    expect(sd.disclosedAttributes).toEqual(revealed.disclosed);
    expect(sd.proof).toBe(revealed.proof);
  });
});
