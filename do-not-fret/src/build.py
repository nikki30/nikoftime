"""Builds do-not-fret/index.html from the parts in this folder.

    python3 do-not-fret/src/build.py

head.part   <title>, fonts and the main stylesheet (opens a <style> block)
extra.css   more styles (still inside that <style> block)
body.part   closes </style>, then the page markup and all the JavaScript
seed.json   starter content: theory lessons, skills, the daily routine, example songs
"""
import json, pathlib

src = pathlib.Path(__file__).parent
head, css, body = (src / "head.part").read_text(), (src / "extra.css").read_text(), (src / "body.part").read_text()
seed = json.loads((src / "seed.json").read_text())
assert body.startswith("</style>")

pre = (
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 rx=%227%22 fill=%22%232f5a34%22/%3E%3Ctext x=%2216%22 y=%2223%22 font-size=%2220%22 text-anchor=%22middle%22 fill=%22%23f3f1e4%22%3E%E2%99%AB%3C/text%3E%3C/svg%3E">\n'
)
desc = ('<meta name="description" content="A free guitar practice app: a daily routine with clean-tempo tracking, theory lessons '
        'with play-along fretboards, songs with tab play-along, and a practice diary. Runs in your browser.">')
seed_tag = '<script type="application/json" id="seed">' + json.dumps(seed, ensure_ascii=False).replace("</", "<\\/") + "</script>\n"
html = pre + head.replace("<title>Do Not Fret</title>", "<title>Do Not Fret</title>\n" + desc) + css + "</style>\n" + seed_tag + body[len("</style>"):]
(src.parent / "index.html").write_text(html)
print(f"wrote {src.parent / 'index.html'} ({len(html) // 1024} KB)")
