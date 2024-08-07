const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800; // Set canvas width
canvas.height = 600; // Set canvas height

const birdImg = new Image();
birdImg.src = 'nyan.png'; // Replace 'bird.png' with the path to your custom bird image

const pipes = [];
let score = 0;
let highScore = 0;
let level = 1;

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

const bgMusic = new Audio('background.mp3'); // Add background music
const jumpSound = new Audio('jump.mp3'); // Add jump sound effect
const gameOverSound = new Audio('gameover.mp3'); // Add game over sound effect

bgMusic.loop = true;

let animationFrameId;
let isPaused = false;

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
    ctx.fillText("High Score: " + highScore, 20, 80);
    ctx.fillText("Level: " + level, 20, 120);
}

function update() {
    if (!isPaused) {
        // Update bird position
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Flap bird
        if (keys[" "] || keys["Space"]) {
            bird.velocity = bird.jumpStrength;
            jumpSound.play();
        }

        // Generate pipes
        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
            const pipeGap = 200; // Gap between pipes
            const pipeWidth = 50;
            const minHeight = 30; // Adjusted height
            const totalHeight = canvas.height - pipeGap;
            const topHeight = Math.floor(Math.random() * (totalHeight - 2 * minHeight)) + minHeight;
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
            pipe.x -= 2 + level; // Increase speed as level increases

            // Increase score if bird passes the pipe
            if (bird.x > pipe.x + pipe.width && !pipe.passed) {
                score++;
                pipe.passed = true;
                if (score % 10 === 0) {
                    level++; // Increase level every 10 points
                }
                if (score > highScore) {
                    highScore = score;
                }
            }
        });

        // Remove off-screen pipes
        if (pipes.length > 0 && pipes[0].x + pipes[0].width < 0) {
            pipes.shift();
        }

        // Check collisions
        if (bird.y - bird.radius < 0 || bird.y + bird.radius > canvas.height || collision()) {
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
    }

    animationFrameId = requestAnimationFrame(update);
}

function collision() {
    for (let pipe of pipes) {
        if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipe.width &&
            (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > canvas.height - pipe.bottomHeight)) {
            return true;
        }
    }
    return false;
}

// Keyboard input
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === "p" || e.key === "P") {
        togglePause();
    }
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Touch controls for mobile devices
canvas.addEventListener("touchstart", () => {
    bird.velocity = bird.jumpStrength;
    jumpSound.play();
});

// Define a function to reset the game state
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    level = 1; // Reset level
}

function gameOver() {
    gameOverSound.play();
    alert("Game over! Score: " + score);
    saveHighScore();
    resetGame();
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        bgMusic.pause();
    } else {
        bgMusic.play();
    }
}

// Main menu functionality
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    bgMusic.play();
    update();
});

document.getElementById('instructionsButton').addEventListener('click', () => {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('instructions').style.display = 'flex';
});

document.getElementById('highScoresButton').addEventListener('click', () => {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('highScores').style.display = 'flex';
    updateHighScores();
});

document.getElementById('backButton').addEventListener('click', () => {
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
});

document.getElementById('backButtonHighScores').addEventListener('click', () => {
    document.getElementById('highScores').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
});

function updateHighScores() {
    const highScoresList = document.getElementById('highScoresList');
    highScoresList.innerHTML = ''; // Clear previous high scores
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score}`;
        highScoresList.appendChild(li);
    });
}

// Save high score to local storage
function saveHighScore() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.push(score);
    highScores.sort((a, b) => b - a); // Sort high scores in descending order
    highScores.splice(5); // Keep only top 5 high scores
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function showMainMenu() {
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
}

showMainMenu(); // Show the main menu initially
