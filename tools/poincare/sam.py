"""
Swinging Atwood's Machine (SAM): Poincaré sections with heyoka.

Standalone re-implementation of the section generator from the ESA notebooks
(parameter_regression_from_return_maps_paper_code/SAM_wall_art.ipynb), with
two additions:
  * every orbit carries a MEGNO indicator so it can be labelled regular / chaotic
  * results are cached to .npz so plates can be re-styled without re-integrating

Coordinates: q = (r, theta), p = (p_r, p_theta)
    H = p_r^2 / (2 (mu+1)) + p_theta^2 / (2 r^2) + g r (mu - cos theta)
Section: theta = 0 (mod 2 pi), crossed with theta_dot > 0.
Plotted: (r, p_r), warped onto the unit square as in the notebook.
"""
from __future__ import annotations

import os
import time
from multiprocessing import Pool
from pathlib import Path

import numpy as np
import heyoka as hy

CACHE = Path(__file__).parent / "cache"
CACHE.mkdir(exist_ok=True)

# ---------------------------------------------------------------- dynamics
r, th, pr, pth = hy.make_vars("r", "th", "pr", "pth")
MU, G = hy.par[0], hy.par[1]

H_expr = pr**2 / (2 * (MU + 1)) + pth**2 / (2 * r**2) + G * r * (MU - hy.cos(th))

ODE = [
    (r, pr / (MU + 1)),
    (th, pth / r**2),
    (pr, pth**2 / r**3 - G * (MU - hy.cos(th))),
    (pth, -G * r * hy.sin(th)),
]

# MEGNO augmentation: tangent vector d (4) + Y, Ymean
d = hy.make_vars("d0", "d1", "d2", "d3")
Y, Ym = hy.make_vars("Y", "Ym")
state_vars = [r, th, pr, pth]
A = [[hy.diff(rhs, v) for v in state_vars] for _, rhs in ODE]
d_dot = [sum(A[i][j] * d[j] for j in range(4)) for i in range(4)]
dd = sum(d[i] * d_dot[i] for i in range(4))
d2 = sum(d[i] * d[i] for i in range(4))
ODE_MEGNO = [
    *ODE,
    *[(d[i], d_dot[i]) for i in range(4)],
    (Y, 2.0 * dd / d2 - Y / (hy.time + 1e-12)),
    (Ym, (Y - Ym) / (hy.time + 1e-12)),
]


class Crossings:
    """nt_event callback: record (r, p_r, t) at theta = 0 mod 2pi crossings."""

    def __init__(self):
        self.pts = []

    def __call__(self, ta, t, d_sgn):
        ta.update_d_output(t)
        s = ta.d_output
        if np.cos(s[1]) > 0:
            self.pts.append((s[0], s[2], t))
        return False  # keep going


def make_ta(mu, g=1.0, megno=True):
    sys = ODE_MEGNO if megno else ODE
    n = 10 if megno else 4
    cb = Crossings()
    ev = hy.nt_event(hy.sin(th), cb, direction=hy.event_direction.positive)
    ta = hy.taylor_adaptive(sys, np.zeros(n), pars=[mu, g], nt_events=[ev], tol=1e-15)
    # heyoka deep-copies the callback; the live one hangs off the integrator
    return ta, ta.nt_events[0].callback


# ---------------------------------------------------------------- initial conditions
def ic_grid(mu, E=1.0, g=1.0, n=15, eps=1e-3, edge=0.03):
    """Grid of (r, p_r) on the theta=0 section, p_theta chosen (positive root) so H=E."""
    ics = []
    for rr in np.linspace(eps, E / (mu - 1.0) - eps, n):
        pmax = np.sqrt(2 * (mu + 1.0) * (E - (mu - 1.0) * rr))
        # keep a small margin off the p_r boundary: those orbits (p_theta ~ 0,
        # the pure up-and-down Atwood mode) hug the frame edge and print as bars
        for pp in np.linspace(-pmax * (1 - edge), pmax * (1 - edge), n):
            rest = E - pp**2 / (2 * (mu + 1.0)) - g * rr * (mu - 1.0)
            if rest <= 0:
                continue
            ics.append([rr, 0.0, pp, np.sqrt(2 * rr**2 * rest)])
    return np.array(ics)


def warp(rr, pp, mu, E=1.0):
    """Map (r, p_r) onto the unit square (notebook convention)."""
    x = rr * (mu - 1.0) / E
    y = pp / (2 * np.sqrt(2 * (mu + 1) * (E - (mu - 1) * rr))) + 0.5
    return x, y


# ---------------------------------------------------------------- worker
_TA = {}


def _init(mu, g):
    _TA["ta"], _TA["cb"] = make_ta(mu, g, megno=True)


def _run_one(args):
    ic, t_lim = args
    ta, cb = _TA["ta"], _TA["cb"]
    cb.pts.clear()
    ta.time = 0.0
    rng = np.random.default_rng(abs(hash(tuple(ic))) % (2**32))
    dvec = rng.normal(size=4)
    dvec /= np.linalg.norm(dvec)
    ta.state[:] = [*ic, *dvec, 0.0, 0.0]
    # integrate in chunks, renormalising the tangent vector between them so it
    # never overflows on strongly chaotic orbits (MEGNO only uses d.d'/d.d, which
    # is scale-free, so this leaves the indicator untouched)
    chunk = 20.0
    t = 0.0
    while t < t_lim - 1e-9:
        t = min(t + chunk, t_lim)
        out = ta.propagate_until(t, max_steps=2_000_000)
        if out[0] != hy.taylor_outcome.time_limit:
            break
        nrm = np.linalg.norm(ta.state[4:8])
        ta.state[4:8] /= nrm
    pts = np.array(cb.pts, dtype=np.float64).reshape(-1, 3)
    return pts, float(ta.state[9]), float(ta.time)


def run_grid(mu, n=15, t_lim=1000.0, E=1.0, g=1.0, workers=None, force=False):
    """Integrate an n x n grid at mass ratio mu. Returns dict with per-orbit crossings and MEGNO."""
    tag = f"sam_mu={mu}_n={n}_t={t_lim}_E={E}"
    f = CACHE / (tag + ".npz")
    if f.exists() and not force:
        z = np.load(f, allow_pickle=True)
        return dict(z)
    ics = ic_grid(mu, E, g, n)
    workers = workers or os.cpu_count()
    t0 = time.time()
    with Pool(workers, initializer=_init, initargs=(mu, g)) as pool:
        res = pool.map(_run_one, [(ic, t_lim) for ic in ics], chunksize=4)
    pts = np.array([p for p, _, _ in res], dtype=object)
    megno = np.array([m for _, m, _ in res])
    tend = np.array([t for _, _, t in res])
    print(f"mu={mu}: {len(ics)} orbits, {sum(len(p) for p in pts)} crossings, "
          f"{time.time()-t0:.1f}s; MEGNO median {np.median(megno):.2f}")
    out = dict(mu=mu, E=E, g=g, ics=ics, pts=pts, megno=megno, tend=tend)
    np.savez(f, **out)
    return out


if __name__ == "__main__":
    import sys
    mu = float(sys.argv[1]) if len(sys.argv) > 1 else 2.3
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 8
    t = float(sys.argv[3]) if len(sys.argv) > 3 else 200.0
    run_grid(mu, n, t)
