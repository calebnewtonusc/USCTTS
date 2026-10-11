"""TTS helmet v11: v6 (Caleb, 3am: "I think v5 or v6 were fire?") with three
small fixes only: face facets at fixed offsets so no crease crosses the T
stems, a brow with a straight proud face so it is a ridge and not a plate,
and the S placed a little further from the second T with the jaw kept low
under it so its lower bowl stays whole.

TTS helmet v9: v8 with the shell lofted from the traced profiles.

v8 intersected the side and front drawings and read as a lunchbox from the
3/4 camera: vertical side walls under a flat roof. Here every height gets its
own faceted ring, its length from the side trace and its width from the
front trace, so the skull narrows and rounds at the back and top the way
the photos do, in a few flat facets.

Original v8 notes:

Caleb, 2:12am: "I want it to resemble the shape of a helmet, not a trash can
lmao". v5 to v7 invented the shape and lost. Here the side silhouette is
traced from the Walters Art Museum Corinthian (54.2304, CC0, profile) and the
front silhouette from the Munich Corinthian bronze, both by trace_refs.py into
trace/trace.json. The shell is those two drawings intersected, plus a top
outline with a prow so the face has a centre crease, all simplified to a few
big facets and given fat soft bevels. Face toward -x, y across, z up, cheek
points at z = 0, crown at z = 2.4.
"""

import json
import math
import os

import bpy

import logo_helmet as H
import helmet_v5 as V

HERE = os.path.dirname(os.path.abspath(__file__))
TRACE = json.load(open(os.path.join(HERE, "trace.json")))  # from trace_refs.py

TOP = [  # from above: a prow at the face, chamfered at the back
    (-1.62, 0.0), (-1.22, 0.52), (-0.8, 0.66), (0.2, 0.72), (0.9, 0.6),
    (1.3, 0.36), (1.45, 0.0), (1.3, -0.36), (0.9, -0.6), (0.2, -0.72),
    (-0.8, -0.66), (-1.22, -0.52),
]
NOTCH = [  # the chin notch between the two cheek points, front view (y, z)
    (-0.16, -0.5), (0.16, -0.5), (0.05, 0.34), (-0.05, 0.34),
]
T = [  # +y opening: the eye slit is the bar, the gap beside the nose guard the stem, leaning in
    # the bar slants down toward the nose under the mean brow
    (0.07, 1.32), (0.5, 1.4), (0.6, 1.31), (0.5, 1.25), (0.38, 1.23), (0.24, 0.5),
    (0.11, 0.5), (0.24, 1.2), (0.07, 1.17),
]
T_FLOOR = -0.62  # deep pockets: dark holes into the head
Z_TOP = 1.4  # the eye line: T bars, the top of the S and the panel
S_X = -0.42  # -0.3 (v11) pushed it to the silhouette edge, unreadable at 128px; the S sits on the side just behind the face
S_TOP, S_BOT = 1.4, 0.6  # top touching the brow like the Ts, foot above the raked lower edge


def side_outline():
    """The traced skull and face, with the lower edge raked: Caleb, 2:19am,
    "I want the things in the front to poke down decently farther than the
    back of the helmet so it's tuffer and doesn't look like a trashcan". The
    Walters trace drops only 16% of the height from neck to cheek point; this
    drops 30%, and the nape dips in above a short flared neck guard."""
    pts = [tuple(p) for p in TRACE["side"]]
    upper = [p for p in pts if p[1] > 0.6][:9]  # face, brow, skull, back of the skull
    return upper + [(1.24, 1.25), (1.4, 0.72), (0.7, 0.76), (-1.33, 0.0)]


def s_edge(n=30, flare=1.35, shift=0.06, gap=0.04, tail=170):
    """The panel's front edge: the cheek guard's rear contour comes forward
    over the ear and sweeps back around it into the neck guard, as one S
    hanging from the brow ridge. Two equal bowls joined by a short diagonal
    spine. The upper bowl rises from the panel's flat top line to touch the
    brow and curls forward, so its counter is dark; the lower counter is
    red. (v3 tried running the panel's top line along the brow itself: the
    upper counter then merged into the panel and the S vanished.) The tail
    stops short of 180 degrees, past which its drop line crosses the bowl."""
    r = (S_TOP - S_BOT - gap) / 4
    c1 = (S_X - shift, S_TOP - r)
    c2 = (S_X + shift, S_BOT + r)
    pts = []
    for k in range(n + 1):
        a = math.radians(270 * k / n)
        pts.append((c1[0] + r * flare * math.cos(a), c1[1] + r * math.sin(a)))
    for k in range(n + 1):
        a = math.radians(90 - (90 + tail) * k / n)
        pts.append((c2[0] + r * flare * math.cos(a), c2[1] + r * math.sin(a)))
    return pts, c1[1]


