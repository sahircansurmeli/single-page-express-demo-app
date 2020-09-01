const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let canvasWidth;
let canvasHeight;
const SQUARE_SIZE = 30;
const DEFAULT_GPS = 2
let gps = DEFAULT_GPS; // Generations per second
const game = new Game();
let isTicking = false;
let animationInterval;

window.addEventListener("resize", setupCanvas);

function setupCanvas() {
  canvasWidth = canvas.width = window.innerWidth;
  canvasHeight = canvas.height = window.innerHeight;
  fillBackground();
  drawGrid();
  drawCells();
}

function fillBackground() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawGrid() {
  for (let x = 0; x <= canvasWidth; x += SQUARE_SIZE) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
  }
  for (let y = 0; y <= canvasHeight; y += SQUARE_SIZE) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
  }
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
}

function drawCells() {
  for (const cell in game.cellStates) {
    addCell(cell.split(","));
  }
}

function getGridCoordinates(x, y) {
  return [Math.floor(x / SQUARE_SIZE), Math.floor(y / SQUARE_SIZE)];
}

function getScreenCoordinates(coordinates, padding) {
  return [
    coordinates[0] * SQUARE_SIZE + padding / 2, 
    coordinates[1] * SQUARE_SIZE + padding / 2,
    SQUARE_SIZE - padding,
    SQUARE_SIZE - padding
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

function onClick(ev) {
  const coordinates = getGridCoordinates(ev.x, ev.y);
  if (game.cellStates[coordinates.join(",")]) {
    game.removeCell(coordinates);
    removeCell(coordinates);
  } else {
    game.addCell(coordinates);
    addCell(coordinates);
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

function randomize() {
  clear();
  for (let x = 0; x < canvasWidth / SQUARE_SIZE; x++) {
    for (let y = 0; y < canvasHeight / SQUARE_SIZE; y++) {
      if (Math.random() > 0.5) {
        game.addCell([x, y]);
        addCell([x, y]);
      }
    }
  }
}

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

setupCanvas();
