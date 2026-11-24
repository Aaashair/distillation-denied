#!/usr/bin/env python3
"""v5 Ending A CG — one high-res dragon figure per Astra plate; full-bleed Sam; Dario A7."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageStat

HERE = Path(__file__).resolve().parents[1]
OUT = HERE / "assets" / "v5"
W, H = 1280, 720
SETTING = "548 Market Street"

REF_DRAGON = HERE / "assets/v5/source/astra_reference.png"
REF_SAM = HERE / "assets/v5/source/sam_reference.png"


def load(path: Path) -> Image.Image:
    im = Image.open(path)
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    return im


def clean_portrait(im: Image.Image) -> Image.Image:
    out = im.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 28:
                px[x, y] = (r, g, b, 0)
            elif a < 90:
                mx, mn = max(r, g, b), min(r, g, b)
                if mx - mn < 18 and mx > 60:
                    px[x, y] = (r, g, b, 0)
    return out


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


def vignette(im: Image.Image, top: int = 85, bot: int = 105) -> Image.Image:
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rectangle((0, 0, W, 54), fill=(0, 0, 0, top))
    draw.rectangle((0, H - 70, W, H), fill=(0, 0, 0, bot))
    return Image.alpha_composite(im, overlay)


def title_badge(base: Image.Image, text: str) -> None:
    draw = ImageDraw.Draw(base)
    tw = len(text) * 11 + 28
    x0, y0 = W // 2 - tw // 2, 20
    draw.rectangle((x0, y0, x0 + tw, y0 + 30), fill=(12, 8, 28, 210), outline=(216, 177, 90, 220))
    draw.text((x0 + 14, y0 + 7), text, fill=(244, 241, 234, 255))


def crop_alpha(im: Image.Image, thresh: int = 80) -> Image.Image:
    a = im.split()[-1]
    bbox = a.point(lambda p: 255 if p >= thresh else 0).getbbox()
    if not bbox:
        return im
    return im.crop(bbox)


def dragon_source() -> Image.Image:
    if not REF_DRAGON.exists():
        raise FileNotFoundError(f"missing REF_DRAGON {REF_DRAGON}")
    return ImageEnhance.Contrast(clean_portrait(load(REF_DRAGON))).enhance(1.04)


def sam_source() -> Image.Image:
    if not REF_SAM.exists():
        raise FileNotFoundError(f"missing REF_SAM {REF_SAM}")
    return load(REF_SAM)


def dario_source() -> Image.Image:
    p = HERE / "assets/v2/web/img/portrait/dario_cutscene.webp"
    if not p.exists():
        p = HERE / "assets/v2/web/img/story/dario_cutscene_px.png"
    return clean_portrait(load(p))


def paste_one_figure(
    base: Image.Image,
    figure: Image.Image,
    *,
    max_w: float = 0.56,
    max_h: float = 0.9,
    y_top: float = 0.06,
    x_offset: int = 0,
) -> None:
    """Exactly one resized figure composite."""
    fig = fit_contain(figure, int(W * max_w), int(H * max_h))
    x = (W - fig.width) // 2 + x_offset
    y = int(H * y_top)
    base.alpha_composite(fig, (x, y))


def env_portal_hall() -> Image.Image:
    base = gradient((10, 14, 22), (40, 58, 72))
    draw = ImageDraw.Draw(base)
    # perspective floor
    yf = int(H * 0.68)
    draw.polygon([(0, yf), (W, yf), (W, H), (0, H)], fill=(36, 42, 52, 255))
    for i in range(8):
        t = i / 7
        x0 = int(W * 0.5 + (W * 0.5) * (t - 0.5) * 0.15)
        draw.line([(x0, yf), (int(W * (0.2 + t * 0.6)), H)], fill=(52, 60, 72, 120), width=2)
    for px in (220, 420, 640, 860, 1060):
        draw.rectangle((px - 18, 80, px + 18, yf), fill=(28, 32, 42, 200))
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(overlay)
    cx = W // 2
    g.ellipse([cx - 90, 40, cx + 90, 220], fill=(159, 216, 210, 55))
    g.rectangle([cx - 6, 30, cx + 6, int(H * 0.72)], fill=(255, 252, 230, 90))
    overlay = overlay.filter(ImageFilter.GaussianBlur(2))
    base.alpha_composite(overlay)
    return base


def env_sky_establish() -> Image.Image:
    base = gradient((12, 20, 30), (88, 132, 148))
    draw = ImageDraw.Draw(base)
    draw.ellipse([W // 2 - 200, 40, W // 2 + 200, 280], fill=(210, 255, 240, 35))
    return base


def env_marble_hall() -> Image.Image:
    base = gradient((16, 18, 24), (44, 52, 62))
    draw = ImageDraw.Draw(base)
    y0 = int(H * 0.6)
    draw.rectangle((0, y0, W, H), fill=(48, 54, 64, 255))
    for x in range(0, W, 80):
        draw.line([(x, y0), (x + 40, H)], fill=(62, 70, 82, 80), width=2)
    draw.rectangle((0, 40, W, 88), fill=(22, 26, 34, 180))
    return base


def env_extraction() -> Image.Image:
    base = gradient((14, 16, 22), (32, 36, 48))
    draw = ImageDraw.Draw(base)
    cx = W // 2 + 40
    beam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(beam)
    bd.polygon([(cx, 0), (cx + 120, H), (cx - 40, H)], fill=(255, 252, 230, 35))
    bd.polygon([(cx + 20, 0), (cx + 70, H), (cx + 5, H)], fill=(207, 232, 226, 55))
    beam = beam.filter(ImageFilter.GaussianBlur(4))
    base.alpha_composite(beam)
    draw.ellipse([cx - 160, int(H * 0.72), cx + 80, H - 20], fill=(159, 216, 210, 50))
    return base


def env_office_night() -> Image.Image:
    base = gradient((8, 10, 16), (22, 26, 36))
    draw = ImageDraw.Draw(base)
    # soft panoramic window wash (no bordered monitor UI)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rectangle((40, 36, W - 40, int(H * 0.5)), fill=(32, 44, 68, 90))
    gd.ellipse((W // 2 - 420, 20, W // 2 + 420, 280), fill=(48, 72, 96, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(8))
    base.alpha_composite(glow)
    for cx, cy, r, col in (
        (320, 160, 4, (220, 200, 140, 120)),
        (520, 130, 3, (180, 210, 255, 100)),
        (900, 150, 5, (220, 200, 140, 140)),
        (1080, 200, 3, (180, 210, 255, 90)),
    ):
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col)
    dy = int(H * 0.58)
    draw.rectangle((0, dy, W, H), fill=(18, 20, 26, 255))
    lamp = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lamp)
    ld.ellipse((90, dy - 80, 240, dy + 20), fill=(255, 180, 90, 55))
    lamp = lamp.filter(ImageFilter.GaussianBlur(6))
    base.alpha_composite(lamp)
    draw.polygon([(60, dy + 6), (360, dy + 6), (320, H - 28), (20, H - 28)], fill=(28, 30, 38, 255))
    return base


def env_dario_office() -> Image.Image:
    base = gradient((8, 6, 12), (26, 20, 18))
    draw = ImageDraw.Draw(base)
    wash = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    wd.rectangle((60, 40, W - 60, int(H * 0.48)), fill=(40, 30, 24, 60))
    wash = wash.filter(ImageFilter.GaussianBlur(6))
    base.alpha_composite(wash)
    draw.rectangle((0, int(H * 0.55), W, H), fill=(16, 14, 18, 255))
    draw.ellipse([W // 2 - 120, H - 110, W // 2 + 120, H - 40], fill=(40, 28, 22, 200))
    draw.ellipse([W // 2 - 60, H - 85, W // 2 + 60, H - 55], fill=(235, 120, 60, 120))
    cone = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(cone)
    cd.polygon([(W // 2, 80), (W // 2 + 200, H - 100), (W // 2 - 200, H - 100)], fill=(255, 160, 80, 40))
    cone = cone.filter(ImageFilter.GaussianBlur(3))
    base.alpha_composite(cone)
    return base


def sam_full_bleed(sam: Image.Image) -> Image.Image:
    base = gradient((4, 4, 8), (14, 12, 18))
    fig = fit_contain(sam, int(W * 0.96), int(H * 0.94))
    x = (W - fig.width) // 2
    y = (H - fig.height) // 2
    base.alpha_composite(fig, (x, y))
    return vignette(base, 65, 90)


def qa_no_gold_frame(im: Image.Image, path: str) -> None:
    """Reject centered UI phone frame (high gold outline density in mid band)."""
    rgb = im.convert("RGB")
    mid = rgb.crop((W // 2 - 300, 80, W // 2 + 300, H - 80))
    gold = 0
    px = mid.load()
    for y in range(mid.height):
        for x in range(mid.width):
            r, g, b = px[x, y]
            if r > 170 and g > 130 and b < 120 and r - b > 60:
                gold += 1
    if gold > 800:
        raise RuntimeError(f"{path}: gold frame artifact detected ({gold} px)")


def qa_no_monitor_box(im: Image.Image, path: str) -> None:
    """Reject large hollow monitor rectangles in upper field."""
    gray = im.convert("L")
    band = gray.crop((140, 90, W - 140, 540))
    edge = band.filter(ImageFilter.FIND_EDGES)
    if ImageStat.Stat(edge).mean[0] > 28:
        # allow soft scenes; only fail on strong grid
        px = edge.load()
        strong = sum(1 for y in range(edge.height) for x in range(edge.width) if px[x, y] > 90)
        if strong > 12000:
            raise RuntimeError(f"{path}: monitor-box edges suspected ({strong})")


def save_plate(im: Image.Image, name: str, checks: tuple = ()) -> None:
    path = OUT / name
    for fn in checks:
        fn(im, name)
    im.save(path, optimize=True)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    audit: list[dict] = []
    dragon = crop_alpha(dragon_source(), 80)
    sam = sam_source()
    dario = dario_source()

    # A1 rescue — portal hall, one full high-res dragon
    rescue = env_portal_hall()
    paste_one_figure(rescue, dragon, max_w=0.52, y_top=0.02)
    rescue = vignette(rescue)
    title_badge(rescue, SETTING)
    save_plate(rescue, "astra_rescue_cg.png", (qa_no_monitor_box,))
    audit.append({"file": "astra_rescue_cg.png", "alias": ["end.A.rescue", "end.A1"], "figures": 1, "source": str(REF_DRAGON.name)})

    # A2 establish — sky, one full dragon
    estab = env_sky_establish()
    paste_one_figure(estab, dragon, max_w=0.54, y_top=0.04)
    estab = vignette(estab)
    estab.save(OUT / "astra_establishing.png", optimize=True)
    audit.append({"file": "astra_establishing.png", "alias": ["end.A.astra", "end.A2"], "figures": 1, "source": "REF_DRAGON full"})

    # A3 arrive — marble hall, one bust-only crop (single layer)
    tw, th = dragon.size
    bust_only = dragon.crop((int(tw * 0.1), int(th * 0.02), int(tw * 0.9), int(th * 0.52)))
    arrive = env_marble_hall()
    paste_one_figure(arrive, bust_only, max_w=0.62, y_top=0.06)
    arrive = vignette(arrive)
    arrive.save(OUT / "astra_arrive.png", optimize=True)
    audit.append({"file": "astra_arrive.png", "alias": ["end.A3"], "figures": 1, "source": "REF_DRAGON bust crop"})

    # A4 carry — extraction light, one full dragon (no sprite atlas)
    carry = env_extraction()
    paste_one_figure(carry, dragon, max_w=0.5, y_top=0.03, x_offset=-20)
    carry = vignette(carry)
    save_plate(carry, "astra_carry_cg.png", (qa_no_monitor_box,))
    audit.append({"file": "astra_carry_cg.png", "alias": ["end.A4"], "figures": 1, "source": "REF_DRAGON full"})

    # A5 — standing dragon in office/window (not monitor UI)
    office = env_office_night()
    paste_one_figure(office, dragon, max_w=0.44, y_top=0.02, x_offset=-180)
    office = vignette(office)
    title_badge(office, SETTING)
    save_plate(office, "astra_office_cg.png", (qa_no_monitor_box,))
    audit.append({"file": "astra_office_cg.png", "alias": ["end.A5"], "figures": 1, "source": "REF_DRAGON full"})

    # All Sam beats — full-bleed REF_SAM (no gold phone frame)
    sam_plate = sam_full_bleed(sam)
    title_badge(sam_plate, SETTING)
    save_plate(sam_plate, "sam_full_cg.png", (qa_no_gold_frame,))
    audit.append({"file": "sam_full_cg.png", "alias": ["end.A6", "end.A.sam", "end.A.samFull", "ill.sam"], "figures": 1, "source": str(REF_SAM.name)})

    # A7 Dario — holo office, one Dario illustration
    dario_bg = env_dario_office()
    paste_one_figure(dario_bg, dario, max_w=0.48, y_top=0.08)
    dario_bg = vignette(dario_bg)
    title_badge(dario_bg, SETTING)
    dario_bg.save(OUT / "dario_endA_cg.png", optimize=True)
    audit.append({"file": "dario_endA_cg.png", "alias": ["end.A.dario"], "figures": 1, "source": "dario_cutscene.webp"})

    # Remove obsolete plates if present
    for stale in ("sam_phone_cg.png", "darkroom_cg.png"):
        p = OUT / stale
        if p.exists():
            p.unlink()

    (OUT / "AUDIT.txt").write_text(
        "v5 Ending A — REF_DRAGON/REF_SAM hi-res only; no sprites, no monitor grids\n"
        + "\n".join(json.dumps(row) for row in audit)
        + "\n",
        encoding="utf-8",
    )
    (OUT / "alias_map.json").write_text(json.dumps(audit, indent=2), encoding="utf-8")
    print(json.dumps(audit, indent=2))


if __name__ == "__main__":
    main()