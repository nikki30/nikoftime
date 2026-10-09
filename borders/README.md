# Borders Through Time

**Slide through 125,000 years and watch empires rise and fall.**

A world map with a year slider: 54 snapshots from 123,000 BC (early humans) to 2010. Press ▶ and the world plays through history.

- **What changed:** for every map, the panel lists which states grew ▲, shrank ▼, appeared ✦ or disappeared ✝ since the previous map, measured from the borders themselves, with a plain-English **why** (a conquest, a collapse, a treaty, a migration).
- **On the map:** what grew is outlined in green, new states in gold, and what was lost is drawn as a dashed red outline from the previous map.
- **🇮🇳 Meanwhile in India:** every era says what was happening in the Indian subcontinent.
- **Tap anything:** any shape tells you its name, what it was part of, its size compared with India, and a short Wikipedia summary. Drag to pan, scroll or use +/− to zoom.

**▶ Open it: https://nikki30.github.io/nikoftime/borders/**

## Data

Borders come from [historical-basemaps](https://github.com/aourednik/historical-basemaps) by André Ourednik and contributors, licensed GPL-3.0 (see `maps/LICENSE-historical-basemaps`). They were simplified for the web with mapshaper. Borders before modern times are approximate, and for most of history huge areas weren't ruled by any state at all. Sometimes a "change" is just the dataset renaming a state; the text says so.

```
index.html, styles.css, app.js   the app
maps/                            the 54 snapshots (TopoJSON, simplified)
snapshots.js                     years, files, and the measured changes between maps
stories.js                       the written history: era titles, overviews, India, why each change happened
```
