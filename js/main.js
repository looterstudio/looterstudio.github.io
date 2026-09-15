'use strict';

/* ═══════════════════════════════════════════════════════════════
   LooterStudio® — main.js
   ═══════════════════════════════════════════════════════════════ */

const MANIFESTO = [
  'LOOT IS SWAG.',
  'LOOT IS AI WEAPONIZATION.',
  'LOOT IS A QUANTITATIVE FUND.',
  'LOOT IS A COLD BEER.',
  'LOOT IS SOFTWARE.',
  'LOOT IS A RECORD LABEL.',
  'LOOT IS A PRIVATE CLUB.',
  'LOOT IS A FACTORY.',
  'LOOT IS AN ARTIST.',
  'LOOT IS A BANK.',
  'LOOT IS A CASINO.',
  'LOOT IS A CULT.',
  'LOOT IS A MARKET.',
  'LOOT IS A GAME.',
  'LOOT IS A MOVEMENT.',
  'LOOT IS AN INTERNET COMPANY.',
  'LOOT IS A FUCKING IDEA.',
  'LOOT IS TASTE.',
  'LOOT IS SPEED.',
  'LOOT IS OBSESSION.',
  'LOOT IS CAPITAL.',
  'LOOT IS CHAOS.',
  'LOOT IS BEAUTY.',
  'LOOT IS RISK.',
  'LOOT IS LEVERAGE.',
  'LOOT IS THE FUTURE.',
  'LOOT IS MOG.',
  'LOOT IS IQMAXING.',
  'LOOT IS BEING EARLY.',
  'LOOT IS CORPORATE LARP.',
  'LOOT IS FOR COMPETITIVE PEOPLE.',
  'LOOT IS A PRIVATE FUND.',
  'LOOT IS A VENTURE CAPITAL.',
  'LOOT IS WHATEVER COMES NEXT.',
  'LOOT IS A SOVEREIGN STATE.',
  'LOOT IS TOO EARLY TO EXPLAIN.',
  'LOOT IS A RUNNING CLUB.',
  'LOOT IS A SEASON, NOT A YEAR.',
  'LOOT IS 0.97 BRIER.',
  'LOOT IS A DECOMMISSIONED SATELLITE.',
  'LOOT IS HEADQUARTERED IN BUENOS AIRES.',
  'LOOT IS A FAMILY OFFICE FOR PEOPLE WITHOUT A FAMILY.',
  'LOOT IS THREE PEOPLE.',
  'LOOT IS NOT HIRING.',
  'LOOT IS PRE-REVENUE, POST-TASTE.',
  'LOOT IS A VAULT NOBODY CAN OPEN.',
  'LOOT IS A BOT THAT NEVER SLEEPS.',
  'LOOT IS LISTED NOWHERE.',
  'LOOT IS WORTH $1,000,000,000 (SOURCE: LOOT).',
  'LOOT IS A LEADERBOARD.',
  'LOOT IS WHO PASSED YOU.',
  'LOOT IS 5 KM BEFORE WORK.',
  'LOOT IS A RECORD LABEL WITH NO RECORDS.',
  'LOOT IS AN ART SCHOOL WITH NO TEACHERS.',
  'LOOT IS AUDITED BY NOBODY.',
  'LOOT IS 100% VERIFIED HUMAN.',
  "LOOT IS YOUR RIVAL'S FRAT.",
  'LOOT IS A COLD START.',
  'LOOT IS SIGNAL, NOT NOISE.',
  'LOOT IS A SILK ROAD FOR IDEAS.',
  'LOOT IS A 4 DOLLAR SERVER IN HELSINKI.',
  'LOOT IS PROOF OF RUN.',
  'LOOT IS THE DREAD PIRATE.',
  'LOOT IS DECENTRALIZING.',
  'LOOT IS CLR: LEVEL_6.',
  'LOOT IS A TERMINAL.',
  'LOOT IS NOT A CHARITY.',
  'LOOT IS ALWAYS EARLY.',
  'LOOT IS NEVER WRONG.',
  'LOOT IS A GLOBE WITH ONE DOT.',
  'LOOT IS SEIZED.',
  'LOOT IS 1 OF 1.',
  "LOOT IS WHATEVER YOU CAN'T BUY.",
  'LOOT IS STILL LOADING.',
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
const XP = { idx: 0, paused: false, denies: 0, timer: null, accepted: false, grants: 0, closes: 0 };
try { XP.accepted = localStorage.getItem('loot.clr') === '6'; } catch (_) {}

function initXP() {
  const xp = $('xp'), msg = $('xpMsg');
  if (!xp || !msg) return;

  const lines = () => MANIFESTO;
  const mini = $('xpMini');
  const say = (text) => scramble(msg, text, { onSet: (t) => { msg.dataset.text = t; if (mini) mini.textContent = t; } });
  const glitch = () => { xp.classList.remove('glitch'); void xp.offsetWidth; xp.classList.add('glitch'); };

  const next = () => {
    if (XP.paused) return;
    XP.idx = (XP.idx + 1) % lines().length;
    say(lines()[XP.idx]);
    glitch();
    if (Math.random() < 0.12) tearFlash();
  };
  const loop = () => { next(); XP.timer = setTimeout(loop, rand(3200, 5200)); };
  XP.timer = setTimeout(loop, 2500);

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
    if (!document.body.classList.contains('is-gated')) document.body.classList.add('is-gated');
    XP.accepted = false; try { localStorage.removeItem('loot.clr'); } catch (_) {}
    xp.classList.remove('is-min', 'is-collapsed');
    document.body.classList.remove('deny-flash'); void document.body.offsetWidth; document.body.classList.add('deny-flash');
    const DENIALS = ['HAHAHA LOOT IS NOT FOR YOU THEN.', 'LOOT NOTED YOUR ANSWER.', 'LOOT MAYBE NOT FOR YOU.', 'LOOT WILL EXPLODE YOUR HEAD.', 'LOOT IS NOT FOR YOU. STILL.'];
    const text = DENIALS[Math.min(XP.denies - 1, DENIALS.length - 1)];
    hold(text, 'is-error', 2600);
    errorCascade(XP.denies >= 3 ? 8 : 5, text);
  };

  /* ACCEPT → access granted + target mode */
  const accept = () => {
    XP.accepted = true;
    if (document.body.classList.contains('is-gated')) { document.body.classList.remove('is-gated'); window.scrollTo(0, 0); tearFlash(); xp.classList.remove('is-min'); setTimeout(() => dispatchEvent(new Event('resize')), 100); }
    const GRANTS = ['ACCESS GRANTED. CLR: LEVEL_6.', 'WELCOME BACK, OPERATOR.', 'YOUR SEAT IS RESERVED.', 'DO NOT RUN THE SOURCE.', 'SATELLITE 42 ACKNOWLEDGED.'];
    hold(XP.accepted && XP.grants++ ? pick(GRANTS) : GRANTS[0], 'is-ok', 2600, () => {
      document.querySelectorAll('.silk__item--locked').forEach((el) => {
        el.classList.add('is-unlocked');
        const em = el.querySelector('em'); if (em) em.textContent = 'unlocked';
      });
      try { localStorage.setItem('loot.clr', '6'); } catch (_) {}
    });
  };

  $('xpAccept')?.addEventListener('click', accept);
  $('xpDeny')?.addEventListener('click', deny);
  /* Three closes in a row: it minimizes for a minute so the page below can be read. It always comes back. */
  $('xpClose')?.addEventListener('click', () => {
    XP.closes++;
    if (XP.closes >= 3) {
      XP.closes = 0; XP.paused = true;
      xp.classList.add('is-min');
      setTimeout(() => { xp.classList.remove('is-min'); XP.paused = false; glitch(); }, 60000);
      return;
    }
    deny();
  });

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
  { id: 'brier',  cat: ['software', 'vaults', 'signals'], tile: 'brier', img: 'assets/brier-logo.png', title: 'PREMIUM FINANCIAL_INTEL model!! Risk routing [GOD SOURCE]', price: 1.84, note: 'brier.world', link: 'https://brier.world' },
  { id: 'stat',   cat: ['software', 'bots', 'models'], tile: 'stat',    img: 'assets/stat-logo.png',  title: '1g pure HUMAN_STATUS_ENGINE!!! only early!! very strong', price: 2.06, note: 'iOS · SEASON 0', link: '#stat' },
  { id: 'logo',   cat: ['objects', 'art', 'capital'], tile: 'logo', video: 'assets/loot-360.mp4', title: 'LooterStudio® logo. 1 of 1. The whole thing', price: 1e9 },
  { id: 'tung',   cat: ['art', 'objects'], tile: 'tung', img: 'assets/tung.jpg', text: 'TUNG TUNG TUNG', title: 'tung tung tung sahur · 1/1 · <b class="verified">LooterStudio verified ✓</b>', priceLabel: '100,000 USDC', offer: 'https://www.tensor.trade/item/Brye9AuSmdvkQM4JJLKYLZDVuhz9HpboVTZfUfYZaVD7', mint: 'Brye9AuSmdvkQM4JJLKYLZDVuhz9HpboVTZfUfYZaVD7' },
  { id: 'sound',  cat: ['sound', 'art'],       tile: 'sound', img: 'assets/redstar.jpg', title: 'REDSTAR RECORDS', price: 12.00, note: 'soon' },
  { id: 'future', cat: ['capital', 'data', 'ideas'], tile: 'future', img: 'assets/future.jpg', title: 'The future. Pre-order. Ships whenever comes next', price: 188.72 },
  { id: 'source', cat: ['software', 'terminals', 'books'], tile: 'source', text: '', title: 'UNIVERSE SOURCE CODE. leaked. do not run', price: 7.52 },
  { id: 'taste',  cat: ['art', 'ideas'],       tile: 'taste', text: 'taste', title: 'Taste. cannot be bought, only recognized', price: Infinity },
  { id: 'lev',    cat: ['capital', 'signals'], tile: 'leverage', img: 'assets/vibration.jpg', title: 'High Vibration 10x LEVERAGE. Handle with care', price: 67.32 },
  { id: 'human',  cat: ['apparel', 'custom'],  tile: 'human', text: '', title: 'VERIFIED HUMAN · 1 of 8,100,000,000 · no refunds', price: 4.20 },
  { id: 'cult',   cat: ['apparel', 'custom'],  tile: 'cult',  img: 'assets/illuminati.jpg', title: 'ILLUMINATI MEMBERSHIP. hoodie incl. no refunds', price: 4.20 },
  { id: 'beer',   cat: ['art', 'custom'],      tile: 'beer',  img: 'assets/beer.jpg', title: 'A cold beer. Good Quality', priceLabel: '1 USDC', buy: 'beer' },
  { id: 'idea',   cat: ['ideas'],              tile: 'idea',  img: 'assets/idea.jpg', title: 'A fucking idea', priceLabel: '9 USDC', buy: 'idea' },
  { id: 'club',   cat: ['events', 'capital'],  tile: 'club',  img: 'assets/voodoo.jpg', seized: true, title: 'VOODOO B.C', priceLabel: 'SEIZED BY LooterStudio®' },
  { id: 'obj',    cat: ['objects', 'art'],     tile: 'alien', text: '', title: '??????????', priceLabel: '?' },
  { id: 'event',  cat: ['events', 'custom'],   tile: 'alien', text: '', title: '???????? ??? ????????????', priceLabel: '????????' },
  { id: 'redact', cat: ['custom'], tile: 'alien', text: '', title: '?????????? [CLASSIFIED]', priceLabel: '??????' },
];

