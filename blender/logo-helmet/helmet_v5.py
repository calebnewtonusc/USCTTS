"""TTS helmet v5, built live in Nalana on top of logo_helmet.py's scene.

Caleb at 2:01am on v4: no helmet read, no S, a jumbled network, girthy Ts,
wants pointier bottoms with the T stems leaning in, and a smaller crest so
the whole thing stays square. Local units: face toward -x, y across, z up.
"""

import math

import bmesh
import bpy
from mathutils import Vector

import logo_helmet as H

BROW = 1.12
DOME = (1.04, 1.0, 0.76)  # the skull: tall enough to read as a head, not a pot lid
PLATES = [  # the lower shell from above: a prow at the face, flat sides
    (-0.98, 0.0), (-0.72, 0.8), (0.3, 0.93), (0.84, 0.7), (1.02, 0.0),
    (0.84, -0.7), (0.3, -0.93), (-0.72, -0.8),
]
SIDE = [  # lower edge seen from the side, back to front: neck flare, jaw, cheek point
    (2.0, -0.1), (1.14, -0.1), (0.8, 0.06), (0.32, 0.12), (-0.1, 0.06),
    (-0.5, -0.12), (-0.86, -0.32), (-2.0, -0.32),
]
FRONT = [  # lower edge seen from the front: two cheek points either side of the chin notch
    (-3.0, 0.04), (-0.92, -0.02), (-0.42, -0.32), (0.0, 0.04), (0.42, -0.32),
    (0.92, -0.02), (3.0, 0.04),
]
# one T, the +y one: bar under the brow, stem leaning in toward the nose
T = [(0.07, 0.92), (0.64, 0.92), (0.64, 0.79), (0.45, 0.79), (0.32, 0.18),
     (0.18, 0.18), (0.31, 0.79), (0.07, 0.79)]
T_FLOOR = -0.6  # the recess floor, so each T is a dark pocket, not a hole
X_PANEL = 0.16  # where the dark back panel starts
Z_TOP = 0.92  # T, S and panel all top out here
STROKE = 0.14  # same weight as the T bars


def s_centerline(n=24):
    """The S, top terminal running back into the panel, in (x, z) with +x
    toward the back (the right of the frame)."""
    h = STROKE / 2
    top, bot = Z_TOP - h, 0.18 + h
    mid = (top + bot) / 2
    ry = (top - mid) / 2
    cx, rx = -0.3, 0.19
    pts = [(X_PANEL + 0.06, top), (cx + 0.05, top)]
    c1 = mid + ry
    for k in range(n + 1):  # top bowl, round through the front (left)
        a = math.pi / 2 + math.pi * k / n
        pts.append((cx + rx * math.cos(a), c1 + ry * math.sin(a)))
    c2 = mid - ry
    for k in range(1, n + 1):  # bottom bowl, round through the back (right)
        a = math.pi / 2 - math.pi * k / n
        pts.append((cx + rx * math.cos(a), c2 + ry * math.sin(a)))
    pts.append((cx - 0.17, bot))
    return pts


def offset_outline(pts, w):
    """A polyline thickened to a closed outline of width w."""
    left, right = [], []
    for i, (x, z) in enumerate(pts):
        a = Vector(pts[max(i - 1, 0)])
        b = Vector(pts[min(i + 1, len(pts) - 1)])
        d = (b - a).normalized()
        nrm = Vector((-d.y, d.x))
        left.append((x + nrm.x * w / 2, z + nrm.y * w / 2))
        right.append((x - nrm.x * w / 2, z - nrm.y * w / 2))
    return left + list(reversed(right))


def ring_on_dome(k=0.995):
    """The octagon's corners pushed onto the dome's equator, so skull and
    plates meet flush and only the brow stands proud."""
    out = []
    for x, y in PLATES:
        a = math.atan2(y / DOME[1], (x - 0.04) / DOME[0])
        out.append((0.04 + DOME[0] * k * math.cos(a), DOME[1] * k * math.sin(a)))
    return out


def plates():
    bm = bmesh.new()
    ring = ring_on_dome()
    top = [bm.verts.new((x, y, BROW + 0.04)) for x, y in ring]
    low = []
    for x, y in ring:
        if x > 0.5:  # neck flare
            low.append(bm.verts.new((x + 0.26, y * 1.08, -0.4)))
        else:  # cheeks close in toward the jaw, flat hard planes
            low.append(bm.verts.new((x * 1.02, y * 0.8, -0.4)))
    bm.faces.new(list(reversed(top)))
    bm.faces.new(low)
    n = len(ring)
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


