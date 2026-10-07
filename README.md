# nikoftime

A shelf of little apps you can use right now, in the spirit of [neal.fun](https://neal.fun): open the site, click a tile, play. No sign-ups and no installs.

**Live:** https://nikki30.github.io/nikoftime/

| Tile | What it is |
|---|---|
| [**Do Not Fret**](do-not-fret/) | A guitar practice app: a daily routine with a metronome, fretboards that light up each note on the beat, theory lessons, songs with tab play-along, and charts of your clean tempo. [README](do-not-fret/README.md) |

More tiles are on the way.

It's a plain static site: HTML, CSS and a little JavaScript. There's no build step and nothing to install.

```
index.html      the homepage: wordmark + the grid of tiles
styles.css      homepage styling (light + dark, dotted paper, tile animations)
main.js         theme toggle, and the wordmark that plays a little guitar run when clicked
favicon.svg
do-not-fret/    the Do Not Fret app (one self-contained page, with its own README)
.github/workflows/pages.yml   publishes the site on every push to main
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
   - `--tile` (accent colour) and `--tile-2` (the art's background colour)
   - the art: any inline SVG in a 400 × 300 box. Give its parts classes if you want them to move on hover, like the Do Not Fret strings and notes in `styles.css`.
   - the title and the one-line blurb
3. With one tile the grid centres it. From two tiles on, it becomes a responsive grid automatically.

An app that needs a server (like RAG Lab, which runs Python embedding models) can't be a click-and-play tile until its backend is hosted somewhere. Until then, link its repo from a tile labelled "run it yourself".
