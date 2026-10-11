"""Home's hero loops: each hero still from heroes.py, brought to life as a
seamless 6 second loop.

  Blender -b -P blender/loops.py -- --hero mailbox|writer|world --out DIR
          [--res W] [--samples N] [--test SECONDS] [--strip]

Caleb, 2026-10-10: "Make these fire looping fun animation videos like the clay
site!" clay.com's heroes are small clay worlds that never stop moving: clouds
drift, palms sway, buildings bob. Each scene here is the still from heroes.py
plus one piece of motion that says its section's point, and a dot floor that
answers it, the way every dot on home is a place that reacts (INTENT-home.md,
"One world").

  mailbox  our work     letters fly in from far off on dotted trails, the door
                        slams, the flag pops up, the mailbox hops and fires one
                        cardinal-sealed letter back out: work in, work out
  writer   the TTS way  the typewriter drafts line after line, the carriage
                        dings back, the lead hops beside it, the navy floor's
                        dots ripple on every return
  world    who we are   USC's pin drops and sends a cardinal ring of dots into
                        the city, each building hops as it passes, cars run the
                        freeway, palms sway, clouds drift

Every motion is a function of the loop phase, so frame N is frame 0 and the
seam is invisible: periodic waves use whole cycles per loop, one-shot events
finish (springs decayed below 1e-4) before the loop ends, and drifting things
travel exactly one spacing per loop. Keys are baked from frame -1 to N so
motion blur at the seam samples the wrapped neighbour.

Without --test it renders frames 0..N-1 to DIR/f_####.png and skips frames
already on disk, so a paused or killed queue job resumes where it stopped.
--test S renders the single frame at S seconds to DIR/test.png. --strip adds a
contact sheet of eight small frames (DIR/strip_#.png) for checking poses.
"""

import argparse
import math
import os
import random
import sys

import bmesh
import bpy
from bpy_extras import anim_utils
from mathutils import Euler, Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import heroes as H  # noqa: E402
import machine as M  # noqa: E402

FPS = 30
SECONDS = 6.0
N = int(FPS * SECONDS)
# Measured on the mailbox test frame: at 48 samples with the denoiser the clay
# grain held still between frames; 32 boiled on the blush sweep.
SAMPLES = 48


# ---------------------------------------------------------------- motion vocabulary

def clamp01(x):
    return max(0.0, min(1.0, x))


def smooth(x):
    x = clamp01(x)
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = clamp01(x)
    return 1 - (1 - x) ** 3


def ease_in(x):
    x = clamp01(x)
    return x * x * x


def spring(x, freq=2.5, damp=7.0):
    """A released spring: 1 at x=0, rings and settles to 0. Zero before."""
    if x < 0:
        return 0.0
    return math.exp(-damp * x) * math.cos(math.tau * freq * x)


def kick(x, freq=3.0, damp=8.0, attack=0.035):
    """An impact: rises from 0 over `attack`, then rings down to 0."""
    if x < 0:
        return 0.0
    return smooth(x / attack) * math.exp(-damp * x) * math.cos(math.tau * freq * x)


def wave(t, cycles, phase=0.0):
    """A sine with a whole number of cycles per loop."""
    return math.sin(math.tau * (cycles * t / SECONDS + phase))


def squash(s):
    """Volume-kept scale for a squash of s on z (s < 1 squashes)."""
    side = 1.0 / math.sqrt(max(s, 0.05))
    return Vector((side, side, s))


def bezier(p0, p1, p2, u):
    return (1 - u) ** 2 * p0 + 2 * (1 - u) * u * p1 + u * u * p2


def bezier_d(p0, p1, p2, u):
    return 2 * (1 - u) * (p1 - p0) + 2 * u * (p2 - p1)


# ---------------------------------------------------------------- baking

ANIM = []  # (object, fn(t seconds) -> parent-space basis Matrix)


def animate(ob, fn):
    ANIM.append((ob, fn))


def trs(loc, rot=None, scale=None):
    m = Matrix.Translation(Vector(loc))
    if rot is not None:
        m = m @ (rot.to_matrix().to_4x4() if hasattr(rot, "to_matrix") else rot)
    if scale is not None:
        m = m @ Matrix.Diagonal(Vector(tuple(scale) + (1.0,)))
    return m


def bake_all():
    """One key per frame from -1 to N, linear, through the slotted-action API."""
    frames = list(range(-1, N + 1))
    for ob, fn in ANIM:
        ob.rotation_mode = "QUATERNION"
        chans = {"location": [[], [], []], "rotation_quaternion": [[], [], [], []], "scale": [[], [], []]}
        prev = None
        for f in frames:
            t = ((f % N) + N) % N / FPS
            loc, q, sc = fn(t).decompose()
            if prev is not None and prev.dot(q) < 0:
                q = -q
            prev = q
            for i in range(3):
                chans["location"][i].append(loc[i])
                chans["scale"][i].append(sc[i])
            for i in range(4):
                chans["rotation_quaternion"][i].append(q[i])
        ad = ob.animation_data_create()
        act = bpy.data.actions.new(f"{ob.name}_loop")
        ad.action = act
        if ad.action_slot is None:
            ad.action_slot = act.slots.new(id_type="OBJECT", name=ob.name)
        cb = anim_utils.action_ensure_channelbag_for_slot(act, ad.action_slot)
        for path, per in chans.items():
            for idx, values in enumerate(per):
                fc = cb.fcurves.new(path, index=idx)
                fc.keyframe_points.add(len(values))
                co = []
                for f, v in zip(frames, values):
                    co += [f, v]
                fc.keyframe_points.foreach_set("co", co)
                fc.keyframe_points.foreach_set("interpolation", [1] * len(values))
                fc.update()


def group(name, objs, origin):
    """Parent objs under a new empty at origin, keeping their world transforms."""
    bpy.context.view_layer.update()
    e = bpy.data.objects.new(name, None)
    M.link(e)
    e.location = origin
    bpy.context.view_layer.update()
    inv = e.matrix_world.inverted()
    for o in objs:
        mw = o.matrix_world.copy()
        o.parent = e
        o.matrix_parent_inverse = Matrix.Identity(4)
        o.matrix_basis = inv @ mw
    return e


def bead_mesh(name="Bead"):
    """One shared low-poly sphere for every floor dot, so 400 dots stay cheap."""
    me = bpy.data.meshes.get(name)
    if me:
        return me
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.shade_smooth()
    return me


def bead(name, mat, loc, r):
    me = bead_mesh(f"Bead_{mat.name}")
    if not me.materials:
        me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    M.link(ob)
    ob.location = loc
    ob.scale = (r, r, r)
    return ob


