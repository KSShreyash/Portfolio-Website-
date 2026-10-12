#!/usr/bin/env python
"""
Build the eight section backdrops.

Five of them come from full-resolution standalone artwork in
design-references/sources/ and are used at their native 1672x941 — no upscale,
nothing invented.

The other three — the letter, the map and the newspaper — exist only on the
design board, which is a contact sheet rather than a usable background: a
4-row x 2-column grid of panels, each wrapped in a thin gold rule and captioned
beneath, with a structure sidebar on the left and thumbnails on the right. For
those three this script lifts exactly one artwork out of its cell.

Every number below was measured from the source by luminance profiling, not
estimated. Run `python scripts/extract_assets.py` from the project root.

Outputs:
  public/images/portfolio/*.webp   eight masters
  src/lib/blur.ts                  base64 LQIP placeholders for next/image
"""

from __future__ import annotations

import base64
import io
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design-references" / "harry-potter-portfolio-board.png"
SOURCES_DIR = ROOT / "design-references" / "sources"
OUT_DIR = ROOT / "public" / "images" / "portfolio"
BLUR_TS = ROOT / "src" / "lib" / "blur.ts"

# The board this geometry was measured against. Anything else is a different
# image and these coordinates would silently produce garbage.
SOURCE_SIZE = (1536, 1024)

# Panel grid, inset 2px inside the gold rule so no border pixel survives.
COL_A = (212, 772)   # left column  of the contact sheet
COL_B = (789, 1326)  # right column
ROW_1 = (3, 236)
ROW_2 = (279, 499)
ROW_3 = (542, 744)
ROW_4 = (785, 983)


@dataclass(frozen=True)
class Asset:
    name: str
    col: tuple[int, int]
    row: tuple[int, int]
    width: int
    # Optional second crop, in panel-local coordinates, applied after the panel
    # is lifted off the board. Used only to remove franchise marks.
    sub: tuple[int, int, int, int] | None = None
    note: str = ""


@dataclass(frozen=True)
class Standalone:
    """Full-resolution artwork that needs no extraction at all."""

    name: str
    filename: str
    # Some art was exported with a checkerboard painted in instead of real
    # transparency. These get keyed back to an alpha channel.
    key_matte: bool = False
    # Painted with CSS `background-image`, so next/image never picks a variant.
    # Variants are still written; globals.css swaps them with a media query.
    css_only: bool = False


# These arrive at 1672x941 (16:9) and are used as-is. At roughly three times
# the linear resolution of the board panels they replaced, they are a downscale
# at every viewport up to 1672px wide and a mild upscale beyond it — so no
# sharpening is applied, and none is needed.
STANDALONE: list[Standalone] = [
    Standalone("hogwarts-hero", "Moonlit Castle Above the Misty Lake.png"),
    Standalone("enchanted-lake-footer", "Lanternlit Ship Beneath the Starry Fjord.png"),
    Standalone("spellbook-projects", "Candlelit Ancient Grimoire Study.png"),
    Standalone("house-banners-skills", "Gothic Hall of Four Heraldic Banners.png"),
    Standalone("owl-post-contact", "Moonlit Owl Over the Enchanted Valley.png"),
    # Hidden behind the castle in the hero, and uncovered by the Revelio spell.
    Standalone("wizard-scroll", "Enchanted Wizard’s Code Scroll.png"),
    # Loading screen.
    Standalone("splash-parchment", "Ancient Celestial Parchment Map.png", css_only=True),
    Standalone(
        "splash-spells",
        "Magical Coding Calligraphy Frame.png",
        key_matte=True,
        css_only=True,
    ),
]


def key_checkerboard(img: Image.Image) -> Image.Image:
    """
    Turn a painted-on checkerboard back into an alpha channel.

    The calligraphy is near-black on a light grey/white check: 93% of the
    pixels sit above 192 and 1% below 16, so darkness is a clean key. The
    colour is then un-matted against white, otherwise every antialiased edge
    keeps a pale fringe and the keywords look outlined when composited onto
    a dark page.
    """
    import numpy as np

    rgb = np.asarray(img.convert("RGB")).astype(np.float32)
    lum = rgb.mean(axis=2)
    # 185 sits just under the darkest checker pixel (measured: 190).
    alpha = np.clip((185.0 - lum) / 140.0, 0.0, 1.0)
    safe = np.maximum(alpha, 1e-3)[..., None]
    ink = np.clip((rgb - (1.0 - alpha[..., None]) * 255.0) / safe, 0.0, 255.0)
    out = np.dstack([ink, alpha * 255.0]).astype(np.uint8)
    return Image.fromarray(out, mode="RGBA")

