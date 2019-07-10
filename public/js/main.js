(function() {

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);


let initialized = false;

let canvas, ctx, width, height;
let tick = 0, dt = 0, lt = null, time;

// state
let raindrops;

// constants
const MAX_RAINDROPS = 50;

function init() {
  if (initialized)
    return;

  initialized = true;
  
  canvas = document.querySelector('#boardCanvas');
  ctx = canvas.getContext('2d');

  // state
  raindrops = [];

  resize();

  requestAnimationFrame(loop);
}

function resize() {
  width = canvas.width;
  height = canvas.height;
}

function loop() {
  time = Date.now();
  dt = lt ? (time - lt) / 1000 : 0;
  lt = time;
  tick++;
  update(dt);
  drawScene();
  requestAnimationFrame(loop);
}

function update(dt) {
  // raindrops
  raindrops.forEach(rain => {
    rain.x += rain.vx * dt;
    rain.y += rain.vy * dt;

    if (rain.y > height) {
      rain.dead = true;
    }
  });

  raindrops = raindrops.filter(rain => !rain.dead);

  if (raindrops.length < MAX_RAINDROPS) 
    if (Math.random() < 0.63)
      raindrops.push(makeRaindrop(550));
}

function drawScene() {
  ctx.clearRect(0, 0, width, height);

  drawRaindrops();
  drawClouds();
  
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = '45px Consolas';
  ctx.textAlign = 'center';
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'hsl(210, 100%, 50%)';
  ctx.fillText('60°C', width / 2, height * 0.7);
  ctx.restore();
}

function drawClouds() {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, 120);
  ctx.clip();
  circle(width * 0.2, 100, 30);
  fill('#fff');
  circle(width * 0.5, 80, 60);
  fill('#fff');
  circle(width * 0.32, 95, 36);
  fill('#fff');
  circle(width * 0.68, 100, 48);
  fill('#fff');
  ctx.restore();
}

function drawRaindrops() {
  ctx.save();
  raindrops.forEach(rain => {
    ctx.beginPath();
    ctx.moveTo(rain.x, rain.y);
    ctx.lineTo(rain.endX(), rain.endY());
    ctx.globalAlpha = rain.zIndex;
    ctx.strokeStyle = '#ddd';
    ctx.stroke();
  });
  ctx.restore();
}

function makeRaindrop(speed) {
  const angle = 100 * Math.PI / 180;
  const length = random(10, 30);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  const x = random(0.18, 0.8) * width;
  const y = 100;
  return {
    x,
    y,
    vx,
    vy,
    length,
    dead: false,
    zIndex: +random(0.4, 1).toPrecision(2),
    endX() {
      return this.x + Math.cos(angle) * length;
    },
    endY() {
      return this.y + Math.sin(angle) * length;
    }
  }
}


// util
function random(a, b) {
  return Math.random() * (b - a) + a;
}

function circle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
} 

function fill(color) {
  ctx.fillStyle = color;
  ctx.fill();
}

})();