'use strict';

/* ═══════════════════════════════════════════════════════════════
   LooterStudio® — main.js
   ═══════════════════════════════════════════════════════════════ */

const MANIFESTO = [
  'LOOT IS SWAG.',
  'LOOT IS AI WEAPONIZATION.',
  'LOOT IS A QUANTITATIVE FUND.',
  'LOOT IS A COLD BEER.',
  'LOOT IS OPIUM.',
  'LOOT IS SOFTWARE.',
  'LOOT IS A RECORD LABEL.',
  'LOOT IS A PRIVATE CLUB.',
  'LOOT IS A FACTORY.',
  'LOOT IS AN ARTIST.',
  'LOOT IS A BANK.',
  'LOOT IS A CASINO.',
  'LOOT IS A WEAPON.',
  'LOOT IS A CULT.',
  'LOOT IS A COLLECTION.',
  'LOOT IS A MARKET.',
  'LOOT IS A GAME.',
  'LOOT IS A MOVEMENT.',
  'LOOT IS AN INTERNET COMPANY.',
  'LOOT IS A FUCKING IDEA.',
  'LOOT IS NOT FOR POORS.',
  'LOOT IS TASTE.',
  'LOOT IS SPEED.',
  'LOOT IS OBSESSION.',
  'LOOT IS CAPITAL.',
  'LOOT IS CHAOS.',
  'LOOT IS SEX.',
  'LOOT IS BEAUTY.',
  'LOOT IS RISK.',
  'LOOT IS LEVERAGE.',
  'LOOT IS THE FUTURE.',
  'LOOT IS MOG.',
  'LOOT IS IQMAXING.',
  'LOOT IS BEING EARLY.',
  'LOOT IS ILLUMINATI.',
  'LOOT IS CORPORATE LARP.',
  'LOOT MAYBE NOT FOR YOU.',
  'LOOT WILL EXPLODE YOUR HEAD.',
  'LOOT IS FOR NEETS.',
  'LOOT IS FOR COMPETITIVE PEOPLE.',
  'LOOT IS A PRIVATE FUND.',
  'LOOT IS COOLER THAN A BANK.',
  'LOOT IS A VENTURE CAPITAL.',
  'LOOT IS WHATEVER COMES NEXT.',
];


const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ';
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const $ = (id) => document.getElementById(id);


/* ─── Tear flash ─── */
const tear = $('tear');
function tearFlash() {
  if (!tear || REDUCED) return;
  tear.classList.remove('on'); void tear.offsetWidth; tear.classList.add('on');
}

/* ─── Scramble helper ─── */
function scramble(el, target, { frames = 9, tick = 28, onSet } = {}) {
  let f = 0;
  const set = (t) => { el.textContent = t; if (onSet) onSet(t); };
  if (REDUCED) { set(target); return; }
  clearInterval(el._scr);
  el._scr = setInterval(() => {
    f++;
    const settled = Math.floor((f / frames) * target.length);
    let out = '';
    for (let i = 0; i < target.length; i++) out += (i < settled || target[i] === ' ') ? target[i] : pick(GLYPHS);
    set(out);
    if (f >= frames) { clearInterval(el._scr); set(target); }
  }, tick);
}

/* ═══════════════════════════════════════════════════════════════
   LOOT.exe — manifesto cycler + ACCEPT / DENY consequences
   ═══════════════════════════════════════════════════════════════ */
const XP = { idx: 0, paused: false, denies: 0, timer: null };

function initXP() {
  const xp = $('xp'), msg = $('xpMsg');
  if (!xp || !msg) return;

  const lines = () => MANIFESTO;
  const say = (text) => scramble(msg, text, { onSet: (t) => { msg.dataset.text = t; } });
  const glitch = () => { xp.classList.remove('glitch'); void xp.offsetWidth; xp.classList.add('glitch'); };

  const next = () => {
    if (XP.paused) return;
    XP.idx = (XP.idx + 1) % lines().length;
    say(lines()[XP.idx]);
    glitch();
    if (Math.random() < 0.3) tearFlash();
  };
  const loop = () => { next(); XP.timer = setTimeout(loop, rand(1300, 1900)); };
  XP.timer = setTimeout(loop, 2200);

  const hold = (text, state, ms, after) => {
    XP.paused = true;
    xp.classList.remove('is-error', 'is-ok');
    if (state) xp.classList.add(state);
    say(text); glitch(); tearFlash();
    setTimeout(() => { xp.classList.remove('is-error', 'is-ok'); XP.paused = false; if (after) after(); }, ms);
  };

  /* DENY → wrong decision + error cascade */
  const deny = () => {
    XP.denies++;
    document.body.classList.remove('deny-flash'); void document.body.offsetWidth; document.body.classList.add('deny-flash');
    const text = XP.denies >= 3 ? 'LOOT IS NOT FOR POORS.' : 'HAHAHA LOOT IS NOT FOR YOU THEN.';
    hold(text, 'is-error', 2600);
    errorCascade(XP.denies >= 3 ? 8 : 5, text);
  };

  /* ACCEPT → access granted + target mode */
  const accept = () => {
    hold('ACCESS GRANTED. CLR: LEVEL_6.', 'is-ok', 2600, () => {
      document.querySelectorAll('.silk__item--locked').forEach((el) => {
        el.classList.add('is-unlocked');
        const em = el.querySelector('em'); if (em) em.textContent = 'unlocked';
      });
      try { localStorage.setItem('loot.clr', '6'); } catch (_) {}
    });
  };

  $('xpAccept')?.addEventListener('click', accept);
  $('xpDeny')?.addEventListener('click', deny);
  $('xpClose')?.addEventListener('click', deny);

}

