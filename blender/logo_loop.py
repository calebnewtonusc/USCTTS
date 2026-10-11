"""The TTS mark's sign-off loop for the bottom of home, on transparent alpha.

  Blender -b -P blender/logo_loop.py -- --out DIR [--res 800] [--samples 64] [--test SECONDS]

Caleb, 2026-10-10: "a lil silly bit where the logo bounces a lil bit, then
jumps and spins around and lands and wobbles a lil bit then comes back to
being still, and then it waits for a bit then the video loops".

The mark itself is logo.build_woven, imported rather than copied, so the
still (blender/logo-out/woven.png) and this loop stay one design. Timeline,
6 s at 30 fps, frame 180 is frame 0:

  0.00  still
  0.30  bounce one: squash, a small hop, land
  0.85  bounce two, a little higher
  1.35  crouch
  1.60  the jump, one full turn about the vertical axis on the way up and down
  2.30  lands: squash, then a jelly wobble that settles by 3.7
  3.80  still, a two second hold before the loop

Rendered in Cycles, not the still's EEVEE, for one reason: a shadow-catcher
floor. Without a shadow the jump reads as the mark floating off the page;
Cycles writes the catcher's shadow into alpha, EEVEE cannot.
"""

import argparse
import math
import os
import sys

import bpy
from mathutils import Euler, Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import logo as L  # noqa: E402
import loops as LP  # noqa: E402  (bake, easing and spring helpers)

FPS = 30
SECONDS = 6.0
N = int(FPS * SECONDS)
BASE_Z = -0.14  # the bands' lowest point: arcs at z 0 with a 0.14 tube

smooth, kick, squash, clamp01 = LP.smooth, LP.kick, LP.squash, LP.clamp01


def hop(t, t0, t1, height):
    if t0 <= t < t1:
        x = (t - t0) / (t1 - t0)
        return height * 4 * x * (1 - x)
    return 0.0


def state(t):
    """(lift, squash, spin about z, wobble tilt) at t seconds."""
    z = hop(t, 0.42, 0.72, 0.12) + hop(t, 0.95, 1.25, 0.16) + hop(t, 1.6, 2.3, 0.78)
    s = 1.0
    # bounce one
    if 0.3 <= t < 0.42:
        s -= 0.07 * smooth((t - 0.3) / 0.12)
    elif 0.42 <= t < 0.72:
        x = (t - 0.42) / 0.3
        s += -0.07 * (1 - smooth(x / 0.15)) + 0.05 * math.sin(math.pi * x)
    s -= 0.08 * kick(t - 0.72, freq=3.2, damp=10)
    # bounce two
    if 0.85 <= t < 0.95:
        s -= 0.08 * smooth((t - 0.85) / 0.1)
    elif 0.95 <= t < 1.25:
        x = (t - 0.95) / 0.3
        s += -0.08 * (1 - smooth(x / 0.15)) + 0.06 * math.sin(math.pi * x)
    s -= 0.1 * kick(t - 1.25, freq=3.2, damp=10)
    # crouch, jump, spin
    if 1.35 <= t < 1.6:
        s -= 0.17 * smooth((t - 1.35) / 0.25)
    spin = 0.0
    if 1.6 <= t < 2.3:
        x = (t - 1.6) / 0.7
        s += -0.17 * (1 - smooth(x / 0.1)) + 0.13 * math.sin(math.pi * clamp01(x / 0.35)) * (1 - x) \
            + 0.05 * smooth((x - 0.75) / 0.25)
        spin = math.tau * (0.5 - 0.5 * math.cos(math.pi * x))
    elif t >= 2.3:
        spin = math.tau
    # the landing and the jelly
    s -= 0.24 * kick(t - 2.3, freq=2.4, damp=4.2, attack=0.03)
    tilt = math.radians(5) * kick(t - 2.36, freq=1.9, damp=3.8, attack=0.05)
    return z, s, spin % math.tau, tilt


def build(w, h, samples):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    m = {
        "cardinal": L.clay("cardinal", L.CARDINAL),
        "gold": L.clay("gold", L.GOLD, 0.5),
        "cream": L.clay("cream", L.CREAM),
        "ink": L.clay("ink", L.INK, 0.45),
    }
    L.build_woven(m)
    parts = list(bpy.data.objects)
    rig = bpy.data.objects.new("Mark", None)
    sc.collection.objects.link(rig)
    rig.location = (0, 0, BASE_Z)
    bpy.context.view_layer.update()
    for o in parts:
        mw = o.matrix_world.copy()
        o.parent = rig
        o.matrix_parent_inverse = rig.matrix_world.inverted()
        o.matrix_world = mw

    def rig_fn(t):
        z, s, spin, tilt = state(t)
        sq = squash(s)
        return LP.trs((0, 0, BASE_Z + z), Euler((0, tilt, spin), "XYZ"), sq)

    LP.ANIM.clear()
    LP.FPS, LP.SECONDS, LP.N = FPS, SECONDS, N
    LP.animate(rig, rig_fn)
    LP.bake_all()

    # shadow catcher floor at the bands' base
    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, BASE_Z))
    floor = bpy.context.active_object
    floor.is_shadow_catcher = True

    # camera: the still's view, pulled back for the jump's headroom
    cd = bpy.data.cameras.new("cam")
    cd.lens = 85
    cam = bpy.data.objects.new("cam", cd)
    sc.collection.objects.link(cam)
    cam.location = Vector((0.0, -7.4, 2.3))
    cam.rotation_euler = (Vector((0.0, 0.0, 0.92)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    for name, energy, size, loc, rot in (("key", 380, 6, (-3.0, -4.0, 5.0), (50, 0, -35)),
                                         ("fill", 110, 8, (4.0, -3.0, 2.0), (70, 0, 50))):
        li = bpy.data.lights.new(name, "AREA")
        li.energy, li.size = energy, size
        ob = bpy.data.objects.new(name, li)
        ob.location = loc
        ob.rotation_euler = tuple(math.radians(a) for a in rot)
        sc.collection.objects.link(ob)
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = L.srgb(L.CREAM)
    bg.inputs["Strength"].default_value = 0.6
    sc.world = world

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
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = "Standard"
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = 0, N - 1
    sc.render.use_motion_blur = True
    sc.render.motion_blur_shutter = 0.4
    sc.render.use_persistent_data = True


def set_fps(fps):
    """The loop stays 6 s at any rate."""
    global FPS, N
    FPS, N = fps, int(fps * SECONDS)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--res", type=int, default=800)
    ap.add_argument("--samples", type=int, default=64)
    ap.add_argument("--test", type=float, default=None)
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args(argv)
    set_fps(a.fps)  # the loop stays 6 s at any rate
    os.makedirs(a.out, exist_ok=True)
    build(a.res, a.res, a.samples)
    sc = bpy.context.scene
    if a.dry:
        print("DRY logo", len(LP.ANIM))
        return
    if a.test is not None:
        for t in [a.test, 0.0, 1.0, 1.95, 2.4]:
            sc.frame_set(int(round(t * FPS)) % N)
            sc.render.filepath = os.path.join(a.out, f"test_{t:.2f}.png")
            if t != a.test:
                sc.render.resolution_percentage = 40
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
