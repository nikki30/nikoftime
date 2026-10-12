# Keeping Tabs

A daily learning habit about the things I care about: feminism and women's rights, LGBTQIA+ rights, and growing from senior to staff engineer. It teaches as well as points to news.

## How it teaches

- **Find my level:** a 10-question quiz (16 for engineering).
  - Each answer is explained.
  - It rates you per subtopic: *New to this*, *Know the basics* or *Confident*.
- **Your plan:** three short lessons a week, starting where you're newest. It skips the basics you already know.
- **Lessons.** Each one has:
  - a hook
  - a short readable explainer
  - "Remember" takeaways
  - an India and South Asia angle and a world angle (real industry examples for engineering)
  - two check-yourself questions
  - a "Think about it" reflection that's saved to your notes
  - "Go deeper" links

  Answering both questions completes the lesson.
- **Every day:** a "Did you know?" fact, a word of the day and someone to know.
- **🔥 Streak** and progress rings.

## Keeping up

- **News** on each topic in 10 regions. Words from the glossary are highlighted, and you can tap one for its meaning.
- **New research** from 32 leading universities, plus a live research search.
- **Engineering reading:** blogs, the most-discussed Hacker News posts and arXiv papers.

## Claude explanations (optional, with your own key)

Tap any story, paper or post and Claude:
- reads it (web fetch and web search)
- explains it in plain English, with the background you need and why it matters
- asks you a question
- answers follow-ups

You can also:
- tap **Brief me on this week** to have the week's headlines grouped into threads, with a mini-lesson
- ask Claude about any lesson

Explanations take into account what the placement quiz says you already know.

The key is the same one Story So Far uses. It's saved only in this browser and sent only to Anthropic. Everything else works without a key.

## Files

- `learn/feminism.js`, `learn/lgbtq.js`, `learn/eng.js`: the learning tracks (placement questions, lessons, glossary, facts, people)
- `skills.js`: the senior and staff checklist, weekly practices and reading
- `topics.js`: the topics, regions, universities, blogs and Hacker News searches the daily feed follows
- `ai.js`: the Claude calls (Claude Opus 5.5, with server-side fallback)
- `tools/feeds.mjs` (at the repo root): builds `feed.json` in the daily Pages run

The lesson content was written by Claude from general knowledge. Dates and numbers are rounded, contested points are marked as such, and the links point mostly to Wikipedia.
