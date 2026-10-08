# Story So Far

**Everything that's happened. Nothing that hasn't.**

> Let's be real: I zone out mid-chapter. Asking a chatbot to catch me up always came with a little dread, because it has spoiled books for me before, and spoilers are my biggest pet peeve. So I made this. It tells me what I missed, and not one word more.
>
> It's best for when you've drifted off for a few pages or a chapter but want to keep reading or listening: you roughly know what's going on and just want a brief overview so far, with no references to the future.

A spoiler-free "previously on…" for the book you're reading. Tell it the book, the author and what just happened. You can also add the format and your page, or your percentage for audiobooks. It writes a recap of everything up to that moment and nothing after it, drawn to suit the story:

| Style | Used for | Looks like |
|---|---|---|
| **Timeline** | historical fiction, sagas | small-caps title, a drop-cap TL;DR, cameo portraits, dated events down a line, footnotes |
| **Journey** | quests, travel, adventures | a postcard TL;DR, numbered stops along a dotted route, luggage tags |
| **Lab notebook** | science, clever comedies (think *Lessons in Chemistry*) | graph paper, a periodic table of characters, numbered experiments, reagent labels |
| **Case file** | mysteries, thrillers | a typed memo, mugshot polaroids, pinned evidence cards, sticky notes |
| **Scrapbook** | romance, family, literary, everything else | an index card, taped polaroids with handwritten captions, sticky notes |

Every recap has the same five parts, each drawn in the book's style: **the title**, a **TL;DR**, the **characters so far** (as they stand right now), the **story** (ending at a *You are here* pin) and what's **worth remembering**.

**Try it:** https://nikki30.github.io/nikoftime/story-so-far/. Three example recaps (*Pride and Prejudice*, *Around the World in Eighty Days*, *Frankenstein*) work without any setup.

## How it avoids spoilers

1. **Your note anchors the position.** Page counts differ between editions, so "Charlotte just accepted Mr Collins" is the anchor. A page number, if you give one, is only a cross-check.
2. **Strict instructions:** only events and knowledge the text has shown by that moment; characters described as you currently understand them; never name someone who hasn't appeared; never hint at the future ("yet", "so far", "little does she know", "eventually", "fateful"…); leave out anything uncertain.
3. **A second check.** The app scans every sentence for phrasing that tends to smuggle in the future. If it finds any, it asks Claude to rewrite the recap without it, and if anything still slips through, it cuts the sentence.
4. **No guessing.** If Claude doesn't know the book well enough, it says so and recaps only what you told it.

## Running it

The recaps are written by Claude (`claude-opus-5-5`, high effort, structured JSON output, with server-side refusal fallbacks).

- **On the public site** you paste your own [Anthropic API key](https://console.anthropic.com/settings/keys). It stays in your browser and is only sent to `api.anthropic.com`. A recap costs roughly 5–15 cents.
- **Inside Claude** (published as a Claude artifact) it uses the viewer's own Claude account instead, so no key is needed.

Your shelf of recaps is saved in your browser's local storage.

## Files

```
index.html     the page
styles.css     layout and the five recap styles
app.js         form, engines (Claude artifact or API key), spoiler check, rendering, shelf
prompt.js      the instructions, the JSON schema and the spoiler-phrase check
demos.js       the three example recaps (public-domain books)
../vendor/     shared with the other apps: the Anthropic TypeScript SDK bundled for the browser (MIT)
```

No build step: it's plain ES modules. To rebundle the SDK: `npm i @anthropic-ai/sdk esbuild`, then bundle `export { default as Anthropic } from "@anthropic-ai/sdk"` with `esbuild --bundle --format=esm --platform=browser --minify`.
