import { createGlobe } from "../radio-roam/globe.js";
import { artistFacts, flag as flagOf, firstSentences } from "../radio-roam/data.js";
import { PLACES } from "./places.js";
import { COUNTRY, EXTRA } from "./extras.js";
import { WORLD } from "./world.js";
import { NAMES } from "./names.js";
import { LANGS } from "./langs.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const phone = () => matchMedia("(max-width: 900px)").matches;
const flag = (cc) => flagOf(cc.toUpperCase());
const rand = (a) => a[Math.floor(Math.random() * a.length)];

// Every country, with its capital as the landing spot. Countries with hand-picked places also get those.
const W = Object.fromEntries(WORLD.map((w) => [w.cc, w]));
const CAPITALS = WORLD.map((w) => ({ id: `c-${w.cc}`, name: w.capital, country: w.name, cc: w.cc, at: w.at, dish: w.food, capitalStop: true }));
for (const p of PLACES) if (!p.dish.bcp47 && EXTRA[p.id]?.hello?.bcp47) p.dish.bcp47 = EXTRA[p.id].hello.bcp47;
const STOPS = [...PLACES, ...CAPITALS];
const STOP = Object.fromEntries(STOPS.map((p) => [p.id, p]));
const COUNTRIES = new Set(WORLD.map((w) => w.cc));
const TITLES = [[0, "Wanderer"], [3, "Traveller"], [8, "Explorer"], [15, "Consul"], [30, "Governor"], [60, "Emperor"], [COUNTRIES.size, "Emperor of the whole Roamin' Empire"]];

const S = { view: "globe", km: null, fresh: false, here: null, flying: false, chart: [], track: 0, step: 0, map: null, marker: null, ctl: null };
const globe = createGlobe($("globe"));
globe.setStations(STOPS.map((p) => ({ lon: p.at[0], lat: p.at[1] })));
const audio = $("audio");

// This week's charts, fetched by the site's daily build (see tools/charts.mjs).
const charts = fetch("charts.json").then((r) => (r.ok ? r.json() : null)).then((j) => j?.charts || {}).catch(() => ({}));
// Today's headlines, also fetched by the daily build (tools/news.mjs).
const news = fetch("news.json").then((r) => (r.ok ? r.json() : null)).then((j) => j?.news || {}).catch(() => ({}));

// Everything the cards need for a stop: hand-written extras win, then the country's entry.
function info(p) {
  const w = W[p.cc] || {}, c = COUNTRY[p.cc] || {}, x = EXTRA[p.id] || {};
  return {
    w, capital: c.capital || w.capital, capitalWiki: w.capitalWiki || c.capital || w.capital, note: c.note, money: c.money || w.money, drive: c.drive || w.drive,
    tz: x.tz || w.tz, hello: x.hello || w.hello, visit: x.visit || w.visit, only: x.only || w.only, book: w.book, politics: w.politics,
    dish: p.dish || w.food, names: NAMES[p.cc],
  };
}

/* ---------------- the trip ---------------- */
// Go somewhere new: a country you haven't visited if there is one, then a spot in it you haven't seen.
function pick() {
  const been = store.get("re-visited", {}), seen = visitedCountries();
  const fresh = [...COUNTRIES].filter((cc) => !seen.has(cc) && cc !== S.here?.cc);
  const cc = rand(fresh.length ? fresh : [...COUNTRIES].filter((x) => x !== S.here?.cc));
  const spots = STOPS.filter((p) => p.cc === cc && p !== S.here);
  const unseen = spots.filter((p) => !been[p.id]);
  const featured = unseen.filter((p) => !p.capitalStop);
  return rand(featured.length ? featured : unseen.length ? unseen : spots);
}
function visitedCountries() { return new Set(Object.keys(store.get("re-visited", {})).map((id) => STOP[id]?.cc).filter(Boolean)); }

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
  if (!S.chart.length) return `<p class="soft">Apple Music doesn't publish a chart for ${esc(p.country)}, so this stop is a quiet one. Listen to the wind.</p>`;
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
  const links = $("song-links"), s = S.chart[S.track];
  if (links) { links.hidden = !s; if (s) { $("song-link").href = s.url; $("song-ytm").href = `https://music.youtube.com/search?q=${encodeURIComponent(`${s.artist} ${s.name}`)}`; } }
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

function fc(kind, icon, title, body, i, pic = false) {
  return `<article class="fc fc-${kind}${pic ? " has-pic" : ""}" style="--r:${tilt(i)};--i:${i}" ${pic ? `data-pic="${kind}" tabindex="0" role="button" aria-label="${esc(title)}: show a picture"` : ""}><span class="ic" aria-hidden="true">${icon}</span>${pic ? `<span class="tap" aria-hidden="true">📷</span>` : ""}<h3>${title}</h3>${body}</article>`;
}

