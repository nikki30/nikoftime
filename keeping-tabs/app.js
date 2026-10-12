import { TOPICS, REGIONS } from "./topics.js";
import { SKILLS } from "./skills.js";
import { ai, explain, brief, conversation, mock, md } from "./ai.js";
import { PROFILE, VERDICT, COMPANIES, ALSO, PLAN, PRACTICE } from "./career.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "#");
const DAY = 864e5, today = new Date().toISOString().slice(0, 10), dayNo = Math.floor(Date.now() / DAY);

/* ---------------- saved state (this browser only) ---------------- */
const KEY = "kt-v1";
const ST = Object.assign({ tab: "feminism", region: {}, saved: {}, done: {}, seen: {}, blogKind: "all", uni: {}, open: "design", place: {}, lessons: {}, notes: {}, days: [] },
  (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch {} };
const LAST = { ...ST.seen }; // "new" = newer than your previous visit to that tab
if (!ST.days.includes(today)) { ST.days = [...ST.days, today].slice(-400); save(); }
const streak = () => { let n = 0; for (let d = dayNo; ST.days.includes(new Date(d * DAY).toISOString().slice(0, 10)); d--) n++; return n; };

/* ---------------- data ---------------- */
let FEED = null;
const TRACKS = {};
const ready = Promise.all([
  fetch("feed.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null).then((f) => { FEED = f; }),
  ...["feminism", "lgbtq", "eng"].map((id) => import(`./learn/${id}.js`).then((m) => { TRACKS[id] = m.TRACK; }).catch(() => {})),
]);
// Which learning track goes with which tab.
const TRACK_FOR = { feminism: "feminism", lgbtq: "lgbtq", eng: "eng", skills: "eng" };

/* ---------------- helpers ---------------- */
function ago(d) {
  if (!d) return ""; const t = new Date(d); if (isNaN(t)) return "";
  const days = Math.floor((Date.now() - t) / DAY);
  if (days < 1) return "today"; if (days < 2) return "yesterday"; if (days < 14) return `${days} days ago`;
  return t.toLocaleDateString(undefined, { day: "numeric", month: "short", year: t.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}
const isNew = (tab, d) => LAST[tab] && d && new Date(d) > new Date(LAST[tab]);
const pick = (arr, n = 0) => (arr?.length ? arr[(((dayNo + n) % arr.length) + arr.length) % arr.length] : null);
const ITEMS = new Map();
const remember = (item, kind) => { ITEMS.set(item.url, { ...item, kind }); return item; };
const star = (url) => `<button type="button" class="star${ST.saved[url] ? " on" : ""}" data-save="${esc(url)}" aria-label="${ST.saved[url] ? "Remove from saved" : "Save for later"}" aria-pressed="${!!ST.saved[url]}">${ST.saved[url] ? "★" : "☆"}</button>`;

// Glossary terms that appear in a piece of text.
function termsIn(track, text) {
  if (!track?.glossary) return [];
  const t = ` ${text.toLowerCase()} `;
  return track.glossary.filter((g) => [g.term, ...(g.aliases || [])].some((w) => new RegExp(`[^a-z]${w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^a-z]`).test(t))).slice(0, 3);
}
// Lessons that mention any of those terms (or share the item's key words).
function lessonsFor(track, text) {
  if (!track?.lessons) return [];
  const terms = termsIn(track, text).map((g) => g.term.toLowerCase());
  const words = new Set(text.toLowerCase().match(/[a-z]{6,}/g) || []);
  return track.lessons.map((l) => {
    const body = `${l.title} ${l.body.join(" ")}`.toLowerCase();
    const score = terms.filter((w) => body.includes(w)).length * 3 + [...words].filter((w) => body.includes(w)).length;
    return { l, score };
  }).filter((x) => x.score >= 3).sort((a, b) => b.score - a.score).slice(0, 2).map((x) => x.l);
}

/* ---------------- learning: placement, plan, lessons ---------------- */
const LEVELS = ["New to this", "Know the basics", "Confident"];
function plan(track) {
  const p = ST.place[track.id]; if (!p) return null;
  const known = (topic) => p.scores[topic] ?? 0;
  const order = track.lessons.map((l, i) => ({ l, i }))
    .filter(({ l }) => !(l.level === 1 && known(l.topic) === 2)) // you already know these basics
    .sort((a, b) => known(a.l.topic) - known(b.l.topic) || a.l.level - b.l.level || a.i - b.i).map((x) => x.l);
  const weeks = []; for (let i = 0; i < order.length; i += 3) weeks.push(order.slice(i, i + 3));
  return { order, weeks, next: order.find((l) => !ST.lessons[l.id]?.done) };
}
const doneCount = (track) => track.lessons.filter((l) => ST.lessons[l.id]?.done).length;
function knowSummary(track) {
  const p = ST.place[track?.id]; if (!p || !track) return "";
  const by = (n) => track.topics.filter((t) => (p.scores[t.id] ?? 0) === n).map((t) => t.title);
  return [by(2).length && `confident on ${by(2).join(", ")}`, by(1).length && `knows the basics of ${by(1).join(", ")}`, by(0).length && `new to ${by(0).join(", ")}`].filter(Boolean).join("; ");
}

/* ---------------- tabs ---------------- */
const TABS = [
  ...TOPICS.map((t) => ({ id: t.id, label: `${t.icon} ${t.label}` })),
  { id: "eng", label: "💻 Engineering" },
  { id: "skills", label: "🎯 Next role" },
  { id: "saved", label: "★ Saved" },
];
function paintTabs() {
  const count = Object.keys(ST.saved).length;
  $("tabs").innerHTML = TABS.map((t) => `<button type="button" role="tab" class="tab t-${t.id}${ST.tab === t.id ? " on" : ""}" aria-selected="${ST.tab === t.id}" data-tab="${t.id}">${esc(t.label)}${t.id === "saved" && count ? ` <small>${count}</small>` : ""}</button>`).join("");
  $("tabs").querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => go(b.dataset.tab)));
  const on = $("tabs").querySelector(".on"); if (on) $("tabs").scrollLeft = on.offsetLeft - 16;
}
function go(tab) {
  ST.seen[ST.tab] = new Date().toISOString();
  ST.tab = tab; save(); paintTabs(); paint();
  scrollTo({ top: 0, behavior: "smooth" });
}
addEventListener("pagehide", () => { ST.seen[ST.tab] = new Date().toISOString(); save(); });

function paint() {
  document.body.dataset.tab = ST.tab;
  const t = TOPICS.find((x) => x.id === ST.tab);
  $("main").innerHTML = t ? topicView(t) : ST.tab === "eng" ? engView() : ST.tab === "skills" ? careerView() : savedView();
  wire($("main"));
}

/* ---------------- shared blocks ---------------- */
function hero(track, title, icon) {
  if (!track) return `<section class="hero"><div class="hero-t"><span class="kicker">${icon}</span><h2>${esc(title)}</h2></div></section>`;
  const p = plan(track), done = doneCount(track), total = p ? p.order.length : track.lessons.length, s = streak();
  const pct = total ? Math.round((Math.min(done, total) / total) * 100) : 0;
  return `<section class="hero">
    <div class="hero-t">
      <span class="kicker">${icon} ${esc(title)}${s > 1 ? ` · 🔥 ${s}-day streak` : ""}</span>
      <h2>${p ? (p.next ? `Next up: <em>${esc(p.next.title)}</em>` : "You've finished your plan 🎉") : "What do you already know?"}</h2>
      <p>${p ? (p.next ? esc(p.next.hook) : "Revisit any lesson, or retake the quiz to build a deeper plan.") : esc(track.intro) + ` Take a ${track.placement.length}-question quiz and I'll build you a plan that skips what you know.`}</p>
      <div class="hero-b">${p
        ? `${p.next ? `<button type="button" class="btn big" data-lesson="${p.next.id}" data-track="${track.id}">Start lesson · ${p.next.minutes} min →</button>` : ""}<button type="button" class="btn ghost" data-place="${track.id}">Retake the quiz</button>`
        : `<button type="button" class="btn big" data-place="${track.id}">Find my level · ${Math.ceil(track.placement.length / 3.5)} min →</button>`}</div>
    </div>
    <div class="hero-r">${p ? `<div class="ring big" style="--p:${pct}%"><b>${pct}%<small>of your plan</small></b></div>
      <ul class="lv-list">${track.topics.map((t) => `<li><span>${t.icon} ${esc(t.title)}</span><i class="lv lv${ST.place[track.id].scores[t.id] ?? 0}">${LEVELS[ST.place[track.id].scores[t.id] ?? 0]}</i></li>`).join("")}</ul>`
      : `<div class="hero-art" aria-hidden="true">${track.topics.map((t) => `<span>${t.icon}</span>`).join("")}</div>`}</div>
  </section>`;
}

function dailyCards(track) {
  if (!track) return "";
  const f = pick(track.facts, ST.factN || 0), w = pick(track.glossary, 3), who = pick(track.people, 7);
  return `<section class="daily">
    ${f ? `<article class="dcard d-fact"><span class="dk">💡 Did you know?</span><p>${esc(f.fact)}</p><small>${esc(f.source)}</small><button type="button" class="link" data-morefact>Another one →</button></article>` : ""}
    ${w ? `<article class="dcard d-word"><span class="dk">📖 Word of the day</span><h4>${esc(w.term)}</h4><p>${esc(w.def)}</p></article>` : ""}
    ${who ? `<article class="dcard d-person"><span class="dk">👤 Someone to know</span><h4>${esc(who.name)} <small>${esc(who.years || "")}${who.where ? ` · ${esc(who.where)}` : ""}</small></h4><p>${esc(who.why)}</p></article>` : ""}
  </section>`;
}

function planSection(track) {
  const p = track && plan(track); if (!p) return "";
  return `<section class="sec"><header class="sec-h"><h3>Your plan</h3><p>Three short lessons a week, starting where you're newest. ${p.order.length} lessons · ${doneCount(track)} done</p></header>
    <div class="weeks">${p.weeks.map((wk, i) => `<div class="week${wk.every((l) => ST.lessons[l.id]?.done) ? " done" : wk.includes(p.next) ? " now" : ""}"><span class="wk">Week ${i + 1}</span>${wk.map((l) => lessonChip(track, l, l === p.next)).join("")}</div>`).join("")}</div></section>`;
}
const lessonChip = (track, l, now) => `<button type="button" class="lchip${ST.lessons[l.id]?.done ? " done" : ""}${now ? " now" : ""}" data-lesson="${l.id}" data-track="${track.id}"><span class="ck">${ST.lessons[l.id]?.done ? "✓" : now ? "▶" : track.topics.find((t) => t.id === l.topic)?.icon || "•"}</span><span class="lt">${esc(l.title)}</span><small>${l.minutes} min</small></button>`;

function library(track) {
  if (!track) return "";
  return `<section class="sec"><header class="sec-h"><h3>All lessons</h3><p>Dip into anything. Each one ends with a quick check and a question to think about.</p></header>
    <div class="lib">${track.topics.map((t) => `<div class="lib-t"><h4>${t.icon} ${esc(t.title)}</h4><p>${esc(t.blurb || "")}</p>${track.lessons.filter((l) => l.topic === t.id).sort((a, b) => a.level - b.level).map((l) => lessonChip(track, l, false)).join("")}</div>`).join("")}</div></section>`;
}

/* ---------------- items ---------------- */
function newsCard(n, tab, track) {
  remember(n, "news");
  const terms = termsIn(track, n.title);
  return `<article class="item${isNew(tab, n.date) ? " fresh" : ""}">
    <button type="button" class="open" data-item="${esc(n.url)}"><h4>${esc(n.title)}</h4></button>
    <p class="meta">${n.source ? `<b>${esc(n.source)}</b> · ` : ""}${esc(ago(n.date))}</p>
    <div class="acts"><button type="button" class="pill ai" data-item="${esc(n.url)}">✨ Explain this</button>${terms.map((g) => `<button type="button" class="pill term" data-term="${esc(g.term)}" data-track="${track.id}">📖 ${esc(g.term)}</button>`).join("")}</div>
    ${star(n.url)}</article>`;
}
function paperCard(p, tab) {
  remember(p, "paper");
  return `<article class="item paper${isNew(tab, p.date) ? " fresh" : ""}">
    ${p.unis?.length ? `<p class="unis">${p.unis.slice(0, 3).map((u) => `<span>${esc(u)}</span>`).join("")}</p>` : ""}
    <button type="button" class="open" data-item="${esc(p.url)}"><h4>${esc(p.title)}</h4></button>
    <p class="meta">${esc(p.authors || "")}${p.venue ? ` · <i>${esc(p.venue)}</i>` : ""} · ${esc(ago(p.date))}</p>
    ${p.abstract ? `<p class="sum">${esc(p.abstract.length > 180 ? `${p.abstract.slice(0, 180).replace(/\s+\S*$/, "")}…` : p.abstract)}</p>` : ""}
    <div class="acts"><button type="button" class="pill ai" data-item="${esc(p.url)}">✨ Explain simply</button>${p.free ? `<a class="pill free" href="${esc(safeUrl(p.free))}" target="_blank" rel="noopener">Free to read ↗</a>` : ""}</div>
    ${star(p.url)}</article>`;
}
const empty = (msg) => `<p class="empty">${msg}</p>`;
const noFeed = () => empty(FEED ? "Nothing here today. Check back tomorrow morning." : "The feed is refreshed every morning when the site rebuilds. If this is the very first build, it'll appear after the next update.");

/* ---------------- a topic tab ---------------- */
function topicView(t) {
  const track = TRACKS[TRACK_FOR[t.id]];
  const region = ST.region[t.id] || "world", news = FEED?.news?.[t.id]?.[region] || [];
  const papers = FEED?.papers?.[t.id] || [], uni = ST.uni[t.id] || "all";
  const uniList = [...new Set(papers.flatMap((p) => p.unis || []))].sort();
  const shown = uni === "all" ? papers : papers.filter((p) => p.unis?.includes(uni));
  return `${hero(track, t.label, t.icon)}${dailyCards(track)}${planSection(track)}
  <section class="sec"><header class="sec-h"><h3>This week in the news</h3><p>Tap any story and I'll explain it, with the background you need.</p></header>
    <div class="chips" role="group" aria-label="Region">${REGIONS.map((r) => `<button type="button" class="chip${r.id === region ? " on" : ""}" data-region="${r.id}">${esc(r.label)}${FEED?.news?.[t.id]?.[r.id]?.some((n) => isNew(t.id, n.date)) ? `<i class="dot" aria-label="new"></i>` : ""}</button>`).join("")}</div>
    ${news.length ? `<button type="button" class="brief" data-brief="${t.id}"><span>✨</span><b>Brief me on this week</b><small>The big threads in ${esc(REGIONS.find((r) => r.id === region)?.label.replace(/^\S+\s/, "") || "the world")}, and the one thing that makes them make sense</small></button>` : ""}
    <div class="grid">${news.length ? news.map((n) => newsCard(n, t.id, track)).join("") : noFeed()}</div></section>
  <section class="sec"><header class="sec-h"><h3>New research</h3><p>From leading universities. Tap one for a plain-English explanation.</p></header>
    ${uniList.length > 1 ? `<label class="pickuni">From <select id="uni"><option value="all">all ${uniList.length} universities</option>${uniList.map((u) => `<option${u === uni ? " selected" : ""}>${esc(u)}</option>`).join("")}</select></label>` : ""}
    <div class="grid">${shown.length ? shown.slice(0, 12).map((p) => paperCard(p, t.id)).join("") : noFeed()}</div>
    ${searchBox()}</section>
  ${library(track)}`;
}

function searchBox() {
  return `<form class="search" id="search"><h4>🔎 Dig deeper</h4><p>Search research on anything, e.g. <i>women in tech</i>, <i>Section 377</i>, <i>care work India</i>.</p>
    <div class="row"><input id="q" type="search" placeholder="Search research…" aria-label="Search research" autocomplete="off"><button type="submit" class="btn">Search</button></div>
    <label class="only"><input type="checkbox" id="only" checked> Only leading universities</label><div id="results" class="grid"></div></form>`;
}
async function runSearch(e) {
  e.preventDefault();
  const q = $("q").value.trim(); if (!q) return;
  const out = $("results"); out.innerHTML = `<p class="empty">Searching…</p>`;
  const unis = FEED?.universities || {}, ids = Object.keys(unis);
  const filters = [`from_publication_date:${new Date(Date.now() - 3 * 365 * DAY).toISOString().slice(0, 10)}`, "type:article|preprint|book-chapter|review"];
  if ($("only").checked && ids.length) filters.push(`authorships.institutions.lineage:${ids.join("|")}`);
  try {
    const r = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(q)}&filter=${filters.join(",")}&sort=relevance_score:desc&per_page=12&select=id,title,publication_date,doi,primary_location,authorships,abstract_inverted_index,open_access`).then((x) => x.json());
    const items = (r.results || []).filter((w) => w.title).map((w) => {
      const words = []; for (const [k, ps] of Object.entries(w.abstract_inverted_index || {})) for (const p of ps) words[p] = k;
      const ab = words.join(" ").replace(/\s+/g, " ").trim();
      return {
        title: w.title.replace(/<[^>]+>/g, ""), date: w.publication_date, url: w.doi || w.primary_location?.landing_page_url || w.id, free: w.open_access?.oa_url,
        venue: w.primary_location?.source?.display_name || "", authors: w.authorships.slice(0, 3).map((a) => a.author.display_name).join(", ") + (w.authorships.length > 3 ? ", et al." : ""),
        unis: [...new Set(w.authorships.flatMap((a) => a.institutions.map((i) => unis[i.id?.split("/").pop()] || (ids.length ? null : i.display_name))).filter(Boolean))],
        abstract: ab.length > 600 ? `${ab.slice(0, 600).replace(/\s+\S*$/, "")}…` : ab,
      };
    });
    out.innerHTML = items.length ? items.map((p) => paperCard(p, "")).join("") : `<p class="empty">No research found for “${esc(q)}”. Try fewer or broader words${$("only").checked ? ", or untick “Only leading universities”" : ""}.</p>`;
    wire(out);
  } catch { out.innerHTML = `<p class="empty">Couldn't reach OpenAlex just now. Try again in a moment.</p>`; }
}

