#!/usr/bin/env python3
"""Cut the Gemini sticker sheets and render two layout proofs.

Only files below --output-dir are written. The JPEG inputs are read-only.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont


HERE = Path(__file__).resolve().parent
DEFAULT_SOURCE = HERE.parents[1] / "new"
DEFAULT_OUTPUT = HERE / "generated"
MANIFEST = HERE / "manifest.json"
BACKGROUND_DISTANCE = 28


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalized_box(values: list[float], size: tuple[int, int]) -> tuple[int, int, int, int]:
    width, height = size
    left, top, right, bottom = values
    if not (0 <= left < right <= 1 and 0 <= top < bottom <= 1):
        raise ValueError(f"Invalid crop: {values}")
    return (
        round(left * width),
        round(top * height),
        round(right * width),
        round(bottom * height),
    )


def estimate_background(image: Image.Image) -> np.ndarray:
    rgb = np.asarray(image.convert("RGB"))
    side = min(64, image.width // 12, image.height // 12)
    corners = [
        rgb[:side, :side],
        rgb[:side, -side:],
        rgb[-side:, :side],
        rgb[-side:, -side:],
    ]
    return np.median(np.concatenate([part.reshape(-1, 3) for part in corners]), axis=0)


def closest_foreground(mask: np.ndarray, point: tuple[int, int]) -> tuple[int, int]:
    sx, sy = point
    if 0 <= sy < mask.shape[0] and 0 <= sx < mask.shape[1] and mask[sy, sx]:
        return sx, sy
    radius = 12
    while radius <= max(mask.shape):
        x0, x1 = max(0, sx - radius), min(mask.shape[1], sx + radius + 1)
        y0, y1 = max(0, sy - radius), min(mask.shape[0], sy + radius + 1)
        candidates = np.argwhere(mask[y0:y1, x0:x1])
        if len(candidates):
            candidates[:, 0] += y0
            candidates[:, 1] += x0
            distances = (candidates[:, 0] - sy) ** 2 + (candidates[:, 1] - sx) ** 2
            py, px = candidates[np.argmin(distances)]
            return int(px), int(py)
        radius *= 2
    raise ValueError("No foreground near sticker seed")


def fill_enclosed_details(component: np.ndarray) -> np.ndarray:
    """Keep neutral colors enclosed by a sticker's white die-cut outline."""
    # floodfill needs a writable Pillow buffer; fromarray alone can keep a read-only view.
    inverse = Image.fromarray(255 - component, mode="L").copy()
    width, height = inverse.size
    for x in range(width):
        if inverse.getpixel((x, 0)) == 255:
            ImageDraw.floodfill(inverse, (x, 0), 128, thresh=0)
        if inverse.getpixel((x, height - 1)) == 255:
            ImageDraw.floodfill(inverse, (x, height - 1), 128, thresh=0)
    for y in range(height):
        if inverse.getpixel((0, y)) == 255:
            ImageDraw.floodfill(inverse, (0, y), 128, thresh=0)
        if inverse.getpixel((width - 1, y)) == 255:
            ImageDraw.floodfill(inverse, (width - 1, y), 128, thresh=0)
    enclosed = np.asarray(inverse) == 255
    return np.where(enclosed, 255, component).astype(np.uint8)


