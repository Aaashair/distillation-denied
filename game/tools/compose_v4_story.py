#!/usr/bin/env python3
"""v4 full-screen story CG from existing art (no generation). 1280×720 letterbox plates."""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance

_asset_root = os.environ.get("DD_ASSET_ROOT", "").strip()
ROOT = Path(_asset_root).expanduser() if _asset_root else None
if ROOT is None or not ROOT.is_dir():
    raise SystemExit("Set DD_ASSET_ROOT to the art checkout that contains assets/.")
HERE = Path(__file__).resolve().parents[1]
OUT = HERE / "assets" / "v4"
W, H = 1280, 720
SETTING = "548 Market Street"


def load(path: Path) -> Image.Image:
    im = Image.open(path)
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    return im


def gradient(bg: tuple, top: tuple) -> Image.Image:
    base = Image.new("RGBA", (W, H), bg)
    draw = ImageDraw.Draw(base)
    for y in range(H):
        t = y / max(1, H - 1)
        r = int(bg[0] * (1 - t) + top[0] * t)
        g = int(bg[1] * (1 - t) + top[1] * t)
        b = int(bg[2] * (1 - t) + top[2] * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255))
    return base


def fit_contain(im: Image.Image, max_w: int, max_h: int) -> Image.Image:
    sw, sh = im.size
    scale = min(max_w / sw, max_h / sh)
    nw, nh = max(1, int(sw * scale)), max(1, int(sh * scale))
    return im.resize((nw, nh), Image.Resampling.LANCZOS)


def paste_center(base: Image.Image, sprite: Image.Image, y_bias: float = 0.5) -> None:
    sprite = fit_contain(sprite, int(W * 0.92), int(H * 0.88))
    x = (W - sprite.width) // 2
    y = int((H - sprite.height) * y_bias)
    base.alpha_composite(sprite, (x, y))


