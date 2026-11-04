import { WalletError } from '@soroban-dev/errors';
import type {
  ConnectWalletOptions,
  SignTransactionRequest,
  SignTransactionResult,
  WalletSession,
  WalletType,
} from '@soroban-dev/types';

/**
 * Abstract wallet adapter interface.
 * Implement this to add support for a new wallet.
 */
export interface WalletAdapter {
  readonly type: WalletType;
  /** Returns `true` if the wallet extension is detected in the current environment. */
  isAvailable(): boolean;
  /** Requests connection and returns a session. */
  connect(opts?: ConnectWalletOptions): Promise<WalletSession>;
  /** Disconnects the current session. */
  disconnect(): Promise<void>;
  /** Signs a Soroban transaction and returns the signed XDR. */
  signTransaction(req: SignTransactionRequest): Promise<SignTransactionResult>;
}

/**
 * Registry of registered wallet adapters, keyed by `WalletType`.
 */
const adapters = new Map<WalletType, WalletAdapter>();

/**
 * Registers a wallet adapter so it can be resolved by `getAdapter`.
 *
 * @param adapter - The adapter to register.
 *
 * @example
 * ```ts
 * import { registerAdapter } from '@soroban-dev/wallet';
 * registerAdapter(myFreighterAdapter);
 * ```
 */
export function registerAdapter(adapter: WalletAdapter): void {
  adapters.set(adapter.type, adapter);
}

/**
 * Retrieves a registered wallet adapter by type.
 *
 * @param type - The wallet type to look up.
 * @returns The registered adapter.
 * @throws {@link WalletError} if no adapter is registered for the given type.
 *
 * @example
 * ```ts
 * const adapter = getAdapter(WalletType.Freighter);
 * const session = await adapter.connect();
 * ```
 */
export function getAdapter(type: WalletType): WalletAdapter {
  const adapter = adapters.get(type);
  if (!adapter) {
    throw new WalletError(
      `No adapter registered for wallet type "${type}". Call registerAdapter() first.`,
    );
  }
  return adapter;
}

/**
 * Connects to a wallet and returns the session.
 *
 * @param opts - Connection options including the wallet type.
 * @returns The connected wallet session.
 * @throws {@link WalletError} if the wallet is not available or the user rejects the request.
 *
 * @example
 * ```ts
 * import { connectWallet, WalletType } from '@soroban-dev/wallet';
 * import { Network } from '@soroban-dev/types';
 *
 * const session = await connectWallet({ type: WalletType.Freighter, network: Network.Testnet });
 * console.log(session.publicKey);
 * ```
 */
export async function connectWallet(opts: ConnectWalletOptions): Promise<WalletSession> {
  const adapter = getAdapter(opts.type);

  if (!adapter.isAvailable()) {
    throw new WalletError(
      `Wallet "${opts.type}" is not available. Ensure the browser extension is installed.`,
    );
  }

  return adapter.connect(opts);
}


