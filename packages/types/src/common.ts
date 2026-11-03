import type { Network } from './enums';

/**
 * A Stellar account public key (G… address).
 */
export type AccountId = string;

/**
 * A Soroban contract address (C… address).
 */
export type ContractId = string;

/**
 * Base58-encoded XDR string representing a Stellar transaction envelope.
 */
export type TransactionEnvelope = string;

/**
 * A SHA-256 transaction hash (hex string).
 */
export type TransactionHash = string;

/**
 * Ledger sequence number.
 */
export type LedgerSequence = number;

/**
 * Generic paginated response envelope.
 */
export interface PaginatedResponse<T> {
  items: T[];
  /** Cursor for the next page, or undefined when on the last page. */
  nextCursor?: string;
  total?: number;
}

/**
 * Generic success/error API response envelope.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Network configuration passed to any client or helper.
 */
export interface NetworkConfig {
  network: Network;
  /** Override the RPC server URL. Defaults to a well-known public endpoint. */
  rpcUrl?: string;
  /** Override the Horizon server URL. */
  horizonUrl?: string;
  /** Network passphrase. Derived from `network` if not provided. */
  passphrase?: string;
}

/**
 * Optional request-level options accepted by most SDK methods.
 */
export interface RequestOptions {
  /** Abort controller signal for cancellation. */
  signal?: AbortSignal;
  /** Override the timeout in milliseconds for this request only. */
  timeoutMs?: number;
}
