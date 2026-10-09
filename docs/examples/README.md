# Examples

Examples showing how to use the Soroban Dev Tools utilities.

## Example 1: Creating a New Contract

```bash
# Using the CLI initializer
soroban-cli init my-contract
cd my-contract
```

## Example 2: Testing a Contract

```bash
# Run unit tests
soroban-test run

# Or with specific test suite
soroban-test run --suite=integration
```

## Example 3: Deploying to Testnet

```bash
# Deploy to Stellar testnet
soroban-deploy --network testnet --contract my-contract.wasm
```

## Example 4: Analyzing Gas Usage

```bash
# Get gas usage report
soroban-gas-analyze --contract my-contract.wasm
```