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
      const results = q ? searchEntries(entries, q, cat) : [];
      const total   = results.length;
      const start   = (page - 1) * perPage;

      return json({
        q, cat, page, total, perPage,
        elapsed: ((Date.now() - t0) / 1000).toFixed(2),
        results: results.slice(start, start + perPage),
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
