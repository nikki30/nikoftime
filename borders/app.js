import { geoEqualEarth, geoPath, geoGraticule10, geoArea, feature } from "../vendor/geo.mjs";
import { SNAPSHOTS } from "./snapshots.js";
import { JOURNEYS, TREE, TREE_NOTES } from "./human.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const NS = "http://www.w3.org/2000/svg";

// The written history for each snapshot (why things changed). Optional: the app works without it.
let STORIES = {};
import("./stories.js").then((m) => { STORIES = Object.fromEntries(m.STORIES.map((s) => [s.year, s])); paintPanel(); }).catch(() => {});

const yearLabel = (y) => (y < 0 ? `${Math.abs(y).toLocaleString()} BC` : y < 1000 ? `AD ${y}` : `${y}`);
const kmLabel = (km) => (km >= 1e6 ? `${(km / 1e6).toFixed(1)} million km²` : `${Math.round(km / 1000).toLocaleString()},000 km²`);
const INDIA = 3.287e6;
const compare = (km) => km > 1.5 * INDIA ? `about ${(km / INDIA).toFixed(1)}× the size of India` : km > 0.6 * INDIA ? "about the size of India" : km > 0.2 * INDIA ? `about ${Math.round((km / INDIA) * 100)}% of India` : "";

/* ---------------- colours: neighbours always differ ---------------- */
// Eight clearly different hues. Each state prefers the colour picked from its name (so it usually keeps it from
// map to map), but takes the next free one if a neighbour already has it.
const PALETTE = ["#e2b45e", "#d4876a", "#9fc07e", "#d99ab3", "#8db4de", "#b59fdc", "#74bfb1", "#c9cf6e"];
const hash = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const polysOf = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);
// Two states are neighbours if their borders share a point.
function neighbours(feats) {
  const at = new Map(), nb = new Map();
  const link = (a, b) => { if (!nb.has(a)) nb.set(a, new Set()); nb.get(a).add(b); };
  for (const f of feats) {
    const k = keyOf(f.properties); if (!k) continue;
    for (const poly of polysOf(f.geometry)) for (const ring of poly) for (const c of ring) {
      const id = `${c[0].toFixed(3)},${c[1].toFixed(3)}`, here = at.get(id);
      if (!here) at.set(id, [k]);
      else if (!here.includes(k)) { here.forEach((o) => { link(o, k); link(k, o); }); here.push(k); }
    }
  }
  return nb;
}
function colourMap(feats) {
  const nb = neighbours(feats), area = new Map(), out = new Map();
  for (const f of feats) { const k = keyOf(f.properties); if (k) area.set(k, (area.get(k) || 0) + geoArea(f)); }
  // Biggest first, so the large empires keep their usual colour.
  for (const k of [...area.keys()].sort((a, b) => area.get(b) - area.get(a))) {
    const taken = new Set([...(nb.get(k) || [])].map((n) => out.get(n)));
    const h = hash(k); let c = h % PALETTE.length;
    for (let t = 1; t < PALETTE.length && taken.has(c); t++) c = (h + t) % PALETTE.length;
    out.set(k, PALETTE[c]);
  }
  return out;
}
const keyOf = (p) => (p.SUBJECTO || p.NAME || "").trim();

/* ---------------- loading snapshots ---------------- */
const cache = new Map();
function load(i) {
  if (!cache.has(i)) cache.set(i, fetch(`maps/${SNAPSHOTS[i].file}`).then((r) => r.json()).then((t) => feature(t, t.objects[Object.keys(t.objects)[0]]).features.filter((f) => f.geometry).map(rewind)).then((feats) => Object.assign(feats, { colours: colourMap(feats) })));
  return cache.get(i);
}

// Some shapes in the data are wound the "wrong way", which on a globe means "everything except this shape".
// Flip those so they don't paint over the oceans.
function rewind(f) {
  if (geoArea(f) <= 2 * Math.PI) return f;
  const g = f.geometry, flip = (rings) => rings.map((r) => [...r].reverse());
  return { ...f, geometry: g.type === "Polygon" ? { ...g, coordinates: flip(g.coordinates) } : { ...g, coordinates: g.coordinates.map(flip) } };
}

