# soroban-dev CLI `__TAG__`

Standalone binaries for the `__TAG__` release of `@soroban-dev/cli`
(`soroban-dev` command). They embed their own runtime: **no Node.js install is
required**.

| Platform      | Architecture  | Artifact                              |
| ------------- | ------------- | ------------------------------------- |
| Linux (glibc) | x86-64        | `soroban-dev-__TAG__-linux-x64`       |
| Linux (glibc) | ARM64         | `soroban-dev-__TAG__-linux-arm64`     |
| macOS         | Intel         | `soroban-dev-__TAG__-darwin-x64`      |
| macOS         | Apple silicon | `soroban-dev-__TAG__-darwin-arm64`    |
| Windows       | x86-64        | `soroban-dev-__TAG__-windows-x64.exe` |

## Install

### Linux

```bash
TAG=__TAG__ TARGET=linux-x64   # or linux-arm64
curl -fsSLO "https://github.com/Northbound-Dev/soroban-dev-tools/releases/download/${TAG}/soroban-dev-${TAG}-${TARGET}"
curl -fsSLO "https://github.com/Northbound-Dev/soroban-dev-tools/releases/download/${TAG}/SHA256SUMS-${TAG}.txt"
sha256sum -c "SHA256SUMS-${TAG}.txt" --ignore-missing
chmod +x "soroban-dev-${TAG}-${TARGET}"
sudo mv "soroban-dev-${TAG}-${TARGET}" /usr/local/bin/soroban-dev
soroban-dev health --network testnet
```

### macOS

```bash
TAG=__TAG__ TARGET=darwin-arm64   # or darwin-x64
curl -fsSLO "https://github.com/Northbound-Dev/soroban-dev-tools/releases/download/${TAG}/soroban-dev-${TAG}-${TARGET}"
curl -fsSLO "https://github.com/Northbound-Dev/soroban-dev-tools/releases/download/${TAG}/SHA256SUMS-${TAG}.txt"
shasum -a 256 -c "SHA256SUMS-${TAG}.txt" --ignore-missing
chmod +x "soroban-dev-${TAG}-${TARGET}"
sudo mv "soroban-dev-${TAG}-${TARGET}" /usr/local/bin/soroban-dev
soroban-dev health --network testnet
```

### Windows (PowerShell)

```powershell
$Tag = "__TAG__"
$Name = "soroban-dev-$Tag-windows-x64.exe"
$Base = "https://github.com/Northbound-Dev/soroban-dev-tools/releases/download/$Tag"
Invoke-WebRequest "$Base/$Name" -OutFile $Name
Invoke-WebRequest "$Base/SHA256SUMS-$Tag.txt" -OutFile "SHA256SUMS-$Tag.txt"
$expected = (Select-String -Path "SHA256SUMS-$Tag.txt" -Pattern $Name).Line.Split(" ")[0]
$actual = (Get-FileHash $Name -Algorithm SHA256).Hash.ToLower()
if ($actual -ne $expected) { throw "Checksum mismatch for $Name" }
New-Item -ItemType Directory -Force "$env:LOCALAPPDATA\soroban-dev" | Out-Null
Move-Item $Name "$env:LOCALAPPDATA\soroban-dev\soroban-dev.exe" -Force
# Then add %LOCALAPPDATA%\soroban-dev to PATH and open a new terminal.
```

## Verify

Every artifact is listed in `SHA256SUMS-__TAG__.txt`. Check it before running
the binary:

```bash
sha256sum -c "SHA256SUMS-__TAG__.txt" --ignore-missing   # Linux
shasum -a 256 -c "SHA256SUMS-__TAG__.txt" --ignore-missing  # macOS
```

Checksums detect corrupted or tampered downloads of **this release**. They are
not signatures: no artifact is signed, and no signing claim is made until
signing is actually implemented and verified.

## Upgrade

There is no auto-updater and no package-registry install. To upgrade, download
the artifact for the newer tag, verify it against that release's checksum file,
and replace the old binary in place (same commands as above). To roll back,
re-download an older tag the same way. Pin a tag if you need a fixed version in
CI.

## Supported targets and limitations

- Targets built and published by the release workflow: Linux x86-64 and ARM64,
  macOS x86-64 and ARM64, Windows x86-64. Nothing else is published.
- Linux builds target glibc distributions. Alpine/musl and Linux ARMv7 are not
  built.
- Binaries are **unsigned and not notarized**. macOS Gatekeeper and Windows
  SmartScreen may warn or refuse to run them. Do not disable these protections
  to work around it; build from source
  (`pnpm install && pnpm build && node packages/cli/dist/bin.js`) if you need a
  locally trusted binary, or add signing/notarization as a follow-up change.
- Only the Linux x86-64 artifact is executed in CI (a hermetic smoke test). The
  other four targets are cross-compiled and checksummed but are not run in CI,
  so they are released as "builds, not exercised" until a runner matrix is
  added.
- Binaries are large (roughly 90–115 MB) because they bundle a Bun runtime.
- Builds use a pinned toolchain (Node 22.12.0, pnpm 9.15.0, Bun 1.4.4) and a
  frozen lockfile; repeated local runs produced byte-identical binaries. CI
  does not yet assert byte equality between runs, so the checksums here cover
  the exact bytes published for this release.

Full documentation: [`docs/cli-release.md`](https://github.com/Northbound-Dev/soroban-dev-tools/blob/main/docs/cli-release.md).
