// Senior and staff engineering skills: what "good" looks like at each level, a small practice for this week,
// and the best things to read. Tick items off as you grow; progress stays in your browser.

export const SKILLS = [
  {
    id: "design", icon: "🏛️", title: "System design",
    why: "Seniors design a service well. Staff engineers shape how many services fit together, and know which trade-offs will hurt in two years.",
    senior: [
      "I can design a service end to end: API, data model, storage choice, scaling and failure modes",
      "I can explain the trade-offs between SQL and NoSQL, queues and direct calls, caching strategies",
      "I can estimate load (requests per second, storage growth) on the back of an envelope",
      "I design for failure: timeouts, retries with backoff, idempotency, graceful degradation",
    ],
    staff: [
      "I can see across teams' systems and spot where boundaries are wrong or duplicated",
      "I've led a migration or re-architecture that kept running while it changed",
      "I can write down the architecture direction for my area for the next 1 to 2 years",
      "I know when NOT to build something, and when 'boring technology' is the right answer",
    ],
    practice: [
      "Pick a product you use daily and sketch its design in 30 minutes: API, data, scaling. Then look up how they really did it.",
      "Take one service you own and list every way it can fail. Which ones would page someone? Which would fail silently?",
      "Read one chapter of Designing Data-Intensive Applications and write three sentences on where it applies at work.",
      "Do a back-of-the-envelope estimate for a feature you're building: QPS, storage per year, cost.",
    ],
    read: [
      { t: "Designing Data-Intensive Applications", by: "Martin Kleppmann", url: "https://dataintensive.net/", kind: "book" },
      { t: "Patterns of Distributed Systems", by: "Unmesh Joshi", url: "https://martinfowler.com/articles/patterns-of-distributed-systems/", kind: "article" },
      { t: "The System Design Primer", by: "Donne Martin", url: "https://github.com/donnemartin/system-design-primer", kind: "guide" },
    ],
  },
  {
    id: "craft", icon: "🛠️", title: "Code & craft",
    why: "Good code is code the next person can change safely. At senior level you raise the bar for the whole codebase, not just your own PRs.",
    senior: [
      "My designs hide complexity behind simple interfaces (deep modules, not shallow ones)",
      "I refactor in small, safe steps, with tests protecting the behaviour",
      "My code reviews catch design problems, not just style, and are kind and specific",
      "I write tests that give confidence to change code, not tests that break on every refactor",
    ],
    staff: [
      "I set or improve the standards others follow: patterns, linters, templates, golden paths",
      "I can make a large legacy codebase better incrementally without a big-bang rewrite",
      "I know which code-quality problems actually slow the team down, and fix those first",
    ],
    practice: [
      "Find the most confusing function in your codebase and refactor it in three small commits.",
      "In your next code review, leave one comment about design (not style), framed as a question.",
      "Delete something: dead code, an unused flag, a stale config. Small deletions are underrated.",
      "Read the code review guide from Google's engineering practices and compare it to how your team reviews.",
    ],
    read: [
      { t: "A Philosophy of Software Design", by: "John Ousterhout", url: "https://web.stanford.edu/~ouster/cgi-bin/book.php", kind: "book" },
      { t: "Google's code review guide", by: "Google Engineering Practices", url: "https://google.github.io/eng-practices/review/", kind: "guide" },
      { t: "Refactoring", by: "Martin Fowler", url: "https://refactoring.com/", kind: "book" },
    ],
  },
  {
    id: "ops", icon: "🚨", title: "Reliability & operations",
    why: "Software that isn't running isn't helping anyone. Senior engineers own what they ship in production, and make on-call humane.",
    senior: [
      "I instrument what I ship: useful logs, metrics and traces, and an alert that means something",
      "I've been incident lead and can stay calm, communicate and restore service first",
      "I write blameless postmortems with action items that actually get done",
      "I can define SLOs for my service and use the error budget to make decisions",
    ],
    staff: [
      "I spot systemic reliability risks across teams and get them prioritised",
      "I've improved on-call for a whole group (fewer noisy alerts, better runbooks)",
      "I can explain reliability trade-offs to leadership in terms of users and money",
    ],
    practice: [
      "Look at your noisiest alert. Fix it, tune it or delete it.",
      "Read one public postmortem (Cloudflare and GitHub publish great ones) and note what you'd do differently.",
      "Check: if your service broke at 3am, could someone new fix it with your runbook alone?",
      "Write down your service's SLO in one sentence. If you can't, that's this week's task.",
    ],
    read: [
      { t: "Site Reliability Engineering (free online)", by: "Google", url: "https://sre.google/sre-book/table-of-contents/", kind: "book" },
      { t: "Postmortem culture: learning from failure", by: "Google SRE", url: "https://sre.google/sre-book/postmortem-culture/", kind: "article" },
      { t: "Observability Engineering", by: "Charity Majors, Liz Fong-Jones, George Miranda", url: "https://www.oreilly.com/library/view/observability-engineering/9781492076438/", kind: "book" },
    ],
  },
  {
    id: "delivery", icon: "🚀", title: "Delivery & execution",
    why: "Senior engineers turn vague problems into shipped outcomes. They de-risk early and keep big projects moving.",
    senior: [
      "I can break a vague project into milestones that each deliver something real",
      "I find the riskiest unknown first and prototype it before committing",
      "I give estimates as ranges, and update people early when things slip",
      "I ship in small increments behind flags rather than one big launch",
    ],
    staff: [
      "I can lead a multi-team project: planning, dependencies, unblocking, keeping momentum",
      "I notice when a project should be cut, paused or re-scoped, and say so",
      "I make the whole group faster (CI, tooling, fewer handoffs), not just my own work",
    ],
    practice: [
      "For your current project, write the one thing most likely to make it late. What would test it this week?",
      "Split your next task so the first piece can ship in two days.",
      "Send a short status update before anyone asks: done, next, risks.",
      "Measure one thing about your team's flow: time from PR open to merge, or merge to production.",
    ],
    read: [
      { t: "Accelerate", by: "Forsgren, Humble & Kim", url: "https://itrevolution.com/product/accelerate/", kind: "book" },
      { t: "Shape Up (free online)", by: "Ryan Singer, Basecamp", url: "https://basecamp.com/shapeup", kind: "book" },
      { t: "On being a senior engineer", by: "John Allspaw", url: "https://www.kitchensoap.com/2012/07/11/on-being-a-senior-engineer/", kind: "article" },
    ],
  },
  {
    id: "writing", icon: "✍️", title: "Writing & communication",
    why: "At senior and staff level, your writing does the work when you're not in the room. Design docs, RFCs and updates are how decisions get made.",
    senior: [
      "I write design docs that state the problem, options and trade-offs, not just the answer",
      "I can explain a technical decision to a non-engineer in two minutes",
      "My PR descriptions and commit messages explain why, not just what",
      "I disagree openly and constructively, then commit once a decision is made",
    ],
    staff: [
      "I write documents that align several teams on a direction",
      "I can present to leadership: the decision needed, the options, my recommendation",
      "I make implicit knowledge explicit: decision records, onboarding docs, principles",
    ],
    practice: [
      "Rewrite your last design doc's first paragraph so a new joiner understands the problem in 30 seconds.",
      "Write an architecture decision record (ADR) for a decision your team made but never wrote down.",
      "Explain your current project to a friend outside tech. Where did you lose them?",
      "Take one lesson from Google's technical writing course.",
    ],
    read: [
      { t: "Design docs at Google", by: "Malte Ubl", url: "https://www.industrialempathy.com/posts/design-docs-at-google/", kind: "article" },
      { t: "Technical writing courses (free)", by: "Google", url: "https://developers.google.com/tech-writing", kind: "course" },
      { t: "Writing an engineering strategy", by: "Will Larson", url: "https://lethain.com/eng-strategies/", kind: "article" },
    ],
  },
  {
    id: "influence", icon: "🤝", title: "Influence & leadership",
    why: "Staff engineers lead without authority: through trust, mentoring and making the right thing the easy thing. Glue work matters, but make sure it's seen.",
    senior: [
      "I mentor at least one engineer and they grow noticeably",
      "I make newcomers productive fast (onboarding, pairing, good first tasks)",
      "I build trust across teams so people come to me early",
      "I make my glue work visible: I name it, write it down and bring it to reviews",
    ],
    staff: [
      "I know which staff archetype I am (tech lead, architect, solver, right hand) and what it needs",
      "I sponsor others: I put their names forward for opportunities, not just give advice",
      "I can change how a group works (a process, a standard) and get it adopted",
      "I have a clear story of my impact for promotion: problems, actions, results",
    ],
    practice: [
      "Write down three things you did this month that nobody asked for but helped the team. That's your glue work: make it visible.",
      "Offer a 30-minute pairing session to someone more junior.",
      "Recommend a colleague for something: a talk, a project, a shout-out in a meeting.",
      "Read 'Being Glue' and decide one piece of glue work to hand off or get recognised.",
    ],
    read: [
      { t: "Being Glue", by: "Tanya Reilly", url: "https://www.noidea.dog/glue", kind: "talk" },
      { t: "The Staff Engineer's Path", by: "Tanya Reilly", url: "https://www.oreilly.com/library/view/the-staff-engineers/9781098118723/", kind: "book" },
      { t: "Staff Engineer: archetypes and stories", by: "Will Larson", url: "https://staffeng.com/guides/staff-archetypes/", kind: "guide" },
    ],
  },
  {
    id: "product", icon: "🎯", title: "Product & business sense",
    why: "The best engineers care why something is built. They push back on the wrong thing, and find cheaper ways to get the right outcome.",
    senior: [
      "I understand who uses what I build and how success is measured",
      "I suggest simpler alternatives that get 80% of the value for 20% of the work",
      "I look at data (usage, errors, feedback) before and after I ship",
    ],
    staff: [
      "I understand my company's strategy and how my area's technical work supports it",
      "I can weigh engineering cost against business value and argue it in those terms",
      "I help product and design shape the roadmap, not just receive it",
    ],
    practice: [
      "Ask your PM: what's the one number this project should move? Then find where it's measured.",
      "Find a feature your team built that almost nobody uses. Why? What would you do now?",
      "Estimate the cloud cost of a service you own per month. Was it what you expected?",
    ],
    read: [
      { t: "The product-minded software engineer", by: "Gergely Orosz", url: "https://blog.pragmaticengineer.com/the-product-minded-engineer/", kind: "article" },
      { t: "An Elegant Puzzle", by: "Will Larson", url: "https://lethain.com/elegant-puzzle/", kind: "book" },
    ],
  },
  {
    id: "ai", icon: "🤖", title: "Engineering with AI",
    why: "AI coding tools change what a senior engineer spends time on: more reviewing, specifying and verifying, less typing. Judgement matters more, not less.",
    senior: [
      "I use AI assistants daily and know where they help and where they mislead",
      "I review AI-written code as carefully as a colleague's: tests, edge cases, security",
      "I can write clear specs and prompts that get good results first time",
    ],
    staff: [
      "I help my team adopt AI tools safely: guidelines, review norms, what not to send",
      "I can judge when an LLM feature belongs in a product, and how to evaluate it",
      "I understand agents, tool use and evals well enough to design with them",
    ],
    practice: [
      "Give an AI assistant a small, well-specified task end to end, and review it like a PR.",
      "Write down three things AI tools got confidently wrong for you this month.",
      "Read one post on building with LLMs and note one idea for your team.",
    ],
    read: [
      { t: "Building effective agents", by: "Anthropic", url: "https://www.anthropic.com/engineering/building-effective-agents", kind: "article" },
      { t: "AI-assisted programming (notes)", by: "Simon Willison", url: "https://simonwillison.net/tags/ai-assisted-programming/", kind: "blog" },
    ],
  },
];
