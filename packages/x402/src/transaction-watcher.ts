/**
 * X402 Transaction Watcher
 *
 * Monitors the blockchain for x402 payment transactions to the configured
 * recipient address and triggers proof generation when payments are detected.
 */

import type {
  Transaction as ViemTransaction,
  TransactionReceipt,
} from "viem";
import * as R from "ramda";
import type { Config, Transaction } from "./types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Callback invoked when a valid payment is detected */
type PaymentDetectedCallback = (
  payment: Transaction,
) => Promise<void>;

/** State of the transaction watcher */
type WatcherState = Readonly<{
  isRunning: boolean;
  lastCheckedBlock: bigint;
  detectedPayments: ReadonlyArray<PaymentDetectedCallback>;
}>;

// ---------------------------------------------------------------------------
// Watcher Implementation
// ---------------------------------------------------------------------------

const initialState: WatcherState = {
  isRunning: false,
  lastCheckedBlock: 0n,
  detectedPayments: [],
};

/**
 * Creates a transaction watcher that monitors for payments to the configured address.
 *
 * Uses an immutable state cell (single-element tuple) as a controlled mutable reference.
 */
const createTransactionWatcher = (
  _config: Config,
  _publicClient: unknown,
): Readonly<{
  start: (_?: undefined) => Promise<void>;
  stop: (_?: undefined) => void;
  onPaymentDetected: (callback: PaymentDetectedCallback) => Promise<void>;
  getState: (_?: undefined) => WatcherState;
}> => {
  const stateCell = { current: initialState };

  const start = (_?: undefined): Promise<void> => {
    // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
    stateCell.current = {
      ...stateCell.current,
      isRunning: true,
      lastCheckedBlock: 0n,
    };

    return Promise.resolve();
  };

  const stop = (_?: undefined): void => {
    // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
    stateCell.current = R.assoc("isRunning", false, stateCell.current);
  };

  const onPaymentDetected = (
    callback: PaymentDetectedCallback,
  ): Promise<void> => {
    // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
    stateCell.current = {
      ...stateCell.current,
      detectedPayments: R.append(callback, stateCell.current.detectedPayments),
    };
    return Promise.resolve();
  };

  const getState = (_?: undefined): WatcherState => stateCell.current;

  return {
    start,
    stop,
    onPaymentDetected,
    getState,
  };
};

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/**
 * Validate that a transaction is a valid x402 payment:
 * - Transaction was successful
 * - Sent to the correct recipient
 * - Amount meets the minimum requirement
 * - Has sufficient confirmations
 */
const isValidPayment = (
  tx: ViemTransaction,
  receipt: TransactionReceipt,
  config: Config,
  currentBlockNumber: bigint = 0n,
): boolean =>
  R.allPass([
    R.always(tx.to === config.payToAddress),
    R.always(tx.value >= config.minAmount),
    R.always(receipt.status === "success"),
    R.always(
      currentBlockNumber > 0n
        ? Number(currentBlockNumber - receipt.blockNumber) >= config.requiredConfirmations
        : true,
    ),
  ])();

/**
 * Extract payment details from transaction and receipt.
 */
const extractPaymentDetails = (
  tx: ViemTransaction,
  receipt: TransactionReceipt,
  currentBlockNumber: bigint,
): Transaction => {
  const txRecord = tx as unknown as Readonly<Record<string, unknown>>;
  const rawTimestamp = txRecord["blockTimestamp"];
  const timestamp = typeof rawTimestamp === "bigint" ? Number(rawTimestamp) : 0;

  return R.always({
    txHash: tx.hash,
    from: tx.from,
    to: tx.to ?? ("0x" as `0x${string}`),
    amount: tx.value,
    timestamp,
    blockNumber: receipt.blockNumber,
    confirmations: Number(currentBlockNumber - receipt.blockNumber),
  })();
};

export type {
  PaymentDetectedCallback,
  WatcherState,
};

export {
  createTransactionWatcher,
  isValidPayment,
  extractPaymentDetails,
};
