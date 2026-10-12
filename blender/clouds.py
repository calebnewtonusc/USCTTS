"""Caption clouds for /way's film (Week.tsx).

  Nalana -b --factory-startup --python blender/clouds.py -- <out_dir>

Caleb, 2026-10-11: the captions were barely visible; he wants "3d clouds that
pop up in the video", poofy, a flat bottom, and a flat front facing us to
carry the text, over the video. Each cloud is a metaball cluster turned into
a mesh, then cut flat underneath and flat in front, so the face is a real
plane the text sits on. Rendered on transparency in the film's own light
(machine.py: a warm sun from the upper left over a soft sky) and laid over
the canvas by the page.
"""
import math
import os
import random
import sys

import bmesh
import bpy

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "/tmp/clouds"
os.makedirs(OUT, exist_ok=True)

# Three shapes, so six captions don't wear one cloud. Each is a loaf of
# overlapping puffs, rounded all over, with a row of smaller puffs on top so
# the bumps stay gentle, and only the bottom cut flat. Earlier tries cut the
# front flat too and read as a chopped block (Caleb, 2026-10-11: "I didn't
# mean the clouds are literally flat, I just meant not completely huge
# bumps"); an ellipsoid body with puffs on it never filled in and rendered
# as a string of beads. Each shape is its top row: (x, z, r).
SHAPES = [
    [(-1.55, 0.98, 0.42), (-0.9, 1.12, 0.5), (-0.2, 1.2, 0.54), (0.5, 1.14, 0.5), (1.2, 1.0, 0.44)],
    [(-1.5, 1.04, 0.46), (-0.8, 1.18, 0.52), (0.0, 1.08, 0.46), (0.7, 1.2, 0.52), (1.35, 1.0, 0.42)],
    [(-1.45, 1.0, 0.44), (-0.75, 1.2, 0.54), (0.05, 1.1, 0.48), (0.8, 1.16, 0.5), (1.45, 0.98, 0.42)],
]
BOTTOM_Z = 0.16  # the flat underside


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    try:
        sc.render.engine = "CYCLES"
    except TypeError:
        pass
    sc.cycles.samples = int(os.environ.get("CLOUD_SAMPLES", "160"))
    sc.cycles.use_denoising = True
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        sc.cycles.device = "GPU"
    except Exception:
        pass
    sc.render.film_transparent = True
    sc.render.resolution_x = 1500
    sc.render.resolution_y = 760
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    try:
        sc.view_settings.view_transform = "AgX"
    except TypeError:
        sc.view_settings.view_transform = "Filmic"
    # AgX alone read the cream as grey (render 2, 2026-10-11).
    sc.view_settings.exposure = 1.0
    return sc


def cloud(puffs, seed):
    random.seed(seed)
    mb = bpy.data.metaballs.new("cloud")
    mb.resolution = 0.05
    mb.render_resolution = 0.04
    mb.threshold = 0.6
    ob = bpy.data.objects.new("cloud", mb)
    bpy.context.collection.objects.link(ob)
    # The loaf: two rows of even puffs, front and back, low and middle.
    for y in (-0.15, 0.3):
        for z, r, xs in ((0.42, 0.56, 2.0), (0.74, 0.54, 1.75)):
            n = 15
            for i in range(n):
                x = -xs + 2 * xs * i / (n - 1)
                e = mb.elements.new()
                e.co = (x + random.uniform(-0.03, 0.03), y, z)
                e.radius = r * (0.88 if abs(x) > xs - 0.3 else 1.0)
    # The gentle bumps on top.
    for x, z, r in puffs:
        for y in (-0.05, 0.3):
            e = mb.elements.new()
            # Lower and fuller than drawn, so each bump melts into the
            # loaf instead of sitting on it like a bead (render 7).
            e.co = (x + random.uniform(-0.04, 0.04), y, z - 0.14)
            e.radius = r * 1.28
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target="MESH")
    me = bpy.context.active_object
    bm = bmesh.new()
    bm.from_mesh(me.data)
    # Flat underneath only.
    for co, no in (((0, 0, BOTTOM_Z), (0, 0, -1)),):
        geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        res = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=no, clear_outer=True)
        edges = [g for g in res["geom_cut"] if isinstance(g, bmesh.types.BMEdge)]
        if edges:
            bmesh.ops.holes_fill(bm, edges=edges, sides=0)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)
    bm.to_mesh(me.data)
    bm.free()
    for p in me.data.polygons:
        p.use_smooth = True
    # A soft edge where the flat cuts meet the puffs.
    bev = me.modifiers.new("bevel", "BEVEL")
    bev.width = 0.08
    bev.segments = 6
    bev.limit_method = "ANGLE"
    bev.angle_limit = math.radians(40)
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    except Exception:
        pass
    return me


