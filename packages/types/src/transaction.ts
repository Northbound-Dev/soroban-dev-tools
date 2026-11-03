import type { AccountId, TransactionHash, TransactionEnvelope, LedgerSequence } from './common';
import type { TransactionStatus } from './enums';

/**
 * A raw Soroban transaction as returned by the JSON-RPC API.
 */
export interface SorobanTransaction {
  hash: TransactionHash;
  status: TransactionStatus;
  ledger?: LedgerSequence;
  createdAt?: string;
  applicationOrder?: number;
  feeBump?: boolean;
  envelopeXdr: TransactionEnvelope;
  resultXdr?: string;
  resultMetaXdr?: string;
}

/**
 * Parameters for building a Soroban transaction.
 */
export interface BuildTransactionParams {
  sourceAccount: AccountId;
  /** XDR-encoded Soroban operation. */
  operationXdr: string;
  /** Maximum fee in stroops (default: 100). */
  fee?: number;
  /** Transaction memo. */
  memo?: string;
  /** Time bounds (unix timestamps). */
  timeBounds?: {
    minTime: number;
    maxTime: number;
  };
}

/**
 * A signed transaction ready for submission.
 */
export interface SignedTransaction {
  hash: TransactionHash;
  envelopeXdr: TransactionEnvelope;
  /** The account that signed the transaction. */
  signedBy: AccountId;
}

/**
 * Response from the Soroban RPC `sendTransaction` method.
 */
export interface SendTransactionResponse {
  hash: TransactionHash;
  status: TransactionStatus;
  errorResultXdr?: string;
  diagnosticEventsXdr?: string[];
}
