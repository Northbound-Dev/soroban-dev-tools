import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as freighterApi from '@stellar/freighter-api';
import { WalletError } from '@soroban-dev/errors';
import { Network, WalletType } from '@soroban-dev/types';
import { FreighterAdapter } from './freighter';

vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn(),
  getPublicKey: vi.fn(),
  getNetwork: vi.fn(),
  signTransaction: vi.fn(),
}));

const MOCK_PUBLIC_KEY = 'G' + 'A'.repeat(55);
const MOCK_UNSIGNED_XDR = 'AAAAAgAAAABex3G8 unsigned==';
const MOCK_SIGNED_XDR = 'AAAAAgAAAABex3G8 signed==';

describe('FreighterAdapter', () => {
  let adapter: FreighterAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    delete (globalThis as Record<string, unknown>)['freighter'];
    adapter = new FreighterAdapter();
  });

  it('has WalletType.Freighter as its adapter type', () => {
    expect(adapter.type).toBe(WalletType.Freighter);
  });

  describe('isAvailable', () => {
    it('returns true when Freighter is detected via isConnected()', () => {
      vi.mocked(freighterApi.isConnected).mockReturnValue(true as unknown as Promise<boolean>);
      expect(adapter.isAvailable()).toBe(true);
    });

    it('returns true when window.freighter is injected and isConnected returns a Promise', () => {
      (globalThis as Record<string, unknown>)['freighter'] = {};
      vi.mocked(freighterApi.isConnected).mockResolvedValue(true);
      expect(adapter.isAvailable()).toBe(true);
    });

    it('returns false when Freighter is not detected', () => {
      vi.mocked(freighterApi.isConnected).mockReturnValue(false as unknown as Promise<boolean>);
      expect(adapter.isAvailable()).toBe(false);
    });

    it('returns false when isConnected throws an error', () => {
      vi.mocked(freighterApi.isConnected).mockImplementation(() => {
        throw new Error('Extension context invalidated');
      });
      expect(adapter.isAvailable()).toBe(false);
    });
  });

  describe('connect', () => {
    it('connects and maps TESTNET to Network.Testnet', async () => {
      vi.mocked(freighterApi.isConnected).mockResolvedValue(true);
      vi.mocked(freighterApi.getPublicKey).mockResolvedValue(MOCK_PUBLIC_KEY);
      vi.mocked(freighterApi.getNetwork).mockResolvedValue('TESTNET');

      const session = await adapter.connect({
        type: WalletType.Freighter,
        network: Network.Testnet,
      });

      expect(session).toEqual({
        type: WalletType.Freighter,
        publicKey: MOCK_PUBLIC_KEY,
        network: Network.Testnet,
        capabilities: {
          soroban: true,
          multisig: false,
        },
      });
    });

    it('maps PUBLIC to Network.Mainnet', async () => {
      vi.mocked(freighterApi.isConnected).mockResolvedValue(true);
      vi.mocked(freighterApi.getPublicKey).mockResolvedValue(MOCK_PUBLIC_KEY);
      vi.mocked(freighterApi.getNetwork).mockResolvedValue('PUBLIC');

      const session = await adapter.connect();
      expect(session.network).toBe(Network.Mainnet);
    });

    it('throws WalletError when extension is not connected', async () => {
      vi.mocked(freighterApi.isConnected).mockResolvedValue(false);

      await expect(adapter.connect()).rejects.toThrow(WalletError);
    });

    it('throws WalletError when user rejects the connection prompt', async () => {
      vi.mocked(freighterApi.isConnected).mockResolvedValue(true);
      vi.mocked(freighterApi.getPublicKey).mockRejectedValue(new Error('User declined access'));
      vi.mocked(freighterApi.getNetwork).mockResolvedValue('TESTNET');

      await expect(adapter.connect()).rejects.toThrow(WalletError);
      await expect(adapter.connect()).rejects.toThrow(/User declined access/);
    });

    it('throws WalletError when extension is installed but locked (empty publicKey)', async () => {
      vi.mocked(freighterApi.isConnected).mockResolvedValue(true);
      vi.mocked(freighterApi.getPublicKey).mockResolvedValue('');
      vi.mocked(freighterApi.getNetwork).mockResolvedValue('TESTNET');

      await expect(adapter.connect()).rejects.toThrow(WalletError);
    });

    it('throws WalletError when Freighter network does not match requested network', async () => {
      vi.mocked(freighterApi.isConnected).mockResolvedValue(true);
      vi.mocked(freighterApi.getPublicKey).mockResolvedValue(MOCK_PUBLIC_KEY);
      vi.mocked(freighterApi.getNetwork).mockResolvedValue('PUBLIC');

      await expect(
        adapter.connect({ type: WalletType.Freighter, network: Network.Testnet }),
      ).rejects.toThrow(WalletError);
    });
  });

  describe('disconnect', () => {
    it('resolves immediately as a no-op', async () => {
      await expect(adapter.disconnect()).resolves.toBeUndefined();
    });
  });

  describe('signTransaction', () => {
    it('signs the XDR on the matching network and returns SignTransactionResult', async () => {
      vi.mocked(freighterApi.getNetwork).mockResolvedValue('TESTNET');
      vi.mocked(freighterApi.signTransaction).mockResolvedValue(MOCK_SIGNED_XDR);
      vi.mocked(freighterApi.getPublicKey).mockResolvedValue(MOCK_PUBLIC_KEY);

      const result = await adapter.signTransaction({
        xdr: MOCK_UNSIGNED_XDR,
        network: Network.Testnet,
      });

      expect(freighterApi.signTransaction).toHaveBeenCalledWith(MOCK_UNSIGNED_XDR, {
        network: 'TESTNET',
        networkPassphrase: 'Test SDF Network ; September 2015',
      });
      expect(result).toEqual({
        signedXdr: MOCK_SIGNED_XDR,
        signerPublicKey: MOCK_PUBLIC_KEY,
      });
    });

    it('throws WalletError when the user rejects the signing request', async () => {
      vi.mocked(freighterApi.getNetwork).mockResolvedValue('TESTNET');
      vi.mocked(freighterApi.signTransaction).mockRejectedValue(
        new Error('User declined to sign'),
      );

      await expect(
        adapter.signTransaction({
          xdr: MOCK_UNSIGNED_XDR,
          network: Network.Testnet,
        }),
      ).rejects.toThrow(WalletError);
    });

    it('throws WalletError when transaction is signed on the wrong network', async () => {
      vi.mocked(freighterApi.getNetwork).mockResolvedValue('PUBLIC');

      await expect(
        adapter.signTransaction({
          xdr: MOCK_UNSIGNED_XDR,
          network: Network.Testnet,
        }),
      ).rejects.toThrow(WalletError);
    });
  });
});
