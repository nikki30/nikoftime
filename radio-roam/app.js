import { createGlobe } from "./globe.js";
import { loadStations, countClick, nowPlaying, artistFacts, placeFacts, flag, firstSentences } from "./data.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const S = { stations: [], host: "", byCountry: new Map(), loading: null, here: null, mode: "any", recent: [], flying: false, poll: null, ctl: null, nowKey: "", factFor: "" };
const globe = createGlobe($("globe"));
const audio = $("audio");

/* ---------------- stations ---------------- */
function ensureStations() {
  S.loading ||= loadStations().then(({ host, stations }) => {
    S.host = host; S.stations = stations;
    for (const s of stations) { if (!S.byCountry.has(s.cc)) S.byCountry.set(s.cc, []); S.byCountry.get(s.cc).push(s); }
    globe.setStations(stations);
  }).catch((e) => { S.loading = null; throw e; });
  return S.loading;
}
ensureStations().catch(() => {});

const rand = (a) => a[Math.floor(Math.random() * a.length)];
function pick() {
  const avoid = new Set(S.recent);
  let pool = S.stations.filter((s) => !avoid.has(s.id));
  if (S.here && S.mode === "near") {
    for (const r of [1200, 2500, 5000]) { const p = pool.filter((s) => globe.distanceKm(S.here, s) < r && s.id !== S.here.id); if (p.length) { pool = p; break; } }
    return rand(pool);
  }
  if (S.here && S.mode === "far") { const p = pool.filter((s) => globe.distanceKm(S.here, s) > 7000); if (p.length) pool = p; }
  // Pick a country first, so you don't keep landing in the countries with the most stations.
  const passport = store.get("rr-passport", {});
  const countries = [...new Set(pool.map((s) => s.cc))];
  const fresh = countries.filter((c) => !passport[c]);
  const cc = rand(fresh.length && Math.random() < 0.7 ? fresh : countries);
  return rand(pool.filter((s) => s.cc === cc));
}

/* ---------------- the ride ---------------- */
$("ride").addEventListener("click", ride);
async function ride() {
  if (S.flying) return;
  S.flying = true; $("ride").disabled = true; setStatus(S.stations.length ? "" : "Finding stations…");
  try { await ensureStations(); } catch {
    setStatus("Couldn't reach the radio directory. Check your connection and try again."); S.flying = false; $("ride").disabled = false; return;
  }
  const to = pick();
  if (!to) { setStatus("No stations found that way. Try Anywhere."); S.flying = false; $("ride").disabled = false; return; }
  const from = S.here;
  S.recent = [to.id, ...S.recent].slice(0, 40);
  stopListening();
  $("intro").hidden = true;
  $("card").hidden = true; $("card").classList.remove("in"); globe.lift(0);
  setStatus(`Floating to ${to.country || "somewhere"}…`);
  // Start the stream inside the click so the browser allows it, silently, and fade it in on landing.
  audio.src = to.url; audio.muted = true; audio.volume = 0;
  const playing = audio.play().then(() => true).catch(() => false);
  await globe.ride(to);
  S.here = to; S.flying = false; $("ride").disabled = false;
  $("ride-label").textContent = "Ride on";
  document.querySelectorAll("[data-mode]").forEach((b) => (b.disabled = false));
  stamp(to);
  const km = from ? Math.round(globe.distanceKm(from, to)) : null;
  showCard(to, km);
  setStatus("");
  if (await playing) { audio.muted = false; fadeIn(); syncPlay(); countClick(S.host, to); listen(to); }
  else tuneFailed();
}

function fadeIn() { let v = 0; const vol = store.get("rr-volume", 0.8); const t = setInterval(() => { v = Math.min(vol, v + 0.08); audio.volume = v; if (v >= vol) clearInterval(t); }, 60); }
function stopListening() { clearInterval(S.poll); S.ctl?.abort(); audio.pause(); audio.removeAttribute("src"); audio.load(); S.nowKey = ""; S.factFor = ""; }
audio.addEventListener("error", () => { if (S.here && !S.flying && audio.getAttribute("src")) tuneFailed(); });
function syncPlay() {
  const on = !audio.paused && !!audio.getAttribute("src");
  $("card").classList.toggle("live", on);
  const b = $("pp-play"); if (b) { b.textContent = on ? "❚❚" : "▶"; b.setAttribute("aria-label", on ? "Pause" : "Play"); }
}
audio.addEventListener("playing", syncPlay);
audio.addEventListener("pause", syncPlay);
function tuneFailed() {
  const np = $("now"); if (!np) return;
  np.innerHTML = `<p class="static">📻 Only static here. This station isn't answering right now.</p>`;
  $("card").classList.remove("live");
}

