// --- Element Setup ---
const header = document.querySelector('.dynamic-header');
const canvas = document.getElementById('henonCanvas'); // Keep ID as 'henonCanvas' for simplicity or change in HTML/CSS
const ctx = canvas.getContext('2d');
const backgroundColor = '#0c0c0c';

// --- Tinkerbell Map Parameters (dynamic) ---
// Complex chaotic parameters for more intricate structure:
let a = 0.9;
let b = -0.6013;
let c = 2.0;
let d = 0.5;

// Parameters for controlling the evolution of 'a', 'b', 'c', 'd'
// These will make the attractor slowly morph through complex structures
let a_center = 0.92;
const a_range = 0.08; // a oscillates between 0.84 and 1.0
let b_center = -0.6013;
const b_range = 0.05; // b oscillates more for complex patterns
let c_center = 2.0;
const c_range = 0.15;  // c oscillates between 1.85 and 2.15
let d_center = 0.55;
const d_range = 0.08; // d oscillates between 0.47 and 0.63

// --- Simulation & Optimization Parameters ---
const numPointsX = 120; // Slightly more points for Tinkerbell as it's often more intricate
const numPointsY = 80;
const fadeAlpha = 0.025; // Controls trail length - slightly longer trails for complex patterns
const targetFPS = 30;
const frameInterval = 1000 / targetFPS;

let trajectories = [];
let time = 0;
let lastFrameTime = 0;
let animationFrameId;

// Define the coordinate range for Tinkerbell's attractor (now adjustable)
let xMapMin = -1.5;
let xMapMax = 0.8;
let yMapMin = -1.9;
let yMapMax = 1.0;

