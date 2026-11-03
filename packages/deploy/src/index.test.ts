import { describe, it, expect, vi } from 'vitest';
import { deployContract } from './index';
import type { SorobanClient } from '@soroban-dev/client';

const VALID_DEPLOYER = 'G' + 'A'.repeat(55);

function makeClient() {
  return {
    call: vi.fn()
      .mockResolvedValueOnce({ hash: 'wasm_hash_hex', transactionHash: 'upload_tx_hash' })
      .mockResolvedValueOnce({ contractId: 'CABCDE...', transactionHash: 'deploy_tx_hash' }),
  } as unknown as SorobanClient;
}

describe('@soroban-dev/deploy – deployContract', () => {
  it('returns a DeployResult on success', async () => {
    const client = makeClient();
    const signer = vi.fn().mockResolvedValue('signed_xdr==');

    const result = await deployContract(
      client,
      { deployer: VALID_DEPLOYER, wasm: new Uint8Array([0x00, 0x61, 0x73, 0x6d]) },
      signer,
    );

    expect(result.contractId).toBe('CABCDE...');
    expect(result.wasmHash).toBe('wasm_hash_hex');
    expect(signer).toHaveBeenCalledTimes(2);
  });

  it('calls uploadContractWasm then deployContract on the client', async () => {
    const client = makeClient();
    const signer = vi.fn().mockResolvedValue('signed==');

    await deployContract(
      client,
      { deployer: VALID_DEPLOYER, wasm: 'deadbeef' },
      signer,
    );

    expect(client.call).toHaveBeenCalledWith('uploadContractWasm', expect.any(Object));
    expect(client.call).toHaveBeenCalledWith('deployContract', expect.any(Object));
  });
});
