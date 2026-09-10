'use strict';

/* ═══════════════════════════════════════════════════════════════
   LooterStudio® — globe.js
   LOOT SMART SYSTEM: orthographic wireframe globe, real countries
   (world-atlas 110m), LEO satellites, labelled network nodes.
   ═══════════════════════════════════════════════════════════════ */

(() => {
  const canvas = document.getElementById('globe');
  if (!canvas || typeof d3 === 'undefined') return;

  const RED = '#ff2a3c';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  const stage = canvas.parentElement;
  const statusEl = document.getElementById('smartStatus');
  const satsEl = document.getElementById('smartSats');
  const nodeEl = document.getElementById('smartNode');

  /* Network nodes: [label, lon, lat] */
  const NODES = [
    ['LOOT · BUENOS AIRES', -58.38, -34.60],
    ['LOOT · FRANKFURT', 8.68, 50.11],
    ['BRIER · POLYGON', -73.99, 40.73],
    ['STAT · CUPERTINO', -122.03, 37.32],
    ['LOOT · PLANET LABS', -122.42, 37.77],
    ['LOOT · SYNSPECTIVE', 139.69, 35.69],
    ['BRIER · POLYMARKET', -74.01, 40.71],
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

  const SATS = Array.from({ length: 140 }, (_, i) => ({
    incl: (Math.random() * 160 - 80) * Math.PI / 180,
    phase: Math.random() * Math.PI * 2,
    speed: (0.15 + Math.random() * 0.25) * (Math.random() < 0.5 ? 1 : -1),
    alt: 1.06 + Math.random() * 0.12,
    node: Math.random() * Math.PI * 2,
  }));

  const projection = d3.geoOrthographic().clipAngle(90);
  const path = d3.geoPath(projection, ctx);
  const graticule = d3.geoGraticule10();
  const sphere = { type: 'Sphere' };
  let land = null, borders = null;
  let W = 0, H = 0, R = 0, dpr = 1;
  let rot = [-60, -20];
  let drag = null, vx = 0.06; // deg per frame
  let t = 0;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = stage.clientWidth; H = stage.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    R = Math.min(W, H) * 0.40;
    projection.translate([W / 2, H / 2]).scale(R);
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    projection.rotate(rot);

    // glow
    const g = ctx.createRadialGradient(W / 2, H / 2, R * 0.9, W / 2, H / 2, R * 1.25);
    g.addColorStop(0, 'rgba(255,42,60,0.16)'); g.addColorStop(1, 'rgba(255,42,60,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // sphere
    ctx.beginPath(); path(sphere);
    ctx.fillStyle = 'rgba(8,0,2,0.85)'; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,42,60,0.9)'; ctx.stroke();

    // graticule
    ctx.beginPath(); path(graticule);
    ctx.lineWidth = 0.5; ctx.strokeStyle = 'rgba(255,42,60,0.22)'; ctx.stroke();

    // countries
    if (land) {
      ctx.beginPath(); path(land);
      ctx.fillStyle = 'rgba(255,42,60,0.08)'; ctx.fill();
      ctx.lineWidth = 1.1; ctx.strokeStyle = RED;
      ctx.shadowColor = RED; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;
    }
    if (borders) {
      ctx.beginPath(); path(borders);
      ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,42,60,0.55)'; ctx.stroke();
    }

    // satellites (LEO shells)
    const cx = W / 2, cy = H / 2;
    let visible = 0;
    SATS.forEach((s) => {
      const a = s.phase + t * s.speed * 0.02;
      // orbit in 3D: circle in plane inclined by s.incl, rotated by s.node
      let x = Math.cos(a), y = Math.sin(a) * Math.cos(s.incl), z = Math.sin(a) * Math.sin(s.incl);
      const cn = Math.cos(s.node + t * 0.0004), sn = Math.sin(s.node + t * 0.0004);
      [x, z] = [x * cn - z * sn, x * sn + z * cn];
      const front = z > -0.15;
      const px = cx + x * R * s.alt, py = cy + y * R * s.alt;
      const dist = Math.hypot(px - cx, py - cy);
      if (!front && dist < R) return;
      visible++;
      ctx.fillStyle = front ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(px, py, front ? 1.6 : 1, 0, Math.PI * 2); ctx.fill();
    });
    if (satsEl) satsEl.textContent = visible;

    // nodes + labels
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    const centre = [-rot[0], -rot[1]];
    NODES.forEach(([label, lon, lat], i) => {
      const d = d3.geoDistance([lon, lat], centre);
      if (d > Math.PI / 2 - 0.05) return;
      const [px, py] = projection([lon, lat]);
      const fade = Math.min(1, (Math.PI / 2 - d) * 2.2);
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.05 + i);
      ctx.strokeStyle = `rgba(255,42,60,${0.6 * fade})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, 3 + pulse * 3, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${fade})`;
      ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.85 * fade})`;
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.fillText(label, px + 8, py);
      ctx.shadowBlur = 0;
    });

  }

  function frame() {
    if (!drag && !REDUCED) rot[0] += vx;
    t++;
    draw();
    requestAnimationFrame(frame);
  }

  /* drag to rotate */
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, r: [...rot] }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const k = 0.35;
    rot = [drag.r[0] + (e.clientX - drag.x) * k, Math.max(-80, Math.min(80, drag.r[1] - (e.clientY - drag.y) * k))];
  });
  const end = () => { drag = null; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  /* nearest node readout on hover */
  canvas.addEventListener('pointermove', (e) => {
    if (drag || !nodeEl) return;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = null, bd = 28;
    const centre = [-rot[0], -rot[1]];
    NODES.forEach(([label, lon, lat]) => {
      if (d3.geoDistance([lon, lat], centre) > Math.PI / 2) return;
      const [px, py] = projection([lon, lat]);
      const d = Math.hypot(px - mx, py - my);
      if (d < bd) { bd = d; best = label; }
    });
    nodeEl.textContent = best || '—';
  });

  /* load real countries */
  async function loadWorld() {
    try {
      const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      const topo = await res.json();
      land = topojson.feature(topo, topo.objects.countries);
      borders = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b);
      if (statusEl) statusEl.textContent = `LINK: ONLINE · ${land.features.length} COUNTRIES`;
    } catch (err) {
      if (statusEl) statusEl.textContent = 'LINK: DEGRADED · GRATICULE ONLY';
    }
  }

  addEventListener('resize', resize, { passive: true });
  resize();
  loadWorld();
  frame();
})();
