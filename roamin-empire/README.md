# My Roamin' Empire

Float in a hot-air balloon to a hand-picked corner of the world. When you land, cards pop up all around the globe: the country's #1 song, a must-eat vegetarian dish, a must-visit spot, an "only here" fact, how to say hello, the local time and weather right now, and the capital, money and which side of the road they drive on.

1. **Hear it.** The country's #1 song this week on Apple Music plays as you land (a 30-second preview, then the next song on the chart). You also get a "Did you know?" about the artist from Wikipedia.
2. **Look closer.** Zoom in and the map flies you around the place while you read why it looks the way it does: Barcelona's cut-corner blocks, Palmanova's nine-pointed star, Manhattan's grid, Jaipur's pink planned city. You can switch to satellite view.
3. **Taste it.** A local vegetarian dish (no meat, fish or egg), with what it's like to eat.

Every new place grows your empire, and your title goes from Wanderer up to Emperor. Your stamps and tasted dishes are kept in your browser.

## Where things come from

| What | Source |
|---|---|
| Places, "notice how…" facts and dishes | Written by hand in [`places.js`](places.js) |
| Must visit, say hello, only here, capital, money, driving side | Written by hand in [`extras.js`](extras.js) |
| Weather right now | [Open-Meteo](https://open-meteo.com) |
| Top songs and previews | Apple Music's public charts feed and the iTunes lookup API, fetched once a day by [`tools/charts.mjs`](../tools/charts.mjs) when the site builds, saved as `charts.json` |
| Artist facts, dish photos | Wikipedia |
| Street map | [OpenFreeMap](https://openfreemap.org) (OpenStreetMap data), drawn with [MapLibre](https://maplibre.org) |
| Satellite view | Esri World Imagery |
| Globe | Shared with [Radio Roam](../radio-roam/) |

Apple's feeds can't be read straight from a browser on another site, which is why the charts are fetched at build time instead. If a country has no chart that day, that stop is a quiet one.

## Adding a place

Add an entry to `PLACES` in `places.js`:

```js
{
  id: "venice", name: "Venice", country: "Italy", cc: "it", at: [12.3359, 45.4380],
  look: [
    { at: [12.3359, 45.4380], z: 14.5, t: "Notice…" },   // [longitude, latitude], map zoom, the fact
  ],
  dish: { name: "Risotto al nero", wiki: "Wikipedia page title", what: "What it's like to eat." },
}
```

`cc` is the two-letter country code used for the chart. Keep dishes vegetarian.

## Every country

The balloon can land in any of 196 countries. Featured places (above) get a hand-written street tour; everywhere else lands at the capital and the zoom tours the most interesting nearby places on Wikipedia. Each country's cards live in [`world.js`](world.js): capital, money, driving side, how to say hello (with a 🔊 button that uses your device's voice, or reads the pronunciation if there's no voice for that language), a must-eat vegetarian dish with its pronunciation, a must-visit place, an "only here" fact, a historical novel available in English, and how the country is run.

- **Who's in charge** is looked up live on Wikidata, so it stays current.
- **Today's news** is a few English headlines per country from Google News, fetched by [`tools/news.mjs`](../tools/news.mjs) in the daily build.
- **Songs** have a "Save to YouTube Music" button that opens the song there, ready to add to your library.

## Titles

Visit enough countries and a **👑 Title upgrade?** button appears. Score 8 out of 10 on a quiz about the places you've been to earn the next title: Traveller, Explorer, Consul, Governor, Emperor.
