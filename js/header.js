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
let manualParams = {}; // User-overridden parameters
let time = 0;
let lastFrameTime = 0;
let animationFrameId;
let currentSystemName = systemName;

function initialize() {
    canvas.width = header.clientWidth;
    canvas.height = header.clientHeight;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    trajectories = [];
    time = 0;

    const currentSystemObj = DYNAMICAL_SYSTEMS[currentSystemName];
    for (let i = 0; i < numPointsX; i++) {
        for (let j = 0; j < numPointsY; j++) {
            const { x, y } = currentSystemObj.initialConditions();
            const color = currentSystemObj.colorFunction(i, j, numPointsX, numPointsY);
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
    const currentSystemObj = DYNAMICAL_SYSTEMS[currentSystemName];
    for (const key in currentSystemObj.evolution) {
        const p = currentSystemObj.evolution[key];
        // Use manual parameter if set, otherwise use evolved parameter
        currentParams[key] = manualParams[key] !== undefined
            ? manualParams[key]
            : p.center + p.func(time * p.speed) * p.range;
    }

    // Process each trajectory using the system's update function
    for (let i = 0; i < trajectories.length; i++) {
        const p = trajectories[i];

        const { x: x_next, y: y_next } = currentSystemObj.updateFunction(p, currentParams);
        p.x = x_next;
        p.y = y_next;

        const canvasX = mapRange(p.x, currentSystemObj.mapRange.xMin, currentSystemObj.mapRange.xMax, 0, canvas.width);
        const canvasY = mapRange(p.y, currentSystemObj.mapRange.yMin, currentSystemObj.mapRange.yMax, 0, canvas.height);

        // Point Recycling
        const resetThreshold = Math.max(canvas.width, canvas.height);
        if (!isFinite(p.x) || !isFinite(p.y) ||
            canvasX < -resetThreshold || canvasX > canvas.width + resetThreshold ||
            canvasY < -resetThreshold || canvasY > canvas.height + resetThreshold) {

            const { x, y } = currentSystemObj.initialConditions();
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

// --- Interactive Controls ---
function toggleControls() {
    const controlsPanel = document.getElementById('controlsPanel');
    const toggleButton = document.getElementById('toggleControls');

    if (!controlsPanel || !toggleButton) return;

    const isHidden = controlsPanel.classList.contains('hidden');

    if (isHidden) {
        controlsPanel.classList.remove('hidden');
        toggleButton.textContent = 'Hide Controls';
    } else {
        controlsPanel.classList.add('hidden');
        toggleButton.textContent = 'Show Controls';
    }
}

function updateParameterControls() {
    const controlsContainer = document.getElementById('parameterControls');
    if (!controlsContainer) return;

    const system = DYNAMICAL_SYSTEMS[currentSystemName];
    if (!system.controls) return;

    controlsContainer.innerHTML = '';

    Object.entries(system.controls).forEach(([paramName, config]) => {
        const controlGroup = document.createElement('div');
        controlGroup.className = 'parameter-control';

        const label = document.createElement('label');
        label.textContent = `${config.label}:`;
        label.htmlFor = `param-${paramName}`;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `param-${paramName}`;
        slider.min = config.min;
        slider.max = config.max;
        slider.step = config.step;
        slider.value = system.evolution[paramName].center;

        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'parameter-value';
        valueDisplay.textContent = slider.value;

        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            manualParams[paramName] = value;
            valueDisplay.textContent = value.toFixed(2);
        });

        controlGroup.appendChild(label);
        controlGroup.appendChild(slider);
        controlGroup.appendChild(valueDisplay);
        controlsContainer.appendChild(controlGroup);
    });
}

function resetParameters() {
    manualParams = {};
    updateParameterControls();
}

// Update equation display
function updateEquationDisplay() {
    const equationContent = document.getElementById('equationContent');
    if (equationContent && DYNAMICAL_SYSTEMS[currentSystemName] && DYNAMICAL_SYSTEMS[currentSystemName].equation) {
        console.log(`Updating equation display for system: ${currentSystemName}`);
        equationContent.innerHTML = DYNAMICAL_SYSTEMS[currentSystemName].equation;

        // Re-render MathJax for the updated content
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([equationContent]).catch((err) => {
                console.warn('MathJax typeset error:', err);
            });
        }
    } else {
        console.warn('Cannot update equation: missing content element or system data');
    }
}

// System switching functionality
function switchSystem(newSystemName) {
    if (!DYNAMICAL_SYSTEMS[newSystemName]) {
        console.error(`System "${newSystemName}" not found`);
        return;
    }

    console.log(`Switching to system: ${newSystemName}`);
    currentSystemName = newSystemName;

    // Update canvas data-system attribute
    canvas.dataset.system = newSystemName;

    // Reset manual parameters
    manualParams = {};

    // Reinitialize with new system
    initialize();

    // Update parameter controls for new system
    updateParameterControls();

    // Update equation display for new system
    updateEquationDisplay();
}

// Initialize system picker if it exists
function initializeSystemPicker() {
    const systemSelect = document.getElementById('systemSelect');
    const systemPicker = document.querySelector('.system-picker');

    if (!systemSelect) {
        console.log('System picker not found - skipping initialization');
        return;
    }

    if (!systemPicker) {
        console.log('System picker container not found');
        return;
    }

    console.log('Initializing system picker');
    console.log('System picker element:', systemPicker);
    console.log('System select element:', systemSelect);

    // Ensure the system picker is visible
    systemPicker.style.display = 'flex';

    // Set initial value to match canvas data-system
    systemSelect.value = canvas.dataset.system || currentSystemName;

    systemSelect.addEventListener('change', (e) => {
        console.log(`System picker changed to: ${e.target.value}`);
        switchSystem(e.target.value);
    });

    console.log('System picker initialized successfully');
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - initializing header');

    const toggleButton = document.getElementById('toggleControls');
    const closeButton = document.getElementById('closeControls');
    const resetButton = document.getElementById('resetParams');

    if (toggleButton) {
        toggleButton.addEventListener('click', toggleControls);
    }

    if (closeButton) {
        closeButton.addEventListener('click', toggleControls);
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetParameters);
    }

    // Initialize parameter controls
    updateParameterControls();

    // Initialize system picker separately with a small delay to ensure DOM is fully ready
    setTimeout(initializeSystemPicker, 100);

    // Initialize equation display when MathJax is ready
    initializeEquationDisplay();
});

// Initialize equation display when MathJax is ready
function initializeEquationDisplay() {
    function checkMathJax() {
        if (window.MathJax && window.MathJax.typesetPromise) {
            updateEquationDisplay();
        } else {
            // MathJax not ready yet, check again in 100ms
            setTimeout(checkMathJax, 100);
        }
    }
    checkMathJax();
}

// --- Kick off ---
initialize();


animate(performance.now());