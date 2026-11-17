// Wraps the single-file build in a mobile shell, so the phone layout can be tried
// on an iPhone (full screen) or on an iPad / desktop (inside a phone frame).
// Usage: node artifact/mobile.mjs [in.html] [out.html]
//   in  defaults to artifact/wardrobe.html (from `npm run build:html`)
//   out defaults to artifact/wardrobe-mobile.html
//
// The app runs in an iframe whose width is a real phone width, so the app's own
// responsive breakpoints pick the mobile layout even on a wide screen.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const input = process.argv[2] ?? path.join(root, "artifact", "wardrobe.html");
const out = process.argv[3] ?? path.join(root, "artifact", "wardrobe-mobile.html");

let app = readFileSync(input, "utf8");
// Keep only the app itself (from <title> to the last </script>), dropping any host wrapper.
const start = app.indexOf("<title>");
const end = app.lastIndexOf("</script>");
if (start >= 0 && end > start) app = app.slice(start, end + "</script>".length);

const inner = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${app}</body></html>`;
// JSON with "<" escaped can sit safely inside a <script> element.
const payload = JSON.stringify(inner).replace(/</g, "\\u003c");

const shell = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Wardrobe">
<meta name="theme-color" content="#f7f5f1">
<title>Project Wardrobe — versione mobile</title>
<style>
:root{--paper:#f7f5f1;--ink:#2b2a28;--muted:#77736c;--accent:#4f8a6c;--accent-ink:#3c6e55;--accent-soft:#e2eee6;--line:rgba(43,42,40,.09);
  --font:"Inter",ui-sans-serif,system-ui,-apple-system,sans-serif;color-scheme:light}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{font:14px/1.45 var(--font);color:var(--ink);background:
  radial-gradient(1200px 700px at 15% -10%,#e7f0ea 0%,transparent 60%),
  radial-gradient(900px 600px at 110% 110%,#efe9df 0%,transparent 55%),var(--paper);
  -webkit-font-smoothing:antialiased;overflow:hidden}
button{font:inherit;color:inherit}

/* ---------- framed mode (iPad, desktop) ---------- */
.stage{height:100dvh;display:flex;align-items:center;justify-content:center;gap:40px;padding:24px}
.panel{width:260px;flex:none;display:flex;flex-direction:column;gap:18px}
.brand{font-weight:650;font-size:20px;letter-spacing:-.01em}
.brand small{display:block;font-weight:500;font-size:13px;color:var(--muted);margin-top:4px;letter-spacing:0}
.group{display:flex;flex-direction:column;gap:8px}
.label{font-size:12px;font-weight:600;color:var(--muted)}
.seg{display:flex;flex-wrap:wrap;gap:6px}
.pill{border:1px solid var(--line);background:rgba(255,255,255,.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  border-radius:999px;padding:7px 13px;font-size:13px;font-weight:500;cursor:pointer;
  box-shadow:0 1px 2px rgba(43,42,40,.05);transition:background .15s,border-color .15s,transform .1s}
.pill:hover{background:#fff}
.pill:active{transform:scale(.97)}
.pill[aria-pressed="true"]{color:#fff;border-color:transparent;
  background:linear-gradient(180deg,#5d9a7a 0%,var(--accent) 55%,var(--accent-ink) 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 4px 12px rgba(79,138,108,.28)}
.note{font-size:12.5px;color:var(--muted);margin:0}
.note b{color:var(--ink);font-weight:600}

.fit{flex:none;position:relative}
.device{position:absolute;left:0;top:0;transform-origin:0 0;border-radius:60px;padding:12px;
  background:linear-gradient(145deg,#f4f2ee 0%,#d9d5cd 45%,#c7c2b8 100%);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.7),inset 0 -2px 6px rgba(0,0,0,.08),
    0 2px 4px rgba(43,42,40,.06),0 24px 48px -12px rgba(43,42,40,.22),0 60px 120px -40px rgba(43,42,40,.25)}
.screen{position:relative;width:100%;height:100%;border-radius:48px;overflow:hidden;background:var(--paper);
  display:flex;flex-direction:column;box-shadow:0 0 0 2px #1c1c1b}
.status{flex:none;height:54px;display:flex;align-items:center;justify-content:space-between;padding:6px 30px 0 34px;
  font:600 15px/1 -apple-system,"SF Pro Text",var(--font);color:#111;position:relative;background:var(--paper)}
.island{position:absolute;left:50%;top:11px;transform:translateX(-50%);width:122px;height:35px;border-radius:20px;background:#0b0b0b}
.icons{display:flex;gap:6px;align-items:center}
.home{flex:none;height:30px;display:flex;align-items:center;justify-content:center;background:var(--paper)}
.home i{width:134px;height:5px;border-radius:3px;background:#111;opacity:.85}
iframe{display:block;width:100%;flex:1;border:0;background:var(--paper)}

/* ---------- full-screen mode (phones, or chosen) ---------- */
body.full{overflow:hidden;background:var(--paper)}
body.full .stage{padding:0;gap:0;display:block}
body.full .panel{display:none}
body.full .fit{width:100%!important;height:100dvh!important}
body.full .device{position:static;transform:none!important;width:100%!important;height:100%!important;border-radius:0;padding:0;background:none;box-shadow:none}
body.full .screen{border-radius:0;box-shadow:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);
  padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px)}
body.full .status,body.full .home{display:none}
.exit{display:none}
body.full.chosen .exit{display:flex;position:fixed;right:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:5}

/* narrow frame host (iPad portrait): panel goes on top */
@media (max-width:820px){
  .stage{flex-direction:column;gap:16px;padding:16px}
  .panel{width:auto;max-width:560px;align-items:center;text-align:center;gap:10px}
  .panel .seg{justify-content:center}
  .panel .note{display:none}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="stage">
  <aside class="panel" aria-label="Controlli anteprima">
    <div class="brand">Project Wardrobe<small>Versione mobile dell'app</small></div>
    <div class="group">
      <span class="label">Dispositivo</span>
      <div class="seg" id="devices"></div>
    </div>
    <div class="group">
      <span class="label">Dati</span>
      <div class="seg">
        <button class="pill" id="reload" type="button">Ricarica app</button>
        <button class="pill" id="reset" type="button">Ripristina dati demo</button>
      </div>
    </div>
    <p class="note">È la stessa app della versione web, mostrata alla larghezza reale di un telefono. I dati restano salvati in questo browser.</p>
    <p class="note">Su iPhone si apre a schermo intero. Per usarla come un'app: <b>Condividi → Aggiungi alla schermata Home</b>.</p>
    <p class="note">Le foto Unsplash possono non comparire se l'host blocca le immagini esterne: in quel caso si vedono le sagome generate.</p>
  </aside>
  <div class="fit" id="fit">
    <div class="device" id="device">
      <div class="screen">
        <div class="status" aria-hidden="true">
          <span id="clock">9:41</span><span class="island"></span>
          <span class="icons">
            <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="#111"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#111"/><rect x="10" y="3" width="3" height="9" rx="1" fill="#111"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#111"/></svg>
            <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0L8 11.5Zm-4.2-4.3L2.3 5.7a8 8 0 0 1 11.4 0l-1.5 1.5a5.9 5.9 0 0 0-8.4 0ZM.6 4 0 3.4a11.3 11.3 0 0 1 16 0l-.6.6-.9.9a10 10 0 0 0-13 0L.6 4Z" fill="#111"/></svg>
            <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#111" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="#111"/><rect x="24.5" y="4.5" width="1.6" height="4" rx=".8" fill="#111" opacity=".45"/></svg>
          </span>
        </div>
        <iframe id="app" title="Project Wardrobe"></iframe>
        <div class="home" aria-hidden="true"><i></i></div>
      </div>
    </div>
  </div>
</div>
<button class="pill exit" id="exit" type="button">Mostra cornice</button>
<script id="app-src" type="application/json">${payload}</script>
<script>
(function () {
  var DEVICES = [
    { id: "se", label: "iPhone SE", w: 375, h: 667, notch: false },
    { id: "15", label: "iPhone 15", w: 393, h: 852, notch: true },
    { id: "max", label: "iPhone Pro Max", w: 430, h: 932, notch: true },
    { id: "full", label: "Schermo intero" }
  ];
  var STORE_KEY = "project-wardrobe:v1";
  var PREF_KEY = "project-wardrobe:mobile-shell";
  var BEZEL = 12;
  var frame = document.getElementById("app");
  var device = document.getElementById("device");
  var fit = document.getElementById("fit");
  var src = JSON.parse(document.getElementById("app-src").textContent);

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function load() { frame.srcdoc = src; }

  var isPhone = Math.min(screen.width, screen.height) < 600 || window.innerWidth < 600;
  var current = store(PREF_KEY) || "15";
  if (!DEVICES.some(function (d) { return d.id === current; })) current = "15";

  var seg = document.getElementById("devices");
  DEVICES.forEach(function (d) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "pill"; b.textContent = d.label; b.dataset.id = d.id;
    b.addEventListener("click", function () { current = d.id; store(PREF_KEY, d.id); apply(); });
    seg.appendChild(b);
  });

  function apply() {
    var full = isPhone || current === "full";
    document.body.classList.toggle("full", full);
    document.body.classList.toggle("chosen", !isPhone && current === "full");
    Array.prototype.forEach.call(seg.children, function (b) { b.setAttribute("aria-pressed", String(b.dataset.id === current)); });
    if (full) return;
    var d = DEVICES.filter(function (x) { return x.id === current; })[0];
    var W = d.w + BEZEL * 2, H = d.h + BEZEL * 2;
    device.style.width = W + "px"; device.style.height = H + "px";
    device.querySelector(".island").style.display = d.notch ? "" : "none";
    device.querySelector(".status").style.height = d.notch ? "54px" : "24px";
    device.querySelector(".status").style.paddingTop = d.notch ? "6px" : "0";
    device.querySelector(".home").style.display = d.notch ? "" : "none";
    device.style.borderRadius = d.notch ? "60px" : "44px";
    device.querySelector(".screen").style.borderRadius = d.notch ? "48px" : "32px";
    var narrow = window.innerWidth <= 820;
    var availH = window.innerHeight - (narrow ? 150 : 48);
    var availW = window.innerWidth - (narrow ? 32 : 260 + 40 + 48);
    var s = Math.min(1, availH / H, availW / W);
    device.style.transform = "scale(" + s + ")";
    fit.style.width = W * s + "px"; fit.style.height = H * s + "px";
  }

  function tick() {
    var n = new Date();
    document.getElementById("clock").textContent = n.getHours() + ":" + String(n.getMinutes()).padStart(2, "0");
  }

  document.getElementById("reload").addEventListener("click", load);
  // Two-tap confirmation (browser dialogs can be blocked where the page is hosted).
  var reset = document.getElementById("reset"), armed = null;
  reset.addEventListener("click", function () {
    if (!armed) {
      reset.textContent = "Tocca ancora per confermare";
      armed = setTimeout(function () { armed = null; reset.textContent = "Ripristina dati demo"; }, 3500);
      return;
    }
    clearTimeout(armed); armed = null; reset.textContent = "Ripristina dati demo";
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    load();
  });
  document.getElementById("exit").addEventListener("click", function () { current = "15"; store(PREF_KEY, "15"); apply(); });
  window.addEventListener("resize", apply);

  tick(); setInterval(tick, 15000);
  apply(); load();
})();
</script>
</body>
</html>
`;

writeFileSync(out, shell);
console.log(`wrote ${out} (${(shell.length / 1024).toFixed(0)} KB)`);
