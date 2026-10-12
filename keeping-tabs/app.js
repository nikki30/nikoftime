import { TOPICS, REGIONS } from "./topics.js";
import { SKILLS } from "./skills.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "#");

/* ---------------- saved state (this browser only) ---------------- */
const KEY = "kt-v1";
const ST = Object.assign({ tab: "feminism", region: {}, saved: {}, done: {}, seen: {}, blogKind: "all", uni: {}, open: "design" }, (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch {} };
// What counts as "new": anything newer than your previous visit to that tab.
const LAST = { ...ST.seen };

/* ---------------- the feed ---------------- */
let FEED = null;
const feedReady = fetch("feed.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null).then((f) => { FEED = f; });

/* ---------------- helpers ---------------- */
const DAY = 864e5;
function ago(d) {
  if (!d) return "";
  const t = new Date(d), days = Math.floor((Date.now() - t) / DAY);
  if (isNaN(t)) return "";
  if (days < 1) return "today"; if (days < 2) return "yesterday"; if (days < 14) return `${days} days ago`;
  return t.toLocaleDateString(undefined, { day: "numeric", month: "short", year: t.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}
const isNew = (tab, d) => LAST[tab] && d && new Date(d) > new Date(LAST[tab]);
const star = (item, kind) => `<button type="button" class="star${ST.saved[item.url] ? " on" : ""}" data-save="${esc(item.url)}" data-type="${kind}" aria-label="${ST.saved[item.url] ? "Remove from saved" : "Save for later"}" aria-pressed="${!!ST.saved[item.url]}">${ST.saved[item.url] ? "★" : "☆"}</button>`;
// Every item on the page, by url, so the star button can save a copy of it.
const ITEMS = new Map();
const remember = (item, kind) => { ITEMS.set(item.url, { ...item, kind }); return item; };

function newsItem(n, tab) {
  remember(n, "news");
  return `<article class="item${isNew(tab, n.date) ? " fresh" : ""}">
    <a href="${esc(safeUrl(n.url))}" target="_blank" rel="noopener"><h4>${esc(n.title)}</h4></a>
    <p class="meta">${n.source ? `<b>${esc(n.source)}</b> · ` : ""}${esc(ago(n.date))}</p>${star(n, "news")}</article>`;
}
function paperItem(p, tab) {
  remember(p, "paper");
  return `<article class="item paper${isNew(tab, p.date) ? " fresh" : ""}">
    ${p.unis?.length ? `<p class="unis">${p.unis.slice(0, 3).map((u) => `<span>${esc(u)}</span>`).join("")}</p>` : ""}
    <a href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener"><h4>${esc(p.title)}</h4></a>
    <p class="meta">${esc(p.authors || "")}${p.venue ? ` · <i>${esc(p.venue)}</i>` : ""} · ${esc(ago(p.date))}</p>
    ${p.abstract ? `<details><summary>What it's about</summary><p>${esc(p.abstract)}</p></details>` : ""}
    <p class="links"><a href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener">Read →</a>${p.free ? `<a class="free" href="${esc(safeUrl(p.free))}" target="_blank" rel="noopener">Free to read ↗</a>` : ""}</p>
    ${star(p, "paper")}</article>`;
}
const empty = (msg) => `<p class="empty">${msg}</p>`;
const noFeed = () => empty(FEED ? "Nothing here today. Check back tomorrow morning." : "The feed is refreshed every morning when the site rebuilds. If this is the very first build, it'll appear after the next update.");

/* ---------------- tabs ---------------- */
const TABS = [
  ...TOPICS.map((t) => ({ id: t.id, label: `${t.icon} ${t.label}`, cls: `t-${t.id}` })),
  { id: "eng", label: "💻 Engineering", cls: "t-eng" },
  { id: "skills", label: "📈 Senior → Staff", cls: "t-skills" },
  { id: "saved", label: "★ Saved", cls: "t-saved" },
];
function paintTabs() {
  const count = Object.keys(ST.saved).length;
  $("tabs").innerHTML = TABS.map((t) => `<button type="button" role="tab" class="tab ${t.cls}${ST.tab === t.id ? " on" : ""}" aria-selected="${ST.tab === t.id}" data-tab="${t.id}">${esc(t.label)}${t.id === "saved" && count ? ` <small>${count}</small>` : ""}</button>`).join("");
  $("tabs").querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => go(b.dataset.tab)));
  // On a phone the tab row scrolls sideways: keep the chosen tab in view.
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
  $("main").innerHTML = t ? topicView(t) : ST.tab === "eng" ? engView() : ST.tab === "skills" ? skillsView() : savedView();
  wire();
}

/* ---------------- a topic: news by region + research ---------------- */
function topicView(t) {
  const region = ST.region[t.id] || "world", news = FEED?.news?.[t.id]?.[region] || [];
  const papers = FEED?.papers?.[t.id] || [], uni = ST.uni[t.id] || "all";
  const uniList = [...new Set(papers.flatMap((p) => p.unis || []))].sort();
  const shown = uni === "all" ? papers : papers.filter((p) => p.unis?.includes(uni));
  return `<section class="intro"><h2>${t.icon} ${esc(t.label)}</h2><p>${esc(t.blurb)}, around the world, plus the newest research from leading universities.</p></section>
  <div class="cols">
    <section class="col">
      <header class="col-h"><h3>In the news <span>this week</span></h3></header>
      <div class="chips" role="group" aria-label="Region">${REGIONS.map((r) => `<button type="button" class="chip${r.id === region ? " on" : ""}" data-region="${r.id}">${esc(r.label)}${FEED?.news?.[t.id]?.[r.id]?.some((n) => isNew(t.id, n.date)) ? `<i class="dot" aria-label="new"></i>` : ""}</button>`).join("")}</div>
      <div class="list">${news.length ? news.map((n) => newsItem(n, t.id)).join("") : noFeed()}</div>
    </section>
    <section class="col">
      <header class="col-h"><h3>New research <span>from leading universities</span></h3></header>
      ${uniList.length > 1 ? `<label class="pick">From <select id="uni"><option value="all">all ${uniList.length} universities</option>${uniList.map((u) => `<option${u === uni ? " selected" : ""}>${esc(u)}</option>`).join("")}</select></label>` : ""}
      <div class="list">${shown.length ? shown.map((p) => paperItem(p, t.id)).join("") : noFeed()}</div>
      ${searchBox(t)}
    </section>
  </div>`;
}

/* live research search (OpenAlex works from any browser) */
function searchBox(t) {
  return `<form class="search" id="search" data-topic="${t.id}">
    <h4>🔎 Dig deeper</h4><p>Search research on anything, e.g. <i>women in tech</i>, <i>Section 377</i>, <i>care work India</i>.</p>
    <div class="row"><input id="q" type="search" placeholder="Search research…" aria-label="Search research" autocomplete="off"><button type="submit" class="btn">Search</button></div>
    <label class="only"><input type="checkbox" id="only" checked> Only leading universities</label>
    <div id="results" class="list"></div></form>`;
}
async function runSearch(e) {
  e.preventDefault();
  const q = $("q").value.trim(); if (!q) return;
  const out = $("results"); out.innerHTML = `<p class="empty">Searching…</p>`;
  const unis = FEED?.universities || {}, ids = Object.keys(unis);
  const filters = [`from_publication_date:${new Date(Date.now() - 3 * 365 * DAY).toISOString().slice(0, 10)}`, "type:article|preprint|book-chapter|review"];
  if ($("only").checked && ids.length) filters.push(`authorships.institutions.lineage:${ids.join("|")}`);
  try {
    const r = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(q)}&filter=${filters.join(",")}&sort=relevance_score:desc&per_page=15&select=id,title,publication_date,doi,primary_location,authorships,abstract_inverted_index,open_access`).then((x) => x.json());
    const items = (r.results || []).filter((w) => w.title).map((w) => {
      const words = []; for (const [k, ps] of Object.entries(w.abstract_inverted_index || {})) for (const p of ps) words[p] = k;
      const ab = words.join(" ").replace(/\s+/g, " ").trim();
      return {
        title: w.title.replace(/<[^>]+>/g, ""), date: w.publication_date, url: w.doi || w.primary_location?.landing_page_url || w.id, free: w.open_access?.oa_url,
        venue: w.primary_location?.source?.display_name || "", authors: w.authorships.slice(0, 3).map((a) => a.author.display_name).join(", ") + (w.authorships.length > 3 ? ", et al." : ""),
        unis: [...new Set(w.authorships.flatMap((a) => a.institutions.map((i) => unis[i.id?.split("/").pop()] || (ids.length ? null : i.display_name))).filter(Boolean))],
        abstract: ab.length > 320 ? `${ab.slice(0, 320).replace(/\s+\S*$/, "")}…` : ab,
      };
    });
    out.innerHTML = items.length ? items.map((p) => paperItem(p, "")).join("") : `<p class="empty">No research found for “${esc(q)}”. Try fewer or broader words${$("only").checked ? ", or untick “Only leading universities”" : ""}.</p>`;
    wireStars(out);
  } catch { out.innerHTML = `<p class="empty">Couldn't reach OpenAlex just now. Try again in a moment.</p>`; }
}

/* ---------------- engineering ---------------- */
const KINDS = [["all", "All"], ["staff", "Staff+"], ["career", "Career"], ["systems", "Systems"], ["craft", "Craft"], ["ops", "Reliability"], ["ai", "AI"]];
function engView() {
  const e = FEED?.eng || {}, kind = ST.blogKind;
  const blogs = (e.blogs || []).filter((b) => kind === "all" || b.kind === kind);
  return `<section class="intro"><h2>💻 Engineering</h2><p>Fresh writing from engineers worth learning from, what engineers are discussing, and new research in software engineering.</p></section>
  <div class="cols three">
    <section class="col">
      <header class="col-h"><h3>From the blogs</h3></header>
      <div class="chips">${KINDS.map(([k, l]) => `<button type="button" class="chip${k === kind ? " on" : ""}" data-kind="${k}">${l}</button>`).join("")}</div>
      <div class="list">${blogs.length ? blogs.map((b) => { remember(b, "blog"); return `<article class="item${isNew("eng", b.date) ? " fresh" : ""}"><a href="${esc(safeUrl(b.url))}" target="_blank" rel="noopener"><h4>${esc(b.title)}</h4></a><p class="meta"><b>${esc(b.source)}</b> · ${esc(ago(b.date))}</p>${b.summary ? `<p class="sum">${esc(b.summary)}</p>` : ""}${star(b, "blog")}</article>`; }).join("") : noFeed()}</div>
    </section>
    <section class="col">
      <header class="col-h"><h3>Most discussed <span>on Hacker News, last 2 weeks</span></h3></header>
      <div class="list">${(e.hn || []).length ? e.hn.map((h) => { remember(h, "discussion"); return `<article class="item hn${isNew("eng", h.date) ? " fresh" : ""}"><span class="pts">${h.points}<small>points</small></span><div><a href="${esc(safeUrl(h.url))}" target="_blank" rel="noopener"><h4>${esc(h.title)}</h4></a><p class="meta"><a href="${esc(safeUrl(h.discuss))}" target="_blank" rel="noopener">${h.comments} comments</a> · ${esc(ago(h.date))}</p></div>${star(h, "discussion")}</article>`; }).join("") : noFeed()}</div>
    </section>
    <section class="col">
      <header class="col-h"><h3>New research <span>arXiv, software engineering</span></h3></header>
      <div class="list">${(e.papers || []).length ? e.papers.slice(0, 15).map((p) => paperItem(p, "eng")).join("") : noFeed()}</div>
    </section>
  </div>`;
}

/* ---------------- senior → staff skills ---------------- */
const week = Math.floor(Date.now() / (7 * DAY));
const itemKey = (s, lvl, i) => `${s.id}.${lvl}.${i}`;
function skillsView() {
  const tally = (lvl) => SKILLS.reduce((a, s) => [a[0] + s[lvl].filter((_, i) => ST.done[itemKey(s, lvl, i)]).length, a[1] + s[lvl].length], [0, 0]);
  const [sd, st] = tally("senior"), [fd, ft] = tally("staff");
  return `<section class="intro"><h2>📈 Senior → Staff</h2><p>What good looks like at each level, one small practice per area for this week, and the best things to read. Tick things off as you grow.</p>
    <div class="bars"><div class="bar"><span>Senior</span><i style="--p:${(sd / st) * 100}%"></i><b>${sd}/${st}</b></div><div class="bar staff"><span>Staff</span><i style="--p:${(fd / ft) * 100}%"></i><b>${fd}/${ft}</b></div></div></section>
  <div class="skills">${SKILLS.map((s) => {
    const n = s.senior.length + s.staff.length, d = ["senior", "staff"].reduce((a, l) => a + s[l].filter((_, i) => ST.done[itemKey(s, l, i)]).length, 0), open = ST.open === s.id;
    const list = (lvl) => `<ul class="checks">${s[lvl].map((t, i) => `<li><label><input type="checkbox" data-done="${itemKey(s, lvl, i)}"${ST.done[itemKey(s, lvl, i)] ? " checked" : ""}><span>${esc(t)}</span></label></li>`).join("")}</ul>`;
    return `<article class="skill${open ? " open" : ""}" id="sk-${s.id}">
      <button type="button" class="sk-h" data-open="${s.id}" aria-expanded="${open}"><span class="ic">${s.icon}</span><span class="nm">${esc(s.title)}</span><span class="ring" style="--p:${(d / n) * 100}%"><b>${d}/${n}</b></span></button>
      ${open ? `<div class="sk-b">
        <p class="why">${esc(s.why)}</p>
        <div class="practice"><span>This week's practice</span><p>${esc(s.practice[week % s.practice.length])}</p></div>
        <div class="lv"><div><h4>Senior</h4>${list("senior")}</div><div><h4>Staff</h4>${list("staff")}</div></div>
        <h4>Read</h4><ul class="reads">${s.read.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.t)}</b></a> <span>${esc(r.by)} · ${esc(r.kind)}</span></li>`).join("")}</ul>
      </div>` : ""}</article>`;
  }).join("")}</div>`;
}

/* ---------------- saved ---------------- */
function savedView() {
  const items = Object.values(ST.saved).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  const group = (k, title) => { const g = items.filter((i) => i.kind === k); return g.length ? `<h3 class="grp">${title}</h3><div class="list">${g.map((i) => (k === "paper" ? paperItem(i, "") : newsItem(i, ""))).join("")}</div>` : ""; };
  return `<section class="intro"><h2>★ Saved</h2><p>Things you starred to come back to.</p></section>
  ${items.length ? `<div class="saved">${group("news", "News")}${group("paper", "Research")}${group("blog", "Blog posts")}${group("discussion", "Discussions")}</div>` : empty("Nothing saved yet. Tap ☆ on anything to keep it here.")}`;
}

/* ---------------- wiring ---------------- */
function wireStars(root = $("main")) {
  root.querySelectorAll("[data-save]").forEach((b) => (b.onclick = () => {
    const url = b.dataset.save;
    if (ST.saved[url]) delete ST.saved[url];
    else { const it = ITEMS.get(url); if (!it) return; ST.saved[url] = { ...it, savedAt: new Date().toISOString() }; }
    save(); paintTabs();
    if (ST.tab === "saved") return paint();
    const on = !!ST.saved[url];
    document.querySelectorAll(`[data-save="${CSS.escape(url)}"]`).forEach((s) => { s.classList.toggle("on", on); s.textContent = on ? "★" : "☆"; s.setAttribute("aria-pressed", on); s.setAttribute("aria-label", on ? "Remove from saved" : "Save for later"); });
  }));
}
function wire() {
  const m = $("main");
  m.querySelectorAll("[data-region]").forEach((b) => (b.onclick = () => { ST.region[ST.tab] = b.dataset.region; save(); paint(); }));
  m.querySelectorAll("[data-kind]").forEach((b) => (b.onclick = () => { ST.blogKind = b.dataset.kind; save(); paint(); }));
  const uni = $("uni"); if (uni) uni.onchange = () => { ST.uni[ST.tab] = uni.value; save(); paint(); };
  const f = $("search"); if (f) f.onsubmit = runSearch;
  m.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => { ST.open = ST.open === b.dataset.open ? null : b.dataset.open; save(); paint(); $(`sk-${b.dataset.open}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }));
  m.querySelectorAll("[data-done]").forEach((c) => (c.onchange = () => { if (c.checked) ST.done[c.dataset.done] = true; else delete ST.done[c.dataset.done]; save(); const y = scrollY; paint(); scrollTo(0, y); }));
  wireStars(m);
}

/* ---------------- start ---------------- */
paintTabs(); paint();
feedReady.then(() => {
  if (FEED?.updated) $("updated").textContent = `Updated ${new Date(FEED.updated).toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })}`;
  paint();
});
