#!/usr/bin/env python
"""
Download the Latin subsets of the four typefaces and commit them.

`next/font/google` fetches font files from Google during the build. That is a
network dependency in the build step, and it is what broke the first
Cloudflare Pages deploy: Turbopack could not resolve the internal font module
and the build failed with twelve "Module not found" errors on JetBrains Mono.
A build that reaches the internet can fail for reasons that have nothing to do
with the code, on a machine nobody can inspect.

Self-hosting removes the problem at the root: the files are in the repository,
the build is deterministic and offline, and it is faster. Run this only when
the typefaces change.

    python scripts/fetch_fonts.py
"""

from __future__ import annotations

import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "app" / "fonts"

# A modern UA is what makes Google serve woff2 rather than ttf.
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
)

# Google serves one variable woff2 per family and style, covering the whole
# weight range — asking for 400, 500 and 600 returns the same bytes three
# times. These are deduplicated by URL so the browser fetches each file once.
#
# family -> (css2 query, slug)
FAMILIES = {
    "Cinzel": ("Cinzel:wght@400;500;600", "cinzel"),
    "Inter": ("Inter:wght@400;500;600;700", "inter"),
    "JetBrains Mono": ("JetBrains+Mono:wght@400;500", "jetbrains-mono"),
    "Cormorant Garamond": (
        "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500",
        "cormorant-garamond",
    ),
}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf8")


def download(url: str, dest: Path) -> int:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    dest.write_bytes(data)
    return len(data)


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    written: list[str] = []

    for family, (query, slug) in FAMILIES.items():
        css = fetch(f"https://fonts.googleapis.com/css2?family={query}&display=swap")

        # Each @font-face block carries its subset in a preceding comment.
        blocks = re.split(r"/\*\s*([a-z0-9\-]+)\s*\*/", css)
        faces: list[tuple[int, str, str]] = []
        for i in range(1, len(blocks) - 1, 2):
            subset, body = blocks[i], blocks[i + 1]
            # Latin only: every word on this site is English.
            if subset != "latin":
                continue
            for face in re.findall(r"@font-face\s*\{[^}]*\}", body):
                style = "italic" if "font-style: italic" in face else "normal"
                weight = re.search(r"font-weight:\s*(\d+)", face)
                url = re.search(r"url\((https://[^)]+\.woff2)\)", face)
                if weight and url:
                    faces.append((int(weight.group(1)), style, url.group(1)))

        if not faces:
            print(f"ERROR: no latin faces found for {family}", file=sys.stderr)
            return 1

        # One file per (style, url); weights collapse onto the variable font.
        by_url: dict[tuple[str, str], list[int]] = {}
        for weight, style, url in faces:
            by_url.setdefault((style, url), []).append(weight)

        for (style, url), weights in by_url.items():
            name = f"{slug}{'-italic' if style == 'italic' else ''}.woff2"
            size = download(url, OUT / name)
            total += size
            span = f"{min(weights)} {max(weights)}" if len(weights) > 1 else str(weights[0])
            written.append(f"  {size / 1024:6.1f} KB  {name:34s} weight {span}")

    print("\n".join(written))
    print(f"\n{len(written)} files, {total / 1024:.0f} KB total -> {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
