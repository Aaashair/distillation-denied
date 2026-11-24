#!/usr/bin/env python3
"""Recompose Ending A Astra panels from existing mature white-dragon art.

No model calls. Sources: $DD_ASSET_ROOT/assets/v2 (set DD_ASSET_ROOT to the art checkout).
Outputs: assets/v3 PNG (+ WebP) in this checkout and game/assets/v3.
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

_asset_root = os.environ.get("DD_ASSET_ROOT", "").strip()
ROOT = Path(_asset_root).expanduser() if _asset_root else None
if ROOT is None or not ROOT.is_dir():
    raise SystemExit("Set DD_ASSET_ROOT to the art checkout that contains assets/.")
ASSET = ROOT / "assets" / "v2"
HERE = Path(__file__).resolve().parents[1]
OUTS = [
    HERE / "assets" / "v3",
    ROOT / "game" / "assets" / "v3",
    ROOT / "screens" / "v3" / "w3",
]
W, H = 480, 320


def load(path: Path) -> Image.Image:
    im = Image.open(path)
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    return im


def nearest(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    return im.resize(size, Image.Resampling.NEAREST)


def box_alpha(im: Image.Image, thresh: int = 32) -> tuple[int, int, int, int]:
    a = im.split()[-1]
    bbox = a.point(lambda p: 255 if p >= thresh else 0).getbbox()
    if not bbox:
        return (0, 0, im.width, im.height)
    return bbox


def crop_alpha(im: Image.Image, thresh: int = 32, pad: int = 2) -> Image.Image:
    x0, y0, x1, y1 = box_alpha(im, thresh)
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad)
    y1 = min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def clean_portrait(im: Image.Image) -> Image.Image:
    """Drop near-transparent fringe; keep the dragon. Soft halo stays as glow."""
    out = im.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 28:
                px[x, y] = (r, g, b, 0)
            elif a < 90:
                # kill leftover lavender plate, keep feather edges
                mx = max(r, g, b)
                mn = min(r, g, b)
                if mx - mn < 18 and mx > 60:
                    px[x, y] = (r, g, b, 0)
    return out


def paste_feet(base: Image.Image, sprite: Image.Image, x: int, y: int, scale: float = 1.0) -> None:
    if scale != 1.0:
        nw = max(1, int(round(sprite.width * scale)))
        nh = max(1, int(round(sprite.height * scale)))
        sprite = nearest(sprite, (nw, nh))
    px = int(x - sprite.width / 2)
    py = int(y - sprite.height)
    base.alpha_composite(sprite, (px, py))


def paste_center(base: Image.Image, sprite: Image.Image, x: int, y: int, scale: float = 1.0) -> None:
    if scale != 1.0:
        nw = max(1, int(round(sprite.width * scale)))
        nh = max(1, int(round(sprite.height * scale)))
        sprite = nearest(sprite, (nw, nh))
    px = int(x - sprite.width / 2)
    py = int(y - sprite.height / 2)
    base.alpha_composite(sprite, (px, py))


def rift_light(base: Image.Image, strength: float = 0.35) -> None:
    """Restrained teal/ivory rift down the top-center of the plate."""
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    g = ImageDraw.Draw(overlay)
    cx = W // 2
    g.rectangle([cx - 10, 0, cx + 10, 118], fill=(210, 255, 240, int(70 * strength)))
    g.rectangle([cx - 3, 0, cx + 3, 150], fill=(255, 252, 230, int(110 * strength)))
    g.polygon(
        [(cx - 2, 0), (cx + 18, 46), (cx - 12, 88), (cx + 6, 130), (cx - 4, 0)],
        fill=(159, 216, 210, int(90 * strength)),
    )
    g.rectangle([0, 0, W, 28], fill=(180, 255, 230, int(36 * strength)))
    overlay = overlay.filter(ImageFilter.BoxBlur(1))
    base.alpha_composite(overlay)


def vignette(base: Image.Image, amount: int = 70) -> None:
    shade = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(shade)
    d.rectangle([0, 0, W, 18], fill=(8, 6, 14, amount))
    d.rectangle([0, H - 36, W, H], fill=(8, 6, 14, amount + 20))
    d.rectangle([0, 0, 16, H], fill=(8, 6, 14, amount - 10))
    d.rectangle([W - 16, 0, W, H], fill=(8, 6, 14, amount - 10))
    base.alpha_composite(shade)


def save_all(im: Image.Image, name: str) -> list[str]:
    rgb = im.convert("RGB")
    written = []
    for out in OUTS:
        out.mkdir(parents=True, exist_ok=True)
        png = out / f"{name}.png"
        im.save(png, "PNG", optimize=True)
        written.append(str(png))
        webp = out / f"{name}.webp"
        try:
            rgb.save(webp, "WEBP", quality=88, method=4)
            written.append(str(webp))
        except Exception:
            pass
    return written


def panel_from_room(room: Image.Image) -> Image.Image:
    bg = nearest(room.convert("RGBA"), (W, H))
    dark = ImageEnhance.Brightness(bg).enhance(0.78)
    return dark


def main() -> None:
    portrait = load(ASSET / "img/portrait/astra_portrait.png")
    portrait = clean_portrait(portrait)
    mature = load(ASSET / "web/img/char/astra/astra_mature_idle.png")
    sheet = load(ASSET / "img/char/astra/astra_mature_sheet.png")
    cel0 = sheet.crop((0, 0, 128, 128))
    cel1 = sheet.crop((128, 0, 256, 128))
    room = load(ASSET / "web/img/room/room_p3.png")
    opus_hurt = load(ASSET / "web/img/char/opus/opus_hurt.png")
    opus_idle = load(ASSET / "web/img/char/opus/opus_idle.png")
    glm_hurt = load(ASSET / "web/img/char/glm/glm_hurt.png")
    glm_idle = load(ASSET / "web/img/char/glm/glm_idle.png")
    sam = load(ASSET / "web/img/portrait/sam_pixel.png")
    darkroom_src = load(ASSET / "web/img/story/endA_4_darkroom_px.png")
    sam_cut = load(ASSET / "web/img/story/sam_cutscene_px.png")

    audit = []

    # --- A3 closeup: cleaned mature portrait on pixel room + rift ---
    arrive = panel_from_room(room)
    rift_light(arrive, 0.28)
    # upper-body crop of the illustration
    tight = crop_alpha(portrait, thresh=80, pad=4)
    # keep the face / wings / book — drop the long train
    tw, th = tight.size
    face = tight.crop((0, 0, tw, int(th * 0.62)))
    # fit into the plate, leaving floor for rift
    target_h = 300
    scale = target_h / face.height
    nw = max(1, int(face.width * scale))
    nh = max(1, int(face.height * scale))
    face_r = face.resize((nw, nh), Image.Resampling.LANCZOS)
    paste_center(arrive, face_r, W // 2 + 8, H // 2 - 6, 1.0)
    vignette(arrive, 55)
    save_all(arrive, "astra_arrive")
    audit.append(("end.A3 / A3 closeup", "assets/v3/astra_arrive.png", "portrait closeup on room_p3"))

    # cleaned smaller portrait for pt.astra / ill.astra (still the new dragon)
    close = panel_from_room(room)
    rift_light(close, 0.18)
    bust = tight.crop((int(tw * 0.12), int(th * 0.02), int(tw * 0.88), int(th * 0.48)))
    bh = 280
    bs = bh / bust.height
    bust_r = bust.resize((max(1, int(bust.width * bs)), bh), Image.Resampling.LANCZOS)
    paste_center(close, bust_r, W // 2, H // 2 - 8, 1.0)
    vignette(close, 50)
    save_all(close, "astra_portrait_closeup")
    audit.append(("pt.astra / ill.astra / end.A.astra", "assets/v3/astra_portrait_closeup.png", "new dragon bust"))

    # --- rescue: sprite + Opus + player on room ---
    rescue = panel_from_room(room)
    rift_light(rescue, 0.55)
    # Opus knocked toward the right, player down on the marble, Astra diving in
    paste_feet(rescue, opus_hurt, 368, 210, 0.72)
    fallen = glm_hurt.rotate(72, expand=True, resample=Image.Resampling.NEAREST)
    paste_feet(rescue, fallen, 214, 248, 1.15)
    paste_feet(rescue, cel0, 232, 188, 1.0)
    # small hex-knot spark
    knot = Image.new("RGBA", rescue.size, (0, 0, 0, 0))
    kd = ImageDraw.Draw(knot)
    hx, hy = 250, 168
    for r, col in ((28, (216, 177, 90, 180)), (18, (159, 216, 210, 200)), (8, (255, 255, 255, 220))):
        kd.ellipse([hx - r, hy - r, hx + r, hy + r], outline=col, width=2)
    rescue.alpha_composite(knot)
    vignette(rescue, 40)
    save_all(rescue, "astra_rescue")
    audit.append(("end.A.rescue / v2_story_endA_2", "assets/v3/astra_rescue.png", "mature 128 sprite + Opus + player"))

    # --- carry: ribbon lift, Astra holding the fallen chaser ---
    carry = panel_from_room(room)
    rift_light(carry, 0.42)
    ribbon = Image.new("RGBA", carry.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(ribbon)
    rx = 236
    rd.rectangle([rx - 7, 4, rx + 7, 250], fill=(255, 252, 230, 70))
    rd.rectangle([rx - 3, 4, rx + 3, 250], fill=(207, 232, 226, 140))
    rd.rectangle([rx - 1, 4, rx + 1, 250], fill=(255, 255, 255, 200))
    carry.alpha_composite(ribbon)
    paste_feet(carry, opus_hurt, 390, 168, 0.62)
    paste_feet(carry, cel1, 240, 200, 1.05)
    paste_feet(carry, glm_hurt, 248, 168, 1.0)
    vignette(carry, 45)
    save_all(carry, "astra_carry")
    audit.append(("end.A4 / retrieved", "assets/v3/astra_carry.png", "carry lift with sprite"))

    # --- darkroom: keep Sam chair beat, replace monitor faces with new dragon/Opus/player ---
    dark = darkroom_src.convert("RGBA")
    if dark.size != (W, H):
        dark = nearest(dark, (W, H))
    # measured cyan monitor wells (pixel plate)
    monitors = [
        (74, 18, 186, 142),
        (186, 14, 298, 146),
        (298, 18, 410, 142),
    ]
    fills = [
        bust,
        crop_alpha(opus_idle, 16),
        crop_alpha(glm_idle, 16),
    ]
    for (x0, y0, x1, y1), src in zip(monitors, fills):
        mw, mh = x1 - x0, y1 - y0
        well = Image.new("RGBA", (mw, mh), (6, 10, 22, 255))
        # scale source to cover
        s = max(mw / src.width, mh / src.height)
        sw, sh = max(1, int(src.width * s)), max(1, int(src.height * s))
        fitted = src.resize((sw, sh), Image.Resampling.LANCZOS)
        well.alpha_composite(fitted, ((mw - sw) // 2, (mh - sh) // 2))
        # cyan scan
        scan = Image.new("RGBA", (mw, mh), (0, 0, 0, 0))
        sd = ImageDraw.Draw(scan)
        sd.rectangle([0, mh - 10, mw, mh], fill=(194, 59, 59, 90))
        well.alpha_composite(scan)
        dark.alpha_composite(well, (x0, y0))
    save_all(dark, "darkroom")
    audit.append(("end.A5 darkroom", "assets/v3/darkroom.png", "monitors = new dragon / Opus / player"))

    # keep Sam silhouette as its own shipped frame (already new art); copy into v3 for the contact sheet
    sam_panel = sam_cut.convert("RGBA")
    if sam_panel.size != (W, H):
        sam_panel = nearest(sam_panel, (W, H))
    save_all(sam_panel, "sam_silhouette")
    audit.append(("end.A6 / ill.sam", "assets/v3/sam_silhouette.png", "existing new Sam silhouette (copied)"))

    # contact sheet of every active Astra-containing frame
    frames = [
        ("A3 arrive CN/EN", arrive),
        ("A3 bust", close),
        ("rescue sprite", rescue),
        ("carry sprite", carry),
        ("darkroom", dark),
        ("Sam", sam_panel),
        ("mature 128", nearest(cel0, (128, 128))),
    ]
    cols, rows = 4, 2
    cell_w, cell_h = W, H + 18
    sheet_im = Image.new("RGB", (cols * cell_w, rows * cell_h), (8, 8, 12))
    td = ImageDraw.Draw(sheet_im)
    for i, (label, fr) in enumerate(frames):
        c, r = i % cols, i // cols
        rgb = fr.convert("RGB")
        if rgb.size != (W, H):
            rgb = nearest(rgb, (W, H))
        sheet_im.paste(rgb, (c * cell_w, r * cell_h + 18))
        td.text((c * cell_w + 6, r * cell_h + 4), label, fill=(216, 177, 90))
    for out in OUTS:
        out.mkdir(parents=True, exist_ok=True)
        sheet_im.save(out / "astra_contact_sheet.png", "PNG", optimize=True)

    report = HERE / "assets" / "v3" / "AUDIT.txt"
    lines = [
        "W3 Astra image audit — composed locally, no model calls",
        f"portrait alpha: original max 254, corners transparent; cleaned a<28 and lavender plate",
        f"mature 128 sprite: binary alpha, used for rescue/carry with Opus + player",
        "",
    ]
    for row in audit:
        lines.append(f"{row[0]}\t{row[1]}\t{row[2]}")
    lines.append("")
    lines.append("Old files remapped (must not appear as active theater src):")
    lines.append("  v2_story_endA_2_astra_rescue_px  -> assets/v3/astra_rescue.png")
    lines.append("  v2_story_endA_3_retrieved_px     -> assets/v3/astra_carry.png")
    lines.append("  v2_story_endA_4_darkroom_px      -> assets/v3/darkroom.png")
    lines.append("  assets/web/img/story/endA_2_astra_rescue.webp (v1 angel) remapped")
    lines.append("Removed narration still absent: 你被救下了。不是因为你重要。")
    text = "\n".join(lines) + "\n"
    for out in OUTS:
        (out / "AUDIT.txt").write_text(text, encoding="utf-8")
    print(text)
    print("wrote", OUTS)


if __name__ == "__main__":
    main()