def extract_sticker(
    sheet: Image.Image, background: np.ndarray, spec: dict[str, Any]
) -> tuple[Image.Image, dict[str, Any]]:
    box = normalized_box(spec["crop"], sheet.size)
    crop = sheet.crop(box).convert("RGB")
    rgb = np.asarray(crop, dtype=np.int16)
    distance = np.max(np.abs(rgb - background), axis=2)
    foreground = (distance > BACKGROUND_DISTANCE).astype(np.uint8) * 255

    # Close tiny JPEG gaps in the white die-cut outline before selecting a component.
    binary = Image.fromarray(foreground, mode="L")
    binary = binary.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    binary_array = np.asarray(binary)
    seed_x = round(spec["seed"][0] * sheet.width) - box[0]
    seed_y = round(spec["seed"][1] * sheet.height) - box[1]
    seed = closest_foreground(binary_array == 255, (seed_x, seed_y))
    ImageDraw.floodfill(binary, seed, 128, thresh=0)
    selected = (np.asarray(binary) == 128).astype(np.uint8) * 255
    selected = fill_enclosed_details(selected)
    alpha = Image.fromarray(selected, mode="L")
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.55))
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError(f"Empty cutout: {spec['id']}")

    inset = 6
    bounds = (
        max(0, bounds[0] - inset),
        max(0, bounds[1] - inset),
        min(crop.width, bounds[2] + inset),
        min(crop.height, bounds[3] + inset),
    )
    result = crop.convert("RGBA")
    result.putalpha(alpha)
    result = result.crop(bounds)
    touches_crop = (
        bounds[0] <= inset or bounds[1] <= inset
        or bounds[2] >= crop.width - inset or bounds[3] >= crop.height - inset
    )
    return result, {
        "id": spec["id"],
        "source_crop": list(box),
        "output_size": list(result.size),
        "opaque_pixels": int(np.count_nonzero(np.asarray(result.getchannel("A")) > 250)),
        "touches_crop_edge": touches_crop,
    }


def fit(image: Image.Image, max_width: int, max_height: int) -> Image.Image:
    copy = image.copy()
    copy.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
    return copy


def sticker_at_width(image: Image.Image, width: int) -> Image.Image:
    height = max(1, round(image.height * width / image.width))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def composite_sticker(canvas: Image.Image, sticker: Image.Image, x: int, y: int) -> None:
    shadow = Image.new("RGBA", sticker.size, (63, 50, 36, 0))
    shadow_alpha = sticker.getchannel("A").filter(ImageFilter.GaussianBlur(9)).point(
        lambda value: round(value * 0.20)
    )
    shadow.putalpha(shadow_alpha)
    canvas.alpha_composite(shadow, (x + 6, y + 11))
    canvas.alpha_composite(sticker, (x, y))


def silhouette(sticker: Image.Image) -> Image.Image:
    alpha = sticker.getchannel("A")
    outline = alpha.filter(ImageFilter.MaxFilter(11))
    ring = ImageChops.subtract(outline, alpha)
    hint = Image.new("RGBA", sticker.size, (239, 232, 209, 0))
    hint.putalpha(alpha.point(lambda value: round(value * 0.38)))
    edge = Image.new("RGBA", sticker.size, (105, 100, 78, 0))
    edge.putalpha(ring.point(lambda value: round(value * 0.55)))
    edge.alpha_composite(hint)
    return edge


def draw_previews(
    background: Image.Image,
    specs: list[dict[str, Any]],
    stickers: dict[str, Image.Image],
    output: Path | None,
) -> None:
    base = background.convert("RGBA")
    initial = base.copy()
    complete = base.copy()
    placements: list[tuple[int, dict[str, Any], Image.Image, int, int]] = []
    for spec in specs:
        x_fraction, y_fraction, width_fraction = spec["place"]
        sticker = sticker_at_width(stickers[spec["id"]], round(base.width * width_fraction))
        x, y = round(base.width * x_fraction), round(base.height * y_fraction)
        if x + sticker.width > base.width or y + sticker.height > base.height:
            raise ValueError(f"Sticker exceeds background: {spec['id']}")
        placements.append((spec["z"], spec, sticker, x, y))

    for _, _, sticker, x, y in sorted(placements, key=lambda item: item[0]):
        initial.alpha_composite(silhouette(sticker), (x, y))
        composite_sticker(complete, sticker, x, y)

    # The initial proof displays every unplaced sticker in the reserved paper area.
    tray_x = [80, 330, 580]
    row_height = 205
    for index, spec in enumerate(specs):
        sticker = fit(stickers[spec["id"]], 185, 155)
        column, row = index % 3, index // 3
        x = tray_x[column] + (185 - sticker.width) // 2
        y = 46 + row * row_height + (155 - sticker.height) // 2
        composite_sticker(initial, sticker, x, y)

    if output is not None:
        initial.save(output / "preview-initial.png")
        complete.save(output / "preview-complete.png")


