// Explanations from Claude, using the visitor's own API key (the same key Story So Far uses, saved in this browser).
// Claude can read the article itself (web fetch) or look it up (web search), then teaches it in plain English.

const MODEL = "claude-opus-5-5";
const KEY = "ssf-key";
let SDK = null;

export const ai = {
  get key() { try { return JSON.parse(localStorage.getItem(KEY) || "null") || sessionStorage.getItem(KEY) || ""; } catch { return ""; } },
  setKey(k) { try { localStorage.setItem(KEY, JSON.stringify(k)); } catch {} },
  forget() { try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch {} },
};

const TEACHER = `You are a warm, sharp teacher inside "Keeping Tabs", a personal app that helps one reader keep up with and learn about feminism and women's rights, LGBTQIA+ rights, and software engineering (she's a senior engineer working towards staff).
About the reader: a software engineer of Indian (Tamil) background, curious about history, cultures, India, the Caribbean and the wider world. She wants to understand, not just skim.

How to write:
- Plain, friendly English. Short sentences. Explain any term the first time you use it.
- Teach: give the background and history she needs, not just the news.
- Be accurate and fair. If something is contested, show the main views. If you couldn't read the article, say so in one line and work from what you found.
- Use this exact light formatting: "## " headings, "- " bullets, **bold** for key terms, [text](https://...) links. No tables, no other markdown.
- Keep it digestible: under 350 words unless asked for more.`;

const EXPLAIN = (it) => `Explain this ${it.kind === "paper" ? "piece of research" : it.kind === "blog" ? "blog post" : it.kind === "discussion" ? "Hacker News discussion" : "news story"} to me.

Title: ${it.title}
${it.source ? `Source: ${it.source}\n` : ""}${it.venue ? `Published in: ${it.venue}\n` : ""}${it.authors ? `Authors: ${it.authors}\n` : ""}${it.unis?.length ? `Universities: ${it.unis.join(", ")}\n` : ""}${it.date ? `Date: ${it.date}\n` : ""}Link: ${it.url}
${it.abstract ? `Abstract: ${it.abstract}\n` : ""}${it.summary ? `Summary: ${it.summary}\n` : ""}
${it.kind === "paper"
    ? "Use these sections: ## In short (2 sentences, no jargon) · ## What they found · ## How they studied it · ## Why it matters · ## Think about it (one question for me)."
    : it.kind === "blog" || it.kind === "discussion"
      ? "Use these sections: ## In short · ## The key ideas · ## How I could use this at work (concrete, for a senior engineer) · ## Think about it (one question for me)."
      : "Use these sections: ## In short (2 sentences) · ## What happened · ## Background you need · ## Why it matters (and any India or Caribbean angle if there's a real one) · ## Different views (only if contested) · ## Think about it (one question for me)."}
${it.context ? `\nWhat I already know: ${it.context}` : ""}`;

const BRIEF = (title, items, context) => `Here are this week's headlines on ${title}. Give me a digestible briefing.

${items.map((n, i) => `${i + 1}. ${n.title}${n.source ? ` (${n.source})` : ""}`).join("\n")}

Use these sections: ## This week in a nutshell (2–3 sentences) · ## The big threads (3–5 bullets, each grouping related headlines and explaining what's going on and why) · ## One thing to understand (a mini-lesson: the background concept or history that makes this week's news make sense) · ## Think about it (one question for me).
Work from the headlines and your knowledge; use web search only if a headline makes no sense without it.${context ? `\n\nWhat I already know: ${context}` : ""}`;

async function client() {
  SDK ||= (await import("../vendor/anthropic.mjs")).Anthropic;
  return new SDK({ apiKey: ai.key, dangerouslyAllowBrowser: true });
}

// One conversation per item: start it with explain() or brief(), continue with ask().
export function conversation(firstPrompt, { web = true, system = TEACHER } = {}) {
  const messages = [{ role: "user", content: firstPrompt }];
  const tools = web ? [
    { type: "web_fetch_20260209", name: "web_fetch", max_uses: 2 },
    { type: "web_search_20260209", name: "web_search", max_uses: 3 },
  ] : undefined;
  async function run(signal) {
    const c = await client();
    // Server tools can pause a long turn; resume it a few times before giving up.
    for (let turn = 0; turn < 4; turn++) {
      let res;
      try {
        res = await c.beta.messages.create({
          model: MODEL, max_tokens: 16000,
          betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
          output_config: { effort: "medium" },
          system, messages, ...(tools ? { tools } : {}),
        }, { signal });
      } catch (e) {
        if (e instanceof SDK.AuthenticationError) throw new Error("That API key didn't work. Check it and try again.");
        if (e instanceof SDK.PermissionDeniedError) throw new Error("This API key isn't allowed to use Claude. Check its workspace permissions.");
        if (e instanceof SDK.RateLimitError) throw new Error("Too many requests right now. Wait a minute and try again.");
        if (e instanceof SDK.APIUserAbortError || signal?.aborted) throw Object.assign(new Error("Stopped."), { cancelled: true });
        if (e instanceof SDK.APIConnectionError) throw new Error("Couldn't reach Claude. Check your connection and try again.");
        if (e instanceof SDK.APIError) throw new Error(`Claude returned an error (${e.status || "unknown"}). Try again in a moment.`);
        throw e;
      }
      messages.push({ role: "assistant", content: res.content });
      if (res.stop_reason === "pause_turn") continue;
      if (res.stop_reason === "refusal") throw new Error("Claude declined to explain this one.");
      const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
      if (!text) throw new Error("Claude didn't send an answer. Try again.");
      return text;
    }
    throw new Error("That took too long. Try again.");
  }
  return {
    run,
    async ask(question, signal) { messages.push({ role: "user", content: question }); return run(signal); },
  };
}
export const explain = (item) => conversation(EXPLAIN(item), { web: true });
export const brief = (title, items, context) => conversation(BRIEF(title, items, context), { web: true });

// The tiny, safe subset of markdown Claude is asked to use.
export function md(text) {
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
  const out = []; let list = null;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (/^[-*] /.test(line)) { (list ||= []).push(`<li>${inline(line.slice(2))}</li>`); continue; }
    if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; }
    if (!line) continue;
    if (/^#{1,4} /.test(line)) out.push(`<h4>${inline(line.replace(/^#+ /, ""))}</h4>`);
    else out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push(`<ul>${list.join("")}</ul>`);
  return out.join("");
}

// A mock interviewer for "Next role" practice.
const INTERVIEWER = (profile) => `You are an experienced interviewer at a top AI company (think Anthropic, OpenAI or Databricks), running a realistic but kind mock interview inside a practice app.
The candidate: ${profile}

How to run it:
- Behave like a real interviewer: give the problem, then wait for the candidate. Ask one thing at a time. Keep your turns short.
- Coding: present level 1 only. When they share an approach or code, review it briefly (correctness, edge cases, clarity), then reveal the next level. Never write the solution unless they ask for it.
- System design: give the prompt, let them ask clarifying questions and answer them with realistic numbers, then probe trade-offs, bottlenecks and failure modes. Push on scale and data correctness.
- Behavioural: ask the question, then 2–3 follow-ups that dig for their own role, numbers and what they learned.
- If they say "hint", give a small one. If they say "done" or "feedback", stop and give feedback: what went well, what to improve, and a hire signal (strong yes / yes / lean no / no) for a senior or staff level, with one sentence why.
- Use light formatting: "## " headings, "- " bullets, **bold**. Code in plain text lines.`;
export const mock = (profile, kickoff) => conversation(kickoff, { web: false, system: INTERVIEWER(profile) });
