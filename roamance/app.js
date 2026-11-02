import { DECK, REGIONS, TAGS } from "./deck.js";
import { suggest, buildPlan, KINDS, kindFor } from "./planner.js";
import { ai, writeMyType, moreCards, polishPlan } from "./ai.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ---------------- state (this browser only) ----------------
const STORE = "roamance";
const blank = () => ({ seen: {}, roses: {}, w: {}, extra: [], type: "", prefs: { days: 10, month: 0, budget: 3 }, plans: [], log: [] });
let S;
try { S = { ...blank(), ...JSON.parse(localStorage.getItem(STORE) || "{}") }; } catch { S = blank(); }
const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch {} };
const all = () => [...DECK, ...S.extra];
const byId = (id) => all().find((c) => c.id === id);

// ---------------- learning ----------------
const WEIGHT = { right: 1, super: 2, left: -0.6, been: 0.5, later: 0.2 };
function learn(card, dir) {
  const k = WEIGHT[dir] || 0;
  card.tags.forEach((t) => (S.w[t] = +((S.w[t] || 0) + k).toFixed(2)));
}
function toggleRose(card, i) {
  const list = (S.roses[card.id] ||= []), on = list.includes(i);
  S.roses[card.id] = on ? list.filter((x) => x !== i) : [...list, i];
  card.prompts[i][2].forEach((t) => (S.w[t] = +((S.w[t] || 0) + (on ? -1.5 : 1.5)).toFixed(2)));
  save();
  return !on;
}
const swipes = () => Object.keys(S.seen).length;
const liked = () => all().filter((c) => ["right", "super"].includes(S.seen[c.id]));
const topTags = (n = 20) => Object.entries(S.w).filter(([t]) => TAGS[t]).sort((a, b) => b[1] - a[1]).slice(0, n);

// Next card: mostly what fits your type, but every 5th card is a wildcard from outside it.
function nextCard() {
  const fresh = all().filter((c) => !S.seen[c.id]);
  if (!fresh.length) return null;
  const sc = (c) => c.tags.reduce((a, t) => a + (S.w[t] || 0), 0) / Math.sqrt(c.tags.length);
  if (swipes() < 4 || swipes() % 5 === 4) {
    // early on (and for wildcards) spread across regions and moods
    const seenRegions = new Set(Object.keys(S.seen).map((id) => byId(id)?.region));
    const pool = fresh.filter((c) => !seenRegions.has(c.region));
    const p = (pool.length ? pool : fresh).sort((a, b) => sc(a) - sc(b));
    return p[(swipes() * 7) % Math.min(p.length, 6)];
  }
  return fresh.sort((a, b) => sc(b) - sc(a))[0];
}

function readable() {
  const top = topTags().filter(([, v]) => v > 0).slice(0, 5).map(([t]) => TAGS[t].toLowerCase());
  const low = Object.entries(S.w).filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([t]) => TAGS[t].toLowerCase());
  const roses = Object.entries(S.roses).flatMap(([id, is]) => { const c = byId(id); return c ? is.map((i) => `${c.name}: "${c.prompts[i][1]}"`) : []; });
  return [
    `Swipes: ${swipes()}. Liked: ${liked().map((c) => c.name).join(", ") || "none yet"}.`,
    `Super liked: ${all().filter((c) => S.seen[c.id] === "super").map((c) => c.name).join(", ") || "none"}.`,
    `Passed on: ${all().filter((c) => S.seen[c.id] === "left").map((c) => c.name).join(", ") || "none"}.`,
    `Roses (specific things they loved): ${roses.join(" | ") || "none"}.`,
    `Strongest pulls: ${top.join(", ") || "unclear yet"}. Cooler on: ${low.join(", ") || "nothing yet"}.`,
  ].join("\n");
}

