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

  // 5) スマホでスクロールしているとき、指の通った跡にキラキラを残す
  var lastSpark = 0;
  document.addEventListener('touchmove', function (e) {
    var now = Date.now();
    if (now - lastSpark < 45) return; // 出しすぎないように間引く
    lastSpark = now;
    var t = e.touches[0];
    if (!t) return;
    var kinds = ['star', 'dot', 'star', 'heart'];
    for (var j = 0; j < 2; j++) {
      var d = document.createElement('span');
      d.className = 'burst-dot';
      var size = rnd(10, 18);
      d.style.left = (t.clientX + rnd(-14, 14)).toFixed(0) + 'px';
      d.style.top = (t.clientY + rnd(-14, 14)).toFixed(0) + 'px';
      d.style.width = d.style.height = size.toFixed(0) + 'px';
      d.style.setProperty('--bx', rnd(-30, 30).toFixed(0) + 'px');
      d.style.setProperty('--by', rnd(10, 50).toFixed(0) + 'px');
      d.style.animation = 'hj-burst ' + rnd(.6, 1).toFixed(2) + 's ease-out forwards';
      d.innerHTML = shapes[kinds[Math.floor(rnd(0, 4))]].replace(/__C__/g, colors[Math.floor(rnd(0, colors.length))]);
      document.body.appendChild(d);
      setTimeout(function (x) { return function () { x.remove(); }; }(d), 1100);
    }
  }, { passive: true });
});

