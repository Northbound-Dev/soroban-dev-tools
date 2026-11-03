import { describe, it, expect, beforeEach } from 'vitest';
import { registerAdapter, getAdapter, connectWallet } from './index';
import { WalletType, Network } from '@soroban-dev/types';
import { WalletError } from '@soroban-dev/errors';
import type { WalletAdapter } from './index';
import type { ConnectWalletOptions, WalletSession } from '@soroban-dev/types';

const mockSession: WalletSession = {
  type: WalletType.Freighter,
  publicKey: 'G' + 'A'.repeat(55),
  network: Network.Testnet,
  capabilities: { soroban: true, multisig: false },
};

function makeMockAdapter(available: boolean): WalletAdapter {
  return {
    type: WalletType.Freighter,
    isAvailable: () => available,
    connect: async (_opts?: ConnectWalletOptions) => mockSession,
    disconnect: async () => undefined,
    signTransaction: async () => ({ signedXdr: 'signed==', signerPublicKey: 'G' + 'A'.repeat(55) }),
  };
}

describe('@soroban-dev/wallet', () => {
  beforeEach(() => {
    // Reset the internal registry between tests by re-registering
  });

  describe('getAdapter', () => {
    it('throws WalletError when no adapter is registered', () => {
      expect(() => getAdapter(WalletType.Rabet)).toThrow(WalletError);
    });
  });

  describe('registerAdapter + getAdapter', () => {
    it('returns the registered adapter', () => {
      const adapter = makeMockAdapter(true);
      registerAdapter(adapter);
      expect(getAdapter(WalletType.Freighter)).toBe(adapter);
    });
  });

  describe('connectWallet', () => {
    it('returns a session when the wallet is available', async () => {
      registerAdapter(makeMockAdapter(true));
      const session = await connectWallet({ type: WalletType.Freighter, network: Network.Testnet });
      expect(session.publicKey).toBe(mockSession.publicKey);
    });

    it('throws WalletError when the wallet is not available', async () => {
      registerAdapter(makeMockAdapter(false));
      await expect(
        connectWallet({ type: WalletType.Freighter }),
      ).rejects.toBeInstanceOf(WalletError);
    });
  });
});
