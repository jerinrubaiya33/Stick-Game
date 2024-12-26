// Game variables
let canvas, ctx, width, height;
let phase = "waiting";
let lastTimestamp = 0;
let heroX, heroY, sceneOffset;
let platforms = [];
let sticks = [];
let score = 0;

// Game constants
const canvasWidth = 375;
const canvasHeight = 375;
const platformHeight = 100;
const heroDistanceFromEdge = 10;
const paddingX = 100;
const perfectAreaSize = 10;
const heroWidth = 17;
const heroHeight = 30;
const walkingSpeed = 4;
const transitioningSpeed = 2;
const fallingSpeed = 2;
const stretchingSpeed = 4;
const turningSpeed = 4;

// Initialize the game
function init() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    resetGame();

    // Event listeners
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", onResize);
    document.getElementById("restart").addEventListener("click", resetGame);

    // Start game loop
    window.requestAnimationFrame(animate);
}

// Game loop
function animate(timestamp) {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
        window.requestAnimationFrame(animate);
        return;
    }

    switch (phase) {
        case "waiting":
            return;
        case "stretching": {
            sticks[sticks.length - 1].length += (timestamp - lastTimestamp) / stretchingSpeed;
            break;
        }
        case "turning": {
            sticks[sticks.length - 1].rotation += (timestamp - lastTimestamp) / turningSpeed;

            if (sticks[sticks.length - 1].rotation > 90) {
                sticks[sticks.length - 1].rotation = 90;

                const [nextPlatform, perfectHit] = thePlatformTheStickHits();
                if (nextPlatform) {
                    score += perfectHit ? 2 : 1;
                    updateScore();

                    if (perfectHit) {
                        showPerfect();
                    }

                    generatePlatform();
                }

                phase = "walking";
            }
            break;
        }
        case "walking": {
            heroX += (timestamp - lastTimestamp) / walkingSpeed;

            const [nextPlatform] = thePlatformTheStickHits();
            if (nextPlatform) {
                const maxHeroX = nextPlatform.x + nextPlatform.w - heroDistanceFromEdge;
                if (heroX > maxHeroX) {
                    heroX = maxHeroX;
                    phase = "transitioning";
                }
            } else {
                const maxHeroX = sticks[sticks.length - 1].x + sticks[sticks.length - 1].length + heroWidth;
                if (heroX > maxHeroX) {
                    heroX = maxHeroX;
                    phase = "falling";
                }
            }
            break;
        }
        case "transitioning": {
            sceneOffset += (timestamp - lastTimestamp) / transitioningSpeed;

            const [nextPlatform] = thePlatformTheStickHits();
            if (sceneOffset > nextPlatform.x + nextPlatform.w - paddingX) {
                sticks.push({
                    x: nextPlatform.x + nextPlatform.w,
                    length: 0,
                    rotation: 0
                });
                phase = "waiting";
            }
            break;
        }
        case "falling": {
            if (sticks[sticks.length - 1].rotation < 180)
                sticks[sticks.length - 1].rotation += (timestamp - lastTimestamp) / turningSpeed;

            heroY += (timestamp - lastTimestamp) / fallingSpeed;
            const maxHeroY = platformHeight + 100 + (height - canvasHeight) / 2;
            if (heroY > maxHeroY) {
                showRestartButton();
                return;
            }
            break;
        }
        default:
            throw Error("Wrong phase");
    }

    draw();
    window.requestAnimationFrame(animate);

    lastTimestamp = timestamp;
}

// Drawing functions
function draw() {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    drawBackground();

    // Center main canvas area to the middle of the screen
    ctx.translate(
        (width - canvasWidth) / 2 - sceneOffset,
        (height - canvasHeight) / 2
    );

    // Draw scene
    drawPlatforms();
    drawHero();
    drawSticks();

    // Restore transformation
    ctx.restore();
}

