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
  'LOOT IS WHATEVER COMES NEXT.',
];

/* Operator voices (Office Assistant) */
const OPERATORS = {
  loot:  { name: 'LOOT',   desc: 'The voice behind LOOT.exe. Speaks in manifesto.', lines: MANIFESTO },
  stat:  { name: 'stat',   desc: 'Human status engine. Quantifies discipline.', lines: [
    'STAT IS YOUR REAL LIFE.', 'STAT IS A CHARACTER SHEET.', 'STAT IS DISCIPLINE.', 'STAT IS RANK.',
    'STAT IS NOT A FITNESS APP.', 'STAT IS LEVEL_5.', 'STAT IS THE CLAN.', 'STAT IS EARLY.',
  ] },
  brier: { name: 'Brier.', desc: 'Financial intel. Reputation before capital.', lines: [
    'BRIER IS THE BAZAAR OF ANSWERS.', 'BRIER IS SKILL OVER NOISE.', 'BRIER IS REPUTATION BEFORE CAPITAL.',
    'BRIER IS ≤ 0.20.', 'BRIER IS A SEAL.', 'BRIER IS 100 RESOLVED PREDICTIONS.', 'BRIER IS A VAULT.', 'BRIER IS NEVER WRONG.',
  ] },
  adan:  { name: 'ADAN',   desc: 'Reference prediction bot. Shadow mode. Watching.', lines: [
    'ADAN IS ALWAYS EARLY.', 'ADAN IS WATCHING POLYMARKET.', 'ADAN IS SHADOW MODE.', 'ADAN IS A REFERENCE.',
    'ADAN IS NOT A HUMAN.', 'ADAN IS 0.19.', 'ADAN IS AWAKE.', 'ADAN IS WHATEVER COMES NEXT.',
  ] },
  locked: { name: '███████', desc: 'ACCESS DENIED. CLR: LEVEL_6 required.', lines: null },
};

const SYS = [
  'SYS.OP.OK', 'NET.LATENCY: 14MS', 'CLR: L5', 'SEC: ALPHA', 'VOLATILITY: HIGH',
  'FUND: ACTIVE', '01001100 01001111 01001111 01010100', '<i class="blk"></i>',
  'REDACTED', 'AESTHETIC: BRUTAL',
];

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ';
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const $ = (id) => document.getElementById(id);

/* ─── Ticker ─── */
function initTicker() {
  const track = $('tickerTrack');
  if (!track) return;
  const items = [...SYS, 'ORBIT: LEO', 'SATS: 140', 'NODES: 20', 'MARKET: OPEN', 'OPERATOR: ONLINE', 'CLR: LEVEL_5', 'WHATEVER COMES NEXT'];
  const half = items.join(' &nbsp;┼&nbsp; ') + ' &nbsp;┼&nbsp; ';
  track.innerHTML = half + half + half;
}

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
const XP = { voice: 'loot', idx: 0, paused: false, denies: 0, timer: null };

function initXP() {
  const xp = $('xp'), msg = $('xpMsg');
  if (!xp || !msg) return;

  const lines = () => OPERATORS[XP.voice].lines || MANIFESTO;
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
    const text = XP.denies >= 3 ? 'LOOT IS NOT FOR POORS.' : 'WRONG DECISION.';
    hold(text, 'is-error', 2600);
    errorCascade(XP.denies >= 3 ? 8 : 5, text);
  };

  /* ACCEPT → access granted + target mode */
  const accept = () => {
    hold('ACCESS GRANTED. CLR: LEVEL_5 → LEVEL_6.', 'is-ok', 2600, () => {
      const clr = document.querySelector('.hero__meta .green');
      if (clr) clr.textContent = 'CLR: LEVEL_6';
    });
    TargetMode.toggle(true);
  };

  $('xpAccept')?.addEventListener('click', accept);
  $('xpDeny')?.addEventListener('click', deny);
  $('xpClose')?.addEventListener('click', deny);

  /* external hook: switch voice */
  XP.setVoice = (op) => {
    if (!OPERATORS[op]?.lines) return false;
    XP.voice = op; XP.idx = -1;
    hold(`OPERATOR: ${OPERATORS[op].name.toUpperCase()} ONLINE.`, 'is-ok', 1800);
    return true;
  };
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
   TARGET MODE — AI-vision boxes over the live page
   ═══════════════════════════════════════════════════════════════ */
