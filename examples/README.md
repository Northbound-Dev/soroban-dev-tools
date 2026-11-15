# Examples

Each example in this directory is a standalone reference project that can be built and tested independently from the root TypeScript workspace.

## Available examples

| Directory | Description |
|---|---|
| [`examples/counter`](./counter) | Minimal Rust/Soroban stateful counter contract with unit tests and boundary checks (`soroban-sdk 22.0.0`, offline local test environment) |

## Running the Rust/Soroban counter example

```bash
cd examples/counter
cargo test
cargo build --target wasm32-unknown-unknown --release
```

## Adding a TypeScript SDK example

1. Create a new subdirectory: `examples/<your-example>/`.
2. Add a `package.json` that references `@soroban-dev/*` packages as regular
   dependencies (not `workspace:*`).
3. Include a `README.md` that explains:
   - What the example demonstrates.
   - Prerequisites (Node version, wallet extension, testnet account, etc.).
   - How to run it, including any required environment variables.
   - What the expected output or behaviour is.
4. Never include secret keys, mnemonics, or real account credentials.
5. Default to Stellar testnet; document any mainnet usage explicitly.