// ---------- 季節の飾り・上に戻るボタン・ページ移動の演出 ----------
document.addEventListener('DOMContentLoaded', function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  // 足あと1つ分の絵（left: 左足 / それ以外: 右足）
  function footprint(color, left) {
    var toes = left
      ? '<circle cx="13" cy="-4" r="2.4"/><circle cx="15.5" cy="-.5" r="2.1"/><circle cx="15" cy="3" r="1.8"/><circle cx="12.5" cy="5.8" r="1.5"/>'
      : '<circle cx="13" cy="4" r="2.4"/><circle cx="15.5" cy=".5" r="2.1"/><circle cx="15" cy="-3" r="1.8"/><circle cx="12.5" cy="-5.8" r="1.5"/>';
    return '<svg viewBox="-12 -12 32 24" aria-hidden="true"><g fill="' + color + '"><ellipse cx="0" cy="0" rx="11" ry="6.5"/>' + toes + '</g></svg>';
  }

  // 1) 季節の飾り（12〜2月：雪、3〜5月：桜、6〜8月：シャボン玉、9〜11月：落ち葉）
  //    ※ 確認用に URL の末尾へ ?season=winter などを付けると、その季節で表示できる
  if (!reduce) {
    var m = new Date().getMonth() + 1;
    var season = m === 12 || m <= 2 ? 'winter' : m <= 5 ? 'spring' : m <= 8 ? 'summer' : 'autumn';
    var q = /[?&]season=(winter|spring|summer|autumn)/.exec(location.search);
    if (q) season = q[1];
    var art = {
      winter: function () {
        var c = pick(['#9CC3F5', '#B9D6FA', '#7CB5FF']);
        return '<svg viewBox="0 0 24 24"><g stroke="' + c + '" stroke-width="2" stroke-linecap="round" fill="none">' +
          '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5"/></g></svg>';
      },
      spring: function () {
        var c = pick(['#F7B6C8', '#F9C9D6', '#F29BB5']);
        return '<svg viewBox="0 0 24 24"><path fill="' + c + '" d="M12 22C6 18 4 12 6 7c1.5-3.5 4-5 6-3 2-2 4.5-.5 6 3 2 5 0 11-6 15z"/><path d="M12 4l-1 3 1 1 1-1z" fill="#fff" opacity=".7"/></svg>';
      },
      summer: function () {
        var c = pick(['#7CB5FF', '#9AD7C4', '#C7A8F0', '#F7B6C8']);
        return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="' + c + '" fill-opacity=".18" stroke="' + c + '" stroke-width="1.6"/><path d="M7 9a6 6 0 0 1 4-3.5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
      },
      autumn: function () {
        var c = pick(['#F28C28', '#E86A3A', '#F2B134', '#C9572B']);
        return '<svg viewBox="0 0 24 24"><path fill="' + c + '" d="M12 2l2 4.5 4-2-1 4.5 4.5 1-3.5 3 1.5 4-4.5-1L12 21l-3-5-4.5 1L6 13 2.5 10 7 9 6 4.5l4 2z"/><path d="M12 21v3" stroke="' + c + '" stroke-width="1.5"/></svg>';
      }
    }[season];
    document.querySelectorAll('.hero, .page-hero').forEach(function (area) {
      var layer = document.createElement('div');
      layer.className = 'season-layer' + (season === 'summer' ? ' bubble' : '');
      layer.setAttribute('aria-hidden', 'true');
      var n = area.classList.contains('hero') ? 14 : 8;
      var h = area.offsetHeight + 80;
      for (var i = 0; i < n; i++) {
        var el = document.createElement('span');
        el.className = 'fall';
        var size = season === 'summer' ? rnd(20, 44) : rnd(16, 30);
        el.style.cssText = 'left:' + rnd(0, 98).toFixed(1) + '%;width:' + size.toFixed(0) + 'px;opacity:' + rnd(.6, .95).toFixed(2) +
          ';--t:' + rnd(7, 14).toFixed(1) + 's;--dl:-' + rnd(0, 14).toFixed(1) + 's;--st:' + rnd(2, 4).toFixed(1) + 's;--h:' + h + 'px;--r:' +
          (season === 'winter' ? rnd(90, 240) : rnd(180, 540)).toFixed(0) + 'deg';
        el.innerHTML = art();
        layer.appendChild(el);
      }
      area.insertBefore(layer, area.firstChild);
    });
  }

  // 2) 足あとの「上に戻る」ボタン
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'to-top';
  btn.setAttribute('aria-label', 'ページの上に戻る');
  btn.innerHTML = '<svg viewBox="-12 -12 32 24" aria-hidden="true" style="transform:rotate(-90deg)"><g fill="#26252E"><ellipse cx="0" cy="0" rx="11" ry="6.5"/><circle cx="13" cy="-4" r="2.4"/><circle cx="15.5" cy="-.5" r="2.1"/><circle cx="15" cy="3" r="1.8"/><circle cx="12.5" cy="5.8" r="1.5"/></g></svg><span aria-hidden="true">うえへ</span>';
  document.body.appendChild(btn);
  var shown = false;
  function toggleBtn() {
    var s = window.scrollY > window.innerHeight * 0.8;
    if (s !== shown) { shown = s; btn.classList.toggle('is-shown', s); }
  }
  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();
  btn.addEventListener('click', function () {
    if (reduce) { window.scrollTo(0, 0); return; }
    // ボタンの位置から、足あとがぺたぺた上へ歩いていく
    var r = btn.getBoundingClientRect();
    var x = r.left + r.width / 2 - 13;
    for (var i = 0; i < 7; i++) {
      (function (i) {
        setTimeout(function () {
          var p = document.createElement('span');
          p.className = 'walk-print';
          p.style.left = (x + (i % 2 ? 10 : -10)) + 'px';
          p.style.top = (r.top - 40 - i * 46) + 'px';
          p.innerHTML = footprint(i % 2 ? '#F28C28' : '#1F64C8', i % 2 === 0);
          document.body.appendChild(p);
          setTimeout(function () { p.remove(); }, 950);
        }, i * 90);
      })(i);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  setTimeout(function () { document.documentElement.classList.remove('arrive'); }, 800);

  // 3) サイト内のページへ移るとき、足あとが画面を横切ってから切り替える
  if (reduce) return;
  var transit = null;
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.hash) return; // 同じページ内の移動はそのまま
    e.preventDefault();
    transit = document.createElement('div');
    transit.className = 'transit';
    transit.setAttribute('aria-hidden', 'true');
    var row = '<div class="row">';
    for (var i = 0; i < 6; i++) {
      row += footprint(i % 2 ? '#F28C28' : '#1F64C8', i % 2 === 0).replace('<svg ', '<svg style="animation-delay:' + (0.15 + i * 0.06) + 's;margin-top:' + (i % 2 ? 16 : 0) + 'px" ');
    }
    transit.innerHTML = row + '</div>';
    document.body.appendChild(transit);
    requestAnimationFrame(function () { transit.classList.add('is-in'); });
    try { sessionStorage.setItem('hjTransit', '1'); } catch (err) {}
    setTimeout(function () { location.href = a.href; }, 650);
  });
  // 「戻る」でこのページに帰ってきたとき、幕が残らないようにする
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      if (transit) { transit.remove(); transit = null; }
      document.documentElement.classList.remove('arrive');
      try { sessionStorage.removeItem('hjTransit'); } catch (err) {}
    }
  });
});