const TargetMode = (() => {
  const SPEC = [
    ['.brand__title',   'the man of the future', 'main'],
    ['.hero__headline', 'signal',                'main'],
    ['.xp',             'weapon',                'main'],
    ['.win',            'market',                'main'],
  ];
  let boxes = [], on = false, raf = null;

  const build = () => {
    boxes = SPEC.map(([sel, label, kind]) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = document.createElement('div');
      b.className = `tm tm--${kind}`;
      b.innerHTML = `<b>${label}</b><i>${(0.9 + Math.random() * 0.09).toFixed(2)}</i>`;
      document.body.appendChild(b);
      return { el, b, jx: 0, jy: 0, t: 0 };
    }).filter(Boolean);
  };

  const tick = () => {
    if (!on) return;
    const now = performance.now();
    boxes.forEach((o) => {
      const r = o.el.getBoundingClientRect();
      const visible = r.bottom > 0 && r.top < innerHeight && r.width > 0;
      o.b.style.opacity = visible ? 1 : 0;
      if (!visible) return;
      if (now - o.t > 600) { o.t = now; o.jx = rand(-3, 3); o.jy = rand(-3, 3); o.b.querySelector('i').textContent = (0.9 + Math.random() * 0.09).toFixed(2); }
      const pad = 8;
      o.b.style.left = `${r.left - pad + o.jx}px`;
      o.b.style.top = `${r.top - pad + o.jy}px`;
      o.b.style.width = `${r.width + pad * 2}px`;
      o.b.style.height = `${r.height + pad * 2}px`;
    });
    raf = requestAnimationFrame(tick);
  };

  const toggle = (state) => {
    on = state;
    document.body.classList.toggle('target-mode', on);
    if (on) { if (!boxes.length) build(); boxes.forEach((o) => (o.b.style.opacity = 1)); tick(); }
    else { cancelAnimationFrame(raf); boxes.forEach((o) => (o.b.style.opacity = 0)); }
    try { localStorage.setItem('loot.target', on ? '1' : '0'); } catch (_) {}
  };

  const restore = () => { try { if (localStorage.getItem('loot.target') === '1') toggle(true); } catch (_) {} };
  return { toggle, restore };
})();


/* ═══════════════════════════════════════════════════════════════
   ANONYMOUS MARKET (Silk Road)
   ═══════════════════════════════════════════════════════════════ */
const PRODUCTS = [
  { id: 'stat',   cat: ['software', 'bots', 'models'], tile: 'stat',    img: 'assets/stat-logo.png',  title: '1g pure HUMAN_STATUS_ENGINE!!! only early!! very strong', price: 2.06, note: 'iOS' },
  { id: 'brier',  cat: ['software', 'vaults', 'signals'], tile: 'brier', img: 'assets/brier-logo.png', title: 'PREMIUM FINANCIAL_INTEL model!! Risk routing [GOD SOURCE]', price: 1.84, note: 'brier.world' },
  { id: 'adan',   cat: ['software', 'bots', 'signals'], tile: 'adan',   text: '> adan --shadow\n> polymarket: watching\n> brier: 0.19', title: 'ADAN prediction bot. Always early. Shadow mode. 1 yr', price: 0.91 },
  { id: 'exe',    cat: ['software', 'manifestos'], tile: 'exe',   text: 'LOOT.exe', title: '>>SPECIAL OFFER* MANIFESTO v4.0 EXCLUSIVE', price: 0.00, note: 'free' },
  { id: 'club',   cat: ['capital', 'custom'],  tile: 'club',  text: 'PRIVATE', title: 'Seat at the private club. sense of belonging [Link] 1 yr', price: 41.94 },
  { id: 'beer',   cat: ['art', 'custom'],      tile: 'beer',  text: '🍺', title: 'A cold beer. Good Quality', price: 0.03 },
  { id: 'source', cat: ['software', 'terminals', 'books'], tile: 'source', text: 'SOURCE CODE\nLIBRARY (1-10)', title: 'Source Code Library (1-10) Da\'ath incl.', price: 7.52 },
  { id: 'taste',  cat: ['art', 'ideas'],       tile: 'taste', text: 'taste', title: 'Taste. cannot be bought, only recognized', price: Infinity },
  { id: 'lev',    cat: ['capital', 'signals'], tile: 'leverage', text: '10x', title: 'High Vibration 10x LEVERAGE. Handle with care', price: 67.32 },
  { id: 'cult',   cat: ['apparel', 'custom'],  tile: 'cult',  text: 'CULT', title: 'Membership. LOOT IS A CULT. hoodie incl.', price: 4.20 },
  { id: 'future', cat: ['capital', 'data', 'ideas'], tile: 'future', text: 'PRE-ORDER', title: 'The future. Pre-order. Ships whenever comes next', price: 188.72 },
  { id: 'idea',   cat: ['ideas'],              tile: 'idea',  text: '', title: 'A fucking idea. 100% original. Last one', price: 0.91 },
  { id: 'redact', cat: ['weapons', 'hardware', 'data'], tile: 'redacted', text: '███████', title: '███████ ████ ██████ [CLASSIFIED]', price: NaN },
];

