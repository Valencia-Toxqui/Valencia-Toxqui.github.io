/* ============================================================
   main.js — shared behaviour for both pages
   - builds a scenic, animated background: a phage on a bicycle
     riding continuously along a rolling hill, with a Popocatépetl
     volcano (a nod to Puebla), pines, drifting clouds & a sun
   - nav toggle, scroll-reveal, animated counters, progress rail
   All vanilla. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* path the bike rides on — reused for the dashed line AND motion */
  var RIDE = "M -60 334 Q 90 298 220 320 Q 360 350 500 298 Q 650 252 800 288 Q 950 320 1090 254 Q 1180 226 1260 246";

  /* ---------- the phage-cyclist (inner SVG group) ---------- */
  function cyclistParts() {
    function wheel(cx, cy) {
      return '<circle cx="' + cx + '" cy="' + cy + '" r="15" fill="none" stroke="#123E73" stroke-width="2.6"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="2.4" fill="#123E73"/>' +
        '<g stroke="#1C5AA6" stroke-width="1.2">' +
        '<line x1="' + cx + '" y1="' + (cy - 14) + '" x2="' + cx + '" y2="' + (cy + 14) + '"/>' +
        '<line x1="' + (cx - 14) + '" y1="' + cy + '" x2="' + (cx + 14) + '" y2="' + cy + '"/>' +
        '<line x1="' + (cx - 10) + '" y1="' + (cy - 10) + '" x2="' + (cx + 10) + '" y2="' + (cy + 10) + '"/>' +
        '<line x1="' + (cx - 10) + '" y1="' + (cy + 10) + '" x2="' + (cx + 10) + '" y2="' + (cy - 10) + '"/></g>';
    }
    return [
      '<g class="cyc-bob">',
      '<g fill="none" stroke="#123E73" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">',
      '<path d="M58 74 L52 44 M52 44 L82 42 M82 42 L92 74 M58 74 L82 42 M58 74 L30 74 M52 44 L30 74"/>',
      '<path d="M82 42 L88 34 M86 34 L92 34 M52 44 L46 41 L56 41"/>',
      '</g>',
      '<g class="cyc-wheel">' + wheel(30, 74) + '</g>',
      '<g class="cyc-wheel">' + wheel(92, 74) + '</g>',
      '<g class="cyc-pedals"><circle cx="58" cy="74" r="3" fill="#123E73"/>',
      '<line x1="58" y1="74" x2="58" y2="84" stroke="#C0563A" stroke-width="3" stroke-linecap="round"/>',
      '<line x1="58" y1="74" x2="58" y2="64" stroke="#C0563A" stroke-width="3" stroke-linecap="round"/>',
      '<line x1="55" y1="85" x2="62" y2="85" stroke="#123E73" stroke-width="2.6" stroke-linecap="round"/>',
      '<line x1="54" y1="63" x2="61" y2="63" stroke="#123E73" stroke-width="2.6" stroke-linecap="round"/></g>',
      '<g fill="none" stroke="#1C5AA6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">',
      '<path d="M50 44 L56 60 L58 74"/><path d="M50 44 L60 56 L82 42"/></g>',
      '<line x1="44" y1="34" x2="50" y2="44" stroke="#123E73" stroke-width="3" stroke-linecap="round"/>',
      '<polygon points="44,8 54,14 54,26 44,32 34,26 34,14" fill="#1C5AA6" stroke="#123E73" stroke-width="2.2" stroke-linejoin="round"/>',
      '<g stroke="#7FB2E6" stroke-width="1.2" fill="none"><line x1="44" y1="8" x2="44" y2="32"/><line x1="34" y1="14" x2="54" y2="26"/><line x1="54" y1="14" x2="34" y2="26"/></g>',
      '<g stroke="#E9A521" stroke-width="2" stroke-linecap="round"><line x1="40" y1="9" x2="37" y2="3"/><line x1="48" y1="9" x2="51" y2="3"/></g>',
      '<circle cx="37" cy="3" r="1.8" fill="#E9A521"/><circle cx="51" cy="3" r="1.8" fill="#E9A521"/>',
      '</g>'
    ].join("");
  }

  function pine(x, y, h) {
    return '<g fill="#247a5e">' +
      '<rect x="' + (x - 2) + '" y="' + (y - 5) + '" width="4" height="8" fill="#6b4a2b"/>' +
      '<polygon points="' + x + ',' + (y - h) + ' ' + (x - h * 0.52) + ',' + (y - h * 0.32) + ' ' + (x + h * 0.52) + ',' + (y - h * 0.32) + '"/>' +
      '<polygon points="' + x + ',' + (y - h * 0.72) + ' ' + (x - h * 0.62) + ',' + (y - h * 0.05) + ' ' + (x + h * 0.62) + ',' + (y - h * 0.05) + '"/></g>';
  }
  function cloud(x, y, s, dur, delay) {
    var g = '<g class="cloud" style="animation-duration:' + dur + 's;animation-delay:' + delay + 's" fill="#dce8f6" opacity=".8">' +
      '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (34 * s) + '" ry="' + (15 * s) + '"/>' +
      '<circle cx="' + (x - 22 * s) + '" cy="' + (y + 3 * s) + '" r="' + (13 * s) + '"/>' +
      '<circle cx="' + (x + 24 * s) + '" cy="' + (y + 4 * s) + '" r="' + (12 * s) + '"/>' +
      '<circle cx="' + (x + 4 * s) + '" cy="' + (y - 9 * s) + '" r="' + (15 * s) + '"/></g>';
    return g;
  }

  /* ---------- build the full scene ---------- */
  function buildScene() {
    var track = document.querySelector(".track");
    if (!track) return null;
    var trees =
      pine(72, 350, 20) + pine(108, 346, 15) + pine(150, 340, 26) + pine(188, 344, 18) +
      pine(430, 302, 22) + pine(470, 300, 16) +
      pine(905, 336, 22) + pine(955, 330, 26) + pine(1000, 334, 18) + pine(1045, 328, 20);

    track.innerHTML =
      '<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice">' +
        // sun
        '<circle cx="1040" cy="84" r="42" fill="#E9A521" opacity=".5"/>' +
        // volcano Popocatépetl (nod to Puebla)
        '<g opacity=".34">' +
          '<polygon points="320,138 214,300 426,300" fill="#69819f"/>' +
          '<polygon points="320,138 286,190 305,180 320,196 335,180 352,190" fill="#f2f7fc"/>' +
        '</g>' +
        // far mountains
        '<path opacity=".24" fill="#4f7d86" d="M-60 296 L110 244 L250 300 L380 236 L540 300 L690 244 L840 300 L1000 248 L1150 300 L1260 268 L1260 400 L-60 400 Z"/>' +
        // drifting clouds
        cloud(260, 96, 1, 90, -10) + cloud(720, 70, 0.8, 120, -55) + cloud(540, 120, 0.6, 150, -90) +
        // mid hills
        '<path opacity=".22" fill="#2F8F6F" d="M-60 360 Q200 330 420 352 Q680 374 920 332 Q1120 302 1260 324 L1260 400 L-60 400 Z"/>' +
        // trees on the hills
        '<g opacity=".55">' + trees + '</g>' +
        // front hill (ground)
        '<path opacity=".3" fill="#2F8F6F" d="' + RIDE + ' L1260 400 L-60 400 Z"/>' +
        // the dashed riding line
        '<path id="ride-path" d="' + RIDE + '" fill="none" stroke="#1C5AA6" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round" opacity=".5"/>' +
        // the rider
        '<g id="cyclist">' + cyclistParts() + '</g>' +
      '</svg>';
    return track;
  }

  /* ---------- ride the bike along the path ---------- */
  function setupRide() {
    var track = buildScene();
    if (!track) return;
    var path = document.getElementById("ride-path");
    var bike = document.getElementById("cyclist");
    if (!path || !bike) return;
    var L = path.getTotalLength();
    var SC = 0.82, OX = 61, OY = 90; // scale + wheel-contact offset
    function place(d) {
      var p = path.getPointAtLength(d % L);
      var p2 = path.getPointAtLength((d + 1.5) % L);
      var ang = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
      bike.setAttribute("transform",
        "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") rotate(" + ang.toFixed(1) + ") scale(" + SC + ") translate(" + (-OX) + " " + (-OY) + ")");
    }
    if (reduce) { place(L * 0.34); return; } // static, no motion
    var speed = 78; // user-units per second
    var t0 = null;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      place(((ts - t0) / 1000) * speed);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- nav toggle ---------- */
  function setupNav() {
    var toggle = document.querySelector(".nav__toggle");
    var links = document.querySelector(".nav__links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }

  /* ---------- scroll reveal ---------- */
  function setupReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- animated counters ---------- */
  function setupCounters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduce) { el.textContent = target + suffix; return; }
      var start = null, dur = 1300;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- progress rail (cv page) ---------- */
  function setupRail() {
    var rail = document.querySelector(".cv-rail");
    if (!rail) return;
    function upd() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      rail.style.width = p + "%";
    }
    upd();
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
  }

  /* ---------- active nav link on home ---------- */
  function setupSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
    var map = {};
    links.forEach(function (l) { var id = l.getAttribute("href").slice(1); if (id) map[id] = l; });
    var sections = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var l = map[en.target.id];
        if (l && en.isIntersecting) {
          links.forEach(function (x) { x.classList.remove("active"); });
          l.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNav();
    setupRide();
    setupReveal();
    setupCounters();
    setupRail();
    setupSpy();
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
