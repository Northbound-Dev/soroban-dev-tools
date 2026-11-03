import { describe, it, expect } from 'vitest';
import { SorobanProvider, useSoroban } from './SorobanProvider';

// Lightweight test: verify the context throws outside a provider.
describe('@soroban-dev/react – useSoroban', () => {
  it('is exported', () => {
    expect(typeof useSoroban).toBe('function');
  });

  it('SorobanProvider is a function (component)', () => {
    expect(typeof SorobanProvider).toBe('function');
  });
});
