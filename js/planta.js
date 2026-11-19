/* Planta baixa interativa: um projeto que se revela onde a pessoa passa o dedo ou o mouse. */
(function () {
  'use strict';
  var cv = document.getElementById('planta');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, dpr = 1, paredes = [], salas = [], ondas = [];
  var px = -9999, py = -9999, alvoX = -9999, alvoY = -9999, sujo = true, rodando = false, mexeu = false;
  var RAIO = 190;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* divide um retangulo em comodos, como uma planta de verdade */
  function dividir(x, y, w, h, prof, saida, quartos) {
    if (prof <= 0 || (w < 150 && h < 150)) { quartos.push({ x: x, y: y, w: w, h: h }); return; }
    var vertical = w > h ? true : false;
    if (Math.abs(w - h) < 60) vertical = Math.random() > 0.5;
    var f = rnd(0.36, 0.64);
    if (vertical) {
      var cx = Math.round(x + w * f);
      saida.push({ x1: cx, y1: y, x2: cx, y2: y + h, porta: rnd(0.25, 0.75) });
      dividir(x, y, cx - x, h, prof - 1, saida, quartos);
      dividir(cx, y, x + w - cx, h, prof - 1, saida, quartos);
    } else {
      var cy = Math.round(y + h * f);
      saida.push({ x1: x, y1: cy, x2: x + w, y2: cy, porta: rnd(0.25, 0.75) });
      dividir(x, y, w, cy - y, prof - 1, saida, quartos);
      dividir(x, cy, w, y + h - cy, prof - 1, saida, quartos);
    }
  }

  function gerar() {
    paredes = []; salas = [];
    var alt = Math.max(document.body.scrollHeight, window.innerHeight);
    var blocos = Math.ceil(alt / 900);
    for (var i = 0; i < blocos; i++) {
      var m = Math.min(90, W * 0.06);
      var x = m, y = i * 900 + 60, w = W - m * 2, h = 780;
      paredes.push({ x1: x, y1: y, x2: x + w, y2: y, porta: -1 });
      paredes.push({ x1: x + w, y1: y, x2: x + w, y2: y + h, porta: -1 });
      paredes.push({ x1: x + w, y1: y + h, x2: x, y2: y + h, porta: -1 });
      paredes.push({ x1: x, y1: y + h, x2: x, y2: y, porta: -1 });
      dividir(x, y, w, h, 3, paredes, salas);
    }
  }

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gerar(); sujo = true; laco();
  }

  function dist(seg, mx, my) {
    var dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1;
    var t = ((mx - seg.x1) * dx + (my - seg.y1) * dy) / (dx * dx + dy * dy || 1);
    t = Math.max(0, Math.min(1, t));
    var qx = seg.x1 + t * dx - mx, qy = seg.y1 + t * dy - my;
    return Math.sqrt(qx * qx + qy * qy);
  }

  function desenhar() {
    var topo = window.pageYOffset;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'square';

    for (var i = 0; i < paredes.length; i++) {
      var s = paredes[i];
      var y1 = s.y1 - topo, y2 = s.y2 - topo;
      if (Math.min(y1, y2) > H + 40 || Math.max(y1, y2) < -40) continue;

      var d = dist({ x1: s.x1, y1: y1, x2: s.x2, y2: y2 }, px, py);
      var perto = Math.max(0, 1 - d / RAIO);
      for (var o = 0; o < ondas.length; o++) {
        var od = Math.abs(dist({ x1: s.x1, y1: y1, x2: s.x2, y2: y2 }, ondas[o].x, ondas[o].y) - ondas[o].r);
        if (od < 60) perto = Math.max(perto, (1 - od / 60) * ondas[o].v);
      }
      var a = 0.05 + perto * 0.75;
      ctx.strokeStyle = perto > 0.08 ? 'rgba(216,20,20,' + a + ')' : 'rgba(26,20,20,0.055)';
      ctx.lineWidth = perto > 0.3 ? 1.6 : 1;
      ctx.beginPath(); ctx.moveTo(s.x1, y1); ctx.lineTo(s.x2, y2); ctx.stroke();

      /* vao de porta: um corte na parede revelado de perto */
      if (s.porta > 0 && perto > 0.25) {
        var vx = s.x2 - s.x1, vy = y2 - y1, L = Math.sqrt(vx * vx + vy * vy);
        var ax = s.x1 + vx * s.porta, ay = y1 + vy * s.porta;
        var ux = vx / L, uy = vy / L, meio = 26;
        ctx.strokeStyle = 'rgba(248,245,242,0.95)';
        ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.moveTo(ax - ux * meio / 2, ay - uy * meio / 2);
        ctx.lineTo(ax + ux * meio / 2, ay + uy * meio / 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(216,20,20,' + (perto * 0.6) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(ax - ux * meio / 2, ay - uy * meio / 2, meio, 0, Math.PI / 2); ctx.stroke();
      }
    }

    /* cota de medida junto ao cursor */
    if (mexeu && px > -1000 && !calmo) {
      ctx.strokeStyle = 'rgba(216,20,20,0.5)';
      ctx.fillStyle = 'rgba(216,20,20,0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px - 46, py + 34); ctx.lineTo(px + 46, py + 34);
      ctx.moveTo(px - 46, py + 29); ctx.lineTo(px - 46, py + 39);
      ctx.moveTo(px + 46, py + 29); ctx.lineTo(px + 46, py + 39);
      ctx.stroke();
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('2,40 m', px, py + 50);
    }
  }

  function laco() {
    rodando = true;
    px += (alvoX - px) * 0.14; py += (alvoY - py) * 0.14;
    for (var i = ondas.length - 1; i >= 0; i--) {
      ondas[i].r += 11; ondas[i].v -= 0.022;
      if (ondas[i].v <= 0) ondas.splice(i, 1);
    }
    desenhar();
    var parado = Math.abs(alvoX - px) < 0.4 && Math.abs(alvoY - py) < 0.4 && ondas.length === 0;
    if (parado && !sujo) { rodando = false; return; }
    sujo = false;
    requestAnimationFrame(laco);
  }

  function acorda() { if (!rodando) { sujo = true; laco(); } else { sujo = true; } }

  if (!calmo) {
    window.addEventListener('mousemove', function (e) { if (e.clientX || e.clientY) mexeu = true; alvoX = e.clientX; alvoY = e.clientY; acorda(); }, { passive: true });
    window.addEventListener('mouseleave', function () { mexeu = false; alvoX = -9999; alvoY = -9999; acorda(); });
    window.addEventListener('touchmove', function (e) {
      var t = e.touches[0]; if (!t) return;
      mexeu = true; alvoX = t.clientX; alvoY = t.clientY; acorda();
    }, { passive: true });
    window.addEventListener('pointerdown', function (e) {
      mexeu = true; ondas.push({ x: e.clientX, y: e.clientY, r: 10, v: 1 });
      alvoX = e.clientX; alvoY = e.clientY; acorda();
    }, { passive: true });
  }
  window.addEventListener('scroll', acorda, { passive: true });
  var t0;
  window.addEventListener('resize', function () { clearTimeout(t0); t0 = setTimeout(medir, 180); });
  medir();
  window.addEventListener('load', function () { setTimeout(medir, 400); });
})();
