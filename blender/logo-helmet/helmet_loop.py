"""The helmet mark's sign-off loop: logo_loop.py's timeline on the v13 helmet.

  Nalana -b blender/logo-helmet/helmet.blend -P blender/logo-helmet/helmet_loop.py -- --out DIR
      [--res 640] [--samples 24] [--fps 30] [--test SECONDS]

Caleb, 2026-10-11: "Replace the old shit tts logo and animate this one just
like you did the old one." The motion is logo_loop.state, imported, not
copied, so the bounce, bounce, crouch, spin jump, jelly landing and two
second hold are the same curves the woven mark used. Frame N is frame 0.

The helmet comes from helmet.blend as Caleb approved it (v13): its 60 degree
turn and 11 degree seat stay on the Mark and Tilt empties, and a new Loop
empty above them carries the hop, squash, spin and wobble, so the spin is
about the vertical through the helmet and the squash is anchored on the
floor. Cycles, for the same reason as logo_loop.py: the floor is a shadow
catcher, so the jump has a shadow under it and the mark never floats.
"""

import argparse
import math
import os
import sys

import bpy
from mathutils import Euler, Vector
from bpy_extras.object_utils import world_to_camera_view

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import logo_loop as LL  # noqa: E402
import loops as LP  # noqa: E402

PARTS = ("Helmet", "BackPanel", "Crest")
# The union of every pose and its shadow over the loop fills the inner 72%
# of the frame. encode_loops.py --onto fades alpha to the page over the
# outer 10% of each edge; at 0.9 the chin sat 6% from the bottom and the
# crest near the top, so both would have faded. 0.72 leaves 14% a side.
# At 0.72 the mid-spin peak still came within 5% of the right edge once
# motion blur smeared it, so 0.64, sampled every frame
FRAME_SHARE = 0.64
SHADOW_SPREAD = 1.15  # the soft area light's shadow reaches past the hard projection


def rig():
    sc = bpy.context.scene
    loop = bpy.data.objects.new("Loop", None)
    sc.collection.objects.link(loop)
    mark = bpy.data.objects["Mark"]
    mw = mark.matrix_world.copy()
    mark.parent = loop
    mark.matrix_world = mw

    def fn(t):
        z, s, spin, tilt = LL.state(t)
        return LP.trs((0, 0, z), Euler((0, tilt, spin), "XYZ"), LP.squash(s))

    LP.ANIM.clear()
    LP.FPS, LP.SECONDS, LP.N = LL.FPS, LL.SECONDS, LL.N
    LP.animate(loop, fn)
    LP.bake_all()


def points():
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for n in PARTS:
        ev = bpy.data.objects[n].evaluated_get(dg)
        me = ev.to_mesh()
        pts += [ev.matrix_world @ v.co for v in list(me.vertices)[::9]]
        ev.to_mesh_clear()
    return pts


def frame_all(cam):
    """Fit the camera, along its own view, to every pose in the loop."""
    sc = bpy.context.scene
    pts = []

    key = bpy.data.objects["key"].matrix_world.translation
    for f in range(0, LL.N):
        sc.frame_set(f)
        ps = points()
        pts += ps
        # the shadow: the footprint straight down, spread for the soft edge.
        # Projecting from the key light (first try) threw a long hard shadow
        # the soft area light never casts and shoved the mark into a corner.
        # The key's hard projection is too long and the straight-down
        # footprint too short (its shadow ran past the right edge at 2.05 s),
        # so halfway between, which matched the rendered shadow's reach.
        sh = []
        for p in ps[::4]:
            d = p - key
            hard = p + d * (-p.z / d.z) if d.z < -1e-6 else Vector((p.x, p.y, 0.0))
            sh.append((Vector((p.x, p.y, 0.0)) + hard) / 2)
        if sh:
            c = sum(sh, Vector()) / len(sh)
            pts += [c + (q - c) * SHADOW_SPREAD for q in sh]
    sc.frame_set(0)
    for _ in range(5):
        bpy.context.view_layer.update()
        uv = [world_to_camera_view(sc, cam, p) for p in pts]
        u0, u1 = min(p.x for p in uv), max(p.x for p in uv)
        v0, v1 = min(p.y for p in uv), max(p.y for p in uv)
        span = max(u1 - u0, v1 - v0)
        q = cam.matrix_world.to_quaternion()
        right, up, fwd = q @ Vector((1, 0, 0)), q @ Vector((0, 1, 0)), q @ Vector((0, 0, -1))
        centre = sum(pts, Vector()) / len(pts)
        dist = (centre - cam.location).dot(fwd)
        width = 2 * dist * math.tan(cam.data.angle / 2)
        cam.location += right * ((u0 + u1) / 2 - 0.5) * width + up * ((v0 + v1) / 2 - 0.5) * width
        cam.location += fwd * (dist - dist * span / FRAME_SHARE)


def setup(res, samples):
    sc = bpy.context.scene
    floor = bpy.data.objects["Plane"]
    floor.is_shadow_catcher = True
    # only the key casts onto the catcher: the low fill and rim threw long
    # grey washes that ran off the frame edge mid-jump
    for n in ("fill", "rim"):
        bpy.data.objects[n].data.use_shadow = False
    floor.visible_camera = True
    floor.hide_render = False
    for n in PARTS:
        o = bpy.data.objects[n]
        o.hide_render = False
        o.visible_camera = True
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == "METAL"
    sc.cycles.device = "GPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.seed = 7
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.color_depth = "8"
    sc.view_settings.view_transform = "Standard"
    sc.render.fps = LL.FPS
    sc.frame_start, sc.frame_end = 0, LL.N - 1
    sc.render.use_motion_blur = True
    sc.render.motion_blur_shutter = 0.4
    sc.render.use_persistent_data = True


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--res", type=int, default=640)
    ap.add_argument("--samples", type=int, default=24)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--test", type=float, nargs="*", default=None)
    a = ap.parse_args(argv)
    LL.set_fps(a.fps)
    os.makedirs(a.out, exist_ok=True)
    rig()
    setup(a.res, a.samples)
    frame_all(bpy.context.scene.camera)
    sc = bpy.context.scene
    if a.test is not None:
        for t in a.test:
            sc.frame_set(int(round(t * LL.FPS)) % LL.N)
            sc.render.filepath = os.path.join(a.out, f"test_{t:.2f}.png")
            bpy.ops.render.render(write_still=True)
        print("WROTE tests", a.out)
        return
    sc.render.filepath = os.path.join(a.out, "f_")
    sc.render.use_overwrite = False
    sc.render.use_placeholder = True
    bpy.ops.render.render(animation=True)
    print("RENDERED", a.out)


if __name__ == "__main__":
    main()
