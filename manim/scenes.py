"""Explainer clips for the usctts.com home page week story.

Each scene carries one idea about how a piece of the AI work actually runs,
and is drawn for light grounds (paper, cream) with a transparent background.
Render and encode with ./render.sh, which writes public/tts/manim/.

Laid out for the x-ray panel, which shows a clip 360 to 480px wide. At 400px
one frame unit is about 28px, so body type is 56pt and up. The first layout
used 22 to 46pt and four-column tables, and review 4 found it unreadable at
that size: "Aug 19" overlapped and Geist Mono at 26pt aliased "Dan" into
"Dam". So: sans for data, no corner titles, no column headers, few labels.
"""

from pathlib import Path

import manimpango
import numpy as np
from manim import (
    BOLD,
    DOWN,
    LEFT,
    MEDIUM,
    PI,
    RIGHT,
    UP,
    AnimationGroup,
    Circle,
    Create,
    DashedLine,
    Dot,
    FadeIn,
    FadeOut,
    GrowFromCenter,
    GrowFromEdge,
    LaggedStart,
    Line,
    ManimColor,
    Polygon,
    Rectangle,
    ReplacementTransform,
    RoundedRectangle,
    Scene,
    Text,
    TransformFromCopy,
    ValueTracker,
    VGroup,
    VMobject,
    always_redraw,
    config,
    interpolate_color,
    linear,
    smooth,
)

PAPER = "#FBFAF7"
INK = "#1a1416"
CARDINAL = "#990000"
GOLD = "#FFCC00"
SKY = "#5fa8e0"

# The site sets Instrument Sans and Geist Mono (components/tts/fonts.ts,
# components/tts/v4/mono.ts). Inter Tight is not installed on this Mac, so the
# clips use the site's own two families, registered from manim/fonts/.
FONTS = Path(__file__).parent / "fonts"
SANS = "Instrument Sans"
MONO = "Geist Mono"


def sans(s, size=60, color=INK, weight=MEDIUM, opacity=1.0):
    return Text(s, font=SANS, font_size=size, color=color, weight=weight).set_opacity(opacity)


def mono(s, size=48, color=INK, opacity=1.0):
    return Text(s, font=MONO, font_size=size, color=color).set_opacity(opacity)


class TTSScene(Scene):
    ground = PAPER

    def setup(self):
        for name in ("InstrumentSans.ttf", "GeistMono.ttf"):
            manimpango.register_font(str(FONTS / name))
        # manim's transparent frames come out already blended over the
        # background colour, with alpha kept: ink at 0.6 opacity rendered as
        # (115, 112, 112, a=153) over paper instead of (26, 20, 22, a=153),
        # which turned every soft edge into a pale halo on the navy and
        # cardinal grounds. Over black the blend is exactly premultiplied
        # alpha, and render.sh runs ffmpeg's unpremultiply to recover it.
        self.camera.background_color = "#000000" if config.transparent else self.ground


# ---------------------------------------------------------------------------
# 1. Who's worth reaching: a linear score splits the businesses.
# ---------------------------------------------------------------------------


def clip_line(p0, d, xmin, xmax, ymin, ymax):
    """Segment of the infinite line p0 + t d inside the box (Liang-Barsky)."""
    t0, t1 = -1e9, 1e9
    for pi, di, lo, hi in ((p0[0], d[0], xmin, xmax), (p0[1], d[1], ymin, ymax)):
        if abs(di) < 1e-9:
            continue
        a, b = (lo - pi) / di, (hi - pi) / di
        t0, t1 = max(t0, min(a, b)), min(t1, max(a, b))
    return p0 + t0 * d, p0 + t1 * d


def clip_halfplane(poly, p0, n):
    """Sutherland-Hodgman against the half-plane n.(x - p0) >= 0."""
    out = []
    for i, cur in enumerate(poly):
        prev = poly[i - 1]
        sc, sp = np.dot(n, cur - p0), np.dot(n, prev - p0)
        if sc >= 0:
            if sp < 0:
                out.append(prev + (cur - prev) * (sp / (sp - sc)))
            out.append(cur)
        elif sp >= 0:
            out.append(prev + (cur - prev) * (sp / (sp - sc)))
    return out


def normal_of(angle_deg):
    a = np.radians(angle_deg)
    return np.array([-np.sin(a), np.cos(a), 0.0])


