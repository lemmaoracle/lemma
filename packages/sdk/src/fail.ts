/**
 * The SDK's single imperative boundary for sync validation.
 *
 * Sync APIs cannot express "reject" — invalid input must abort the call site
 * by throwing. Every SDK module (and dependent package) that needs to abort
 * synchronously calls {@link raise} instead of throwing directly, so the
 * `throw` statement — and its `eslint-disable` — lives in exactly one place
 * (same convention as `packages/feeds/src/feeds/fail.ts`).
 */

// imperative: sync pre-condition validation must abort the call site — no functional alternative
/* eslint-disable functional/no-throw-statements */
export const raise = (message: string): never => {
  throw new Error(message);
};
/* eslint-enable functional/no-throw-statements */
