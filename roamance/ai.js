// Claude extras, using the visitor's own API key (the same key the other apps on this site use, saved in this browser).
// Without a key the app still works fully; these only add fresh cards, a written taste profile and polished plans.

const MODEL = "claude-opus-5-5";
const KEY = "ssf-key";
let SDK = null;

export const ai = {
  get key() { try { return JSON.parse(localStorage.getItem(KEY) || "null") || sessionStorage.getItem(KEY) || ""; } catch { return ""; } },
  setKey(k) { try { localStorage.setItem(KEY, JSON.stringify(k)); } catch {} },
  forget() { try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch {} },
};

const VOICE = `You write for "Roamance", a playful app where places and experiences around the world are pitched like dating profiles and the user swipes on them. The user lives in San Francisco.
Write in plain, warm, witty English. Short sentences. Be accurate: real places, real food, real facts. Never invent opening hours or prices.`;

async function call(prompt, { maxTokens = 8000, signal } = {}) {
  SDK ||= (await import("../vendor/anthropic.mjs")).Anthropic;
  const c = new SDK({ apiKey: ai.key, dangerouslyAllowBrowser: true });
  let res;
  try {
    res = await c.messages.create({ model: MODEL, max_tokens: maxTokens, system: VOICE, messages: [{ role: "user", content: prompt }], output_config: { effort: "medium" } }, { signal });
  } catch (e) {
    if (e instanceof SDK.AuthenticationError) throw new Error("That API key didn't work. Check it and try again.");
    if (e instanceof SDK.RateLimitError) throw new Error("Too many requests right now. Wait a minute and try again.");
    if (e instanceof SDK.APIConnectionError) throw new Error("Couldn't reach Claude. Check your connection and try again.");
    if (e instanceof SDK.APIError) throw new Error(`Claude returned an error (${e.status || "unknown"}). Try again in a moment.`);
    throw e;
  }
  if (res.stop_reason === "refusal") throw new Error("Claude declined this one.");
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  if (!text) throw new Error("Claude didn't send an answer. Try again.");
  return text;
}
const json = (text) => { const m = text.match(/```(?:json)?\s*([\s\S]*?)```/); return JSON.parse((m ? m[1] : text).trim()); };

export async function writeMyType(summary) {
  return call(`Here is what one traveller has swiped on. Write their "type" in 4–6 sentences, playful like a friend reading their dating history back to them, then one line starting "Next, try:" naming one kind of trip they haven't considered but would probably love.
No headings, no bullet points, no markdown.

${summary}`, { maxTokens: 2000 });
}

export async function moreCards(summary, regions, tags, existing) {
  const text = await call(`Suggest 6 new places or experiences this traveller would swipe right on, plus 1 wildcard outside their usual type. Not any of these: ${existing.join(", ")}.

What they like so far:
${summary}

Return ONLY a JSON array (no prose). Each item:
{"id":"kebab-case","name":"…","where":"country","kind":"city|region|island|experience","region":one of ${JSON.stringify(Object.keys(regions))},
 "lat":number,"lon":number,"age":"short funny age, e.g. 1,232 or 'Glacier-carved, 20,000'","wiki":"exact English Wikipedia article title for photos",
 "fly":hours from SFO (number),"stay":days a visit deserves (1–7),"budget":1|2|3,"best":[good months 1–12],
 "tags":[3–6 of ${JSON.stringify(Object.keys(tags))}],"vibe":"one flirty line in the place's voice",
 "prompts":[["My ideal Sunday"|"I'm weirdly into"|"You'll find me eating"|"The way to win me over"|"Our first date would be"|"Green flags"|"Don't hate me if","specific real thing to do, one sentence",[1–2 tags]] ×3],
 "eats":[3 real local dishes],"flag":"one honest downside"}
Only pick places that belong in their region list (regions are groups you can travel within by train, bus or short flight).`, { maxTokens: 12000 });
  return json(text);
}

export async function polishPlan(plan, summary) {
  const text = await call(`Rewrite this trip plan's daily activities so they're vivid and specific for this traveller. Keep EXACTLY the same days, stops and order. Don't add stops, flights or detours. Each day: 2–3 short sentences.

Traveller: ${summary}

Plan (JSON): ${JSON.stringify(plan.itinerary.map((d) => ({ day: d.n, stop: d.stop, travel: d.travel || "" })))}

Return ONLY a JSON array of {"day":number,"text":"…"} with one entry per day.`, { maxTokens: 12000 });
  return json(text);
}