class GtmScore(TTSScene):
    fg, pick = INK, CARDINAL

    def construct(self):
        fg, pick = self.fg, self.pick
        origin = np.array([-5.7, -3.0, 0.0])
        width, height = 8.4, 6.2

        def at(u, v):
            return origin + np.array([u * width, v * height, 0.0])

        xmin, ymin = origin[0], origin[1]
        xmax, ymax = xmin + width, ymin + height

        x_axis = Line(at(0, 0), at(1.0, 0), color=fg, stroke_width=4).set_stroke(opacity=0.5)
        y_axis = Line(at(0, 0), at(0, 1.0), color=fg, stroke_width=4).set_stroke(opacity=0.5)
        x_label = sans("nearby →", 52, fg, opacity=0.7).next_to(at(1.0, 0), DOWN, buff=0.25)
        x_label.align_to(at(1.0, 0), RIGHT)
        y_label = sans("growing →", 52, fg, opacity=0.7).rotate(PI / 2)
        y_label.next_to(at(0, 1.0), LEFT, buff=0.25).align_to(at(0, 1.0), UP)

        # Seeded so every render is the same picture. 24 dots of radius 0.16
        # at least 0.85 units apart: at 400px wide that is a 9px dot with a
        # 24px gap, the smallest that stayed distinct when downscaled.
        rng = np.random.default_rng(5)
        spots = []
        while len(spots) < 24:
            p = at(*rng.uniform(0.07, 0.93, 2))
            if all(np.linalg.norm(p - q) > 0.85 for q in spots):
                spots.append(p)
        dots = VGroup(*[Dot(p, radius=0.16, color=fg).set_fill(opacity=0.5) for p in spots])

        # The fitted line: the angle and pivot, from a small grid, that pick
        # 7 to 9 businesses and leave the most room between the line and the
        # nearest dot, so nothing sits ambiguously on it.
        best = None
        for ang in np.arange(-44, -27, 1.0):
            for fu in np.arange(0.40, 0.62, 0.02):
                for fv in np.arange(0.45, 0.68, 0.02):
                    p0, n = at(fu, fv), normal_of(ang)
                    m = [float(np.dot(n, s - p0)) for s in spots]
                    k = sum(x > 0 for x in m)
                    clear = min(abs(x) for x in m)
                    if 7 <= k <= 9 and (best is None or clear > best[0]):
                        best = (clear, ang, p0)
        _, final_angle, final_p = best

        count = ValueTracker(0)
        number = always_redraw(
            lambda: sans(str(int(round(count.get_value()))), 220, pick, BOLD).move_to([5.0, 0.7, 0])
        )
        number_label = sans("worth\nreaching", 60, fg, opacity=0.75).move_to([5.0, -1.35, 0])

        self.play(Create(x_axis), Create(y_axis), run_time=0.6)
        self.play(FadeIn(x_label), FadeIn(y_label), FadeIn(number), FadeIn(number_label), run_time=0.4)

        # Scatter in from a little way off, so they arrive rather than appear.
        for dot in dots:
            dot.save_state()
            dot.shift(np.array([*rng.normal(0, 0.9, 2), 0])).set_fill(opacity=0)
        self.play(LaggedStart(*[dot.animate.restore() for dot in dots], lag_ratio=0.04), run_time=1.3)

        # The decision line: drawn in nearly flat and low, then it rotates and
        # climbs to fit. Dots on the worth-reaching side warm as it passes.
        angle = ValueTracker(-6.0)
        start = at(0.5, 0.14)
        px, py = ValueTracker(start[0]), ValueTracker(start[1])
        warmth = ValueTracker(0.0)

        def geometry():
            a = np.radians(angle.get_value())
            d = np.array([np.cos(a), np.sin(a), 0.0])
            return np.array([px.get_value(), py.get_value(), 0.0]), d, normal_of(angle.get_value())

        def make_line():
            p0, d, _ = geometry()
            return Line(*clip_line(p0, d, xmin, xmax, ymin, ymax), color=SKY, stroke_width=10)

        def make_shade():
            p0, _, n = geometry()
            box = [np.array(c, dtype=float) for c in ((xmin, ymin, 0), (xmax, ymin, 0), (xmax, ymax, 0), (xmin, ymax, 0))]
            return Polygon(*clip_halfplane(box, p0, n), stroke_width=0, fill_color=pick, fill_opacity=0.08 * warmth.get_value())

        first = make_line()
        self.play(Create(first), run_time=0.5)
        line, shade = always_redraw(make_line), always_redraw(make_shade)
        self.remove(first)
        self.add(shade, line)
        self.bring_to_front(dots)

        c_fg, c_pick = ManimColor(fg), ManimColor(pick)

        def tint(dot, p):
            p0, _, n = geometry()
            w = np.clip(0.5 + np.dot(n, p - p0) / 0.6, 0, 1) * warmth.get_value()
            dot.set_fill(interpolate_color(c_fg, c_pick, w), opacity=0.5 + 0.2 * w)

        for dot, p in zip(dots, spots):
            dot.add_updater(lambda m, p=p: tint(m, p))

        self.play(
            angle.animate.set_value(final_angle),
            px.animate.set_value(final_p[0]),
            py.animate.set_value(final_p[1]),
            warmth.animate(rate_func=lambda t: min(1, 3 * t)).set_value(1.0),
            run_time=2.3,
            rate_func=smooth,
        )
        for dot in dots:
            dot.clear_updaters()

        p0, _, n = geometry()
        margin = [float(np.dot(n, p - p0)) for p in spots]
        picked = sorted([i for i, m in enumerate(margin) if m > 0], key=lambda i: -margin[i])
        rest = [i for i, m in enumerate(margin) if m <= 0]

        halos = [Circle(radius=0.34, color=pick, stroke_width=5).move_to(spots[i] + UP * 0.14) for i in picked]
        self.play(
            LaggedStart(
                *[
                    AnimationGroup(
                        dots[i].animate.set_fill(pick, opacity=1).scale(1.25).shift(UP * 0.14),
                        GrowFromCenter(halo),
                    )
                    for i, halo in zip(picked, halos)
                ],
                lag_ratio=0.35,
            ),
            *[dots[i].animate.set_fill(fg, opacity=0.25) for i in rest],
            count.animate.set_value(len(picked)),
            run_time=1.9,
            rate_func=linear,
        )
        self.wait(1.4)


