# 產生小老虎換裝圖層 img/wear/*.webp（400×400，全部對齊同一個畫布，App 只要疊起來）
# 用法（在 repo 根目錄；需要 Python 的 numpy、scipy、opencv-python-headless、Pillow 與 Playwright）：
#   python3 tools/wear/blank.py tools/wear/src/tiger.png tools/wear/out/blank.png   # 擦掉眼睛嘴巴
#   node tools/wear/expr.js tools/wear/out tools/wear/src/tiger.png                 # 畫 9 種表情
#   python3 tools/wear/sil.py                                                       # 身體輪廓遮罩（給 draw.js）
#   node tools/wear/draw.js                                                         # 依身形重畫帽子、髮飾、頸部、服裝
#   python3 tools/wear/build.py                                                     # 輸出圖層（加 --gallery 另存檢查圖）
# 素材：src/tiger.png＝使用者提供的小老虎本體（1254）；src/items/＝從使用者的配件總覽圖切出來的單件（cut.py）。
# 位置一律寫在「小老虎原圖座標」（1254×1254 的像素）。新增配件：圖放 src/items/、在 LAYERS 加一行、需要時在 ADJ 微調。
import os, sys
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
IT = os.path.join(HERE, 'src', 'items'); OUTD = os.path.join(HERE, 'out'); DST = os.path.join(ROOT, 'img', 'wear')
CV = 1254; TS = .78; TX, TY = 138, 250   # 小老虎在畫布上的縮放與位置（上面留空間給帽子）
SIZE = 400                               # 輸出大小（App 最大顯示約 140px，高解析度螢幕 ×2～3）
EXPRS = ['happy', 'laugh', 'smile', 'surprise', 'love', 'cry', 'wink', 'sleepy', 'shy']

# 欄位 → 代號 → 素材檔名（代號是存檔 S.wear 的值，不要改）
LAYERS = {
  'bg': {'tower': 'bg_01', 'beach': 'bg_02', 'sakura': 'bg_03', 'palace': 'bg_04', 'river': 'bg_05', 'hanok': 'bg_06', 'autumn': 'bg_07', 'snow': 'bg_08'},
  'outfit': {'hanbok': 'top_01', 'bluehanbok': 'top_02', 'uniform': 'top_03', 'sailor': 'top_04', 'hoodie': 'top_05', 'varsity': 'top_06',
             'redcoat': 'top_07', 'apron': 'top_08', 'coat': 'top_09', 'explorer': 'top_10'},
  'neck': {'bow': 'neck_01', 'scarf': 'neck_02', 'check': 'neck_03', 'bell': 'neck_04', 'bandana': 'neck_05', 'badge': 'neck_06', 'phones': 'neck_07'},
  'stk': {'blush': 'sticker_01', 'hearts': 'sticker_02', 'stars': 'sticker_03', 'whisker': 'sticker_04', 'paw': 'sticker_05', 'bandage': 'sticker_06',
          'flag': 'sticker_07', 'sparkle': 'sticker_08'},
  'face': {'round': 'glasses_01', 'sun': 'glasses_02', 'heart': 'glasses_03', 'star': 'glasses_04', 'swirl': 'glasses_05', 'pixel': 'glasses_06', 'blue': 'glasses_07'},
  'hair': {'ribbon': 'headband_01', 'dotbow': 'headband_02', 'bunny': 'headband_03', 'cat': 'headband_04', 'antler': 'headband_05', 'flowers': 'headband_06',
           'laurel': 'headband_07', 'halo': 'headband_08', 'sprout': 'headband_09', 'bear': 'headband_10', 'hibiscus': 'headband_11', 'sakura': 'headband_12'},
  'hat': {'beret': 'hat_01', 'beanie': 'hat_02', 'bucket': 'hat_03', 'straw': 'hat_04', 'chef': 'hat_05', 'gat': 'hat_06', 'cap': 'hat_07',
          'detective': 'hat_08', 'wizard': 'hat_09', 'aviator': 'hat_10', 'sailor': 'hat_11', 'santa': 'hat_12'},
  'hand': {'book': 'prop_01', 'coffee': 'prop_02', 'kimbap': 'prop_03', 'mic': 'prop_04', 'camera': 'prop_05', 'flag': 'prop_06', 'stick': 'prop_07',
           'fan': 'prop_08', 'bag': 'prop_09', 'popsicle': 'prop_10', 'icecream': 'prop_11', 'bingsu': 'prop_12'},
  'fx': {'rainbow': 'fx_04', 'stars': 'fx_05', 'hearts': 'fx_06', 'wow': 'fx_07'},
  'frame': {'flowers': 'fx_01', 'stars': 'fx_02', 'heart': 'fx_03'},
}
# 每個欄位的預設位置：(錨點 b＝底邊中間／c＝中心, x, y, 寬)
POS = {'hat': ('b', 626, 330, 600), 'hair': ('b', 626, 300, 640), 'face': ('c', 626, 452, 470), 'neck': ('c', 626, 738, 330),
       'outfit': ('c', 618, 880, 700), 'hand': ('c', 935, 830, 250)}
