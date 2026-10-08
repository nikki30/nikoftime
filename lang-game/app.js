// Playing the Lang Game: learn to speak Malayalam and Telugu through Tamil, Hindi and English.
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rand = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => new Date().toISOString().slice(0, 10);

const LANGS = {
  ml: { name: "Malayalam", voice: "ml-IN", hue: "#2e9d6a", hello: "Namaskaram", base: 0x0d00 },
  te: { name: "Telugu", voice: "te-IN", hue: "#e07a2f", hello: "Namaskaram", base: 0x0c00 },
};

/* ---------------- saved progress ---------------- */
const KEY = "lg-v1";
const blank = () => ({ lang: "ml", showScript: false, boxes: { ml: {}, te: {} }, phrases: { ml: {}, te: {} }, log: {}, routine: {} });
let ST = (() => { try { return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return blank(); } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch {} };
function logMinutes(min) { const d = today(); ST.log[d] = ST.log[d] || { min: 0 }; ST.log[d].min += min; save(); }
function streak() {
  let n = 0; const d = new Date();
  if (!ST.log[today()]) d.setDate(d.getDate() - 1);
  while (ST.log[d.toISOString().slice(0, 10)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ---------------- lesson data ---------------- */
let D = null;
async function load(lang) { D = (await import(`./data/${lang}.js`)).default; }
const L = () => LANGS[ST.lang];

/* ---------------- speaking and listening ---------------- */
function speak(text, say, btn) {
  const synth = window.speechSynthesis; if (!synth) return;
  synth.cancel();
  const tag = L().voice.toLowerCase(), base = tag.split("-")[0];
  const voices = synth.getVoices();
  const voice = voices.find((v) => v.lang.toLowerCase().replace("_", "-") === tag) || voices.find((v) => v.lang.toLowerCase().startsWith(base));
  // No voice for the language on this device: read the pronunciation guide instead (lowercase, so it isn't spelled out).
  const u = new SpeechSynthesisUtterance(voice ? text : (say || text).replace(/-/g, " ").toLowerCase());
  if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-IN";
  u.rate = 0.82;
  btn?.classList.add("talking"); u.onend = u.onerror = () => btn?.classList.remove("talking");
  synth.speak(u);
}
window.speechSynthesis?.getVoices();
const hasVoice = () => (window.speechSynthesis?.getVoices() || []).some((v) => v.lang.toLowerCase().startsWith(L().voice.slice(0, 2)));

const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
const norm = (s) => String(s).normalize("NFC").replace(/[\s.,!?'"“”‘’।॥-]/g, "");
function lev(a, b) { const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
// 🎤: listen in the target language and say how close you were.
function listen(target, out, btn) {
  if (!Rec) return;
  const r = new Rec(); r.lang = L().voice; r.maxAlternatives = 5; r.interimResults = false;
  btn.classList.add("listening"); out.textContent = "Listening… say it now";
  r.onresult = (e) => {
    const alts = [...e.results[0]].map((a) => a.transcript);
    const t = norm(target), best = Math.max(...alts.map((a) => { const x = norm(a); return 1 - lev(x, t) / Math.max(x.length, t.length, 1); }));
    out.innerHTML = best > 0.75 ? `✅ Nailed it!` : best > 0.45 ? `🙂 Close! I heard <b>${esc(alts[0])}</b>` : `🔁 I heard <b>${esc(alts[0])}</b>. Listen and try again.`;
    if (best > 0.75) { btn.closest("[data-id]")?.classList.add("nailed"); }
  };
  r.onerror = (e) => { out.textContent = e.error === "not-allowed" ? "Allow the microphone to practise speaking." : "Didn't catch that. Try again."; };
  r.onend = () => btn.classList.remove("listening");
  r.start();
}

/* ---------------- pieces ---------------- */
const scriptOn = () => ST.showScript;
// The target word: how it sounds first, the script only if you want it.
function sayBlock(t, { big = true } = {}) {
  return `<div class="say-block${big ? " big" : ""}">
    <span class="say-main">${esc(t.say || t.r)}</span>
    <span class="say-rom">${esc(t.r || "")}</span>
    ${scriptOn() ? `<span class="native ${ST.lang}">${esc(t.w)}</span>` : ""}
  </div>`;
}
function voiceBtns(t, id) {
  return `<span class="vbtns"><button type="button" class="vb" data-speak="${esc(id)}" aria-label="Hear it">🔊</button>${Rec ? `<button type="button" class="vb mic" data-listen="${esc(id)}" aria-label="Say it">🎤</button>` : ""}</span>`;
}
// Words/phrases are registered by id so buttons can find what to say.
const REG = new Map();
const reg = (id, t) => (REG.set(id, t), id);
document.addEventListener("click", (e) => {
  const s = e.target.closest("[data-speak]"); if (s) { const t = REG.get(s.dataset.speak); if (t) speak(t.w, t.say, s); return; }
  const m = e.target.closest("[data-listen]"); if (m) { const t = REG.get(m.dataset.listen); const out = m.closest("[data-id]")?.querySelector(".heard"); if (t && out) listen(t.w, out, m); }
});

const BR = { ta: "Tamil", hi: "Hindi", both: "Tamil & Hindi" };
function bridgeHTML(w) {
  const row = (code, x) => x ? `<span class="br ${w.bridge === code || w.bridge === "both" ? "hit" : ""}"><b>${code === "ta" ? "Tamil" : "Hindi"}</b> <span class="native ${code}">${esc(x.w)}</span> <small>${esc(x.r)}</small></span>` : "";
  return `<div class="bridges">${row("ta", w.ta)}${row("hi", w.hi)}</div>${w.link ? `<p class="link ${w.falseFriend ? "ff" : ""}">${w.falseFriend ? "⚠️ " : w.bridge !== "none" ? "🌉 " : ""}${esc(w.link)}</p>` : ""}`;
}

/* ---------------- spaced repetition (Leitner boxes) ---------------- */
const GAP = [0, 1, 2, 4, 8, 16, 32];
const box = (id) => ST.boxes[ST.lang][id] || null;
function grade(id, knew) {
  const b = box(id) || { b: 0 };
  b.b = knew ? Math.min(GAP.length - 1, b.b + 1) : 1;
  const due = new Date(); due.setDate(due.getDate() + GAP[b.b]); b.due = due.toISOString().slice(0, 10);
  ST.boxes[ST.lang][id] = b; save();
}
const known = () => Object.values(ST.boxes[ST.lang]).filter((b) => b.b >= 3).length;
function pickWords(n = 8) {
  const due = D.words.filter((w) => box(w.id) && box(w.id).due <= today()).slice(0, 4);
  const fresh = D.words.filter((w) => !box(w.id)).slice(0, n - due.length);
  return shuffle([...due, ...fresh]);
}

/* ---------------- views ---------------- */
const VIEWS = {};
function tab(name) {
  document.querySelectorAll("[data-tab]").forEach((a) => a.classList.toggle("on", a.dataset.tab === name));
  REG.clear();
  $("main").innerHTML = "";
  (VIEWS[name] || VIEWS.today)();
  window.scrollTo({ top: 0 });
}

// ☀️ Today: a 20-minute spoken routine.
const STEPS = [
  { k: "phrases", icon: "💬", t: "Warm up", d: "5 phrases: listen, then say them" },
  { k: "words", icon: "🌉", t: "Word bridges", d: "8 words through Tamil & Hindi" },
  { k: "ladder", icon: "🪜", t: "Sentence ladder", d: "1 sentence, word by word" },
  { k: "talk", icon: "🗣️", t: "Talk", d: "A mini conversation, you play a part" },
  { k: "quiz", icon: "👂", t: "Ear test", d: "Hear it, pick the meaning" },
];
VIEWS.today = () => {
  const r = (ST.routine[today()] ||= {})[ST.lang] ||= {};
  const done = STEPS.filter((s) => r[s.k]).length;
  $("main").innerHTML = `
    <section class="hero">
      <div><p class="kicker">Today in ${L().name}</p>
        <h2>${done === STEPS.length ? "All done. Shabash! 🎉" : `${STEPS.length - done} step${STEPS.length - done === 1 ? "" : "s"} to go`}</h2>
        <p class="soft">About 20 minutes, mostly listening and speaking. ${hasVoice() ? "" : `Your device has no ${L().name} voice, so 🔊 reads the pronunciation guide; Chrome on Android usually has one.`}</p></div>
      <div class="stat"><b>${streak()}</b><span>day streak</span></div>
      <div class="stat"><b>${known()}</b><span>words known</span></div>
    </section>
    <ol class="steps">${STEPS.map((s, i) => `<li class="${r[s.k] ? "done" : ""}"><button type="button" data-step="${s.k}"><span class="n">${r[s.k] ? "✓" : i + 1}</span><span class="i">${s.icon}</span><b>${s.t}</b><span class="soft">${s.d}</span></button></li>`).join("")}</ol>
    <div id="step"></div>`;
  $("main").querySelectorAll("[data-step]").forEach((b) => b.onclick = () => runStep(b.dataset.step));
  const next = STEPS.find((s) => !r[s.k]); if (next && done) runStep(next.k);
};
function finishStep(k, min) {
  const r = (ST.routine[today()] ||= {})[ST.lang] ||= {};
  if (!r[k]) { r[k] = true; logMinutes(min); }
  save(); VIEWS.today();
}
function runStep(k) {
  const el = $("step"); el.innerHTML = ""; el.scrollIntoView({ behavior: "smooth", block: "start" });
  ({
    phrases() {
      const seen = ST.phrases[ST.lang];
      const list = [...D.phrases.filter((p) => !seen[p.en]), ...D.phrases].slice(0, 5);
      el.innerHTML = `<div class="panel"><h3>💬 Warm up</h3><p class="soft">Tap 🔊, then say it out loud${Rec ? " (🎤 checks you)" : ""}.</p><div class="list">${list.map(phraseRow).join("")}</div><button class="go" id="done">Done ✓</button></div>`;
      $("done").onclick = () => { list.forEach((p) => seen[p.en] = 1); finishStep("phrases", 4); };
    },
    words() { wordRound(el, pickWords(8), () => finishStep("words", 6)); },
    ladder() {
      const s = D.ladders[(Object.keys(ST.log).length + (ST.lang === "te" ? 7 : 0)) % D.ladders.length];
      el.innerHTML = `<div class="panel"><h3>🪜 Sentence ladder</h3>${ladderHTML(s)}<button class="go" id="done">Got it ✓</button></div>`;
      $("done").onclick = () => finishStep("ladder", 3);
    },
    talk() { el.innerHTML = `<div class="panel">${talkHTML(D.talks[(Object.keys(ST.log).length) % D.talks.length], true)}<button class="go" id="done">Done ✓</button></div>`; $("done").onclick = () => finishStep("talk", 4); },
    quiz() { earTest(el, () => finishStep("quiz", 3)); },
  })[k]();
}

function phraseRow(p) {
  const id = reg(`p:${p.en}`, p.t);
  return `<div class="row" data-id="${esc(id)}"><div class="row-en">${esc(p.en)}</div>${sayBlock(p.t, { big: false })}${voiceBtns(p.t, id)}<p class="heard"></p>${p.note ? `<p class="note">${esc(p.note)}</p>` : ""}</div>`;
}

// Flashcards: English first, then flip to hear and see the bridges.
function wordRound(el, list, done) {
  let i = 0;
  const show = () => {
    if (i >= list.length) { el.innerHTML = `<div class="panel center"><h3>🌉 ${list.length} words done</h3><p class="soft">They'll come back when you're about to forget them.</p><button class="go" id="fin">Next ›</button></div>`; $("fin").onclick = done; return; }
    const w = list[i], id = reg(`w:${w.id}`, w.t);
    el.innerHTML = `<div class="panel"><p class="kicker">Word ${i + 1} of ${list.length} · ${esc(w.theme)}</p>
      <div class="card" data-id="${esc(id)}">
        <p class="prompt">How do you say <b>${esc(w.en)}</b>?</p>
        <p class="guess soft">${w.bridge && w.bridge !== "none" ? `Hint: think ${BR[w.bridge]}` : "Have a guess out loud"}</p>
        <div class="answer" hidden>${sayBlock(w.t)}${voiceBtns(w.t, id)}<p class="heard"></p>${bridgeHTML(w)}</div>
        <div class="card-actions"><button class="go" id="flip">Show me</button></div>
      </div></div>`;
    $("flip").onclick = () => {
      el.querySelector(".answer").hidden = false; el.querySelector(".guess").hidden = true; speak(w.t.w, w.t.say);
      el.querySelector(".card-actions").innerHTML = `<button class="btn" id="no">Not yet</button><button class="go" id="yes">I knew it</button>`;
      $("no").onclick = () => { grade(w.id, false); i++; show(); };
      $("yes").onclick = () => { grade(w.id, true); i++; show(); };
    };
  };
  show();
}

// Colour-matched words across languages, so you can see the order.
// You read Tamil and Hindi, so those rows use their own script; the new language is spelled out.
function chipText(code, x) {
  if (code === "en") return esc(x.w);
  if (code === "t") return `${esc(x.r || x.w)}${scriptOn() ? `<small class="native ${ST.lang}">${esc(x.w)}</small>` : ""}`;
  return `<span class="native ${code}">${esc(x.w)}</span><small>${esc(x.r || "")}</small>`;
}
const KC = ["#ffd166", "#8fd3fe", "#ffadc6", "#b7e4a1", "#d4b8ff", "#ffc58f", "#a0e7e5", "#f4a6a6"];
function ladderHTML(s) {
  const keys = s.parts.map((p) => p.k), col = (k) => KC[Math.max(0, keys.indexOf(k)) % KC.length];
  const row = (code, label) => {
    const words = s.rows[code]; if (!words) return "";
    return `<div class="lrow ${code === "t" ? "target" : ""}"><span class="lab">${label}</span><div class="chips">${words.map((x) => `<span class="chip" style="--c:${col(x.k)}">${chipText(code, x)}</span>`).join("")}</div></div>`;
  };
  const id = reg(`l:${s.en}`, { w: s.rows.t.map((x) => x.w).join(" "), say: s.rows.t.map((x) => x.r).join(" ") });
  return `<div class="ladder" data-id="${esc(id)}"><p class="lad-en">“${esc(s.en)}” ${voiceBtns(null, id)}</p><p class="heard"></p>
    ${row("t", L().name)}${row("ta", "Tamil")}${row("hi", "Hindi")}${row("en", "English")}
    <p class="note">💡 ${esc(s.note)}</p></div>`;
}

function talkHTML(t, practice = false) {
  return `<h3>🗣️ ${esc(t.title)}</h3><p class="soft">${practice ? "Play it through, then hide your lines and say them yourself." : ""}</p>
    <div class="talk${practice ? " practice" : ""}">${t.lines.map((l, i) => { const id = reg(`t:${t.title}:${i}`, l.t); return `<div class="bubble ${l.who === "You" ? "you" : "them"}" data-id="${esc(id)}"><span class="who">${esc(l.who)}</span>${sayBlock(l.t, { big: false })}<span class="en">${esc(l.en)}</span>${voiceBtns(l.t, id)}<p class="heard"></p></div>`; }).join("")}</div>
    <div class="talk-tools"><button class="btn" data-play-talk>▶ Play the whole thing</button>${practice ? `<button class="btn" data-hide-you>🙈 Hide my lines</button>` : ""}</div>`;
}
document.addEventListener("click", (e) => {
  const play = e.target.closest("[data-play-talk]");
  if (play) {
    const lines = [...play.closest(".panel, section").querySelectorAll(".bubble")]; let i = 0;
    const next = () => { if (i >= lines.length) return; const t = REG.get(lines[i].dataset.id); lines.forEach((x) => x.classList.remove("now")); lines[i].classList.add("now"); i++;
      const synth = window.speechSynthesis; speak(t.w, t.say); const wait = () => synth.speaking ? setTimeout(wait, 200) : setTimeout(next, 500); setTimeout(wait, 400); };
    next();
  }
  const hide = e.target.closest("[data-hide-you]");
  if (hide) { const box = hide.closest(".panel, section").querySelector(".talk"); box.classList.toggle("hide-you"); hide.textContent = box.classList.contains("hide-you") ? "👀 Show my lines" : "🙈 Hide my lines"; }
});

// Ear test: hear a word, pick what it means.
function earTest(el, done) {
  const pool = D.words.filter((w) => box(w.id)), base = pool.length >= 6 ? pool : D.words.slice(0, 30);
  const qs = shuffle(base).slice(0, 6); let i = 0, right = 0;
  const ask = () => {
    if (i >= qs.length) { el.innerHTML = `<div class="panel center"><h3>👂 ${right} of ${qs.length}</h3><p class="soft">${right >= 5 ? "Great ears!" : "Ears get sharper every day."}</p><button class="go" id="fin">Finish ✓</button></div>`; $("fin").onclick = done; return; }
    const w = qs[i], opts = shuffle([w, ...shuffle(D.words.filter((x) => x.en !== w.en)).slice(0, 3)]);
    el.innerHTML = `<div class="panel center"><p class="kicker">Ear test ${i + 1} of ${qs.length}</p><button class="big-ear" id="hear">🔊</button><p class="soft">Tap to hear it again</p>
      <div class="opts">${opts.map((o) => `<button class="opt" data-en="${esc(o.en)}">${esc(o.en)}</button>`).join("")}</div><p class="verdict" id="v"></p></div>`;
    $("hear").onclick = () => speak(w.t.w, w.t.say, $("hear")); speak(w.t.w, w.t.say, $("hear"));
    el.querySelectorAll(".opt").forEach((b) => b.onclick = () => {
      const ok = b.dataset.en === w.en; if (ok) right++;
      el.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.dataset.en === w.en) x.classList.add("right"); });
      if (!ok) b.classList.add("wrong");
      $("v").innerHTML = `${ok ? "✅" : "❌"} <b>${esc(w.t.say || w.t.r)}</b> = ${esc(w.en)}`;
      grade(w.id, ok); setTimeout(() => { i++; ask(); }, ok ? 1100 : 2000);
    });
  };
  ask();
}

// 💬 Phrases, grouped.
VIEWS.phrases = () => {
  const groups = [...new Set(D.phrases.map((p) => p.group || "everyday"))];
  $("main").innerHTML = `<section class="panel"><h2>💬 Phrases to get by</h2><p class="soft">The ones you'll actually use. 🔊 to hear, ${Rec ? "🎤 to check yourself, " : ""}then say each one three times.</p>
    ${groups.map((g) => `<h3 class="grp">${esc(g[0].toUpperCase() + g.slice(1))}</h3><div class="list">${D.phrases.filter((p) => (p.group || "everyday") === g).map(phraseRow).join("")}</div>`).join("")}</section>`;
};

// 🗣️ All conversations.
VIEWS.talk = () => { $("main").innerHTML = D.talks.map((t) => `<section class="panel">${talkHTML(t, true)}</section>`).join(""); };

// 🌉 Word list with bridges and a practice button.
VIEWS.words = () => {
  const themes = [...new Set(D.words.map((w) => w.theme))];
  const counts = { ta: 0, hi: 0, both: 0 }; D.words.forEach((w) => counts[w.bridge] !== undefined && counts[w.bridge]++);
  $("main").innerHTML = `<section class="panel"><h2>🌉 Word bridges</h2>
    <p class="soft">${D.words.length} everyday words. <b>${counts.ta + counts.both}</b> have a Tamil relative and <b>${counts.hi + counts.both}</b> a Hindi one, so you know more ${L().name} than you think. ⚠️ marks false friends.</p>
    <div class="filters"><button class="chip-btn on" data-th="">All</button>${themes.map((t) => `<button class="chip-btn" data-th="${esc(t)}">${esc(t)}</button>`).join("")}<button class="chip-btn" data-th="ff">⚠️ False friends</button></div>
    <button class="go" id="practise">Practise 8 words</button>
    <div class="grid" id="wl"></div></section><div id="step"></div>`;
  const paint = (th) => {
    const list = D.words.filter((w) => !th || (th === "ff" ? w.falseFriend : w.theme === th));
    $("wl").innerHTML = list.map((w) => { const id = reg(`w:${w.id}`, w.t), b = box(w.id); return `<div class="wcard ${w.falseFriend ? "ff" : ""}" data-id="${esc(id)}"><p class="row-en">${esc(w.en)} ${b?.b >= 3 ? `<span class="known">known</span>` : ""}</p>${sayBlock(w.t, { big: false })}${voiceBtns(w.t, id)}<p class="heard"></p>${bridgeHTML(w)}</div>`; }).join("");
  };
  paint("");
  $("main").querySelectorAll("[data-th]").forEach((b) => b.onclick = () => { $("main").querySelectorAll("[data-th]").forEach((x) => x.classList.toggle("on", x === b)); paint(b.dataset.th); });
  $("practise").onclick = () => { wordRound($("step"), pickWords(8), () => { logMinutes(5); VIEWS.words(); }); $("step").scrollIntoView({ behavior: "smooth" }); };
};

VIEWS.ladders = () => { $("main").innerHTML = `<section class="panel"><h2>🪜 Sentence ladders</h2><p class="soft">The same sentence in ${L().name}, Tamil, Hindi and English. Matching colours mean the same meaning, so you can see how the words line up.</p></section>${D.ladders.map((s) => `<section class="panel">${ladderHTML(s)}</section>`).join("")}`; };

VIEWS.tricks = () => {
  $("main").innerHTML = `<section class="panel"><h2>💡 You already know this</h2><p class="soft">Grammar shortcuts that come free with Tamil and Hindi.</p></section>
    ${D.grammar.map((g) => `<section class="panel trick"><h3>${esc(g.title)}</h3><p>${esc(g.body)}</p>${g.example ? `<div class="ex">${g.example.t ? `<p><b>${L().name}</b> ${esc(g.example.t)}</p>` : ""}${g.example.ta ? `<p><b>Tamil</b> ${esc(g.example.ta)}</p>` : ""}${g.example.hi ? `<p><b>Hindi</b> ${esc(g.example.hi)}</p>` : ""}</div>` : ""}</section>`).join("")}`;
};

// ✍️ Script (optional): letters line up with Devanagari and Tamil, so we can build the table from Unicode.
VIEWS.script = () => {
  const B = L().base, unassigned = /\p{Cn}/u;
  const cell = (base, off) => { const ch = String.fromCodePoint(base + off); return unassigned.test(ch) ? "" : ch; };
  const vowels = [0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0e, 0x0f, 0x10, 0x12, 0x13, 0x14];
  const cons = []; for (let o = 0x15; o <= 0x39; o++) cons.push(o);
  const row = (o) => { const t = cell(B, o); if (!t) return ""; const id = reg(`s:${o}`, { w: t, say: "" }); return `<button class="lt" data-speak="${esc(id)}"><span class="lt-t native ${ST.lang}">${t}</span><span class="lt-h native hi">${cell(0x0900, o)}</span><span class="lt-ta native ta">${cell(0x0b80, o) || "·"}</span></button>`; };
  $("main").innerHTML = `<section class="panel"><h2>✍️ The script, if you want it</h2>
    <p class="soft">You're here to speak, so this is optional. But since you read Hindi and Tamil, it's a shortcut: ${L().name} letters sit in the same order as Devanagari, letter for letter. Each tile shows <b>${L().name}</b>, then <b>Hindi</b>, then <b>Tamil</b> (· where Tamil has no separate letter). Tap to hear it.</p>
    <h3 class="grp">Vowels</h3><div class="letters">${vowels.map(row).join("")}</div>
    <h3 class="grp">Consonants</h3><div class="letters">${cons.map(row).join("")}</div></section>
    <section class="panel"><h3>🔁 Type Hindi or Tamil, see ${L().name}</h3><p class="soft">Type or paste Devanagari or Tamil script.</p>
      <textarea id="tx" rows="2" placeholder="नमस्ते  or  வணக்கம்"></textarea><p class="native big-out ${ST.lang}" id="tx-out"></p></section>
    ${D.letters?.length ? `<section class="panel"><h3>Tips for reading ${L().name}</h3>${D.letters.map((l) => `<p><b>${esc(l.title)}.</b> ${esc(l.body)}</p>`).join("")}</section>` : ""}`;
  $("tx").oninput = () => {
    $("tx-out").textContent = [...$("tx").value].map((ch) => { const c = ch.codePointAt(0);
      if (c >= 0x0900 && c <= 0x097f) return cell(B, c - 0x0900) || ch;
      if (c >= 0x0b80 && c <= 0x0bff) return cell(B, c - 0x0b80) || ch;
      return ch; }).join("");
  };
};

VIEWS.progress = () => {
  const days = []; const d = new Date(); d.setDate(d.getDate() - 34);
  for (let i = 0; i < 35; i++) { const k = d.toISOString().slice(0, 10); days.push([k, ST.log[k]?.min || 0]); d.setDate(d.getDate() + 1); }
  const by = (lang) => { const b = Object.values(ST.boxes[lang] || {}); return { seen: b.length, known: b.filter((x) => x.b >= 3).length }; };
  const ml = by("ml"), te = by("te"), mins = Object.values(ST.log).reduce((a, x) => a + (x.min || 0), 0);
  $("main").innerHTML = `<section class="panel"><h2>📈 Your long game</h2>
    <div class="stats"><div class="stat"><b>${streak()}</b><span>day streak</span></div><div class="stat"><b>${mins}</b><span>minutes practised</span></div>
      <div class="stat ml"><b>${ml.known}</b><span>Malayalam words known · ${ml.seen} seen</span></div><div class="stat te"><b>${te.known}</b><span>Telugu words known · ${te.seen} seen</span></div></div>
    <h3 class="grp">Last 5 weeks</h3><div class="cal">${days.map(([k, m]) => `<i title="${k}: ${m} min" style="--a:${Math.min(1, m / 20)}"></i>`).join("")}</div>
    <p class="soft small">A word counts as known once you've got it right three times in a row, spaced over days.</p></section>`;
};

/* ---------------- frame ---------------- */
async function setLang(lang) {
  ST.lang = lang; save();
  document.documentElement.style.setProperty("--lang", L().hue);
  document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.lang === lang)));
  await load(lang);
  route();
}
document.querySelectorAll("[data-lang]").forEach((b) => b.onclick = () => setLang(b.dataset.lang));
$("show-script").checked = ST.showScript;
$("show-script").onchange = (e) => { ST.showScript = e.target.checked; save(); route(); };
function route() { tab((location.hash || "#today").slice(1)); }
window.addEventListener("hashchange", route);
speechSynthesis?.addEventListener?.("voiceschanged", () => { if ((location.hash || "#today") === "#today") route(); });
setLang(ST.lang);