class GtmScoreOnCardinal(GtmScore):
    """Same clip for the page's full-cardinal "finding customers" world, where
    DIRECTION-tts-v4 has the businesses worth reaching flare gold."""

    fg, pick, ground = PAPER, GOLD, CARDINAL


# ---------------------------------------------------------------------------
# 2. How a reply gets written: one likely next word at a time.
# ---------------------------------------------------------------------------

# The reply wraps onto two lines so it can be set at 66pt.
REPLY_LINES = [["Of course,", "Thursday"], ["at", "9:30", "works."]]
CANDIDATES = [
    [("Of course,", 0.58), ("Sure,", 0.22), ("Yes,", 0.14)],
    [("Thursday", 0.47), ("we", 0.26), ("that", 0.17)],
    [("at", 0.74), ("morning", 0.16), ("works", 0.10)],
    [("9:30", 0.41), ("9:00", 0.33), ("10:15", 0.18)],
    [("works.", 0.69), ("is", 0.19), ("would", 0.12)],
]


class EmailDraft(TTSScene):
    def construct(self):
        question = sans("Move my cleaning to Thursday?", 60)
        q_box = RoundedRectangle(
            width=question.width + 0.9, height=question.height + 0.8, corner_radius=0.35,
            stroke_width=0, fill_color=SKY, fill_opacity=0.2,
        )
        q_box.move_to([0, 2.85, 0]).to_edge(LEFT, buff=0.45)
        question.move_to(q_box)

        lines = VGroup(*[sans(" ".join(toks), 68) for toks in REPLY_LINES])
        lines.arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        r_box = RoundedRectangle(
            width=max(lines.width + 1.0, 8.6), height=lines.height + 0.9, corner_radius=0.35,
            stroke_color=INK, stroke_width=3, fill_color=PAPER, fill_opacity=1,
        ).set_stroke(opacity=0.25)
        r_box.move_to([0, 0.7, 0]).to_edge(RIGHT, buff=0.45)
        lines.move_to(r_box).align_to(r_box.get_left() + RIGHT * 0.5, LEFT)

        # Text drops spaces from its submobjects, so slice words by glyph count.
        slices = []
        for line, toks in zip(lines, REPLY_LINES):
            i = 0
            for tok in toks:
                n = len(tok.replace(" ", ""))
                slices.append(line[i : i + n])
                i += n
            assert i == len(line), (i, len(line))

        caret = Rectangle(width=0.08, height=0.8, stroke_width=0, fill_color=CARDINAL, fill_opacity=1)
        caret.move_to([lines.get_left()[0] + 0.05, lines[0].get_y(), 0])

        word_right, bar_left, bar_scale = -2.3, -1.9, 5.4
        row_ys = [-1.3, -2.3, -3.3]

        self.play(FadeIn(q_box, shift=UP * 0.15), FadeIn(question, shift=UP * 0.15), run_time=0.6)
        self.play(FadeIn(r_box), FadeIn(caret), run_time=0.4)
        self.wait(0.3)

        for step, cands in enumerate(CANDIDATES):
            fast = step >= 2
            rows = []
            for (word, p), y in zip(cands, row_ys):
                w = sans(word, 60).move_to([word_right, y, 0], aligned_edge=RIGHT)
                bar = Rectangle(width=p * bar_scale, height=0.5, stroke_width=0, fill_color=SKY, fill_opacity=0.9)
                bar.move_to([bar_left, y, 0], aligned_edge=LEFT)
                pct = mono(f"{round(p * 100)}%", 44, INK, 0.75).next_to(bar, RIGHT, buff=0.25)
                rows.append((w, bar, pct))
            self.play(
                LaggedStart(
                    *[AnimationGroup(FadeIn(w, shift=UP * 0.12), GrowFromEdge(bar, LEFT), FadeIn(pct)) for w, bar, pct in rows],
                    lag_ratio=0.15,
                ),
                run_time=0.35 if fast else 0.6,
            )
            self.wait(0.1 if fast else 0.35)
            top_w, top_bar, top_pct = rows[0]
            self.play(top_bar.animate.set_fill(CARDINAL, opacity=1), top_w.animate.set_color(CARDINAL), run_time=0.2 if fast else 0.3)
            target = slices[step]
            line_y = lines[0].get_y() if step < len(REPLY_LINES[0]) else lines[1].get_y()
            self.play(
                ReplacementTransform(top_w, target),
                caret.animate.move_to([target.get_right()[0] + 0.15, line_y, 0]),
                FadeOut(top_bar), FadeOut(top_pct),
                *[FadeOut(m) for w, bar, pct in rows[1:] for m in (w, bar, pct)],
                run_time=0.4 if fast else 0.55,
            )

        badge = Circle(radius=0.45, stroke_width=0, fill_color=CARDINAL, fill_opacity=1)
        badge.move_to(r_box.get_corner(DOWN + RIGHT) + LEFT * 0.25 + UP * 0.05)
        tick = VMobject(stroke_color=PAPER, stroke_width=9).set_points_as_corners(
            [badge.get_center() + np.array(p) for p in ((-0.2, 0.0, 0), (-0.05, -0.15, 0), (0.21, 0.16, 0))]
        )
        checked = sans("a person checks it", 60).next_to(badge, DOWN, buff=0.4).align_to(r_box, RIGHT)
        self.play(FadeOut(caret), GrowFromCenter(badge), run_time=0.4)
        self.play(Create(tick), FadeIn(checked, shift=UP * 0.1), run_time=0.5)
        self.wait(1.3)


