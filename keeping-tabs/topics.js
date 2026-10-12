// What Keeping Tabs follows. tools/feeds.mjs reads this to fetch the daily feed; the app reads it to draw the tabs.

// News topics: a Google News search for each, in each region.
export const TOPICS = [
  { id: "feminism", label: "Feminism", icon: "♀", q: `(feminism OR feminist OR "women's rights" OR "gender equality" OR "gender pay gap")`,
    research: `feminism OR feminist OR "gender equality" OR "women's rights" OR "gender-based violence"`,
    blurb: "Women's rights, gender equality and feminist movements" },
  { id: "lgbtq", label: "LGBTQIA+", icon: "🏳️‍🌈", q: `(LGBTQ OR LGBTQIA OR transgender OR "same-sex" OR queer OR "Pride")`,
    research: `LGBTQ OR LGBT OR transgender OR queer OR "sexual minority" OR "same-sex"`,
    blurb: "Queer and trans rights, laws, culture and community" },
];

// Where to look. "ed" is the Google News edition; "near" narrows the search to a place.
export const REGIONS = [
  { id: "world", label: "🌍 World", ed: ["en-US", "US"] },
  { id: "india", label: "🇮🇳 India", ed: ["en-IN", "IN"] },
  { id: "us", label: "🇺🇸 USA", ed: ["en-US", "US"], near: `("United States" OR US)` },
  { id: "uk", label: "🇬🇧 UK", ed: ["en-GB", "GB"] },
  { id: "caribbean", label: "🌴 Caribbean", ed: ["en-US", "US"], near: `(Caribbean OR Trinidad OR Jamaica OR Guyana OR Barbados)` },
  { id: "africa", label: "🌍 Africa", ed: ["en-ZA", "ZA"], near: `(Africa OR Kenya OR Nigeria OR "South Africa" OR Ghana)` },
  { id: "latam", label: "🌎 Latin America", ed: ["en-US", "US"], near: `("Latin America" OR Brazil OR Mexico OR Argentina OR Colombia OR Chile)` },
  { id: "asia", label: "🌏 East & SE Asia", ed: ["en-SG", "SG"], near: `(Japan OR Korea OR China OR Taiwan OR Philippines OR Indonesia OR Singapore OR Thailand)` },
  { id: "mideast", label: "🕌 Middle East", ed: ["en-US", "US"], near: `("Middle East" OR Iran OR "Saudi Arabia" OR Turkey OR Lebanon OR Afghanistan)` },
  { id: "australia", label: "🇦🇺 Australia & NZ", ed: ["en-AU", "AU"] },
];

// Research only from these universities (looked up on OpenAlex by name at build time).
export const UNIVERSITIES = [
  "Harvard University", "Stanford University", "Massachusetts Institute of Technology", "Yale University", "Princeton University",
  "Columbia University", "University of California, Berkeley", "University of Chicago", "University of Michigan", "New York University",
  "University of Oxford", "University of Cambridge", "London School of Economics and Political Science", "University College London",
  "University of Toronto", "McGill University", "University of Melbourne", "University of Sydney", "Australian National University",
  "National University of Singapore", "University of Tokyo", "University of Hong Kong", "Jawaharlal Nehru University", "University of Delhi",
  "Tata Institute of Social Sciences", "Indian Institute of Science", "University of the West Indies", "University of Cape Town",
  "University of the Witwatersrand", "University of São Paulo", "National Autonomous University of Mexico", "Carnegie Mellon University",
];

// Engineering: blogs worth reading, from senior and staff engineers and strong engineering teams.
export const BLOGS = [
  { name: "Martin Fowler", url: "https://martinfowler.com/feed.atom", kind: "craft" },
  { name: "Will Larson (Irrational Exuberance)", url: "https://lethain.com/feeds.xml", kind: "staff" },
  { name: "The Pragmatic Engineer", url: "https://newsletter.pragmaticengineer.com/feed", kind: "career" },
  { name: "Charity Majors", url: "https://charity.wtf/feed/", kind: "ops" },
  { name: "Julia Evans", url: "https://jvns.ca/atom.xml", kind: "craft" },
  { name: "Dan Luu", url: "https://danluu.com/atom.xml", kind: "craft" },
  { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/", kind: "ai" },
  { name: "Netflix Tech Blog", url: "https://netflixtechblog.com/feed", kind: "systems" },
  { name: "Cloudflare Blog", url: "https://blog.cloudflare.com/rss/", kind: "systems" },
  { name: "GitHub Engineering", url: "https://github.blog/engineering/feed/", kind: "systems" },
  { name: "Slack Engineering", url: "https://slack.engineering/feed/", kind: "systems" },
  { name: "Dropbox Tech", url: "https://dropbox.tech/feed", kind: "systems" },
  { name: "Spotify Engineering", url: "https://engineering.atspotify.com/feed/", kind: "systems" },
  { name: "Stripe Blog", url: "https://stripe.com/blog/feed.rss", kind: "systems" },
];

// Hacker News searches for the most-discussed posts of the last two weeks on growing as an engineer.
export const HN_QUERIES = ["staff engineer", "senior engineer", "system design", "engineering manager", "code review", "software architecture", "incident postmortem", "technical debt"];
