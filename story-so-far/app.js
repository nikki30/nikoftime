import { SCHEMA, INSTRUCTIONS, describeReader, fullPrompt, findHints, repairNote, stripHints, STYLES } from "./prompt.js";
import { DEMOS } from "./demos.js";

const MODEL = "claude-opus-5-5";
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

/* ---------------- engines ---------------- */
// 1. Inside Claude (published as a Claude artifact): ask Claude on the viewer's own account.
// 2. Anywhere else: the Anthropic API with the visitor's own key.
const E = { sample: null, key: "" };
E.key = store.get("ssf-key", "") || (() => { try { return sessionStorage.getItem("ssf-key") || ""; } catch { return ""; } })();

async function detectClaude() {
  if (!window.claude?.use) return;
  document.querySelector(".home").hidden = true; // inside Claude there is no site to go back to
  try { E.sample = await window.claude.use("sample"); } catch { E.sample = null; }
  paintEngine();
}

function engineName() { return E.sample ? "claude" : E.key ? "key" : null; }

function paintEngine() {
  const b = $("engine-badge"), name = engineName();
  b.hidden = !name;
  b.textContent = name === "claude" ? "● Using your Claude account" : name === "key" ? "● Connected with your API key" : "";
  $("keybox").hidden = name === "claude";
  $("key-state").textContent = E.key ? "Connected. Your key is saved in this browser" : "to recap your own books";
  $("key-forget").hidden = !E.key;
  $("f-key").value = "";
  $("f-key").placeholder = E.key ? "sk-ant-…" + E.key.slice(-4) : "sk-ant-…";
}

let SDK = null;
async function viaKey(input, extra, signal) {
  SDK ||= (await import("./vendor/anthropic.mjs")).Anthropic;
  const client = new SDK({ apiKey: E.key, dangerouslyAllowBrowser: true });
  let res;
  try {
    res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: INSTRUCTIONS,
      output_config: { effort: "high", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: (extra ? extra + "\n\n" : "") + describeReader(input) }],
    }, { signal });
  } catch (e) {
    if (e instanceof SDK.AuthenticationError) throw new Error("That API key didn't work. Check it in Connect Claude.");
    if (e instanceof SDK.PermissionDeniedError) throw new Error("This API key isn't allowed to use Claude. Check its workspace permissions.");
    if (e instanceof SDK.RateLimitError) throw new Error("Too many requests right now. Wait a minute and try again.");
    if (e instanceof SDK.APIUserAbortError || signal?.aborted) throw Object.assign(new Error("Stopped."), { cancelled: true });
    if (e instanceof SDK.APIConnectionError) throw new Error("Couldn't reach Claude. Check your connection and try again.");
    if (e instanceof SDK.APIError) throw new Error(`Claude returned an error (${e.status || "unknown"}). Try again in a moment.`);
    throw e;
  }
  if (res.stop_reason === "refusal") throw new Error("Claude declined to recap this one. Try rewording what just happened.");
  if (res.stop_reason === "max_tokens") throw new Error("The recap ran too long. Try again.");
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return JSON.parse(text);
}

async function viaClaude(input, extra, signal, fresh) {
  try {
    return await E.sample.json(fullPrompt(input, extra), { modelTier: "complex", signal, cache: fresh ? false : true });
  } catch (e) {
    const msg = {
      cancelled: "Stopped.", not_granted: "This page needs your permission to ask Claude.", rate_limited: "You've hit a usage limit. Try again a bit later.",
      refused: "Claude declined to recap this one. Try rewording what just happened.", invalid_json: "That recap came back garbled. Try again.",
      session_expired: "Please sign in to Claude again.", sampling_disabled: "Claude isn't available on this account.",
    }[e?.code] || "Something went wrong reaching Claude. Try again.";
    throw Object.assign(new Error(msg), { cancelled: e?.code === "cancelled" });
  }
}

function valid(r) {
  return r && typeof r === "object" && Array.isArray(r.beats) && r.beats.length && typeof r.recap === "string";
}
function tidy(r) {
  r.style = STYLES.includes(r.style) ? r.style : "scrapbook";
  r.beats = (r.beats || []).slice(0, 10); r.cast = (r.cast || []).slice(0, 8); r.links = (r.links || []).slice(0, 6); r.remember = (r.remember || []).slice(0, 5);
  return r;
}

