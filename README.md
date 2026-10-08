# nikoftime

A shelf of little apps you can use right now, in the spirit of [neal.fun](https://neal.fun): open the site, click a tile, use it. No sign-ups and no installs.

**Live:** https://nikki30.github.io/nikoftime/

| Tile | What it is |
|---|---|
| [**Do Not Fret**](do-not-fret/) | A guitar practice app: a daily routine with a metronome, fretboards that light up each note on the beat, theory lessons, songs with tab play-along, and charts of your clean tempo. [README](do-not-fret/README.md) |
| [**Story So Far**](story-so-far/) | Spoiler-free recaps of the book you're reading, up to your exact page, drawn as a timeline, journey map, lab notebook, case file or scrapbook. [README](story-so-far/README.md) |
| [**My Roamin' Empire**](roamin-empire/) | Float to a hand-picked place, hear the country's #1 song, zoom in to see why its streets look the way they do, then meet a local vegetarian dish. Every new place grows your empire. [README](roamin-empire/README.md) |
| [**Radio Roam**](radio-roam/) | Float to a random place on Earth in a hot-air balloon and hear its radio live, with what's playing, a fact about the artist, and a passport of the countries you've visited. [README](radio-roam/README.md) |

More tiles are on the way.

It's a plain static site: HTML, CSS and a little JavaScript. There's no build step and nothing to install.

```
index.html      the homepage: header, hero with the illustration, the grid of tiles
styles.css      homepage styling (light + dark, tile art and animations)
main.js         theme toggle, and the logo that plays a little guitar run when clicked
favicon.svg
do-not-fret/    the Do Not Fret app (one self-contained page, with its own README)
story-so-far/   the Story So Far app (with its own README)
radio-roam/     the Radio Roam app (with its own README)
roamin-empire/  the My Roamin' Empire app (with its own README)
tools/charts.mjs  fetches this week's top songs for My Roamin' Empire during the daily build
vendor/         shared libraries: the Anthropic SDK, d3-geo/topojson, MapLibre and world map shapes
.github/workflows/pages.yml   publishes the site on every push to main, and once a day
```

## Preview locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Publish it (GitHub Pages, free)

1. Merge this branch into `main`.
2. On GitHub, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. The `Deploy site to GitHub Pages` workflow runs on every push to `main`. When it finishes, the site is live at
   **https://nikki30.github.io/nikoftime/**

**Custom domain (optional):** buy a domain, then in **Settings → Pages → Custom domain** enter it and follow GitHub's DNS instructions (a `CNAME` record pointing to `nikki30.github.io`). Tick **Enforce HTTPS**.

**Shorter URL (optional):** if you rename this repo to `nikki30.github.io`, the site is served at `https://nikki30.github.io/` with no path.

## Adding a tile

1. Put the app in its own folder, e.g. `metronome/index.html`. It must work by itself in the browser: no server, no login. Store anything it saves in `localStorage`, and give it a "← More apps" link back to `../`.
2. In `index.html`, copy the `<a class="tile">` block and change:
   - `href` to the folder (`metronome/`)
   - the art: any inline SVG in a 400 × 300 box on a gradient background (see `.a-fret` / `.a-book` in `styles.css`). Give its parts classes if you want them to move on hover.
   - the title and the one-line blurb
3. Keep or remove the dashed "more on the way" slot at the end of the grid.

An app that needs a server (like RAG Lab, which runs Python embedding models) can't be a click-and-play tile until its backend is hosted somewhere. Until then, link its repo from a tile labelled "run it yourself".
