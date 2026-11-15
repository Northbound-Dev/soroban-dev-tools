import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ValidationError } from '@soroban-dev/errors';
import { getInitHelpText, initCommand, validateProjectName } from './init';

describe('@soroban-dev/cli – initCommand', () => {
  let tempRoot: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'soroban-dev-init-test-'));
  });

  afterEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
  });

  describe('validateProjectName', () => {
    it('accepts valid lowercase project names', () => {
      expect(validateProjectName('counter')).toBe('counter');
      expect(validateProjectName('my-soroban-contract_1')).toBe('my-soroban-contract_1');
    });

    it('rejects empty or whitespace-only names', () => {
      expect(() => validateProjectName('')).toThrow(ValidationError);
      expect(() => validateProjectName('   ')).toThrow(ValidationError);
    });

    it('rejects path traversal and slashes', () => {
      expect(() => validateProjectName('../escape')).toThrow(ValidationError);
      expect(() => validateProjectName('nested/project')).toThrow(ValidationError);
      expect(() => validateProjectName('nested\\project')).toThrow(ValidationError);
    });

    it('rejects uppercase letters, leading digits, and special characters', () => {
      expect(() => validateProjectName('MyContract')).toThrow(ValidationError);
      expect(() => validateProjectName('1counter')).toThrow(ValidationError);
      expect(() => validateProjectName('counter!@#')).toThrow(ValidationError);
    });

    it('rejects reserved Rust keywords', () => {
      expect(() => validateProjectName('struct')).toThrow(ValidationError);
      expect(() => validateProjectName('test')).toThrow(ValidationError);
    });
  });

  describe('project generation', () => {
    it('creates a complete, offline Soroban contract project with tests and README', () => {
      const result = initCommand({
        projectName: 'sample-counter',
        targetDir: tempRoot,
      });

      expect(result.projectName).toBe('sample-counter');
      expect(result.crateIdent).toBe('sample_counter');
      expect(result.projectDir).toBe(join(tempRoot, 'sample-counter'));
      expect(result.createdFiles).toEqual(['Cargo.toml', 'src/lib.rs', '.gitignore', 'README.md']);
      expect(result.nextSteps).toContain('cargo test');

      const cargoToml = readFileSync(join(result.projectDir, 'Cargo.toml'), 'utf8');
      expect(cargoToml).toContain('name = "sample-counter"');
      expect(cargoToml).toContain('soroban-sdk = "22.0.0"');
      expect(cargoToml).toContain('features = ["testutils"]');

      const libRs = readFileSync(join(result.projectDir, 'src/lib.rs'), 'utf8');
      expect(libRs).toContain('#![no_std]');
      expect(libRs).toContain('pub struct CounterContract;');
      expect(libRs).toContain('fn increment_and_query_counter()');
      expect(libRs).toContain('fn rejects_zero_step_and_overflow()');

      const readme = readFileSync(join(result.projectDir, 'README.md'), 'utf8');
      expect(readme).toContain('# sample-counter');
      expect(readme).toContain('unaudited learning example');
      expect(readme).toContain('sample_counter.wasm');

      expect(existsSync(join(result.projectDir, '.gitignore'))).toBe(true);
    });

    it('allows scaffolding into an existing empty directory', () => {
      const emptyDest = join(tempRoot, 'empty-proj');
      mkdirSync(emptyDest, { recursive: true });

      const result = initCommand({
        projectName: 'empty-proj',
        targetDir: tempRoot,
      });

      expect(existsSync(join(result.projectDir, 'Cargo.toml'))).toBe(true);
    });

    it('refuses to overwrite an existing non-empty directory', () => {
      const nonEmptyDest = join(tempRoot, 'existing-proj');
      mkdirSync(nonEmptyDest, { recursive: true });
      writeFileSync(join(nonEmptyDest, 'existing.txt'), 'do not overwrite', 'utf8');

      expect(() =>
        initCommand({
          projectName: 'existing-proj',
          targetDir: tempRoot,
        }),
      ).toThrow(ValidationError);

      expect(readFileSync(join(nonEmptyDest, 'existing.txt'), 'utf8')).toBe('do not overwrite');
      expect(existsSync(join(nonEmptyDest, 'Cargo.toml'))).toBe(false);
    });

    it('refuses when destination path is an existing file', () => {
      const fileDest = join(tempRoot, 'file-target');
      writeFileSync(fileDest, 'content', 'utf8');

      expect(() =>
        initCommand({
          projectName: 'file-target',
          targetDir: tempRoot,
        }),
      ).toThrow(ValidationError);
    });
  });

  describe('getInitHelpText', () => {
    it('describes usage and options', () => {
      const help = getInitHelpText();
      expect(help).toContain('soroban-dev init <project-name>');
      expect(help).toContain('sdt init <project-name>');
      expect(help).toContain('--dir <path>');
    });
  });
});