// A quick, local read of your type (Claude can write a better one).
function localType() {
  const pos = topTags().filter(([, v]) => v > 0);
  if (swipes() < 5) return "Swipe on a few more places and I'll start reading your type.";
  const [a, b, c] = pos.map(([t]) => TAGS[t].toLowerCase());
  const low = Object.entries(S.w).filter(([, v]) => v < 0).sort((x, y) => x[1] - y[1])[0];
  const rosed = Object.values(S.roses).flat().length;
  let s = a ? `You keep falling for ${a}${b ? ` and ${b}` : ""}${c ? `, with a soft spot for ${c}` : ""}.` : "You're playing it cool so far.";
  if (low) s += ` ${TAGS[low[0]]} doesn't do much for you.`;
  if (rosed) s += ` You've sent ${rosed} rose${rosed > 1 ? "s" : ""}, so you know exactly what you want.`;
  const regions = {};
  liked().forEach((c) => (regions[c.region] = (regions[c.region] || 0) + 1));
  const r = Object.entries(regions).sort((x, y) => y[1] - x[1])[0];
  if (r && r[1] > 1) s += ` ${REGIONS[r[0]]} keeps catching your eye.`;
  return s;
}

// ---------------- photos (Wikipedia) ----------------
const PH = {};
const BAD = /\.svg|map|flag|locator|coat_of_arms|logo|icon|seal|emblem|chart|diagram|location|montage|collage|signature/i;
async function photos(card) {
  if (PH[card.id]) return PH[card.id];
  const t = encodeURIComponent((card.wiki || card.name).replace(/ /g, "_"));
  PH[card.id] = (async () => {
    try {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${t}`);
      const j = await r.json();
      const list = (j.items || []).filter((x) => x.type === "image" && x.srcset?.length && !BAD.test(x.title))
        .map((x) => ({ src: "https:" + x.srcset.at(-1).src, title: x.title }));
      if (list.length) return list.slice(0, 4);
    } catch {}
    try {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${t}`);
      const j = await r.json();
      if (j.originalimage?.source || j.thumbnail?.source) return [{ src: j.originalimage?.source || j.thumbnail.source, title: j.title }];
    } catch {}
    return [];
  })();
  return PH[card.id];
}
function ph(card, i, extra = "") {
  return `<div class="ph" data-ph="${esc(card.id)}" data-i="${i}">${extra}<div class="alt">${esc(card.name)}</div></div>`;
}
async function fillPhotos(root = document) {
  for (const el of root.querySelectorAll("[data-ph]:not([data-done])")) {
    el.dataset.done = 1;
    const card = byId(el.dataset.ph); if (!card) continue;
    const list = await photos(card), p = list[+el.dataset.i % Math.max(1, list.length)];
    if (!p) continue;
    const img = new Image();
    img.alt = `${card.name} (photo from Wikipedia)`; img.loading = "lazy"; img.decoding = "async"; img.referrerPolicy = "no-referrer";
    img.onload = () => el.querySelector(".alt")?.remove();
    img.src = p.src;
    el.prepend(img);
    if (!el.querySelector(".credit")) el.insertAdjacentHTML("beforeend", `<a class="credit" href="https://en.wikipedia.org/wiki/${encodeURIComponent((card.wiki || card.name).replace(/ /g, "_"))}" target="_blank" rel="noopener">Wikipedia ↗</a>`);
  }
}

// ---------------- views ----------------
const fmtCoord = (c) => `${Math.abs(c.lat).toFixed(2)}° ${c.lat >= 0 ? "N" : "S"} · ${Math.abs(c.lon).toFixed(2)}° ${c.lon >= 0 ? "E" : "W"}`;
const money = (b) => "$".repeat(b) + `<span style="opacity:.3">${"$".repeat(3 - b)}</span>`;

function cardHTML(c) {
  const rosed = S.roses[c.id] || [];
  const prompt = (i) => { const [q, a] = c.prompts[i], on = rosed.includes(i);
    return `<div class="prompt${on ? " rosed" : ""}"><span class="q">${esc(q)}</span><span class="a">${esc(a)}</span>
      <button type="button" class="rose" data-rose="${i}" aria-pressed="${on}" aria-label="${on ? "Take back the rose" : "Send a rose to this"}">🌹</button></div>`; };
  return `<article class="card" id="card" aria-label="${esc(c.name)}">
    <span class="stamp yes">Like</span><span class="stamp no">Pass</span>
    <div class="scroll">
      ${ph(c, 0, `<span class="coord">${fmtCoord(c)}</span>`)}
      <div class="who"><h2>${esc(c.name)}, <span>${esc(c.age)}</span></h2>
        <p class="meta">${esc(c.where)} · ${esc(c.kind)} · ~${c.fly}h from SFO</p></div>
      <p class="vibe">“${esc(c.vibe)}”</p>
      ${prompt(0)}
      ${ph(c, 1)}
      ${prompt(1)}
      <div class="block"><h3>You'll find us eating</h3><div class="chips">${c.eats.map((e) => `<span class="chip food">${esc(e)}</span>`).join("")}</div></div>
      ${ph(c, 2)}
      ${prompt(2)}
      <div class="vitals"><div><b>${money(c.budget)}</b><span>budget</span></div><div><b>${c.stay} days</b><span>to fall for me</span></div><div><b>${c.best.slice(0, 3).map((m) => MONTHS[m - 1]).join(" ")}</b><span>best months</span></div></div>
      <div class="block"><div class="chips">${c.tags.map((t) => `<span class="chip ghost">${esc(TAGS[t] || t)}</span>`).join("")}</div></div>
      <p class="flag">🚩 <b>Red flag:</b> ${esc(c.flag)}</p>
    </div>
  </article>`;
}

