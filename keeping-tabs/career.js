// "Next role": getting from senior to staff-level roles in data platform / infra for AI, at Anthropic, OpenAI,
// Databricks and similar companies. Interview processes are as commonly reported by candidates; they change,
// so always confirm the loop with your recruiter.

export const PROFILE = `Senior software engineer. Background in data platforms, infrastructure and ETL (pipelines, warehouses/lakehouses, orchestration), increasingly focused on AI: building the data and infrastructure that models and AI products run on. Looking for senior/staff roles in data or infrastructure for AI at Anthropic, OpenAI, Databricks and similar companies.`;

export const VERDICT = {
  title: "Should I grind LeetCode?",
  answer: "Mostly no. For these roles, practise building small working systems quickly, and practise data- and AI-flavoured system design. Do a targeted set of algorithm problems only for the companies that still test them (Databricks especially).",
  rows: [
    { co: "Anthropic", coding: "Practical, progressive (build and extend a system)", dsa: "Low", design: "High", deep: "High", values: "High (AI safety, mission)" },
    { co: "OpenAI", coding: "Practical, realistic problems with follow-ups", dsa: "Low to medium", design: "High", deep: "High", values: "Medium" },
    { co: "Databricks", coding: "Algorithmic (LeetCode medium to hard), sometimes concurrency", dsa: "High", design: "High (distributed data)", deep: "Medium", values: "Medium" },
  ],
  mix: [
    ["Practical coding builds", 35, "Timed 60–90 min, with tests, in your best language"],
    ["System design (data + AI)", 30, "Out loud, with numbers and trade-offs"],
    ["Project deep dives and stories", 15, "Two systems you can go 5 levels deep on"],
    ["AI fundamentals for infra engineers", 10, "Enough to talk to researchers as a peer"],
    ["Targeted algorithms", 10, "Raise to ~30% if Databricks is your top target"],
  ],
};

export const COMPANIES = [
  {
    id: "anthropic", name: "Anthropic", icon: "🟠",
    fit: "Your data platform + AI mix maps onto the teams that build training data pipelines, data infrastructure for research and product, and the infrastructure models train and run on.",
    roles: [
      { title: "Software Engineer, Data Infrastructure", why: "Closest to what you do today: platforms, pipelines and warehouses that research and product depend on." },
      { title: "Pretraining / training data engineering", why: "ETL at web scale: crawling, extraction, filtering, dedup and versioned datasets that feed model training." },
      { title: "Infrastructure / Inference", why: "If you lean infra: serving, scheduling, accelerators, reliability at very large scale." },
      { title: "Safeguards (data and detection systems)", why: "Pipelines and classifiers that detect misuse: data engineering with a direct safety mission." },
    ],
    process: [
      ["Recruiter and hiring manager", "Motivation, background, why Anthropic. Be specific about why AI safety matters to you."],
      ["Online coding assessment", "Commonly reported as a ~90-minute progressive problem: build a small in-memory system (e.g. bank or file-system style API) where each level adds requirements. Clean, extensible code and speed matter more than tricks."],
      ["Technical screen", "Live practical coding: build or extend something realistic, talking through choices."],
      ["Final loop", "Practical coding, system design (often data or LLM flavoured), a deep dive on a past project, and a values conversation about AI safety and the mission."],
    ],
    prep: ["Practise progressive coding problems with a 90-minute timer (see Coding builds).", "Read the Core Views on AI Safety and the Responsible Scaling Policy, and form your own view.", "Prepare two project deep dives with numbers, trade-offs and what you'd change.", "Design practice: pretraining data pipeline, inference serving, eval platform."],
    links: [["Careers", "https://www.anthropic.com/careers"], ["Core Views on AI Safety", "https://www.anthropic.com/news/core-views-on-ai-safety"], ["Responsible Scaling Policy", "https://www.anthropic.com/news/anthropics-responsible-scaling-policy"]],
  },
  {
    id: "openai", name: "OpenAI", icon: "⚫",
    fit: "Strong fit for data platform, training data and applied AI infrastructure teams: the systems behind training, evals and products used at enormous scale.",
    roles: [
      { title: "Data Platform / Data Infrastructure", why: "Company-wide data platforms, pipelines and tooling: your core skill set." },
      { title: "Training data infrastructure", why: "Getting, processing and serving data for model training at scale." },
      { title: "Applied AI engineering (data-heavy)", why: "Product-facing systems: usage data, evals, fine-tuning pipelines." },
      { title: "Infrastructure (compute, storage, reliability)", why: "If you want to go deeper into infra for training and inference." },
    ],
    process: [
      ["Recruiter call", "Background and interests; which teams fit."],
      ["Technical screen", "Practical coding, reported to be realistic problems (e.g. a key-value store, resumable iterators, data transformation) with follow-ups that extend the requirements."],
      ["Final loop", "One or two coding rounds, system design, a project deep dive (sometimes a presentation) and behavioural/collaboration. Some roles add a domain round or take-home."],
    ],
    prep: ["Practical coding with follow-ups: get to working code fast, then extend it cleanly.", "Design around their scale: usage metering, rate limiting, training/eval data pipelines.", "Know what they've shipped recently and have opinions about it.", "Prepare to present one project end to end."],
    links: [["Careers", "https://openai.com/careers"], ["Charter", "https://openai.com/charter"]],
  },
  {
    id: "databricks", name: "Databricks", icon: "🔶",
    fit: "The most direct fit: data platforms and ETL are their core product, and their AI products (model serving, vector search, agents) are built on top.",
    roles: [
      { title: "Lakeflow / ETL (Delta Live Tables, ingestion)", why: "You'd be building the product you've used: declarative pipelines, CDC, orchestration." },
      { title: "Unity Catalog / governance", why: "Metadata, lineage and access control across data and AI assets." },
      { title: "Mosaic AI (model serving, vector search, agents)", why: "Where data platform meets AI products." },
      { title: "Spark / Photon runtime, storage (Delta Lake)", why: "If you want deep systems work: query engines, transaction logs, performance." },
    ],
    process: [
      ["Recruiter call", "Background, role fit."],
      ["Coding screen", "Reported to be algorithmic: LeetCode medium to hard, sometimes with concurrency."],
      ["Final loop", "Several coding rounds (algorithms, sometimes multithreading), system design focused on distributed data systems, and hiring manager/behavioural."],
    ],
    prep: ["A targeted algorithms set (graphs, heaps, intervals, binary search, a little DP), timed.", "Concurrency basics: locks, producer/consumer, thread-safe data structures.", "Spark and Delta internals: shuffles, partitioning, file layout, the transaction log.", "Design: a lakehouse ETL platform with CDC, schema evolution and backfills."],
    links: [["Careers", "https://www.databricks.com/company/careers"], ["Delta Lake", "https://delta.io/"]],
  },
];