function initMarket() {
  const grid = $('srProducts');
  const AS = window.LOOT_ASSETS || '';
  if (!grid) return;
  let cat = 'all', q = '', cart = 0, orders = 0;

  const fmt = (p) => Number.isNaN(p) ? '฿???' : p === Infinity ? '฿∞' : p >= 1e6 ? `฿${p.toLocaleString('en-US')}` : `฿${p.toFixed(2)}`;
  const price = (p) => p.priceLabel || fmt(p.price);
  const render = () => {
    const list = PRODUCTS.filter((p) => (cat === 'all' || p.cat.includes(cat)) && (!q || (p.title + ' ' + p.id).toLowerCase().includes(q)));
    grid.innerHTML = list.length ? list.map((p) => `
      <div class="sr__p" data-id="${p.id}">
        <div class="tile tile--${p.tile}${p.seized ? ' tile--seized' : ''}">${p.tile === 'riddle' ? '<pre class="rq"><span class="rq__big">?</span>&gt; ????????<i class="rq__cur">_</i></pre>' : ''}${p.seized ? `<div class="seizure"><div class="seizure__band">NOTICE OF SEIZURE</div><img class="seizure__seal" src="${AS}assets/seal.svg" alt=""><b class="seizure__big">THIS ASSET HAS BEEN SEIZED</b><small class="seizure__by">by LooterStudio® pursuant to a warrant issued by nobody</small><code class="seizure__case">CASE NO. LOOT-0042 · ${new Date().getFullYear()}</code></div>` : ''}${p.video ? `<video src="${AS}${p.video}" autoplay loop muted playsinline></video>` : p.img ? `<img src="${AS}${p.img}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${(p.text || '').replace(/'/g, '')}'}))">` : `<span>${(p.text || '').replace(/\n/g, '<br>')}</span>`}</div>
        <div class="sr__p-title">${p.title}</div>
        <div class="sr__p-price">${price(p)}${p.note ? `<small>${p.note}</small>` : ''}</div>
        ${p.offer ? `<a class="sr__offer" href="${p.offer}" target="_blank" rel="noopener">MAKE AN OFFER</a>` : ''}
        ${p.buy ? `<button class="sr__offer sr__buy" data-buy="${p.buy}" type="button">BUY</button>` : ''}
      </div>`).join('') : `<div class="sr__empty">No listings. LOOT IS WHATEVER COMES NEXT.</div>`;
    grid.querySelectorAll('.tile--logo video').forEach((v) => window.keyed360 && window.keyed360.attach(v));
    if (TOUCH) swapVideos(grid); else grid.querySelectorAll('video').forEach((v) => v.play().catch(() => {}));
    grid.querySelectorAll('.tile--source').forEach(matrixRain);
    grid.querySelectorAll('.tile--leverage:not(:has(img))').forEach(vibrationField);
    grid.querySelectorAll('.tile--alien').forEach(alienBlock);
    grid.querySelectorAll('.tile--human').forEach(fingerprint);
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
    if (p.seized) { flashMsg('SEIZED. DO NOT ASK.', 'is-error'); errorCascade(2, 'EVIDENCE.'); return; }
    if (p.tile === 'riddle' || p.tile === 'alien') { flashMsg('??????????', 'is-error'); return; }
    if (p.price === 0) {
      cart++; orders++;
      $('srCartCount').textContent = cart; $('srOrders').textContent = orders;
      flashMsg('LOOT.exe ADDED TO CART. LOOT IS FREE.', 'is-ok');
    } else if (p.id === 'logo') {
      flashMsg('฿1,000,000,000. NOT FOR SALE TO YOU.', 'is-error'); errorCascade(3, 'NOT FOR SALE TO YOU.');
    } else if (Number.isNaN(p.price)) {
      flashMsg('CLASSIFIED. CLR: LEVEL_6 REQUIRED.', 'is-error'); errorCascade(3, 'ACCESS DENIED.');
    } else {
      flashMsg('INSUFFICIENT FUNDS. LOOT IS NOT A CHARITY.', 'is-error'); errorCascade(2, 'LOOT IS NOT A CHARITY.');
    }
  });
  $('srCart')?.addEventListener('click', () => flashMsg(cart ? `CART: ${cart} × LOOT.exe. CHECKOUT: NEVER.` : 'CART EMPTY. LOOT IS A MARKET.', 'is-ok'));
  document.querySelector('.sr__logout')?.addEventListener('click', (e) => { e.preventDefault(); flashMsg('THERE IS NO LOGOUT.', 'is-error'); });
}