function errorCascade(n, text) {
  if (REDUCED) n = 1;
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const w = document.createElement('div');
      w.className = 'err';
      w.style.left = `${rand(4, 70)}vw`;
      w.style.top = `${rand(8, 70)}vh`;
      w.innerHTML = `<div class="err__bar"><span>LOOT.exe</span><span>✕</span></div>
        <div class="err__body"><span>⛔</span><p>${text}</p></div>
        <button class="err__ok" type="button">OK</button>`;
      w.querySelector('.err__ok').addEventListener('click', () => w.remove());
      document.body.appendChild(w);
      setTimeout(() => w.remove(), 2400 + i * 120);
    }, i * 110);
  }
}


/* ═══════════════════════════════════════════════════════════════
   ANONYMOUS MARKET (Silk Road)
   ═══════════════════════════════════════════════════════════════ */
const PRODUCTS = [
  { id: 'brier',  cat: ['software', 'vaults', 'signals'], tile: 'brier', img: 'assets/brier-logo.png', title: 'PREMIUM FINANCIAL_INTEL model!! Risk routing [GOD SOURCE]', price: 1.84, note: 'brier.world' },
  { id: 'stat',   cat: ['software', 'bots', 'models'], tile: 'stat',    img: 'assets/stat-logo.png',  title: '1g pure HUMAN_STATUS_ENGINE!!! only early!! very strong', price: 2.06, note: 'iOS' },
  { id: 'logo',   cat: ['objects', 'art', 'capital'], tile: 'logo', video: 'assets/loot-360.mp4', title: 'LooterStudio® logo. 1 of 1. The whole thing', price: 1e9 },
  { id: 'tung',   cat: ['art', 'objects'], tile: 'tung', img: 'assets/tung.jpg', text: 'TUNG TUNG TUNG', title: 'just a tung tung tung sahur · looterstudio edition · 1/1', priceLabel: '100,000 USDC', offer: 'https://www.tensor.trade/item/Brye9AuSmdvkQM4JJLKYLZDVuhz9HpboVTZfUfYZaVD7', mint: 'Brye9AuSmdvkQM4JJLKYLZDVuhz9HpboVTZfUfYZaVD7' },
  { id: 'sound',  cat: ['sound', 'art'],       tile: 'sound', img: 'assets/redstar.jpg', title: 'REDSTAR RECORDS', price: 12.00, note: 'soon' },
  { id: 'future', cat: ['capital', 'data', 'ideas'], tile: 'future', img: 'assets/future.jpg', title: 'The future. Pre-order. Ships whenever comes next', price: 188.72 },
  { id: 'source', cat: ['software', 'terminals', 'books'], tile: 'source', text: '', title: 'UNIVERSE SOURCE CODE. leaked. do not run', price: 7.52 },
  { id: 'taste',  cat: ['art', 'ideas'],       tile: 'taste', text: 'taste', title: 'Taste. cannot be bought, only recognized', price: Infinity },
  { id: 'lev',    cat: ['capital', 'signals'], tile: 'leverage', text: '10x', title: 'High Vibration 10x LEVERAGE. Handle with care', price: 67.32 },
  { id: 'cult',   cat: ['apparel', 'custom'],  tile: 'cult',  img: 'assets/illuminati.jpg', title: 'ILLUMINATI MEMBERSHIP. no refunds', price: 4.20 },
  { id: 'beer',   cat: ['art', 'custom'],      tile: 'beer',  text: '🍺', title: 'A cold beer. Good Quality', priceLabel: '1 USDC', buy: 'beer' },
  { id: 'idea',   cat: ['ideas'],              tile: 'idea',  text: '', title: 'A fucking idea. 100% original. one per buyer', priceLabel: '9 USDC', buy: 'idea' },
  { id: 'club',   cat: ['capital', 'custom'],  tile: 'club',  text: 'PRIVATE', title: 'Seat at the private club. sense of belonging [Link] 1 yr', price: 41.94 },
  { id: 'obj',    cat: ['objects', 'art'],     tile: 'objects', text: 'OBJ_01', title: 'OBJECT 01. one of one. proof of taste', price: 33.30, note: 'soon' },
  { id: 'event',  cat: ['events', 'custom'],   tile: 'events', text: 'DOOR', title: 'A night. location disclosed at the door', price: 5.55, note: 'soon' },
  { id: 'redact', cat: ['custom'], tile: 'redacted', text: '███████', title: '███████ ████ ██████ [CLASSIFIED]', price: NaN },
];

