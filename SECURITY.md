# Security Policy

Soroban Dev Tools interacts with the Stellar network and developer credentials.
We take security seriously and appreciate responsible disclosure.

## Supported Versions

The SDK follows Semantic Versioning. Security fixes are released for the latest
minor of the current major. During the `0.x` phase, please track the latest
release.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security reports.**

Open a [GitHub Security Advisory](https://github.com/Northbound-Dev/soroban-dev-tools/security/advisories/new)
or email the maintainers with:

- A description of the vulnerability and its impact
- Steps to reproduce (proof of concept if possible)
- Affected package(s) and version(s)

We aim to acknowledge reports within 48 hours and to provide a remediation
timeline within five business days.

## Scope & Handling Guidance

- **Never commit secrets.** Stellar secret keys, mnemonics, API tokens, and
  signing material must not appear in source, tests, or examples.
- **No live network calls in tests.** Unit tests must mock all network I/O.
  Integration tests that require testnet should be clearly labeled and opt-in.
- **Input validation.** All functions that accept user-supplied data (contract
  addresses, XDR, network passphrases) validate and sanitize inputs before use.
- **Least privilege.** Scope API keys and signing keys to the minimum permissions
  required for the task.
- **Dependency hygiene.** Keep dependencies pinned to exact versions and audit
  regularly with `pnpm audit`.

Thank you for helping keep the Soroban developer ecosystem safe.
