import { describe, it, expect } from "vitest";
import { create } from "./client";
import { encrypt } from "./crypto";

describe("encrypt", () => {
  const client = create({ apiBase: "http://localhost:8787" });

  it("returns docHash starting with 0x and a cid starting with bafy", async () => {
    const result = await encrypt(client, {
      payload: { age: 25, country: "JP" },
      holderKey: "holder-pub-key-123",
    });

    expect(result.docHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.cid).toMatch(/^bafy/);
    expect(result.encryptedDocBase64).toBeTruthy();
  });

  it("produces different docHash for different payloads", async () => {
    const a = await encrypt(client, { payload: { x: 1 }, holderKey: "k" });
    const b = await encrypt(client, { payload: { x: 2 }, holderKey: "k" });
    expect(a.docHash).not.toBe(b.docHash);
  });
});
