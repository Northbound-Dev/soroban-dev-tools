/**
 * Base class for all Soroban Dev Tools errors.
 *
 * @example
 * ```ts
 * try {
 *   await client.simulateTransaction(params);
 * } catch (err) {
 *   if (err instanceof SorobanError) {
 *     console.error(err.code, err.message);
 *   }
 * }
 * ```
 */
export class SorobanError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'SorobanError';
    this.code = code;
    // Maintain prototype chain in TypeScript-compiled environments.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the Soroban JSON-RPC endpoint returns an error response.
 *
 * @example
 * ```ts
 * throw new RpcError('sendTransaction failed: fee too low', 500, -32602);
 * ```
 */
export class RpcError extends SorobanError {
  readonly httpStatus: number;
  readonly rpcCode: number;

  constructor(message: string, httpStatus: number, rpcCode: number) {
    super(message, 'RPC_ERROR');
    this.name = 'RpcError';
    this.httpStatus = httpStatus;
    this.rpcCode = rpcCode;
  }
}

/**
 * Thrown when a contract invocation simulation fails.
 *
 * @example
 * ```ts
 * throw new SimulationError('Contract panic: insufficient balance', resultXdr);
 * ```
 */
export class SimulationError extends SorobanError {
  /** Raw XDR result from the simulation, if available. */
  readonly resultXdr?: string;

  constructor(message: string, resultXdr?: string) {
    super(message, 'SIMULATION_ERROR');
    this.name = 'SimulationError';
    this.resultXdr = resultXdr;
  }
}

/**
 * Thrown when transaction submission is rejected by the network.
 *
 * @example
 * ```ts
 * throw new TransactionError('tx_bad_seq', envelopeXdr);
 * ```
 */
export class TransactionError extends SorobanError {
  /** The raw XDR result returned by the RPC node. */
  readonly errorResultXdr?: string;

  constructor(message: string, errorResultXdr?: string) {
    super(message, 'TRANSACTION_ERROR');
    this.name = 'TransactionError';
    this.errorResultXdr = errorResultXdr;
  }
}

/**
 * Thrown when a wallet operation fails or is rejected by the user.
 *
 * @example
 * ```ts
 * throw new WalletError('User rejected the signing request');
 * ```
 */
export class WalletError extends SorobanError {
  constructor(message: string) {
    super(message, 'WALLET_ERROR');
    this.name = 'WalletError';
  }
}

/**
 * Thrown when a contract address or other input fails validation.
 *
 * @example
 * ```ts
 * throw new ValidationError('contractId', 'Must start with C');
 * ```
 */
export class ValidationError extends SorobanError {
  readonly field: string;

  constructor(field: string, message: string) {
    super(`Validation failed for "${field}": ${message}`, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Thrown when a network request times out.
 */
export class TimeoutError extends SorobanError {
  constructor(message = 'Request timed out') {
    super(message, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}
