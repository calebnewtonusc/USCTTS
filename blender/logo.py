"""TTS mark, rendered in clay (Caleb, 2026-10-10: "a new logo clayXperplexityXusc").

Three readings of one idea, each rendered transparent at 1600px:

  arch   Clay's stacked rainbow arch in USC cardinal, gold and cream, with a
         two-stroke T standing in its opening over the USC dot.
  glyph  One puffy cardinal T over a gold dot, nothing else.
  stack  The arch only, three bands, for small sizes where the T would mush.

Run: Nalana -b --factory-startup -P blender/logo.py -- <variant> <out.png>
"""

import math
import sys

import bpy
from mathutils import Vector

CARDINAL = (0.60, 0.0, 0.0)
GOLD = (1.0, 0.80, 0.0)
CREAM = (0.98, 0.94, 0.86)
INK = (0.17, 0.07, 0.07)


def srgb(c):
    return tuple(x ** 2.2 for x in c) + (1.0,)


def clay(name, color, rough=0.62):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = srgb(color)
    bsdf.inputs["Roughness"].default_value = rough
    # A fine noise bump is what reads as hand-pressed clay at logo size; a
    # smooth surface reads as plastic.
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 70.0
    noise.inputs["Detail"].default_value = 6.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.22
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def tube(points, radius, mat, name):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 8
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    sp.points.add(len(points) - 1)
    for p, (x, y) in zip(sp.points, points):
        p.co = (x, 0.0, y, 1.0)
    ob = bpy.data.objects.new(name, cu)
    ob.data.materials.append(mat)
    bpy.context.collection.objects.link(ob)
    return ob


def ball(x, y, r, mat, name):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(x, 0.0, y), segments=48, ring_count=24)
    ob = bpy.context.active_object
    ob.name = name
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(mat)
    return ob


def arc(radius, steps=96):
    return [(radius * math.cos(math.pi * i / steps), radius * math.sin(math.pi * i / steps)) for i in range(steps + 1)]


def build_woven(m):
    # Caleb, 2026-10-10: "the middle of the t rises up through the white and
    # yellow, and then has short curvy rods that follow outward down the
    # yellow for a little bit". The bands make the arch; the T is ours: a stem
    # from the USC dot up through cream and gold, its arms riding the gold
    # band down each side.
    for name, r, mat in (("outer", 1.0, m["cardinal"]), ("mid", 0.72, m["gold"]), ("inner", 0.44, m["cream"])):
        tube(arc(r), 0.14, mat, name)
    # Caleb, 2026-10-10: "Make the T the same width of the yellow, as if part
    # of the yellow was black". The T's rod is the bands' own 0.14, and it sits
    # a hair in front of them, so its arms read as a stretch of the gold band
    # turned ink rather than a thinner stroke laid over it (it was 0.085).
    # And, 8:07pm: "The T should be fully visible none of the white should
    # block it". At 0.02 proud the cream band's front swallowed the stem's
    # foot; 0.16 proud puts the whole T in front of every band.
    rod = 0.14
    front = -0.16
    def at(points):
        return [(x, y) for x, y in points]
    stem = tube(at([(0.0, 0.2), (0.0, 0.72)]), rod, m["ink"], "stem")
    stem.location.y = front
    span = math.radians(30)
    steps = 24
    for side, sign in (("left", 1), ("right", -1)):
        pts = []
        for i in range(steps + 1):
            a = math.pi / 2 + sign * span * i / steps
            pts.append((0.72 * math.cos(a), 0.72 * math.sin(a)))
        arm = tube(pts, rod, m["ink"], f"arm_{side}")
        arm.location.y = front
    dot = ball(0.0, 0.06, 0.145, m["cardinal"], "usc")  # the dot keeps its size
    dot.location.y = front


def build_arch(m, with_t):
    # Three touching bands, outer to inner, like Clay's mark. Tube radius
    # 0.14 at 0.28 spacing makes them kiss without a gap.
    for name, r, mat in (("outer", 1.0, m["cardinal"]), ("mid", 0.72, m["gold"]), ("inner", 0.44, m["cream"])):
        tube(arc(r), 0.14, mat, name)
    if with_t:
        build_t(m, scale=0.26, base=0.0)


def build_t(m, scale, base):
    # Caleb, 2026-10-10: "Keep it simple tho". Two strokes and one dot: the
    # T's bar and stem in ink, and the USC dot at its foot.
    s = scale
    rod = 0.13 * s
    top = base + 1.0 * s
    tube([(-0.6 * s, top), (0.6 * s, top)], rod, m["ink"], "bar")
    tube([(0.0, top), (0.0, base + 0.3 * s)], rod, m["ink"], "stem")
    ball(0.0, base + 0.1 * s, rod * 1.6, m["cardinal"], "usc")


