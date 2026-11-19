(function () {
  'use strict';
  var NUM = '5592992856323';
  var NOME = 'Imobiliária Lacerda Imóveis';
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.dataLayer = window.dataLayer || [];

  function wa(txt) { return 'https://wa.me/' + NUM + '?text=' + encodeURIComponent(txt); }
  function brl(v) { return 'R$ ' + v.toLocaleString('pt-BR'); }
  function evento(nome, local) { window.dataLayer.push({ event: 'contato_' + nome, local: local || 'pagina' }); }

  /* ---------- links de WhatsApp ---------- */
  function ligarZap(raiz) {
    var ls = (raiz || document).querySelectorAll('[data-msg]');
    for (var i = 0; i < ls.length; i++) {
      var a = ls[i];
      if (a.dataset.pronto) continue;
      a.href = wa(a.getAttribute('data-msg'));
      a.target = '_blank'; a.rel = 'noopener';
      if (!a.dataset.evento) a.dataset.evento = 'whatsapp';
      if (!a.dataset.local) {
        var s = a.closest('section,header,footer');
        a.dataset.local = (s && (s.id || s.className.split(' ')[0])) || 'pagina';
      }
      a.dataset.pronto = '1';
    }
  }
  ligarZap(document);
  document.addEventListener('click', function (e) {
    var alvo = e.target.closest && e.target.closest('[data-evento]');
    if (alvo) evento(alvo.dataset.evento, alvo.dataset.local);
  });

  /* ---------- menu ---------- */
  var bt = document.querySelector('.burger'), menu = document.getElementById('menu');
  function fechaMenu() {
    menu.classList.remove('aberto');
    bt.setAttribute('aria-expanded', 'false');
    bt.setAttribute('aria-label', 'Abrir menu');
  }
  if (bt && menu) {
    bt.addEventListener('click', function () {
      var ab = menu.classList.toggle('aberto');
      bt.setAttribute('aria-expanded', ab ? 'true' : 'false');
      bt.setAttribute('aria-label', ab ? 'Fechar menu' : 'Abrir menu');
    });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') fechaMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('aberto')) { fechaMenu(); bt.focus(); }
    });
  }

  /* ---------- barra de progresso e botao flutuante ---------- */
  var prog = document.getElementById('prog'), zap = document.querySelector('.zap'), pedido = false;
  function pinta() {
    pedido = false;
    var h = document.documentElement.scrollHeight - window.innerHeight, y = window.pageYOffset;
    if (prog) prog.style.width = Math.min(100, Math.max(0, h > 0 ? (y / h) * 100 : 0)) + '%';
    if (zap) zap.classList.toggle('mostra', y > window.innerHeight * 0.7);
  }
  window.addEventListener('scroll', function () {
    if (!pedido) { pedido = true; requestAnimationFrame(pinta); }
  }, { passive: true });
  pinta();

  /* ---------- carrossel de destaques ---------- */
  var destaques = (window.IMOVEIS || []).filter(function (x) { return x.d; });
  var trilho = document.getElementById('trilho'), pontos = document.getElementById('pontos');
  var atual = 0, timer = null;

  if (trilho && destaques.length) {
    destaques.forEach(function (im, i) {
      var fig = document.createElement('article');
      fig.className = 'slide';
      fig.setAttribute('role', 'group');
      fig.setAttribute('aria-roledescription', 'slide');
      fig.setAttribute('aria-label', (i + 1) + ' de ' + destaques.length);
      var leve = (navigator.connection && navigator.connection.saveData) || calmo;
      var midia = (im.v && !leve)
        ? '<video src="video/' + im.c + '.mp4" poster="img/poster' + im.c + '.jpg" muted loop playsinline preload="none" ' +
          'aria-label="' + im.t + ' em ' + im.b + ', vídeo"></video>'
        : '<img src="img/d' + im.c + '.webp" alt="' + im.t + ' em ' + im.b + ', ' + im.ci + '" ' +
          (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' width="1200" height="840">';
      fig.innerHTML = midia +
        '<div class="slide-txt">' +
          '<span class="eti">' + im.f + ' · cód. ' + im.c + '</span>' +
          '<h3>' + im.t + '<em>' + im.b + '</em></h3>' +
          '<p class="val">' + brl(im.p) + '</p>' +
          '<a class="pil forte" data-local="carrossel" data-msg="Olá! Vi no site o ' + im.t.toLowerCase() +
            ' em ' + im.b + ' (cód. ' + im.c + ') e quero saber mais.">Quero ver este imóvel</a>' +
        '</div>';
      trilho.appendChild(fig);

      var p = document.createElement('button');
      p.type = 'button';
      p.setAttribute('aria-label', 'Ir para o imóvel ' + (i + 1));
      p.addEventListener('click', function () { vaiPara(i); parar(); });
      pontos.appendChild(p);
    });
    ligarZap(trilho);

    function vaiPara(i) {
      atual = (i + destaques.length) % destaques.length;
      trilho.style.transform = 'translate3d(' + (-atual * 100) + '%,0,0)';
      var bs = pontos.querySelectorAll('button');
      for (var k = 0; k < bs.length; k++) bs[k].setAttribute('aria-current', k === atual ? 'true' : 'false');
      var sl = trilho.querySelectorAll('.slide');
      for (var j = 0; j < sl.length; j++) {
        sl[j].classList.toggle('ativo', j === atual);
        var vd = sl[j].querySelector('video');
        if (!vd) continue;
        if (j === atual) { var pr = vd.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else { vd.pause(); }
      }
    }
    function anda() { vaiPara(atual + 1); }
    function tocar() { if (!calmo && !timer) timer = setInterval(anda, 6500); }
    function parar() { clearInterval(timer); timer = null; }

    var prev = document.querySelector('.car-prev'), next = document.querySelector('.car-next');
    if (prev) prev.addEventListener('click', function () { vaiPara(atual - 1); parar(); });
    if (next) next.addEventListener('click', function () { vaiPara(atual + 1); parar(); });

    var caixa = document.querySelector('.carrossel');
    caixa.addEventListener('mouseenter', parar);
    caixa.addEventListener('mouseleave', tocar);
    caixa.addEventListener('focusin', parar);
    var x0 = null;
    caixa.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; parar(); }, { passive: true });
    caixa.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) vaiPara(atual + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    document.addEventListener('keydown', function (e) {
      if (!caixa.contains(document.activeElement)) return;
      if (e.key === 'ArrowRight') { vaiPara(atual + 1); parar(); }
      if (e.key === 'ArrowLeft') { vaiPara(atual - 1); parar(); }
    });
    vaiPara(0); tocar();
  }

  /* ---------- catalogo com filtros ---------- */
  var grade = document.getElementById('grade');
  if (grade && window.IMOVEIS) {
    var todos = window.IMOVEIS.slice();
    var fTipo = document.getElementById('fTipo'), fBairro = document.getElementById('fBairro'),
        fFin = document.getElementById('fFin'), fPreco = document.getElementById('fPreco'),
        fOrdem = document.getElementById('fOrdem'), elConta = document.getElementById('conta'),
        btMais = document.getElementById('maisImoveis'), vazio = document.getElementById('semResultado');
    var mostrando = 12, filtrados = todos;

    function opcoes(sel, lista, rotulo) {
      lista.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
      sel.innerHTML = '<option value="">' + rotulo + '</option>' +
        lista.map(function (v) { return '<option>' + v + '</option>'; }).join('');
    }
    opcoes(fTipo, todos.map(function (x) { return x.t; }).filter(function (v, i, a) { return a.indexOf(v) === i; }), 'Todos os tipos');
    opcoes(fBairro, todos.map(function (x) { return x.b; }).filter(function (v, i, a) { return a.indexOf(v) === i; }), 'Todos os bairros');

    function cartao(im) {
      return '<article class="im rev vis">' +
        '<a data-local="catalogo" data-msg="Olá! Vi no site o ' + im.t.toLowerCase() + ' em ' + im.b +
          ' (cód. ' + im.c + ') e quero saber mais.">' +
        '<span class="im-f"><img src="img/' + im.c + '.webp" loading="lazy" width="560" height="390" alt="' +
          im.t + ' em ' + im.b + ', ' + im.ci + '">' +
          '<span class="im-fin' + (im.f === 'Locação' ? ' loc' : '') + '">' + im.f + '</span></span>' +
        '<span class="im-b"><strong>' + im.t + '</strong>' +
          '<small>' + im.b + ', ' + im.ci + '</small>' +
          '<b>' + brl(im.p) + (im.f === 'Locação' ? ' <i>por mês</i>' : '') + '</b>' +
          '<span class="im-cod">cód. ' + im.c + '</span></span></a></article>';
    }

    function aplicar(reinicia) {
      if (reinicia !== false) mostrando = 12;
      var t = fTipo.value, b = fBairro.value, f = fFin.value, p = fPreco.value;
      filtrados = todos.filter(function (x) {
        if (t && x.t !== t) return false;
        if (b && x.b !== b) return false;
        if (f && x.f !== f) return false;
        if (p) {
          var lim = p.split('-');
          if (x.p < +lim[0]) return false;
          if (lim[1] && x.p > +lim[1]) return false;
        }
        return true;
      });
      var o = fOrdem.value;
      filtrados.sort(function (a, b2) {
        if (o === 'menor') return a.p - b2.p;
        if (o === 'maior') return b2.p - a.p;
        return (b2.d || 0) - (a.d || 0) || b2.c.localeCompare(a.c);
      });
      grade.innerHTML = filtrados.slice(0, mostrando).map(cartao).join('');
      ligarZap(grade);
      elConta.textContent = filtrados.length === 0 ? 'nenhum imóvel com esse filtro'
        : filtrados.length === 1 ? '1 imóvel encontrado'
        : filtrados.length + ' imóveis encontrados';
      vazio.hidden = filtrados.length > 0;
      btMais.hidden = filtrados.length <= mostrando;
      btMais.textContent = 'Ver mais ' + Math.min(12, filtrados.length - mostrando) + ' imóveis';
    }
    [fTipo, fBairro, fFin, fPreco, fOrdem].forEach(function (s) { s.addEventListener('change', function () { aplicar(); }); });
    btMais.addEventListener('click', function () { mostrando += 12; aplicar(false); });
    document.getElementById('limpar').addEventListener('click', function () {
      fTipo.value = ''; fBairro.value = ''; fFin.value = ''; fPreco.value = ''; fOrdem.value = 'destaque';
      aplicar();
    });
    aplicar();

    /* atalhos de tipo vindos de outras secoes */
    document.querySelectorAll('[data-filtro]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var v = a.getAttribute('data-filtro');
        fTipo.value = v === 'todos' ? '' : v;
        aplicar();
        document.getElementById('imoveis').scrollIntoView({ behavior: calmo ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- busca do topo ---------- */
  var form = document.getElementById('busca');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, fin = f.finalidade.value, tipo = f.tipo.value, cid = f.cidade.value;
      var msg = 'Olá! Vi o site da ' + NOME + ' e quero ver imóveis';
      if (fin) msg += ' para ' + fin.toLowerCase();
      if (tipo) msg += ', tipo ' + tipo.toLowerCase();
      if (cid) msg += ', em ' + cid;
      msg += '.';
      evento('whatsapp', 'busca');
      window.open(wa(msg), '_blank', 'noopener');
    });
  }

  /* ---------- reveal ---------- */
  var todosRev = Array.prototype.slice.call(document.querySelectorAll('.rev'));
  var alvos = todosRev.filter(function (el) {
    return !todosRev.some(function (o) { return o !== el && o.contains(el); });
  });
  function libera(el) {
    if (el.classList.contains('vis')) return;
    el.classList.add('vis');
    setTimeout(function () { el.style.transitionDelay = ''; }, 1100);
    var cs = el.querySelectorAll('.cont');
    for (var k = 0; k < cs.length; k++) conta(cs[k]);
    if (el.classList.contains('cont')) conta(el);
  }
  function conta(el) {
    var alvo = parseInt(el.getAttribute('data-n'), 10) || 0;
    el.textContent = alvo;
    if (calmo || alvo === 0) return;
    var ini = null, dur = 1000;
    function passo(t) {
      if (ini === null) ini = t;
      var p = Math.min(1, (t - ini) / dur);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(passo); else el.textContent = alvo;
    }
    requestAnimationFrame(passo);
  }
  function liberaVisiveis() {
    for (var i = 0; i < alvos.length; i++) {
      var r = alvos[i].getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) libera(alvos[i]);
    }
  }
  if (calmo || !('IntersectionObserver' in window)) {
    alvos.forEach(libera);
  } else {
    var obs = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { libera(x.target); obs.unobserve(x.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    alvos.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; obs.observe(el); });
    liberaVisiveis();
    window.addEventListener('scroll', liberaVisiveis, { passive: true });
    window.addEventListener('load', liberaVisiveis);
    setTimeout(function () { alvos.forEach(libera); }, 4000);
  }

  requestAnimationFrame(function () { document.body.classList.add('pronto'); });
})();
