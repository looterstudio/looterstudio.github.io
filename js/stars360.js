'use strict';
/* LooterStudio® — stars360.js
   The 360 logo, drawn instead of keyed: the six stars of the mark in their arc, turning on the
   vertical axis like loot-360.mp4, each one a frame of the pre-rendered 3D star (star-sprite.png).
   Clean edges on paper, no black fringe. Replaces every .k360 / .k360-out on the page. */
(() => {
  const BASE = (window.LOOT_ASSETS || '') + 'assets/star-sway.png?v=2';
  const N = 48, FS = 128;
  // the mark, read off loot-360-poster.jpg (720px frame): x, y, size
  const MARK = [[282, 195, 92], [392, 212, 104], [470, 310, 140], [243, 293, 84], [266, 378, 60], [326, 437, 50]];
  const CX = 356, CY = 316, SPAN = 300;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sprite = new Image();
  sprite.decoding = 'async';
  sprite.src = BASE;

  const slots = [];
  const take = (el) => {
    if (el.dataset.stars) return;
    if (el.tagName === 'CANVAS') { el.dataset.stars = '1'; slots.push({ c: el, ctx: el.getContext('2d'), w: 0 }); return; }
    const c = document.createElement('canvas');
    c.className = (el.className || '').replace('k360-out', 'k360').replace('k360', 'k360-stars');
    c.setAttribute('aria-hidden', 'true');
    c.dataset.stars = '1';
    el.replaceWith(c);
    slots.push({ c, ctx: c.getContext('2d'), w: 0 });
  };
  const scan = () => document.querySelectorAll('canvas.k360-stars, video.k360, img.k360-out, .tile--logo video, .tile--logo img').forEach(take);

  const size = (s) => {
    const r = s.c.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (!w || !h || r.bottom < 0 || r.top > innerHeight) return false;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (s.w !== w || s.h !== h) { s.w = w; s.h = h; s.c.width = w * dpr; s.c.height = h * dpr; s.dpr = dpr; }
    return true;
  };

  const draw = (s, a) => {
    if (!size(s)) return;
    const { ctx, w, h, dpr } = s;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingQuality = 'high';
    const k = Math.min(w, h) / SPAN / 1.25;
    // the mark swings ±69° and back: it never turns side-on, so it never thins out or flips
    const sw = Math.sin(a) * 1.2, ca = Math.cos(sw), sa = Math.sin(sw);
    MARK.map(([x, y, sz]) => {
      const dx = x - CX, X = dx * ca, Z = dx * sa;
      return { X, Y: y - CY, Z, sz };
    }).sort((p, q) => q.Z - p.Z).forEach(({ X, Y, Z, sz }) => {
      const p = 1 / (1 + Z / 900);
      const d = sz * k * p * 1.25;
      // each star leans with the turn but never goes edge-on (that is what made it blink):
      // one solid frame per star, picked from 48, no cross-fade
      const f = Math.round((Math.sin(a) * 0.5 + 0.5) * (N - 1));
      const x = w / 2 + X * k * p - d / 2, y = h / 2 + Y * k * p - d / 2;
      ctx.drawImage(sprite, f * FS, 0, FS, FS, x, y, d, d);
    });
  };

  let t0 = performance.now();
  const loop = (now) => {
    const a = REDUCED ? 0.35 : ((now - t0) / 6000) * Math.PI * 2;
    slots.forEach((s) => { if (s.c.isConnected) draw(s, a); });
    requestAnimationFrame(loop);
  };

  const start = () => { scan(); requestAnimationFrame(loop); };
  sprite.onload = start;
  // main.js swaps the market's logo video later; pick those up too
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  window.stars360 = { scan };
})();
