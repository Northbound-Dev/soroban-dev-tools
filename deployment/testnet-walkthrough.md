# Verified Local-to-Testnet Soroban Deployment Walkthrough

This standalone walkthrough guides you from building a local Soroban smart contract to deploying and invoking it on **Stellar Testnet** using the official [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli).

> **Important safety and scope notice:**
> - **Unaudited example:** The reference counter contract ([`../examples/counter/`](../examples/counter/)) is an **unaudited educational example** and **must never be deployed to Stellar Mainnet** or used with real funds.
> - **Testnet-only:** Every network command in this guide explicitly passes `--network testnet`. Do not substitute `--network mainnet`.
> - **No built-in deployment script:** This repository does not ship automated deployment scripts. All network and signing operations below are performed directly by the official `stellar` CLI.
> - **Secret key hygiene:** Never paste secret keys (`S...`) or recovery seed phrases into source files, Git commits, pull requests, issues, or shell command arguments where they can be captured in shell history or CI logs.

---

## 1. Tested Prerequisites and Tool Versions

All commands in this walkthrough were verified against the following versions:

| Tool | Tested Version | Purpose |
|---|---|---|
| **Rust (`rustc` / `cargo`)** | `1.84.1` | Compiles the Rust Soroban contract to WASM |
| **Rust WASM target** | `wasm32-unknown-unknown` | Target triple required by the Soroban VM |
| **Stellar CLI (`stellar`)** | `22.3.0` | Builds WASM, manages testnet identities, deploys and invokes contracts |
| **Soroban SDK (`soroban-sdk`)** | `22.0.0` | Contract guest SDK used by the reference example |

Verify your local installations before starting:

```bash
rustc --version
# Expected: rustc 1.84.1 (...)

rustup target list --installed | grep wasm32-unknown-unknown
# Expected: wasm32-unknown-unknown
# (If missing, run: rustup target add wasm32-unknown-unknown)

stellar --version
# Expected: stellar 22.3.0 (...)
```

---

## 2. Run Offline Unit Tests and Build the Contract WASM

Navigate to the reference counter contract example (or a project scaffolded with `soroban-dev init`) and verify that all local unit tests pass before touching the network:

```bash
cd examples/counter
cargo test
```

**Expected output:**

```text
running 3 tests
test test::default_count_is_zero ... ok
test test::increment_and_reset_state_transitions ... ok
test test::boundary_rejects_zero_step_and_u32_overflow ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Next, build the optimized WASM binary using the Stellar CLI:

```bash
stellar contract build
```

**Expected output / success check:**

```bash
ls -lh target/wasm32-unknown-unknown/release/soroban_counter_example.wasm
```

Verify that `target/wasm32-unknown-unknown/release/soroban_counter_example.wasm` exists and is non-empty (typically ~1.5-3 KB).

---

## 3. Verify Explicit Testnet Network Configuration

Confirm that the `testnet` network preset is configured in your Stellar CLI environment:

```bash
stellar network ls
```

**Expected output:**

```text
local
testnet
futurenet
mainnet
```

You can inspect the exact Testnet RPC endpoint and passphrase with:

```bash
stellar network info --network testnet
# RPC URL: https://soroban-testnet.stellar.org
# Network Passphrase: Test SDF Network ; September 2015
```

> Always pass `--network testnet` explicitly on every command that interacts with the network so there is no ambiguity about which ledger is targeted.

---

## 4. Create and Fund a Disposable Testnet Identity

Use `stellar keys generate` to create a named testnet identity stored in the Stellar CLI's local keystore/OS keychain and fund it automatically via the Testnet Friendbot faucet:

```bash
stellar keys generate --global testnet-deployer --network testnet --fund
```

Verify the public address (`G...`) and confirm that the account is funded on Testnet:

```bash
stellar keys address testnet-deployer
# Expected: G... (56-character Stellar public key starting with G)
```

### Understanding Testnet Funding, Transaction Fees, and Storage Rent

- **Friendbot funding:** `--fund` requests 10,000 test XLM from the Stellar Testnet Friendbot faucet. Test XLM has zero real-world value.
- **Transaction costs:** Deploying a contract uploads the WASM bytecode to the ledger and creates a contract instance entry. Each transaction charges an inclusion fee plus a Soroban resource fee (CPU instructions, ledger read/write bytes, and initial storage rent).
- **Credential security:** Never run `stellar keys show` in shared terminals or CI logs, and never pass raw `S...` secret keys on the command line. Refer to the identity by its alias (`--source-account testnet-deployer`).

---

## 5. Deploy the Contract to Stellar Testnet

Deploy the compiled WASM binary to Stellar Testnet using your `testnet-deployer` identity:

```bash
CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_counter_example.wasm \
  --source-account testnet-deployer \
  --network testnet)