FACE = [(-1.33, 0.0), (-1.33, 0.65), (-1.05, 1.24), (-0.94, 1.84), (-0.82, 2.01),
        (-0.43, 2.28), (0.12, 2.4)]  # the side trace's front edge, bottom up
BACK = [(-1.33, 0.0), (0.15, 0.34), (0.5, 0.44), (0.78, 0.76),  # the jaw drops under the S so its lower bowl stays whole
        (1.4, 0.78), (1.24, 1.25), (1.33, 1.93),
        (1.14, 2.15), (0.76, 2.35), (0.12, 2.4)]  # raked lower edge, neck lip, nape, skull
LEVELS = [0.03, 0.22, 0.42, 0.6, 0.75, 0.8, 1.02, 1.25, 1.5, 1.75, 1.95, 2.12, 2.26, 2.36]


def at(poly, z):
    """x where a bottom-up polyline crosses height z."""
    for (x0, z0), (x1, z1) in zip(poly, poly[1:]):
        if z0 <= z <= z1 and z1 > z0:
            return x0 + (x1 - x0) * (z - z0) / (z1 - z0)
    return poly[-1][0]


def half_width(z):
    right = sorted((p for p in TRACE["front"] if p[0] >= 0), key=lambda p: p[1])
    for (y0, z0), (y1, z1) in zip(right, right[1:]):
        if z0 <= z <= z1 and z1 > z0:
            return y0 + (y1 - y0) * (z - z0) / (z1 - z0)
    return right[-1][0]


EYE = 1.4  # top of the eye slits
WIDEN = 1.4  # Caleb, 2:38am: wider so the turned mark frames square
FOREHEAD = 0.82  # Caleb, 2:32am, "the forehead is a bit tall": the skull above the eyes, 18% lower


def squash(z):
    return z if z <= EYE else EYE + (z - EYE) * FOREHEAD


def ring(z):
    xf, xb, w = at(FACE, z), at(BACK, z), max(half_width(z), 0.04) * WIDEN
    L = xb - xf
    # fixed offsets from the face: L-relative ones jumped where the neck lip
    # changes L (z 0.75 to 0.8) and creased the T stems in v6
    half = [(xf, 0.0), (xf + min(0.25, 0.12 * L), 0.78 * w), (xf + min(0.75, 0.35 * L), w), (xf + 0.72 * L, w),
            (xb - 0.06 * L, 0.6 * w), (xb, 0.0)]
    pts = half + [(x, -y) for x, y in reversed(half[1:-1])]
    return [(x, y, squash(z)) for x, y in pts]


BROW_LO, BROW_HI = 1.41, 1.64
BROW_FACE = 0.12  # a straight proud face before the slope: v6's brow ended in a thin plate edge
BROW_DIP = 0.09  # how far the brow comes down over the nose: the mean look
BROW_OUT = 0.085  # proud over the face; fades into the shell behind the S


def brow_out(x):
    """Full over the face, thinning along the top of the S, sunk inside the
    shell past it, so there is no ledge round the back (v3 read as a hard
    hat brim)."""
    a, b = -0.75, 0.3  # v4 first pass at -0.3 left wings sticking out at the temples
    if x <= a:
        return BROW_OUT
    if x >= b:
        return -0.03
    return BROW_OUT + (-0.03 - BROW_OUT) * (x - a) / (b - a)


def brow():
    """A mean brow over the eye slits that flows back along the top of the S.
    Its lower edge dips toward the nose, its top slopes into the skull."""
    import bmesh
    bm = bmesh.new()
    base = ring(BROW_LO)
    cx = sum(p[0] for p in base) / len(base)
    rings = []
    for zt, share in ((BROW_LO, 1.0), (BROW_LO + BROW_FACE, 1.0), (BROW_HI, 0.2)):
        zin = zt if zt <= EYE else EYE + (zt - EYE) / FOREHEAD
        out = []
        for x, y, _ in ring(zin):
            dx, dy = x - cx, y
            d = math.hypot(dx, dy) or 1.0
            o = brow_out(x) * share if brow_out(x) > 0 else brow_out(x)
            front = max(0.0, 1.0 - abs(y) / (0.55 * WIDEN)) if x < -0.6 else 0.0
            out.append(bm.verts.new((x + o * dx / d, y + o * dy / d, zt - BROW_DIP * front)))
        rings.append(out)
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    n = len(rings[0])
    for lo, hi in zip(rings, rings[1:]):
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


