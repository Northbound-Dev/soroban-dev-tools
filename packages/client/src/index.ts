import { RpcError, TimeoutError } from '@soroban-dev/errors';
import { resolveNetworkConfig } from '@soroban-dev/network';
import type { NetworkConfig, SimulationResult, ContractInvocation, SendTransactionResponse, TransactionEnvelope, TransactionHash } from '@soroban-dev/types';
import { withRetry } from '@soroban-dev/utils';

export interface SorobanClientOptions extends NetworkConfig {
  /** Default request timeout in milliseconds. Default: 30_000. */
  timeoutMs?: number;
  /** Number of retry attempts for transient failures. Default: 3. */
  maxRetries?: number;
}

/**
 * The primary Soroban JSON-RPC client.
 *
 * Instantiate once per application and share the instance.
 *
 * @example
 * ```ts
 * import { SorobanClient } from '@soroban-dev/client';
 * import { TESTNET } from '@soroban-dev/network';
 *
 * const client = new SorobanClient({ ...TESTNET });
 * const health = await client.getHealth();
 * ```
 */
export class SorobanClient {
  private readonly rpcUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(options: SorobanClientOptions) {
    const resolved = resolveNetworkConfig(options);
    this.rpcUrl = resolved.rpcUrl;
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.maxRetries = options.maxRetries ?? 3;
  }

  /**
   * Calls a Soroban JSON-RPC method and returns the typed result.
   *
   * @param method - The RPC method name, e.g. `"getHealth"`.
   * @param params - Method parameters object (or empty object).
   * @returns The `result` field of the JSON-RPC response.
   * @throws {@link RpcError} on non-200 HTTP or JSON-RPC error responses.
   * @throws {@link TimeoutError} when the request exceeds `timeoutMs`.
   */
  async call<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return withRetry(
      () => this._request<T>(method, params),
      { maxAttempts: this.maxRetries },
    );
  }

  private async _request<T>(method: string, params: Record<string, unknown>): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new TimeoutError(`${method} timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      throw new RpcError(`HTTP ${response.status}: ${response.statusText}`, response.status, 0);
    }

    const json = (await response.json()) as { result?: T; error?: { code: number; message: string } };

    if (json.error) {
      throw new RpcError(json.error.message, 200, json.error.code);
    }

    return json.result as T;
  }

  /**
   * Checks the health of the Soroban RPC node.
   *
   * @returns `"healthy"` if the node is operational.
   *
   * @example
   * ```ts
   * const status = await client.getHealth();
   * console.log(status); // 'healthy'
   * ```
   */
  async getHealth(): Promise<string> {
    const result = await this.call<{ status: string }>('getHealth');
    return result.status;
  }

  /**
   * Retrieves the latest ledger sequence known to the RPC node.
   *
   * @returns The latest ledger sequence number.
   */
  async getLatestLedger(): Promise<number> {
    const result = await this.call<{ sequence: number }>('getLatestLedger');
    return result.sequence;
  }

  /**
   * Simulates a contract invocation without submitting a transaction.
   *
   * @param invocation - The contract method and arguments to simulate.
   * @returns The simulation result including return value, footprint, and fee.
   *
   * @example
   * ```ts
   * const result = await client.simulateTransaction({
   *   contractId: 'C...',
   *   method: 'transfer',
   *   args: [fromXdr, toXdr, amountXdr],
   * });
   * ```
   */
  async simulateTransaction(invocation: ContractInvocation): Promise<SimulationResult> {
    return this.call<SimulationResult>('simulateTransaction', {
      transaction: invocation,
    });
  }

  /**
   * Sends a signed transaction to the network.
   *
   * @param xdr - Base64-encoded signed transaction envelope.
   * @returns The submission response including hash and initial status.
   *
   * @example
   * ```ts
   * const response = await client.sendTransaction(signedXdr);
   * console.log(response.hash);
   * ```
   */
  async sendTransaction(xdr: TransactionEnvelope): Promise<SendTransactionResponse> {
    return this.call<SendTransactionResponse>('sendTransaction', { transaction: xdr });
  }

  /**
   * Polls the RPC node for the result of a submitted transaction.
   *
   * @param hash - The transaction hash to query.
   * @returns The transaction result.
   */
  async getTransaction(hash: TransactionHash): Promise<SendTransactionResponse> {
    return this.call<SendTransactionResponse>('getTransaction', { hash });
  }
}