def draw_contact_sheet(specs: list[dict[str, Any]], stickers: dict[str, Image.Image], output: Path) -> None:
    columns, cell_w, cell_h = 5, 340, 280
    rows = (len(specs) + columns - 1) // columns
    contact = Image.new("RGBA", (columns * cell_w, rows * cell_h), (242, 242, 238, 255))
    draw = ImageDraw.Draw(contact)
    for index, spec in enumerate(specs):
        x, y = (index % columns) * cell_w, (index // columns) * cell_h
        for cy in range(y + 12, y + 230, 24):
            for cx in range(x + 12, x + 328, 24):
                shade = (225, 226, 223, 255) if ((cx + cy) // 24) % 2 else (249, 249, 247, 255)
                draw.rectangle((cx, cy, cx + 23, cy + 23), fill=shade)
        sticker = fit(stickers[spec["id"]], 300, 196)
        contact.alpha_composite(sticker, (x + (cell_w - sticker.width) // 2, y + 18 + (200 - sticker.height) // 2))
        draw.text((x + 18, y + 246), spec["id"], fill=(45, 47, 43, 255), font=ImageFont.load_default())
    contact.save(output / "proof-contact-sheet.png")


def build(source_dir: Path, output_dir: Path, dry_run: bool) -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    specs = manifest["stickers"]
    ids = [spec["id"] for spec in specs]
    if len(specs) != 21 or len(ids) != len(set(ids)):
        raise ValueError("Manifest must contain exactly 21 uniquely named stickers")
    source_paths = {key: source_dir / name for key, name in manifest["sheets"].items()}
    source_paths["background"] = source_dir / manifest["background"]
    missing = [str(path) for path in source_paths.values() if not path.is_file()]
    if missing:
        raise FileNotFoundError("Missing source images:\n" + "\n".join(missing))
    hashes_before = {key: sha256(path) for key, path in source_paths.items()}
    sheets = {key: Image.open(path).convert("RGB") for key, path in source_paths.items() if key != "background"}
    backgrounds = {key: estimate_background(image) for key, image in sheets.items()}
    stickers: dict[str, Image.Image] = {}
    reports: list[dict[str, Any]] = []
    for spec in specs:
        sheet_name = spec["sheet"]
        image, report = extract_sticker(sheets[sheet_name], backgrounds[sheet_name], spec)
        stickers[spec["id"]] = image
        reports.append(report)
        flag = " [CHECK CROP]" if report["touches_crop_edge"] else ""
        print(f"{spec['id']:18} {image.width:4}x{image.height:<4}{flag}")

    if dry_run:
        with Image.open(source_paths["background"]) as background:
            draw_previews(background, specs, stickers, None)
        print("Dry run: 21 cutouts and both layouts rendered in memory; no files were written.")
    else:
        if output_dir.exists() and any(output_dir.iterdir()):
            raise FileExistsError(
                f"Output directory is not empty: {output_dir}. "
                "Choose a new directory with --output-dir; existing results are never overwritten."
            )
        output_dir.mkdir(parents=True, exist_ok=True)
        cutout_dir = output_dir / "stickers"
        cutout_dir.mkdir(exist_ok=True)
        for sticker_id, image in stickers.items():
            image.save(cutout_dir / f"{sticker_id}.png")
        with Image.open(source_paths["background"]) as background:
            draw_previews(background, specs, stickers, output_dir)
        draw_contact_sheet(specs, stickers, output_dir)
        (output_dir / "report.json").write_text(
            json.dumps({"sources": hashes_before, "stickers": reports}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"Wrote 21 PNGs and three proofs to {output_dir}")

    hashes_after = {key: sha256(path) for key, path in source_paths.items()}
    if hashes_before != hashes_after:
        raise RuntimeError("A source image changed during processing")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE, help="Directory with the five Gemini JPEGs")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT, help="Directory for generated PNGs and proofs")
    parser.add_argument("--dry-run", action="store_true", help="Inspect all cutouts without writing files")
    args = parser.parse_args()
    build(args.source_dir.expanduser().resolve(), args.output_dir.expanduser().resolve(), args.dry_run)


if __name__ == "__main__":
    main()
