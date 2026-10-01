import {
  calculateFlightTime,
  calculateMaxHeight,
  calculatePosition,
  calculateRange,
  buildTrajectory,
  gravitationalAcceleration,
} from './physics.js';

const root = document.querySelector('#content-root');

const state = {
  content: null,
  settings: {
    initialSpeed: 20,
    angleDegrees: 45,
  },
  elapsedTime: 0,
  currentPosition: { x: 0, y: 0 },
  trajectory: [],
  flightTime: 0,
  maxRange: 0,
  maxHeight: 0,
  isRunning: false,
  isFinished: false,
  animationFrameId: null,
  previousTimestamp: 0,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateControlValues() {
  const speedOutput = document.querySelector('#velocity-output');
  const angleOutput = document.querySelector('#angle-output');

  if (speedOutput) {
    speedOutput.textContent = `${state.settings.initialSpeed} m/s`;
  }

  if (angleOutput) {
    angleOutput.textContent = `${state.settings.angleDegrees}°`;
  }
}

function updateSummary() {
  const elapsedTimeValue = document.querySelector('#elapsed-time');
  const positionValue = document.querySelector('#position-value');
  const rangeValue = document.querySelector('#range-value');

  const x = clamp(state.currentPosition.x, 0, Number.POSITIVE_INFINITY);
  const y = Math.max(0, state.currentPosition.y);

  if (elapsedTimeValue) {
    elapsedTimeValue.textContent = `${state.elapsedTime.toFixed(2)} s`;
  }

  if (positionValue) {
    positionValue.textContent = `${x.toFixed(2)} m, ${y.toFixed(2)} m`;
  }

  if (rangeValue) {
    rangeValue.textContent = `${x.toFixed(2)} m`;
  }
}

function updateCanvasBounds() {
  const maxRange = Math.max(state.maxRange, 10);
  const maxHeight = Math.max(state.maxHeight, 5);

  const canvas = document.querySelector('#projectile-canvas');
  if (!canvas) {
    return;
  }

  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const margin = { left: 52, right: 28, top: 24, bottom: 36 };
  const usableWidth = width - margin.left - margin.right;
  const usableHeight = height - margin.top - margin.bottom;

  const scaleX = usableWidth / maxRange;
  const scaleY = usableHeight / maxHeight;

  const toScreen = (worldX, worldY) => ({
    x: margin.left + worldX * scaleX,
    y: height - margin.bottom - worldY * scaleY,
  });

  context.clearRect(0, 0, width, height);

  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#edf8ff');
  sky.addColorStop(1, '#ffffff');
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  const groundY = height - margin.bottom;
  context.strokeStyle = '#5a7d5d';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(margin.left, groundY);
  context.lineTo(width - margin.right, groundY);
  context.stroke();

  context.strokeStyle = '#d8e4f2';
  context.setLineDash([6, 6]);
  context.beginPath();
  context.moveTo(margin.left, groundY);
  context.lineTo(width - margin.right, groundY);
  context.stroke();
  context.setLineDash([]);

  context.strokeStyle = '#9cb5d7';
  context.beginPath();
  context.moveTo(margin.left, margin.top);
  context.lineTo(margin.left, groundY);
  context.moveTo(margin.left, groundY);
  context.lineTo(width - margin.right, groundY);
  context.stroke();

  const trajectory = state.trajectory;
  if (trajectory.length > 1) {
    context.beginPath();
    trajectory.forEach((point, index) => {
      const screenPoint = toScreen(point.x, point.y);
      if (index === 0) {
        context.moveTo(screenPoint.x, screenPoint.y);
      } else {
        context.lineTo(screenPoint.x, screenPoint.y);
      }
    });
    context.strokeStyle = '#1b6dc1';
    context.lineWidth = 3;
    context.stroke();
  }

  const projectilePoint = toScreen(state.currentPosition.x, state.currentPosition.y);
  context.beginPath();
  context.fillStyle = '#ef5350';
  context.arc(projectilePoint.x, projectilePoint.y, 7, 0, Math.PI * 2);
  context.fill();

  const startPoint = toScreen(0, 0);
  context.beginPath();
  context.fillStyle = '#2d5b3d';
  context.arc(startPoint.x, startPoint.y, 5, 0, Math.PI * 2);
  context.fill();

  const landingPoint = toScreen(state.maxRange, 0);
  context.beginPath();
  context.fillStyle = '#2d5b3d';
  context.arc(landingPoint.x, landingPoint.y, 5, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#1a2433';
  context.font = '12px Arial';
  context.fillText('x', width - margin.right, groundY + 18);
  context.fillText('y', margin.left - 18, margin.top + 8);
}

function drawScene() {
  updateCanvasBounds();
  updateSummary();
}

function resetSimulation() {
  const { initialSpeed, angleDegrees } = state.settings;

  state.elapsedTime = 0;
  state.currentPosition = { x: 0, y: 0 };
  state.isRunning = false;
  state.isFinished = false;
  state.previousTimestamp = 0;
  state.flightTime = calculateFlightTime(initialSpeed, angleDegrees);
  state.maxRange = calculateRange(initialSpeed, angleDegrees);
  state.maxHeight = calculateMaxHeight(initialSpeed, angleDegrees);
  state.trajectory = buildTrajectory(initialSpeed, angleDegrees, 180).filter((point) => point.t <= 0);

  updateControlValues();
  drawScene();
}

function step(timestamp) {
  if (!state.isRunning) {
    return;
  }

  if (!state.previousTimestamp) {
    state.previousTimestamp = timestamp;
  }

  const deltaSeconds = (timestamp - state.previousTimestamp) / 1000;
  state.previousTimestamp = timestamp;

  const nextTime = state.elapsedTime + deltaSeconds;
  const { initialSpeed, angleDegrees } = state.settings;

  if (nextTime >= state.flightTime) {
    state.elapsedTime = state.flightTime;
    state.currentPosition = calculatePosition(initialSpeed, angleDegrees, state.elapsedTime);
    state.currentPosition.y = 0;
    state.trajectory = buildTrajectory(initialSpeed, angleDegrees, 180).filter(
      (point) => point.t <= state.elapsedTime
    );
    state.isRunning = false;
    state.isFinished = true;
    drawScene();
    return;
  }

  state.elapsedTime = nextTime;
  state.currentPosition = calculatePosition(initialSpeed, angleDegrees, state.elapsedTime);

  if (state.currentPosition.y <= 0) {
    state.elapsedTime = calculateFlightTime(initialSpeed, angleDegrees);
    state.currentPosition = { x: state.maxRange, y: 0 };
    state.isRunning = false;
    state.isFinished = true;
  }

  state.trajectory = buildTrajectory(initialSpeed, angleDegrees, 180).filter(
    (point) => point.t <= state.elapsedTime
  );
  drawScene();

  if (state.isRunning) {
    state.animationFrameId = window.requestAnimationFrame(step);
  }
}

function startSimulation() {
  if (state.isRunning) {
    return;
  }

  if (state.isFinished || state.elapsedTime >= state.flightTime) {
    resetSimulation();
  }

  state.isRunning = true;
  state.previousTimestamp = 0;
  state.animationFrameId = window.requestAnimationFrame(step);
}

function pauseSimulation() {
  state.isRunning = false;
  if (state.animationFrameId) {
    window.cancelAnimationFrame(state.animationFrameId);
  }
  state.animationFrameId = null;
  state.previousTimestamp = 0;
  drawScene();
}

function renderContent(content) {
  if (!root) {
    return;
  }

  const equationList = content.equations
    .map(
      (equation) => `
        <li class="equation-item">
          <h3>${equation.name}</h3>
          <p class="equation">${equation.equation}</p>
          <p class="equation-note">${equation.explanation}</p>
        </li>
      `
    )
    .join('');

  const defaultSpeed = content.example.values.initialSpeed;
  const defaultAngle = content.example.values.angleDegrees;
  state.settings = {
    initialSpeed: defaultSpeed,
    angleDegrees: defaultAngle,
  };

  root.innerHTML = `
    <section class="panel app-grid">
      <aside>
        <p class="eyebrow">${content.subtitle}</p>
        <h1>${content.title}</h1>
        <p class="intro">${content.intro}</p>

        <ul class="assumptions">
          ${content.assumptions.map((item) => `<li>${item}</li>`).join('')}
        </ul>

        <h2>Grundekvationer</h2>
        <ul class="equations">
          ${equationList}
        </ul>

        <h2>${content.example.title}</h2>
        <p>${content.example.description}</p>

        <dl class="metrics">
          <div>
            <dt>${content.labels.velocity}</dt>
            <dd>${defaultSpeed} m/s</dd>
          </div>
          <div>
            <dt>${content.labels.angle}</dt>
            <dd>${defaultAngle}°</dd>
          </div>
          <div>
            <dt>${content.labels.gravity}</dt>
            <dd>${gravitationalAcceleration} m/s²</dd>
          </div>
          <div>
            <dt>${content.labels.flightTime}</dt>
            <dd>${calculateFlightTime(defaultSpeed, defaultAngle).toFixed(2)} s</dd>
          </div>
          <div>
            <dt>${content.labels.range}</dt>
            <dd>${calculateRange(defaultSpeed, defaultAngle).toFixed(2)} m</dd>
          </div>
          <div>
            <dt>${content.labels.maxHeight}</dt>
            <dd>${calculateMaxHeight(defaultSpeed, defaultAngle).toFixed(2)} m</dd>
          </div>
        </dl>

        <p class="teacher-note">${content.teacherNote}</p>
      </aside>

      <section class="sim-panel" aria-label="Simulering av ideal kastbana">
        <h2>${content.ui.controls}</h2>

        <div class="control-panel">
          <div class="slider-row">
            <div class="slider-header">
              <label for="velocity-slider">${content.labels.velocity}</label>
              <span id="velocity-output" class="slider-value">${defaultSpeed} m/s</span>
            </div>
            <input id="velocity-slider" type="range" min="10" max="80" step="1" value="${defaultSpeed}" />
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <label for="angle-slider">${content.labels.angle}</label>
              <span id="angle-output" class="slider-value">${defaultAngle}°</span>
            </div>
            <input id="angle-slider" type="range" min="10" max="80" step="1" value="${defaultAngle}" />
          </div>

          <div class="button-row">
            <button type="button" class="primary-button" data-action="start">${content.ui.start}</button>
            <button type="button" class="secondary-button" data-action="pause">${content.ui.pause}</button>
            <button type="button" class="ghost-button" data-action="reset">${content.ui.reset}</button>
          </div>
        </div>

        <div class="metric-grid" aria-live="polite">
          <div class="metric-card">
            <span>${content.ui.elapsedTime}</span>
            <strong id="elapsed-time">0.00 s</strong>
          </div>
          <div class="metric-card">
            <span>${content.ui.position}</span>
            <strong id="position-value">0.00 m, 0.00 m</strong>
          </div>
          <div class="metric-card">
            <span>${content.ui.range}</span>
            <strong id="range-value">0.00 m</strong>
          </div>
        </div>

        <div class="canvas-shell">
          <canvas id="projectile-canvas" width="760" height="360" aria-label="${content.ui.trajectory}"></canvas>
        </div>
      </section>
    </section>
  `;

  const speedSlider = document.querySelector('#velocity-slider');
  const angleSlider = document.querySelector('#angle-slider');

  speedSlider.addEventListener('input', (event) => {
    state.settings.initialSpeed = Number(event.target.value);
    updateControlValues();
    resetSimulation();
  });

  angleSlider.addEventListener('input', (event) => {
    state.settings.angleDegrees = Number(event.target.value);
    updateControlValues();
    resetSimulation();
  });

  document.querySelector('[data-action="start"]').addEventListener('click', startSimulation);
  document.querySelector('[data-action="pause"]').addEventListener('click', pauseSimulation);
  document.querySelector('[data-action="reset"]').addEventListener('click', resetSimulation);

  state.settings = {
    initialSpeed: defaultSpeed,
    angleDegrees: defaultAngle,
  };
  state.flightTime = calculateFlightTime(defaultSpeed, defaultAngle);
  state.maxRange = calculateRange(defaultSpeed, defaultAngle);
  state.maxHeight = calculateMaxHeight(defaultSpeed, defaultAngle);
  state.trajectory = buildTrajectory(defaultSpeed, defaultAngle, 180).filter((point) => point.t <= 0);
  updateControlValues();
  drawScene();
}

async function loadContent() {
  try {
    const response = await fetch('./content.json');

    if (!response.ok) {
      throw new Error(`Kunde inte läsa content.json: ${response.status}`);
    }

    const content = await response.json();
    state.content = content;
    renderContent(content);
  } catch (error) {
    console.error(error);
    if (root) {
      root.innerHTML = '<p>Det gick inte att läsa innehållet. Kontrollera att content.json finns.</p>';
    }
  }
}

loadContent();
