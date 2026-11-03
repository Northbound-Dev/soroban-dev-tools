import { describe, it, expect } from 'vitest';
import { Network } from '@soroban-dev/types';
import {
  MAINNET,
  TESTNET,
  FUTURENET,
  LOCAL,
  NETWORK_PASSPHRASES,
  resolveNetworkConfig,
} from './index';

describe('@soroban-dev/network', () => {
  describe('constants', () => {
    it('MAINNET has the correct passphrase', () => {
      expect(MAINNET.passphrase).toBe(NETWORK_PASSPHRASES[Network.Mainnet]);
    });

    it('TESTNET has the correct RPC URL', () => {
      expect(TESTNET.rpcUrl).toContain('testnet');
    });

    it('FUTURENET is defined', () => {
      expect(FUTURENET.network).toBe(Network.Futurenet);
    });

    it('LOCAL points to localhost', () => {
      expect(LOCAL.rpcUrl).toContain('localhost');
    });
  });

  describe('resolveNetworkConfig', () => {
    it('fills in missing rpcUrl, horizonUrl, and passphrase', () => {
      const resolved = resolveNetworkConfig({ network: Network.Testnet });
      expect(resolved.rpcUrl).toBeDefined();
      expect(resolved.horizonUrl).toBeDefined();
      expect(resolved.passphrase).toBe(NETWORK_PASSPHRASES[Network.Testnet]);
    });

    it('preserves overridden values', () => {
      const custom = 'https://my-custom-rpc.example.com';
      const resolved = resolveNetworkConfig({ network: Network.Testnet, rpcUrl: custom });
      expect(resolved.rpcUrl).toBe(custom);
    });
  });
});
