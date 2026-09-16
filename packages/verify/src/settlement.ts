/**
 * Settlement verification — 着金照合 (future API).
 *
 * Verifies that a stablecoin transfer actually settled at the counterparty by
 * checking the on-chain transaction against an expected destination. The
 * on-chain verification backend and the full input/output shape are TBD;
 * this module reserves the `settlement` surface of the verify SDK.
 */

export type SettlementExpectation = Readonly<{
  to: string;
  amount: string;
  asset: string;
}>;

export type SettlementResult =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; reason: string }>;

/** Not implemented yet — on-chain verification backend is TBD. */
export const settlement = (
  _txHash: string,
  _expectation: SettlementExpectation,
): Promise<SettlementResult> =>
  Promise.reject(new Error("settlement verification not implemented"));
