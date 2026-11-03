import { describe, it, expect, vi } from 'vitest';
import { submitAndWait, validateBuildParams, makeSignedTransaction } from './index';
import { TransactionError } from '@soroban-dev/errors';
import { TransactionStatus } from '@soroban-dev/types';
import type { SorobanClient } from '@soroban-dev/client';

const VALID_ACCOUNT = 'G' + 'A'.repeat(55);

function makeClient(responses: { hash: string; status: TransactionStatus; errorResultXdr?: string }[]) {
  const responseQueue = [...responses];
  return {
    sendTransaction: vi.fn().mockImplementation(async () => {
      return responseQueue[0];
    }),
    getTransaction: vi.fn().mockImplementation(async () => {
      return responseQueue.shift() ?? { hash: 'abc', status: TransactionStatus.Pending };
    }),
  } as unknown as SorobanClient;
}

describe('@soroban-dev/transaction – submitAndWait', () => {
  it('returns the result on SUCCESS status', async () => {
    const client = makeClient([
      { hash: 'abc123', status: TransactionStatus.Pending },
      { hash: 'abc123', status: TransactionStatus.Success },
    ]);
    const result = await submitAndWait(client, 'signedXdr', { pollIntervalMs: 0, maxPolls: 5 });
    expect(result.status).toBe(TransactionStatus.Success);
  });

  it('throws TransactionError when submission immediately returns Error', async () => {
    const client = {
      sendTransaction: vi.fn().mockResolvedValue({
        hash: 'abc',
        status: TransactionStatus.Error,
        errorResultXdr: 'ZZZZ==',
      }),
      getTransaction: vi.fn(),
    } as unknown as SorobanClient;

    await expect(submitAndWait(client, 'xdr', { pollIntervalMs: 0 })).rejects.toBeInstanceOf(
      TransactionError,
    );
  });
});

describe('@soroban-dev/transaction – validateBuildParams', () => {
  it('does not throw for a valid source account', () => {
    expect(() =>
      validateBuildParams({ sourceAccount: VALID_ACCOUNT, operationXdr: 'op' }),
    ).not.toThrow();
  });

  it('throws for an invalid source account', () => {
    expect(() =>
      validateBuildParams({ sourceAccount: 'INVALID', operationXdr: 'op' }),
    ).toThrow();
  });
});

describe('@soroban-dev/transaction – makeSignedTransaction', () => {
  it('creates a signed transaction object', () => {
    const tx = makeSignedTransaction('hash123', 'xdr==', VALID_ACCOUNT);
    expect(tx.hash).toBe('hash123');
    expect(tx.signedBy).toBe(VALID_ACCOUNT);
  });
});
