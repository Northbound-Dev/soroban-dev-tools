import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSoroban } from './SorobanProvider';
import type { ContractInvocation, SimulationResult } from '@soroban-dev/types';

/**
 * React hook that simulates a Soroban contract method call.
 *
 * The query is automatically enabled when `invocation` is provided and
 * disabled (skipped) when it is `null`.
 *
 * @param invocation - The contract method invocation, or `null` to skip.
 * @returns A TanStack Query result containing the simulation result.
 *
 * @example
 * ```tsx
 * const { data: sim, isLoading } = useSimulateContract({
 *   contractId: 'C...',
 *   method: 'balance',
 *   args: [accountXdr],
 * });
 * ```
 */
export function useSimulateContract(
  invocation: ContractInvocation | null,
): UseQueryResult<SimulationResult, Error> {
  const { client } = useSoroban();

  return useQuery({
    queryKey: ['soroban', 'simulate', invocation?.contractId, invocation?.method, invocation?.args],
    queryFn: () => {
      if (!invocation) throw new Error('No invocation provided');
      return client.simulateTransaction(invocation);
    },
    enabled: invocation !== null,
  });
}
