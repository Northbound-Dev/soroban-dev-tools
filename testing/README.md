# Testing utilities

This directory describes a potential home for tools that improve the quality and repeatability of Soroban contract tests. **No testing library, test runner, or mock generator is implemented here yet.**

## Contribution direction

Useful contributions could reduce friction around local contract tests, integration tests, or reproducible test fixtures. Prefer interoperable additions that complement the Stellar/Soroban development toolchain rather than wrapping existing commands without a clear user benefit.

## Acceptance checklist for a testing contribution

- Include a minimal, working sample contract or fixture and reproducible test instructions.
- Identify supported Rust and Stellar CLI versions.
- Demonstrate behavior with automated tests; do not rely on an undocumented network service.
- Keep testnet use opt-in and clearly separate it from local tests.
- Explain what is mocked and what the test does not prove.
- Update examples and the main [project overview](../README.md).

Tests are not security audits. Do not describe passing tests as proof that a contract is secure.
