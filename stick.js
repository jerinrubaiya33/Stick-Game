// // Game configuration & layout variables
// let canvas, ctx, width, height;
// let phase = "waiting";
// let lastTimestamp = 0;
// let heroX, heroY, sceneOffset;
// let platforms = [];
// let sticks = [];
// let score = 0;
// let highScore = localStorage.getItem("lilypad_highscore") || 0;
// let bobbingAngle = 0; 

// // Economy & Cosmetics State System
// let petals = parseInt(localStorage.getItem("lilypad_petals")) || 0;
// let currentUniform = "frog"; // Options: 'frog', 'sakura', 'cyber'

// // Calibrated Game Board Dimensions
// const canvasWidth = 375;
// const canvasHeight = 375;
// const platformHeight = 90;
// const heroDistanceFromEdge = 12;
// const paddingX = 100;
// const perfectAreaSize = 8; 
// const heroWidth = 24;
// const heroHeight = 36;
// const walkingSpeed = 3.2;
// const transitioningSpeed = 2.2;
// const fallingSpeed = 2;
// const stretchingSpeed = 3.2;
// const turningSpeed = 3.2;

// window.addEventListener("DOMContentLoaded", init);

// function init() {
//     canvas = document.getElementById("gameCanvas");
//     ctx = canvas.getContext("2d");
    
//     resizeCanvas();
//     updateHighScoreDisplay();
//     updatePetalDisplay();
//     setupShopListeners();
//     resetGame();

//     canvas.addEventListener("mousedown", onPointerDown);
//     canvas.addEventListener("mouseup", onPointerUp);
//     canvas.addEventListener("touchstart", (e) => { e.preventDefault(); onPointerDown(); }, {passive: false});
//     canvas.addEventListener("touchend", (e) => { e.preventDefault(); onPointerUp(); }, {passive: false});
    
//     window.addEventListener("resize", onResize);
//     document.getElementById("restart-action").addEventListener("click", resetGame);

//     window.requestAnimationFrame(animate);
// }

// function resizeCanvas() {
//     width = window.innerWidth;
//     height = window.innerHeight;
//     canvas.width = width;
//     canvas.height = height;
// }

// // Hook up click bindings to DOM buttons to dynamically change currentUniform state
// function setupShopListeners() {
//     const shopButtons = document.querySelectorAll(".shop-btn");
    
//     shopButtons.forEach(btn => {
//         btn.addEventListener("click", (e) => {
//             // Prevent background interactions
//             e.stopPropagation(); 

//             const targetId = btn.id;
//             let targetUniform = "frog";
//             let cost = 0;

//             if (targetId === "btn-sakura") { targetUniform = "sakura"; cost = 5; }
//             if (targetId === "btn-cyber") { targetUniform = "cyber"; cost = 12; }

//             // Check pricing criteria 
//             if (petals >= cost) {
//                 currentUniform = targetUniform;
                
//                 // Toggle DOM class styling layouts
//                 shopButtons.forEach(b => b.classList.remove("active"));
//                 btn.classList.add("active");
//             } else {
//                 // Flash button red temporarily if affordable check fails
//                 btn.style.backgroundColor = "#ef4444";
//                 setTimeout(() => { btn.style.backgroundColor = ""; }, 300);
//             }
//         });
//     });
// }

// function animate(timestamp) {
//     if (!lastTimestamp) {
//         lastTimestamp = timestamp;
//         window.requestAnimationFrame(animate);
//         return;
//     }

//     bobbingAngle += 0.04;

//     switch (phase) {
//         case "waiting":
//             break;
//         case "stretching": {
//             sticks[sticks.length - 1].length += (timestamp - lastTimestamp) / stretchingSpeed;
//             break;
//         }
//         case "turning": {
//             sticks[sticks.length - 1].rotation += (timestamp - lastTimestamp) / turningSpeed;

//             if (sticks[sticks.length - 1].rotation > 90) {
//                 sticks[sticks.length - 1].rotation = 90;

//                 const [nextPlatform, perfectHit] = thePlatformTheStickHits();
//                 if (nextPlatform) {
//                     score += perfectHit ? 2 : 1;
                    
//                     // Earn currencies on successful hits! Bonus for perfect hits
//                     petals += perfectHit ? 2 : 1;
//                     localStorage.setItem("lilypad_petals", petals);
//                     updatePetalDisplay();

//                     if (score > highScore) {
//                         highScore = score;
//                         localStorage.setItem("lilypad_highscore", highScore);
//                         updateHighScoreDisplay();
//                     }
//                     updateScoreDisplay();

//                     const intro = document.getElementById("instruction-text");
//                     if(intro) intro.style.opacity = "0";

