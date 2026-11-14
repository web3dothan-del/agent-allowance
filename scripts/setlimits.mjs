import { connect, keyStores, KeyPair, utils } from "near-api-js";
const id = process.env.OWNER_ID;
const ks = new keyStores.InMemoryKeyStore();
await ks.setKey("testnet", id, KeyPair.fromString(process.env.OWNER_KEY));
const near = await connect({ networkId: "testnet", keyStore: ks, nodeUrl: "https://rpc.testnet.near.org" });
const owner = await near.account(id);
await owner.functionCall({ contractId: "vault." + id, methodName: "set_limits", args: { perTxCap: utils.format.parseNearAmount("0.1"), dailyCap: utils.format.parseNearAmount("0.25") } });
console.log("limits set: 0.1 per tx, 0.25 per day");