function drawPlatforms() {
    platforms.forEach(({ x, w }) => {
        // Draw lily pad
        ctx.fillStyle = "#3A5F0B";
        ctx.beginPath();
        ctx.ellipse(x + w / 2, canvasHeight - platformHeight / 2, w / 2, platformHeight / 4, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Draw lily pad details
        ctx.strokeStyle = "#0B3B0B";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x + w / 2, canvasHeight - platformHeight / 2, w / 2 * 0.9, platformHeight / 4 * 0.9, 0, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(x + w / 2, canvasHeight - platformHeight / 2, w / 2 * 0.75, platformHeight / 4 * 0.75, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw perfect area
        if (sticks[sticks.length - 1].x < x) {
            ctx.fillStyle = "#FFD700";
            ctx.beginPath();
            ctx.arc(x + w / 2, canvasHeight - platformHeight / 2, perfectAreaSize / 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

function drawHero() {
    ctx.save();
    ctx.translate(
        heroX - heroWidth / 2,
        heroY + canvasHeight - platformHeight - heroHeight / 2
    );

    // Draw body (dress)
    ctx.fillStyle = "#FFC0CB";
    ctx.beginPath();
    ctx.moveTo(0, -heroHeight / 2);
    ctx.lineTo(-heroWidth / 2, heroHeight / 2);
    ctx.lineTo(heroWidth / 2, heroHeight / 2);
    ctx.closePath();
    ctx.fill();

    // Draw head
    ctx.fillStyle = "#FFE4B5";
    ctx.beginPath();
    ctx.arc(0, -heroHeight / 2, heroWidth / 3, 0, 2 * Math.PI);
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(-heroWidth / 8, -heroHeight / 2 - heroWidth / 8, heroWidth / 20, 0, 2 * Math.PI);
    ctx.arc(heroWidth / 8, -heroHeight / 2 - heroWidth / 8, heroWidth / 20, 0, 2 * Math.PI);
    ctx.fill();

    // Draw smile
    ctx.beginPath();
    ctx.arc(0, -heroHeight / 2 + heroWidth / 8, heroWidth / 8, 0, Math.PI);
    ctx.stroke();

    // Draw hair
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.moveTo(-heroWidth / 3, -heroHeight / 2);
    ctx.quadraticCurveTo(-heroWidth / 4, -heroHeight / 2 - heroWidth / 2, 0, -heroHeight / 2);
    ctx.quadraticCurveTo(heroWidth / 4, -heroHeight / 2 - heroWidth / 2, heroWidth / 3, -heroHeight / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawSticks() {
    sticks.forEach((stick) => {
        ctx.save();

        ctx.translate(stick.x, canvasHeight - platformHeight / 2);
        ctx.rotate((Math.PI / 180) * stick.rotation);

        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -stick.length);
        ctx.stroke();

        ctx.restore();
    });
}

function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, "#87CEEB");
    skyGradient.addColorStop(1, "#E0F6FF");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // River
    const riverHeight = height * 0.4;
    const riverGradient = ctx.createLinearGradient(0, height - riverHeight, 0, height);
    riverGradient.addColorStop(0, "#4682B4");
    riverGradient.addColorStop(1, "#5F9EA0");
    ctx.fillStyle = riverGradient;
    ctx.fillRect(0, height - riverHeight, width, riverHeight);

    // Draw wavy lines on the river
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, height - riverHeight * (0.2 + i * 0.3));
        for (let x = 0; x < width; x += 20) {
            ctx.lineTo(
                x, 
                height - riverHeight * (0.2 + i * 0.3) + Math.sin(x * 0.1) * 5
            );
        }
        ctx.stroke();
    }

    // Sun
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(100, 100, 40, 0, 2 * Math.PI);
    ctx.fill();

    // Clouds
    drawCloud(200, 150, 70);
    drawCloud(500, 100, 60);
    drawCloud(800, 180, 80);
}

function drawCloud(x, y, size) {
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, 2 * Math.PI);
    ctx.arc(x + size * 0.35, y - size * 0.2, size * 0.4, 0, 2 * Math.PI);
    ctx.arc(x + size * 0.7, y, size * 0.5, 0, 2 * Math.PI);
    ctx.fill();
}

// Game logic functions
function generatePlatform() {
    const minGap = 40;
    const maxGap = 200;
    const minWidth = 20;
    const maxWidth = 100;

    const lastPlatform = platforms[platforms.length - 1];
    let furthestX = lastPlatform.x + lastPlatform.w;

    const x = furthestX + minGap + Math.floor(Math.random() * (maxGap - minGap));
    const w = minWidth + Math.floor(Math.random() * (maxWidth - minWidth));

    platforms.push({ x, w });
}

function thePlatformTheStickHits() {
    if (sticks[sticks.length - 1].rotation != 90)
        throw Error(`Stick is ${sticks[sticks.length - 1].rotation}°`);
    
    const stickFarX = sticks[sticks.length - 1].x + sticks[sticks.length - 1].length;

    const platformTheStickHits = platforms.find(
        (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
    );

    if (
        platformTheStickHits &&
        platformTheStickHits.x + platformTheStickHits.w / 2 - perfectAreaSize / 2 < stickFarX &&
        stickFarX <
        platformTheStickHits.x + platformTheStickHits.w / 2 + perfectAreaSize / 2
    )
        return [platformTheStickHits, true];

    return [platformTheStickHits, false];
}

// Event handlers
function onMouseDown() {
    if (phase === "waiting") {
        lastTimestamp = undefined;
        phase = "stretching";
        window.requestAnimationFrame(animate);
    }
}

function onMouseUp() {
    if (phase === "stretching") {
        phase = "turning";
    }
}

function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    draw();
}

// UI functions
function showRestartButton() {
    const restartButton = document.getElementById("restart");
    restartButton.style.display = "block";
}

function hideRestartButton() {
    const restartButton = document.getElementById("restart");
    restartButton.style.display = "none";
}

function updateScore() {
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = score;
}

function showPerfect() {
    const perfectElement = document.getElementById("perfect");
    perfectElement.style.opacity = 1;
    setTimeout(() => {
        perfectElement.style.opacity = 0;
    }, 1000);
}

// Game reset function
function resetGame() {
    phase = "waiting";
    lastTimestamp = undefined;
    sceneOffset = 0;
    score = 0;

    platforms = [{ x: 50, w: 50 }];
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();

    sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];

    heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
    heroY = 0;

    draw();
    hideRestartButton();
    updateScore();
}

// Start the game
init();