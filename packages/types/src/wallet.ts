import type { AccountId, TransactionEnvelope } from './common';
import type { Network, WalletType } from './enums';

/**
 * Capabilities advertised by a wallet adapter.
 */
export interface WalletCapabilities {
  /** Whether the wallet supports Soroban transaction signing. */
  soroban: boolean;
  /** Whether the wallet supports multi-signature flows. */
  multisig: boolean;
}

/**
 * A connected wallet session returned after successful connection.
 */
export interface WalletSession {
  type: WalletType;
  publicKey: AccountId;
  network: Network;
  capabilities: WalletCapabilities;
}

/**
 * Options for requesting a wallet connection.
 */
export interface ConnectWalletOptions {
  type: WalletType;
  /** Preferred network. Wallet may override this. */
  network?: Network;
  /** Custom app name shown to the user in the wallet UI. */
  appName?: string;
}

/**
 * Request to sign a Soroban transaction.
 */
export interface SignTransactionRequest {
  xdr: TransactionEnvelope;
  /** Network the transaction is for (used to select the correct passphrase). */
  network: Network;
  /** Human-readable description shown to the user. */
  description?: string;
}

/**
 * Result of a wallet-signed transaction.
 */
export interface SignTransactionResult {
  signedXdr: TransactionEnvelope;
  signerPublicKey: AccountId;
}
