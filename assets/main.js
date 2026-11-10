(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // revelar ao rolar
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  // texto que se decodifica
  var glyphs = "01#%/+_*<>=";
  function decode(el) {
    var final = el.getAttribute("data-decode") || el.textContent;
    if (reduce) { el.textContent = final; return; }
    var frame = 0, total = 28;
    var t = setInterval(function () {
      frame++;
      var out = "";
      for (var i = 0; i < final.length; i++) {
        var c = final[i];
        if (c === " " || i < (frame / total) * final.length) out += c;
        else out += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      el.textContent = out;
      if (frame >= total) { clearInterval(t); el.textContent = final; }
    }, 40);
  }
  document.querySelectorAll("[data-decode]").forEach(function (el) {
    if ("IntersectionObserver" in window) {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { decode(e.target); o.unobserve(e.target); } });
      }, { threshold: 0.4 });
      o.observe(el);
    } else decode(el);
  });

  // contagem dos números
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var pre = el.getAttribute("data-pre") || "", suf = el.getAttribute("data-suf") || "";
    function run() {
      if (reduce) { el.textContent = pre + end + suf; return; }
      var start = performance.now(), dur = 1400;
      function step(now) {
        var p = Math.min(1, (now - start) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = pre + v + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { run(); o.unobserve(e.target); } });
      }, { threshold: 0.5 });
      o.observe(el);
    } else run();
  });

  // grade em perspectiva (canvas com data-grid="cor1,cor2")
  document.querySelectorAll("canvas[data-grid]").forEach(function (cv) {
    var ctx = cv.getContext("2d");
    var cols = cv.getAttribute("data-grid").split(",");
    var off = 0, w, h, dpr = Math.min(window.devicePixelRatio || 1, 2), mx = 0.5;
    function size() {
      var r = cv.getBoundingClientRect(); w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var hy = h * (parseFloat(cv.getAttribute("data-horizon")) || 0.58), cx = w * (0.35 + mx * 0.3);
      var g = ctx.createLinearGradient(0, hy, w, h);
      g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]);
      ctx.strokeStyle = g; ctx.lineWidth = 1;
      // horizonte
      ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(w, hy); ctx.stroke();
      // linhas que fogem para o ponto de fuga
      ctx.globalAlpha = 0.35;
      for (var i = -24; i <= 24; i++) {
        ctx.beginPath(); ctx.moveTo(cx + i * 8, hy); ctx.lineTo(cx + i * w * 0.12, h); ctx.stroke();
      }
      // linhas horizontais andando
      for (var k = 0; k < 18; k++) {
        var p = ((k + off) % 18) / 18, y = hy + (h - hy) * p * p;
        ctx.globalAlpha = 0.15 + p * 0.6;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    function loop() { off += 0.012; draw(); if (!reduce) requestAnimationFrame(loop); }
    window.addEventListener("resize", function () { size(); draw(); });
    window.addEventListener("pointermove", function (e) { mx = e.clientX / window.innerWidth; });
    size(); loop();
  });

  /* ===================== Projeto 2 ===================== */

  // palavra que troca (data-rotate="a|b|c"), usando o efeito de decodificar
  document.querySelectorAll("[data-rotate]").forEach(function (el) {
    var words = el.getAttribute("data-rotate").split("|"), i = 0;
    el.textContent = words[0];
    if (reduce || words.length < 2) return;
    setInterval(function () {
      i = (i + 1) % words.length;
      el.setAttribute("data-decode", words[i]);
      decode(el);
    }, 2800);
  });

  // nome entrando letra por letra (data-split)
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var text = el.textContent, d = parseFloat(el.getAttribute("data-split")) || 0;
    el.textContent = "";
    el.setAttribute("aria-label", text);
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "ch"; s.setAttribute("aria-hidden", "true");
      s.textContent = text[i] === " " ? " " : text[i];
      s.style.animationDelay = (d + i * 0.06) + "s";
      el.appendChild(s);
    }
  });

  // terminal que digita linhas (data-term com <template> de linhas)
  document.querySelectorAll("[data-term]").forEach(function (box) {
    var lines = (box.getAttribute("data-term") || "").split("\n").filter(Boolean);
    var out = box.querySelector(".out");
    if (reduce) { out.textContent = lines.join("\n"); return; }
    var li = 0, ci = 0, txt = "";
    function tick() {
      if (li >= lines.length) { setTimeout(function () { li = 0; ci = 0; txt = ""; out.textContent = ""; tick(); }, 2600); return; }
      var line = lines[li];
      if (ci <= line.length) {
        out.textContent = txt + line.slice(0, ci) + "▌";
        ci++;
        setTimeout(tick, line.charAt(0) === "$" ? 55 : 18);
      } else {
        txt += line + "\n"; li++; ci = 0;
        setTimeout(tick, 380);
      }
    }
    tick();
  });

  // rede neural (canvas data-net="cor1,cor2"; data-net-var="--ia-1" segue a cor do lado)
  // Leve: cor guardada, distância ao quadrado, pausa fora da tela e com a aba escondida;
  // no celular menos pontos, resolução 1x e 30 quadros por segundo (velocidade igual, compensada pelo tempo).
  // data-net-magnet (página inicial): as bolinhas perto do mouse/dedo vão até ele e seguem,
  // mas mantêm distância umas das outras (ficam espalhadas em volta, não viram um ponto só).
  var touchDev = window.matchMedia && window.matchMedia("(hover: none)").matches;
  document.querySelectorAll("canvas[data-net]").forEach(function (cv) {
    var ctx = cv.getContext("2d"), cols = cv.getAttribute("data-net").split(","), magnet = cv.hasAttribute("data-net-magnet");
    var dpr = touchDev ? 1 : Math.min(window.devicePixelRatio || 1, 1.5), w, h, pts = [], mouse = { x: -999, y: -999, on: false };
    var nv = cv.getAttribute("data-net-var"), nc = null, visible = true, raf = 0, last = 0, prev = 0, step = touchDev ? 1000 / 30 : 1000 / 60;
    var LINK = 130, LINK2 = LINK * LINK, NEAR = magnet ? 180 : 160, NEAR2 = NEAR * NEAR;
    var PULL = 0.0028, DAMP = 0.955, CORE = 36, SEP = 48, SEP2 = SEP * SEP;
    function readColor() { nc = nv ? (getComputedStyle(document.documentElement).getPropertyValue(nv).trim() || null) : null; }
    function size() {
      var r = cv.getBoundingClientRect(), keep = pts.length && r.width === w;
      if (keep && r.height === h) return; // nada mudou (no celular a barra do navegador dispara "resize" ao rolar)
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (keep) { pts.forEach(function (p) { if (p.y > h) p.y = Math.random() * h; }); draw(); return; } // só a altura mudou: mantém as bolinhas
      var n = Math.round(Math.min(touchDev ? 40 : 90, (w * h) / (touchDev ? 20000 : 16000)));
      pts = [];
      for (var i = 0; i < n; i++) {
        var vx = (Math.random() - .5) * .35, vy = (Math.random() - .5) * .35;
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: vx, vy: vy, bx: vx, by: vy, c: cols[i % 2], near: false });
      }
    }
    function physics(k) {
      var i, p, n = pts.length;
      for (i = 0; i < n; i++) {
        p = pts[i];
        var mx = mouse.x - p.x, my = mouse.y - p.y, d2 = mx * mx + my * my;
        p.near = mouse.on && d2 < NEAR2;
        if (reduce) continue;
        if (magnet) {
          if (p.near) {
            var d = Math.sqrt(d2) || 1, s = PULL * (1 - d / NEAR * 0.6), dm = Math.pow(DAMP, k);
            if (d < CORE) s = -PULL * 2.5; // não encosta no dedo
            p.vx = (p.vx + mx * s * k) * dm; p.vy = (p.vy + my * s * k) * dm;
          } else { p.vx += (p.bx - p.vx) * 0.03 * k; p.vy += (p.by - p.vy) * 0.03 * k; } // volta a flutuar
          p.x += p.vx * k; p.y += p.vy * k;
          if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); p.bx = Math.abs(p.bx); } else if (p.x > w) { p.x = w; p.vx = -Math.abs(p.vx); p.bx = -Math.abs(p.bx); }
          if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); p.by = Math.abs(p.by); } else if (p.y > h) { p.y = h; p.vy = -Math.abs(p.vy); p.by = -Math.abs(p.by); }
        } else {
          p.x += p.vx * k; p.y += p.vy * k;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          if (p.near) { p.x += mx * 0.004 * k; p.y += my * 0.004 * k; }
        }
      }
      // bolinhas presas ao dedo se afastam umas das outras: ficam espalhadas em volta
      if (magnet && mouse.on && !reduce) {
        for (i = 0; i < n; i++) {
          p = pts[i]; if (!p.near) continue;
          for (var j = i + 1; j < n; j++) {
            var q = pts[j]; if (!q.near) continue;
            var dx = p.x - q.x, dy = p.y - q.y, e2 = dx * dx + dy * dy;
            if (e2 < SEP2) {
              var e = Math.sqrt(e2) || 1, f = (SEP - e) / SEP * 0.22 * k / e;
              p.vx += dx * f; p.vy += dy * f; q.vx -= dx * f; q.vy -= dy * f;
            }
          }
        }
      }
    }
    // desenho em lotes: linhas agrupadas em 4 níveis de transparência e bolinhas em 2 grupos
    // (poucas operações por quadro em vez de uma por linha; o visual é o mesmo)
    var LV = 4, buckets = [[], [], [], []];
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      var col = nc || cols[0], i, j, p, q, b;
      for (b = 0; b < LV; b++) buckets[b].length = 0;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j];
          var dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK2) {
            b = Math.min(LV - 1, ((1 - Math.sqrt(d2) / LINK) * LV) | 0);
            buckets[b].push(p.x, p.y, q.x, q.y);
          }
        }
      }
      ctx.strokeStyle = col; ctx.fillStyle = col;
      for (b = 0; b < LV; b++) {
        var L = buckets[b]; if (!L.length) continue;
        ctx.globalAlpha = (b + 0.5) / LV * 0.45;
        ctx.beginPath();
        for (i = 0; i < L.length; i += 4) { ctx.moveTo(L[i], L[i + 1]); ctx.lineTo(L[i + 2], L[i + 3]); }
        ctx.stroke();
      }
      for (var pass = 0; pass < 2; pass++) { // 0 = bolinhas normais, 1 = perto do mouse/dedo
        ctx.globalAlpha = pass ? 1 : 0.75; ctx.beginPath();
        for (i = 0; i < pts.length; i++) {
          p = pts[i]; if (!!p.near !== !!pass) continue;
          var r = pass ? 2.6 : 1.7; ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) {
      raf = 0;
      if (!visible || document.hidden) { prev = 0; return; }
      if (t - last >= step - 2) {
        var k = prev ? Math.min((t - prev) / 16.67, 3) : 1;
        prev = t; last = t; physics(k); draw();
      }
      if (!reduce) raf = requestAnimationFrame(loop);
    }
    function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(cv);
    }
    document.addEventListener("visibilitychange", start);
    window.addEventListener("pcor", readColor);
    var host = cv.parentElement;
    function at(x, y) { var r = cv.getBoundingClientRect(); mouse.x = x - r.left; mouse.y = y - r.top; mouse.on = true; }
    function off() { mouse.on = false; mouse.x = mouse.y = -999; }
    host.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse" || !magnet) at(e.clientX, e.clientY); });
    host.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" || !magnet) off(); });
    if (magnet) { // dedo: os eventos de toque seguem chegando mesmo enquanto o navegador cuida do gesto
      host.addEventListener("touchstart", function (e) { if (e.touches.length === 1) at(e.touches[0].clientX, e.touches[0].clientY); else off(); }, { passive: true });
      host.addEventListener("touchmove", function (e) { if (e.touches.length === 1) at(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      host.addEventListener("touchend", off, { passive: true });
      host.addEventListener("touchcancel", off, { passive: true });
    }
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 150); });
    readColor(); size(); draw(); start();
  });

  // brilho que segue o mouse (.glow dentro de um pai com position)
  document.querySelectorAll(".glow").forEach(function (g) {
    if (reduce) return;
    var host = g.parentElement;
    var gx = 0, gy = 0, gq = 0; // no máximo 1 atualização por quadro
    host.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = host.getBoundingClientRect(); gx = e.clientX - r.left; gy = e.clientY - r.top;
      if (!gq) gq = requestAnimationFrame(function () { gq = 0; g.style.transform = "translate(" + gx + "px," + gy + "px)"; });
    });
  });

  // funil: destaca uma etapa por vez (.funnel .step)
  document.querySelectorAll(".funnel").forEach(function (f) {
    var steps = f.querySelectorAll(".step"), k = 0;
    if (reduce || !steps.length) return;
    var seen = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }).observe(f);
    steps[0].classList.add("on");
    setInterval(function () {
      if (!seen || document.hidden) return; // fora da tela não trabalha
      steps[k].classList.remove("on"); k = (k + 1) % steps.length; steps[k].classList.add("on");
    }, 1100);
  });

  // animações em loop pausam quando o bloco sai da tela (menos trabalho ao rolar, menos bateria)
  if ("IntersectionObserver" in window) {
    var po = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle("anim-off", !e.isIntersecting); });
    });
    document.querySelectorAll(".hero, .marquee, .split").forEach(function (el) { po.observe(el); });
  }
})();
