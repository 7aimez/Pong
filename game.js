const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const PADDLE_MARGIN = 18;
const BALL_RADIUS = 10;

let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 6 * (Math.random() < 0.5 ? 1 : -1),
    vy: 4 * (Math.random() < 0.5 ? 1 : -1),
    radius: BALL_RADIUS
};

let playerScore = 0;
let aiScore = 0;

// Mouse control for player paddle
canvas.addEventListener('mousemove', function (evt) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = evt.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp paddle inside canvas
    playerY = Math.max(Math.min(playerY, canvas.height - PADDLE_HEIGHT), 0);
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 34) {
        drawRect(canvas.width / 2 - 1, i, 2, 18, "#444");
    }
}

function drawText(text, x, y) {
    ctx.fillStyle = "#eee";
    ctx.font = "bold 36px Arial";
    ctx.fillText(text, x, y);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Ensure the ball does not move strictly horizontally or vertically
    let angle = (Math.random() * Math.PI) / 2 - Math.PI / 4; // -45 to +45 deg
    let direction = Math.random() < 0.5 ? 1 : -1;
    let speed = 7;
    ball.vx = speed * Math.cos(angle) * direction;
    ball.vy = speed * Math.sin(angle);
}

function collision(paddleX, paddleY, paddleW, paddleH, ball) {
    return (
        ball.x + ball.radius > paddleX &&
        ball.x - ball.radius < paddleX + paddleW &&
        ball.y + ball.radius > paddleY &&
        ball.y - ball.radius < paddleY + paddleH
    );
}

// Basic AI for right paddle
function aiMove() {
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (ball.y < aiCenter - 18) {
        aiY -= 5;
    } else if (ball.y > aiCenter + 18) {
        aiY += 5;
    }
    // Clamp AI paddle inside canvas
    aiY = Math.max(Math.min(aiY, canvas.height - PADDLE_HEIGHT), 0);
}

function update() {
    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top wall collision
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius; // Correct position
        ball.vy *= -1;
    }
    // Bottom wall collision
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius; // Correct position
        ball.vy *= -1;
    }

    // Left paddle collision (player)
    if (
        collision(
            PADDLE_MARGIN,
            playerY,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            ball
        ) && ball.vx < 0
    ) {
        ball.x = PADDLE_MARGIN + PADDLE_WIDTH + ball.radius; // Place ball outside paddle
        ball.vx *= -1.05; // Bounce and increase speed
        // Add some variation
        let collidePoint = ball.y - (playerY + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        ball.vx = speed * Math.cos(angleRad);
        if (ball.vx < 0) ball.vx = -ball.vx; // Ensure right direction after math
        ball.vy = speed * Math.sin(angleRad);
    }

    // Right paddle collision (AI)
    if (
        collision(
            canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
            aiY,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            ball
        ) && ball.vx > 0
    ) {
        ball.x = canvas.width - PADDLE_MARGIN - PADDLE_WIDTH - ball.radius; // Place ball outside paddle
        ball.vx *= -1.05; // Bounce and increase speed
        let collidePoint = ball.y - (aiY + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        ball.vx = -Math.abs(speed * Math.cos(angleRad)); // Ensure left direction after math
        ball.vy = speed * Math.sin(angleRad);
    }

    // Score update
    if (ball.x - ball.radius < 0) {
        aiScore++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
    }

    aiMove();
}

function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, "#111");

    // Net
    drawNet();

    // Player paddle
    drawRect(PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#eee");

    // AI paddle
    drawRect(
        canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
        aiY,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        "#eee"
    );

    // Ball
    drawCircle(ball.x, ball.y, ball.radius, "#f5c518");

    // Score
    drawText(playerScore, canvas.width / 2 - 50, 50);
    drawText(aiScore, canvas.width / 2 + 28, 50);
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
