# Soroban Dev Tools

An open-source project exploring practical ways to make building, testing, and deploying Soroban smart contracts easier.

> **Project status:** This repository is currently a documentation-first scaffold. It does not yet contain an installable package, CLI, deployment scripts, or runnable contract-testing utilities. The directories describe areas where focused, useful contributions can grow the project.

## Documentation

Visit the **[Soroban Dev Tools documentation website](https://northbound-dev.github.io/soroban-dev-tools/)** for the project overview, contribution paths, current status, and safety guidance. The page source is in [`docs/index.html`](docs/index.html).

| Area | Description |
| --- | --- |
| [CLI](cli/README.md) | Scope and acceptance guidance for future command-line utilities |
| [Testing](testing/README.md) | Scope and acceptance guidance for future contract-testing tools |
| [Deployment](deployment/README.md) | Scope and safety expectations for future deployment helpers |
| [Examples](docs/examples/README.md) | Guidance for adding verifiable Soroban examples |
| [Contributing](CONTRIBUTING.md) | How to propose, implement, and review changes |

## Getting started

This repository has no runtime dependencies or installation step. To explore it:

```bash
git clone https://github.com/Northbound-Dev/soroban-dev-tools.git
cd soroban-dev-tools
```

If you are contributing a tool or example that interacts with Soroban, install the current [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) and the toolchain required by that contribution. Keep setup instructions specific to the feature; do not assume every contributor needs Rust, Node.js, or a network account.

## Contributing

Small, reviewable contributions are welcome. Start with the [contribution guide](CONTRIBUTING.md), describe the user problem and proposed outcome in an issue, and agree on scope before building a new tool. Documentation and reproducible examples are valuable contributions too.

## License

This project is licensed under the [MIT License](LICENSE).
