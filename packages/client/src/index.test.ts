import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SorobanClient } from './index';
import { Network } from '@soroban-dev/types';
import { RpcError } from '@soroban-dev/errors';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeOkResponse(result: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ jsonrpc: '2.0', id: 1, result }),
  };
}

function makeErrorResponse(code: number, message: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ jsonrpc: '2.0', id: 1, error: { code, message } }),
  };
}

describe('@soroban-dev/client – SorobanClient', () => {
  let client: SorobanClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new SorobanClient({ network: Network.Testnet, maxRetries: 1 });
  });

  describe('getHealth', () => {
    it('returns the status string on success', async () => {
      mockFetch.mockResolvedValueOnce(makeOkResponse({ status: 'healthy' }));
      expect(await client.getHealth()).toBe('healthy');
    });
  });

  describe('getLatestLedger', () => {
    it('returns the sequence number', async () => {
      mockFetch.mockResolvedValueOnce(makeOkResponse({ sequence: 42_000 }));
      expect(await client.getLatestLedger()).toBe(42_000);
    });
  });

  describe('call', () => {
    it('throws RpcError on a JSON-RPC error response', async () => {
      mockFetch.mockResolvedValueOnce(makeErrorResponse(-32600, 'Invalid request'));
      await expect(client.call('getHealth')).rejects.toBeInstanceOf(RpcError);
    });

    it('throws RpcError on a non-200 HTTP response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable', json: async () => ({}) });
      await expect(client.call('getHealth')).rejects.toBeInstanceOf(RpcError);
    });
  });
});
