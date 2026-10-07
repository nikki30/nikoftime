import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate, geoDistance, feature } from "../vendor/geo.mjs";

const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

export function createGlobe(canvas) {
  const ctx = canvas.getContext("2d");
  const proj = geoOrthographic().clipAngle(90).precision(0.6);
  const path = geoPath(proj, ctx);
  const grat = geoGraticule10();
  const G = { land: null, dots: [], here: null, trail: [], rider: null, rot: [-10, -20, 0], zoom: 1, oy: 0, oyTarget: 0, dragging: false, idle: true, w: 0, h: 0, dpr: 1 };

  (window.__WORLD ? Promise.resolve(window.__WORLD) : fetch(new URL("../vendor/countries-110m.json", import.meta.url)).then((r) => r.json())).then((topo) => { G.land = feature(topo, topo.objects.countries); draw(); });

  function size() {
    const r = canvas.getBoundingClientRect();
    G.dpr = Math.min(2, window.devicePixelRatio || 1); G.w = r.width; G.h = r.height;
    canvas.width = r.width * G.dpr; canvas.height = r.height * G.dpr;
    draw();
  }
  new ResizeObserver(size).observe(canvas);

  function draw() {
    if (!G.w) return;
    const { w, h, dpr } = G, R = Math.min(w, h) * 0.44 * G.zoom;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    const cy = h / 2 + G.oy * h;
    proj.scale(R).translate([w / 2, cy]).rotate(G.rot);
    // glow
    const glow = ctx.createRadialGradient(w / 2, cy, R * 0.9, w / 2, cy, R * 1.25);
    glow.addColorStop(0, css("--glow")); glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    // ocean
    const sea = ctx.createRadialGradient(w / 2 - R * 0.35, cy - R * 0.4, R * 0.1, w / 2, cy, R);
    sea.addColorStop(0, css("--sea-1")); sea.addColorStop(1, css("--sea-2"));
    ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = sea; ctx.fill();
    ctx.beginPath(); path(grat); ctx.strokeStyle = css("--grat"); ctx.lineWidth = 0.6; ctx.stroke();
    if (G.land) {
      ctx.beginPath(); path(G.land); ctx.fillStyle = css("--land"); ctx.fill();
      ctx.strokeStyle = css("--border"); ctx.lineWidth = 0.5; ctx.stroke();
    }
    // stations
    ctx.fillStyle = css("--dot");
    const center = [-G.rot[0], -G.rot[1]];
    for (const s of G.dots) {
      if (geoDistance([s.lon, s.lat], center) > 1.55) continue;
      const p = proj([s.lon, s.lat]); if (!p) continue;
      ctx.fillRect(p[0] - 0.9, p[1] - 0.9, 1.8, 1.8);
    }
    // trail of the current ride
    if (G.trail.length > 1) {
      ctx.beginPath(); path({ type: "LineString", coordinates: G.trail });
      ctx.setLineDash([2, 6]); ctx.lineCap = "round"; ctx.strokeStyle = css("--trail"); ctx.lineWidth = 2.4; ctx.stroke(); ctx.setLineDash([]);
    }
    // where you are
    if (G.here && geoDistance([G.here.lon, G.here.lat], center) < 1.5) {
      const p = proj([G.here.lon, G.here.lat]), t = (performance.now() % 1800) / 1800;
      ctx.beginPath(); ctx.arc(p[0], p[1], 6 + t * 18, 0, Math.PI * 2); ctx.strokeStyle = css("--pin"); ctx.globalAlpha = 1 - t; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); ctx.fillStyle = css("--pin"); ctx.fill();
      ctx.beginPath(); ctx.arc(p[0], p[1], 2.4, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
    }
    // the balloon, mid-ride
    if (G.rider) {
      const p = proj(G.rider.at);
      if (p) drawBalloon(ctx, p[0], p[1] - 10 - G.rider.lift * 26, G.rider.sway);
    }
  }

  // idle spin + pulse
  let last = performance.now();
  (function loop(now) {
    const dt = Math.min(64, now - last); last = now;
    if (G.idle && !G.dragging && !G.here) G.rot[0] += dt * 0.006;
    G.oy += (G.oyTarget - G.oy) * Math.min(1, dt / 160);
    draw(); requestAnimationFrame(loop);
  })(last);

  // drag to look around
  let start = null;
  canvas.addEventListener("pointerdown", (e) => { if (G.rider) return; G.dragging = true; start = { x: e.clientX, y: e.clientY, rot: [...G.rot] }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!G.dragging || !start) return;
    const k = 70 / (Math.min(G.w, G.h) * G.zoom);
    G.rot = [start.rot[0] + (e.clientX - start.x) * k * 3.2, Math.max(-80, Math.min(80, start.rot[1] - (e.clientY - start.y) * k * 3.2)), 0];
  });
  canvas.addEventListener("pointerup", () => { G.dragging = false; start = null; });

  return {
    setStations(list) { G.dots = list; },
    // Slide the globe up so the landing spot stays visible above a bottom sheet.
    lift(fraction) { G.oyTarget = -fraction; },
    // Fly from where we are to the new station. Resolves when the balloon lands.
    ride(to) {
      const from = G.here ? [G.here.lon, G.here.lat] : [-G.rot[0], -G.rot[1]];
      const dest = [to.lon, to.lat], interp = geoInterpolate(from, dest), dist = geoDistance(from, dest);
      const dur = 1600 + Math.min(3200, dist * 1100);
      G.here = null; G.trail = [from]; G.idle = false;
      return new Promise((resolve) => {
        const t0 = performance.now();
        (function step(now) {
          const raw = Math.min(1, (now - t0) / dur), t = raw < 0.5 ? 4 * raw ** 3 : 1 - (-2 * raw + 2) ** 3 / 2;
          const at = interp(t);
          G.rot = [-at[0], -at[1], 0];
          G.zoom = 1 - Math.sin(Math.PI * raw) * Math.min(0.32, dist * 0.12);
          G.trail.push(at);
          G.rider = { at, lift: Math.sin(Math.PI * raw), sway: Math.sin(now / 180) * 0.12 };
          if (raw < 1) requestAnimationFrame(step);
          else { G.rider = null; G.here = to; G.zoom = 1; resolve(); }
        })(t0);
      });
    },
    distanceKm(a, b) { return geoDistance([a.lon, a.lat], [b.lon, b.lat]) * 6371; },
  };
}

function drawBalloon(ctx, x, y, sway) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(sway);
  // ropes
  ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-7, 2); ctx.lineTo(-4, 14); ctx.moveTo(7, 2); ctx.lineTo(4, 14); ctx.stroke();
  // envelope
  const g = ctx.createLinearGradient(-14, -24, 14, 4); g.addColorStop(0, "#ffd166"); g.addColorStop(0.5, "#ff7a59"); g.addColorStop(1, "#c84b7a");
  ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(-18, -4, -16, -30, 0, -30); ctx.bezierCurveTo(16, -30, 18, -4, 0, 6); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -30); ctx.bezierCurveTo(-7, -20, -6, -4, 0, 6); ctx.moveTo(0, -30); ctx.bezierCurveTo(7, -20, 6, -4, 0, 6); ctx.stroke();
  // basket
  ctx.fillStyle = "#8a5a34"; ctx.fillRect(-5, 14, 10, 7);
  ctx.restore();
}
