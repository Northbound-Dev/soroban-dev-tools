/**
 * Network identifiers for the Stellar ecosystem.
 */
export enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  Futurenet = 'futurenet',
  Local = 'local',
}

/**
 * Status of a Soroban transaction submission or simulation.
 */
export enum TransactionStatus {
  /** Transaction was successfully applied to the ledger. */
  Success = 'SUCCESS',
  /** Transaction failed and was not applied. */
  Error = 'ERROR',
  /** Transaction was not found (may have expired or not yet submitted). */
  NotFound = 'NOT_FOUND',
  /** Transaction is pending and has not yet been included in a ledger. */
  Pending = 'PENDING',
}

/**
 * The lifecycle state of a deployed Soroban contract.
 */
export enum ContractState {
  Active = 'active',
  Expired = 'expired',
  Archived = 'archived',
}

/**
 * Storage durability categories for Soroban contract state.
 */
export enum StorageDurability {
  Persistent = 'persistent',
  Temporary = 'temporary',
  Instance = 'instance',
}

/**
 * Wallet adapter identifiers supported by @soroban-dev/wallet.
 */
export enum WalletType {
  Freighter = 'freighter',
  Albedo = 'albedo',
  WalletConnect = 'walletconnect',
  Rabet = 'rabet',
}