let cur = null;
function viewSwipe() {
  const c = (cur = nextCard());
  const side = `<aside class="side">
    <div class="panel"><h3>Your type so far</h3><p>${esc(localType())}</p><p class="count">${swipes()} swipes · ${liked().length} matches · ${Object.values(S.roses).flat().length} roses</p>
      <p class="small">Send a 🌹 to the exact line you love. Roses count more than swipes.</p></div>
    <div class="panel"><h3>How it works</h3>
      <p class="small">♥ like · ★ super like · ✕ pass. “Not now” means you like them, just not this year. “Been there” teaches your type without pitching it again.</p>
      <p class="small">When you're ready, tap <b>Enough swiping</b> and I'll pitch trips from 5 to 30 days, starting from San Francisco.</p></div>
    ${ai.key ? `<div class="panel"><h3>More fish in the sea</h3><p class="small">Ask Claude for 7 new profiles picked for your type.</p><button type="button" class="ghostbtn" id="more">Find me more matches</button><p class="small" id="moremsg"></p></div>` : ""}
  </aside>`;
  if (!c) return `<div class="swipe"><div class="empty"><h2>You've seen everyone</h2><p>${ai.key ? "Ask Claude for more matches, or" : "Add your Claude key on the Your type tab for fresh profiles, or"} go see your plans.</p><a class="go" href="#plans" style="text-decoration:none;display:inline-block">Show me plans</a></div>${side}</div>`;
  return `<div class="swipe"><div class="deckwrap">${cardHTML(c)}
    <div class="acts">
      <button type="button" class="act no" data-swipe="left" aria-label="Pass">✕</button>
      <button type="button" class="act super" data-swipe="super" aria-label="Super like">★</button>
      <button type="button" class="act yes" data-swipe="right" aria-label="Like">♥</button>
    </div>
    <div class="acts" style="padding-top:0"><button type="button" class="mini" data-swipe="later">Not now</button><button type="button" class="mini" data-swipe="been">Been there</button>${S.log.length ? `<button type="button" class="mini" id="undo">Undo</button>` : ""}</div>
    <p class="keys">← pass · → like · ↑ super like</p>
  </div>${side}</div>`;
}

function viewType() {
  const rows = topTags(20).filter(([, v]) => v !== 0);
  const max = Math.max(1, ...rows.map(([, v]) => Math.abs(v)));
  return `<div class="side" style="max-width:760px">
    <div class="panel"><h3>Your type</h3>
      <div class="typebox" id="typebox">${S.type ? S.type.split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join("") : `<p>${esc(localType())}</p>`}</div>
      ${ai.key ? `<button type="button" class="ghostbtn" id="writetype">${S.type ? "Rewrite it with Claude" : "Have Claude write my type"}</button> <span class="small" id="typemsg"></span>` : ""}
    </div>
    <div class="panel"><h3>What pulls you</h3>
      ${rows.length ? `<div class="bars">${rows.map(([t, v]) => `<div class="bar"><span>${esc(TAGS[t])}</span><i class="${v < 0 ? "neg" : ""}" style="width:${(Math.abs(v) / max) * 100}%"></i><em>${v > 0 ? "+" : ""}${v}</em></div>`).join("")}</div>` : `<p class="small">Nothing yet. Start swiping.</p>`}
      <p class="small" style="margin-top:10px">Each like adds to a place's tags, a super like adds double, a rose adds to that line's tags, a pass takes a little away.</p></div>
    <div class="panel"><h3>Claude extras</h3>
      ${ai.key ? `<p class="small">Using the Claude API key saved in this browser.</p><button type="button" class="ghostbtn" id="forget">Forget my key</button>`
        : `<p class="small">Optional. Add an Anthropic API key to get fresh profiles picked for you, a written read of your type and polished day plans. It stays in this browser and is only sent to Anthropic.</p>
           <form class="keyrow" id="keyform"><input id="keyin" type="password" autocomplete="off" placeholder="sk-ant-…" aria-label="Anthropic API key"><button class="go" type="submit">Save key</button></form>`}
    </div>
    <div class="panel"><h3>Start over</h3><p class="small">Clears your swipes, roses and plans in this browser.</p><button type="button" class="ghostbtn" id="reset">Reset everything</button><span class="small" id="resetmsg"></span></div>
  </div>`;
}

