#!/usr/bin/env node
/**
 * soroban-dev CLI entry point.
 *
 * Usage:
 *   soroban-dev health [--network testnet] [--rpc-url <url>]
 */

import { healthCommand } from './commands/health';

const [, , command, ...args] = process.argv;

function parseArgs(argv: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg?.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      const value = argv[i + 1];
      if (value !== undefined && !value.startsWith('--')) {
        result[key] = value;
        i++;
      } else {
        result[key] = 'true';
      }
    }
  }
  return result;
}

async function main(): Promise<void> {
  const opts = parseArgs(args);

  switch (command) {
    case 'health': {
      const status = await healthCommand({ network: opts['network'], rpcUrl: opts['rpcUrl'] });
      console.log(`Status: ${status}`);
      break;
    }
    default:
      console.error(`Unknown command: ${command ?? '(none)'}`);
      console.error('Available commands: health');
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
