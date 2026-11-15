#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Counter,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InvalidStep = 1,
    Overflow = 2,
}

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    /// Increments the stored counter by 1 and returns the updated value.
    pub fn increment(env: Env) -> Result<u32, Error> {
        Self::increment_by(env, 1)
    }

    /// Increments the stored counter by a positive `step` and returns the updated value.
    pub fn increment_by(env: Env, step: u32) -> Result<u32, Error> {
        if step == 0 {
            return Err(Error::InvalidStep);
        }
        let current: u32 = env
            .storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0);
        let next = current.checked_add(step).ok_or(Error::Overflow)?;
        env.storage().instance().set(&DataKey::Counter, &next);
        Ok(next)
    }

    /// Returns the current counter value (defaults to 0 when uninitialized).
    pub fn get_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0)
    }

    /// Resets the counter back to 0.
    pub fn reset(env: Env) {
        env.storage().instance().set(&DataKey::Counter, &0u32);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn default_count_is_zero() {
        let env = Env::default();
        let contract_id = env.register(CounterContract, ());
        let client = CounterContractClient::new(&env, &contract_id);

        assert_eq!(client.get_count(), 0);
    }

    #[test]
    fn increment_and_reset_state_transitions() {
        let env = Env::default();
        let contract_id = env.register(CounterContract, ());
        let client = CounterContractClient::new(&env, &contract_id);

        assert_eq!(client.increment(), 1);
        assert_eq!(client.increment_by(&4), 5);
        assert_eq!(client.get_count(), 5);

        client.reset();
        assert_eq!(client.get_count(), 0);
    }

    #[test]
    fn boundary_rejects_zero_step_and_u32_overflow() {
        let env = Env::default();
        let contract_id = env.register(CounterContract, ());
        let client = CounterContractClient::new(&env, &contract_id);

        assert_eq!(client.try_increment_by(&0), Err(Ok(Error::InvalidStep)));
        assert_eq!(client.increment_by(&u32::MAX), u32::MAX);
        assert_eq!(client.try_increment(), Err(Ok(Error::Overflow)));
        assert_eq!(client.get_count(), u32::MAX);
    }
}