function initMarket() {
  const grid = $('srProducts');
  if (!grid) return;
  let cat = 'all', q = '', cart = 0, orders = 0;

  const fmt = (p) => Number.isNaN(p) ? '฿???' : p === Infinity ? '฿∞' : p >= 1e6 ? `฿${p.toLocaleString('en-US')}` : `฿${p.toFixed(2)}`;
  const price = (p) => p.priceLabel || fmt(p.price);
  const render = () => {
    const list = PRODUCTS.filter((p) => (cat === 'all' || p.cat.includes(cat)) && (!q || (p.title + ' ' + p.id).toLowerCase().includes(q)));
    grid.innerHTML = list.length ? list.map((p) => `
      <div class="sr__p" data-id="${p.id}">
        <div class="tile tile--${p.tile}">${p.video ? `<video src="${p.video}" autoplay loop muted playsinline></video>` : p.img ? `<img src="${p.img}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${(p.text || '').replace(/'/g, '')}'}))">` : `<span>${(p.text || '').replace(/\n/g, '<br>')}</span>`}</div>
        <div class="sr__p-title">${p.title}</div>
        <div class="sr__p-price">${price(p)}${p.note ? `<small>${p.note}</small>` : ''}</div>
        ${p.offer ? `<a class="sr__offer" href="${p.offer}" target="_blank" rel="noopener">MAKE AN OFFER</a>` : ''}
        ${p.buy ? `<button class="sr__offer sr__buy" data-buy="${p.buy}" type="button">BUY</button><span class="sr__count" data-count="${p.buy}"></span>` : ''}
      </div>`).join('') : `<div class="sr__empty">No listings. LOOT IS WHATEVER COMES NEXT.</div>`;
    grid.querySelectorAll('video').forEach((v) => v.play().catch(() => {}));
    grid.querySelectorAll('.tile--source').forEach(matrixRain);
    grid.querySelectorAll('.tile--leverage').forEach(vibrationField);
  };
  render();

  $('srCats')?.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-cat]');
    if (!a) return;
    e.preventDefault();
    cat = a.dataset.cat;
    document.querySelectorAll('#srCats a').forEach((x) => x.classList.toggle('is-active', x === a));
    render();
  });
  $('srSearch')?.addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); render(); });

  /* buy: balance is ฿0.00, so anything priced gets you the message */
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.sr__p');
    if (!card) return;
    const p = PRODUCTS.find((x) => x.id === card.dataset.id);
    if (!p) return;
    const buyBtn = e.target.closest('.sr__buy');
    if (buyBtn) { runBuy(buyBtn); return; }
    if (e.target.closest('.sr__offer')) return;
    if (p.buy) { runBuy(card.querySelector('.sr__buy')); return; }
    if (p.offer) { window.open(p.offer, '_blank', 'noopener'); return; }
    if (p.price === 0) {
      cart++; orders++;
      $('srCartCount').textContent = cart; $('srOrders').textContent = orders;
      flashMsg('LOOT.exe ADDED TO CART. LOOT IS FREE.', 'is-ok');
    } else if (p.id === 'logo') {
      flashMsg('฿1,000,000,000. NOT FOR SALE TO YOU.', 'is-error'); errorCascade(3, 'NOT FOR SALE TO YOU.');
    } else if (Number.isNaN(p.price)) {
      flashMsg('CLASSIFIED. CLR: LEVEL_6 REQUIRED.', 'is-error'); errorCascade(3, 'ACCESS DENIED.');
    } else {
      flashMsg('INSUFFICIENT FUNDS. LOOT IS NOT FOR POORS.', 'is-error'); errorCascade(2, 'LOOT IS NOT FOR POORS.');
    }
  });
  $('srCart')?.addEventListener('click', () => flashMsg(cart ? `CART: ${cart} × LOOT.exe. CHECKOUT: NEVER.` : 'CART EMPTY. LOOT IS A MARKET.', 'is-ok'));
  document.querySelector('.sr__logout')?.addEventListener('click', (e) => { e.preventDefault(); flashMsg('THERE IS NO LOGOUT.', 'is-error'); });
}

