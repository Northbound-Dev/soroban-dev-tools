# CLI

The CLI lives in [`packages/cli`](../packages/cli) and is published as
`@soroban-dev/cli`, which provides the `soroban-dev` command. It currently
implements one command:

```bash
soroban-dev health [--network testnet] [--rpc-url <url>]
```

## Install

Prebuilt binaries for Linux, macOS, and Windows are attached to each tagged
[GitHub Release](https://github.com/Northbound-Dev/soroban-dev-tools/releases).
The binaries include their own runtime, so no Node.js install is required. See
[docs/cli-release.md](../docs/cli-release.md) for supported targets, checksum
verification, upgrading, and limitations.

To run the CLI from source instead:

```bash
pnpm install
pnpm build
node packages/cli/dist/bin.js health --network testnet
```

## Contribution direction

Potential contributions include project scaffolding, repeatable local-development
workflows, and network configuration helpers. Before starting a tool, open an
issue to agree on its user, supported platforms, command interface, and
maintenance owner.

## Acceptance checklist for a CLI contribution

- Provide a runnable implementation and a documented installation path.
- State supported operating systems, prerequisites, and tested Stellar CLI versions.
- Make `--help` useful and validate arguments with actionable error messages.
- Avoid hidden network activity and never print or persist secret credentials.
- Include automated tests and a safe local or testnet example.
- Document limitations and update the main [project overview](../README.md).
- If you add or change a release target, update
  [docs/cli-release.md](../docs/cli-release.md) and the target list in
  [`scripts/build-cli-binaries.sh`](../scripts/build-cli-binaries.sh).

Keep commands and examples clearly marked as proposals until they are implemented and verified.
