# 把小老虎的眼睛、嘴巴擦掉（只留鼻子），做成「空白臉」：
# 毛色、嘴邊米色、腮紅各自用周圍顏色擬合平滑漸層補上，再依原本的形狀拼回去。
import sys, numpy as np, cv2
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]
a = np.array(Image.open(SRC).convert('RGBA')).astype(np.float64)
H, W = a.shape[:2]; rgb = a[..., :3]
yy, xx = np.mgrid[0:H, 0:W]

EYES = [(474, 447), (778, 446)]; ER = 84
erase = np.zeros((H, W), np.uint8)
for c in EYES: cv2.circle(erase, c, ER, 1, -1)
cv2.ellipse(erase, (630, 598), (104, 84), 0, 0, 360, 1, -1)
cv2.rectangle(erase, (536, 512), (724, 545), 1, -1)
nose = np.zeros((H, W), np.uint8); cv2.ellipse(nose, (628, 488), (37, 23), 0, 0, 360, 1, -1)
erase[nose > 0] = 0
E = erase > 0

r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
ok = (a[..., 3] > 240) & ~E
near = cv2.dilate(erase, np.ones((61, 61), np.uint8)) > 0
cream = ok & near & (r > 238) & (g > 220) & (b > 175) & (r - b < 70)
pink = ok & near & (r > 225) & (g < 185) & (b > 120) & (r - g > 55)
fur = ok & near & (r > 220) & (g > 130) & (g < 215) & (b < 140) & ~pink

def fit(mask, deg=2):
    ys, xs = np.where(mask); X = xs / W; Y = ys / H
    cols = [X ** i * Y ** j for i in range(deg + 1) for j in range(deg + 1 - i)]
    A = np.stack(cols, 1); out = []
    for ch in range(3):
        coef, *_ = np.linalg.lstsq(A, rgb[ys, xs, ch], rcond=None); out.append(coef)
    Xg, Yg = xx / W, yy / H
    G = np.stack([Xg ** i * Yg ** j for i in range(deg + 1) for j in range(deg + 1 - i)], -1)
    return np.clip(np.stack([G @ c for c in out], -1), 0, 255)

furC, creamC = fit(fur), fit(cream)
# 嘴邊米色的形狀：用沒被擦掉的米色邊緣擬合橢圓
allcream = (a[..., 3] > 240) & (r > 238) & (g > 220) & (b > 175) & (r - b < 70)
allcream[:400] = False; allcream[760:] = False
cnts, _ = cv2.findContours((allcream | E & (yy > 470) & (np.abs(xx - 628) < 160)).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
big = max(cnts, key=cv2.contourArea)
pts = big[:, 0, :]; pts = pts[~E[pts[:, 1], pts[:, 0]]]
el = cv2.fitEllipse(pts.reshape(-1, 1, 2).astype(np.int32))
mz = np.zeros((H, W), np.uint8); cv2.ellipse(mz, el, 1, -1)
mzs = cv2.GaussianBlur(mz.astype(np.float64), (0, 0), 1.6)
fill = furC * (1 - mzs[..., None]) + creamC * mzs[..., None]
# 腮紅：用剩下的粉紅擬合兩個橢圓，柔邊疊回
for side in (pink & (xx < 628), pink & (xx > 628)):
    c2, _ = cv2.findContours(side.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not c2: continue
    cc = max(c2, key=cv2.contourArea); p2 = cc[:, 0, :]; p2 = p2[~E[p2[:, 1], p2[:, 0]]]
    if len(p2) < 6: continue
    e2 = cv2.fitEllipse(p2.reshape(-1, 1, 2).astype(np.int32))
    bm = np.zeros((H, W), np.uint8); cv2.ellipse(bm, e2, 1, -1)
    bms = cv2.GaussianBlur(bm.astype(np.float64), (0, 0), 6) * .9
    pc = rgb[side].mean(0)
    fill = fill * (1 - bms[..., None]) + pc * bms[..., None]
soft = cv2.GaussianBlur(erase.astype(np.float64), (0, 0), 2.5)
soft = np.where(E, 1, soft * 1.6).clip(0, 1)
o = a.copy(); o[..., :3] = rgb * (1 - soft[..., None]) + fill * soft[..., None]
al = o[..., 3]; al[al < 40] = 0; al[al >= 245] = 255
Image.fromarray(o.astype(np.uint8)).save(OUT)
print('muzzle ellipse', el)
