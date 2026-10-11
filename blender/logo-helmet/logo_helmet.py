"""TTS mark: the clay Trojan helmet, for Caleb to judge, not shipped.

  Blender -b --factory-startup -P blender/logo_helmet.py -- OUT.png [--res 1600] [--samples 64] [--turn 58]

A generic Corinthian helmet (not USC's Trojan head or any athletics mark),
built hard-surface: a dome cap meeting flat faceted plates at a proud brow
ridge, plates running down to pointed cheek guards, a flared neck guard.
It carries the TTS ideas Caleb chose on the flat sheets, 2026-10-10 into 11:

  TT      two bold T openings cut deep into the dark inside, each bar tucked
          under the brow ridge, each stem running down to the rim
  S       the back panel is its own piece of near-black clay, the same dark
          as the Ts, and its front edge is the S, right behind the second T
          and the same height, so T, T, S read as one word in one colour
  crest   one machined gold fin front to back, proud at the brow and swept
          past the neck, with a 2, 3, 1 neural network raised on its faces

What failed on the way, so nobody rebuilds it: a red ball, a toaster with
letters on it, a crewmate (a wide round body under a horizontal visor), an
egg (too tall, soft), a cooking pot (flat dome under a brow band), and
crests of balls on rods, which read as a molecule model ("So slop lmao").
The bar Caleb set at 1:35am: "so tuff like HOLY FUCK I WOULD WEAR that".

EEVEE renders three passes and composites them here: the mark on alpha, the
floor with the mark hidden from camera but casting shadow, and the floor
alone. Their ratio is the contact shadow, laid on #FCFAF8 so the background
is that exact colour with no visible floor edge.
"""

import math
import os
import struct
import sys
import zlib

