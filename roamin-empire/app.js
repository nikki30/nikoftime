import { createGlobe } from "../radio-roam/globe.js";
import { artistFacts, flag as flagOf, firstSentences } from "../radio-roam/data.js";
import { PLACES, TITLES } from "./places.js";
import { COUNTRY, EXTRA } from "./extras.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const phone = () => matchMedia("(max-width: 900px)").matches;
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
$("zoom").addEventListener("click", () => S.here && zoomIn(S.here));
async function trip(to = pick()) {
  if (S.flying) return;
  S.flying = true; $("ride").disabled = true;
  closeMap();
  stopMusic();
  $("intro").hidden = true; hideCard(); hideRing(); globe.lift(0); globe.scale(1); S.view = "globe";
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
  showRing(to);
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
  if (!S.chart.length) return `<p class="soft">Apple doesn't publish a chart for ${esc(p.country)} today, so this stop is a quiet one. Listen to the wind.</p>`;
  const s = S.chart[S.track];
  return `<div class="song">${s.art ? `<img src="${esc(s.art)}" alt="">` : `<span class="noart" aria-hidden="true">♪</span>`}<div><span class="rank-chip">#${s.rank} this week</span><p class="name">${esc(s.name)}</p><p class="artist">${esc(s.artist)}</p></div></div>
    <div class="player">
      <button class="play" id="play" type="button" aria-label="${audio.paused ? "Play" : "Pause"}">${audio.paused ? "▶" : "❚❚"}</button>
      <span class="bar-prog" aria-hidden="true"><i></i></span>
      <button class="btn small-btn" id="next" type="button">Next hit ›</button>
    </div>
    <p class="fact-line" id="fact" hidden></p>`;
}
function paintSong() {
  const box = $("song-slot"); if (!box || !S.here) return;
  box.innerHTML = songHTML(S.here);
  const link = $("song-link"); if (link) { const s = S.chart[S.track]; link.hidden = !s; if (s) link.href = s.url; }
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
  $("fact").innerHTML = `<b>Did you know?</b> ${esc(firstSentences(wiki.extract, 1))} <a class="src" href="${esc(wiki.url)}" target="_blank" rel="noopener">Wikipedia ↗</a>`;
}

/* ---------------- cards ---------------- */
function hideCard() { $("card").classList.remove("in", "tall"); $("card").hidden = true; }
function card(html, { tall = false } = {}) {
  const c = $("card");
  c.innerHTML = html; c.hidden = false; c.classList.toggle("tall", tall); c.scrollTop = 0;
  requestAnimationFrame(() => c.classList.add("in"));
}

/* ---------------- the ring of cards around the globe ---------------- */
const WEATHER = [[[0], "☀️", "Clear"], [[1, 2], "🌤️", "Mostly clear"], [[3], "☁️", "Cloudy"], [[45, 48], "🌫️", "Foggy"], [[51, 53, 55, 56, 57], "🌦️", "Drizzle"],
  [[61, 63, 65, 66, 67], "🌧️", "Rain"], [[71, 73, 75, 77, 85, 86], "🌨️", "Snow"], [[80, 81, 82], "🌦️", "Showers"], [[95, 96, 99], "⛈️", "Thunderstorms"]];
const tilt = (i) => `${(((i * 53) % 7) - 3) * 0.6}deg`;

function fc(kind, icon, title, body, i, extra = "") {
  return `<article class="fc fc-${kind}" style="--r:${tilt(i)};--i:${i}" ${extra}><span class="ic" aria-hidden="true">${icon}</span><h3>${title}</h3>${body}</article>`;
}

