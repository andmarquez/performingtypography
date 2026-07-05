#!/usr/bin/env python3
"""Pick and trim transparent character art from Figma raw image fills."""
import json
import sys
import urllib.request
from io import BytesIO

from PIL import Image

USER_AGENT = 'performingtypography-asset-sync/1.0'
FRAME_W = 48
FRAME_H = 64


def load_url(url: str) -> Image.Image:
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req) as res:
        return Image.open(BytesIO(res.read())).convert('RGBA')


def score_image(img: Image.Image) -> tuple[int, Image.Image | None]:
    w, h = img.size
    if w > 1200 or h > 1200:
        return -1, None

    alpha = img.split()[-1]
    lo, _hi = alpha.getextrema()
    if lo > 240:
        return -1, None

    bbox = img.getbbox()
    if not bbox:
        return -1, None

    trimmed = img.crop(bbox)
    tw, th = trimmed.size
    if tw < 12 or th < 16:
        return -1, None

    area = tw * th
    zone_area = FRAME_W * FRAME_H
    if area > zone_area * 120:
        return -1, None

    size_penalty = abs(tw - FRAME_W) + abs(th - FRAME_H)
    return area + size_penalty * 4, trimmed


def main() -> None:
    payload = json.load(sys.stdin)
    urls = list(reversed(payload.get('urls', [])))

    best: Image.Image | None = None
    best_score = -1

    for url in urls:
        try:
            img = load_url(url)
            score, trimmed = score_image(img)
            if score < 0:
                continue
            if best is None or score < best_score:
                best = trimmed
                best_score = score
        except Exception:
            continue

    if best is None:
        sys.exit(1)

    best.save(sys.stdout.buffer, format='PNG')


if __name__ == '__main__':
    main()