//                     if (perfectHit) showPerfectToast();
//                     generatePlatform();
//                 }
//                 phase = "walking";
//             }
//             break;
//         }
//         case "walking": {
//             heroX += (timestamp - lastTimestamp) / walkingSpeed;

//             const [nextPlatform] = thePlatformTheStickHits();
//             if (nextPlatform) {
//                 const maxHeroX = nextPlatform.x + nextPlatform.w - heroDistanceFromEdge;
//                 if (heroX > maxHeroX) {
//                     heroX = maxHeroX;
//                     phase = "transitioning";
//                 }
//             } else {
//                 const maxHeroX = sticks[sticks.length - 1].x + sticks[sticks.length - 1].length + heroWidth/2;
//                 if (heroX > maxHeroX) {
//                     heroX = maxHeroX;
//                     phase = "falling";
//                 }
//             }
//             break;
//         }
//         case "transitioning": {
//             sceneOffset += (timestamp - lastTimestamp) / transitioningSpeed;

//             const [nextPlatform] = thePlatformTheStickHits();
//             if (sceneOffset > nextPlatform.x + nextPlatform.w - paddingX) {
//                 sticks.push({
//                     x: nextPlatform.x + nextPlatform.w,
//                     length: 0,
//                     rotation: 0
//                 });
//                 phase = "waiting";
//             }
//             break;
//         }
//         case "falling": {
//             if (sticks[sticks.length - 1].rotation < 180)
//                 sticks[sticks.length - 1].rotation += (timestamp - lastTimestamp) / turningSpeed;

//             heroY += (timestamp - lastTimestamp) / fallingSpeed;
//             const maxHeroY = platformHeight + 100 + (height - canvasHeight) / 2;
            
//             if (heroY > maxHeroY) {
//                 phase = "gameover"; 
//                 showGameOverUI();
//             }
//             break;
//         }
//         case "gameover":
//             break;
//     }

//     draw();
//     lastTimestamp = timestamp;
//     window.requestAnimationFrame(animate);
// }

// function draw() {
//     ctx.save();
//     ctx.clearRect(0, 0, width, height);

//     drawBackground();

//     ctx.translate(
//         (width - canvasWidth) / 2 - sceneOffset,
//         (height - canvasHeight) / 2
//     );

//     drawPlatforms();
//     drawSticks();
//     drawHero();

//     ctx.restore();
// }

// function drawPlatforms() {
//     platforms.forEach(({ x, w }) => {
//         let centerY = canvasHeight - platformHeight / 2;
//         let radiusX = w / 2;
//         let radiusY = platformHeight / 4.2; 
//         let centerOfPadX = x + radiusX;

//         // 1. Natural Ambient Soft Shadow
//         ctx.fillStyle = "rgba(10, 45, 30, 0.15)";
//         ctx.beginPath();
//         ctx.ellipse(centerOfPadX + 2, centerY + 6, radiusX, radiusY, 0, 0, 2 * Math.PI);
//         ctx.fill();

//         function drawLilyPadShape(cX, cY, rX, rY) {
//             ctx.beginPath();
//             ctx.moveTo(cX, cY);
//             ctx.ellipse(cX, cY, rX, rY, 0, 1.25 * Math.PI, 1.10 * Math.PI, false);
//             ctx.closePath();
//         }

//         // 2. Thick Natural Rim Edge Layer
//         ctx.fillStyle = "#2d5a27"; 
//         drawLilyPadShape(centerOfPadX, centerY, radiusX, radiusY);
//         ctx.fill();

//         // 3. Bright Fresh Leaf Face Layer
//         ctx.fillStyle = "#38b000"; 
//         drawLilyPadShape(centerOfPadX, centerY - 2, radiusX * 0.94, radiusY * 0.92);
//         ctx.fill();

//         // 4. Soft Organic Leaf Vein Lines
//         ctx.strokeStyle = "rgba(204, 255, 51, 0.4)";
//         ctx.lineWidth = 1.5;
//         const leafVeinAngles = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.4, 1.6, 1.8];
//         leafVeinAngles.forEach(angle => {
//             ctx.beginPath();
//             ctx.moveTo(centerOfPadX, centerY - 2);
//             let targetX = centerOfPadX + Math.cos(angle * Math.PI) * (radiusX * 0.82);
//             let targetY = (centerY - 2) + Math.sin(angle * Math.PI) * (radiusY * 0.82);
//             ctx.lineTo(targetX, targetY);
//             ctx.stroke();
//         });

//         // 5. High-End Minimalist Target Indicator
//         if (sticks[sticks.length - 1].x < x) {
//             let pX = centerOfPadX;
//             let pY = centerY - 2;
            
//             ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
//             ctx.beginPath();
//             ctx.arc(pX, pY, perfectAreaSize, 0, 2 * Math.PI);
//             ctx.fill();

