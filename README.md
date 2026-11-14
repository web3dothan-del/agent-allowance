# agent-allowance

**Live demo (try to hack the agent):** https://web3dothan-del.github.io/agent-allowance/
**On-chain vault:** https://testnet.nearblocks.io/address/vault.web3dothan.testnet
## Live testnet proof
Deployed vault: https://testnet.nearblocks.io/address/vault.web3dothan.testnet

`node agent.mjs` result on testnet (policy: 0.1 NEAR per tx, 0.25 NEAR per day):
1. Pay Alice 0.05 NEAR: APPROVED
2. Prompt-injected transfer to attacker: BLOCKED (payee not on allowlist)
3. Alice 2.5 NEAR: BLOCKED (exceeds per-transaction cap)
4. Pay power company 0.1 NEAR: APPROVED
5. Alice 0.1 NEAR: APPROVED
6. Alice 0.1 NEAR again: BLOCKED (exceeds daily cap)

Each run prints an explorer link per transaction. Amounts are small because the 551 KB contract locks most of the vault's testnet balance for storage.

Note: the two failed `spend` transactions in the explorer are from a first run with larger amounts, before the demo limits were lowered to fit the vault's balance. The final run is the six verdicts above.
