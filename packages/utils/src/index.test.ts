import { describe, it, expect } from 'vitest';
import { truncateAddress, formatXlm, xlmToStroops } from './format';
import { assertAccountId, assertContractId, assertTransactionHash } from './validate';
import { ValidationError } from '@soroban-dev/errors';

describe('@soroban-dev/utils – format', () => {
  describe('truncateAddress', () => {
    it('truncates a long address', () => {
      const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const result = truncateAddress(addr);
      expect(result).toContain('…');
      expect(result.startsWith('GABCDE')).toBe(true);
    });

    it('returns the address unchanged when it is short enough', () => {
      expect(truncateAddress('GABCDEF')).toBe('GABCDEF');
    });
  });

  describe('formatXlm', () => {
    it('formats 10_000_000 stroops as 1.0000000 XLM', () => {
      expect(formatXlm(10_000_000)).toBe('1.0000000 XLM');
    });

    it('formats 15_000_000 stroops as 1.5000000 XLM', () => {
      expect(formatXlm(15_000_000)).toBe('1.5000000 XLM');
    });

    it('formats 0 stroops', () => {
      expect(formatXlm(0)).toBe('0.0000000 XLM');
    });
  });

  describe('xlmToStroops', () => {
    it('converts 1.5 XLM to 15_000_000 stroops', () => {
      expect(xlmToStroops('1.5')).toBe(15_000_000n);
    });

    it('converts 0 XLM to 0 stroops', () => {
      expect(xlmToStroops('0')).toBe(0n);
    });
  });
});

describe('@soroban-dev/utils – validate', () => {
  const validAccount = 'G' + 'A'.repeat(55);
  const validContract = 'C' + 'A'.repeat(55);
  const validHash = 'a'.repeat(64);

  describe('assertAccountId', () => {
    it('does not throw for a valid account address', () => {
      expect(() => assertAccountId(validAccount, 'account')).not.toThrow();
    });

    it('throws ValidationError for an invalid address', () => {
      expect(() => assertAccountId('INVALID', 'account')).toThrow(ValidationError);
    });
  });

  describe('assertContractId', () => {
    it('does not throw for a valid contract address', () => {
      expect(() => assertContractId(validContract, 'contractId')).not.toThrow();
    });

    it('throws ValidationError for an invalid address', () => {
      expect(() => assertContractId('GABCDE', 'contractId')).toThrow(ValidationError);
    });
  });

  describe('assertTransactionHash', () => {
    it('does not throw for a valid hash', () => {
      expect(() => assertTransactionHash(validHash, 'txHash')).not.toThrow();
    });

    it('throws ValidationError for a non-hex string', () => {
      expect(() => assertTransactionHash('xyz', 'txHash')).toThrow(ValidationError);
    });
  });
});
