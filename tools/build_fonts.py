# サイトで使う文字だけを含む軽いフォント（A）と、残りの文字を含む予備フォント（B）を作る
import re, glob, html, sys, os
from fontTools.ttLib import TTFont
from fontTools import subset
SITE = sys.argv[1]; SRC = sys.argv[2]; OUT = os.path.join(SITE, 'fonts')
os.makedirs(OUT, exist_ok=True)
text = ''
for f in glob.glob(SITE + '/*.html') + glob.glob(SITE + '/js/*.js') + glob.glob(SITE + '/css/*.css'):
    text += html.unescape(open(f, encoding='utf-8').read())
base = set(range(0x20, 0x7F)) | set(range(0xA0, 0x100)) | set(range(0x3000, 0x3100)) | set(range(0x30A0, 0x3100)) \
     | set(range(0xFF01, 0xFF5F)) | set(range(0x2010, 0x2070)) | set(range(0x2190, 0x21A0)) | {0x25CB, 0x25CF, 0x25A0, 0x25B2, 0x2605, 0x2606, 0x203B}
used = {ord(c) for c in text if ord(c) >= 0x20} | base
weights = {'400': 'Regular', '500': 'Medium', '700': 'Bold', '900': 'Black'}
def ranges(cps):
    cps = sorted(cps); out = []; s = p = cps[0]
    for c in cps[1:]:
        if c == p + 1: p = c; continue
        out.append((s, p)); s = p = c
    out.append((s, p))
    return ','.join('U+%X' % a if a == b else 'U+%X-%X' % (a, b) for a, b in out)
css = ['/* Zen Maru Gothic（SIL Open Font License 1.1）をサイト内に置いたもの。fonts/OFL.txt 参照 */']
for w, name in weights.items():
    path = f'{SRC}/ZenMaruGothic-{name}.ttf'
    cmap = set(TTFont(path)['cmap'].getBestCmap().keys())
    a = used & cmap; b = cmap - a
    for tag, cps in (('a', a), ('b', b)):
        opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
        font = TTFont(path); sub = subset.Subsetter(opts); sub.populate(unicodes=cps); sub.subset(font)
        fn = f'zen-maru-gothic-{w}-{tag}.woff2'; font.flavor = 'woff2'; font.save(os.path.join(OUT, fn))
        # B は「A 以外のすべて」として範囲を書く（フォントに無い文字を含めても害はなく、記述が短くなる）
        rng = ranges(cps) if tag == 'a' else ranges(set(range(0x20, 0x10000)) - a)
        css.append('@font-face { font-family: "Zen Maru Gothic"; font-style: normal; font-weight: %s; font-display: swap; src: url("../fonts/%s") format("woff2"); unicode-range: %s; }' % (w, fn, rng))
open(os.path.join(SITE, 'css', 'fonts.css'), 'w', encoding='utf-8').write('\n'.join(css) + '\n')
print('used chars', len(used))
