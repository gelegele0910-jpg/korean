# 小老虎的身體輪廓遮罩（往內縮 9px、17px），draw.js 用來讓衣服貼身並留出外框
import os, numpy as np
from PIL import Image
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
a = ndimage.binary_fill_holes(np.array(Image.open(os.path.join(HERE, 'src', 'tiger.png')).convert('RGBA'))[..., 3] > 128)
for n in (9, 17):
    Image.fromarray((ndimage.binary_erosion(a, iterations=n) * 255).astype(np.uint8)).save(os.path.join(HERE, 'out', f'sil{n}.png'))