/* ---------------- engineering reading ---------------- */
const KINDS = [["all", "All"], ["staff", "Staff+"], ["career", "Career"], ["systems", "Systems"], ["craft", "Craft"], ["ops", "Reliability"], ["ai", "AI"]];
function engView() {
  const e = FEED?.eng || {}, kind = ST.blogKind, track = TRACKS.eng;
  const blogs = (e.blogs || []).filter((b) => kind === "all" || b.kind === kind);
  const blogCard = (b) => { remember(b, "blog"); const terms = termsIn(track, `${b.title} ${b.summary || ""}`);
    return `<article class="item${isNew("eng", b.date) ? " fresh" : ""}"><button type="button" class="open" data-item="${esc(b.url)}"><h4>${esc(b.title)}</h4></button><p class="meta"><b>${esc(b.source)}</b> · ${esc(ago(b.date))}</p>${b.summary ? `<p class="sum">${esc(b.summary)}</p>` : ""}<div class="acts"><button type="button" class="pill ai" data-item="${esc(b.url)}">✨ Key ideas</button>${terms.map((g) => `<button type="button" class="pill term" data-term="${esc(g.term)}" data-track="eng">📖 ${esc(g.term)}</button>`).join("")}</div>${star(b.url)}</article>`; };
  const hnCard = (h) => { remember(h, "discussion");
    return `<article class="item hn${isNew("eng", h.date) ? " fresh" : ""}"><span class="pts">${h.points}<small>points</small></span><div><button type="button" class="open" data-item="${esc(h.url)}"><h4>${esc(h.title)}</h4></button><p class="meta"><a href="${esc(safeUrl(h.discuss))}" target="_blank" rel="noopener">${h.comments} comments</a> · ${esc(ago(h.date))}</p><div class="acts"><button type="button" class="pill ai" data-item="${esc(h.url)}">✨ What's this about?</button></div></div>${star(h.url)}</article>`; };
  return `<section class="hero slim"><div class="hero-t"><span class="kicker">💻 Engineering</span><h2>Today's reading, <em>explained</em></h2><p>Fresh writing from engineers worth learning from, what engineers are arguing about, and new research. Tap anything for the key ideas and how you could use them at work.</p>
    <div class="hero-b"><button type="button" class="btn ghost" data-go="skills">🎯 Your next-role plan</button></div></div></section>
  ${dailyCards(track)}
  <div class="cols three">
    <section class="col"><header class="col-h"><h3>From the blogs</h3></header>
      <div class="chips">${KINDS.map(([k, l]) => `<button type="button" class="chip${k === kind ? " on" : ""}" data-kind="${k}">${l}</button>`).join("")}</div>
      <div class="list">${blogs.length ? blogs.map(blogCard).join("") : noFeed()}</div></section>
    <section class="col"><header class="col-h"><h3>Most discussed <span>Hacker News, 2 weeks</span></h3></header><div class="list">${(e.hn || []).length ? e.hn.map(hnCard).join("") : noFeed()}</div></section>
    <section class="col"><header class="col-h"><h3>New research <span>arXiv</span></h3></header><div class="list">${(e.papers || []).length ? e.papers.slice(0, 12).map((p) => paperCard(p, "eng")).join("") : noFeed()}</div></section>
  </div>`;
}

