# connorsteph.github.io — working notes for Claude

Plain static site, no build step (hand-written HTML/CSS/JS, served by GitHub Pages).
Preview: `python3 -m http.server 8080` → http://localhost:8080. Work on `dev`; `master` is live.

## Etiquette
- Several Claude sessions often edit this repo at once. Edit in place, check `git status`
  before overwriting, stage only the files you touched, and commit often.
- Big drafts and test renders do not go in git (this repo is what Pages publishes).
  Put them in `Claude outputs/` (gitignored) and, when they matter, copy them to the Drive folder below.

## Look and feel (settled Sept 2026)
- Frame "F1": 250px always-open left nav column (name top-left, numbered sections), cream paper page.
  Nav column is forest-green book cloth. "Cozy and intentionally dated."
- Type: Libre Caslon Display + Libre Caslon Text for everything.
- Inks: ink `#241d1a`, forest green `#24402f` (also the cloth), vermilion accent.
  Widened palette for multi-series figures: ochre `#b8862b`, slate `#4a6478`, plum.
- Figure captions: always in the ink colour (never accent/green), sized to stay readable at page width.
- Copy: plain words. No magazine-bit copy ("Issue 01", bylines, punned headlines, "continued on"),
  no in-jokes or unexplained jargon.
- Textures in `static/textures/` are real scans from Made by Gray's "Essential Textures" pack (licensed).
  Programmatic (SVG-filter) textures were tried and rejected.
- Landing plate: De Jong attractor drawn "ink on the page" (transparent canvas multiplied onto the sheet,
  `data-mode="ink"` in js/header.js). Controls should be subtle: text-style system menu, params panel
  that closes on click-away. `js/plates.js` draws a grid of small ink plates.
- Work page (projects.html) is a broadsheet-style column layout — intentionally busy; the nav margin
  also lists each work item.

## Pages and their assets
| page | assets | made by |
|---|---|---|
| index.html | live canvas (js/header.js, js/systems.js, js/plates.js) | JS |
| about.html | static/rnasep/frieze.png | ~/repos/blender/rnase_p |
| projects/atom1.html | static/rnasep/folds-header.png, folds.png, turntable-vermilion.gif, chemical-probing.svg | ~/repos/blender/rna_folds, rnase_p, diagrams/chemical_probing |
| projects/poincare.html | static/projects/poincare/sam-header.png, sam-scan.png, sam-anim.mp4 (+ poster) | tools/poincare |
| projects.html | sam-anim-poster.png as the Poincaré item's still | tools/poincare |

## Asset pipelines
- **Poincaré / swinging Atwood's machine (SAM)** — `tools/poincare/` (see its README). heyoka + matplotlib.
  `sam.py` integrates grids and caches sections (cache/ is gitignored — regenerate, ~10–40 s per μ);
  `render.py` makes the header strip / scan plate; `anim.py` the machine + section animation (ffmpeg).
  Needs Libre Caslon TTFs in `tools/poincare/fonts/` (Google Fonts).
  Decisions: header = six sections at μ = 1.5, 2.3, 2.7, 3, 3.1, 15 on transparent ground; islands in ink,
  chaotic sea in forest green (per orbit, MEGNO > 2.3). Animation at μ = 2.3: five bobs (ink, vermilion,
  ochre, slate for island orbits; green for a sea orbit), each bob's crossings in its colour over a faint
  grey full section. A μ = 1.8 cut exists in Drive. Old `poincare_realtime.gif` / `poincare_sampled.png`
  are unreferenced now.
  The original ESA research code (SAM + Hénon Poincaré-map repos, paper code, wall-art renders) is at
  `~/Documents/projects/esa_work` — reference only, large.
- **RNA renders (Blender)** — separate repo `~/repos/blender` (branch `rnase_p`, no GitHub remote yet).
  `tools/build_geometry.py` (biotite + marching cubes → JSON/OBJ), `tools/render_ink.py` (bpy, Cycles +
  Freestyle), READMEs in `rnase_p/`, `rna_folds/`, `diagrams/chemical_probing/`. Use biotite for structure
  geometry (base pairs etc.).
  RNase P (PDB 6AHR apo; 6AHU has tRNA): RNA as ribbon or sticks, proteins as soft stippled blobs, see-through
  stipple; liked stipple ink and flat two-ink silhouettes, disliked the translucent "pearl" look. Rods must
  join the backbone. RNA-fold gallery: ≤100 nt folds, protein stripped, stippled ribbons alternating ink /
  vermilion (green optional), captions = PDB id + short name.

## Drafts and originals (Google Drive)
`My Drive/Documents/site-assets/` (synced locally at ~/google_drive/Documents/site-assets):
- `site-repo-claude-outputs/` — RNase P + RNA fold style tests, turntables, favicon tries, map sketches, hero grid
- `esa-claude-outputs/` — SAM animation μ = 1.8 and 2.3 gifs, ink variant comparison
- `esa-preview/` — downsized copies of the old ESA figures (Hénon sections, SAM panels, μ scans)

## Scratch pages (untracked, local only)
`plates-test.html` (attractor plate on different grounds), `hero-test.html` (landing hero variants),
`sketch-maps.html` (candidate maps for plates).

## Open threads / ideas
- Contact + nav: real LinkedIn URL (TODO in contact.html and js/nav.js); fill three project years; CV copy
  still says Atomic AI in present tense.
- Replace placeholder textures/images with Connor's own scans and photos over time.
- JS-drawn assets for the site (interest, not started).
- Earlier idea, parked: a natural object (e.g. a pothos draped over a horizontal line) compositing
  digital-feeling parts, in place of the dynamical systems.
- Poincaré animation: it was an experiment in whether trajectories ↔ map can be made clear — revisit if it
  doesn't read well on the page; μ = 1.8 alternative available.
