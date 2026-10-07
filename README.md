# nikoftime

Personal site for Nikita Sivakumar: every project in one place, with a way to use each one.

It's a plain static site: HTML, CSS and a little JavaScript. There's no build step and nothing to install.

```
index.html      page layout
styles.css      styling (light + dark)
main.js         renders projects from projects.json
projects.json   ← the only file you need to edit to add or change projects
favicon.svg
do-not-fret/    the Do Not Fret guitar practice app (see its own README)
.github/workflows/pages.yml   publishes the site on every push to main
```

## Preview locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

(Opening `index.html` straight from disk won't work, because browsers block `fetch("projects.json")` on `file://` URLs.)

## Publish it (GitHub Pages, free)

1. Merge this branch into `main`.
2. On GitHub, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. The `Deploy site to GitHub Pages` workflow runs on every push to `main`. When it finishes, the site is live at
   **https://nikki30.github.io/nikoftime/**

**Custom domain (optional):** buy a domain, then in **Settings → Pages → Custom domain** enter it and follow GitHub's DNS instructions (a `CNAME` record pointing to `nikki30.github.io`). Tick **Enforce HTTPS**.

**Shorter URL (optional):** if you rename this repo to `nikki30.github.io`, the site is served at `https://nikki30.github.io/` with no path.

## Adding or editing a project

Edit `projects.json`:

- **`featured`** shows big cards with a description, tags, a screenshot or GIF, and buttons. Fields:
  - `status`: `"live"` or `"building"`
  - `repo`: GitHub link
  - `demo`: public URL where people can use it. When this is set, a **Try it live** button appears.
  - `run`: requirements plus copy-pasteable commands, shown under **Run it yourself**
  - `image` / `imageAlt`: screenshot or GIF, plus a text description of it for screen readers
  - `docs`: optional extra links
- **`upcoming`** lists projects that are planned but not public yet.

## Making each project usable by the public

Showing a project is easy. Letting a stranger *use* it means hosting it. How depends on the project type:

| Project type | Where to host (free tiers) | Then |
|---|---|---|
| Static frontend / plain HTML | GitHub Pages in that repo | put the URL in `demo` |
| Next.js frontend | Vercel (import the repo) | put the URL in `demo` |
| Python API (FastAPI etc.) | Hugging Face Spaces (Docker), Render, or Fly.io | point the frontend at it |
| CLI / library (Rust, Python) | crates.io / PyPI release, or GitHub Releases binaries | keep the `run` steps current |
| Notebook / ML coursework | link the repo; add a Colab badge if it's runnable | — |

### RAG Lab: what needs to change before it can be public

- The frontend calls `http://localhost:8000` in 7 places in `frontend/app/page.tsx`. Replace these with an env var, such as `process.env.NEXT_PUBLIC_API_URL`, so a hosted frontend can reach a hosted backend.
- `backend/requirements.txt` is referenced in the README but isn't in the repo yet. Without it, `pip install -r requirements.txt` fails.
- The backend downloads 90–400 MB embedding models. A Hugging Face Space (CPU basic, 16 GB RAM) handles this. Most free 512 MB hosts can't.
- Add CORS on the FastAPI app so it allows the Vercel domain.
- Deploy the frontend to Vercel with `NEXT_PUBLIC_API_URL` set, then put that URL in `demo`.
