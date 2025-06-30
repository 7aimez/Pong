// Minimalist Modern Pong with Settings and 2P Mode

document.body.innerHTML = `
  <style>
    body {
      background: #18181b; color: #e4e4e7; font-family: 'Inter', Arial, sans-serif;
      margin: 0; padding: 0;
    }
    .pong-root {
      min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    #pong-container {
      position: relative; background: #222; border-radius: 22px;
      padding: 54px 54px 40px 54px; box-shadow: 0 8px 40px #000b;
      margin: 48px 0 0 0;
      display: flex; flex-direction: column; align-items: center;
      min-width: 640px;
    }
    #pong {
      background: #18181b;
      border-radius: 16px;
      box-shadow: 0 2px 24px #0005;
      display: block;
    }
    #score-row {
      display: flex; justify-content: space-between; width: 100%; margin-bottom: 40px;
      font-size: 36px; font-weight: 600; letter-spacing: 4px;
      padding: 0 24px;
    }
    #settings-btn {
      position: fixed; top: 28px; right: 38px;
      background: #23232b; color: #e4e4e7;
      border: none; border-radius: 10px; width: 48px; height: 48px;
      font-size: 28px; cursor: pointer;
      box-shadow: 0 2px 12px #0005;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
      z-index: 10;
    }
    #settings-btn:hover { background: #f5c518; color: #18181b; }
    #settings-modal {
      display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: #18181bcc; align-items: center; justify-content: center; z-index: 100;
      animation: fadein 0.2s;
    }
    #settings-modal.active { display: flex; }
    #settings-panel {
      background: #23232b; border-radius: 16px; padding: 50px 56px 44px 56px;
      box-shadow: 0 4px 48px #000a; min-width: 340px;
      display: flex; flex-direction: column; gap: 34px;
      align-items: center;
      font-size: 18px;
    }
    #settings-panel label { font-size: 19px; margin-bottom: 8px; font-weight: 500; }
    #settings-panel select, #settings-panel input[type="range"] {
      margin-top: 8px;
      appearance: none; border: none; border-radius: 8px;
      background: #1c1c22; color: #f5c518; padding: 8px 18px;
      font-size: 18px;
      outline: none;
    }
    #settings-panel input[type="range"] {
      width: 180px; background: #1c1c22; accent-color: #f5c518; height: 6px;
    }
    #settings-panel .setting-row {
      display: flex; flex-direction: column; align-items: start; gap: 3px; width: 100%;
    }
    #close-settings {
      background: #f5c518; color: #18181b; border: none; border-radius: 8px;
      padding: 10px 28px; font-size: 18px; font-weight: 600; margin-top: 22px; cursor: pointer;
      align-self: center; margin-bottom: -4px;
      box-shadow: 0 2px 12px #0005;
      transition: background 0.14s;
    }
    #close-settings:hover { background: #e4e4e7; color: #23232b; }
    .getready-text {
      color: #f5c518; font-size: 33px; font-weight: 700;
      text-align: center; letter-spacing: 2px;
      margin-top: 34px;
      animation: fadein 0.35s;
    }
    @media (max-width: 800px) {
      #pong-container { min-width: 300px; padding: 16px 0 12px 0; }
      #score-row { font-size: 24px; padding: 0 10px; }
      #settings-panel { min-width: 220px; padding: 20px 8vw 18px 8vw; }
    }
    @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
  </style>
  <div class="pong-root">
    <button id="settings-btn" title="Settings">&#9881;</button>
    <div id="settings-modal">
      <div id="settings-panel">
        <div class="setting-row">
          <label for="speed-range">Ball Speed</label>
          <input type="range" id="speed-range" min="4" max="16" value="7" step="1">
        </div>
        <div class="setting-row">
          <label for="mode-select">Game Mode</label>
          <select id="mode-select">
            <option value="1p">1 Player (vs AI)</option>
            <option value="2p">2 Player</option>
          </select>
        </div>
        <button id="close-settings">Close</button>
      </div>
    </div>
    <div id="pong-container">
      <div id="score-row">
        <span id="score-left">0</span>
        <span id="score-right">0</span>
      </div>
      <canvas id="pong" width="700" height="400"></canvas>
      <div id="getready" class="getready-text" style="display:none"></div>
    </div>
  </div>
`;

