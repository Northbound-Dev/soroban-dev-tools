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
 * A contract (or system) event emitted on-chain and returned by the Soroban
 * RPC `getEvents` method.
 */
export interface ContractEvent {
  /** Event source type. `"contract"` for user events, `"system"` for diagnostic events. */
  type: 'contract' | 'system';
  /** Ledger sequence in which the event was emitted. */
  ledger: LedgerSequence;
  /** ISO-8601 timestamp of when `ledger` was closed. */
  ledgerClosedAt?: string;
  /** Contract that emitted the event, when applicable. */
  contractId?: ContractId;
  /** Stable identifier for this event (also usable as a paging token). */
  id?: string;
  /** XDR-encoded ScVal topic values, in emission order. */
  topic: string[];
  /** XDR-encoded ScVal event body. */
  value: string;
  /** Opaque paging token for this event. */
  pagingToken?: string;
  /** Whether the event was emitted during a successful contract call. */
  inSuccessfulContractCall?: boolean;
}

/**
 * Options accepted by `SorobanClient.watchContractEvents`.
 */
export interface WatchContractEventsOptions {
  /** Contract whose events should be delivered. */
  contractId: ContractId;
  /**
   * Optional topic filter. Each entry corresponds to a topic position and is
   * matched against the XDR-encoded topic at that position; `null` matches any
   * value at that position.
   */
  topics?: (string | null)[][];
  /** Ledger sequence to start polling from. Defaults to the RPC's latest ledger. */
  startLedger?: LedgerSequence;
  /** Polling interval in milliseconds. Default: 6_000. */
  pollIntervalMs?: number;
  /**
   * Invoked when a poll attempt fails. Polling errors are never thrown from
   * the watch loop; without this callback they are silently swallowed.
   */
  onError?: (error: Error) => void;
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