def material():
    m = bpy.data.materials.new("puff")
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    # The film's cream (#F4EFE6), a touch warmer so it reads as a thing
    # sitting in the scene's light, not paper.
    b.inputs["Base Color"].default_value = (0.97, 0.94, 0.89, 1)
    b.inputs["Roughness"].default_value = 0.62
    for k in ("Subsurface Weight", "Subsurface"):
        if k in b.inputs:
            b.inputs[k].default_value = 0.18
            break
    if "Subsurface Radius" in b.inputs:
        b.inputs["Subsurface Radius"].default_value = (0.5, 0.35, 0.25)
    # A fine hand-pressed bump, as machine.py's materials carry.
    tex = m.node_tree.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = 38.0
    bump = m.node_tree.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.06
    m.node_tree.links.new(tex.outputs["Fac"], bump.inputs["Height"])
    m.node_tree.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def light(sc):
    w = bpy.data.worlds.new("w")
    sc.world = w
    w.use_nodes = True
    bg = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (0.78, 0.86, 0.95, 1)
    bg.inputs["Strength"].default_value = 0.4
    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = 4.2
    sun.angle = math.radians(9)
    sun.color = (1.0, 0.93, 0.82)
    so = bpy.data.objects.new("sun", sun)
    sc.collection.objects.link(so)
    so.rotation_euler = (math.radians(52), math.radians(-28), math.radians(-32))
    # A warm bounce from below, the grass and sand under the film's clouds.
    fill = bpy.data.lights.new("fill", "AREA")
    fill.energy = 120
    fill.size = 6
    fill.color = (1.0, 0.9, 0.75)
    fo = bpy.data.objects.new("fill", fill)
    sc.collection.objects.link(fo)
    fo.location = (0, -3, -2.5)
    fo.rotation_euler = (math.radians(-130), 0, 0)
    # A soft key on the face from the front left, so the text sits on an
    # evenly lit cream, not in the sun's falloff.
    key = bpy.data.lights.new("key", "AREA")
    key.energy = 260
    key.size = 5
    key.color = (1.0, 0.97, 0.92)
    ko = bpy.data.objects.new("key", key)
    sc.collection.objects.link(ko)
    ko.location = (-2.5, -6, 2.5)
    ko.rotation_euler = (math.radians(70), 0, math.radians(-22))


def camera(sc):
    cam = bpy.data.cameras.new("cam")
    cam.type = "ORTHO"
    cam.ortho_scale = 5.8
    co = bpy.data.objects.new("cam", cam)
    sc.collection.objects.link(co)
    # Straight at the face, a few degrees from above, so the puffs on top
    # read as round and the face stays a near-rectangle for the type.
    co.location = (0, -10, 1.0 + 10 * math.tan(math.radians(11)))
    co.rotation_euler = (math.radians(90 - 11), 0, 0)
    sc.camera = co


ONLY = os.environ.get("CLOUD_ONLY")
for i, shape in enumerate(SHAPES):
    if ONLY and str(i + 1) != ONLY:
        continue
    sc = reset()
    ob = cloud(shape, seed=11 + i)
    ob.data.materials.append(material())
    light(sc)
    camera(sc)
    sc.render.filepath = os.path.join(OUT, f"cloud-{i + 1}.png")
    bpy.ops.render.render(write_still=True)
    print("WROTE", sc.render.filepath)
