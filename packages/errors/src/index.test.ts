import { describe, it, expect } from 'vitest';
import {
  SorobanError,
  RpcError,
  SimulationError,
  TransactionError,
  WalletError,
  ValidationError,
  TimeoutError,
} from './index';

describe('@soroban-dev/errors', () => {
  describe('SorobanError', () => {
    it('sets name, message, and code', () => {
      const err = new SorobanError('something went wrong', 'TEST_CODE');
      expect(err.name).toBe('SorobanError');
      expect(err.message).toBe('something went wrong');
      expect(err.code).toBe('TEST_CODE');
    });

    it('is an instance of Error', () => {
      expect(new SorobanError('msg', 'CODE')).toBeInstanceOf(Error);
    });
  });

  describe('RpcError', () => {
    it('stores httpStatus and rpcCode', () => {
      const err = new RpcError('bad request', 400, -32600);
      expect(err.httpStatus).toBe(400);
      expect(err.rpcCode).toBe(-32600);
      expect(err.code).toBe('RPC_ERROR');
      expect(err).toBeInstanceOf(SorobanError);
    });
  });

  describe('SimulationError', () => {
    it('stores optional resultXdr', () => {
      const err = new SimulationError('panic in contract', 'AAAA==');
      expect(err.resultXdr).toBe('AAAA==');
      expect(err.code).toBe('SIMULATION_ERROR');
    });

    it('works without resultXdr', () => {
      const err = new SimulationError('panic');
      expect(err.resultXdr).toBeUndefined();
    });
  });

  describe('TransactionError', () => {
    it('stores errorResultXdr', () => {
      const err = new TransactionError('tx_bad_seq', 'BBBB==');
      expect(err.errorResultXdr).toBe('BBBB==');
      expect(err.code).toBe('TRANSACTION_ERROR');
    });
  });

  describe('WalletError', () => {
    it('sets the correct code', () => {
      const err = new WalletError('rejected');
      expect(err.code).toBe('WALLET_ERROR');
      expect(err).toBeInstanceOf(SorobanError);
    });
  });

  describe('ValidationError', () => {
    it('includes the field name in the message', () => {
      const err = new ValidationError('contractId', 'must start with C');
      expect(err.field).toBe('contractId');
      expect(err.message).toContain('contractId');
      expect(err.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('TimeoutError', () => {
    it('uses default message', () => {
      const err = new TimeoutError();
      expect(err.message).toBe('Request timed out');
      expect(err.code).toBe('TIMEOUT_ERROR');
    });

    it('accepts a custom message', () => {
      const err = new TimeoutError('custom timeout');
      expect(err.message).toBe('custom timeout');
    });
  });
});
