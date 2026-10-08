// Theme toggle, and a little surprise: click the wordmark to hear an A minor pentatonic run.

const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch {}
document.querySelector(".theme").addEventListener("click", () => {
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch {}
});

let ctx = null;
function pluck(freq, when) {
  const sr = ctx.sampleRate, n = Math.round(sr / freq), len = Math.floor(sr * 1.4);
  const buf = ctx.createBuffer(1, len, sr), out = buf.getChannelData(0), ring = new Float32Array(n);
  for (let i = 0; i < n; i++) ring[i] = Math.random() * 2 - 1;
  for (let t = 0, i = 0; t < len; t++) { const v = ring[i]; ring[i] = 0.996 * 0.5 * (v + ring[(i + 1) % n]); out[t] = v; i = (i + 1) % n; }
  const src = ctx.createBufferSource(), gain = ctx.createGain();
  src.buffer = buf; gain.gain.value = 0.25; src.connect(gain).connect(ctx.destination); src.start(when);
}
const NOTES = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25]; // A C D E G A C D E
document.querySelectorAll("[data-pluck]").forEach((el) => el.addEventListener("click", () => {
  ctx ||= new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
  const now = ctx.currentTime + 0.03;
  NOTES.forEach((f, i) => pluck(f, now + i * 0.085));
  el.classList.remove("played"); void el.offsetWidth; el.classList.add("played");
}));

// Her eyes follow your cursor (or finger), and drift back to the middle when you leave.
(() => {
  const svg = document.querySelector(".me svg"), pupils = [...document.querySelectorAll(".me .pupil")];
  if (!svg || !pupils.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const look = (x, y) => {
    const m = svg.getScreenCTM(); if (!m) return;
    const inv = m.inverse(), pt = new DOMPoint(x, y).matrixTransform(inv);
    for (const p of pupils) {
      const dx = pt.x - +p.dataset.cx, dy = pt.y - +p.dataset.cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 120);
      p.style.transform = `translate(${(dx / d) * 5 * k}px, ${(dy / d) * 2.6 * k}px)`;
    }
  };
  addEventListener("pointermove", (e) => look(e.clientX, e.clientY), { passive: true });
  document.addEventListener("pointerleave", () => pupils.forEach((p) => (p.style.transform = "")));
  for (const p of pupils) p.style.transition = "transform .12s ease-out";
})();
