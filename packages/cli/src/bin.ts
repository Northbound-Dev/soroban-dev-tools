#!/usr/bin/env node
/**
 * soroban-dev CLI entry point.
 *
 * Usage:
 *   soroban-dev health [--network testnet] [--rpc-url <url>]
 *   soroban-dev init <project-name> [--dir <parent-directory>]
 */

import { healthCommand } from './commands/health';
import { getInitHelpText, initCommand } from './commands/init';

const [, , command, ...args] = process.argv;

interface ParsedArgs {
  flags: Record<string, string>;
  positionals: string[];
}

function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string> = {};
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) {
      continue;
    }
    if (arg === '-h' || arg === '--help') {
      flags['help'] = 'true';
      continue;
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      const value = argv[i + 1];
      if (value !== undefined && !value.startsWith('-')) {
        flags[key] = value;
        i++;
      } else {
        flags[key] = 'true';
      }
    } else {
      positionals.push(arg);
    }
  }
  return { flags, positionals };
}

function printGeneralHelp(): void {
  console.log(
    [
      'Usage: soroban-dev <command> [options]',
      'Alias: sdt <command> [options]',
      '',
      'Commands:',
      '  init <project-name> [--dir <path>]            Scaffold an offline Soroban contract project',
      '  health [--network testnet] [--rpc-url <url>]  Check Soroban RPC endpoint health',
      '',
      'Options:',
      '  --help, -h                                    Show help information',
    ].join('\n'),
  );
}

async function main(): Promise<void> {
  const { flags, positionals } = parseArgs(args);

  if (command === '--help' || command === '-h') {
    printGeneralHelp();
    return;
  }

  switch (command) {
    case 'health': {
      const status = await healthCommand({
        network: flags['network'],
        rpcUrl: flags['rpcUrl'],
      });
      console.log(`Status: ${status}`);
      break;
    }
    case 'init': {
      if (flags['help'] === 'true') {
        console.log(getInitHelpText());
        return;
      }
      const projectName = positionals[0] ?? '';
      const result = initCommand({
        projectName,
        targetDir: flags['dir'],
      });
      console.log(`Created Soroban contract project "${result.projectName}" at ${result.projectDir}`);
      console.log('Files created:');
      for (const file of result.createdFiles) {
        console.log(`  - ${file}`);
      }
      console.log('\nNext steps:');
      for (const step of result.nextSteps) {
        console.log(`  ${step}`);
      }
      break;
    }
    default:
      console.error(`Unknown command: ${command ?? '(none)'}`);
      console.error('Available commands: init, health');
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
