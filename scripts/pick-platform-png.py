#!/usr/bin/env python3
"""Pick and trim the best transparent platform art from Figma raw image fills."""
import json
import sys
import urllib.request
from io import BytesIO

from PIL import Image

USER_AGENT = 'performingtypography-asset-sync/1.0'


def load_url(url: str) -> Image.Image:
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req) as res:
        return Image.open(BytesIO(res.read())).convert('RGBA')


def score_image(img: Image.Image, zone_w: int, zone_h: int) -> tuple[int, Image.Image | None]:
    w, h = img.size
    if w > 2500 or h > 1500:
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
    if tw < 8 or th < 8:
        return -1, None

    area = tw * th
    zone_area = max(zone_w * zone_h, 1)
    if area > zone_area * 40:
        return -1, None

    # Prefer art closest to the collision zone (not oversized scenery composites).
    size_penalty = abs(tw - zone_w) + abs(th - zone_h)
    return area + size_penalty * 8, trimmed


def main() -> None:
    payload = json.load(sys.stdin)
    zone_w = int(payload['zoneW'])
    zone_h = int(payload['zoneH'])
    # Raw fills only — node exports bake in opaque collision rectangles.
    urls = list(reversed(payload.get('urls', [])))

    best: Image.Image | None = None
    best_score = -1

    for url in urls:
        try:
            img = load_url(url)
            score, trimmed = score_image(img, zone_w, zone_h)
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
