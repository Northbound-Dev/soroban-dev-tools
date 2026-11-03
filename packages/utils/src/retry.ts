import { TimeoutError } from '@soroban-dev/errors';

export interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3. */
  maxAttempts?: number;
  /** Initial backoff in milliseconds. Default: 300. */
  initialDelayMs?: number;
  /** Backoff multiplier applied after each failure. Default: 2. */
  backoffFactor?: number;
  /** Maximum backoff ceiling in milliseconds. Default: 10_000. */
  maxDelayMs?: number;
  /** HTTP status codes that should not be retried. Default: [400, 401, 403, 404, 422]. */
  noRetryStatuses?: number[];
}

const DEFAULT_NO_RETRY = [400, 401, 403, 404, 422];

/**
 * Retries an async function with exponential back-off.
 *
 * @param fn - The async function to retry.
 * @param opts - Retry configuration.
 * @returns The resolved value of `fn`.
 * @throws The last error thrown by `fn` after all attempts are exhausted.
 *
 * @example
 * ```ts
 * const result = await withRetry(() => fetch(url), { maxAttempts: 5 });
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 300,
    backoffFactor = 2,
    maxDelayMs = 10_000,
    noRetryStatuses = DEFAULT_NO_RETRY,
  } = opts;

  let lastError: unknown;
  let delayMs = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Never retry validation or auth errors.
      if (err instanceof TimeoutError) {
        // TimeoutErrors are always retried (up to maxAttempts).
      } else if (
        typeof err === 'object' &&
        err !== null &&
        'httpStatus' in err &&
        noRetryStatuses.includes((err as { httpStatus: number }).httpStatus)
      ) {
        throw err;
      }

      if (attempt < maxAttempts) {
        await sleep(delayMs);
        delayMs = Math.min(delayMs * backoffFactor, maxDelayMs);
      }
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
