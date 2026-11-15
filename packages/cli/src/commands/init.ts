import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ValidationError } from '@soroban-dev/errors';

const PROJECT_NAME_PATTERN = /^[a-z][a-z0-9_-]{0,62}$/;

const RESERVED_CRATE_NAMES = new Set([
  'as',
  'async',
  'await',
  'break',
  'const',
  'continue',
  'crate',
  'dyn',
  'else',
  'enum',
  'extern',
  'false',
  'fn',
  'for',
  'if',
  'impl',
  'in',
  'let',
  'loop',
  'match',
  'mod',
  'move',
  'mut',
  'pub',
  'ref',
  'return',
  'self',
  'static',
  'struct',
  'super',
  'test',
  'trait',
  'true',
  'type',
  'unsafe',
  'use',
  'where',
  'while',
]);

/**
 * Options for the `init` project scaffolding command.
 */
export interface InitCommandOptions {
  /** Target project name (must be a valid lowercase Rust crate/directory name). */
  projectName: string;
  /** Optional parent directory where the project directory should be created (defaults to `process.cwd()`). */
  targetDir?: string;
}

/**
 * Result returned after successfully scaffolding a Soroban contract project.
 */
export interface InitCommandResult {
  /** Validated project name. */
  projectName: string;
  /** Normalized Cargo crate name (`-` replaced with `_` where needed for module references). */
  crateIdent: string;
  /** Absolute path to the generated project directory. */
  projectDir: string;
  /** Relative paths of files written inside `projectDir`. */
  createdFiles: string[];
  /** Human-readable next-step instructions. */
  nextSteps: string[];
}

/**
 * Validates that a project name is safe for both filesystem paths and Cargo crate naming.
 *
 * @param projectName - Candidate project name.
 * @returns The trimmed project name.
 * @throws {@link ValidationError} if the project name is empty, unsafe, or invalid.
 *
 * @example
 * ```ts
 * validateProjectName('my-counter'); // 'my-counter'
 * ```
 */
export function validateProjectName(projectName: string): string {
  const trimmed = projectName.trim();
  if (!trimmed) {
    throw new ValidationError(
      'projectName',
      'Project name is required. Usage: soroban-dev init <project-name>',
    );
  }

  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    throw new ValidationError(
      'projectName',
      'Project name must be a single directory name and cannot contain path separators or "..".',
    );
  }

  if (!PROJECT_NAME_PATTERN.test(trimmed)) {
    throw new ValidationError(
      'projectName',
      'Project name must start with a lowercase ASCII letter and contain only lowercase letters, digits, hyphens (-), or underscores (_) (max 63 chars).',
    );
  }

  if (RESERVED_CRATE_NAMES.has(trimmed)) {
    throw new ValidationError(
      'projectName',
      `"${trimmed}" is a reserved Rust keyword and cannot be used as a Cargo package name.`,
    );
  }

  return trimmed;
}

function renderCargoToml(projectName: string): string {
  return `[package]
name = "${projectName}"
version = "0.1.0"
edition = "2021"
publish = false

[lib]
crate-type = ["cdylib"]
doctest = false

[dependencies]
soroban-sdk = "22.0.0"

[dev-dependencies]
soroban-sdk = { version = "22.0.0", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true
`;
}

function renderContractLibRs(): string {
  return `#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Counter,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InvalidStep = 1,
    Overflow = 2,
}

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    /// Increments the stored counter by 1 and returns the updated value.
    pub fn increment(env: Env) -> Result<u32, Error> {
        Self::increment_by(env, 1)
    }

    /// Increments the stored counter by a positive \`step\` and returns the updated value.
    pub fn increment_by(env: Env, step: u32) -> Result<u32, Error> {
        if step == 0 {
            return Err(Error::InvalidStep);
        }
        let current: u32 = env
            .storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0);
        let next = current.checked_add(step).ok_or(Error::Overflow)?;
        env.storage().instance().set(&DataKey::Counter, &next);
        Ok(next)
    }

    /// Returns the current counter value (defaults to 0 when uninitialized).
    pub fn get_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0)
    }

    /// Resets the counter back to 0.
    pub fn reset(env: Env) {
        env.storage().instance().set(&DataKey::Counter, &0u32);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn increment_and_query_counter() {
        let env = Env::default();
        let contract_id = env.register(CounterContract, ());
        let client = CounterContractClient::new(&env, &contract_id);

        assert_eq!(client.get_count(), 0);
        assert_eq!(client.increment(), 1);
        assert_eq!(client.increment_by(&4), 5);
        assert_eq!(client.get_count(), 5);

        client.reset();
        assert_eq!(client.get_count(), 0);
    }

    #[test]
    fn rejects_zero_step_and_overflow() {
        let env = Env::default();
        let contract_id = env.register(CounterContract, ());
        let client = CounterContractClient::new(&env, &contract_id);

        assert_eq!(client.try_increment_by(&0), Err(Ok(Error::InvalidStep)));
        assert_eq!(client.increment_by(&u32::MAX), u32::MAX);
        assert_eq!(client.try_increment(), Err(Ok(Error::Overflow)));
    }
}
`;
}