/* ---------------- the map ---------------- */
const svg = $("map");
const S = { i: 0, playing: null, view: { k: 1, x: 0, y: 0 }, focus: null, selected: null, feats: [] };
let proj, path, W = 0, H = 0;
const root = document.createElementNS(NS, "g"); svg.append(root);
const gSea = document.createElementNS(NS, "g"), gLand = document.createElementNS(NS, "g"), gGhost = document.createElementNS(NS, "g"), gLabel = document.createElementNS(NS, "g"), gMark = document.createElementNS(NS, "g");
gLabel.setAttribute("class", "plabels");
root.append(gSea, gLand, gGhost, gLabel, gMark);

function size() {
  const r = svg.getBoundingClientRect(); W = r.width; H = r.height;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  proj = geoEqualEarth().fitExtent([[10, 10], [W - 10, H - 10]], { type: "Sphere" });
  path = geoPath(proj);
  gSea.innerHTML = `<path class="sphere" d="${path({ type: "Sphere" })}"/><path class="grat" d="${path(geoGraticule10())}"/>`;
  draw(false);
}
new ResizeObserver(size).observe(svg);

async function draw(fade = true) {
  if (!path) return;
  const i = S.i, feats = await load(i); if (i !== S.i) return;
  S.feats = feats;
  const story = STORIES[SNAPSHOTS[i].year], movers = changesFor(i);
  const kinds = Object.fromEntries(movers.map((m) => [m.name, m.kind]));
  gLand.innerHTML = feats.map((f, n) => { const k = keyOf(f.properties), kind = kinds[k] || kinds[f.properties.NAME];
    // Land with no name in the data: nobody (no people or state) is recorded there on this map.
    if (!k) return `<path class="land unnamed" data-n="${n}" d="${path(f)}"/>`;
    return `<path class="land${kind ? ` k-${kind}` : ""}${S.focus && (S.focus === k || S.focus === f.properties.NAME) ? " focus" : ""}" data-n="${n}" fill="${feats.colours.get(k)}" d="${path(f)}"/>`; }).join("");
  drawLabels(feats);
  if (fade) { gLand.classList.remove("in"); void gLand.getBoundingClientRect(); gLand.classList.add("in"); }
  // Ghosts: what shrank or vanished, drawn from the previous map as dashed outlines.
  gGhost.innerHTML = "";
  if (i > 0) {
    const lost = new Set(movers.filter((m) => m.kind === "shrank" || m.kind === "vanished").map((m) => m.name));
    if (lost.size) { const prev = await load(i - 1); if (i !== S.i) return; gGhost.innerHTML = prev.filter((f) => lost.has(keyOf(f.properties))).map((f) => `<path class="ghost" d="${path(f)}"/>`).join(""); }
  }
  applyView();
}

/* names on the map: one per state, on its biggest piece, shown only where it fits */
function drawLabels(feats) {
  const best = new Map();
  for (const f of feats) {
    const k = keyOf(f.properties); if (!k) continue;
    for (const poly of polysOf(f.geometry)) {
      const g = { type: "Polygon", coordinates: poly }, a = path.area(g);
      if (a > (best.get(k)?.a || 0)) best.set(k, { a, g });
    }
  }
  gLabel.innerHTML = [...best].map(([k, { g }]) => {
    const [x, y] = path.centroid(g), [[x0, y0], [x1, y1]] = path.bounds(g);
    if (!isFinite(x)) return "";
    return `<text class="plabel" x="${x.toFixed(1)}" y="${y.toFixed(1)}" data-w="${(x1 - x0).toFixed(1)}" data-h="${(y1 - y0).toFixed(1)}" data-c="${k.length}">${esc(k)}</text>`;
  }).join("");
  fitLabels();
}
// A name shows only when its shape is wide and tall enough on screen to hold it.
function fitLabels() {
  const k = S.view.k;
  for (const t of gLabel.children) t.style.display = +t.dataset.w * k > +t.dataset.c * 6.4 + 8 && +t.dataset.h * k > 16 ? "" : "none";
}

