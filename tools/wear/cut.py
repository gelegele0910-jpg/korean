# 從使用者的總覽圖切出每一件配件：
# 1. 每條類別橫帶裡，用「有顏色或偏暗」的像素做直行投影，空隙就是兩件之間 → 每件的範圍
# 2. 範圍內用 GrabCut 分出物件與背景，再去掉外圍的白色貼紙邊（保留物件內部被包住的白色）
import sys, os, json
import numpy as np, cv2
from PIL import Image
from scipy import ndimage
SRC, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
rgb = np.array(Image.open(SRC).convert('RGB'))
im = rgb.astype(int); sat = im.max(-1) - im.min(-1); lum = (im[..., 0] * 3 + im[..., 1] * 6 + im[..., 2]) / 10
BANDS = {  # 類別: (y0, y1, x0, x1, 件數)
  'hat': (40, 133, 324, 1522, 12), 'headband': (178, 262, 324, 1522, 12),
  'glasses': (330, 392, 326, 932, 7), 'sticker': (334, 390, 958, 1522, 8),
  'neck': (434, 514, 334, 1004, 7), 'top': (564, 652, 334, 1522, 10),
  'prop': (690, 776, 897, 1530, 12), 'bg': (842, 936, 326, 1070, 8), 'fx': (856, 938, 1090, 1530, 5),
}
# 靠太近、自動切不好的排：手動給切點（原圖 x 座標）
CUTS = {'headband': [324, 425, 525, 628, 727, 820, 930, 1022, 1118, 1213, 1318, 1428, 1510],
        'prop': [900, 968, 1013, 1072, 1120, 1183, 1234, 1274, 1338, 1390, 1430, 1469, 1532],
        'fx': [1090, 1160, 1223, 1290, 1366, 1410, 1468, 1532]}
info = {}
for cat, (y0, y1, x0, x1, n) in BANDS.items():
    cnt = ((sat[y0:y1, x0:x1] > 45) | (lum[y0:y1, x0:x1] < 175)).sum(0).astype(float)
    nz = np.where(cnt > 1)[0]; st, en = nz.min(), nz.max() + 1; pitch = (en - st) / n
    sm = np.convolve(cnt, np.ones(3) / 3, 'same'); cuts = [st]
    for k in range(1, n):
        c0 = st + k * pitch; lo, hi = int(c0 - pitch * .32), int(c0 + pitch * .32)
        cuts.append(lo + int(np.argmin(sm[lo:hi])))
    cuts.append(en); segs = [(cuts[k], cuts[k + 1]) for k in range(n)]
    if cat in CUTS: segs = [(CUTS[cat][k] - x0, CUTS[cat][k + 1] - x0) for k in range(len(CUTS[cat]) - 1)]
    print(cat, [(x0 + a, x0 + b) for a, b in segs])
    for m, (a, b) in enumerate(segs):
        X0, X1 = max(0, x0 + a - 4), x0 + b + 4; Y0, Y1 = y0 - 6, y1 + 6
        crop = rgb[Y0:Y1, X0:X1].copy()
        rows = ((sat[Y0:Y1, X0:X1] > 45) | (lum[Y0:Y1, X0:X1] < 175)).any(1); ry = np.where(rows)[0]
        mask = np.zeros(crop.shape[:2], np.uint8)
        rect = (6, max(1, ry.min() - 6), crop.shape[1] - 12, min(crop.shape[0] - 2, ry.max() + 6) - max(1, ry.min() - 6))
        bgm, fgm = np.zeros((1, 65)), np.zeros((1, 65))
        cv2.grabCut(cv2.cvtColor(crop, cv2.COLOR_RGB2BGR), mask, rect, bgm, fgm, 6, cv2.GC_INIT_WITH_RECT)
        fg = (mask == 1) | (mask == 3)
        c = im[Y0:Y1, X0:X1]; ws = (c.min(-1) > 238) & ((c.max(-1) - c.min(-1)) < 20)
        # 外圍白邊：和物件外面連在一起的白色像素
        outside = ~fg | ws
        if f'{cat}_{m + 1:02d}' in ('prop_06', 'sticker_07'):  # 國旗：旗面本身是白色 → 用有顏色部分的凸包當範圍
            colr = ((c.max(-1) - c.min(-1)) > 45) | (((c[..., 0] * 3 + c[..., 1] * 6 + c[..., 2]) / 10) < 175)
            hull = cv2.convexHull(np.argwhere(colr)[:, ::-1].astype(np.int32)); hm = np.zeros(colr.shape, np.uint8); cv2.fillConvexPoly(hm, hull, 1)
            outside = hm == 0
        lb, _ = ndimage.label(outside); edge = set(np.unique(np.concatenate([lb[0], lb[-1], lb[:, 0], lb[:, -1]]))) - {0}
        outer = np.isin(lb, list(edge))
        obj = ~outer
        lb2, k2 = ndimage.label(obj)
        if k2 == 0: continue
        sz = ndimage.sum(obj, lb2, range(1, k2 + 1)); keep = [j + 1 for j, v in enumerate(sz) if v >= sz.max() * .05]
        obj = ndimage.binary_fill_holes(np.isin(lb2, keep))
        al = (ndimage.gaussian_filter(obj.astype(float), .6) * 255).clip(0, 255).astype(np.uint8)
        img = Image.fromarray(np.dstack([crop, al])); img = img.crop(img.getchannel('A').getbbox())
        name = f'{cat}_{m + 1:02d}'; img.save(os.path.join(OUT, name + '.png')); info[name] = img.size
json.dump(info, open(os.path.join(OUT, 'info.json'), 'w'))
