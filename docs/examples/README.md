# Soroban examples

Runnable reference examples live under [`examples/`](../../examples/README.md):

- **[`examples/counter`](../../examples/counter/README.md)** — Minimal Rust/Soroban counter contract (`soroban-sdk 22.0.0`) demonstrating instance storage, typed contract errors (`InvalidStep`, `Overflow`), and deterministic local unit tests (`cargo test`).

## Adding an example

Keep each example small enough to follow from a clean checkout of the example itself. Include:

- The problem the example demonstrates and what the reader will learn.
- Exact prerequisites and versions, including whether the Stellar CLI is needed.
- Complete source files or a link to a pinned, maintained source revision.
- Commands to build and test, with expected results.
- Whether it uses a local environment or Stellar testnet.
- Clear warnings for any network action, cost, or credential requirement.

Verify the commands with the current documented tool versions before submitting. Never include account secrets or tell readers to deploy an unaudited example to mainnet. See the [deployment safety requirements](../../deployment/README.md).