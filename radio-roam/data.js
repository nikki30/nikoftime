// Stations come from Radio Browser (radio-browser.info), a free, community-run directory.
// "Now playing" is best effort: browsers can't read the song titles inside a radio stream,
// so we ask the few kinds of station servers that publish them separately.
// Artist facts come from Wikipedia.

const MIRRORS = ["all.api.radio-browser.info", "de1.api.radio-browser.info", "de2.api.radio-browser.info", "fi1.api.radio-browser.info", "nl1.api.radio-browser.info", "at1.api.radio-browser.info"];

async function getJSON(url, { timeout = 8000, signal } = {}) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeout);
  signal?.addEventListener("abort", () => ctl.abort());
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

// A big random sample of working, HTTPS (so it plays on an HTTPS page) stations that have coordinates.
export async function loadStations() {
  const q = "stations/search?has_geo_info=true&is_https=true&hidebroken=true&order=random&limit=1500";
  let lastErr;
  for (const host of MIRRORS) {
    try {
      const list = await getJSON(`https://${host}/json/${q}`, { timeout: 10000 });
      return { host, stations: tidy(list) };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("no mirror answered");
}

function tidy(list) {
  const seen = new Set();
  return list
    .filter((s) => s.url_resolved?.startsWith("https://") && Number.isFinite(+s.geo_lat) && Number.isFinite(+s.geo_long) && !(+s.geo_lat === 0 && +s.geo_long === 0))
    .filter((s) => { const k = s.name.trim().toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
    .map((s) => ({
      id: s.stationuuid, name: s.name.trim(), url: s.url_resolved, home: s.homepage, icon: s.favicon,
      lat: +s.geo_lat, lon: +s.geo_long, country: s.country, cc: (s.countrycode || "").toUpperCase(), state: s.state,
      tags: (s.tags || "").split(",").map((t) => t.trim()).filter((t) => t && t.length < 24).slice(0, 4),
      codec: s.codec, bitrate: s.bitrate, language: s.language,
    }));
}

// Tell the directory someone listened (it's how they rank stations). Fire and forget.
export function countClick(host, station) {
  fetch(`https://${host}/json/url/${station.id}`).catch(() => {});
}

/* ---------- now playing ---------- */
export async function nowPlaying(station, signal) {
  const u = new URL(station.url);
  const tries = [];
  // radio.co streams publish a status endpoint
  const rc = u.hostname.endsWith("radio.co") && u.pathname.match(/\/(s[0-9a-f]+)\//i);
  if (rc) tries.push(async () => (await getJSON(`https://public.radio.co/stations/${rc[1]}/status`, { signal })).current_track?.title);
  // laut.fm stations
  const lf = u.hostname.endsWith("laut.fm") && u.pathname.split("/").filter(Boolean)[0];
  if (lf) tries.push(async () => { const j = await getJSON(`https://api.laut.fm/station/${lf}/current_song`, { signal }); return j?.title ? `${j.artist?.name || ""} - ${j.title}` : null; });
  // Icecast servers publish /status-json.xsl, often with CORS open
  tries.push(async () => {
    const j = await getJSON(`${u.origin}/status-json.xsl`, { signal, timeout: 5000 });
    let src = j?.icestats?.source; if (!src) return null;
    src = Array.isArray(src) ? src : [src];
    const mine = src.find((x) => x.listenurl && new URL(x.listenurl, u.origin).pathname === u.pathname) || (src.length === 1 ? src[0] : null);
    if (!mine) return null;
    return mine.artist && mine.title ? `${mine.artist} - ${mine.title}` : mine.title || mine.yp_currently_playing || null;
  });
  for (const t of tries) {
    try { const raw = await t(); const parsed = parseTitle(raw); if (parsed) return parsed; } catch {}
  }
  return null;
}

const JUNK = /^(unknown|untitled|advert|advertisement|commercial|jingle|station id|live|on air|n\/a|-)$/i;
export function parseTitle(raw) {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.replace(/\s+/g, " ").trim();
  if (!t || JUNK.test(t) || t.length > 160) return null;
  const m = t.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (m) return { artist: m[1].trim(), song: m[2].trim() };
  return { artist: "", song: t };
}

/* ---------- Wikipedia ---------- */
const MUSIC = /\b(band|singer|musician|rapper|group|duo|trio|composer|songwriter|dj|disc jockey|record producer|vocalist|guitarist|pianist|orchestra|ensemble|artist|music)\b/i;

export async function artistFacts(artist, signal) {
  if (!artist || artist.length < 2) return null;
  for (const lang of ["en"]) {
    const s = await getJSON(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(artist + " music")}&srlimit=3&format=json&origin=*`, { signal });
    for (const hit of s?.query?.search || []) {
      const sum = await getJSON(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`, { signal }).catch(() => null);
      if (!sum || sum.type === "disambiguation" || !sum.extract) continue;
      const looksRight = MUSIC.test(sum.description || "") || MUSIC.test(sum.extract.slice(0, 200));
      const nameMatch = norm(sum.title).includes(norm(artist)) || norm(artist).includes(norm(sum.title.replace(/\s*\(.*\)/, "")));
      if (looksRight && nameMatch) return { title: sum.title, description: sum.description || "", extract: sum.extract, url: sum.content_urls?.desktop?.page, thumb: sum.thumbnail?.source };
    }
  }
  return null;
}
const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// A short note about where you landed, when there's no song to talk about.
export async function placeFacts(station, signal) {
  const q = [station.state, station.country].filter(Boolean).join(", ");
  if (!q) return null;
  try {
    const sum = await getJSON(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent((station.state || station.country).replace(/ /g, "_"))}`, { signal });
    if (!sum?.extract || sum.type === "disambiguation") return null;
    return { title: sum.title, extract: sum.extract, url: sum.content_urls?.desktop?.page };
  } catch { return null; }
}

export const flag = (cc) => cc && cc.length === 2 ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "🏳️";

export function firstSentences(text, n = 2) {
  const parts = String(text).match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  return parts.slice(0, n).join("").trim();
}