function viewMatches() {
  const L = liked();
  if (!L.length) return `<div class="empty"><h2>No matches yet</h2><p>Swipe right on a place and it shows up here.</p><a class="go" href="#swipe" style="text-decoration:none;display:inline-block">Start swiping</a></div>`;
  const later = all().filter((c) => S.seen[c.id] === "later");
  const tile = (c) => `<article class="m">${ph(c, 0)}<div class="in"><div class="row"><h4>${esc(c.name)}</h4>${S.seen[c.id] === "super" ? `<span class="badge">★ super</span>` : ""}</div>
      <span class="small">${esc(c.where)} · ${esc(REGIONS[c.region])}</span>
      ${(S.roses[c.id] || []).map((i) => `<span class="small"><span class="badge r">🌹</span> ${esc(c.prompts[i][1])}</span>`).join("")}
      <div class="row"><button type="button" class="mini" data-unmatch="${esc(c.id)}">Unmatch</button></div></div></article>`;
  return `<div class="grid">${L.map(tile).join("")}</div>
    ${later.length ? `<h3 style="font:900 1.4rem var(--display);text-transform:uppercase;margin:24px 0 8px">Not now, maybe later</h3><div class="grid">${later.map(tile).join("")}</div>` : ""}`;
}

function viewPlans() {
  const p = S.prefs;
  const kind = kindFor(p.days);
  return `<div class="panel"><h3>Plan a trip</h3>
    <form class="form" id="planform">
      <label for="days">How long? <span class="daysval" id="daysval">${p.days} days</span><input type="range" id="days" min="5" max="30" value="${p.days}"><span class="small" id="kindname">${esc(kind.name)}: ${esc(kind.blurb)}</span></label>
      <label for="month">When?<select id="month"><option value="0">Any time</option>${MONTHS.map((m, i) => `<option value="${i + 1}"${p.month === i + 1 ? " selected" : ""}>${m}</option>`).join("")}</select></label>
      <label for="budget">Budget<select id="budget">${[[1, "Shoestring"], [2, "Comfortable"], [3, "Treat myself"]].map(([v, l]) => `<option value="${v}"${p.budget === v ? " selected" : ""}>${l}</option>`).join("")}</select></label>
      <button class="go" type="submit">Pitch me 3 trips</button>
    </form>
    <p class="small" style="margin-top:10px">Starting from San Francisco. Every trip stays in one region, each leg is a train, bus or short flight, and the route never doubles back.</p>
  </div>
  ${liked().length < 2 ? `<p class="small" style="margin-top:14px">Tip: swipe right on at least a few places first. Plans are built from your matches and roses.</p>` : ""}
  <div class="plans" id="plans">${S.plans.map(planHTML).join("")}</div>`;
}

function planHTML(pl, pi) {
  return `<article class="plan">
    <header><h3>${esc(pl.regionName)}</h3><span class="kind">${esc(pl.kind.name)} · ${pl.itinerary.length} days</span></header>
    <div class="route">${pl.stops.map((s, i) => `${i ? `<span class="arr">→</span>` : ""}<span class="stop">${esc(s.name)}<small>${s.days}d</small></span>`).join("")}</div>
    <p class="why small">Why you: ${pl.why.map((t) => esc(TAGS[t]?.toLowerCase() || t)).join(", ")}${pl.stops.some((s) => S.roses[s.id]?.length) ? ", and it's built around your roses 🌹" : ""}.</p>
    <ol class="days">${pl.itinerary.map((d) => `<li><span class="dn">Day ${d.n}<small>${esc(d.stop)}</small></span><span>${d.travel ? `<span class="tr">${esc(d.travel)}</span>` : ""}${
      d.text ? `<span class="it">${esc(d.text)}</span>` : d.items.map((it) => `<span class="it${it.food ? " food" : ""}">${it.rose ? `<span class="r" title="You sent this a rose">🌹</span> ` : ""}${esc(it.text)}</span>`).join("")}</span></li>`).join("")}</ol>
    <div class="planacts">${ai.key ? `<button type="button" class="ghostbtn" data-polish="${pi}">${pl.polished ? "Polish again" : "Polish the days with Claude"}</button>` : ""}<span class="small" id="pmsg${pi}"></span></div>
  </article>`;
}