ADJ = {  # 個別微調：(寬, x, y) 的差
  'hat_01': (0, 10, 10), 'hat_03': (0, 0, 20), 'hat_06': (60, 0, 40), 'hat_09': (0, 0, 20), 'hat_12': (40, 20, 10),
  'headband_03': (-60, 0, 10), 'headband_05': (40, 0, 40), 'headband_08': (-100, 0, -40), 'headband_10': (-80, 0, 60),
  'top_08': (-160, 0, 90), 'top_03': (-110, 0, 160), 'neck_02': (40, 0, 20), 'neck_06': (-200, 40, 60), 'neck_07': (300, 0, -300),
  'prop_07': (-20, 0, -40), 'prop_10': (-60, 0, -20), 'prop_11': (-50, 0, -20),
}
# 臉部貼紙：一對的（兩頰）拆成左右兩半各貼一邊；單一個的貼在一個位置。(x, y, 寬)
STK_PAIR = {'sticker_01': (150, 590), 'sticker_02': (120, 590), 'sticker_03': (125, 590), 'sticker_04': (130, 560)}
STK_ONE = {'sticker_05': (845, 600, 125), 'sticker_06': (840, 600, 150), 'sticker_07': (835, 595, 135), 'sticker_08': (905, 300, 170)}
CHEEK = (425, 830)
FX = {'fx_04': ('back', 626, 230, 1000), 'fx_05': ('front', 1040, 240, 230), 'fx_06': ('front', 1040, 250, 240), 'fx_07': ('front', 200, 300, 200)}

def ld(p): return Image.open(p).convert('RGBA')
def T(x, y): return TX + x * TS, TY + y * TS
def blank(): return Image.new('RGBA', (CV, CV), (0, 0, 0, 0))
def put(cv, im, x, y, w, anchor='c'):
    h = im.size[1] * w / im.size[0]; im = im.resize((max(1, round(w * TS)), max(1, round(h * TS))), Image.LANCZOS)
    cx, cy = T(x, y); cv.alpha_composite(im, (round(cx - w * TS / 2), round(cy - (h * TS if anchor == 'b' else h * TS / 2))))

def split_pair(im):
    """一對貼紙：找中間最空的直行切開"""
    a = im.getchannel('A'); w, h = im.size
    cols = [sum(1 for y in range(h) if a.getpixel((x, y)) > 40) for x in range(w)]
    mid = min(range(int(w * .3), int(w * .7) + 1), key=lambda x: (cols[x], abs(x - w / 2)))
    L, R = im.crop((0, 0, mid, h)), im.crop((mid, 0, w, h))
    return [p.crop(p.getchannel('A').getbbox()) for p in (L, R)]