# ---------------------------------------------------------------------------
# 3. Three rows, one person: entity resolution.
# ---------------------------------------------------------------------------

# Three columns, no header: the values say what they are. Each row holds a
# piece the others lack, so the merged card is fuller than any one row.
COLUMN_WIDTHS = [3.9, 5.6, 2.6]
ROWS = [
    ["Dan Ortiz", "213-555-0148", ""],
    ["dan ortiz", "", "Aug 19"],
    ["D. Ortiz", "(213) 555-0148", ""],
]


class CrmMerge(TTSScene):
    def construct(self):
        total = sum(COLUMN_WIDTHS)
        left, row_h = -total / 2 - 0.35, 1.2
        col_x, x = [], left
        for w in COLUMN_WIDTHS:
            col_x.append(x)
            x += w
        row_y = [2.45 - i * row_h for i in range(3)]

        frame = Rectangle(width=total, height=row_h * 3, stroke_color=INK, stroke_width=3)
        frame.set_stroke(opacity=0.3).move_to([left + total / 2, row_y[1], 0])
        rules = VGroup(
            *[Line([left, y - row_h / 2, 0], [left + total, y - row_h / 2, 0]) for y in row_y[:2]],
            *[Line([cx, row_y[0] + row_h / 2, 0], [cx, row_y[2] - row_h / 2, 0]) for cx in col_x[1:]],
        ).set_stroke(INK, 2, opacity=0.18)

        cells = []
        for r, values in enumerate(ROWS):
            row = []
            for c, value in enumerate(values):
                # Empty cells stay empty: a placeholder mark read as part
                # of the neighbouring value at 400px ("213-555-0148·").
                t = sans(value or " ", 52)
                t.move_to([col_x[c] + 0.3, row_y[r], 0], aligned_edge=LEFT)
                row.append(t)
            cells.append(row)
        all_cells = VGroup(*[t for row in cells for t in row])

        self.play(Create(frame), FadeIn(rules), run_time=0.5)
        self.play(LaggedStart(*[FadeIn(VGroup(*row), shift=RIGHT * 0.2) for row in cells], lag_ratio=0.3), run_time=0.9)
        self.wait(0.4)

        # Compare: the fields that agree light up and join.
        def glow(cell_list):
            return VGroup(
                *[
                    RoundedRectangle(
                        width=t.width + 0.4, height=0.9, corner_radius=0.16, stroke_width=0,
                        fill_color=SKY, fill_opacity=0.25,
                    ).move_to(t)
                    for t in cell_list
                ]
            )

        def links(cell_list):
            return VGroup(
                *[
                    Line(a.get_bottom() + DOWN * 0.18, b.get_top() + UP * 0.18, color=SKY, stroke_width=7)
                    for a, b in zip(cell_list, cell_list[1:])
                ]
            )

        names = [cells[0][0], cells[1][0], cells[2][0]]
        phones = [cells[0][1], cells[2][1]]
        name_glow, phone_glow = glow(names), glow(phones)
        name_links, phone_links = links(names), links(phones)
        self.bring_to_front(all_cells)
        self.play(FadeIn(name_glow), run_time=0.35)
        self.play(Create(name_links), run_time=0.45)
        self.play(FadeIn(phone_glow), Create(phone_links), run_time=0.55)
        self.bring_to_front(all_cells)

        bracket_x = left + total + 0.3
        bracket = VMobject(stroke_color=CARDINAL, stroke_width=7).set_points_as_corners(
            [
                [bracket_x - 0.18, row_y[0] + 0.5, 0],
                [bracket_x, row_y[0] + 0.5, 0],
                [bracket_x, row_y[2] - 0.5, 0],
                [bracket_x - 0.18, row_y[2] - 0.5, 0],
            ]
        )
        same = sans("same person", 60, CARDINAL).next_to(bracket, DOWN, buff=0.35).align_to(bracket, RIGHT)
        self.play(Create(bracket), FadeIn(same), run_time=0.5)
        self.wait(0.5)

        # Fold: the table frame becomes the card, the best value of each field
        # travels into it cleaned up, and the rest of the table folds away.
        card = RoundedRectangle(
            width=9.6, height=4.6, corner_radius=0.35, stroke_color=INK, stroke_width=3,
            fill_color=PAPER, fill_opacity=1,
        ).set_stroke(opacity=0.25)
        card.move_to([0, 0.2, 0])
        accent = Rectangle(width=0.2, height=3.7, stroke_width=0, fill_color=CARDINAL, fill_opacity=1)
        accent.move_to(card.get_left() + RIGHT * 0.5)

        inner = card.get_left()[0] + 1.1
        name = sans("Dan Ortiz", 104, INK, BOLD).move_to([inner, card.get_top()[1] - 1.05, 0], aligned_edge=LEFT)
        phone = sans("(213) 555-0148", 66).move_to([inner, name.get_y() - 1.45, 0], aligned_edge=LEFT)
        visit = sans("last visit Aug 19", 56, opacity=0.75).move_to([inner, phone.get_y() - 1.0, 0], aligned_edge=LEFT)

        rest = VGroup(rules, all_cells, name_glow, phone_glow, name_links, phone_links, bracket, same)
        self.play(
            FadeOut(rest, scale=0.8, target_position=card.get_center()),
            ReplacementTransform(frame, card),
            TransformFromCopy(cells[0][0], name),
            TransformFromCopy(cells[2][1], phone),
            TransformFromCopy(cells[1][2], visit),
            run_time=1.0,
        )
        self.play(FadeIn(accent), run_time=0.3)
        self.wait(1.6)


