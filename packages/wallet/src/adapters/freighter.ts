import { getNetwork, getPublicKey, isConnected, signTransaction } from '@stellar/freighter-api';
import { WalletError } from '@soroban-dev/errors';
import { Network, WalletType } from '@soroban-dev/types';
import type {
  ConnectWalletOptions,
  SignTransactionRequest,
  SignTransactionResult,
  WalletSession,
} from '@soroban-dev/types';
import type { WalletAdapter } from '../index';

const NETWORK_PASSPHRASES: Record<Network, string> = {
  [Network.Mainnet]: 'Public Global Stellar Network ; September 2015',
  [Network.Testnet]: 'Test SDF Network ; September 2015',
  [Network.Futurenet]: 'Test SDF Future Network ; October 2022',
  [Network.Local]: 'Standalone Network ; February 2017',
};

const FREIGHTER_NETWORK_NAMES: Record<Network, string> = {
  [Network.Mainnet]: 'PUBLIC',
  [Network.Testnet]: 'TESTNET',
  [Network.Futurenet]: 'FUTURENET',
  [Network.Local]: 'STANDALONE',
};

/**
 * Maps a Freighter network string (e.g. `"TESTNET"`, `"PUBLIC"`) to the SDK {@link Network} enum.
 *
 * @param freighterNetwork - Raw network string returned by `getNetwork()`.
 * @returns The corresponding {@link Network} enum value.
 * @throws {@link WalletError} if the network identifier is unrecognized.
 */
function mapFreighterNetwork(freighterNetwork: string): Network {
  const normalized = freighterNetwork.trim().toUpperCase();
  switch (normalized) {
    case 'PUBLIC':
    case 'MAINNET':
      return Network.Mainnet;
    case 'TESTNET':
      return Network.Testnet;
    case 'FUTURENET':
      return Network.Futurenet;
    case 'STANDALONE':
    case 'LOCAL':
      return Network.Local;
    default:
      throw new WalletError(`Unsupported Freighter network "${freighterNetwork}".`);
  }
}

/**
 * Concrete {@link WalletAdapter} implementation for the Freighter browser extension wallet.
 *
 * @example
 * ```ts
 * import { FreighterAdapter, registerAdapter, connectWallet } from '@soroban-dev/wallet';
 * import { Network, WalletType } from '@soroban-dev/types';
 *
 * registerAdapter(new FreighterAdapter());
 * const session = await connectWallet({
 *   type: WalletType.Freighter,
 *   network: Network.Testnet,
 * });
 * console.log(session.publicKey);
 * ```
 */
export class FreighterAdapter implements WalletAdapter {
  readonly type = WalletType.Freighter;

  /**
   * Returns `true` when the Freighter extension is detected in the current environment.
   *
   * @returns `true` if Freighter is available, otherwise `false`.
   *
   * @example
   * ```ts
   * const adapter = new FreighterAdapter();
   * if (adapter.isAvailable()) {
   *   await adapter.connect();
   * }
   * ```
   */
  isAvailable(): boolean {
    try {
      const result: unknown = isConnected();
      if (typeof result === 'boolean') {
        return result;
      }
      if (result instanceof Promise) {
        result.catch(() => undefined);
      }
      if (typeof globalThis !== 'undefined' && 'freighter' in globalThis) {
        return Boolean((globalThis as Record<string, unknown>)['freighter']);
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Requests a connection to the Freighter browser extension and returns an active {@link WalletSession}.
   *
   * @param opts - Optional connection preferences such as expected network.
   * @returns The connected {@link WalletSession}.
   * @throws {@link WalletError} if Freighter is unavailable, locked, on the wrong network, or the user rejects the request.
   *
   * @example
   * ```ts
   * const adapter = new FreighterAdapter();
   * const session = await adapter.connect({ type: WalletType.Freighter, network: Network.Testnet });
   * ```
   */
  async connect(opts?: ConnectWalletOptions): Promise<WalletSession> {
    try {
      const connected = await isConnected();
      if (!connected) {
        throw new WalletError(
          'Freighter wallet extension is not available. Ensure the extension is installed and enabled.',
        );
      }

      const [publicKey, rawNetwork] = await Promise.all([getPublicKey(), getNetwork()]);
      if (!publicKey || typeof publicKey !== 'string') {
        throw new WalletError(
          'Freighter did not return a public key. Ensure the wallet is unlocked and access is granted.',
        );
      }

      const network = mapFreighterNetwork(rawNetwork);
      if (opts?.network && opts.network !== network) {
        throw new WalletError(
          `Freighter network mismatch: expected "${opts.network}", but wallet is connected to "${network}".`,
        );
      }

      return {
        type: WalletType.Freighter,
        publicKey,
        network,
        capabilities: {
          soroban: true,
          multisig: false,
        },
      };
    } catch (err: unknown) {
      if (err instanceof WalletError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new WalletError(`Failed to connect to Freighter wallet: ${message}`);
    }
  }

  /**
   * Disconnects the current Freighter session.
   * Freighter does not expose a programmatic disconnect API, so this resolves immediately as a no-op.
   *
   * @returns A promise that resolves immediately.
   *
   * @example
   * ```ts
   * const adapter = new FreighterAdapter();
   * await adapter.disconnect();
   * ```
   */
  async disconnect(): Promise<void> {
    return;
  }

  /**
   * Signs a Soroban transaction envelope using the Freighter extension.
   *
   * @param req - Transaction signing request containing the unsigned XDR and target network.
   * @returns The signed XDR envelope and signer public key.
   * @throws {@link WalletError} if the user rejects the signing prompt or Freighter is on a different network.
   *
   * @example
   * ```ts
   * const adapter = new FreighterAdapter();
   * const signed = await adapter.signTransaction({
   *   xdr: 'AAAAAgAAA...',
   *   network: Network.Testnet,
   * });
   * ```
   */
  async signTransaction(req: SignTransactionRequest): Promise<SignTransactionResult> {
    try {
      const rawNetwork = await getNetwork();
      const activeNetwork = mapFreighterNetwork(rawNetwork);
      if (activeNetwork !== req.network) {
        throw new WalletError(
          `Cannot sign transaction for "${req.network}" while Freighter is set to "${activeNetwork}".`,
        );
      }

      const freighterNetwork = FREIGHTER_NETWORK_NAMES[req.network];
      const networkPassphrase = NETWORK_PASSPHRASES[req.network];

      const signedXdr = await signTransaction(req.xdr, {
        network: freighterNetwork,
        networkPassphrase,
      });

      if (!signedXdr || typeof signedXdr !== 'string') {
        throw new WalletError('Freighter returned an empty signed transaction XDR.');
      }

      const signerPublicKey = await getPublicKey();
      return {
        signedXdr,
        signerPublicKey,
      };
    } catch (err: unknown) {
      if (err instanceof WalletError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new WalletError(`Freighter transaction signing failed: ${message}`);
    }
  }
}
