import { beforeEach, describe, expect, it, vi } from "vitest";

const { proveMock, createMock } = vi.hoisted(() => ({
  proveMock: vi.fn(),
  createMock: vi.fn(() => ({})),
}));

vi.mock("@lemmaoracle/sdk", () => ({
  create: createMock,
  prover: { prove: proveMock },
}));

import { prove } from "./prove.js";

describe("prove", () => {
  beforeEach(() => {
    proveMock.mockReset();
    createMock.mockReset();
    createMock.mockReturnValue({});
  });

  it("delegates to prover.prove with the input and a default caching-fetcher client", async () => {
    proveMock.mockResolvedValue({ proof: "p", inputs: ["0x1"] });

    const out = await prove({ circuitId: "c1", witness: { role: "admin" } });

    expect(out).toEqual({ proof: "p", inputs: ["0x1"] });
    expect(proveMock).toHaveBeenCalledWith(expect.anything(), {
      circuitId: "c1",
      witness: { role: "admin" },
    });
    expect(createMock).toHaveBeenCalledWith({}, expect.any(Function));
  });

  it("uses the provided client without constructing a new one", async () => {
    proveMock.mockResolvedValue({ proof: "p", inputs: [] });
    const client = {} as never;

    await prove({ circuitId: "c2", witness: {} }, { client });

    expect(proveMock).toHaveBeenCalledWith(client, { circuitId: "c2", witness: {} });
    expect(createMock).not.toHaveBeenCalled();
  });
});
