// --- Element Setup ---
const header = document.querySelector('.dynamic-header');
const canvas = document.getElementById('henonCanvas');
const ctx = canvas.getContext('2d');
const backgroundColor = '#0c0c0c';

// --- Henon Map Parameters (dynamic) ---
let a = 1.4;
let b = 0.3;
const a_center = 1.2, a_range = .15;
const b_center = 0.3, b_range = 0.1;

// --- Simulation & Optimization Parameters ---
const numPointsX = 80; // Reduced point count for better performance
const numPointsY = 40;
const fadeAlpha = 0.04; // Slightly faster fade for a cleaner look
const targetFPS = 30; // Target frame rate
const frameInterval = 1000 / targetFPS; // The duration of one frame in ms

let trajectories = [];
let time = 0;
let lastFrameTime = 0; // For frame rate limiting
let animationFrameId;

// Map coordinate ranges
const xMapMin = -5.0, xMapMax = 3.0;
const yMapMin = -0.3, yMapMax = 0.3;

function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function initialize() {
    // Set canvas size based on its container's dimensions
    canvas.width = header.clientWidth;
    canvas.height = header.clientHeight;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    trajectories = [];
    time = 0;

    for (let i = 0; i < numPointsX; i++) {
        for (let j = 0; j < numPointsY; j++) {
            const x_init = mapRange(i, 0, numPointsX - 1, xMapMin, xMapMax);
            const y_init = mapRange(j, 0, numPointsY - 1, yMapMin, yMapMax);
            const hue = Math.floor(mapRange(i, 0, numPointsX, 180, 360));
            const lightness = mapRange(j, 0, numPointsY, 30, 70);
            const color = `hsla(${hue}, 80%, ${lightness}%, 0.8)`;
            trajectories.push({ x: x_init, y: y_init, color: color });
        }
    }
}

function animate(currentTime) {
    // Request the next frame immediately
    animationFrameId = requestAnimationFrame(animate);

    // --- Frame Rate Limiting ---
    const elapsed = currentTime - lastFrameTime;
    if (elapsed < frameInterval) {
        return; // Skip this frame if it's too soon
    }
    lastFrameTime = currentTime - (elapsed % frameInterval);

    // --- Main Logic ---
    // Fade trails
    ctx.fillStyle = `rgba(12, 12, 12, ${fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Evolve parameters
    a = a_center + Math.sin(time * 0.01) * a_range;
    b = b_center + Math.cos(time * 0.01) * b_range;

    // Process each trajectory
    for (let i = 0; i < trajectories.length; i++) {
        const p = trajectories[i];
        const x_next = 1 - a * p.x * p.x + p.y;
        const y_next = b * p.x;
        p.x = x_next;
        p.y = y_next;

        const canvasX = mapRange(p.x, xMapMin, xMapMax, 0, canvas.width);
        const canvasY = mapRange(p.y, yMapMin, yMapMax, 0, canvas.height);

        // Point Recycling
        if (!isFinite(p.x) || !isFinite(p.y) || canvasX < -canvas.width || canvasX > 2 * canvas.width) {
            p.x = xMapMin + Math.random() * (xMapMax - xMapMin);
            p.y = yMapMin + Math.random() * (yMapMax - yMapMin);
            continue;
        }

        ctx.fillStyle = p.color;
        ctx.fillRect(canvasX, canvasY, 1, 1);
    }
    time++;
}

// --- Event Listeners for Lifecycle Management ---
window.addEventListener('resize', () => {
    // Only re-initialize if the animation is actually running
    if (animationFrameId) {
        initialize();
    }
});

// --- Page Visibility API for pausing the animation ---
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Tab is not visible, stop the animation
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null; // Mark as inactive
    } else {
        // Tab is visible, restart the animation
        if (!animationFrameId) {
            lastFrameTime = performance.now(); // Reset timer
            animate(lastFrameTime);
        }
    }
});

// --- Kick off the animation ---
initialize();
// We pass the initial time from performance.now() for the frame limiter
animate(performance.now());
