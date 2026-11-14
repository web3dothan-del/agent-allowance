import { connect, keyStores, utils } from "near-api-js";
const near = await connect({ networkId: "testnet", keyStore: new keyStores.InMemoryKeyStore(), nodeUrl: "https://rpc.testnet.near.org" });
const a = await near.account("vault." + process.env.OWNER_ID);
const s = await a.state();
const f = (y) => utils.format.formatNearAmount(y.toString(), 3);
const locked = BigInt(s.storage_usage) * 10n ** 19n;
console.log("vault total:", f(s.amount), " locked for storage:", f(locked), " spendable:", f(BigInt(s.amount) - locked));
