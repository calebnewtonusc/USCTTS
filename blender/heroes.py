"""Home's hero stills: one clay object or scene per section, in its own colour world.

  Blender -b -P blender/heroes.py -- --hero world|mailbox|writer --out FILE.png [--res 2400] [--samples 160]

Caleb, 2026-10-10, on usctts.com beside clay.com: "Ours is so lame the clay one
is YAYYYYYY", and then "Why are we repeating the same thing 3x???" The full
machine now lives only in the /way film. Each home section gets its own scene,
built here, never a frame of the film:

  world    who we are   a clay LA at golden hour: hills, a downtown, palms, a
                        freeway, and USC's cardinal tower with the red dot
  mailbox  about us     a gold mailbox with its flag up, a sealed letter at its
                        foot, on blush: you ship real work to a real client
  writer   the TTS way  the cardinal typewriter drafting one letter beside the
                        waiting lead, on the opener's navy: a tease of the film

Materials are machine.clay in the v2 look. Light is one soft key with strong
contact shadows and a dim ambient tinted by the world. Every camera is solved
from its subject (spiderverse-style skill, "Tested in Blender": distance =
size x focal / (frame share x sensor height); guessed cameras cost every built
shot 0.1 to 0.2 in the replica study). Grain and a soft vignette are added after
the render by encode_heroes.py, in sRGB, where the eye judges them.
"""

import argparse
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import machine as M  # noqa: E402

M.LOOK["name"] = "v2"

# The page's palette, saturated for clay. Light and the warm occlusion darken a
# clay body by about a third, so the bodies sit brighter than the flat brand
# values (cardinal #990000, gold #FFCC00) the page uses for type.
PAL = {
    "card": "B4162E",
    "card_deep": "82101F",
    "gold": "FFC21A",
    "gold_deep": "E39B00",
    "cream": "FBF0DA",
    "paper": "FFF9EE",
    "tan": "E6CFA6",
    "ink": "2A1B1E",
    "sky": "6DB5EC",
    "leaf": "86B862",
    "leaf_deep": "4E9650",
    "coral": "EF8B76",
    "road": "E9DFD2",
    "blush": "F2C9BE",
    "navy": "1E2A44",
}


def clay(key, rough=0.55, bump=1.0):
    return M.clay(PAL[key], rough=rough, bump=bump)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    M._mats.clear()
    M._wobble_tex = None


# ---------------------------------------------------------------- parts, recoloured

# Nalana's part colours, as linear RGB, and what each becomes in a hero.
SRC = {
    "cream": (0.965, 0.913, 0.791),
    "orange": (1.0, 0.604, 0.0),
    "blue": (0.114, 0.392, 0.745),
    "blue_dark": (0.063, 0.246, 0.485),
    "navy": (0.048, 0.162, 0.301),
    "tan": (0.716, 0.644, 0.485),
    "wood": (0.784, 0.617, 0.402),
    "ink": (0.01, 0.007, 0.008),
    "purple": (0.474, 0.381, 0.672),
    "green": (0.347, 0.479, 0.323),
    "brass": (0.723, 0.402, 0.006),
}


def nearest_src(col):
    return min(SRC, key=lambda k: sum((a - b) ** 2 for a, b in zip(SRC[k], col[:3])))


