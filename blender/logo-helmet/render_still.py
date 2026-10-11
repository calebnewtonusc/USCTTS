"""Render the live Nalana scene's mark to a PNG on #FCFAF8 with a contact
shadow, the same three-pass composite as logo_helmet.py, then save the .blend.
Call render_still.go(path) from inside Blender."""

import os

import bpy
import numpy as np

import logo_helmet as H

SHADOW_GAMMA = 1.8  # v1's ratio-only shadow was too faint to see at all; 1.8 reads soft but present


def go(out, blend=os.path.expanduser("~/Downloads/TTS logo helmet.blend")):
    sc = bpy.context.scene
    shown = [o for o in (bpy.data.objects.get(n) for n in ("Helmet", "BackPanel", "Crest")) if o]
    floor = bpy.data.objects["Plane"]
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "OPEN_EXR"
    sc.render.image_settings.color_depth = "32"
    tmp = os.path.splitext(out)[0] + "_pass"
    try:
        floor.visible_camera = False
        a = H.render(sc, tmp + "_mark.exr")
        floor.visible_camera = True
        for o in shown:
            o.visible_camera = False
        b = H.render(sc, tmp + "_shadow.exr")
        for o in shown:
            o.hide_render = True
        c = H.render(sc, tmp + "_floor.exr")
    finally:
        floor.visible_camera = True
        for o in shown:
            o.visible_camera = True
            o.hide_render = False
    lum = np.array([0.2126, 0.7152, 0.0722])
    lb, lc = b[..., :3] @ lum, c[..., :3] @ lum
    ratio = np.where(lc > 1e-4, np.clip(lb / np.maximum(lc, 1e-4), 0, 1), 1.0) ** SHADOW_GAMMA
    paper = H.to_lin(np.array(H.PAPER) / 255.0)
    alpha = np.clip(a[..., 3:4], 0, 1)
    img = np.round(H.to_srgb(a[..., :3] + (1 - alpha) * paper[None, None, :] * ratio[..., None]) * 255)
    H.write_png(out, np.ascontiguousarray(img.astype(np.uint8)))
    for p in ("_mark.exr", "_shadow.exr", "_floor.exr"):
        os.remove(tmp + p)
    bpy.ops.wm.save_as_mainfile(filepath=blend, copy=True)
    # the silhouette's aspect, for the square check
    m = a[..., 3] > 0.5
    ys, xs = np.nonzero(m)
    return img[2, 2].tolist(), (xs.max() - xs.min()) / (ys.max() - ys.min())
