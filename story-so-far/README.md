# Story So Far

**Everything that's happened. Nothing that hasn't.**

A spoiler-free "previously on…" for the book you're reading. Tell it the book, where you are (a page number, or a percentage for audiobooks) and one line about what just happened, and it writes a recap of everything up to that moment and nothing after it, drawn to suit the story:

| Style | Used for | Looks like |
|---|---|---|
| **Timeline** | historical fiction, sagas | dated events down a line |
| **Journey** | quests, travel, adventures | numbered stops along a dotted route |
| **Lab notebook** | science, clever comedies (think *Lessons in Chemistry*) | numbered experiments on graph paper, a periodic table of characters, relationships as reactions |
| **Case file** | mysteries, thrillers | pinned evidence cards, mugshot polaroids, a CONFIDENTIAL stamp |
| **Scrapbook** | romance, family, literary, everything else | taped polaroids with handwritten captions |

Every recap also has a *You are here* pin, a who's-who as the characters stand right now, how they relate, and a few facts worth remembering.

**Try it:** https://nikki30.github.io/nikoftime/story-so-far/. Three example recaps (*Pride and Prejudice*, *Around the World in Eighty Days*, *Frankenstein*) work without any setup.

## How it avoids spoilers

1. **Your note anchors the position.** Page counts differ between editions, so "Charlotte just accepted Mr Collins" is the anchor, and the page number is a cross-check.
2. **Strict instructions:** only events and knowledge the text has shown by that moment; characters described as you currently understand them; never name someone who hasn't appeared; never hint at the future ("yet", "so far", "little does she know", "eventually", "fateful"…); leave out anything uncertain.
3. **A second check.** The app scans every sentence for phrasing that tends to smuggle in the future. If it finds any, it asks Claude to rewrite the recap without it, and if anything still slips through, cuts the sentence. The badge on each recap says which of these happened.
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
vendor/        the Anthropic TypeScript SDK bundled for the browser (MIT)
```

No build step: it's plain ES modules. To rebundle the SDK: `npm i @anthropic-ai/sdk esbuild`, then bundle `export { default as Anthropic } from "@anthropic-ai/sdk"` with `esbuild --bundle --format=esm --platform=browser --minify`.