function showRing(p) {
  const { km, fresh } = S, c = COUNTRY[p.cc] || {}, x = EXTRA[p.id] || {};
  S.view = "land";
  const inCapital = c.capital && p.name.split(",")[0].trim() === c.capital;
  const left = [
    fc("song", "🎵", `Top of the charts in ${esc(p.country)}`, `<div id="song-slot"></div><a class="src" id="song-link" target="_blank" rel="noopener" hidden>Full song on Apple Music ↗</a>`, 0),
    fc("food", "🌱", "Must-eat veg", `<div class="food"><img id="food-photo" alt="" hidden><div><b class="big">${esc(p.dish.name)}</b><span class="veg">Vegetarian</span></div></div><p class="clamp">${esc(p.dish.what)}</p><button class="more" type="button" data-food>Read more ›</button>`, 1),
    x.visit ? fc("visit", "📍", "Must visit", `<b class="big">${esc(x.visit.name)}</b><p class="clamp">${esc(x.visit.why)}</p>`, 2) : "",
  ];
  const right = [
    x.only ? fc("only", "✨", "Only here", `<p>${esc(x.only)}</p>`, 4) : "",
    x.hello ? fc("hello", "💬", "Say hello", `<b class="huge">${esc(x.hello.word)}</b><p><i>${esc(x.hello.say)}</i> · ${esc(x.hello.lang)}</p>`, 5) : "",
    fc("now", "🕰️", "Right now there", `<div class="now-row"><b class="big" id="clock">--:--</b><span class="wx" id="wx"></span></div><p id="offset"></p>`, 6),
    fc("know", "🏛️", "Good to know", `<p class="kv"><span>Capital</span><b>${esc(c.capital || "")}</b></p>${inCapital ? `<p class="hl">You're standing in it!</p>` : c.note ? `<p class="soft small">${esc(c.note[0].toUpperCase() + c.note.slice(1))}.</p>` : ""}<p class="kv"><span>Money</span><b>${esc(c.money || "")}</b></p><p class="kv"><span>Driving</span><b>on the ${esc(c.drive || "?")}${c.drive === "left" ? " (look right first!)" : ""}</b></p>`, 7),
  ];
  $("ring").innerHTML = `
    <header class="ring-head"><span class="flag">${flag(p.cc)}</span><div><h2>${esc(p.name)}</h2><p>${esc(p.country)} · ${km != null ? `${km.toLocaleString()} km floated` : "your first stop"}${fresh ? ` · <b>new to your empire!</b>` : ""}</p></div></header>
    <div class="col left">${left.join("")}</div><div class="col right">${right.join("")}</div>`;
  $("ring").hidden = false; $("ring").scrollTop = 0;
  requestAnimationFrame(() => $("ring").classList.add("in"));
  $("zoom").hidden = false; $("zoom").disabled = false; $("dock").hidden = false;
  document.body.classList.add("landed");
  globe.lift(phone() ? 0.3 : 0); globe.scale(phone() ? 0.9 : 0.72);
  $("ring").querySelector("[data-food]").onclick = () => showFood(p);
  for (const el of $("ring").querySelectorAll(".clamp")) el.closest(".fc").addEventListener("click", (e) => { if (!e.target.closest("button, a")) el.closest(".fc").classList.toggle("open"); });
  paintSong();
  tickClock(p); weather(p); foodPhoto(p, $("food-photo"));
  leads();
}

function hideRing() {
  $("ring").classList.remove("in"); $("ring").hidden = true; $("ring").innerHTML = ""; $("leads").innerHTML = "";
  $("zoom").hidden = true; document.body.classList.remove("landed");
  clearInterval(S.clock);
}

function tickClock(p) {
  const tz = EXTRA[p.id]?.tz; clearInterval(S.clock);
  if (!tz) return;
  const fmt = new Intl.DateTimeFormat([], { timeZone: tz, hour: "numeric", minute: "2-digit", weekday: "short" });
  const tick = () => { const el = $("clock"); if (el) el.textContent = fmt.format(new Date()); };
  tick(); S.clock = setInterval(tick, 15000);
  // How far ahead or behind you they are.
  const off = new Intl.DateTimeFormat("en", { timeZone: tz, timeZoneName: "longOffset" }).formatToParts(new Date()).find((x) => x.type === "timeZoneName")?.value || "GMT";
  const m = off.match(/([+-])(\d{2}):?(\d{2})?/), theirs = m ? (m[1] === "-" ? -1 : 1) * (+m[2] * 60 + +(m[3] || 0)) : 0;
  const diff = theirs + new Date().getTimezoneOffset(), h = Math.floor(Math.abs(diff) / 60), mm = Math.abs(diff) % 60;
  $("offset").textContent = diff === 0 ? "Same time as you" : `${h ? `${h} h` : ""}${mm ? ` ${mm} min` : ""} ${diff > 0 ? "ahead of" : "behind"} you`.trim();
}

async function weather(p) {
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.at[1]}&longitude=${p.at[0]}&current=temperature_2m,weather_code,is_day`);
    const j = await r.json(), cur = j.current; if (!cur || S.here !== p || !$("wx")) return;
    const w = WEATHER.find(([codes]) => codes.includes(cur.weather_code)) || [[], "🌡️", ""];
    const icon = !cur.is_day && w[1] === "☀️" ? "🌙" : w[1];
    $("wx").innerHTML = `<span class="wx-ic">${icon}</span> <b>${Math.round(cur.temperature_2m)}°C</b> <span class="soft">${esc(w[2])}</span>`;
  } catch {}
}

async function foodPhoto(p, img) {
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.dish.wiki.replace(/ /g, "_"))}`);
    const j = r.ok ? await r.json() : null, src = j?.thumbnail?.source;
    if (src && img && S.here === p) { img.onerror = () => img.remove(); img.src = src.replace(/\/\d+px-/, "/320px-"); img.hidden = false; }
  } catch {}
}

