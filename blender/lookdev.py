"""Light and shading match test against Clay's Orch loop.

  Blender -b -P blender/lookdev.py -- --out DIR [--key-energy 3 --key-angle 24 ...]

Builds our ground, a clay cube on a stand, one ball and one chute, lights them
with machine.light_rig and renders a 960px square at an Orch-like camera.
"""

import argparse
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import machine as M  # noqa: E402


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--samples", type=int, default=128)
    for k, v in M.LIGHT.items():
        ap.add_argument("--" + k.replace("_", "-"), type=type(v), default=v)
    a = ap.parse_args(argv)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    over = {k: getattr(a, k) for k in M.LIGHT}

    bmesh = M.bmesh
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, radius=80, segments=96)
    M.new_mesh_obj("Ground", bm, M.clay("ground", rough=0.85, bump=0.6), smooth_shade=False)
    # stand + cube (gold), ball (cardinal), chute (cream)
    M.cylinder("StandFoot", 0.22, 0.06, M.clay("lilac"), location=(0, 0, 0.03), bevel=0.025)
    M.cylinder("StandRing", 0.15, 0.05, M.clay("lilac"), location=(0, 0, 0.085), bevel=0.02)
    M.cylinder("StandPost", 0.04, 0.3, M.clay("ink"), location=(0, 0, 0.25))
    cube = M.rounded_box("Cube", (0.62, 0.62, 0.62), M.clay("gold"), bevel=0.07, location=(0, 0, 0.71), wobble=0.006)
    cube.rotation_euler = (0, 0, math.radians(18))
    M.sphere("Ball", M.R, M.clay("cardinal", rough=0.45), location=(-0.12, -0.05, 1.02 + M.R))
    axis = [Vector((-1.9 + 1.55 * k / 40, 0.15, 1.55 - 0.38 * k / 40)) for k in range(41)]
    M.make_chute("ChuteA", axis)
    axis = [Vector((0.55 + 1.6 * k / 40, -0.2, 0.92 - 0.35 * k / 40)) for k in range(41)]
    M.make_chute("ChuteB", axis)
    M.light_rig(**over)

    cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
    M.link(cam)
    bpy.context.scene.camera = cam
    cam.data.lens = 50
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 4.0
    target = Vector((0.1, 0.0, 0.62))
    el, az, dist = math.radians(14), math.radians(-6), 5.4
    cam.location = target + Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el))) * dist
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.dof.focus_distance = dist
    M.setup_render(960, 960, a.samples)
    sc = bpy.context.scene
    sc.frame_set(1)
    os.makedirs(a.out, exist_ok=True)
    sc.render.filepath = os.path.join(a.out, "lookdev.png")
    bpy.ops.render.render(write_still=True)


main()