/* ---------------- next role: interview prep for data/infra roles in AI ---------------- */
const C = (ST.career ||= { done: {}, notes: {}, kind: "coding" });
const PKINDS = [["coding", "💻 Coding builds"], ["design", "🏗️ System design"], ["ai", "🧠 AI for infra engineers"], ["stories", "🗣️ Your stories"]];
const planWeek = () => (C.start ? Math.min(PLAN.length, Math.floor((Date.now() - new Date(C.start)) / (7 * DAY)) + 1) : 0);
const lvTag = (v) => `<span class="lvt lvt-${/^high/i.test(v) ? "hi" : /^low/i.test(v) ? "lo" : "mid"}">${esc(v)}</span>`;
function careerView() {
  const wk = planWeek(), keys = PLAN.flatMap((w, i) => w.tasks.map((_, j) => `${i}.${j}`)), done = keys.filter((k) => C.done[k]).length, pct = Math.round((done / keys.length) * 100);
  const items = PRACTICE[C.kind] || [];
  return `<section class="hero">
    <div class="hero-t"><span class="kicker">🎯 Next role${streak() > 1 ? ` · 🔥 ${streak()}-day streak` : ""}</span>
      <h2>Data platforms <em>for AI</em></h2>
      <p>Senior and staff roles at Anthropic, OpenAI, Databricks and companies like them. Practise the way they actually interview: build working systems fast, design data and AI systems out loud, and tell sharp stories about your work.</p>
      <div class="hero-b">${wk ? `<a class="btn big" href="#plan">Week ${wk}: ${esc(PLAN[wk - 1].focus)} →</a>` : `<button type="button" class="btn big" data-cstart>Start my 8-week plan →</button>`}<a class="btn ghost" href="#practice">🎤 Mock interview</a></div></div>
    <div class="hero-r"><div class="ring big" style="--p:${pct}%"><b>${pct}%<small>of the plan</small></b></div>
      <ul class="lv-list">${COMPANIES.map((c) => `<li><span>${c.icon} ${esc(c.name)}</span><i class="lv lv1">${c.roles.length} roles that fit</i></li>`).join("")}</ul></div>
  </section>

  <section class="sec"><header class="sec-h"><h3>${esc(VERDICT.title)}</h3><p>${esc(VERDICT.answer)}</p></header>
    <div class="verdict"><table><thead><tr><th></th><th>Coding round</th><th>Algorithms</th><th>System design</th><th>Project deep dive</th><th>Values / mission</th></tr></thead>
      <tbody>${VERDICT.rows.map((r) => `<tr><th>${esc(r.co)}</th><td>${esc(r.coding)}</td><td>${lvTag(r.dsa)}</td><td>${lvTag(r.design)}</td><td>${lvTag(r.deep)}</td><td>${lvTag(r.values)}</td></tr>`).join("")}</tbody></table></div>
    <h4 class="mixh">How to split your practice time</h4>
    <div class="mix">${VERDICT.mix.map(([t, n, d]) => `<div class="mixrow"><span><b>${esc(t)}</b><small>${esc(d)}</small></span><i style="--p:${n * 2.5}%"></i><em>${n}%</em></div>`).join("")}</div>
    <p class="soft small">How these companies interview is based on what candidates commonly report. Loops change and differ by team, so confirm with your recruiter.</p></section>

  <section class="sec"><header class="sec-h"><h3>Roles that fit you</h3><p>Where data platform, infrastructure and ETL experience is exactly what they need.</p></header>
    <div class="cos">${COMPANIES.map((c) => `<article class="co">
      <h4>${c.icon} ${esc(c.name)}</h4><p class="fit">${esc(c.fit)}</p>
      <ul class="roles">${c.roles.map((r) => `<li><b>${esc(r.title)}</b><span>${esc(r.why)}</span></li>`).join("")}</ul>
      <details><summary>How they interview</summary><ol class="proc">${c.process.map(([t, d]) => `<li><b>${esc(t)}.</b> ${esc(d)}</li>`).join("")}</ol></details>
      <details><summary>How to prepare</summary><ul class="prep">${c.prep.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>
      <p class="links">${c.links.map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ↗</a>`).join("")}</p></article>`).join("")}</div>
    <p class="also"><b>Also worth a look:</b> ${ALSO.map(([n, d]) => `${esc(n)} <span class="soft">(${esc(d)})</span>`).join(" · ")}</p>
    <p class="soft small">Team names and titles change often: search each careers page for "data", "infrastructure" and "pretraining".</p></section>

  <section class="sec" id="plan"><header class="sec-h"><h3>Your 8-week plan</h3><p>About 6–8 hours a week. ${wk ? `You're in week ${wk}. ${done} of ${keys.length} tasks done.` : "Start it whenever you're ready; the weeks count from that day."}</p></header>
    <div class="weeks">${PLAN.map((w, i) => `<div class="week${wk === i + 1 ? " now" : ""}${w.tasks.every((_, j) => C.done[`${i}.${j}`]) ? " done" : ""}"><span class="wk">Week ${i + 1}</span><b class="wf">${esc(w.focus)}</b>
      ${w.tasks.map((t, j) => `<label class="ctask"><input type="checkbox" data-ctask="${i}.${j}"${C.done[`${i}.${j}`] ? " checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div>`).join("")}</div>
    ${wk ? `<p class="soft small"><button type="button" class="link" data-cstart>Restart the plan from this week</button></p>` : ""}</section>

  <section class="sec" id="practice"><header class="sec-h"><h3>Practice</h3><p>Open anything to read the brief, keep notes, and run a mock interview with Claude.</p></header>
    <div class="chips">${PKINDS.map(([k, l]) => `<button type="button" class="chip${C.kind === k ? " on" : ""}" data-pk="${k}">${l}</button>`).join("")}</div>
    <div class="grid">${items.map((x, i) => practiceCard(C.kind, x, i)).join("")}</div></section>

  <section class="sec"><header class="sec-h"><h3>About me</h3><p>Claude uses this in mock interviews. Edit it to match your real experience.</p></header>
    <textarea id="profile" rows="4">${esc(C.profile || PROFILE)}</textarea></section>
  ${growSection()}`;
}
function practiceCard(kind, x, i) {
  const noted = C.notes[`${kind}:${i}`]?.trim();
  if (kind === "coding") return `<button type="button" class="pcard" data-prac="${kind}:${i}"><span class="pk">💻 ${x.time} min · ${x.levels.length} levels</span><b>${esc(x.title)}</b><small>${esc(x.why)}</small>${noted ? `<i>✎ notes</i>` : ""}</button>`;
  if (kind === "design") return `<button type="button" class="pcard" data-prac="${kind}:${i}"><span class="pk">🏗️ 45 min</span><b>${esc(x.title)}</b><small>${esc(x.prompt)}</small>${noted ? `<i>✎ notes</i>` : ""}</button>`;
  if (kind === "ai") return `<button type="button" class="pcard" data-prac="${kind}:${i}"><span class="pk">🧠 5 min read</span><b>${esc(x.title)}</b><small>${esc(x.points[0])}</small></button>`;
  return `<button type="button" class="pcard" data-prac="${kind}:${i}"><span class="pk">🗣️ Story</span><b>${esc(x.q)}</b><small>${esc(x.tip)}</small>${noted ? `<i>✎ drafted</i>` : ""}</button>`;
}
function openPractice(ref) {
  const [kind, i] = ref.split(":"), x = PRACTICE[kind][+i], key = `${kind}:${i}`, profile = C.profile || PROFILE;
  let body = "", kickoff = "", label = ["Start a mock interview", "Claude plays the interviewer. Type your answers; say “hint” or “feedback” any time."];
  if (kind === "coding") {
    body = `<span class="kicker">💻 Coding build · ${x.time} minutes</span><h2>${esc(x.title)}</h2><p class="hook">${esc(x.why)}</p>
      <div class="takeaways"><h4>How to practise</h4><ul><li>Set a ${x.time}-minute timer and use your strongest language.</li><li>Finish each level with working code and 2–3 quick tests before reading the next one.</li><li>Talk out loud: say what you're choosing and why.</li></ul></div>
      <h4>Level 1</h4><p>${esc(x.levels[0])}</p>
      <details class="abs"><summary>Show the next levels (spoilers)</summary><ol start="2">${x.levels.slice(1).map((l) => `<li>${esc(l)}</li>`).join("")}</ol></details>`;
    kickoff = `Let's do a practical coding interview: "${x.title}". Time budget ${x.time} minutes. All the levels, to reveal one at a time and never ahead: ${x.levels.map((l, n) => `Level ${n + 1}: ${l}`).join(" | ")}. Start by presenting level 1 as the interviewer would.`;
  } else if (kind === "design") {
    body = `<span class="kicker">🏗️ System design · 45 minutes</span><h2>${esc(x.title)}</h2><p class="hook">${esc(x.prompt)}</p>
      <div class="takeaways"><h4>How to practise</h4><ul><li>Clarify requirements and numbers first (users, data size, latency).</li><li>Sketch the high-level flow, then go deep on the hardest part.</li><li>Name trade-offs and failure modes before you're asked.</li></ul></div>
      <details class="abs"><summary>What a strong answer covers</summary><ul>${x.cover.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></details>
      <details class="abs"><summary>Follow-ups to expect</summary><ul>${x.follow.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></details>`;
    kickoff = `System design interview. Prompt: ${x.prompt} Areas a strong answer covers (keep these to yourself): ${x.cover.join("; ")}. Follow-ups to use later: ${x.follow.join("; ")}. Start by giving me the prompt and inviting clarifying questions.`;
  } else if (kind === "ai") {
    body = `<span class="kicker">🧠 AI for infra engineers</span><h2>${esc(x.title)}</h2><div class="takeaways"><h4>The essentials</h4><ul>${x.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`;
    kickoff = `Teach me "${x.title}" as a data and infrastructure engineer preparing for interviews at AI labs. Start from these essentials: ${x.points.join(" ")} Then give one concrete example from real systems and one question an interviewer might ask me about it.`;
    label = ["Teach me more", "A deeper explanation, a real example and a likely interview question"];
  } else {
    body = `<span class="kicker">🗣️ Your story</span><h2>${esc(x.q)}</h2><div class="takeaways"><h4>What makes it strong</h4><p>${esc(x.tip)}</p></div>`;
    kickoff = `Behavioural interview. Ask me: "${x.q}" Then ask 2–3 follow-ups that dig for my own role, numbers and what I learned.`;
  }
  openSheet(`<article class="lesson">${body}
    <div class="think"><h4>${kind === "stories" ? "✍️ Draft your story" : "📝 Your notes"}</h4><textarea id="pnote" rows="5" placeholder="${kind === "stories" ? "Situation, your role, what you did, the result (with numbers), what you learned…" : "Approach, mistakes, what to do differently next time…"}">${esc(C.notes[key] || "")}</textarea></div>
    ${aiBox(`mock:${key}`, kind === "ai" ? ["How does this show up in interviews?", "Give me a harder example", "How would I explain this to a researcher?"] : ["hint", "Can you clarify the requirements?", "feedback"])}</article>`, "s-lesson");
  const note = $("pnote"); note.oninput = () => { C.notes[key] = note.value; save(); };
  wireAI(`mock:${key}`, () => (kind === "ai" ? conversation(kickoff, { web: false }) : mock(profile, kickoff)), false, label);
}

/* ---------------- senior → staff ---------------- */
const itemKey = (s, lvl, i) => `${s.id}.${lvl}.${i}`;
function growSection() {
  const track = TRACKS.eng;
  const tally = (lvl) => SKILLS.reduce((a, s) => [a[0] + s[lvl].filter((_, i) => ST.done[itemKey(s, lvl, i)]).length, a[1] + s[lvl].length], [0, 0]);
  const [sd, st] = tally("senior"), [fd, ft] = tally("staff");
  return `<section class="sec" id="grow"><header class="sec-h"><h3>Grow towards staff</h3><p>The skills behind the interviews: a placement quiz, short lessons and a checklist of what senior and staff look like.</p></header>
    ${track && !ST.place.eng ? `<button type="button" class="brief" data-place="eng"><span>📝</span><b>Find my level in engineering</b><small>${track.placement.length} quick questions, then a plan of short lessons that skips what you know</small></button>` : ""}</section>${planSection(track)}
  <section class="sec"><header class="sec-h"><h3>Where you are</h3><p>Tick what's true today. One small practice per area, changing every week.</p></header>
    <div class="bars"><div class="bar"><span>Senior</span><i style="--p:${(sd / st) * 100}%"></i><b>${sd}/${st}</b></div><div class="bar staff"><span>Staff</span><i style="--p:${(fd / ft) * 100}%"></i><b>${fd}/${ft}</b></div></div>
    <div class="skills">${SKILLS.map((s) => {
      const n = s.senior.length + s.staff.length, d = ["senior", "staff"].reduce((a, l) => a + s[l].filter((_, i) => ST.done[itemKey(s, l, i)]).length, 0), open = ST.open === s.id;
      const list = (lvl) => `<ul class="checks">${s[lvl].map((t, i) => `<li><label><input type="checkbox" data-done="${itemKey(s, lvl, i)}"${ST.done[itemKey(s, lvl, i)] ? " checked" : ""}><span>${esc(t)}</span></label></li>`).join("")}</ul>`;
      const lessons = track?.lessons.filter((l) => l.topic === s.id) || [];
      return `<article class="skill${open ? " open" : ""}" id="sk-${s.id}">
        <button type="button" class="sk-h" data-open="${s.id}" aria-expanded="${open}"><span class="ic">${s.icon}</span><span class="nm">${esc(s.title)}</span><span class="ring" style="--p:${(d / n) * 100}%"><b>${d}/${n}</b></span></button>
        ${open ? `<div class="sk-b"><p class="why">${esc(s.why)}</p>
          <div class="practice"><span>This week's practice</span><p>${esc(s.practice[Math.floor(dayNo / 7) % s.practice.length])}</p></div>
          <div class="lv2"><div><h4>Senior</h4>${list("senior")}</div><div><h4>Staff</h4>${list("staff")}</div></div>
          ${lessons.length ? `<h4>Lessons</h4><div class="lrow">${lessons.map((l) => lessonChip(track, l, false)).join("")}</div>` : ""}
          <h4>Read</h4><ul class="reads">${s.read.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.t)}</b></a> <span>${esc(r.by)} · ${esc(r.kind)}</span></li>`).join("")}</ul></div>` : ""}</article>`;
    }).join("")}</div></section>
  ${library(track)}`;
}

/* ---------------- saved ---------------- */
function savedView() {
  const items = Object.values(ST.saved).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  const notes = Object.entries(ST.notes).filter(([, v]) => v?.trim());
  const group = (k, title) => { const g = items.filter((i) => i.kind === k); return g.length ? `<h3 class="grp">${title}</h3><div class="grid">${g.map((i) => (k === "paper" ? paperCard(i, "") : newsCard(i, "", TRACKS[TRACK_FOR[i.tab]] || TRACKS.feminism))).join("")}</div>` : ""; };
  const lessonOf = (id) => Object.values(TRACKS).flatMap((t) => t.lessons.map((l) => ({ l, t }))).find((x) => x.l.id === id);
  return `<section class="hero slim"><div class="hero-t"><span class="kicker">★ Saved</span><h2>Things to come back to</h2><p>Stories you starred, and your own thoughts from lessons.</p></div></section>
  ${items.length || notes.length ? `<div class="saved">${group("news", "News")}${group("paper", "Research")}${group("blog", "Blog posts")}${group("discussion", "Discussions")}
    ${notes.length ? `<h3 class="grp">Your reflections</h3><div class="grid">${notes.map(([id, v]) => { const x = lessonOf(id); return x ? `<article class="item note"><button type="button" class="open" data-lesson="${id}" data-track="${x.t.id}"><h4>${esc(x.l.title)}</h4></button><p class="q">${esc(x.l.think)}</p><p class="sum">${esc(v)}</p></article>` : ""; }).join("")}</div>` : ""}</div>`
    : empty("Nothing saved yet. Tap ☆ on any story to keep it here.")}`;
}

/* ---------------- the sheet: lessons, quizzes and explanations ---------------- */
const sheet = $("sheet"), body = $("sheet-body");
function openSheet(html, cls = "") { body.innerHTML = html; sheet.className = `sheet ${cls}`; if (!sheet.open) sheet.showModal(); body.scrollTop = 0; sheet.querySelector(".sheet-in").scrollTop = 0; wire(body); }
$("sheet-close").onclick = () => sheet.close();
sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
sheet.addEventListener("close", () => { CURRENT?.abort?.abort(); paint(); });
let CURRENT = null; // the conversation open in the sheet

/* placement quiz */
function startPlacement(trackId) {
  const track = TRACKS[trackId]; if (!track) return;
  const Q = { track, i: 0, picks: [] };
  const step = () => {
    const q = track.placement[Q.i], picked = Q.picks[Q.i];
    openSheet(`<div class="quiz">
      <span class="kicker">Find your level · ${Q.i + 1} of ${track.placement.length}</span>
      <div class="dots">${track.placement.map((_, j) => `<i class="${j < Q.i ? (Q.picks[j] === track.placement[j].answer ? "ok" : "no") : j === Q.i ? "on" : ""}"></i>`).join("")}</div>
      <p class="qtopic">${esc(track.topics.find((t) => t.id === q.topic)?.icon || "")} ${esc(track.topics.find((t) => t.id === q.topic)?.title || "")}</p>
      <h3>${esc(q.q)}</h3>
      <div class="opts">${q.options.map((o, j) => `<button type="button" class="opt${picked != null ? (j === q.answer ? " right" : j === picked ? " wrong" : "") : ""}" data-opt="${j}"${picked != null ? " disabled" : ""}>${esc(o)}</button>`).join("")}
        <button type="button" class="opt idk" data-opt="-1"${picked != null ? " disabled" : ""}>I don't know yet</button></div>
      ${picked != null ? `<div class="explain ${picked === q.answer ? "good" : ""}"><b>${picked === q.answer ? "Yes! " : picked === -1 ? "Here's the answer: " : "Not quite. "}</b>${esc(q.explain)}</div>
        <button type="button" class="btn big" data-next>${Q.i + 1 < track.placement.length ? "Next question →" : "See my plan →"}</button>` : ""}
    </div>`, "s-quiz");
    body.querySelectorAll("[data-opt]").forEach((b) => (b.onclick = () => { Q.picks[Q.i] = +b.dataset.opt; step(); }));
    const n = body.querySelector("[data-next]"); if (n) n.onclick = () => { if (++Q.i < track.placement.length) step(); else finish(); };
  };
  const finish = () => {
    const scores = {}; track.topics.forEach((t) => (scores[t.id] = 0));
    track.placement.forEach((q, j) => { if (Q.picks[j] === q.answer) scores[q.topic] = Math.min(2, (scores[q.topic] || 0) + 1); });
    ST.place[track.id] = { scores, date: today }; save();
    const right = track.placement.filter((q, j) => Q.picks[j] === q.answer).length, p = plan(track);
    openSheet(`<div class="quiz done">
      <span class="kicker">Your results</span><h3>${right} of ${track.placement.length}: ${right >= track.placement.length * 0.8 ? "you know a lot already!" : right >= track.placement.length * 0.5 ? "a solid start." : "lots of good things to discover."}</h3>
      <ul class="lv-list wide">${track.topics.map((t) => `<li><span>${t.icon} ${esc(t.title)}</span><i class="lv lv${scores[t.id]}">${LEVELS[scores[t.id]]}</i></li>`).join("")}</ul>
      <div class="explain good"><b>Your plan:</b> ${p.order.length} lessons over ${p.weeks.length} weeks, starting with ${esc(track.topics.find((t) => t.id === p.order[0]?.topic)?.title || "the basics")}${p.order.length < track.lessons.length ? `. I skipped ${track.lessons.length - p.order.length} basics you already know (they're still in All lessons)` : ""}.</div>
      ${p.next ? `<button type="button" class="btn big" data-lesson="${p.next.id}" data-track="${track.id}">Start: ${esc(p.next.title)} →</button>` : ""}
    </div>`, "s-quiz");
  };
  step();
}

/* a lesson */
function openLesson(trackId, id) {
  const track = TRACKS[trackId], l = track?.lessons.find((x) => x.id === id); if (!l) return;
  const topic = track.topics.find((t) => t.id === l.topic), state = ST.lessons[l.id] || {}, answers = state.answers || [];
  const p = plan(track), seq = p ? p.order : track.lessons, nextL = seq[seq.indexOf(l) + 1] || p?.next;
  openSheet(`<article class="lesson">
    <span class="kicker">${topic?.icon || ""} ${esc(topic?.title || "")} · ${l.minutes} min · ${["", "Basics", "Going deeper", "Deep dive"][l.level] || ""}</span>
    <h2>${esc(l.title)}</h2><p class="hook">${esc(l.hook)}</p>
    ${l.body.map((para) => `<p>${esc(para)}</p>`).join("")}
    <div class="takeaways"><h4>Remember</h4><ul>${l.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
    ${l.india ? `<div class="angle a-india"><span>🇮🇳 In India and South Asia</span><p>${esc(l.india)}</p></div>` : ""}
    ${l.world ? `<div class="angle a-world"><span>🌍 Elsewhere</span><p>${esc(l.world)}</p></div>` : ""}
    ${l.example ? `<div class="angle a-world"><span>🏢 In the real world</span><p>${esc(l.example)}</p></div>` : ""}
    <h3 class="chk">Check yourself</h3>
    ${l.quiz.map((q, qi) => `<div class="lq" data-q="${qi}"><p class="lqq">${esc(q.q)}</p><div class="opts">${q.options.map((o, j) => `<button type="button" class="opt${answers[qi] != null ? (j === q.answer ? " right" : j === answers[qi] ? " wrong" : "") : ""}" data-lq="${qi}" data-opt="${j}"${answers[qi] != null ? " disabled" : ""}>${esc(o)}</button>`).join("")}</div>
      ${answers[qi] != null ? `<div class="explain ${answers[qi] === q.answer ? "good" : ""}"><b>${answers[qi] === q.answer ? "Right! " : "Not quite. "}</b>${esc(q.explain)}</div>` : ""}</div>`).join("")}
    ${l.think ? `<div class="think"><h4>🤔 Think about it</h4><p>${esc(l.think)}</p><textarea id="note" rows="3" placeholder="Jot down your thoughts (saved in this browser)…">${esc(ST.notes[l.id] || "")}</textarea></div>` : ""}
    ${l.deeper?.length ? `<div class="deeper"><h4>Go deeper</h4>${l.deeper.map((d) => `<a href="${esc(safeUrl(d.url))}" target="_blank" rel="noopener">${esc(d.t)} ↗</a>`).join("")}</div>` : ""}
    ${aiBox(`lesson:${l.id}`, ["Explain it more simply", "Give me a real example", trackId === "eng" ? "How would I use this at work?" : "What's happening with this today?", "What do critics say?"])}
    <div class="lesson-f">${state.done ? `<span class="donebadge">✓ Lesson done</span>` : `<span class="soft">Answer both questions to finish this lesson</span>`}${nextL && nextL !== l ? `<button type="button" class="btn" data-lesson="${nextL.id}" data-track="${track.id}">Next: ${esc(nextL.title)} →</button>` : ""}</div>
  </article>`, "s-lesson");
  body.querySelectorAll("[data-lq]").forEach((b) => (b.onclick = () => {
    const s = ST.lessons[l.id] ||= {}; (s.answers ||= [])[+b.dataset.lq] = +b.dataset.opt;
    if (l.quiz.every((_, i) => s.answers[i] != null)) { s.done = true; s.score = l.quiz.filter((q, i) => s.answers[i] === q.answer).length; s.at = today; }
    save(); const y = sheet.querySelector(".sheet-in").scrollTop; openLesson(trackId, id); sheet.querySelector(".sheet-in").scrollTop = y;
  }));
  const note = $("note"); if (note) note.oninput = () => { ST.notes[l.id] = note.value; save(); };
  wireAI(`lesson:${l.id}`, () => conversation(`I'm reading this lesson in my learning app. Teach me more when I ask.\n\nLesson: ${l.title}\n${l.body.join("\n\n")}\n\nKey points: ${l.points.join("; ")}\n\nStart by saying in one or two sentences what the single most important idea is, and offer two directions we could go next.`, { web: true }), false);
}

