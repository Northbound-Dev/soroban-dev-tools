# Examples

Each example in this directory is a **standalone project** that consumes the
published `@soroban-dev/*` packages (not the workspace source). This keeps the
root `pnpm install` lightweight and ensures examples reflect the real published
API.

## Running an example

```bash
cd examples/<example-name>
pnpm install   # installs published @soroban-dev/* packages
pnpm dev       # or whatever the example's start script is
```

## Adding an example

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

## Available examples

| Directory | Description |
|---|---|
| *(none yet — contributions welcome)* | |