function showRing(p) {
  const { km, fresh } = S, I = info(p), d = I.dish;
  S.view = "land";
  const inCapital = I.capital && p.name.split(",")[0].trim() === I.capital;
  const speakBtn = (what, label) => `<button class="say-btn" type="button" data-say="${what}" aria-label="Hear ${esc(label)}">🔊</button>`;
  const left = [
    fc("song", "🎵", `Top of the charts in ${esc(p.country)}`, `<div id="song-slot"></div><p class="song-links" id="song-links" hidden><a class="ytm-link" id="song-ytm" target="_blank" rel="noopener">♡ Save to YouTube Music</a> <a class="src" id="song-link" target="_blank" rel="noopener">Apple Music ↗</a></p>`, 0),
    d ? fc("food", "🌱", "Must-eat veg", `<div class="food"><img id="food-photo" alt="" hidden><div><b class="big">${esc(d.name)} ${speakBtn("food", d.name)}</b>${d.say ? `<i class="say">${esc(d.say)}</i>` : ""}<span class="veg">Vegetarian</span></div></div><p class="clamp">${esc(d.what)}</p>`, 1, true) : "",
    I.visit ? fc("visit", "📍", "Must visit", `<b class="big">${esc(I.visit.name)}</b><p class="clamp">${esc(I.visit.why)}</p>`, 2, true) : "",
    I.book ? fc("book", "📚", "Read its history", `<b class="big book-t">${esc(I.book.title)}</b><p class="by">${esc(I.book.author)}${I.book.year ? `, ${esc(I.book.year)}` : ""}</p><p class="soft small">${I.book.original && I.book.original !== "English" ? `Translated from ${esc(I.book.original)}` : "Written in English"}${I.book.local === false ? " · by an outsider" : ""}</p>`, 3, true) : "",
  ];
  const right = [
    I.only ? fc("only", "✨", "Only here", `<p>${esc(I.only)}</p>`, 4, true) : "",
    I.hello ? fc("hello", "💬", "Say hello", `<div class="hello-row"><b class="huge">${esc(I.hello.word)}</b>${speakBtn("hello", I.hello.word)}</div>${I.hello.script ? `<p class="script">${esc(I.hello.script)}</p>` : ""}<p><i>${esc(I.hello.say)}</i> · ${esc(I.hello.lang)}</p>${langOf(I.hello.lang) ? `<p class="soft small">Tap to see where ${esc(langName(I.hello.lang))} comes from</p>` : ""}`, 5, !!langOf(I.hello.lang)) : "",
    I.politics ? fc("politics", "⚖️", "Who runs it", `<p class="sys">${esc(I.politics.system)}</p><div id="leaders" class="leaders"><span class="soft small">Looking up who's in charge…</span></div>`, 6, true) : "",
    fc("know", "🏛️", "Good to know", `<p class="kv"><span>Capital</span><b>${esc(I.capital || "")}</b></p>${inCapital ? `<p class="hl">You're standing in it!</p>` : I.note ? `<p class="soft small">${esc(I.note[0].toUpperCase() + I.note.slice(1))}.</p>` : ""}<p class="kv"><span>Money</span><b>${esc(I.money || "")}</b></p><p class="kv"><span>Driving</span><b>on the ${esc(I.drive || "?")}${I.drive === "left" ? " (look right first!)" : ""}</b></p>`, 7, true),
  ];
  $("ring").innerHTML = `
    <header class="ring-head"><span class="flag">${flag(p.cc)}</span><div><h2>${esc(p.name)}</h2><p>${p.name.split(",")[0].trim() !== p.country ? `${esc(p.country)} · ` : ""}${km != null ? `${km.toLocaleString()} km floated` : "your first stop"}${fresh ? ` · <b>new to your empire!</b>` : ""}</p>
      <p class="now-line"><span>🕰️ <b id="clock">--:--</b> <span id="offset"></span></span><span id="wx"></span></p></div></header>
    <div class="col left">${left.join("")}</div><div class="col right">${right.join("")}</div>
    <div class="col bottom"><div id="names-slot">${I.names ? namesCard(I.names) : ""}</div><div id="news-slot"></div></div>`;
  $("ring").hidden = false; $("ring").scrollTop = 0;
  requestAnimationFrame(() => $("ring").classList.add("in"));
  $("zoom").hidden = false; $("zoom").disabled = false; $("dock").hidden = false;
  document.body.classList.add("landed");
  globe.lift(phone() ? 0.3 : 0.04); globe.scale(phone() ? 0.9 : 0.6);
  const city = p.name.split(",")[0].trim();
  const pics = {
    food: d && { kind: "🌱 Must-eat veg", title: d.name, text: d.what, find: () => wikiPic({ exact: d.wiki, search: `${d.name} food` }) },
    visit: I.visit && { kind: "📍 Must visit", title: I.visit.name, text: I.visit.why, find: () => wikiPic({ exact: I.visit.wiki, search: `${I.visit.name} ${city}` }) },
    only: { kind: "✨ Only here", title: p.name, text: I.only, find: () => wikiPic({ exact: p.capitalStop ? I.capitalWiki : p.wiki, search: p.name }) },
    know: { kind: `🏛️ Capital of ${p.country}`, title: I.capital, text: inCapital ? "You're standing in it!" : I.note ? `${I.note[0].toUpperCase() + I.note.slice(1)}.` : "", find: () => wikiPic({ exact: I.capitalWiki, search: `${I.capital} city` }) },
    book: I.book && { kind: "📚 Read its history", title: I.book.title, sub: `${I.book.author}${I.book.year ? `, ${I.book.year}` : ""}${I.book.original && I.book.original !== "English" ? ` · translated from ${I.book.original}` : ""}`, text: I.book.about, cover: true, find: () => bookCover(I.book) },
    hello: I.hello && langOf(I.hello.lang) && { kind: `💬 Where ${langName(I.hello.lang)} comes from`, title: langName(I.hello.lang), sub: langOf(I.hello.lang).family, text: langOf(I.hello.lang).about, plain: true, extra: () => mixHTML(langOf(I.hello.lang).mix) },
    names: I.names && { kind: `👶 Typical names in ${p.country}`, title: `${I.names.girl.first} ${I.names.girl.last} & ${I.names.boy.first} ${I.names.boy.last}`, text: I.names.about, plain: true, extra: () => `<div class="kids big-kids">${kid(I.names.girl, "girl", I.names.tone)}${kid(I.names.boy, "boy", I.names.tone)}</div>` },
    politics: I.politics && { kind: `⚖️ Who runs ${p.country}`, title: I.politics.system, text: I.politics.about, find: () => leaders(p.cc).then((L) => L.photo ? { src: L.photo, url: L.url, caption: L.photoOf, linkText: "More on Wikidata ↗" } : null), extra: () => leadersHTML(S.leaders) },
  };
  for (const el of $("ring").querySelectorAll("[data-pic]")) {
    const open = (e) => { if (e.target.closest("button, a")) return; const pic = pics[el.dataset.pic]; if (pic) { showPic(pic); if (el.dataset.pic === "food") tasted(p); } };
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e) => { if (e.target === el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(e); } });
  }
  S.sayCtx = { I, d };
  wireSay($("ring"));
  paintSong();
  tickClock(I.tz); weather(p); if (d) foodPhoto(d, p, $("food-photo"));
  if (I.politics) leaders(p.cc).then((L) => { if (S.here === p && $("leaders")) $("leaders").innerHTML = leadersHTML(L) || `<span class="soft small">Couldn't look that up right now.</span>`; });
  paintNews(p);
  leads();
}