const ALIEN_GLYPHS = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟⵀⵁⵂⵃⵄⵅⵆⵇⵈⵉⵊⵋⵌⵍⵎⵏ∀∂∃∅∇∈∉∋∏∑√∞∠∧∨∩∪∫≈≠≡⊂⊃⊕⊗01';

/* Alien rain inside a tile (curtains of glyphs) */
function matrixRain(tile) {
  const c = document.createElement('canvas');
  tile.innerHTML = ''; tile.appendChild(c);
  const ctx = c.getContext('2d');
  const size = () => { c.width = tile.clientWidth; c.height = tile.clientHeight; };
  size();
  const fs = 11, cols = () => Math.ceil(c.width / fs);
  let drops = Array.from({ length: cols() }, () => Math.random() * -40);
  const tick = () => {
    if (!tile.isConnected) return;
    if (c.width !== tile.clientWidth) { size(); drops = Array.from({ length: cols() }, () => Math.random() * -40); }
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = `${fs}px "JetBrains Mono", monospace`;
    drops.forEach((y, i) => {
      const ch = ALIEN_GLYPHS[Math.floor(Math.random() * ALIEN_GLYPHS.length)];
      ctx.fillStyle = Math.random() < 0.08 ? '#fff' : '#00ff41';
      ctx.fillText(ch, i * fs, y * fs);
      drops[i] = y * fs > c.height && Math.random() > 0.975 ? 0 : y + 0.5 + Math.random() * 0.4;
    });
    requestAnimationFrame(tick);
  };
  if (!REDUCED) tick(); else { ctx.fillStyle = '#00ff41'; ctx.font = `${fs}px monospace`; for (let y = fs; y < c.height; y += fs) ctx.fillText(ALIEN_GLYPHS.slice(0, Math.ceil(c.width / 7)), 0, y); }
}

/* Aura: layered energy glows breathing around a core, additive light, grain */
function vibrationField(tile) {
  const c = document.createElement('canvas');
  tile.innerHTML = ''; tile.appendChild(c);
  const label = document.createElement('b'); label.textContent = '10x'; tile.appendChild(label);
  const ctx = c.getContext('2d');
  let W = 0, H = 0;
  const size = () => { W = c.width = tile.clientWidth; H = c.height = tile.clientHeight; };
  size();
  // grain sheet, rendered once
  const grain = document.createElement('canvas'); grain.width = grain.height = 128;
  const gctx = grain.getContext('2d'), gd = gctx.createImageData(128, 128);
  for (let i = 0; i < gd.data.length; i += 4) { const v = Math.random() * 255; gd.data[i] = gd.data[i + 1] = gd.data[i + 2] = v; gd.data[i + 3] = 26; }
  gctx.putImageData(gd, 0, 0);
  // energy blobs orbiting the core
  const BLOBS = Array.from({ length: 7 }, (_, i) => ({
    hue: 250 + i * 18 + Math.random() * 20, orbit: 8 + Math.random() * 30, speed: (0.004 + Math.random() * 0.008) * (i % 2 ? 1 : -1),
    phase: Math.random() * Math.PI * 2, r: 0.28 + Math.random() * 0.22, pulse: 0.02 + Math.random() * 0.03,
  }));
  let t = 0;
  const draw = (loop) => {
    if (!tile.isConnected) return;
    if (W !== tile.clientWidth) size();
    const cx = W / 2, cy = H / 2, R = Math.min(W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0b0330'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    BLOBS.forEach((b, i) => {
      const a = b.phase + t * b.speed;
      const x = cx + Math.cos(a) * b.orbit, y = cy + Math.sin(a * 1.3) * b.orbit;
      const rr = R * b.r * (1 + Math.sin(t * b.pulse + i) * 0.18);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, `hsla(${b.hue + Math.sin(t * 0.01 + i) * 25}, 100%, 72%, .55)`);
      g.addColorStop(0.5, `hsla(${b.hue + 30}, 95%, 55%, .22)`);
      g.addColorStop(1, 'hsla(260, 100%, 40%, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
    });
    // core
    const breathe = 0.5 + 0.5 * Math.sin(t * 0.045);
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (0.12 + breathe * 0.05));
    core.addColorStop(0, 'rgba(255,255,255,.9)'); core.addColorStop(0.5, 'rgba(220,200,255,.45)'); core.addColorStop(1, 'rgba(160,120,255,0)');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, R * 0.2, 0, Math.PI * 2); ctx.fill();
    // outer halo rings, very soft
    for (let k = 1; k <= 3; k++) {
      const hr = R * (0.22 + k * 0.11) + Math.sin(t * 0.03 + k) * 4;
      ctx.strokeStyle = `hsla(${280 + k * 20}, 100%, 80%, ${0.12 - k * 0.03})`; ctx.lineWidth = 6 - k;
      ctx.beginPath(); ctx.arc(cx, cy, hr, 0, Math.PI * 2); ctx.stroke();
    }
    // grain + vignette
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(grain, -Math.floor(Math.random() * 64), -Math.floor(Math.random() * 64), W + 64, H + 64);
    ctx.globalCompositeOperation = 'source-over';
    const v = ctx.createRadialGradient(cx, cy, R * 0.35, cx, cy, R * 0.75);
    v.addColorStop(0, 'rgba(5,0,30,0)'); v.addColorStop(1, 'rgba(5,0,30,.85)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    t++;
    if (loop) requestAnimationFrame(() => draw(true));
  };
  draw(!REDUCED);
}

