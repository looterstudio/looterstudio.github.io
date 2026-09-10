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

const SYS = [
  'SYS.OP.OK', 'NET.LATENCY: 14MS', 'CLR: L5', 'SEC: ALPHA', 'VOLATILITY: HIGH',
  'FUND: ACTIVE', '01001100 01001111 01001111 01010100', '<i class="blk"></i>',
  'REDACTED', 'AESTHETIC: BRUTAL',
];

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ';
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ─── Ticker: manifesto interleaved with system noise ─── */
function initTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  const items = [];
  MANIFESTO.forEach((m, i) => {
    items.push(`<b>${m.replace(/\.$/, '')}</b>`);
    items.push(SYS[i % SYS.length]);
  });
  const half = items.join(' &nbsp;┼&nbsp; ') + ' &nbsp;┼&nbsp; ';
  track.innerHTML = half + half; // duplicated so translateX(-50%) loops seamlessly
}

/* ─── Tear: full-screen glitch flash ─── */
const tear = document.getElementById('tear');
function tearFlash() {
  if (!tear || REDUCED) return;
  tear.classList.remove('on');
  void tear.offsetWidth;
  tear.classList.add('on');
}

/* ─── LOOT.exe: scramble-decode each phrase, glitch the window ─── */
function initXP() {
  const xp = document.getElementById('xp');
  const msg = document.getElementById('xpMsg');
  if (!xp || !msg) return;

  let idx = 0;
  let scrambleTimer = null;

  const setText = (t) => { msg.textContent = t; msg.dataset.text = t; };

  const scrambleTo = (target) => {
    clearInterval(scrambleTimer);
    if (REDUCED) { setText(target); return; }
    const frames = 9;
    let f = 0;
    scrambleTimer = setInterval(() => {
      f++;
      const settled = Math.floor((f / frames) * target.length);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        const ch = target[i];
        out += i < settled || ch === ' ' ? ch : pick(GLYPHS);
      }
      setText(out);
      if (f >= frames) { clearInterval(scrambleTimer); setText(target); }
    }, 28);
  };

  const next = () => {
    idx = (idx + 1) % MANIFESTO.length;
    scrambleTo(MANIFESTO[idx]);
    xp.classList.remove('glitch');
    void xp.offsetWidth;
    xp.classList.add('glitch');
    if (Math.random() < 0.3) tearFlash();
  };

  // Hard cut every ~1.6s, slightly irregular so it never feels like a metronome.
  const loop = () => { next(); setTimeout(loop, rand(1300, 1900)); };
  setTimeout(loop, 2200);

  const dismiss = () => {
    xp.classList.add('hidden');
    setTimeout(() => { xp.classList.remove('hidden'); tearFlash(); }, rand(8000, 16000));
  };
  ['xpClose', 'xpAccept', 'xpDeny'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', dismiss);
  });
}

/* ─── Random ambient tears ─── */
function initAmbientTears() {
  if (REDUCED) return;
  const schedule = () => setTimeout(() => { tearFlash(); schedule(); }, rand(6000, 14000));
  schedule();
}

/* ─── Headline glitch on hover ─── */
function initHeadline() {
  const h = document.getElementById('headline');
  if (!h || REDUCED) return;
  const original = h.textContent;
  let busy = false;
  h.addEventListener('mouseenter', () => {
    if (busy) return;
    busy = true;
    let f = 0;
    const t = setInterval(() => {
      f++;
      h.textContent = original.split('').map((c, i) =>
        c === ' ' || i < (f / 8) * original.length ? c : pick(GLYPHS)).join('');
      if (f >= 8) { clearInterval(t); h.textContent = original; busy = false; }
    }, 30);
  });
}

/* ─── Cursor ─── */
function initCursor() {
  const c = document.getElementById('cursor');
  if (!c || window.matchMedia('(hover: none)').matches) return;
  let mx = -100, my = -100, cx = -100, cy = -100;
  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  const tick = () => {
    cx += (mx - cx) * 0.25; cy += (my - cy) * 0.25;
    c.style.transform = `translate(${cx - 9}px, ${cy - 9}px)`;
    requestAnimationFrame(tick);
  };
  tick();
}

/* ─── Reveal on scroll ─── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i * 0.06, 0.4)}s`; io.observe(el); });
  // Safety net: never leave content invisible if the observer stalls (hidden tab, odd embeds).
  setTimeout(() => els.forEach((el) => el.classList.add('in')), 2500);
}

/* ─── 360 logo: keep it spinning after tab switches ─── */
function initLogo() {
  const v = document.querySelector('.brand__logo');
  if (!v) return;
  const play = () => v.play().catch(() => {});
  document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
  play();
}

/* ─── HUD: depth, coords, clock ─── */
function initHUD() {
  const depth = document.getElementById('hudDepth');
  const coords = document.getElementById('hudCoords');
  const clock = document.getElementById('hudClock');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    if (depth) depth.textContent = `DEPTH: ${pct.toFixed(1)}%`;
    if (coords) coords.textContent = `LAT ${(40.712 + pct * 0.01).toFixed(3)} · LON ${(-74.006 + pct * 0.005).toFixed(3)}`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (clock) {
    const p = (n) => String(n).padStart(2, '0');
    const t = () => { const d = new Date(); clock.textContent = `UTC ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`; };
    t(); setInterval(t, 1000);
  }
}

/* ─── Parallax reticle ─── */
function initReticle() {
  const r = document.getElementById('reticle');
  if (!r || REDUCED) return;
  addEventListener('mousemove', (e) => {
    const dx = (e.clientX / innerWidth - 0.5) * 30;
    const dy = (e.clientY / innerHeight - 0.5) * 30;
    r.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initTicker();
  initXP();
  initAmbientTears();
  initHeadline();
  initCursor();
  initReveal();
  initHUD();
  initReticle();
  initLogo();
});