function hideRing() {
  $("ring").classList.remove("in"); $("ring").hidden = true; $("ring").innerHTML = ""; $("leads").innerHTML = "";
  $("zoom").hidden = true; document.body.classList.remove("landed");
  clearInterval(S.clock);
}

function tickClock(tz) {
  clearInterval(S.clock);
  if (!tz) return;
  const fmt = new Intl.DateTimeFormat([], { timeZone: tz, hour: "numeric", minute: "2-digit", weekday: "short" });
  const tick = () => { const el = $("clock"); if (el) el.textContent = fmt.format(new Date()); };
  tick(); S.clock = setInterval(tick, 15000);
  // How far ahead or behind you they are.
  const off = new Intl.DateTimeFormat("en", { timeZone: tz, timeZoneName: "longOffset" }).formatToParts(new Date()).find((x) => x.type === "timeZoneName")?.value || "GMT";
  const m = off.match(/([+-])(\d{2}):?(\d{2})?/), theirs = m ? (m[1] === "-" ? -1 : 1) * (+m[2] * 60 + +(m[3] || 0)) : 0;
  const diff = theirs + new Date().getTimezoneOffset(), h = Math.floor(Math.abs(diff) / 60), mm = Math.abs(diff) % 60;
  $("offset").textContent = diff === 0 ? "· same time as you" : `· ${`${h ? `${h} h` : ""}${mm ? ` ${mm} min` : ""}`.trim()} ${diff > 0 ? "ahead of" : "behind"} you`;
}

async function weather(p) {
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.at[1]}&longitude=${p.at[0]}&current=temperature_2m,weather_code,is_day`);
    const j = await r.json(), cur = j.current; if (!cur || S.here !== p || !$("wx")) return;
    const w = WEATHER.find(([codes]) => codes.includes(cur.weather_code)) || [[], "🌡️", ""];
    const icon = !cur.is_day && w[1] === "☀️" ? "🌙" : w[1];
    $("wx").innerHTML = `<span class="wx-ic">${icon}</span> <b>${Math.round(cur.temperature_2m)}°C</b> ${esc(w[2].toLowerCase())}`;
  } catch {}
}

async function foodPhoto(d, p, img) {
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(d.wiki.replace(/ /g, "_"))}`);
    const j = r.ok ? await r.json() : null, src = j?.thumbnail?.source;
    if (src && img && S.here === p) { img.onerror = () => img.remove(); img.src = src; img.hidden = false; }
  } catch {}
}