def shell():
    import bmesh
    bm = bmesh.new()
    rings = [[bm.verts.new(v) for v in ring(z)] for z in LEVELS]
    bm.faces.new(rings[0])
    bm.faces.new(list(reversed(rings[-1])))
    n = len(rings[0])
    for a, b in zip(rings, rings[1:]):
        for i in range(n):
            j = (i + 1) % n
            bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new("Helmet")
    bm.to_mesh(me)
    bm.free()
    body = bpy.data.objects.new("Helmet", me)
    bpy.context.collection.objects.link(body)
    band = brow()
    u = body.modifiers.new("brow", "BOOLEAN")
    u.operation, u.object, u.solver = "UNION", band, "MANIFOLD"
    H.apply(body, u)
    bpy.data.objects.remove(band)
    n = H.extrude("Notch", NOTCH, "x", -3.0, -0.4)
    H.boolean(body, n, "DIFFERENCE")
    bpy.data.objects.remove(n)
    return body


def cut_ts(body, red, dark):
    H.set_slots(body, [red, dark], 0)
    col = bpy.data.collections.new("CuttersV8")
    bpy.context.scene.collection.children.link(col)
    for sign in (-1, 1):
        ob = H.extrude(f"CutT{sign}", [(sign * y, z) for y, z in T], "x", -3.0, T_FLOOR)
        for c in ob.users_collection:
            c.objects.unlink(ob)
        col.objects.link(ob)
        H.set_slots(ob, [red, dark], 1)
    b = body.modifiers.new("cuts", "BOOLEAN")
    b.operation = "DIFFERENCE"
    b.operand_type = "COLLECTION"
    b.collection = col
    b.solver = "EXACT"
    b.material_mode = "INDEX"
    H.apply(body, b)
    for ob in list(col.objects):
        bpy.data.objects.remove(ob)
    bpy.data.collections.remove(col)


def split_s(body, dark):
    edge, line = s_edge()
    poly = [(3.0, line)] + edge + [(edge[-1][0], -3.0), (3.0, -3.0)]
    p = H.extrude("PanelPrism", poly, "y")
    panel = bpy.data.objects.new("BackPanel", body.data.copy())
    bpy.context.collection.objects.link(panel)
    # the exact solver returns nothing on the lofted shell; manifold does it
    for ob, op in ((panel, "INTERSECT"), (body, "DIFFERENCE")):
        b = ob.modifiers.new(op.lower(), "BOOLEAN")
        b.operation, b.object, b.solver = op, p, "MANIFOLD"
        H.apply(ob, b)
    bpy.data.objects.remove(p)
    H.set_slots(panel, [dark], 0)
    return panel


def soft(ob, width):
    for poly in ob.data.polygons:
        poly.use_smooth = True
    b = ob.modifiers.new("soft", "BEVEL")
    b.width = width
    b.segments = 6
    b.limit_method = "ANGLE"
    b.angle_limit = math.radians(25)
    b.use_clamp_overlap = True
    w = ob.modifiers.new("normals", "WEIGHTED_NORMAL")
    w.keep_sharp = False


FIN_X0 = -0.6  # v5's fin began on the forehead slope and showed a flat yellow cut end


