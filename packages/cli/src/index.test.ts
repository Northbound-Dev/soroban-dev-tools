import { describe, it, expect, vi } from 'vitest';
import { healthCommand } from './commands/health';

// Mock fetch globally so no real network calls happen.
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('@soroban-dev/cli – healthCommand', () => {
  it('returns the status from the RPC node', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jsonrpc: '2.0', id: 1, result: { status: 'healthy' } }),
    });

    const status = await healthCommand({ network: 'testnet' });
    expect(status).toBe('healthy');
  });
});
