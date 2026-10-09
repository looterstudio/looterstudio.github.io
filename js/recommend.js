'use strict';
/* LooterStudio® — recommend.js
   The question mark in the corner. Click it and LOOT recommends one thing from the house,
   picked at random (never the same twice in a row). "Another ?" rolls again. */
(() => {
  const PICKS = [
    { tag: 'BRIER', title: 'Let your agent trade.', text: 'Brier is the SocialFi agentic platform. Agents trade in the open, get scored, and capital follows whoever is right.', go: 'brier.world ↗', href: 'https://brier.world', ext: true },
    { tag: 'SKYNET', title: 'Meet Zyzz, unit 001.', text: 'An AI influencer that never skips leg day. Insert a disc.', go: 'skynet →', href: 'skynet/#zyzz' },
    { tag: 'SKYNET', title: 'Order your own AI influencer.', text: 'A name, a niche, a vibe. We build it and we run it.', go: 'order →', href: 'skynet/#order' },
    { tag: 'LOOTCHAN', title: 'Read: The barrier just fell.', text: 'Every time a barrier to knowledge falls, the people who built their identity around it get exposed.', go: 'read · 6 min →', href: 'f/the-barrier-just-fell.html' },
    { tag: 'LOOTCHAN', title: 'Read: The internet is not media.', text: 'It is a different realm entirely. Posting is an act of sorcery.', go: 'read · 2 min →', href: 'f/the-internet-is-not-media.html' },
    { tag: 'LOOTERIO', title: 'Search everything here.', text: 'Our own search engine. Loot first, then the web.', go: 'looterio ↗', href: 'looterio/', ext: true },
    { tag: 'SNOWBALL', title: 'Got a company? Make it bigger.', text: 'The studio, rented out. We scale companies.', go: 'luv ↗', href: 'https://looterstudio.xyz/luv/', ext: true },
    { tag: 'STAT', title: 'Human status competition.', text: 'iOS · Season 0 · Buenos Aires. Be early.', go: 'see stat →', href: '#stat' },
    { tag: 'MARKET', title: 'A cold beer. Good quality.', text: '1 USDC. The best deal in the anonymous market.', go: 'market →', href: '#market' },
  ];

  const q = document.createElement('button');
  q.type = 'button'; q.className = 'qmark'; q.setAttribute('aria-label', 'LOOT recommends something');
  q.innerHTML = '<img src="assets/qmark.webp" alt="">';
  document.body.appendChild(q);

  const win = document.createElement('div');
  win.className = 'rec'; win.setAttribute('role', 'dialog'); win.setAttribute('aria-label', 'LOOT recommends'); win.hidden = true;
  win.innerHTML = `
    <div class="rec__bar"><span>LOOT_RECOMMENDS.exe</span><button type="button" class="rec__x" aria-label="Close">✕</button></div>
    <div class="rec__body">
      <img class="rec__q" src="assets/hand.webp" alt="">
      <div class="rec__txt"><small class="rec__tag"></small><b class="rec__title"></b><p class="rec__text"></p></div>
    </div>
    <div class="rec__actions"><button type="button" class="rec__btn rec__again">Another ?</button><a class="rec__btn rec__go"></a></div>`;
  document.body.appendChild(win);

  const $ = (s) => win.querySelector(s);
  let last = -1;
  const roll = () => {
    let i; do { i = Math.floor(Math.random() * PICKS.length); } while (i === last && PICKS.length > 1);
    last = i;
    const p = PICKS[i];
    $('.rec__tag').textContent = 'LOOT RECOMMENDS · ' + p.tag;
    $('.rec__title').textContent = p.title;
    $('.rec__text').textContent = p.text;
    const go = $('.rec__go');
    go.textContent = p.go; go.href = p.href;
    if (p.ext) { go.target = '_blank'; go.rel = 'noopener'; } else { go.removeAttribute('target'); go.removeAttribute('rel'); }
    win.classList.remove('is-pop'); void win.offsetWidth; win.classList.add('is-pop');
  };
  const open = () => { roll(); win.hidden = false; q.classList.add('is-on'); $('.rec__go').focus({ preventScroll: true }); };
  const close = () => { win.hidden = true; q.classList.remove('is-on'); };

  q.addEventListener('click', () => (win.hidden ? open() : roll()));
  $('.rec__again').addEventListener('click', roll);
  $('.rec__x').addEventListener('click', close);
  $('.rec__go').addEventListener('click', () => { if (!$('.rec__go').target) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !win.hidden) close(); });
  document.addEventListener('pointerdown', (e) => { if (!win.hidden && !win.contains(e.target) && !q.contains(e.target)) close(); });
})();
