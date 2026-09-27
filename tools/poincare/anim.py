"""
Swinging Atwood's machine: trajectories -> Poincaré section, animated.

Left: the machine itself (counterweight on the left pulley, swinging mass on the
right), several initial conditions overlaid, each in its own ink, with a fading
tail behind the swinging mass. Right: the (r, p_r) section. Every time a mass
passes straight below its pulley moving anticlockwise (theta = 0, theta_dot > 0)
a point lands on the section in that orbit's ink. The full section, integrated
from a grid of initial conditions, sits behind it in a faint grey so the viewer
sees the accumulating points find their place in it.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np
import heyoka as hy
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.collections import LineCollection

import sam
import render
from render import INK, VERMILION, TEXT, is_chaotic

GREEN = "#24402f"
GREY = "#241d1a"
# frames are drawn on white so the page can multiply them onto its paper
# (mix-blend-mode in style.css); the poster is saved with a transparent ground
GROUND = "white"
PULLEY = 0.035
HERE = Path(__file__).parent
OUT = HERE / "out"
FRAMES = HERE / "frames"


# ------------------------------------------------------------- integration
def integrate(ic, mu, t_lim, dt=0.01, g=1.0):
    """Dense trajectory on a fixed grid plus exact section crossings."""
    ta, cb = sam.make_ta(mu, g, megno=False)
    ta.time = 0.0
    ta.state[:] = ic
    grid = np.arange(0.0, t_lim + dt / 2, dt)
    out = ta.propagate_grid(grid)
    states = out[-1]  # (len(grid), 4)
    cross = np.array(cb.pts).reshape(-1, 3)  # r, p_r, t
    return grid, states, cross


def pick_ics(mu, n=18, t_lim=1000.0, n_reg=4, n_sea=2):
    """Choose orbits from the cached grid: regular ones spread from tight island
    cores to wide outer rings, plus orbits in the chaotic sea."""
    d = sam.run_grid(mu, n, t_lim)
    ics, megno = d["ics"], d["megno"]
    chaotic = is_chaotic(megno)
    cover, dim = [], []
    for p in d["pts"]:
        if len(p) < 120:
            cover.append(np.inf); dim.append(np.nan); continue
        x, y = sam.warp(p[:, 0], p[:, 1], mu)
        h40, _, _ = np.histogram2d(x, y, bins=40, range=[[0, 1], [0, 1]])
        h20, _, _ = np.histogram2d(x, y, bins=20, range=[[0, 1], [0, 1]])
        cover.append((h40 > 0).mean())
        # box-counting slope between the two resolutions: ~1 for a curve
        # (an island ring), ~0.3 for a sparse 2-D scatter (sticky chaos)
        dim.append(np.log2((h40 > 0).sum() / (h20 > 0).sum()))
    cover, dim = np.array(cover), np.array(dim)
    # regular orbits: clearly regular by MEGNO and tracing a thin curve;
    # pick them greedily to be far apart on the section (different islands)
    cen_all = np.array([[np.mean(v) for v in sam.warp(p[:, 0], p[:, 1], mu)] if len(p) else [np.nan, np.nan]
                        for p in d["pts"]])
    # every point (not just the mean) must sit away from the frame edge
    inside = np.array([len(p) > 0 and np.all(np.percentile(sam.warp(p[:, 0], p[:, 1], mu), [2, 98]) > 0)
                       and np.percentile(sam.warp(p[:, 0], p[:, 1], mu)[1], 2) > 0.12
                       and np.percentile(sam.warp(p[:, 0], p[:, 1], mu)[1], 98) < 0.88
                       and np.percentile(sam.warp(p[:, 0], p[:, 1], mu)[0], 2) > 0.06
                       and np.percentile(sam.warp(p[:, 0], p[:, 1], mu)[0], 98) < 0.94
                       for p in d["pts"]])
    ncells = np.array([np.inf if len(p) < 120 else
                       (np.histogram2d(*sam.warp(p[:, 0], p[:, 1], mu), bins=40, range=[[0, 1], [0, 1]])[0] > 0).sum()
                       for p in d["pts"]])
    reg = np.where((megno < 2.02) & (dim > 0.8) & (dim < 1.3) & inside & (ncells <= 90))[0]
    cen = cen_all[reg]
    chosen = [reg[np.argmin(cover[reg])]]
    while len(chosen) < n_reg:
        cc = np.array([[np.mean(v) for v in sam.warp(d["pts"][i][:, 0], d["pts"][i][:, 1], mu)] for i in chosen])
        dist = np.min(np.linalg.norm(cen[:, None, :] - cc[None, :, :], axis=2), axis=1)
        chosen.append(reg[np.argmax(dist)])
    sea = np.where(chaotic & np.isfinite(cover))[0]
    sea = list(sea[np.argsort(-cover[sea])][:n_sea])
    return [ics[i] for i in [*chosen, *sea]], d


# ------------------------------------------------------------- drawing
def machine_xy(state, a=0.62, L=1.05):
    r, th = state[0], state[1]
    cw = (-a, -(L - r))                          # counterweight
    m = (a + r * np.sin(th), -r * np.cos(th))    # swinging mass
    return cw, m


OCHRE, SLATE, PLUM = "#b8862b", "#4a6478", "#6e3a52"
PALETTE = (INK, VERMILION, OCHRE, SLATE, PLUM)
SEA_INKS = (GREEN, "#3f6b5a")


def machine_limits(trajs, a, L, t_lim, pad=0.07, label_top=0.20):
    """Axis limits that hold every bob's whole swing, the counterweights and the
    M / m labels above the pulleys (the old fixed limits cut off the top)."""
    xs, ys = [-a - PULLEY, a + PULLEY], [label_top]
    for grid, states, _ in trajs:
        s = states[grid <= t_lim + 1e-9]
        r, th = s[:, 0], s[:, 1]
        xs += [np.min(a + r * np.sin(th)), np.max(a + r * np.sin(th))]
        ys += [np.min(-r * np.cos(th)), np.max(-r * np.cos(th)), np.min(-(L - r))]
    return (min(xs) - pad, max(xs) + pad), (min(ys) - pad, max(ys) + pad)


def check_in_frame(ax, trajs, a, L, margin_px):
    """Every bob and counterweight position, in pixels, stays margin_px inside the axes."""
    bb = ax.get_window_extent()
    worst = np.inf
    for grid, states, _ in trajs:
        r, th = states[:, 0], states[:, 1]
        for xy in (np.c_[a + r * np.sin(th), -r * np.cos(th)], np.c_[np.full_like(r, -a), -(L - r)]):
            px = ax.transData.transform(xy)
            worst = min(worst, (px[:, 0] - bb.x0).min(), (bb.x1 - px[:, 0]).min(),
                        (px[:, 1] - bb.y0).min(), (bb.y1 - px[:, 1]).min())
    assert worst >= margin_px, f"a bob leaves the frame (closest {worst:.1f}px from the edge)"
    return worst


def build(mu=2.3, t_lim=240.0, fps=30, seconds=24, W=1600, H=800, tail=4.0,
          name="sam_section_anim", inks=PALETTE, n_reg=4, n_sea=1, scale=1.0, crf=24):
    ics, d = pick_ics(mu, n_reg=n_reg, n_sea=n_sea)
    inks = [*inks[:n_reg], *SEA_INKS[:n_sea]]   # regular orbits in the inks, sea orbits in green
    trajs = [integrate(ic, mu, t_lim) for ic in ics]
    n_frames = fps * seconds
    # time warp: ease in slowly so the first swings are legible, then run
    u = np.linspace(0, 1, n_frames)
    T = t_lim * (0.12 * u + 0.88 * u**2.2)

    dpi = 100 * scale
    fig = plt.figure(figsize=(W / 100, H / 100), dpi=dpi, facecolor=GROUND)
    axL = fig.add_axes([0.02, 0.08, 0.52, 0.86]); axR = fig.add_axes([0.57, 0.12, 0.40, 0.82])
    for ax in (axL, axR):
        ax.set_facecolor(GROUND); ax.set_xticks([]); ax.set_yticks([])
        for s in ax.spines.values(): s.set_visible(False)
    a, L = 0.5, 0.85 + 1.0 / (mu - 1.0) * 0.35
    rmax = 1.0 / (mu - 1.0)
    xlim, ylim = machine_limits(trajs, a, L, t_lim)
    axL.set_xlim(*xlim); axL.set_ylim(*ylim); axL.set_aspect("equal")
    axR.set_xlim(-0.02, 1.02); axR.set_ylim(-0.02, 1.02); axR.set_aspect("equal")

    # static machine parts
    # open pulleys (no fill, so nothing opaque sits on a transparent poster):
    # the bar and strings stop at the rims instead of being hidden underneath
    axL.plot([-a + PULLEY, a - PULLEY], [0, 0], color=INK, lw=1.0, solid_capstyle="round")
    for x in (-a, a):
        axL.add_patch(plt.Circle((x, 0), PULLEY, fc="none", ec=INK, lw=1.2, zorder=5))
    axL.text(-a, 0.12, "M", ha="center", va="bottom", family=TEXT, fontsize=17 * scale, color=INK, style="italic")
    axL.text(a, 0.12, "m", ha="center", va="bottom", family=TEXT, fontsize=17 * scale, color=INK, style="italic")
    axL.text(0.0, -0.03, f"Swinging Atwood's machine,  $\\mu$ = M/m = {mu:g}",
             ha="left", va="top", family=TEXT, fontsize=17 * scale, color=INK, transform=axL.transAxes)

    # faint full section behind
    chaotic = is_chaotic(d["megno"])
    for p in d["pts"]:
        if len(p) == 0: continue
        x, y = sam.warp(p[:200, 0], p[:200, 1], mu)
        axR.scatter(x, y, s=0.5 * scale, c=GREY, alpha=0.10, lw=0, rasterized=True)
    axR.text(0.0, -0.06, "Section at $\\theta$ = 0\n(the bob straight below its pulley, swinging anticlockwise)",
             ha="left", va="top", family=TEXT, fontsize=16 * scale, color=INK, transform=axR.transAxes)
    axR.text(1.0, 1.02, "$p_r$ against $r$", ha="right", va="bottom", family=TEXT,
             fontsize=16 * scale, color=render.INK, transform=axR.transAxes)
    # frame edge for the section
    axR.add_patch(plt.Rectangle((0, 0), 1, 1, fc="none", ec=INK, lw=0.6, alpha=0.5))

    # dynamic artists
    tails, strings, masses, cws, pts, rings = [], [], [], [], [], []
    for ink in inks:
        lc = LineCollection([], colors=ink, linewidths=1.2 * scale, capstyle="round"); axL.add_collection(lc); tails.append(lc)
        (s1,) = axL.plot([], [], color=ink, lw=0.7 * scale, alpha=0.55); strings.append(s1)
        (m1,) = axL.plot([], [], "o", color=ink, ms=7 * scale, zorder=6); masses.append(m1)
        (c1,) = axL.plot([], [], "s", color=ink, ms=8 * scale, zorder=6, alpha=0.9); cws.append(c1)
        sc = axR.scatter([], [], s=9 * scale, c=ink, lw=0, zorder=4); pts.append(sc)
        (rg,) = axR.plot([], [], "o", mfc="none", mec=ink, mew=1.0 * scale, ms=14 * scale, zorder=5); rings.append(rg)

    fig.canvas.draw()
    print(f"machine limits x {xlim[0]:.2f}..{xlim[1]:.2f}, y {ylim[0]:.2f}..{ylim[1]:.2f}; "
          f"closest bob {check_in_frame(axL, trajs, a, L, margin_px=8 * scale):.0f}px from the edge")

    FRAMES.mkdir(exist_ok=True)
    for f in FRAMES.glob("*.png"): f.unlink()
    canvas = fig.canvas
    for k in range(n_frames):
        t = T[k]
        for i, (grid, states, cross) in enumerate(trajs):
            j = int(t / 0.01)
            j0 = max(0, int((t - tail) / 0.01))
            seg = states[j0:j + 1]
            xy = np.stack([a + seg[:, 0] * np.sin(seg[:, 1]), -seg[:, 0] * np.cos(seg[:, 1])], 1)
            if len(xy) > 2:
                segs = np.stack([xy[:-1], xy[1:]], 1)
                al = np.linspace(0.0, 1.0, len(segs)) ** 1.5
                tails[i].set_segments(segs)
                tails[i].set_alpha(None)
                rgba = np.tile(matplotlib.colors.to_rgba(inks[i]), (len(segs), 1)); rgba[:, 3] = al * 0.9
                tails[i].set_color(rgba)
            cw, m = machine_xy(states[j], a, L)
            u = np.array([m[0] - a, m[1]]); u = u / max(np.hypot(*u), 1e-9)
            strings[i].set_data([cw[0], -a, np.nan, a + PULLEY * u[0], m[0]],
                                [cw[1], -PULLEY, np.nan, PULLEY * u[1], m[1]])
            masses[i].set_data([m[0]], [m[1]]); cws[i].set_data([cw[0]], [cw[1]])
            c = cross[cross[:, 2] <= t]
            if len(c):
                x, y = sam.warp(c[:, 0], c[:, 1], mu)
                pts[i].set_offsets(np.c_[x, y])
                age = t - c[-1, 2]
                if age < 1.5:
                    rings[i].set_data([x[-1]], [y[-1]]); rings[i].set_markersize((14 - 8 * age / 1.5) * scale)
                    rings[i].set_alpha(1 - age / 1.5)
                else:
                    rings[i].set_data([], [])
        fig.savefig(FRAMES / f"f_{k:04d}.png", dpi=dpi, facecolor=GROUND)
        if k % 60 == 0:
            print(f"frame {k}/{n_frames}")
    # poster: the last frame (all crossings in place) on a transparent ground
    OUT.mkdir(exist_ok=True)
    fig.savefig(OUT / f"{name}-poster.png", dpi=dpi, transparent=True)
    plt.close(fig)

    mp4 = OUT / f"{name}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", str(FRAMES / "f_%04d.png"),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", str(crf),
                    "-preset", "slow", "-movflags", "+faststart", str(mp4)], check=True)
    gif = OUT / f"{name}.gif"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", str(FRAMES / "f_%04d.png"),
                    "-vf", "fps=20,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3",
                    str(gif)], check=True)
    return mp4, gif


if __name__ == "__main__":
    import sys
    mu = float(sys.argv[1]) if len(sys.argv) > 1 else 2.3
    build(mu=mu)
