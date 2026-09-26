# Poincaré plates for the site

Re-implementation of the swinging Atwood's machine (SAM) section generator from the
ESA notebooks, against current heyoka (pip install heyoka), used for the plates and
animation on connorsteph.github.io/projects/poincare.html.

    sam.py     integrate an n x n grid of initial conditions at mass ratio mu, record
               theta = 0 crossings (r, p_r, t) and a MEGNO chaos indicator per orbit;
               results cached in cache/*.npz (a 18x18 grid at t=1000 takes ~10-40 s on 2 cores)
    render.py  ink-on-paper plates from the cache: header strip (frieze), grid plates,
               single sections; regular orbits in one ink, chaotic (MEGNO > 2.3) in another
    anim.py    the machine + section animation: picks island / sea orbits from the cache,
               integrates them densely, renders frames, encodes mp4 + gif with ffmpeg

Fonts: Libre Caslon Text / Display TTFs go in fonts/ (from Google Fonts).
Changes from the notebook version: no HamiltonianSystemsTools dependency (the SAM
equations are written out), the tangent vector is renormalised every 20 time units so
MEGNO never overflows on strongly chaotic orbits, the outermost p_r initial conditions
are trimmed 3% (they print as bars on the frame edge), and the unit-square warp bug in
the single-mu cells is gone.
