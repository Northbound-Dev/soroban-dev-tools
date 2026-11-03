import type { SorobanClient } from '@soroban-dev/client';
import { TransactionError } from '@soroban-dev/errors';
import type {
  BuildTransactionParams,
  SendTransactionResponse,
  SignedTransaction,
  TransactionHash,
} from '@soroban-dev/types';
import { TransactionStatus } from '@soroban-dev/types';
import { assertAccountId } from '@soroban-dev/utils';

const DEFAULT_POLL_INTERVAL_MS = 2_000;
const DEFAULT_MAX_POLLS = 30;

/**
 * Submits a signed transaction and polls until it is confirmed or fails.
 *
 * @param client - An initialised `SorobanClient`.
 * @param signedXdr - The base64-encoded signed transaction envelope.
 * @param opts - Optional polling configuration.
 * @returns The final transaction response once confirmed.
 * @throws {@link TransactionError} if the transaction fails or times out.
 *
 * @example
 * ```ts
 * import { submitAndWait } from '@soroban-dev/transaction';
 *
 * const result = await submitAndWait(client, signedXdr);
 * console.log(result.status); // 'SUCCESS'
 * ```
 */
export async function submitAndWait(
  client: SorobanClient,
  signedXdr: string,
  opts: { pollIntervalMs?: number; maxPolls?: number } = {},
): Promise<SendTransactionResponse> {
  const { pollIntervalMs = DEFAULT_POLL_INTERVAL_MS, maxPolls = DEFAULT_MAX_POLLS } = opts;

  const submitted = await client.sendTransaction(signedXdr);

  if (submitted.status === TransactionStatus.Error) {
    throw new TransactionError(
      `Transaction rejected: ${submitted.errorResultXdr ?? 'unknown error'}`,
      submitted.errorResultXdr,
    );
  }

  const hash = submitted.hash;

  for (let poll = 0; poll < maxPolls; poll++) {
    const result = await client.getTransaction(hash);

    if (result.status === TransactionStatus.Success) {
      return result;
    }

    if (result.status === TransactionStatus.Error) {
      throw new TransactionError(
        `Transaction failed: ${result.errorResultXdr ?? 'unknown'}`,
        result.errorResultXdr,
      );
    }

    await sleep(pollIntervalMs);
  }

  throw new TransactionError(`Transaction ${hash} did not confirm within the polling window`);
}

/**
 * Validates the source account of a transaction build request.
 *
 * @param params - Build parameters to validate.
 * @throws {@link ValidationError} if any field fails validation.
 */
export function validateBuildParams(params: BuildTransactionParams): void {
  assertAccountId(params.sourceAccount, 'sourceAccount');
}

/**
 * Returns a stub `SignedTransaction` from a hash and XDR. Useful in tests.
 *
 * @internal
 */
export function makeSignedTransaction(
  hash: TransactionHash,
  envelopeXdr: string,
  signedBy: string,
): SignedTransaction {
  return { hash, envelopeXdr, signedBy };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