function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function initialize() {
    canvas.width = header.clientWidth;
    canvas.height = header.clientHeight;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    trajectories = [];
    time = 0;

    for (let i = 0; i < numPointsX; i++) {
        for (let j = 0; j < numPointsY; j++) {
            // Initial conditions for Tinkerbell often look good starting near the origin
            const x_init = mapRange(i, 0, numPointsX - 1, -0.5, 0.5); // Initial conditions more centered
            const y_init = mapRange(j, 0, numPointsY - 1, -0.5, 0.5);

            // Using HSL for varied colors
            const hue = Math.floor(mapRange(i + j, 0, numPointsX + numPointsY, 0, 360)); // Full spectrum
            const lightness = mapRange(Math.sin(j * 0.1), -1, 1, 40, 70); // Vary lightness with sin wave
            const saturation = mapRange(Math.cos(i * 0.05), -1, 1, 70, 95); // Vary saturation
            const color = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`;

            trajectories.push({ x: x_init, y: y_init, color: color });
        }
    }
}

function animate(currentTime) {
    animationFrameId = requestAnimationFrame(animate);

    const elapsed = currentTime - lastFrameTime;
    if (elapsed < frameInterval) {
        return;
    }
    lastFrameTime = currentTime - (elapsed % frameInterval);

    // --- Main Logic ---
    ctx.fillStyle = `rgba(12, 12, 12, ${fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Evolve Tinkerbell parameters with complex oscillations
    a = a_center + Math.sin(time * 0.00008) * a_range;
    b = b_center + Math.cos(time * 0.00012) * b_range + Math.sin(time * 0.00003) * 0.01;
    c = c_center + Math.sin(time * 0.00015) * c_range;
    d = d_center + Math.cos(time * 0.0002) * d_range + Math.sin(time * 0.00005) * 0.02;

    // Process each trajectory
    for (let i = 0; i < trajectories.length; i++) {
        const p = trajectories[i];

        // Tinkerbell Map Equations
        const x_next = p.x * p.x - p.y * p.y + a * p.x + b * p.y;
        const y_next = 2 * p.x * p.y + c * p.x + d * p.y;

        p.x = x_next;
        p.y = y_next;

        const canvasX = mapRange(p.x, xMapMin, xMapMax, 0, canvas.width);
        const canvasY = mapRange(p.y, yMapMin, yMapMax, 0, canvas.height);

        // Point Recycling: check if point is valid or out of bounds
        const resetThreshold = Math.max(canvas.width, canvas.height); // Define a threshold based on canvas size
        if (!isFinite(p.x) || !isFinite(p.y) ||
            canvasX < -resetThreshold || canvasX > canvas.width + resetThreshold ||
            canvasY < -resetThreshold || canvasY > canvas.height + resetThreshold) {
            
            // Reset to a random position within a smaller, central area for Tinkerbell
            p.x = Math.random() * 0.5 - 0.25; // Small random initial points are good for Tinkerbell
            p.y = Math.random() * 0.5 - 0.25;
            continue;
        }

        ctx.fillStyle = p.color;
        ctx.fillRect(canvasX, canvasY, 1, 1);
    }
    time++;
}

// --- Event Listeners for Lifecycle Management ---
window.addEventListener('resize', () => {
    if (animationFrameId) {
        initialize();
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    } else {
        if (!animationFrameId) {
            lastFrameTime = performance.now();
            animate(lastFrameTime);
        }
    }
});

// --- Interactive Controls ---
function createControls() {
    // Only create controls if they don't already exist
    if (document.querySelector('.tinkerbell-controls')) return;

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'tinkerbell-controls';
    controlsDiv.innerHTML = `
        <div class="controls-toggle">⚙️</div>
        <div class="controls-panel">
            <div class="controls-header">
                <h4>Tinkerbell View Controls</h4>
                <button class="close-controls">×</button>
            </div>
            <div class="control-group">
                <label>X Range:</label>
                <div class="range-controls">
                    <div class="range-item">
                        <input type="range" id="tink-xMin" min="-3" max="0" step="0.1" value="${xMapMin}">
                        <span id="tink-xMinVal">${xMapMin}</span>
                    </div>
                    <div class="range-item">
                        <input type="range" id="tink-xMax" min="0" max="3" step="0.1" value="${xMapMax}">
                        <span id="tink-xMaxVal">${xMapMax}</span>
                    </div>
                </div>
            </div>
            <div class="control-group">
                <label>Y Range:</label>
                <div class="range-controls">
                    <div class="range-item">
                        <input type="range" id="tink-yMin" min="-2" max="0" step="0.1" value="${yMapMin}">
                        <span id="tink-yMinVal">${yMapMin}</span>
                    </div>
                    <div class="range-item">
                        <input type="range" id="tink-yMax" min="0" max="3" step="0.1" value="${yMapMax}">
                        <span id="tink-yMaxVal">${yMapMax}</span>
                    </div>
                </div>
            </div>
            <div class="control-group">
                <label>Tinkerbell Parameters:</label>
                <div class="range-controls">
                    <div class="range-item">
                        <label style="font-size: 10px; margin: 0;">a:</label>
                        <input type="range" id="tink-aCenter" min="0.7" max="1.1" step="0.01" value="${a_center}">
                        <span id="tink-aCenterVal">${a_center}</span>
                    </div>
                    <div class="range-item">
                        <label style="font-size: 10px; margin: 0;">b:</label>
                        <input type="range" id="tink-bCenter" min="-0.8" max="-0.4" step="0.01" value="${b_center}">
                        <span id="tink-bCenterVal">${b_center}</span>
                    </div>
                </div>
                <div class="range-controls">
                    <div class="range-item">
                        <label style="font-size: 10px; margin: 0;">c:</label>
                        <input type="range" id="tink-cCenter" min="1.5" max="2.5" step="0.01" value="${c_center}">
                        <span id="tink-cCenterVal">${c_center}</span>
                    </div>
                    <div class="range-item">
                        <label style="font-size: 10px; margin: 0;">d:</label>
                        <input type="range" id="tink-dCenter" min="0.3" max="0.8" step="0.01" value="${d_center}">
                        <span id="tink-dCenterVal">${d_center}</span>
                    </div>
                </div>
            </div>
            <button id="tink-resetView">Reset View</button>
        </div>
    `;

    header.appendChild(controlsDiv);

    // Add event listeners
    const xMinSlider = document.getElementById('tink-xMin');
    const xMaxSlider = document.getElementById('tink-xMax');
    const yMinSlider = document.getElementById('tink-yMin');
    const yMaxSlider = document.getElementById('tink-yMax');
    const aCenterSlider = document.getElementById('tink-aCenter');
    const bCenterSlider = document.getElementById('tink-bCenter');
    const cCenterSlider = document.getElementById('tink-cCenter');
    const dCenterSlider = document.getElementById('tink-dCenter');

    const xMinVal = document.getElementById('tink-xMinVal');
    const xMaxVal = document.getElementById('tink-xMaxVal');
    const yMinVal = document.getElementById('tink-yMinVal');
    const yMaxVal = document.getElementById('tink-yMaxVal');
    const aCenterVal = document.getElementById('tink-aCenterVal');
    const bCenterVal = document.getElementById('tink-bCenterVal');
    const cCenterVal = document.getElementById('tink-cCenterVal');
    const dCenterVal = document.getElementById('tink-dCenterVal');

    function updateRanges() {
        xMapMin = parseFloat(xMinSlider.value);
        xMapMax = parseFloat(xMaxSlider.value);
        yMapMin = parseFloat(yMinSlider.value);
        yMapMax = parseFloat(yMaxSlider.value);
        a_center = parseFloat(aCenterSlider.value);
        b_center = parseFloat(bCenterSlider.value);
        c_center = parseFloat(cCenterSlider.value);
        d_center = parseFloat(dCenterSlider.value);

        xMinVal.textContent = xMapMin.toFixed(1);
        xMaxVal.textContent = xMapMax.toFixed(1);
        yMinVal.textContent = yMapMin.toFixed(1);
        yMaxVal.textContent = yMapMax.toFixed(1);
        aCenterVal.textContent = a_center.toFixed(2);
        bCenterVal.textContent = b_center.toFixed(3);
        cCenterVal.textContent = c_center.toFixed(2);
        dCenterVal.textContent = d_center.toFixed(2);

        initialize(); // Reinitialize with new ranges
    }

    xMinSlider.addEventListener('input', updateRanges);
    xMaxSlider.addEventListener('input', updateRanges);
    yMinSlider.addEventListener('input', updateRanges);
    yMaxSlider.addEventListener('input', updateRanges);
    aCenterSlider.addEventListener('input', updateRanges);
    bCenterSlider.addEventListener('input', updateRanges);
    cCenterSlider.addEventListener('input', updateRanges);
    dCenterSlider.addEventListener('input', updateRanges);

    // Reset button
    document.getElementById('tink-resetView').addEventListener('click', () => {
        xMapMin = -1.5; xMapMax = 1.0;
        yMapMin = -0.2; yMapMax = 1.5;
        a_center = 0.92; b_center = -0.6013;
        c_center = 2.0; d_center = 0.55;

        xMinSlider.value = xMapMin;
        xMaxSlider.value = xMapMax;
        yMinSlider.value = yMapMin;
        yMaxSlider.value = yMapMax;
        aCenterSlider.value = a_center;
        bCenterSlider.value = b_center;
        cCenterSlider.value = c_center;
        dCenterSlider.value = d_center;

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
animate(performance.now());