def load_part(fname, cmap):
    """Append a part without machine.reskin, recolouring by nearest source colour."""
    path = os.path.join(M.PARTS, fname)
    with bpy.data.libraries.load(path, link=False) as (src, dst):
        dst.objects = src.objects
    coll = bpy.data.collections.new(fname.replace(".blend", ""))
    bpy.context.scene.collection.children.link(coll)
    objs = [o for o in dst.objects if o is not None]
    for o in objs:
        coll.objects.link(o)
        for m in o.modifiers:
            if m.type == "BEVEL" and getattr(m, "harden_normals", False):
                m.harden_normals = False
        if o.type not in {"MESH", "CURVE"}:
            continue
        for i, slot in enumerate(o.data.materials):
            col = (0.8, 0.8, 0.8)
            if slot and slot.use_nodes:
                b = next((n for n in slot.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
                if b:
                    col = tuple(b.inputs["Base Color"].default_value)
            o.data.materials[i] = clay(cmap.get(nearest_src(col), "cream"))
        if o.type == "CURVE" and not o.data.materials:
            o.data.materials.append(clay("ink"))
    return objs


def hold(root, location, scale, rot_z=0.0, ground=True):
    """Parent a part under an empty, its base centred on the empty's origin."""
    bpy.context.view_layer.update()
    mn, mx = M.world_bbox([root] + M.descendants(root))
    ctr = Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z if ground else (mn.z + mx.z) / 2))
    holder = bpy.data.objects.new(root.name + "_hold", None)
    M.link(holder)
    holder.location = location
    holder.rotation_euler = (0, 0, rot_z)
    holder.scale = (scale,) * 3
    mw = root.matrix_world.copy()
    root.parent = holder
    root.matrix_parent_inverse = Matrix.Translation(-ctr)
    root.matrix_basis = mw
    bpy.context.view_layer.update()
    return holder


# ---------------------------------------------------------------- set, light, camera

def sweep(key, depth=14.0, width=30.0, rise=9.0, radius=3.0, back=4.0):
    """A seamless studio sweep: floor running into a curved wall, one clay skin."""
    bm = bmesh.new()
    prof = []
    for i in range(12):
        prof.append((-depth + i * (depth + back) / 11, 0.0))
    for i in range(1, 17):
        a = (math.pi / 2) * i / 16
        prof.append((back + radius * math.sin(a), radius * (1 - math.cos(a))))
    for i in range(1, 8):
        prof.append((back + radius, radius + (rise - radius) * i / 7))
    cols = 40
    rows = []
    for x_i in range(cols + 1):
        x = -width / 2 + width * x_i / cols
        rows.append([bm.verts.new((x, y, z)) for y, z in prof])
    for a, b in zip(rows, rows[1:]):
        for j in range(len(prof) - 1):
            bm.faces.new((a[j], b[j], b[j + 1], a[j + 1]))
    ob = M.new_mesh_obj("Sweep", bm, clay(key, rough=0.7, bump=0.5))
    return ob


def world_fill(horizon, zenith, strength, camera_strength=None):
    """Ambient from a two-colour sky. Camera rays see camera_strength, so a sky
    can read bright while it lights the set dimly (the replica study's rule:
    the background must not be what lights the scene)."""
    sc = bpy.context.scene
    w = bpy.data.worlds.new("World")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    bg.inputs["Strength"].default_value = strength
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Incoming"], sep.inputs["Vector"])
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].position = 0.0
    cr.color_ramp.elements[0].color = M.hexcol(horizon)
    cr.color_ramp.elements[1].position = 0.2
    cr.color_ramp.elements[1].color = M.hexcol(zenith)
    # Incoming points back along the ray, toward the camera, so looking up
    # reads as negative Z: flip it, or the whole sky is the horizon colour
    # (the first world preview was all peach).
    up = nt.nodes.new("ShaderNodeMath")
    up.operation = "MULTIPLY"
    up.inputs[1].default_value = -1.0
    nt.links.new(sep.outputs["Z"], up.inputs[0])
    clampz = nt.nodes.new("ShaderNodeClamp")
    nt.links.new(up.outputs[0], clampz.inputs["Value"])
    nt.links.new(clampz.outputs["Result"], cr.inputs["Fac"])
    nt.links.new(cr.outputs["Color"], bg.inputs["Color"])
    out = next(n for n in nt.nodes if n.type == "OUTPUT_WORLD")
    if camera_strength is None:
        nt.links.new(bg.outputs[0], out.inputs["Surface"])
        return
    lp = nt.nodes.new("ShaderNodeLightPath")
    seen = nt.nodes.new("ShaderNodeBackground")
    seen.inputs["Strength"].default_value = camera_strength
    nt.links.new(cr.outputs["Color"], seen.inputs["Color"])
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs[0])
    nt.links.new(bg.outputs[0], mix.inputs[1])
    nt.links.new(seen.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])


