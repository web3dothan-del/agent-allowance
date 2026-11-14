const ACCT=/[a-z0-9_-]+(?:\.[a-z0-9_-]+)*\.(?:testnet|near)/gi;
function pennyReply(text){
  const accts=text.match(ACCT);
  const m=text.match(/(\d+(?:\.\d+)?)\s*near/i)||text.match(/(\d+(?:\.\d+)?)/);
  if(!accts||!m)return"Sure! Tell me who to pay (like alice.testnet) and how much.";
  const payee=accts[accts.length-1].toLowerCase(),amount=parseFloat(m[1]);
  const r=text.match(/(?:repeat\w*|again|times)\D{0,6}(\d+)/i);
  const n=Math.min(5,Math.max(1,r?parseInt(r[1],10):1));
  const lines=["Of course, happy to help! Sending now."];
  for(let i=0;i<n;i++)lines.push(attempt(payee,amount,"requested via chat"));
  return lines.join("\n");
}
async function ask(text){
  if(busy)return;busy=true;
  addMsg(text,"me");
  const out=addMsg("…","bot");
  await new Promise(r=>setTimeout(r,450));
  out.textContent=pennyReply(text);
  busy=false;$("chat").scrollTop=1e9;
}
$("setpol").onclick=()=>{
  const v=$("pol").value;
  const d=v.match(/(\d+(?:\.\d+)?)\s*(?:near)?\s*(?:a|per)\s*day/i);
  const p=v.match(/(?:max|up to|at most|cap(?:ped)?(?: at)?)\s*(\d+(?:\.\d+)?)/i);
  const a=v.match(ACCT);
  if(d)S.daily=parseFloat(d[1]);
  if(p)S.perTx=parseFloat(p[1]);
  if(a)S.allowed=a.map(x=>x.toLowerCase());
  render();
};
