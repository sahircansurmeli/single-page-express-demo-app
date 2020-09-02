const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const SCROLL_SPEED = 0.005;
const MIN_SQUARE_SIZE = 5;
const DEFAULT_SQUARE_SIZE = 30;
const DEFAULT_GPS = 5; // Generations per second
const DRAG_THRESHOLD = 5;
const RANDOMIZE_DENSITY = 0.5;
let squareSize = DEFAULT_SQUARE_SIZE;
let canvasWidth;
let canvasHeight;
let centerX;
let centerY;
let isMouseDown = false;
let isDragging = false;
let panX = 0;
let panY = 0;
let animationInterval;
let gps = DEFAULT_GPS;
let isTicking = false;

const game = new Game();

function setupCanvas() {
  canvasWidth = canvas.width = window.innerWidth;
  canvasHeight = canvas.height = window.innerHeight;
  centerX = canvasWidth / 2;
  centerY = canvasHeight / 2;
  fillBackground();
  drawGrid();
  drawCells();
}

function fillBackground() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawGrid() {
  // Left
  for (let x = centerX + panX; x >= 0; x -= squareSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
  }
  // Right
  for (let x = centerX + panX; x <= canvasWidth; x += squareSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
  }
  // Up
  for (let y = centerY + panY; y >= 0; y -= squareSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
  }
  // Down
  for (let y = centerY + panY; y <= canvasHeight; y += squareSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
  }
  // Draw
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
}

function drawCells() {
  for (const cell in game.cellStates) {
    addCell(cell.split(","));
  }
}

function getGridCoordinates(x, y) {
  return [Math.floor((x - centerX - panX) / squareSize), Math.floor((y - centerY - panY) / squareSize)];
}

function getScreenCoordinates(coordinates, padding) {
  return [
    centerX + panX + coordinates[0] * squareSize + padding / 2,
    centerY + panY + coordinates[1] * squareSize + padding / 2,
    squareSize - padding,
    squareSize - padding
  ];
}

function addCell(coordinates) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(...getScreenCoordinates(coordinates, 0));
}

function removeCell(coordinates) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(...getScreenCoordinates(coordinates, 1));
}

function pan(dX, dY) {
  panX += dX;
  panY += dY;
}

function onClick(ev) {
  if (isDragging) {
    isDragging = false;
  } else {
    const coordinates = getGridCoordinates(ev.x, ev.y);
    if (game.cellStates[coordinates.join(",")]) {
      game.removeCell(coordinates);
      removeCell(coordinates);
    } else {
      game.addCell(coordinates);
      addCell(coordinates);
    }
  }
}

function clear() {
  game.clear();
  setupCanvas();
}

function tick() {
  const changes = game.calculateNextTick();
  if (Object.keys(changes).length === 0) {
    stopTick();
  }
  for (const cell in changes) {
    if (changes[cell]) {
      addCell(cell.split(","));
    } else {
      removeCell(cell.split(","));
    }
  }
}

function startTick() {
  isTicking = true;
  animationInterval = window.setInterval(function() {
    requestAnimationFrame(tick);
  }, 1000 / gps);
}

function stopTick() {
  isTicking = false;
  window.clearInterval(animationInterval);
}

function toggleTick() {
  if (isTicking) {
    stopTick();
  } else {
    startTick();
  }
}

function resetTimer() {
  stopTick();
  startTick();
}

function increaseTickSpeed() {
  gps++;
  resetTimer();
}

function decreaseTickSpeed() {
  if (gps > 1) {
    gps--;
    resetTimer();
  }
}

function resetTickSpeed() {
  gps = DEFAULT_GPS;
  resetTimer();
}

function getBorders() {
  const topLeft = getGridCoordinates(0, 0);
  const bottomRight = getGridCoordinates(canvasWidth, canvasHeight);
  return [topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]];
}

function randomize() {
  clear();
  const borders = getBorders();
  for (let x = borders[0]; x <= borders[2]; x++) {
    for (let y = borders[1]; y <= borders[3]; y++) {
      if (Math.random() > 1 - RANDOMIZE_DENSITY) {
        game.addCell([x, y]);
        addCell([x, y]);
      }
    }
  }
}

window.addEventListener("resize", setupCanvas);

canvas.addEventListener("click", onClick);
/*
  SPACE: Toggle tick
  ESCAPE: Clear state
  ARROW RIGHT: Tick one step
  ARROW UP: Increase ticking speed
  ARROW DOWN: Decrease ticking speed
  "T": Reset ticking speed to 2 GPS
  "R": Randomize the field
*/
window.addEventListener("keyup", function (ev) {
  if (ev.key === " ") {
    toggleTick();
  } else if (ev.key === "Escape") {
    clear();
    stopTick();
  } else if (ev.key === "ArrowRight") {
    tick();
  } else if (ev.key === "ArrowUp") {
    increaseTickSpeed();
  } else if (ev.key === "ArrowDown") {
    decreaseTickSpeed();
  } else if (ev.key === "t") {
    resetTickSpeed();
  } else if (ev.key === "r") {
    randomize();
  }
});

// Zoom
window.addEventListener("wheel", function (ev){
  squareSize = Math.max(squareSize - ev.deltaY * SCROLL_SPEED, MIN_SQUARE_SIZE);
  setupCanvas();
});

canvas.addEventListener("mousedown", function () {
  isMouseDown = true;
});
canvas.addEventListener("mousemove", function (ev) {
  if ((isMouseDown && Math.pow(ev.movementX, 2) + Math.pow(ev.movementY, 2) >= DRAG_THRESHOLD) || isDragging) {
    isDragging = true;
    pan(ev.movementX, ev.movementY);
    setupCanvas();
  }
});
canvas.addEventListener("mouseup", function () {
  isMouseDown = false;
});

setupCanvas();