def area_key(target, az, el, dist, size, power, color=(1.0, 0.96, 0.9)):
    """One soft key. A 1.4 unit square at 5 units gives a penumbra a few
    centimetres wide at the contact, which is what reads as a strong shadow."""
    li = bpy.data.lights.new("Key", "AREA")
    li.shape = "DISK"
    li.size = size
    li.energy = power
    li.color = color
    ob = bpy.data.objects.new("Key", li)
    M.link(ob)
    a, e = math.radians(az), math.radians(el)
    d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
    ob.location = Vector(target) + d * dist
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat("-Z", "Y").to_euler()
    return ob


def sun_key(az, el, power, angle=4.0, color=(1.0, 0.93, 0.82)):
    li = bpy.data.lights.new("Sun", "SUN")
    li.energy = power
    li.angle = math.radians(angle)
    li.color = color
    ob = bpy.data.objects.new("Sun", li)
    M.link(ob)
    a, e = math.radians(az), math.radians(el)
    d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
    ob.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
    return ob


def solved_camera(target, radius, az, el, lens, share, aspect, place_x=0.5, place_y=0.5,
                  fstop=2.8):
    """Solve the distance so a bounding sphere of `radius` fills `share` of the
    frame height, then shift the film so the subject lands at (place_x,
    place_y) of the frame instead of its centre."""
    sc = bpy.context.scene
    cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
    M.link(cam)
    sc.camera = cam
    cd = cam.data
    cd.lens = lens
    cd.sensor_fit = "HORIZONTAL"
    cd.sensor_width = 36.0
    sensor_h = 36.0 / aspect
    dist = (2 * radius) * lens / (share * sensor_h)
    a, e = math.radians(az), math.radians(el)
    d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
    target = Vector(target)
    cam.location = target + d * dist
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    # shift is in units of the frame's width
    cd.shift_x = -(place_x - 0.5)
    cd.shift_y = (place_y - 0.5) / aspect
    cd.dof.use_dof = True
    cd.dof.focus_distance = dist
    cd.dof.aperture_fstop = fstop
    cd.clip_end = 400
    return cam


def subject_bounds(objs):
    """Centre and radius of what the camera is solved for: the hero only,
    never the props around it, so one stray envelope cannot shrink the hero."""
    bpy.context.view_layer.update()
    mesh = []
    for o in objs:
        mesh += [x for x in [o] + M.descendants(o) if x.type == "MESH"]
    mn, mx = M.world_bbox(mesh)
    return (mn + mx) / 2, (mx - mn).length / 2


def setup_render(w, h, samples):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == "METAL"
    sc.cycles.device = "GPU"
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.015
    sc.cycles.use_denoising = True
    if hasattr(sc.cycles, "denoising_use_gpu"):
        sc.cycles.denoising_use_gpu = True
    sc.cycles.max_bounces = 8
    sc.cycles.diffuse_bounces = 4
    sc.cycles.sample_clamp_indirect = 4.0
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.render.use_compositing = False
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.exposure = 0.0
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    sc.render.image_settings.color_depth = "8"


# ---------------------------------------------------------------- props

def envelope(location, rot, scale=1.0, seal="card"):
    """A sealed letter: a cream slab, a flap seam, a wax seal."""
    holder = bpy.data.objects.new("Envelope", None)
    M.link(holder)
    holder.location = location
    holder.rotation_euler = rot
    holder.scale = (scale,) * 3
    body = M.rounded_box("EnvBody", (0.42, 0.028, 0.28), clay("paper", rough=0.7), bevel=0.012,
                         subdiv=1)
    body.parent = holder
    # the flap's two edges, a soft raised V
    for sgn in (-1, 1):
        f = M.rounded_box("EnvFlap", (0.25, 0.008, 0.012), clay("tan", rough=0.7), bevel=0.004,
                          location=(sgn * 0.1, -0.016, 0.06), subdiv=0)
        f.rotation_euler = (0, sgn * math.radians(-30), 0)
        f.parent = holder
    s = M.cylinder("EnvSeal", 0.042, 0.016, clay(seal, rough=0.4), location=(0, -0.02, 0.0),
                   axis="Y", bevel=0.006)
    s.parent = holder
    return holder


