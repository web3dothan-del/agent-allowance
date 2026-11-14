import { connect, keyStores, KeyPair } from "near-api-js";
const id = process.env.OWNER_ID, k = process.env.OWNER_KEY;
console.log("id=[" + id + "]", "keylen=", k && k.length);
const kp = KeyPair.fromString(k);
const pub = kp.getPublicKey().toString();
console.log("pubkey:", pub);
const ks = new keyStores.InMemoryKeyStore();
await ks.setKey("testnet", id, kp);
console.log("keystore has key:", !!(await ks.getKey("testnet", id)));
const near = await connect({ networkId: "testnet", keyStore: ks, nodeUrl: "https://rpc.testnet.near.org" });
try {
  const r = await near.connection.provider.query({ request_type: "view_access_key", finality: "final", account_id: id, public_key: pub });
  console.log("on-chain key OK:", JSON.stringify(r.permission));
} catch (e) { console.log("on-chain key check FAILED:", e.message); }
try {
  const a = await near.account(id);
  console.log("balance:", (await a.getAccountBalance()).available);
} catch (e) { console.log("account check FAILED:", e.message); }
