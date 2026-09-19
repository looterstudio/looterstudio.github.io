#!/usr/bin/env node
/**
 * LOOTERIO — push entries to the search index
 *
 * Usage:
 *   node scripts/push.js seed          → replace full index with data/entries.json
 *   node scripts/push.js add  <file>   → upsert entries from a JSON file
 *   node scripts/push.js remove <id>   → remove entry by id
 *   node scripts/push.js list          → list all indexed entries
 *
 * Env vars required:
 *   LOOTERIO_WORKER_URL   e.g. https://looterio-search.looterstudio.workers.dev
 *   LOOTERIO_SECRET       your secret token
 */

const fs  = require('fs');
const path = require('path');

const BASE   = process.env.LOOTERIO_WORKER_URL || 'https://looterio-search.looterstudio.workers.dev';
const SECRET = process.env.LOOTERIO_SECRET;

if (!SECRET) {
  console.error('Missing LOOTERIO_SECRET env var');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SECRET}`,
};

async function req(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: body ? 'POST' : 'GET',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

const [,, cmd, arg] = process.argv;

(async () => {
  if (cmd === 'seed') {
    const entries = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/entries.json'), 'utf8'));
    const r = await req('/admin/push', { entries });
    console.log(`Seeded ${r.total} entries`);

  } else if (cmd === 'add') {
    if (!arg) { console.error('Usage: push.js add <file.json>'); process.exit(1); }
    const add = JSON.parse(fs.readFileSync(arg, 'utf8'));
    const entries = Array.isArray(add) ? add : [add];
    const r = await req('/admin/push', { add: entries });
    console.log(`Index now has ${r.total} entries`);

  } else if (cmd === 'remove') {
    if (!arg) { console.error('Usage: push.js remove <id>'); process.exit(1); }
    const r = await req('/admin/push', { remove: [arg] });
    console.log(`Removed. Index now has ${r.total} entries`);

  } else if (cmd === 'list') {
    const entries = await req('/admin/entries');
    entries.forEach(e => console.log(`[${e.cat}] ${e.id} — ${e.title}`));
    console.log(`\nTotal: ${entries.length}`);

  } else {
    console.log('Commands: seed | add <file> | remove <id> | list');
  }
})();