def ball(location, r=0.11, key="card"):
    return M.sphere("Lead", r, clay(key, rough=0.42), location=location)


# ---------------------------------------------------------------- heroes

def hero_writer(w, h):
    """The TTS way card: the cardinal typewriter drafting one letter, the lead
    waiting at its foot, on the opener's navy. Copy sits on the card's left, so
    the subject is placed at 64% across."""
    cmap = {"blue": "card", "blue_dark": "card_deep", "navy": "card_deep", "orange": "gold",
            "brass": "gold_deep", "cream": "cream", "tan": "tan", "wood": "tan", "ink": "ink",
            "purple": "card", "green": "leaf"}
    objs = load_part("writer.blend", cmap)
    root = M.root_of(objs, "Grp_LetterWritingMachine")
    k = 3.2
    holder = hold(root, (0, 0, 0), k, rot_z=math.radians(-8))
    # one letter rising from the roller, typed lines on it
    paper = M.rounded_box("Paper", (0.25, 0.004, 0.27), clay("paper", rough=0.75), bevel=0.003,
                          location=(0, 0.035, 0.36), subdiv=0)
    paper.rotation_euler = (math.radians(-14), 0, 0)
    paper.parent = holder
    for i, (wd, key) in enumerate([(0.17, "ink"), (0.19, "ink"), (0.13, "ink"), (0.09, "card")]):
        ln = M.rounded_box("Line", (wd, 0.003, 0.008), clay(key, rough=0.6), bevel=0.0015,
                           location=(-0.03 + wd / 2 - 0.07, 0.03 - 0.0, 0.43 - i * 0.03), subdiv=0)
        ln.rotation_euler = (math.radians(-14), 0, 0)
        ln.location.y = 0.035 - 0.0035 + (ln.location.z - 0.36) * math.tan(math.radians(14))
        ln.parent = holder
    ball((-0.62, -0.5, 0.11))
    sweep("navy")
    ctr, rad = subject_bounds([holder])
    # The key is small and close, so its light pools on the navy around the
    # machine and falls off to the card's dark left edge, where the copy sits.
    area_key(ctr, az=-30, el=50, dist=3.6, size=1.1, power=420, color=(1.0, 0.92, 0.8))
    # a cool rim from behind right, so a cardinal edge separates from navy
    rim = area_key(ctr, az=150, el=30, dist=4.0, size=1.6, power=160, color=(0.75, 0.85, 1.0))
    rim.name = "Rim"
    world_fill("26344F", "141B2C", 0.22)
    solved_camera(ctr, rad, az=16, el=15, lens=60, share=1.0, aspect=w / h, place_x=0.67,
                  place_y=0.5, fstop=2.2)


def hero_mailbox(w, h):
    """About us: a gold mailbox with its flag up, a sealed letter at its foot,
    on blush. Square-ish frame beside the copy, subject centred."""
    cmap = {"purple": "gold", "orange": "card", "cream": "cream", "blue": "card", "ink": "ink",
            "tan": "tan", "brass": "gold_deep", "green": "leaf"}
    objs = load_part("mailbox.blend", cmap)
    root = M.root_of(objs, "Cute toy mailbox assembly")
    holder = hold(root, (0, 0, 0), 2.7, rot_z=math.radians(12))
    # The part's door rests open. A sealed letter lies on it, half inside: the
    # work is going out to the client, which is what the about copy says.
    envelope((0.13, -0.6, 0.985), (math.radians(-90), 0, math.radians(12)), 0.78)
    envelope((-0.5, -0.38, 0.013), (math.radians(-90), 0, math.radians(24)), 0.85, seal="gold_deep")
    sweep("blush")
    ctr, rad = subject_bounds([holder])
    area_key(ctr, az=-40, el=50, dist=4.2, size=1.2, power=300, color=(1.0, 0.95, 0.88))
    world_fill("F8DCD2", "F2C6BA", 0.6)
    # share is of the bounding sphere's diameter, which is wider than the
    # mailbox is tall: 0.9 left it at 55% of the frame height
    solved_camera(ctr, rad, az=28, el=12, lens=70, share=1.2, aspect=w / h, place_x=0.52,
                  place_y=0.5, fstop=2.8)