// ---------------- render & events ----------------
const VIEWS = { swipe: viewSwipe, type: viewType, matches: viewMatches, plans: viewPlans };
function tab() { const t = location.hash.slice(1); return VIEWS[t] ? t : "swipe"; }
function render() {
  const t = tab();
  document.querySelectorAll("#tabs a").forEach((a) => a.classList.toggle("on", a.dataset.tab === t));
  $("nmatch").textContent = liked().length ? `(${liked().length})` : "";
  $("main").innerHTML = VIEWS[t]();
  fillPhotos($("main"));
  if (t === "swipe") wireDrag();
}
let toastT;
function toast(html) { const el = $("toast"); el.innerHTML = html; el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2600); }

const MATCH_LINES = ["thinks you'll get along.", "can't wait to meet you.", "already picked a restaurant.", "is telling all its friends about you.", "says the feeling is mutual."];
function swipe(dir) {
  const c = cur; if (!c || S.seen[c.id]) return;
  const card = $("card");
  S.seen[c.id] = dir; learn(c, dir); S.log.push(c.id); S.log = S.log.slice(-20); save();
  if (dir === "right" || dir === "super") toast(`<b>It's a match!</b>${esc(c.name)} ${MATCH_LINES[swipes() % MATCH_LINES.length]}`);
  if (card) { card.classList.add(dir === "left" ? "gone-left" : dir === "super" ? "gone-up" : "gone-right"); setTimeout(render, 260); } else render();
}
function undo() {
  const id = S.log.pop(); if (!id) return;
  const c = byId(id), dir = S.seen[id];
  if (c && dir) c.tags.forEach((t) => (S.w[t] = +((S.w[t] || 0) - (WEIGHT[dir] || 0)).toFixed(2)));
  delete S.seen[id]; save(); render();
}

function wireDrag() {
  const card = $("card"); if (!card) return;
  let x0 = null, y0 = 0, dx = 0, dragging = false;
  const yes = card.querySelector(".stamp.yes"), no = card.querySelector(".stamp.no");
  card.addEventListener("pointerdown", (e) => { if (e.target.closest("button, a")) return; x0 = e.clientX; y0 = e.clientY; dx = 0; dragging = false; });
  card.addEventListener("pointermove", (e) => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    if (!dragging && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(e.clientY - y0)) { dragging = true; card.setPointerCapture(e.pointerId); card.style.transition = "none"; }
    if (!dragging) return;
    card.style.transform = `translateX(${dx}px) rotate(${dx / 22}deg)`;
    yes.style.opacity = Math.max(0, dx / 120); no.style.opacity = Math.max(0, -dx / 120);
  });
  const end = () => {
    if (x0 === null) return;
    x0 = null;
    if (!dragging) return;
    card.style.transition = ""; card.style.transform = "";
    yes.style.opacity = 0; no.style.opacity = 0;
    if (dx > 110) swipe("right"); else if (dx < -110) swipe("left");
  };
  card.addEventListener("pointerup", end); card.addEventListener("pointercancel", end);
}