/* ---------------- tap a card for a picture ---------------- */
const picCache = new Map();
async function wikiPic({ exact, search }) {
  const key = exact || search;
  if (picCache.has(key)) return picCache.get(key);
  // Wikimedia only serves thumbnails at standard widths (330, 500, 960…) and never wider than the original.
  const big = (j) => (j.originalimage && j.originalimage.width <= 1280 ? j.originalimage.source : j.originalimage && j.thumbnail ? j.thumbnail.source.replace(/\/\d+px-/, "/960px-") : j.thumbnail?.source);
  let out = null;
  if (exact) {
    try {
      const j = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(exact.replace(/ /g, "_"))}`).then((r) => (r.ok ? r.json() : null));
      if (j?.thumbnail?.source && j.type !== "disambiguation") out = { src: big(j), url: j.content_urls?.desktop?.page };
    } catch {}
  }
  if (!out && search) {
    try {
      const j = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(search)}&gsrlimit=3&prop=pageimages|info&piprop=thumbnail&pithumbsize=960&inprop=url&format=json&origin=*`).then((r) => r.json());
      const pages = Object.values(j?.query?.pages || {}).sort((a, b) => a.index - b.index);
      const hit = pages.find((pg) => pg.thumbnail?.source);
      if (hit) out = { src: hit.thumbnail.source, url: hit.fullurl };
    } catch {}
  }
  picCache.set(key, out);
  return out;
}

async function showPic(pic) {
  const d = $("pic"), img = $("pic-img");
  $("pic-kind").textContent = pic.kind; $("pic-title").textContent = pic.title; $("pic-sub").textContent = pic.sub || ""; $("pic-text").textContent = pic.text || "";
  $("pic-extra").innerHTML = pic.extra ? pic.extra() || "" : ""; $("pic-cap").textContent = "";
  $("pic-src").hidden = true; img.hidden = true; img.removeAttribute("src");
  d.classList.toggle("cover", !!pic.cover); d.classList.toggle("clip", !!pic.clip); d.classList.toggle("plain", !!pic.plain);
  d.classList.add("loading"); d.classList.remove("nopic");
  if (!d.open) d.showModal();
  if (pic.link) { $("pic-src").href = pic.link.url; $("pic-src").textContent = pic.link.text; $("pic-src").hidden = false; }
  const found = pic.find ? await pic.find().catch(() => null) : null;
  if ($("pic-title").textContent !== pic.title) return;
  if (pic.extra) $("pic-extra").innerHTML = pic.extra() || "";
  if (pic.plain) { d.classList.remove("loading"); wireSay($("pic-extra")); return; }
  if (!found) { d.classList.remove("loading"); d.classList.add("nopic"); return; }
  img.onload = () => { d.classList.remove("loading"); img.hidden = false; };
  img.onerror = () => { d.classList.remove("loading"); d.classList.add("nopic"); };
  img.alt = found.caption || pic.title; img.src = found.src; $("pic-cap").textContent = found.caption || "";
  if (found.url && !pic.link) { $("pic-src").href = found.url; $("pic-src").textContent = found.linkText || "Photo and more on Wikipedia ↗"; $("pic-src").hidden = false; }
}

/* ---------------- book covers (Open Library) ---------------- */
async function bookCover(b) {
  const j = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(b.title)}&author=${encodeURIComponent(b.author)}&limit=3&fields=key,cover_i`).then((r) => r.json());
  const hit = (j.docs || []).find((x) => x.cover_i) || j.docs?.[0];
  return hit?.cover_i ? { src: `https://covers.openlibrary.org/b/id/${hit.cover_i}-L.jpg`, url: `https://openlibrary.org${hit.key}`, linkText: "Find it on Open Library ↗" } : null;
}