def vignette(im: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rectangle((0, 0, W, 52), fill=(0, 0, 0, 100))
    draw.rectangle((0, H - 60, W, H), fill=(0, 0, 0, 120))
    return Image.alpha_composite(im, overlay)


def title_badge(base: Image.Image, text: str) -> None:
    draw = ImageDraw.Draw(base)
    tw = len(text) * 11 + 28
    x0, y0 = W // 2 - tw // 2, 20
    draw.rectangle((x0, y0, x0 + tw, y0 + 30), fill=(12, 8, 28, 210), outline=(216, 177, 90, 220))
    draw.text((x0 + 14, y0 + 7), text, fill=(244, 241, 234, 255))


def darkroom_compose(dragon: Image.Image, sam: Image.Image | None) -> Image.Image:
    base = gradient((6, 8, 14), (18, 22, 32))
    draw = ImageDraw.Draw(base)
  # monitor wall
    for row in range(2):
        for col in range(3):
            mx = 140 + col * 340
            my = 120 + row * 260
            draw.rectangle((mx, my, mx + 300, my + 200), fill=(10, 12, 18, 255), outline=(60, 70, 90, 255))
            draw.rectangle((mx + 8, my + 8, mx + 292, my + 192), fill=(14, 16, 22, 255))
    bust = fit_contain(dragon, 220, 320)
    base.alpha_composite(bust, (170, 150))
    bust2 = fit_contain(dragon, 180, 260)
    base.alpha_composite(bust2, (520, 165))
    if sam:
        ss = fit_contain(sam, 200, 280)
        base.alpha_composite(ss, (850, 155))
    title_badge(base, SETTING)
    return vignette(base)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    audit: list[str] = []

    fable_design = load(HERE / "assets/web/img/char/fable/fable_design.webp")
    fable_takes = load(HERE / "assets/web/img/story/endB_2_fable_takes_opus.webp")
    astra_portrait = load(ROOT / "assets/v2/img/portrait/astra_portrait.png")
    sam_hi = HERE / "assets/v2/web/img/portrait/sam_cutscene.webp"
    if not sam_hi.exists():
        sam_hi = HERE / "assets/web/img/char/patron/patron_silhouette.webp"
    sam = load(sam_hi)
    sonnet = load(HERE / "assets/web/img/char/sonnet/sonnet_design.webp")
    opus = load(HERE / "assets/web/img/char/opus/opus_design.webp")
    stamp = HERE / "assets/web/img/ui/stamp_banned.webp"
    stamp_im = load(stamp) if stamp.exists() else None

    dragon = ImageEnhance.Contrast(astra_portrait).enhance(1.08)

    # B — full Fable establishing
    bg_f = gradient((18, 6, 38), (52, 22, 88))
    bg_f = vignette(bg_f)
    paste_center(bg_f, fable_design, y_bias=0.42)
    title_badge(bg_f, "FABLE")
    bg_f.save(OUT / "fable_establishing.png", optimize=True)
    audit.append("fable_establishing\tfable_design.webp")

    bg_b2 = gradient((8, 4, 18), (32, 12, 42))
    paste_center(bg_b2, fable_takes, y_bias=0.46)
    bg_b2.save(OUT / "fable_takes_opus.png", optimize=True)
    audit.append("fable_takes_opus\tendB_2")

    bg_a = gradient((12, 18, 28), (64, 92, 110))
    paste_center(bg_a, dragon, y_bias=0.38)
    bg_a.save(OUT / "astra_establishing.png", optimize=True)
    audit.append("astra_establishing\tastra_portrait")

    bg_r = gradient((20, 28, 36), (120, 150, 160))
    resc = fit_contain(dragon, int(W * 0.55), int(H * 0.72))
    bg_r.alpha_composite(resc, ((W - resc.width) // 2, int(H * 0.12)))
    bg_r.save(OUT / "astra_rescue_cg.png", optimize=True)

    bg_c = gradient((16, 20, 28), (48, 58, 72))
    carry = fit_contain(dragon, int(W * 0.48), int(H * 0.65))
    bg_c.alpha_composite(carry, ((W - carry.width) // 2 + 80, int(H * 0.08)))
    bg_c.save(OUT / "astra_carry_cg.png", optimize=True)

    dark = darkroom_compose(dragon, sam)
    dark.save(OUT / "darkroom_cg.png", optimize=True)
    audit.append("darkroom_cg\tportrait+sam_cutscene neutral cinematic")

    bg_s = gradient((10, 10, 14), (28, 26, 34))
    paste_center(bg_s, sam, y_bias=0.46)
    title_badge(bg_s, SETTING)
    bg_s.save(OUT / "sam_cg.png", optimize=True)
    audit.append(f"sam_cg\t{sam_hi.name}")

    for phase, art, label in ((2, sonnet, "SONNET"), (3, opus, "OPUS")):
        bg_p = gradient((14, 12, 22), (36, 32, 52))
        paste_center(bg_p, art, y_bias=0.44)
        title_badge(bg_p, f"{SETTING} · {label}")
        bg_p.save(OUT / f"phase{phase}_cg.png", optimize=True)
        audit.append(f"phase{phase}_cg\t{label}")

    bg_ban = gradient((22, 6, 10), (48, 14, 18))
    # Language-neutral lock; selected-language ban title is live DOM text.
    lock = ImageDraw.Draw(bg_ban)
    lock.arc((W//2-65, 130, W//2+65, 280), 180, 360, fill=(235,65,70), width=18)
    lock.rounded_rectangle((W//2-95, 205, W//2+95, 350), radius=15, fill=(135,28,40), outline=(235,65,70), width=7)
    lock.ellipse((W//2-12, 250, W//2+12, 274), fill=(18,6,12))
    lock.rectangle((W//2-5, 268, W//2+5, 301), fill=(18,6,12))
    title_badge(bg_ban, SETTING)
    bg_ban.save(OUT / "ban_cg.png", optimize=True)
    audit.append("ban_cg\toriginal language-neutral lock; selected-language DOM title")

    (OUT / "AUDIT.txt").write_text("\n".join(audit) + "\n", encoding="utf-8")
    print("\n".join(audit))


if __name__ == "__main__":
    main()