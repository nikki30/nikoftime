import { createGlobe } from "../radio-roam/globe.js";
import { artistFacts, flag as flagOf, firstSentences } from "../radio-roam/data.js";
import { PLACES, TITLES } from "./places.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const phone = () => matchMedia("(max-width: 720px)").matches;
const flag = (cc) => flagOf(cc.toUpperCase());
const rand = (a) => a[Math.floor(Math.random() * a.length)];

const S = { view: "globe", km: null, fresh: false, here: null, flying: false, chart: [], track: 0, step: 0, map: null, marker: null, ctl: null };
const globe = createGlobe($("globe"));
globe.setStations(PLACES.map((p) => ({ lon: p.at[0], lat: p.at[1] })));
const audio = $("audio");

// This week's charts, fetched by the site's daily build (see tools/charts.mjs).
const charts = fetch("charts.json").then((r) => (r.ok ? r.json() : null)).then((j) => j?.charts || {}).catch(() => ({}));

/* ---------------- the trip ---------------- */
function pick() {
  const been = store.get("re-visited", {});
  const fresh = PLACES.filter((p) => !been[p.id] && p !== S.here);
  return rand(fresh.length ? fresh : PLACES.filter((p) => p !== S.here));
}

$("ride").addEventListener("click", () => trip());
async function trip(to = pick()) {
  if (S.flying) return;
  S.flying = true; $("ride").disabled = true;
  closeMap();
  stopMusic();
  $("intro").hidden = true; hideCard(); globe.lift(0); S.view = "globe";
  setStatus(`Floating to ${to.name}…`);
  // Start the song inside the click, muted, so the browser lets it play when we land.
  const songs = (await charts)[to.cc] || [];
  S.chart = songs; S.track = 0;
  const playing = songs.length ? startSong(songs[0], true) : Promise.resolve(false);
  const from = S.here;
  await globe.ride({ lon: to.at[0], lat: to.at[1] });
  S.here = to; S.flying = false; $("ride").disabled = false;
  $("ride-label").textContent = "Fly on";
  setStatus("");
  const fresh = conquer(to);
  S.km = from ? Math.round(globe.distanceKm({ lon: from.at[0], lat: from.at[1] }, { lon: to.at[0], lat: to.at[1] })) : null; S.fresh = fresh;
  showLanding(to);
  if (await playing) { audio.currentTime = 0; audio.muted = false; fadeIn(); }
  paintSong();
}

/* ---------------- music ---------------- */
function startSong(song, muted = false) {
  audio.src = song.preview; audio.muted = muted; audio.volume = muted ? 0 : store.get("re-volume", 0.8);
  return audio.play().then(() => true).catch(() => false);
}
function stopMusic() { audio.pause(); audio.removeAttribute("src"); audio.load(); S.ctl?.abort(); }
function fadeIn() { let v = 0; const vol = store.get("re-volume", 0.8); const t = setInterval(() => { v = Math.min(vol, v + 0.08); audio.volume = v; if (v >= vol) clearInterval(t); }, 60); }
// Previews are 30 seconds, so when one ends, play the next song on the chart.
audio.addEventListener("ended", () => { if (S.chart.length) nextSong(); });
audio.addEventListener("timeupdate", () => { const i = document.querySelector(".bar-prog i"); if (i && audio.duration) i.style.width = `${(audio.currentTime / audio.duration) * 100}%`; });
for (const ev of ["play", "pause"]) audio.addEventListener(ev, () => { const b = $("play"); if (b) { b.textContent = audio.paused ? "▶" : "❚❚"; b.setAttribute("aria-label", audio.paused ? "Play" : "Pause"); } });
function nextSong() {
  S.track = (S.track + 1) % S.chart.length;
  startSong(S.chart[S.track]).then((ok) => { if (!ok) audio.pause(); });
  if (S.view === "land") paintSong(); else paintMini();
}