echo "Deployed Contract ID: $CONTRACT_ID"
```

**Expected output / success check:**

- `CONTRACT_ID` is a 56-character Soroban contract address starting with `C` (for example, `CB...`).

---

## 6. Verify and Invoke the Deployed Testnet Contract

### 6.1 Read-only simulation (`--send=no`)

Query `get_count` without submitting an on-chain transaction or paying transaction fees:

```bash
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account testnet-deployer \
  --network testnet \
  --send=no \
  -- \
  get_count
```

**Expected output:**

```text
0
```

### 6.2 Stateful invocation (`increment` and `increment_by`)

Submit a Testnet transaction to increment the counter:

```bash
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account testnet-deployer \
  --network testnet \
  -- \
  increment
```

**Expected output:**

```text
1
```

Increment by a custom step (`4`):

```bash
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account testnet-deployer \
  --network testnet \
  -- \
  increment_by --step 4
```

**Expected output:**

```text
5
```

Re-run the read-only query to confirm the updated ledger state:

```bash
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account testnet-deployer \
  --network testnet \
  --send=no \
  -- \
  get_count
# Expected: 5
```

---

## 7. Cleanup, TTL Archival, and Recovery Considerations

- **Testnet resets:** Stellar Testnet is periodically reset by the Stellar Development Foundation. Deployed contracts, ledger state, and funded test accounts do not persist across Testnet resets.
- **State archival (TTL):** Soroban instance storage has a Time-To-Live (TTL) measured in ledgers. If a contract's instance TTL expires, invocations fail until the entry is restored with:
  ```bash
  stellar contract restore \
    --id "$CONTRACT_ID" \
    --source-account testnet-deployer \
    --network testnet
  ```
- **Removing local disposable keys:** When you finish testing, remove the disposable Testnet identity from your machine:
  ```bash
  stellar keys rm testnet-deployer
  ```

---

## 8. Troubleshooting Common Setup and Deployment Failures

| Symptom / Error | Cause | Resolution |
|---|---|---|
| `error[E0463]: can't find crate for core` | `wasm32-unknown-unknown` target is not installed | Run `rustup target add wasm32-unknown-unknown` |
| Friendbot `429 Too Many Requests` or timeout during `--fund` | Testnet Friendbot rate limit or transient outage | Wait 60 seconds and run `stellar keys fund testnet-deployer --network testnet` |
| `tx_insufficient_fee` or simulation resource error | Network congestion or insufficient fee bump | Pass `--inclusion-fee 1000` to `stellar contract deploy` / `invoke` |
| `HostError: Error(Contract, #1)` / `Error(Contract, #2)` | Contract returned `Error::InvalidStep` (`step == 0`) or `Error::Overflow` | Pass a positive `--step` within `u32` bounds |
| Account not found (`op_no_source_account`) | Testnet reset wiped the account or `--fund` was skipped | Run `stellar keys fund testnet-deployer --network testnet` |

## Authoritative References

- [Stellar CLI Reference Documentation](https://developers.stellar.org/docs/tools/stellar-cli)
- [Soroban Smart Contract Deployment Guide](https://developers.stellar.org/docs/build/guides/cli/deploy-contract)
- [Stellar Developer Discord](https://discord.gg/stellardev)