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
  // Esc キーやメニュー内のリンクで、メニューを閉じる
  function close(focusBack) {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'メニュー';
    if (focusBack) toggle.focus();
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(true); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
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

// ---------- 派手な演出（第2弾） ----------
document.addEventListener('DOMContentLoaded', function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var colors = ['#FFD54A', '#1F64C8', '#F28C28', '#2C7A4B', '#F06292', '#7CB5FF'];
  var shapes = {
    star: '<svg viewBox="0 0 24 24"><path fill="__C__" d="M12 1.5l3 7 7.5.6-5.7 5 1.8 7.4L12 17.6 5.4 21.5l1.8-7.4L1.5 9.1 9 8.5z"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path fill="__C__" d="M12 21s-8.5-5.3-8.5-11.2A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 3.2C20.5 15.7 12 21 12 21z"/></svg>',
    circle: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="__C__" stroke-width="3.5"/></svg>',
    squiggle: '<svg viewBox="0 0 48 16"><path d="M2 8c5-8 9 8 14 0s9 8 14 0 9 8 14 0" fill="none" stroke="__C__" stroke-width="3.5" stroke-linecap="round"/></svg>',
    tri: '<svg viewBox="0 0 24 24"><path d="M12 3l9 16H3z" fill="none" stroke="__C__" stroke-width="3" stroke-linejoin="round"/></svg>',
    dot: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="__C__"/></svg>'
  };
  function rnd(a, b) { return a + Math.random() * (b - a); }

  // 1) 見出しエリアに飾りを散らす（文字と重なりにくい端のほうへ）
  var spots = [[3, 12], [44, 6], [92, 10], [96, 46], [6, 78], [48, 92], [88, 86], [70, 4], [30, 60], [60, 70]];
  document.querySelectorAll('.hero, .page-hero').forEach(function (area) {
    var layer = document.createElement('div');
    layer.className = 'deco-layer';
    layer.setAttribute('aria-hidden', 'true');
    var names = Object.keys(shapes);
    var n = area.classList.contains('hero') ? 10 : 6;
    for (var i = 0; i < n; i++) {
      var name = names[i % names.length];
      var el = document.createElement('span');
      el.className = 'deco' + (name === 'squiggle' ? ' no-spin' : '');
      var size = name === 'squiggle' ? rnd(48, 70) : rnd(16, 34);
      var s = spots[i % spots.length];
      el.style.cssText = 'left:' + s[0] + '%;top:' + s[1] + '%;width:' + size + 'px;opacity:' + rnd(.55, .9).toFixed(2) +
        ';--t:' + rnd(4, 8).toFixed(1) + 's;--dl:-' + rnd(0, 4).toFixed(1) + 's;--x:' + rnd(-20, 20).toFixed(0) + 'px;--y:' + rnd(-28, 28).toFixed(0) +
        'px;--rt:' + rnd(12, 30).toFixed(0) + 's';
      el.innerHTML = shapes[name].replace(/__C__/g, colors[i % colors.length]);
      layer.appendChild(el);
    }
    area.insertBefore(layer, area.firstChild);
  });

  // 2) トップのタイトルを1文字ずつに分ける（読み上げ用に元の文は残す）
  var h1 = document.querySelector('.hero h1');
  if (h1 && !reduce) {
    var label = h1.textContent.replace(/\s+/g, '');
    var idx = 0, dots = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          Array.prototype.forEach.call(c.textContent.trim(), function (t) {
            var sp = document.createElement('span');
            sp.className = 'ch' + (t === '・' ? (dots++ % 2 ? ' dot dot-b' : ' dot') : '');
            sp.style.setProperty('--i', idx++);
            sp.textContent = t;
            sp.setAttribute('aria-hidden', 'true');
            frag.appendChild(sp);
          });
          node.replaceChild(frag, c);
        }
      });
    };
    walk(h1);
    h1.setAttribute('aria-label', label);
  }

  // 3) フッターに、歩いていく足あと
  var footer = document.querySelector('.site-footer');
  if (footer) {
    var fp = document.createElement('div');
    fp.className = 'footprints-walk';
    fp.setAttribute('aria-hidden', 'true');
    for (var k = 0; k < 8; k++) {
      var up = k % 2 === 0;
      fp.insertAdjacentHTML('beforeend',
        '<svg viewBox="-12 -12 32 24" style="--i:' + k + ';margin-top:' + (up ? 0 : 12) + 'px"><g fill="' + (up ? '#7CB5FF' : '#FFD54A') + '"><ellipse cx="0" cy="0" rx="11" ry="6.5"/>' +
        (up ? '<circle cx="13" cy="-4" r="2.4"/><circle cx="15.5" cy="-.5" r="2.1"/><circle cx="15" cy="3" r="1.8"/><circle cx="12.5" cy="5.8" r="1.5"/>'
            : '<circle cx="13" cy="4" r="2.4"/><circle cx="15.5" cy=".5" r="2.1"/><circle cx="15" cy="-3" r="1.8"/><circle cx="12.5" cy="-5.8" r="1.5"/>') +
        '</g></svg>');
    }
    footer.insertBefore(fp, footer.firstChild);
  }

  // 4) 画面をタップ・クリックすると、星や丸がはじける
  if (reduce) return;
  // スクロール中の指の動きでは出さず、タップ・クリックしたときだけ出す
  document.addEventListener('click', function (e) {
    if (e.clientX === 0 && e.clientY === 0) return; // キーボード操作によるクリックは除く
    var kinds = ['star', 'dot', 'heart'];
    for (var j = 0; j < 10; j++) {
      var d = document.createElement('span');
      d.className = 'burst-dot';
      var ang = (Math.PI * 2 * j) / 10 + rnd(-.3, .3);
      var dist = rnd(40, 90);
      d.style.left = e.clientX + 'px';
      d.style.top = e.clientY + 'px';
      d.style.width = d.style.height = rnd(10, 18).toFixed(0) + 'px';
      d.style.setProperty('--bx', (Math.cos(ang) * dist).toFixed(0) + 'px');
      d.style.setProperty('--by', (Math.sin(ang) * dist).toFixed(0) + 'px');
      d.style.animation = 'hj-burst ' + rnd(.6, .9).toFixed(2) + 's cubic-bezier(.2,.8,.3,1) forwards';
      d.innerHTML = shapes[kinds[j % 3]].replace(/__C__/g, colors[j % colors.length]);
      document.body.appendChild(d);
      setTimeout(function (x) { return function () { x.remove(); }; }(d), 1000);
    }
  });
});