async function generate(input, signal, fresh) {
  const run = (extra) => (engineName() === "claude" ? viaClaude(input, extra, signal, fresh || !!extra) : viaKey(input, extra, signal));
  let r = await run("");
  if (!valid(r)) throw new Error("That recap came back incomplete. Try again.");
  let hints = findHints(r), checked = "clean";
  if (hints.length) {
    setLoading("Double-checking for hints about what's next…");
    const again = await run(repairNote(hints));
    if (valid(again)) r = again;
    hints = findHints(r);
    if (hints.length) { r = stripHints(r); checked = "trimmed"; } else checked = "rewritten";
  }
  return { ...tidy(r), checked };
}

/* ---------------- form ---------------- */
let fmt = "book";
document.querySelectorAll("[data-fmt]").forEach((b) => b.addEventListener("click", () => setFmt(b.dataset.fmt)));
function setFmt(f) {
  fmt = f;
  document.querySelectorAll("[data-fmt]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.fmt === f)));
  $("pos-pages").hidden = f === "audio"; $("pos-audio").hidden = f !== "audio";
}
$("f-percent").addEventListener("input", (e) => ($("pct-out").textContent = e.target.value + "%"));

const PLACEHOLDERS = ["e.g. Elizabeth just got fired from the lab", "e.g. They've just arrived at the wedding", "e.g. The detective just found the second letter", "e.g. Chapter 12, the storm just hit the island"];
let ph = 0; setInterval(() => { if (document.activeElement !== $("f-context") && !$("f-context").value) $("f-context").placeholder = PLACEHOLDERS[++ph % PLACEHOLDERS.length]; }, 3500);

function readForm() {
  const input = { title: $("f-title").value.trim(), author: $("f-author").value.trim(), format: fmt, context: $("f-context").value.trim() };
  if (fmt === "audio") input.percent = +$("f-percent").value;
  else { input.page = +$("f-page").value || 0; input.total = +$("f-total").value || 0; }
  return input;
}
function fillForm(input) {
  $("f-title").value = input.title || ""; $("f-author").value = input.author || ""; setFmt(input.format || "book");
  $("f-page").value = input.page || ""; $("f-total").value = input.total || "";
  $("f-percent").value = input.percent || 40; $("pct-out").textContent = ($("f-percent").value) + "%";
  $("f-context").value = input.context || "";
}

let ctl = null;
$("ask").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = readForm();
  if (input.format !== "audio" && !input.page) { $("f-page").focus(); $("go-note").textContent = "Add the page you're on."; return; }
  if (input.total && input.page > input.total) { $("f-page").focus(); $("go-note").textContent = "The page is past the end of the book."; return; }
  if (!engineName()) { $("keybox").open = true; $("f-key").focus(); $("go-note").textContent = "Connect Claude first, or try an example below."; return; }
  $("go-note").textContent = "";
  await run(input, false);
});

async function run(input, fresh) {
  ctl?.abort(); ctl = new AbortController();
  $("go").disabled = true;
  setLoading();
  try {
    const result = await generate(input, ctl.signal, fresh);
    const entry = { id: "r" + Date.now(), input, result, at: new Date().toISOString() };
    const shelf = store.get("ssf-shelf", []).filter((x) => !(x.input.title.toLowerCase() === input.title.toLowerCase()));
    store.set("ssf-shelf", [entry, ...shelf].slice(0, 30));
    show(entry); paintShelf();
  } catch (err) {
    $("result").innerHTML = err.cancelled ? "" : `<div class="card error"><b>Couldn't make that recap.</b> ${esc(err.message || err)}</div>`;
  } finally { $("go").disabled = false; }
}

