# CLI releases: binaries, verification, and the release process

`soroban-dev` (`@soroban-dev/cli`) is published as standalone binaries through a
tag-triggered GitHub Actions workflow: [`.github/workflows/release.yml`](../.github/workflows/release.yml).
Nothing is uploaded to npm or any other package registry from this workflow, and
there is no auto-updater.

## Supported targets

| Target         | Artifact                                 | Built in CI | Executed in CI            |
| -------------- | ---------------------------------------- | ----------- | ------------------------- |
| `linux-x64`    | `soroban-dev-v<version>-linux-x64`       | yes         | yes (hermetic smoke test) |
| `linux-arm64`  | `soroban-dev-v<version>-linux-arm64`     | yes         | no                        |
| `darwin-x64`   | `soroban-dev-v<version>-darwin-x64`      | yes         | no                        |
| `darwin-arm64` | `soroban-dev-v<version>-darwin-arm64`    | yes         | no                        |
| `windows-x64`  | `soroban-dev-v<version>-windows-x64.exe` | yes         | no                        |

All five targets are cross-compiled from a single `ubuntu-24.04` runner, so no
target is "unbuildable in CI". The matrix is deliberately bounded to desktop
platforms the project can test manually; Linux ARMv7, musl/Alpine, and
Windows/macOS ARM64 variants are not published.

Binaries embed their runtime (Bun) and need no Node.js installation. That is why
they are roughly 90–115 MB.

## Installing a release

Download the artifact for your platform from the
[releases page](https://github.com/Northbound-Dev/soroban-dev-tools/releases),
verify its checksum, then put it on your `PATH`:

```bash
TAG=v0.1.0 TARGET=linux-x64
curl -fsSLO "https://github.com/Northbound-Dev/soroban-dev-tools/releases/download/${TAG}/soroban-dev-${TAG}-${TARGET}"
curl -fsSLO "https://github.com/Northbound-Dev/soroban-dev-tools/releases/download/${TAG}/SHA256SUMS-${TAG}.txt"
sha256sum -c "SHA256SUMS-${TAG}.txt" --ignore-missing
chmod +x "soroban-dev-${TAG}-${TARGET}"
sudo mv "soroban-dev-${TAG}-${TARGET}" /usr/local/bin/soroban-dev
soroban-dev health --network testnet
```

On macOS use `shasum -a 256 -c` instead of `sha256sum -c`. The Windows
PowerShell equivalent (`Get-FileHash`) is shown in every release body, which is
generated from [`docs/release-notes-template.md`](release-notes-template.md).

Each release body contains the same concise install, verification, upgrade, and
limitation notes so users can install without leaving the release page.

## Verifying artifacts

`SHA256SUMS-v<version>.txt` is attached to every release and lists one
`<sha256>  <artifact>` line per binary. Verify before running:

```bash
sha256sum -c "SHA256SUMS-v0.1.0.txt" --ignore-missing        # Linux
shasum -a 256 -c "SHA256SUMS-v0.1.0.txt" --ignore-missing    # macOS
```

These checksums are integrity checks for the exact bytes attached to that
release. They are **not** signatures. No artifact is signed or notarized, and
this project does not claim otherwise until signing is implemented and verified
end to end.

## Upgrading and rolling back

There is no auto-updater. Download the artifact for the desired tag, verify it,
and replace the binary in place. To roll back, download the older tag the same
way. Pin an explicit tag in CI if you need a stable version.

## Limitations

- **Unsigned binaries.** macOS Gatekeeper and Windows SmartScreen may block or
  warn about the binaries. Do not disable those protections; build from source
  instead (`pnpm install && pnpm build && node packages/cli/dist/bin.js`) or
  implement signing/notarization as a separate change.
- **glibc only on Linux.** The Linux artifacts are glibc builds; Alpine/musl is
  not a target.
- **Cross-compiled targets are not executed in CI.** Only `linux-x64` is
  smoke-tested. The others are compiled and checksummed, but treat them as
  "builds, not exercised" until a runner matrix tests them.
- **No byte-equality gate in CI.** Repeated runs of
  `scripts/build-cli-binaries.sh` with the pinned toolchain produced
  byte-identical binaries locally, and Bun embeds the artifact filename in the
  compiled executable, so names are part of the build contract. CI does not yet
  compare checksums across runs; treat the published checksums as integrity
  data for that release.

## Release process (maintainers)

1. Bump `packages/cli/package.json` (and the root `package.json` if you keep them
   in step) following [SemVer](https://semver.org), and merge to `main`.
2. Tag the merge commit and push the tag:

   ```bash
   git checkout main && git pull
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. The tag must match `packages/cli/package.json` exactly (`v` + version) — the
   workflow fails before building otherwise, so a mistyped tag cannot publish a
   mislabelled release.
4. The `build` job compiles every target, writes `SHA256SUMS-v<version>.txt`,
   verifies the checksums, smoke-tests the Linux binary, uploads the artifacts to
   the workflow run, and records the toolchain and checksums in the job summary.
   The `publish` job then creates the GitHub Release from the checked-in notes
   template.

### Validating the workflow without publishing

Run the workflow manually against a branch (defaults are safe):

1. Actions → **Release CLI** → **Run workflow** → branch `main`, leave
   `dry_run = true`.
2. The `build` job runs exactly as it would for a tag; the `publish` job is
   skipped. Download `soroban-dev-cli-v<version>` from the run's artifacts and
   inspect the binaries and `SHA256SUMS-v<version>.txt`.

`dry_run = false` on a tag ref re-runs publication for that existing tag (useful
for retrying a failed publish). Branch runs never publish, no matter the input.

### Toolchain and permissions

| Input                             | Pin                                 |
| --------------------------------- | ----------------------------------- |
| Runner                            | `ubuntu-24.04`                      |
| Node.js                           | `22.12.0` (`actions/setup-node@v4`) |
| pnpm                              | `9.15.0` (`pnpm/action-setup@v4`)   |
| Bun (compiler + embedded runtime) | `1.4.4` (`oven-sh/setup-bun@v2`)    |
| Dependencies                      | `pnpm install --frozen-lockfile`    |

Pins live in the `env:` block of the workflow, and
`scripts/build-cli-binaries.sh` refuses to build when `BUN_VERSION` is set and
does not match the Bun on `PATH`.

Cross-compilation is done by Bun itself: for the four non-host targets it
fetches the matching runtime from Bun's release CDN during the build, and the
`BUN_VERSION` pin is what fixes which runtime bytes are used. The build needs
outbound HTTPS access but no credentials.

Permissions are scoped per job: the workflow default is `contents: read`, the
`build` job cannot write anything, and only `publish` has `contents: write` to
create the release. Compilation needs no secrets — the publish job uses the
automatic `GITHUB_TOKEN`, not an application secret. Checkout uses
`persist-credentials: false`.

### Reproducing a release locally

```bash
pnpm install --frozen-lockfile
pnpm build
BUN_VERSION=1.4.4 scripts/build-cli-binaries.sh 0.1.0 dist-binaries
```

The script writes the same artifact names and checksum file as CI for all five
targets. It works on any host with Bash, `sha256sum`/`shasum`, and Bun 1.4.4;
cross-compilation does not require a macOS or Windows machine.
