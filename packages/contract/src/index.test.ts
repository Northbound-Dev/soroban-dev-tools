import { describe, it, expect, vi } from 'vitest';
import { simulateContract } from './index';
import { SimulationError } from '@soroban-dev/errors';
import type { SorobanClient } from '@soroban-dev/client';
import type { SimulationResult } from '@soroban-dev/types';

const VALID_CONTRACT = 'C' + 'A'.repeat(55);

function makeClient(result: Partial<SimulationResult>): SorobanClient {
  return {
    simulateTransaction: vi.fn().mockResolvedValue({
      success: true,
      returnValue: '',
      minResourceFee: '100',
      footprint: { readOnly: [], readWrite: [] },
      auth: [],
      events: [],
      ...result,
    }),
  } as unknown as SorobanClient;
}

describe('@soroban-dev/contract – simulateContract', () => {
  it('returns the simulation result on success', async () => {
    const client = makeClient({ success: true, returnValue: 'AAAA==' });
    const result = await simulateContract({ client, contractId: VALID_CONTRACT, method: 'balance' });
    expect(result.success).toBe(true);
    expect(result.returnValue).toBe('AAAA==');
  });

  it('throws SimulationError when simulation fails', async () => {
    const client = makeClient({ success: false, error: 'Contract panic' });
    await expect(
      simulateContract({ client, contractId: VALID_CONTRACT, method: 'transfer' }),
    ).rejects.toBeInstanceOf(SimulationError);
  });

  it('throws ValidationError for an invalid contract address', async () => {
    const client = makeClient({});
    await expect(
      simulateContract({ client, contractId: 'INVALID', method: 'transfer' }),
    ).rejects.toThrow();
  });
});
