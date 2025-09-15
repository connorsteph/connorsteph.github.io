const DYNAMICAL_SYSTEMS = {
    tinkerbell: {
        name: "Tinkerbell Map",
        
        // The core equations. Takes a point {x, y} and the current parameters, returns a new {x, y}
        updateFunction: (p, params) => {
            const x_next = p.x * p.x - p.y * p.y + params.a * p.x + params.b * p.y;
            const y_next = 2 * p.x * p.y + params.c * p.x + params.d * p.y;
            return { x: x_next, y: y_next };
        },
        
        // Defines how parameters evolve over time
        evolution: {
            a: { center: 0.92, range: 0.08, speed: 0.00008, func: Math.sin },
            b: { center: -0.6013, range: 0.05, speed: 0.00012, func: Math.cos },
            c: { center: 2.0, range: 0.15, speed: 0.00015, func: Math.sin },
            d: { center: 0.55, range: 0.08, speed: 0.0002, func: Math.cos },
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

        // Control configuration for interactive UI
        controls: {
            layout: {
                panelWidth: 420,
                paramColumns: "90px 1fr 65px",
                rangeColumns: "60px 1fr 65px"
            },
            mapRange: {
                x: { min: -3, max: 2, step: 0.1 },
                y: { min: -3, max: 2, step: 0.1 }
            },
            parameters: {
                a: { min: 0.5, max: 1.5, step: 0.01 },
                b: { min: -1, max: 0, step: 0.01 },
                c: { min: 1.5, max: 2.5, step: 0.01 },
                d: { min: 0.2, max: 0.8, step: 0.01 }
            }
        }
    },

    deJong: {
        name: "De Jong Attractor",

        updateFunction: (p, params) => {
            const x_next = Math.sin(params.a * p.y) - Math.cos(params.b * p.x);
            const y_next = Math.sin(params.c * p.x) - Math.cos(params.d * p.y);
            return { x: x_next, y: y_next };
        },

        evolution: {
            a: { center: 1.4, range: 0.2, speed: 0.0001, func: Math.sin },
            b: { center: -2.3, range: 0.2, speed: 0.00015, func: Math.cos },
            c: { center: 2.4, range: 0.3, speed: 0.0002, func: Math.sin },
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

        // Control configuration for interactive UI
        controls: {
            layout: {
                panelWidth: 450,
                paramColumns: "90px 1fr 65px",
                rangeColumns: "60px 1fr 65px"
            },
            mapRange: {
                x: { min: -5, max: 5, step: 0.1 },
                y: { min: -5, max: 5, step: 0.1 }
            },
            parameters: {
                a: { min: 0.5, max: 2.5, step: 0.01 },
                b: { min: -3, max: -1, step: 0.01 },
                c: { min: 1, max: 3, step: 0.01 },
                d: { min: -3, max: -1, step: 0.01 }
            }
        }
    },

    henon: {
        name: "Henon Map",

        updateFunction: (p, params) => {
            const x_next = 1 - params.a * p.x * p.x + p.y;
            const y_next = params.b * p.x;
            return { x: x_next, y: y_next };
        },

        evolution: {
            a: { center: 1.2, range: 0.15, speed: 0.01, func: Math.sin },
            b: { center: 0.3, range: 0.1, speed: 0.01, func: Math.cos },
        },

        mapRange: { xMin: -5.0, xMax: 3.0, yMin: -0.3, yMax: 0.3 },

        initialConditions: () => {
            return {
                x: Math.random() * 8 - 5, // Random start within [-5, 3]
                y: Math.random() * 0.6 - 0.3, // Random start within [-0.3, 0.3]
            };
        },

        colorFunction: (i, j, totalI, totalJ) => {
            const hue = Math.floor((i / totalI) * 180 + 180); // Hues from 180 to 360
            const lightness = (j / totalJ) * 40 + 30; // 30% to 70%
            return `hsla(${hue}, 80%, ${lightness}%, 0.8)`;
        },

        // Control configuration for interactive UI
        controls: {
            layout: {
                panelWidth: 380,
                paramColumns: "90px 1fr 65px",
                rangeColumns: "60px 1fr 65px"
            },
            mapRange: {
                x: { min: -10, max: 10, step: 0.1 },
                y: { min: -2, max: 2, step: 0.05 }
            },
            parameters: {
                a: { min: 0.8, max: 1.6, step: 0.01 },
                b: { min: 0.1, max: 0.5, step: 0.01 }
            }
        }
    },

    clifford: {
        name: "Clifford Attractor",

        updateFunction: (p, params) => {
            const x_next = Math.sin(params.a * p.y) + params.c * Math.cos(params.a * p.x);
            const y_next = Math.sin(params.b * p.x) + params.d * Math.cos(params.b * p.y);
            return { x: x_next, y: y_next };
        },

        evolution: {
            a: { center: -1.4, range: 0.3, speed: 0.0001, func: Math.sin },
            b: { center: 1.6, range: 0.2, speed: 0.00012, func: Math.cos },
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
            const hue = (i / totalI) * 120 + 240; // Blue to magenta range
            const saturation = (j / totalJ) * 30 + 70; // 70% to 100%
            return `hsla(${hue}, ${saturation}%, 65%, 0.6)`;
        },

        // Control configuration for interactive UI
        controls: {
            layout: {
                panelWidth: 450,
                paramColumns: "90px 1fr 65px",
                rangeColumns: "60px 1fr 65px"
            },
            mapRange: {
                x: { min: -6, max: 6, step: 0.1 },
                y: { min: -6, max: 6, step: 0.1 }
            },
            parameters: {
                a: { min: -2, max: 0, step: 0.01 },
                b: { min: 1, max: 2.5, step: 0.01 },
                c: { min: 0.5, max: 1.5, step: 0.01 },
                d: { min: 0.2, max: 1.2, step: 0.01 }
            }
        }
    }
    // You can add more systems here: Ikeda, Lozi, etc.
};