def layer(slot, src):
    cv = blank(); im = ld(os.path.join(IT, src + '.png'))
    if slot == 'stk':
        if src in STK_PAIR:
            w, y = STK_PAIR[src]
            for part, x in zip(split_pair(im), CHEEK): put(cv, part, x, y, w * part.size[0] / max(split_pair(im)[0].size[0], 1))
        else:
            x, y, w = STK_ONE[src]; put(cv, im, x, y, w)
    elif slot == 'fx':
        _, x, y, w = FX[src]; put(cv, im, x, y, w)
    else:
        a, x, y, w = POS[slot]; dw, dx, dy = ADJ.get(src, (0, 0, 0)); put(cv, im, x + dx, y + dy, w + dw, a)
    return cv

def frame(src):
    f = ld(os.path.join(IT, src + '.png')).resize((CV, CV), Image.LANCZOS); hm = Image.new('L', (CV, CV), 255)
    ImageDraw.Draw(hm).ellipse((CV * .21, CV * .21, CV * .79, CV * .79), fill=0); hm = hm.filter(ImageFilter.GaussianBlur(8))
    f.putalpha(Image.composite(f.getchannel('A'), Image.new('L', (CV, CV), 0), hm)); return f

def bgtile(src):
    b = ld(os.path.join(IT, src + '.png')); return b.crop((7, 7, b.size[0] - 7, b.size[1] - 7)).resize((CV, CV), Image.LANCZOS)

def save(im, name, lossless=False):
    im.resize((SIZE, SIZE), Image.LANCZOS).save(os.path.join(DST, name + '.webp'), 'WEBP', quality=86, method=6, lossless=lossless)

if __name__ == '__main__':
    os.makedirs(DST, exist_ok=True)
    for f in os.listdir(DST):
        if f.endswith('.webp'): os.remove(os.path.join(DST, f))
    for e in EXPRS:
        cv = blank(); t = ld(os.path.join(OUTD, 'expr_' + e + '.png')).resize((round(CV * TS), round(CV * TS)), Image.LANCZOS)
        cv.alpha_composite(t, (TX, TY)); save(cv, 'tiger-' + e)
    for slot, items in LAYERS.items():
        for key, src in items.items():
            drawn = os.path.join(OUTD, 'drawn', f'{slot}-{key}.png')   # draw.js 依身形重畫的（帽子、髮飾、頸部、服裝）優先
            im = Image.open(drawn).convert('RGBA') if os.path.exists(drawn) else bgtile(src) if slot == 'bg' else frame(src) if slot == 'frame' else layer(slot, src)
            save(im, f'{slot}-{key}')
    back = [k for k, s in LAYERS['fx'].items() if FX[s][0] == 'back']
    print('ok', len(os.listdir(DST)), 'files; fx back:', back)
    if '--gallery' in sys.argv:  # 檢查圖：每件穿在小老虎身上（另外兩種表情）
        tiles = []
        for slot, items in LAYERS.items():
            for key in items:
                base = Image.new('RGBA', (SIZE, SIZE), (255, 231, 207, 255))
                for n in ([f'{slot}-{key}'] if slot == 'bg' else []) + ['tiger-' + ('smile' if len(tiles) % 2 else 'laugh')] + ([] if slot == 'bg' else [f'{slot}-{key}']):
                    base.alpha_composite(Image.open(os.path.join(DST, n + '.webp')).convert('RGBA'))
                tiles.append(base.resize((200, 200), Image.LANCZOS))
        C = 10; G = Image.new('RGBA', (C * 204, ((len(tiles) + C - 1) // C) * 204), (240, 240, 245, 255))
        for i, t in enumerate(tiles): G.alpha_composite(t, ((i % C) * 204 + 2, (i // C) * 204 + 2))
        os.makedirs(OUTD, exist_ok=True); G.save(os.path.join(OUTD, 'gallery.png')); print('gallery', len(tiles))