import bmesh
import bpy
import numpy as np
from mathutils import Euler, Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(1, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # blender/logo.py
import logo as L  # noqa: E402

PAPER = (252, 250, 248)  # #FCFAF8, the page
FRAME_SHARE = 0.70  # the mark's longest side over the frame's
DARK = (0.17, 0.03, 0.035)  # #2B0709, the eye openings and the back panel
WALL = 0.8  # the hollow as a fraction of the body: walls about 0.2 thick

def arg(argv, name, default, cast):
    return cast(argv[argv.index(name) + 1]) if name in argv else default


def clay(name, color, rough=0.62, grain=0.2, lumps=0.14):
    """logo.py's clay with two scales of bump: a fine grain that reads as
    pressed clay, and slow lumps so it looks squeezed by hand."""
    m = L.clay(name, color, rough)
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    fine = next(n for n in nt.nodes if n.type == "TEX_NOISE")
    fine.inputs["Scale"].default_value = 140.0
    fine.inputs["Detail"].default_value = 6.0
    bump = next(n for n in nt.nodes if n.type == "BUMP")
    bump.inputs["Strength"].default_value = grain
    bump.inputs["Distance"].default_value = 0.02
    lump = nt.nodes.new("ShaderNodeTexNoise")
    lump.inputs["Scale"].default_value = 2.6
    lump.inputs["Detail"].default_value = 1.5
    bump2 = nt.nodes.new("ShaderNodeBump")
    bump2.inputs["Strength"].default_value = lumps
    bump2.inputs["Distance"].default_value = 0.06
    nt.links.new(lump.outputs["Fac"], bump2.inputs["Height"])
    nt.links.new(bump2.outputs["Normal"], bump.inputs["Normal"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def extrude(name, outline, axis, d0=-3.0, d1=3.0):
    """An outline (a, b) extruded from d0 to d1: along y for a side view
    (a = x, b = z), along x for a front view (a = y, b = z), along z for a
    top view (a = x, b = y)."""
    bm = bmesh.new()

    def at(a, b, d):
        return {"y": (a, d, b), "x": (d, a, b), "z": (a, b, d)}[axis]
    f = [bm.verts.new(at(a, b, d0)) for a, b in outline]
    k = [bm.verts.new(at(a, b, d1)) for a, b in outline]
    bm.faces.new(f)
    bm.faces.new(list(reversed(k)))
    for i in range(len(outline)):
        j = (i + 1) % len(outline)
        bm.faces.new((f[i], f[j], k[j], k[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


def apply(ob, mod):
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=mod.name)


def boolean(ob, other, op):
    b = ob.modifiers.new(op.lower(), "BOOLEAN")
    b.operation = op
    b.solver = "EXACT"
    if isinstance(other, bpy.types.Collection):
        b.operand_type = "COLLECTION"
        b.collection = other
    else:
        b.object = other
    apply(ob, b)


def tree_of(ob):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    t = BVHTree.FromBMesh(bm)
    bm.free()
    return t


def set_slots(ob, mats, index=0):
    """Replace an object's slots and point every face at one of them. The
    exact boolean leaves an empty slot 0 behind, which is why the body
    rendered white in the second and third stills: its faces pointed at
    nothing, and the red sat unused in slot 1."""
    ob.data.materials.clear()
    for m in mats:
        ob.data.materials.append(m)
    for p in ob.data.polygons:
        p.material_index = index


def ball(name, loc, radius, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc, segments=48, ring_count=24)
    ob = bpy.context.active_object
    ob.name = name
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(mat)
    return ob



# Hard-surface Corinthian. Caleb, 1:34 to 1:36am: "make it look like a
# helmet bruh", "so tuff like HOLY FUCK I WOULD WEAR that", and the bar he
# set, a famous bounty hunter's helmet: crisp planes and panel edges, one
# bold deep black T for a face, a contrasting trim around it, one piece of
# real equipment. The soft remeshed versions read as an egg, a pot and a
# crewmate. Here the dome is a cap that meets flat faceted plates at a hard
# brow ridge, the plates run down to pointed cheek guards, and the back
# flares into the neck guard. Units: Blender, face toward -x, cheek points
# near z = 0.

PLATES = [  # the lower shell seen from above: a prow at the face, flat sides
    (-0.97, 0.0), (-0.72, 0.8), (0.3, 0.92), (0.82, 0.68), (1.0, 0.0),
    (0.82, -0.68), (0.3, -0.92), (-0.72, -0.8),
]
BROW_Z = 1.24  # where the dome meets the plates
BOTTOM = [  # the lower edge seen from the side, back to front
    (2.0, 0.22), (1.02, 0.24), (0.72, 0.4), (0.34, 0.6), (0.12, 0.56),
    (-0.4, 0.2), (-1.02, -0.04), (-2.0, -0.04),
]
S_EDGE = [  # the back panel's front edge, the S, in (x, z)
    ((1.8, 1.1), (1.0, 1.1), (-0.1, 1.1), (-0.32, 1.1)),
    ((-0.32, 1.1), (-0.56, 1.1), (-0.66, 1.0), (-0.66, 0.88)),  # top bowl, round to the left
    ((-0.66, 0.88), (-0.66, 0.72), (-0.42, 0.72), (-0.34, 0.66)),  # the spine
    ((-0.34, 0.66), (-0.12, 0.58), (-0.1, 0.38), (-0.28, 0.3)),  # bottom bowl, round to the right
    ((-0.28, 0.3), (-0.4, 0.25), (-0.54, 0.24), (-0.62, 0.24)),
    ((-0.62, 0.24), (-0.62, 0.0), (-0.62, -0.5), (-0.62, -1.0)),
    ((-0.62, -1.0), (0.0, -1.0), (1.0, -1.0), (1.8, -1.0)),
    ((1.8, -1.0), (1.8, 0.0), (1.8, 0.5), (1.8, 1.1)),
]


def sample(segments, n=16):
    """Cubic segments in (x, z) to a closed polyline."""
    out = []
    for p0, p1, p2, p3 in segments:
        for k in range(n):
            t = k / n
            a, b, c, d = (1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3
            out.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return out


def plates():
    """The faceted lower shell: the top-view outline extruded down, its
    bottom ring pulled in at the cheeks and out at the neck, so every face
    is a flat plate leaning the way a Corinthian's does."""
    bm = bmesh.new()
    top = [bm.verts.new((x, y, BROW_Z + 0.06)) for x, y in PLATES]
    low = []
    for x, y in PLATES:
        if x > 0.5:  # the neck guard flares out
            low.append(bm.verts.new((x + 0.16, y * 1.04, -0.2)))
        else:  # the cheek guards close in toward the jaw
            low.append(bm.verts.new((x * 1.02, y * 0.8, -0.2)))
    bm.faces.new(list(reversed(top)))
    bm.faces.new(low)
    n = len(PLATES)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((top[i], top[j], low[j], low[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new("Helmet")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("Helmet", me)
    bpy.context.collection.objects.link(ob)
    return ob


def outer():
    """Plates, plus a dome cap above the brow, plus the brow ridge band,
    trimmed along the side profile's lower edge."""
    body = plates()
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=64, ring_count=32, location=(0.03, 0, BROW_Z))
    dome = bpy.context.active_object
    dome.scale = (1.02, 0.95, 0.6)  # 0.74 tall read as a hard hat
    bpy.ops.object.transform_apply(location=True, scale=True, rotation=False)
    cap = extrude("Cap", [(-3, BROW_Z), (3, BROW_Z), (3, 4), (-3, 4)], "y")
    boolean(dome, cap, "INTERSECT")
    bpy.data.objects.remove(cap)
    boolean(body, dome, "UNION")
    bpy.data.objects.remove(dome)
    # the brow ridge over the face only: a ring all the way round at 1.06
    # read as a hard hat's brim in the first hard-surface still
    band = extrude("Brow", [(x * 1.035 - 0.01, y * 1.035) for x, y in PLATES], "z", BROW_Z - 0.08, BROW_Z + 0.05)
    front = extrude("BrowFront", [(-3, -3), (0.1, -3), (0.1, 3), (-3, 3)], "z", -1, 4)
    boolean(band, front, "INTERSECT")
    bpy.data.objects.remove(front)
    boolean(body, band, "UNION")
    bpy.data.objects.remove(band)
    edge = extrude("Edge", BOTTOM + [(-2.0, 4.0), (2.0, 4.0)], "y")
    boolean(body, edge, "INTERSECT")
    bpy.data.objects.remove(edge)
    return body


def shell(red, dark):
    """The hollow helmet with the TT cut. Returns the outer solid's ray tree
    and the cut shell."""
    body = outer()
    tree = tree_of(body)
    set_slots(body, [red, dark], 0)
    cutters = bpy.data.collections.new("Cutters")
    bpy.context.scene.collection.children.link(cutters)

    def keep(ob):
        for c in ob.users_collection:
            c.objects.unlink(ob)
        cutters.objects.link(ob)
        set_slots(ob, [red, dark], 1)  # cut faces take the dark slot

    hollow = bpy.data.objects.new("Hollow", body.data.copy())
    bpy.context.collection.objects.link(hollow)
    hollow.scale = (0.8, 0.8, 0.86)
    hollow.location = (0.02, 0, -0.3)  # its bottom pushed out: the open rim
    bpy.context.view_layer.objects.active = hollow
    hollow.select_set(True)
    bpy.ops.object.transform_apply(location=True, scale=True, rotation=False)
    keep(hollow)
    # TT: each a single bold T, the bar tucked under the brow ridge and the
    # stem running down between the nose guard and the cheek guard
    for sign in (-1, 1):
        # the stem stops above the rim, so each cheek plate stays one plate
        # (stems to the rim split the face into three loose pillars)
        t = [(0.09, 1.13), (0.7, 1.13), (0.7, 0.88), (0.48, 0.88), (0.48, 0.26), (0.28, 0.26), (0.28, 0.88), (0.09, 0.88)]
        # cut deep into the front wall but not through it: through, the
        # camera looked out of the open bottom to the floor and the Ts read
        # as holes; a dark-floored recess reads as a solid black T
        keep(extrude(f"CutT{sign}", [(sign * y, z) for y, z in t], "x", -3.0, -0.74))
    # the chin notch: the two cheek guards end in points either side of it
    keep(extrude("CutChin", [(-0.2, -1.0), (0.2, -1.0), (0.0, 0.2)], "x", -3.0, -0.3))
    b = body.modifiers.new("cuts", "BOOLEAN")
    b.operation = "DIFFERENCE"
    b.operand_type = "COLLECTION"
    b.collection = cutters
    b.solver = "EXACT"
    try:
        b.material_mode = "INDEX"
    except (AttributeError, TypeError):
        pass
    apply(body, b)
    for ob in list(cutters.objects):
        bpy.data.objects.remove(ob)
    return tree, body


def dome_z(tree, x):
    hit, _, _, _ = tree.ray_cast(Vector((x, 0, 6)), Vector((0, 0, -1)))
    return hit.z


def crest_net(tree, gold, dark):
    """A machined gold fin, front to back over the dome: straight runs and
    hard angles, proud at the brow and swept back past the neck, with the
    2, 3, 1 network raised in shallow relief on both faces."""
    half = 0.12
    top = [(-0.62, 2.18), (-0.3, 2.56), (0.3, 2.6), (0.86, 2.3), (1.22, 1.9), (1.12, 1.78)]
    xs = [1.1 - (1.1 + 0.62) * k / 40 for k in range(41)]
    foot = [(x, dome_z(tree, max(min(x, 0.95), -0.9)) - 0.22) for x in xs]
    fin = extrude("Crest", top + foot, "y", -half, half)
    set_slots(fin, [gold], 0)
    bev = fin.modifiers.new("machined", "BEVEL")
    bev.width = 0.03
    bev.segments = 3
    bev.limit_method = "ANGLE"
    bev.angle_limit = math.radians(30)
    for p in fin.data.polygons:
        p.use_smooth = True
    w = fin.modifiers.new("normals", "WEIGHTED_NORMAL")
    w.keep_sharp = True
    parts = [fin]
    layers = [[(-0.28, 2.18), (-0.28, 2.38)], [(0.1, 2.12), (0.1, 2.3), (0.1, 2.48)], [(0.5, 2.3)]]
    for side in (-1, 1):
        y = side * half
        for a_layer, b_layer in zip(layers, layers[1:]):
            for ax, az in a_layer:
                for bx, bz in b_layer:
                    a, b = Vector((ax, y, az)), Vector((bx, y, bz))
                    d = b - a
                    bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=d.length, vertices=16, location=(a + b) / 2)
                    link = bpy.context.active_object
                    link.rotation_euler = Vector((0, 0, 1)).rotation_difference(d).to_euler()
                    link.scale = (1.0, 0.6, 1.0)
                    bpy.ops.object.shade_smooth()
                    link.data.materials.append(gold)
                    parts.append(link)
        for layer in layers:
            for x, z in layer:
                bpy.ops.mesh.primitive_cylinder_add(radius=0.052, depth=0.05, vertices=40, location=(x, y, z),
                                                    rotation=(math.pi / 2, 0, 0))
                node = bpy.context.active_object
                bv = node.modifiers.new("soft", "BEVEL")
                bv.width = 0.012
                bv.segments = 3
                bpy.ops.object.shade_smooth()
                node.data.materials.append(gold)
                parts.append(node)
    return parts


def split(body, dark):
    """The back panel as its own piece of dark clay, cut from the shell
    along the S; the skull keeps the rest. Hard edges, a soft clay bevel."""
    s_prism = extrude("SPrism", sample(S_EDGE), "y")
    panel = bpy.data.objects.new("BackPanel", body.data.copy())
    bpy.context.collection.objects.link(panel)
    boolean(panel, s_prism, "INTERSECT")
    boolean(body, s_prism, "DIFFERENCE")
    bpy.data.objects.remove(s_prism)
    set_slots(panel, [dark], 0)
    for ob in (body, panel):
        for p in ob.data.polygons:
            p.use_smooth = True
        bev = ob.modifiers.new("soft", "BEVEL")
        bev.width = 0.035
        bev.segments = 4
        bev.limit_method = "ANGLE"
        bev.angle_limit = math.radians(30)
        w = ob.modifiers.new("normals", "WEIGHTED_NORMAL")
        w.keep_sharp = True
    return body, panel


def mark_points(objs):
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in objs:
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        mw = ev.matrix_world
        pts += [mw @ v.co for v in list(me.vertices)[::7]]
        ev.to_mesh_clear()
    return pts


def frame(cam, objs, sc):
    """Move the camera along its view so the mark fills FRAME_SHARE of the
    frame, centred: solved from the mark's projected extent, not guessed."""
    from bpy_extras.object_utils import world_to_camera_view
    bpy.context.view_layer.update()
    pts = mark_points(objs)
    for _ in range(4):
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
    return cam


def set_engine(sc):
    for name in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            sc.render.engine = name
            return
        except TypeError:
            continue


def render(sc, path):
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    img = bpy.data.images.load(path)
    px = np.empty(len(img.pixels), dtype=np.float32)
    img.pixels.foreach_get(px)
    w, h = img.size
    bpy.data.images.remove(img)
    return px.reshape(h, w, 4)[::-1]


def write_png(path, rgb8):
    h, w, _ = rgb8.shape
    raw = b"".join(b"\x00" + rgb8[y].tobytes() for y in range(h))

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)))
        f.write(chunk(b"IDAT", zlib.compress(raw, 9)))
        f.write(chunk(b"IEND", b""))


def to_lin(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)




def main():
    argv = sys.argv[sys.argv.index("--") + 1:]
    out = argv[0]
    res = arg(argv, "--res", 1600, int)
    samples = arg(argv, "--samples", 64, int)
    turn = arg(argv, "--turn", 58.0, float)
    tip = arg(argv, "--tip", 0.0, float)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene

    red = clay("cardinal", L.CARDINAL)
    dark = clay("dark", DARK, 0.7, 0.16, 0.1)
    gold = clay("gold", L.GOLD, 0.45, 0.14, 0.1)

    tree, body = shell(red, dark)
    skull, panel = split(body, dark)
    beads = crest_net(tree, gold, dark)
    shown = [skull, panel] + beads

    # turned so the face looks left of the camera
    tilt = bpy.data.objects.new("Tilt", None)
    mark = bpy.data.objects.new("Mark", None)
    sc.collection.objects.link(tilt)
    sc.collection.objects.link(mark)
    for o in shown:
        o.parent = tilt
    tilt.parent = mark
    tilt.rotation_euler = Euler((0, math.radians(tip), 0))
    mark.rotation_euler = Euler((0, 0, math.radians(turn)))
    bpy.context.view_layer.update()
    mark.location.z = -min(p.z for p in mark_points([skull, panel]))

    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
    floor = bpy.context.active_object
    fm = bpy.data.materials.new("floor")
    fm.use_nodes = True
    next(n for n in fm.node_tree.nodes if n.type == "BSDF_PRINCIPLED").inputs["Roughness"].default_value = 1.0
    floor.data.materials.append(fm)

    cd = bpy.data.cameras.new("cam")
    cd.lens = 85
    cam = bpy.data.objects.new("cam", cd)
    sc.collection.objects.link(cam)
    cam.location = Vector((0.0, -11.0, 4.6))
    cam.rotation_euler = (Vector((0.0, 0.0, 1.05)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    sc.render.resolution_x = sc.render.resolution_y = res
    frame(cam, shown, sc)

    for name, energy, size, loc in (("key", 900, 5, (-4.5, -4.0, 6.5)), ("fill", 260, 8, (5.0, -4.5, 2.2)),
                                    ("rim", 300, 3, (2.5, 4.5, 4.0))):
        li = bpy.data.lights.new(name, "AREA")
        li.energy, li.size = energy, size
        ob = bpy.data.objects.new(name, li)
        ob.location = loc
        ob.rotation_euler = (Vector((0, 0, 1.0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        sc.collection.objects.link(ob)
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = L.srgb(L.CREAM)
    bg.inputs["Strength"].default_value = 0.55
    sc.world = world

    set_engine(sc)
    sc.eevee.taa_render_samples = samples
    for prop, val in (("use_raytracing", True), ("use_shadows", True), ("shadow_ray_count", 3),
                      ("shadow_step_count", 12)):
        if hasattr(sc.eevee, prop):
            setattr(sc.eevee, prop, val)
    sc.render.film_transparent = True
    sc.view_settings.view_transform = "Standard"
    sc.render.image_settings.file_format = "OPEN_EXR"
    sc.render.image_settings.color_depth = "32"

    tmp = os.path.splitext(out)[0]
    floor.visible_camera = False
    a = render(sc, tmp + "_mark.exr")
    floor.visible_camera = True
    for o in shown:
        o.visible_camera = False
    b = render(sc, tmp + "_shadow.exr")
    for o in shown:
        o.hide_render = True
    c = render(sc, tmp + "_floor.exr")

    # the contact shadow is how much darker the floor is with the mark there
    lum = np.array([0.2126, 0.7152, 0.0722])
    lb, lc = b[..., :3] @ lum, c[..., :3] @ lum
    ratio = np.where(lc > 1e-4, np.clip(lb / np.maximum(lc, 1e-4), 0, 1), 1.0)
    paper = to_lin(np.array(PAPER) / 255.0)
    under = paper[None, None, :] * ratio[..., None]
    alpha = np.clip(a[..., 3:4], 0, 1)
    rgb = a[..., :3] + (1 - alpha) * under  # EXR is premultiplied
    img = np.round(to_srgb(rgb) * 255).astype(np.uint8)
    write_png(out, np.ascontiguousarray(img))
    for p in ("_mark.exr", "_shadow.exr", "_floor.exr"):
        os.remove(tmp + p)
    print("WROTE", out)


if __name__ == "__main__":
    main()
