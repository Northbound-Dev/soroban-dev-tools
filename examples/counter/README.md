# Soroban Counter Contract Example

This directory provides the baseline Rust/Soroban smart contract reference example for `soroban-dev-tools`.

> **Security disclaimer:** This contract is an **unaudited educational example** and is **not production-ready**. Do not deploy it to Stellar Mainnet or use it to custody real assets.

## What this example demonstrates

- **Instance storage state management** (`env.storage().instance()`) using a typed `#[contracttype]` `DataKey::Counter`.
- **Typed contract errors** (`#[contracterror]`) for input validation (`Error::InvalidStep` when `step == 0`) and arithmetic boundary protection (`Error::Overflow` on `u32::MAX` overflow).
- **Local unit testing** using `soroban_sdk::Env::default()` and generated contract clients (`CounterContractClient` / `try_*` methods) with zero network access or secret keys required.

## Prerequisites and tested versions

- **Rust toolchain:** `rustc 1.84.0+` (`edition = "2021"`)
- **WASM target:** `wasm32-unknown-unknown`
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
- **Soroban SDK:** `soroban-sdk = "22.0.0"`
- **Stellar CLI (optional, for WASM inspection/optimization):** `stellar-cli 22.x`

## Build and test (100% offline)

From this directory (`examples/counter`):

```bash
# 1. Run the unit and boundary test suite in the local Soroban SDK test environment
cargo test

# 2. Build the contract WASM binary
cargo build --target wasm32-unknown-unknown --release
```

### Expected test output

```text
running 3 tests
test test::default_count_is_zero ... ok
test test::increment_and_reset_state_transitions ... ok
test test::boundary_rejects_zero_step_and_u32_overflow ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

### Compiled WASM output path

```text
target/wasm32-unknown-unknown/release/soroban_counter_example.wasm
```