/* an article, paper or post */
function openItem(url) {
  const it = ITEMS.get(url) || ST.saved[url]; if (!it) return;
  const track = TRACKS[TRACK_FOR[ST.tab]] || TRACKS.feminism, text = `${it.title} ${it.summary || ""} ${it.abstract || ""}`;
  const terms = termsIn(track, text), lessons = lessonsFor(track, text);
  const sugg = it.kind === "paper" ? ["What's the evidence like?", "How does this compare to other studies?", "Explain the method simply"]
    : it.kind === "blog" || it.kind === "discussion" ? ["Give me a concrete example", "What would a staff engineer do here?", "What are the trade-offs?"]
      : ["What's the history behind this?", "What does this mean for India?", "What are the different views?", "Explain like I'm new to this"];
  openSheet(`<article class="reader">
    <span class="kicker">${{ news: "📰 News", paper: "🎓 Research", blog: "✍️ Blog post", discussion: "💬 Discussion" }[it.kind] || ""}${it.source ? ` · ${esc(it.source)}` : ""}${it.date ? ` · ${esc(ago(it.date))}` : ""}</span>
    <h2>${esc(it.title)}</h2>
    ${it.unis?.length ? `<p class="unis">${it.unis.map((u) => `<span>${esc(u)}</span>`).join("")}</p>` : ""}
    ${it.abstract ? `<details class="abs"><summary>The abstract</summary><p>${esc(it.abstract)}</p></details>` : ""}
    <p class="orig"><a class="btn ghost" href="${esc(safeUrl(it.url))}" target="_blank" rel="noopener">Read the original ↗</a>${star(it.url)}</p>
    ${aiBox(`item:${url}`, sugg)}
    ${terms.length ? `<div class="terms"><h4>📖 Words in this story</h4>${terms.map((g) => `<p><b>${esc(g.term)}:</b> ${esc(g.def)}</p>`).join("")}</div>` : ""}
    ${lessons.length ? `<div class="related"><h4>Learn the background</h4>${lessons.map((l) => lessonChip(track, l, false)).join("")}</div>` : ""}
  </article>`, "s-reader");
  wireAI(`item:${url}`, () => explain({ ...it, context: knowSummary(track) }), true);
}