/* ---------------- who's in charge, live from Wikidata ---------------- */
const leaderCache = new Map();
function leaders(cc) {
  if (leaderCache.has(cc)) return leaderCache.get(cc);
  const q = `SELECT ?role ?p ?pLabel ?img ?officeLabel ?start WHERE {
    ?c wdt:P297 "${cc.toUpperCase()}".
    { ?c p:P35 ?st. ?st ps:P35 ?p. BIND("state" AS ?role) OPTIONAL { ?c wdt:P1906 ?office } }
    UNION { ?c p:P6 ?st. ?st ps:P6 ?p. BIND("gov" AS ?role) OPTIONAL { ?c wdt:P1313 ?office } }
    ?st wikibase:rank ?rank. FILTER(?rank != wikibase:DeprecatedRank)
    FILTER NOT EXISTS { ?st pq:P582 ?end }
    OPTIONAL { ?st pq:P580 ?start }
    OPTIONAL { ?p wdt:P18 ?img }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;
  const job = fetch(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`, { headers: { accept: "application/sparql-results+json" } })
    .then((r) => r.json()).then((j) => {
      const rows = j.results.bindings.map((b) => ({ role: b.role.value, name: b.pLabel?.value, office: b.officeLabel?.value, img: b.img?.value, start: b.start?.value || "", id: b.p.value.split("/").pop() }));
      const latest = (role) => rows.filter((r) => r.role === role && !/^Q\d+$/.test(r.name)).sort((a, b) => b.start.localeCompare(a.start))[0];
      const state = latest("state"), gov = latest("gov"), face = (gov?.img && gov) || (state?.img && state);
      const L = { state, gov, photo: face ? `${face.img.replace(/^http:/, "https:")}?width=960` : null, photoOf: face ? `${face.name}${face.office ? `, ${face.office}` : ""}` : "", url: face ? `https://www.wikidata.org/wiki/${face.id}` : null };
      S.leaders = L; return L;
    }).catch(() => ({}));
  leaderCache.set(cc, job);
  return job;
}
function leadersHTML(L) {
  if (!L?.state && !L?.gov) return "";
  const same = L.state && L.gov && L.state.name === L.gov.name;
  const row = (icon, label, x) => x ? `<p class="kv"><span>${icon} ${label}</span><b>${esc(x.name)}</b>${x.office ? `<em>${esc(x.office)}</em>` : ""}</p>` : "";
  return same ? row("👤", "Leader", L.state) : row("👑", "Head of state", L.state) + row("🏛️", "Government", L.gov);
}

// 🔊 buttons: greetings, dish names and children's names, in the ring or in the picture dialog.
function wireSay(root) {
  const { I, d } = S.sayCtx || {}; if (!I) return;
  for (const b of root.querySelectorAll("[data-say]")) b.onclick = (e) => {
    e.stopPropagation();
    b.classList.add("talking");
    const done = () => b.classList.remove("talking");
    if (b.dataset.say === "hello") speak(I.hello.script || I.hello.word, I.hello.bcp47, I.hello.say, done);
    else if (b.dataset.say === "girl" || b.dataset.say === "boy") { const n = I.names[b.dataset.say]; speak(`${n.first} ${n.last}`, I.hello?.script ? "" : I.hello?.bcp47, n.say, done); }
    else speak(d.name, I.hello?.script ? "" : (d.bcp47 || I.hello?.bcp47), d.say, done);
  };
}

/* ---------------- typical names ---------------- */
const TONES = ["#f6d9c4", "#e9b994", "#c98e64", "#9a6440", "#6b4428"];
function kid(n, who, tone = 3) {
  const skin = TONES[Math.min(5, Math.max(1, tone || 3)) - 1];
  const hair = who === "girl"
    ? `<path d="M14 30c-2-14 6-22 18-22s20 8 18 22c-4-6-10-9-18-9s-14 3-18 9z" fill="#2a1a12"/><circle cx="12" cy="30" r="6" fill="#2a1a12"/><circle cx="52" cy="30" r="6" fill="#2a1a12"/><path d="M24 12l8-6 8 6-8 3z" fill="#ff5d8f"/>`
    : `<path d="M15 28c-1-12 7-19 17-19s18 7 17 19c-3-5-9-8-17-8s-14 3-17 8z" fill="#2a1a12"/>`;
  return `<figure class="kid kid-${who}"><svg viewBox="0 0 64 70" aria-hidden="true">
      <path d="M12 70c2-12 10-18 20-18s18 6 20 18z" fill="${who === "girl" ? "#ffb347" : "#2bb3a3"}"/>
      <circle cx="32" cy="32" r="18" fill="${skin}"/>${hair}
      <circle cx="26" cy="33" r="2" fill="#2a1a12"/><circle cx="38" cy="33" r="2" fill="#2a1a12"/>
      <path d="M26 40q6 5 12 0" fill="none" stroke="#2a1a12" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="22" cy="38" r="2.6" fill="#ff8a80" opacity=".45"/><circle cx="42" cy="38" r="2.6" fill="#ff8a80" opacity=".45"/>
    </svg><figcaption><b>${esc(n.first)}</b> ${esc(n.last)} <button class="say-btn mini" type="button" data-say="${who}" aria-label="Hear ${esc(n.first)} ${esc(n.last)}">🔊</button><i>${esc(n.say || "")}</i></figcaption></figure>`;
}
function namesCard(N) {
  return `<article class="fc fc-names has-pic" data-pic="names" tabindex="0" role="button" aria-label="Typical names: tap for where they come from" style="--r:1deg;--i:8"><span class="ic" aria-hidden="true">👶</span><span class="tap" aria-hidden="true">💡</span><h3>Typical names</h3><div class="kids">${kid(N.girl, "girl", N.tone)}${kid(N.boy, "boy", N.tone)}</div></article>`;
}

