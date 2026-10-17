"""A TTS mark idea: a clay helmet, for Caleb to judge, not shipped.

  Blender -b --factory-startup -P blender/logo_helmet.py -- OUT.png [--res 1200] [--samples 96]

Caleb, 2026-10-10, 8:26pm: "same vibe as the clay logo, maybe it's a clay
helmet with a simple techy engraving along the sides that also looks like
lemma styling, and the S goes along the back of the helmet. Angled with the
T facing towards the left side of the screen, and you see the S on the back
center right and up of the T".

  helmet   a generic crested helmet in cardinal clay (not USC's Trojan head
           or any athletics mark), a shell with its face opening cut as a T
  S        the crest, gold, two arcs of one even stroke with flat cut ends,
           standing on the back of the dome
  engraving  two thin gold runs on the side with right-angle turns, each
           ending in a dot terminal, the single-weight line work of
           uselemma.ai
  view     three-quarters, the face to the left of a square frame, the key
           from the upper left so the engraving catches it

Rendered in Cycles on alpha with a shadow catcher; the job flattens it onto
the page's paper (#fbfaf7) with the alpha faded out at the frame's edges.
"""

import math
import os
import sys

import bmesh
import bpy
from mathutils import Euler, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import logo as L  # noqa: E402

AX, AY, AZ = 1.12, 0.9, 1.04  # the dome's half-axes: long front to back


def grainy(name, color, rough=0.6, grain=0.6):
    """logo.py's material with a coarser, stronger grain: at helmet scale
    its scale-70 bump vanished in the first still."""
    m = L.clay(name, color, rough)
    bump = next(n for n in m.node_tree.nodes if n.type == "BUMP")
    bump.inputs["Strength"].default_value = grain
    noise = next(n for n in m.node_tree.nodes if n.type == "TEX_NOISE")
    noise.inputs["Scale"].default_value = 38.0
    return m


def cutter(name, size, loc):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    c = bpy.context.active_object
    c.name = name
    c.scale = size
    c.hide_render = True
    c.display_type = "WIRE"
    return c


def helmet(mat):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=96, ring_count=48)
    h = bpy.context.active_object
    h.name = "Helmet"
    h.scale = (AX, AY, AZ)
    bpy.ops.object.shade_smooth()
    h.data.materials.append(mat)
    sol = h.modifiers.new("shell", "SOLIDIFY")
    sol.thickness = 0.07
    sol.offset = -1
    # the open bottom, cut flat
    floor_cut = cutter("CutFloor", (4, 4, 2), (0, 0, -1.6))
    # the face opening as a T: an eye slit across, a slot down the middle
    bar = cutter("CutBar", (1.0, 1.2, 0.26), (-1.0, 0, 0.14))
    stem = cutter("CutStem", (1.0, 0.32, 0.9), (-1.0, 0, -0.3))
    for c in (floor_cut, bar, stem):
        b = h.modifiers.new(c.name, "BOOLEAN")
        b.operation = "DIFFERENCE"
        b.object = c
        b.solver = "EXACT"
    bev = h.modifiers.new("soft", "BEVEL")
    bev.width = 0.012
    bev.segments = 2
    bev.limit_method = "ANGLE"
    return h


def crest(mat):
    """An S from two arcs of one stroke, in the helmet's midplane."""
    r, w, depth = 0.24, 0.13, 0.16
    zu, zl = 0.24, -0.24  # arc centres, one stroke apart
    upper = L.sector(r, w, math.radians(15), math.radians(270), steps=64)
    lower = L.sector(r, w, math.radians(90), math.radians(-165), steps=64)
    parts = []
    for name, outline, zc in (("S_top", upper, zu), ("S_low", lower, zl)):
        ob = L.slab([(x, z + zc) for x, z in outline], depth, -depth / 2, mat, name)
        parts.append(ob)
    holder = bpy.data.objects.new("Crest", None)
    bpy.context.collection.objects.link(holder)
    for p in parts:
        p.parent = holder
    # stood on the back of the dome, its foot sunk into the clay
    x = 0.55
    # 0.4 above the dome left the S floating in the first still
    z = AZ * math.sqrt(max(0.0, 1 - (x / AX) ** 2)) + 0.28
    holder.location = (x, 0, z)
    holder.rotation_euler = (0, math.radians(-18), 0)  # leans back with the dome
    return holder


