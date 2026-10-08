// Playing the Lang Game: learn to speak a new language through the ones you already know.
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => new Date().toISOString().slice(0, 10);

// Languages you can already speak (the lessons have bridges for these) and languages you can learn.
const KNOWN = [
  { c: "ta", n: "Tamil", nat: "தமிழ்" }, { c: "hi", n: "Hindi", nat: "हिन्दी" }, { c: "en", n: "English", nat: "English" },
  { c: "kn", n: "Kannada", nat: "ಕನ್ನಡ", soon: true }, { c: "bn", n: "Bengali", nat: "বাংলা", soon: true }, { c: "mr", n: "Marathi", nat: "मराठी", soon: true },
];
const TARGETS = {
  ml: { n: "Malayalam", nat: "മലയാളം", voice: "ml-IN", base: 0x0d00, hue: "#14b87a", hue2: "#0f8f9c", where: "Kerala" },
  te: { n: "Telugu", nat: "తెలుగు", voice: "te-IN", base: 0x0c00, hue: "#ff7a2f", hue2: "#e23d6b", where: "Andhra Pradesh and Telangana" },
};
const SOON = [{ n: "Kannada", nat: "ಕನ್ನಡ" }, { n: "Spanish", nat: "Español" }];

/* ---------------- saved progress ---------------- */
const KEY = "lg-v2";
const blank = () => ({ setup: false, known: ["ta", "hi", "en"], lang: "ml", showScript: false, boxes: { ml: {}, te: {} }, log: {}, rounds: {}, seen: { ml: 0, te: 0 } });
let ST = (() => { try { return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return blank(); } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch {} };
const T = () => TARGETS[ST.lang];
const knows = (c) => ST.known.includes(c);
function logMinutes(min) { const d = today(); ST.log[d] = ST.log[d] || { min: 0 }; ST.log[d].min += min; save(); }
function streak() { let n = 0; const d = new Date(); if (!ST.log[today()]) d.setDate(d.getDate() - 1); while (ST.log[d.toISOString().slice(0, 10)]) { n++; d.setDate(d.getDate() - 1); } return n; }
const roundsToday = () => ((ST.rounds[today()] ||= {})[ST.lang] ||= {});

let D = null;
async function load() { D = (await import(`./data/${ST.lang}.js`)).default; }

/* ---------------- hear it, say it ---------------- */
function speak(text, say, btn) {
  const synth = window.speechSynthesis; if (!synth) return;
  synth.cancel();
  const tag = T().voice.toLowerCase(), voices = synth.getVoices();
  const voice = voices.find((v) => v.lang.toLowerCase().replace("_", "-") === tag) || voices.find((v) => v.lang.toLowerCase().startsWith(tag.slice(0, 2)));
  // No voice for the language on this device: read the pronunciation guide (lowercase, so it isn't spelled out).
  const u = new SpeechSynthesisUtterance(voice ? text : (say || text).replace(/-/g, " ").toLowerCase());
  if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-IN";
  u.rate = 0.82;
  btn?.classList.add("on"); u.onend = u.onerror = () => btn?.classList.remove("on");
  synth.speak(u);
  return u;
}
window.speechSynthesis?.getVoices();
const hasVoice = () => (window.speechSynthesis?.getVoices() || []).some((v) => v.lang.toLowerCase().startsWith(T().voice.slice(0, 2)));

const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
const norm = (s) => String(s).normalize("NFC").toLowerCase().replace(/[\s.,!?'"“”‘’।॥:;-]/g, "");
function lev(a, b) { const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
const score = (heard, target) => { const x = norm(heard), t = norm(target); return 1 - lev(x, t) / Math.max(x.length, t.length, 1); };
// 🎤: listen in the target language and say how close you were. Calls back with a 0..1 score.
function listen(item, out, btn, onScore) {
  if (!Rec) { out.innerHTML = "🎤 Speaking practice needs Chrome (or Safari on iPhone). Say it out loud anyway!"; return; }
  const r = new Rec(); r.lang = T().voice; r.maxAlternatives = 5; r.interimResults = false;
  btn.classList.add("rec"); out.innerHTML = `<span class="pulse-dot"></span> Listening… say it now`;
  let got = false;
  r.onresult = (e) => {
    got = true;
    const alts = [...e.results[0]].map((a) => a.transcript);
    const best = Math.max(...alts.map((a) => Math.max(score(a, item.w), item.r ? score(a, item.r) : 0)));
    out.innerHTML = best > 0.72 ? `✅ <b>Nailed it!</b>` : best > 0.45 ? `🙂 <b>So close!</b> I heard “${esc(alts[0])}”` : `🔁 I heard “${esc(alts[0])}”. Listen once more and try again.`;
    onScore?.(best);
  };
  r.onerror = (e) => { out.innerHTML = e.error === "not-allowed" ? "Allow the microphone to practise speaking." : "Didn't catch that. Tap 🎤 and try again."; };
  r.onend = () => { btn.classList.remove("rec"); if (!got && !out.textContent.startsWith("Allow") && !out.textContent.startsWith("Didn't")) out.innerHTML = "Didn't catch that. Tap 🎤 and try again."; };
  r.start();
}

// Every phrase you might say gets 🔊 and 🎤. Items are registered so the buttons know what to say.
const REG = new Map();
let uid = 0;
const reg = (t) => { const id = `i${++uid}`; REG.set(id, t); return id; };
function voice(t, { big = false } = {}) {
  const id = reg(t);
  return `<span class="vbtns${big ? " big" : ""}" data-id="${id}"><button type="button" class="vb hear" data-hear="${id}" aria-label="Hear it">🔊</button><button type="button" class="vb mic" data-mic="${id}" aria-label="Say it into the microphone">🎤</button></span>`;
}
document.addEventListener("click", (e) => {
  const h = e.target.closest("[data-hear]"); if (h) { const t = REG.get(h.dataset.hear); if (t) speak(t.w, t.say, h); return; }
  const m = e.target.closest("[data-mic]");
  if (m) {
    const t = REG.get(m.dataset.mic), host = m.closest("[data-say-host]") || m.parentElement.parentElement;
    let out = host.querySelector(":scope > .heard"); if (!out) { out = document.createElement("p"); out.className = "heard"; host.append(out); }
    listen(t, out, m, (s) => { if (s > 0.72) host.classList.add("nailed"); host.dispatchEvent(new CustomEvent("scored", { detail: s })); });
  }
});

/* ---------------- small pieces ---------------- */
const scriptOn = () => ST.showScript;
function sayIt(t, size = "") {
  return `<div class="sayit ${size}"><span class="s1">${esc(t.say || t.r)}</span><span class="s2">${esc(t.r || "")}</span>${scriptOn() ? `<span class="nat ${ST.lang}">${esc(t.w)}</span>` : ""}</div>`;
}
const NAMES = { ta: "Tamil", hi: "Hindi" };
// How a word relates to the languages YOU know, if at all.
function relation(w) {
  const tags = [];
  const ta = (w.bridge === "ta" || w.bridge === "both"), hi = (w.bridge === "hi" || w.bridge === "both");
  if (ta && knows("ta")) tags.push(`<span class="rel ta">🌿 Like Tamil</span>`);
  if (hi && knows("hi")) tags.push(`<span class="rel hi">🪷 Like Hindi</span>`);
  if (w.falseFriend) tags.push(`<span class="rel ff">⚠️ False friend</span>`);
  if (!tags.length) tags.push(`<span class="rel new">✨ ${ta || hi ? `New for you (it's related to ${ta ? "Tamil" : "Hindi"})` : "Brand-new word"}</span>`);
  return `<div class="rels">${tags.join("")}</div>`;
}
function relatives(w) {
  const row = (c) => w[c] && knows(c) ? `<div class="kin ${(w.bridge === c || w.bridge === "both") ? "hit" : ""}"><span class="k-lang">${NAMES[c]}</span><span class="nat ${c}">${esc(w[c].w)}</span><span class="k-r">${esc(w[c].r)}</span></div>` : "";
  return `<div class="kins">${row("ta")}${row("hi")}</div>${w.link ? `<p class="why">${w.falseFriend ? "⚠️" : "💡"} ${esc(w.link)}</p>` : ""}`;
}

/* ---------------- spaced repetition ---------------- */
const GAP = [0, 1, 2, 4, 8, 16, 32];
const box = (id) => ST.boxes[ST.lang][id];
function grade(id, knew) {
  const b = box(id) || { b: 0 }; b.b = knew ? Math.min(GAP.length - 1, b.b + 1) : 1;
  const due = new Date(); due.setDate(due.getDate() + GAP[b.b]); b.due = due.toISOString().slice(0, 10);
  ST.boxes[ST.lang][id] = b; save();
}
const knownCount = (lang = ST.lang) => Object.values(ST.boxes[lang] || {}).filter((b) => b.b >= 3).length;
function pickWords(n = 8) {
  const due = D.words.filter((w) => box(w.id) && box(w.id).due <= today()).slice(0, 3);
  const fresh = D.words.filter((w) => !box(w.id)).slice(0, n - due.length);
  return shuffle([...due, ...fresh]);
}

/* ---------------- screens ---------------- */
const go = (h) => { location.hash = h; };
const SCREENS = {};
async function route() {
  const h = (location.hash || "#home").slice(1);
  REG.clear();
  if (!ST.setup && h !== "setup") return go("setup");
  if (h !== "setup") await load();
  paintMe();
  document.documentElement.style.setProperty("--hue", T().hue); document.documentElement.style.setProperty("--hue2", T().hue2);
  (SCREENS[h] || SCREENS.home)();
  window.scrollTo({ top: 0 });
}
window.addEventListener("hashchange", route);
function paintMe() {
  $("me").innerHTML = ST.setup ? `<span>${ST.known.map((c) => KNOWN.find((k) => k.c === c)?.n).join(" · ")}</span> <b>→ ${T().n}</b> <i>✎</i>` : "";
  $("me").hidden = !ST.setup;
}
$("me").onclick = () => go("setup");

// One screen: what you speak, what you want to learn.
SCREENS.setup = () => {
  const pick = new Set(ST.known); let target = ST.lang;
  $("main").innerHTML = `
    <section class="setup">
      <p class="kicker">Let's play</p>
      <h1>Every language you know is a <em>head start.</em></h1>
      <div class="setup-grid">
        <div class="pane">
          <h2>I can speak…</h2><p class="soft">Pick all that apply. We'll link every new word to these.</p>
          <div class="chips-pick">${KNOWN.map((k) => `<button type="button" class="pk ${pick.has(k.c) ? "on" : ""}" data-k="${k.c}" ${k.soon ? "disabled" : ""}><span class="pk-nat">${esc(k.nat)}</span><span>${esc(k.n)}${k.soon ? " · soon" : ""}</span></button>`).join("")}</div>
        </div>
        <div class="pane">
          <h2>I want to learn…</h2><p class="soft">Spoken, everyday, the way people actually talk.</p>
          <div class="targets">${Object.entries(TARGETS).map(([c, t]) => `<button type="button" class="tg ${c === target ? "on" : ""}" data-t="${c}" style="--h1:${t.hue};--h2:${t.hue2}"><span class="tg-nat">${esc(t.nat)}</span><b>${esc(t.n)}</b><span class="soft">${esc(t.where)}</span></button>`).join("")}
            ${SOON.map((t) => `<button type="button" class="tg soon" disabled><span class="tg-nat">${esc(t.nat)}</span><b>${esc(t.n)}</b><span class="soft">coming soon</span></button>`).join("")}</div>
        </div>
      </div>
      <button class="play" id="start">Start playing →</button>
      <label class="toggle"><input type="checkbox" id="script" ${ST.showScript ? "checked" : ""}> Also show the ${"new language's"} script (you can turn this on later)</label>
    </section>`;
  $("main").querySelectorAll("[data-k]").forEach((b) => b.onclick = () => { pick.has(b.dataset.k) ? pick.delete(b.dataset.k) : pick.add(b.dataset.k); b.classList.toggle("on"); });
  $("main").querySelectorAll("[data-t]").forEach((b) => b.onclick = () => { target = b.dataset.t; $("main").querySelectorAll("[data-t]").forEach((x) => x.classList.toggle("on", x === b)); });
  $("start").onclick = () => {
    if (!pick.size) pick.add("en");
    ST.known = KNOWN.filter((k) => pick.has(k.c)).map((k) => k.c); ST.lang = target; ST.showScript = $("script").checked; ST.setup = true; save(); go("home");
  };
};

// Home: three rounds a day.
const ROUNDS = [
  { k: "warm", icon: "🔥", t: "Warm-up", d: "8 everyday words and how they connect to the languages you know", g: "sun" },
  { k: "ladder", icon: "🪜", t: "Sentence ladder", d: "Build sentences and see them line up with yours, word by word", g: "sea" },
  { k: "talk", icon: "🗣️", t: "Conversation", d: "A real situation. They speak, you answer out loud", g: "berry" },
];
SCREENS.home = () => {
  const r = roundsToday(), done = ROUNDS.filter((x) => r[x.k]).length;
  $("main").innerHTML = `
    <section class="hero">
      <div class="hero-txt"><p class="kicker">Today in ${T().n} · <span class="nat ${ST.lang}">${T().nat}</span></p>
        <h1>${done === 3 ? "You played them all! 🎉" : done ? `${3 - done} round${done === 2 ? "" : "s"} left today` : "Three rounds. About 15 minutes."}</h1>
        <p>${hasVoice() ? "Tap 🔊 to hear, 🎤 to say it back." : `Tap 🔊 to hear, 🎤 to say it back. (Your device has no ${T().n} voice, so 🔊 reads the pronunciation; Chrome on Android usually has one.)`}</p></div>
      <div class="hero-stats"><div><b>${streak()}</b><span>🔥 day streak</span></div><div><b>${knownCount()}</b><span>words known</span></div></div>
    </section>
    <section class="rounds">${ROUNDS.map((x, i) => `<a class="round g-${x.g} ${r[x.k] ? "done" : ""}" href="#${x.k}" style="--i:${i}"><span class="r-n">${r[x.k] ? "✓" : i + 1}</span><span class="r-ic">${x.icon}</span><h2>${x.t}</h2><p>${x.d}</p><span class="r-go">${r[x.k] ? "Play again" : "Play"} →</span></a>`).join("")}</section>
    <section class="more">
      <a href="#phrases">💬 Phrasebook</a><a href="#words">🌉 All words</a><a href="#tricks">💡 Shortcuts</a><a href="#script">✍️ Script</a><a href="#progress">📈 Progress</a>
    </section>`;
};
function roundDone(k, min) { const r = roundsToday(); if (!r[k]) { r[k] = true; logMinutes(min); } save(); }
function roundHead(x, sub) { return `<header class="rhead g-${x.g}"><a class="back" href="#home">← Home</a><span class="r-ic">${x.icon}</span><div><h1>${x.t}</h1><p>${sub}</p></div></header>`; }

// 🔥 Warm-up: one word at a time.
SCREENS.warm = () => {
  const list = pickWords(8); let i = 0;
  $("main").innerHTML = `${roundHead(ROUNDS[0], "Guess it out loud, then flip.")}<div id="stage"></div>`;
  const show = () => {
    if (i >= list.length) { roundDone("warm", 6); $("stage").innerHTML = finish("🔥", `${list.length} words warmed up`, "They'll come back right before you'd forget them.", "#ladder", "Next: Sentence ladder"); return; }
    const w = list[i];
    $("stage").innerHTML = `<div class="dots">${list.map((_, j) => `<i class="${j < i ? "ok" : j === i ? "now" : ""}"></i>`).join("")}</div>
      <article class="flash" data-say-host>
        <p class="theme">${esc(w.theme)}</p>
        <p class="ask">How do you say</p><h2 class="en">${esc(w.en)}</h2>
        <p class="hint">${(w.bridge === "ta" && knows("ta")) || (w.bridge === "hi" && knows("hi")) || (w.bridge === "both" && (knows("ta") || knows("hi"))) ? `Hint: you might already know it 😉` : "Have a guess, then flip"}</p>
        <div class="back-side" hidden>${sayIt(w.t, "xl")}${voice(w.t, { big: true })}${relation(w)}${relatives(w)}</div>
        <div class="acts"><button class="play" id="flip">Flip it</button></div>
      </article>`;
    $("flip").onclick = () => {
      const card = $("stage").querySelector(".flash"); card.classList.add("flipped");
      card.querySelector(".back-side").hidden = false; card.querySelector(".hint").hidden = true; speak(w.t.w, w.t.say);
      card.querySelector(".acts").innerHTML = `<button class="ghost" id="no">Not yet</button><button class="play" id="yes">I knew it!</button>`;
      $("no").onclick = () => { grade(w.id, false); i++; show(); };
      $("yes").onclick = () => { grade(w.id, true); i++; show(); };
    };
  };
  show();
};

// 🪜 Sentence ladder: target + the languages you know, colour-matched.
const KC = ["#ffcf5c", "#7fd8ff", "#ff9ec4", "#a6e98c", "#c9a8ff", "#ffb07a", "#7ff0e0", "#ff8f8f"];
function ladder(s) {
  const keys = s.parts.map((p) => p.k), col = (k) => KC[Math.max(0, keys.indexOf(k)) % KC.length];
  const rows = [["t", T().n], ...["ta", "hi", "en"].filter(knows).map((c) => [c, KNOWN.find((k) => k.c === c).n])];
  const chip = (c, x) => {
    if (c === "t") return `<button type="button" class="chip tgt" style="--c:${col(x.k)}" data-hear="${reg({ w: x.w, say: x.r })}">${esc(x.r || x.w)}${scriptOn() ? `<small class="nat ${ST.lang}">${esc(x.w)}</small>` : ""}</button>`;
    if (c === "en") return `<span class="chip" style="--c:${col(x.k)}">${esc(x.w)}</span>`;
    return `<span class="chip" style="--c:${col(x.k)}"><span class="nat ${c}">${esc(x.w)}</span><small>${esc(x.r || "")}</small></span>`;
  };
  const whole = { w: s.rows.t.map((x) => x.w).join(" "), r: s.rows.t.map((x) => x.r).join(" "), say: s.rows.t.map((x) => x.r).join(" ") };
  return `<article class="ladder" data-say-host>
    <h2 class="l-en">“${esc(s.en)}”</h2>${voice(whole, { big: true })}
    <div class="l-rows">${rows.map(([c, n]) => s.rows[c] ? `<div class="l-row ${c === "t" ? "target" : ""}"><span class="l-lab">${esc(n)}</span><div class="l-chips">${s.rows[c].map((x) => chip(c, x)).join("")}</div></div>` : "").join("")}</div>
    <p class="why">💡 ${esc(s.note)}</p><p class="tap-tip soft">Tap a ${T().n} word to hear just that word.</p>
  </article>`;
}
SCREENS.ladder = () => {
  let n = 0; const start = (ST.seen[ST.lang] || 0) % D.ladders.length;
  $("main").innerHTML = `${roundHead(ROUNDS[1], "Same meaning, same colour. Watch the order.")}<div id="stage"></div>`;
  const show = () => {
    const s = D.ladders[(start + n) % D.ladders.length];
    $("stage").innerHTML = `<div class="dots">${[0, 1, 2].map((j) => `<i class="${j < n ? "ok" : j === n ? "now" : ""}"></i>`).join("")}</div>${ladder(s)}
      <div class="acts center">${n < 2 ? `<button class="play" id="nx">Next sentence →</button>` : `<button class="play" id="fin">Finish round ✓</button>`}</div>`;
    const nx = $("nx"); if (nx) nx.onclick = () => { n++; show(); };
    const fin = $("fin"); if (fin) fin.onclick = () => { ST.seen[ST.lang] = start + 3; roundDone("ladder", 5); $("stage").innerHTML = finish("🪜", "3 sentences climbed", "Notice how the verb comes last in all of them?", "#talk", "Next: Conversation"); };
  };
  show();
};

// 🗣️ Conversation: they speak, you answer out loud.
SCREENS.talk = () => {
  const ti = (Object.keys(ST.log).length + (ST.seen[ST.lang] || 0)) % D.talks.length;
  conversation(D.talks[ti], true);
};
function conversation(t, isRound) {
  let i = 0;
  $("main").innerHTML = `${roundHead(ROUNDS[2], `${esc(t.title)}. They speak, then it's your turn.`)}
    <div class="chat" id="chat"></div><div id="turn"></div>
    <div class="acts center"><button class="ghost" id="other">Another conversation ↻</button></div>`;
  $("other").onclick = () => conversation(D.talks[(D.talks.indexOf(t) + 1) % D.talks.length], isRound);
  const bubble = (l) => `<div class="bub ${l.who === "You" ? "you" : "them"}" data-say-host><span class="who">${l.who === "You" ? "You" : "Them"}</span>${sayIt(l.t)}<span class="b-en">${esc(l.en)}</span>${voice(l.t)}</div>`;
  const next = () => {
    if (i >= t.lines.length) {
      if (isRound) roundDone("talk", 5);
      $("turn").innerHTML = finish("🗣️", "Conversation done!", "Play it again, or try another one. The more you say it out loud, the easier it gets.", "#home", "Back home");
      return;
    }
    const l = t.lines[i];
    if (l.who !== "You") {
      $("chat").insertAdjacentHTML("beforeend", bubble(l)); $("chat").lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
      $("turn").innerHTML = `<div class="turn them-turn"><span class="soft">They said: <b>${esc(l.en)}</b></span><button class="play" id="ok">Your turn →</button></div>`;
      speak(l.t.w, l.t.say);
      $("ok").onclick = () => { i++; next(); };
      return;
    }
    // Your line: prompt in English, you say it, then we show it.
    $("turn").innerHTML = `<div class="turn you-turn" data-say-host>
      <p class="kicker">Your turn</p><h3>Say: “${esc(l.en)}”</h3>
      <div class="peek" hidden>${sayIt(l.t)}</div>
      <div class="turn-acts">${voice(l.t, { big: true })}<button class="ghost" id="peek">👀 Show me how</button><button class="play" id="said">I said it ✓</button></div>
    </div>`;
    const host = $("turn").querySelector(".you-turn");
    $("peek").onclick = () => { host.querySelector(".peek").hidden = false; speak(l.t.w, l.t.say); };
    const advance = () => { $("chat").insertAdjacentHTML("beforeend", bubble(l)); i++; next(); };
    $("said").onclick = advance;
    host.addEventListener("scored", (e) => { if (e.detail > 0.6) setTimeout(advance, 900); });
  };
  next();
}

function finish(icon, title, sub, href, label) {
  return `<div class="finish"><span class="f-ic">${icon}</span><h2>${title}</h2><p>${sub}</p><div class="acts center"><a class="play" href="${href}">${label} →</a><a class="ghost" href="#home">Home</a></div></div>`;
}

/* ---------------- the extras ---------------- */
function page(icon, title, sub, body) { return `<header class="phead"><a class="back" href="#home">← Home</a><h1>${icon} ${title}</h1><p class="soft">${sub}</p></header>${body}`; }
SCREENS.phrases = () => {
  const groups = [...new Set(D.phrases.map((p) => p.group || "everyday"))];
  $("main").innerHTML = page("💬", "Phrasebook", `The ${T().n} you'll actually use. 🔊 to hear, 🎤 to say it back.`,
    groups.map((g) => `<h3 class="grp">${esc(g)}</h3><div class="plist">${D.phrases.filter((p) => (p.group || "everyday") === g).map((p) => `<div class="prow" data-say-host><span class="p-en">${esc(p.en)}</span>${sayIt(p.t)}${voice(p.t)}${p.note ? `<p class="why">${esc(p.note)}</p>` : ""}</div>`).join("")}</div>`).join(""));
};
SCREENS.words = () => {
  const themes = [...new Set(D.words.map((w) => w.theme))];
  const like = (c) => D.words.filter((w) => (w.bridge === c || w.bridge === "both")).length;
  $("main").innerHTML = page("🌉", "All words", `${D.words.length} everyday words.${knows("ta") ? ` ${like("ta")} are like Tamil.` : ""}${knows("hi") ? ` ${like("hi")} are like Hindi.` : ""}`,
    `<div class="filters"><button class="fb on" data-th="">All</button>${themes.map((t) => `<button class="fb" data-th="${esc(t)}">${esc(t)}</button>`).join("")}<button class="fb" data-th="ff">⚠️ False friends</button></div><div class="wgrid" id="wg"></div>`);
  const paint = (th) => { REG.clear(); $("wg").innerHTML = D.words.filter((w) => !th || (th === "ff" ? w.falseFriend : w.theme === th)).map((w) => `<div class="wcard" data-say-host><p class="p-en">${esc(w.en)} ${box(w.id)?.b >= 3 ? `<span class="known">known</span>` : ""}</p>${sayIt(w.t)}${voice(w.t)}${relation(w)}${relatives(w)}</div>`).join(""); };
  paint("");
  $("main").querySelectorAll("[data-th]").forEach((b) => b.onclick = () => { $("main").querySelectorAll("[data-th]").forEach((x) => x.classList.toggle("on", x === b)); paint(b.dataset.th); });
};
SCREENS.tricks = () => {
  $("main").innerHTML = page("💡", "Shortcuts", "Grammar you get for free from the languages you know.",
    D.grammar.map((g) => `<article class="trick"><h3>${esc(g.title)}</h3><p>${esc(g.body)}</p>${g.example ? `<div class="ex">${g.example.t ? `<p><b>${T().n}</b>${esc(g.example.t)}</p>` : ""}${g.example.ta && knows("ta") ? `<p><b>Tamil</b>${esc(g.example.ta)}</p>` : ""}${g.example.hi && knows("hi") ? `<p><b>Hindi</b>${esc(g.example.hi)}</p>` : ""}</div>` : ""}</article>`).join(""));
};
SCREENS.script = () => {
  const B = T().base, un = /\p{Cn}/u, cell = (base, o) => { const ch = String.fromCodePoint(base + o); return un.test(ch) ? "" : ch; };
  const vowels = [0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0e, 0x0f, 0x10, 0x12, 0x13, 0x14], cons = []; for (let o = 0x15; o <= 0x39; o++) cons.push(o);
  const tile = (o) => { const t = cell(B, o); if (!t) return ""; return `<button class="lt" data-hear="${reg({ w: t })}"><span class="nat ${ST.lang}">${t}</span>${knows("hi") ? `<small class="nat hi">${cell(0x0900, o)}</small>` : ""}${knows("ta") ? `<small class="nat ta">${cell(0x0b80, o) || "·"}</small>` : ""}</button>`; };
  $("main").innerHTML = page("✍️", "The script (optional)", `${T().n} letters sit in the same order as ${knows("hi") ? "Devanagari" : "the other Indian scripts"}, letter for letter. Tap one to hear it.`,
    `<h3 class="grp">Vowels</h3><div class="letters">${vowels.map(tile).join("")}</div><h3 class="grp">Consonants</h3><div class="letters">${cons.map(tile).join("")}</div>
     <article class="trick"><h3>🔁 Type ${[knows("hi") && "Hindi", knows("ta") && "Tamil"].filter(Boolean).join(" or ") || "Hindi or Tamil"}, see ${T().n}</h3><textarea id="tx" rows="2" placeholder="नमस्ते  or  வணக்கம்"></textarea><p class="nat big-out ${ST.lang}" id="tx-out"></p></article>
     <label class="toggle"><input type="checkbox" id="script" ${ST.showScript ? "checked" : ""}> Show ${T().n} script next to words everywhere</label>`);
  $("tx").oninput = () => { $("tx-out").textContent = [...$("tx").value].map((ch) => { const c = ch.codePointAt(0); if (c >= 0x0900 && c <= 0x097f) return cell(B, c - 0x0900) || ch; if (c >= 0x0b80 && c <= 0x0bff) return cell(B, c === 0x0ba9 ? 0x28 : c - 0x0b80) || ch; return ch; }).join(""); };
  $("script").onchange = (e) => { ST.showScript = e.target.checked; save(); };
};
SCREENS.progress = () => {
  const days = []; const d = new Date(); d.setDate(d.getDate() - 34);
  for (let i = 0; i < 35; i++) { const k = d.toISOString().slice(0, 10); days.push([k, ST.log[k]?.min || 0]); d.setDate(d.getDate() + 1); }
  const mins = Object.values(ST.log).reduce((a, x) => a + (x.min || 0), 0);
  $("main").innerHTML = page("📈", "Your long game", "A word counts as known once you've got it right three times, spaced over days.",
    `<div class="pstats"><div><b>${streak()}</b><span>🔥 day streak</span></div><div><b>${mins}</b><span>minutes played</span></div>${Object.entries(TARGETS).map(([c, t]) => `<div style="--h1:${t.hue}"><b>${knownCount(c)}</b><span>${t.n} words known</span></div>`).join("")}</div>
     <h3 class="grp">Last 5 weeks</h3><div class="cal">${days.map(([k, m]) => `<i title="${k}: ${m} min" style="--a:${Math.min(1, m / 15)}"></i>`).join("")}</div>`);
};

speechSynthesis?.addEventListener?.("voiceschanged", () => { if ((location.hash || "#home") === "#home") route(); });
route();