def crest(body, gold, dark, half=0.085):
    """A low swept fin rooted in the skull, one engraved trace and three
    round nodes. Caleb, 2:32 and 2:33am: the trace ran off the fin's front
    edge into a clipped blob, then "Dot too close to edge". Every node now
    keeps at least one node diameter of gold to any edge of the fin."""
    import bmesh  # noqa: F401
    tree = H.tree_of(body)
    node_r, line_r = 0.032, 0.014
    margin = 3 * node_r  # node radius plus one full diameter

    def dz(x):
        return H.dome_z(tree, max(min(x, 0.9), -0.85))

    def rise(x):
        t = (x - FIN_X0) / (1.0 - FIN_X0)
        return 0.02 + 0.3 * math.sin(math.pi * min(max(t, 0.0), 1.0) ** 0.75)

    xs = [FIN_X0 + (1.0 - FIN_X0) * k / 48 for k in range(49)]
    fin = H.extrude("Crest", [(x, dz(x) + rise(x)) for x in xs] + [(x, dz(x) - 0.25) for x in reversed(xs)],
                    "y", -half, half)
    H.set_slots(fin, [gold, dark], 0)
    # nodes only where the visible face is tall enough for the margin above and below
    # a circuit trace: flat runs joined by one 45 degree jog, pads at both
    # ends and a node at each bend (three dots on a curve read as a smile)
    def mid(x):
        return dz(x) + rise(x) / 2
    # v13: a symmetric split and merge (Caleb on v12: the jog with doubled
    # dots looked unintentional). One node, a split into two parallel
    # branches with 45 degree bends, a merge, one node. Nodes sit on the
    # midline only, so they keep >= one diameter of gold from every edge;
    # the branches are SPLIT_D above and below, a clear node width apart.
    SPLIT_D = 0.05
    xa, xs, xm, xb = -0.27, -0.15, 0.27, 0.39  # centred on x 0.06, where the fin is tallest
    def base(x):
        return mid(x)
    strokes = [[(xa, base(xa)), (xs, base(xs))], [(xm, base(xm)), (xb, base(xb))]]
    for sgn in (1, -1):
        strokes.append([(xs, base(xs)), (xs + SPLIT_D, base(xs + SPLIT_D) + sgn * SPLIT_D),
                        (xm - SPLIT_D, base(xm - SPLIT_D) + sgn * SPLIT_D), (xm, base(xm))])
    node_pts = [(x, base(x)) for x in (xa, xs, xm, xb)]
    for x, z in node_pts:
        lo, hi = dz(x), dz(x) + rise(x)
        print("node", round(x, 2), "margin below", round(z - node_r - lo, 3), "above", round(hi - z - node_r, 3))
    for st in strokes[2:]:
        for x, z in st:
            lo, hi = dz(x), dz(x) + rise(x)
            print("branch pt", round(x, 2), "margin", round(min(z - line_r - lo, hi - z - line_r), 3))
    col = bpy.data.collections.new("TraceCut")
    bpy.context.scene.collection.children.link(col)
    for side in (-1, 1):
        y = side * half
        cu = bpy.data.curves.new("trace", "CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = line_r
        cu.bevel_resolution = 3
        for st in strokes:
            sp = cu.splines.new("POLY")
            sp.points.add(len(st) - 1)
            for pt, (x, z) in zip(sp.points, st):
                pt.co = (x, y, z, 1)
        tmp = bpy.data.objects.new("traceTmp", cu)
        bpy.context.scene.collection.objects.link(tmp)
        me = bpy.data.meshes.new_from_object(tmp.evaluated_get(bpy.context.evaluated_depsgraph_get()))
        bpy.data.objects.remove(tmp)
        bpy.data.curves.remove(cu)
        tr = bpy.data.objects.new(f"TraceCut{side}", me)
        col.objects.link(tr)
        H.set_slots(tr, [gold, dark], 1)
        for x, z in node_pts:
            bpy.ops.mesh.primitive_cylinder_add(radius=node_r, depth=0.05, vertices=40,
                                                location=(x, y, z), rotation=(math.pi / 2, 0, 0))
            nd = bpy.context.active_object
            for c in nd.users_collection:
                c.objects.unlink(nd)
            col.objects.link(nd)
            H.set_slots(nd, [gold, dark], 1)
    b = fin.modifiers.new("engrave", "BOOLEAN")
    b.operation, b.operand_type, b.collection, b.solver = "DIFFERENCE", "COLLECTION", col, "EXACT"
    b.material_mode = "INDEX"
    H.apply(fin, b)
    for ob in list(col.objects):
        bpy.data.objects.remove(ob)
    bpy.data.collections.remove(col)
    return fin


def build():
    V.clear_old()
    red, dark, gold = (bpy.data.materials[n] for n in ("cardinal", "dark", "gold"))
    body = shell()
    cut_ts(body, red, dark)
    fin = crest(body, gold, dark)
    panel = split_s(body, dark)
    soft(body, 0.07)
    soft(panel, 0.07)
    V.soften(fin, 0.03)
    tilt = bpy.data.objects["Tilt"]
    mark = bpy.data.objects["Mark"]
    for o in (body, panel, fin):
        o.parent = tilt
    mark.location.z = 0
    bpy.context.view_layer.update()
    mark.location.z = -min(p.z for p in H.mark_points([body, panel]))
    return [body, panel, fin]