/* ---------------- the card ---------------- */
function showCard(s, km) {
  const place = [s.state, s.country].filter(Boolean).join(", ");
  $("card").innerHTML = `
    <div class="where"><span class="flag">${flag(s.cc)}</span><div><b>${esc(place || "Somewhere")}</b>${km != null ? `<span>You floated ${km.toLocaleString()} km</span>` : `<span>Your first stop</span>`}</div></div>
    <div class="station">
      ${s.icon ? `<img src="${esc(s.icon)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}
      <div><h2>${esc(s.name)}</h2>${s.tags.length ? `<div class="tags">${s.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}</div>
    </div>
    <div class="player">
      <button class="play" id="pp-play" type="button" aria-label="Play or pause">▶</button>
      <span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <label class="vol"><span class="sr">Volume</span><input id="vol" type="range" min="0" max="1" step="0.05" value="${store.get("rr-volume", 0.8)}"></label>
    </div>
    <div class="now" id="now"><p class="soft">Tuning in…</p></div>
    <div class="fact" id="fact" hidden></div>
    <div class="actions">${s.home ? `<a class="btn ghost" href="${esc(s.home)}" target="_blank" rel="noopener">Station site ↗</a>` : ""}<button class="btn ghost" id="save" type="button">${isSaved(s) ? "♥ Saved" : "♡ Save station"}</button></div>`;
  $("card").hidden = false;
  requestAnimationFrame(() => $("card").classList.add("in"));
  syncPlay();
  globe.lift(matchMedia("(max-width: 720px)").matches ? 0.27 : 0);
  $("pp-play").onclick = () => (audio.paused ? audio.play().catch(tuneFailed) : audio.pause());
  $("vol").oninput = (e) => { audio.volume = +e.target.value; store.set("rr-volume", +e.target.value); };
  $("save").onclick = () => { toggleSave(s); $("save").textContent = isSaved(s) ? "♥ Saved" : "♡ Save station"; };
}

/* ---------------- what's playing + facts ---------------- */
async function listen(s) {
  S.ctl = new AbortController();
  const check = async () => {
    const np = await nowPlaying(s, S.ctl.signal).catch(() => null);
    if (S.here !== s) return;
    const key = np ? `${np.artist}|${np.song}` : "none";
    if (key === S.nowKey) return;
    S.nowKey = key;
    $("now").innerHTML = np
      ? `<span class="label">Now playing</span><p class="song">${esc(np.song)}</p>${np.artist ? `<p class="artist">${esc(np.artist)}</p>` : ""}
         <button class="btn ytm" id="ytm" type="button">${isLiked(np) ? "♥ Saved" : "♡ Save to YouTube Music"}</button>`
      : `<span class="label">On air</span><p class="soft">This station doesn't share what's playing, so here's where you are.</p>`;
    if (np) $("ytm").onclick = () => { like(np, s); $("ytm").textContent = "♥ Saved"; window.open(ytmUrl(np), "_blank", "noopener"); };
    if (np?.artist) factAboutArtist(np.artist, s); else if (!S.factFor) factAboutPlace(s);
  };
  await check();
  S.poll = setInterval(check, 30000);
}

async function factAboutArtist(artist, s) {
  if (S.factFor === "a:" + artist) return;
  S.factFor = "a:" + artist;
  const wiki = await artistFacts(artist, S.ctl.signal).catch(() => null);
  if (S.here !== s || S.factFor !== "a:" + artist) return;
  if (!wiki) { if (!$("fact").innerHTML) factAboutPlace(s); return; }
  showFact({ text: firstSentences(wiki.extract, 2), src: wiki, kind: "Wikipedia" });
  const fun = await claudeFact(artist, wiki.extract).catch(() => null);
  if (fun && S.here === s && S.factFor === "a:" + artist) showFact({ text: fun, src: wiki, kind: "Claude, from Wikipedia" });
}

async function factAboutPlace(s) {
  S.factFor = "p:" + s.id;
  const wiki = await placeFacts(s, S.ctl.signal).catch(() => null);
  if (!wiki || S.here !== s || S.factFor !== "p:" + s.id) return;
  showFact({ text: firstSentences(wiki.extract, 2), src: wiki, kind: "Wikipedia", place: true });
}

function showFact({ text, src, kind, place }) {
  const el = $("fact"); if (!el) return;
  el.hidden = false;
  el.innerHTML = `<span class="label">${place ? `About ${esc(src.title)}` : "Did you know?"}</span>
    ${src.thumb && !place ? `<img src="${esc(src.thumb)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}
    <p>${esc(text)}</p><a class="src" href="${esc(src.url)}" target="_blank" rel="noopener">${esc(kind)} ↗</a>`;
}

/* ---------------- Claude (optional) ---------------- */
const KEY = "ssf-key"; // shared with Story So Far: one key for all the apps on this site
let SDK = null;
async function claudeFact(artist, extract) {
  const key = store.get(KEY, "");
  if (!key) return null;
  SDK ||= (await import("../vendor/anthropic.mjs")).Anthropic;
  const client = new SDK({ apiKey: key, dangerouslyAllowBrowser: true });
  const res = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 2048,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    messages: [{ role: "user", content:
      `You are a warm, playful radio host. A listener has just tuned in to a song by ${artist}. Using ONLY facts stated in the Wikipedia text below, write one surprising "Did you know?" about them: one or two sentences, under 45 words, starting with "Did you know". Prefer something that would surprise a listener from another country (fame at home, records, unusual history). Do not add anything that isn't in the text. Reply with the sentence only.\n\nWikipedia:\n${extract.slice(0, 4000)}` }],
  });
  if (res.stop_reason === "refusal") return null;
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  return text && text.length < 400 ? text : null;
}
function paintKey() {
  const has = !!store.get(KEY, "");
  $("claude-state").textContent = has ? "on" : "optional"; $("key-forget").hidden = !has; $("f-key").value = "";
}
$("key-save").onclick = () => { const k = $("f-key").value.trim(); if (k) { store.set(KEY, k); paintKey(); } };
$("key-forget").onclick = () => { try { localStorage.removeItem(KEY); } catch {} paintKey(); };
paintKey();

