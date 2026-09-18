/* ═══════════════════════════════════════════════════════════════
   LooterStudio® anonymous market — pay-to-reveal worker
   GET  /stats                → counters
   POST /claim {sig, kind}    → verifies a USDC payment on Solana and
                                reveals idea #n or beer certificate #n
   Ideas live in KV under "ideas" (JSON array of strings).
   ═══════════════════════════════════════════════════════════════ */

const RPCS = ['https://api.mainnet-beta.solana.com', 'https://solana-rpc.publicnode.com'];

let reqOrigin = '';
const cors = (env, extra = {}) => ({
  'Access-Control-Allow-Origin': [env.ALLOWED_ORIGIN, 'https://looterstudio.xyz', 'https://www.looterstudio.xyz', 'http://localhost:8080', 'https://looterstudio.com', 'https://www.looterstudio.com'].includes(reqOrigin) ? reqOrigin : env.ALLOWED_ORIGIN,
  'Vary': 'Origin',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  ...extra,
});
const json = (env, body, status = 200) => new Response(JSON.stringify(body), { status, headers: cors(env) });

async function rpc(method, params) {
  let last;
  for (const url of RPCS) {
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
      const j = await r.json();
      if (j.result !== undefined) return j.result;
      last = j.error;
    } catch (e) { last = e; }
  }
  throw new Error(`rpc failed: ${JSON.stringify(last)}`);
}

/* Find how much USDC this transaction moved into the treasury token account. */
function paidUsdc(tx, env) {
  if (!tx || tx.meta?.err) return 0;
  const pre = (tx.meta.preTokenBalances || []).find((b) => b.mint === env.USDC_MINT && b.owner === env.TREASURY_OWNER);
  const post = (tx.meta.postTokenBalances || []).find((b) => b.mint === env.USDC_MINT && b.owner === env.TREASURY_OWNER);
  const before = pre ? Number(pre.uiTokenAmount.uiAmount || 0) : 0;
  const after = post ? Number(post.uiTokenAmount.uiAmount || 0) : 0;
  return Math.max(0, after - before);
}

function payer(tx) {
  const keys = tx.transaction.message.accountKeys;
  const k = keys.find((a) => a.signer);
  return k ? (k.pubkey || k) : null;
}

async function stats(env) {
  const ideas = JSON.parse((await env.LOOT.get('ideas')) || '[]');
  const ideasSold = Number((await env.LOOT.get('ideas:sold')) || 0);
  const beersSold = Number((await env.LOOT.get('beers:sold')) || 0);
  const total = Number(env.IDEAS_TOTAL);
  return {
    ideas_total: total,
    ideas_sold: ideasSold,
    ideas_left: Math.max(0, total - ideasSold),
    ideas_in_stock: Math.max(0, ideas.length - ideasSold),
    beers_sold: beersSold,
    price_idea: Number(env.PRICE_IDEA),
    price_beer: Number(env.PRICE_BEER),
    treasury_usdc: env.TREASURY_USDC,
    treasury_owner: env.TREASURY_OWNER,
  };
}

async function claim(env, { sig, kind }) {
  if (!sig || !/^[1-9A-HJ-NP-Za-km-z]{60,100}$/.test(sig)) return { error: 'bad signature' };
  if (!['idea', 'beer'].includes(kind)) return { error: 'bad kind' };

  const seen = await env.LOOT.get(`claim:${sig}`);
  if (seen) return JSON.parse(seen); // idempotent: same receipt, same reveal

  const tx = await rpc('getTransaction', [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }]);
  if (!tx) return { error: 'not confirmed yet', retry: true };
  const paid = paidUsdc(tx, env);
  const price = Number(kind === 'idea' ? env.PRICE_IDEA : env.PRICE_BEER);
  if (paid + 1e-6 < price) return { error: `paid ${paid} USDC, price is ${price} USDC` };

  const from = payer(tx);
  const when = new Date((tx.blockTime || Math.floor(Date.now() / 1000)) * 1000).toISOString();

  let out;
  if (kind === 'idea') {
    const ideas = JSON.parse((await env.LOOT.get('ideas')) || '[]');
    const sold = Number((await env.LOOT.get('ideas:sold')) || 0);
    if (sold >= Number(env.IDEAS_TOTAL)) return { error: 'sold out' };
    if (sold >= ideas.length) return { error: 'restocking' };
    const n = sold + 1;
    out = { kind, number: n, text: ideas[sold], sig, from, when };
    await env.LOOT.put('ideas:sold', String(n));
  } else {
    const sold = Number((await env.LOOT.get('beers:sold')) || 0);
    const n = sold + 1;
    out = { kind, number: n, sig, from, when };
    await env.LOOT.put('beers:sold', String(n));
  }
  await env.LOOT.put(`claim:${sig}`, JSON.stringify(out));
  await env.LOOT.put(`log:${kind}:${String(out.number).padStart(5, '0')}`, JSON.stringify(out));
  return out;
}