function renderGitignore(): string {
  return `/target
**/*.rs.bk
.DS_Store
.env
`;
}

function renderProjectReadme(projectName: string, crateIdent: string): string {
  return `# ${projectName}

Minimal Rust/Soroban smart contract project generated offline by \`@soroban-dev/cli\`.

> **Security notice:** This generated starter contract is an **unaudited learning example** and is **not production-ready**. Do not deploy it to Stellar Mainnet or use it with real funds without an independent security review.

## Prerequisites

- Rust \`1.84+\` with the \`wasm32-unknown-unknown\` target installed:
  \`\`\`bash
  rustup target add wasm32-unknown-unknown
  \`\`\`
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) \`22.x\` (optional, for WASM build Helpers)

## Run unit tests (offline)

\`\`\`bash
cargo test
\`\`\`

## Build WASM artifact

\`\`\`bash
cargo build --target wasm32-unknown-unknown --release
\`\`\`

The compiled WASM binary is written to:
\`target/wasm32-unknown-unknown/release/${crateIdent}.wasm\`
`;
}

/**
 * Returns the formatted CLI help text for `init`.
 *
 * @returns Help message string.
 */
export function getInitHelpText(): string {
  return [
    'Usage: soroban-dev init <project-name> [--dir <parent-directory>]',
    'Alias: sdt init <project-name> [--dir <parent-directory>]',
    '',
    'Scaffolds a minimal offline Rust/Soroban smart contract project with unit tests.',
    '',
    'Arguments:',
    '  <project-name>          Lowercase crate/directory name (e.g. my-counter)',
    '',
    'Options:',
    '  --dir <path>            Parent directory for the generated project (default: current directory)',
    '  --help, -h              Show this help message',
  ].join('\n');
}

/**
 * Scaffolds a new minimal Rust/Soroban smart contract project on disk without network access.
 *
 * @param opts - Initialization options including `projectName` and optional `targetDir`.
 * @returns Summary of the generated directory, created files, and next-step commands.
 * @throws {@link ValidationError} if `projectName` is invalid or the destination is non-empty.
 *
 * @example
 * ```ts
 * const result = initCommand({ projectName: 'counter-app', targetDir: '/tmp' });
 * console.log(result.projectDir);
 * ```
 */
export function initCommand(opts: InitCommandOptions): InitCommandResult {
  const projectName = validateProjectName(opts.projectName);
  const crateIdent = projectName.replace(/-/g, '_');
  const baseDir = resolve(opts.targetDir ?? process.cwd());
  const projectDir = join(baseDir, projectName);

  if (existsSync(projectDir)) {
    const stat = statSync(projectDir);
    if (!stat.isDirectory()) {
      throw new ValidationError(
        'projectDir',
        `Destination "${projectDir}" already exists and is not a directory.`,
      );
    }
    const existingEntries = readdirSync(projectDir);
    if (existingEntries.length > 0) {
      throw new ValidationError(
        'projectDir',
        `Destination directory "${projectDir}" already exists and is not empty. Choose a new project name or an empty directory.`,
      );
    }
  } else {
    mkdirSync(projectDir, { recursive: true });
  }

  const srcDir = join(projectDir, 'src');
  mkdirSync(srcDir, { recursive: true });

  const filesToWrite: Array<{ relPath: string; content: string }> = [
    { relPath: 'Cargo.toml', content: renderCargoToml(projectName) },
    { relPath: 'src/lib.rs', content: renderContractLibRs() },
    { relPath: '.gitignore', content: renderGitignore() },
    { relPath: 'README.md', content: renderProjectReadme(projectName, crateIdent) },
  ];

  for (const file of filesToWrite) {
    writeFileSync(join(projectDir, file.relPath), file.content, 'utf8');
  }

  return {
    projectName,
    crateIdent,
    projectDir,
    createdFiles: filesToWrite.map((f) => f.relPath),
    nextSteps: [`cd ${projectName}`, 'cargo test', 'cargo build --target wasm32-unknown-unknown --release'],
  };
}
