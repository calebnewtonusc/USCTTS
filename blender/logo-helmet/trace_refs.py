"""Trace the Corinthian silhouettes from the two reference photos.

side:  Walters Art Museum 54.2304, profile (CC0), face to the left
front: Munich Corinthian bronze, c. 500 BCE (Wikimedia Commons)

Writes trace.json with both outlines in helmet units (cheek point z = 0,
crown z = HEIGHT), and overlay PNGs to check the trace against the photos.
"""

import json
import sys

import numpy as np
from PIL import Image, ImageDraw

REF = sys.argv[1]
OUT = sys.argv[2]
HEIGHT = 2.4


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    a, b = np.array(pts[0], float), np.array(pts[-1], float)
    d = b - a
    n = np.linalg.norm(d) or 1.0
    dist = [abs((d[0] * (p[1] - a[1]) - d[1] * (p[0] - a[0]))) / n for p in pts]
    i = int(np.argmax(dist))
    if dist[i] > eps:
        return rdp(pts[: i + 1], eps)[:-1] + rdp(pts[i:], eps)
    return [pts[0], pts[-1]]


def side():
    im = Image.open(f"{REF}/w_Profile.jpg").convert("L")
    g = np.asarray(im, float)
    bg = np.median(g[:, :40], axis=1, keepdims=True)  # the backdrop darkens toward the top
    m = g < bg - 35
    m[:40, :] = False
    m[350:, :] = False  # the stand base
    m[296:, 240:292] = False  # the pole under the helmet
    cols = [x for x in range(g.shape[1]) if m[:, x].any()]
    top, bot = {}, {}
    for x in cols:
        ys = np.nonzero(m[:, x])[0]
        top[x], bot[x] = ys.min(), ys.max()
    # the pole columns: bridge the lower edge straight across
    xs = sorted(top)
    xs = [x for x in xs if bot[x] - top[x] > 4]
    # glare on the crown reads as background in a few columns: take the
    # highest edge nearby
    t0 = dict(top)
    for x in xs:
        top[x] = min(t0.get(k, 10**6) for k in range(x - 12, x + 13))
    # the pole hides the lower edge from x 236 to 300: bridge it straight
    a, b = 236, 300
    for x in xs:
        if a < x < b:
            bot[x] = bot[a] + (bot[b] - bot[a]) * (x - a) / (b - a)
    upper = [(x, top[x]) for x in xs]
    lower = [(x, bot[x]) for x in reversed(xs)]
    poly = upper + lower
    return im, poly


def front():
    im = Image.open(f"{REF}/munich.jpg").convert("L")
    g = np.asarray(im, float)
    m = g > 38
    rows = [y for y in range(g.shape[0]) if m[y].sum() > 3]
    half, cy, mids = [], [], []
    for y in rows:
        xs = np.nonzero(m[y])[0]
        half.append((xs.max() - xs.min()) / 2)
        mids.append((xs.max() + xs.min()) / 2)
        cy.append(y)
    front.mid = float(np.median(mids))
    return im, cy, half


def main():
    im_s, ps = side()
    ys = [p[1] for p in ps]
    y0, y1 = min(ys), max(ys)
    s = HEIGHT / (y1 - y0)
    xs = [p[0] for p in ps]
    xmid = (min(xs) + max(xs)) / 2
    side_u = [((x - xmid) * s, (y1 - y) * s) for x, y in ps]
    side_simple = rdp(side_u, 0.035)

    im_f, rows, half = front()
    fy0, fy1 = min(rows), max(rows)
    fs = HEIGHT / (fy1 - fy0)
    right = [(h * fs, (fy1 - y) * fs) for y, h in zip(rows, half)]
    right = rdp(right, 0.05)  # coarse on purpose: few big facets
    front_u = right + [(-y, z) for y, z in reversed(right)]

    json.dump({"side": side_simple, "front": front_u}, open(f"{OUT}/trace.json", "w"), indent=1)
    print("side pts", len(side_simple), "front pts", len(front_u))
    print("side length", round(max(p[0] for p in side_u) - min(p[0] for p in side_u), 3),
          "front width", round(2 * max(p[0] for p in right), 3))

    # overlays
    ov = im_s.convert("RGB")
    d = ImageDraw.Draw(ov)
    d.line([(x / s + xmid, y1 - z / s) for x, z in side_simple] + [(side_simple[0][0] / s + xmid, y1 - side_simple[0][1] / s)], fill=(255, 40, 40), width=3)
    ov.save(f"{OUT}/trace_side.png")
    ov = im_f.convert("RGB")
    d = ImageDraw.Draw(ov)
    cx = front.mid
    d.line([(cx + y / fs, fy1 - z / fs) for y, z in front_u] + [(cx + front_u[0][0] / fs, fy1 - front_u[0][1] / fs)], fill=(255, 40, 40), width=3)
    ov.save(f"{OUT}/trace_front.png")


main()