// Dotted lines from each card to the spot on the globe (wide screens only).
function leads() {
  cancelAnimationFrame(S.leadsRaf);
  const svg = $("leads");
  const draw = () => {
    if ($("ring").hidden || phone() || !S.here) { svg.innerHTML = ""; if (!$("ring").hidden) S.leadsRaf = requestAnimationFrame(draw); return; }
    const pt = globe.point(S.here.at[0], S.here.at[1]), box = $("globe").getBoundingClientRect();
    if (!pt) { svg.innerHTML = ""; S.leadsRaf = requestAnimationFrame(draw); return; }
    const px = pt[0] + box.left, py = pt[1] + box.top - 10;
    svg.innerHTML = [...$("ring").querySelectorAll(".fc")].map((el) => {
      const r = el.getBoundingClientRect(), isLeft = r.left < px;
      const ax = isLeft ? r.right : r.left, ay = r.top + Math.min(36, r.height / 2), mx = (ax + px) / 2;
      return `<path d="M${ax} ${ay}C${mx} ${ay} ${mx} ${py} ${px} ${py}"/><circle cx="${ax}" cy="${ay}" r="3.5"/>`;
    }).join("");
    S.leadsRaf = requestAnimationFrame(draw);
  };
  draw();
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
  hideRing(); $("zoom").hidden = true;
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
$("globe-back").onclick = () => { if (!S.here) return; closeMap(); hideCard(); showRing(S.here); };
$("sat").onclick = () => { store.set("re-sat", !store.get("re-sat", false)); paintSat(); };
function paintSat() {
  const on = store.get("re-sat", false);
  $("sat").setAttribute("aria-pressed", String(on));
  if (S.map?.getLayer("sat")) S.map.setLayoutProperty("sat", "visibility", on ? "visible" : "none");
}

/* ---------------- food ---------------- */
async function showFood(p) {
  const d = p.dish, inMap = !$("map").hidden;
  if (!inMap) { hideRing(); $("dock").hidden = true; globe.scale(1); globe.lift(phone() ? 0.3 : 0); }
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
  $("again").onclick = () => (inMap ? tour(p) : (hideCard(), showRing(p)));
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