/* pan + zoom */
function applyView() { const { k, x, y } = S.view; root.setAttribute("transform", `translate(${x} ${y}) scale(${k})`); svg.style.setProperty("--k", k); fitLabels(); }
function zoomAt(f, cx = W / 2, cy = H / 2) { const v = S.view, k = Math.max(1, Math.min(14, v.k * f)); v.x = cx - ((cx - v.x) * k) / v.k; v.y = cy - ((cy - v.y) * k) / v.k; v.k = k; if (k === 1) v.x = v.y = 0; applyView(); }
svg.addEventListener("wheel", (e) => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
let drag = null;
svg.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, vx: S.view.x, vy: S.view.y, moved: false }; });
addEventListener("pointermove", (e) => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; if (drag.moved) { S.view.x = drag.vx + dx; S.view.y = drag.vy + dy; applyView(); } });
addEventListener("pointerup", () => setTimeout(() => (drag = null), 0));
$("zin").onclick = () => zoomAt(1.5); $("zout").onclick = () => zoomAt(1 / 1.5); $("zreset").onclick = () => { S.view = { k: 1, x: 0, y: 0 }; applyView(); };
function zoomTo(feats) {
  if (!feats.length) return;
  let [[x0, y0], [x1, y1]] = [[Infinity, Infinity], [-Infinity, -Infinity]];
  for (const f of feats) { const [[a, b], [c, d]] = path.bounds(f); x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d); }
  const k = Math.max(1, Math.min(8, 0.8 / Math.max((x1 - x0) / W, (y1 - y0) / H)));
  S.view = { k, x: W / 2 - k * (x0 + x1) / 2, y: H / 2 - k * (y0 + y1) / 2 }; applyView();
}

/* hover + tap */
const tip = $("tip");
svg.addEventListener("pointermove", (e) => {
  const el = e.target.closest?.(".land"); if (!el || drag?.moved) { tip.hidden = true; return; }
  const p = S.feats[+el.dataset.n].properties, k = keyOf(p);
  tip.innerHTML = !k ? `<span>No people or state recorded here on this map</span>`
    : `<b>${esc(p.NAME || k)}</b>${p.NAME && k !== p.NAME ? `<span>ruled by ${esc(k)}</span>` : ""}`;
  const r = svg.getBoundingClientRect(); tip.style.left = `${e.clientX - r.left + 14}px`; tip.style.top = `${e.clientY - r.top + 14}px`; tip.hidden = false;
});
svg.addEventListener("pointerleave", () => (tip.hidden = true));
svg.addEventListener("click", (e) => { if (drag?.moved) return; const el = e.target.closest?.(".land:not(.unnamed)"); if (!el) return; const p = S.feats[+el.dataset.n].properties; select(keyOf(p), p.NAME || keyOf(p)); });

/* ---------------- what changed ---------------- */
function changesFor(i) {
  const story = STORIES[SNAPSHOTS[i].year];
  const measured = Object.fromEntries((SNAPSHOTS[i].movers || []).map((m) => [m.name, m]));
  if (story?.changes?.length) return story.changes.filter((c) => c.kind !== "renamed").map((c) => ({ ...measured[c.name], ...c }));
  return SNAPSHOTS[i].movers || [];
}
const ICON = { grew: "▲", shrank: "▼", appeared: "✦", vanished: "✝", renamed: "↺" };
const WORD = { grew: "grew", shrank: "shrank", appeared: "appears", vanished: "disappears" };

