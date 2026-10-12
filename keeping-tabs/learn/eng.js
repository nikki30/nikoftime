// Engineering track: from solid senior towards staff. Plain data, no imports.

export const TRACK = {
  id: "eng",
  intro: "A senior-to-staff engineering track: the trade-offs behind distributed systems, delivery and reliability, and the writing, influence and product judgement that staff engineers are actually measured on.",
  topics: [
    { id: "design", title: "System design", icon: "🏛️", blurb: "Trade-offs that still hold up two years later." },
    { id: "craft", title: "Code & craft", icon: "🛠️", blurb: "Code the next person can change safely." },
    { id: "ops", title: "Reliability & operations", icon: "🚨", blurb: "SLOs, observability and surviving overload." },
    { id: "delivery", title: "Delivery & execution", icon: "🚀", blurb: "Shipping big things in small, safe steps." },
    { id: "writing", title: "Writing & communication", icon: "✍️", blurb: "Docs and messages that move decisions forward." },
    { id: "influence", title: "Influence & leadership", icon: "🤝", blurb: "Leading without the org chart." },
    { id: "product", title: "Product & business sense", icon: "🎯", blurb: "Outcomes, costs and what is worth building." },
    { id: "ai", title: "Engineering with AI", icon: "🤖", blurb: "Building with LLMs and working alongside them." },
  ],

  placement: [
    // design
    {
      q: "Your payment service retries failed calls to a card processor. After a network blip, some customers are charged twice. What is the best fix?",
      options: ["Send an idempotency key with each logical payment so the processor can de-duplicate retries", "Stop retrying payment calls entirely", "Increase the timeout so calls never fail", "Retry faster so the blip is shorter"], answer: 0, topic: "design",
      explain: "A timeout does not tell you whether the charge happened. An idempotency key lets the server recognise a retry of the same request and return the original result instead of charging again.",
    },
    {
      q: "A hot cache key expires and thousands of requests hit the database at once, which falls over. Which technique most directly prevents this?",
      options: ["A bigger cache", "Shorter TTLs on all keys", "Request coalescing (or a lease) so only one caller recomputes the value while others wait or get the stale one", "Moving the database to a larger instance"], answer: 2, topic: "design",
      explain: "This is a cache stampede. Letting one request refill the key (coalescing, leases, or early probabilistic refresh) removes the herd; a bigger cache or database only raises the ceiling.",
    },
    // craft
    {
      q: "Which interface is the best example of a deep module, in John Ousterhout’s sense?",
      options: ["A class with 40 small getters and setters that mirror database columns", "A file API with open, read, write and close that hides caching, disk layout and scheduling", "A wrapper that renames another library’s methods one-to-one", "A helper that takes 12 boolean flags"], answer: 1, topic: "craft",
      explain: "A deep module offers a small, simple interface over a lot of hidden complexity. Unix file I/O is Ousterhout’s classic example.",
    },
    {
      q: "Two teams own a consumer and a provider service. End-to-end tests across both are slow and flaky. What best replaces most of them?",
      options: ["More mocks inside the consumer only", "A manual QA pass before each release", "Deleting the tests and relying on monitoring", "Consumer-driven contract tests that both sides run in their own pipelines"], answer: 3, topic: "craft",
      explain: "Contract tests check the agreed shape of requests and responses on each side independently, catching most integration breaks without a slow shared environment.",
    },
    // ops
    {
      q: "Your service has a 99.9% monthly availability SLO. Roughly how much downtime does that allow in a 30-day month?",
      options: ["About 4 minutes", "About 43 minutes", "About 7 hours", "About 3 days"], answer: 1, topic: "ops",
      explain: "0.1% of 30 days (43,200 minutes) is about 43 minutes. That allowance is your error budget.",
    },
    {
      q: "Your service retries failed calls three times at every layer of a five-layer stack. A downstream database slows down and the outage gets much worse. What is the most likely cause?",
      options: ["Retry amplification: retries at each layer multiply load on the struggling dependency", "The database needs more indexes", "Clock skew between layers", "Too few log lines"], answer: 0, topic: "ops",
      explain: "Retries at several layers multiply (up to 4 to the power of 5 attempts here). Retry at one layer, use backoff with jitter and retry budgets, and shed load early.",
    },
    // delivery
    {
      q: "What does a feature flag mainly let you do?",
      options: ["Skip code review", "Separate deploying code from releasing a feature to users", "Avoid writing tests", "Run two databases at once"], answer: 1, topic: "delivery",
      explain: "Flags let code sit in production turned off, then be released gradually, and turned off again fast without a redeploy.",
    },
    {
      q: "You must replace a large legacy billing system that cannot go offline. Which approach carries the least risk?",
      options: ["A full rewrite, switched over in one weekend", "Freeze all features for a year while rewriting", "Copy the old code into a new repo and refactor in place", "A strangler fig migration: route slices of traffic to new components behind a facade until the old system can be removed"], answer: 3, topic: "delivery",
      explain: "Strangler fig replaces the system piece by piece, each step reversible and delivering value, rather than betting everything on one cutover.",
    },
    // writing
    {
      q: "You need a VP to approve a budget for a migration. How should the message start?",
      options: ["With the ask and the decision needed, then the key reason, then details", "With the history of the system since 2015", "With a detailed architecture diagram", "With a list of everyone you consulted"], answer: 0, topic: "writing",
      explain: "Bottom line up front (BLUF): busy readers decide from the first lines, so put the ask and the deadline there.",
    },
    {
      q: "What is the main purpose of an Architecture Decision Record (ADR)?",
      options: ["To replace all design docs", "To track sprint velocity", "To record one significant decision with its context and consequences, so future readers know why", "To list every class in the system"], answer: 2, topic: "writing",
      explain: "Michael Nygard’s ADRs are short, immutable notes: context, decision, consequences. When the decision changes, you add a new ADR that supersedes it.",
    },
    // influence
    {
      q: "An engineer spends much of her time onboarding people, unblocking other teams and noticing dropped work, and is told she isn’t ‘technical enough’ for promotion. What is this pattern called?",
      options: ["Bikeshedding", "Glue work that goes unrecognised", "Scope creep", "Yak shaving"], answer: 1, topic: "influence",
      explain: "Tanya Reilly’s talk ‘Being Glue’ describes this: valuable, necessary work that is often invisible in promotion criteria unless it is made deliberate and visible.",
    },
    {
      q: "Which best describes sponsorship, as distinct from mentorship?",
      options: ["Giving someone advice in regular 1:1s", "Paying for someone’s conference ticket", "Reviewing someone’s code carefully", "Using your own credibility to put someone forward for high-visibility opportunities and speaking for them where decisions are made"], answer: 3, topic: "influence",
      explain: "Mentors talk to you; sponsors talk about you, in rooms you are not in, and spend their own reputation on your behalf.",
    },
    // product
    {
      q: "Which is an outcome metric rather than an output metric?",
      options: ["Number of features shipped this quarter", "Story points completed", "Percentage of new users who complete setup within a day", "Lines of code written"], answer: 2, topic: "product",
      explain: "Outputs count what the team produced. Outcomes measure a change in user or business behaviour that the work was meant to cause.",
    },
    {
      q: "Your team wants to build its own feature-flag service instead of buying one. Which question matters most?",
      options: ["Is this core to what makes our product different, and will we fund owning it for years?", "Is building it more fun?", "Can we finish a prototype this sprint?", "Does the vendor use our favourite language?"], answer: 0, topic: "product",
      explain: "Build vs buy hinges on differentiation and total cost of ownership. The prototype is cheap; running, securing and upgrading it for years is not.",
    },
    // ai
    {
      q: "An AI assistant writes a 400-line change that passes CI. What is the most important thing to do before merging?",
      options: ["Merge it, CI passed", "Review it as carefully as a human’s change: check it really solves the problem, hunt for invented APIs and missing edge cases, and make sure you can explain every line", "Ask the AI if it is correct", "Only check formatting"], answer: 1, topic: "ai",
      explain: "You own what you merge. Plausible-looking code can call non-existent functions, skip error handling or test the wrong thing, and passing tests only prove what the tests check.",
    },
    {
      q: "You changed the prompt of an LLM feature and a few examples look better. What should you do before shipping?",
      options: ["Ship it, the examples look better", "Raise the temperature", "Ask users to report problems", "Run it against an eval set of representative and tricky cases and compare scores with the old prompt"], answer: 3, topic: "ai",
      explain: "LLM outputs vary and a prompt change can fix some cases while breaking others. An eval set turns ‘looks better’ into a measured regression check.",
    },
  ],

  lessons: [
    // ───────────── design ─────────────
    {
      id: "idempotency-keys", topic: "design", level: 1, minutes: 5,
      title: "Retries, timeouts and idempotency keys",
      hook: "A timeout tells you nothing about whether the other side did the work.",
      body: [
        "Every network call has three outcomes, not two: it worked, it failed, or you don’t know. A timeout is the third case. The server may have charged the card and the response got lost on the way back.",
        "If you retry blindly, you may do the work twice. If you never retry, small blips become user-visible failures. The way out is to make the operation idempotent: doing it twice has the same effect as doing it once.",
        "Some operations are naturally idempotent, such as ‘set status to shipped’. Others, like ‘charge £20’, are not. For those, the client generates a unique idempotency key per logical operation and sends it on every retry. The server stores the key with the result and, on a repeat, returns the stored result instead of acting again.",
        "Worked example: a checkout client creates key 7f3a… and calls POST /charges. It times out. The client retries with the same key. The server finds 7f3a… already completed and returns the original charge. One charge, no guesswork. Pair this with exponential backoff and jitter so retries don’t arrive in synchronised waves.",
      ],
      points: [
        "A timeout means ‘unknown’, not ‘failed’.",
        "Idempotency keys make non-idempotent operations safe to retry.",
        "Retry with exponential backoff plus jitter, and cap the attempts.",
      ],
      example: "Stripe’s API accepts an Idempotency-Key header on POST requests so clients can safely retry payments, and Amazon’s Builders’ Library describes the same pattern for AWS APIs.",
      quiz: [
        { q: "Where should the idempotency key be generated?", options: ["By the client, once per logical operation, and reused on retries", "By the server on each request", "By the load balancer"], answer: 0, explain: "If a new key were made per attempt, the server couldn’t tell a retry from a new request." },
        { q: "Why add jitter to backoff?", options: ["To make retries faster", "To encrypt the request", "To spread retries out so many clients don’t retry at the same instant"], answer: 2, explain: "Without jitter, clients that failed together retry together, creating repeated spikes." },
      ],
      think: "Which call in a system you own would do real harm if it ran twice? What protects it today?",
      deeper: [
        { t: "Making retries safe with idempotent APIs (Amazon Builders’ Library)", url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/" },
        { t: "Timeouts, retries and backoff with jitter (Amazon Builders’ Library)", url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/" },
      ],
    },
    {
      id: "caching-pitfalls", topic: "design", level: 2, minutes: 6,
      title: "Caching without getting burned",
      hook: "Phil Karlton’s joke: there are only two hard things in computer science, cache invalidation and naming things.",
      body: [
        "A cache trades freshness for speed. That trade is fine until you forget you made it. The three classic failures are stale data, stampedes, and a cache that has quietly become load-bearing.",
        "Staleness: decide how stale is acceptable per use. A product description can be minutes old; an account balance cannot. Cache-aside with a TTL is simple. Writing through, or deleting the key on update, is fresher but has races: a slow reader can write an old value back after your delete.",
        "Stampedes: when a hot key expires, every request misses at once and hammers the database. Fixes include request coalescing (one caller recomputes, the rest wait), serving stale while one request refreshes in the background, and adding random jitter to TTLs so keys don’t expire together.",
        "Load-bearing caches: if your database can only survive with a 95% hit rate, a cold cache after a restart or a deploy is an outage. Worked example: a team flushes Redis during a migration, hit rate drops to zero, database CPU pins at 100%. The fix is warming the cache gradually and capacity-planning for a cold start, or shedding load until it warms.",
      ],
      points: [
        "Choose a staleness budget per piece of data, not one TTL for everything.",
        "Protect hot keys from stampedes with coalescing, stale-while-revalidate and TTL jitter.",
        "Know whether your backend survives a cold cache.",
      ],
      example: "Facebook’s 2013 paper ‘Scaling Memcache at Facebook’ describes leases, which let only one client refill a missing key at a time, to tame thundering herds and stale writes.",
      quiz: [
        { q: "Many cached keys were written at the same moment with the same TTL. What can happen?", options: ["They become permanently stale", "They expire together and cause a burst of misses", "Nothing, TTLs are independent"], answer: 1, explain: "Synchronised expiry causes synchronised misses. Random jitter on TTLs spreads them out." },
        { q: "Your database needs a 95% cache hit rate to stay up. What is the risk?", options: ["A cache restart or flush can take the database down", "Too much memory use", "Keys will never expire"], answer: 0, explain: "The cache has become load-bearing, so its failure is the database’s failure." },
      ],
      think: "If your main cache vanished right now, what would happen in the first five minutes?",
      deeper: [
        { t: "Caching challenges and strategies (Amazon Builders’ Library)", url: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/" },
        { t: "Cache stampede (Wikipedia)", url: "https://en.wikipedia.org/wiki/Cache_stampede" },
      ],
    },
    {
      id: "cap-pacelc-consistency", topic: "design", level: 3, minutes: 7,
      title: "CAP, PACELC and choosing a consistency model",
      hook: "CAP only talks about network partitions. What about the other 99.9% of the time?",
      body: [
        "The CAP theorem (Eric Brewer’s conjecture, proved by Gilbert and Lynch in 2002) says that during a network partition a replicated system must choose between consistency (every read sees the latest write) and availability (every request gets a non-error answer). You don’t get to opt out of partitions, so the real choice is C or A when one happens.",
        "Daniel Abadi’s PACELC extends this: if there is a Partition, choose A or C; Else, choose Latency or Consistency. Even on a healthy network, waiting for replicas to agree costs time. That second trade-off is the one you pay on every request.",
        "Consistency is a spectrum. Linearizability behaves like a single copy. Sequential and causal consistency relax ordering. Read-your-writes guarantees a user sees their own change. Eventual consistency only promises replicas converge when writes stop.",
        "Worked example: a social app. Likes counts can be eventually consistent. A user editing their profile needs read-your-writes, or they think the save failed. A username must be unique, so claiming one needs a linearizable operation. One product, three different models, chosen per operation rather than per database.",
      ],
      points: [
        "CAP is about behaviour during partitions; PACELC adds the everyday latency cost.",
        "Pick consistency per operation, based on what users notice and what must never break.",
        "Uniqueness and money usually need strong guarantees; counters and feeds rarely do.",
      ],
      example: "Amazon’s 2007 Dynamo paper chose availability for the shopping cart, accepting that deleted items could occasionally reappear, while Google’s Spanner (2012) used TrueTime clocks to offer strong, externally consistent transactions globally at the cost of commit latency.",
      quiz: [
        { q: "In PACELC, what does the ‘ELC’ part describe?", options: ["Encryption, logging and compression", "Election of a leader during a crash", "Even without a partition, you trade latency against consistency"], answer: 2, explain: "Else (no partition), choose Latency or Consistency." },
        { q: "A user changes their display name, refreshes, and sees the old one. Which guarantee is missing?", options: ["Read-your-writes", "Linearizable uniqueness", "Partition tolerance"], answer: 0, explain: "Read-your-writes ensures a client always sees its own updates, even if others see them later." },
      ],
      think: "Name one operation in your system that is more strongly consistent than it needs to be, and one that is weaker than it should be.",
      deeper: [
        { t: "CAP theorem (Wikipedia)", url: "https://en.wikipedia.org/wiki/CAP_theorem" },
        { t: "Consistency model (Wikipedia)", url: "https://en.wikipedia.org/wiki/Consistency_model" },
        { t: "Designing Data-Intensive Applications (Martin Kleppmann)", url: "https://dataintensive.net/" },
      ],
    },

    // ───────────── craft ─────────────
    {
      id: "deep-modules", topic: "craft", level: 1, minutes: 5,
      title: "Deep modules beat shallow ones",
      hook: "A module that is easy to call but hard to write is usually doing its job.",
      body: [
        "In A Philosophy of Software Design (2018), John Ousterhout pictures a module as a rectangle. The top edge is its interface, what callers must know. The area is the functionality it provides. Deep modules have a small top edge and a big area. Shallow modules have an interface nearly as complex as what they do.",
        "Shallow modules feel tidy because each is small, but they push complexity outwards. Every caller must learn more names, more ordering rules, more flags. A codebase of many shallow classes often has more total complexity, just spread out.",
        "Ousterhout’s go-to deep example is Unix file I/O: open, read, write, close, seek. Behind those few calls sit disk layout, caching, permissions and device drivers. A classic shallow example is the old Java pattern of wrapping a FileInputStream in a BufferedInputStream just to get buffering, which should have been the default.",
        "Worked example: a payments client exposes setRetryCount, setBackoff, setIdempotencyKey, setTimeout and send. Every caller configures all five, and half get it wrong. Redesign it as charge(amount, customer) with sensible defaults and the key generated inside. Callers now can’t forget the hard parts.",
      ],
      points: [
        "Judge a module by how much it hides relative to how much callers must know.",
        "Pull complexity down into the module rather than up onto callers.",
        "Good defaults make the common case one simple call.",
      ],
      example: "Ousterhout teaches this as a design course at Stanford, and uses Unix file I/O as his model of a deep interface that has hidden decades of storage changes from programs.",
      quiz: [
        { q: "Which change makes a module deeper?", options: ["Splitting it into three classes with the same total interface", "Hiding a configuration choice behind a sensible default", "Adding a boolean flag for each internal step"], answer: 1, explain: "A good default removes something callers had to know, shrinking the interface without losing functionality." },
        { q: "What is the risk of many tiny pass-through classes?", options: ["They add interface without adding functionality, increasing total complexity", "They make the program slower to compile", "They cannot be tested"], answer: 0, explain: "Pass-through layers make callers learn more names while hiding nothing." },
      ],
      think: "Which internal API at work do people keep calling wrongly? What could it hide instead?",
      deeper: [
        { t: "A Philosophy of Software Design (book page)", url: "https://web.stanford.edu/~ouster/cgi-bin/book.php" },
        { t: "Information hiding (Wikipedia)", url: "https://en.wikipedia.org/wiki/Information_hiding" },
      ],
    },
    {
      id: "testing-shapes-contracts", topic: "craft", level: 2, minutes: 6,
      title: "Pyramid, trophy and contract tests",
      hook: "The best test suite is the one that lets you change code confidently, not the one with the highest coverage.",
      body: [
        "Mike Cohn’s test pyramid (popularised around 2009) says: many fast unit tests, fewer integration tests, very few slow end-to-end tests. The logic is cost: unit tests are cheap to run and pinpoint failures; end-to-end tests are slow and flaky.",
        "Kent C. Dodds’ ‘testing trophy’ pushes back for front-end and app code: put most effort into integration tests, because they test how pieces really work together, with static types and linting as the base. Both shapes agree on the key point: test behaviour through stable interfaces, not implementation details.",
        "In service architectures, the painful gap is between teams. Shared end-to-end environments become slow and nobody owns them. Consumer-driven contract tests fill that gap: the consumer records what it expects (request shapes, response fields), and the provider runs those expectations in its own pipeline.",
        "Worked example: the mobile backend relies on the orders service returning ‘status’. The orders team renames it to ‘state’. Their pipeline runs the backend’s contract, fails before merge, and the rename becomes a versioned, additive change instead of a 2am page.",
      ],
      points: [
        "Pyramid and trophy are about cost and confidence, not dogma.",
        "Test through stable interfaces so refactoring doesn’t break tests.",
        "Contract tests catch cross-team breaks without a shared end-to-end environment.",
      ],
      example: "Martin Fowler’s site hosts Ham Vocke’s ‘The Practical Test Pyramid’, a widely used guide that walks through unit, contract and UI tests for a real Spring Boot service.",
      quiz: [
        { q: "Where does a consumer-driven contract test run?", options: ["In the provider’s pipeline, checking the consumer’s recorded expectations", "Only in a shared staging environment", "Only on the consumer’s laptop"], answer: 0, explain: "The provider verifies it still meets every consumer’s contract before it ships." },
        { q: "What do the pyramid and trophy agree on?", options: ["Coverage must be 100%", "End-to-end tests should dominate", "Test behaviour through stable interfaces rather than internals"], answer: 2, explain: "Both aim for confidence at reasonable cost, and tests tied to internals break on every refactor." },
      ],
      think: "Which of your tests most often fails for reasons that aren’t real bugs? What shape would replace it?",
      deeper: [
        { t: "The Practical Test Pyramid (martinfowler.com)", url: "https://martinfowler.com/articles/practical-test-pyramid.html" },
        { t: "Contract Test (martinfowler.com)", url: "https://martinfowler.com/bliki/ContractTest.html" },
        { t: "Write tests. Not too many. Mostly integration. (Kent C. Dodds)", url: "https://kentcdodds.com/blog/write-tests" },
      ],
    },
    {
      id: "legacy-seams", topic: "craft", level: 3, minutes: 6,
      title: "Changing code nobody understands",
      hook: "Michael Feathers defines legacy code simply: code without tests.",
      body: [
        "In Working Effectively with Legacy Code (2004), Michael Feathers argues that the danger of old code isn’t age, it’s that you can’t tell whether a change broke something. His answer is to get a safety net in place first, even a crude one.",
        "Characterization tests record what the code does today, not what it should do. You call it with real-ish inputs and assert on whatever comes out, bugs included. They are a snapshot of behaviour, so any change you make that alters output shows up immediately.",
        "To test code that talks to databases, clocks or networks, you need a seam: a place where you can change behaviour without editing the code there. Passing a dependency in as a parameter, or extracting a small interface, are common seams.",
        "Worked example: a 900-line pricing function reads the current date directly. You extract a ‘now’ parameter (a seam), write 30 characterization tests from production-like orders, then refactor in small commits. One test reveals a leap-year bug: you keep the behaviour, file a ticket, and fix it separately so refactor and behaviour change never mix.",
      ],
      points: [
        "Get a safety net first: characterization tests capture current behaviour.",
        "Create seams so hard dependencies can be swapped in tests.",
        "Keep refactoring commits separate from behaviour changes.",
      ],
      example: "Feathers’ book became a standard reference precisely because most real work is on existing code; its seam and characterization-test techniques are still taught two decades on.",
      quiz: [
        { q: "A characterization test fails after your refactor. What does that tell you?", options: ["The old code was wrong", "Your change altered existing behaviour, intended or not", "The test should be deleted"], answer: 1, explain: "Characterization tests pin current behaviour, so a failure means behaviour changed." },
        { q: "Why separate refactoring from bug fixes?", options: ["Reviewers can verify a pure refactor changes nothing, and a fix stands alone if it needs reverting", "It is required by Git", "Bug fixes are always slower"], answer: 0, explain: "Mixed commits make it impossible to tell which change caused which effect." },
      ],
      think: "Which file at work does everyone avoid? What is the smallest seam that would let you test it?",
      deeper: [
        { t: "Characterization test (Wikipedia)", url: "https://en.wikipedia.org/wiki/Characterization_test" },
        { t: "Refactoring (martinfowler.com)", url: "https://martinfowler.com/books/refactoring.html" },
      ],
    },

    // ───────────── ops ─────────────
    {
      id: "slos-error-budgets", topic: "ops", level: 1, minutes: 6,
      title: "SLIs, SLOs and error budgets",
      hook: "100% reliability is the wrong target for almost everything.",
      body: [
        "An SLI (service level indicator) is a measurement of what users experience, usually a ratio: good events over total events. For example, the share of requests that succeed in under 300 milliseconds. An SLO (service level objective) is the target for that ratio over a window, such as 99.9% over 28 days. An SLA is a contract with penalties, and should be looser than the SLO.",
        "Google’s SRE book makes the key point: users can’t tell the difference between 99.99% and 100% because their own phone and network fail more often than that. Chasing extra nines costs a lot and slows everything else.",
        "The error budget is what the SLO leaves over: at 99.9%, 0.1% of requests may fail. While budget remains, ship freely. When it is spent, the team shifts to reliability work. This turns arguments between product and ops into a shared, numeric rule.",
        "Worked example: 10 million requests a month at 99.9% allows 10,000 bad ones. A bad deploy burns 6,000 in an hour. Burn-rate alerts fire because at that pace the month’s budget would be gone in under two hours, long before a simple error-rate threshold would look alarming.",
      ],
      points: [
        "SLIs measure user experience; SLOs set the target; SLAs are contracts.",
        "The error budget makes the speed versus reliability trade-off explicit.",
        "Alert on how fast the budget is burning, not on every spike.",
      ],
      example: "Google’s Site Reliability Engineering book (2016) introduced error budgets to the wider industry, describing them as a way to align product teams and SREs without negotiating every launch.",
      quiz: [
        { q: "Which is the best SLI for a checkout API?", options: ["CPU usage of the checkout servers", "Number of deploys per week", "Share of checkout requests that succeed within 500 ms"], answer: 2, explain: "SLIs should reflect what users experience, not internal resource metrics." },
        { q: "The error budget is exhausted halfway through the month. What does a typical policy say?", options: ["Pause risky launches and prioritise reliability until the budget recovers", "Raise the SLO", "Ignore it until next month"], answer: 0, explain: "Spending the budget is the signal to rebalance towards reliability." },
      ],
      think: "If your users could vote, which one journey would they want an SLO on first?",
      deeper: [
        { t: "Service Level Objectives (Google SRE book)", url: "https://sre.google/sre-book/service-level-objectives/" },
        { t: "Alerting on SLOs (Google SRE workbook)", url: "https://sre.google/workbook/alerting-on-slos/" },
        { t: "Example error budget policy (Google SRE workbook)", url: "https://sre.google/workbook/error-budget-policy/" },
      ],
    },
    {
      id: "observability-vs-monitoring", topic: "ops", level: 2, minutes: 6,
      title: "Observability versus monitoring",
      hook: "Monitoring answers the questions you thought of in advance. Observability helps with the ones you didn’t.",
      body: [
        "Monitoring watches known failure modes: is CPU high, is the error rate up, is the disk full. Dashboards and threshold alerts are monitoring. They work well for problems you have seen before.",
        "Observability, a term borrowed from control theory, is about whether you can explain any internal state from the outside, including new failures. In practice that means rich, high-cardinality events: each request carries fields like customer ID, build version, region and feature flags, so you can slice by anything.",
        "The usual signals are metrics (cheap aggregates), logs (detailed events) and traces (one request’s path across services). OpenTelemetry has become the common, vendor-neutral way to emit all three. The real goal is connecting them, so a slow metric leads you to the exact traces and their attributes.",
        "Worked example: p99 latency doubles, but averages look fine. Grouping slow requests by attributes shows they are all from one large customer, on build 4.12, hitting a new code path behind a flag. No dashboard had that combination, yet a wide event answered it in minutes.",
      ],
      points: [
        "Monitoring covers known unknowns; observability helps with unknown unknowns.",
        "High-cardinality fields (user, build, flag) are what make slicing possible.",
        "Instrument once with open standards and connect metrics, logs and traces.",
      ],
      example: "Charity Majors and Honeycomb did much to popularise ‘observability’ in software in the late 2010s, arguing for wide structured events over pre-aggregated metrics alone.",
      quiz: [
        { q: "Why do averages hide problems?", options: ["Averages are computed incorrectly", "A small slow group can be swamped by many fast requests; percentiles and slicing reveal it", "Averages only count errors"], answer: 1, explain: "Tail latency (p99) and per-attribute breakdowns show what averages smooth away." },
        { q: "What does a distributed trace show?", options: ["One request’s path and timing across services", "Total CPU across the fleet", "The list of deploys this week"], answer: 0, explain: "Traces link spans from each service a request touched, with timings." },
      ],
      think: "Think of your last confusing incident. Which single field on your events would have shortened it most?",
      deeper: [
        { t: "Monitoring distributed systems (Google SRE book)", url: "https://sre.google/sre-book/monitoring-distributed-systems/" },
        { t: "Observability (software) (Wikipedia)", url: "https://en.wikipedia.org/wiki/Observability_(software)" },
        { t: "OpenTelemetry", url: "https://opentelemetry.io/" },
      ],
    },
    {
      id: "overload-backpressure", topic: "ops", level: 3, minutes: 7,
      title: "Backpressure, load shedding and cascading failure",
      hook: "Many big outages start small and are made huge by the system’s own reaction.",
      body: [
        "A cascading failure is when one overloaded part pushes its load onto others until they fall too. Common amplifiers: retries at every layer, unbounded queues that hide growing delay, and failover that moves all traffic to replicas already near capacity.",
        "Backpressure means a slow consumer tells producers to slow down, for example via bounded queues or flow control, instead of silently buffering. A queue that can grow forever turns an overload into minutes of latency for every request, including ones nobody is waiting for any more.",
        "Load shedding means refusing some work early and cheaply, with a fast error, so the rest succeeds. It beats trying everything and timing out on everything. Shed low-priority traffic first, drop requests whose deadline has already passed, and put retry budgets in clients so retries stay a small fraction of traffic.",
        "Worked example: a database slows, API threads block, health checks time out, the load balancer removes ‘unhealthy’ hosts, and the survivors get more load. Fixes: health checks that test only the host itself, deadlines passed between services, a circuit breaker on the database client, and shedding at the edge.",
      ],
      points: [
        "Retries, unbounded queues and naive failover amplify overload.",
        "Bounded queues and backpressure keep delay visible and limited.",
        "Fail fast and cheaply for some requests so the rest can succeed.",
      ],
      example: "Google’s SRE book has a full chapter on cascading failures, and Amazon’s Builders’ Library explains how Amazon services shed load and avoid insurmountable queue backlogs.",
      quiz: [
        { q: "Why are unbounded queues dangerous under overload?", options: ["They let delay grow without limit, so work is done long after callers gave up", "They lose messages", "They use too little memory"], answer: 0, explain: "Queued work that has timed out upstream is wasted effort that delays live requests." },
        { q: "What does a retry budget do?", options: ["Guarantees every request eventually succeeds", "Increases timeouts automatically", "Caps retries to a small fraction of normal traffic so they can’t multiply load"], answer: 2, explain: "Budgets stop retries from turning a partial failure into a full one." },
      ],
      think: "What happens in your system if a key dependency gets ten times slower but doesn’t fail outright?",
      deeper: [
        { t: "Addressing cascading failures (Google SRE book)", url: "https://sre.google/sre-book/addressing-cascading-failures/" },
        { t: "Using load shedding to avoid overload (Amazon Builders’ Library)", url: "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/" },
        { t: "Avoiding insurmountable queue backlogs (Amazon Builders’ Library)", url: "https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/" },
      ],
    },

    // ───────────── delivery ─────────────
    {
      id: "flags-progressive-delivery", topic: "delivery", level: 1, minutes: 5,
      title: "Feature flags and progressive delivery",
      hook: "Deploying and releasing are two different things. Treating them as one is where a lot of outages come from.",
      body: [
        "A deploy puts code on servers. A release exposes behaviour to users. Feature flags split the two: code ships dark, then you turn it on for staff, then 1% of users, then 10%, watching metrics at each step.",
        "Progressive delivery extends the idea to infrastructure: canary releases send a small share of traffic to the new version and compare its error rate and latency with the old one. If the canary looks worse, roll back automatically before most users notice.",
        "Flags have costs. Each one doubles the paths through that code. Martin Fowler’s site (Pete Hodgson’s article) separates release toggles, which should be short-lived, from ops, experiment and permission toggles, which can live longer. Old release flags are debt: give each an owner and an expiry date.",
        "Worked example: a new search ranker ships behind a flag at 1% for a week. Click-through is flat but p99 latency rises 40 ms. The team fixes a slow query, ramps to 50%, then 100%, then deletes the flag and the old code in the next sprint.",
      ],
      points: [
        "Separate deploy from release so you can turn things off without redeploying.",
        "Ramp gradually and compare against a control at each step.",
        "Remove release flags once rolled out; old flags are hidden risk.",
      ],
      example: "In August 2012 Knight Capital lost about $440 million in 45 minutes after new code was not deployed to one of eight servers and a repurposed flag woke up old, unused trading logic there (SEC findings, 2013).",
      quiz: [
        { q: "What is a canary release?", options: ["Releasing on a Friday", "Sending a small share of traffic to a new version and comparing it with the old one", "A release with no tests"], answer: 1, explain: "Like the canary in a coal mine, a small exposure warns you before everyone is affected." },
        { q: "Which flag should usually be the shortest-lived?", options: ["A release toggle for a new feature", "A permission toggle for paid plans", "An ops kill switch"], answer: 0, explain: "Release toggles exist only for the rollout and should be deleted after it." },
      ],
      think: "How many feature flags in your codebase are older than six months? Who owns them?",
      deeper: [
        { t: "Feature Toggles (martinfowler.com)", url: "https://martinfowler.com/articles/feature-toggles.html" },
        { t: "Knight Capital Group (Wikipedia)", url: "https://en.wikipedia.org/wiki/Knight_Capital_Group" },
      ],
    },
    {
      id: "estimation-spikes", topic: "delivery", level: 2, minutes: 6,
      title: "Estimates as ranges, risk as a to-do list",
      hook: "‘Two weeks’ is a guess wearing a suit. ‘One to four weeks, mostly depending on the auth API’ is useful.",
      body: [
        "Single-number estimates hide uncertainty, and people anchor on them. A range with a confidence level, such as ‘80% sure it’s 2 to 5 weeks’, is more honest and helps planners. Say what would narrow the range.",
        "The cone of uncertainty describes how estimates are widest at the start of a project and narrow as unknowns are resolved. So the job early on isn’t to estimate harder; it is to resolve the biggest unknowns first.",
        "List the risks explicitly: technical (will the library scale?), dependency (will team X deliver?), and product (do users want it?). Then attack the riskiest first with a spike, a short, time-boxed experiment whose output is knowledge, not production code.",
        "Worked example: a migration estimate is ‘3 to 12 weeks’. The spread comes from not knowing if the old data has invalid rows. A two-day spike samples a million rows, finds 0.3% are bad and how to fix them, and the estimate tightens to ‘5 to 7 weeks’. Two days bought a far better plan.",
      ],
      points: [
        "Give ranges and say what drives the spread.",
        "Front-load the riskiest unknowns rather than the easiest work.",
        "Spikes are time-boxed and produce answers, not shippable code.",
      ],
      example: "Fred Brooks’ The Mythical Man-Month (1975), drawn from IBM’s OS/360 project, gave us Brooks’s law: adding people to a late software project makes it later.",
      quiz: [
        { q: "What should a spike produce?", options: ["Production-ready code", "A full design doc", "An answer to a specific question that reduces risk"], answer: 2, explain: "A spike buys information. Its code is usually thrown away." },
        { q: "Why tackle the riskiest part first?", options: ["If it fails, you learn early and cheaply, and your estimate narrows fastest", "It is usually the most fun", "It is always the smallest"], answer: 0, explain: "Resolving the big unknown first shrinks the range and avoids late surprises." },
      ],
      think: "What is the single biggest unknown in your current project, and what is the cheapest experiment that would answer it?",
      deeper: [
        { t: "Cone of Uncertainty (Wikipedia)", url: "https://en.wikipedia.org/wiki/Cone_of_Uncertainty" },
        { t: "Spike (software development) (Wikipedia)", url: "https://en.wikipedia.org/wiki/Spike_(software_development)" },
        { t: "Brooks’s law (Wikipedia)", url: "https://en.wikipedia.org/wiki/Brooks%27s_law" },
      ],
    },
    {
      id: "strangler-fig", topic: "delivery", level: 3, minutes: 7,
      title: "Strangler fig migrations",
      hook: "The riskiest sentence in engineering may be ‘let’s just rewrite it’.",
      body: [
        "Martin Fowler named the strangler fig pattern in 2004 after a vine that grows around a host tree until it can stand on its own. Instead of a big-bang rewrite, you put a facade (a proxy or router) in front of the old system and move behaviour to new components one slice at a time.",
        "Each slice is a small, reversible project: route one endpoint, one customer segment or one event type to the new code, compare results, then shift traffic. The old system shrinks until it can be switched off. Value arrives early, and you can stop half-way without wasting everything.",
        "Useful companions: shadow traffic (send real requests to the new path and compare, without using its answers), dual writes or change-data capture to keep data in sync, and a clear ‘done’ definition, including deleting the old code. Migrations that stall at 80% leave you running two systems forever.",
        "Worked example: a monolith’s invoicing moves out. Week 1, a router sends all invoice reads through a facade. Week 3, 5% of reads go to the new service, compared in shadow first. Week 8, writes move per region. Week 12, the old tables are archived and the code deleted, with an ADR recording why.",
      ],
      points: [
        "Put a facade in front, then move behaviour slice by slice.",
        "Make every step reversible and verified (shadowing, comparison).",
        "Plan the finish: decommissioning is part of the project.",
      ],
      example: "Healthcare.gov’s troubled 2013 launch is often cited as the cost of a big-bang cutover, while Shopify’s public writing (2019 onward) describes incrementally modularising its Rails monolith rather than rewriting it into microservices.",
      quiz: [
        { q: "What is the role of the facade in a strangler fig migration?", options: ["To store backups", "To route each request to the old or new implementation", "To replace the database"], answer: 1, explain: "The facade lets you shift traffic gradually and roll back per slice." },
        { q: "What commonly goes wrong in the last stage?", options: ["The migration stalls and both systems run indefinitely", "The new system is too fast", "Users notice the facade"], answer: 0, explain: "The long tail of edge cases makes the old system hard to delete unless finishing is planned and funded." },
      ],
      think: "Is there a half-finished migration where you work? What would it take to finish or formally stop it?",
      deeper: [
        { t: "Strangler Fig Application (martinfowler.com)", url: "https://martinfowler.com/bliki/StranglerFigApplication.html" },
      ],
    },

    // ───────────── writing ─────────────
    {
      id: "bluf-executives", topic: "writing", level: 1, minutes: 5,
      title: "Writing for executives: bottom line up front",
      hook: "Most senior readers decide from the first two sentences. Make them count.",
      body: [
        "BLUF, ‘bottom line up front’, comes from US military writing: state the conclusion or request first, then the supporting detail. Engineers are trained to build up to a conclusion, which is the exact opposite of how busy people read.",
        "A useful shape: the ask (what you need, by when), the why (one or two sentences on impact), the options you considered, and then the details for anyone who wants them. If they read only the first paragraph, they should still be able to act.",
        "Speak in their units. An executive weighs money, risk, time and customers. ‘p99 latency is 900 ms’ becomes ‘one in a hundred checkouts takes nearly a second, which our tests linked to lower conversion’. Keep the technical detail, just lower down.",
        "Worked example. Before: ‘Over the past quarter we investigated our queueing layer and found…’ (the ask is in paragraph four). After: ‘Decision needed by Friday: approve 6 engineer-weeks to replace our queue. Without it, we expect to miss the Q3 holiday traffic target. Options and data below.’",
      ],
      points: [
        "Lead with the ask or conclusion and the deadline.",
        "Translate technical facts into money, risk, time or customers.",
        "Structure so a reader who stops early can still act.",
      ],
      example: "Amazon replaced slide decks in senior meetings with narrative memos, famously six pages, read silently at the start of the meeting, after Jeff Bezos banned PowerPoint there in 2004.",
      quiz: [
        { q: "Where should the decision you need go in an email to a VP?", options: ["In the first sentence or two", "After the background section", "In an attachment"], answer: 0, explain: "BLUF puts the action at the top so it isn’t missed." },
        { q: "Which framing suits an executive best?", options: ["‘Our Kafka consumer lag is 40k’", "‘We need to tune partitions’", "‘Orders are confirmed up to 10 minutes late at peak, and support tickets doubled last week’"], answer: 2, explain: "It states the effect in customer and business terms, with the technical cause available below." },
      ],
      think: "Pick an email you sent this month. Could someone act on it from the first two lines?",
      deeper: [
        { t: "BLUF (communication) (Wikipedia)", url: "https://en.wikipedia.org/wiki/BLUF_(communication)" },
      ],
    },
    {
      id: "design-docs-adrs", topic: "writing", level: 2, minutes: 6,
      title: "Design docs and ADRs that people actually read",
      hook: "A design doc’s main job isn’t to describe the design. It’s to surface disagreement while it’s still cheap.",
      body: [
        "A good design doc answers: what problem, for whom, and why now; goals and explicit non-goals; the proposed design at a useful level; alternatives considered and why rejected; risks, rollout and how you’ll know it worked. Non-goals and alternatives are where reviewers find the real questions.",
        "Keep it as short as the decision allows. Write for the sceptical reader from another team. Put diagrams where words get tangled, and name open questions instead of hiding them.",
        "Architecture Decision Records, described by Michael Nygard in 2011, capture one decision each: context, decision, status and consequences. They are short, numbered and stored with the code. When a decision changes, you write a new ADR that supersedes the old one rather than editing history.",
        "Worked example: ‘ADR-014: Use Postgres for the ledger. Context: we need multi-row transactions and the team knows Postgres. Decision: Postgres 16 on our managed service. Consequences: we accept vertical scaling limits for about two years; revisit at 5,000 writes per second.’ A newcomer learns the why in thirty seconds.",
      ],
      points: [
        "Goals, non-goals and alternatives are the heart of a design doc.",
        "ADRs record one decision with its context and consequences.",
        "Supersede old ADRs; don’t rewrite history.",
      ],
      example: "Google’s design-doc culture, described by Malte Ubl in ‘Design Docs at Google’, uses docs mainly to catch design problems early and build consensus before code is written.",
      quiz: [
        { q: "Why include non-goals?", options: ["To make the doc longer", "To prevent scope creep and clarify what reviewers shouldn’t expect", "Because templates require them"], answer: 1, explain: "Non-goals draw the boundary and head off ‘but what about…’ debates." },
        { q: "A past ADR is no longer right. What do you do?", options: ["Write a new ADR that supersedes it and mark the old one as superseded", "Edit it in place", "Delete it"], answer: 0, explain: "Keeping the old record preserves why things were once done that way." },
      ],
      think: "Which decision in your system do newcomers ask ‘why?’ about most? Could you write its ADR in ten minutes?",
      deeper: [
        { t: "Documenting Architecture Decisions (Michael Nygard)", url: "https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions" },
        { t: "Design Docs at Google (Malte Ubl)", url: "https://www.industrialempathy.com/posts/design-docs-at-google/" },
        { t: "Architectural Decision Records", url: "https://adr.github.io/" },
      ],
    },
    {
      id: "blameless-postmortems", topic: "writing", level: 3, minutes: 7,
      title: "Blameless postmortems that change things",
      hook: "‘Human error’ is where a good investigation starts, not where it ends.",
      body: [
        "A postmortem is a written account of an incident: impact, timeline, contributing factors and actions. ‘Blameless’ means you assume people acted reasonably given what they knew and the tools they had. The question is not ‘who messed up?’ but ‘why did doing this seem right, and why did the system let it cause harm?’",
        "Blame makes people hide information, and you need every detail. Safety researchers such as Sidney Dekker and John Allspaw (who brought blameless postmortems to Etsy) argue that complex failures rarely have a single root cause; they have several contributing factors that lined up.",
        "Good postmortems separate what happened from what you learned. Actions should be few, owned and dated, and should change the system: a guardrail, a safer default, an alert. ‘Be more careful’ is not an action.",
        "Worked example: an engineer deletes a production table thinking she is on staging. Blameful version: ‘Engineer error, retrain.’ Blameless version: staging and production prompts look identical, credentials allow destructive commands without confirmation, and backups were never restore-tested. Three systemic fixes come out of one mistake.",
      ],
      points: [
        "Ask why the action made sense at the time, not who to blame.",
        "Look for several contributing factors, not one root cause.",
        "Actions must change the system, with an owner and a date.",
      ],
      example: "On 28 February 2017, a mistyped command during debugging removed more Amazon S3 servers than intended in us-east-1, disrupting many websites; AWS’s public summary focused on adding safeguards to the tool rather than on the individual.",
      quiz: [
        { q: "Which is a good postmortem action?", options: ["Remind the team to be careful", "Find out who ran the command", "Add a confirmation and a minimum-capacity check to the removal tool, owned by Priya, due 15 March"], answer: 2, explain: "It changes the system, and has an owner and a date." },
        { q: "Why are blameless reviews more effective?", options: ["People share the full, honest story when they don’t fear punishment", "They are shorter", "They avoid writing actions"], answer: 0, explain: "Accurate detail is what reveals the systemic causes." },
      ],
      think: "In your last incident, what made the risky action look reasonable at the time?",
      deeper: [
        { t: "Postmortem culture: learning from failure (Google SRE book)", url: "https://sre.google/sre-book/postmortem-culture/" },
        { t: "Summary of the Amazon S3 service disruption (AWS, 2017)", url: "https://aws.amazon.com/message/41926/" },
      ],
    },

    // ───────────── influence ─────────────
    {
      id: "glue-work", topic: "influence", level: 1, minutes: 5,
      title: "Glue work: necessary, valuable, and easy to miss",
      hook: "The person who notices the gap between two teams is often the one doing the most important work, and getting the least credit.",
      body: [
        "In her 2019 talk and essay ‘Being Glue’, Tanya Reilly describes glue work: onboarding people, spotting that two teams are building the same thing, writing the missing doc, chasing the dependency nobody owns. Projects fail without it.",
        "The trap is that glue work often isn’t what promotion criteria reward at junior and senior levels, which tend to count code and features. Reilly noted it is disproportionately done by women and under-represented engineers, who may be nudged towards it and then judged as ‘not technical enough’.",
        "At staff level, glue work becomes core to the job, but only when it is deliberate, scoped and visible. The fix is not to stop doing it, but to talk with your manager about which glue matters, make it part of your goals, and write down its impact.",
        "Worked example: instead of quietly running every cross-team sync, an engineer proposes ‘I’ll own the integration plan for the payments launch this quarter’, writes a one-page plan, and reports outcomes: two teams de-duplicated, launch three weeks earlier. Same work, now legible.",
      ],
      points: [
        "Glue work is real engineering leadership, not a side task.",
        "Make it deliberate: agree on it with your manager and tie it to goals.",
        "Record outcomes so the work is visible at review time.",
      ],
      example: "Tanya Reilly gave ‘Being Glue’ as a talk in 2019 and later expanded these ideas in her book The Staff Engineer’s Path (2022).",
      quiz: [
        { q: "What is the main risk of glue work?", options: ["It is unnecessary", "It can go unrecognised in promotion criteria if it isn’t made visible", "It is always assigned to managers"], answer: 1, explain: "The work matters, but the system may not see it unless it’s deliberate and documented." },
        { q: "What is the best response if you do a lot of glue work?", options: ["Agree with your manager on which parts matter, own them explicitly and record impact", "Stop all of it immediately", "Do it secretly"], answer: 0, explain: "Turning invisible work into scoped, owned work makes it count." },
      ],
      think: "List the glue work you did last month. Which parts would you want named in your next review?",
      deeper: [
        { t: "Being Glue (Tanya Reilly)", url: "https://noidea.dog/glue" },
      ],
    },
    {
      id: "staff-archetypes", topic: "influence", level: 2, minutes: 6,
      title: "What staff engineers actually do",
      hook: "There isn’t one staff engineer job. There are at least four.",
      body: [
        "Will Larson’s Staff Engineer (2021) and the staffeng.com interviews describe four common archetypes. The Tech Lead guides one team’s approach and execution. The Architect owns direction and quality across a critical area. The Solver goes deep on one hard problem after another. The Right Hand extends an executive’s reach across an organisation.",
        "Each has a different day. A Tech Lead spends much time on planning, reviews and unblocking. An Architect writes strategy and reviews designs across teams. A Solver might spend months on a performance crisis. Knowing which one your company needs, and which suits you, makes the path much clearer.",
        "Common threads across all four: setting technical direction, mentoring and sponsoring, and providing engineering perspective to leadership. Larson also stresses working on what matters: avoid snacking on easy, low-impact tasks, and don’t only chase prestige projects either.",
        "Worked example: a senior engineer who keeps fixing other teams’ worst production fires has a Solver pattern. Framing her promo case around three hard problems solved, their business impact, and how she left each team stronger is much clearer than ‘I helped lots of teams’.",
      ],
      points: [
        "Common archetypes: Tech Lead, Architect, Solver, Right Hand.",
        "Pick the archetype your org needs and that fits you.",
        "Staff work is judged on impact and direction, not output volume.",
      ],
      example: "Will Larson collected interviews with staff-plus engineers at companies such as Stripe, Slack and Dropbox on staffeng.com, and his archetypes are now widely used in career ladders.",
      quiz: [
        { q: "Which archetype focuses on one hard, often cross-cutting problem at a time?", options: ["Solver", "Tech Lead", "Right Hand"], answer: 0, explain: "Solvers go deep on difficult problems wherever the organisation needs them." },
        { q: "What does Larson mean by ‘snacking’?", options: ["Taking regular breaks", "Picking only high-risk projects", "Doing easy, low-impact work because it feels productive"], answer: 2, explain: "Snacking feels good but rarely moves important outcomes." },
      ],
      think: "Which archetype do you naturally drift towards, and which one does your organisation most lack?",
      deeper: [
        { t: "Staff archetypes (staffeng.com)", url: "https://staffeng.com/guides/staff-archetypes/" },
        { t: "Work on what matters (staffeng.com)", url: "https://staffeng.com/guides/work-on-what-matters/" },
      ],
    },
    {
      id: "sponsorship-promo-case", topic: "influence", level: 3, minutes: 7,
      title: "Sponsorship and making your promotion case",
      hook: "Promotions are decided in rooms you aren’t in. Who is speaking for you there?",
      body: [
        "Mentors give you advice. Sponsors spend their own credibility on you: they recommend you for a key project, put your name forward when leaders ask ‘who could own this?’, and argue for you in calibration. Research by Sylvia Ann Hewlett and others found women and people of colour are often over-mentored and under-sponsored.",
        "You can make sponsorship easier. Make your work legible to people a level or two up. Tell your manager and skip-level what you are aiming for. Ask directly: ‘I’m working towards staff. What would you need to see to back that?’",
        "A strong promo case reads like evidence, not a diary. For each major piece of work: the problem and why it mattered, what you specifically did (decisions, influence, not just tasks), the measurable outcome, and how it shows the next level’s expectations. Keep a running ‘brag document’ so you aren’t reconstructing a year from memory.",
        "Worked example. Weak: ‘Worked on the search migration.’ Strong: ‘Proposed and led the search migration across three teams; wrote the design and rollout plan; cut p99 latency from 1.2 s to 300 ms and infra cost by about 20%; mentored two engineers who now own the system.’ Then sponsor others the same way.",
      ],
      points: [
        "Mentors advise; sponsors advocate and take risks on you.",
        "Tell decision-makers your goal and ask what evidence they need.",
        "Write your case as problem, your role, outcome, level signal.",
      ],
      example: "Julia Evans’ widely shared post ‘Get your work recognized: write a brag document’ (2019) popularised the habit of keeping a running record of your impact.",
      quiz: [
        { q: "Which is sponsorship?", options: ["Advising on how to handle a hard meeting", "Recommending someone by name to lead a high-visibility project", "Pairing on a tricky bug"], answer: 1, explain: "Sponsorship is active advocacy that opens doors, using the sponsor’s own credibility." },
        { q: "What should each item in a promo case show?", options: ["Problem, your specific contribution, measurable outcome and how it maps to the next level", "Hours worked", "Every ticket closed"], answer: 0, explain: "Committees need evidence of impact at the target level, not activity." },
      ],
      think: "Who in your organisation would speak for you today? Who are you sponsoring?",
      deeper: [
        { t: "Get your work recognized: write a brag document (Julia Evans)", url: "https://jvns.ca/blog/brag-documents/" },
      ],
    },

    // ───────────── product ─────────────
    {
      id: "outcomes-over-outputs", topic: "product", level: 1, minutes: 5,
      title: "Outcomes over outputs",
      hook: "You can ship every item on the roadmap and still fail.",
      body: [
        "Outputs are things the team produces: features, endpoints, story points. Outcomes are changes in behaviour or results: more users finishing setup, fewer support tickets, faster time to first value. Staff engineers are expected to care about the second.",
        "A good outcome metric is close to user value, moves within weeks, and is something the team can actually influence. Pair it with a guardrail metric so you don’t win by causing harm elsewhere, such as raising sign-ups while increasing churn.",
        "Be wary of Goodhart’s law: when a measure becomes a target, it stops being a good measure. If ‘tickets closed’ is the goal, people split tickets. Review metrics regularly and look at the qualitative picture, such as user interviews and support threads.",
        "Worked example: the roadmap says ‘build bulk import’. Asking ‘what outcome?’ reveals the real goal is ‘new business customers active within a week’. Data shows most stall at inviting teammates, not importing data. A smaller invite change moves the metric more than bulk import would have.",
      ],
      points: [
        "Ask ‘what outcome?’ before ‘what feature?’.",
        "Pick a metric close to user value and add a guardrail.",
        "Watch for Goodhart’s law when metrics become targets.",
      ],
      example: "Amazon’s ‘working backwards’ process starts a product by writing the press release and FAQ for the finished thing, forcing teams to state the customer outcome before building.",
      quiz: [
        { q: "Which is a guardrail metric for a growth experiment?", options: ["Sign-ups", "Number of experiments run", "Unsubscribe or churn rate"], answer: 2, explain: "Guardrails catch harm the main metric might hide." },
        { q: "What does Goodhart’s law warn about?", options: ["A measure that becomes a target tends to get gamed and lose meaning", "Metrics are always wrong", "Only revenue matters"], answer: 0, explain: "People optimise the number, not the intent behind it." },
      ],
      think: "For your current project, what user behaviour should change if it succeeds? How would you know?",
      deeper: [
        { t: "Goodhart’s law (Wikipedia)", url: "https://en.wikipedia.org/wiki/Goodhart%27s_law" },
      ],
    },
    {
      id: "build-vs-buy", topic: "product", level: 2, minutes: 6,
      title: "Build, buy, or choose boring",
      hook: "The prototype takes a week. Owning it takes years.",
      body: [
        "Build versus buy starts with one question: does this differentiate us? If it is core to why customers choose you, owning it may be worth it. If it is plumbing every company needs, like auth, billing, feature flags or observability, buying usually wins.",
        "Compare total cost of ownership, not licence price against salary for a sprint. Building means on-call, security patches, upgrades, documentation, onboarding and the opportunity cost of what those engineers didn’t build. Buying means fees, lock-in, data residency and the vendor’s roadmap.",
        "Dan McKinley’s ‘Choose Boring Technology’ (2015) adds a useful idea: each team has a few ‘innovation tokens’. Spend them where novelty creates real advantage, and use well-understood tools everywhere else, because their failure modes are known.",
        "Worked example: a team wants its own job scheduler. The scoring: not differentiating; about two engineers part-time forever; a managed service costs a fraction of that and meets the needs. They buy, but wrap it behind a thin internal interface so switching later is a contained change.",
      ],
      points: [
        "Build what differentiates you; buy commodity plumbing.",
        "Compare total cost of ownership over years, including opportunity cost.",
        "Spend ‘innovation tokens’ sparingly; boring tech fails in known ways.",
      ],
      example: "Dropbox moved most user data off Amazon S3 to its own storage system, Magic Pocket, around 2016, a ‘build’ that made sense at its scale and that its 2018 IPO filing credited with large infrastructure savings.",
      quiz: [
        { q: "Which is usually the strongest reason to build?", options: ["The team wants to learn a new language", "The capability is core to your competitive advantage", "The vendor’s logo is unappealing"], answer: 1, explain: "Differentiation justifies the long-term cost of ownership." },
        { q: "What does an ‘innovation token’ represent?", options: ["A budget for new, unproven technology choices", "A cloud credit", "A bonus for shipping fast"], answer: 0, explain: "Each novel choice costs learning and operational risk, so spend them where it matters." },
      ],
      think: "What did your team build that it should have bought, or bought that it should have built?",
      deeper: [
        { t: "Choose Boring Technology (Dan McKinley)", url: "https://boringtechnology.club/" },
        { t: "Make-or-buy decision (Wikipedia)", url: "https://en.wikipedia.org/wiki/Make-or-buy_decision" },
      ],
    },
    {
      id: "cost-awareness", topic: "product", level: 3, minutes: 6,
      title: "Cost as an engineering metric",
      hook: "In the cloud, every architecture decision is also a pricing decision.",
      body: [
        "On owned hardware, cost was mostly fixed. In the cloud it is variable and tied directly to design: chatty services pay for data transfer, over-provisioned clusters pay for idle CPU, verbose logs pay per gigabyte. Staff engineers are expected to see that link.",
        "The most useful number is unit cost: cost per order, per active user or per thousand API calls. Total spend rising may be fine if the business grew faster. Unit cost rising is a design problem worth investigating.",
        "Common wins: right-size instances using real utilisation, set log retention and sampling, delete orphaned storage and snapshots, use reserved or committed pricing for steady load, and avoid cross-region or cross-zone traffic you don’t need. FinOps is the practice of making these trade-offs a shared, ongoing responsibility of engineering and finance.",
        "Worked example: a team notices cost per order up 30% in a quarter. Tagging shows debug-level logs left on after an incident, shipping terabytes a day. Lowering the level and sampling successful requests cuts the logging bill by more than half, with no loss in incident data.",
      ],
      points: [
        "Track unit cost, not just the total bill.",
        "Architecture choices (chattiness, regions, logs) drive spend.",
        "Tag resources so every cost has an owner.",
      ],
      example: "In 2023 Amazon Prime Video’s engineering team wrote that moving one monitoring service from a serverless, distributed design to a single process cut that service’s infrastructure cost by about 90%.",
      quiz: [
        { q: "Total cloud spend doubled while orders tripled. What happened to cost per order?", options: ["It went down", "It went up", "It stayed the same"], answer: 0, explain: "Spend grew slower than orders, so each order became cheaper." },
        { q: "Why tag cloud resources by team and service?", options: ["Tags make resources faster", "It is purely cosmetic", "So costs can be traced to owners who can act on them"], answer: 2, explain: "Untagged spend has no owner, so nobody optimises it." },
      ],
      think: "Do you know what one request to your service costs? How would you find out?",
      deeper: [
        { t: "AWS Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/" },
        { t: "FinOps Foundation", url: "https://www.finops.org/" },
      ],
    },

    // ───────────── ai ─────────────
    {
      id: "reviewing-ai-code", topic: "ai", level: 1, minutes: 5,
      title: "Reviewing AI-written code",
      hook: "AI makes writing code cheaper. It doesn’t make understanding it cheaper.",
      body: [
        "Coding assistants produce plausible code fast. Plausible is the risk: it looks right, compiles, and may pass the tests it also wrote. Your name is on the merge, so review it at least as carefully as a colleague’s, and more carefully in areas the model can’t see, like your production data or unwritten conventions.",
        "Known failure patterns: calls to functions or library options that don’t exist; ignoring error paths; duplicating a helper that already exists in the codebase; tests that assert the implementation instead of the requirement; and quietly broadening a change beyond what you asked.",
        "Practical habits: ask for small, focused changes; read the diff before the explanation; run it yourself; check that tests fail without the change; and look up any dependency it adds, since attackers register package names that models tend to invent.",
        "Worked example: an assistant ‘fixes’ a flaky test by adding a retry around it. CI goes green. Review shows the real bug is a race in the code under test, now hidden. Rejecting the patch and asking for a fix to the race is the senior call.",
      ],
      points: [
        "You own AI-written code exactly as if you typed it.",
        "Watch for invented APIs, missing error handling and self-confirming tests.",
        "Keep AI changes small enough to review properly.",
      ],
      example: "In 2023 a US federal judge sanctioned lawyers in Mata v. Avianca for filing a brief citing court cases that ChatGPT had invented, a vivid lesson in checking AI output before relying on it.",
      quiz: [
        { q: "An AI-written test passes. What should you check?", options: ["Nothing, it passed", "That it fails when the change is reverted, and that it tests the requirement", "Only its formatting"], answer: 1, explain: "A test that passes either way proves nothing." },
        { q: "Why verify any new dependency an assistant adds?", options: ["Models can suggest packages that don’t exist, and attackers may register those names", "Dependencies are always banned", "It slows the build"], answer: 0, explain: "Hallucinated package names are a known supply-chain risk." },
      ],
      think: "What review step do you skip most often on AI-generated changes?",
      deeper: [
        { t: "What to look for in a code review (Google eng-practices)", url: "https://google.github.io/eng-practices/review/reviewer/looking-for.html" },
        { t: "Hallucination (artificial intelligence) (Wikipedia)", url: "https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)" },
      ],
    },
    {
      id: "prompt-agent-basics", topic: "ai", level: 2, minutes: 7,
      title: "Prompt and agent design basics",
      hook: "Most ‘the model is dumb’ bugs are actually ‘the model wasn’t told’ bugs.",
      body: [
        "A prompt is a spec for a very literal, very fast contractor who has never seen your company. Give it the goal, the context it needs, the constraints, examples of good output, and the exact output format. Ambiguity you’d forgive in a colleague becomes random behaviour.",
        "Retrieval-augmented generation (RAG) fetches relevant documents and puts them in the prompt, so answers rest on your data rather than the model’s memory. Quality depends mostly on retrieval: wrong chunks in means confident wrong answers out.",
        "An agent is a model in a loop that can call tools, see results and decide the next step. Anthropic’s guidance (‘Building effective agents’, 2024) recommends starting with the simplest thing that works: a single call, then fixed workflows, and only then open-ended agents. Agents add cost, latency and new failure modes.",
        "Worked example: a support bot invents refund rules. Fixes: retrieve the actual policy and tell the model to answer only from it; give it a ‘hand off to a human’ tool; return structured output the app validates. Treat any text from users or documents as untrusted, since it can carry prompt injection.",
      ],
      points: [
        "Write prompts like specs: goal, context, constraints, examples, format.",
        "In RAG, retrieval quality usually decides answer quality.",
        "Start simple; add agent loops only when needed, and treat inputs as untrusted.",
      ],
      example: "In 2024 a Canadian tribunal ruled in Moffatt v. Air Canada that the airline was responsible for its website chatbot’s incorrect advice about bereavement fares.",
      quiz: [
        { q: "A RAG system gives wrong answers with confidence. What should you check first?", options: ["The colour scheme of the UI", "Whether the model is the newest one", "Whether the right documents are being retrieved"], answer: 2, explain: "If retrieval brings the wrong context, the model will reason from the wrong facts." },
        { q: "What is prompt injection?", options: ["Untrusted input containing instructions that try to override the system’s intended behaviour", "A way to make prompts shorter", "Adding examples to a prompt"], answer: 0, explain: "Any text the model reads, such as web pages, emails or documents, can carry hostile instructions." },
      ],
      think: "Where in your product would a simple, single LLM call do more good than an autonomous agent?",
      deeper: [
        { t: "Building effective agents (Anthropic)", url: "https://www.anthropic.com/research/building-effective-agents" },
        { t: "Retrieval-augmented generation (Wikipedia)", url: "https://en.wikipedia.org/wiki/Retrieval-augmented_generation" },
        { t: "Prompt injection (Wikipedia)", url: "https://en.wikipedia.org/wiki/Prompt_injection" },
      ],
    },
    {
      id: "llm-evals", topic: "ai", level: 3, minutes: 7,
      title: "Evaluating LLM features with evals",
      hook: "‘I tried a few prompts and it looked fine’ is the new ‘works on my machine’.",
      body: [
        "LLM features are probabilistic: the same input can give different outputs, and a change that fixes one case can break another. Evals are the test suite for this world: a set of inputs with a way to judge the outputs, run on every prompt, model or retrieval change.",
        "Build the eval set from reality. Start by reading real outputs and labelling failures, then group them into categories such as wrong facts, wrong format, unsafe, unhelpful. Include common cases, hard edge cases and past bugs. A few dozen well-chosen cases beat thousands of random ones at first.",
        "Grading options: exact or programmatic checks (valid JSON, contains the order ID) wherever possible; human review for nuance; and LLM-as-judge for scale, but only after checking the judge agrees with human labels on a sample. Track scores per category, not just one average.",
        "Worked example: switching to a cheaper model cuts cost 60%. The eval shows overall pass rate down only 2%, but the ‘refund policy’ category drops from 95% to 70%. The team routes refund questions to the stronger model and ships the rest, a decision impossible without the per-category view.",
      ],
      points: [
        "Evals are regression tests for non-deterministic systems.",
        "Build cases from real failures; categorise them.",
        "Prefer programmatic checks; validate any LLM judge against humans.",
      ],
      example: "Practitioners such as Hamel Husain have written widely read guides arguing that systematic error analysis and evals, rather than prompt tweaking, are what separate LLM products that improve from ones that stall.",
      quiz: [
        { q: "Why look at scores per category, not just the overall average?", options: ["Averages are slower to compute", "A big drop in one important category can hide inside a small change in the average", "Categories are required by law"], answer: 1, explain: "Per-category results show where a change helps or hurts." },
        { q: "Before trusting an LLM-as-judge, you should…", options: ["Check how often it agrees with human labels on a sample", "Use the largest model available", "Give it a higher temperature"], answer: 0, explain: "The judge is itself a model and needs validating like any other measurement." },
      ],
      think: "If you shipped an LLM feature tomorrow, what would the first ten eval cases be?",
      deeper: [
        { t: "Your AI product needs evals (Hamel Husain)", url: "https://hamel.dev/blog/posts/evals/" },
        { t: "Large language model (Wikipedia)", url: "https://en.wikipedia.org/wiki/Large_language_model" },
      ],
    },
  ],

  glossary: [
    { term: "Idempotent", aliases: ["idempotency", "idempotency key"], def: "An operation that has the same effect whether it runs once or many times. Makes retries safe." },
    { term: "Backpressure", aliases: ["back-pressure"], def: "A signal from a slow consumer telling producers to slow down, instead of buffering work without limit." },
    { term: "Load shedding", aliases: ["shed load"], def: "Deliberately rejecting some requests early and cheaply during overload so the rest can succeed." },
    { term: "Circuit breaker", aliases: ["circuit breakers"], def: "A client-side switch that stops calling a failing dependency for a while, failing fast instead of piling on." },
    { term: "Thundering herd", aliases: ["cache stampede", "stampede"], def: "Many clients doing the same expensive thing at once, such as refilling an expired cache key, overwhelming a backend." },
    { term: "SLI", aliases: ["service level indicator"], def: "A measurement of user experience, such as the share of requests served successfully within 300 ms." },
    { term: "SLO", aliases: ["service level objective", "SLOs"], def: "A target for an SLI over a time window, such as 99.9% over 28 days." },
    { term: "SLA", aliases: ["service level agreement"], def: "A contract promising a level of service, with penalties if missed. Usually looser than the internal SLO." },
    { term: "Error budget", aliases: ["error budgets"], def: "The amount of unreliability an SLO allows. While it remains, teams can ship; when spent, they focus on reliability." },
    { term: "p99", aliases: ["p95", "tail latency", "99th percentile"], def: "The value 99% of requests are faster than. Shows the slow experiences averages hide." },
    { term: "MTTR", aliases: ["mean time to recovery", "mean time to restore"], def: "Average time to restore service after an incident. One of the DORA delivery metrics (now often called failed deployment recovery time)." },
    { term: "Blast radius", aliases: [], def: "How much of a system or user base a failure or change can affect. Cells, canaries and flags shrink it." },
    { term: "Toil", aliases: [], def: "Manual, repetitive operational work that scales with traffic and has no lasting value. Google SRE aims to keep it under half of an SRE’s time." },
    { term: "Postmortem", aliases: ["post-mortem", "incident review", "blameless postmortem"], def: "A written review of an incident covering impact, timeline, contributing factors and actions, ideally without blame." },
    { term: "Observability", aliases: ["o11y"], def: "How well you can understand a system’s internal state, including new failures, from the data it emits." },
    { term: "OpenTelemetry", aliases: ["OTel"], def: "An open, vendor-neutral standard and toolkit for emitting traces, metrics and logs." },
    { term: "Chaos engineering", aliases: ["Chaos Monkey"], def: "Deliberately injecting failures in a controlled way to find weaknesses before they cause real outages. Popularised by Netflix." },
    { term: "Eventual consistency", aliases: ["eventually consistent"], def: "A guarantee that replicas will converge to the same value if no new writes arrive, with no promise about when." },
    { term: "Linearizability", aliases: ["linearizable", "strong consistency"], def: "The strongest common consistency model: the system behaves as if there is a single, up-to-date copy of the data." },
    { term: "CRDT", aliases: ["conflict-free replicated data type", "CRDTs"], def: "A data structure whose replicas can be updated independently and always merge without conflicts. Used in collaborative editing." },
    { term: "Sharding", aliases: ["shard", "partitioning"], def: "Splitting data across machines by key so each holds only part of it." },
    { term: "Rate limiting", aliases: ["rate limit", "throttling"], def: "Capping how many requests a client can make in a time window, protecting a service from overload or abuse." },
    { term: "Feature flag", aliases: ["feature toggle", "feature flags"], def: "A runtime switch that turns behaviour on or off without a redeploy, separating deploy from release." },
    { term: "Canary release", aliases: ["canary", "canary deployment"], def: "Rolling a new version out to a small share of traffic first and comparing it with the old version before going wider." },
    { term: "DORA metrics", aliases: ["DORA", "four key metrics"], def: "Software delivery measures from the DORA research programme: deployment frequency, lead time for changes, change failure rate and recovery time." },
    { term: "Monorepo", aliases: ["monorepository"], def: "A single version-control repository holding many projects or services, as used at Google and Meta." },
    { term: "Modular monolith", aliases: [], def: "One deployable application with strong internal module boundaries, often a middle path between a tangled monolith and microservices." },
    { term: "Microservices", aliases: ["microservice"], def: "An architecture of small, independently deployable services, each owning its data and communicating over the network." },
    { term: "Platform engineering", aliases: ["internal developer platform", "IDP"], def: "Building internal self-service tools and paved roads so product teams can ship without each solving infrastructure themselves." },
    { term: "Technical debt", aliases: ["tech debt"], def: "Ward Cunningham’s metaphor for shortcuts in code that speed you up now but cost ‘interest’ in future changes." },
    { term: "ADR", aliases: ["architecture decision record", "ADRs"], def: "A short document recording one significant architecture decision, its context and its consequences." },
    { term: "LLM", aliases: ["large language model", "LLMs"], def: "A neural network trained on large amounts of text to predict and generate language, such as Claude or GPT models." },
    { term: "Hallucination", aliases: ["hallucinate", "hallucinations"], def: "When an AI model states something false or invented with confidence, such as a non-existent API or court case." },
    { term: "RAG", aliases: ["retrieval-augmented generation"], def: "Fetching relevant documents and adding them to an LLM’s prompt so its answers are grounded in your data." },
    { term: "Vector database", aliases: ["vector store", "vector DB"], def: "A database that stores embeddings and finds the most similar ones quickly. Often used for RAG retrieval." },
    { term: "Embedding", aliases: ["embeddings"], def: "A list of numbers representing the meaning of text or images, so similar things end up close together." },
    { term: "Eval", aliases: ["evals", "LLM evaluation"], def: "A test set and scoring method for checking the quality of an AI system’s outputs, run whenever it changes." },
    { term: "Prompt injection", aliases: [], def: "An attack where untrusted text, in a web page, email or document, contains instructions that try to hijack an AI system." },
    { term: "Agent", aliases: ["AI agent", "agentic"], def: "An LLM running in a loop that can call tools, observe results and decide its next step towards a goal." },
    { term: "MCP", aliases: ["Model Context Protocol"], def: "An open protocol, introduced by Anthropic in 2024, for connecting AI applications to tools and data sources in a standard way." },
  ],

  facts: [
    { fact: "The DORA research behind the book Accelerate (2018) found that high-performing teams do better on both speed and stability, rather than trading one for the other.", source: "Forsgren, Humble and Kim, Accelerate, 2018" },
    { fact: "DORA measures software delivery with four key metrics: deployment frequency, lead time for changes, change failure rate and time to restore service.", source: "DORA / Google Cloud, State of DevOps reports" },
    { fact: "The 2024 DORA report found that greater AI adoption was associated with small decreases in software delivery throughput and stability, even as individuals reported productivity gains.", source: "DORA Accelerate State of DevOps Report, 2024" },
    { fact: "In a 2025 randomised trial, experienced open-source developers took about 19% longer on tasks when allowed to use AI tools, although they believed the tools had sped them up.", source: "METR, July 2025" },
    { fact: "In a 2022 controlled experiment, developers using GitHub Copilot finished a set task (writing an HTTP server in JavaScript) about 55% faster than those without it.", source: "GitHub research, 2022" },
    { fact: "About 70% of the security vulnerabilities Microsoft assigned CVEs to each year were memory-safety issues.", source: "Microsoft Security Response Center, 2019" },
    { fact: "As Android wrote more new code in memory-safe languages, memory-safety bugs fell from about 76% of its vulnerabilities in 2019 to about 24% in 2024.", source: "Google Security Blog, 2024" },
    { fact: "Google’s SRE teams aim to keep toil below 50% of each engineer’s time, so the rest goes to engineering work that reduces future toil.", source: "Google, Site Reliability Engineering, 2016" },
    { fact: "Google’s Project Aristotle study of its teams found psychological safety was the most important factor in team effectiveness.", source: "Google re:Work, 2015" },
    { fact: "Knight Capital lost about $440 million in roughly 45 minutes on 1 August 2012 because of a faulty deployment of trading software.", source: "US Securities and Exchange Commission, 2013" },
    { fact: "A faulty CrowdStrike Falcon content update on 19 July 2024 crashed an estimated 8.5 million Windows devices, disrupting airlines, hospitals and banks.", source: "Microsoft, July 2024" },
    { fact: "In 2016 Google reported that its single monorepo held about 2 billion lines of code, used by around 25,000 developers.", source: "Potvin and Levenberg, Communications of the ACM, 2016" },
  ],

  people: [
    { name: "Grace Hopper", years: "1906–1992", where: "USA", why: "Pioneer of programming languages whose work on compilers led to COBOL; she made the case that code could be written in words, not just machine instructions." },
    { name: "Margaret Hamilton", years: "born 1936", where: "USA", why: "Led the team at MIT that built the Apollo on-board flight software, and helped establish ‘software engineering’ as a discipline." },
    { name: "Fred Brooks", years: "1931–2022", where: "USA", why: "Managed IBM’s System/360 and OS/360, then wrote The Mythical Man-Month (1975) and ‘No Silver Bullet’ (1986), still core reading on why software projects slip." },
    { name: "Barbara Liskov", years: "born 1939", where: "USA", why: "Turing Award winner (2008) for work on data abstraction and distributed systems; the Liskov substitution principle carries her name." },
    { name: "Leslie Lamport", years: "born 1941", where: "USA", why: "Turing Award winner (2013) for foundations of distributed systems, including logical clocks and the Paxos consensus algorithm; also created LaTeX." },
    { name: "Kent Beck", years: "born 1961", where: "USA", why: "Created Extreme Programming, popularised test-driven development, and was a signatory of the Agile Manifesto (2001)." },
    { name: "Martin Fowler", years: "born 1963", where: "UK / USA", why: "Author of Refactoring and long-time chief scientist at Thoughtworks; his website named and explained patterns such as the strangler fig and feature toggles." },
    { name: "Werner Vogels", years: "born 1958", where: "Netherlands / USA", why: "Amazon’s CTO, known for ‘you build it, you run it’ and ‘everything fails all the time’, and for championing eventual consistency at scale." },
    { name: "Charity Majors", years: "active 2010s–", where: "USA", why: "Co-founder of Honeycomb and a leading voice on observability, on-call health and the engineer/manager pendulum." },
    { name: "Will Larson", years: "active 2010s–", where: "USA", why: "Engineering leader and author of An Elegant Puzzle and Staff Engineer (2021), which defined common staff archetypes." },
    { name: "Tanya Reilly", years: "active 2000s–", where: "USA", why: "Author of The Staff Engineer’s Path (2022) and the influential talk ‘Being Glue’ on recognising invisible leadership work." },
    { name: "Camille Fournier", years: "active 2000s–", where: "USA", why: "Former CTO of Rent the Runway and author of The Manager’s Path (2017), a widely used guide to technical leadership careers." },
    { name: "Julia Evans", years: "active 2010s–", where: "Canada", why: "Known for zines and blog posts that make systems topics like networking, Linux and debugging approachable, and for popularising the ‘brag document’." },
  ],
};
