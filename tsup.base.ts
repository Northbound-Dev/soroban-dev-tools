import { defineConfig, type Options } from 'tsup';

/**
 * Shared tsup preset for every package in the Soroban Dev Tools monorepo.
 *
 * All `@soroban-dev/*` workspace dependencies are kept external so each
 * package stays thin and resolves through pnpm workspace symlinks at runtime.
 * Build order is topological (pnpm -r), so sibling packages are always
 * compiled — with their `.d.ts` — before the current package builds.
 */
export function sorobanDevTsup(overrides: Partial<Options> = {}): ReturnType<typeof defineConfig> {
  const { external: extraExternal = [], ...rest } = overrides;
  return defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    target: 'es2022',
    outDir: 'dist',
    // Keep all workspace packages external – never bundle them.
    external: [/^@soroban-dev\//, ...(Array.isArray(extraExternal) ? extraExternal : [extraExternal])],
    ...rest,
  });
}