/* ---------------- where the language comes from ---------------- */
const langName = (l) => l.replace(/\s*\(.*\)\s*$/, "").split(",")[0].trim();
const langOf = (l) => l && (LANGS[l] || LANGS[langName(l)]);
const MIX = ["#ffd166", "#ff7a59", "#6fd6ff", "#5fd38d", "#b69bff", "#ff7ac6", "#9fb4ff"];
function mixHTML(mix) {
  if (!mix?.length) return "";
  return `<h4 class="mix-h">Where its words come from <span>(roughly)</span></h4>
    <div class="mix-bar">${mix.map(([src, pct], i) => `<span style="flex:${pct};background:${MIX[i % MIX.length]}" title="${esc(src)}: ${pct}%"></span>`).join("")}</div>
    <ul class="mix-key">${mix.map(([src, pct], i) => `<li><i style="background:${MIX[i % MIX.length]}"></i>${esc(src)} <b>${pct}%</b></li>`).join("")}</ul>`;
}

/* ---------------- today's news ---------------- */
async function paintNews(p) {
  const items = (await news)[p.cc] || [];
  const slot = $("news-slot"); if (!slot || S.here !== p) return;
  if (!items.length) { slot.remove(); return; }
  const n = items[0], day = new Date(n.date).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
  slot.innerHTML = `<article class="clipping" tabindex="0" role="button" aria-label="Open the news from ${esc(p.country)}" style="--i:8">
    <div class="mast"><span>THE DAILY ROAM</span><span>${esc(day)}</span></div>
    <h3>${esc(n.title)}</h3><p class="src-line">${esc(n.source)} · tap for more</p></article>`;
  const open = () => showPic({ kind: `📰 News from ${p.country}`, title: n.title, sub: `${n.source} · ${day}`, clip: true,
    link: { url: n.url, text: "Read the full story ↗" },
    extra: () => items.length > 1 ? `<h4>Also in the news</h4><ul class="more-news">${items.slice(1).map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a> <span class="soft">${esc(x.source)}</span></li>`).join("")}</ul>` : "" });
  const el = slot.querySelector(".clipping");
  el.onclick = open; el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } };
}

/* ---------------- say it out loud ---------------- */
function speak(text, tag, say, done) {
  const synth = window.speechSynthesis;
  if (!synth) return done?.();
  synth.cancel();
  const voices = synth.getVoices(), t = (tag || "").toLowerCase(), base = t.split("-")[0];
  const voice = t && (voices.find((v) => v.lang.toLowerCase().replace("_", "-") === t) || voices.find((v) => v.lang.toLowerCase().split(/[-_]/)[0] === base));
  // No voice for this language on your device: read the pronunciation guide in English instead.
  const u = new SpeechSynthesisUtterance(voice ? text : (say || text).replace(/-/g, " ").toLowerCase());
  if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-US";
  u.rate = 0.8;
  const vol = audio.volume; audio.volume = Math.min(vol, 0.15);
  u.onend = u.onerror = () => { audio.volume = vol; done?.(); };
  synth.speak(u);
}
window.speechSynthesis?.getVoices();
$("pic").addEventListener("click", (e) => { if (e.target.closest("[data-close]") || e.target.id === "pic") $("pic").close(); });

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
// Capital stops don't have hand-written tours, so tour the most interesting things nearby on Wikipedia.
async function nearby(p) {
  try {
    const j = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${p.at[1]}|${p.at[0]}&ggsradius=10000&ggslimit=40&prop=coordinates|pageimages|extracts&exintro=1&explaintext=1&exsentences=2&exlimit=20&piprop=thumbnail&pithumbsize=200&format=json&origin=*`).then((r) => r.json());
    const skip = new RegExp(`^(${[p.name, p.country].map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})$`, "i");
    const pages = Object.values(j?.query?.pages || {}).filter((pg) => pg.coordinates && pg.extract && pg.extract.length > 80 && !skip.test(pg.title) && !/(station|district|ward|constituency|school|embassy|street|road|stop)\b/i.test(pg.title));
    pages.sort((a, b) => (b.thumbnail ? 1 : 0) - (a.thumbnail ? 1 : 0) || b.extract.length - a.extract.length);
    const look = pages.slice(0, 4).map((pg) => ({ at: [pg.coordinates[0].lon, pg.coordinates[0].lat], z: 16.2, title: pg.title, t: pg.extract }));
    if (look.length) return look;
  } catch {}
  return [{ at: p.at, z: 12.5, title: p.name, t: `Welcome to ${p.name}. Drag the map around and explore the streets.` }];
}

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
  S.step = 0;
  if (!p.look) { setStatus("Finding things to look at…"); p.look = await nearby(p); setStatus(""); }
  tour(p);
}