/* Tagline: every so often it slips into another alphabet and comes back */
function initTagline() {
  const el = document.querySelector('.sr__brand i');
  if (!el || REDUCED) return;
  const EN = el.textContent;
  const ALIEN = [
    'всегда рано, никогда не ошибается',
    '常に早く、決して間違えない',
    'αεί πρώιμος, ποτέ λάθος',
    'ᚨᛚᚹᚨᛁᛊ ᛖᚨᚱᛚᛁ, ᚾᛖᚹᛖᚱ ᚹᚱᛟᚾᚷ',
    'ⴰⵍⵡⴰⵢⵙ ⴻⴰⵔⵍⵢ, ⵏⴻⵠⴻⵔ ⵡⵔⵓⵏⴳ',
    'תמיד מוקדם, אף פעם לא טועה',
    '01100001 01101100 01110111',
    'ALWAYS EARLY, NEVER WRONG',
  ];
  const cycle = () => {
    const alien = pick(ALIEN);
    el.classList.add('is-glitch');
    scramble(el, alien, { frames: 7, tick: 30 });
    setTimeout(() => { scramble(el, EN, { frames: 7, tick: 30 }); setTimeout(() => el.classList.remove('is-glitch'), 260); }, 700 + Math.random() * 900);
    setTimeout(cycle, 3500 + Math.random() * 5000);
  };
  setTimeout(cycle, 2500);
}

/* Pay-to-reveal: delegate to pay.js (Phantom + USDC) */
async function runBuy(btn) {
  if (!window.LootPay) { flashMsg('MARKET OFFLINE. TRY AGAIN.', 'is-error'); return; }
  const kind = btn.dataset.buy;
  const label = btn.textContent;
  btn.disabled = true;
  try {
    await window.LootPay.buy(kind, (s) => { btn.textContent = s.toUpperCase(); });
    flashMsg(kind === 'idea' ? 'IDEA DELIVERED. DO NOT LOSE IT.' : 'BEER SERVED. GOOD QUALITY.', 'is-ok');
  } catch (err) {
    const m = String(err?.message || err);
    flashMsg(m.toUpperCase().slice(0, 60), 'is-error');
    if (/USDC/i.test(m)) errorCascade(2, 'LOOT IS NOT FOR POORS.');
  } finally { btn.disabled = false; btn.textContent = label; }
}

document.addEventListener('loot:stats', (e) => {
  const s = e.detail;
  document.querySelectorAll('[data-count]').forEach((el) => {
    if (!s) { el.textContent = ''; return; }
    if (el.dataset.count === 'idea') el.textContent = s.ideas_in_stock > 0 ? `${s.ideas_total} ideas · ${s.ideas_sold} sold` : (s.ideas_left > 0 ? 'restocking' : 'sold out');
    if (el.dataset.count === 'beer') el.textContent = `${s.beers_sold} served`;
  });
});

/* Show a one-off line in LOOT.exe and scroll it into view */
function flashMsg(text, state) {
  const xp = $('xp'), msg = $('xpMsg');
  if (!xp || !msg) return;
  XP.paused = true;
  xp.classList.remove('is-error', 'is-ok', 'hidden'); if (state) xp.classList.add(state);
  const r = xp.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) toast(text, state);
  scramble(msg, text, { onSet: (t) => { msg.dataset.text = t; } });
  xp.classList.remove('glitch'); void xp.offsetWidth; xp.classList.add('glitch');
  tearFlash();
  clearTimeout(XP.flashT);
  XP.flashT = setTimeout(() => { xp.classList.remove('is-error', 'is-ok'); XP.paused = false; }, 2600);
}

