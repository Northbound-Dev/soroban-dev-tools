import type { SorobanClient } from '@soroban-dev/client';
import { SimulationError } from '@soroban-dev/errors';
import type { ContractInvocation, SimulationResult, ContractId } from '@soroban-dev/types';
import { assertContractId } from '@soroban-dev/utils';

/**
 * Options for a contract method call.
 */
export interface CallContractOptions {
  client: SorobanClient;
  contractId: ContractId;
  method: string;
  /** XDR-encoded ScVal arguments. */
  args?: string[];
}

/**
 * Simulates a contract method call and returns the typed result.
 *
 * @param options - The contract call options.
 * @returns The simulation result.
 * @throws {@link SimulationError} if the simulation fails.
 *
 * @example
 * ```ts
 * import { simulateContract } from '@soroban-dev/contract';
 *
 * const result = await simulateContract({
 *   client,
 *   contractId: 'C...',
 *   method: 'balance',
 *   args: [accountXdr],
 * });
 * ```
 */
export async function simulateContract(options: CallContractOptions): Promise<SimulationResult> {
  const { client, contractId, method, args = [] } = options;

  assertContractId(contractId, 'contractId');

  const invocation: ContractInvocation = { contractId, method, args };
  const result = await client.simulateTransaction(invocation);

  if (!result.success) {
    throw new SimulationError(
      result.error ?? 'Contract simulation failed',
      result.returnValue,
    );
  }

  return result;
}

/**
 * Reads the WASM hash of a deployed contract.
 *
 * @param client - An initialised `SorobanClient`.
 * @param contractId - The contract's C… address.
 * @returns The hex-encoded WASM hash.
 *
 * @example
 * ```ts
 * const wasmHash = await getContractWasmHash(client, 'C...');
 * ```
 */
export async function getContractWasmHash(
  client: SorobanClient,
  contractId: ContractId,
): Promise<string> {
  assertContractId(contractId, 'contractId');
  const result = await client.call<{ wasmHash: string }>('getLedgerEntries', {
    keys: [{ type: 'contractCode', contractId }],
  });
  return result.wasmHash;
}