def dot_floor(center, radius, spacing, r, mat, hops, keep=0.75, seed=3, avoid=None, ground=None):
    """A lattice of clay dots on the floor, thinned toward the rim, each one
    hopping as a ring wave passes. hops: [(t0, amplitude, speed)]."""
    rnd = random.Random(seed)
    cx, cy = center
    n = int(radius / spacing) + 1
    made = 0
    for j in range(-n, n + 1):
        for i in range(-n, n + 1):
            x, y = cx + i * spacing, cy + j * spacing
            d = math.hypot(x - cx, y - cy)
            if d > radius:
                continue
            fall = 1.0 - (d / radius) ** 1.6
            if rnd.random() > keep * fall:
                continue
            if avoid and avoid(x, y):
                continue
            z0 = (ground(x, y) if ground else 0.0) + r * 0.7
            ob = bead("FloorDot", mat, (x, y, z0), r)
            base = Vector((x, y, z0))

            def fn(t, base=base, d=d):
                lift = 0.0
                for t0, amp, speed in hops:
                    for wrap in (0.0, SECONDS):
                        x_ = t + wrap - t0 - d / speed
                        if 0 <= x_ < 1.2:
                            lift += amp * math.sin(math.pi * clamp01(x_ / 0.28)) * math.exp(-1.8 * x_)
                return trs(base + Vector((0, 0, lift)), scale=(r, r, r * (1 + 4.0 * lift)))

            animate(ob, fn)
            made += 1
    return made


# ---------------------------------------------------------------- mailbox

