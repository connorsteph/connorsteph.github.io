"""
Ink-on-paper plates from cached SAM sections (see sam.py).

Two inks, as on the RNA fold plates: regular orbits (islands) in one,
chaotic orbits (the sea) in the other. Background transparent so the
plate sits on the site's paper texture; a cream preview is also written.
"""
from __future__ import annotations

from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
import numpy as np
from PIL import Image

import sam

HERE = Path(__file__).parent
OUT = HERE / "out"
OUT.mkdir(exist_ok=True)

INK = "#241d1a"
VERMILION = "#c8502a"
PAPER = "#f3ecdc"
CHAOS_THRESHOLD = 2.3  # MEGNO: ~2 for regular orbits, grows for chaotic ones

for f in (HERE / "fonts").glob("*.ttf"):
    font_manager.fontManager.addfont(str(f))
TEXT = "Libre Caslon Text"
DISPLAY = "Libre Caslon Display"


def is_chaotic(megno):
    m = np.asarray(megno, dtype=float)
    return np.isnan(m) | (m > CHAOS_THRESHOLD)


def draw_panel(ax, d, inks=("islands-ink", ), max_pts=None, s=0.35, alpha=1.0,
               island_ink=INK, sea_ink=VERMILION):
    """Scatter one cached section onto ax in unit-square coordinates."""
    mu = float(d["mu"])
    chaotic = is_chaotic(d["megno"])
    xs, ys, cs = [], [], []
    for p, ch in zip(d["pts"], chaotic):
        if len(p) == 0:
            continue
        if max_pts:
            p = p[:max_pts]
        x, y = sam.warp(p[:, 0], p[:, 1], mu, float(d["E"]))
        xs.append(x); ys.append(y)
        cs.append(np.full(len(x), 1 if ch else 0))
    x = np.concatenate(xs); y = np.concatenate(ys); c = np.concatenate(cs)
    # draw sea first so island rings sit on top
    for val, col in ((1, sea_ink), (0, island_ink)):
        m = c == val
        ax.scatter(x[m], y[m], s=s, c=col, lw=0, alpha=alpha, rasterized=True)
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.set_aspect("equal"); ax.axis("off")


def _save(fig, name, paper_preview=True):
    png = OUT / f"{name}.png"
    fig.savefig(png, dpi=fig.dpi, transparent=True)
    plt.close(fig)
    im = Image.open(png).convert("RGBA")
    if paper_preview:
        bg = Image.new("RGBA", im.size, PAPER)
        bg.alpha_composite(im)
        bg.convert("RGB").save(OUT / f"{name}_preview.png", optimize=True)
    return png


def frieze(mus, name, W=2000, H=415, n=18, t_lim=1000.0, max_pts=None,
           captions=True, island_ink=INK, sea_ink=VERMILION, s=0.3, scale=2, cap_pt=20):
    """Horizontal strip of sections with a caption under each (site header format)."""
    k = len(mus)
    dpi = 100 * scale
    fig = plt.figure(figsize=(W / 100, H / 100), dpi=dpi)
    cap_h = 0.20 if captions else 0.0
    side = min(H * (1 - cap_h - 0.04), W / k * 0.82)  # px
    gap = (W - k * side) / (k + 1)
    for i, mu in enumerate(mus):
        d = sam.run_grid(mu, n, t_lim)
        x0 = (gap + i * (side + gap)) / W
        y0 = cap_h + 0.02
        ax = fig.add_axes([x0, y0, side / W, side / H])
        draw_panel(ax, d, max_pts=max_pts, s=s * scale, island_ink=island_ink, sea_ink=sea_ink)
        if captions:
            fig.text(x0 + side / W / 2, cap_h * 0.5, f"$\\mu$ = {mu:g}",
                     ha="center", va="center", family=TEXT, fontsize=cap_pt, color=INK)
    return _save(fig, name)


def grid(mus, name, ncols=3, panel=520, gap=40, n=18, t_lim=1000.0, max_pts=None,
         captions=True, island_ink=INK, sea_ink=VERMILION, s=0.45, scale=2, cap_pt=20):
    """Grid plate (e.g. 4x3) for in-page use."""
    k = len(mus); nrows = int(np.ceil(k / ncols))
    cap_h = int(cap_pt * 100 / 72 * 2.2) if captions else 0
    W = ncols * panel + (ncols + 1) * gap
    H = nrows * (panel + cap_h) + (nrows + 1) * gap
    fig = plt.figure(figsize=(W / 100, H / 100), dpi=100 * scale)
    for i, mu in enumerate(mus):
        r_, c_ = divmod(i, ncols)
        d = sam.run_grid(mu, n, t_lim)
        x0 = (gap + c_ * (panel + gap)) / W
        y0 = 1 - (gap + r_ * (panel + cap_h + gap) + panel) / H
        ax = fig.add_axes([x0, y0, panel / W, panel / H])
        draw_panel(ax, d, max_pts=max_pts, s=s * scale, island_ink=island_ink, sea_ink=sea_ink)
        if captions:
            fig.text(x0 + panel / W / 2, y0 - (cap_h * 0.55) / H, f"$\\mu$ = {mu:g}",
                     ha="center", va="center", family=TEXT, fontsize=cap_pt, color=INK)
    return _save(fig, name)


def single(mu, name, size=1400, n=25, t_lim=1000.0, s=0.5, scale=2,
           island_ink=INK, sea_ink=VERMILION):
    d = sam.run_grid(mu, n, t_lim)
    fig = plt.figure(figsize=(size / 100, size / 100), dpi=100 * scale)
    ax = fig.add_axes([0.02, 0.02, 0.96, 0.96])
    draw_panel(ax, d, s=s * scale, island_ink=island_ink, sea_ink=sea_ink)
    return _save(fig, name)


if __name__ == "__main__":
    SCAN = [1.5, 1.8, 2.0, 2.3, 2.5, 2.7, 2.9, 3.0, 3.1, 8.0, 10.0, 15.0]
    SIX = [1.5, 2.3, 2.7, 3.0, 3.1, 15.0]
    frieze(SIX, "sam_frieze_6", max_pts=200)
    frieze(SIX, "sam_frieze_6_inverted", max_pts=200, island_ink=VERMILION, sea_ink=INK)
    grid(SCAN, "sam_grid_4x3", ncols=3, max_pts=250)
    print("done")
