import { Vector } from "../helperClasses/Vector.js";

const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d", { antialias: false });
let startX;
let startY;
let isDragging = false;
let isPinching = false;
let lastTouchDist = 0;
let scale = 1;
let mapSizeUnscaled = 25000;
let offsetX = -mapSizeUnscaled / 4;
let offsetY = -mapSizeUnscaled / 4;
let mapSize = 5000;
let entities = [];
let mapData = [];
let folowing = null;
canvas.width = screen.width;
canvas.height = screen.height;
let lastTime = performance.now();
let fps = 0;


let paused = false;

function getHighestTarget(e) {
    const worldcoordsMouse = getWorldCoords(e.clientX, e.clientY);
    let mx = e.clientX;
    let my = e.clientY;
    let highestTarget = null;
    entities.forEach(entity => {
        let ex = entity.x - entity.r;
        let ey = entity.y - entity.r;
        if (worldcoordsMouse.worldX >= ex && worldcoordsMouse.worldX <= ex + entity.r * 2 &&
            worldcoordsMouse.worldY >= ey && worldcoordsMouse.worldY <= ey + entity.r * 2) {
            highestTarget = entity;
        }

    });
    return highestTarget;
}

function getSquaredDistance(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return dx * dx + dy * dy;
}

function getSceenCoords(worldX, worldY) {
    const screenX = offsetX + worldX * scale;
    const screenY = offsetY + worldY * scale;
    return { screenX, screenY };
}

function getWorldCoords(screenX, screenY) {
    const worldX = (screenX - offsetX) / scale;
    const worldY = (screenY - offsetY) / scale;
    return { worldX, worldY };
}


window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

// event Listeners desktop
canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomAmount = 0.1;
    let oldSize = mapSize;
    let worldcoordsMouse = getWorldCoords(e.clientX, e.clientY);
    scale += e.deltaY < 0 ? zoomAmount * scale : -zoomAmount * scale;
    scale = Math.max(0.001, Math.min(scale, 100000));
    mapSize = mapSizeUnscaled * scale;
    let deltaMapSize = mapSize - oldSize;
    offsetX -= worldcoordsMouse.worldX * deltaMapSize / mapSizeUnscaled;
    offsetY -= worldcoordsMouse.worldY * deltaMapSize / mapSizeUnscaled;
});

canvas.addEventListener("click", (e) => {
    folowing = getHighestTarget(e);
});


canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        offsetX = e.clientX - startX; //Math.max(-mapSize + screen.width, Math.min(0,
        offsetY = e.clientY - startY; //Math.max(-mapSize + screen.height, Math.min(0, 
    }
});


//event listeners mobile
canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

function handleTouchStart(e) {
    e.preventDefault();

    if (e.touches.length === 1) {
        // Start dragging
        isDragging = true;
        isPinching = false;

        const t = e.touches[0];
        startX = t.clientX - offsetX;
        startY = t.clientY - offsetY;
    }

    if (e.touches.length === 2) {
        // Start pinch zoom
        isDragging = false;
        isPinching = true;

        lastTouchDist = getTouchDistance(e.touches);
    }
}

function handleTouchMove(e) {
    e.preventDefault();

    // -----------------------------
    // DRAGGING (1 finger)
    // -----------------------------
    if (isDragging && e.touches.length === 1) {
        const t = e.touches[0];
        offsetX = t.clientX - startX;
        offsetY = t.clientY - startY;
    }

    // -----------------------------
    // PINCH ZOOM (2 fingers)
    // -----------------------------
    if (isPinching && e.touches.length === 2) {
        const dist = getTouchDistance(e.touches);
        const zoomFactor = dist / lastTouchDist;

        let oldSize = mapSize;

        // midpoint between fingers
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const worldcoords = getWorldCoords(midX, midY);

        scale *= zoomFactor;
        scale = Math.max(0.001, Math.min(scale, 100000));

        mapSize = mapSizeUnscaled * scale;
        let deltaMapSize = mapSize - oldSize;

        offsetX -= worldcoords.worldX * deltaMapSize / mapSizeUnscaled;
        offsetY -= worldcoords.worldY * deltaMapSize / mapSizeUnscaled;

        lastTouchDist = dist;
    }
}

function handleTouchEnd(e) {
    // If no fingers left → stop everything
    if (e.touches.length === 0) {
        isDragging = false;
        isPinching = false;
    }

    // Detect tap (mobile click)
    if (e.changedTouches.length === 1 && !isDragging && !isPinching) {
        folowing = getHighestTarget(e.changedTouches[0]);
    }
}

// -----------------------------
// Helper: distance between two touches
// -----------------------------
function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}


canvas.addEventListener("mouseup", () => isDragging = false);
canvas.addEventListener("mouseleave", () => isDragging = false);