//             ctx.fillStyle = "#ffcc00"; 
//             ctx.beginPath();
//             ctx.arc(pX, pY, 2.5, 0, 2 * Math.PI);
//             ctx.fill();
//         }
//     });
// }

// function drawHero() {
//     ctx.save();
//     let bobY = (phase === "waiting") ? Math.sin(bobbingAngle) * 1.2 : 0;

//     ctx.translate(
//         heroX,
//         heroY + canvasHeight - platformHeight - heroHeight / 2 + bobY + 39
//     );

//     // Setup uniform parameters based on selected theme context
//     let bodyColor = "#ffb703";   // Default base orange
//     let hoodColor = "#4caf50";   // Default Frog Cap green
//     let eyeColor = "#1b5e20";    // Frog eye center green
//     let accentVisible = true;    // Extra aesthetics configuration flag
    
//     if (currentUniform === "sakura") {
//         bodyColor = "#fff0f3";   // Soft base pinkish white
//         hoodColor = "#ffb3c1";   // Sakura pink petals cap
//         eyeColor = "#ff4d6d";    // Magenta petal accents
//     } else if (currentUniform === "cyber") {
//         bodyColor = "#2b2d42";   // Matte black body matrix
//         hoodColor = "#00f5d4";   // Neon cyan helmet wrap
//         eyeColor = "#7b2cbf";    // Cyber violet visors
//     }

//     // Dark sleek back hair contrast
//     ctx.fillStyle = currentUniform === "cyber" ? "#1a1a24" : "#6d4c41"; 
//     ctx.beginPath();
//     ctx.arc(-8, 2, 6, 0, 2 * Math.PI); 
//     ctx.arc(8, 2, 6, 0, 2 * Math.PI);  
//     ctx.fill();

//     // Clean body silhouette
//     ctx.fillStyle = bodyColor; 
//     ctx.beginPath();
//     ctx.moveTo(-heroWidth/2, heroHeight/2);
//     ctx.quadraticCurveTo(-heroWidth/2, -4, 0, -6);
//     ctx.quadraticCurveTo(heroWidth/2, -4, heroWidth/2, heroHeight/2);
//     ctx.closePath();
//     ctx.fill();

//     // Shirt details
//     ctx.fillStyle = currentUniform === "cyber" ? "#3a0ca3" : "#ffffff";
//     ctx.beginPath();
//     ctx.arc(0, heroHeight/2, 4, 0, 2 * Math.PI);
//     ctx.arc(-6, heroHeight/2, 3.5, 0, 2 * Math.PI);
//     ctx.arc(6, heroHeight/2, 3.5, 0, 2 * Math.PI);
//     ctx.fill();

//     // Sculpted clean face profiles
//     ctx.fillStyle = currentUniform === "cyber" ? "#e0aaff" : "#ffe0b2";
//     ctx.beginPath();
//     ctx.arc(0, -7, heroWidth / 2.3, 0, 2 * Math.PI);
//     ctx.fill();

//     // Blush
//     ctx.fillStyle = currentUniform === "cyber" ? "rgba(0, 245, 212, 0.4)" : "rgba(255, 138, 128, 0.6)";
//     ctx.beginPath();
//     ctx.arc(-6, -5, 3, 0, 2 * Math.PI);
//     ctx.arc(6, -5, 3, 0, 2 * Math.PI);
//     ctx.fill();

//     // Elegant eyes
//     ctx.strokeStyle = currentUniform === "cyber" ? "#00f5d4" : "#263238";
//     ctx.lineWidth = 2;
//     ctx.lineCap = "round";
//     ctx.beginPath();
//     ctx.arc(-4.5, -8, 1.5, Math.PI, 0);
//     ctx.stroke();
//     ctx.beginPath();
//     ctx.arc(4.5, -8, 1.5, Math.PI, 0);
//     ctx.stroke();

//     // Smile
//     ctx.fillStyle = currentUniform === "cyber" ? "#00f5d4" : "#e57373";
//     ctx.beginPath();
//     ctx.arc(0, -5, 2, 0, Math.PI);
//     ctx.fill();

//     // Accent hood cap
//     ctx.fillStyle = hoodColor; 
//     ctx.lineWidth = 4;
//     ctx.strokeStyle = hoodColor;
//     ctx.beginPath();
//     ctx.arc(0, -9, (heroWidth / 2) + 1, 0, 2 * Math.PI);
//     ctx.stroke();

//     // Theme Specific Aesthetic Overlays (Frog details, Sakura petals, or Cyber ears)
//     if (accentVisible) {
//         ctx.fillStyle = (currentUniform === "cyber") ? "#2b2d42" : "#ffffff";
//         ctx.beginPath();
//         // Left accessory orb
//         ctx.arc(-7, -20, 5, 0, 2 * Math.PI); 
//         // Right accessory orb
//         ctx.arc(7, -20, 5, 0, 2 * Math.PI);  
//         ctx.fill();

