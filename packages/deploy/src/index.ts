import type { SorobanClient } from '@soroban-dev/client';
import { TransactionError } from '@soroban-dev/errors';
import type { AccountId, ContractId, TransactionHash } from '@soroban-dev/types';

/**
 * Result of a contract deployment operation.
 */
export interface DeployResult {
  /** The newly deployed contract's C… address. */
  contractId: ContractId;
  /** The WASM hash of the uploaded contract code. */
  wasmHash: string;
  /** The transaction hash of the deploy transaction. */
  transactionHash: TransactionHash;
}

/**
 * Options for uploading and deploying a Soroban contract.
 */
export interface DeployOptions {
  /** The deploying account's public key. */
  deployer: AccountId;
  /** Compiled WASM binary as a Uint8Array or hex string. */
  wasm: Uint8Array | string;
  /** Optional constructor arguments (XDR-encoded ScVals). */
  constructorArgs?: string[];
}

/**
 * Uploads WASM bytecode to the Stellar network and deploys a new contract instance.
 *
 * **Important:** This function builds and signs the transaction internally using the
 * provided `signer`. Never pass secret keys directly — use `@soroban-dev/wallet` adapters.
 *
 * @param client - An initialised `SorobanClient`.
 * @param opts - Deployment options.
 * @param signer - Async function that signs an XDR envelope and returns the signed XDR.
 * @returns The deployment result including the new contract ID.
 * @throws {@link TransactionError} if the deployment transaction fails.
 *
 * @example
 * ```ts
 * import { deployContract } from '@soroban-dev/deploy';
 *
 * const result = await deployContract(client, {
 *   deployer: publicKey,
 *   wasm: wasmBytes,
 * }, signXdr);
 *
 * console.log(result.contractId); // C...
 * ```
 */
export async function deployContract(
  client: SorobanClient,
  opts: DeployOptions,
  signer: (xdr: string) => Promise<string>,
): Promise<DeployResult> {
  // 1. Upload the WASM to get a hash (uploadContractWasm RPC method)
  const wasmHex =
    opts.wasm instanceof Uint8Array
      ? Buffer.from(opts.wasm).toString('hex')
      : opts.wasm;

  const uploadResult = await client.call<{ hash: string; transactionHash: string }>(
    'uploadContractWasm',
    { wasm: wasmHex, source: opts.deployer },
  );

  // 2. Sign the upload transaction
  const signedUploadXdr = await signer(uploadResult.transactionHash);
  if (!signedUploadXdr) {
    throw new TransactionError('Signer returned empty XDR for WASM upload');
  }

  // 3. Deploy the contract from the uploaded WASM hash
  const deployResult = await client.call<{ contractId: string; transactionHash: string }>(
    'deployContract',
    {
      source: opts.deployer,
      wasmHash: uploadResult.hash,
      constructorArgs: opts.constructorArgs ?? [],
    },
  );

  // 4. Sign the deploy transaction
  const signedDeployXdr = await signer(deployResult.transactionHash);
  if (!signedDeployXdr) {
    throw new TransactionError('Signer returned empty XDR for contract deploy');
  }

  return {
    contractId: deployResult.contractId,
    wasmHash: uploadResult.hash,
    transactionHash: deployResult.transactionHash,
  };
}