function paintPanel() {
  if (S.selected) return paintSelected();
  const i = S.i, snap = SNAPSHOTS[i], st = STORIES[snap.year], prev = SNAPSHOTS[i - 1], ch = changesFor(i);
  $("panel").innerHTML = `
    <p class="kicker">${i + 1} of ${SNAPSHOTS.length}</p>
    <h2 class="year">${yearLabel(snap.year)}</h2>
    ${st?.title ? `<p class="era">${esc(st.title)}</p>` : ""}
    ${st?.overview ? `<p class="overview">${esc(st.overview)}</p>` : `<p class="overview soft">${i === 0 ? "The earliest map: early humans spread across Africa and Eurasia." : "Slide or press play to watch the world change."}</p>`}
    ${st?.india ? `<div class="india"><span>🇮🇳 Meanwhile in India</span><p>${esc(st.india)}</p></div>` : ""}
    ${ch.length ? `<h3>What changed since ${prev ? yearLabel(prev.year) : "before"}</h3>
      <ul class="changes">${ch.map((c) => `<li><button type="button" class="ch k-${c.kind}" data-focus="${esc(c.name)}"><span class="ic">${ICON[c.kind] || "•"}</span><span class="t"><b>${esc(c.name)}</b> ${WORD[c.kind] || ""}${c.after && c.kind !== "vanished" ? ` <small>${kmLabel(c.after)}</small>` : ""}${c.why ? `<em>${esc(c.why)}</em>` : ""}</span></button></li>`).join("")}</ul>` : i > 0 ? `<p class="soft">Hardly any borders moved between these two maps.</p>` : ""}
    ${st?.spotlight?.length ? `<h3>Also worth a look</h3><ul class="spot">${st.spotlight.map((s) => `<li><button type="button" data-focus="${esc(s.name)}"><b>${esc(s.name)}</b><span>${esc(s.fact)}</span></button></li>`).join("")}</ul>` : ""}
    ${journeyCard(snap.year)}
    <p class="hint soft">Tap any shape on the map to learn about it.</p>`;
  $("panel").querySelectorAll("[data-focus]").forEach((b) => b.onclick = () => focusOn(b.dataset.focus));
  $("panel").querySelectorAll("[data-journey]").forEach((b) => b.onclick = () => playJourney(b.dataset.journey));
  const t = $("panel").querySelector("[data-tree]"); if (t) t.onclick = () => { $("tree").showModal(); $("tree").scrollTop = 0; $("tree").querySelector("h2").focus(); };
}

/* ---------------- how we got here ---------------- */
// Early maps get the family tree and the Out of Africa journey; 3000 BC to AD 1000 also get the Bantu expansion.
function journeyCard(year) {
  const early = year <= -3000, bantu = year >= -3000 && year <= 1000;
  if (!early && !bantu) return "";
  return `<div class="journey">
    <span>👣 How we got here</span>
    <p>${early ? "Confused by Neanderthals, Homo erectus and who came from whom? See the family tree, then watch humans spread out of Africa." : "Why did the Khoisan's lands shrink while Bantu-speaking peoples spread? Watch it happen."}</p>
    <div class="j-btns">${early ? `<button type="button" class="btn" data-tree>🌳 Family tree</button><button type="button" class="btn" data-journey="outOfAfrica">▶ Out of Africa</button>` : ""}${bantu ? `<button type="button" class="btn" data-journey="bantu">▶ The Bantu expansion</button>` : ""}</div>
  </div>`;
}
// Cancels any arrows still waiting to be drawn, and removes the ones already on the map.
let jTimers = [];
function clearJourney() {
  jTimers.forEach(clearTimeout); jTimers = [];
  gMark.innerHTML = ""; document.querySelectorAll(".j-story").forEach((e) => e.remove());
}
function playJourney(key) {
  const J = JOURNEYS[key]; stop(); clearJourney();
  // Fit the view to the journey: the whole world for Out of Africa, close in for Africa-only stories.
  const pts = [...J.marks.map((m) => m.at), ...J.routes.flatMap((r) => r.pts)].map((c) => proj(c)).filter(Boolean);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.max(1, Math.min(3.2, 0.7 / Math.max((x1 - x0) / W, (y1 - y0) / H)));
  S.view = k > 1.05 ? { k, x: W / 2 - k * (x0 + x1) / 2, y: H / 2 - k * (y0 + y1) / 2 } : { k: 1, x: 0, y: 0 }; applyView();
  gMark.innerHTML = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#8a3b1e"/></marker></defs>`;
  const card = $("panel").querySelector(".journey");
  if (card) card.insertAdjacentHTML("beforeend", `<div class="j-story"><b>${esc(J.title)}</b><p>${esc(J.intro)}</p><ol id="j-steps"></ol><button type="button" class="btn ghost" id="j-clear">Clear arrows</button></div>`);
  $("j-clear")?.addEventListener("click", () => { clearJourney(); S.view = { k: 1, x: 0, y: 0 }; applyView(); });
  // Labels near the right edge go on the left of their dot so they aren't cut off.
  // Labels keep the same on-screen size at any zoom (scaled by 1/k), and flip left near the right edge.
  const label = (at, text, sub, cls, side) => { const p = proj(at); if (!p) return; const sx = S.view.k * p[0] + S.view.x;
    const left = side === "left" || (side !== "right" && sx > W * 0.7), x = left ? -9 : 9, anchor = left ? ` text-anchor="end"` : "";
    gMark.insertAdjacentHTML("beforeend", `<g class="mk ${cls}" transform="translate(${p[0]} ${p[1]}) scale(${1 / S.view.k})"><circle r="5"/><text class="mk-t" x="${x}" y="-2"${anchor}>${esc(text)}</text><text class="mk-d" x="${x}" y="11"${anchor}>${esc(sub)}</text></g>`); };
  J.marks.forEach((m) => label(m.at, m.t, m.d, m.cls, m.side));
  J.routes.forEach((r, i) => jTimers.push(setTimeout(() => {
    const d = path({ type: "LineString", coordinates: r.pts }); if (!d) return;
    gMark.insertAdjacentHTML("beforeend", `<path class="route" d="${d}" marker-end="url(#arrow)" style="animation-delay:0s"/>`);
    const end = r.pts[r.pts.length - 1]; label(end, r.name, r.d, "step", r.side);
    $("j-steps")?.insertAdjacentHTML("beforeend", `<li><b>${esc(r.name)}</b> <span>${esc(r.d)}</span></li>`);
  }, i * 1300)));
  if (matchMedia("(max-width: 860px)").matches) document.querySelector(".mapwrap").scrollIntoView({ behavior: "smooth" });
}