def loop_mailbox(w, h):
    H.hero_mailbox(w, h)
    sc = bpy.context.scene
    holder = bpy.data.objects["Cute toy mailbox assembly_hold"]
    door = bpy.data.objects["Door"]
    flag = bpy.data.objects["Flag"]
    # The still's letter lying on the open door goes: letters now arrive by air.
    envs = sorted([o for o in bpy.data.objects if o.name.startswith("Envelope") and o.type == "EMPTY"],
                  key=lambda o: o.location.z)
    ground_env, door_env = envs[0], envs[-1]
    for o in [door_env] + M.descendants(door_env):
        bpy.data.objects.remove(o, do_unlink=True)

    OPEN = door.rotation_euler.x  # 1.187, the part's resting open angle
    FLAG_DOWN = math.radians(90)
    base_scale = holder.scale.copy()
    base_loc = holder.location.copy()
    base_rot = holder.rotation_euler.copy()

    # Geometry the flights aim at, read off the part with the door closed.
    door.rotation_euler.x = 0.0
    bpy.context.view_layer.update()
    dm = door.matrix_world
    hinge = dm.translation.copy()
    up = (dm.to_3x3() @ Vector((0, 0, 1))).normalized()
    inward = (dm.to_3x3() @ Vector((0, 1, 0))).normalized()
    s = holder.scale.x
    mouth = hinge + up * 0.095 * s + inward * 0.02 * s
    inside = hinge + up * 0.09 * s + inward * 0.2 * s
    door.rotation_euler.x = OPEN
    cam = sc.camera
    cm = cam.matrix_world.to_3x3()
    right = (cm @ Vector((1, 0, 0))).normalized()
    cup = (cm @ Vector((0, 1, 0))).normalized()
    fwd = (cm @ Vector((0, 0, -1))).normalized()
    ctr = holder.location + Vector((0, 0, 0.62))
    dist = (ctr - cam.location).length
    half_w = dist * 18.0 / cam.data.lens
    half_h = half_w * h / w

    # ---- the timeline, in seconds
    ARRIVE = [(0.25, 0.65), (0.55, 0.65), (0.85, 0.65)]  # (start, duration)
    T_SLAM, T_FLAG_UP = 1.62, 1.86
    T_CROUCH, T_TAKEOFF, T_LAND = 2.5, 2.95, 3.4
    T_POP, T_OUT, OUT_DUR = 3.04, 3.1, 0.62
    T_FLAG_DOWN = 3.95
    catches = [a + d for a, d in ARRIVE]

    def hop_z(t):
        if T_TAKEOFF <= t <= T_LAND:
            x = (t - T_TAKEOFF) / (T_LAND - T_TAKEOFF)
            return 0.24 * 4 * x * (1 - x)
        return 0.0

    def body_s(t):
        s_ = 1.0 + 0.012 * wave(t, 2)
        for c in catches:
            s_ -= 0.05 * kick(t - c, freq=3.2, damp=9)
        s_ -= 0.1 * kick(t - (T_SLAM + 0.1), freq=3.0, damp=8)
        # anticipation, then stretch through the jump, then the landing
        if T_CROUCH <= t < T_TAKEOFF:
            s_ -= 0.14 * smooth((t - T_CROUCH) / (T_TAKEOFF - T_CROUCH))
        if T_TAKEOFF <= t < T_LAND:
            x = (t - T_TAKEOFF) / (T_LAND - T_TAKEOFF)
            s_ += -0.14 * (1 - smooth(x / 0.12)) + 0.11 * math.sin(math.pi * clamp01(x / 0.12)) * (1 - x) \
                + 0.06 * smooth((x - 0.7) / 0.3)
        s_ -= 0.16 * kick(t - T_LAND, freq=2.6, damp=6.5, attack=0.03)
        return s_

    def holder_fn(t):
        sq = squash(body_s(t))
        sc_ = Vector((base_scale.x * sq.x, base_scale.y * sq.y, base_scale.z * sq.z))
        lean = 0.05 * kick(t - T_LAND, freq=2.0, damp=5) - 0.03 * kick(t - (T_SLAM + 0.1), freq=2.2, damp=6)
        rot = Euler((lean, 0, base_rot.z))
        return trs(base_loc + Vector((0, 0, hop_z(t))), rot, sc_)

    animate(holder, holder_fn)

    door_base = door.matrix_basis.copy()
    door_loc = door_base.translation.copy()

    def door_angle(t):
        if t < T_SLAM:
            return OPEN
        if t < T_SLAM + 0.1:  # falls shut, accelerating
            return OPEN * (1 - ease_in((t - T_SLAM) / 0.1))
        if t < T_POP:  # rebounds off the frame twice
            x = t - (T_SLAM + 0.1)
            return 0.24 * math.exp(-9 * x) * abs(math.sin(math.tau * 3.5 * x))
        return OPEN * (1 - spring(t - T_POP, freq=2.2, damp=7.5))

    def door_fn(t):
        return trs(door_loc, Euler((door_angle(t), 0, 0)))

    animate(door, door_fn)

    flag_loc = flag.matrix_basis.translation.copy()

    def flag_angle(t):
        if t < T_FLAG_UP:
            return FLAG_DOWN
        if t < T_FLAG_DOWN:
            return FLAG_DOWN * spring(t - T_FLAG_UP, freq=2.6, damp=7)
        return FLAG_DOWN * (1 - spring(t - T_FLAG_DOWN, freq=2.6, damp=7))

    animate(flag, lambda t: trs(flag_loc, Euler((flag_angle(t), 0, 0))))

    # ---- the flights
    trail_mat = H.clay("paper", rough=0.5)
    out_mat = H.clay("card", rough=0.42)
    flights = []
    starts = [(-1.3, 0.15), (-1.15, 0.85), (-0.35, 1.25)]
    seals = ["gold_deep", "coral", "sky"]
    for (st, du), (sx, sy), seal in zip(ARRIVE, starts, seals):
        p0 = ctr + right * sx * half_w + cup * sy * half_h - fwd * 0.6
        p2 = inside
        # the last leg comes straight at the slot from in front of it
        p1 = mouth - inward * 1.1 + Vector((0, 0, 0.55)) + (p0 - mouth) * 0.25
        flights.append(dict(t0=st, dur=du, p0=p0, p1=p1, p2=p2, seal=seal, trail=trail_mat, inbound=True))
    p0 = inside
    p1 = mouth - inward * 0.9 + Vector((0, 0, 0.9))
    p2 = ctr + right * 1.35 * half_w + cup * 1.05 * half_h
    flights.append(dict(t0=T_OUT, dur=OUT_DUR, p0=p0, p1=p1, p2=p2, seal="card", trail=out_mat, inbound=False))

    for i, fl in enumerate(flights):
        env = H.envelope((0, 0, 0), (0, 0, 0), 0.62, seal=fl["seal"])
        env.name = f"Flight{i}"
        p0_, p1_, p2_ = fl["p0"], fl["p1"], fl["p2"]

        def env_fn(t, fl=fl, p0_=p0_, p1_=p1_, p2_=p2_):
            x = (t - fl["t0"]) / fl["dur"]
            if x <= 0 or x >= 1:
                return trs(inside, scale=(1e-4,) * 3)
            # inbound letters glide in and dive through the slot; the outbound
            # one leaves fast and keeps going
            u = (0.55 * x + 0.45 * smooth(x)) if fl["inbound"] else ease_out(x) * 0.6 + x * 0.4
            p = bezier(p0_, p1_, p2_, u)
            if not fl["inbound"]:  # it leaves a mailbox that is mid-hop
                p = p + Vector((0, 0, hop_z(t))) * (1 - smooth(u / 0.5))
            v = bezier_d(p0_, p1_, p2_, u)
            yaw = math.atan2(v.y, v.x)
            pitch = math.atan2(v.z, math.hypot(v.x, v.y))
            roll = 0.5 * math.sin(math.tau * 1.4 * x) * (1 - x) if fl["inbound"] else 0.3 * math.sin(math.tau * x)
            # flat, nose along the flight, then a little tumble
            rot = Euler((0, 0, yaw)).to_matrix().to_4x4() @ Euler((0, -pitch, 0)).to_matrix().to_4x4() \
                @ Euler((roll, 0, 0)).to_matrix().to_4x4() @ Euler((math.radians(90), 0, 0)).to_matrix().to_4x4()
            speed = math.sin(math.pi * x)
            st_ = 1 + 0.28 * speed
            grow = smooth(x / 0.12) if not fl["inbound"] else 1.0
            shrink = 1 - smooth((x - 0.9) / 0.1) * 0.6 if fl["inbound"] else 1.0
            k = 0.62 * grow * shrink
            return trs(p, rot, (k * st_, k / math.sqrt(st_), k / math.sqrt(st_)))

        animate(env, env_fn)
        # a dotted trail behind it: each dot pops as the letter passes, then fades
        K = 13
        for k in range(K):
            uk = 0.06 + 0.86 * k / (K - 1)
            pk = bezier(p0_, p1_, p2_, uk)
            if not fl["inbound"]:
                pk = pk + Vector((0, 0, hop_z(fl["t0"]))) * (1 - smooth(uk / 0.5))
            # invert the easing numerically: when does the letter pass uk?
            xs = [j / 400 for j in range(401)]
            ease = (lambda x: 0.55 * x + 0.45 * smooth(x)) if fl["inbound"] else (lambda x: ease_out(x) * 0.6 + x * 0.4)
            xk = min(xs, key=lambda x: abs(ease(x) - uk))
            tk = fl["t0"] + xk * fl["dur"]
            r0 = 0.026 if fl["inbound"] else 0.032
            dot = bead("Trail", fl["trail"], pk, r0)

            def dot_fn(t, tk=tk, pk=pk, r0=r0):
                x = t - tk
                if x < 0 or x > 0.75:
                    return trs(pk, scale=(1e-4,) * 3)
                k_ = M.back_out(clamp01(x / 0.14)) * (1 - smooth((x - 0.3) / 0.45))
                return trs(pk + Vector((0, 0, 0.06 * x)), scale=(r0 * k_,) * 3)

            animate(dot, dot_fn)

    # ---- the floor answers: dots ripple out from the post on the slam and the landing
    post_xy = (holder.location.x, holder.location.y)
    floor_mat = M.clay("D98C80", rough=0.6, bump=0.4)
    dot_floor(post_xy, 3.2, 0.2, 0.026, floor_mat,
              hops=[(T_SLAM + 0.1, 0.03, 3.5), (T_LAND, 0.07, 3.0)],
              keep=0.85, avoid=lambda x, y: math.hypot(x - post_xy[0], y - post_xy[1]) < 0.62
              or math.hypot(x - ground_env.location.x, y - ground_env.location.y) < 0.36)

    # the letter on the floor flinches when the mailbox lands
    ge_base = ground_env.matrix_basis.copy()
    gl, gq, gs = ge_base.decompose()
    d_env = math.hypot(ground_env.location.x - post_xy[0], ground_env.location.y - post_xy[1])

    def ge_fn(t):
        x = t - T_LAND - d_env / 3.0
        lift = 0.05 * math.sin(math.pi * clamp01(x / 0.3)) if 0 <= x <= 0.3 else 0.0
        tilt = 0.12 * math.sin(math.pi * clamp01(x / 0.3)) if 0 <= x <= 0.3 else 0.0
        return trs(gl + Vector((0, 0, lift)), gq.to_matrix().to_4x4() @ Euler((0, tilt, 0)).to_matrix().to_4x4(), gs)

    animate(ground_env, ge_fn)


# ---------------------------------------------------------------- writer

