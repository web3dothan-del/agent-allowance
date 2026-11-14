import {
  NearBindgen, near, call, view, initialize, NearPromise, UnorderedMap, Vector,
} from "near-sdk-js";

type Entry = {
  ts: number;
  payee: string;
  amount: string;
  memo: string;
  approved: boolean;
  reason: string;
};

@NearBindgen({ requireInit: true })
export class AgentAllowance {
  owner: string = "";
  agent: string = "";
  perTxCap: string = "0";
  dailyCap: string = "0";
  allowed: UnorderedMap<boolean> = new UnorderedMap<boolean>("a");
  spentByDay: UnorderedMap<string> = new UnorderedMap<string>("d");
  history: Vector<Entry> = new Vector<Entry>("h");

  @initialize({})
  init({ owner, agent, perTxCap, dailyCap }: {
    owner: string; agent: string; perTxCap: string; dailyCap: string;
  }) {
    this.owner = owner;
    this.agent = agent;
    this.perTxCap = perTxCap;
    this.dailyCap = dailyCap;
  }

  @call({ payableFunction: true })
  deposit() {}

  @call({})
  set_limits({ perTxCap, dailyCap }: { perTxCap: string; dailyCap: string }) {
    this.assertOwner();
    this.perTxCap = perTxCap;
    this.dailyCap = dailyCap;
  }

  @call({})
  allow_payee({ payee }: { payee: string }) {
    this.assertOwner();
    this.allowed.set(payee, true);
  }

  @call({})
  revoke_payee({ payee }: { payee: string }) {
    this.assertOwner();
    this.allowed.remove(payee);
  }

  @call({})
  set_agent({ agent }: { agent: string }) {
    this.assertOwner();
    this.agent = agent;
  }

  @call({})
  spend({ payee, amount, memo }: { payee: string; amount: string; memo: string }) {
    if (near.predecessorAccountId() !== this.agent) {
      throw new Error("only the agent can call spend");
    }
    const amt = BigInt(amount);
    const day = String(Math.floor(Number(near.blockTimestamp() / 1_000_000n) / 86_400_000));
    const spentToday = BigInt(this.spentByDay.get(day) || "0");

    let reason = "";
    if (!this.allowed.get(payee)) reason = "payee not on allowlist";
    else if (amt > BigInt(this.perTxCap)) reason = "exceeds per-transaction cap";
    else if (spentToday + amt > BigInt(this.dailyCap)) reason = "exceeds daily cap";
    else if (amt > near.accountBalance() - 1_000_000_000_000_000_000_000_000n) reason = "vault balance too low";

    const approved = reason === "";
    this.history.push({
      ts: Number(near.blockTimestamp() / 1_000_000n),
      payee, amount, memo, approved, reason: approved ? "ok" : reason,
    });

    if (!approved) {
      near.log(`BLOCKED ${amount} -> ${payee}: ${reason}`);
      return false;
    }
    this.spentByDay.set(day, (spentToday + amt).toString());
    near.log(`APPROVED ${amount} -> ${payee}`);
    return NearPromise.new(payee).transfer(amt);
  }

  @view({})
  get_policy() {
    return {
      owner: this.owner, agent: this.agent,
      perTxCap: this.perTxCap, dailyCap: this.dailyCap,
      allowed: this.allowed.keys({ start: 0, limit: 100 }),
    };
  }

  @view({})
  get_history({ from = 0, limit = 50 }: { from?: number; limit?: number }) {
    const out: Entry[] = [];
    const end = Math.min(this.history.length, from + limit);
    for (let i = from; i < end; i++) out.push(this.history.get(i) as Entry);
    return out;
  }

  private assertOwner() {
    if (near.predecessorAccountId() !== this.owner) throw new Error("owner only");
  }
}