function songHTML(p) {
  if (!S.chart.length) return `<div><span class="label">Top of the charts</span><p class="soft">Apple doesn't publish a chart for ${esc(p.country)} right now, so this stop is a quiet one.</p></div>`;
  const s = S.chart[S.track];
  return `<div id="song-box">
    <span class="label">#${s.rank} in ${esc(p.country)} this week</span>
    <div class="song">${s.art ? `<img src="${esc(s.art)}" alt="">` : `<span class="noart" aria-hidden="true">♪</span>`}<div><p class="name">${esc(s.name)}</p><p class="artist">${esc(s.artist)}</p></div></div>
    <div class="player">
      <button class="play" id="play" type="button" aria-label="${audio.paused ? "Play" : "Pause"}">${audio.paused ? "▶" : "❚❚"}</button>
      <span class="bar-prog" aria-hidden="true"><i></i></span>
      <button class="btn" id="next" type="button">Next hit ›</button>
    </div>
    <a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">Full song on Apple Music ↗</a>
  </div>`;
}
function paintSong() {
  const box = $("song-slot"); if (!box || !S.here) return;
  box.innerHTML = songHTML(S.here);
  $("play") && ($("play").onclick = () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
  $("next") && ($("next").onclick = nextSong);
  artistFact();
}

async function artistFact() {
  const s = S.chart[S.track], el = $("fact"); if (!el) return;
  el.hidden = true; el.innerHTML = "";
  if (!s) return;
  S.ctl?.abort(); S.ctl = new AbortController();
  const here = S.here, track = S.track;
  const wiki = await artistFacts(s.artist.split(/,| & | feat\.? | x /i)[0].trim(), S.ctl.signal).catch(() => null);
  if (!wiki || S.here !== here || S.track !== track || !$("fact")) return;
  $("fact").hidden = false;
  $("fact").innerHTML = `<span class="label">Did you know?</span>${wiki.thumb ? `<img src="${esc(wiki.thumb)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}
    <p>${esc(firstSentences(wiki.extract, 2))}</p><a class="src" href="${esc(wiki.url)}" target="_blank" rel="noopener">Wikipedia ↗</a>`;
}

/* ---------------- cards ---------------- */
function hideCard() { $("card").classList.remove("in", "tall"); $("card").hidden = true; }
function card(html, { tall = false } = {}) {
  const c = $("card");
  c.innerHTML = html; c.hidden = false; c.classList.toggle("tall", tall); c.scrollTop = 0;
  requestAnimationFrame(() => c.classList.add("in"));
}

function showLanding(p) {
  const { km, fresh } = S; S.view = "land";
  card(`
    <div class="where"><span class="flag">${flag(p.cc)}</span><div><b>${esc(p.name)}</b><span>${esc(p.country)} · ${km != null ? `${km.toLocaleString()} km floated` : "your first stop"}${fresh ? " · new to your empire" : ""}</span></div></div>
    <div id="song-slot"></div>
    <div class="actions"><button class="btn go" id="zoom" type="button">🔍 Zoom in</button><button class="btn" id="taste" type="button">🌱 Just the food</button></div>
    <div class="fact" id="fact" hidden></div>`);
  $("zoom").onclick = () => zoomIn(p);
  $("taste").onclick = () => showFood(p);
  globe.lift(phone() ? 0.27 : 0);
}

/* ---------------- zoom in: the map tour ---------------- */
let mapLib = null;
function loadMapLib() {
  mapLib ||= new Promise((resolve, reject) => {
    const css = document.createElement("link"); css.rel = "stylesheet"; css.href = "../vendor/maplibre-gl.css"; document.head.append(css);
    const js = document.createElement("script"); js.src = "../vendor/maplibre-gl.js"; js.onload = () => resolve(window.maplibregl); js.onerror = reject; document.head.append(js);
  });
  return mapLib;
}

const SAT = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
async function zoomIn(p) {
  $("zoom").disabled = true; setStatus("Unrolling the map…");
  let ml;
  try { ml = await loadMapLib(); } catch { setStatus("Couldn't load the map. Check your connection."); $("zoom").disabled = false; return; }
  setStatus("");
  if (S.here !== p) return;
  if (!S.map) {
    S.map = new ml.Map({ container: "map", style: "https://tiles.openfreemap.org/styles/liberty", center: p.at, zoom: 3, attributionControl: { compact: true } });
    S.map.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");
    S.map.on("load", () => {
      const firstLabel = S.map.getStyle().layers.find((l) => l.type === "symbol")?.id;
      S.map.addSource("sat", { type: "raster", tiles: [SAT], tileSize: 256, maxzoom: 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics" });
      S.map.addLayer({ id: "sat", type: "raster", source: "sat", layout: { visibility: store.get("re-sat", false) ? "visible" : "none" } }, firstLabel);
    });
    S.marker = new ml.Marker({ element: Object.assign(document.createElement("div"), { className: "pulse" }) });
  } else {
    S.map.jumpTo({ center: p.at, zoom: 3 });
  }
  $("map").hidden = false; $("map-tools").hidden = false; paintSat();
  requestAnimationFrame(() => { S.map.resize(); $("map").classList.add("in"); $("globe").classList.add("away"); });
  $("dock").hidden = true;
  S.step = 0; tour(p);
}

function tour(p) {
  S.view = "tour";
  const n = p.look.length, v = p.look[S.step];
  S.marker.setLngLat(v.at).addTo(S.map);
  S.map.flyTo({ center: v.at, zoom: v.z - (phone() ? 0.6 : 0), speed: S.step === 0 ? 0.9 : 1.2, curve: 1.5, essential: true, padding: phone() ? { bottom: innerHeight * 0.45 } : { left: 400 } });
  card(`
    <div class="where"><span class="flag">${flag(p.cc)}</span><div><b>${esc(p.name)}</b><span>Look closer · ${S.step + 1} of ${n}</span></div></div>
    <div class="steps" aria-hidden="true">${p.look.map((_, i) => `<i class="${i <= S.step ? "on" : ""}"></i>`).join("")}</div>
    <p class="notice">${esc(v.t)}</p>
    <div class="actions">
      <button class="btn" id="back" type="button" ${S.step ? "" : "disabled"}>‹ Back</button>
      <span class="spacer"></span>
      ${S.step < n - 1 ? `<button class="btn go" id="fwd" type="button">Next ›</button>` : `<button class="btn go" id="fwd" type="button">🌱 Time to eat</button>`}
    </div>
    <div id="song-slot" class="small"></div>`, { tall: true });
  $("back").onclick = () => { S.step--; tour(p); };
  $("fwd").onclick = () => { if (S.step < n - 1) { S.step++; tour(p); } else showFood(p); };
  paintMini();
}
function paintMini() {
  const box = $("song-slot"); if (!box) return;
  const s = S.chart[S.track];
  box.innerHTML = s ? `<div class="player"><button class="play" id="play" type="button" aria-label="${audio.paused ? "Play" : "Pause"}">${audio.paused ? "▶" : "❚❚"}</button><span><b>${esc(s.name)}</b> <span class="soft">· ${esc(s.artist)}</span></span></div>` : "";
  $("play") && ($("play").onclick = () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
}

function closeMap() {
  $("map").classList.remove("in"); $("globe").classList.remove("away"); $("map-tools").hidden = true; $("dock").hidden = false;
  setTimeout(() => { if (!$("map").classList.contains("in")) $("map").hidden = true; }, 800);
  S.marker?.remove();
}
$("sat").onclick = () => { store.set("re-sat", !store.get("re-sat", false)); paintSat(); };
function paintSat() {
  const on = store.get("re-sat", false);
  $("sat").setAttribute("aria-pressed", String(on));
  if (S.map?.getLayer("sat")) S.map.setLayoutProperty("sat", "visibility", on ? "visible" : "none");
}

/* ---------------- food ---------------- */
async function showFood(p) {
  const d = p.dish, inMap = !$("map").hidden;
  S.view = "food";
  card(`
    <div class="dish">
      <span class="label">A taste of ${esc(p.country)}</span>
      <img class="photo" id="dish-photo" alt="${esc(d.name)}" hidden>
      <h2>${esc(d.name)}</h2>
      <span class="veg">Vegetarian</span>
      <p>${esc(d.what)}</p>
      <a class="src" id="dish-src" href="https://en.wikipedia.org/wiki/${encodeURIComponent(d.wiki.replace(/ /g, "_"))}" target="_blank" rel="noopener">More on Wikipedia ↗</a>
    </div>
    <div class="actions">
      ${inMap ? `<button class="btn" id="again" type="button">‹ Back to the map</button>` : `<button class="btn" id="again" type="button">‹ Back</button>`}
      <span class="spacer"></span>
      <button class="btn go" id="on" type="button">🎈 Fly on</button>
    </div>
    <div id="song-slot" class="small"></div>`, { tall: inMap });
  $("again").onclick = () => (inMap ? tour(p) : (showLanding(p), paintSong()));
  $("on").onclick = () => trip();
  paintMini();
  tasted(p);
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(d.wiki.replace(/ /g, "_"))}`);
    const j = r.ok ? await r.json() : null;
    const thumb = j?.thumbnail?.source, src = thumb ? thumb.replace(/\/\d+px-/, "/640px-") : j?.originalimage?.source;
    const img = $("dish-photo");
    if (src && img && S.view === "food") { img.onerror = () => { if (thumb && img.src !== thumb) img.src = thumb; else img.remove(); }; img.src = src; img.hidden = false; }
  } catch {}
}