const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants & state
const PADDLE_WIDTH = 15, PADDLE_HEIGHT = 90, PADDLE_MARGIN = 32, BALL_RADIUS = 11;
const PAUSE_AFTER_SCORE = 1200, SHOW_GET_READY_DELAY = 220, GAME_START_DELAY = 900, PADDLE_SPEED = 8;
let ballSpeed = 7;
let mode2p = false;

const leftScoreElem = document.getElementById("score-left");
const rightScoreElem = document.getElementById("score-right");

let leftY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let rightY = canvas.height / 2 - PADDLE_HEIGHT / 2;

let ball = { x: canvas.width / 2, y: canvas.height / 2, vx: 0, vy: 0, radius: BALL_RADIUS };
let leftScore = 0, rightScore = 0;

let isPaused = true;
let showGetReady = false;
let getReadyMsg = "";
let keys = { ArrowUp: false, ArrowDown: false, KeyW: false, KeyS: false };
let frameReq;

// Settings Modal
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const speedRange = document.getElementById('speed-range');
const modeSelect = document.getElementById('mode-select');
const getReadyDiv = document.getElementById('getready');

// Settings logic
settingsBtn.onclick = () => { settingsModal.classList.add('active'); };
closeSettings.onclick = () => { settingsModal.classList.remove('active'); };
settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.classList.remove('active'); };

speedRange.oninput = () => {
  ballSpeed = Number(speedRange.value);
};
modeSelect.onchange = () => {
  mode2p = modeSelect.value === "2p";
  restartGame();
};

function restartGame() {
  leftScore = 0; rightScore = 0;
  updateScores();
  leftY = canvas.height / 2 - PADDLE_HEIGHT / 2;
  rightY = canvas.height / 2 - PADDLE_HEIGHT / 2;
  startGameWithDelay();
}

// Keyboard controls
document.addEventListener('keydown', e => {
  if (e.code in keys) keys[e.code] = true;
});
document.addEventListener('keyup', e => {
  if (e.code in keys) keys[e.code] = false;
});

// Minimal paddles: left (W/S or up/down), right (up/down or W/S, based on mode)
function updatePaddles() {
  if (mode2p) {
    // 2P: left W/S, right up/down
    if (keys.KeyW) leftY -= PADDLE_SPEED;
    if (keys.KeyS) leftY += PADDLE_SPEED;
    if (keys.ArrowUp) rightY -= PADDLE_SPEED;
    if (keys.ArrowDown) rightY += PADDLE_SPEED;
  } else {
    // 1P: left up/down, right is AI
    if (keys.ArrowUp) leftY -= PADDLE_SPEED;
    if (keys.ArrowDown) leftY += PADDLE_SPEED;
    // AI for right
    const aiCenter = rightY + PADDLE_HEIGHT / 2;
    if (ball.y < aiCenter - 18) rightY -= 6;
    else if (ball.y > aiCenter + 18) rightY += 6;
  }
  leftY = Math.max(0, Math.min(leftY, canvas.height - PADDLE_HEIGHT));
  rightY = Math.max(0, Math.min(rightY, canvas.height - PADDLE_HEIGHT));
}

// Ball reset & serve
function randomBallDirection() {
  let angle = (Math.random() * Math.PI / 2) - (Math.PI / 4);
  let direction = (Math.random() < 0.5) ? 1 : -1;
  return {
    vx: ballSpeed * Math.cos(angle) * direction,
    vy: ballSpeed * Math.sin(angle)
  };
}
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  let dir = randomBallDirection();
  ball.vx = dir.vx;
  ball.vy = dir.vy;
}
function stopBall() { ball.vx = 0; ball.vy = 0; }

// Utility: Clamp
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

function collision(px, py, pw, ph, ball) {
  return (
    ball.x + ball.radius > px &&
    ball.x - ball.radius < px + pw &&
    ball.y + ball.radius > py &&
    ball.y - ball.radius < py + ph
  );
}

// Scoring, pause, get ready
function updateScores() {
  leftScoreElem.textContent = leftScore;
  rightScoreElem.textContent = rightScore;
}

