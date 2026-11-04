// スマートフォン表示時のメニュー開閉
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('global-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.textContent = open ? 'とじる' : 'メニュー';
  });
});

// ロード画面：ページの読み込み完了後（最短1.8秒・最長3.5秒）にフェードアウト
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('show-loader')) return;
  var start = Date.now();
  var done = false;
  function hide() {
    if (done) return;
    done = true;
    root.classList.add('loader-done');
    try { sessionStorage.setItem('hjLoaded', '1'); } catch (e) {}
  }
  window.addEventListener('load', function () {
    setTimeout(hide, Math.max(0, 1800 - (Date.now() - start)));
  });
  setTimeout(hide, 3500);
})();

// スクロールに合わせて要素をふわっと表示し、ページ上部のバーを伸ばす
document.addEventListener('DOMContentLoaded', function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ページ上部の進み具合バー
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var ticking = false;
  function update() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  if (reduce || !('IntersectionObserver' in window)) return;

  // 並んでいる要素は、少しずつずらして表示する
  var groups = ['.cards > *', '.steps > *', '.flow > li', '.system > .node', '.faq > details',
                '.big-steps > *', '.quotes > *', '.info-grid > div'];
  var singles = ['main .section .h2', 'main .section .lead', '.promise', '.cta-band', '.dark-box',
                 '.note', '.form', '.big-step', '.policy > *'];
  var targets = [];
  groups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's');
      targets.push(el);
    });
  });
  singles.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { targets.push(el); });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  targets.forEach(function (el) {
    if (el.classList.contains('reveal') || el.closest('.hero, .page-hero')) return;
    // 既に画面内にあるものは、そのまま表示（ちらつき防止）
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
      el.classList.add('reveal');
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('is-visible'); }); });
      return;
    }
    el.classList.add('reveal');
    io.observe(el);
  });
});
