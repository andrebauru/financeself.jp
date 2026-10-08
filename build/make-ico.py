#!/usr/bin/env python3
"""
FinanceSelf.jp — favicon.ico assembler.

Packs the pre-rendered PNGs (assets/img/icon-{16..256}.png) into a single
multi-resolution ICO file. Modern .ico containers store PNG-encoded entries,
so no re-encoding is needed — sizes stay pixel-perfect.

Usage:  python make-ico.py
"""
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
SIZES = [16, 32, 48, 64, 128, 256]
OUT = ROOT / "favicon.ico"


def main() -> None:
    pngs = []
    for size in SIZES:
        data = (IMG / f"icon-{size}.png").read_bytes()
        pngs.append((size, data))

    header = struct.pack("<HHH", 0, 1, len(pngs))  # reserved, type=1 (icon), count
    offset = 6 + 16 * len(pngs)
    entries = b""
    blobs = b""

    for size, data in pngs:
        # width, height (0 means 256), colors, reserved, planes, bpp, size, offset
        entries += struct.pack(
            "<BBBBHHII",
            size % 256,  # 256 → 0
            size % 256,
            0,  # palette colors
            0,  # reserved
            1,  # color planes
            32,  # bits per pixel
            len(data),
            offset,
        )
        blobs += data
        offset += len(data)

    OUT.write_bytes(header + entries + blobs)
    print(f"OK favicon.ico ({OUT.stat().st_size} bytes, {len(pngs)} sizes: {SIZES})")


if __name__ == "__main__":
    main()
