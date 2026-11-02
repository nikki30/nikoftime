// Turns swipes into trips. Plans are built by rules, not guesses, so they stay practical:
// one connected region per trip, every leg a train, bus or short flight (≤ MAX_LEG km),
// the route ordered to never zigzag, and at least 2 days per stop.

export const MAX_LEG = 1700; // km: roughly a 2.5-hour flight
const R = 6371;
export function km(a, b) {
  const t = (d) => (d * Math.PI) / 180, dLat = t(b.lat - a.lat), dLon = t(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
export function leg(a, b) {
  const d = km(a, b);
  if (d < 350) return { d, how: "Train or drive", hrs: Math.max(1, Math.round(d / 90)) };
  if (d < 750) return { d, how: "Fast train or bus", hrs: Math.round(d / 130 + 0.5) };
  return { d, how: "Short flight", hrs: Math.round(d / 750 + 2.5) };
}

export const KINDS = [
  { id: "fling", name: "The Fling", min: 5, max: 7, blurb: "Short, intense, one or two places." },
  { id: "slowburn", name: "The Slow Burn", min: 8, max: 14, blurb: "Two to four places, close together." },
  { id: "grandtour", name: "The Grand Tour", min: 15, max: 30, blurb: "One connected route, lots of stops." },
];
export const kindFor = (days) => KINDS.find((k) => days <= k.max) || KINDS[2];
export function stopsFor(days) {
  if (days <= 7) return days <= 5 ? 1 : 2;
  if (days <= 14) return Math.min(4, Math.max(2, Math.round(days / 4)));
  return Math.min(8, Math.max(4, Math.round(days / 4)));
}

// How much this traveller should like a card, from the learned tag weights and their own swipes.
export function score(card, S, prefs = {}) {
  const sw = S.seen[card.id];
  if (sw === "left" || sw === "been") return -Infinity;
  let s = card.tags.reduce((a, t) => a + (S.w[t] || 0), 0) / Math.sqrt(card.tags.length);
  if (sw === "right") s += 4;
  if (sw === "super") s += 7;
  s += 2.5 * (S.roses[card.id]?.length || 0);
  if (prefs.month && card.best?.includes(prefs.month)) s += 1.5;
  else if (prefs.month) s -= 1;
  if (prefs.budget && card.budget > prefs.budget) s -= 2 * (card.budget - prefs.budget);
  return s;
}

// Order stops so the route never doubles back: try every start, walk to the nearest next stop, keep the shortest.
function order(stops) {
  let best = null, bestLen = Infinity;
  stops.forEach((first) => {
    const route = [first], left = stops.filter((x) => x !== first);
    let len = 0;
    while (left.length) {
      const last = route.at(-1);
      left.sort((a, b) => km(last, a) - km(last, b));
      len += km(last, left[0]);
      route.push(left.shift());
    }
    if (len < bestLen) { best = route; bestLen = len; }
  });
  return best;
}

export function validate(route) {
  for (let i = 1; i < route.length; i++) if (km(route[i - 1], route[i]) > MAX_LEG) return false;
  return true;
}

function pickRoute(cands, n) {
  // Seed with the best card, then add the best-scoring card that stays within reach of the route so far.
  const chosen = [cands[0]];
  for (const c of cands.slice(1)) {
    if (chosen.length >= n) break;
    if (chosen.some((x) => km(x, c) <= MAX_LEG * 0.8)) chosen.push(c);
  }
  let route = order(chosen);
  while (!validate(route) && route.length > 1) { route = order(route.slice(0, -1)); }
  return route;
}

function splitDays(route, days) {
  // Day 1 is the flight out; the last day is the flight home. Everything between goes to the stops, at least 2 each.
  const avail = days - 1;
  const want = route.map((c) => c.stay || 3), tot = want.reduce((a, b) => a + b, 0);
  let out = want.map((w) => Math.max(2, Math.round((w / tot) * avail)));
  while (out.reduce((a, b) => a + b, 0) > avail) { const i = out.indexOf(Math.max(...out)); if (out[i] <= 2) break; out[i]--; }
  while (out.reduce((a, b) => a + b, 0) < avail) { const r = want.map((w, j) => w / out[j]); out[r.indexOf(Math.max(...r))]++; }
  return out;
}

function activities(card, S) {
  const rosed = new Set(S.roses[card.id] || []);
  const ps = card.prompts.map((p, i) => ({ text: p[1], rose: rosed.has(i) })).sort((a, b) => b.rose - a.rose);
  return { ps, eats: card.eats.slice() };
}

export function buildPlan(region, cands, days, S, regionName) {
  const n = Math.min(stopsFor(days), Math.floor((days - 1) / 2), cands.length);
  const route = pickRoute(cands, n);
  const nights = splitDays(route, days);
  const out = [];
  let dayN = 1;
  route.forEach((c, si) => {
    const { ps, eats } = activities(c, S);
    for (let k = 0; k < nights[si]; k++) {
      const d = { n: dayN, stop: c.name, stopId: c.id, items: [] };
      if (dayN === 1) d.travel = `Fly San Francisco → ${c.name} (about ${c.fly}h${c.fly > 9 ? ", overnight" : ""})`;
      else if (k === 0) { const l = leg(route[si - 1], c); d.travel = `${l.how}: ${route[si - 1].name} → ${c.name} (${l.d} km, about ${l.hrs}h)`; }
      const p = ps[k % ps.length];
      if (k < ps.length) d.items.push({ text: p.text, rose: p.rose });
      else d.items.push({ text: k === nights[si] - 1 ? "Slow day: wander, revisit a favourite, pack." : "Free day: follow your nose, or a day trip nearby." });
      if (eats[k]) d.items.push({ text: `Eat: ${eats[k]}`, food: true });
      out.push(d);
      dayN++;
    }
  });
  const last = route.at(-1);
  out.push({ n: dayN, stop: last.name, stopId: last.id, travel: `Fly ${last.name} → San Francisco (about ${last.fly}h)`, items: [{ text: "Last breakfast, last souvenir, airport." }] });
  const tagCount = {};
  route.forEach((c) => c.tags.forEach((t) => (tagCount[t] = (tagCount[t] || 0) + (S.w[t] || 0))));
  const why = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
  return { region, regionName, days, kind: kindFor(days), route: route.map((c) => c.id), stops: route.map((c, i) => ({ id: c.id, name: c.name, days: nights[i] })), why, itinerary: out, valid: validate(route) };
}

// Three options: the best three regions for this traveller, each fitted to the trip length.
export function suggest(all, S, prefs) {
  const days = prefs.days;
  const byRegion = {};
  all.forEach((c) => {
    const s = score(c, S, prefs);
    if (s === -Infinity) return;
    (byRegion[c.region] ||= []).push({ ...c, _s: s });
  });
  const ranked = Object.entries(byRegion).map(([r, cs]) => {
    cs.sort((a, b) => b._s - a._s);
    const liked = cs.filter((c) => ["right", "super"].includes(S.seen[c.id])).length;
    const top = cs.slice(0, stopsFor(days)).reduce((a, c) => a + c._s, 0);
    return { r, cs, liked, rank: top + liked * 3 };
  }).filter((x) => x.liked > 0 || Object.keys(S.seen).length < 3).sort((a, b) => b.rank - a.rank);
  return ranked.slice(0, 3);
}