function focusOn(name) {
  S.focus = name; draw(false);
  const match = (f) => keyOf(f.properties) === name || f.properties.NAME === name;
  const hits = S.feats.filter(match);
  if (hits.length) zoomTo(hits);
  // Gone from this map? Zoom to where it was on the previous one.
  else if (S.i > 0) load(S.i - 1).then((prev) => zoomTo(prev.filter(match)));
  $("panel").querySelectorAll("[data-focus]").forEach((b) => b.classList.toggle("on", b.dataset.focus === name));
}

/* a single state: size + Wikipedia */
async function select(key, name) {
  S.selected = { key, name }; S.focus = key; draw(false); paintSelected();
}
async function paintSelected() {
  const { key, name } = S.selected, snap = SNAPSHOTS[S.i];
  const parts = S.feats.filter((f) => keyOf(f.properties) === key);
  const m = changesFor(S.i).find((c) => c.name === key);
  $("panel").innerHTML = `<button type="button" class="back" id="back">← ${yearLabel(snap.year)}</button>
    <p class="kicker">In ${yearLabel(snap.year)}</p><h2 class="year">${esc(name)}</h2>
    ${key !== name ? `<p class="era">ruled by ${esc(key)}</p>` : ""}
    ${m?.after ? `<p class="soft">${kmLabel(m.after)} ${compare(m.after) ? `· ${compare(m.after)}` : ""}</p>` : ""}
    ${m?.why ? `<div class="india"><span>${ICON[m.kind]} Why it ${m.kind === "appeared" ? "appears" : m.kind === "vanished" ? "disappears" : m.kind} here</span><p>${esc(m.why)}</p></div>` : ""}
    <div id="wiki" class="wiki"><p class="soft">Looking it up…</p></div>
    <button type="button" class="btn" id="zoomit">Zoom to it</button>`;
  $("back").onclick = () => { S.selected = null; S.focus = null; draw(false); paintPanel(); };
  $("zoomit").onclick = () => zoomTo(parts);
  const w = await wiki(key !== name ? name : key);
  if (S.selected?.name !== name || !$("wiki")) return;
  $("wiki").innerHTML = w ? `${w.thumb ? `<img src="${esc(w.thumb)}" alt="">` : ""}<p>${esc(w.text)}</p><a href="${esc(w.url)}" target="_blank" rel="noopener">More on Wikipedia ↗</a>` : `<p class="soft">No Wikipedia article found for this name.</p>`;
}
const wikiCache = new Map();
function wiki(name) {
  if (!wikiCache.has(name)) wikiCache.set(name, (async () => {
    const tryTitle = async (t) => { const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, "_"))}`); const j = r.ok ? await r.json() : null; return j && j.type !== "disambiguation" && j.extract ? j : null; };
    let j = await tryTitle(name).catch(() => null);
    if (!j) { const s = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + " history")}&srlimit=1&format=json&origin=*`).then((r) => r.json()).catch(() => null); const t = s?.query?.search?.[0]?.title; if (t) j = await tryTitle(t).catch(() => null); }
    return j ? { text: j.extract.split(/(?<=\.)\s/).slice(0, 3).join(" "), url: j.content_urls?.desktop?.page, thumb: j.thumbnail?.source } : null;
  })());
  return wikiCache.get(name);
}

