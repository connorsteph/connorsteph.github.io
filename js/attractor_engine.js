// --- CONFIGURATION ---
// CHOOSE WHICH SYSTEM TO RUN HERE!
const activeSystem = DYNAMICAL_SYSTEMS.tinkerbell; // Or DYNAMICAL_SYSTEMS.deJong

// --- Element Setup ---
const header = document.querySelector('.dynamic-header');
const canvas = document.getElementById('tinkerbellCanvas');
const ctx = canvas.getContext('2d');
const backgroundColor = '#0c0c0c';

// --- Simulation & Optimization Parameters ---
const numPointsX = 120;
const numPointsY = 80;
const fadeAlpha = 0.03;
const targetFPS = 30;
const frameInterval = 1000 / targetFPS;

let trajectories = [];
let currentParams = {};
let time = 0;
let lastFrameTime = 0;
let animationFrameId;

function initialize() {
    canvas.width = header.clientWidth;
    canvas.height = header.clientHeight;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    trajectories = [];
    time = 0;

    for (let i = 0; i < numPointsX; i++) {
        for (let j = 0; j < numPointsY; j++) {
            const { x, y } = activeSystem.initialConditions();
            const color = activeSystem.colorFunction(i, j, numPointsX, numPointsY);
            trajectories.push({ x, y, color });
        }
    }
}

function animate(currentTime) {
    animationFrameId = requestAnimationFrame(animate);

    const elapsed = currentTime - lastFrameTime;
    if (elapsed < frameInterval) { return; }
    lastFrameTime = currentTime - (elapsed % frameInterval);

    // --- Main Logic ---
    ctx.fillStyle = `rgba(12, 12, 12, ${fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Evolve parameters for the active system
    for (const key in activeSystem.evolution) {
        const p = activeSystem.evolution[key];
        currentParams[key] = p.center + p.func(time * p.speed) * p.range;
    }

    // Process each trajectory using the system's update function
    for (let i = 0; i < trajectories.length; i++) {
        const p = trajectories[i];
        
        const { x: x_next, y: y_next } = activeSystem.updateFunction(p, currentParams);
        p.x = x_next;
        p.y = y_next;

        const canvasX = mapRange(p.x, activeSystem.mapRange.xMin, activeSystem.mapRange.xMax, 0, canvas.width);
        const canvasY = mapRange(p.y, activeSystem.mapRange.yMin, activeSystem.mapRange.yMax, 0, canvas.height);

        // Point Recycling
        const resetThreshold = Math.max(canvas.width, canvas.height);
        if (!isFinite(p.x) || !isFinite(p.y) ||
            canvasX < -resetThreshold || canvasX > canvas.width + resetThreshold ||
            canvasY < -resetThreshold || canvasY > canvas.height + resetThreshold) {
            
            const { x, y } = activeSystem.initialConditions();
            p.x = x;
            p.y = y;
            continue;
        }

        ctx.fillStyle = p.color;
        ctx.fillRect(canvasX, canvasY, 1, 1);
    }
    time++;
}

// --- Utility & Event Listeners ---
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

window.addEventListener('resize', () => { if (animationFrameId) initialize(); });

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    } else if (!animationFrameId) {
        lastFrameTime = performance.now();
        animate(lastFrameTime);
    }
});

// --- Kick off ---
initialize();
animate(performance.now());