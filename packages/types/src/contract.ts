import type { ContractId, AccountId, LedgerSequence } from './common';
import type { ContractState, StorageDurability } from './enums';

/**
 * Metadata about a deployed Soroban contract.
 */
export interface ContractMeta {
  contractId: ContractId;
  wasmHash: string;
  createdBy: AccountId;
  createdAt: LedgerSequence;
  state: ContractState;
}

/**
 * A single storage entry in a contract's state.
 */
export interface ContractStorageEntry {
  key: string;
  value: string;
  durability: StorageDurability;
  /** Ledger sequence at which this entry expires, if applicable. */
  expiresAt?: LedgerSequence;
}

/**
 * Footprint (read/write sets) returned from a contract simulation.
 */
export interface TransactionFootprint {
  readOnly: string[];
  readWrite: string[];
}

/**
 * Input parameters for invoking a Soroban contract method.
 */
export interface ContractInvocation {
  contractId: ContractId;
  method: string;
  /** XDR-encoded ScVal arguments. */
  args: string[];
  /** Ledger sequence to use as the transaction's minimum ledger number. */
  ledgerSequence?: LedgerSequence;
}

/**
 * Result of simulating a contract invocation.
 */
export interface SimulationResult {
  /** XDR-encoded ScVal return value. */
  returnValue: string;
  /** Estimated fee in stroops. */
  minResourceFee: string;
  footprint: TransactionFootprint;
  /** Raw Soroban auth entries (XDR). */
  auth: string[];
  /** Any diagnostic events emitted during simulation. */
  events: string[];
  /** Whether the simulation succeeded. */
  success: boolean;
  error?: string;
}
