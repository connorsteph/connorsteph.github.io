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
            a: { center: 1.3, range: 0.1, speed: 0.01, func: Math.sin },
            b: { center: 0.6, range: 0.05, speed: 0.01, func: Math.cos },
        },

        mapRange: { xMin: -5.0, xMax: 3.0, yMin: -1.0, yMax: 1.0 },

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
        equation: "$$\\begin{align} t &= c - \\frac{d}{1 + x^2 + y^2} \\\\ x' &= 1 + a(x\\cos(t) - y\\sin(t)) \\\\ y' &= b(x\\sin(t) + y\\cos(t)) \\end{align}$$",

        updateFunction: (p, params) => {
            const t = params.c - params.d / (1 + p.x * p.x + p.y * p.y);
            const x_next = 1 + params.a * (p.x * Math.cos(t) - p.y * Math.sin(t));
            const y_next = params.b * (p.x * Math.sin(t) + p.y * Math.cos(t));
            return { x: x_next, y: y_next };
        },

        evolution: {
            a: { center: 0.9, range: 0.1, speed: 0.0001, func: Math.sin },
            b: { center: 0.4, range: 0.05, speed: 0.00012, func: Math.cos },
            c: { center: 0.4, range: 0.2, speed: 0.00008, func: Math.sin },
            d: { center: 6.0, range: 1.0, speed: 0.0002, func: Math.cos },
        },

        mapRange: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },

        initialConditions: () => {
            return {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
            };
        },

        colorFunction: (i, j, totalI, totalJ) => {
            const hue = (i / totalI) * 120 + 200; // Blue to cyan range (200-320)
            const saturation = (j / totalJ) * 30 + 70; // 70% to 100%
            const lightness = (i / totalI) * 25 + 45; // 45% to 70%
            return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
        },

        controls: {
            a: { min: 0.7, max: 1.1, step: 0.01, label: "a" },
            b: { min: 0.2, max: 0.6, step: 0.01, label: "b" },
            c: { min: 0.1, max: 0.8, step: 0.01, label: "c" },
            d: { min: 4.0, max: 8.0, step: 0.1, label: "d" }
        }
    },

    lozi: {
        name: "Lozi Map",
        equation: "$$\\begin{align} x' &= 1 - a|x| + y \\\\ y' &= bx \\end{align}$$",

        updateFunction: (p, params) => {
            const x_next = 1 - params.a * Math.abs(p.x) + p.y;
            const y_next = params.b * p.x;
            return { x: x_next, y: y_next };
        },

        evolution: {
            a: { center: 1.7, range: 0.2, speed: 0.0001, func: Math.sin },
            b: { center: 0.5, range: 0.05, speed: 0.00015, func: Math.cos },
        },

        mapRange: { xMin: -2.5, xMax: 2.5, yMin: -1.5, yMax: 1.5 },

        initialConditions: () => {
            return {
                x: Math.random() * 2 - 1,
                y: Math.random() * 0.5 - 0.25,
            };
        },

        colorFunction: (i, j, totalI, totalJ) => {
            const hue = (j / totalJ) * 60 + 60; // Yellow to green range (60-120)
            const saturation = (i / totalI) * 20 + 80; // 80% to 100%
            const lightness = (j / totalJ) * 35 + 40; // 40% to 75%
            return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.75)`;
        },

        controls: {
            a: { min: 1.4, max: 2.0, step: 0.01, label: "a" },
            b: { min: 0.3, max: 0.7, step: 0.01, label: "b" }
        }
    },

    duffing: {
        name: "Duffing Map",
        equation: "$$\\begin{align} x' &= y \\\\ y' &= -bx + ay - y^3 + c\\cos(dx) \\end{align}$$",

        updateFunction: (p, params) => {
            const x_next = p.y;
            const y_next = -params.b * p.x + params.a * p.y - p.y * p.y * p.y + params.c * Math.cos(params.d * p.x);
            return { x: x_next, y: y_next };
        },

        evolution: {
            a: { center: 3.05, range: 0.05, speed: 0.0001, func: Math.sin },
            b: { center: 0.24, range: 0.05, speed: 0.00012, func: Math.cos },
            c: { center: 0.28, range: 0.1, speed: 0.00008, func: Math.sin },
            d: { center: 1.04, range: 0.2, speed: 0.0002, func: Math.cos },
        },

        mapRange: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },

        initialConditions: () => {
            return {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
            };
        },

        colorFunction: (i, j, totalI, totalJ) => {
            const hue = (i / totalI) * 90 + 270; // Purple to magenta range (270-360)
            const saturation = (j / totalJ) * 25 + 75; // 75% to 100%
            const lightness = (i / totalI) * 30 + 45; // 45% to 75%
            return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
        },

        controls: {
            a: { min: 2.0, max: 4.0, step: 0.01, label: "a" },
            b: { min: 0.05, max: 0.5, step: 0.01, label: "b" },
            c: { min: 0.05, max: 0.6, step: 0.01, label: "c" },
            d: { min: 0.2, max: 2.0, step: 0.01, label: "d" }
        }
    },

    gingerbreadman: {
        name: "Gingerbreadman Map",
        equation: "$$\\begin{align} x' &= 1 - y + |x| \\\\ y' &= x \\end{align}$$",

        updateFunction: (p, params) => {
            const x_next = 1 - p.y + Math.abs(p.x);
            const y_next = p.x;
            return { x: x_next, y: y_next };
        },

        evolution: {
            // This system is less parameterdependent, so we'll use subtle variations
            offset: { center: 0, range: 0.1, speed: 0.00005, func: Math.sin },
        },

        mapRange: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },

        initialConditions: () => {
            return {
                x: Math.random() * 6 - 3,
                y: Math.random() * 6 - 3,
            };
        },

        colorFunction: (i, j, totalI, totalJ) => {
            const hue = (i / totalI) * 40 + 20; // Orange to yellow range (20-60)
            const saturation = (j / totalJ) * 20 + 85; // 85% to 100%
            const lightness = (i / totalI) * 25 + 50; // 50% to 75%
            return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.9)`;
        },

        controls: {
            offset: { min: -1.0, max: 1.0, step: 0.01, label: "Offset" }
        }
    }
    // You can add more systems here: Lorenz, Rossler, etc.
};