/* Small XP-style toast for when LOOT.exe is off-screen */
function toast(text, state) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const t = document.createElement('div');
  t.className = `toast ${state === 'is-error' ? 'toast--error' : 'toast--ok'}`;
  t.innerHTML = `<div class="toast__bar">LOOT.exe</div><p>${text}</p>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}


/* ─── Headline hover scramble ─── */
function initHeadline() {
  const h = $('headline');
  if (!h || REDUCED) return;
  const original = h.textContent;
  h.addEventListener('mouseenter', () => scramble(h, original, { frames: 8, tick: 30 }));
}

/* ─── Shattered screen: fractures, web, shards, refraction and blood ─── */
function crackGlass(px, py, blood = 0) {
  const S = 420, c = S / 2;
  const rays = 11 + Math.floor(Math.random() * 7);
  const angles = Array.from({ length: rays }, (_, i) => (i / rays) * Math.PI * 2 + rand(-0.22, 0.22));
  const lens = angles.map(() => rand(90, 200));
  const pt = (a, r) => `${(c + Math.cos(a) * r).toFixed(1)} ${(c + Math.sin(a) * r).toFixed(1)}`;

  // main fractures: jittered, with short side branches
  let d = '', branches = '';
  angles.forEach((a, i) => {
    let path = `M${c} ${c}`;
    const steps = 5 + Math.floor(Math.random() * 3);
    for (let s = 1; s <= steps; s++) {
      const r = (lens[i] / steps) * s;
      const ja = a + rand(-0.1, 0.1);
      path += ` L${pt(ja, r)}`;
      if (s > 1 && Math.random() < 0.5) {
        const ba = ja + rand(-0.9, 0.9), br = rand(10, 34);
        const [x0, y0] = pt(ja, r).split(' ');
        branches += `M${x0} ${y0} l${(Math.cos(ba) * br).toFixed(1)} ${(Math.sin(ba) * br).toFixed(1)} `;
      }
    }
    d += path + ' ';
  });

  // concentric web: rings of segments joining neighbouring rays, denser near the centre
  let web = '', shards = '';
  [0.18, 0.34, 0.52, 0.72, 0.9].forEach((k, ring) => {
    angles.forEach((a, i) => {
      if (Math.random() < 0.18) return;
      const b = angles[(i + 1) % rays];
      const r1 = lens[i] * k * rand(0.92, 1.08), r2 = lens[(i + 1) % rays] * k * rand(0.92, 1.08);
      const mid = a + ((b - a + Math.PI * 2) % (Math.PI * 2)) * rand(0.35, 0.65);
      const rm = ((r1 + r2) / 2) * rand(0.9, 1.06);
      web += `M${pt(a, r1)} L${pt(mid, rm)} L${pt(b, r2)} `;
      // a few shards catch the light: thin translucent triangles between rings
      if (ring < 3 && Math.random() < 0.35) {
        const kk = [0.18, 0.34, 0.52, 0.72][ring + 1];
        shards += `<polygon points="${pt(a, r1)},${pt(mid, rm)},${pt(b, lens[(i + 1) % rays] * kk)}" fill="rgba(255,255,255,${rand(0.03, 0.09).toFixed(3)})"/>`;
      }
    });
  });

  // blood: none on a clean shot; from the second hit on it gets worse.
  // irregular blobs (random-radius polygons), directional spray, drips with a heavy bulb at the end
  const blob = (x, y, rr, n = 14) => {
    let p = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, r = rr * rand(0.55, 1.25);
      p += `${i ? 'L' : 'M'}${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)} `;
    }
    return p + 'Z ';
  };
  let splat = '', spray = '', drips = '', gloss = '';
  if (blood > 0) {
    const k = Math.min(blood, 5);                       // 1..5 intensity
    const dir = rand(0, Math.PI * 2);                    // spray direction
    splat += blob(c, c, 14 + k * 5);
    for (let i = 0; i < 3 + k * 2; i++) {
      const a = dir + rand(-0.9, 0.9), r = rand(10, 30 + k * 12);
      splat += blob(c + Math.cos(a) * r, c + Math.sin(a) * r, rand(4, 9 + k * 2), 10);
    }
    for (let i = 0; i < 25 + k * 15; i++) {
      const a = dir + rand(-1.2, 1.2), r = rand(20, 60 + k * 25);
      spray += `<circle cx="${(c + Math.cos(a) * r).toFixed(1)}" cy="${(c + Math.sin(a) * r).toFixed(1)}" r="${rand(0.6, 2.4).toFixed(1)}"/>`;
    }
    for (let i = 0; i < Math.min(1 + k, 5); i++) {
      const x = c + rand(-14 - k * 3, 14 + k * 3), len = rand(50 + k * 15, 110 + k * 30), w = rand(2.5, 4.5 + k);
      const y0 = c + rand(4, 14);
      drips += `<path class="drip" style="animation-delay:${(i * 0.4 + rand(0, 0.4)).toFixed(2)}s;animation-duration:${rand(3.5, 6).toFixed(1)}s" d="M${(x - w / 2).toFixed(1)} ${y0} q ${(w * 0.3).toFixed(1)} ${(len * 0.5).toFixed(1)} 0 ${len.toFixed(1)} a ${(w * 0.9).toFixed(1)} ${(w * 0.9).toFixed(1)} 0 1 0 ${w.toFixed(1)} 0 q ${(-w * 0.3).toFixed(1)} ${(-len * 0.5).toFixed(1)} 0 ${(-len).toFixed(1)} z"/>`;
    }
    gloss = `<ellipse cx="${c - 6}" cy="${c - 8}" rx="${6 + k * 2}" ry="${3 + k}" fill="rgba(255,120,130,.35)" transform="rotate(-30 ${c - 6} ${c - 8})"/>`;
  }

  const el = document.createElement('div');
  el.className = 'crack';
  el.style.left = `${px}px`; el.style.top = `${py}px`;
  el.innerHTML = `<svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
    <defs>
      <radialGradient id="hole"><stop offset="0" stop-color="#000"/><stop offset=".5" stop-color="#000" stop-opacity=".9"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <radialGradient id="dim"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="1.2"/></filter>
      <radialGradient id="bloodfill"><stop offset="0" stop-color="#3a0006"/><stop offset=".55" stop-color="#8b0012"/><stop offset="1" stop-color="#a1121f" stop-opacity=".85"/></radialGradient>
    </defs>
    <circle cx="${c}" cy="${c}" r="${S * 0.45}" fill="url(#dim)"/>
    ${blood > 0 ? `<g class="blood" fill="url(#bloodfill)" opacity=".96"><path d="${splat}"/></g>
    <g class="blood" fill="#6d000d" opacity=".9">${spray}${drips}</g>
    <g class="blood-edge" fill="none" stroke="rgba(40,0,4,.7)" stroke-width="1"><path d="${splat}"/></g>
    ${gloss}` : ''}
    ${shards}
    <path d="${web}" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1"/>
    <path d="${branches}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1"/>
    <path d="${d}" fill="none" stroke="rgba(0,240,255,.35)" stroke-width="3.5" transform="translate(1.6 0)"/>
    <path d="${d}" fill="none" stroke="rgba(255,0,60,.25)" stroke-width="3.5" transform="translate(-1.6 0)"/>
    <path d="${d}" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${c}" cy="${c}" r="16" fill="url(#hole)"/>
    <circle cx="${c}" cy="${c}" r="7" fill="#000"/>
  </svg>`;
  document.body.appendChild(el);
  return el;
}

/* ─── Cursor: weapon sight. Click = shoot. ─── */
function initCursor() {
  const c = $('cursor') || document.createElement('div');
  const HOVER = !window.matchMedia('(hover: none)').matches;
  let mx = -100, my = -100, cx = -100, cy = -100;
  addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  const tick = () => { cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35; c.style.transform = `translate(${cx - c.offsetWidth / 2}px, ${cy - c.offsetHeight / 2}px)`; requestAnimationFrame(tick); };
  tick();

  let hits = 0, shots = 0;
  const HITTABLE = [
    ['.target--stat',  () => flashMsg('HIT. STAT NEUTRALIZED.', 'is-error')],
    ['.target--brier', () => flashMsg('HIT. BRIER NEUTRALIZED.', 'is-error')],
    ['.outro__brand', () => flashMsg('HIT. THE MAN OF THE FUTURE.', 'is-error')],
    ['.xp',            () => { XP.denies++; flashMsg('YOU SHOT LOOT.exe. WRONG DECISION.', 'is-error'); errorCascade(4, 'WRONG DECISION.'); }],
    ['.silk__item--locked', () => { flashMsg('CLASSIFIED. CLR: LEVEL_6 REQUIRED.', 'is-error'); errorCascade(2, 'ACCESS DENIED.'); }],
    ['.sr__p',         null], // market handles its own clicks
  ];

  const armedAt = performance.now() + 800; // ignore synthetic clicks during load
  const shoot = (e, clientX, clientY, pageX, pageY) => {
    if (performance.now() < armedAt) return;
    if (e.target.closest('button, input, a, .xp__bar, .sr__cats, .trio .obj, .xp')) return;
    // recoil + flash + shake
    c.classList.add('is-recoil'); setTimeout(() => c.classList.remove('is-recoil'), 120);
    if (!REDUCED) {
      const f = document.createElement('div'); f.className = 'flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 140);
      document.body.classList.remove('is-shake'); void document.body.offsetWidth; document.body.classList.add('is-shake');
    }
    // shattered glass where it landed (page coords so it scrolls with content)
    shots++;
    const h = crackGlass(pageX, pageY, shots >= 2 ? shots - 1 : 0);
    setTimeout(() => h.classList.add('is-fading'), 9000);
    setTimeout(() => h.remove(), 11000);
    // what did we hit?
    for (const [sel, fn] of HITTABLE) {
      const el = e.target.closest(sel);
      if (!el) continue;
      if (fn) { el.classList.remove('is-hit'); void el.offsetWidth; el.classList.add('is-hit'); fn(el); }
      hits++;
      break;
    }
  };
  // mouse: fire on press
  addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    shoot(e, e.clientX, e.clientY, e.pageX, e.pageY);
  });
  // touch: fire on a clean tap, never while scrolling
  let t0 = null;
  addEventListener('touchstart', (e) => { const t = e.touches[0]; t0 = { x: t.clientX, y: t.clientY, at: performance.now() }; }, { passive: true });
  addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    if (!t0 || Math.hypot(t.clientX - t0.x, t.clientY - t0.y) > 10 || performance.now() - t0.at > 400) return;
    shoot(e, t.clientX, t.clientY, t.clientX + scrollX, t.clientY + scrollY);
  }, { passive: true });
}

/* ─── Reveal ─── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i * 0.05, 0.3)}s`; io.observe(el); });
  setTimeout(() => els.forEach((el) => el.classList.add('in')), 2500);
}


