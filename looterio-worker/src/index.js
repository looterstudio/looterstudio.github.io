const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function searchEntries(entries, query, cat) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  return entries
    .filter(item => cat === 'all' || item.cat === cat)
    .map(item => {
      let score = 0;
      const titleLow = item.title.toLowerCase();
      const descLow  = item.desc.toLowerCase();
      const urlLow   = item.url.toLowerCase();
      const tagsStr  = (item.tags || []).join(' ').toLowerCase();
      terms.forEach(t => {
        if (titleLow.startsWith(t))   score += 20;
        if (titleLow.includes(t))     score += 10;
        if (urlLow.includes(t))       score += 7;
        if (tagsStr.includes(t))      score += 6;
        if (descLow.includes(t))      score += 3;
      });
      return { ...item, _score: score };
    })
    .filter(r => r._score > 0)
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...item }) => item);
}

/* ── The web. Google Programmable Search when keys exist; DuckDuckGo's html
   endpoint otherwise. Loot entries always come first. ── */
function decodeEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/<[^>]+>/g, '');
}
async function searchGoogle(env, q, start) {
  const u = new URL('https://www.googleapis.com/customsearch/v1');
  u.searchParams.set('key', env.GOOGLE_CSE_KEY); u.searchParams.set('cx', env.GOOGLE_CSE_CX);
  u.searchParams.set('q', q); u.searchParams.set('num', '10'); u.searchParams.set('start', String(start));
  const r = await fetch(u.toString(), { cf: { cacheTtl: 3600 } });
  if (!r.ok) throw new Error('google ' + r.status);
  const j = await r.json();
  const items = (j.items || []).map((it) => ({
    id: 'web:' + it.link, cat: 'web', title: it.title, url: it.displayLink || it.link.replace(/^https?:\/\//, ''), href: it.link, desc: it.snippet || '', tags: [], source: 'google',
  }));
  return { items, total: Number(j.searchInformation?.totalResults || items.length) };
}
async function searchDuck(q, page) {
  const body = new URLSearchParams({ q, kl: 'wt-wt' });
  if (page > 1) body.set('s', String((page - 1) * 10));
  const r = await fetch('https://html.duckduckgo.com/html/', { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9' } });
  if (!r.ok) throw new Error('ddg ' + r.status);
  const html = await r.text();
  const items = [];
  const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) && items.length < 10) {
    let href = decodeEntities(m[1]);
    const ud = href.match(/[?&]uddg=([^&]+)/); if (ud) href = decodeURIComponent(ud[1]);
    if (!/^https?:/.test(href)) continue;
    items.push({ id: 'web:' + href, cat: 'web', title: decodeEntities(m[2]).trim(), url: href.replace(/^https?:\/\//, '').replace(/\/$/, ''), href, desc: decodeEntities(m[3]).trim(), tags: [], source: 'duckduckgo' });
  }
  return { items, total: items.length ? 1000 : 0 };
}
/* Our own engine: a SearXNG on the LooterStudio server, behind a token. It asks
   Google, Bing, Brave, DuckDuckGo and friends at once and merges the answers. */
async function searchOwn(env, q, page) {
  const u = new URL(env.SEARX_URL + '/search');
  u.searchParams.set('q', q); u.searchParams.set('format', 'json'); u.searchParams.set('pageno', String(page)); u.searchParams.set('language', 'en');
  const r = await fetch(u.toString(), { headers: { 'X-Looterio': env.SEARX_TOKEN }, signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error('searx ' + r.status);
  const j = await r.json();
  const seen = new Set();
  const items = [];
  for (const it of j.results || []) {
    if (!it.url || seen.has(it.url)) continue;
    seen.add(it.url);
    items.push({ id: 'web:' + it.url, cat: 'web', title: it.title || it.url, url: it.url.replace(/^https?:\/\//, '').replace(/\/$/, ''), href: it.url, desc: it.content || '', tags: [], source: 'looterio' });
    if (items.length >= 10) break;
  }
  return { items, total: items.length ? 1000 : 0 };
}
async function searchWeb(env, q, page) {
  if (env.SEARX_URL && env.SEARX_TOKEN) { try { const r = await searchOwn(env, q, page); if (r.items.length) return r; } catch (e) { return { items: [], total: 0, error: 'own: ' + String(e.message || e) }; } }
  if (env.GOOGLE_CSE_KEY && env.GOOGLE_CSE_CX) { try { return await searchGoogle(env, q, (page - 1) * 10 + 1); } catch (e) {} }
  try { return await searchDuck(q, page); } catch (e) { return { items: [], total: 0, error: String(e.message || e) }; }
}
async function debugDuck(q) {
  try { const r = await searchDuck(q, 1); return { ok: true, n: r.items.length }; } catch (e) { return { ok: false, error: String(e.message || e) }; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    /* ── GET /search?q=&cat=&page= ── */
    if (url.pathname === '/search') {
      const q       = (url.searchParams.get('q') || '').trim();
      const cat     = url.searchParams.get('cat') || 'all';
      const page    = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
      const perPage = 8;
      const t0      = Date.now();

      const raw     = await env.LOOTERIO_IDX.get('entries');
      const entries = raw ? JSON.parse(raw) : [];
      const loot    = q ? searchEntries(entries, q, cat) : [];
      // Loot entries first (only on page 1), then the web. The web only joins
      // on the "all"/"web" tabs; the other tabs are our own index.
      const wantWeb = q && (cat === 'all' || cat === 'web');
      const web     = wantWeb ? await searchWeb(env, q, page) : { items: [], total: 0 };
      const results = page === 1 ? [...loot, ...web.items] : web.items;
      const total   = loot.length + (web.total || 0);

      return json({
        q, cat, page, total, perPage: results.length || perPage,
        elapsed: ((Date.now() - t0) / 1000).toFixed(2),
        source: web.items.length ? web.items[0].source : 'loot',
        results,
      });
    }

    /* ── POST /admin/push  (add / remove / replace) ── */
    if (url.pathname === '/admin/push' && request.method === 'POST') {
      if (request.headers.get('Authorization') !== `Bearer ${env.LOOTERIO_SECRET}`) {
        return json({ error: 'Unauthorized' }, 401);
      }
      const body    = await request.json();
      const raw     = await env.LOOTERIO_IDX.get('entries');
      let entries   = raw ? JSON.parse(raw) : [];

      if (body.entries) {
        // full replace
        entries = body.entries;
      } else if (body.add) {
        // upsert by id
        body.add.forEach(e => {
          const idx = entries.findIndex(x => x.id === e.id);
          if (idx >= 0) entries[idx] = e; else entries.push(e);
        });
      } else if (body.remove) {
        // remove by id array
        const ids = new Set(body.remove);
        entries = entries.filter(e => !ids.has(e.id));
      }

      await env.LOOTERIO_IDX.put('entries', JSON.stringify(entries));
      return json({ ok: true, total: entries.length });
    }

    /* ── GET /admin/entries  (read all) ── */
    if (url.pathname === '/admin/entries') {
      if (request.headers.get('Authorization') !== `Bearer ${env.LOOTERIO_SECRET}`) {
        return json({ error: 'Unauthorized' }, 401);
      }
      const raw = await env.LOOTERIO_IDX.get('entries');
      return new Response(raw || '[]', {
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    return new Response('LOOTERIO Search API v1', { headers: CORS });
  },
};
