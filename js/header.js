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

// Try WebGL first, fallback to 2D canvas
let gl, ctx;
let useWebGL = false;

try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
        useWebGL = true;
        console.log('Using WebGL for enhanced trajectory rendering');
    }
} catch (e) {
    console.warn('WebGL not available, falling back to 2D canvas');
}

if (!useWebGL) {
    ctx = canvas.getContext('2d');
}

const backgroundColor = '#0c0c0c';

// --- WebGL Utilities ---
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

function createTexture(gl, width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
}

// --- Shader Source Code ---
const fadeVertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
`;

const fadeFragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform float u_fadeRate;
    uniform float u_threshold;
    varying vec2 v_texCoord;

    void main() {
        vec4 color = texture2D(u_texture, v_texCoord);

        // Apply exponential fade
        color.rgb *= (1.0 - u_fadeRate);

        // Hard cutoff threshold
        float brightness = (color.r + color.g + color.b) / 3.0;
        if (brightness < u_threshold) {
            color = vec4(0.047, 0.047, 0.047, 1.0); // background black
        }

        gl_FragColor = color;
    }
`;

const pointVertexShaderSource = `
    attribute vec2 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = 1.0;
        v_color = a_color;
    }
`;

const pointFragmentShaderSource = `
    precision mediump float;
    varying vec3 v_color;

    void main() {
        gl_FragColor = vec4(v_color, 1.0);
    }
`;

// --- Simulation & Optimization Parameters ---
const numPointsX = 120;
const numPointsY = 80;
const fadeRate = 0.04; // Exponential fade rate per frame
const brightnessThreshold = 0.02; // Hard cutoff threshold (5/255)
const targetFPS = 30;
const frameInterval = 1000 / targetFPS;

let trajectories = [];
let currentParams = {};
let manualParams = {}; // User-overridden parameters
let time = 0;
let lastFrameTime = 0;
let animationFrameId;
let currentSystemName = systemName;

// --- WebGL State ---
let webglState = null;

if (useWebGL) {
    webglState = {
        fadeProgram: null,
        pointProgram: null,
        textureA: null,
        textureB: null,
        framebufferA: null,
        framebufferB: null,
        currentTexture: 0, // 0 = A, 1 = B
        quadBuffer: null,
        pointBuffer: null,
        colorBuffer: null,
        pointPositions: new Float32Array(numPointsX * numPointsY * 2),
        pointColors: new Float32Array(numPointsX * numPointsY * 3)
    };
}

