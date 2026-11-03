# Contributing to Soroban Dev Tools

Thanks for your interest in improving the TypeScript toolkit for Soroban smart
contract development on Stellar. We develop in the open and welcome issues,
discussion, and pull requests.

## Getting started

```bash
git clone https://github.com/Northbound-Dev/soroban-dev-tools.git
cd soroban-dev-tools
pnpm install
pnpm build      # build every package (topological order)
pnpm typecheck  # strict TypeScript across the workspace
pnpm test       # run the vitest suites
```

This is a [pnpm](https://pnpm.io) workspace monorepo. Each package under
`packages/*` is independently versioned and depends on its siblings through the
`workspace:*` protocol. `@soroban-dev/types`, `@soroban-dev/errors`, and
`@soroban-dev/utils` sit at the bottom of the dependency graph — everything else
builds on top.

## Ground rules

- **Strict TypeScript.** `strict` is on and `any` is banned
  (`@typescript-eslint/no-explicit-any`). Prefer generics and precise types.
- **Keep packages thin.** Resource packages wrap RPC endpoints; they never
  encode business logic or make assumptions about the calling environment.
- **Conventional Commits.** `feat:`, `fix:`, `docs:`, `test:`, `refactor:`,
  `chore:`, etc.
- **Tests are required** for new behaviour. Mock `fetch` and Soroban RPC
  responses; never call a live network in unit tests.
- **Public API is documented.** Exported functions carry TSDoc with parameters,
  return type, and an example.
- **No secrets in source.** Stellar secret keys, mnemonics, and API tokens must
  never appear in code, tests, or examples. Use environment variables and
  document them clearly.

## Pull request checklist

1. `pnpm build && pnpm typecheck && pnpm test` all pass.
2. New/changed public API is exported from the package `index.ts` and typed.
3. Tests cover the happy path and at least one error path.
4. Version bumps follow [SemVer](https://semver.org).

## Branch strategy

`main` is always releasable. Use `feature/*` and `fix/*` branches and open PRs
against `main`.

By contributing you agree that your contributions are licensed under the
[MIT License](LICENSE).