/* ---------------- timeline ---------------- */
const slider = $("slider");
const TICKS = [0, 4, 7, 10, 16, 21, 26, 32, 37, 43, 49, 53];
$("ticks").innerHTML = TICKS.map((i) => `<span style="left:${(i / (SNAPSHOTS.length - 1)) * 100}%">${yearLabel(SNAPSHOTS[i].year).replace(",000 BC", "k BC")}</span>`).join("");
function go(i) {
  S.i = Math.max(0, Math.min(SNAPSHOTS.length - 1, i)); S.selected = null; S.focus = null; clearJourney();
  slider.value = S.i; $("tl-year").textContent = yearLabel(SNAPSHOTS[S.i].year);
  slider.style.setProperty("--p", `${(S.i / (SNAPSHOTS.length - 1)) * 100}%`);
  draw(); paintPanel(); load(S.i + 1);
  try { history.replaceState(null, "", `#${SNAPSHOTS[S.i].year}`); } catch {}
}
slider.oninput = () => { stop(); go(+slider.value); };
$("prev").onclick = () => { stop(); go(S.i - 1); };
$("next").onclick = () => { stop(); go(S.i + 1); };
function stop() { clearInterval(S.playing); S.playing = null; $("play").textContent = "▶"; $("play").setAttribute("aria-label", "Play through time"); }
$("play").onclick = () => {
  if (S.playing) return stop();
  if (S.i >= SNAPSHOTS.length - 1) go(0);
  $("play").textContent = "❚❚"; $("play").setAttribute("aria-label", "Pause");
  S.playing = setInterval(() => { if (S.i >= SNAPSHOTS.length - 1) return stop(); go(S.i + 1); }, 4500);
};
addEventListener("keydown", (e) => { if (e.target.tagName === "INPUT" && e.target !== slider) return; if (e.key === "ArrowRight") { stop(); go(S.i + 1); } if (e.key === "ArrowLeft") { stop(); go(S.i - 1); } });
$("about-btn").onclick = () => $("about").showModal();
$("tree-body").innerHTML = `${TREE}<ul class="tree-notes">${TREE_NOTES.map(([a, b]) => `<li><b>${esc(a)}</b> ${esc(b)}</li>`).join("")}</ul>`;
$("tree").addEventListener("click", (e) => { if (e.target.closest("[data-close]") || e.target.id === "tree") $("tree").close(); });
$("about").addEventListener("click", (e) => { if (e.target.closest("[data-close]") || e.target.id === "about") $("about").close(); });

// Links like borders/#1530 open on that year.
const fromHash = () => SNAPSHOTS.findIndex((s) => String(s.year) === decodeURIComponent(location.hash.slice(1)));
addEventListener("hashchange", () => { const i = fromHash(); if (i >= 0 && i !== S.i) { stop(); go(i); } });
go(Math.max(0, fromHash()));
