import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SorobanClient } from './index';
import { Network } from '@soroban-dev/types';
import type { ContractEvent } from '@soroban-dev/types';
import { RpcError } from '@soroban-dev/errors';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

interface RpcCallBody {
  method: string;
  params: {
    startLedger?: number;
    filters?: Array<{ type: string; contractIds: string[]; topics?: (string | null)[][] }>;
    pagination?: { limit?: number };
  };
}

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

  describe('watchContractEvents', () => {
    const contractId = 'C' + 'A'.repeat(55);

    function makeEvent(ledger: number, id: string) {
      return {
        type: 'contract' as const,
        ledger,
        contractId,
        id,
        topic: ['AAAA'],
        value: 'BBBB',
        inSuccessfulContractCall: true,
      };
    }

    function makeEventsResponse(events: unknown[]) {
      return makeOkResponse({ events, latestLedger: events.length > 0 ? (events.at(-1) as { ledger: number }).ledger : 1 });
    }

    function requestBody(callIndex: number): RpcCallBody {
      return JSON.parse(mockFetch.mock.calls[callIndex]![1].body);
    }

    it('delivers events to the callback', async () => {
      mockFetch
        .mockResolvedValueOnce(makeEventsResponse([makeEvent(100, 'e1'), makeEvent(101, 'e2')]))
        .mockResolvedValue(makeEventsResponse([]));
      const received: ContractEvent[] = [];

      const stop = client.watchContractEvents(
        { contractId, startLedger: 100, pollIntervalMs: 5 },
        (event) => received.push(event),
      );

      await vi.waitFor(() => expect(received).toHaveLength(2));
      expect(received[0]).toMatchObject({ ledger: 100, id: 'e1', contractId });
      expect(received[1]).toMatchObject({ ledger: 101, id: 'e2' });
      stop();
    });

    it('sends the contract filter and advances the cursor past the last event', async () => {
      mockFetch
        .mockResolvedValueOnce(makeEventsResponse([makeEvent(100, 'e1')]))
        .mockResolvedValueOnce(makeEventsResponse([]))
        .mockResolvedValue(makeEventsResponse([]));

      const stop = client.watchContractEvents(
        { contractId, startLedger: 100, pollIntervalMs: 5, topics: [['AAAA']] },
        () => {},
      );

      await vi.waitFor(() => expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2));

      const first = requestBody(0);
      expect(first.method).toBe('getEvents');
      expect(first.params.startLedger).toBe(100);
      expect(first.params.filters).toEqual([
        { type: 'contract', contractIds: [contractId], topics: [['AAAA']] },
      ]);

      const second = requestBody(1);
      expect(second.params.startLedger).toBe(101);

      stop();
    });

    it('keeps the cursor unchanged when a poll returns no events', async () => {
      mockFetch.mockResolvedValue(makeEventsResponse([]));

      const stop = client.watchContractEvents(
        { contractId, startLedger: 42, pollIntervalMs: 5 },
        () => {},
      );

      await vi.waitFor(() => expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2));

      expect(requestBody(0).params.startLedger).toBe(42);
      expect(requestBody(1).params.startLedger).toBe(42);

      stop();
    });

    it('stop() cancels polling', async () => {
      mockFetch
        .mockResolvedValueOnce(makeEventsResponse([makeEvent(10, 'e1')]))
        .mockResolvedValue(makeEventsResponse([]));

      const received: ContractEvent[] = [];
      const stop = client.watchContractEvents(
        { contractId, startLedger: 10, pollIntervalMs: 5 },
        (event) => received.push(event),
      );

      await vi.waitFor(() => expect(received).toHaveLength(1));
      stop();

      const callsAtStop = mockFetch.mock.calls.length;
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockFetch.mock.calls.length).toBe(callsAtStop);
    });

    it('stop() before the first poll completes suppresses delivery and further polls', async () => {
      let resolveFetch: (value: unknown) => void = () => {};
      mockFetch.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
      );

      const received: ContractEvent[] = [];
      const stop = client.watchContractEvents(
        { contractId, startLedger: 10, pollIntervalMs: 5 },
        (event) => received.push(event),
      );

      stop();
      resolveFetch(makeEventsResponse([makeEvent(10, 'e1')]));

      await new Promise((resolve) => setTimeout(resolve, 30));
      expect(received).toHaveLength(0);
      expect(mockFetch.mock.calls.length).toBe(1);
    });

    it('routes RPC failures to onError instead of throwing', async () => {
      mockFetch.mockResolvedValue(makeErrorResponse(-32602, 'Invalid getEvents params'));

      const errors: Error[] = [];
      const stop = client.watchContractEvents(
        { contractId, startLedger: 1, pollIntervalMs: 5, onError: (err) => errors.push(err) },
        () => {},
      );

      await vi.waitFor(() => expect(errors.length).toBeGreaterThan(0));
      expect(errors[0]).toBeInstanceOf(RpcError);
      expect(errors[0]!.message).toContain('Invalid getEvents params');

      stop();
    });

    it('does not invoke onError after stop()', async () => {
      mockFetch.mockResolvedValue(makeErrorResponse(-32602, 'boom'));

      const errors: Error[] = [];
      const stop = client.watchContractEvents(
        { contractId, startLedger: 1, pollIntervalMs: 5, onError: (err) => errors.push(err) },
        () => {},
      );

      stop();
      await new Promise((resolve) => setTimeout(resolve, 30));
      expect(errors).toHaveLength(0);
    });
  });
});
