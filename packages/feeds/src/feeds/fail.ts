/**
 * Shared sync-validation boundary for the built-in feed parsers.
 *
 * The feed parser APIs (`toIsoDate`, ZIP/CSV/DoH parsing, …) are
 * synchronous and signal malformed upstream data by throwing; there is no
 * Promise-returning or Result-typed alternative at these call sites without
 * changing the public parser signatures. Confining the single `throw` to this
 * one helper keeps the imperative boundary — and its `eslint-disable` — in
 * exactly one place for the whole feeds package instead of one copy per feed.
 */

/** Raise a validation error at a feed-parser API boundary. */
export const fail = (message: string): never => {
  // imperative: sync parser API must throw — no functional alternative
  // eslint-disable-next-line functional/no-throw-statements
  throw new Error(message);
};
