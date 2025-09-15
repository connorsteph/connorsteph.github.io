// --- Element Setup ---
const header = document.querySelector('.dynamic-header');
const canvas = document.getElementById('henonCanvas');
const ctx = canvas.getContext('2d');
const backgroundColor = '#0c0c0c';

// --- Henon Map Parameters (dynamic) ---
let a = 1.4;
let b = 0.3;
let a_center = 1.2, a_range = .15;
let b_center = 0.3, b_range = 0.1;

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

// Map coordinate ranges (now adjustable)
let xMapMin = -5.0, xMapMax = 3.0;
let yMapMin = -0.3, yMapMax = 0.3;

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

// --- Interactive Controls ---
function createControls() {
    // Only create controls if they don't already exist
    if (document.querySelector('.henon-controls')) return;

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'henon-controls';
    controlsDiv.innerHTML = `
        <div class="controls-toggle">⚙️</div>
        <div class="controls-panel">
            <div class="controls-header">
                <h4>Henon View Controls</h4>
                <button class="close-controls">×</button>
            </div>
            <div class="control-group">
                <label>X Range:</label>
                <div class="range-controls">
                    <div class="range-item">
                        <input type="range" id="xMin" min="-10" max="0" step="0.1" value="${xMapMin}">
                        <span id="xMinVal">${xMapMin}</span>
                    </div>
                    <div class="range-item">
                        <input type="range" id="xMax" min="0" max="10" step="0.1" value="${xMapMax}">
                        <span id="xMaxVal">${xMapMax}</span>
                    </div>
                </div>
            </div>
            <div class="control-group">
                <label>Y Range:</label>
                <div class="range-controls">
                    <div class="range-item">
                        <input type="range" id="yMin" min="-2" max="0" step="0.05" value="${yMapMin}">
                        <span id="yMinVal">${yMapMin}</span>
                    </div>
                    <div class="range-item">
                        <input type="range" id="yMax" min="0" max="2" step="0.05" value="${yMapMax}">
                        <span id="yMaxVal">${yMapMax}</span>
                    </div>
                </div>
            </div>
            <div class="control-group">
                <label>Henon Parameters:</label>
                <div class="range-controls">
                    <div class="range-item">
                        <label style="font-size: 10px; margin: 0;">a:</label>
                        <input type="range" id="aCenter" min="0.8" max="1.6" step="0.01" value="${a_center}">
                        <span id="aCenterVal">${a_center}</span>
                    </div>
                    <div class="range-item">
                        <label style="font-size: 10px; margin: 0;">b:</label>
                        <input type="range" id="bCenter" min="0.1" max="0.5" step="0.01" value="${b_center}">
                        <span id="bCenterVal">${b_center}</span>
                    </div>
                </div>
            </div>
            <button id="resetView">Reset View</button>
        </div>
    `;

    header.appendChild(controlsDiv);

    // Add event listeners
    const xMinSlider = document.getElementById('xMin');
    const xMaxSlider = document.getElementById('xMax');
    const yMinSlider = document.getElementById('yMin');
    const yMaxSlider = document.getElementById('yMax');
    const aCenterSlider = document.getElementById('aCenter');
    const bCenterSlider = document.getElementById('bCenter');

    const xMinVal = document.getElementById('xMinVal');
    const xMaxVal = document.getElementById('xMaxVal');
    const yMinVal = document.getElementById('yMinVal');
    const yMaxVal = document.getElementById('yMaxVal');
    const aCenterVal = document.getElementById('aCenterVal');
    const bCenterVal = document.getElementById('bCenterVal');

    function updateRanges() {
        xMapMin = parseFloat(xMinSlider.value);
        xMapMax = parseFloat(xMaxSlider.value);
        yMapMin = parseFloat(yMinSlider.value);
        yMapMax = parseFloat(yMaxSlider.value);
        a_center = parseFloat(aCenterSlider.value);
        b_center = parseFloat(bCenterSlider.value);

        xMinVal.textContent = xMapMin.toFixed(1);
        xMaxVal.textContent = xMapMax.toFixed(1);
        yMinVal.textContent = yMapMin.toFixed(2);
        yMaxVal.textContent = yMapMax.toFixed(2);
        aCenterVal.textContent = a_center.toFixed(2);
        bCenterVal.textContent = b_center.toFixed(2);

        initialize(); // Reinitialize with new ranges
    }

    xMinSlider.addEventListener('input', updateRanges);
    xMaxSlider.addEventListener('input', updateRanges);
    yMinSlider.addEventListener('input', updateRanges);
    yMaxSlider.addEventListener('input', updateRanges);
    aCenterSlider.addEventListener('input', updateRanges);
    bCenterSlider.addEventListener('input', updateRanges);

    // Reset button
    document.getElementById('resetView').addEventListener('click', () => {
        xMapMin = -5.0; xMapMax = 3.0;
        yMapMin = -0.3; yMapMax = 0.3;
        a_center = 1.2; b_center = 0.3;

        xMinSlider.value = xMapMin;
        xMaxSlider.value = xMapMax;
        yMinSlider.value = yMapMin;
        yMaxSlider.value = yMapMax;
        aCenterSlider.value = a_center;
        bCenterSlider.value = b_center;

        updateRanges();
    });

    // Toggle panel visibility
    const toggle = controlsDiv.querySelector('.controls-toggle');
    const panel = controlsDiv.querySelector('.controls-panel');
    const closeBtn = controlsDiv.querySelector('.close-controls');

    toggle.addEventListener('click', () => {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    closeBtn.addEventListener('click', () => {
        panel.style.display = 'none';
    });

    // Start with panel hidden
    panel.style.display = 'none';
}

// --- Kick off the animation ---
createControls();
initialize();
// We pass the initial time from performance.now() for the frame limiter
animate(performance.now());
