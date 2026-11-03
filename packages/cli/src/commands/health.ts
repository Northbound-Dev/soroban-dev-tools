import { SorobanClient } from '@soroban-dev/client';
import { resolveNetworkConfig } from '@soroban-dev/network';
import { Network } from '@soroban-dev/types';

/**
 * Options for the `health` command.
 */
export interface HealthCommandOptions {
  network?: string;
  rpcUrl?: string;
}

/**
 * Queries the health of a Soroban RPC endpoint.
 *
 * @param opts - Network and RPC URL options.
 * @returns The health status string.
 *
 * @example
 * ```ts
 * const status = await healthCommand({ network: 'testnet' });
 * console.log(status); // 'healthy'
 * ```
 */
export async function healthCommand(opts: HealthCommandOptions = {}): Promise<string> {
  const networkEnum = (opts.network ?? Network.Testnet) as Network;
  const config = resolveNetworkConfig({
    network: networkEnum,
    rpcUrl: opts.rpcUrl,
  });

  const client = new SorobanClient(config);
  return client.getHealth();
}
