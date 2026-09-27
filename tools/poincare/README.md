# Poincaré plates for the site

Re-implementation of the swinging Atwood's machine (SAM) section generator from the
ESA notebooks, against current heyoka (pip install heyoka), used for the plates and
animation on connorsteph.github.io/projects/poincare.html.

    sam.py     integrate an n x n grid of initial conditions at mass ratio mu, record
               theta = 0 crossings (r, p_r, t) and a MEGNO chaos indicator per orbit;
               results cached in cache/*.npz (a 18x18 grid at t=1000 takes ~6 s on 4 Linux cores; one
               run on a Mac with heyoka 7.13 stalled for >10 min, cause unknown --
               if it recurs, time sam._run_one on a single orbit to see whether it is
               the multiprocessing pool rather than the integration)
    render.py  ink-on-paper plates from the cache: header strip (frieze), grid plates,
               single sections; regular orbits in one ink, chaotic (MEGNO > 2.3) in another
    anim.py    the machine + section animation: picks island / sea orbits from the cache,
               integrates them densely, renders frames, encodes mp4 + gif with ffmpeg.
               The machine panel's limits come from the orbits themselves (every
               swing stays in frame; the build asserts it). Frames are drawn on white
               and the site multiplies the video onto the paper (style.css); the
               poster (last frame) is a transparent PNG. `python3 anim.py` -> out/,
               then copy out/sam_section_anim.mp4 and -poster.png to
               static/projects/poincare/sam-anim.mp4 / sam-anim-poster.png.
               ~5 min for 720 frames at 1600x800; the mp4 is ~2.6 MB (crf 24).

Fonts: Libre Caslon Text / Display TTFs go in fonts/ (from Google Fonts).
Changes from the notebook version: no HamiltonianSystemsTools dependency (the SAM
equations are written out), the tangent vector is renormalised every 20 time units so
MEGNO never overflows on strongly chaotic orbits, the outermost p_r initial conditions
are trimmed 3% (they print as bars on the frame edge), and the unit-square warp bug in
the single-mu cells is gone.
