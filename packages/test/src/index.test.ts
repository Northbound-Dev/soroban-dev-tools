import { describe, it, expect } from 'vitest';
import { createMockClient, stubSimulationResult, TEST_ACCOUNT, TEST_CONTRACT } from './index';
import { TransactionStatus } from '@soroban-dev/types';

describe('@soroban-dev/test – createMockClient', () => {
  it('returns healthy from getHealth', async () => {
    const client = createMockClient();
    expect(await client.getHealth()).toBe('healthy');
  });

  it('returns a ledger sequence from getLatestLedger', async () => {
    const client = createMockClient();
    expect(await client.getLatestLedger()).toBeGreaterThan(0);
  });

  it('allows overriding getHealth', async () => {
    const client = createMockClient({ getHealth: async () => 'degraded' });
    expect(await client.getHealth()).toBe('degraded');
  });

  it('simulateTransaction returns a successful result by default', async () => {
    const client = createMockClient();
    const result = await client.simulateTransaction({
      contractId: TEST_CONTRACT,
      method: 'transfer',
      args: [],
    });
    expect(result.success).toBe(true);
  });

  it('sendTransaction returns SUCCESS status by default', async () => {
    const client = createMockClient();
    const result = await client.sendTransaction('xdr==');
    expect(result.status).toBe(TransactionStatus.Success);
  });
});

describe('@soroban-dev/test – stubSimulationResult', () => {
  it('returns default values', () => {
    const result = stubSimulationResult();
    expect(result.success).toBe(true);
    expect(result.auth).toEqual([]);
  });

  it('applies overrides', () => {
    const result = stubSimulationResult({ success: false, error: 'panic' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('panic');
  });
});

describe('@soroban-dev/test – constants', () => {
  it('TEST_ACCOUNT starts with G', () => {
    expect(TEST_ACCOUNT.startsWith('G')).toBe(true);
  });

  it('TEST_CONTRACT starts with C', () => {
    expect(TEST_CONTRACT.startsWith('C')).toBe(true);
  });
});
