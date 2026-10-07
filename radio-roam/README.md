# Radio Roam

**Hop in. Land anywhere. Listen.**

Like spinning a globe and putting your finger down, but you hear the place. Press **Take a ride** and a hot-air balloon floats you across a 3D globe to a random radio station somewhere on Earth. When you land, you get:

- **Where you are:** the flag, the region and country, and how far you just floated.
- **The station:** its name, genre tags, and a live stream that fades in as you touch down.
- **What's playing:** the song and artist, if the station publishes it.
- **Did you know?** A fact about the artist from Wikipedia. Add an Anthropic API key and Claude turns it into a playful "Did you know…?", using only what Wikipedia says. When there's no song info, you get a note about the place you landed instead.

Rides are **Anywhere**, **Nearby** or **Far away** (more than 7,000 km). "Anywhere" picks a country first and prefers ones you haven't visited, so you don't just bounce around the countries with the most stations. Every country you land in gets a stamp in your **passport**, and you can **save** stations to fly back to later.

**Try it:** https://nikki30.github.io/nikoftime/radio-roam/

## Where the data comes from

| What | Source | Notes |
|---|---|---|
| Stations, locations, streams | [Radio Browser](https://www.radio-browser.info), a free community directory | Only HTTPS streams with coordinates, since the site itself is HTTPS. Each listen is reported back to the directory, as its API asks. |
| Now playing | The station's own server | Browsers can't read the song titles inside a radio stream, so the app asks servers that publish them separately: Icecast (`/status-json.xsl`), radio.co and laut.fm. Many stations don't, and the card says so. |
| Artist and place facts | Wikipedia's public API | The artist must look like a musician on Wikipedia, otherwise no fact is shown. |
| Fun facts (optional) | Claude (`claude-opus-5-5`, low effort, server-side refusal fallbacks) | Uses the same browser-stored API key as Story So Far. |
| Globe | d3-geo, topojson and Natural Earth country shapes (`../vendor/`) | No map service, no tracking. |

Everything you do (passport, saved stations, volume) stays in your browser's local storage.

## Files

```
index.html   the page
styles.css   night-sky look, the landing card, the passport
app.js       rides, station picking, audio, now playing, facts, passport
globe.js     the canvas globe: drawing, dragging, and the balloon flight
data.js      Radio Browser, now-playing lookups, Wikipedia
```
