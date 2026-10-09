# CLI utilities

This directory is a place for future command-line tools for Soroban developers. **There is no CLI implementation or installable command in this repository today.**

## Contribution direction

Potential contributions include project scaffolding, repeatable local-development workflows, and network configuration helpers. Before starting a tool, open an issue to agree on its user, supported platforms, command interface, and maintenance owner.

## Acceptance checklist for a CLI contribution

- Provide a runnable implementation and a documented installation path.
- State supported operating systems, prerequisites, and tested Stellar CLI versions.
- Make `--help` useful and validate arguments with actionable error messages.
- Avoid hidden network activity and never print or persist secret credentials.
- Include automated tests and a safe local or testnet example.
- Document limitations and update the main [project overview](../README.md).

Keep commands and examples clearly marked as proposals until they are implemented and verified.
