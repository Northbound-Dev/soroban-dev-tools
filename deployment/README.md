# Deployment utilities

This directory documents safe, repeatable workflows for deploying Soroban contracts and is reserved for future deployment helpers. **There are currently no automated deployment scripts or deployment managers in this directory.**

## Walkthroughs and Guides

- **[Verified Local-to-Testnet Soroban Deployment Walkthrough](./testnet-walkthrough.md)** — End-to-end guide covering prerequisites, offline unit testing, WASM compilation, disposable Testnet account setup, explicit `--network testnet` deployment, read/write contract invocation, TTL restoration, and troubleshooting using the official Stellar CLI.

## Contribution direction

Potential work includes safer repeatable testnet workflows, deployment checklists, and tooling that makes transaction inputs easier to review. Confirm the intended users and scope in an issue before introducing network-facing behavior.

## Safety requirements

- Default examples to local development or Stellar testnet; make any production path explicit.
- Require deliberate confirmation before consequential network actions.
- Never embed secret keys, seed phrases, or credentials in source, logs, examples, or command history.
- Explain required permissions, transaction costs, network selection, and recovery limitations.
- Test argument validation and failure paths as well as successful deployments.
- Do not claim a tool upgrades, verifies, or secures contracts unless that behavior is implemented and tested.

Use the current [Stellar CLI documentation](https://developers.stellar.org/docs/tools/stellar-cli) as the reference for supported network operations. Update the main [project overview](../README.md) when functionality is added.