/* this week's briefing */
function openBrief(topicId) {
  const t = TOPICS.find((x) => x.id === topicId), region = ST.region[topicId] || "world", r = REGIONS.find((x) => x.id === region);
  const items = FEED?.news?.[topicId]?.[region] || [], track = TRACKS[TRACK_FOR[topicId]];
  openSheet(`<article class="reader"><span class="kicker">✨ Your briefing · ${esc(r?.label || "")}</span><h2>${esc(t.label)} this week</h2>
    ${aiBox(`brief:${topicId}:${region}`, ["Go deeper on the first thread", "What's the history behind this?", "What should I read next?"])}
    <div class="related"><h4>The headlines</h4>${items.map((n) => `<button type="button" class="lchip" data-item="${esc(n.url)}"><span class="ck">📰</span><span class="lt">${esc(n.title)}</span></button>`).join("")}</div></article>`, "s-reader");
  wireAI(`brief:${topicId}:${region}`, () => brief(`${t.label} (${r?.label.replace(/^\S+\s/, "")})`, items, knowSummary(track)), true);
}

/* ---------------- Claude, inside the sheet ---------------- */
const CHATS = new Map(); // key -> { conv, turns: [{q, html}] }
function aiBox(key, suggestions) {
  return `<section class="aibox" id="aibox" data-key="${esc(key)}">
    <div id="ai-out" class="ai-out"></div>
    <div id="ai-ask" class="ai-ask" hidden>
      <div class="sugg">${suggestions.map((s) => `<button type="button" class="pill" data-ask="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      <form id="ai-form" class="row"><input id="ai-q" placeholder="Ask a follow-up…" autocomplete="off" aria-label="Ask a follow-up"><button type="submit" class="btn">Ask</button></form>
      <p class="keynote">Using your Claude key, saved in this browser · <button type="button" class="link" id="ai-forget">Disconnect</button></p>
    </div></section>`;
}
function connectBox() {
  return `<div class="connect"><h4>✨ Let Claude explain it</h4>
    <p>Connect your Claude API key and every story, paper and lesson gets a plain-English explanation, the background you need, and a tutor you can ask follow-ups. It's the same key Story So Far uses: saved only in this browser, sent only to Anthropic.</p>
    <form id="key-form" class="row"><input id="key-in" type="password" placeholder="sk-ant-…" autocomplete="off" aria-label="Claude API key"><button type="submit" class="btn">Connect</button></form>
    <p class="soft">No key yet? Create one at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>. Each explanation costs a few cents.</p></div>`;
}
function wireAI(key, start, autoStart, label = ["Ask Claude about this lesson", "Go deeper, get examples, or ask anything"]) {
  const out = $("ai-out"), ask = $("ai-ask");
  if (!ai.key) {
    out.innerHTML = connectBox();
    $("key-form").onsubmit = (e) => { e.preventDefault(); const k = $("key-in").value.trim(); if (!k) return; ai.setKey(k); wireAI(key, start, autoStart, label); };
    return;
  }
  let chat = CHATS.get(key);
  const paintChat = () => { out.innerHTML = chat.turns.map((t) => `${t.q ? `<p class="you">${esc(t.q)}</p>` : ""}<div class="ans">${t.html}</div>`).join(""); ask.hidden = false; };
  const send = async (q) => {
    CURRENT = { abort: new AbortController() };
    chat.turns.push({ q, html: `<p class="thinking"><i></i><i></i><i></i> ${q ? "Thinking" : "Reading and thinking"}…</p>` }); paintChat();
    const turn = chat.turns[chat.turns.length - 1];
    try { turn.html = md(q ? await chat.conv.ask(q, CURRENT.abort.signal) : await chat.conv.run(CURRENT.abort.signal)); }
    catch (e) { if (e.cancelled) { chat.turns.pop(); if (!chat.turns.length) CHATS.delete(key); return; } turn.html = `<p class="err">${esc(e.message)}</p>`; if (!q) { CHATS.delete(key); } }
    if ($("aibox")?.dataset.key === key) { paintChat(); if (q) out.lastElementChild?.scrollIntoView({ block: "start", behavior: "smooth" }); }
  };
  $("ai-form").onsubmit = (e) => { e.preventDefault(); const q = $("ai-q").value.trim(); if (!q || !chat) return; $("ai-q").value = ""; send(q); };
  $("ai-forget").onclick = () => { ai.forget(); CHATS.clear(); ask.hidden = true; wireAI(key, start, autoStart, label); };
  ask.querySelectorAll("[data-ask]").forEach((b) => (b.onclick = () => chat && send(b.dataset.ask)));
  if (chat) return paintChat();
  const begin = () => { chat = { conv: start(), turns: [] }; CHATS.set(key, chat); send(null); };
  if (autoStart) begin();
  else { out.innerHTML = `<button type="button" class="brief small" id="ai-start"><span>✨</span><b>${esc(label[0])}</b><small>${esc(label[1])}</small></button>`; $("ai-start").onclick = begin; }
}

/* ---------------- wiring ---------------- */
function wire(root) {
  root.querySelectorAll("[data-save]").forEach((b) => (b.onclick = (e) => {
    e.stopPropagation();
    const url = b.dataset.save;
    if (ST.saved[url]) delete ST.saved[url];
    else { const it = ITEMS.get(url); if (!it) return; ST.saved[url] = { ...it, tab: ST.tab, savedAt: new Date().toISOString() }; }
    save(); paintTabs();
    const on = !!ST.saved[url];
    document.querySelectorAll(`[data-save="${CSS.escape(url)}"]`).forEach((s) => { s.classList.toggle("on", on); s.textContent = on ? "★" : "☆"; s.setAttribute("aria-pressed", on); });
  }));
  root.querySelectorAll("[data-item]").forEach((b) => (b.onclick = () => openItem(b.dataset.item)));
  root.querySelectorAll("[data-lesson]").forEach((b) => (b.onclick = () => openLesson(b.dataset.track, b.dataset.lesson)));
  root.querySelectorAll("[data-place]").forEach((b) => (b.onclick = () => startPlacement(b.dataset.place)));
  root.querySelectorAll("[data-brief]").forEach((b) => (b.onclick = () => openBrief(b.dataset.brief)));
  root.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => go(b.dataset.go)));
  root.querySelectorAll("[data-term]").forEach((b) => (b.onclick = () => {
    const card = b.closest(".item"), g = TRACKS[b.dataset.track]?.glossary.find((x) => x.term === b.dataset.term); if (!card || !g) return;
    const old = card.querySelector(".def"); if (old && old.dataset.term === g.term) return old.remove(); old?.remove();
    card.insertAdjacentHTML("beforeend", `<p class="def" data-term="${esc(g.term)}"><b>${esc(g.term)}:</b> ${esc(g.def)}</p>`);
  }));
  root.querySelectorAll("[data-morefact]").forEach((b) => (b.onclick = () => { ST.factN = (ST.factN || 0) + 1; paint(); }));
  root.querySelectorAll("[data-region]").forEach((b) => (b.onclick = () => { ST.region[ST.tab] = b.dataset.region; save(); paint(); }));
  root.querySelectorAll("[data-kind]").forEach((b) => (b.onclick = () => { ST.blogKind = b.dataset.kind; save(); paint(); }));
  const uni = root.querySelector("#uni"); if (uni) uni.onchange = () => { ST.uni[ST.tab] = uni.value; save(); paint(); };
  const f = root.querySelector("#search"); if (f) f.onsubmit = runSearch;
  root.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => { ST.open = ST.open === b.dataset.open ? null : b.dataset.open; save(); paint(); $(`sk-${b.dataset.open}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }));
  root.querySelectorAll("[data-ctask]").forEach((c) => (c.onchange = () => { if (c.checked) C.done[c.dataset.ctask] = true; else delete C.done[c.dataset.ctask]; save(); const y = scrollY; paint(); scrollTo(0, y); }));
  root.querySelectorAll("[data-cstart]").forEach((b) => (b.onclick = () => { C.start = new Date().toISOString(); save(); paint(); }));
  root.querySelectorAll("[data-pk]").forEach((b) => (b.onclick = () => { C.kind = b.dataset.pk; save(); const y = scrollY; paint(); scrollTo(0, y); }));
  root.querySelectorAll("[data-prac]").forEach((b) => (b.onclick = () => openPractice(b.dataset.prac)));
  const prof = root.querySelector("#profile"); if (prof) prof.oninput = () => { C.profile = prof.value; save(); };
  root.querySelectorAll("[data-done]").forEach((c) => (c.onchange = () => { if (c.checked) ST.done[c.dataset.done] = true; else delete ST.done[c.dataset.done]; save(); const y = scrollY; paint(); scrollTo(0, y); }));
}

/* ---------------- start ---------------- */
paintTabs(); paint();
ready.then(() => {
  if (FEED?.updated) $("updated").textContent = `Updated ${new Date(FEED.updated).toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })}`;
  paint();
});
