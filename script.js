const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800; // Set canvas width
canvas.height = 600; // Set canvas height

const birdImg = new Image();
birdImg.src = 'nyan.png'; // Replace 'bird.png' with the path to your custom bird image

const pipes = [];
let score = 0;

const pipeTopImg = new Image();
pipeTopImg.src = 'cuuuul.gif'; // Replace 'pipe_top.png' with the path to your custom top pipe image

const pipeBottomImg = new Image();
pipeBottomImg.src = 'cuuuul.gif'; // Replace 'pipe_bottom.png' with the path to your custom bottom pipe image

const bird = {
    x: 100,
    y: canvas.height / 2,
    radius: 20,
    velocity: 0,
    gravity: 0.2,
    jumpStrength: -5,
};

function drawBird() {
    ctx.drawImage(birdImg, bird.x - bird.radius, bird.y - bird.radius, bird.radius * 2, bird.radius * 2);
}

function drawPipes() {
    pipes.forEach((pipe) => {
        // Draw upper pipe
        ctx.drawImage(pipeTopImg, pipe.x, 0, pipe.width, pipe.topHeight);

        // Space between upper and lower pipe
        const space = 200; // Adjust this value as needed

        // Draw lower pipe
        ctx.drawImage(pipeBottomImg, pipe.x, pipe.topHeight + space, pipe.width, canvas.height - pipe.topHeight - space);
    });
}

function drawScore() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 20, 40);
}

function update() {
    // Update bird position
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Flap bird
    if (keys[" "] || keys["Space"]) {
        // Spacebar or Keyboard space
        bird.velocity = bird.jumpStrength;
    }

    // Generate pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        const pipeGap = 200; // Gap between pipes
        const pipeWidth = 50;
        const minHeight = 30; // Adjusted height
        const totalHeight = canvas.height - pipeGap;
        const topHeight =
            Math.floor(Math.random() * (totalHeight - 2 * minHeight)) + minHeight;
        const bottomHeight = totalHeight - topHeight;
        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            bottomHeight: bottomHeight,
            width: pipeWidth,
        });
    }

    // Move pipes
    pipes.forEach((pipe) => {
        pipe.x -= 2;

        // Increase score if bird passes the pipe
        if (bird.x > pipe.x + pipe.width && !pipe.passed) {
            score++;
            pipe.passed = true;
        }
    });

    // Remove off-screen pipes
    if (pipes.length > 0 && pipes[0].x + pipes[0].width < 0) {
        pipes.shift();
    }

    // Check collisions
    if (
        bird.y - bird.radius < 0 ||
        bird.y + bird.radius > canvas.height ||
        collision()
    ) {
        // Game over
        gameOver();
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bird
    drawBird();

    // Draw pipes
    drawPipes();

    // Draw score
    drawScore();

    requestAnimationFrame(update);
}

function collision() {
    for (let pipe of pipes) {
        if (
            bird.x + bird.radius > pipe.x && // right edge of bird is to the right of left edge of pipe
            bird.x - bird.radius < pipe.x + pipe.width && // left edge of bird is to the left of right edge of pipe
            (bird.y - bird.radius < pipe.topHeight ||
                bird.y + bird.radius > canvas.height - pipe.bottomHeight) // bird collides with top pipe or bottom pipe
        ) {
            return true;
        }
    }
    return false;
}

// Keyboard input
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Define a function to reset the game state
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
}

function gameOver() {
    alert("Game over! Score: " + score);
    resetGame();
}

update();