function initMarket() {
  const grid = $('srProducts');
  if (!grid) return;
  let cat = 'all', q = '', cart = 0, orders = 0;

  const fmt = (p) => Number.isNaN(p) ? '฿???' : p === Infinity ? '฿∞' : `฿${p.toFixed(2)}`;
  const render = () => {
    const list = PRODUCTS.filter((p) => (cat === 'all' || p.cat.includes(cat)) && (!q || (p.title + ' ' + p.id).toLowerCase().includes(q)));
    grid.innerHTML = list.length ? list.map((p) => `
      <div class="sr__p" data-id="${p.id}">
        <div class="tile tile--${p.tile}">${p.img ? `<img src="${p.img}" alt="">` : `<span>${(p.text || '').replace(/\n/g, '<br>')}</span>`}</div>
        <div class="sr__p-title">${p.title}</div>
        <div class="sr__p-price">${fmt(p.price)}${p.note ? `<small>${p.note}</small>` : ''}</div>
      </div>`).join('') : `<div class="sr__empty">No listings. LOOT IS WHATEVER COMES NEXT.</div>`;
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
    if (p.price === 0) {
      cart++; orders++;
      $('srCartCount').textContent = cart; $('srOrders').textContent = orders;
      flashMsg('LOOT.exe ADDED TO CART. LOOT IS FREE.', 'is-ok');
    } else if (Number.isNaN(p.price)) {
      flashMsg('CLASSIFIED. CLR: LEVEL_6 REQUIRED.', 'is-error'); errorCascade(3, 'ACCESS DENIED.');
    } else {
      flashMsg('INSUFFICIENT FUNDS. LOOT IS NOT FOR POORS.', 'is-error'); errorCascade(2, 'LOOT IS NOT FOR POORS.');
    }
  });
  $('srCart')?.addEventListener('click', () => flashMsg(cart ? `CART: ${cart} × LOOT.exe. CHECKOUT: NEVER.` : 'CART EMPTY. LOOT IS A MARKET.', 'is-ok'));
  document.querySelector('.sr__logout')?.addEventListener('click', (e) => { e.preventDefault(); flashMsg('THERE IS NO LOGOUT.', 'is-error'); });
}

/* Show a one-off line in LOOT.exe and scroll it into view */
function flashMsg(text, state) {
  const xp = $('xp'), msg = $('xpMsg');
  if (!xp || !msg) return;
  XP.paused = true;
  xp.classList.remove('is-error', 'is-ok', 'hidden'); if (state) xp.classList.add(state);
  scramble(msg, text, { onSet: (t) => { msg.dataset.text = t; } });
  xp.classList.remove('glitch'); void xp.offsetWidth; xp.classList.add('glitch');
  tearFlash();
  clearTimeout(XP.flashT);
  XP.flashT = setTimeout(() => { xp.classList.remove('is-error', 'is-ok'); XP.paused = false; }, 2600);
}

/* ═══════════════════════════════════════════════════════════════
   OFFICE ASSISTANT
   ═══════════════════════════════════════════════════════════════ */
function initAssistant() {
  const list = $('oaList'), prev = $('oaPreview'), desc = $('oaDesc');
  if (!list || !prev) return;
  let current = 'loot';
  const views = { loot: '.oa__vid', stat: '.oa__img--stat', brier: '.oa__img--brier', adan: '.oa__ascii', locked: '.oa__locked' };

  const show = (op) => {
    current = op;
    list.querySelectorAll('li').forEach((li) => li.classList.toggle('is-active', li.dataset.op === op));
    Object.entries(views).forEach(([k, sel]) => { const el = prev.querySelector(sel); if (el) el.hidden = k !== op; });
    desc.textContent = OPERATORS[op].desc;
  };
  list.addEventListener('click', (e) => { const li = e.target.closest('li[data-op]'); if (li) show(li.dataset.op); });
  $('oaSet')?.addEventListener('click', () => {
    if (!XP.setVoice || !XP.setVoice(current)) { flashMsg('ACCESS DENIED. CLR: LEVEL_6 REQUIRED.', 'is-error'); errorCascade(3, 'ACCESS DENIED.'); return; }
    try { localStorage.setItem('loot.voice', current); } catch (_) {}
  });
  $('oaCancel')?.addEventListener('click', () => show('loot'));

  try {
    const saved = localStorage.getItem('loot.voice');
    if (saved && OPERATORS[saved]?.lines) { XP.voice = saved; show(saved); }
  } catch (_) {}
}


