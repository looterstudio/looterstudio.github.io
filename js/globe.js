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

  // Theme: 'screen' (red on black, the original) or 'ink' (drawn on paper: no black disc, lines only).
  const THEME = window.GLOBE_THEME || 'screen';
  const INK = THEME === 'ink' || THEME === 'ink-black';
  const RED = THEME === 'ink-black' ? '#111111' : (INK ? '#b8111d' : '#ff2a3c');
  const rgb = THEME === 'ink-black' ? '17,17,17' : (INK ? '184,17,29' : '255,42,60');
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');

  const NODES = [['LOOTERSTUDIO HQ · BUENOS AIRES', -58.38, -34.60]];
  // Where the signal goes: the server, and the markets it talks to.
  const LINKS = [
    ['HELSINKI · SERVER', 24.94, 60.17], ['NEW YORK', -74.01, 40.71], ['LONDON', -0.13, 51.51],
    ['TOKYO', 139.69, 35.69], ['SINGAPORE', 103.82, 1.35], ['SÃO PAULO', -46.63, -23.55],
  ];
  const HQ = [-58.38, -34.60];
  const interp = LINKS.map(([, lon, lat]) => d3.geoInterpolate(HQ, [lon, lat]));
  // ADAN's heartbeat: if brier.world answers, the halo beats with it; if not, it beats anyway.
  let beat = 0, beatAt = 0;
  const pollBeat = async () => {
    try {
      const r = await fetch('https://brier.world/api/bots/adan', { cache: 'no-store' });
      const j = await r.json();
      const hb = Date.parse(j.lastHeartbeatAt || 0);
      if (Date.now() - hb < 120000) beatAt = performance.now();
    } catch (_) {}
    setTimeout(pollBeat, 60000);
  };
  pollBeat();
  // Sun position for the day/night terminator (solar declination + hour angle, good to a degree).
  const sunLonLat = () => {
    const now = new Date();
    const start = Date.UTC(now.getUTCFullYear(), 0, 0);
    const day = (now - start) / 864e5;
    const decl = -23.44 * Math.cos((2 * Math.PI / 365) * (day + 10));
    const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const lon = (12 - hours) * 15;
    return [lon, decl];
  };

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
  let rot = [58, 34];
  let t = 0, glow = 0;
  const STARS = Array.from({ length: 70 }, () => [Math.random(), Math.random(), Math.random()]);

  /* DVD position */
  let x = innerWidth * 0.6, y = innerHeight * 0.55, vx = 0.9, vy = 0.7;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = dvd.clientWidth; H = dvd.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    R = Math.min(W, H) * 0.36;
    projection.translate([W / 2, H / 2]).scale(R);
    x = Math.min(x, innerWidth - W); y = Math.min(y, innerHeight - H);
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    projection.rotate(rot);

    // starfield (not on paper)
    if (!INK) STARS.forEach(([sx, sy, sz], i) => {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.02 + i));
      ctx.fillStyle = `rgba(255,255,255,${0.25 * tw})`;
      ctx.fillRect(sx * W, sy * H, sz > 0.8 ? 1.5 : 1, sz > 0.8 ? 1.5 : 1);
    });
    // atmosphere; the halo beats with ADAN (see pollBeat), 72 bpm
    const alive = performance.now() - beatAt < 130000;
    const bpm = alive ? 72 : 40;
    beat = Math.pow(Math.max(0, Math.sin(performance.now() / 1000 * bpm / 60 * Math.PI * 2)), 6) * (alive ? 0.5 : 0.2);
    const g = ctx.createRadialGradient(W / 2, H / 2, R * 0.9, W / 2, H / 2, R * 1.18);
    g.addColorStop(0, `rgba(${rgb},${(INK ? 0.04 : 0.22) + glow * (INK ? 0.08 : 0.35) + beat * (INK ? 0.25 : 1)})`); g.addColorStop(0.6, `rgba(${rgb},${(INK ? 0.015 : 0.06) + glow * 0.1})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // equatorial ring (orbit lane)
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.35);
    ctx.beginPath(); ctx.ellipse(0, 0, R * 1.32, R * 0.22, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},0.28)`; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();

    ctx.beginPath(); path(sphere);
    ctx.fillStyle = INK ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)'; ctx.fill();
    ctx.lineWidth = INK ? 1.4 : 1; ctx.strokeStyle = `rgba(${rgb},${0.8 + glow * 0.2})`; ctx.stroke();

    ctx.beginPath(); path(graticule);
    ctx.lineWidth = 0.4; ctx.strokeStyle = `rgba(${rgb},${INK ? 0.22 : 0.18})`; ctx.stroke();

    if (land) {
      ctx.beginPath(); path(land);
      ctx.fillStyle = `rgba(${rgb},${INK ? 0.07 : 0.08})`; ctx.fill();
      ctx.lineWidth = INK ? 1.3 : 1.1; ctx.strokeStyle = RED;
      if (!INK) { ctx.shadowColor = RED; ctx.shadowBlur = 6 + glow * 12; }
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    if (borders) {
      ctx.beginPath(); path(borders);
      ctx.lineWidth = 0.5; ctx.strokeStyle = `rgba(${rgb},0.5)`; ctx.stroke();
    }

    // night side: everything more than 90° from the sun goes dark (a light wash on paper)
    const night = d3.geoCircle().center(sunLonLat().map((v) => -v)).radius(90)();
    ctx.beginPath(); path(night);
    ctx.fillStyle = INK ? `rgba(${rgb},0.07)` : 'rgba(0,0,0,0.42)'; ctx.fill();

    // signal arcs HQ → world, a pulse travelling along each
    const centre0 = [-rot[0], -rot[1]];
    interp.forEach((ip, i) => {
      const arc = { type: 'LineString', coordinates: d3.range(0, 1.0001, 0.04).map(ip) };
      ctx.beginPath(); path(arc);
      ctx.lineWidth = 0.7; ctx.strokeStyle = INK ? `rgba(${rgb},0.35)` : 'rgba(255,255,255,0.22)'; ctx.stroke();
      const ph = ((t * 0.006) + i / LINKS.length) % 1;
      const pt = ip(ph);
      if (d3.geoDistance(pt, centre0) < Math.PI / 2) {
        const [qx, qy] = projection(pt);
        ctx.fillStyle = INK ? RED : 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(qx, qy, 1.3, 0, Math.PI * 2); ctx.fill();
      }
      const end = LINKS[i];
      if (d3.geoDistance([end[1], end[2]], centre0) < Math.PI / 2 - 0.05) {
        const [ex, ey] = projection([end[1], end[2]]);
        ctx.fillStyle = INK ? RED : 'rgba(255,255,255,0.75)';
        ctx.beginPath(); ctx.arc(ex, ey, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.font = '7px "JetBrains Mono", monospace'; ctx.fillStyle = INK ? 'rgba(17,17,17,0.6)' : 'rgba(255,255,255,0.45)';
        ctx.fillText(end[0], ex + 5, ey - 4);
      }
    });

    const cx = W / 2, cy = H / 2;
    SATS.forEach((s) => {
      const a = s.phase + t * s.speed * 0.02;
      let sx = Math.cos(a), sy = Math.sin(a) * Math.cos(s.incl), sz = Math.sin(a) * Math.sin(s.incl);
      const cn = Math.cos(s.node + t * 0.0004), sn = Math.sin(s.node + t * 0.0004);
      [sx, sz] = [sx * cn - sz * sn, sx * sn + sz * cn];
      const front = sz > -0.15;
      const px = cx + sx * R * s.alt, py = cy + sy * R * s.alt;
      if (!front && Math.hypot(px - cx, py - cy) < R) return;
      // short trail
      const a0 = a - 0.09;
      let tx = Math.cos(a0), ty = Math.sin(a0) * Math.cos(s.incl), tz = Math.sin(a0) * Math.sin(s.incl);
      [tx, tz] = [tx * cn - tz * sn, tx * sn + tz * cn];
      ctx.strokeStyle = INK ? (front ? 'rgba(17,17,17,0.35)' : 'rgba(17,17,17,0.1)') : (front ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'); ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(cx + tx * R * s.alt, cy + ty * R * s.alt); ctx.lineTo(px, py); ctx.stroke();
      ctx.fillStyle = INK ? (front ? 'rgba(17,17,17,0.85)' : 'rgba(17,17,17,0.25)') : (front ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)');
      ctx.beginPath(); ctx.arc(px, py, front ? 1.4 : 0.8, 0, Math.PI * 2); ctx.fill();
    });

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    const centre = [-rot[0], -rot[1]];
    NODES.forEach(([label, lon, lat], i) => {
      const d = d3.geoDistance([lon, lat], centre);
      if (d > Math.PI / 2 - 0.05) return;
      const [px, py] = projection([lon, lat]);
      const fade = Math.min(1, (Math.PI / 2 - d) * 2.2);
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.05 + i);
      // HQ: expanding pulse rings + solid marker
      for (let k = 0; k < 3; k++) {
        const ph = ((t * 0.02) + k / 3) % 1;
        ctx.strokeStyle = `rgba(${rgb},${(1 - ph) * 0.8 * fade})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(px, py, 3 + ph * 22, 0, Math.PI * 2); ctx.stroke();
      }
      const ink = INK ? '17,17,17' : '255,255,255';
      ctx.fillStyle = `rgba(${ink},${fade})`;
      ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(${ink},${0.6 * fade})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 14, py - 14); ctx.lineTo(px + 22, py - 14); ctx.stroke();
      ctx.fillStyle = `rgba(${ink},${0.8 * fade})`;
      ctx.fillText(label, px + 25, py - 14);
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
