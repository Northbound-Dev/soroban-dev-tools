import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSoroban } from './SorobanProvider';

/**
 * React hook that fetches and caches the latest ledger sequence from the
 * connected Soroban RPC node.
 *
 * Refreshes every 6 seconds (one Stellar ledger close interval).
 *
 * @returns A TanStack Query result containing the ledger sequence number.
 *
 * @example
 * ```tsx
 * function LedgerDisplay() {
 *   const { data: ledger, isLoading } = useLatestLedger();
 *   if (isLoading) return <span>Loading…</span>;
 *   return <span>Ledger {ledger}</span>;
 * }
 * ```
 */
export function useLatestLedger(): UseQueryResult<number, Error> {
  const { client } = useSoroban();

  return useQuery({
    queryKey: ['soroban', 'latestLedger'],
    queryFn: () => client.getLatestLedger(),
    refetchInterval: 6_000,
    staleTime: 5_000,
  });
}