function initializeWebGL() {
    const state = webglState;

    // Create shader programs
    const fadeVertexShader = createShader(gl, gl.VERTEX_SHADER, fadeVertexShaderSource);
    const fadeFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fadeFragmentShaderSource);
    state.fadeProgram = createProgram(gl, fadeVertexShader, fadeFragmentShader);

    const pointVertexShader = createShader(gl, gl.VERTEX_SHADER, pointVertexShaderSource);
    const pointFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, pointFragmentShaderSource);
    state.pointProgram = createProgram(gl, pointVertexShader, pointFragmentShader);

    // Create textures and framebuffers for ping-pong
    state.textureA = createTexture(gl, canvas.width, canvas.height);
    state.textureB = createTexture(gl, canvas.width, canvas.height);

    state.framebufferA = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, state.framebufferA);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, state.textureA, 0);

    state.framebufferB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, state.framebufferB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, state.textureB, 0);

    // Create fullscreen quad for fade pass
    const quadVertices = new Float32Array([
        -1, -1,  0, 0,
         1, -1,  1, 0,
        -1,  1,  0, 1,
         1,  1,  1, 1
    ]);
    state.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, state.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    // Create point buffers
    state.pointBuffer = gl.createBuffer();
    state.colorBuffer = gl.createBuffer();

    // Clear both textures to background color
    gl.bindFramebuffer(gl.FRAMEBUFFER, state.framebufferA);
    gl.clearColor(0.047, 0.047, 0.047, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindFramebuffer(gl.FRAMEBUFFER, state.framebufferB);
    gl.clearColor(0.047, 0.047, 0.047, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function initialize() {
    canvas.width = header.clientWidth;
    canvas.height = header.clientHeight;

    if (useWebGL) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        initializeWebGL();
    } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

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

function renderWebGL() {
    const state = webglState;

    // 1. Apply fade to previous frame (read from current texture, write to other)
    const sourceTexture = state.currentTexture === 0 ? state.textureA : state.textureB;
    const targetFramebuffer = state.currentTexture === 0 ? state.framebufferB : state.framebufferA;

    gl.bindFramebuffer(gl.FRAMEBUFFER, targetFramebuffer);
    gl.useProgram(state.fadeProgram);

    // Bind previous frame texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
    gl.uniform1i(gl.getUniformLocation(state.fadeProgram, 'u_texture'), 0);
    gl.uniform1f(gl.getUniformLocation(state.fadeProgram, 'u_fadeRate'), fadeRate);
    gl.uniform1f(gl.getUniformLocation(state.fadeProgram, 'u_threshold'), brightnessThreshold);

    // Set up quad attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, state.quadBuffer);
    const positionLoc = gl.getAttribLocation(state.fadeProgram, 'a_position');
    const texCoordLoc = gl.getAttribLocation(state.fadeProgram, 'a_texCoord');
    gl.enableVertexAttribArray(positionLoc);
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);

    // Render fullscreen quad
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 2. Draw new trajectory points to the same target
    gl.useProgram(state.pointProgram);

    // Update point buffers with current trajectory positions
    let pointIndex = 0;
    const currentSystemObj = DYNAMICAL_SYSTEMS[currentSystemName];

    for (let i = 0; i < trajectories.length; i++) {
        const p = trajectories[i];

        // Convert to WebGL coordinates (-1 to 1), flip Y axis
        const glX = mapRange(p.x, currentSystemObj.mapRange.xMin, currentSystemObj.mapRange.xMax, -1, 1);
        const glY = mapRange(p.y, currentSystemObj.mapRange.yMin, currentSystemObj.mapRange.yMax, 1, -1);

        // Check bounds
        const resetThreshold = 2.0; // WebGL coordinate threshold
        if (!isFinite(glX) || !isFinite(glY) || Math.abs(glX) > resetThreshold || Math.abs(glY) > resetThreshold) {
            const { x, y } = currentSystemObj.initialConditions();
            p.x = x;
            p.y = y;
            continue;
        }

        state.pointPositions[pointIndex * 2] = glX;
        state.pointPositions[pointIndex * 2 + 1] = glY;

        // Parse HSLA color from string and convert to RGB
        const hslaMatch = p.color.match(/hsla\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)\)/);
        if (hslaMatch) {
            const h = parseFloat(hslaMatch[1]) / 360;
            const s = parseFloat(hslaMatch[2]) / 100;
            const l = parseFloat(hslaMatch[3]) / 100;

            // Convert HSL to RGB
            const hsl2rgb = (h, s, l) => {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };

                if (s === 0) {
                    return [l, l, l]; // achromatic
                } else {
                    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    const p = 2 * l - q;
                    return [
                        hue2rgb(p, q, h + 1/3),
                        hue2rgb(p, q, h),
                        hue2rgb(p, q, h - 1/3)
                    ];
                }
            };

            const [r, g, b] = hsl2rgb(h, s, l);
            state.pointColors[pointIndex * 3] = r;
            state.pointColors[pointIndex * 3 + 1] = g;
            state.pointColors[pointIndex * 3 + 2] = b;
        } else {
            // Fallback to white if parsing fails
            console.warn('Color parsing failed for:', p.color);
            state.pointColors[pointIndex * 3] = 1.0;
            state.pointColors[pointIndex * 3 + 1] = 1.0;
            state.pointColors[pointIndex * 3 + 2] = 1.0;
        }

        pointIndex++;
    }

    // Upload point data
    gl.bindBuffer(gl.ARRAY_BUFFER, state.pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, state.pointPositions.subarray(0, pointIndex * 2), gl.DYNAMIC_DRAW);
    const pointPosLoc = gl.getAttribLocation(state.pointProgram, 'a_position');
    gl.enableVertexAttribArray(pointPosLoc);
    gl.vertexAttribPointer(pointPosLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, state.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, state.pointColors.subarray(0, pointIndex * 3), gl.DYNAMIC_DRAW);
    const pointColorLoc = gl.getAttribLocation(state.pointProgram, 'a_color');
    gl.enableVertexAttribArray(pointColorLoc);
    gl.vertexAttribPointer(pointColorLoc, 3, gl.FLOAT, false, 0, 0);

    // Enable blending for point rendering
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Draw points
    gl.drawArrays(gl.POINTS, 0, pointIndex);

    gl.disable(gl.BLEND);

    // 3. Copy result to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const finalTexture = state.currentTexture === 0 ? state.textureB : state.textureA;
    gl.useProgram(state.fadeProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, finalTexture);
    gl.uniform1i(gl.getUniformLocation(state.fadeProgram, 'u_texture'), 0);
    gl.uniform1f(gl.getUniformLocation(state.fadeProgram, 'u_fadeRate'), 0.0); // No fade for display
    gl.uniform1f(gl.getUniformLocation(state.fadeProgram, 'u_threshold'), 0.0); // No threshold for display

    gl.bindBuffer(gl.ARRAY_BUFFER, state.quadBuffer);
    gl.enableVertexAttribArray(positionLoc);
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 4. Swap textures for next frame
    state.currentTexture = 1 - state.currentTexture;
}

function renderCanvas() {
    // Exponential fade overlay
    ctx.fillStyle = `rgba(12, 12, 12, ${fadeRate})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hard cutoff for dim pixels (fallback method)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const threshold = brightnessThreshold * 255;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r < threshold && g < threshold && b < threshold) {
            data[i] = 12;     // R
            data[i + 1] = 12; // G
            data[i + 2] = 12; // B
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw trajectory points
    const currentSystemObj = DYNAMICAL_SYSTEMS[currentSystemName];
    for (let i = 0; i < trajectories.length; i++) {
        const p = trajectories[i];

        const canvasX = mapRange(p.x, currentSystemObj.mapRange.xMin, currentSystemObj.mapRange.xMax, 0, canvas.width);
        const canvasY = mapRange(p.y, currentSystemObj.mapRange.yMin, currentSystemObj.mapRange.yMax, 0, canvas.height);

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
}

function animate(currentTime) {
    animationFrameId = requestAnimationFrame(animate);

    const elapsed = currentTime - lastFrameTime;
    if (elapsed < frameInterval) { return; }
    lastFrameTime = currentTime - (elapsed % frameInterval);

    // Evolve parameters for the active system
    const currentSystemObj = DYNAMICAL_SYSTEMS[currentSystemName];
    for (const key in currentSystemObj.evolution) {
        const p = currentSystemObj.evolution[key];
        currentParams[key] = manualParams[key] !== undefined
            ? manualParams[key]
            : p.center + p.func(time * p.speed) * p.range;
    }

    // Update trajectory positions
    for (let i = 0; i < trajectories.length; i++) {
        const p = trajectories[i];
        const { x: x_next, y: y_next } = currentSystemObj.updateFunction(p, currentParams);
        p.x = x_next;
        p.y = y_next;
    }

    // Render using appropriate method
    if (useWebGL) {
        renderWebGL();
    } else {
        renderCanvas();
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