/* ---------------- your empire ---------------- */
function conquer(p) {
  const v = store.get("re-visited", {}), fresh = !v[p.id];
  v[p.id] = { n: (v[p.id]?.n || 0) + 1, first: v[p.id]?.first || new Date().toISOString() };
  store.set("re-visited", v); paintTitle();
  return fresh;
}
function tasted(p) { const t = store.get("re-tasted", {}); t[p.id] = true; store.set("re-tasted", t); }
function title(n) { let t = TITLES[0][1]; for (const [min, name] of TITLES) if (n >= min) t = name; return t; }
function paintTitle() { $("title").textContent = title(Object.keys(store.get("re-visited", {})).length); }

$("passport-btn").onclick = () => {
  const v = store.get("re-visited", {}), tasted = store.get("re-tasted", {}), n = Object.keys(v).length;
  const nextT = TITLES.find(([min]) => min > n);
  const countries = new Set(PLACES.filter((p) => v[p.id]).map((p) => p.cc)).size;
  $("pp-body").innerHTML = `
    <p class="rank">${esc(title(n))}</p>
    <div class="meter"><i style="width:${(n / PLACES.length) * 100}%"></i></div>
    <p class="soft small">${n} of ${PLACES.length} places · ${countries} countr${countries === 1 ? "y" : "ies"} · ${Object.keys(tasted).length} dishes tasted${nextT ? ` · ${nextT[0] - n} more to become ${esc(nextT[1])}` : ""}</p>
    <h3>Your stamps</h3>
    <div class="stamps">${PLACES.map((p, i) => v[p.id]
      ? `<button type="button" class="stamp" data-go="${p.id}" style="--r:${((i * 37) % 13) - 6}deg"><span>${flag(p.cc)}</span><b>${esc(p.name.split(",")[0])}</b><i>${tasted[p.id] ? "🌱 tasted" : "not tasted yet"}</i></button>`
      : `<div class="stamp todo" style="--r:${((i * 37) % 13) - 6}deg"><span>?</span><b>Unexplored</b></div>`).join("")}</div>`;
  $("passport").showModal();
};
$("passport").addEventListener("click", (e) => {
  if (e.target.closest("[data-close]") || e.target.id === "passport") return $("passport").close();
  const go = e.target.closest("[data-go]");
  if (go) { $("passport").close(); const p = PLACES.find((x) => x.id === go.dataset.go); if (p && p !== S.here) trip(p); }
});

function setStatus(t) { $("status").textContent = t; }
document.addEventListener("keydown", (e) => { if (e.key === " " && e.target === document.body) { e.preventDefault(); trip(); } });
paintTitle();
