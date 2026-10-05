"""Four explainer clips for the usctts.com home page week story.

Each scene carries one idea about how a piece of the AI work actually runs,
and is drawn for light grounds (paper, cream) with a transparent background.
Render and encode with ./render.sh, which writes public/tts/manim/.
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
    UL,
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
    config,
    VGroup,
    VMobject,
    always_redraw,
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


def sans(s, size=36, color=INK, weight=MEDIUM):
    return Text(s, font=SANS, font_size=size, color=color, weight=weight)


def mono(s, size=24, color=INK, opacity=1.0):
    return Text(s, font=MONO, font_size=size, color=color).set_opacity(opacity)


def kicker(s, color=INK):
    return mono(s.upper(), 24, color, 0.6).to_corner(UL, buff=0.5)


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
# 1. Who's worth reaching: a linear score splits ~40 businesses.
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


class GtmScore(TTSScene):
    fg, pick = INK, CARDINAL

    def construct(self):
        fg, pick = self.fg, self.pick
        origin = np.array([-5.6, -3.0, 0.0])
        width, height = 8.8, 5.5

        def at(u, v):
            return origin + np.array([u * width, v * height, 0.0])

        xmin, ymin = origin[0], origin[1]
        xmax, ymax = xmin + width, ymin + height

        title = kicker("Who’s worth reaching", fg)
        x_axis = Line(at(0, 0), at(1.02, 0), color=fg, stroke_width=2.5).set_stroke(opacity=0.5)
        y_axis = Line(at(0, 0), at(0, 1.02), color=fg, stroke_width=2.5).set_stroke(opacity=0.5)
        x_label = mono("NEARBY →", 24, fg, 0.65).next_to(at(1.02, 0), DOWN, buff=0.22)
        x_label.align_to(at(1.02, 0), RIGHT)
        y_label = mono("GROWING →", 24, fg, 0.65).rotate(PI / 2)
        y_label.next_to(at(0, 1.02), LEFT, buff=0.22).align_to(at(0, 1.02), UP)

        # Seeded so every render is the same picture; rejection sampling keeps
        # dots from touching at radius 0.075 on an 8.8 x 5.5 plot.
        rng = np.random.default_rng(11)
        uv = []
        while len(uv) < 40:
            u, v = rng.uniform(0.05, 0.95, 2)
            if all((u - a) ** 2 + ((v - b) * 0.62) ** 2 > 0.07**2 for a, b in uv):
                uv.append((u, v))
        spots = [at(u, v) for u, v in uv]
        dots = VGroup(*[Dot(p, radius=0.085, color=fg).set_fill(opacity=0.5) for p in spots])

        count = ValueTracker(0)
        number = always_redraw(
            lambda: sans(str(int(round(count.get_value()))), 132, pick, BOLD).move_to(
                [5.15, 0.55, 0]
            )
        )
        number_label = mono("WORTH\nREACHING", 26, fg, 0.65).move_to([5.15, -0.75, 0])

        self.play(FadeIn(title), Create(x_axis), Create(y_axis), run_time=0.7)
        self.play(FadeIn(x_label), FadeIn(y_label), FadeIn(number), FadeIn(number_label), run_time=0.4)

        # Scatter in from a little way off, so they arrive rather than appear.
        starts = [p + np.array([*rng.normal(0, 0.9, 2), 0]) for p in spots]
        for dot, s in zip(dots, starts):
            dot.save_state()
            dot.move_to(s).set_fill(opacity=0)
        self.play(
            LaggedStart(*[dot.animate.restore() for dot in dots], lag_ratio=0.03),
            run_time=1.4,
        )

        # The decision line: drawn in nearly flat and low, then it rotates and
        # climbs to fit. Dots on the worth-reaching side warm as it passes.
        angle = ValueTracker(-6.0)
        px, py = ValueTracker(at(0.5, 0.14)[0]), ValueTracker(at(0.5, 0.14)[1])
        warmth = ValueTracker(0.0)

        def geometry():
            a = np.radians(angle.get_value())
            d = np.array([np.cos(a), np.sin(a), 0.0])
            n = np.array([-np.sin(a), np.cos(a), 0.0])
            return np.array([px.get_value(), py.get_value(), 0.0]), d, n

        def make_line():
            p0, d, _ = geometry()
            a, b = clip_line(p0, d, xmin, xmax, ymin, ymax)
            return Line(a, b, color=SKY, stroke_width=6)

        def make_shade():
            p0, _, n = geometry()
            box = [np.array(c, dtype=float) for c in ((xmin, ymin, 0), (xmax, ymin, 0), (xmax, ymax, 0), (xmin, ymax, 0))]
            poly = clip_halfplane(box, p0, n)
            return Polygon(*poly, stroke_width=0, fill_color=pick, fill_opacity=0.07 * warmth.get_value())

        first = make_line()
        self.play(Create(first), run_time=0.6)
        line, shade = always_redraw(make_line), always_redraw(make_shade)
        self.remove(first)
        self.add(shade, line)
        self.bring_to_front(dots)

        ink, cardinal = ManimColor(fg), ManimColor(pick)

        def tint(dot, p):
            p0, _, n = geometry()
            w = np.clip(0.5 + np.dot(n, p - p0) / 0.5, 0, 1) * warmth.get_value()
            dot.set_fill(interpolate_color(ink, cardinal, w), opacity=0.5 + 0.2 * w)

        for dot, p in zip(dots, spots):
            dot.add_updater(lambda m, p=p: tint(m, p))

        # Measured: at -34 deg through (0.5, 0.58) the nearest dot clears the
        # line by 0.17 units, so no business sits ambiguously on it. -38 deg
        # through (0.52, 0.6) left one dot 0.007 away, visibly touching.
        final_p = at(0.5, 0.58)
        self.play(
            angle.animate.set_value(-34.0),
            px.animate.set_value(final_p[0]),
            py.animate.set_value(final_p[1]),
            warmth.animate(rate_func=lambda t: min(1, 3 * t)).set_value(1.0),
            run_time=2.4,
            rate_func=smooth,
        )
        for dot in dots:
            dot.clear_updaters()

        p0, _, n = geometry()
        margin = [float(np.dot(n, p - p0)) for p in spots]
        picked = sorted([i for i, m in enumerate(margin) if m > 0], key=lambda i: -margin[i])
        rest = [i for i, m in enumerate(margin) if m <= 0]

        halos = [Circle(radius=0.2, color=pick, stroke_width=2.5).move_to(spots[i] + UP * 0.12) for i in picked]
        self.play(
            LaggedStart(
                *[
                    AnimationGroup(
                        dots[i].animate.set_fill(pick, opacity=1).scale(1.3).shift(UP * 0.12),
                        GrowFromCenter(halo),
                    )
                    for i, halo in zip(picked, halos)
                ],
                lag_ratio=0.35,
            ),
            *[dots[i].animate.set_fill(fg, opacity=0.25) for i in rest],
            count.animate.set_value(len(picked)),
            run_time=2.0,
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

STEPS = [
    ("Of course,", [("Of course,", 0.58), ("Sure,", 0.22), ("Yes,", 0.14), ("Hi,", 0.06)]),
    ("Thursday", [("Thursday", 0.47), ("we", 0.26), ("that", 0.17), ("I", 0.10)]),
    ("at", [("at", 0.74), ("morning", 0.16), ("works", 0.10)]),
    ("9:30", [("9:30", 0.41), ("9:00", 0.33), ("10:15", 0.18), ("8:30", 0.08)]),
    ("works.", [("works.", 0.69), ("is", 0.19), ("would", 0.12)]),
]


class EmailDraft(TTSScene):
    def construct(self):
        title = kicker("How a reply gets written")

        question = sans("Hi! Can I move my cleaning to Thursday morning?", 36)
        q_box = RoundedRectangle(
            width=question.width + 0.7, height=question.height + 0.6, corner_radius=0.28,
            stroke_width=0, fill_color=SKY, fill_opacity=0.16,
        )
        q_box.move_to([0, 2.15, 0]).to_edge(LEFT, buff=0.6)
        question.move_to(q_box)

        tokens = [t for t, _ in STEPS]
        sentence = sans(" ".join(tokens), 46)
        r_box = RoundedRectangle(
            width=sentence.width + 0.8, height=sentence.height + 0.7, corner_radius=0.28,
            stroke_color=INK, stroke_width=2, fill_color=PAPER, fill_opacity=1,
        ).set_stroke(opacity=0.25)
        r_box.move_to([0, 0.55, 0]).to_edge(RIGHT, buff=0.6)
        sentence.move_to(r_box)

        # Text drops spaces from its submobjects, so slice words by glyph count.
        slices, i = [], 0
        for tok in tokens:
            n = len(tok.replace(" ", ""))
            slices.append(sentence[i : i + n])
            i += n
        assert i == len(sentence), (i, len(sentence))

        caret = Rectangle(width=0.05, height=0.56, stroke_width=0, fill_color=CARDINAL, fill_opacity=1)
        caret.move_to(sentence.get_left() + RIGHT * 0.05)

        panel_label = mono("NEXT WORD", 24, INK, 0.6).move_to([-4.6, -0.6, 0], aligned_edge=LEFT)
        word_right, bar_left, bar_scale = -1.5, -1.2, 5.2
        row_ys = [-1.25, -1.9, -2.55, -3.2]

        self.play(FadeIn(title), FadeIn(q_box, shift=UP * 0.15), FadeIn(question, shift=UP * 0.15), run_time=0.6)
        self.play(FadeIn(r_box), FadeIn(caret), FadeIn(panel_label), run_time=0.45)
        self.wait(0.2)

        for step, (token, cands) in enumerate(STEPS):
            fast = step >= 2
            rows = []
            for (word, p), y in zip(cands, row_ys):
                w = sans(word, 40).move_to([word_right, y, 0], aligned_edge=RIGHT)
                bar = Rectangle(width=max(p * bar_scale, 0.06), height=0.34, stroke_width=0, fill_color=SKY, fill_opacity=0.85)
                bar.move_to([bar_left, y, 0], aligned_edge=LEFT)
                pct = mono(f"{round(p * 100)}%", 26, INK, 0.7).next_to(bar, RIGHT, buff=0.2)
                rows.append((w, bar, pct))
            self.play(
                LaggedStart(
                    *[
                        AnimationGroup(FadeIn(w, shift=UP * 0.12), GrowFromEdge(bar, LEFT), FadeIn(pct))
                        for w, bar, pct in rows
                    ],
                    lag_ratio=0.15,
                ),
                run_time=0.35 if fast else 0.6,
            )
            self.wait(0.1 if fast else 0.3)
            top_w, top_bar, top_pct = rows[0]
            self.play(
                top_bar.animate.set_fill(CARDINAL, opacity=1),
                top_w.animate.set_color(CARDINAL),
                run_time=0.2 if fast else 0.3,
            )
            target = slices[step]
            self.play(
                ReplacementTransform(top_w, target),
                caret.animate.move_to([target.get_right()[0] + 0.12, caret.get_y(), 0]),
                FadeOut(top_bar), FadeOut(top_pct),
                *[FadeOut(m) for w, bar, pct in rows[1:] for m in (w, bar, pct)],
                run_time=0.4 if fast else 0.55,
            )

        badge = Circle(radius=0.3, stroke_width=0, fill_color=CARDINAL, fill_opacity=1)
        badge.move_to(r_box.get_corner(DOWN + RIGHT) + LEFT * 0.15 + UP * 0.05)
        tick = VMobject(stroke_color=PAPER, stroke_width=6).set_points_as_corners(
            [badge.get_center() + np.array(p) for p in ((-0.13, 0.0, 0), (-0.03, -0.1, 0), (0.14, 0.11, 0))]
        )
        checked = sans("a person checks it", 34).next_to(badge, DOWN, buff=0.3).align_to(r_box, RIGHT)
        self.play(FadeOut(caret), FadeOut(panel_label), GrowFromCenter(badge), run_time=0.4)
        self.play(Create(tick), FadeIn(checked, shift=UP * 0.1), run_time=0.5)
        self.wait(1.3)


# ---------------------------------------------------------------------------
# 3. Three rows, one person: entity resolution.
# ---------------------------------------------------------------------------

COLUMNS = [("NAME", 2.7), ("PHONE", 3.2), ("EMAIL", 4.75), ("LAST VISIT", 2.1)]
ROWS = [
    ["Dan Ortiz", "213-555-0148", "", "Mar 3"],
    ["dan ortiz␣", "", "dan.ortiz@example.com", ""],
    ["D. Ortiz", "(213) 555-0148", "", "Aug 19"],
]


class CrmMerge(TTSScene):
    def construct(self):
        title = kicker("Three rows, one person")

        total = sum(w for _, w in COLUMNS)
        left, top, row_h = -total / 2, 2.05, 0.72
        col_x, x = [], left
        for _, w in COLUMNS:
            col_x.append(x)
            x += w

        header = VGroup(
            *[
                mono(name, 22, INK, 0.55).move_to([cx + 0.2, top, 0], aligned_edge=LEFT)
                for (name, _), cx in zip(COLUMNS, col_x)
            ]
        )
        row_y = [top - 0.7 - i * row_h for i in range(3)]
        frame = Rectangle(width=total, height=row_h * 3, stroke_color=INK, stroke_width=2)
        frame.set_stroke(opacity=0.3).move_to([0, row_y[1], 0])
        rules = VGroup(
            *[
                Line([left, row_y[0] - row_h / 2, 0], [left + total, row_y[0] - row_h / 2, 0]),
                Line([left, row_y[1] - row_h / 2, 0], [left + total, row_y[1] - row_h / 2, 0]),
                *[Line([cx, row_y[0] + row_h / 2, 0], [cx, row_y[2] - row_h / 2, 0]) for cx in col_x[1:]],
            ]
        ).set_stroke(INK, 1.5, opacity=0.18)

        cells = []
        for r, values in enumerate(ROWS):
            row = []
            for c, value in enumerate(values):
                if value:
                    t = mono(value, 26, INK)
                else:
                    t = mono("·", 26, INK, 0.3)
                t.move_to([col_x[c] + 0.2, row_y[r], 0], aligned_edge=LEFT)
                row.append(t)
            cells.append(row)
        all_cells = VGroup(*[t for row in cells for t in row])

        self.play(FadeIn(title), Create(frame), FadeIn(header), run_time=0.6)
        self.play(
            FadeIn(rules),
            LaggedStart(*[FadeIn(VGroup(*row), shift=RIGHT * 0.2) for row in cells], lag_ratio=0.3),
            run_time=0.9,
        )
        self.wait(0.4)

        # Compare: the fields that agree light up and join.
        def glow(cell_list, color=SKY):
            return VGroup(
                *[
                    RoundedRectangle(
                        width=t.width + 0.28, height=0.5, corner_radius=0.1, stroke_width=0,
                        fill_color=color, fill_opacity=0.22,
                    ).move_to(t)
                    for t in cell_list
                ]
            )

        def links(cell_list):
            return VGroup(
                *[
                    Line(a.get_bottom() + DOWN * 0.08, b.get_top() + UP * 0.08, color=SKY, stroke_width=4)
                    for a, b in zip(cell_list, cell_list[1:])
                ]
            )

        names = [cells[0][0], cells[1][0], cells[2][0]]
        phones = [cells[0][1], cells[2][1]]
        name_glow, phone_glow = glow(names), glow(phones)
        name_links, phone_links = links(names), links(phones)
        self.play(FadeIn(name_glow), run_time=0.35)
        self.play(Create(name_links), run_time=0.45)
        self.play(FadeIn(phone_glow), Create(phone_links), run_time=0.55)

        bracket_x = left + total + 0.25
        bracket = VMobject(stroke_color=CARDINAL, stroke_width=4).set_points_as_corners(
            [
                [bracket_x - 0.12, row_y[0] + 0.3, 0],
                [bracket_x, row_y[0] + 0.3, 0],
                [bracket_x, row_y[2] - 0.3, 0],
                [bracket_x - 0.12, row_y[2] - 0.3, 0],
            ]
        )
        same = mono("same person", 24, CARDINAL).next_to(bracket, DOWN, buff=0.2).align_to(bracket, RIGHT)
        self.play(Create(bracket), FadeIn(same), run_time=0.5)
        self.wait(0.45)

        # Fold: the table frame becomes the card, the best value of each field
        # travels into it cleaned up, and the rest of the table folds away.
        card = RoundedRectangle(
            width=8.2, height=3.1, corner_radius=0.22, stroke_color=INK, stroke_width=2,
            fill_color=PAPER, fill_opacity=1,
        ).set_stroke(opacity=0.25)
        card.move_to([0, 0.35, 0])
        accent = Rectangle(width=0.12, height=2.5, stroke_width=0, fill_color=CARDINAL, fill_opacity=1)
        accent.move_to(card.get_left() + RIGHT * 0.32)

        name = sans("Dan Ortiz", 52, INK, BOLD)
        name.move_to(card.get_corner(UL) + np.array([0.75, -0.6, 0]), aligned_edge=LEFT)
        fields = [("PHONE", "(213) 555-0148"), ("EMAIL", "dan.ortiz@example.com"), ("LAST VISIT", "Aug 19")]
        keys, values = VGroup(), VGroup()
        for j, (k, v) in enumerate(fields):
            y = name.get_y() - 0.82 - j * 0.52
            keys.add(mono(k, 22, INK, 0.5).move_to([card.get_left()[0] + 0.75, y, 0], aligned_edge=LEFT))
            values.add(mono(v, 28, INK).move_to([card.get_left()[0] + 2.75, y, 0], aligned_edge=LEFT))
        stamp = mono("1 PERSON", 22, CARDINAL)
        stamp.move_to(card.get_corner(UP + RIGHT) + np.array([-0.3, -0.35, 0]), aligned_edge=RIGHT)

        # Newest visit wins, the clean phone format wins, the only email wins.
        sources = [cells[0][0], cells[2][1], cells[1][2], cells[2][3]]
        rest = VGroup(rules, header, all_cells, name_glow, phone_glow, name_links, phone_links, bracket, same)
        self.play(
            FadeOut(rest, scale=0.8, target_position=card.get_center()),
            ReplacementTransform(frame, card),
            TransformFromCopy(sources[0], name),
            *[TransformFromCopy(s, v) for s, v in zip(sources[1:], values)],
            run_time=1.0,
        )
        self.play(FadeIn(accent), FadeIn(keys), FadeIn(stamp), run_time=0.4)
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
        origin = np.array([-5.4, -2.6, 0.0])
        width, height = 10.8, 5.4

        def at(u, v):
            return origin + np.array([u * width, v * height, 0.0])

        title = kicker("Teaching it so it sticks")
        x_axis = Line(at(0, 0), at(1.02, 0), color=INK, stroke_width=2.5).set_stroke(opacity=0.5)
        y_axis = Line(at(0, 0), at(0, 1.0), color=INK, stroke_width=2.5).set_stroke(opacity=0.5)
        y_label = mono("CONFIDENCE →", 24, INK, 0.65).rotate(PI / 2)
        y_label.next_to(at(0, 1.0), LEFT, buff=0.22).align_to(at(0, 1.0), UP)

        bar = DashedLine(at(0, BAR), at(1.0, BAR), dash_length=0.16, color=INK, stroke_width=3)
        bar.set_stroke(opacity=0.55)
        goal = sans("runs it without us", 36).next_to(at(0.03, BAR), UP, buff=0.18, aligned_edge=LEFT)

        labels = []
        for k, (ui, text) in enumerate(LESSONS):
            x = at(ui + 0.035, 0)
            tick = Line(x, x + DOWN * 0.14, color=INK, stroke_width=2.5).set_stroke(opacity=0.5)
            lab = VGroup(mono(str(k + 1), 26, CARDINAL), mono(text, 26, INK)).arrange(RIGHT, buff=0.14)
            lab.next_to(x, DOWN, buff=0.3)
            labels.append(VGroup(tick, lab))

        u = ValueTracker(0.0)

        def curve_points(end):
            us = np.linspace(0, max(end, 1e-3), max(2, int(400 * end)))
            return [at(s, confidence(s)) for s in us]

        def make_curve():
            return VMobject(stroke_color=CARDINAL, stroke_width=7).set_points_as_corners(curve_points(u.get_value()))

        def make_fill():
            pts = curve_points(u.get_value())
            return Polygon(*pts, at(u.get_value(), 0), at(0, 0), stroke_width=0, fill_color=CARDINAL, fill_opacity=0.07)

        def make_dot():
            return Dot(at(u.get_value(), confidence(u.get_value())), radius=0.12, color=CARDINAL)

        curve, fill, dot = always_redraw(make_curve), always_redraw(make_fill), always_redraw(make_dot)

        self.play(FadeIn(title), Create(x_axis), Create(y_axis), FadeIn(y_label), run_time=0.6)
        self.play(Create(bar), FadeIn(goal), run_time=0.6)
        self.add(fill, curve, dot)

        for k, (ui, _) in enumerate(LESSONS):
            self.play(u.animate.set_value(ui + 0.1), FadeIn(labels[k], shift=UP * 0.1), run_time=0.85, rate_func=smooth)
            nxt = LESSONS[k + 1][0] if k + 1 < len(LESSONS) else 1.0
            self.play(u.animate.set_value(nxt), run_time=0.55 if k + 1 < len(LESSONS) else 0.5, rate_func=linear)

        marker = Rectangle(
            width=goal.width + 0.3, height=goal.height + 0.22, stroke_width=0, fill_color=GOLD, fill_opacity=1,
        ).move_to(goal)
        self.play(
            bar.animate.set_stroke(CARDINAL, opacity=1),
            GrowFromEdge(marker, LEFT),
            run_time=0.5,
        )
        self.bring_to_front(goal)
        self.wait(1.3)
