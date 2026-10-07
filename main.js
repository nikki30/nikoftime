// Theme toggle, and a little surprise: click the wordmark to hear it.

const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch {}
document.querySelector(".theme-toggle").addEventListener("click", () => {
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch {}
});

// Each letter of the wordmark is a note of A minor pentatonic. Click to play the run.
let ctx = null;
function pluck(freq, when) {
  const sr = ctx.sampleRate, n = Math.round(sr / freq), len = Math.floor(sr * 1.4);
  const buf = ctx.createBuffer(1, len, sr), out = buf.getChannelData(0), ring = new Float32Array(n);
  for (let i = 0; i < n; i++) ring[i] = Math.random() * 2 - 1;
  for (let t = 0, i = 0; t < len; t++) { const v = ring[i]; ring[i] = 0.996 * 0.5 * (v + ring[(i + 1) % n]); out[t] = v; i = (i + 1) % n; }
  const src = ctx.createBufferSource(), gain = ctx.createGain();
  src.buffer = buf; gain.gain.value = 0.28; src.connect(gain).connect(ctx.destination); src.start(when);
}
const NOTES = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25]; // A C D E G A C D E
document.querySelector(".word").addEventListener("click", () => {
  ctx ||= new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
  const now = ctx.currentTime + 0.03;
  document.querySelectorAll(".word span").forEach((el, i) => {
    pluck(NOTES[i], now + i * 0.09);
    setTimeout(() => { el.classList.remove("hop"); void el.offsetWidth; el.classList.add("hop"); }, i * 90);
  });
});
