import fs from "fs";
import { connect, keyStores, KeyPair, utils } from "near-api-js";

const OWNER = process.env.OWNER_ID, KEY = process.env.OWNER_KEY;
if (!OWNER || !KEY) throw new Error("Set OWNER_ID and OWNER_KEY");
const near$ = (n) => utils.format.parseNearAmount(String(n));

const ks = new keyStores.InMemoryKeyStore();
await ks.setKey("testnet", OWNER, KeyPair.fromString(KEY));
const near = await connect({
  networkId: "testnet", keyStore: ks,
  nodeUrl: "https://rpc.testnet.near.org",
});
const owner = await near.account(OWNER);

const ids = {
  vault: `vault.${OWNER}`, agent: `agent.${OWNER}`,
  alice: `alice.${OWNER}`, power: `power.${OWNER}`, attacker: `attacker.${OWNER}`,
};
const keys = {};
for (const [name, amt] of [["vault", 6], ["agent", 1], ["alice", 0.1], ["power", 0.1], ["attacker", 0.1]]) {
  keys[name] = KeyPair.fromRandom("ed25519");
  await owner.createAccount(ids[name], keys[name].getPublicKey(), near$(amt));
  await ks.setKey("testnet", ids[name], keys[name]);
  console.log("created", ids[name]);
}

const vault = await near.account(ids.vault);
await vault.deployContract(fs.readFileSync("../contract/build/agent_allowance.wasm"));
await vault.functionCall({
  contractId: ids.vault, methodName: "init",
  args: { owner: OWNER, agent: ids.agent, perTxCap: near$(1), dailyCap: near$(3) },
});
for (const p of [ids.alice, ids.power]) {
  await owner.functionCall({ contractId: ids.vault, methodName: "allow_payee", args: { payee: p } });
}
fs.writeFileSync(".agent.json", JSON.stringify({
  ...ids, agentKey: keys.agent.toString(),
}, null, 2));
console.log("\nDone. Vault:", ids.vault);
console.log("Explorer: https://testnet.nearblocks.io/address/" + ids.vault);