/* ---------------- songs you loved, sent to YouTube Music ---------------- */
// Opens the song on YouTube Music, where one tap adds it to your library, and keeps a list here too.
const ytmUrl = (np) => `https://music.youtube.com/search?q=${encodeURIComponent(`${np.artist} ${np.song}`.trim())}`;
const isLiked = (np) => store.get("rr-liked", []).some((x) => x.song === np.song && x.artist === np.artist);
function like(np, s) {
  if (isLiked(np)) return;
  store.set("rr-liked", [{ song: np.song, artist: np.artist, station: s.name, country: s.country, cc: s.cc, at: new Date().toISOString() }, ...store.get("rr-liked", [])].slice(0, 200));
}

/* ---------------- passport + saved stations ---------------- */
function stamp(s) {
  const p = store.get("rr-passport", {});
  p[s.cc] = { country: s.country, n: (p[s.cc]?.n || 0) + 1, first: p[s.cc]?.first || new Date().toISOString() };
  store.set("rr-passport", p); store.set("rr-rides", store.get("rr-rides", 0) + 1); paintCount();
}
function paintCount() { $("pp-count").textContent = Object.keys(store.get("rr-passport", {})).length; }
const isSaved = (s) => store.get("rr-saved", []).some((x) => x.id === s.id);
function toggleSave(s) { const list = store.get("rr-saved", []); store.set("rr-saved", isSaved(s) ? list.filter((x) => x.id !== s.id) : [s, ...list].slice(0, 50)); }

$("passport-btn").onclick = () => {
  const p = store.get("rr-passport", {}), saved = store.get("rr-saved", []), liked = store.get("rr-liked", []), rides = store.get("rr-rides", 0);
  const stamps = Object.entries(p).sort((a, b) => a[1].first.localeCompare(b[1].first));
  $("pp-body").innerHTML = `<p class="soft">${rides} ride${rides === 1 ? "" : "s"} · ${stamps.length} countr${stamps.length === 1 ? "y" : "ies"}</p>
    ${stamps.length ? `<div class="stamps">${stamps.map(([cc, v], i) => `<div class="stamp" style="--r:${((i * 37) % 13) - 6}deg"><span>${flag(cc)}</span><b>${esc(v.country)}</b>${v.n > 1 ? `<i>×${v.n}</i>` : ""}</div>`).join("")}</div>` : `<p>No stamps yet. Take a ride!</p>`}
    ${liked.length ? `<h3>Songs you loved</h3><ul class="saved">${liked.map((x) => `<li><a class="liked" href="${esc(ytmUrl(x))}" target="_blank" rel="noopener">${flag(x.cc)} <b>${esc(x.song)}</b> <span>${esc(x.artist)} · heard on ${esc(x.station)}</span> <em>YouTube Music ↗</em></a></li>`).join("")}</ul>` : ""}
    ${saved.length ? `<h3>Saved stations</h3><ul class="saved">${saved.map((s) => `<li><button type="button" data-go="${esc(s.id)}">${flag(s.cc)} ${esc(s.name)} <span>${esc(s.country)}</span></button></li>`).join("")}</ul>` : ""}`;
  $("passport").showModal();
};
$("passport").addEventListener("click", async (e) => {
  if (e.target.closest("[data-close]") || e.target.id === "passport") return $("passport").close();
  const go = e.target.closest("[data-go]");
  if (go) { const s = store.get("rr-saved", []).find((x) => x.id === go.dataset.go); $("passport").close(); if (s) flyTo(s); }
});
async function flyTo(s) {
  if (S.flying) return;
  S.flying = true; stopListening(); $("intro").hidden = true; $("card").hidden = true;
  audio.src = s.url; audio.muted = true; audio.volume = 0;
  const playing = audio.play().then(() => true).catch(() => false);
  const from = S.here; await globe.ride(s); S.here = s; S.flying = false; stamp(s);
  showCard(s, from ? Math.round(globe.distanceKm(from, s)) : null);
  if (await playing) { audio.muted = false; fadeIn(); syncPlay(); listen(s); } else tuneFailed();
}

/* ---------------- modes ---------------- */
document.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
  S.mode = b.dataset.mode;
  document.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
}));
function setStatus(t) { $("status").textContent = t; }
document.addEventListener("keydown", (e) => { if (e.key === " " && e.target === document.body) { e.preventDefault(); ride(); } });
paintCount();