def loop_writer(w, h):
    H.hero_writer(w, h)
    holder = bpy.data.objects["Grp_LetterWritingMachine_hold"]
    head = bpy.data.objects["PrintHead_Assembly"]
    lead = bpy.data.objects["Lead"]
    for o in [o for o in bpy.data.objects if o.name.startswith("Line")]:
        bpy.data.objects.remove(o, do_unlink=True)

    LINE = SECONDS / 3  # three lines per loop
    T_TYPE, T_RET0, T_RET1 = 1.42, 1.56, 1.86  # within each line
    CHARS = 11
    base_scale = holder.scale.copy()
    base_loc = holder.location.copy()
    base_rot = holder.rotation_euler.copy()

    def phase(t):
        c = int(t // LINE)
        return c, t - c * LINE

    def head_x(t):
        """Steps across one character at a time, then slides home."""
        _, p = phase(t)
        if p < T_TYPE:
            q = p / T_TYPE * CHARS
            i, f = int(q), q - int(q)
            return (i + smooth(f / 0.45)) / CHARS
        if p < T_RET0:
            return 1.0
        if p < T_RET1:
            x = (p - T_RET0) / (T_RET1 - T_RET0)
            return 1.0 - ease_out(x) * 1.0 - 0.04 * math.sin(math.pi * clamp01((x - 0.7) / 0.3))
        return -0.03 * spring(p - T_RET1, freq=3, damp=10)

    X_L, X_R = -0.09, 0.15  # head offsets from rest, along the rail
    head_base = head.matrix_basis.copy()

    def head_fn(t):
        _, p = phase(t)
        tap = 0.0
        if p < T_TYPE:
            q = p / T_TYPE * CHARS
            f = q - int(q)
            tap = -0.004 * math.sin(math.pi * clamp01((f - 0.5) / 0.4))
        return Matrix.Translation((X_L + (X_R - X_L) * head_x(t), 0, tap)) @ head_base

    animate(head, head_fn)

    # the roller's handwheels turn one notch per line, dimples and all
    axle = Vector((0.0, 0.045, 0.201))
    wheel_parts = [o for o in bpy.data.objects if o.name.startswith(("Roller_Handwheel", "Roller_GripDimple"))]
    for o in wheel_parts:
        b = o.matrix_basis.copy()

        def wheel_fn(t, b=b):
            c, p = phase(t)
            turn = c + smooth((p - T_RET0) / (T_RET1 - T_RET0))
            a = -turn * math.tau / 12
            return Matrix.Translation(axle) @ Matrix.Rotation(a, 4, "X") @ Matrix.Translation(-axle) @ b

        animate(o, wheel_fn)

    # typed lines on the sheet: a conveyor, the newest at the bottom growing
    # behind the head, each moving up one row per carriage return
    TILT = math.radians(-14)
    Z0, ROW = 0.305, 0.034
    WIDTHS = [0.19, 0.16, 0.12]
    KEYS = ["ink", "ink", "card"]
    X_LEFT = -0.1

    def line_y(z):
        return 0.035 - 0.0035 + (z - 0.36) * math.tan(-TILT)

    def ink_rows(t):
        c, p = phase(t)
        lift = smooth((p - T_RET0) / (T_RET1 - T_RET0))
        return c, lift

    for slot in range(6):  # line k = c - slot, at row slot + lift
        for j in range(3):  # one object per width class, shown when k % 3 == j
            wd = WIDTHS[j]
            ln = M.rounded_box(f"Line{slot}_{j}", (1.0, 0.003, 0.008), H.clay(KEYS[j], rough=0.6),
                               bevel=0.0015, subdiv=0)
            ln.parent = holder

            def ln_fn(t, slot=slot, j=j, wd=wd):
                c, lift = ink_rows(t)
                k = c - slot
                hide = trs((0, 0.03, 0.3), scale=(1e-4,) * 3)
                if k % 3 != j:
                    return hide
                row = slot + lift
                if slot == 0:
                    grown = clamp01(head_x(t) * 1.02) if phase(t)[1] < T_RET0 else 1.0
                else:
                    grown = 1.0
                # the top line lifts off the sheet as a row of ink leaves
                gone = smooth((row - 4.1) / 0.9)
                length = wd * grown * (1 - gone)
                if length < 1e-4:
                    return hide
                z = Z0 + row * ROW
                x = X_LEFT + (wd * gone * 0.5) + length / 2
                return trs((x, line_y(z), z), Euler((TILT, 0, 0)), (length, 1.0, 1.0 - 0.6 * gone))

            animate(ln, ln_fn)

    # the machine settles on every return; the lead hops beside it
    def body_s(t):
        c, p = phase(t)
        s_ = 1.0 + 0.008 * wave(t, 3)
        for wrap in (-LINE, 0.0):
            s_ -= 0.05 * kick(p - T_RET1 - wrap, freq=3.2, damp=9)
            s_ -= 0.012 * kick(p - T_RET0 - wrap, freq=4, damp=12)
        if p < T_TYPE:
            q = p / T_TYPE * CHARS
            s_ -= 0.006 * math.sin(math.pi * clamp01(((q - int(q)) - 0.5) / 0.4))
        return s_

    def holder_fn(t):
        sq = squash(body_s(t))
        return trs(base_loc, base_rot, Vector((base_scale.x * sq.x, base_scale.y * sq.y, base_scale.z * sq.z)))

    animate(holder, holder_fn)

    r = lead.dimensions.z / 2
    lead_loc = lead.location.copy()
    T_UP, T_DOWN = T_TYPE - 0.08, T_RET1

    def lead_fn(t):
        _, p = phase(t)
        s_ = 1.0
        z = 0.0
        if T_UP - 0.22 <= p < T_UP:
            s_ = 1 - 0.2 * smooth((p - (T_UP - 0.22)) / 0.22)
        elif T_UP <= p < T_DOWN:
            x = (p - T_UP) / (T_DOWN - T_UP)
            z = 0.42 * 4 * x * (1 - x)
            s_ = 1 + 0.18 * (1 - abs(2 * x - 1)) ** 0.5 * (1 - 0.5 * x) - 0.2 * (1 - smooth(x / 0.1))
        for wrap in (-LINE, 0.0):
            s_ -= 0.24 * kick(p - T_DOWN - wrap, freq=2.8, damp=7.5, attack=0.025)
        sq = squash(s_)
        return trs((lead_loc.x, lead_loc.y, r * sq.z + z), scale=sq)

    animate(lead, lead_fn)

    # the navy floor: gold dots, the opener's street colour, rippling out from
    # the machine on every return
    mx, my = holder.location.x, holder.location.y
    gold = M.clay("C9A24E", rough=0.5, bump=0.3)
    hops = [(c * LINE + T_RET1, 0.022, 2.6) for c in range(3)]
    dot_floor((mx, my), 3.6, 0.17, 0.016, gold, hops, keep=0.8, seed=5,
              avoid=lambda x, y: (abs(x - mx) < 0.78 and abs(y - my) < 0.56)
              or math.hypot(x - lead_loc.x, y - lead_loc.y) < 0.2)


# ---------------------------------------------------------------- world

def loop_world(w, h):
    H.hero_world(w, h)
    objs = list(bpy.data.objects)
    rnd = random.Random(21)

    # ---- clouds: four identical clusters a spacing apart, each drifting one
    # spacing per loop, so the row at the end is the row at the start
    for o in [o for o in objs if o.name.startswith("Cloud")]:
        bpy.data.objects.remove(o, do_unlink=True)
    SPAN, NCL = 44.0, 4
    gap = SPAN / NCL
    paper = H.clay("paper", rough=0.75)
    for i in range(NCL):
        puffs = []
        for (ox, oz, r) in [(0, 0, 0.62), (0.7, -0.1, 0.48), (-0.7, -0.12, 0.5), (0.3, 0.32, 0.45),
                            (-0.25, 0.28, 0.38)]:
            puffs.append(M.sphere("Cloud", r * 0.92, paper, location=(ox * 0.92, 0, oz * 0.92)))
        cl = group(f"CloudGrp{i}", puffs, (0, 0, 0))
        x0 = -SPAN / 2 + i * gap + 3.0

        def cl_fn(t, x0=x0):
            x = (x0 + gap * t / SECONDS + SPAN / 2) % SPAN - SPAN / 2
            z = 7.2 + 0.55 * math.sin(math.tau * x / SPAN + 0.6) + 0.06 * math.sin(math.tau * x / 5.5)
            s_ = 0.92 + 0.12 * math.sin(math.tau * x / SPAN * 2 + 1.0)
            return trs((x, 24.0, z), scale=(s_, s_, s_ * (1 + 0.03 * math.sin(math.tau * x / 3.7))))

        animate(cl, cl_fn)

    # ---- palms: each trunk, crown and frond set grouped and swaying
    objs = [o for o in bpy.data.objects if not o.name.startswith(("Cloud", "CloudGrp"))]
    trunks = [o for o in objs if o.name.startswith("Trunk")]
    fronds = [o for o in objs if o.name.startswith("Frond")]
    crowns = [o for o in objs if o.name.startswith("Crown")]
    bpy.context.view_layer.update()
    for i, tr in enumerate(trunks):
        top = tr.matrix_world @ Vector((0, 0, tr.dimensions.z / 2))
        base = tr.matrix_world @ Vector((0, 0, -tr.dimensions.z / 2))
        mine = [f for f in fronds if (f.location - top).length < 0.45]
        crown = min(crowns, key=lambda c: (c.location - top).length)
        head_g = group(f"PalmHead{i}", mine + [crown], top)
        palm = group(f"Palm{i}", [tr, head_g], base)
        ph = rnd.random()
        pbase = palm.matrix_basis.copy()
        hbase = head_g.matrix_basis.copy()

        def palm_fn(t, ph=ph, pbase=pbase):
            a = math.radians(2.2) * wave(t, 2, ph) + math.radians(0.8) * wave(t, 5, ph * 2)
            return pbase @ Euler((a * 0.4, a, 0)).to_matrix().to_4x4()

        def head_fn(t, ph=ph, hbase=hbase):
            a = math.radians(5) * wave(t, 3, ph + 0.2)
            b = math.radians(3) * wave(t, 4, ph + 0.5)
            return hbase @ Euler((b, a * 0.5, a)).to_matrix().to_4x4()

        animate(palm, palm_fn)
        animate(head_g, head_fn)

    # ---- USC's pin drops twice per loop and each landing sends a ring out
    usc = Vector((-2.5, 1.1))
    pin = group("Pin", [bpy.data.objects["Dot"], bpy.data.objects["PinTip"]], (usc.x, usc.y, 2.35))
    pin_base = pin.matrix_basis.copy()
    DROPS = [0.45, 3.45]

    def pin_fn(t):
        z = 0.0
        s_ = 1.0
        for td in DROPS:
            for wrap in (0.0, SECONDS, -SECONDS):
                x = t + wrap - td
                if -0.55 <= x < -0.35:  # pops up
                    z += 0.42 * ease_out((x + 0.55) / 0.2)
                elif -0.35 <= x < 0:  # and drops back onto the tower
                    u = (x + 0.35) / 0.35
                    z += 0.42 * (1 - ease_in(u))
                    s_ += 0.1 * smooth((u - 0.5) / 0.5)
                s_ -= 0.22 * kick(x, freq=2.6, damp=7, attack=0.02)
        sq = squash(s_)
        return pin_base @ trs((0, 0, z), scale=sq)

    animate(pin, pin_fn)

    def campus_z(x, y):
        if math.hypot(x - usc.x, y - 0.9) < 1.35:
            return 0.1
        if ((x - 0.6) / 2.25) ** 2 + ((y - 4.2) / 1.8) ** 2 < 1:
            return 0.11
        return H.terrain_h(x, y) + 0.03

    def in_plaza(x, y):
        return ((x - 0.6) / 2.45) ** 2 + ((y - 4.2) / 2.0) ** 2 < 1

    RING_DUR, R0, R1 = 2.4, 1.35, 7.5

    def ring_r(x):
        return R0 + (R1 - R0) * ease_out(x / RING_DUR) if x >= 0 else -1

    def ring_hit(d):
        """When does a ring launched at 0 reach distance d?"""
        if d <= R0:
            return 0.0
        lo, hi = 0.0, RING_DUR
        for _ in range(40):
            mid = (lo + hi) / 2
            if ring_r(mid) < d:
                lo = mid
            else:
                hi = mid
        return lo if d < R1 else None

    card = H.clay("card", rough=0.38)
    NR = 44
    for k in range(NR):
        a = k * math.tau / NR

        def ring_fn(t, a=a):
            for td in DROPS:
                for wrap in (0.0, SECONDS, -SECONDS):
                    x = t + wrap - td
                    if 0 <= x < RING_DUR:
                        rr = ring_r(x)
                        px, py = usc.x + math.cos(a) * rr, usc.y + math.sin(a) * rr
                        fade = smooth(x / 0.12) * (1 - smooth((x - 0.9) / (RING_DUR - 0.9)))
                        if in_plaza(px, py):
                            fade = 0.0
                        rb = 0.05 * fade
                        if rb > 1e-4:
                            return trs((px, py, campus_z(px, py) + rb * 0.8), scale=(rb,) * 3)
            return trs((usc.x, usc.y, -1), scale=(1e-4,) * 3)

        animate(bead("RingDot", card, (0, 0, 0), 0.05), ring_fn)

    # ---- every building hops as the ring reaches it; downtown hops as a wave
    bldg = []
    for o in objs:
        if o.name.endswith("_hold") and o.name.startswith("Building_"):
            bldg.append((o, o.location.copy()))
    towers = sorted([o for o in objs if o.name.startswith("Tower") and not o.name.startswith("TowerCap")],
                    key=lambda o: o.name)
    caps = [o for o in objs if o.name.startswith("TowerCap")]
    for i, tw in enumerate(towers):
        cap = min(caps, key=lambda c: (Vector((c.location.x, c.location.y)) - Vector((tw.location.x, tw.location.y))).length)
        g = group(f"TowerGrp{i}", [tw, cap], (tw.location.x, tw.location.y, 0.11))
        bldg.append((g, g.location.copy()))
    halls = [o for o in objs if o.name.startswith(("Hall", "HallRoof"))]
    for xoff in (-0.75, 0.7):
        hx = usc.x + xoff
        mine = [o for o in halls if abs(o.location.x - hx) < 0.2]
        g = group("HallGrp", mine, (hx, mine[0].location.y, 0.1))
        bldg.append((g, g.location.copy()))
    camp = [bpy.data.objects[n] for n in ("Campanile", "Belfry", "Spire")]
    g = group("CampGrp", camp, (usc.x, usc.y, 0.1))
    bldg.append((g, g.location.copy()))

    for ob, loc in bldg:
        base = ob.matrix_basis.copy()
        d = math.hypot(loc.x - usc.x, loc.y - usc.y)
        hits = []
        if ob.name.startswith("CampGrp"):
            hits = [td + 0.01 for td in DROPS]
        else:
            th = ring_hit(d)
            if th is not None:
                hits = [td + th for td in DROPS]
        amp = 1.0 if d < 3 else 0.8

        def b_fn(t, base=base, hits=hits, amp=amp):
            s_ = 1.0
            z = 0.0
            for th in hits:
                for wrap in (0.0, SECONDS, -SECONDS):
                    x = t + wrap - th
                    if 0 <= x < 0.32:
                        u = x / 0.32
                        z += 0.09 * amp * 4 * u * (1 - u)
                        s_ += 0.07 * amp * math.sin(math.pi * clamp01(u / 0.5)) * (1 - u)
                    s_ -= 0.08 * amp * kick(x - 0.32, freq=3, damp=9, attack=0.02)
            sq = squash(s_)
            return Matrix.Translation((0, 0, z)) @ base @ Matrix.Diagonal(Vector((sq.x, sq.y, sq.z, 1)))

        animate(ob, b_fn)

    # ---- bushes breathe, out of phase by where they sit
    for o in [o for o in objs if o.name.startswith("Bush")]:
        base = o.matrix_basis.copy()
        ph = (o.location.x * 0.13 + o.location.y * 0.07) % 1.0

        def bush_fn(t, base=base, ph=ph):
            s_ = 1 + 0.035 * wave(t, 2, ph)
            return base @ Matrix.Diagonal(Vector((1 / math.sqrt(s_), 1 / math.sqrt(s_), s_, 1)))

        animate(o, bush_fn)

    # ---- cars on the freeway: inbound to downtown and outbound, one loop per trip
    pts = [Vector(p) for p in [(4.5, -6.5, 0), (2.2, -3.2, 0), (-0.6, -1.4, 0), (-1.2, 0.6, 0),
                               (-0.8, 2.2, 0), (0.6, 2.4, 0)]]
    axis = M.catmull(pts, per_unit=24)
    acc = [0.0]
    for a_, b_ in zip(axis, axis[1:]):
        acc.append(acc[-1] + (b_ - a_).length)
    total = acc[-1]

    def along(s_):
        dd = s_ * total
        for i in range(len(acc) - 1):
            if acc[i + 1] >= dd:
                f = (dd - acc[i]) / max(acc[i + 1] - acc[i], 1e-9)
                p = axis[i].lerp(axis[i + 1], f)
                q = axis[min(i + 1, len(axis) - 1)] - axis[i]
                return p, q.normalized()
        return axis[-1], (axis[-1] - axis[-2]).normalized()

    colors = ["card", "sky", "gold", "cream", "coral", "leaf_deep", "card"]
    cars = [(0.0, 1), (0.25, 1), (0.5, 1), (0.75, 1), (0.12, -1), (0.45, -1), (0.79, -1)]
    for i, ((s0, dirn), key) in enumerate(zip(cars, colors)):
        body = M.rounded_box("CarBody", (0.2, 0.11, 0.07), H.clay(key, rough=0.45), bevel=0.03,
                             location=(0, 0, 0.065))
        cab = M.rounded_box("CarCab", (0.11, 0.095, 0.06), H.clay("cream", rough=0.5), bevel=0.025,
                            location=(-0.015, 0, 0.12))
        wheels = [M.cylinder("Wheel", 0.028, 0.02, H.clay("ink", rough=0.6), location=(wx, wy, 0.028),
                             axis="Y", bevel=0.006, segments=24)
                  for wx in (-0.06, 0.06) for wy in (-0.05, 0.05)]
        car = group(f"Car{i}", [body, cab] + wheels, (0, 0, 0))

        def car_fn(t, s0=s0, dirn=dirn, i=i):
            s_ = (s0 + t / SECONDS) % 1.0
            sp = s_ if dirn > 0 else 1 - s_
            p, q = along(sp)
            if dirn < 0:
                q = -q
            n = Vector((-q.y, q.x, 0)).normalized()
            p = p - n * 0.11  # drive on the right
            # inbound cars shrink into downtown; outbound ones are born there
            k = 1 - smooth((s_ - 0.93) / 0.07) if dirn > 0 else smooth(s_ / 0.07)
            k = max(k, 1e-4)
            bob = 0.006 * abs(math.sin(math.tau * s_ * 22 + i))
            z = H.terrain_h(p.x, p.y) + 0.035 + bob
            return trs((p.x, p.y, z), Euler((0, 0, math.atan2(q.y, q.x))), (k, k, k))

        animate(car, car_fn)



# ---------------------------------------------------------------- apply

def loop_apply(w, h):
    """/apply's own scene, used nowhere else: a student's desk, a laptop
    typing a project, the project popping out of the screen and landing on a
    small globe as a cardinal pin. You'd build real AI for clients anywhere."""
    T_POP, FLY = 2.3, 0.7
    T_LAND = T_POP + FLY
    T_CLEAR = 4.8

    # the desk: a warm sweep, the frame's own peach
    sw = H.sweep("tan")
    sw.data.materials[0] = M.clay("F2C9A0", rough=0.7, bump=0.5)

    # laptop: a gold base, a navy lid tilted back, code typing on its screen
    lx, ly = -0.3, 0.12
    base = M.rounded_box("LapBase", (0.92, 0.62, 0.05), H.clay("gold"), bevel=0.02, location=(lx, ly, 0.025))
    keys = M.rounded_box("LapKeys", (0.76, 0.3, 0.012), H.clay("gold_deep", rough=0.6), bevel=0.005,
                         subdiv=0, location=(lx, ly + 0.07, 0.052))
    pad = M.rounded_box("LapPad", (0.26, 0.14, 0.008), H.clay("cream", rough=0.6), bevel=0.004, subdiv=0,
                        location=(lx, ly - 0.19, 0.051))
    hinge = Vector((lx, ly + 0.31, 0.05))
    lid = M.rounded_box("LapLid", (0.92, 0.04, 0.6), H.clay("gold"), bevel=0.02, location=(0, 0, 0.3))
    screen = M.rounded_box("LapScreen", (0.8, 0.012, 0.48), H.clay("navy", rough=0.45), bevel=0.01, subdiv=0,
                           location=(0, -0.022, 0.31))
    lid_g = group("Lid", [], hinge)
    for o in (lid, screen):
        o.parent = lid_g
    lid_g.rotation_euler = (math.radians(-14), 0, 0)
    laptop = group("Laptop", [base, keys, pad, lid_g], (lx, ly, 0.0))

    # code bars on the screen, typed one after another, cleared before the loop ends
    bars = [(0.42, "cream"), (0.3, "gold"), (0.5, "cream"), (0.22, "card"), (0.36, "cream"), (0.28, "gold")]
    x_left = -0.34
    for i, (bw, key) in enumerate(bars):
        bar = M.rounded_box(f"Code{i}", (1.0, 0.006, 0.034), H.clay(key, rough=0.5), bevel=0.003, subdiv=0)
        bar.parent = lid_g
        z = 0.49 - i * 0.068
        t0 = 0.15 + i * 0.3

        def bar_fn(t, bw=bw, z=z, t0=t0, i=i):
            grow = smooth((t - t0) / 0.26)
            clear = smooth((t - (T_CLEAR + 0.06 * (len(bars) - i))) / 0.18)
            ln = bw * grow * (1 - clear)
            if ln < 1e-4:
                return trs((x_left, -0.03, z), scale=(1e-4,) * 3)
            return trs((x_left + ln / 2, -0.03, z), scale=(ln, 1.0, 1.0))

        animate(bar, bar_fn)

    lap_base = laptop.matrix_basis.copy()

    def lap_fn(t):
        s_ = 1.0 + 0.008 * wave(t, 2)
        for i in range(len(bars)):
            s_ -= 0.012 * kick(t - (0.15 + i * 0.3), freq=4, damp=12)
        if T_POP - 0.3 <= t < T_POP:
            s_ -= 0.08 * smooth((t - (T_POP - 0.3)) / 0.3)
        elif T_POP <= t < T_POP + 0.08:
            s_ -= 0.08 * (1 - smooth((t - T_POP) / 0.08))
        s_ += 0.06 * kick(t - T_POP, freq=3, damp=8, attack=0.02)
        return lap_base @ Matrix.Diagonal(Vector(tuple(squash(s_)) + (1,)))

    animate(laptop, lap_fn)

    # a cardinal mug with steam that rises forever
    mx, my = 0.42, -0.42
    mug = M.cylinder("Mug", 0.1, 0.22, H.clay("card", rough=0.45), location=(mx, my, 0.11), bevel=0.02)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.06, minor_radius=0.018, location=(mx + 0.11, my, 0.12),
                                     rotation=(math.pi / 2, 0, 0))
    handle = bpy.context.active_object
    handle.data.materials.append(H.clay("card", rough=0.45))
    bpy.ops.object.shade_smooth()
    M.cylinder("Coffee", 0.085, 0.01, H.clay("ink", rough=0.3), location=(mx, my, 0.215), bevel=0.0)
    paper = H.clay("paper", rough=0.8)
    for k in range(3):
        puff = M.sphere("Steam", 0.045, paper, location=(mx, my, 0.3))

        def puff_fn(t, k=k):
            u = ((t / 2.0) + k / 3) % 1.0  # each puff rises for 2 s, three in flight
            r = 0.035 + 0.04 * u
            k_ = smooth(u / 0.15) * (1 - smooth((u - 0.6) / 0.4))
            x = mx + 0.025 * math.sin(math.tau * (u * 1.5 + k * 0.3))
            return trs((x, my, 0.27 + 0.42 * u), scale=(max(k_, 1e-4) * r / 0.045,) * 3)

        animate(puff, puff_fn)

    # books stacked behind the laptop
    b1 = M.rounded_box("Book", (0.5, 0.36, 0.07), H.clay("sky"), bevel=0.02, location=(-1.05, 0.55, 0.035))
    b1.rotation_euler = (0, 0, math.radians(12))
    b2 = M.rounded_box("Book", (0.44, 0.32, 0.06), H.clay("leaf"), bevel=0.02, location=(-1.03, 0.55, 0.1))
    b2.rotation_euler = (0, 0, math.radians(-6))

    # the globe on its stand, where the project lands
    gx, gy = 0.86, 0.32
    stand = M.cylinder("GlobeFoot", 0.15, 0.04, H.clay("gold"), location=(gx, gy, 0.02), bevel=0.015)
    post = M.cylinder("GlobePost", 0.025, 0.2, H.clay("gold_deep"), location=(gx, gy, 0.13), bevel=0.008)
    gz = 0.04 + 0.2 + 0.26
    ball_ = M.sphere("Globe", 0.26, H.clay("sky", rough=0.45), location=(gx, gy, gz))
    land = []
    rnd = random.Random(4)
    for (th, ph, r) in [(0.4, 0.9, 0.13), (1.1, 1.3, 0.1), (2.2, 0.7, 0.12), (3.0, 1.6, 0.09), (4.2, 1.0, 0.13),
                        (5.3, 1.9, 0.1), (0.9, 2.2, 0.08)]:
        d = Vector((math.sin(ph) * math.cos(th), math.sin(ph) * math.sin(th), math.cos(ph)))
        c = M.sphere("Land", r, H.clay("leaf", rough=0.55), location=Vector((gx, gy, gz)) + d * 0.235)
        c.scale = (1.0, 1.0, 0.35)
        c.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
        land.append(c)
    globe = group("GlobeGrp", [ball_] + land, (gx, gy, gz))
    stand_g = group("Stand", [stand, post, globe], (gx, gy, 0.0))
    top = Vector((gx, gy, gz + 0.26))
    pin_dot = M.sphere("PinDot", 0.06, H.clay("card", rough=0.35), location=(0, 0, 0.16))
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=0.052, radius2=0.0, depth=0.12)
    pin_tip = M.new_mesh_obj("PinTip", bm, H.clay("card", rough=0.35))
    pin_tip.location = (0, 0, 0.08)
    pin_tip.rotation_euler = (math.pi, 0, 0)
    pin = group("Pin", [pin_dot, pin_tip], (0, 0, 0))
    pin.parent = globe
    bpy.context.view_layer.update()
    pin_local = globe.matrix_world.inverted() @ (top - Vector((0, 0, 0.02)))

    def pin_fn(t):
        k = M.back_out(clamp01((t - T_LAND) / 0.3), s=2.2) * (1 - smooth((t - T_CLEAR) / 0.25))
        k = max(k, 1e-4)
        s_ = 1 - 0.18 * kick(t - T_LAND - 0.25, freq=3, damp=8)
        sq = squash(s_)
        return trs(pin_local, scale=(k * sq.x, k * sq.y, k * sq.z))

    animate(pin, pin_fn)

    st_base = stand_g.matrix_basis.copy()
    gl_base = globe.matrix_basis.copy()

    def stand_fn(t):
        s_ = 1 - 0.1 * kick(t - T_LAND, freq=2.8, damp=7, attack=0.02)
        return st_base @ Matrix.Diagonal(Vector(tuple(squash(s_)) + (1,)))

    def globe_fn(t):
        # a slow nod, and a wobble when the project lands on it
        a = math.radians(4) * wave(t, 1) + math.radians(9) * kick(t - T_LAND, freq=1.8, damp=4)
        return gl_base @ Euler((a * 0.4, a, 0)).to_matrix().to_4x4()

    animate(stand_g, stand_fn)
    animate(globe, globe_fn)

    # the project: a gold block that pops out of the screen and flies to the globe
    blk = M.rounded_box("Project", (0.13, 0.13, 0.13), H.clay("gold", rough=0.4), bevel=0.04)
    blk_g = group("ProjectGrp", [blk], (0, 0, 0))
    bpy.context.view_layer.update()
    p0 = lid_g.matrix_world @ Vector((0, -0.08, 0.3))
    p2 = top + Vector((0, 0, 0.06))
    p1 = (p0 + p2) / 2 + Vector((0, -0.25, 0.75))

    def blk_fn(t):
        x = (t - T_POP) / FLY
        if x < 0 or x > 1.12:
            return trs(p0, scale=(1e-4,) * 3)
        u = clamp01(x)
        p = bezier(p0, p1, p2, 0.6 * u + 0.4 * smooth(u))
        v = bezier_d(p0, p1, p2, u)
        grow = M.back_out(clamp01(x / 0.18))
        gone = 1 - smooth((x - 1.0) / 0.12)
        st_ = 1 + 0.25 * math.sin(math.pi * u)
        k = max(0.9 * grow * gone, 1e-4)
        spin = Euler((u * math.tau * 0.75, u * math.pi, 0)).to_matrix().to_4x4()
        aim = v.normalized().to_track_quat("Z", "Y").to_matrix().to_4x4()
        return trs(p, aim) @ Matrix.Diagonal(Vector((k / math.sqrt(st_), k / math.sqrt(st_), k * st_, 1))) \
            @ spin

    animate(blk_g, blk_fn)

    # a cardinal trail of dots behind it, and a ring of dots where it lands
    card = H.clay("card", rough=0.38)
    K = 11
    for k in range(K):
        uk = 0.08 + 0.84 * k / (K - 1)
        pk = bezier(p0, p1, p2, uk)
        xs = [j / 300 for j in range(301)]
        xk = min(xs, key=lambda x: abs(0.6 * x + 0.4 * smooth(x) - uk))
        tk = T_POP + xk * FLY
        d = bead("Trail", card, pk, 0.018)

        def tr_fn(t, tk=tk, pk=pk):
            x = t - tk
            if x < 0 or x > 0.7:
                return trs(pk, scale=(1e-4,) * 3)
            k_ = M.back_out(clamp01(x / 0.12)) * (1 - smooth((x - 0.25) / 0.45))
            return trs(pk, scale=(max(0.018 * k_, 1e-4),) * 3)

        animate(d, tr_fn)

    NR = 28
    for k in range(NR):
        a = k * math.tau / NR

        def ring_fn(t, a=a):
            x = t - T_LAND
            if x < 0 or x > 1.4:
                return trs((gx, gy, -1), scale=(1e-4,) * 3)
            rr = 0.2 + 1.3 * ease_out(x / 1.4)
            fade = smooth(x / 0.1) * (1 - smooth((x - 0.5) / 0.9))
            rb = max(0.022 * fade, 1e-4)
            return trs((gx + math.cos(a) * rr, gy + math.sin(a) * rr, rb * 0.8), scale=(rb,) * 3)

        animate(bead("RingDot", card, (0, 0, 0), 0.022), ring_fn)

    floor = M.clay("D9A47A", rough=0.6, bump=0.4)

    def avoid(x, y):
        return (abs(x - lx) < 0.56 and abs(y - ly) < 0.42) or math.hypot(x - mx, y - my) < 0.22 \
            or math.hypot(x - gx, y - gy) < 0.22 or (abs(x + 1.04) < 0.32 and abs(y - 0.55) < 0.26)

    dot_floor((gx, gy), 3.0, 0.17, 0.016, floor, hops=[(T_LAND, 0.035, 2.4)], keep=0.8, seed=9, avoid=avoid)

    # light and camera, solved on the whole desk
    ctr, rad = H.subject_bounds([laptop, stand_g, mug])
    H.area_key(ctr, az=-38, el=52, dist=4.4, size=1.3, power=330, color=(1.0, 0.95, 0.88))
    H.world_fill("FBE2C8", "F2CDA8", 0.6)
    H.solved_camera(ctr + Vector((0, 0, 0.12)), rad, az=16, el=24, lens=55, share=1.05, aspect=w / h,
                    place_x=0.5, place_y=0.47, fstop=4.0)

