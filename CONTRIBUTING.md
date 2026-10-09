# Contributing

Thank you for helping make Soroban development easier. This repository is currently a documentation-first scaffold, so please distinguish existing functionality from proposals: there is no package to install and no project-wide test suite yet.

## Before you start

1. Read the relevant area guide: [CLI](cli/README.md), [testing](testing/README.md), [deployment](deployment/README.md), or [examples](docs/examples/README.md).
2. Open an issue describing the user problem, who it affects, and a small, testable outcome. For a new tool, first agree on its interface, supported environment, and maintenance expectations.
3. Avoid overlapping work by checking existing issues and pull requests before starting.

## Make a change

1. Fork the repository and create a focused branch.
2. Keep changes small and explain any new dependencies or supported platforms.
3. Update the relevant guide whenever a feature, command, requirement, or limitation changes.
4. Verify every documented command against the stated tool version and a clean environment. Do not document placeholder commands as working features.
5. For contract or deployment examples, use a local environment or Stellar testnet. Never include secret keys, seed phrases, tokens, or real account credentials.
6. Review the rendered Markdown and links, then open a pull request with the problem, solution, verification performed, and any known limitations.

## Pull request expectations

- Address one concern per pull request where practical.
- Include tests for executable behavior. If a change is documentation-only, say so and check its links and examples.
- Keep user-facing documentation accurate about what is implemented, planned, and not supported.
- Do not claim mainnet readiness, security guarantees, or compatibility that has not been independently verified.
- Respond to review feedback and keep the pull request focused.

## Reporting a bug or proposing a feature

Include the affected tool and version (if applicable), environment, expected and actual behavior, and minimal reproduction steps. For feature proposals, explain the target user and why existing Stellar/Soroban tooling does not already meet the need.

By contributing, you agree that your contributions are provided under the [MIT License](LICENSE).
