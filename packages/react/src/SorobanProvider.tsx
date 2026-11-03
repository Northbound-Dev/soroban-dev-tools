import { createContext, useContext, type ReactNode } from 'react';
import type { SorobanClient } from '@soroban-dev/client';
import type { WalletSession } from '@soroban-dev/types';

export interface SorobanContextValue {
  client: SorobanClient;
  session: WalletSession | null;
}

const SorobanContext = createContext<SorobanContextValue | null>(null);

export interface SorobanProviderProps {
  client: SorobanClient;
  session?: WalletSession | null;
  children: ReactNode;
}

/**
 * Provides a `SorobanClient` and optional wallet `session` to the React tree.
 *
 * Wrap your application (or a sub-tree) with this provider to make `useSoroban()`
 * available to any descendant component.
 *
 * @example
 * ```tsx
 * import { SorobanProvider } from '@soroban-dev/react';
 * import { SorobanClient } from '@soroban-dev/client';
 * import { TESTNET } from '@soroban-dev/network';
 *
 * const client = new SorobanClient({ ...TESTNET });
 *
 * function App() {
 *   return (
 *     <SorobanProvider client={client}>
 *       <YourApp />
 *     </SorobanProvider>
 *   );
 * }
 * ```
 */
export function SorobanProvider({ client, session = null, children }: SorobanProviderProps) {
  return (
    <SorobanContext.Provider value={{ client, session }}>
      {children}
    </SorobanContext.Provider>
  );
}

/**
 * Returns the `SorobanClient` and optional wallet session from the nearest
 * `<SorobanProvider>`.
 *
 * @throws If called outside of a `<SorobanProvider>`.
 *
 * @example
 * ```tsx
 * const { client, session } = useSoroban();
 * ```
 */
export function useSoroban(): SorobanContextValue {
  const ctx = useContext(SorobanContext);
  if (!ctx) {
    throw new Error('useSoroban() must be called inside a <SorobanProvider>.');
  }
  return ctx;
}
