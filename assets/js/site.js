/* CTekAI site behaviour: mobile nav, product tabs, example-call transcript, footer year. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile nav ---------- */
  var nav = document.querySelector('.nav'), toggle = document.querySelector('.nav-toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'CLOSE' : 'MENU';
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'MENU'; });
    });
  }

  /* ---------- product tabs (auto-advance until the visitor picks one) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var list = root.querySelector('.ptabs'), tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var timer = null, i = 0;
    function show(n, focus) {
      i = (n + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) {
        var on = k === i, panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (panel) panel.hidden = !on;
        var bar = t.querySelector('.bar'); if (bar && on) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      });
      if (focus) tabs[i].focus();
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } list.classList.add('paused'); }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { stop(); show(k); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { stop(); show(i + 1, true); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { stop(); show(i - 1, true); e.preventDefault(); }
      });
    });
    show(0);
    if (reduce) { list.classList.add('paused'); return; }
    var started = false;
    function start() { if (started) return; started = true; timer = setInterval(function () { show(i + 1); }, 7000); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { start(); o.disconnect(); } }, { threshold: .3 }).observe(root);
    } else start();
  });

  /* ---------- example call: bubbles play in once the card scrolls into view ---------- */
  document.querySelectorAll('[data-call]').forEach(function (card) {
    var bubs = Array.prototype.slice.call(card.querySelectorAll('.bub')), timerEl = card.querySelector('.timer');
    var audioSrc = card.getAttribute('data-audio'), btn = document.querySelector('[data-audio-btn]');
    if (btn && audioSrc) {
      // A real recording exists: show the play button and wire it up.
      var audio = new Audio(audioSrc);
      btn.hidden = false;
      btn.addEventListener('click', function () { if (audio.paused) { audio.play(); btn.querySelector('.lbl').textContent = 'Pause recording'; } else { audio.pause(); btn.querySelector('.lbl').textContent = 'Play the recording'; } });
      audio.addEventListener('ended', function () { btn.querySelector('.lbl').textContent = 'Play the recording'; });
    }
    if (reduce || !('IntersectionObserver' in window)) return;
    card.classList.add('js-anim');
    function play() {
      bubs.forEach(function (b) { b.classList.add('hide'); });
      bubs.forEach(function (b, k) { setTimeout(function () { b.classList.remove('hide'); }, 500 + k * 1300); });
      if (timerEl) {
        var s0 = performance.now();
        var iv = setInterval(function () {
          var s = Math.floor((performance.now() - s0) / 1000);
          timerEl.textContent = Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
          if (s > bubs.length * 1.3 + 2) clearInterval(iv);
        }, 250);
      }
    }
    bubs.forEach(function (b) { b.classList.add('hide'); });
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { play(); o.disconnect(); } }, { threshold: .4 }).observe(card);
  });

  /* ---------- newsletter subscriber count (set data-subscribers on the bar) ---------- */
  document.querySelectorAll('[data-subscribers]').forEach(function (el) {
    var n = parseInt(String(el.getAttribute('data-subscribers')).replace(/[^0-9]/g, ''), 10);
    el.textContent = n > 0 ? 'Join ' + n.toLocaleString('en-US') + '+ contractors' : '';
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
