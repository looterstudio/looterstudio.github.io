/* ═══════════ LOOTERIO ASCII STRIP ═══════════ */
(function () {
  var CHARSET = " .':;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
  var wrap = document.getElementById('ltr');
  var pre  = document.getElementById('ltr-pre');
  if (!wrap || !pre) return;

  if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
    pre.textContent = 'LOOTERIO'; return;
  }

  var FS = 7, CW = FS * 0.601, W = 0, H = 0, cols = 0, rows = 0;
  var oc = document.createElement('canvas'), ox = oc.getContext('2d');
  var t = 0, mx = 0.5, my = 0.5;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX / innerWidth; my = e.clientY / innerHeight;
  }, { passive: true });

  function buildText() {
    var fs = Math.round(H * 0.80);
    ox.font = '900 ' + fs + 'px "Arial Black",Arial,sans-serif';
    var m = ox.measureText('LOOTERIO');
    while (m.width > oc.width * 0.93 && fs > 8) {
      fs -= 2;
      ox.font = '900 ' + fs + 'px "Arial Black",Arial,sans-serif';
      m = ox.measureText('LOOTERIO');
    }
    oc.width  = Math.round(cols * 3);
    oc.height = Math.round(rows * 3);
    ox.clearRect(0, 0, oc.width, oc.height);
    ox.fillStyle = '#ffffff';
    ox.font = '900 ' + fs + 'px "Arial Black",Arial,sans-serif';
    m = ox.measureText('LOOTERIO');
    ox.fillText('LOOTERIO', (oc.width - m.width) / 2, oc.height * 0.5 + fs * 0.36);
  }

  function setSize(w, h) {
    W = w; H = h;
    cols = Math.floor(W / CW);
    rows = Math.floor(H / FS);
    buildText();
  }

  function frame() {
    t += 0.018;
    var wa = 1.4, pw = oc.width, ph = oc.height;
    var id = ox.getImageData(0, 0, pw, ph).data, str = '';
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var px = (x + 0.5) / cols * pw, py = (y + 0.5) / rows * ph;
        var wx = Math.sin(t * 3.8 + py * 0.07 + (mx - 0.5) * 2.2) * wa;
        var wy = Math.cos(t * 2.9 + px * 0.05 + (my - 0.5) * 1.6) * wa * 0.32;
        var sx = Math.max(0, Math.min(pw - 1, Math.round(px + wx))) | 0;
        var sy = Math.max(0, Math.min(ph - 1, Math.round(py + wy))) | 0;
        var i  = (sy * pw + sx) * 4, a = id[i + 3] / 255;
        if (a < 0.04) { str += ' '; continue; }
        var b = (id[i] * 0.3 + id[i + 1] * 0.59 + id[i + 2] * 0.11) / 255;
        str += CHARSET[Math.min(CHARSET.length - 1, Math.floor(a * (0.35 + b * 0.65) * (CHARSET.length - 1)))];
      }
      str += '\n';
    }
    pre.textContent = str;
    requestAnimationFrame(frame);
  }

  var ro = new ResizeObserver(function (entries) {
    var r = entries[0].contentRect;
    if (r.width > 0 && r.height > 0) setSize(r.width, r.height);
  });
  ro.observe(wrap);
  var rect = wrap.getBoundingClientRect();
  setSize(rect.width || 360, rect.height || 88);
  requestAnimationFrame(frame);
})();
