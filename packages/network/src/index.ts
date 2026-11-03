import { Network } from '@soroban-dev/types';
import type { NetworkConfig } from '@soroban-dev/types';

/** Stellar network passphrases. */
export const NETWORK_PASSPHRASES: Record<Network, string> = {
  [Network.Mainnet]: 'Public Global Stellar Network ; September 2015',
  [Network.Testnet]: 'Test SDF Network ; September 2015',
  [Network.Futurenet]: 'Test SDF Future Network ; October 2022',
  [Network.Local]: 'Standalone Network ; February 2017',
};

/** Default Soroban RPC endpoints for each network. */
export const RPC_URLS: Record<Network, string> = {
  [Network.Mainnet]: 'https://mainnet.stellar.validationcloud.io/v1/soroban/rpc',
  [Network.Testnet]: 'https://soroban-testnet.stellar.org',
  [Network.Futurenet]: 'https://rpc-futurenet.stellar.org',
  [Network.Local]: 'http://localhost:8000/soroban/rpc',
};

/** Default Horizon endpoints for each network. */
export const HORIZON_URLS: Record<Network, string> = {
  [Network.Mainnet]: 'https://horizon.stellar.org',
  [Network.Testnet]: 'https://horizon-testnet.stellar.org',
  [Network.Futurenet]: 'https://horizon-futurenet.stellar.org',
  [Network.Local]: 'http://localhost:8000',
};

/**
 * Pre-configured `NetworkConfig` for Stellar Mainnet.
 *
 * @example
 * ```ts
 * import { MAINNET } from '@soroban-dev/network';
 * const client = new SorobanClient({ network: MAINNET });
 * ```
 */
export const MAINNET: NetworkConfig = {
  network: Network.Mainnet,
  rpcUrl: RPC_URLS[Network.Mainnet],
  horizonUrl: HORIZON_URLS[Network.Mainnet],
  passphrase: NETWORK_PASSPHRASES[Network.Mainnet],
};

/**
 * Pre-configured `NetworkConfig` for Stellar Testnet.
 *
 * @example
 * ```ts
 * import { TESTNET } from '@soroban-dev/network';
 * const client = new SorobanClient({ network: TESTNET });
 * ```
 */
export const TESTNET: NetworkConfig = {
  network: Network.Testnet,
  rpcUrl: RPC_URLS[Network.Testnet],
  horizonUrl: HORIZON_URLS[Network.Testnet],
  passphrase: NETWORK_PASSPHRASES[Network.Testnet],
};

/**
 * Pre-configured `NetworkConfig` for Stellar Futurenet.
 */
export const FUTURENET: NetworkConfig = {
  network: Network.Futurenet,
  rpcUrl: RPC_URLS[Network.Futurenet],
  horizonUrl: HORIZON_URLS[Network.Futurenet],
  passphrase: NETWORK_PASSPHRASES[Network.Futurenet],
};

/**
 * Pre-configured `NetworkConfig` for a local development node.
 */
export const LOCAL: NetworkConfig = {
  network: Network.Local,
  rpcUrl: RPC_URLS[Network.Local],
  horizonUrl: HORIZON_URLS[Network.Local],
  passphrase: NETWORK_PASSPHRASES[Network.Local],
};

/**
 * Resolves a `NetworkConfig`, filling in default RPC and Horizon URLs when
 * not explicitly provided.
 *
 * @param config - Partial or full network configuration.
 * @returns A complete `NetworkConfig` with all fields populated.
 *
 * @example
 * ```ts
 * const config = resolveNetworkConfig({ network: Network.Testnet });
 * // { network: 'testnet', rpcUrl: 'https://...', horizonUrl: 'https://...', passphrase: '...' }
 * ```
 */
export function resolveNetworkConfig(config: NetworkConfig): Required<NetworkConfig> {
  return {
    network: config.network,
    rpcUrl: config.rpcUrl ?? RPC_URLS[config.network],
    horizonUrl: config.horizonUrl ?? HORIZON_URLS[config.network],
    passphrase: config.passphrase ?? NETWORK_PASSPHRASES[config.network],
  };
}
