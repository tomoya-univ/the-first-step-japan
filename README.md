# はじめのいっぽ Webサイト

公開URL：https://tomoya-univ.github.io/the-first-step-japan/

親子で体験するお絵かきアプリ「おえかきひろば」の紹介サイトです（GitHub Pages で公開）。

## ファイル構成
- index.html … トップ
- about.html … 活動について
- howto.html … あそびかた
- kids.html … こどものみんなへ
- parents.html … 保護者の皆様へ
- kindergarten.html … 園・施設の皆様へ
- contact.html … お問い合わせ（Googleフォームへのリンク）
- css/style.css、js/main.js、images/

## フォントについて
- 文字は Zen Maru Gothic（SIL Open Font License 1.1、fonts/OFL.txt）をサイト内に置いて表示しています（Google Fonts は使っていません）。
- 太さごとに「サイトで使っている文字だけの軽いファイル（-a）」と「それ以外の文字のファイル（-b）」に分けています。-b は、ページに新しい漢字などが出てきたときだけ読み込まれます。
- 文章を大きく書き換えたときは、軽いファイルを作り直すと表示が速くなります。
  1. `pip install fonttools brotli`
  2. https://github.com/google/fonts の `ofl/zenmarugothic` から ttf を入手
  3. `python3 tools/build_fonts.py . <ttfのフォルダ>`

## 更新したときは
CSS・JS を書き換えたら `python3 tools/bump_version.py .` を実行してください。読み込みに版番号が付き、閲覧者のブラウザに古いファイルが残らなくなります。
