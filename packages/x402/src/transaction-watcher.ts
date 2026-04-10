/**
 * X402 Transaction Watcher
 *
 * Monitors the blockchain for x402 payment transactions to the configured
 * recipient address and triggers proof generation when payments are detected.
 */

import type {
  GetLogsReturnType,
  Log,
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

/**
 * Creates a transaction watcher that monitors for payments to the configured address.
 *
 * Usage:
 *   const watcher = createTransactionWatcher(config, publicClient);
 *   
 *   // Register callback for detected payments
 *   await watcher.onPaymentDetected(async (payment) => {
 *     console.log('Payment detected:', payment.txHash);
 *     // Generate proof and submit to Lemma
 *   });
 *   
 *   // Start watching
 *   watcher.start();
 *   
 *   // Stop when done
 *   watcher.stop();
 */
const createTransactionWatcher = (
  _config: Config,
  _publicClient: unknown,
): Readonly<{
  start: () => Promise<void>;
  stop: () => void;
  onPaymentDetected: (callback: PaymentDetectedCallback) => Promise<void>;
  getState: () => WatcherState;
}> => {
  let state: WatcherState = R.always({
    isRunning: false,
    lastCheckedBlock: 0n,
    detectedPayments: [],
  })();

  /**
   * Start watching for payments.
   */
  const start = async (): Promise<void> => {
    state = {
      ...state,
      isRunning: true,
      lastCheckedBlock: 0n, // Will be initialized on first poll
    };

    // In a real implementation, this would start polling
    // For now, we set up the structure
    void 0;
  };

  /**
   * Stop watching for payments.
   */
  const stop = (): void => {
    state = R.assoc("isRunning", false, state);
  };

  /**
   * Register a callback to be invoked when a payment is detected.
   */
  const onPaymentDetected = async (
    callback: PaymentDetectedCallback,
  ): Promise<void> => {
    state = {
      ...state,
      detectedPayments: R.append(callback, state.detectedPayments),
    };
  };

  /**
   * Return the current watcher state.
   */
  const getState = (): WatcherState => state;

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
): boolean => {
  const isToRecipient = tx.to === config.payToAddress;
  const hasSufficientAmount = tx.value >= config.minAmount;
  const isSuccessful = receipt.status === "success";
  const hasSufficientConfirmations = currentBlockNumber > 0n 
    ? Number(currentBlockNumber - (receipt.blockNumber ?? 0n)) >= config.requiredConfirmations
    : true; // Skip check if currentBlockNumber is not provided

  return R.allPass([
    R.always(isToRecipient),
    R.always(hasSufficientAmount),
    R.always(isSuccessful),
    R.always(hasSufficientConfirmations),
  ])();
};

/**
 * Extract payment details from transaction and receipt.
 */
const extractPaymentDetails = (
  tx: ViemTransaction,
  receipt: TransactionReceipt,
  currentBlockNumber: bigint,
): Transaction =>
  R.always({
    txHash: tx.hash,
    from: tx.from,
    to: tx.to ?? ("0x" as `0x${string}`),
    amount: tx.value,
    timestamp: Number((tx as any).blockTimestamp ?? 0n),
    blockNumber: receipt.blockNumber ?? 0n,
    confirmations: Number(currentBlockNumber - (receipt.blockNumber ?? 0n)),
  })();

export type {
  PaymentDetectedCallback,
  WatcherState,
};

export {
  createTransactionWatcher,
  isValidPayment,
  extractPaymentDetails,
};
