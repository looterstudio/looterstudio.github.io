/* ═══════════════════════════════════════════════════════════════
   LooterStudio® — pay.js
   Pay-to-reveal on Solana: Phantom signs a USDC transfer to the
   house, the worker verifies it on-chain and reveals the goods.
   ═══════════════════════════════════════════════════════════════ */
import { Connection, PublicKey, Transaction, TransactionInstruction } from 'https://esm.sh/@solana/web3.js@1.98.0';
import { getAssociatedTokenAddress, createTransferCheckedInstruction, TOKEN_PROGRAM_ID } from 'https://esm.sh/@solana/spl-token@0.4.9?deps=@solana/web3.js@1.98.0';

const WORKER = window.LOOT_WORKER || 'https://loot-market.looterstudio.workers.dev';
const RPC = 'https://solana-rpc.publicnode.com';
const USDC = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const MEMO = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const $ = (id) => document.getElementById(id);
const provider = () => window.phantom?.solana?.isPhantom ? window.phantom.solana : (window.solana?.isPhantom ? window.solana : null);

let stats = null;
export async function loadStats() {
  try { stats = await (await fetch(`${WORKER}/stats`)).json(); } catch (_) { stats = null; }
  document.dispatchEvent(new CustomEvent('loot:stats', { detail: stats }));
  return stats;
}

/* Reveal window (XP style, reuses .xp look) */
function reveal(kind, out) {
  document.querySelectorAll('.reveal-win').forEach((w) => w.remove());
  const w = document.createElement('div');
  w.className = 'xp reveal-win';
  const title = kind === 'idea' ? `IDEA #${String(out.number).padStart(4, '0')}` : `beer #${String(out.number).padStart(4, '0')}`;
  const body = kind === 'idea'
    ? `<p class="reveal-win__text">${out.text}</p>`
    : `<p class="reveal-win__text">A cold beer. Good Quality.<br>LooterStudio® · MMXXVI<br>${new Date(out.when).toUTCString()}</p>`;
  w.innerHTML = `
    <div class="xp__bar"><span>${title}</span><button class="xp__close" aria-label="Close">✕</button></div>
    <div class="xp__body reveal-win__body">${body}</div>
    <div class="xp__actions">
      ${kind === 'idea' ? '<button class="xp__btn" data-copy>COPY</button>' : ''}
      <a class="xp__btn" href="https://solscan.io/tx/${out.sig}" target="_blank" rel="noopener">RECEIPT</a>
    </div>`;
  w.querySelector('.xp__close').onclick = () => w.remove();
  w.querySelector('[data-copy]')?.addEventListener('click', () => navigator.clipboard?.writeText(`${title}: ${out.text}`));
  document.body.appendChild(w);
}

async function claim(sig, kind, onStatus) {
  for (let i = 0; i < 30; i++) {
    const r = await fetch(`${WORKER}/claim`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sig, kind }) });
    const out = await r.json();
    if (out.retry) { onStatus(`confirming… ${i + 1}`); await new Promise((res) => setTimeout(res, 2000)); continue; }
    if (out.error) throw new Error(out.error);
    return out;
  }
  throw new Error('still confirming. keep your receipt and retry in a minute.');
}

export async function buy(kind, onStatus = () => {}) {
  const ph = provider();
  if (!ph) { window.open('https://phantom.com/download', '_blank'); throw new Error('phantom not found'); }
  if (!stats) await loadStats();
  if (!stats) throw new Error('market offline');
  if (kind === 'idea' && stats.ideas_in_stock <= 0) throw new Error(stats.ideas_left <= 0 ? 'sold out' : 'restocking');

  onStatus('connecting…');
  const { publicKey: buyer } = await ph.connect();
  const price = kind === 'idea' ? stats.price_idea : stats.price_beer;
  const amount = BigInt(Math.round(price * 1e6));

  const conn = new Connection(RPC, 'confirmed');
  const from = await getAssociatedTokenAddress(USDC, buyer);
  const to = new PublicKey(stats.treasury_usdc);
  const bal = await conn.getTokenAccountBalance(from).catch(() => null);
  if (!bal || Number(bal.value.uiAmount || 0) < price) throw new Error(`you need ${price} USDC in Phantom`);

  onStatus('sign in phantom…');
  const tx = new Transaction().add(
    createTransferCheckedInstruction(from, USDC, to, buyer, amount, 6, [], TOKEN_PROGRAM_ID),
    new TransactionInstruction({ keys: [], programId: MEMO, data: new TextEncoder().encode(`loot:${kind}`) }),
  );
  tx.feePayer = buyer;
  tx.recentBlockhash = (await conn.getLatestBlockhash('confirmed')).blockhash;
  const { signature } = await ph.signAndSendTransaction(tx);
  onStatus('paid. confirming…');
  const out = await claim(signature, kind, onStatus);
  reveal(kind, out);
  await loadStats();
  return out;
}

window.LootPay = { buy, loadStats };
loadStats();
