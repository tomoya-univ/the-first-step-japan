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