/* ─── Videos: keep spinning after tab switches ─── */
function initVideos() {
  const vids = document.querySelectorAll('video');
  // the trio spins out of phase
  document.querySelectorAll('.trio__logo').forEach((v) => {
    const off = parseFloat(v.dataset.offset || '0');
    const seek = () => { if (off && v.duration) v.currentTime = off % v.duration; };
    v.readyState >= 1 ? seek() : v.addEventListener('loadedmetadata', seek, { once: true });
  });
  const play = () => vids.forEach((v) => v.play().catch(() => {}));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
  play();
}

/* ─── Ambient tears ─── */
function initAmbientTears() {
  if (REDUCED) return;
  const schedule = () => setTimeout(() => { tearFlash(); schedule(); }, rand(6000, 14000));
  schedule();
}

/* ─── LOOT.exe: draggable window, position remembered ─── */
function initDrag() {
  const xp = $('xp'), bar = $('xpBar');
  if (!xp || !bar) return;
  const place = (x, y) => {
    const w = xp.offsetWidth, h = xp.offsetHeight;
    x = Math.max(0, Math.min(innerWidth - w, x)); y = Math.max(0, Math.min(innerHeight - h, y));
    xp.style.left = `${x}px`; xp.style.top = `${y}px`; xp.style.right = 'auto'; xp.style.bottom = 'auto';
    return [x, y];
  };
  try {
    const saved = JSON.parse(localStorage.getItem('loot.xp') || 'null');
    if (saved && innerWidth > 900) place(saved[0], saved[1]);
  } catch (_) {}
  let drag = null;
  // small screens: the bar toggles the window instead of dragging it (checked at event time)
  const small = () => window.matchMedia('(max-width: 900px)').matches;
  bar.addEventListener('click', (e) => { if (small() && !e.target.closest('#xpClose')) xp.classList.toggle('is-collapsed'); });
  setTimeout(() => { if (small()) xp.classList.add('is-collapsed'); }, 9000);
  bar.addEventListener('pointerdown', (e) => {
    if (small() || e.target.closest('#xpClose')) return;
    const r = xp.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    xp.classList.add('is-dragging');
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', (e) => { if (drag) place(e.clientX - drag.dx, e.clientY - drag.dy); });
  const end = (e) => {
    if (!drag) return;
    const [x, y] = place(e.clientX - drag.dx, e.clientY - drag.dy);
    drag = null; xp.classList.remove('is-dragging');
    try { localStorage.setItem('loot.xp', JSON.stringify([x, y])); } catch (_) {}
  };
  bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
  addEventListener('resize', () => { const r = xp.getBoundingClientRect(); if (xp.style.left) place(r.left, r.top); });
}

/* ─── Colourways: click a variant, the whole house wears it ─── */
function initVariants() {
  const figs = document.querySelectorAll('.trio .obj[data-variant]');
  if (!figs.length) return;
  const apply = (v) => {
    document.body.dataset.variant = v;
    figs.forEach((f) => f.classList.toggle('is-active', f.dataset.variant === v));
    try { localStorage.setItem('loot.variant', v); } catch (_) {}
  };
  figs.forEach((f) => f.addEventListener('click', () => { apply(f.dataset.variant); tearFlash(); }));
  let saved = 'original';
  try { saved = localStorage.getItem('loot.variant') || 'original'; } catch (_) {}
  apply(saved);
}

/* ─── Restore clearance from a previous ACCEPT ─── */
function restoreClearance() {
  try {
    if (localStorage.getItem('loot.clr') === '6') document.querySelectorAll('.silk__item--locked').forEach((el) => {
      el.classList.add('is-unlocked'); const em = el.querySelector('em'); if (em) em.textContent = 'unlocked';
    });
  } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => {
  initDrag();
  restoreClearance();
  initVariants();
  initTagline();
  initXP();
  initMarket();
  initAmbientTears();
  initHeadline();
  initCursor();
  initReveal();
  initVideos();
});