const ALIEN_GLYPHS = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟⵀⵁⵂⵃⵄⵅⵆⵇⵈⵉⵊⵋⵌⵍⵎⵏ∀∂∃∅∇∈∉∋∏∑√∞∠∧∨∩∪∫≈≠≡⊂⊃⊕⊗01';

/* Surveillance clock on the seized tile */
function camClock(el) {
  const t0 = Date.now() - (41 * 60 + 12) * 1000;
  const p = (n) => String(n).padStart(2, '0');
  const tick = () => { if (!el.isConnected) return; const s = Math.floor((Date.now() - t0) / 1000); el.textContent = `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`; setTimeout(tick, 1000); };
  tick();
}

/* Two aliens talking over a Matrix rain. Never translated, except for a flash. */
const ALIEN_LEAKS = ['> they are early', '> observe the humans', '> do not run the source', '> the dot is in buenos aires', '> loot is listening', '> season zero begins', '> we were never wrong', '> level six confirmed'];
function alienBlock(tile) {
  tile.innerHTML = '';
  const c = document.createElement('canvas'); tile.appendChild(c);
  const pre = document.createElement('pre'); pre.className = 'alien'; tile.appendChild(pre);
  const ctx = c.getContext('2d');
  const fs = 10;
  let drops = [];
  const size = () => { c.width = tile.clientWidth; c.height = tile.clientHeight; drops = Array.from({ length: Math.ceil(c.width / fs) }, () => Math.random() * -20); };
  size();
  const rain = () => {
    if (!tile.isConnected) return;
    if (c.width !== tile.clientWidth) size();
    ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = `${fs}px "JetBrains Mono", monospace`;
    drops.forEach((y, i) => {
      if (Math.random() < 0.15) return;
      ctx.fillStyle = Math.random() < 0.06 ? 'rgba(200,255,210,0.95)' : 'rgba(0,255,65,0.55)';
      ctx.fillText(ALIEN_GLYPHS[Math.floor(Math.random() * ALIEN_GLYPHS.length)], i * fs, y * fs);
      drops[i] = y * fs > c.height && Math.random() > 0.97 ? 0 : y + 0.35 + Math.random() * 0.35;
    });
    requestAnimationFrame(rain);
  };
  const G = ALIEN_GLYPHS.slice(0, -2);
  const word = () => Array.from({ length: 2 + Math.floor(Math.random() * 6) }, () => G[Math.floor(Math.random() * G.length)]).join('');
  const sentence = () => Array.from({ length: 1 + Math.floor(Math.random() * 4) }, word).join(' ') + (Math.random() < 0.3 ? ' ?' : '');
  const lines = [];
  let voice = 1, cur = '', target = sentence(), i = 0, thinking = false;
  const esc = (t) => t.replace(/</g, '&lt;');
  const render = () => {
    const cursor = Math.floor(performance.now() / 400) % 2 ? '_' : ' ';
    pre.innerHTML = [...lines, `<span class="v${voice}">⌬${voice}&gt; ${esc(cur)}${thinking ? '···' : cursor}</span>`].join('\n');
  };
  const tick = () => {
    if (!tile.isConnected) return;
    if (i < target.length) { cur += target[i++]; render(); setTimeout(tick, 30 + Math.random() * 70); return; }
    setTimeout(() => {
      lines.push(`<span class="v${voice}">⌬${voice}&gt; ${esc(cur)}</span>`);
      // every so often one line decrypts for an instant, then goes back to glyphs
      if (Math.random() < 0.18) {
        const idx = lines.length - 1, saved = lines[idx];
        lines[idx] = `<span class="leak">${esc(pick(ALIEN_LEAKS))}</span>`; render();
        setTimeout(() => { lines[idx] = saved; render(); }, 900 + Math.random() * 900);
      }
      while (lines.length > 7) lines.shift();
      voice = voice === 1 ? 2 : 1; cur = ''; target = sentence(); i = 0; thinking = true; render();
      if (Math.random() < 0.3) { tile.classList.remove('is-burst'); void tile.offsetWidth; tile.classList.add('is-burst'); }
      setTimeout(() => { thinking = false; tick(); }, 400 + Math.random() * 900);
    }, 600 + Math.random() * 1200);
  };
  render();
  if (REDUCED) { pre.textContent = ['⌬1> ' + sentence(), '⌬2> ' + sentence(), '⌬1> ' + sentence()].join('\n'); return; }
  rain(); tick();
}

