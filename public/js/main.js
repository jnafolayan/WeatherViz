(function() {

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

let initialized = false;

let canvas, ctx, width, height;
let tick = 0, dt = 0, lt = null, time;

// state
let raindrops, weatherType, temperature, cloudCover, windSpeed, windBearing;

// constants
const MAX_RAINDROPS = 50;
const SPEED_SCALE = 220;
// const SPEED_SCALE = 550;

function init() {
  if (initialized)
    return;

  initialized = true;
  
  canvas = document.querySelector('#boardCanvas');
  ctx = canvas.getContext('2d');

  // state
  raindrops = [];

  resize();
  // requestAnimationFrame(loop);

  getClientLocation(position => {
    const { latitude, longitude } = position.coords;
    const geoloc = document.querySelector('#geoloc');
    geoloc.innerHTML = `${latitude}°C ${longitude}°C`;

    fetch(`https://api.darksky.net/forecast/14c7911ea7429f47bda5beea8570ce98/${latitude},${longitude}?exclude=minutely,hourly,daily,alerts,flags`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(({ data }) => {
      temperature = `${data.currently.temperature}°C`;
      weatherType = data.currently.icon;
      cloudCover = data.currently.cloudCover;
      windSpeed = data.currently.windSpeed;
      windBearing = data.currently.windBearing;

      document.querySelector('.wrapper').classList.remove('loading');
      loop();
    });
  }, err => console.error(err.message));
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
  if (weatherType == 'rain') {
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
        raindrops.push(makeRaindrop());
  }
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
  circle(width * 0.2, 100, 30 * cloudCover * 1.2);
  fill('#fff');
  circle(width * 0.5, 80, 60 * cloudCover * 1.2);
  fill('#fff');
  circle(width * 0.32, 95, 36 * cloudCover * 1.2);
  fill('#fff');
  circle(width * 0.68, 100, 48 * cloudCover * 1.2);
  fill('#fff');
  ctx.restore();
}

function drawRaindrops() {
  ctx.save();
  raindrops.forEach(rain => {
    ctx.beginPath();
    ctx.moveTo(rain.x, rain.y);
    ctx.lineTo(rain.endX, rain.endY);
    ctx.globalAlpha = rain.zIndex;
    ctx.strokeStyle = '#ddd';
    ctx.stroke();
  });
  ctx.restore();
}

function makeRaindrop() {
  const angle = windBearing * Math.PI / 180;
  const length = random(10, 30);
  const vx = Math.cos(angle) * SPEED_SCALE * windSpeed;
  const vy = Math.sin(angle) * SPEED_SCALE * windSpeed;
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
    get endX() { return this.x + Math.cos(angle) * length; },
    get endY() { return this.y + Math.sin(angle) * length; }
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

function getClientLocation(successCb, errorCb) {
  if ('geolocation' in navigator)
    navigator.geolocation.getCurrentPosition(successCb, errorCb);
  else
    errorCb(new Error('Geolocation API not supported!'));
}

})();