//         ctx.fillStyle = eyeColor; 
//         ctx.beginPath();
//         ctx.arc(-6.5, -20, 2.5, 0, 2 * Math.PI);
//         ctx.arc(6.5, -20, 2.5, 0, 2 * Math.PI);
//         ctx.fill();
//     }

//     ctx.restore();
// }

// function drawSticks() {
//     sticks.forEach((stick) => {
//         ctx.save();
//         ctx.translate(stick.x, canvasHeight - platformHeight / 2);
//         ctx.rotate((Math.PI / 180) * stick.rotation);

//         ctx.strokeStyle = "#2d6a4f"; 
//         ctx.lineWidth = 3.5;
//         ctx.lineCap = "round";
        
//         ctx.beginPath();
//         ctx.moveTo(0, 0);
        
//         let segments = 6;
//         let step = stick.length / segments;
//         for (let i = 1; i <= segments; i++) {
//             let currentLength = i * step;
//             let wiggle = Math.sin(currentLength * 0.1) * 2;
//             ctx.lineTo(wiggle, -currentLength);
//         }
//         ctx.stroke();

//         if (stick.length > 15) {
//             ctx.fillStyle = "#52b788";
//             ctx.beginPath();
//             ctx.ellipse(-3, -stick.length * 0.35, 5, 2.5, Math.PI/4, 0, 2*Math.PI);
//             ctx.fill();
//             ctx.beginPath();
//             ctx.ellipse(3, -stick.length * 0.7, 5, 2.5, -Math.PI/4, 0, 2*Math.PI);
//             ctx.fill();
//         }

//         ctx.restore();
//     });
// }

// function drawBackground() {
//     const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
//     skyGradient.addColorStop(0, "#a2d2ff");
//     skyGradient.addColorStop(1, "#bde0fe");
//     ctx.fillStyle = skyGradient;
//     ctx.fillRect(0, 0, width, height);

//     const riverHeight = height * 0.45;
//     const riverGradient = ctx.createLinearGradient(0, height - riverHeight, 0, height);
//     riverGradient.addColorStop(0, "#48cae4");
//     riverGradient.addColorStop(0.4, "#00b4d8");
//     riverGradient.addColorStop(1, "#0077b6");
//     ctx.fillStyle = riverGradient;
//     ctx.fillRect(0, height - riverHeight, width, riverHeight);

//     ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
//     ctx.lineWidth = 2;
//     for (let i = 0; i < 3; i++) {
//         ctx.beginPath();
//         let waveYBase = height - riverHeight * (0.15 + i * 0.3);
//         ctx.moveTo(0, waveYBase);
//         for (let x = 0; x < width; x += 30) {
//             ctx.lineTo(x, waveYBase + Math.sin((x * 0.04) + (bobbingAngle * 0.4) + i) * 4);
//         }
//         ctx.stroke();
//     }

//     ctx.fillStyle = "#ffb703";
//     ctx.beginPath();
//     ctx.arc(100, 90, 35, 0, 2 * Math.PI);
//     ctx.fill();

//     drawCloud(250, 100, 50);
//     drawCloud(width * 0.6, 70, 70);
//     drawCloud(width - 150, 140, 45);
// }

// function drawCloud(x, y, size) {
//     ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
//     ctx.beginPath();
//     ctx.arc(x, y, size * 0.5, 0, 2 * Math.PI);
//     ctx.arc(x + size * 0.35, y - size * 0.25, size * 0.45, 0, 2 * Math.PI);
//     ctx.arc(x + size * 0.72, y, size * 0.4, 0, 2 * Math.PI);
//     ctx.fill();
// }

// function generatePlatform() {
//     const minGap = 60;
//     const maxGap = 170;
//     const minWidth = 40;
//     const maxWidth = 80;

//     const lastPlatform = platforms[platforms.length - 1];
//     let furthestX = lastPlatform.x + lastPlatform.w;

//     const x = furthestX + minGap + Math.floor(Math.random() * (maxGap - minGap));
//     const w = minWidth + Math.floor(Math.random() * (maxWidth - minWidth));

//     platforms.push({ x, w });
// }

// function thePlatformTheStickHits() {
//     if (sticks[sticks.length - 1].rotation != 90) return [null, false];
    
//     const stickFarX = sticks[sticks.length - 1].x + sticks[sticks.length - 1].length;
//     const platformTheStickHits = platforms.find(
//         (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
//     );

//     if (
//         platformTheStickHits &&
//         platformTheStickHits.x + platformTheStickHits.w / 2 - perfectAreaSize / 2 < stickFarX &&
//         stickFarX < platformTheStickHits.x + platformTheStickHits.w / 2 + perfectAreaSize / 2
//     ) {
//         return [platformTheStickHits, true];
//     }

