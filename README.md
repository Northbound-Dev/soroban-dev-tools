# soroban-dev-tools

[![CI](https://github.com/Northbound-Dev/soroban-dev-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/Northbound-Dev/soroban-dev-tools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stellar](https://img.shields.io/badge/Built%20on-Stellar-7C3AED)](https://stellar.org)
[![Drips Wave](https://img.shields.io/badge/Drips-Stellar%20Wave-blue)](https://www.drips.network/wave/stellar)

> TypeScript toolkit for building, testing, and deploying **Soroban smart contracts** on Stellar.
> Built for the [Drips Stellar Wave Program](https://www.drips.network/wave/stellar).

`soroban-dev-tools` is a TypeScript pnpm monorepo that provides typed clients,
contract helpers, a CLI, React hooks, and testing utilities so developers can
integrate Soroban into their own applications and development workflows.

## Packages

| Package | Description |
|---|---|
| `@soroban-dev/types` | Shared entity, DTO, and enum type definitions |
| `@soroban-dev/errors` | Typed error classes for Soroban RPC and contract failures |
| `@soroban-dev/utils` | Shared utilities: encoding, formatting, retry logic |
| `@soroban-dev/client` | Typed RPC client for the Soroban JSON-RPC API |
| `@soroban-dev/network` | Network config, passphrase constants, and horizon helpers |
| `@soroban-dev/contract` | Contract invocation, simulation, and footprint helpers |
| `@soroban-dev/transaction` | Transaction building, signing, and submission helpers |
| `@soroban-dev/wallet` | Wallet connection and signing (Freighter, Albedo, WalletConnect) |
| `@soroban-dev/deploy` | Contract deployment and upgrade workflows |
| `@soroban-dev/test` | Testing utilities: mocks, fixtures, and a local sandbox helper |
| `@soroban-dev/react` | React hooks (TanStack Query) + `<SorobanProvider>` |
| `@soroban-dev/cli` | CLI for scaffolding, building, and deploying Soroban contracts |

### CLI binaries

Prebuilt `soroban-dev` binaries for Linux, macOS, and Windows are attached to
each tagged [release](https://github.com/Northbound-Dev/soroban-dev-tools/releases).
See [docs/cli-release.md](docs/cli-release.md) for installation, checksum
verification, supported targets, and limitations.

## Getting started

```bash
# Requires Node ≥ 20 and pnpm ≥ 9
git clone https://github.com/Northbound-Dev/soroban-dev-tools.git
cd soroban-dev-tools
pnpm install
pnpm build      # build every package (topological order)
pnpm typecheck  # strict TypeScript across the workspace
pnpm test       # run the vitest suites
```

## Quick example

```ts
import { SorobanClient } from '@soroban-dev/client';
import { TESTNET } from '@soroban-dev/network';

const client = new SorobanClient({ network: TESTNET });

// Simulate a contract call
const result = await client.simulateTransaction({
  contractId: 'C...',
  method: 'transfer',
  args: [sourceAccount, destAccount, amount],
});
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Small, reviewable pull requests are
welcome. Start with an issue to agree on scope before building.

## License

[MIT](LICENSE)