const restartBtn = document.getElementById("empty");
restartBtn.addEventListener("click", () => {
    entities = [];
});

const pauseBtn = document.getElementById("pause");
pauseBtn.addEventListener("click", () => {
    if (paused) {
        paused = false;
        pauseBtn.innerHTML = "pause"
        gameLoop();
    } else {
        paused = true;
        pauseBtn.innerHTML = "unpause"
    }
})
const inAmount = document.getElementById("num1");
const inMass = document.getElementById("num2");
const inCharge = document.getElementById("num3");
const spawnBtn = document.getElementById("spawn");
spawnBtn.addEventListener("click", () => {
    let n = inAmount.value;
    //inAmount.value = '';
    let m = inMass.value;
    //inMass.value = '';
    let q = inCharge.value;
    //inCharge.value = '';

    let r = Math.sqrt(m) * 20;
    let col = 'hsl(' + Math.floor(Math.random() * 360) + ', 100%, ' + 50 + '%)'
    for (let i = 0; i < n; i++) {
        entities.push(new Entity(Math.random() * mapSizeUnscaled, Math.random() * mapSizeUnscaled, 0, 0, r, q, m, col));
    }
});

const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");

option1.setAttribute("checked",true)
option2.setAttribute("checked",true)

// Add event listeners
option1.addEventListener("change", () => Co = !Co);

option2.addEventListener("change", () => Gr = !Gr);

const slider1 = document.getElementById("Slider1");
const valueDisplay1 = document.getElementById("value1");

// Update display when slider moves
slider1.addEventListener("input", () => {
    valueDisplay1.textContent = slider1.value;
    Entity.C = slider1.value;
});


const slider2 = document.getElementById("Slider2");
const valueDisplay2 = document.getElementById("value2");

// Update display when slider moves
slider2.addEventListener("input", () => {
    valueDisplay2.textContent = slider2.value / 100;
    Entity.G = slider2.value / 100;
});

slider1.value = 1000;
slider2.value = 3;

function gameLoop() {
    const now = performance.now();
    const delta = now - lastTime; // time between frames in ms
    lastTime = now;
    fps = 1000 / delta; // convert ms to frames per second
    // Draw or update your scene here
    console.log(`FPS: ${fps.toFixed(0)}`);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    folowselected();
    drawGrid();
    drawBoids();
    if (!paused) {
        window.requestAnimFrame(gameLoop);
    }
}

function folowselected() {
    if (folowing != null) {
        //console.log(folowing.dx);
        offsetX -= folowing.speed.x * scale;
        offsetY -= folowing.speed.y * scale;
    }
}

function drawBoids() {
    let c = 0;
    for (let i = 0; i < entities.length; i++) {
        for (let j = 0; j < i; j++) {
            entities[i].interact(entities[j], { G: Gr, C: Co })
            c++;
        }
        console.log(Co,Gr)
    }

    c = 0;
    for (let i = 0; i < entities.length; i++) {
        for (let j = 0; j < i; j++) {
            entities[i].interactCollide(entities[j])
            c++;
        }
    }
    ctx.globalAlpha = 1.0;
    entities.forEach(entity => {
        entity.update();

        const screenCoords = getSceenCoords(entity.x, entity.y);
        ctx.fillStyle = entity.color;
        ctx.strokeStyle = entity.color;
        ctx.beginPath();
        ctx.arc(screenCoords.screenX - entity.r * scale / 2, screenCoords.screenY - entity.r * scale / 2, entity.r * scale, 0, Math.PI * 2); // x, y, radius, startAngle, endAngle
        ctx.fill();
        ctx.stroke();
        entity.mark = false;

    });
}


function drawGrid() {
    const gs = [1000000, 100000, 10000, 1000, 100, 10, 1, 0.1, 0.01, 0.001, 0.0001];
    let gridSize = gs[Math.floor(Math.log10(scale)) + 4] * scale;
    ctx.lineWidth = Math.floor(2);
    ctx.strokeStyle = "#545454ff";
    let phaseY = offsetY % gridSize;
    let phaseX = offsetX % gridSize;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + phaseX, 0);
        ctx.lineTo(x + phaseX, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + phaseY);
        ctx.lineTo(canvas.width, y + phaseY);
        ctx.stroke();
    }

    gridSize = gs[Math.floor(Math.log10(scale)) + 5] * scale * 2;
    ctx.lineWidth = Math.floor(1);


    phaseY = offsetY % gridSize;
    phaseX = offsetX % gridSize;
    for (let x = 0; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + phaseX, 0);
        ctx.lineTo(x + phaseX, canvas.height);
        ctx.stroke();
    }


    for (let y = 0; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + phaseY);
        ctx.lineTo(canvas.width, y + phaseY);
        ctx.stroke();
    }
}



ctx.imageSmoothingEnabled = false;

console.log("Main.js loaded");
gameLoop();
