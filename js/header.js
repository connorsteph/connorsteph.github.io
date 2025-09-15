// --- UNIFIED HEADER SYSTEM ---
// Auto-detects canvas and system type via data-system attribute

// --- Element Setup ---
const header = document.querySelector('.cv-header') || document.querySelector('.dynamic-header');
const canvas = header.querySelector('canvas');

if (!canvas) {
    console.error('No canvas found in header');
    throw new Error('Canvas element required in header');
}

if (!canvas.dataset.system) {
    console.error('No data-system attribute found on canvas');
    throw new Error('Canvas must have data-system attribute (e.g., data-system="henon")');
}

const systemName = canvas.dataset.system;
const activeSystem = DYNAMICAL_SYSTEMS[systemName];

if (!activeSystem) {
    console.error(`System "${systemName}" not found in DYNAMICAL_SYSTEMS`);
    throw new Error(`Unknown system: ${systemName}`);
}

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

// --- Interactive Controls State ---
let mapRange = {
    xMin: activeSystem.mapRange.xMin,
    xMax: activeSystem.mapRange.xMax,
    yMin: activeSystem.mapRange.yMin,
    yMax: activeSystem.mapRange.yMax
};
let paramCenters = {};

// Initialize parameter centers from system defaults
for (const key in activeSystem.evolution) {
    paramCenters[key] = activeSystem.evolution[key].center;
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
        currentParams[key] = paramCenters[key] + p.func(time * p.speed) * p.range;
    }

    // Process each trajectory using the system's update function
    for (let i = 0; i < trajectories.length; i++) {
        const p = trajectories[i];

        const { x: x_next, y: y_next } = activeSystem.updateFunction(p, currentParams);
        p.x = x_next;
        p.y = y_next;

        const canvasX = mapRangeUtil(p.x, mapRange.xMin, mapRange.xMax, 0, canvas.width);
        const canvasY = mapRangeUtil(p.y, mapRange.yMin, mapRange.yMax, 0, canvas.height);

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
function mapRangeUtil(value, inMin, inMax, outMin, outMax) {
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

// --- Interactive Controls ---
function createControls() {
    // Only create controls if enabled via data attribute and don't already exist
    if (!canvas.dataset.controls || document.querySelector(`.${systemName}-controls`)) return;

    const controlsDiv = document.createElement('div');
    controlsDiv.className = `${systemName}-controls`;

    // Apply system-specific layout configuration
    const layout = activeSystem.controls.layout;

    // Generate map range controls
    const mapRangeControls = `
        <div class="control-group">
            <label>X Range:</label>
            <div class="range-controls">
                <div class="range-item">
                    <label>min:</label>
                    <input type="range" id="xMin" min="${activeSystem.controls.mapRange.x.min}" max="${mapRange.xMax}" step="${activeSystem.controls.mapRange.x.step}" value="${mapRange.xMin}">
                    <span id="xMinVal">${mapRange.xMin}</span>
                </div>
                <div class="range-item">
                    <label>max:</label>
                    <input type="range" id="xMax" min="${mapRange.xMin}" max="${activeSystem.controls.mapRange.x.max}" step="${activeSystem.controls.mapRange.x.step}" value="${mapRange.xMax}">
                    <span id="xMaxVal">${mapRange.xMax}</span>
                </div>
            </div>
        </div>
        <div class="control-group">
            <label>Y Range:</label>
            <div class="range-controls">
                <div class="range-item">
                    <label>min:</label>
                    <input type="range" id="yMin" min="${activeSystem.controls.mapRange.y.min}" max="${mapRange.yMax}" step="${activeSystem.controls.mapRange.y.step}" value="${mapRange.yMin}">
                    <span id="yMinVal">${mapRange.yMin}</span>
                </div>
                <div class="range-item">
                    <label>max:</label>
                    <input type="range" id="yMax" min="${mapRange.yMin}" max="${activeSystem.controls.mapRange.y.max}" step="${activeSystem.controls.mapRange.y.step}" value="${mapRange.yMax}">
                    <span id="yMaxVal">${mapRange.yMax}</span>
                </div>
            </div>
        </div>
    `;

    // Generate parameter controls
    const paramControls = Object.keys(activeSystem.controls.parameters).map(param => {
        const config = activeSystem.controls.parameters[param];
        return `
            <div class="param-item">
                <label>${param}:</label>
                <input type="range" id="${param}Center" min="${config.min}" max="${config.max}" step="${config.step}" value="${paramCenters[param]}">
                <span id="${param}CenterVal">${paramCenters[param]}</span>
            </div>
        `;
    }).join('');

    controlsDiv.innerHTML = `
        <div class="controls-toggle">⚙️</div>
        <div class="controls-panel" style="
            --panel-width: ${layout.panelWidth}px;
            --param-columns: ${layout.paramColumns};
            --range-columns: ${layout.rangeColumns};">
            <div class="controls-header">
                <h4>${activeSystem.name} Controls</h4>
                <button class="close-controls">×</button>
            </div>
            ${mapRangeControls}
            <div class="control-group">
                <label>${activeSystem.name} Parameters:</label>
                <div class="param-controls">
                    ${paramControls}
                </div>
            </div>
            <button id="resetView">Reset View</button>
        </div>
    `;

    header.appendChild(controlsDiv);

    // Add event listeners for map range controls
    const xMinSlider = document.getElementById('xMin');
    const xMaxSlider = document.getElementById('xMax');
    const yMinSlider = document.getElementById('yMin');
    const yMaxSlider = document.getElementById('yMax');

    const xMinVal = document.getElementById('xMinVal');
    const xMaxVal = document.getElementById('xMaxVal');
    const yMinVal = document.getElementById('yMinVal');
    const yMaxVal = document.getElementById('yMaxVal');

    function updateRanges() {
        mapRange.xMin = parseFloat(xMinSlider.value);
        mapRange.xMax = parseFloat(xMaxSlider.value);
        mapRange.yMin = parseFloat(yMinSlider.value);
        mapRange.yMax = parseFloat(yMaxSlider.value);

        xMinVal.textContent = mapRange.xMin.toFixed(1);
        xMaxVal.textContent = mapRange.xMax.toFixed(1);
        yMinVal.textContent = mapRange.yMin.toFixed(activeSystem.controls.mapRange.y.step < 0.1 ? 2 : 1);
        yMaxVal.textContent = mapRange.yMax.toFixed(activeSystem.controls.mapRange.y.step < 0.1 ? 2 : 1);

        // Update parameter centers
        Object.keys(activeSystem.controls.parameters).forEach(param => {
            const slider = document.getElementById(`${param}Center`);
            const display = document.getElementById(`${param}CenterVal`);
            if (slider && display) {
                paramCenters[param] = parseFloat(slider.value);
                display.textContent = paramCenters[param].toFixed(2);
            }
        });

        initialize(); // Reinitialize with new settings
    }

    // Add listeners for map range
    xMinSlider.addEventListener('input', updateRanges);
    xMaxSlider.addEventListener('input', updateRanges);
    yMinSlider.addEventListener('input', updateRanges);
    yMaxSlider.addEventListener('input', updateRanges);

    // Add listeners for parameters
    Object.keys(activeSystem.controls.parameters).forEach(param => {
        const slider = document.getElementById(`${param}Center`);
        if (slider) {
            slider.addEventListener('input', updateRanges);
        }
    });

    // Reset button
    document.getElementById('resetView').addEventListener('click', () => {
        mapRange.xMin = activeSystem.mapRange.xMin;
        mapRange.xMax = activeSystem.mapRange.xMax;
        mapRange.yMin = activeSystem.mapRange.yMin;
        mapRange.yMax = activeSystem.mapRange.yMax;

        Object.keys(activeSystem.evolution).forEach(param => {
            paramCenters[param] = activeSystem.evolution[param].center;
        });

        // Update sliders
        xMinSlider.value = mapRange.xMin;
        xMaxSlider.value = mapRange.xMax;
        yMinSlider.value = mapRange.yMin;
        yMaxSlider.value = mapRange.yMax;

        Object.keys(activeSystem.controls.parameters).forEach(param => {
            const slider = document.getElementById(`${param}Center`);
            if (slider) {
                slider.value = paramCenters[param];
            }
        });

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

// --- Kick off ---
if (activeSystem.controls) {
    createControls();
}
initialize();
animate(performance.now());