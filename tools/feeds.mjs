// Fetches the daily feed for Keeping Tabs and writes keeping-tabs/feed.json. Runs in the Pages workflow:
// - news on each topic in each region (Google News RSS)
// - the newest research on each topic from a list of leading universities (OpenAlex)
// - new software engineering papers (arXiv cs.SE), engineering blogs, and the most-discussed Hacker News posts
// Anything that fails keeps yesterday's copy, so one slow source can't empty a section.
import { readFile, writeFile } from "node:fs/promises";
import { TOPICS, REGIONS, UNIVERSITIES, BLOGS, HN_QUERIES } from "../keeping-tabs/topics.js";

const OUT = new URL("../keeping-tabs/feed.json", import.meta.url);
let old = {};
try { old = JSON.parse(await readFile(OUT, "utf8")); }
catch { try { const r = await fetch("https://nikki30.github.io/nikoftime/keeping-tabs/feed.json", { signal: AbortSignal.timeout(15000) }); if (r.ok) old = await r.json(); } catch {} }
const out = { updated: new Date().toISOString(), news: {}, papers: {}, eng: {} };
const save = () => writeFile(OUT, JSON.stringify(out));
const UA = { "user-agent": "Mozilla/5.0 (nikoftime daily build; https://nikki30.github.io/nikoftime/)" };
const get = async (url, as = "json") => { const r = await fetch(url, { signal: AbortSignal.timeout(15000), headers: UA }); if (!r.ok) throw new Error(`${r.status} ${url}`); return as === "json" ? r.json() : r.text(); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DAY = 864e5, isoDay = (t) => new Date(t).toISOString().slice(0, 10);

/* ---------------- RSS / Atom ---------------- */
const unxml = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#8217;|&rsquo;/g, "'").replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"').replace(/&#8211;|&ndash;/g, "–").replace(/&#8212;|&mdash;/g, "—").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ").trim();
const tag = (x, t) => { const m = x.match(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`)); return m ? unxml(m[1]) : ""; };
function parseFeed(xml) {
  const items = [...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/g)].map((m) => m[1]).map((it) => ({
    title: tag(it, "title"), url: tag(it, "link"), date: tag(it, "pubDate") || tag(it, "dc:date"), source: tag(it, "source"), summary: tag(it, "description"),
  }));
  if (items.length) return items;
  return [...xml.matchAll(/<entry[\s>]([\s\S]*?)<\/entry>/g)].map((m) => m[1]).map((it) => ({
    title: tag(it, "title"),
    url: (it.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/) || it.match(/<link[^>]*href="([^"]+)"/) || [])[1] || "",
    date: tag(it, "published") || tag(it, "updated"), summary: tag(it, "summary") || tag(it, "content"),
  }));
}
const clip = (s, n = 240) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, "")}…` : s);
const when = (d) => { const t = new Date(d); return isNaN(t) ? null : t.toISOString(); };

/* ---------------- news ---------------- */
async function news(topic, region) {
  const q = encodeURIComponent(`${topic.q}${region.near ? ` ${region.near}` : ""} when:7d`);
  const [hl, gl] = region.ed;
  const xml = await get(`https://news.google.com/rss/search?q=${q}&hl=${hl}&gl=${gl}&ceid=${gl}:${hl.split("-")[0]}`, "text");
  const seen = new Set();
  return parseFeed(xml).map((it) => {
    let title = it.title;
    if (it.source && title.endsWith(` - ${it.source}`)) title = title.slice(0, -(it.source.length + 3));
    return { title, source: it.source, url: it.url, date: when(it.date) };
  }).filter((x) => x.title && x.url && !seen.has(x.title.toLowerCase()) && seen.add(x.title.toLowerCase())).slice(0, 12);
}
for (const t of TOPICS) {
  out.news[t.id] = {};
  for (const r of REGIONS) {
    try { out.news[t.id][r.id] = await news(t, r); console.log("news", t.id, r.id, out.news[t.id][r.id].length); }
    catch (e) { out.news[t.id][r.id] = old.news?.[t.id]?.[r.id] || []; console.log("news", t.id, r.id, "failed:", e.message); }
    await sleep(400);
  }
}
await save();

/* ---------------- research from leading universities (OpenAlex) ---------------- */
const OA = "https://api.openalex.org";
const unis = new Map(); // OpenAlex id -> short name
for (const name of UNIVERSITIES) {
  try {
    const r = await get(`${OA}/institutions?search=${encodeURIComponent(name)}&per_page=1&select=id,display_name`);
    const hit = r.results?.[0]; if (hit) unis.set(hit.id.split("/").pop(), hit.display_name);
  } catch (e) { console.log("university", name, "failed:", e.message); }
  await sleep(120);
}
console.log("universities found:", unis.size);
const abstract = (inv) => {
  if (!inv) return "";
  const words = []; for (const [w, ps] of Object.entries(inv)) for (const p of ps) words[p] = w;
  return clip(words.join(" ").replace(/\s+/g, " ").trim(), 320);
};
async function papers(search) {
  const since = isoDay(Date.now() - 120 * DAY), today = isoDay(Date.now());
  const filter = `from_publication_date:${since},to_publication_date:${today},authorships.institutions.lineage:${[...unis.keys()].join("|")},type:article|preprint|book-chapter|review`;
  const r = await get(`${OA}/works?search=${encodeURIComponent(search)}&filter=${filter}&sort=publication_date:desc&per_page=40&select=id,title,publication_date,doi,primary_location,authorships,abstract_inverted_index,open_access`);
  return (r.results || []).filter((w) => w.title).map((w) => {
    const from = [...new Set(w.authorships.flatMap((a) => a.institutions.map((i) => i.id?.split("/").pop())).filter((id) => unis.has(id)).map((id) => unis.get(id)))];
    return {
      title: unxml(w.title), date: w.publication_date, url: w.doi || w.primary_location?.landing_page_url || w.id,
      free: w.open_access?.oa_url || null, venue: w.primary_location?.source?.display_name || "",
      authors: w.authorships.slice(0, 3).map((a) => a.author.display_name).concat(w.authorships.length > 3 ? ["et al."] : []).join(", "),
      unis: from, abstract: abstract(w.abstract_inverted_index),
    };
  }).filter((p) => p.unis.length).slice(0, 30);
}
if (unis.size) {
  for (const t of TOPICS) {
    try { out.papers[t.id] = await papers(t.research); console.log("papers", t.id, out.papers[t.id].length); }
    catch (e) { out.papers[t.id] = old.papers?.[t.id] || []; console.log("papers", t.id, "failed:", e.message); }
  }
} else for (const t of TOPICS) out.papers[t.id] = old.papers?.[t.id] || [];
// Saved so the app can search research live, from the same universities.
out.universities = unis.size ? Object.fromEntries(unis) : old.universities || {};
await save();

/* ---------------- engineering ---------------- */
// New papers in software engineering on arXiv.
try {
  const xml = await get("https://export.arxiv.org/api/query?search_query=cat:cs.SE&sortBy=submittedDate&sortOrder=descending&max_results=30", "text");
  out.eng.papers = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]).map((e) => ({
    title: tag(e, "title"), date: when(tag(e, "published")), url: tag(e, "id"),
    authors: [...e.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((a) => a[1].trim()).slice(0, 3).join(", "),
    abstract: clip(tag(e, "summary"), 320),
  })).filter((p) => p.title);
  console.log("arxiv", out.eng.papers.length);
} catch (e) { out.eng.papers = old.eng?.papers || []; console.log("arxiv failed:", e.message); }

// The latest posts from each blog (last 90 days), newest first.
const posts = [];
for (const b of BLOGS) {
  try {
    const items = parseFeed(await get(b.url, "text")).map((it) => ({ title: it.title, url: it.url, date: when(it.date), source: b.name, kind: b.kind, summary: clip(it.summary, 200) }))
      .filter((p) => p.title && p.url && p.date && Date.now() - new Date(p.date) < 90 * DAY).slice(0, 4);
    posts.push(...items); console.log("blog", b.name, items.length);
  } catch (e) { posts.push(...(old.eng?.blogs || []).filter((p) => p.source === b.name)); console.log("blog", b.name, "failed:", e.message); }
}
out.eng.blogs = posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50);

// The most-discussed Hacker News posts of the last two weeks on growing as an engineer.
try {
  const since = Math.floor((Date.now() - 14 * DAY) / 1000), hits = new Map();
  for (const q of HN_QUERIES) {
    const r = await get(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&numericFilters=created_at_i>${since},points>30&hitsPerPage=10`);
    for (const h of r.hits || []) if (!hits.has(h.objectID)) hits.set(h.objectID, { title: h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, discuss: `https://news.ycombinator.com/item?id=${h.objectID}`, points: h.points, comments: h.num_comments, date: h.created_at, about: q });
    await sleep(150);
  }
  out.eng.hn = [...hits.values()].sort((a, b) => b.points - a.points).slice(0, 25);
  console.log("hn", out.eng.hn.length);
} catch (e) { out.eng.hn = old.eng?.hn || []; console.log("hn failed:", e.message); }
await save();
console.log("done");
