import type { SorobanClient } from '@soroban-dev/client';
import type { SimulationResult, SendTransactionResponse } from '@soroban-dev/types';
import { TransactionStatus } from '@soroban-dev/types';

/**
 * Creates a mock `SorobanClient` suitable for use in unit tests.
 *
 * All methods return sensible defaults. Override specific methods as needed.
 *
 * @param overrides - Partial method overrides.
 * @returns A mock `SorobanClient`.
 *
 * @example
 * ```ts
 * import { createMockClient } from '@soroban-dev/test';
 *
 * const client = createMockClient({
 *   getHealth: async () => 'healthy',
 * });
 * ```
 */
export function createMockClient(overrides: Partial<SorobanClient> = {}): SorobanClient {
  const defaultSimResult: SimulationResult = {
    success: true,
    returnValue: '',
    minResourceFee: '100',
    footprint: { readOnly: [], readWrite: [] },
    auth: [],
    events: [],
  };

  const defaultSendResult: SendTransactionResponse = {
    hash: 'mock_tx_hash_' + Math.random().toString(36).slice(2),
    status: TransactionStatus.Success,
  };

  return {
    call: async () => ({} as never),
    getHealth: async () => 'healthy',
    getLatestLedger: async () => 1_000_000,
    simulateTransaction: async () => defaultSimResult,
    sendTransaction: async () => defaultSendResult,
    getTransaction: async () => defaultSendResult,
    ...overrides,
  } as SorobanClient;
}

/**
 * Returns a stub simulation result for use in unit tests.
 *
 * @param overrides - Fields to override from the default.
 * @returns A `SimulationResult` with predictable values.
 *
 * @example
 * ```ts
 * const sim = stubSimulationResult({ returnValue: 'AAAA==' });
 * ```
 */
export function stubSimulationResult(
  overrides: Partial<SimulationResult> = {},
): SimulationResult {
  return {
    success: true,
    returnValue: '',
    minResourceFee: '100',
    footprint: { readOnly: [], readWrite: [] },
    auth: [],
    events: [],
    ...overrides,
  };
}

/**
 * A well-known Stellar testnet account address for use in tests.
 * This is a publicly derivable test key — never use it for real funds.
 */
export const TEST_ACCOUNT = 'G' + 'A'.repeat(55);

/**
 * A well-known Soroban contract address for use in tests.
 */
export const TEST_CONTRACT = 'C' + 'A'.repeat(55);