function tour(p) {
  S.view = "tour";
  const n = p.look.length, v = p.look[S.step];
  S.marker.setLngLat(v.at).addTo(S.map);
  S.map.flyTo({ center: v.at, zoom: v.z - (phone() ? 0.6 : 0), speed: S.step === 0 ? 0.9 : 1.2, curve: 1.5, essential: true, padding: phone() ? { bottom: innerHeight * 0.45 } : { left: 400 } });
  card(`
    <div class="where"><span class="flag">${flag(p.cc)}</span><div><b>${esc(p.name)}</b><span>${p.capitalStop ? "Around town" : "Look closer"} · ${S.step + 1} of ${n}</span></div></div>
    <div class="steps" aria-hidden="true">${p.look.map((_, i) => `<i class="${i <= S.step ? "on" : ""}"></i>`).join("")}</div>
    ${v.title ? `<h3 class="look-t">${esc(v.title)}</h3>` : ""}<p class="notice">${esc(v.t)}</p>
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
  const d = info(p).dish, inMap = !$("map").hidden;
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
    const thumb = j?.thumbnail?.source, src = j?.originalimage && j.originalimage.width > 500 && thumb ? thumb.replace(/\/\d+px-/, "/500px-") : j?.originalimage?.source || thumb;
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
// Your title is earned by quiz: you can sit the next one once you've visited enough countries.
const rank = () => Math.min(store.get("re-rank", 0), TITLES.length - 1);
const title = () => TITLES[rank()][1];
const nextTitle = () => TITLES[rank() + 1];
const canUpgrade = () => !!nextTitle() && visitedCountries().size >= nextTitle()[0];
function paintTitle() { $("title").textContent = title(); $("upgrade").hidden = !canUpgrade(); }

$("passport-btn").onclick = () => {
  const v = store.get("re-visited", {}), tasted = store.get("re-tasted", {}), n = visitedCountries().size;
  const nextT = nextTitle();
  const stamps = Object.entries(v).filter(([id]) => STOP[id]).sort((a, b) => a[1].first.localeCompare(b[1].first));
  $("pp-body").innerHTML = `
    <p class="rank">${esc(title())}</p>
    <div class="meter"><i style="width:${(n / COUNTRIES.size) * 100}%"></i></div>
    <p class="soft small">${n} of ${COUNTRIES.size} countries · ${stamps.length} place${stamps.length === 1 ? "" : "s"} · ${Object.keys(tasted).length} dishes tasted</p>
    ${nextT ? (canUpgrade() ? `<button class="btn go" type="button" data-quiz>👑 Take the quiz to become ${esc(nextT[1])}</button>` : `<p class="soft small">Visit ${nextT[0] - n} more countr${nextT[0] - n === 1 ? "y" : "ies"} to unlock the quiz for <b>${esc(nextT[1])}</b>.</p>`) : ""}
    <h3>Your stamps</h3>
    ${stamps.length ? `<div class="stamps">${stamps.map(([id], i) => { const p = STOP[id]; return `<button type="button" class="stamp" data-go="${id}" style="--r:${((i * 37) % 13) - 6}deg"><span>${flag(p.cc)}</span><b>${esc(p.name.split(",")[0])}</b><i>${tasted[id] ? "🌱 tasted" : esc(p.country)}</i></button>`; }).join("")}</div>` : `<p>No stamps yet. Take a trip!</p>`}`;
  $("passport").showModal();
};
$("passport").addEventListener("click", (e) => {
  if (e.target.closest("[data-close]") || e.target.id === "passport") return $("passport").close();
  if (e.target.closest("[data-quiz]")) { $("passport").close(); return startQuiz(); }
  const go = e.target.closest("[data-go]");
  if (go) { $("passport").close(); const p = STOP[go.dataset.go]; if (p && p !== S.here) trip(p); }
});

/* ---------------- title upgrade quiz ---------------- */
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function makeQuiz() {
  const v = store.get("re-visited", {});
  const mine = shuffle(Object.keys(v).map((id) => STOP[id]).filter(Boolean));
  const others = (cc) => shuffle(WORLD.filter((w) => w.cc !== cc));
  const opts = (right, wrong) => shuffle([right, ...shuffle([...new Set(wrong.filter((x) => x && x !== right))]).slice(0, 3)]);
  const makers = [
    (p, I) => I.capital && { q: `What's the capital of ${p.country}?`, a: I.capital, o: opts(I.capital, others(p.cc).map((w) => w.capital)) },
    (p, I) => I.dish && { q: `Which country's must-eat veg dish is ${I.dish.name}?`, a: p.country, o: opts(p.country, others(p.cc).map((w) => w.name)) },
    (p, I) => I.hello && { q: `Where would you greet people with "${I.hello.word}"?`, a: p.country, o: opts(p.country, others(p.cc).filter((w) => w.hello?.word !== I.hello.word).map((w) => w.name)) },
    (p, I) => I.visit && { q: `${I.visit.name} is a must-visit in which country?`, a: p.country, o: opts(p.country, others(p.cc).map((w) => w.name)) },
    (p, I) => I.money && { q: `What money do they use in ${p.country}?`, a: I.money, o: opts(I.money, others(p.cc).map((w) => w.money)) },
    (p, I) => I.drive && { q: `Which side of the road do they drive on in ${p.country}?`, a: `On the ${I.drive}`, o: ["On the left", "On the right"] },
    (p, I) => I.book && { q: `Which novel would teach you the history of ${p.country}?`, a: I.book.title, o: opts(I.book.title, others(p.cc).map((w) => w.book?.title)) },
    (p, I) => I.only && { q: `Only here: "${I.only.replace(new RegExp(p.country.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "____")}" Where is here?`, a: p.country, o: opts(p.country, others(p.cc).map((w) => w.name)) },
  ];
  // Questions only come from the cards of places you've flown to, spread across all of them.
  const qs = [], used = new Set();
  for (let round = 0; qs.length < 10 && round < 80; round++) {
    const p = mine[round % mine.length], I = info(p), m = makers[Math.floor(Math.random() * makers.length)];
    const q = m(p, I); if (!q || q.o.length < 2 || used.has(q.q)) continue;
    used.add(q.q); q.from = p.name.split(",")[0]; q.cc = p.cc; qs.push(q);
  }
  return qs;
}

