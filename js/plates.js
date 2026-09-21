// --- MANY PLATES ---
// Runs one small ink-mode plate per element matching [data-plate-system].
// Same drawing as header.js's ink mode, with fewer trajectories per plate.

(function () {
    const plates = Array.from(document.querySelectorAll('[data-plate-system]'));
    if (!plates.length) return;

    const NX = 48, NY = 32;              // trajectories per plate
    const BASE_FADE = 0.04, FPS = 30;
    const inkColor = '#241d1a', inkAlpha = 0.6;
    const map = (v, a, b, c, d) => (v - a) * (d - c) / (b - a) + c;

    const sims = plates.map(el => {
        const name = el.dataset.plateSystem;
        const sys = DYNAMICAL_SYSTEMS[name];
        if (!sys) { console.warn(`Unknown system ${name}`); return null; }
        const canvas = document.createElement('canvas');
        el.appendChild(canvas);
        return { el, sys, canvas, ctx: canvas.getContext('2d'), pts: [], time: 0 };
    }).filter(Boolean);

    function size(sim) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        sim.canvas.width = Math.round(sim.el.clientWidth * dpr);
        sim.canvas.height = Math.round(sim.el.clientHeight * dpr);
        sim.ctx.clearRect(0, 0, sim.canvas.width, sim.canvas.height);
        sim.pts = []; sim.time = 0;
        if (sim.sys.prepare) sim.sys.prepare();
        for (let i = 0; i < NX * NY; i++) sim.pts.push(sim.sys.initialConditions());
    }

    function step(sim) {
        const { sys, ctx, canvas, pts } = sim;
        const params = {};
        for (const k in sys.evolution) { const e = sys.evolution[k]; params[k] = e.center + e.func(sim.time * e.speed) * e.range; }
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = `rgba(0,0,0,${sys.fadeRate ?? BASE_FADE})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = inkColor; ctx.globalAlpha = inkAlpha;
        const W = canvas.width, H = canvas.height, lim = Math.max(W, H);
        for (const p of pts) {
            const n = sys.updateFunction(p, params); p.x = n.x; p.y = n.y;
            const cx = map(p.x, sys.mapRange.xMin, sys.mapRange.xMax, 0, W);
            const cy = map(p.y, sys.mapRange.yMin, sys.mapRange.yMax, 0, H);
            if (!isFinite(cx) || !isFinite(cy) || cx < -lim || cx > W + lim || cy < -lim || cy > H + lim) {
                const r = sys.initialConditions(); p.x = r.x; p.y = r.y; continue;
            }
            ctx.fillRect(cx, cy, 1.2, 1.2);
        }
        ctx.globalAlpha = 1; sim.time++;
    }

    let last = 0, raf = null;
    function loop(t) {
        raf = requestAnimationFrame(loop);
        if (t - last < 1000 / FPS) return;
        last = t; sims.forEach(step);
    }
    function start() { if (!raf) { last = performance.now(); loop(last); } }
    function stop() { cancelAnimationFrame(raf); raf = null; }
    let runningBeforeHide = false;

    sims.forEach(size);
    window.addEventListener('resize', () => sims.forEach(size));
    document.addEventListener('visibilitychange', () => { if (document.hidden) { runningBeforeHide = !!raf; stop(); } else if (runningBeforeHide) start(); });
    start();
    window.platesGrid = { start, stop, resize: () => sims.forEach(size) };
})();