LOOPS = {"mailbox": (loop_mailbox, 4 / 3, 1200), "writer": (loop_writer, 16 / 9, 2400),
         "world": (loop_world, 2.0, 2400), "apply": (loop_apply, 4 / 3, 1200)}


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--hero", required=True, choices=list(LOOPS))
    ap.add_argument("--out", required=True)
    ap.add_argument("--res", type=int, default=0)
    ap.add_argument("--samples", type=int, default=SAMPLES)
    ap.add_argument("--test", type=float, default=None)
    ap.add_argument("--strip", action="store_true")
    ap.add_argument("--dry", action="store_true")
    a = ap.parse_args(argv)
    fn, aspect, default_w = LOOPS[a.hero]
    w = a.res or default_w
    h = int(round(w / aspect / 2) * 2)
    os.makedirs(a.out, exist_ok=True)
    H.reset()
    ANIM.clear()
    fn(w, h)
    bake_all()
    H.setup_render(w, h, a.samples)
    sc = bpy.context.scene
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = 0, N - 1
    sc.render.use_motion_blur = True
    sc.render.motion_blur_shutter = 0.4
    sc.render.use_persistent_data = True
    sc.cycles.seed = 7
    sc.cycles.use_animated_seed = False
    if a.dry:  # build and bake only: catches a broken scene without a render
        print("DRY", a.hero, len(ANIM), "animated objects", w, h)
        return
    if a.test is not None:
        sc.frame_set(int(round(a.test * FPS)) % N)
        sc.render.filepath = os.path.join(a.out, "test.png")
        bpy.ops.render.render(write_still=True)
        print("WROTE", sc.render.filepath, w, h)
        if a.strip:
            sc.render.resolution_percentage = 25
            sc.cycles.samples = 12
            for i in range(8):
                sc.frame_set(int(i * N / 8))
                sc.render.filepath = os.path.join(a.out, f"strip_{i}.png")
                bpy.ops.render.render(write_still=True)
        return
    sc.render.filepath = os.path.join(a.out, "f_")
    sc.render.use_overwrite = False
    sc.render.use_placeholder = True
    bpy.ops.render.render(animation=True)
    print("RENDERED", a.out, N, w, h)


if __name__ == "__main__":
    main()