def terrain_h(x, y):
    """The LA world's ground: back hills, gentle rolls, two flats for buildings."""
    z = 0.0
    # back hills far and low enough to leave the top third of the frame to
    # sky: at y 13 to 15 and 3.6 high they walled off the horizon
    for cx, cy, a, s in [(-7, 18, 2.2, 3.6), (-1.5, 20, 1.9, 3.4), (4.5, 18.5, 2.5, 3.8),
                         (10, 20, 2.1, 4.0), (-12, 19, 1.8, 3.6)]:
        z += a * math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * s * s))
    z += 0.18 * math.sin(x * 0.55 + 0.8) * math.cos(y * 0.45) + 0.1 * math.sin(x * 1.3 + y * 0.9)
    for cx, cy, r in [(0.6, 4.2, 2.4), (-2.5, 0.9, 1.5)]:
        d = math.hypot(x - cx, y - cy)
        k = min(1.0, max(0.0, (d - r) / 1.2))
        k = k * k * (3 - 2 * k)
        z = z * k + 0.05 * (1 - k)
    return z


def hero_world(w, h):
    """Who we are: a small clay LA at golden hour, the one big joyful scene on
    home. USC's cardinal tower and the red dot sit on the left flat, downtown
    on the right, a freeway joins them, the hills behind."""
    rnd = random.Random(11)
    # ground
    bm = bmesh.new()
    nx, ny = 200, 150
    x0, x1, y0, y1 = -22.0, 22.0, -16.0, 24.0
    grid = []
    for j in range(ny + 1):
        y = y0 + (y1 - y0) * j / ny
        grid.append([bm.verts.new((x0 + (x1 - x0) * i / nx, y, terrain_h(x0 + (x1 - x0) * i / nx, y)))
                     for i in range(nx + 1)])
    for j in range(ny):
        for i in range(nx):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    M.new_mesh_obj("Ground", bm, clay("leaf", rough=0.65, bump=1.4))
    # the two flats, a cream plaza downtown and a lawn edge on campus
    pl = M.cylinder("Plaza", 2.25, 0.08, clay("cream", rough=0.7), location=(0.6, 4.2, 0.07), bevel=0.04)
    pl.scale = (1.0, 0.8, 1.0)
    M.cylinder("Campus", 1.35, 0.07, clay("tan", rough=0.7), location=(-2.5, 0.9, 0.065), bevel=0.035)
    # downtown: Nalana's eight buildings, recoloured, plus four towers
    cmap = {"orange": "gold", "green": "leaf_deep", "blue": "sky", "cream": "cream", "ink": "ink"}
    objs = load_part("city.blend", cmap)
    blds = sorted([o for o in objs if o.name.startswith("Building_") and o.type == "EMPTY"
                   and not (o.parent and o.parent.name.startswith("Building_"))], key=lambda o: o.name)
    spots = [(-0.9, 3.2), (-0.2, 2.9), (1.5, 3.0), (2.2, 3.6), (-1.2, 4.3), (2.4, 4.6), (-0.4, 5.3), (1.7, 5.4)]
    for b, (bx, by) in zip(blds, spots):
        hold(b, (bx, by, 0.11), 8.5, rot_z=rnd.uniform(-0.25, 0.25))
    for (tx, ty, th, key) in [(0.2, 4.0, 2.3, "cream"), (0.95, 4.5, 3.0, "coral"), (0.55, 5.2, 1.8, "sky"),
                              (1.35, 3.85, 1.5, "gold")]:
        M.rounded_box("Tower", (0.5, 0.5, th), clay(key), bevel=0.06, location=(tx, ty, 0.11 + th / 2))
        M.rounded_box("TowerCap", (0.36, 0.36, 0.08), clay("cream" if key != "cream" else "tan"),
                      bevel=0.03, location=(tx, ty, 0.11 + th + 0.04))
    # USC: a cardinal campanile, two halls with cardinal roofs, the red dot
    cx, cy = -2.5, 0.9
    M.rounded_box("Campanile", (0.3, 0.3, 1.5), clay("cream"), bevel=0.04, location=(cx, cy + 0.2, 0.1 + 0.75))
    M.rounded_box("Belfry", (0.36, 0.36, 0.22), clay("card"), bevel=0.04, location=(cx, cy + 0.2, 1.71))
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=0.27, radius2=0.0, depth=0.42)
    sp = M.new_mesh_obj("Spire", bm, clay("card_deep"), smooth_shade=False)
    sp.location = (cx, cy + 0.2, 2.03)
    sp.rotation_euler = (0, 0, math.pi / 4)
    for (hx, hy, hw) in [(cx - 0.75, cy - 0.15, 0.9), (cx + 0.7, cy - 0.3, 0.75)]:
        M.rounded_box("Hall", (hw, 0.5, 0.42), clay("cream"), bevel=0.04, location=(hx, hy, 0.1 + 0.21))
        M.rounded_box("HallRoof", (hw + 0.08, 0.58, 0.1), clay("card"), bevel=0.04, location=(hx, hy, 0.57))
    M.sphere("Dot", 0.14, clay("card", rough=0.35), location=(cx, cy + 0.2, 2.65))
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=0.12, radius2=0.0, depth=0.26)
    pin = M.new_mesh_obj("PinTip", bm, clay("card", rough=0.35))
    pin.location = (cx, cy + 0.2, 2.48)
    pin.rotation_euler = (math.pi, 0, 0)
    # the freeway from the foreground through campus into downtown, gold dashes down it
    pts = [Vector(p) for p in [(4.5, -6.5, 0), (2.2, -3.2, 0), (-0.6, -1.4, 0), (-1.2, 0.6, 0),
                               (-0.8, 2.2, 0), (0.6, 2.4, 0)]]
    axis = M.catmull(pts, per_unit=24)
    bm = bmesh.new()
    left, right = [], []
    hw = 0.26
    for i, p in enumerate(axis):
        q = axis[min(i + 1, len(axis) - 1)] - axis[max(i - 1, 0)]
        n = Vector((-q.y, q.x, 0)).normalized()
        for side, lst in ((1, left), (-1, right)):
            v = p + n * hw * side
            lst.append(bm.verts.new((v.x, v.y, terrain_h(v.x, v.y) + 0.035)))
    for i in range(len(axis) - 1):
        bm.faces.new((left[i], right[i], right[i + 1], left[i + 1]))
    road = M.new_mesh_obj("Freeway", bm, clay("road", rough=0.7))
    sol = road.modifiers.new("thick", "SOLIDIFY")
    sol.thickness = 0.05
    for i in range(0, len(axis) - 4, 7):
        p, q = axis[i], axis[i + 2]
        d = q - p
        dash = M.rounded_box("Dash", (0.04, 0.16, 0.015), clay("gold", rough=0.5), bevel=0.006, subdiv=0,
                             location=(p.x, p.y, terrain_h(p.x, p.y) + 0.07))
        dash.rotation_euler = (0, 0, math.atan2(d.y, d.x) - math.pi / 2)
    # palms
    for (px, py, ph) in [(-3.6, 0.3, 1.5), (-1.3, 1.6, 1.25), (2.6, -1.3, 1.7), (3.25, -0.5, 1.35),
                         (-0.9, -2.5, 1.45), (3.9, 2.1, 1.6), (-4.4, 2.6, 1.3)]:
        gz = terrain_h(px, py)
        lean = rnd.uniform(-0.12, 0.12)
        tr = M.cylinder("Trunk", 0.04, ph, clay("tan", rough=0.7), location=(px, py, gz + ph / 2), bevel=0.01)
        tr.rotation_euler = (lean, rnd.uniform(-0.1, 0.1), 0)
        top = Vector((px, py, gz)) + tr.matrix_basis.to_3x3() @ Vector((0, 0, ph))
        for f in range(8):
            a = f * math.tau / 8 + rnd.uniform(-0.2, 0.2)
            fr = M.sphere("Frond", 0.1, clay("leaf_deep", rough=0.55))
            fr.scale = (2.9, 0.75, 0.32)
            fr.location = top + Vector((math.cos(a) * 0.24, math.sin(a) * 0.24, -0.05))
            fr.rotation_euler = (0, math.radians(24), a)
        M.sphere("Crown", 0.07, clay("tan"), location=top)
    # bushes along the hills and the plaza edge
    for _ in range(26):
        bx, by = rnd.uniform(-9, 9), rnd.uniform(-3, 9)
        if math.hypot(bx - 0.6, by - 4.2) < 2.5 or math.hypot(bx + 2.5, by - 0.9) < 1.6:
            continue
        r = rnd.uniform(0.14, 0.3)
        M.sphere("Bush", r, clay(rnd.choice(["leaf_deep", "leaf"])), location=(bx, by, terrain_h(bx, by) + r * 0.6))
    # a far ridge in a hazy blue-green, the one cue of distance in the frame
    bm = bmesh.new()
    ridge = []
    for i in range(121):
        x = -30 + 60 * i / 120
        z = 2.6 + 0.9 * math.sin(x * 0.21 + 1.3) + 0.5 * math.sin(x * 0.53)
        ridge.append((bm.verts.new((x, 30, -1)), bm.verts.new((x, 30, z))))
    for (a0, a1), (b0, b1) in zip(ridge, ridge[1:]):
        bm.faces.new((a0, b0, b1, a1))
    M.new_mesh_obj("Ridge", bm, M.clay("9CC4B4", rough=0.8, bump=0.3))
    # three clay clouds; no sun disc, since the key comes from in front
    for (cx_, cz_, s_) in [(-6.5, 5.6, 1.0), (1.5, 6.6, 0.8), (10.0, 5.2, 0.9)]:
        for (ox, oz, r) in [(0, 0, 0.62), (0.7, -0.1, 0.48), (-0.7, -0.12, 0.5), (0.3, 0.32, 0.45)]:
            M.sphere("Cloud", r * s_, clay("paper", rough=0.75), location=(cx_ + ox * s_, 24.0, cz_ + 1.4 + oz * s_))
    # golden hour: a low warm sun from the left, a peach-to-blue sky that fills
    sun_key(az=-62, el=17, power=4.6, angle=3.0, color=(1.0, 0.86, 0.68))
    world_fill("FFCFA0", "7FBDEB", 0.42, camera_strength=1.0)
    # Low and level, so the hills, the sun and the sky are in the frame: the
    # first solve at 14 degrees looked down on a green map with no horizon.
    solved_camera((0.2, 3.2, 1.4), 3.4, az=4, el=6, lens=35, share=0.95, aspect=w / h, place_x=0.5,
                  place_y=0.5, fstop=5.6)


HEROES = {"world": (hero_world, 2.0), "mailbox": (hero_mailbox, 4 / 3), "writer": (hero_writer, 16 / 9)}


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--hero", required=True, choices=list(HEROES))
    ap.add_argument("--out", required=True)
    ap.add_argument("--res", type=int, default=0, help="width; default is 2x the largest display size")
    ap.add_argument("--samples", type=int, default=160)
    ap.add_argument("--save", default="", help="also save the .blend here")
    a = ap.parse_args(argv)
    fn, aspect = HEROES[a.hero]
    # 2x the widest the page draws each one (docs/INTENT-home.md)
    default_w = {"world": 2400, "mailbox": 1440, "writer": 2400}[a.hero]
    w = a.res or default_w
    h = int(round(w / aspect / 2) * 2)
    reset()
    fn(w, h)
    setup_render(w, h, a.samples)
    if a.save:
        bpy.ops.wm.save_as_mainfile(filepath=a.save)
    sc = bpy.context.scene
    sc.render.filepath = a.out
    bpy.ops.render.render(write_still=True)
    print("WROTE", a.out, w, h)


if __name__ == "__main__":
    main()