# Only these three still come off the contact sheet. No standalone version of
# the letter, the map or the newspaper was supplied.
ASSETS: list[Asset] = [
    Asset("acceptance-letter", COL_A, ROW_2, 1400),
    Asset(
        "marauders-map-experience",
        COL_B,
        ROW_3,
        1600,
        sub=(0, 24, 448, 203),
        note="drops the Hogwarts crest in the panel's top-right corner; the "
        "timeline route is drawn as original SVG, so the artwork's own "
        "dotted path is not needed",
    ),
    Asset(
        "daily-prophet-achievements",
        COL_A,
        ROW_4,
        1500,
        sub=(0, 46, 561, 199),
        note="drops the 'The Daily Prophet' masthead baked into the top-left "
        "of the artwork; the section sets its own masthead in HTML",
    ),
]

# Upscaling a 561px painting to 2000px is a 3.6x stretch. Lanczos plus a light
# unsharp is the honest ceiling here — no detail is invented. Softness is
# handled by art direction instead: these sit under gradient overlays with all
# crisp elements (text, rules, particles, SVG) composited on top in the browser.
UNSHARP = ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=3)
WEBP_OPTS = dict(format="WEBP", quality=84, method=6)

# ---------------------------------------------------------------------------
# Responsive variants
# ---------------------------------------------------------------------------
# The site is deployed as a static export, where Next's image optimiser is not
# available: it needs sharp, a native binary, which does not run on Workers or
# on any plain static host. Without it every <Image> would serve its full-size
# master — about 2.5 MB on the home page, including half a megabyte of crest
# for a mark drawn at 40px.
#
# Every image here is either a full-bleed backdrop or a fixed-size mark, so the
# widths that will ever be needed are known at build time. These are generated
# now and picked at runtime by src/lib/image-loader.ts.
WIDTHS_DIR = ROOT / "src" / "lib"
# Mirrors images.deviceSizes / images.imageSizes in next.config.ts.
BACKDROP_WIDTHS = [480, 768, 900, 1200, 1440]
MARK_WIDTHS = [48, 96, 192, 256, 440, 640]
VARIANTS: dict[str, list[int]] = {}


def emit_variants(path: Path, img: Image.Image, widths: list[int]) -> None:
    """Write `<name>-<width>.webp` next to the master and record the set."""
    native = img.width
    chosen = sorted({w for w in widths if w < native} | {native})
    for w in chosen:
        if w == native:
            out = img
        else:
            h = max(1, round(img.height * w / native))
            out = img.resize((w, h), Image.LANCZOS)
        out.save(
            path.with_name(f"{path.stem}-{w}{path.suffix}"),
            format="WEBP",
            quality=84 if img.mode == "RGB" else 92,
            method=6,
        )
    key = "/" + str(path.relative_to(ROOT / "public")).replace("\\", "/")
    VARIANTS[key] = chosen


def write_variant_manifest() -> None:
    lines = [
        "// GENERATED by scripts/extract_assets.py — do not edit by hand.",
        "//",
        "// Widths available on disk for each image, used by image-loader.ts to",
        "// pick a file instead of calling an optimiser that a static host has",
        "// no way to run.",
        "",
        "export const IMAGE_WIDTHS: Record<string, number[]> = {",
    ]
    for k in sorted(VARIANTS):
        lines.append(f'  "{k}": [{", ".join(str(w) for w in VARIANTS[k])}],')
    lines += ["};", ""]
    (WIDTHS_DIR / "image-widths.ts").write_text("\n".join(lines), encoding="utf8")
    print(f"\nwrote src/lib/image-widths.ts ({len(VARIANTS)} images)")


def camel(name: str) -> str:
    head, *tail = name.split("-")
    return head + "".join(p.title() for p in tail)


