// Renders the site from projects.json. To add or edit a project, edit that file only.

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const STATUS_LABEL = { live: "Live", building: "In progress" };

function themeToggle() {
  const btn = document.querySelector(".theme-toggle");
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.dataset.theme = saved;
  } catch {}
  btn.addEventListener("click", () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  });
}

function projectCard(p) {
  const tryBtn = p.demo
    ? `<a class="btn primary" href="${esc(p.demo)}" rel="noopener">Try it live ↗</a>`
    : "";
  const repoBtn = p.repo ? `<a class="btn" href="${esc(p.repo)}" rel="noopener">View code ↗</a>` : "";
  const docs = p.docs?.length
    ? `<div class="docs">Guides: ${p.docs.map((d) => `<a href="${esc(d.url)}" rel="noopener">${esc(d.label)}</a>`).join("")}</div>`
    : "";
  const run = p.run
    ? `<details class="run">
         <summary>Run it yourself</summary>
         <div class="run-body">
           ${p.run.requirements ? `<div class="req">${esc(p.run.requirements)}</div>` : ""}
           <pre><button class="copy" type="button">Copy</button><code>${esc(p.run.steps.join("\n"))}</code></pre>
         </div>
       </details>`
    : "";
  const media = p.image
    ? `<div class="media"><img src="${esc(p.image)}" alt="${esc(p.imageAlt || p.name)}" loading="lazy"></div>`
    : "";

  return `
    <article class="card${p.image ? " has-image" : ""}" data-tags="${esc(p.tags.join("|"))}">
      ${media}
      <div class="body">
        <span class="status ${esc(p.status)}">${esc(STATUS_LABEL[p.status] || p.status)}</span>
        <h3>${esc(p.name)}</h3>
        ${p.tagline ? `<p class="tagline">${esc(p.tagline)}</p>` : ""}
        <p>${esc(p.description)}</p>
        <div class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="cta">${tryBtn}${repoBtn}</div>
        ${docs}
        ${run}
      </div>
    </article>`;
}

function renderFilters(projects) {
  const box = document.querySelector(".filters");
  const tags = ["All", ...new Set(projects.flatMap((p) => p.tags))];
  box.innerHTML = tags
    .map((t, i) => `<button class="chip" type="button" aria-pressed="${i === 0}">${esc(t)}</button>`)
    .join("");
  box.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    box.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    const tag = chip.textContent;
    document.querySelectorAll("#featured .card").forEach((card) => {
      card.hidden = tag !== "All" && !card.dataset.tags.split("|").includes(tag);
    });
  });
}

async function renderArchive({ githubUser, exclude = [] }, featuredRepos) {
  const list = document.getElementById("archive-list");
  const skip = new Set([...exclude, ...featuredRepos].map((n) => n.toLowerCase()));
  try {
    const res = await fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error(res.status);
    const repos = (await res.json()).filter((r) => !r.fork && !r.archived && !skip.has(r.name.toLowerCase()));
    list.innerHTML = repos
      .map((r) => `
        <li><a href="${esc(r.homepage || r.html_url)}" rel="noopener">
          <div class="name">${esc(r.name.replace(/[-_]/g, " "))}</div>
          <div class="desc">${esc(r.description || "No description yet.")}</div>
          <div class="meta">
            ${r.language ? `<span>${esc(r.language)}</span>` : ""}
            <span>${new Date(r.pushed_at).getFullYear()}</span>
            ${r.homepage ? "<span>Live demo</span>" : ""}
          </div>
        </a></li>`)
      .join("");
  } catch {
    list.innerHTML = `<li class="muted">Couldn't load the list right now. <a href="https://github.com/${esc(githubUser)}?tab=repositories" rel="noopener">See all repositories on GitHub ↗</a></li>`;
  }
}

function wireCopyButtons() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy");
    if (!btn) return;
    const code = btn.parentElement.querySelector("code").textContent;
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = "Copied";
    } catch {
      btn.textContent = "Select & copy";
    }
    setTimeout(() => (btn.textContent = "Copy"), 1500);
  });
}

async function init() {
  themeToggle();
  wireCopyButtons();
  document.getElementById("year").textContent = new Date().getFullYear();

  const data = await (await fetch("projects.json")).json();

  document.getElementById("featured").innerHTML = data.featured.map(projectCard).join("");
  renderFilters(data.featured);

  document.getElementById("upcoming-list").innerHTML = data.upcoming
    .map((u) => `<li><h3>${esc(u.name)}</h3><p>${esc(u.description)}</p>
      <div class="tags">${u.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div></li>`)
    .join("");
  if (!data.upcoming.length) document.getElementById("upcoming").hidden = true;

  const featuredRepos = data.featured.map((p) => p.repo?.split("/").pop()).filter(Boolean);
  renderArchive(data.archive, featuredRepos);
}

init();