export const ALSO = [
  ["Google DeepMind / Meta GenAI", "Data infrastructure for training at very large scale."],
  ["Snowflake", "Cortex AI and Snowpark: AI features on a data platform."],
  ["Scale AI", "Data for AI: labelling, evaluation and data pipelines."],
  ["Anyscale (Ray), Modal, Together AI", "Infrastructure for running AI workloads."],
  ["Pinecone and other vector databases", "Retrieval infrastructure for AI products."],
];

// An 8-week plan, about 6–8 hours a week.
export const PLAN = [
  { focus: "Your story and your targets", tasks: ["Write two project deep dives: problem, your role, design, numbers, trade-offs, what you'd change", "Pick 5–8 specific roles across your target companies and save the links", "Rewrite your CV headline around 'data platforms for AI'", "Coding build: Key-value store (levels 1–2), timed"] },
  { focus: "Practical coding speed", tasks: ["Coding build: Rate limiter, all levels, 75 minutes", "Coding build: File system API, all levels, 90 minutes", "Algorithms warm-up: 5 problems on hash maps and heaps", "Design refresher: read about consistent hashing, queues and replication"] },
  { focus: "Data at scale", tasks: ["Coding build: Streaming dedupe and aggregation", "System design: Web-scale pretraining data pipeline (out loud, 45 min)", "AI fundamentals: Training data and tokenization", "Algorithms: 5 problems on graphs and BFS/DFS"] },
  { focus: "AI infrastructure", tasks: ["System design: LLM inference serving", "AI fundamentals: Inference, batching and the KV cache", "Coding build: Job scheduler with dependencies", "First mock interview with Claude: coding"] },
  { focus: "Lakehouse and retrieval", tasks: ["System design: Lakehouse ETL platform (Databricks style)", "System design: RAG ingestion and retrieval", "Algorithms: 8 problems on intervals, binary search, heaps (more if Databricks is a top target)", "Concurrency practice: thread-safe cache and a worker pool"] },
  { focus: "Evals, metering and stories", tasks: ["System design: Evaluation platform", "System design: Usage metering and billing", "Write 6 behavioural stories (see Your stories)", "Read the mission material for each target company and write why you want each one"] },
  { focus: "Full mock loops", tasks: ["Mock loop 1: coding + design + deep dive (with Claude or a friend)", "Fix the two weakest areas from the mock", "Mock loop 2", "Ask for referrals; apply to your top roles"] },
  { focus: "Sharpen and schedule", tasks: ["One timed coding build every other day", "Re-run your two weakest design prompts", "Polish your 'why this company' answers", "Schedule interviews with breaks between them"] },
];

