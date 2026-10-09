'use strict';
/* LooterStudio® — lootchan.js
   The /loot/ board on the home page, drawn as a 4chan catalog: one card per thread.
   To post a new thread: write its page in f/ (copy one of the existing ones), then add a line
   at the TOP of THREADS. Newest first. `no` is the thread number (also the likes key). */
window.LOOT_THREADS = [
  {
    no: '0003', date: '2026-10-09', min: 5,
    href: 'f/what-loot-believes.html',
    thumb: 'assets/lord-of-the-loot-thumb.jpg',
    subject: 'What Loot Believes',
    teaser: 'Always early, never wrong. The barrier just fell. Just loot it. The eye sees all. Delusional mindset. Legacy. Six things Loot believes, by the Lord of the Loot.',
  },
  {
    no: '0002', date: '2026-10-01', min: 2,
    href: 'f/the-internet-is-not-media.html',
    thumb: 'assets/vibration.jpg',
    subject: 'The Internet is Not Media: It is a Different Realm',
    teaser: 'The internet is not media; it is a different realm entirely. We must start posting from a completely different point of view of the world. The act of posting is basically an act of sorcery.',
  },
  {
    no: '0001', date: '2026-09-09', min: 6,
    href: 'f/the-barrier-just-fell.html',
    thumb: 'assets/idea.jpg',
    subject: 'The barrier just fell',
    teaser: 'Every time in history a barrier to knowledge falls, the people who built their whole identity around that barrier get exposed. This time the barrier falling is the cost of learning itself.',
  },
];

(() => {
  const box = document.getElementById('lootCatalog');
  if (!box) return;
  const T = window.LOOT_THREADS || [];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const day = (iso) => { const d = new Date(iso + 'T12:00:00Z'); return `${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCFullYear()).slice(2)}(${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]})`; };
  document.getElementById('lootCount').textContent = `${T.length} thread${T.length === 1 ? '' : 's'}`;
  box.innerHTML = T.map((t, i) => `
    <a class="cat__t" href="${esc(t.href)}">
      <span class="cat__img"><img src="${esc(t.thumb)}" alt="" loading="lazy">${i === 0 ? '<i class="cat__new">NEW</i>' : ''}</span>
      <span class="cat__meta">No.${esc(t.no)} · ${day(t.date)} · <b class="cat__likes" data-likes="${esc(t.no)}">♥ 0</b></span>
      <span class="cat__teaser"><b>${esc(t.subject)}:</b> ${esc(t.teaser)}</span>
      <span class="cat__more">[ Read · ${t.min} min ]</span>
    </a>`).join('');
})();
