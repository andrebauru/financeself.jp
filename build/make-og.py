#!/usr/bin/env python3
"""
FinanceSelf.jp — Open Graph image generator (1200x630).

Composes the brand icon (assets/img/icon-512.png) with wordmark text using
Pillow. No network / browser needed.

Usage:  python make-og.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
OUT = IMG / "og-image.png"

W, H = 1200, 630

BG_TOP = (11, 17, 32)      # #0B1120
BG_BOTTOM = (17, 27, 51)   # #111B33
CYAN = (34, 211, 238)      # #22D3EE
VIOLET = (139, 92, 246)    # #8B5CF6
WHITE = (241, 245, 249)    # #F1F5F9
GRAY = (148, 163, 184)     # #94A3B8
DARKGRAY = (100, 116, 139) # #64748B

FONT_CANDIDATES = [
    "C:/Windows/Fonts/segoeuib.ttf",   # Segoe UI Bold
    "C:/Windows/Fonts/arialbd.ttf",    # Arial Bold
    "C:/Windows/Fonts/calibrib.ttf",   # Calibri Bold
    "C:/Windows/Fonts/segoeui.ttf",
    "C:/Windows/Fonts/arial.ttf",
]


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for candidate in FONT_CANDIDATES:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def draw_tagline(draw: ImageDraw.ImageDraw, text: str, font, y: int, fill, spacing: int = 6) -> None:
    """Letter-spaced centered tagline."""
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x = (W - total) / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill)
        x += w + spacing


def main() -> None:
    # --- Background: vertical gradient ---
    base = Image.new("RGB", (W, H))
    px = base.load()
    for y in range(H):
        t = y / (H - 1)
        r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t)
        g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t)
        b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t)
        for x in range(W):
            px[x, y] = (r, g, b)

    # --- Soft glows ---
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([40, -160, 480, 280], fill=CYAN + (70,))
    gd.ellipse([760, 380, 1280, 900], fill=VIOLET + (60,))
    glow = glow.filter(ImageFilter.GaussianBlur(130))
    base = Image.alpha_composite(base.convert("RGBA"), glow)

    draw = ImageDraw.Draw(base)

    # --- Brand icon ---
    icon = Image.open(IMG / "icon-512.png").convert("RGBA").resize((170, 170), Image.LANCZOS)
    base.alpha_composite(icon, ((W - 170) // 2, 72))

    # --- Wordmark: "FinanceSelf" + ".jp" ---
    title_font = load_font(74)
    w1 = draw.textlength("FinanceSelf", font=title_font)
    w2 = draw.textlength(".jp", font=title_font)
    x0 = (W - (w1 + w2)) / 2
    y0 = 300
    draw.text((x0, y0), "FinanceSelf", font=title_font, fill=WHITE)
    draw.text((x0 + w1, y0), ".jp", font=title_font, fill=CYAN)

    # --- Tagline ---
    tag_font = load_font(27)
    draw_tagline(draw, "CODE · HARDWARE · AI", tag_font, 432, GRAY, spacing=8)

    # --- Bottom strip ---
    sub_font = load_font(25)
    sub = "App Development  ·  CRM  ·  Automation  ·  AI Integration"
    sw = draw.textlength(sub, font=sub_font)
    draw.text(((W - sw) / 2, 520), sub, font=sub_font, fill=DARKGRAY)

    base.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"OK {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB, {W}x{H})")


if __name__ == "__main__":
    main()