def on_side(x, z, lift=0.004):
    """A point on the camera-facing (-y) side of the dome."""
    k = 1 - (x / AX) ** 2 - (z / AZ) ** 2
    return Vector((x, -AY * math.sqrt(max(k, 0.0)) - lift, z))


def engraving(mat):
    runs = [
        [(-0.42, 0.42), (0.12, 0.42), (0.12, 0.16), (0.62, 0.16)],
        [(-0.3, -0.06), (0.0, -0.06), (0.0, -0.3), (0.5, -0.3)],
    ]
    for i, run in enumerate(runs):
        pts = []
        for (x0, z0), (x1, z1) in zip(run, run[1:]):
            n = 24
            for k in range(n):
                t = k / n
                pts.append(on_side(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t))
        pts.append(on_side(*run[-1]))
        cu = bpy.data.curves.new(f"trace{i}", "CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = 0.013
        cu.bevel_resolution = 4
        cu.use_fill_caps = True
        sp = cu.splines.new("POLY")
        sp.points.add(len(pts) - 1)
        for p, v in zip(sp.points, pts):
            p.co = (v.x, v.y, v.z, 1.0)
        ob = bpy.data.objects.new(f"Trace{i}", cu)
        ob.data.materials.append(mat)
        bpy.context.collection.objects.link(ob)
        end = on_side(*run[-1], lift=0.01)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.04, location=end, segments=32, ring_count=16)
        dot = bpy.context.active_object
        dot.name = f"Terminal{i}"
        bpy.ops.object.shade_smooth()
        dot.data.materials.append(mat)
        yield ob
        yield dot


def main():
    argv = sys.argv[sys.argv.index("--") + 1:]
    out = argv[0]
    res = int(argv[argv.index("--res") + 1]) if "--res" in argv else 1200
    samples = int(argv[argv.index("--samples") + 1]) if "--samples" in argv else 96
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    card = grainy("cardinal", L.CARDINAL)
    gold = grainy("gold", L.GOLD, 0.45, 0.3)
    trace = grainy("trace", L.GOLD, 0.35, 0.1)

    h = helmet(card)
    c = crest(gold)
    lines = list(engraving(trace))
    mark = bpy.data.objects.new("Mark", None)
    sc.collection.objects.link(mark)
    for o in [h, c] + lines:
        o.parent = mark
    for o in bpy.data.objects:
        if o.name.startswith("Cut"):
            o.parent = mark
    # three-quarters: the face (-x) turned toward the camera and the left
    mark.rotation_euler = Euler((0, 0, math.radians(42)))  # 32 hid the T edge-on
    mark.location = (0, 0, 0.62)

    bpy.ops.mesh.primitive_circle_add(vertices=96, radius=2.6, fill_type="NGON", location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.is_shadow_catcher = True

    cd = bpy.data.cameras.new("cam")
    cd.lens = 70
    cam = bpy.data.objects.new("cam", cd)
    sc.collection.objects.link(cam)
    cam.location = Vector((0.0, -7.0, 1.9))
    cam.rotation_euler = (Vector((0.12, 0.0, 0.95)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    for name, energy, size, loc in (("key", 520, 4, (-3.4, -3.6, 4.6)), ("fill", 120, 7, (4.0, -3.2, 1.6)),
                                    ("rim", 160, 3, (2.0, 3.5, 3.5))):
        li = bpy.data.lights.new(name, "AREA")
        li.energy, li.size = energy, size
        ob = bpy.data.objects.new(name, li)
        ob.location = loc
        ob.rotation_euler = (Vector((0, 0, 0.8)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        sc.collection.objects.link(ob)
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = L.srgb(L.CREAM)
    bg.inputs["Strength"].default_value = 0.5
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
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = res
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = "Standard"
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print("WROTE", out)


if __name__ == "__main__":
    main()