# ---------------------------------------------------------------------------
# 4. Teaching it so it sticks: confidence climbs lesson by lesson, and each
#    lesson forgets a little less, until it clears the line.
# ---------------------------------------------------------------------------

LESSONS = [(0.06, "ask it"), (0.30, "check it"), (0.54, "fix it"), (0.78, "own it")]
RISES = [0.26, 0.25, 0.24, 0.22]
FORGETS = [0.10, 0.06, 0.03, 0.0]
BAR = 0.74


def confidence(u):
    c = 0.06
    for (ui, _), r, f in zip(LESSONS, RISES, FORGETS):
        c += r / (1 + np.exp(-(u - ui - 0.035) / 0.011))
        c -= f * (1 - np.exp(-max(0.0, u - ui - 0.07) / 0.07))
    return c


class TeachCurve(TTSScene):
    def construct(self):
        origin = np.array([-5.9, -2.3, 0.0])
        width, height = 12.4, 5.6

        def at(u, v):
            return origin + np.array([u * width, v * height, 0.0])

        x_axis = Line(at(0, 0), at(1.0, 0), color=INK, stroke_width=4).set_stroke(opacity=0.5)
        y_axis = Line(at(0, 0), at(0, 1.0), color=INK, stroke_width=4).set_stroke(opacity=0.5)
        y_label = sans("confidence →", 48, INK, opacity=0.7).rotate(PI / 2)
        y_label.next_to(at(0, 0), LEFT, buff=0.25).align_to(at(0, 0), DOWN)

        bar = DashedLine(at(0, BAR), at(1.0, BAR), dash_length=0.25, color=INK, stroke_width=5)
        bar.set_stroke(opacity=0.55)
        goal = sans("runs it without us", 68).next_to(at(0.03, BAR), UP, buff=0.25, aligned_edge=LEFT)

        labels = []
        for ui, text in LESSONS:
            x = at(ui + 0.035, 0)
            tick = Line(x, x + DOWN * 0.2, color=INK, stroke_width=4).set_stroke(opacity=0.5)
            lab = sans(text, 52).next_to(x, DOWN, buff=0.4)
            labels.append(VGroup(tick, lab))

        u = ValueTracker(0.0)

        def curve_points(end):
            us = np.linspace(0, max(end, 1e-3), max(2, int(400 * end)))
            return [at(s, confidence(s)) for s in us]

        def make_curve():
            return VMobject(stroke_color=CARDINAL, stroke_width=12).set_points_as_corners(curve_points(u.get_value()))

        def make_fill():
            pts = curve_points(u.get_value())
            return Polygon(*pts, at(u.get_value(), 0), at(0, 0), stroke_width=0, fill_color=CARDINAL, fill_opacity=0.08)

        def make_dot():
            return Dot(at(u.get_value(), confidence(u.get_value())), radius=0.2, color=CARDINAL)

        curve, fill, dot = always_redraw(make_curve), always_redraw(make_fill), always_redraw(make_dot)

        self.play(Create(x_axis), Create(y_axis), FadeIn(y_label), run_time=0.6)
        self.play(Create(bar), FadeIn(goal), run_time=0.6)
        self.add(fill, curve, dot)

        for k, (ui, _) in enumerate(LESSONS):
            self.play(u.animate.set_value(ui + 0.1), FadeIn(labels[k], shift=UP * 0.1), run_time=0.85, rate_func=smooth)
            nxt = LESSONS[k + 1][0] if k + 1 < len(LESSONS) else 1.0
            self.play(u.animate.set_value(nxt), run_time=0.55 if k + 1 < len(LESSONS) else 0.5, rate_func=linear)

        marker = Rectangle(
            width=goal.width + 0.4, height=goal.height + 0.3, stroke_width=0, fill_color=GOLD, fill_opacity=1,
        ).move_to(goal)
        self.play(bar.animate.set_stroke(CARDINAL, opacity=1), GrowFromEdge(marker, LEFT), run_time=0.5)
        self.bring_to_front(goal)
        self.wait(1.3)
