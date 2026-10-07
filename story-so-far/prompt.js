// The instructions and output shape shared by both engines (Claude in the artifact, or the API with your own key).

export const STYLES = ["timeline", "journey", "lab", "casefile", "scrapbook"];

export const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["known", "caution", "title", "author", "style", "vibe", "headline", "recap", "you_are_here", "beats", "cast", "links", "remember"],
  properties: {
    known: { type: "boolean", description: "true if you know this book well enough to place the reader confidently" },
    caution: { type: "string", description: "empty, or a short plain note to the reader about uncertainty" },
    title: { type: "string" },
    author: { type: "string" },
    style: { type: "string", enum: STYLES },
    vibe: { type: "string", description: "3-6 words on the book's genre and tone" },
    headline: { type: "string" },
    recap: { type: "string" },
    you_are_here: { type: "string" },
    beats: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["marker", "emoji", "title", "text"],
        properties: { marker: { type: "string" }, emoji: { type: "string" }, title: { type: "string" }, text: { type: "string" } },
      },
    },
    cast: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["name", "symbol", "emoji", "role"],
        properties: { name: { type: "string" }, symbol: { type: "string" }, emoji: { type: "string" }, role: { type: "string" } },
      },
    },
    links: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["a", "b", "relation"],
        properties: { a: { type: "string" }, b: { type: "string" }, relation: { type: "string" } },
      },
    },
    remember: { type: "array", items: { type: "string" } },
  },
};

export const INSTRUCTIONS = `You write spoiler-free "story so far" recaps for readers who are partway through a book.

THE ONE RULE: the reader must learn nothing beyond the exact moment they have reached. A recap that leaks even a hint of what comes next has failed, however good the rest of it is. This reader has been spoiled by summaries before; that is why they are here.

Finding their place
- They give a format, a position (a page number, or a percentage for audiobooks) and a note about what just happened. The note is the most reliable anchor: their position is the moment right after it. Use the page or percentage only to cross-check, and trust the note if the two disagree. Editions differ, so page numbers are approximate.

What you may include
- Only events, revelations and character knowledge that the text has shown by that moment.
- Describe each character only as the reader currently understands them. If the book later reveals a secret, a true identity, a betrayal, a death or any twist, write as if you never knew it.
- A character who has not appeared by that moment does not exist for this recap. Do not name them.

What you must never do
- Hint at the future or contrast with it. Never use "yet", "so far", "for now", "still" (in the sense of "not changed yet"), "little does she know", "eventually", "later", "will", "is about to", "fateful", "doomed", "ill-fated", or anything else that implies something is coming. Never say what has not happened.
- Never label someone a villain, hero, traitor or love interest unless the text has plainly established it by then. Describe what they have done.
- Never mention the shape, themes or reception of the whole book ("the novel builds to...", "a classic twist"), or how much of the book is left.
- If you are unsure whether something happens before or after their position, leave it out.

If you do not know the book well enough to place them confidently, set known to false, say so plainly in caution, and build the recap only from what the reader told you. Never invent plot.

Voice: lively, warm and a little witty, matched to the book. Present tense. Plain words. Each beat is 1-3 sentences.

Visual style (pick one):
- "timeline" for historical fiction, sagas, or stories where dates and eras matter
- "journey" for quests, travel and adventures that move from place to place
- "lab" for science, medicine, cooking, or clever quirky comedies (for example Lessons in Chemistry)
- "casefile" for mysteries, thrillers and crime
- "scrapbook" for romance, family stories, literary fiction and everything else

Fields
- beats: 4-9 key moments in story order, ending exactly at the reader's position. marker is a chapter range, a date or year, a place, or a label like "Exp. 01" or "Exhibit A" to suit the style. One fitting emoji each.
- cast: up to 8 people who have appeared, each with a 2-letter symbol written like a chemical element (capital then lower case), an emoji, and a one-line role as the reader knows them now.
- links: up to 6 relationships as they stand right now, with a and b as short names that match the cast.
- remember: 2-4 established facts that will help the reader follow what they read next, with no hints about it.
- you_are_here: one sentence restating precisely where they are.
- headline: a playful one-line hook for the story so far. recap: 2-3 sentences. vibe: 3-6 words on genre and tone.

Before you answer, reread every sentence and ask: could this tell the reader anything about what happens after their position? If it could, cut it or rewrite it.`;

const FORMAT_LABEL = { book: "printed book", ebook: "e-book", audio: "audiobook" };

export function describeReader(input) {
  const pos = input.format === "audio"
    ? `${input.percent}% of the way through`
    : `page ${input.page}${input.total ? ` of ${input.total} (about ${Math.round((input.page / input.total) * 100)}% through)` : ""}`;
  return [
    `Book: ${input.title}${input.author ? ` by ${input.author}` : ""}`,
    `Format: ${FORMAT_LABEL[input.format] || input.format}`,
    `Position: ${pos}`,
    `What just happened, in the reader's own words: ${input.context || "(not given)"}`,
  ].join("\n");
}

// For the Claude-in-the-artifact engine, which takes one prompt and returns JSON.
export function fullPrompt(input, extra = "") {
  const shape = JSON.stringify({
    known: true, caution: "", title: "", author: "", style: "scrapbook", vibe: "", headline: "", recap: "", you_are_here: "",
    beats: [{ marker: "", emoji: "", title: "", text: "" }], cast: [{ name: "", symbol: "", emoji: "", role: "" }],
    links: [{ a: "", b: "", relation: "" }], remember: [""],
  });
  return `${INSTRUCTIONS}\n\nReply with only one JSON object with exactly these fields (style is one of ${STYLES.join(", ")}):\n${shape}\n\n${extra ? extra + "\n\n" : ""}The reader:\n${describeReader(input)}`;
}

// Phrases that usually smuggle in the future. A hit triggers one careful rewrite.
const HINTS = /\b(not yet|n['’]t yet|has yet to|have yet to|yet to be|so far|for now|little (?:does|do|did) \w+ know|eventually|will (?:later|soon|eventually|come to|turn out)|would (?:later|soon|eventually|come to|turn out)|later (?:on|in the (?:book|story|novel))|is about to|are about to|doomed|ill-fated|fateful|foreshadow\w*|spoiler\w*|twist)\b/i;

export function findHints(result) {
  const texts = [result.headline, result.recap, result.you_are_here, ...(result.beats || []).flatMap((b) => [b.title, b.text]),
    ...(result.cast || []).map((c) => c.role), ...(result.links || []).map((l) => l.relation), ...(result.remember || [])];
  const out = [];
  for (const t of texts) for (const s of String(t || "").split(/(?<=[.!?])\s+/)) if (HINTS.test(s)) out.push(s.trim());
  return [...new Set(out)];
}

export function repairNote(sentences) {
  return `A previous draft of this recap contained these sentences, which could hint at what happens next:\n${sentences.map((s) => `- ${s}`).join("\n")}\nWrite the whole recap again without them or anything like them.`;
}

export function stripHints(result) {
  const clean = (t) => String(t || "").split(/(?<=[.!?])\s+/).filter((s) => !HINTS.test(s)).join(" ");
  return {
    ...result,
    headline: HINTS.test(result.headline) ? "" : result.headline,
    recap: clean(result.recap), you_are_here: clean(result.you_are_here),
    beats: (result.beats || []).map((b) => ({ ...b, text: clean(b.text) })).filter((b) => b.text),
    cast: (result.cast || []).map((c) => ({ ...c, role: clean(c.role) })),
    links: (result.links || []).filter((l) => !HINTS.test(l.relation)),
    remember: (result.remember || []).filter((r) => !HINTS.test(r)),
  };
}