function startQuiz() {
  if (!canUpgrade()) return;
  const Q = { qs: makeQuiz(), i: 0, right: 0, goal: nextTitle() };
  if (Q.qs.length < 10) { setStatus("Take a few more trips first: there isn't enough to quiz you on yet."); return; }
  const d = $("quiz");
  const ask = () => {
    const q = Q.qs[Q.i];
    d.querySelector(".quiz-body").innerHTML = `
      <p class="label">Question ${Q.i + 1} of 10 · to become ${esc(Q.goal[1])}</p>
      <div class="dots">${Q.qs.map((_, i) => `<i class="${i < Q.i ? (Q.qs[i].ok ? "ok" : "no") : i === Q.i ? "on" : ""}"></i>`).join("")}</div>
      <p class="from">${flag(q.cc)} From your stop in ${esc(q.from)}</p>
      <h2>${esc(q.q)}</h2>
      <div class="choices">${q.o.map((o) => `<button type="button" class="choice" data-a="${esc(o)}">${esc(o)}</button>`).join("")}</div>
      <p class="verdict" id="verdict"></p>`;
    for (const b of d.querySelectorAll(".choice")) b.onclick = () => {
      if (q.done) return; q.done = true; q.ok = b.dataset.a === q.a; if (q.ok) Q.right++;
      for (const x of d.querySelectorAll(".choice")) { x.disabled = true; if (x.dataset.a === q.a) x.classList.add("right"); }
      if (!q.ok) b.classList.add("wrong");
      $("verdict").innerHTML = q.ok ? "✅ Yes!" : `❌ It's <b>${esc(q.a)}</b>.`;
      setTimeout(() => { Q.i++; Q.i < 10 ? ask() : finish(); }, q.ok ? 900 : 1700);
    };
  };
  const finish = () => {
    const pass = Q.right >= 8;
    if (pass) { store.set("re-rank", rank() + 1); paintTitle(); }
    d.querySelector(".quiz-body").innerHTML = pass
      ? `<div class="crowned"><span class="crown">👑</span><p class="label">${Q.right} out of 10</p><h2>All hail ${esc(Q.goal[1])}!</h2><p>Your new title is on the top right. ${nextTitle() ? `Visit ${Math.max(0, nextTitle()[0] - visitedCountries().size)} more countries to try for ${esc(nextTitle()[1])}.` : "You've conquered the whole Roamin' Empire."}</p><button class="btn go" type="button" data-close>Onwards</button></div>`
      : `<div class="crowned"><span class="crown sad">🫠</span><p class="label">${Q.right} out of 10</p><h2>So close.</h2><p>You need 8 to become ${esc(Q.goal[1])}. Peek at your stamps, then try again whenever you like.</p><div class="actions"><button class="btn go" type="button" data-retry>Try again</button><button class="btn" type="button" data-close>Later</button></div></div>`;
    const r = d.querySelector("[data-retry]"); if (r) r.onclick = () => { d.close(); startQuiz(); };
  };
  ask(); d.showModal();
}
$("quiz").addEventListener("click", (e) => { if (e.target.closest("[data-close]") || e.target.id === "quiz") $("quiz").close(); });
$("upgrade").onclick = startQuiz;

function setStatus(t) { $("status").textContent = t; }
document.addEventListener("keydown", (e) => { if (e.key === " " && e.target === document.body) { e.preventDefault(); trip(); } });
paintTitle();