/* LOOTCHAN likes: one counter per thread, seeded, one like per reader per day (hashed IP). */
const LIKE_SEED = { '0001': 12 };
async function likes(env, id) {
  const stored = await env.LOOT.get(`likes:${id}`);
  return stored === null ? (LIKE_SEED[id] || 0) : Number(stored);
}
async function like(env, request, id) {
  if (!/^\d{4}$/.test(id)) return { error: 'bad thread' };
  const ip = request.headers.get('CF-Connecting-IP') || '0';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${id}:${ip}:${new Date().toISOString().slice(0, 10)}`));
  const key = `liked:${id}:${[...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  const count = await likes(env, id);
  if (await env.LOOT.get(key)) return { id, likes: count, liked: true };
  await env.LOOT.put(key, '1', { expirationTtl: 86400 });
  await env.LOOT.put(`likes:${id}`, String(count + 1));
  return { id, likes: count + 1, liked: true };
}

/* TERMINATOR: the automaton reports its vitals here; the page reads them. */
async function terminatorStatus(env) {
  const raw = await env.LOOT.get('terminator:status');
  const log = JSON.parse((await env.LOOT.get('terminator:log')) || '[]');
  return { ...(raw ? JSON.parse(raw) : { born: null, alive: false, tier: 'unborn', credits: 0, usdc: 0, wallet: null, sales: 0 }), log };
}
async function terminatorReport(env, request) {
  if (!env.TERMINATOR_TOKEN || request.headers.get('Authorization') !== `Bearer ${env.TERMINATOR_TOKEN}`) return { error: 'no' };
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return { error: 'bad body' };
  const prev = JSON.parse((await env.LOOT.get('terminator:status')) || '{}');
  const status = { ...prev, ...body, updated: new Date().toISOString() };
  delete status.log;
  await env.LOOT.put('terminator:status', JSON.stringify(status));
  if (Array.isArray(body.log) && body.log.length) {
    const log = JSON.parse((await env.LOOT.get('terminator:log')) || '[]');
    const next = [...log, ...body.log.map((l) => ({ t: new Date().toISOString(), m: String(l).slice(0, 240) }))].slice(-60);
    await env.LOOT.put('terminator:log', JSON.stringify(next));
  }
  return { ok: true };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    reqOrigin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(env) });
    try {
      if (url.pathname === '/stats') return json(env, await stats(env));
      if (url.pathname === '/terminator') return json(env, await terminatorStatus(env));
      if (url.pathname === '/terminator/report' && request.method === 'POST') { const out = await terminatorReport(env, request); return json(env, out, out.error ? 401 : 200); }
      const m = url.pathname.match(/^\/likes\/(\d{4})$/);
      if (m && request.method === 'GET') return json(env, { id: m[1], likes: await likes(env, m[1]) });
      if (m && request.method === 'POST') { const out = await like(env, request, m[1]); return json(env, out, out.error ? 400 : 200); }
      if (url.pathname === '/claim' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const out = await claim(env, body);
        return json(env, out, out.error && !out.retry ? 400 : 200);
      }
      return json(env, { ok: true, house: 'LooterStudio®' });
    } catch (e) {
      return json(env, { error: String(e.message || e) }, 500);
    }
  },
};
