import { ValidationError } from '@soroban-dev/errors';

const ACCOUNT_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/;
const CONTRACT_ADDRESS_REGEX = /^C[A-Z2-7]{55}$/;
const TX_HASH_REGEX = /^[0-9a-f]{64}$/i;

/**
 * Asserts that a value is a valid Stellar account address (G…).
 *
 * @param value - The string to validate.
 * @param field - Field name used in the error message.
 * @throws {@link ValidationError} if the value is not a valid account address.
 *
 * @example
 * ```ts
 * assertAccountId(params.sourceAccount, 'sourceAccount');
 * ```
 */
export function assertAccountId(value: string, field: string): void {
  if (!ACCOUNT_ADDRESS_REGEX.test(value)) {
    throw new ValidationError(field, 'must be a valid Stellar account address (starts with G)');
  }
}

/**
 * Asserts that a value is a valid Soroban contract address (C…).
 *
 * @param value - The string to validate.
 * @param field - Field name used in the error message.
 * @throws {@link ValidationError} if the value is not a valid contract address.
 */
export function assertContractId(value: string, field: string): void {
  if (!CONTRACT_ADDRESS_REGEX.test(value)) {
    throw new ValidationError(field, 'must be a valid Soroban contract address (starts with C)');
  }
}

/**
 * Asserts that a value is a valid 64-character hex transaction hash.
 *
 * @param value - The string to validate.
 * @param field - Field name used in the error message.
 * @throws {@link ValidationError} if the value is not a valid transaction hash.
 */
export function assertTransactionHash(value: string, field: string): void {
  if (!TX_HASH_REGEX.test(value)) {
    throw new ValidationError(field, 'must be a 64-character hex string');
  }
}
