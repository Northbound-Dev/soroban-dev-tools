#!/usr/bin/env bash
#
# Build standalone `soroban-dev` CLI binaries and their checksums for every
# supported release target.
#
# Usage:
#   scripts/build-cli-binaries.sh <version> [output-directory]
#
#   <version>            Release version to put in artifact names, without the
#                        leading "v" (for example 0.1.0).
#   [output-directory]   Where binaries and checksums are written.
#                        Defaults to ./dist-binaries.
#
# Environment:
#   BUN                  Bun executable to use (default: `bun` from PATH).
#   BUN_VERSION          When set, abort unless `bun --version` matches exactly.
#
# Prerequisites: `pnpm install --frozen-lockfile && pnpm build` must have run,
# because the CLI bundles the compiled workspace packages.
#
# Reproducibility: the release workflow pins Node, pnpm, Bun and the lockfile.
# Repeated runs with the same pins produce byte-identical binaries, but Bun
# includes the output filename in the compiled executable, so artifact names
# are part of the build contract. Published checksums describe the exact bytes
# attached to a release.

set -euo pipefail

readonly TARGETS=(linux-x64 linux-arm64 darwin-x64 darwin-arm64 windows-x64)

readonly ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly CLI_ENTRY="packages/cli/src/bin.ts"

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  cat <<'EOF'
Usage: scripts/build-cli-binaries.sh <version> [output-directory]

Builds standalone soroban-dev binaries for linux-x64, linux-arm64,
darwin-x64, darwin-arm64 and windows-x64, plus SHA256SUMS-v<version>.txt.

  <version>            Release version without the leading "v" (e.g. 0.1.0)
  [output-directory]   Output directory (default: ./dist-binaries)

Environment: BUN (path to bun), BUN_VERSION (assert an exact bun version).
EOF
  exit 0
fi

[[ $# -ge 1 ]] || die "missing <version> argument (see --help)"

version="${1#v}"
out_dir="${2:-$ROOT/dist-binaries}"

[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] ||
  die "version '$version' is not a stable semantic version (expected MAJOR.MINOR.PATCH)"

bun_bin="${BUN:-bun}"
command -v "$bun_bin" >/dev/null 2>&1 || die "bun not found; set BUN or install Bun"

bun_version="$("$bun_bin" --version)"
if [[ -n ${BUN_VERSION:-} && "$bun_version" != "$BUN_VERSION" ]]; then
  die "bun version mismatch: expected $BUN_VERSION, got $bun_version"
fi

cd "$ROOT"
[[ -f "$CLI_ENTRY" ]] || die "$CLI_ENTRY not found"

[[ -f packages/client/dist/index.js ]] ||
  die "workspace packages are not built; run 'pnpm install --frozen-lockfile && pnpm build' first"

if command -v sha256sum >/dev/null 2>&1; then
  sha256_cmd=(sha256sum)
elif command -v shasum >/dev/null 2>&1; then
  sha256_cmd=(shasum -a 256)
else
  die "neither sha256sum nor shasum is available"
fi

mkdir -p "$out_dir"
out_dir="$(cd "$out_dir" && pwd)"
checksums="$out_dir/SHA256SUMS-v${version}.txt"
: >"$checksums"

printf 'Building soroban-dev v%s with Bun %s for %d targets\n\n' \
  "$version" "$bun_version" "${#TARGETS[@]}"

for target in "${TARGETS[@]}"; do
  suffix=""
  [[ "$target" == windows-* ]] && suffix=".exe"
  artifact="soroban-dev-v${version}-${target}${suffix}"

  printf -- '-> %s\n' "$artifact"
  "$bun_bin" build "$CLI_ENTRY" \
    --compile \
    --minify \
    --target="bun-${target}" \
    --outfile="$out_dir/$artifact"

  hash="$("${sha256_cmd[@]}" "$out_dir/$artifact" | awk '{print $1}')"
  printf '%s  %s\n' "$hash" "$artifact" >>"$checksums"
done

sort -k2 "$checksums" -o "$checksums"

printf '\nArtifacts in %s:\n' "$out_dir"
(
  cd "$out_dir"
  ls -1sh soroban-dev-*
  printf '\n'
  cat "$(basename "$checksums")"
)
