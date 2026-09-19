/* LOOTERIO mini: the search page's logo, drawn on the landing */
(function(){
/* ── LOOTERIO LOGO CANVAS ── */
var LETTERS = [
  {ch:'L',c:'#3d6fc9'},
  {ch:'O',c:'#cc3333'},
  {ch:'O',c:'#dd8800'},
  {ch:'T',c:'#3d6fc9'},
  {ch:'E',c:'#2a7a2a'},
  {ch:'R',c:'#cc3333'},
  {ch:'I',c:'#3d6fc9'},
  {ch:'O',c:'#dd8800'}
];

function drawLogo(canvas, fontSize) {
  var dpr = window.devicePixelRatio || 1;
  var font = 'bold ' + fontSize + 'px "Lobster Two", Georgia, serif';
  // measure total width first
  var tmp = document.createElement('canvas').getContext('2d');
  tmp.font = font;
  var letters = LETTERS;
  var gap = fontSize * 0.04;
  var totalW = 0;
  var widths = letters.map(function(l){
    var w = tmp.measureText(l.ch).width;
    totalW += w + gap;
    return w;
  });
  totalW -= gap;
  var padX = fontSize * 0.1, padY = fontSize * 0.18;
  var shadowY = fontSize * 0.06, shadowBlur = fontSize * 0.05;
  var cw = totalW + padX * 2 + shadowBlur * 2;
  var ch = fontSize + padY * 2 + shadowY + shadowBlur;
  canvas.width = Math.ceil(cw * dpr);
  canvas.height = Math.ceil(ch * dpr);
  canvas.style.width = Math.ceil(cw) + 'px';
  canvas.style.height = Math.ceil(ch) + 'px';
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cw, ch);
  ctx.font = font;
  ctx.textBaseline = 'alphabetic';
  var x = padX;
  var y = padY + fontSize * 0.82;
  letters.forEach(function(l, i) {
    var w = widths[i];
    var depth = Math.round(fontSize * 0.055);
    // 1. outer drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.38)';
    ctx.shadowBlur = fontSize * 0.07;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = fontSize * 0.08;
    ctx.fillStyle = l.c;
    ctx.fillText(l.ch, x, y);
    ctx.restore();
    // 2. extrusion layers (3D depth) — dark offset copies going down
    ctx.save();
    for (var s = depth; s >= 1; s--) {
      var t = s / depth;
      ctx.fillStyle = 'rgba(' +
        Math.round(parseInt(l.c.slice(1,3),16) * (1 - t * 0.55)) + ',' +
        Math.round(parseInt(l.c.slice(3,5),16) * (1 - t * 0.55)) + ',' +
        Math.round(parseInt(l.c.slice(5,7),16) * (1 - t * 0.55)) + ',1)';
      ctx.fillText(l.ch, x, y + s);
    }
    ctx.restore();
    // 3. top face with gradient (highlight → base → shadow)
    ctx.save();
    var grad = ctx.createLinearGradient(x, y - fontSize * 0.88, x, y + fontSize * 0.08);
    grad.addColorStop(0,   lighten(l.c, 55));
    grad.addColorStop(0.3, lighten(l.c, 20));
    grad.addColorStop(0.65, l.c);
    grad.addColorStop(1,   darken(l.c, 30));
    ctx.fillStyle = grad;
    ctx.fillText(l.ch, x, y);
    ctx.restore();
    x += w + gap;
  });
}

function lighten(hex, pct) {
  var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  r=Math.min(255,r+pct*2); g=Math.min(255,g+pct*2); b=Math.min(255,b+pct*2);
  return 'rgb('+r+','+g+','+b+')';
}
function darken(hex, pct) {
  var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  r=Math.max(0,r-pct*2); g=Math.max(0,g-pct*2); b=Math.max(0,b-pct*2);
  return 'rgb('+r+','+g+','+b+')';
}

  var c=document.getElementById('ltr-logo'); if(!c) return;
  var go=function(){ drawLogo(c, 36); };
  if (document.fonts && document.fonts.load) document.fonts.load('bold 30px "Lobster Two"').then(go, go); else go();
})();
