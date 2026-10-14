"""앱 아이콘 생성: python tools/make-icons.py  (Pillow 필요)"""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / 'assets' / 'icons'
OUT.mkdir(parents=True, exist_ok=True)

BG = (59, 110, 165)
BODY = (159, 180, 201)
LINE = (86, 103, 124)
SUIT = (47, 59, 89)
TIE = (214, 70, 58)


def draw(size, pad_ratio):
    S = 1024  # 크게 그린 뒤 축소 (안티앨리어싱)
    img = Image.new('RGBA', (S, S), BG + (255,))
    d = ImageDraw.Draw(img)
    p = S * pad_ratio
    sc = (S - 2 * p) / 220  # SVG 좌표계(200x220) → 픽셀
    ox = p + (S - 2 * p - 200 * sc) / 2
    oy = p

    def P(x, y):
        return (ox + x * sc, oy + y * sc)

    w = max(2, int(3 * sc))
    d.polygon([P(96, 58), P(110, 6), P(132, 10), P(128, 60)], fill=BODY, outline=LINE, width=w)
    d.polygon([P(96, 166), P(110, 214), P(132, 210), P(128, 162)], fill=BODY, outline=LINE, width=w)
    d.polygon([P(166, 70), P(184, 80), P(180, 92), P(190, 104), P(180, 116), P(190, 128),
               P(180, 140), P(184, 152), P(166, 156)], fill=BODY, outline=LINE, width=w)
    box = [P(26, 48), P(174, 176)]
    d.ellipse(box, fill=BODY)
    # 정장 (몸통 타원 안쪽만)
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).ellipse(box, fill=255)
    suit = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    sd = ImageDraw.Draw(suit)
    sd.polygon([P(58, 128), P(150, 128), P(176, 190), P(40, 190)], fill=SUIT)
    sd.polygon([P(92, 128), P(120, 128), P(106, 162)], fill=(255, 255, 255))
    sd.polygon([P(102, 130), P(110, 130), P(112, 156), P(106, 166), P(100, 156)], fill=TIE)
    img.paste(suit, (0, 0), Image.composite(suit, Image.new('RGBA', (S, S)), mask).split()[3])
    d.ellipse(box, outline=LINE, width=w)
    # 눈, 입, 볼
    d.ellipse([P(50, 80), P(74, 104)], fill=(255, 255, 255), outline=(42, 52, 70), width=w)
    d.ellipse([P(52.5, 87.5), P(63.5, 98.5)], fill=(29, 36, 51))
    d.ellipse([P(69, 105), P(87, 115)], fill=(255, 159, 176))
    d.arc([P(28, 108), P(44, 124)], 20, 160, fill=(29, 36, 51), width=w)
    return img.resize((size, size), Image.LANCZOS)


draw(192, 0.08).save(OUT / 'icon-192.png')
draw(512, 0.08).save(OUT / 'icon-512.png')
draw(512, 0.2).save(OUT / 'icon-maskable-512.png')
print('icons ->', OUT)
