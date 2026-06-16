/* ============================================================
   main.js — shared behaviour for both pages
   - builds a scenic, animated background: a phage on a bicycle
     riding continuously along a rolling hill, with a Popocatépetl
     volcano (a nod to Puebla) that erupts now and then, pines,
     drifting clouds & a sun
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
        // eruption effects (lava + ash), populated by setupVolcano()
        '<g id="volcano-fx"></g>' +
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
        // a bacterium that the phages lyse, populated by setupLysis()
        '<g id="lysis-fx"></g>' +
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

  /* ---------- volcano: erupt every so often ---------- */
  function setupVolcano() {
    var fx = document.getElementById("volcano-fx");
    if (!fx || reduce) return; // no eruptions when motion is reduced
    var NS = "http://www.w3.org/2000/svg";
    var CX = 320, CY = 138;            // summit / crater
    var GRAV = 90;                     // user-units / s^2
    var parts = [];                    // active lava bombs (fountain)
    var flows = [];                    // lava running down the slopes
    var smoke = [];                    // active ash puffs
    var LAVA = ["#ff7a1a", "#ff5e10", "#ff8c2b", "#e8521a"]; // orange tones
    // unit vectors down the two cone slopes (apex 320,138 -> base 214/426,300)
    var SLOPES = [{ dx: -0.543, dy: 0.831 }, { dx: 0.543, dy: 0.831 }];
    var glow = null, glowT = 0, glowDur = 0;
    var last = null, trickleAcc = 0;

    function el(tag, attrs) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    }

    // a single bit of lava sliding down a slope
    function addFlow(d0, jit, fr, sp, op, life) {
      var dir = SLOPES[(Math.random() * 2) | 0];
      var node = el("circle", { cx: CX, cy: CY, r: fr, fill: LAVA[(Math.random() * LAVA.length) | 0] });
      fx.appendChild(node);
      flows.push({
        node: node,
        x: CX + dir.dx * d0 - dir.dy * jit,
        y: CY + dir.dy * d0 + dir.dx * jit,
        vx: dir.dx * sp, vy: dir.dy * sp,
        op: op, life: life, age: 0
      });
    }

    function erupt() {
      // crater glow flares up
      if (!glow) {
        glow = el("ellipse", { cx: CX, cy: CY + 1, rx: 22, ry: 8, fill: "#ff7a1a" });
        fx.appendChild(glow);
      }
      glowDur = 2.4 + Math.random() * 1.4;
      glowT = 0;

      // lava fountain — orange bombs arc up and out of the crater
      var n = 20 + Math.floor(Math.random() * 14);
      for (var i = 0; i < n; i++) {
        var ang = (-Math.PI / 2) + (Math.random() - 0.5) * 1.5; // up, well spread
        var sp = 40 + Math.random() * 60;
        var r = 2 + Math.random() * 2.4;
        var node = el("circle", { cx: CX, cy: CY, r: r, fill: LAVA[i % LAVA.length] });
        fx.appendChild(node);
        parts.push({
          node: node, x: CX, y: CY,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
          life: 1.8 + Math.random() * 1.3, age: 0
        });
      }

      // a surge of lava gushing down both slopes
      var fc = 22 + Math.floor(Math.random() * 12);
      for (var f = 0; f < fc; f++) {
        addFlow(Math.random() * 120, (Math.random() - 0.5) * 7,
          1.8 + Math.random() * 1.8, 16 + Math.random() * 16,
          0.95, 2.6 + Math.random() * 2.2);
      }

      // ash billowing out in all (upward) directions
      var m = 9 + Math.floor(Math.random() * 5);
      for (var j = 0; j < m; j++) {
        var th = Math.PI * (0.12 + Math.random() * 0.76); // 22°–158° from +x
        var ssp = 14 + Math.random() * 26;
        var r0 = 5 + Math.random() * 6;
        var pf = el("circle", { cx: CX, cy: CY, r: r0, fill: "#8a8d93", opacity: 0.42 });
        fx.appendChild(pf);
        smoke.push({
          node: pf, x: CX + (Math.random() - 0.5) * 18, y: CY,
          vx: Math.cos(th) * ssp, vy: -Math.sin(th) * ssp,
          r: r0, life: 3 + Math.random() * 2, age: 0
        });
      }
    }

    function step(ts) {
      if (last === null) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;

      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.age += dt;
        p.vy += GRAV * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.age >= p.life || p.y > 250) {
          fx.removeChild(p.node); parts.splice(i, 1); continue;
        }
        p.node.setAttribute("cx", p.x.toFixed(1));
        p.node.setAttribute("cy", p.y.toFixed(1));
        p.node.setAttribute("opacity", Math.max(0, 1 - p.age / p.life).toFixed(2));
      }

      for (var n2 = flows.length - 1; n2 >= 0; n2--) {
        var fl = flows[n2];
        fl.age += dt;
        fl.x += fl.vx * dt;
        fl.y += fl.vy * dt;
        if (fl.age >= fl.life || fl.y > 255) {
          fx.removeChild(fl.node); flows.splice(n2, 1); continue;
        }
        fl.node.setAttribute("cx", fl.x.toFixed(1));
        fl.node.setAttribute("cy", fl.y.toFixed(1));
        fl.node.setAttribute("opacity", (fl.op * Math.max(0, 1 - fl.age / fl.life)).toFixed(2));
      }

      for (var k = smoke.length - 1; k >= 0; k--) {
        var s = smoke[k];
        s.age += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.r += 11 * dt;
        if (s.age >= s.life) { fx.removeChild(s.node); smoke.splice(k, 1); continue; }
        s.node.setAttribute("cx", s.x.toFixed(1));
        s.node.setAttribute("cy", s.y.toFixed(1));
        s.node.setAttribute("r", s.r.toFixed(1));
        s.node.setAttribute("opacity", (0.42 * Math.max(0, 1 - s.age / s.life)).toFixed(2));
      }

      if (glow) {
        glowT += dt;
        var g = Math.max(0, 1 - glowT / glowDur);
        glow.setAttribute("opacity", (g * 0.75).toFixed(2));
        glow.setAttribute("rx", (14 + 6 * Math.sin(glowT * 8) * g + 4 * g).toFixed(1));
        if (g <= 0) { fx.removeChild(glow); glow = null; }
      }

      // gentle, ever-present lava trickling down the sides
      trickleAcc += dt;
      while (trickleAcc >= 0.2) {
        trickleAcc -= 0.2;
        addFlow(2 + Math.random() * 12, (Math.random() - 0.5) * 5,
          1.2 + Math.random() * 1.2, 14 + Math.random() * 10,
          0.5, 5 + Math.random() * 2);
      }

      requestAnimationFrame(step);
    }

    function schedule() {
      var wait = 7000 + Math.random() * 9000; // 7–16s between eruptions
      setTimeout(function () { erupt(); schedule(); }, wait);
    }
    setTimeout(function () { erupt(); schedule(); }, 1500 + Math.random() * 1500);
    requestAnimationFrame(step); // start the loop (gentle flow runs from load)
  }

  /* ---------- a bacterium the phages keep lysing ---------- */
  function setupLysis() {
    var host = document.getElementById("lysis-fx");
    if (!host || reduce) return; // no bursting when motion is reduced
    var NS = "http://www.w3.org/2000/svg";
    var BX = 690, BY = 290, GRAV = 80; // sits on the front hill
    var cell = null, cellAge = 0, alive = false, bits = [], last = null;

    function el(tag, attrs, parent) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    }

    // a tiny phage (same icosahedral head + tail as the cyclist)
    function miniPhage(parent) {
      var g = el("g", {}, parent);
      el("polygon", { points: "0,-5 4.4,-2.5 4.4,2.5 0,5 -4.4,2.5 -4.4,-2.5", fill: "#1C5AA6" }, g);
      el("line", { x1: 0, y1: 5, x2: 0, y2: 11, stroke: "#1C5AA6", "stroke-width": 1.3 }, g);
      el("line", { x1: 0, y1: 11, x2: -3, y2: 14, stroke: "#1C5AA6", "stroke-width": 1.1 }, g);
      el("line", { x1: 0, y1: 11, x2: 3, y2: 14, stroke: "#1C5AA6", "stroke-width": 1.1 }, g);
      return g;
    }

    // a rod-shaped bacterium, built around the origin so it can swell
    function makeCell() {
      var g = el("g", { opacity: 0 }, host);
      el("rect", { x: -20, y: -9, width: 40, height: 18, rx: 9, fill: "#5fae8e", stroke: "#2f6f5a", "stroke-width": 1.5 }, g);
      el("ellipse", { cx: -5, cy: -1, rx: 8, ry: 3.6, fill: "#327a61", opacity: 0.55 }, g);
      el("ellipse", { cx: 9, cy: 2, rx: 4, ry: 2.2, fill: "#327a61", opacity: 0.45 }, g);
      var p1 = miniPhage(g); p1.setAttribute("transform", "translate(-9 -9) rotate(180) scale(.72)");
      var p2 = miniPhage(g); p2.setAttribute("transform", "translate(8 -9) rotate(165) scale(.62)");
      return g;
    }

    // burst: scatter progeny phages and cell debris
    function burst() {
      var n = 8 + Math.floor(Math.random() * 4);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, sp = 26 + Math.random() * 44;
        bits.push({
          node: miniPhage(host), kind: "phage", x: BX, y: BY,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 16,
          rot: Math.random() * 360, vr: (Math.random() - 0.5) * 260,
          sc: 0.6 + Math.random() * 0.45, life: 1.6 + Math.random() * 1.1, age: 0
        });
      }
      var d = 6 + Math.floor(Math.random() * 4);
      for (var j = 0; j < d; j++) {
        var a2 = Math.random() * Math.PI * 2, sp2 = 18 + Math.random() * 30;
        bits.push({
          node: el("circle", { cx: BX, cy: BY, r: 1.6 + Math.random() * 2.2, fill: "#5fae8e" }, host),
          kind: "debris", x: BX, y: BY,
          vx: Math.cos(a2) * sp2, vy: Math.sin(a2) * sp2 - 10,
          life: 1.1 + Math.random() * 0.7, age: 0
        });
      }
      if (cell) { host.removeChild(cell); cell = null; }
      alive = false;
    }

    function step(ts) {
      if (last === null) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;

      if (alive && cell) {
        cellAge += dt;
        var op = Math.min(1, cellAge * 1.8);
        var s = Math.min(1.42, 0.6 + cellAge * 0.3);     // fade/grow in, then swell
        var wob = 0.05 * Math.sin(cellAge * 7);          // jittery as it strains
        cell.setAttribute("opacity", op.toFixed(2));
        cell.setAttribute("transform", "translate(" + BX + " " + BY + ") scale(" +
          (s * (1 + wob)).toFixed(3) + " " + (s * (1 - wob)).toFixed(3) + ")");
      }

      for (var i = bits.length - 1; i >= 0; i--) {
        var b = bits[i];
        b.age += dt;
        b.vy += GRAV * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.age >= b.life || b.y > 360) { host.removeChild(b.node); bits.splice(i, 1); continue; }
        var o = Math.max(0, 1 - b.age / b.life);
        if (b.kind === "phage") {
          b.rot += b.vr * dt;
          b.node.setAttribute("transform", "translate(" + b.x.toFixed(1) + " " + b.y.toFixed(1) +
            ") rotate(" + b.rot.toFixed(0) + ") scale(" + b.sc.toFixed(2) + ")");
        } else {
          b.node.setAttribute("cx", b.x.toFixed(1));
          b.node.setAttribute("cy", b.y.toFixed(1));
        }
        b.node.setAttribute("opacity", o.toFixed(2));
      }

      requestAnimationFrame(step);
    }

    function cycle() {
      cell = makeCell(); cellAge = 0; alive = true;
      setTimeout(function () {
        if (cell) burst();
        setTimeout(cycle, 1600 + Math.random() * 2400); // regrow after a pause
      }, 2800 + Math.random() * 2400);
    }
    setTimeout(cycle, 1200 + Math.random() * 1600);
    requestAnimationFrame(step);
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
    setupVolcano();
    setupLysis();
    setupReveal();
    setupCounters();
    setupRail();
    setupSpy();
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
