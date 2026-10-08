// Fetches each country's most-played songs on Apple Music, plus a 30-second preview of each,
// and writes roamin-empire/charts.json. Runs in the Pages workflow (daily), because Apple's
// feeds can't be read straight from a browser on another site.
import { writeFile } from "node:fs/promises";
import { PLACES } from "../roamin-empire/places.js";

const countries = [...new Set(PLACES.map((p) => p.cc))];
const out = { updated: new Date().toISOString(), charts: {} };
const get = async (url) => { const r = await fetch(url); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

for (const cc of countries) {
  try {
    const feed = await get(`https://rss.applemarketingtools.com/api/v2/${cc}/music/most-played/10/songs.json`);
    const songs = (feed.feed?.results || []).map((s, i) => ({ rank: i + 1, id: s.id, name: s.name, artist: s.artistName, art: s.artworkUrl100?.replace("100x100", "300x300"), url: s.url }));
    if (songs.length) {
      const look = await get(`https://itunes.apple.com/lookup?id=${songs.map((s) => s.id).join(",")}&country=${cc}&entity=song`).catch(() => null);
      const byId = new Map((look?.results || []).map((r) => [String(r.trackId), r]));
      for (const s of songs) { const r = byId.get(String(s.id)); if (r) { s.preview = r.previewUrl; s.genre = r.primaryGenreName; s.album = r.collectionName; } }
      out.charts[cc] = songs.filter((s) => s.preview);
    }
    console.log(cc, out.charts[cc]?.length ?? 0);
  } catch (e) { console.log(cc, "no chart:", e.message); }
  await wait(400);
}
await writeFile(new URL("../roamin-empire/charts.json", import.meta.url), JSON.stringify(out));
console.log(`wrote ${Object.keys(out.charts).length}/${countries.length} countries`);