/* Keyed 360: the logo video has a black background; on paper we decode it once,
   drop everything near black, and blit the result to every .k360 slot. One
   decoder means phones (which refuse to play three videos at once) still spin. */
function keyVideos() {
  const slots = [...document.querySelectorAll('video.k360')];
  if (!slots.length) return;
  const video = slots[0];
  const S = 512, off = document.createElement('canvas'); off.width = S; off.height = S;
  const octx = off.getContext('2d', { willReadFrequently: true });
  const outs = slots.map(v => {
    const c = document.createElement('canvas');
    c.className = v.className.replace('k360', 'k360-out');
    c.width = S; c.height = S;
    v.insertAdjacentElement('afterend', c);
    if (v !== video) v.remove();
    return c;
  });
  Object.assign(video.style, { position: 'fixed', left: '0', top: '0', width: '2px', height: '2px', opacity: '0.01', pointerEvents: 'none' });
  document.body.appendChild(video);
  const tick = () => {
    if (video.readyState >= 2 && !video.paused) {
      octx.drawImage(video, 176, 114, 382, 382, 0, 0, S, S);
      const f = octx.getImageData(0, 0, S, S), d = f.data;
      for (let i = 0; i < d.length; i += 4) {
        const m = Math.max(d[i], d[i + 1], d[i + 2]);
        d[i + 3] = m < 22 ? 0 : m < 70 ? Math.round((m - 22) * 5.3) : 255;
      }
      octx.putImageData(f, 0, 0);
      outs.forEach(c => { const x = c.getContext('2d'); x.clearRect(0, 0, S, S); x.drawImage(off, 0, 0); });
    }
    requestAnimationFrame(tick);
  };
  window.keyed360 = { attach(el) {
    const c = document.createElement('canvas'); c.className = 'k360-out'; c.width = S; c.height = S;
    el.replaceWith(c); outs.push(c);
  } };
  const kick = () => video.play().catch(() => {});
  kick();
  ['touchstart', 'click', 'visibilitychange', 'pageshow'].forEach(e => document.addEventListener(e, kick, { passive: true }));
  // a phone that refuses to decode at all gets the still image instead of a blank
  setTimeout(() => { if (video.readyState < 2) outs.forEach(c => { const img = document.createElement('img'); img.src = (window.LOOT_ASSETS || '') + 'assets/loot-360-alpha.webp'; img.alt = ''; img.className = c.className; c.replaceWith(img); }); }, 4000);
  tick();
}

