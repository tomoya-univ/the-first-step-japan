# CSS・JS の読み込みに、中身から作った版番号（?v=...）を付ける。
# ファイルを更新したら実行すると、閲覧者のブラウザに古いファイルが残らない。
import glob, hashlib, re, sys, os
root = sys.argv[1] if len(sys.argv) > 1 else '.'
assets = ['css/fonts.css', 'css/style.css', 'js/main.js']
ver = {a: hashlib.md5(open(os.path.join(root, a), 'rb').read()).hexdigest()[:8] for a in assets}
for f in glob.glob(os.path.join(root, '*.html')):
    s = open(f, encoding='utf-8').read()
    for a, v in ver.items():
        s = re.sub(r'(["\'])' + re.escape(a) + r'(\?v=[0-9a-f]+)?\1', lambda m: m.group(1) + a + '?v=' + v + m.group(1), s)
    open(f, 'w', encoding='utf-8').write(s)
print(ver)
