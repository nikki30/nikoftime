// Fetches a few of today's English-language headlines about each country from Google News
// and writes roamin-empire/news.json. Runs in the daily Pages build.
import { writeFile } from "node:fs/promises";
import { WORLD } from "../roamin-empire/world.js";

const OUT = new URL("../roamin-empire/news.json", import.meta.url);
const out = { updated: new Date().toISOString(), news: {} };
const unxml = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const tag = (item, t) => { const m = item.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)); return m ? unxml(m[1]) : ""; };

async function one(w) {
  const q = encodeURIComponent(`"${w.name}" when:3d`);
  const r = await fetch(`https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`, { signal: AbortSignal.timeout(10000), headers: { "user-agent": "Mozilla/5.0 (nikoftime daily build)" } });
  if (!r.ok) throw new Error(String(r.status));
  const xml = await r.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]).slice(0, 4).map((it) => {
    const source = tag(it, "source");
    let title = tag(it, "title");
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    return { title, source, url: tag(it, "link"), date: new Date(tag(it, "pubDate")).toISOString() };
  }).filter((x) => x.title && x.url);
  if (items.length) out.news[w.cc] = items;
}

let saving = Promise.resolve();
const save = () => (saving = saving.then(() => writeFile(OUT, JSON.stringify(out))));
const queue = [...WORLD];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) { const w = queue.shift(); try { await one(w); } catch (e) { console.log(w.cc, "failed:", e.message); } await save(); await new Promise((r) => setTimeout(r, 250)); }
}));
await save();
console.log(`news for ${Object.keys(out.news).length}/${WORLD.length} countries`);