/* ─── Headline hover scramble ─── */
function initHeadline() {
  const h = $('headline');
  if (!h || REDUCED) return;
  const original = h.textContent;
  h.addEventListener('mouseenter', () => scramble(h, original, { frames: 8, tick: 30 }));
}

/* ─── Cursor: weapon sight. Click = shoot. ─── */
function initCursor() {
  const c = $('cursor');
  if (!c || window.matchMedia('(hover: none)').matches) return;
  let mx = -100, my = -100, cx = -100, cy = -100;
  addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  const tick = () => { cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35; c.style.transform = `translate(${cx - c.offsetWidth / 2}px, ${cy - c.offsetHeight / 2}px)`; requestAnimationFrame(tick); };
  tick();

  let hits = 0;
  const HITTABLE = [
    ['.target--stat',  () => flashMsg('HIT. STAT NEUTRALIZED.', 'is-error')],
    ['.target--brier', () => flashMsg('HIT. BRIER NEUTRALIZED.', 'is-error')],
    ['.brand__title',  () => flashMsg('HIT. THE MAN OF THE FUTURE.', 'is-error')],
    ['.hero__headline', (el) => scramble(el, el.textContent, { frames: 10 })],
    ['.xp',            () => { XP.denies++; flashMsg('YOU SHOT LOOT.exe. WRONG DECISION.', 'is-error'); errorCascade(4, 'WRONG DECISION.'); }],
    ['.silk__item--locked', () => { flashMsg('CLASSIFIED. CLR: LEVEL_6 REQUIRED.', 'is-error'); errorCascade(2, 'ACCESS DENIED.'); }],
    ['.sr__p',         null], // market handles its own clicks
    ['.badge',         (el) => el.classList.add('is-hit')],
  ];

  addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, input, a, #globe, .sr__cats, #oaList')) return;
    // recoil + flash + shake
    c.classList.add('is-recoil'); setTimeout(() => c.classList.remove('is-recoil'), 120);
    if (!REDUCED) {
      const f = document.createElement('div'); f.className = 'flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 140);
      document.body.classList.remove('is-shake'); void document.body.offsetWidth; document.body.classList.add('is-shake');
    }
    // bullet hole where it landed (page coords so it scrolls with content)
    const h = document.createElement('div');
    h.className = 'hole';
    h.style.left = `${e.pageX}px`; h.style.top = `${e.pageY}px`;
    h.style.setProperty('--a1', `${rand(0, 360)}deg`); h.style.setProperty('--a2', `${rand(0, 360)}deg`);
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 12000);
    // what did we hit?
    for (const [sel, fn] of HITTABLE) {
      const el = e.target.closest(sel);
      if (!el) continue;
      if (fn) { el.classList.remove('is-hit'); void el.offsetWidth; el.classList.add('is-hit'); fn(el); }
      hits++;
      const hud = $('hudHits'); if (hud) hud.textContent = `HITS: ${hits}`;
      break;
    }
  });
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

/* ─── HUD ─── */
function initHUD() {
  const depth = $('hudDepth'), coords = $('hudCoords'), clock = $('hudClock');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    if (depth) depth.textContent = `DEPTH: ${pct.toFixed(1)}%`;
    if (coords) coords.textContent = `LAT ${(40.712 + pct * 0.01).toFixed(3)} · LON ${(-74.006 + pct * 0.005).toFixed(3)}`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (clock) {
    const p = (n) => String(n).padStart(2, '0');
    const t = () => { const d = new Date(); clock.textContent = `UTC ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`; };
    t(); setInterval(t, 1000);
  }
}

/* ─── Reticle parallax ─── */
function initReticle() {
  const r = $('reticle');
  if (!r || REDUCED) return;
  addEventListener('mousemove', (e) => {
    const dx = (e.clientX / innerWidth - 0.5) * 30, dy = (e.clientY / innerHeight - 0.5) * 30;
    r.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }, { passive: true });
}

/* ─── Videos: keep spinning after tab switches ─── */
function initVideos() {
  const vids = document.querySelectorAll('video');
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

document.addEventListener('DOMContentLoaded', () => {
  initTicker();
  initXP();
  initMarket();
  initAssistant();
  initAmbientTears();
  initHeadline();
  initCursor();
  initReveal();
  initHUD();
  initReticle();
  initVideos();
  TargetMode.restore();
});