def brow():
    """A sloped ridge over the eyes: proud at its lower edge, flush with the
    skull at its top, so it reads as a brow and not a hat brim."""
    bm = bmesh.new()
    ring = ring_on_dome(1.0)
    lo = [bm.verts.new((0.04 + (x - 0.04) * 1.065, y * 1.065, BROW - 0.11)) for x, y in ring]
    hi = [bm.verts.new((0.04 + (x - 0.04) * 0.97, y * 0.97, BROW + 0.2)) for x, y in ring]
    bm.faces.new(list(reversed(lo)))
    bm.faces.new(hi)
    n = len(ring)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((lo[i], lo[j], hi[j], hi[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new("Brow")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("Brow", me)
    bpy.context.collection.objects.link(ob)
    return ob


def outer():
    body = plates()
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=64, ring_count=32, location=(0.04, 0, BROW))
    dome = bpy.context.active_object
    dome.scale = DOME
    bpy.ops.object.transform_apply(location=True, scale=True, rotation=False)
    cap = H.extrude("Cap", [(-3, BROW), (3, BROW), (3, 4), (-3, 4)], "y")
    H.boolean(dome, cap, "INTERSECT")
    bpy.data.objects.remove(cap)
    H.boolean(body, dome, "UNION")
    bpy.data.objects.remove(dome)
    # a strong brow over the face only, proud of the plates
    band = brow()
    front = H.extrude("BrowFront", [(-3, -3), (X_PANEL, -3), (X_PANEL, 3), (-3, 3)], "z", -1, 4)
    H.boolean(band, front, "INTERSECT")
    bpy.data.objects.remove(front)
    H.boolean(body, band, "UNION")
    bpy.data.objects.remove(band)
    edge = H.extrude("Edge", SIDE + [(-2.0, 4.0), (2.0, 4.0)], "y")
    H.boolean(body, edge, "INTERSECT")
    bpy.data.objects.remove(edge)
    chin = H.extrude("Chin", [(-3.0, -3.0)] + FRONT + [(3.0, -3.0)], "x", -3.0, 0.05)
    H.boolean(body, chin, "DIFFERENCE")
    bpy.data.objects.remove(chin)
    return body


def cut_ts(body, red, dark):
    H.set_slots(body, [red, dark], 0)
    cutters = bpy.data.collections.new("CuttersV5")
    bpy.context.scene.collection.children.link(cutters)
    for sign in (-1, 1):
        ob = H.extrude(f"CutT{sign}", [(sign * y, z) for y, z in T], "x", -3.0, T_FLOOR)
        for c in ob.users_collection:
            c.objects.unlink(ob)
        cutters.objects.link(ob)
        H.set_slots(ob, [red, dark], 1)
    b = body.modifiers.new("cuts", "BOOLEAN")
    b.operation = "DIFFERENCE"
    b.operand_type = "COLLECTION"
    b.collection = cutters
    b.solver = "EXACT"
    b.material_mode = "INDEX"
    H.apply(body, b)
    for ob in list(cutters.objects):
        bpy.data.objects.remove(ob)
    bpy.data.collections.remove(cutters)


def split_s(body, dark):
    s = H.extrude("SPrism", offset_outline(s_centerline(), STROKE), "y", -3.0, 0.0)  # the visible side only, so the far side never shows a mirrored S
    panel_p = H.extrude("PanelPrism", [(X_PANEL, -3), (3, -3), (3, Z_TOP), (X_PANEL, Z_TOP)], "y")
    H.boolean(panel_p, s, "UNION")
    bpy.data.objects.remove(s)
    panel = bpy.data.objects.new("BackPanel", body.data.copy())
    bpy.context.collection.objects.link(panel)
    H.boolean(panel, panel_p, "INTERSECT")
    H.boolean(body, panel_p, "DIFFERENCE")
    bpy.data.objects.remove(panel_p)
    H.set_slots(panel, [dark], 0)
    return panel


def soften(ob, width=0.04):
    for p in ob.data.polygons:
        p.use_smooth = True
    bev = ob.modifiers.new("soft", "BEVEL")
    bev.width = width
    bev.segments = 4
    bev.limit_method = "ANGLE"
    bev.angle_limit = math.radians(30)
    bev.harden_normals = False
    w = ob.modifiers.new("normals", "WEIGHTED_NORMAL")
    w.keep_sharp = True


def crest(body, gold, dark, half=0.085):
    """A low swept fin rooted in the skull, with one engraved trace and
    three nodes along it."""
    tree = H.tree_of(body)

    def dz(x):
        return H.dome_z(tree, max(min(x, 0.9), -0.85))

    def rise(x):  # fin height above the skull: low at the brow, peak forward of centre, tail swept
        t = (x + 0.72) / (1.0 + 0.72)
        return 0.05 + 0.22 * math.sin(math.pi * min(t, 1.0) ** 0.75)

    xs = [-0.72 + (1.0 + 0.72) * k / 48 for k in range(49)]
    top = [(x, dz(x) + rise(x)) for x in xs]
    foot = [(x, dz(x) - 0.25) for x in reversed(xs)]
    fin = H.extrude("Crest", top + foot, "y", -half, half)
    H.set_slots(fin, [gold, dark], 0)
    # the trace: one line along the fin at 40% of its height, nodes at both ends and mid
    tx = [-0.5 + 1.25 * k / 40 for k in range(41)]
    line = [(x, dz(x) + 0.42 * rise(x) + 0.02) for x in tx]
    cutters = bpy.data.collections.new("TraceCut")
    bpy.context.scene.collection.children.link(cutters)
    for side in (-1, 1):
        y = side * half
        cu = bpy.data.curves.new("trace", "CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = 0.02
        cu.bevel_resolution = 3
        sp = cu.splines.new("POLY")
        sp.points.add(len(line) - 1)
        for p, (x, z) in zip(sp.points, line):
            p.co = (x, y, z, 1)
        tmp = bpy.data.objects.new("traceTmp", cu)
        bpy.context.scene.collection.objects.link(tmp)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
        bpy.data.objects.remove(tmp)
        bpy.data.curves.remove(cu)
        tr = bpy.data.objects.new(f"TraceCut{side}", me)
        cutters.objects.link(tr)
        H.set_slots(tr, [gold, dark], 1)
        for k in (0, 20, 40):
            x, z = line[k]
            bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.06, vertices=32, location=(x, y, z),
                                                rotation=(math.pi / 2, 0, 0))
            nd = bpy.context.active_object
            for c in nd.users_collection:
                c.objects.unlink(nd)
            cutters.objects.link(nd)
            H.set_slots(nd, [gold, dark], 1)
    b = fin.modifiers.new("engrave", "BOOLEAN")
    b.operation = "DIFFERENCE"
    b.operand_type = "COLLECTION"
    b.collection = cutters
    b.solver = "EXACT"
    b.material_mode = "INDEX"
    print('fin before engrave', len(fin.data.polygons), tuple(round(v, 2) for v in fin.dimensions))
    H.apply(fin, b)
    print('fin after engrave', len(fin.data.polygons), tuple(round(v, 2) for v in fin.dimensions))
    for ob in list(cutters.objects):
        bpy.data.objects.remove(ob)
    bpy.data.collections.remove(cutters)
    return fin


def clear_old():
    tilt = bpy.data.objects["Tilt"]
    for o in list(tilt.children):
        bpy.data.objects.remove(o)
    for name in ("Cutters", "CuttersV5", "TraceCut"):
        c = bpy.data.collections.get(name)
        if c:
            for o in list(c.objects):
                bpy.data.objects.remove(o)
            bpy.data.collections.remove(c)


def build():
    clear_old()
    red, dark, gold = (bpy.data.materials[n] for n in ("cardinal", "dark", "gold"))
    body = outer()
    cut_ts(body, red, dark)
    fin = crest(body, gold, dark)
    panel = split_s(body, dark)
    soften(body)
    soften(panel)
    soften(fin, 0.018)
    tilt = bpy.data.objects["Tilt"]
    mark = bpy.data.objects["Mark"]
    for o in (body, panel, fin):
        o.parent = tilt
    bpy.context.view_layer.update()
    mark.location.z = 0
    bpy.context.view_layer.update()
    mark.location.z = -min(p.z for p in H.mark_points([body, panel]))
    return [body, panel, fin]