def lqip(img: Image.Image) -> str:
    """A 16px-wide blurred placeholder, inlined as a data URL."""
    h = max(1, round(16 * img.height / img.width))
    small = img.resize((16, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    buf = io.BytesIO()
    small.save(buf, format="WEBP", quality=40, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


def main() -> int:
    if not SOURCE.exists():
        print(f"ERROR: source board not found at {SOURCE}", file=sys.stderr)
        return 1

    board = Image.open(SOURCE).convert("RGB")
    if board.size != SOURCE_SIZE:
        print(
            f"ERROR: expected a {SOURCE_SIZE[0]}x{SOURCE_SIZE[1]} board, got "
            f"{board.size[0]}x{board.size[1]}. The crop geometry in this file "
            "was measured against the original and would not transfer.",
            file=sys.stderr,
        )
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    BLUR_TS.parent.mkdir(parents=True, exist_ok=True)
    blurs: dict[str, str] = {}

    # --- full-resolution standalone artwork ---------------------------------
    for st in STANDALONE:
        src = SOURCES_DIR / st.filename
        if not src.exists():
            print(f"ERROR: missing source {src}", file=sys.stderr)
            return 1
        img = Image.open(src)
        if st.key_matte:
            img = key_checkerboard(img)
        else:
            img = img.convert("RGB")

        dest = OUT_DIR / f"{st.name}.webp"
        img.save(dest, format="WEBP", quality=90 if st.key_matte else 84, method=6)
        # The splash pair keeps full resolution on large screens; the media
        # query in globals.css picks the smaller file on phones.
        emit_variants(dest, img, [1200] if st.css_only else BACKDROP_WIDTHS)
        blurs[camel(st.name)] = lqip(img)
        kb = (OUT_DIR / f"{st.name}.webp").stat().st_size / 1024
        print(
            f"{st.name:30s} native {img.size[0]}x{img.size[1]} "
            f"(1.00x, {kb:.0f} KB)  <- {st.filename}"
        )

    # --- panels lifted off the contact sheet --------------------------------

    for a in ASSETS:
        x0, x1 = a.col
        y0, y1 = a.row
        panel = board.crop((x0, y0, x1 + 1, y1 + 1))
        panel_size = panel.size

        if a.sub:
            panel = panel.crop(a.sub)

        native_w, native_h = panel.size
        height = round(a.width * native_h / native_w)
        master = panel.resize((a.width, height), Image.LANCZOS).filter(UNSHARP)
        dest = OUT_DIR / f"{a.name}.webp"
        master.save(dest, **WEBP_OPTS)
        emit_variants(dest, master, BACKDROP_WIDTHS)
        blurs[camel(a.name)] = lqip(panel)

        kb = (OUT_DIR / f"{a.name}.webp").stat().st_size / 1024
        sub = f" sub{a.sub}" if a.sub else ""
        print(
            f"{a.name:30s} panel {panel_size[0]}x{panel_size[1]}{sub} "
            f"-> native {native_w}x{native_h} -> master {a.width}x{height} "
            f"({a.width / native_w:.2f}x, {kb:.0f} KB)"
        )
        if a.note:
            print(f"{'':30s}   note: {a.note}")

    lines = [
        "// GENERATED by scripts/extract_assets.py — do not edit by hand.",
        "// Base64 LQIP placeholders for next/image `blurDataURL`.",
        "",
        "export const BLUR = {",
    ]
    lines += [f'  {k}: "{v}",' for k, v in blurs.items()]
    lines += ["} as const;", "", "export type AssetKey = keyof typeof BLUR;", ""]
    BLUR_TS.write_text("\n".join(lines), encoding="utf8")
    print(f"\nwrote {BLUR_TS.relative_to(ROOT)} ({len(blurs)} placeholders)")
    build_crest()
    build_og()
    write_variant_manifest()
    return 0



# ---------------------------------------------------------------------------
# Social card
# ---------------------------------------------------------------------------
# Built here rather than with next/og so it can use the real hero artwork and
# a serif that actually exists on this machine. 1200x630 is the size every
# platform crops from.

BRAND_DIR = ROOT / "public" / "images" / "brand"
APP_DIR = ROOT / "src" / "app"
CREST_SRC = SOURCES_DIR / "Ornate KS Heraldic Crest with Mythic Guardians.png"

OG_PATH = ROOT / "public" / "og.jpg"


def build_crest() -> None:
    """
    Key the crest off its painted-on checkerboard and cut the brand assets.

    A brightness key will not do here — the gold is as light as the check.
    Saturation separates them cleanly instead: the checkerboard's chroma noise
    tops out around 16 while the gold starts at 27, so the threshold sits in
    that gap. Measured, not guessed.

    Two cuts come out of it: the full crest for large display, and a square
    shield-core mark with the outer flourishes and the name banner removed,
    because at 32px the full crest shrinks to an unreadable smudge.
    """
    import numpy as np
    from PIL import ImageFilter

    src = Image.open(CREST_SRC).convert("RGB")
    a = np.asarray(src).astype(np.float32)
    sat = a.max(axis=2) - a.min(axis=2)
    lum = a.mean(axis=2)

    neutral = np.clip((22.0 - sat) / 4.0, 0, 1)
    light = np.clip((lum - 190.0) / 15.0, 0, 1)
    alpha = np.clip(1.0 - neutral * light, 0, 1)

    mask = Image.fromarray((alpha * 255).astype(np.uint8), "L").filter(
        ImageFilter.GaussianBlur(0.6)
    )
    rgba = Image.merge("RGBA", (*src.split(), mask))
    bbox = Image.fromarray((np.asarray(mask) > 90).astype(np.uint8) * 255).getbbox()
    full = rgba.crop(bbox)

    BRAND_DIR.mkdir(parents=True, exist_ok=True)
    full_dest = BRAND_DIR / "crest.webp"
    full.save(full_dest, format="WEBP", quality=92, method=6)
    emit_variants(full_dest, full, MARK_WIDTHS)

    w, h = full.size
    core = full.crop((int(w * 0.14), int(h * 0.05), int(w * 0.88), int(h * 0.80)))
    side = max(core.size)
    mark = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    mark.paste(core, ((side - core.width) // 2, (side - core.height) // 2), core)
    mark_dest = BRAND_DIR / "crest-mark.webp"
    mark.save(mark_dest, format="WEBP", quality=92, method=6)
    emit_variants(mark_dest, mark, MARK_WIDTHS)

    # Next picks these up by filename; no <link> tags needed.
    # 192 is ample for a tab icon at any DPI; a 512 version of artwork this
    # busy was over half a megabyte for pixels nobody sees.
    for name, size in (("icon.png", 192), ("apple-icon.png", 180)):
        out = mark.resize((size, size), Image.LANCZOS)
        out.save(APP_DIR / name, format="PNG", optimize=True)

    print(f"{'crest':30s} full {full.size[0]}x{full.size[1]}  mark {side}x{side}  + icon.png, apple-icon.png")
OG_SIZE = (1200, 630)


def build_og() -> None:
    from PIL import ImageDraw, ImageFont

    hero = Image.open(OUT_DIR / "hogwarts-hero.webp").convert("RGB")
    scale = max(OG_SIZE[0] / hero.width, OG_SIZE[1] / hero.height)
    resized = hero.resize(
        (round(hero.width * scale), round(hero.height * scale)), Image.LANCZOS
    )
    left = int((resized.width - OG_SIZE[0]) * 0.62)
    top = (resized.height - OG_SIZE[1]) // 2
    card = resized.crop((left, top, left + OG_SIZE[0], top + OG_SIZE[1]))

    # Same left-to-right wash the hero uses, so the card and the page match.
    wash = Image.new("RGBA", OG_SIZE, (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    for x in range(OG_SIZE[0]):
        t = x / OG_SIZE[0]
        alpha = int(252 * max(0.0, 1 - (t / 0.74) ** 1.5))
        wd.line([(x, 0), (x, OG_SIZE[1])], fill=(8, 11, 17, alpha))
    card = Image.alpha_composite(card.convert("RGBA"), wash).convert("RGB")

    d = ImageDraw.Draw(card)

    def font(name: str, size: int):
        for candidate in (name, "georgia.ttf", "times.ttf", "arial.ttf"):
            try:
                return ImageFont.truetype(candidate, size)
            except OSError:
                continue
        return ImageFont.load_default()

    gold = (198, 154, 85)
    light = (244, 235, 221)
    muted = (183, 188, 197)

    d.text((72, 212), "SOFTWARE DEVELOPER  ·  AI ENTHUSIAST", font=font("consola.ttf", 20), fill=gold)
    d.text((70, 258), "Kumar Shreyash", font=font("georgiab.ttf", 82), fill=light)
    d.line([(74, 376), (250, 376)], fill=gold, width=2)
    d.text((72, 406), "Software Developer & AI Systems Builder", font=font("georgia.ttf", 34), fill=(229, 197, 139))
    d.text((72, 462), "Building intelligent things.", font=font("georgia.ttf", 26), fill=muted)

    # JPEG, not PNG: this is a photograph with gradients, and the PNG was
    # half a megabyte for no visible gain.
    card.save(OG_PATH, format="JPEG", quality=88, optimize=True, progressive=True)
    print(f"og card                        -> {OG_PATH.relative_to(ROOT)} {OG_SIZE[0]}x{OG_SIZE[1]}")

if __name__ == "__main__":
    raise SystemExit(main())
