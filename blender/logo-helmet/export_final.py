"""Final exports of the live scene: 2048 transparent, 2048 on #FCFAF8 with
the contact shadow (as every version was judged), a 512 transparent icon
cropped to the mark with even padding, and the .blend."""

import os

import bpy
import numpy as np

import logo_helmet as H
import render_still

ICON_PAD = 0.08  # padding on each side as a share of the icon


def write_rgba(path, rgba8):
    import struct
    import zlib
    h, w, _ = rgba8.shape
    raw = b"".join(b"\x00" + rgba8[y].tobytes() for y in range(h))

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)))
        f.write(chunk(b"IDAT", zlib.compress(raw, 9)))
        f.write(chunk(b"IEND", b""))


def go(down=os.path.expanduser("~/Downloads")):
    sc = bpy.context.scene
    sc.render.resolution_x = sc.render.resolution_y = 2048
    sc.render.resolution_percentage = 100
    # white version, same composite as the versions he judged
    render_still.go(os.path.join(down, "TTS logo helmet final white.png"),
                    blend=os.path.join(down, "TTS logo helmet.blend"))
    # transparent: the mark pass alone, unpremultiplied
    shown = [o for o in (bpy.data.objects.get(n) for n in ("Helmet", "BackPanel", "Crest")) if o]
    floor = bpy.data.objects["Plane"]
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "OPEN_EXR"
    sc.render.image_settings.color_depth = "32"
    tmp = os.path.join(down, ".tts_final_mark.exr")
    floor.hide_render = True
    try:
        a = H.render(sc, tmp)
    finally:
        floor.hide_render = False
        os.remove(tmp)
    alpha = np.clip(a[..., 3:4], 0, 1)
    rgb = np.where(alpha > 1e-4, a[..., :3] / np.maximum(alpha, 1e-4), 0)
    rgba = np.concatenate([H.to_srgb(rgb), alpha], axis=2)
    img = np.round(rgba * 255).astype(np.uint8)
    write_rgba(os.path.join(down, "TTS logo helmet final.png"), np.ascontiguousarray(img))
    # icon: tight square crop around the alpha, even padding, 512
    ys, xs = np.nonzero(img[..., 3] > 8)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    side = max(xs.max() - xs.min(), ys.max() - ys.min()) / (1 - 2 * ICON_PAD)
    x0, y0 = int(round(cx - side / 2)), int(round(cy - side / 2))
    s = int(round(side))
    pad = np.zeros((s, s, 4), dtype=np.uint8)
    sx0, sy0 = max(x0, 0), max(y0, 0)
    sx1, sy1 = min(x0 + s, img.shape[1]), min(y0 + s, img.shape[0])
    pad[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = img[sy0:sy1, sx0:sx1]
    icon = bpy.data.images.new("icon_tmp", s, s, alpha=True)
    icon.pixels.foreach_set((pad[::-1].astype(np.float32) / 255).ravel())
    icon.scale(512, 512)
    px = np.empty(512 * 512 * 4, dtype=np.float32)
    icon.pixels.foreach_get(px)
    bpy.data.images.remove(icon)
    small = np.round(px.reshape(512, 512, 4)[::-1] * 255).astype(np.uint8)
    write_rgba(os.path.join(down, "TTS logo helmet final icon 512.png"), np.ascontiguousarray(small))
    return img.shape, (xs.min(), xs.max(), ys.min(), ys.max())
