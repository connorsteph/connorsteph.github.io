const DYNAMICAL_SYSTEMS = {
    tinkerbell: {
        name: "Tinkerbell Map",
        equation: "$$\\begin{align} x' &= x^2 - y^2 + ax + by \\\\ y' &= 2xy + cx + dy \\end{align}$$",

        // The core equations. Takes a point {x, y} and the current , returns a new {x, y}
        updateFunction: (p, params) => {
            const x_next = p.x * p.x - p.y * p.y + params.a * p.x + params.b * p.y;
            const y_next = 2 * p.x * p.y + params.c * p.x + params.d * p.y;
            return { x: x_next, y: y_next };
        },
        
        // Defines how  evolve over time
        evolution: {
            a: { center: 0.92, range: 0.08, speed: 0.00008, func: Math.sin },
            b: { center: -0.58, range: 0.05, speed: 0.00012, func: Math.cos },
            c: { center: 1.62, range: 0.15, speed: 0.00015, func: Math.sin },
            d: { center: 0.64, range: 0.08, speed: 0.0002, func: Math.cos },
        },

        // The "camera" view for this attractor
        mapRange: { xMin: -1.5, xMax: 0.8, yMin: -1.9, yMax: 1.0 },
        
        // How to create/recycle points for this system
        initialConditions: () => {
            return {
                x: Math.random() * 0.5 - 0.25,
                y: Math.random() * 0.5 - 0.25,
        };
        },
        
        // How to color the points
        colorFunction: (i, j, totalI, totalJ) => {
            const hue = (i + j) / (totalI + totalJ) * 360;
            return `hsla(${hue}, 90%, 60%, 0.7)`;
        },

        // Interactive controls configuration
        controls: {
            a: { min: 0.5, max: 1.3, step: 0.01, label: "a" },
            b: { min: -1.0, max: -0.2, step: 0.01, label: "b" },
            c: { min: 1.5, max: 2.5, step: 0.01, label: "c" },
            d: { min: 0.2, max: 0.9, step: 0.01, label: "d" }
        }
    },

    deJong: {
        name: "De Jong Attractor",
        equation: "$$\\begin{align} x' &= \\sin(ay) - \\cos(bx) \\\\ y' &= \\sin(cx) - \\cos(dy) \\end{align}$$",

        updateFunction: (p, params) => {
            const x_next = Math.sin(params.a * p.y) - Math.cos(params.b * p.x);
            const y_next = Math.sin(params.c * p.x) - Math.cos(params.d * p.y);
            return { x: x_next, y: y_next };
        },

        evolution: {
            a: { center: 1.69, range: 0.2, speed: 0.0001, func: Math.sin },
            b: { center: -2.02, range: 0.2, speed: 0.00015, func: Math.cos },
            c: { center: 2.70, range: 0.3, speed: 0.0002, func: Math.sin },
            d: { center: -2.1, range: 0.3, speed: 0.00025, func: Math.cos },
        },
        
        mapRange: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 },
        
        initialConditions: () => {
            return {
                x: Math.random() * 4 - 2, // Random start within [-2, 2]
                y: Math.random() * 4 - 2,
            };
        },
        
        colorFunction: (i, j, totalI, totalJ) => {
            const hue = (i / totalI) * 180 + 180; // Hues from cyan to magenta
            const lightness = (j / totalJ) * 40 + 30; // 30% to 70%
            return `hsla(${hue}, 95%, ${lightness}%, 0.7)`;
        },

        controls: {
            a: { min: 0.8, max: 2.0, step: 0.01, label: "a" },
            b: { min: -3.0, max: -1.5, step: 0.01, label: "b" },
            c: { min: 1.8, max: 3.0, step: 0.01, label: "c" },
            d: { min: -2.8, max: -1.4, step: 0.01, label: "d" }
        }
    },

    henon: {
        name: "Henon Map",
        equation: "$$\\begin{align} x' &= 1 - ax^2 + y \\\\ y' &= bx \\end{align}$$",

        updateFunction: (p, params) => {
            const x_next = 1 - params.a * p.x * p.x + p.y;
            const y_next = params.b * p.x;
            return { x: x_next, y: y_next };
        },

        evolution: {
            a: { center: 1.32, range: 0.1, speed: 0.01, func: Math.sin },
            b: { center: 0.89, range: 0.05, speed: 0.01, func: Math.cos },
        },

        mapRange: { xMin: -5.6, xMax: 2.6, yMin: -2.4, yMax: 2.4 },

        initialConditions: () => {
            return {
                x: Math.random() * 8 - 5, // Random start within [-5, 3]
                y: Math.random() * 0.6 - 0.3, // Random start within [-0.3, 0.3]
            };
        },

        colorFunction: (i, j, totalI, totalJ) => {
            const hue = 0; // Red hue
            const lightness = (j / totalJ) * 40 + 30; // 30% to 70%
            return `hsla(${hue}, 80%, ${lightness}%, 0.8)`;
        },

        controls: {
            a: { min: -2.0, max: 2.0, step: 0.01, label: "a" },
            b: { min: -1.0, max: 1.0, step: 0.01, label: "b" }
        }
    },

    clifford: {
        name: "Clifford Attractor",
        equation: "$$\\begin{align} x' &= \\sin(ay) + c\\cos(ax) \\\\ y' &= \\sin(bx) + d\\cos(by) \\end{align}$$",

        updateFunction: (p, params) => {
            const x_next = Math.sin(params.a * p.y) + params.c * Math.cos(params.a * p.x);
            const y_next = Math.sin(params.b * p.x) + params.d * Math.cos(params.b * p.y);
            return { x: x_next, y: y_next };
        },

        evolution: {
            a: { center: -1.55, range: 0.3, speed: 0.0001, func: Math.sin },
            b: { center: 1.18, range: 0.2, speed: 0.00012, func: Math.cos },
            c: { center: 1.0, range: 0.4, speed: 0.00015, func: Math.sin },
            d: { center: 0.7, range: 0.3, speed: 0.0002, func: Math.cos },
        },

        mapRange: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },

        initialConditions: () => {
            return {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
            };
        },

        colorFunction: (i, j, totalI, totalJ) => {
            const hue = (i / totalI) * 60 + 0; // Red to orange range (0-60)
            const saturation = (j / totalJ) * 20 + 80; // 80% to 100%
            const lightness = (i / totalI) * 30 + 50; // 50% to 80%
            return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`;
        },

        controls: {
            a: { min: -2.0, max: -0.8, step: 0.01, label: "a" },
            b: { min: 1.0, max: 2.2, step: 0.01, label: "b" },
            c: { min: 0.4, max: 1.6, step: 0.01, label: "c" },
            d: { min: 0.2, max: 1.2, step: 0.01, label: "d" }
        }
    },

    ikeda: {
        name: "Ikeda Map",
        equation: "$$\\begin{align} t &= 0.4 - \\frac{6}{1 + x^2 + y^2} \\\\ x' &= 1 + u(x\\cos t - y\\sin t) \\\\ y' &= u(x\\sin t + y\\cos t) \\end{align}$$",

        updateFunction: (p, params) => {
            const t = 0.4 - 6 / (1 + p.x * p.x + p.y * p.y);
            const c = Math.cos(t), s = Math.sin(t);
            return { x: 1 + params.u * (p.x * c - p.y * s), y: params.u * (p.x * s + p.y * c) };
        },

        evolution: {
            u: { center: 0.9, range: 0.03, speed: 0.004, func: Math.sin },
        },

        mapRange: { xMin: -0.7, xMax: 2.5, yMin: -2.6, yMax: 1.6 },

        initialConditions: () => ({ x: Math.random() * 3 - 1, y: Math.random() * 4 - 2.5 }),

        colorFunction: (i, j, totalI, totalJ) => `hsla(${(i / totalI) * 60 + 180}, 90%, 60%, 0.7)`,

        controls: {
            u: { min: 0.7, max: 0.98, step: 0.005, label: "u" }
        }
    },

    standard: {
        name: "Standard Map",
        equation: "$$\\begin{align} p' &= p + K\\sin\\theta \\\\ \\theta' &= \\theta + p' \\end{align}$$",

        updateFunction: (p, params) => {
            const TAU = 2 * Math.PI, wrap = v => ((v % TAU) + TAU) % TAU;
            const py = wrap(p.y + params.K * Math.sin(p.x));
            return { x: wrap(p.x + py), y: py };
        },

        evolution: {
            K: { center: 0.7, range: 0.2, speed: 0.002, func: Math.sin },
        },

        mapRange: { xMin: 0, xMax: 2 * Math.PI, yMin: 0, yMax: 2 * Math.PI },

        // Area-preserving, so a uniform cloud stays uniform. Start the trajectories in a few
        // dozen tight bunches instead: each bunch traces out its own orbit, islands and all.
        fadeRate: 0.006,
        seeds: [],
        prepare() {
            this.seeds = Array.from({ length: 48 }, () => ({ x: Math.random() * 2 * Math.PI, y: Math.random() * 2 * Math.PI }));
        },
        initialConditions() {
            if (!this.seeds.length) this.prepare();
            const s = this.seeds[Math.floor(Math.random() * this.seeds.length)];
            return { x: s.x + (Math.random() - 0.5) * 1e-3, y: s.y + (Math.random() - 0.5) * 1e-3 };
        },

        colorFunction: (i, j, totalI, totalJ) => `hsla(${(j / totalJ) * 120 + 200}, 80%, 60%, 0.7)`,

        controls: {
            K: { min: 0.2, max: 1.6, step: 0.01, label: "K" }
        }
    },

    gumowskiMira: {
        name: "Gumowski–Mira Map",
        equation: "$$\\begin{align} g(x) &= \\mu x + \\frac{2(1-\\mu)x^2}{1 + x^2} \\\\ x' &= y + a(1 - by^2)y + g(x) \\\\ y' &= -x + g(x') \\end{align}$$",

        updateFunction: (p, params) => {
            const g = x => params.mu * x + 2 * (1 - params.mu) * x * x / (1 + x * x);
            const xn = p.y + params.a * (1 - params.b * p.y * p.y) * p.y + g(p.x);
            return { x: xn, y: -p.x + g(xn) };
        },

        evolution: {
            mu: { center: -0.7, range: 0.1, speed: 0.003, func: Math.sin },
            a: { center: 0.008, range: 0, speed: 0, func: Math.sin },
            b: { center: 0.05, range: 0, speed: 0, func: Math.sin },
        },

        mapRange: { xMin: -19, xMax: 19, yMin: -12.5, yMax: 12.5 },
        fadeRate: 0.035,

        initialConditions: () => ({ x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 }),

        colorFunction: (i, j, totalI, totalJ) => `hsla(${(i / totalI) * 60 + 280}, 80%, 60%, 0.7)`,

        controls: {
            mu: { min: -1.0, max: 0.4, step: 0.01, label: "μ" },
            a: { min: 0, max: 0.05, step: 0.001, label: "a" },
            b: { min: 0, max: 0.2, step: 0.005, label: "b" }
        }
    },

    bedhead: {
        name: "Bedhead Attractor",
        equation: "$$\\begin{align} x' &= y\\sin\\!\\left(\\tfrac{xy}{b}\\right) + \\cos(ax - y) \\\\ y' &= x + \\frac{\\sin y}{b} \\end{align}$$",

        updateFunction: (p, params) => ({
            x: Math.sin(p.x * p.y / params.b) * p.y + Math.cos(params.a * p.x - p.y),
            y: p.x + Math.sin(p.y) / params.b,
        }),

        evolution: {
            a: { center: -0.81, range: 0.02, speed: 0.004, func: Math.sin },
            b: { center: -0.92, range: 0.02, speed: 0.003, func: Math.cos },
        },

        mapRange: { xMin: -2.3, xMax: 1.5, yMin: -1.8, yMax: 2.1 },

        initialConditions: () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }),

        colorFunction: (i, j, totalI, totalJ) => `hsla(${(i / totalI) * 40 + 20}, 85%, 60%, 0.7)`,

        controls: {
            a: { min: -1.0, max: -0.6, step: 0.005, label: "a" },
            b: { min: -1.1, max: -0.7, step: 0.005, label: "b" }
        }
    },

    svensson: {
        name: "Svensson Attractor",
        equation: "$$\\begin{align} x' &= d\\sin(ax) - \\sin(by) \\\\ y' &= c\\cos(ax) + \\cos(by) \\end{align}$$",

        updateFunction: (p, params) => ({
            x: params.d * Math.sin(params.a * p.x) - Math.sin(params.b * p.y),
            y: params.c * Math.cos(params.a * p.x) + Math.cos(params.b * p.y),
        }),

        evolution: {
            a: { center: 1.40, range: 0.1, speed: 0.002, func: Math.sin },
            b: { center: 1.56, range: 0.1, speed: 0.003, func: Math.cos },
            c: { center: 1.40, range: 0.1, speed: 0.004, func: Math.sin },
            d: { center: -6.56, range: 0.3, speed: 0.0025, func: Math.cos },
        },

        mapRange: { xMin: -8, xMax: 8, yMin: -2.8, yMax: 2.8 },

        initialConditions: () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }),

        colorFunction: (i, j, totalI, totalJ) => `hsla(${(j / totalJ) * 60 + 300}, 85%, 60%, 0.7)`,

        controls: {
            a: { min: 1.0, max: 2.0, step: 0.01, label: "a" },
            b: { min: 1.0, max: 2.0, step: 0.01, label: "b" },
            c: { min: 0.8, max: 2.0, step: 0.01, label: "c" },
            d: { min: -8.0, max: -4.0, step: 0.05, label: "d" }
        }
    },
    // You can add more systems here: Lorenz, Rossler, etc.
};