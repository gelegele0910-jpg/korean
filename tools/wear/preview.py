# 檢查圖：draw.js 畫的每一件穿在小老虎身上（不經過 build，直接看 out/drawn）
import os, sys, glob
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(HERE, 'out')
TS, TX, TY, CV = .78, 138, 250, 1254
tiger = Image.open(os.path.join(D, 'expr_happy.png')).convert('RGBA').resize((round(CV * TS),) * 2, Image.LANCZOS)
fs = sorted(glob.glob(os.path.join(D, 'drawn', '*.png'))); pref = sys.argv[1] if len(sys.argv) > 1 else ''
fs = [f for f in fs if os.path.basename(f).startswith(pref)]
tiles = []
for f in fs:
    cv = Image.new('RGBA', (CV, CV), (255, 231, 207, 255)); cv.alpha_composite(tiger, (TX, TY)); cv.alpha_composite(Image.open(f).convert('RGBA'))
    tiles.append(cv.resize((260, 260), Image.LANCZOS))
C = 6; G = Image.new('RGBA', (C * 264, ((len(tiles) + C - 1) // C) * 264), (240, 240, 245, 255))
for i, t in enumerate(tiles): G.alpha_composite(t, ((i % C) * 264 + 2, (i // C) * 264 + 2))
G.save(os.path.join(D, 'preview.png')); print(len(tiles))
