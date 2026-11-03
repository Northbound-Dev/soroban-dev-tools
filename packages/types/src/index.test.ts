import { describe, it, expect } from 'vitest';
import {
  Network,
  TransactionStatus,
  ContractState,
  StorageDurability,
  WalletType,
} from './index';

describe('@soroban-dev/types – enums', () => {
  it('exports Network enum with expected values', () => {
    expect(Network.Mainnet).toBe('mainnet');
    expect(Network.Testnet).toBe('testnet');
    expect(Network.Futurenet).toBe('futurenet');
    expect(Network.Local).toBe('local');
  });

  it('exports TransactionStatus enum with expected values', () => {
    expect(TransactionStatus.Success).toBe('SUCCESS');
    expect(TransactionStatus.Error).toBe('ERROR');
    expect(TransactionStatus.NotFound).toBe('NOT_FOUND');
    expect(TransactionStatus.Pending).toBe('PENDING');
  });

  it('exports ContractState enum', () => {
    expect(ContractState.Active).toBe('active');
    expect(ContractState.Expired).toBe('expired');
    expect(ContractState.Archived).toBe('archived');
  });

  it('exports StorageDurability enum', () => {
    expect(StorageDurability.Persistent).toBe('persistent');
    expect(StorageDurability.Temporary).toBe('temporary');
    expect(StorageDurability.Instance).toBe('instance');
  });

  it('exports WalletType enum', () => {
    expect(WalletType.Freighter).toBe('freighter');
    expect(WalletType.Albedo).toBe('albedo');
    expect(WalletType.WalletConnect).toBe('walletconnect');
  });
});