export const PRACTICE = {
  coding: [
    { id: "kv", title: "Key-value store", time: 75, levels: ["set, get, delete", "Values expire after a TTL; get(key, now) respects it", "Transactions: begin, commit, rollback, nested", "History: get(key, at_time) returns the value at a past time"], why: "The most common shape of 'practical' interview: an API that grows level by level." },
    { id: "rate", title: "Rate limiter", time: 75, levels: ["Fixed window: N requests per user per minute", "Sliding window log or counter", "Token bucket with bursts and refill", "Make it thread-safe; discuss making it distributed"], why: "Shows you can reason about time, state and concurrency." },
    { id: "fs", title: "File system API", time: 90, levels: ["mkdir, write, read, ls", "Sizes: total size of a directory", "Move and copy, with errors for bad paths", "Find the N largest files, or files matching a suffix"], why: "Tree data structures plus clean API design under time pressure." },
    { id: "bank", title: "Bank system", time: 90, levels: ["Create accounts, deposit, transfer, with validation", "Top N accounts by outgoing money", "Scheduled payments that run at a timestamp, with cashback", "Merge two accounts and query a balance at a past time"], why: "Very close to commonly reported progressive assessments." },
    { id: "crawl", title: "Web crawler", time: 75, levels: ["Crawl from a start URL, same domain only, no repeats", "Normalise URLs (fragments, trailing slashes)", "Make it concurrent with a worker pool, and polite (rate per host)", "Make it resumable after a crash"], why: "Concurrency and real-world edge cases." },
    { id: "stream", title: "Streaming dedupe and aggregation", time: 75, levels: ["Read JSON-lines events; drop duplicate ids", "Count events per user per minute", "Handle late and out-of-order events with a watermark", "Checkpoint so the job can resume exactly where it stopped"], why: "ETL in an interview: exactly your background, so make it shine." },
    { id: "dag", title: "Job scheduler with dependencies", time: 75, levels: ["Given jobs and dependencies, return a valid run order", "Detect and report cycles", "Run with N workers in parallel", "Retries with backoff; skip jobs whose dependencies failed"], why: "Orchestration (like Airflow) from first principles." },
    { id: "bpe", title: "Tiny BPE tokenizer", time: 75, levels: ["Count adjacent symbol pairs in a corpus", "Merge the most frequent pair; repeat K times", "Encode new text with the learned merges", "Make training faster (incremental pair counts)"], why: "AI-flavoured and impressive: you'll understand tokens properly." },
  ],
  design: [
    { id: "pretrain", title: "Web-scale pretraining data pipeline", prompt: "Design the pipeline that turns a large web crawl into clean, deduplicated, tokenized training data.", cover: ["Stages: fetch, extract text, language ID, quality filters, PII handling, dedup, tokenize, shard", "Exact dedup (hashing) and near-dup (MinHash + LSH)", "Versioned, reproducible datasets with lineage", "Throughput and cost: how many machines, where the bottleneck is"], follow: ["How do you know a filter improved model quality?", "How do you remove one website's data after training?"] },
    { id: "infer", title: "LLM inference serving", prompt: "Design a service that serves a large language model to millions of users with streaming responses.", cover: ["Routing, continuous batching, KV cache memory", "GPU utilisation vs latency (time to first token, tokens per second)", "Autoscaling, multiple models and versions, rate limits per customer", "Failure handling and graceful degradation"], follow: ["What happens when one customer sends very long prompts?", "How do you roll out a new model safely?"] },
    { id: "lakehouse", title: "Lakehouse ETL platform", prompt: "Design a platform that ingests change data from many OLTP databases and keeps analytics tables fresh.", cover: ["CDC ingestion, bronze/silver/gold layers", "Incremental processing, schema evolution, late data", "Data quality checks, backfills and reprocessing", "Orchestration, lineage, cost"], follow: ["A bad deploy wrote wrong data for 6 hours. How do you fix it?", "How do you make one table GDPR-deletable?"] },
    { id: "rag", title: "RAG ingestion and retrieval", prompt: "Design the system that lets a company's AI assistant answer questions over millions of internal documents.", cover: ["Ingestion, chunking, embedding pipeline, re-embedding when models change", "Vector index updates and deletes, freshness", "Permissions: users only retrieve what they can see", "Measuring retrieval quality"], follow: ["How do you handle a document that's updated every minute?", "How do you evaluate answers end to end?"] },
    { id: "evals", title: "Model evaluation platform", prompt: "Design a platform that runs thousands of evaluations on every new model checkpoint and lets researchers compare results.", cover: ["Job orchestration on GPUs, caching, retries", "Storing results and comparing checkpoints", "Reproducibility: pinned data, prompts and code", "Human grading queues and contamination checks"], follow: ["How do you make results trustworthy when evals are flaky?", "How do you keep eval data out of training data?"] },
    { id: "meter", title: "Usage metering and billing", prompt: "Design token-based usage metering and billing for an AI API used by thousands of companies.", cover: ["High-throughput usage events, idempotency", "Aggregation windows, late data, reconciliation", "Real-time limits vs monthly invoices", "Auditability and correctness"], follow: ["How do you guarantee you never bill twice?", "How fast can a customer see their usage?"] },
    { id: "gpusched", title: "GPU job scheduler for training", prompt: "Design the scheduler that runs training jobs of very different sizes on a shared GPU cluster.", cover: ["Queues, priorities, quotas and fairness", "Gang scheduling and preemption with checkpoints", "Handling hardware failures", "Utilisation and observability"], follow: ["A huge job is starving everyone else. What do you do?", "How do you minimise lost work when a node dies?"] },
    { id: "features", title: "Feature and embedding store", prompt: "Design a store that serves the same features and embeddings for training (offline) and serving (online).", cover: ["Offline/online consistency and point-in-time correctness", "Backfills and freshness", "Low-latency serving and caching", "Versioning features and models together"], follow: ["How do you avoid training/serving skew?", "How do you roll back a bad feature?"] },
  ],
  ai: [
    { title: "Training data and tokenization", points: ["Models learn from trillions of tokens: pieces of words from a tokenizer like BPE.", "Data quality (filtering, dedup, mix of sources) changes model quality as much as model size.", "Pipelines must be reproducible: you need to know exactly what went into each model."] },
    { title: "Training vs inference", points: ["Training is a huge batch job across many accelerators; inference is a latency-sensitive service.", "Training cost grows with model size × tokens; inference cost grows with users × tokens generated.", "Checkpoints are saved often because hardware fails at scale."] },
    { title: "Inference: batching and the KV cache", points: ["Generating each token reuses earlier work stored in the KV cache, which eats GPU memory.", "Continuous batching mixes many users' requests to keep GPUs busy.", "Key metrics: time to first token, tokens per second, cost per million tokens."] },
    { title: "Fine-tuning, RLHF and evals", points: ["After pretraining, models are tuned with curated examples and human or AI feedback.", "Evals measure capabilities and safety; contamination (eval data leaking into training) ruins them.", "Infra engineers often own the pipelines that make this repeatable."] },
    { title: "Embeddings and retrieval", points: ["Embeddings turn text into vectors where similar meaning is close together.", "Vector indexes (HNSW, IVF) trade accuracy for speed.", "RAG = retrieve relevant chunks, then let the model answer with them."] },
    { title: "Why hardware shapes everything", points: ["Accelerators are fast at maths but often limited by memory bandwidth.", "Moving data (between GPUs, nodes, storage) is frequently the real bottleneck.", "Good data loaders and storage keep expensive accelerators from sitting idle."] },
    { title: "Safety for infra engineers", points: ["Labs gate more capable models behind safety evaluations (e.g. Anthropic's Responsible Scaling Policy).", "Infra contributes through security (protecting model weights), monitoring and misuse detection.", "Have your own honest view on why this work matters to you."] },
  ],
  stories: [
    { q: "Walk me through the most technically complex system you've built.", tip: "Problem → constraints → design → your decisions → numbers → what broke → what you'd change. Be ready for 5 levels of 'why'." },
    { q: "Tell me about a data incident that affected users.", tip: "Detection, impact, fix, root cause, and the change that stopped it happening again." },
    { q: "Tell me about a time you disagreed with a technical direction.", tip: "Show you disagreed with data, listened, and committed once decided." },
    { q: "Tell me about leading something across teams without authority.", tip: "Staff-level signal: alignment, writing, unblocking others." },
    { q: "Tell me about a trade-off you made that you'd revisit.", tip: "Honesty and learning beat a perfect story." },
    { q: "Why this company, and why now?", tip: "Specific to each: Anthropic (safety mission), OpenAI (mission and scale), Databricks (data + AI platform). Connect it to your own work." },
  ],
};