/* Verified human: a fingerprint drawn from arcs, unique per visit */
function fingerprint(tile) {
  const c = document.createElement('canvas'); tile.innerHTML = ''; tile.appendChild(c);
  const label = document.createElement('b'); label.textContent = 'HUMAN'; tile.appendChild(label);
  const ctx = c.getContext('2d');
  const W = c.width = tile.clientWidth || 200, H = c.height = tile.clientHeight || 200;
  const seed = Math.random() * 1000;
  ctx.strokeStyle = '#e8e6e0'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
  for (let r = 6; r < Math.min(W, H) * 0.42; r += 5) {
    const gaps = 1 + Math.floor((Math.sin(seed + r) + 1) * 2);
    for (let g = 0; g < gaps; g++) {
      const a0 = (g / gaps) * Math.PI * 2 + Math.sin(seed * r) * 0.5, a1 = a0 + (Math.PI * 2 / gaps) * (0.55 + 0.35 * Math.abs(Math.cos(seed + r * g)));
      ctx.beginPath(); ctx.ellipse(W / 2, H / 2, r, r * 1.25, Math.sin(seed) * 0.4, a0, a1); ctx.stroke();
    }
  }
}

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
    '01100101 01100001 01110010 01101100 01111001',
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
    if (/USDC/i.test(m)) errorCascade(2, 'LOOT IS NOT A CHARITY.');
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
  // organic blobs (wobbly polygons + turbulence displacement), directional spray with
  // elongated droplets, and drips that meander, taper and end in a heavy asymmetric bulb.
  const blob = (x, y, rr, n = 18, wob = 0.35) => {
    let p = '';
    const seed = rand(0, Math.PI * 2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = rr * (1 + wob * Math.sin(a * 3 + seed) * Math.sin(a * 5 + seed * 2) + rand(-0.08, 0.08));
      p += `${i ? 'L' : 'M'}${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)} `;
    }
    return p + 'Z ';
  };
  const drip = (x0, y0, len, w0) => {
    // centreline with slow meander + small jitter; width tapers, then bulb
    const N = 14, L = [], R = [];
    const bend = rand(-0.35, 0.35), freq = rand(1.5, 3);
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const cx = x0 + Math.sin(t * Math.PI * freq) * (w0 * 1.2) * bend + Math.sin(t * 17) * 0.6;
      const cy = y0 + t * len;
      const w = i === 0 ? w0 * 1.4 : w0 * (1 - t * 0.55) * (1 + Math.sin(t * 9) * 0.12);
      L.push([cx - w / 2, cy]); R.push([cx + w / 2, cy]);
    }
    const [ex, ey] = [(L[N][0] + R[N][0]) / 2, L[N][1]];
    const br = w0 * rand(0.9, 1.3);
    let d = `M${L[0][0].toFixed(1)} ${L[0][1].toFixed(1)} `;
    for (let i = 1; i <= N; i++) d += `L${L[i][0].toFixed(1)} ${L[i][1].toFixed(1)} `;
    d += `A${br.toFixed(1)} ${(br * 1.15).toFixed(1)} 0 1 0 ${R[N][0].toFixed(1)} ${R[N][1].toFixed(1)} `;
    for (let i = N - 1; i >= 0; i--) d += `L${R[i][0].toFixed(1)} ${R[i][1].toFixed(1)} `;
    return { d: d + 'Z', ex, ey, br };
  };

  let splat = '', spray = '', drips = '', gloss = '', pool = '';
  if (blood > 0) {
    const k = Math.min(blood, 5);
    const dir = rand(0, Math.PI * 2);
    pool = blob(c, c, 10 + k * 3, 16, 0.2);
    splat += blob(c + rand(-4, 4), c + rand(-4, 4), 15 + k * 5, 20, 0.4);
    for (let i = 0; i < 3 + k * 2; i++) {
      const a = dir + rand(-0.9, 0.9), r = rand(10, 30 + k * 12);
      splat += blob(c + Math.cos(a) * r, c + Math.sin(a) * r, rand(3, 8 + k * 2), 12, 0.45);
    }
    for (let i = 0; i < 30 + k * 18; i++) {
      const a = dir + rand(-1.3, 1.3), r = rand(18, 60 + k * 28);
      const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r, s = rand(0.6, 2.2);
      spray += Math.random() < 0.4
        ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}"/>`
        : `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(s * rand(1.6, 3)).toFixed(1)}" ry="${s.toFixed(1)}" transform="rotate(${(a * 180 / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    for (let i = 0; i < Math.min(1 + k, 5); i++) {
      const x = c + rand(-12 - k * 3, 12 + k * 3), y0 = c + rand(2, 12);
      const { d, ex, ey, br } = drip(x, y0, rand(45 + k * 15, 110 + k * 30), rand(2.6, 4.2 + k * 0.6));
      drips += `<g class="drip" style="animation-delay:${(i * 0.45 + rand(0, 0.5)).toFixed(2)}s;animation-duration:${rand(4, 7).toFixed(1)}s"><path d="${d}"/><ellipse cx="${(ex - br * 0.3).toFixed(1)}" cy="${(ey + br * 0.2).toFixed(1)}" rx="${(br * 0.28).toFixed(1)}" ry="${(br * 0.45).toFixed(1)}" fill="rgba(255,150,160,.35)"/></g>`;
    }
    gloss = `<ellipse cx="${c - 5 - k}" cy="${c - 7 - k}" rx="${5 + k * 2}" ry="${2.5 + k * 0.8}" fill="rgba(255,140,150,.32)" transform="rotate(-28 ${c - 5 - k} ${c - 7 - k})"/>`;
  }

  const el = document.createElement('div');
  el.className = 'crack';
  el.style.left = `${px}px`; el.style.top = `${py}px`;
  el.innerHTML = `<svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
    <defs>
      <radialGradient id="hole"><stop offset="0" stop-color="#000"/><stop offset=".5" stop-color="#000" stop-opacity=".9"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <radialGradient id="dim"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="1.2"/></filter>
      <filter id="goo" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="${Math.floor(rand(1, 99))}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
      <radialGradient id="bloodfill"><stop offset="0" stop-color="#3a0006"/><stop offset=".55" stop-color="#8b0012"/><stop offset="1" stop-color="#a1121f" stop-opacity=".85"/></radialGradient>
    </defs>
    <circle cx="${c}" cy="${c}" r="${S * 0.45}" fill="url(#dim)"/>
    ${blood > 0 ? `<g filter="url(#goo)">
      <g class="blood" fill="url(#bloodfill)" opacity=".96"><path d="${splat}"/></g>
      <g class="blood" fill="#7a0010" opacity=".92">${spray}</g>
      <g class="blood" fill="#8a0012" opacity=".95">${drips}</g>
      <g class="blood-edge" fill="none" stroke="rgba(35,0,4,.75)" stroke-width="1.1"><path d="${splat}"/></g>
    </g>
    <path d="${pool}" fill="#2a0004" opacity=".9"/>
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
    if (e.target.closest('button, input, a, .xp__bar, .sr__cats, .xp')) return;
    // recoil + flash + shake
    c.classList.add('is-recoil'); setTimeout(() => c.classList.remove('is-recoil'), 120);
    if (!REDUCED) {
      const f = document.createElement('div'); f.className = 'flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 140);
      document.body.classList.remove('is-shake'); void document.body.offsetWidth; document.body.classList.add('is-shake');
    }
    // shattered glass where it landed (page coords so it scrolls with content)
    shots++;
    const h = crackGlass(pageX, pageY, shots >= 2 ? shots - 1 : 0);
    setTimeout(() => h.classList.add('is-fading'), 3200);
    setTimeout(() => h.remove(), 4400);
    // never more than a handful of holes on screen: the oldest go first, so rapid fire can't choke the page
    const holes = document.querySelectorAll('.crack');
    for (let i = 0; i < holes.length - 6; i++) holes[i].remove();
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


/* ─── 360 on phones: animated WebP instead of video (autoplay is unreliable there) ─── */
const TOUCH = window.matchMedia('(hover: none)').matches;
function swapToImage(v) {
  if (!v || v.dataset.swapped || v.classList.contains('k360')) return;
  const img = document.createElement('img');
  img.src = 'assets/loot-360-alpha.webp'; img.alt = ''; img.className = v.className;
  img.dataset.swapped = '1';
  v.replaceWith(img);
}
function swapVideos(root = document) {
  root.querySelectorAll('video[src$="loot-360.mp4"]').forEach(swapToImage);
}

/* ─── Videos: keep spinning after tab switches ─── */
function initVideos() {
  if (TOUCH) { swapVideos(); return; }
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
  // if a browser still refuses to play, fall back to the animated image
  setTimeout(() => vids.forEach((v) => { if (v.paused && /loot-360\.mp4$/.test(v.currentSrc || v.src)) swapToImage(v); }), 2500);
}

/* ─── Ambient tears ─── */
function initAmbientTears() {
  if (REDUCED) return;
  const schedule = () => setTimeout(() => { tearFlash(); schedule(); }, rand(30000, 70000));
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
  bar.addEventListener('pointerdown', (e) => {
    if (small() || e.target.closest('button')) return;
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

/* ─── Colourways: the house changes colour on its own, every so often ─── */
function initVariants() {
  const ORDER = ['original', 'platinum', 'led', 'red', 'chrome'];
  let i = 0;
  document.body.dataset.variant = ORDER[0];
  if (REDUCED) return;
  const step = () => {
    i = (i + 1) % ORDER.length;
    document.body.dataset.variant = ORDER[i];
    setTimeout(step, 14000 + Math.random() * 10000);
  };
  setTimeout(step, 12000);
}

/* ─── Small screens: show the whole desktop market, scaled to the phone ─── */
function initMarketScale() {
  const m = document.getElementById('market');
  if (!m) return;
  const wrap = document.createElement('div'); wrap.className = 'market-wrap';
  m.parentNode.insertBefore(wrap, m); wrap.appendChild(m);
  const apply = () => {
    const small = innerWidth < 900;
    document.body.classList.toggle('market-scaled', small);
    if (!small) { m.style.transform = ''; wrap.style.height = ''; return; }
    const avail = m.parentNode.clientWidth || innerWidth;
    const s = avail / 1200;
    m.style.transform = `scale(${s})`;
    wrap.style.height = `${m.offsetHeight * s}px`;
  };
  apply();
  addEventListener('resize', apply, { passive: true });
  document.addEventListener('loot:stats', () => setTimeout(apply, 50));
  [300, 1200, 3000].forEach((t) => setTimeout(apply, t));
}

/* ─── LOOT.exe: minimize to a pill; wake on tap; react to what you look at ─── */
function initXPPresence() {
  const xp = $('xp'), bar = $('xpBar'), btn = $('xpMinBtn');
  if (!xp || !bar) return;
  const small = () => window.matchMedia('(max-width: 900px)').matches;
  // only those who ACCEPT get to minimize. DENY and you live with it.
  const setMin = (v) => {
    if (v && (!XP.accepted || document.body.classList.contains('is-gated'))) { flashMsg(XP.denies ? 'YOU DENIED. NO MINIMIZE FOR YOU.' : 'ACCEPT FIRST.', 'is-error'); return; }
    xp.classList.toggle('is-min', v); xp.classList.remove('is-collapsed');
  };
  btn?.addEventListener('click', (e) => { e.stopPropagation(); setMin(true); });
  bar.addEventListener('click', (e) => { if (e.target.closest('button')) return; if (xp.classList.contains('is-min')) setMin(false); else if (small()) setMin(true); });
  // phones start as a pill (if allowed); desktop folds itself after a while without attention (if allowed)
  const quiet = () => { if (XP.accepted && !document.body.classList.contains('is-gated')) { xp.classList.add('is-min'); xp.classList.remove('is-collapsed'); } };
  if (small()) setTimeout(quiet, 4000);
  else {
    let idle = null;
    const arm = () => { clearTimeout(idle); idle = setTimeout(() => { if (!xp.matches(':hover')) quiet(); }, 25000); };
    xp.addEventListener('mouseenter', () => clearTimeout(idle));
    xp.addEventListener('mouseleave', arm);
    arm();
  }
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
  document.body.classList.add('is-gated'); // every visit starts at the door
  initDrag();
  initXPPresence();
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

/* Keyed 360 logos (paper theme) */
keyVideos();
