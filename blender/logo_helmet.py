"""TTS mark: the clay Trojan helmet, for Caleb to judge, not shipped.

  Blender -b --factory-startup -P blender/logo_helmet.py -- OUT.png [--res 1600] [--samples 64] [--turn 40]

Built from the flat silhouette Caleb picked on 2026-10-11 ("TTS helmet A5",
version a with the node chain crest, 12:52am: "I like the new dark back ones
you made"). The flat sheets are where every part was decided:

  body    a generic Corinthian-style helmet (not USC's Trojan head or any
          athletics mark). Its side profile is the approved silhouette
          traced point for point: round dome, flared neck guard, ear
          cut-out, a cheek guard ending in a point. Met with a front view
          that tapers toward the jaw and a rounded top view, then remeshed
          and smoothed into puffy clay. Hollow, open at the bottom.
  TT      the face: a T per eye, each eye slit a bar with its stem running
          down into the clean arch between the cheek guards, cut through
          the front wall into the dark inside
  S       the back panel is its own piece of near-black clay, the same dark
          as the eye openings, and its front edge is the S: so T, T and S
          read as one colour, one system
  crest   the node chain: four gold clay beads on fat rods running front
          to back along the top centerline, each rooted into the dome

Earlier versions read as a red ball, then a toaster with letters on it: a
sphere has no helmet silhouette, and letters cut into a flat face are not
anatomy. Caleb's notes along the way, in order: "simpler and more stupid
literally look at the clay logo", "The bottom should be a hole", "2 t's that
look like a tuff helmet", "the S needs to be tuffer", "Still simplistic like
the clay logo!", "the S needs to look nuanced tho not forced in", "Gotta keep
the whole thing square", "I want it to be an actual helmet", "Gotta keep it
simple tho like the clay logo".

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
import logo as L  # noqa: E402

PAPER = (252, 250, 248)  # #FCFAF8, the page
FRAME_SHARE = 0.70  # the mark's longest side over the frame's
DARK = (0.17, 0.03, 0.035)  # #2B0709, the eye openings and the back panel
WALL = 0.8  # the hollow as a fraction of the body: walls about 0.2 thick

# The approved flat silhouette, in its SVG units (x toward the back, y
# down). SVG_SCALE maps it to Blender units with the cheek point on z = 0.
SVG_SCALE, SVG_X0, SVG_Y0 = 220.0, 330.0, 546.0
SIDE = [  # the body's side profile as cubic segments
    ((120, 290), (120, 168), (226, 112), (330, 112)),
    ((330, 112), (444, 112), (500, 196), (497, 300)),
    ((497, 300), (495, 356), (510, 400), (556, 440)),  # down into the neck flare
    ((556, 440), (528, 456), (478, 454), (446, 442)),
    ((446, 442), (436, 410), (420, 386), (392, 382)),  # the ear cut-out
    ((392, 382), (362, 380), (352, 406), (352, 436)),
    ((352, 436), (352, 474), (326, 506), (292, 536)),  # cheek guard to its point
    ((292, 536), (250, 532), (200, 526), (166, 520)),  # the jaw
    ((166, 520), (138, 470), (118, 400), (120, 290)),  # up the front
]
# The S is larger and further forward than on the flat sheet: the flat
# 3/4 drawing shows the side wider than a real 3/4 turn does, and at the
# sheet's size the back edge clipped the S's top bowl in the second still.
S_EDGE = [  # the back panel's front edge, the S
    ((640, 188), (580, 188), (500, 188), (440, 188)),
    ((440, 188), (370, 188), (296, 198), (296, 240)),
    ((296, 240), (296, 286), (378, 282), (410, 292)),
    ((410, 292), (470, 308), (490, 336), (480, 360)),
    ((480, 360), (470, 384), (420, 388), (386, 390)),
    ((386, 390), (386, 500), (386, 600), (386, 700)),
    ((386, 700), (500, 700), (600, 700), (700, 700)),
    ((700, 700), (700, 500), (700, 300), (640, 188)),
]


def arg(argv, name, default, cast):
    return cast(argv[argv.index(name) + 1]) if name in argv else default


def svg_to_xz(p):
    return ((p[0] - SVG_X0) / SVG_SCALE, (SVG_Y0 - p[1]) / SVG_SCALE)


def sample(segments, n=16):
    """Cubic segments in SVG units to a closed polyline in (x, z)."""
    out = []
    for p0, p1, p2, p3 in segments:
        for k in range(n):
            t = k / n
            a, b, c, d = (1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3
            out.append(svg_to_xz((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
                                  a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1])))
    return out


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


def squircle(cx, ax, ay, steps=72, p=2.4):
    out = []
    for k in range(steps):
        t = 2 * math.pi * k / steps
        c, s = math.cos(t), math.sin(t)
        out.append((cx + ax * math.copysign(abs(c) ** (2 / p), c), ay * math.copysign(abs(s) ** (2 / p), s)))
    return out


def front_outline(hw=0.9, top=2.06, shoulder=1.05):
    """Seen from the front: cheek guards tapering toward the jaw under a
    squared dome."""
    pts = [(-0.7, -0.2), (0.7, -0.2), (hw, 0.8)]
    for k in range(41):
        t = math.pi * k / 40
        c, s = math.cos(t), math.sin(t)
        pts.append((hw * math.copysign(abs(c) ** (2 / 2.1), c), shoulder + (top - shoulder) * abs(s) ** (2 / 2.1)))
    pts.append((-hw, 0.8))
    return pts


def outer():
    """The outer clay solid: the side silhouette met with an ellipsoid, then
    a voxel remesh and a long smooth for fat soft edges. The ellipsoid rounds
    the dome every way and tapers the cheek guards toward the jaw; meeting
    the side with flat front and top extrusions instead left square
    shoulders, and the second still read as a box."""
    body = extrude("Helmet", sample(SIDE), "y")
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=96, ring_count=48, location=(0.05, 0, 0.85))
    egg = bpy.context.active_object
    egg.scale = (1.25, 0.95, 1.25)
    bpy.ops.object.transform_apply(location=True, scale=True, rotation=False)
    boolean(body, egg, "INTERSECT")
    bpy.data.objects.remove(egg)
    r = body.modifiers.new("remesh", "REMESH")
    r.mode = "VOXEL"
    r.voxel_size = 0.022
    apply(body, r)
    s = body.modifiers.new("puff", "SMOOTH")
    s.factor = 1.0
    s.iterations = 30
    apply(body, s)
    return body


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


def shell(red, dark):
    """The hollow helmet with its face cut: returns the outer solid's ray
    tree (for seating the crest) and the cut shell."""
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
    hollow.scale = (WALL, WALL * 0.97, WALL * 1.02)
    hollow.location = (-0.02, 0, -0.32)  # its bottom pushed out: the open rim
    bpy.context.view_layer.objects.active = hollow
    hollow.select_set(True)
    bpy.ops.object.transform_apply(location=True, scale=True, rotation=False)
    keep(hollow)
    # a T per eye: the bar is the eye slit, the stem runs down into the arch
    for sign in (-1, 1):
        def ys(a, b):
            return (sign * a, sign * b) if sign > 0 else (sign * b, sign * a)
        b0, b1 = ys(0.07, 0.6)
        s0, s1 = ys(0.24, 0.42)
        keep(extrude(f"CutBar{sign}", [(b0, 1.1), (b1, 1.1), (b1, 1.32), (b0, 1.32)], "x", -3.0, -0.3))
        keep(extrude(f"CutStem{sign}", [(s0, -0.3), (s1, -0.3), (s1, 1.14), (s0, 1.14)], "x", -3.0, -0.3))
    # the clean arch between the cheek guards
    arch = [(-0.5, -0.4), (0.5, -0.4)]
    for k in range(25):
        t = math.pi * k / 24
        arch.append((0.5 * math.cos(t), 0.0 + 0.42 * math.sin(t)))
    keep(extrude("CutArch", arch, "x", -3.0, -0.2))
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


def split(body, dark):
    """The back panel as its own piece of dark clay, cut from the shell
    along the S; the skull keeps the rest."""
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
        bev.width = 0.03
        bev.segments = 3
        bev.limit_method = "ANGLE"
        bev.angle_limit = math.radians(40)
    return body, panel


def ball(name, loc, radius, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc, segments=48, ring_count=24)
    ob = bpy.context.active_object
    ob.name = name
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(mat)
    return ob


def rod(name, a, b, radius, mat):
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=d.length, vertices=32, location=(a + b) / 2)
    ob = bpy.context.active_object
    ob.name = name
    ob.rotation_euler = Vector((0, 0, 1)).rotation_difference(d).to_euler()
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(mat)
    bev = ob.modifiers.new("soft", "BEVEL")
    bev.width = radius * 0.5
    bev.segments = 4
    return ob


def crest(tree, gold, dark, face_dir):
    """The node chain: four gold beads on fat rods along the top
    centerline, front to back, shrinking, each half sunk into the dome. No
    dots: dark dots on gold beads read as googly eyes in the first still."""
    stops = [(-0.6, 0.2), (-0.14, 0.18), (0.32, 0.155), (0.7, 0.13)]
    centres = []
    for x, r in stops:
        hit, nrm, _, _ = tree.ray_cast(Vector((x, 0, 6)), Vector((0, 0, -1)))
        centres.append((hit + nrm * r * 0.4, r))
    parts = []
    for i, ((a, ra), (b, rb)) in enumerate(zip(centres, centres[1:])):
        parts.append(rod(f"Rod{i}", a, b, min(ra, rb) * 0.48, gold))
    for i, (c, r) in enumerate(centres):
        parts.append(ball(f"Bead{i}", c, r, gold))
    return parts


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
    turn = arg(argv, "--turn", 34.0, float)
    tip = arg(argv, "--tip", 4.0, float)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene

    red = clay("cardinal", L.CARDINAL)
    dark = clay("dark", DARK, 0.7, 0.16, 0.1)
    gold = clay("gold", L.GOLD, 0.45, 0.14, 0.1)

    tree, body = shell(red, dark)
    skull, panel = split(body, dark)
    # toward the camera in the helmet's own frame, a little up
    face_dir = Vector((-math.sin(math.radians(turn)), -math.cos(math.radians(turn)), 0.35)).normalized()
    beads = crest(tree, gold, dark, face_dir)
    shown = [skull, panel] + beads

    # tipped back a few degrees on the neck guard so the open rim shows
    # under the chin, then turned so the face looks left of the camera
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
