'use strict';

/* ═══════════════════════════════════════════════════════════════
   LooterStudio® — globe.js
   The planet, DVD mode: a wireframe globe with real countries
   (world-atlas 110m) that drifts behind the page and bounces
   off the viewport edges. It never stops rotating.
   ═══════════════════════════════════════════════════════════════ */

(() => {
  const dvd = document.getElementById('dvd');
  const canvas = document.getElementById('globe');
  if (!dvd || !canvas || typeof d3 === 'undefined') return;

  const RED = '#ff2a3c';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');

  const NODES = [
    ['LOOT · BUENOS AIRES', -58.38, -34.60],
    ['LOOT · FRANKFURT', 8.68, 50.11],
    ['BRIER · POLYGON', -73.99, 40.73],
    ['STAT · CUPERTINO', -122.03, 37.32],
    ['LOOT · PLANET LABS', -122.42, 37.77],
    ['LOOT · SYNSPECTIVE', 139.69, 35.69],
    ['LOOT · CAPELLA SPACE', -0.13, 51.51],
    ['LOOT · ICEYE', 24.94, 60.17],
    ['LOOT · MAXAR', -104.99, 39.74],
    ['LOOT · SINGAPORE', 103.82, 1.35],
    ['LOOT · US SPACE FORCE', -77.04, 38.91],
    ['LOOT · AIRBUS DS', 11.58, 48.14],
    ['LOOT · SA', 28.05, -26.20],
    ['LOOT · ESPAÑOL', -3.70, 40.42],
    ['LOOT · SYDNEY', 151.21, -33.87],
    ['LOOT · MUMBAI', 72.88, 19.08],
    ['LOOT · SEOUL', 126.98, 37.57],
  ];

  const SATS = Array.from({ length: 90 }, () => ({
    incl: (Math.random() * 160 - 80) * Math.PI / 180,
    phase: Math.random() * Math.PI * 2,
    speed: (0.15 + Math.random() * 0.25) * (Math.random() < 0.5 ? 1 : -1),
    alt: 1.06 + Math.random() * 0.1,
    node: Math.random() * Math.PI * 2,
  }));

  const projection = d3.geoOrthographic().clipAngle(90);
  const path = d3.geoPath(projection, ctx);
  const graticule = d3.geoGraticule10();
  const sphere = { type: 'Sphere' };
  let land = null, borders = null;
  let W = 0, H = 0, R = 0, dpr = 1;
  let rot = [-60, -20];
  let t = 0, glow = 0;

  /* DVD position */
  let x = innerWidth * 0.6, y = innerHeight * 0.55, vx = 0.9, vy = 0.7;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = dvd.clientWidth; H = dvd.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    R = Math.min(W, H) * 0.44;
    projection.translate([W / 2, H / 2]).scale(R);
    x = Math.min(x, innerWidth - W); y = Math.min(y, innerHeight - H);
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    projection.rotate(rot);

    const g = ctx.createRadialGradient(W / 2, H / 2, R * 0.85, W / 2, H / 2, R * 1.12);
    g.addColorStop(0, `rgba(255,42,60,${0.12 + glow * 0.3})`); g.addColorStop(1, 'rgba(255,42,60,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    ctx.beginPath(); path(sphere);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = `rgba(255,42,60,${0.8 + glow * 0.2})`; ctx.stroke();

    ctx.beginPath(); path(graticule);
    ctx.lineWidth = 0.4; ctx.strokeStyle = 'rgba(255,42,60,0.18)'; ctx.stroke();

    if (land) {
      ctx.beginPath(); path(land);
      ctx.fillStyle = 'rgba(255,42,60,0.08)'; ctx.fill();
      ctx.lineWidth = 0.9; ctx.strokeStyle = RED;
      ctx.shadowColor = RED; ctx.shadowBlur = 4 + glow * 10; ctx.stroke(); ctx.shadowBlur = 0;
    }
    if (borders) {
      ctx.beginPath(); path(borders);
      ctx.lineWidth = 0.5; ctx.strokeStyle = 'rgba(255,42,60,0.5)'; ctx.stroke();
    }

    const cx = W / 2, cy = H / 2;
    SATS.forEach((s) => {
      const a = s.phase + t * s.speed * 0.02;
      let sx = Math.cos(a), sy = Math.sin(a) * Math.cos(s.incl), sz = Math.sin(a) * Math.sin(s.incl);
      const cn = Math.cos(s.node + t * 0.0004), sn = Math.sin(s.node + t * 0.0004);
      [sx, sz] = [sx * cn - sz * sn, sx * sn + sz * cn];
      const front = sz > -0.15;
      const px = cx + sx * R * s.alt, py = cy + sy * R * s.alt;
      if (!front && Math.hypot(px - cx, py - cy) < R) return;
      ctx.fillStyle = front ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.arc(px, py, front ? 1.3 : 0.8, 0, Math.PI * 2); ctx.fill();
    });

    ctx.font = '7px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    const centre = [-rot[0], -rot[1]];
    NODES.forEach(([label, lon, lat], i) => {
      const d = d3.geoDistance([lon, lat], centre);
      if (d > Math.PI / 2 - 0.05) return;
      const [px, py] = projection([lon, lat]);
      const fade = Math.min(1, (Math.PI / 2 - d) * 2.2);
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.05 + i);
      ctx.strokeStyle = `rgba(255,42,60,${0.6 * fade})`; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(px, py, 2 + pulse * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${fade})`;
      ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.8 * fade})`;
      ctx.fillText(label, px + 5, py);
    });
  }

  function move() {
    if (REDUCED) { x = innerWidth - W - 24; y = innerHeight - H - 24; }
    else {
      x += vx; y += vy;
      let hit = false;
      if (x <= 0) { x = 0; vx = Math.abs(vx); hit = true; }
      if (x + W >= innerWidth) { x = innerWidth - W; vx = -Math.abs(vx); hit = true; }
      if (y <= 0) { y = 0; vy = Math.abs(vy); hit = true; }
      if (y + H >= innerHeight) { y = innerHeight - H; vy = -Math.abs(vy); hit = true; }
      if (hit) { glow = 1; dvd.classList.add('is-bounce'); }
      glow *= 0.94; if (glow < 0.02) { glow = 0; dvd.classList.remove('is-bounce'); }
    }
    dvd.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  function frame() {
    if (!REDUCED) rot[0] += 0.12;
    t++;
    move();
    draw();
    requestAnimationFrame(frame);
  }

  async function loadWorld() {
    try {
      const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      const topo = await res.json();
      land = topojson.feature(topo, topo.objects.countries);
      borders = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b);
    } catch (_) { /* graticule only */ }
  }

  addEventListener('resize', resize, { passive: true });
  resize();
  loadWorld();
  frame();

  /* expose for verification */
  window.__dvd = { get x() { return x; }, get vx() { return vx; }, set x(v) { x = v; } };
})();
