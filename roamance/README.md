# Roamance

Swipe right on the world. Places and experiences are pitched like dating profiles (Hinge-style: photos, prompts, a red flag). Swipe, super like, or send a 🌹 to the exact line you love. The app learns your type from tag weights, then pitches 5 to 30 day trips from San Francisco.

- `deck.js`: the starter deck (70 places and experiences), grouped into regions you can travel within.
- `planner.js`: builds trips by rules: one region per trip, every leg ≤ 1,700 km (train, bus or short flight), routes ordered so they never double back, at least 2 days per stop.
- `ai.js`: optional Claude extras with the visitor's own API key (fresh profiles, a written read of your type, polished day plans). Claude only rewrites the wording of a plan; the stops and route always come from the planner.
- Photos come from Wikipedia's REST API. Swipes stay in the browser (localStorage).
