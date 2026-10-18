import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { decode } from "./policy.js";

const fixture = JSON.parse(
  readFileSync(new URL("../../../../fixtures/policy-sharing/v1.json", import.meta.url), "utf8"),
);
const snapshot = fixture.snapshot;

describe("strict snapshot decode", () => {
  it("decodes fixture fields without JSON number rounding", () => {
    const result = decode(snapshot);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.member.root).toBe(BigInt(snapshot.member.root));
      expect(result.value.grant.root).toBe(BigInt(snapshot.grant.root));
      expect(result.value.epoch).toBe(7n);
    }
  });
  it.each([
    "01",
    "+1",
    "-1",
    " 1",
    "1 ",
    "1\n",
    "1.0",
    "1e2",
    "0x1",
    "",
    1,
    null,
    fixture.constants.field,
  ])("rejects noncanonical or out-of-field decimal %s on every axis and epoch", (bad) => {
    expect(decode({ ...snapshot, epoch: bad }).ok).toBe(false);
    for (const name of ["member", "grant"])
      expect(decode({ ...snapshot, [name]: { ...snapshot[name], root: bad } }).ok).toBe(false);
  });
  it("accepts root zero and field minus one, but rejects epoch zero", () => {
    expect(
      decode({
        ...snapshot,
        member: { ...snapshot.member, root: "0" },
        grant: { ...snapshot.grant, root: (BigInt(fixture.constants.field) - 1n).toString() },
      }).ok,
    ).toBe(true);
    expect(decode({ ...snapshot, epoch: "0" }).ok).toBe(false);
  });
  it.each(["member", "grant", "epoch", "publishedAt", "version", "scheme", "scope"])(
    "rejects missing %s",
    (key) => {
      const partial = { ...snapshot };
      delete partial[key];
      expect(decode(partial).ok).toBe(false);
    },
  );
  it.each([0, 2, "1", null])("rejects unsupported version %s", (version) => {
    expect(decode({ ...snapshot, version }).ok).toBe(false);
  });
  it.each([
    "2026-02-30T00:00:00.000Z",
    "2026-10-17",
    "2026-10-17T00:00:00Z",
    "2026-10-17T00:00:00.000+00:00",
    "invalid",
    null,
  ])("rejects invalid/noncanonical timestamp %s", (publishedAt) => {
    expect(decode({ ...snapshot, publishedAt }).ok).toBe(false);
  });
  it.each([-1, 1.5, 2 ** 20 + 1, "3", null])("rejects invalid counts %s", (bad) => {
    for (const axis of ["member", "grant"]) {
      for (const key of ["leafCount", "revokedCount"])
        expect(decode({ ...snapshot, [axis]: { ...snapshot[axis], [key]: bad } }).ok).toBe(false);
    }
  });
  it("checks count relationship, complete fixed axes, extra keys and scope/scheme", () => {
    for (const axis of ["member", "grant"]) {
      expect(decode({ ...snapshot, [axis]: { ...snapshot[axis], revokedCount: 4 } }).ok).toBe(
        false,
      );
      expect(decode({ ...snapshot, [axis]: { ...snapshot[axis], extra: true } }).ok).toBe(false);
      expect(
        decode({ ...snapshot, [axis]: { root: "0", leafCount: 2 ** 20, revokedCount: 2 ** 20 } })
          .ok,
      ).toBe(true);
    }
    for (const input of [
      null,
      [],
      "snapshot",
      { ...snapshot, extra: true },
      { ...snapshot, scheme: "other" },
      { ...snapshot, scope: " " },
    ])
      expect(decode(input).ok).toBe(false);
  });
});