/* ---------------- loading ---------------- */
const LINES = ["Finding your page…", "Carefully not reading ahead…", "Sliding a bookmark over the rest…", "Gathering the cast…", "Drawing it up…"];
let loadTimer = null;
function setLoading(text) {
  clearInterval(loadTimer);
  let i = 0;
  $("result").innerHTML = `<div class="card loading"><div class="flipbook" aria-hidden="true"><i></i><i></i><i></i></div><p id="load-line">${esc(text || LINES[0])}</p><button class="btn ghost small" id="stop">Stop</button></div>`;
  $("stop").onclick = () => ctl?.abort();
  if (!text) loadTimer = setInterval(() => { const el = $("load-line"); if (!el) return clearInterval(loadTimer); el.textContent = LINES[++i % LINES.length]; }, 2600);
  $("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------------- rendering ---------------- */
const posLabel = (i) => i.format === "audio" ? `🎧 ${i.percent}% through` : `${i.format === "ebook" ? "📱" : "📖"} Page ${i.page}${i.total ? ` of ${i.total}` : ""}`;
const pct = (i) => i.format === "audio" ? i.percent : i.total ? Math.round((i.page / i.total) * 100) : null;
const SHIELD = { clean: "No hints about what's next", rewritten: "Rewritten to remove a possible hint", trimmed: "A possible hint was cut out", demo: "Example recap" };

function show(entry) {
  clearInterval(loadTimer);
  const { input, result: r } = entry, p = pct(input);
  let h = `<article class="recap s-${r.style}" id="recap">
    <header class="r-head">
      <div class="r-meta"><span class="chip">${esc(posLabel(input))}</span><span class="chip">${esc(r.vibe)}</span><span class="chip shield">🛡️ ${esc(SHIELD[entry.checked || r.checked] || SHIELD.clean)}</span></div>
      <h2>${esc(r.title)}</h2>${r.author ? `<p class="by">by ${esc(r.author)}</p>` : ""}
      ${p != null ? `<div class="progress" aria-label="${p}% through"><i style="width:${p}%"></i><b style="left:${p}%">you</b></div>` : ""}
    </header>
    ${r.caution || r.known === false ? `<div class="caution">⚠️ ${esc(r.caution || "Claude isn't sure it knows this book well, so this recap only uses what you told it.")}</div>` : ""}
    <p class="headline">${esc(r.headline)}</p>
    <p class="recap-text">${esc(r.recap)}</p>
    ${renderBeats(r)}
    <div class="here"><span class="pin" aria-hidden="true">📍</span><div><b>You are here</b><p>${esc(r.you_are_here)}</p></div></div>
    ${renderCast(r)}
    ${renderLinks(r)}
    ${r.remember?.length ? `<section class="remember"><h3>Worth remembering</h3><ul>${r.remember.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>` : ""}
    <footer class="r-actions">
      <button class="btn" data-act="update">Update my place</button>
      ${entry.demo ? "" : `<button class="btn ghost" data-act="again">Write it again</button>`}
      <button class="btn ghost" data-act="copy">Copy as text</button>
    </footer>
  </article>`;
  $("result").innerHTML = h;
  $("result").querySelector('[data-act="update"]').onclick = () => { fillForm(entry.input); $("f-context").value = ""; $("ask").scrollIntoView({ behavior: "smooth" }); setTimeout(() => $("f-page").focus(), 400); };
  $("result").querySelector('[data-act="again"]')?.addEventListener("click", () => engineName() ? run(entry.input, true) : ($("keybox").open = true));
  $("result").querySelector('[data-act="copy"]').onclick = (e) => { navigator.clipboard?.writeText(asText(entry)).then(() => (e.target.textContent = "Copied ✓")); };
  requestAnimationFrame(() => $("recap")?.classList.add("in"));
  $("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderBeats(r) {
  const items = r.beats.map((b, i) => ({ ...b, i }));
  if (r.style === "journey") {
    return `<section class="beats journey"><h3>The route so far</h3><ol>${items.map((b) => `<li style="--i:${b.i}"><span class="stop"><b>${b.i + 1}</b></span><div class="leg"><span class="marker">${esc(b.marker)}</span><h4>${esc(b.emoji)} ${esc(b.title)}</h4><p>${esc(b.text)}</p></div></li>`).join("")}<li class="end"><span class="stop flag">📍</span><div class="leg"><span class="marker">Now</span></div></li></ol></section>`;
  }
  if (r.style === "lab") {
    return `<section class="beats lab"><h3>Lab notebook</h3>${items.map((b) => `<div class="exp" style="--i:${b.i}"><div class="exp-k"><span>${esc(b.marker || `Exp. ${String(b.i + 1).padStart(2, "0")}`)}</span><b>${esc(b.emoji)}</b></div><div><h4>${esc(b.title)}</h4><p>${esc(b.text)}</p></div></div>`).join("")}</section>`;
  }
  if (r.style === "casefile") {
    return `<section class="beats casefile"><h3>Case file</h3><div class="evidence">${items.map((b) => `<div class="ev" style="--i:${b.i}"><span class="tag">${esc(b.marker || "Exhibit " + String.fromCharCode(65 + b.i))}</span><h4>${esc(b.emoji)} ${esc(b.title)}</h4><p>${esc(b.text)}</p></div>`).join("")}</div></section>`;
  }
  if (r.style === "scrapbook") {
    return `<section class="beats scrapbook"><h3>The scrapbook</h3><div class="snaps">${items.map((b) => `<figure class="snap" style="--i:${b.i}"><div class="pic">${esc(b.emoji)}</div><figcaption><span class="marker">${esc(b.marker)}</span><b>${esc(b.title)}</b>${esc(b.text)}</figcaption></figure>`).join("")}</div></section>`;
  }
  return `<section class="beats timeline"><h3>Timeline</h3><ol>${items.map((b) => `<li style="--i:${b.i}"><span class="when">${esc(b.marker)}</span><div class="ev"><h4>${esc(b.emoji)} ${esc(b.title)}</h4><p>${esc(b.text)}</p></div></li>`).join("")}</ol></section>`;
}

function renderCast(r) {
  if (!r.cast?.length) return "";
  if (r.style === "lab") {
    return `<section class="cast lab"><h3>Periodic table of characters</h3><div class="elements">${r.cast.map((c, i) => `<div class="el" style="--i:${i}"><span class="n">${i + 1}</span><b>${esc((c.symbol || c.name.slice(0, 2)).slice(0, 3))}</b><span class="nm">${esc(c.name)}</span><p>${esc(c.role)}</p></div>`).join("")}</div></section>`;
  }
  if (r.style === "casefile") {
    return `<section class="cast casefile"><h3>Persons of interest</h3><div class="suspects">${r.cast.map((c, i) => `<div class="sus" style="--i:${i}"><div class="mug">${esc(c.emoji)}</div><b>${esc(c.name)}</b><p>${esc(c.role)}</p></div>`).join("")}</div></section>`;
  }
  return `<section class="cast"><h3>Who's who</h3><div class="people">${r.cast.map((c, i) => `<div class="person" style="--i:${i}"><span class="av">${esc(c.emoji)}</span><div><b>${esc(c.name)}</b><p>${esc(c.role)}</p></div></div>`).join("")}</div></section>`;
}

function renderLinks(r) {
  if (!r.links?.length) return "";
  const title = r.style === "lab" ? "Reactions" : r.style === "casefile" ? "Connections" : "How they stand";
  const sep = r.style === "lab" ? "+" : "↔";
  return `<section class="links"><h3>${title}</h3><ul>${r.links.map((l) => `<li><span class="pair"><b>${esc(l.a)}</b> <i>${sep}</i> <b>${esc(l.b)}</b>${r.style === "lab" ? " <i>→</i>" : ""}</span><span>${esc(l.relation)}</span></li>`).join("")}</ul></section>`;
}

function asText({ input, result: r }) {
  return [`${r.title}${r.author ? ` by ${r.author}` : ""}: the story so far (${posLabel(input).replace(/^\S+ /, "")})`, "", r.headline, r.recap, "",
    ...r.beats.map((b) => `• ${b.marker ? b.marker + ": " : ""}${b.title}. ${b.text}`), "", `You are here: ${r.you_are_here}`, "",
    "Who's who:", ...r.cast.map((c) => `• ${c.name}: ${c.role}`)].join("\n");
}

/* ---------------- shelf + demos ---------------- */
function paintShelf() {
  const shelf = store.get("ssf-shelf", []);
  $("shelf").innerHTML = shelf.length ? `<h3>Your shelf</h3><div class="spines">${shelf.map((x, i) => `<div class="spine" style="--h:${(i * 47) % 360}"><button class="open" data-open="${x.id}"><b>${esc(x.input.title)}</b><span>${esc(posLabel(x.input))}</span></button><button class="x" data-del="${x.id}" aria-label="Remove ${esc(x.input.title)} from your shelf">×</button></div>`).join("")}</div>` : "";
}
$("shelf").addEventListener("click", (e) => {
  const o = e.target.closest("[data-open]"), d = e.target.closest("[data-del]"), shelf = store.get("ssf-shelf", []);
  if (o) { const x = shelf.find((s) => s.id === o.dataset.open); if (x) show(x); }
  if (d) { store.set("ssf-shelf", shelf.filter((s) => s.id !== d.dataset.del)); paintShelf(); }
});
DEMOS.forEach((d) => {
  const b = document.createElement("button"); b.type = "button"; b.className = "demo";
  b.innerHTML = `<b>${esc(d.input.title)}</b><span>${esc(posLabel(d.input))}</span>`;
  b.onclick = () => show({ id: d.id, input: d.input, result: d.result, demo: true, checked: "demo" });
  $("demos").append(b);
});

/* ---------------- key ---------------- */
$("key-save").onclick = () => {
  const k = $("f-key").value.trim(); if (!k) return $("f-key").focus();
  E.key = k;
  if ($("key-remember").checked) store.set("ssf-key", k); else { store.del("ssf-key"); try { sessionStorage.setItem("ssf-key", k); } catch {} }
  paintEngine(); $("keybox").open = false; $("go-note").textContent = "Connected. Now press Catch me up.";
};
$("key-forget").onclick = () => { E.key = ""; store.del("ssf-key"); try { sessionStorage.removeItem("ssf-key"); } catch {} paintEngine(); };

paintEngine(); paintShelf(); detectClaude();
