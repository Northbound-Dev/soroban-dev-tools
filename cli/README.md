# CLI

The CLI lives in [`packages/cli`](../packages/cli) and is published as
`@soroban-dev/cli`, which provides the `soroban-dev` command (also usable as `sdt` when aliased or linked). It currently implements two commands:

```bash
# Scaffold an offline Rust/Soroban smart contract project
soroban-dev init <project-name> [--dir <parent-directory>]

# Check Soroban RPC endpoint health
soroban-dev health [--network testnet] [--rpc-url <url>]
```

## Install

Prebuilt binaries for Linux, macOS, and Windows are attached to each tagged
[GitHub Release](https://github.com/Northbound-Dev/soroban-dev-tools/releases).
The binaries include their own runtime, so no Node.js install is required. See
[docs/cli-release.md](../docs/cli-release.md) for supported targets, checksum
verification, upgrading, and limitations.

To build and run the CLI from source instead (requires Node.js `>=20.0.0` and `pnpm@9.15.0`):

```bash
pnpm install
pnpm build
node packages/cli/dist/bin.js --help
node packages/cli/dist/bin.js init my-counter
node packages/cli/dist/bin.js health --network testnet
```

## `init <project-name>` (offline project scaffolder)

`soroban-dev init <project-name>` creates a minimal, buildable Rust/Soroban contract project on disk without making any network requests or generating secret credentials:

- `Cargo.toml` — configured with `crate-type = ["cdylib"]`, `soroban-sdk = "22.0.0"`, and release WASM size optimizations.
- `src/lib.rs` — stateful counter contract (`increment`, `increment_by`, `get_count`, `reset`) with unit tests covering normal state transitions, zero-step validation (`Error::InvalidStep`), and `u32::MAX` overflow checks (`Error::Overflow`).
- `README.md` — prerequisites, offline `cargo test` and WASM build commands, and an explicit unaudited notice.
- `.gitignore` — standard Rust `/target` and `.env` exclusions.

### Validation and safety guarantees

- Project names must start with a lowercase ASCII letter and contain only `[a-z0-9_-]` (up to 63 characters), and must not be a reserved Rust keyword.
- Existing non-empty destination directories are never overwritten.
- Scaffolding runs 100% offline and never prompts for or writes secret keys.

### Supported vs. future CLI scope

- **Supported today:** `init <project-name>` (offline contract project scaffolding) and `health` (RPC health check).
- **Not included in `init`:** contract deployment, wallet/key management, automated testnet account funding, or Mainnet workflows.

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