//     return [platformTheStickHits, false];
// }

// function onPointerDown() {
//     if (phase === "waiting") {
//         lastTimestamp = undefined;
//         phase = "stretching";
//     }
// }

// function onPointerUp() {
//     if (phase === "stretching") {
//         phase = "turning";
//     }
// }

// function onResize() {
//     resizeCanvas();
//     draw();
// }

// function updateScoreDisplay() {
//     document.getElementById("score").textContent = score;
// }

// function updateHighScoreDisplay() {
//     document.getElementById("best-score").textContent = highScore;
// }

// function updatePetalDisplay() {
//     document.getElementById("petal-count").textContent = petals;
// }

// function showPerfectToast() {
//     const toast = document.getElementById("perfect-toast");
//     toast.classList.add("show");
//     setTimeout(() => {
//         toast.classList.remove("show");
//     }, 800);
// }

// function showGameOverUI() {
//     const intro = document.getElementById("instruction-text");
//     const restartBtn = document.getElementById("restart-action");
    
//     if (intro) {
//         intro.textContent = "Session complete. Score registered.";
//         intro.style.opacity = "1";
//     }
//     if (restartBtn) {
//         restartBtn.style.visibility = "visible";
//         restartBtn.style.opacity = "1";
//     }
// }

// function resetGame() {
//     phase = "waiting";
//     lastTimestamp = undefined;
//     sceneOffset = 0;
//     score = 0;

//     platforms = [{ x: 40, w: 65 }];
//     generatePlatform();
//     generatePlatform();
//     generatePlatform();
//     generatePlatform();

//     sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];

//     heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
//     heroY = 0;

//     const intro = document.getElementById("instruction-text");
//     const restartBtn = document.getElementById("restart-action");
//     if (intro) {
//         intro.textContent = "Press and hold anywhere to calibrate vine length.";
//         intro.style.opacity = "1";
//     }
//     if (restartBtn) {
//         restartBtn.style.opacity = "0";
//         restartBtn.style.visibility = "hidden";
//     }

//     updateScoreDisplay();
//     draw();
// }















// Game configuration & layout variables
let canvas, ctx, width, height;
let phase = "waiting";
let lastTimestamp = 0;
let heroX, heroY, sceneOffset;
let platforms = [];
let sticks = [];
let score = 0;
let highScore = localStorage.getItem("lilypad_highscore") || 0;
let bobbingAngle = 0; 

// Economy & Cosmetics State System
let petals = parseInt(localStorage.getItem("lilypad_petals")) || 0;
let currentUniform = "frog"; // Options: 'frog', 'sakura', 'cyber'

// Calibrated Game Board Dimensions
const canvasWidth = 375;
const canvasHeight = 375;
const platformHeight = 90;
const heroDistanceFromEdge = 12;
const paddingX = 100;
const perfectAreaSize = 8; 
const heroWidth = 24;
const heroHeight = 36;
const walkingSpeed = 3.2;
const transitioningSpeed = 2.2;
const fallingSpeed = 2;
const stretchingSpeed = 3.2;
const turningSpeed = 3.2;

window.addEventListener("DOMContentLoaded", init);

function init() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    
    resizeCanvas();
    updateHighScoreDisplay();
    updatePetalDisplay();
    setupShopListeners();
    resetGame();

    // Canvas explicit interaction hooks
    canvas.addEventListener("mousedown", onPointerDown);
    canvas.addEventListener("mouseup", onPointerUp);
    
    // Allow default tracking on UI targets so DOM buttons continue to receive touches safely
    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); onPointerDown(); }, {passive: false});
    canvas.addEventListener("touchend", (e) => { e.preventDefault(); onPointerUp(); }, {passive: false});
    
    window.addEventListener("resize", onResize);
    document.getElementById("restart-action").addEventListener("click", resetGame);
    document.getElementById("restart-action").addEventListener("touchend", (e) => {
        e.preventDefault();
        resetGame();
    });

    window.requestAnimationFrame(animate);
}

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

// Hook up click bindings to DOM buttons to dynamically change currentUniform state
function setupShopListeners() {
    const shopButtons = document.querySelectorAll(".shop-btn");
    
    const handleShopSelection = (btn, e) => {
        e.stopPropagation(); 
        e.preventDefault();

        const targetId = btn.id;
        let targetUniform = "frog";
        let cost = 0;

        if (targetId === "btn-sakura") { targetUniform = "sakura"; cost = 5; }
        if (targetId === "btn-cyber") { targetUniform = "cyber"; cost = 12; }

        // Check pricing criteria 
        if (petals >= cost) {
            currentUniform = targetUniform;
            
            // Toggle DOM class styling layouts
            shopButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        } else {
            // Flash button red temporarily if affordable check fails
            btn.style.backgroundColor = "#ef4444";
            setTimeout(() => { btn.style.backgroundColor = ""; }, 300);
        }
    };

    shopButtons.forEach(btn => {
        btn.addEventListener("click", (e) => handleShopSelection(btn, e));
        btn.addEventListener("touchend", (e) => handleShopSelection(btn, e));
    });
}

