# Keeping Tabs

A daily catch-up on the things I care about, in one place.

## Tabs

- **♀ Feminism** and **🏳️‍🌈 LGBTQIA+**
  - **In the news:** this week's headlines, in 10 regions (World, India, USA, UK, Caribbean, Africa, Latin America, East & SE Asia, Middle East, Australia & NZ).
  - **New research:** the newest papers from 32 leading universities, including Harvard, Oxford, LSE, JNU, TISS, the University of the West Indies and Wits. You can filter by university, open the abstract, and follow "Free to read" links.
  - **🔎 Dig deeper:** a live search of research on any subject, from those universities or from anywhere.
- **💻 Engineering**
  - posts from engineering blogs worth reading (Will Larson, Martin Fowler, The Pragmatic Engineer, Charity Majors, Netflix, Cloudflare and more), filtered by Staff+, career, systems, craft, reliability and AI
  - the most-discussed Hacker News posts of the last two weeks on growing as an engineer
  - new software engineering papers on arXiv
- **📈 Senior → Staff:** eight skill areas (system design, code and craft, reliability, delivery, writing, influence, product sense, engineering with AI). Each has:
  - what "good" looks like at senior and staff level, as a checklist
  - one small practice for this week
  - the best books and articles
  - progress bars and rings, which stay in your browser
- **★ Saved:** anything you star.

A **new** badge marks anything that arrived since your last visit to that tab.

## How it works

- `tools/feeds.mjs` runs in the daily Pages build and writes `feed.json`.
- It gets its data from these sources:
  - Google News RSS
  - [OpenAlex](https://openalex.org), for research filtered to the universities in `topics.js`
  - the arXiv API
  - blog RSS/Atom feeds
  - the Hacker News search API
- If a source fails, yesterday's copy is kept.
- The live research search calls OpenAlex directly from the browser.

## Changing what it follows

- Edit `topics.js` to change the topics and their search words, the regions, the universities, the blogs and the Hacker News searches.
- Edit `skills.js` to change the skills, practices and reading list.
