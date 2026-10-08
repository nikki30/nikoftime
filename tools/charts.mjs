// Fetches each country's top songs on Apple Music, with a 30-second preview of each, and writes
// roamin-empire/charts.json. Runs in the Pages workflow (daily), because Apple's feeds can't be
// read straight from a browser on another site.
import { writeFile } from "node:fs/promises";
import { WORLD } from "../roamin-empire/world.js";

const countries = WORLD.map((w) => w.cc);
const out = { updated: new Date().toISOString(), charts: {} };
const OUT = new URL("../roamin-empire/charts.json", import.meta.url);
const get = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(10000) }); if (!r.ok) throw new Error(`${r.status}`); return r.json(); };

// Apple's current charts feed, then a lookup for the previews.
async function modern(cc) {
  const feed = await get(`https://rss.applemarketingtools.com/api/v2/${cc}/music/most-played/10/songs.json`);
  const songs = (feed.feed?.results || []).map((s, i) => ({ rank: i + 1, id: s.id, name: s.name, artist: s.artistName, art: s.artworkUrl100?.replace("100x100", "300x300"), url: s.url }));
  if (!songs.length) return [];
  const look = await get(`https://itunes.apple.com/lookup?id=${songs.map((s) => s.id).join(",")}&country=${cc}&entity=song`);
  const byId = new Map((look?.results || []).map((r) => [String(r.trackId), r]));
  for (const s of songs) s.preview = byId.get(String(s.id))?.previewUrl;
  return songs.filter((s) => s.preview);
}

// The older iTunes feed, which includes the previews directly.
async function legacy(cc) {
  const feed = await get(`https://itunes.apple.com/${cc}/rss/topsongs/limit=10/json`);
  return (feed.feed?.entry || []).map((e, i) => ({
    rank: i + 1,
    id: e.id?.attributes?.["im:id"],
    name: e["im:name"]?.label,
    artist: e["im:artist"]?.label,
    art: e["im:image"]?.at(-1)?.label?.replace(/\d+x\d+bb/, "300x300bb"),
    url: e.id?.label,
    preview: [].concat(e.link || []).find((l) => l.attributes?.["im:assetType"] === "preview")?.attributes?.href,
  })).filter((s) => s.name && s.preview);
}

async function one(cc) {
  for (const [name, fn] of [["modern", modern], ["legacy", legacy]]) {
    try { const songs = await fn(cc); if (songs.length) { out.charts[cc] = songs; console.log(cc, name, songs.length); return; } }
    catch (e) { console.log(cc, name, "failed:", e.message); }
  }
  console.log(cc, "no chart");
}

// A few at a time, saving as we go, so a slow feed can't cost us the rest.
let saving = Promise.resolve();
const save = () => (saving = saving.then(() => writeFile(OUT, JSON.stringify(out))));
const queue = [...countries];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) { await one(queue.shift()); await save(); }
}));
// Apple's feed is sometimes slow: give the countries that missed out one more go.
const missed = countries.filter((cc) => !out.charts[cc]);
queue.push(...missed);
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) { await one(queue.shift()); await save(); }
}));
await save();
console.log(`wrote ${Object.keys(out.charts).length}/${countries.length} countries`);