function animate(timestamp) {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
        window.requestAnimationFrame(animate);
        return;
    }

    bobbingAngle += 0.04;

    switch (phase) {
        case "waiting":
            break;
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
                    
                    // Earn currencies on successful hits! Bonus for perfect hits
                    petals += perfectHit ? 2 : 1;
                    localStorage.setItem("lilypad_petals", petals);
                    updatePetalDisplay();

                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem("lilypad_highscore", highScore);
                        updateHighScoreDisplay();
                    }
                    updateScoreDisplay();

                    const intro = document.getElementById("instruction-text");
                    if(intro) intro.style.opacity = "0";

                    if (perfectHit) showPerfectToast();
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
                const maxHeroX = sticks[sticks.length - 1].x + sticks[sticks.length - 1].length + heroWidth/2;
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
                phase = "gameover"; 
                showGameOverUI();
            }
            break;
        }
        case "gameover":
            break;
    }

    draw();
    lastTimestamp = timestamp;
    window.requestAnimationFrame(animate);
}

function draw() {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    drawBackground();

    ctx.translate(
        (width - canvasWidth) / 2 - sceneOffset,
        (height - canvasHeight) / 2
    );

    drawPlatforms();
    drawSticks();
    drawHero();

    ctx.restore();
}

function drawPlatforms() {
    platforms.forEach(({ x, w }) => {
        let centerY = canvasHeight - platformHeight / 2;
        let radiusX = w / 2;
        let radiusY = platformHeight / 4.2; 
        let centerOfPadX = x + radiusX;

        // 1. Natural Ambient Soft Shadow
        ctx.fillStyle = "rgba(10, 45, 30, 0.15)";
        ctx.beginPath();
        ctx.ellipse(centerOfPadX + 2, centerY + 6, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.fill();

        function drawLilyPadShape(cX, cY, rX, rY) {
            ctx.beginPath();
            ctx.moveTo(cX, cY);
            ctx.ellipse(cX, cY, rX, rY, 0, 1.25 * Math.PI, 1.10 * Math.PI, false);
            ctx.closePath();
        }

        // 2. Thick Natural Rim Edge Layer
        ctx.fillStyle = "#2d5a27"; 
        drawLilyPadShape(centerOfPadX, centerY, radiusX, radiusY);
        ctx.fill();

        // 3. Bright Fresh Leaf Face Layer
        ctx.fillStyle = "#38b000"; 
        drawLilyPadShape(centerOfPadX, centerY - 2, radiusX * 0.94, radiusY * 0.92);
        ctx.fill();

        // 4. Soft Organic Leaf Vein Lines
        ctx.strokeStyle = "rgba(204, 255, 51, 0.4)";
        ctx.lineWidth = 1.5;
        const leafVeinAngles = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.4, 1.6, 1.8];
        leafVeinAngles.forEach(angle => {
            ctx.beginPath();
            ctx.moveTo(centerOfPadX, centerY - 2);
            let targetX = centerOfPadX + Math.cos(angle * Math.PI) * (radiusX * 0.82);
            let targetY = (centerY - 2) + Math.sin(angle * Math.PI) * (radiusY * 0.82);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
        });

        // 5. High-End Minimalist Target Indicator
        if (sticks[sticks.length - 1].x < x) {
            let pX = centerOfPadX;
            let pY = centerY - 2;
            
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.beginPath();
            ctx.arc(pX, pY, perfectAreaSize, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = "#ffcc00"; 
            ctx.beginPath();
            ctx.arc(pX, pY, 2.5, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

function drawHero() {
    ctx.save();
    let bobY = (phase === "waiting") ? Math.sin(bobbingAngle) * 1.2 : 0;

    ctx.translate(
        heroX,
        heroY + canvasHeight - platformHeight - heroHeight / 2 + bobY + 39
    );

    // Setup uniform parameters based on selected theme context
    let bodyColor = "#ffb703";   // Default base orange
    let hoodColor = "#4caf50";   // Default Frog Cap green
    let eyeColor = "#1b5e20";    // Frog eye center green
    let accentVisible = true;    // Extra aesthetics configuration flag
    
    if (currentUniform === "sakura") {
        bodyColor = "#fff0f3";   // Soft base pinkish white
        hoodColor = "#ffb3c1";   // Sakura pink petals cap
        eyeColor = "#ff4d6d";    // Magenta petal accents
    } else if (currentUniform === "cyber") {
        bodyColor = "#2b2d42";   // Matte black body matrix
        hoodColor = "#00f5d4";   // Neon cyan helmet wrap
        eyeColor = "#7b2cbf";    // Cyber violet visors
    }

    // Dark sleek back hair contrast
    ctx.fillStyle = currentUniform === "cyber" ? "#1a1a24" : "#6d4c41"; 
    ctx.beginPath();
    ctx.arc(-8, 2, 6, 0, 2 * Math.PI); 
    ctx.arc(8, 2, 6, 0, 2 * Math.PI);  
    ctx.fill();

    // Clean body silhouette
    ctx.fillStyle = bodyColor; 
    ctx.beginPath();
    ctx.moveTo(-heroWidth/2, heroHeight/2);
    ctx.quadraticCurveTo(-heroWidth/2, -4, 0, -6);
    ctx.quadraticCurveTo(heroWidth/2, -4, heroWidth/2, heroHeight/2);
    ctx.closePath();
    ctx.fill();

    // Shirt details
    ctx.fillStyle = currentUniform === "cyber" ? "#3a0ca3" : "#ffffff";
    ctx.beginPath();
    ctx.arc(0, heroHeight/2, 4, 0, 2 * Math.PI);
    ctx.arc(-6, heroHeight/2, 3.5, 0, 2 * Math.PI);
    ctx.arc(6, heroHeight/2, 3.5, 0, 2 * Math.PI);
    ctx.fill();

    // Sculpted clean face profiles
    ctx.fillStyle = currentUniform === "cyber" ? "#e0aaff" : "#ffe0b2";
    ctx.beginPath();
    ctx.arc(0, -7, heroWidth / 2.3, 0, 2 * Math.PI);
    ctx.fill();

    // Blush
    ctx.fillStyle = currentUniform === "cyber" ? "rgba(0, 245, 212, 0.4)" : "rgba(255, 138, 128, 0.6)";
    ctx.beginPath();
    ctx.arc(-6, -5, 3, 0, 2 * Math.PI);
    ctx.arc(6, -5, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Elegant eyes
    ctx.strokeStyle = currentUniform === "cyber" ? "#00f5d4" : "#263238";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(-4.5, -8, 1.5, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(4.5, -8, 1.5, Math.PI, 0);
    ctx.stroke();

    // Smile
    ctx.fillStyle = currentUniform === "cyber" ? "#00f5d4" : "#e57373";
    ctx.beginPath();
    ctx.arc(0, -5, 2, 0, Math.PI);
    ctx.fill();

    // Accent hood cap
    ctx.fillStyle = hoodColor; 
    ctx.lineWidth = 4;
    ctx.strokeStyle = hoodColor;
    ctx.beginPath();
    ctx.arc(0, -9, (heroWidth / 2) + 1, 0, 2 * Math.PI);
    ctx.stroke();

    // Theme Specific Aesthetic Overlays (Frog details, Sakura petals, or Cyber ears)
    if (accentVisible) {
        ctx.fillStyle = (currentUniform === "cyber") ? "#2b2d42" : "#ffffff";
        ctx.beginPath();
        // Left accessory orb
        ctx.arc(-7, -20, 5, 0, 2 * Math.PI); 
        // Right accessory orb
        ctx.arc(7, -20, 5, 0, 2 * Math.PI);  
        ctx.fill();

        ctx.fillStyle = eyeColor; 
        ctx.beginPath();
        ctx.arc(-6.5, -20, 2.5, 0, 2 * Math.PI);
        ctx.arc(6.5, -20, 2.5, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.restore();
}

function drawSticks() {
    sticks.forEach((stick) => {
        ctx.save();
        ctx.translate(stick.x, canvasHeight - platformHeight / 2);
        ctx.rotate((Math.PI / 180) * stick.rotation);

        ctx.strokeStyle = "#2d6a4f"; 
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        
        let segments = 6;
        let step = stick.length / segments;
        for (let i = 1; i <= segments; i++) {
            let currentLength = i * step;
            let wiggle = Math.sin(currentLength * 0.1) * 2;
            ctx.lineTo(wiggle, -currentLength);
        }
        ctx.stroke();

        if (stick.length > 15) {
            ctx.fillStyle = "#52b788";
            ctx.beginPath();
            ctx.ellipse(-3, -stick.length * 0.35, 5, 2.5, Math.PI/4, 0, 2*Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(3, -stick.length * 0.7, 5, 2.5, -Math.PI/4, 0, 2*Math.PI);
            ctx.fill();
        }

        ctx.restore();
    });
}

function drawBackground() {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, "#a2d2ff");
    skyGradient.addColorStop(1, "#bde0fe");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    const riverHeight = height * 0.45;
    const riverGradient = ctx.createLinearGradient(0, height - riverHeight, 0, height);
    riverGradient.addColorStop(0, "#48cae4");
    riverGradient.addColorStop(0.4, "#00b4d8");
    riverGradient.addColorStop(1, "#0077b6");
    ctx.fillStyle = riverGradient;
    ctx.fillRect(0, height - riverHeight, width, riverHeight);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        let waveYBase = height - riverHeight * (0.15 + i * 0.3);
        ctx.moveTo(0, waveYBase);
        for (let x = 0; x < width; x += 30) {
            ctx.lineTo(x, waveYBase + Math.sin((x * 0.04) + (bobbingAngle * 0.4) + i) * 4);
        }
        ctx.stroke();
    }

    // Dynamic scale logic: Check if viewport matches mobile thresholds
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // MOBILE ONLY LAYOUT: Sun is smaller and positioned further down (y: 155 instead of 90)
        ctx.fillStyle = "#ffb703";
        ctx.beginPath();
        ctx.arc(60, 155, 24, 0, 2 * Math.PI); // Smaller 24px radius
        ctx.fill();

        // Clouds are scaled down and shifted down to clear the mobile score bar
        drawCloud(140, 165, 38);
        drawCloud(width * 0.55, 140, 50);
        drawCloud(width - 80, 195, 34);
    } else {
        // ORIGINAL DESKTOP LAYOUT (Completely Untouched)
        ctx.fillStyle = "#ffb703";
        ctx.beginPath();
        ctx.arc(100, 90, 35, 0, 2 * Math.PI);
        ctx.fill();

        drawCloud(250, 100, 50);
        drawCloud(width * 0.6, 70, 70);
        drawCloud(width - 150, 140, 45);
    }
}

function drawCloud(x, y, size) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, 2 * Math.PI);
    ctx.arc(x + size * 0.35, y - size * 0.25, size * 0.45, 0, 2 * Math.PI);
    ctx.arc(x + size * 0.72, y, size * 0.4, 0, 2 * Math.PI);
    ctx.fill();
}

function generatePlatform() {
    const minGap = 60;
    const maxGap = 170;
    const minWidth = 40;
    const maxWidth = 80;

    const lastPlatform = platforms[platforms.length - 1];
    let furthestX = lastPlatform.x + lastPlatform.w;

    const x = furthestX + minGap + Math.floor(Math.random() * (maxGap - minGap));
    const w = minWidth + Math.floor(Math.random() * (maxWidth - minWidth));

    platforms.push({ x, w });
}

function thePlatformTheStickHits() {
    if (sticks[sticks.length - 1].rotation != 90) return [null, false];
    
    const stickFarX = sticks[sticks.length - 1].x + sticks[sticks.length - 1].length;
    const platformTheStickHits = platforms.find(
        (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
    );

    if (
        platformTheStickHits &&
        platformTheStickHits.x + platformTheStickHits.w / 2 - perfectAreaSize / 2 < stickFarX &&
        stickFarX < platformTheStickHits.x + platformTheStickHits.w / 2 + perfectAreaSize / 2
    ) {
        return [platformTheStickHits, true];
    }

    return [platformTheStickHits, false];
}

function onPointerDown() {
    if (phase === "waiting") {
        lastTimestamp = undefined;
        phase = "stretching";
    }
}

function onPointerUp() {
    if (phase === "stretching") {
        phase = "turning";
    }
}

function onResize() {
    resizeCanvas();
    draw();
}

function updateScoreDisplay() {
    document.getElementById("score").textContent = score;
}

function updateHighScoreDisplay() {
    document.getElementById("best-score").textContent = highScore;
}

function updatePetalDisplay() {
    document.getElementById("petal-count").textContent = petals;
}

function showPerfectToast() {
    const toast = document.getElementById("perfect-toast");
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 800);
}

function showGameOverUI() {
    const intro = document.getElementById("instruction-text");
    const restartBtn = document.getElementById("restart-action");
    
    if (intro) {
        intro.textContent = "Session complete. Score registered.";
        intro.style.opacity = "1";
    }
    if (restartBtn) {
        restartBtn.style.visibility = "visible";
        restartBtn.style.opacity = "1";
    }
}

function resetGame() {
    phase = "waiting";
    lastTimestamp = undefined;
    sceneOffset = 0;
    score = 0;

    platforms = [{ x: 40, w: 65 }];
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();

    sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];

    heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
    heroY = 0;

    const intro = document.getElementById("instruction-text");
    const restartBtn = document.getElementById("restart-action");
    if (intro) {
        intro.textContent = "Press and hold anywhere to calibrate vine length.";
        intro.style.opacity = "1";
    }
    if (restartBtn) {
        restartBtn.style.opacity = "0";
        restartBtn.style.visibility = "hidden";
    }

    updateScoreDisplay();
    draw();
}