def slab(verts2d, depth, y0, mat, name):
    """A flat-faced extrusion of a 2D outline (x, z) between y0 and y0 +
    depth, with a hairline bevel so the edges read crisp, not soft."""
    import bmesh
    bm = bmesh.new()
    front = [bm.verts.new((x, y0, z)) for x, z in verts2d]
    back = [bm.verts.new((x, y0 + depth, z)) for x, z in verts2d]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    n = len(verts2d)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((front[i], front[j], back[j], back[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(mat)
    bpy.context.collection.objects.link(ob)
    bev = ob.modifiers.new("crisp", "BEVEL")
    bev.width = 0.008
    bev.segments = 2
    bev.limit_method = "ANGLE"
    return ob


def sector(r_mid, width, a0, a1, steps=96):
    """The outline of a band of the arch: an annular sector with flat ends."""
    ri, ro = r_mid - width / 2, r_mid + width / 2
    out = [(ro * math.cos(a0 + (a1 - a0) * i / steps), ro * math.sin(a0 + (a1 - a0) * i / steps))
           for i in range(steps + 1)]
    inn = [(ri * math.cos(a1 - (a1 - a0) * i / steps), ri * math.sin(a1 - (a1 - a0) * i / steps))
           for i in range(steps + 1)]
    return out + inn


def build_tech(m):
    """The engineered reading (Caleb, 8:08pm: "a bit more tech-y like the
    perplexity logo without making it crowded/ugly... I still want it to be
    simple"). The same three arches and T, drawn as one stroke weight: every
    band and stroke 0.2 wide with exact 0.08 gaps, flat cut ends, square
    sections, and the USC ball as a flat round node. Nothing added."""
    W, D = 0.2, 0.2
    for name, r, mat in (("outer", 1.0, m["cardinal"]), ("mid", 0.72, m["gold"]), ("inner", 0.44, m["cream"])):
        slab(sector(r, W, 0.0, math.pi), D, -D / 2, mat, name)
    front = -D / 2 - 0.06  # the T sits a step proud of every band
    span = math.radians(30)
    slab(sector(0.72, W, math.pi / 2 - span, math.pi / 2 + span, steps=32), D, front, m["ink"], "bar")
    top = 0.72 - W / 2 + 0.02
    slab([(-W / 2, 0.2), (W / 2, 0.2), (W / 2, top), (-W / 2, top)], D, front, m["ink"], "stem")
    bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=D, vertices=64, location=(0.0, front + D / 2, 0.07),
                                        rotation=(math.pi / 2, 0, 0))
    node = bpy.context.active_object
    node.name = "usc"
    node.data.materials.append(m["cardinal"])
    bev = node.modifiers.new("crisp", "BEVEL")
    bev.width = 0.008
    bev.segments = 2


def build_glyph(m):
    # One puffy cardinal T and the gold dot, nothing else.
    rod = 0.16
    top = 0.95
    tube([(-0.62, top), (0.62, top)], rod, m["cardinal"], "bar")
    tube([(0.0, top), (0.0, 0.32)], rod, m["cardinal"], "stem")
    ball(0.0, 0.08, rod * 1.05, m["gold"], "dot")


def stage(variant, out):
    sc = bpy.context.scene
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob)
    m = {
        "cardinal": clay("cardinal", CARDINAL),
        "gold": clay("gold", GOLD, 0.5),
        "cream": clay("cream", CREAM),
        "ink": clay("ink", INK, 0.45),
    }
    if variant == "woven":
        build_woven(m)
    elif variant == "tech":
        build_tech(m)
    elif variant == "arch":
        build_arch(m, True)
    elif variant == "stack":
        build_arch(m, False)
    else:
        build_glyph(m)
    # No floor: v2's shadow catcher rendered as an opaque white plane under
    # EEVEE, so the mark ships on a clean alpha.

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 85
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = Vector((0.0, -7.2, 1.9))
    look = Vector((0.0, 0.0, 0.5)) - cam.location
    cam.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam

    key = bpy.data.lights.new("key", "AREA")
    key.energy = 380
    key.size = 6
    k = bpy.data.objects.new("key", key)
    k.location = (-3.0, -4.0, 5.0)
    k.rotation_euler = (math.radians(50), 0, math.radians(-35))
    bpy.context.collection.objects.link(k)
    fill = bpy.data.lights.new("fill", "AREA")
    fill.energy = 110
    fill.size = 8
    f = bpy.data.objects.new("fill", fill)
    f.location = (4.0, -3.0, 2.0)
    f.rotation_euler = (math.radians(70), 0, math.radians(50))
    bpy.context.collection.objects.link(f)

    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = srgb(CREAM)
    bg.inputs["Strength"].default_value = 0.6
    sc.world = world

    try:
        sc.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError:
        sc.render.engine = "BLENDER_EEVEE"
    sc.render.film_transparent = True
    sc.render.resolution_x = 1600
    sc.render.resolution_y = 1600
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = "Standard"
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1 :]
    stage(args[0], args[1])