function startPause(msg = "Get Ready!") {
  isPaused = true;
  getReadyMsg = msg;
  showGetReady = false;
  stopBall();
  getReadyDiv.style.display = "none";
  setTimeout(() => {
    showGetReady = true;
    getReadyDiv.textContent = getReadyMsg;
    getReadyDiv.style.display = "";
    setTimeout(() => {
      showGetReady = false;
      getReadyDiv.style.display = "none";
      resetBall();
      isPaused = false;
    }, PAUSE_AFTER_SCORE - SHOW_GET_READY_DELAY);
  }, SHOW_GET_READY_DELAY);
}
function startGameWithDelay() {
  isPaused = true;
  getReadyMsg = "Get Ready!";
  showGetReady = false;
  stopBall();
  getReadyDiv.style.display = "none";
  setTimeout(() => {
    showGetReady = true;
    getReadyDiv.textContent = getReadyMsg;
    getReadyDiv.style.display = "";
    setTimeout(() => {
      showGetReady = false;
      getReadyDiv.style.display = "none";
      resetBall();
      isPaused = false;
    }, PAUSE_AFTER_SCORE - SHOW_GET_READY_DELAY);
  }, GAME_START_DELAY);
}

// Main update/draw
function update() {
  if (isPaused) {
    updatePaddles();
    return;
  }
  updatePaddles();

  // Ball movement
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Top/bottom wall
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius; ball.vy *= -1;
  }
  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius; ball.vy *= -1;
  }

  // Left paddle collision
  if (
    ball.vx < 0 &&
    collision(PADDLE_MARGIN, leftY, PADDLE_WIDTH, PADDLE_HEIGHT, ball)
  ) {
    ball.x = PADDLE_MARGIN + PADDLE_WIDTH + ball.radius;
    let collidePoint = ball.y - (leftY + PADDLE_HEIGHT / 2);
    collidePoint /= (PADDLE_HEIGHT / 2);
    let angleRad = (Math.PI / 4) * collidePoint;
    let speed = Math.min(Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) * 1.04, 17);
    ball.vx = Math.abs(speed * Math.cos(angleRad));
    ball.vy = speed * Math.sin(angleRad);
  }

  // Right paddle collision
  if (
    ball.vx > 0 &&
    collision(canvas.width - PADDLE_MARGIN - PADDLE_WIDTH, rightY, PADDLE_WIDTH, PADDLE_HEIGHT, ball)
  ) {
    ball.x = canvas.width - PADDLE_MARGIN - PADDLE_WIDTH - ball.radius;
    let collidePoint = ball.y - (rightY + PADDLE_HEIGHT / 2);
    collidePoint /= (PADDLE_HEIGHT / 2);
    let angleRad = (Math.PI / 4) * collidePoint;
    let speed = Math.min(Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) * 1.04, 17);
    ball.vx = -Math.abs(speed * Math.cos(angleRad));
    ball.vy = speed * Math.sin(angleRad);
  }

  // Score update
  if (ball.x - ball.radius < 0) {
    rightScore++; updateScores();
    startPause(mode2p ? "Player 2 Scores!" : "AI Scores!");
  } else if (ball.x + ball.radius > canvas.width) {
    leftScore++; updateScores();
    startPause(mode2p ? "Player 1 Scores!" : "You Score!");
  }
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
}
function drawNet() {
  ctx.save();
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < canvas.height; i += 28)
    drawRect(canvas.width / 2 - 1, i, 2, 17, "#f5c518");
  ctx.restore();
}
function render() {
  drawRect(0, 0, canvas.width, canvas.height, "#18181b");
  drawNet();
  // Paddles
  drawRect(PADDLE_MARGIN, leftY, PADDLE_WIDTH, PADDLE_HEIGHT, "#e4e4e7");
  drawRect(canvas.width - PADDLE_MARGIN - PADDLE_WIDTH, rightY, PADDLE_WIDTH, PADDLE_HEIGHT, "#e4e4e7");
  // Ball
  drawCircle(ball.x, ball.y, ball.radius, "#f5c518");
}

// Main loop
function gameLoop() {
  update();
  render();
  frameReq = requestAnimationFrame(gameLoop);
}

// Start
speedRange.value = ballSpeed;
modeSelect.value = mode2p ? "2p" : "1p";
startGameWithDelay();
updateScores();
gameLoop();