function makePlans() {
  const opts = suggest(all(), S, S.prefs);
  S.plans = opts.map((x) => buildPlan(x.r, x.cs, S.prefs.days, S, REGIONS[x.r])).filter((p) => p.valid);
  save(); render();
  if (!S.plans.length) $("plans").innerHTML = `<p class="small">Swipe right on a few places first, then I can build trips around them.</p>`;
  else $("plans").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("click", async (e) => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.swipe) return swipe(t.dataset.swipe);
  if (t.id === "undo") return undo();
  if (t.dataset.rose !== undefined) {
    const c = cur, i = +t.dataset.rose, on = toggleRose(c, i);
    t.setAttribute("aria-pressed", on); t.closest(".prompt").classList.toggle("rosed", on);
    t.setAttribute("aria-label", on ? "Take back the rose" : "Send a rose to this");
    if (on) toast(`<b>Rose sent 🌹</b>Noted: you're into ${c.prompts[i][2].map((x) => TAGS[x].toLowerCase()).join(" and ")}.`);
    return;
  }
  if (t.dataset.unmatch) { S.seen[t.dataset.unmatch] = "left"; learn(byId(t.dataset.unmatch), "left"); save(); return render(); }
  if (t.id === "reset") {
    if (t.dataset.sure) { S = blank(); save(); location.hash = "#swipe"; return render(); }
    t.dataset.sure = 1; t.textContent = "Tap again to clear everything"; return;
  }
  if (t.id === "forget") { ai.forget(); return render(); }
  if (t.id === "writetype") {
    t.disabled = true; $("typemsg").textContent = "Reading your swipes…";
    try { S.type = await writeMyType(readable()); save(); render(); } catch (err) { $("typemsg").textContent = err.message; t.disabled = false; }
    return;
  }
  if (t.id === "more") {
    t.disabled = true; $("moremsg").textContent = "Asking around…";
    try {
      const got = await moreCards(readable(), REGIONS, TAGS, all().map((c) => c.name));
      const ok = got.filter((c) => c && c.id && c.name && REGIONS[c.region] && Number.isFinite(c.lat) && Number.isFinite(c.lon) && Array.isArray(c.prompts) && c.prompts.length >= 3 && Array.isArray(c.tags))
        .map((c) => ({ ...c, id: "x-" + String(c.id).replace(/[^a-z0-9-]/gi, "").toLowerCase(), tags: c.tags.filter((x) => TAGS[x]), prompts: c.prompts.slice(0, 3).map(([q, a, tg]) => [q, a, (tg || []).filter((x) => TAGS[x])]),
          eats: (c.eats || []).slice(0, 3), best: (c.best || []).filter((m) => m >= 1 && m <= 12), budget: Math.min(3, Math.max(1, +c.budget || 2)), stay: Math.min(7, Math.max(1, +c.stay || 3)), fly: +c.fly || 12 }))
        .filter((c) => !all().some((x) => x.id === c.id || x.name === c.name));
      S.extra.push(...ok); save();
      toast(`<b>${ok.length} new profiles</b>Picked for your type.`); render();
    } catch (err) { $("moremsg").textContent = err.message; t.disabled = false; }
    return;
  }
  if (t.dataset.polish !== undefined) {
    const pi = +t.dataset.polish, pl = S.plans[pi]; t.disabled = true; $("pmsg" + pi).textContent = "Claude is writing your days…";
    try {
      const out = await polishPlan(pl, readable());
      if (!Array.isArray(out) || out.length !== pl.itinerary.length) throw new Error("Claude's version didn't match the plan's days, so I kept the original.");
      pl.itinerary.forEach((d, i) => { if (out[i]?.text) d.text = String(out[i].text); });
      pl.polished = true; save(); render();
    } catch (err) { $("pmsg" + pi).textContent = err.message; t.disabled = false; }
  }
});

document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "keyform") { const k = $("keyin").value.trim(); if (k) { ai.setKey(k); render(); } return; }
  if (e.target.id === "planform") makePlans();
});
document.addEventListener("input", (e) => {
  if (e.target.id === "days") { S.prefs.days = +e.target.value; const k = kindFor(S.prefs.days); $("daysval").textContent = `${S.prefs.days} days`; $("kindname").textContent = `${k.name}: ${k.blurb}`; save(); }
  if (e.target.id === "month") { S.prefs.month = +e.target.value; save(); }
  if (e.target.id === "budget") { S.prefs.budget = +e.target.value; save(); }
});
document.addEventListener("keydown", (e) => {
  if (tab() !== "swipe" || e.target.closest("input, select, textarea")) return;
  if (e.key === "ArrowRight") swipe("right"); else if (e.key === "ArrowLeft") swipe("left"); else if (e.key === "ArrowUp") { e.preventDefault(); swipe("super"); }
});
$("enough").addEventListener("click", () => { location.hash = "#plans"; if (liked().length) setTimeout(makePlans, 50); });
window.addEventListener("hashchange", render);
render();
