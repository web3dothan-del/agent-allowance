# agent-allowance
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
