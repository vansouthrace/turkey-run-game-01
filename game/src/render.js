// Gobble Dash renderer: all art is drawn with canvas shapes — an original
// autumn farm, a hand-drawn turkey, the farmer, the oven and the carving knife.
import { FARMER, GROUND_Y, PLAYER, VIEW, stageFor } from './config.js';
import { FARMER_LUNGE, FARMER_SEARCH } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawBackground(ctx, state) {
  const stage = stageFor(state.distance);
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, stage.skyTop);
  sky.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW.width, GROUND_Y);
  ctx.fillStyle = '#fff3c9';
  ctx.beginPath();
  ctx.arc(830, 70, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.ellipse(200, 90, 70, 18, 0, 0, Math.PI * 2);
  ctx.ellipse(280, 78, 46, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  if (stage.name === 'KITCHEN') {
    drawKitchenWall(ctx, state);
  } else {
    drawFarmBackdrop(ctx, stage.name, state);
  }
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, VIEW.width, VIEW.height - GROUND_Y);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, GROUND_Y, VIEW.width, 6);
  ctx.strokeStyle = 'rgba(255,220,150,0.5)';
  ctx.lineWidth = 2;
  for (let x = (state.distance * 37) % 60 - 60; x < VIEW.width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 22);
    ctx.lineTo(x + 26, GROUND_Y + 22);
    ctx.stroke();
  }
}

function drawFarmBackdrop(ctx, name, state) {
  // Parallax scenery: buildings drift left as Gerald runs and wrap around.
  const scroll = (state.distance * 24) % 1100;
  const wrap = (base) => {
    let x = base - scroll;
    if (x < -280) x += 1100;
    return x;
  };
  const houseX = wrap(40);
  ctx.fillStyle = '#7a3b1e';
  ctx.fillRect(houseX, 300, 180, 168);
  ctx.fillStyle = '#a34d24';
  ctx.beginPath();
  ctx.moveTo(houseX - 20, 302);
  ctx.lineTo(houseX + 90, 220);
  ctx.lineTo(houseX + 200, 302);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3c9';
  ctx.fillRect(houseX + 65, 350, 50, 70);
  ctx.fillStyle = '#5a2c12';
  ctx.fillRect(houseX + 82, 380, 16, 40);
  if (name === 'BARN') {
    const barnX = wrap(620);
    ctx.fillStyle = 'rgba(122,59,30,0.85)';
    ctx.fillRect(barnX, 330, 260, 138);
    ctx.beginPath();
    ctx.moveTo(barnX - 20, 332);
    ctx.lineTo(barnX + 130, 250);
    ctx.lineTo(barnX + 280, 332);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd27a';
    ctx.font = 'bold 26px Trebuchet MS, sans-serif';
    ctx.fillText('BARN', barnX + 80, 400);
  }
  const treeX = wrap(880);
  ctx.fillStyle = '#3f7a2e';
  ctx.beginPath();
  ctx.arc(treeX, 420, 44, 0, Math.PI * 2);
  ctx.arc(treeX + 40, 430, 30, 0, Math.PI * 2);
  ctx.fill();
}

function drawKitchenWall(ctx, state) {
  const scroll = (state.distance * 24) % 120;
  ctx.fillStyle = '#8a4a2b';
  ctx.fillRect(0, 180, VIEW.width, 12);
  for (let x = 20 - scroll; x < VIEW.width; x += 120) {
    ctx.fillStyle = '#dfe8ee';
    roundRect(ctx, x, 220, 84, 110, 8);
    ctx.fill();
    ctx.fillStyle = '#9fb4c0';
    ctx.fillRect(x + 8, 300, 68, 6);
  }
  ctx.fillStyle = '#e8b64c';
  ctx.font = 'bold 24px Trebuchet MS, sans-serif';
  ctx.fillText('THANKSGIVING KITCHEN', 330, 150);
}

export function drawTurkey(ctx, state, time) {
  const p = state.player;
  const bob = p.onGround ? Math.sin(time * 14) * 2 : 0;
  const x = p.x;
  const y = p.y + bob;
  ctx.save();
  if (state.invulnerable > 0 && Math.floor(time * 10) % 2 === 0) ctx.globalAlpha = 0.45;
  if (p.hiding) ctx.globalAlpha = 0.25;
  const legSwing = p.onGround ? Math.sin(time * 16) * 8 : 4;
  ctx.strokeStyle = '#e8a13a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 22, y + PLAYER.height - 4);
  ctx.lineTo(x + 22 + legSwing, GROUND_Y + 2);
  ctx.moveTo(x + 40, y + PLAYER.height - 4);
  ctx.lineTo(x + 40 - legSwing, GROUND_Y + 2);
  ctx.stroke();
  ctx.fillStyle = '#b06a2e';
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.translate(x + 18, y + 26);
    ctx.rotate(i * 0.42);
    ctx.beginPath();
    ctx.ellipse(0, -26, 9, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#8a4a1d';
  ctx.beginPath();
  ctx.ellipse(x + 30, y + 30, 26, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a8622a';
  ctx.beginPath();
  ctx.arc(x + 52, y + 12, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2b234';
  ctx.beginPath();
  ctx.moveTo(x + 62, y + 10);
  ctx.lineTo(x + 76, y + 14);
  ctx.lineTo(x + 62, y + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d93a2b';
  ctx.beginPath();
  ctx.ellipse(x + 60, y + 20, 4, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + 55, y + 8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1d1d';
  ctx.beginPath();
  ctx.arc(x + 56, y + 8, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c97b2d';
  ctx.beginPath();
  ctx.ellipse(x + 18, y + 34, 14, 8, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawFarmer(ctx, state, time) {
  const gap = state.farmerGap;
  const x = state.player.x - gap - FARMER.width;
  const y = GROUND_Y - FARMER.height;
  const run = Math.sin(time * 12) * 5;
  ctx.save();
  ctx.strokeStyle = '#2e2118';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 62);
  ctx.lineTo(x + 22 + run, GROUND_Y);
  ctx.moveTo(x + 40, y + 62);
  ctx.lineTo(x + 40 - run, GROUND_Y);
  ctx.stroke();
  ctx.fillStyle = '#3a6ea5';
  ctx.fillRect(x + 14, y + 46, 34, 30);
  ctx.fillStyle = '#c94f2e';
  ctx.fillRect(x + 14, y + 46, 34, 10);
  ctx.fillStyle = '#f2c48d';
  ctx.beginPath();
  ctx.arc(x + 31, y + 30, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a3418';
  ctx.beginPath();
  ctx.arc(x + 31, y + 24, 15, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(x + 14, y + 22, 34, 5);
  ctx.fillStyle = '#f2c48d';
  ctx.beginPath();
  ctx.arc(x + 45, y + 34, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a3b1e';
  ctx.beginPath();
  ctx.ellipse(x + 50, y + 52, 16, 6, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + 36, y + 28, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1d1d';
  ctx.beginPath();
  ctx.arc(x + 37, y + 28, 1.6, 0, Math.PI * 2);
  ctx.fill();
  if (state.farmerMode === FARMER_SEARCH) {
    ctx.fillStyle = '#d93a2b';
    ctx.font = 'bold 20px Trebuchet MS, sans-serif';
    ctx.fillText('?', x + 52, y - 6);
  }
  if (state.farmerMode === FARMER_LUNGE) {
    ctx.fillStyle = '#d93a2b';
    ctx.font = 'bold 20px Trebuchet MS, sans-serif';
    ctx.fillText('!', x + 52, y - 6);
  }
  ctx.restore();
}

export function drawObstacle(ctx, o, time) {
  ctx.save();
  if (o.kind === 'fence') {
    ctx.fillStyle = '#6e4423';
    ctx.fillRect(o.x, o.y, 6, o.height);
    ctx.fillRect(o.x + o.width - 6, o.y, 6, o.height);
    ctx.fillRect(o.x, o.y + 8, o.width, 8);
    ctx.fillRect(o.x, o.y + 30, o.width, 8);
  } else if (o.kind === 'oven') {
    ctx.fillStyle = '#4a4a52';
    roundRect(ctx, o.x, o.y, o.width, o.height, 8);
    ctx.fill();
    ctx.fillStyle = '#ff7a1a';
    roundRect(ctx, o.x + 12, o.y + 34, o.width - 24, 34, 6);
    ctx.fill();
    ctx.fillStyle = '#ffd27a';
    ctx.font = 'bold 15px Trebuchet MS, sans-serif';
    ctx.fillText('HOT!', o.x + 30, o.y + 56);
    ctx.fillStyle = '#c9c9d1';
    ctx.fillRect(o.x + 10, o.y + 8, o.width - 20, 8);
  } else if (o.kind === 'knife') {
    ctx.translate(o.x + o.width / 2, o.y + o.height / 2);
    ctx.rotate(0.5 + Math.sin(time * 3 + o.seed * 6) * 0.15);
    ctx.fillStyle = '#dfe8ee';
    ctx.beginPath();
    ctx.moveTo(0, -o.height / 2);
    ctx.lineTo(9, 6);
    ctx.lineTo(-9, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5a3418';
    ctx.fillRect(-6, 6, 12, o.height / 2 - 6);
  } else if (o.kind === 'haystack') {
    ctx.fillStyle = '#e8b64c';
    ctx.beginPath();
    ctx.moveTo(o.x, o.y + o.height);
    ctx.quadraticCurveTo(o.x + o.width / 2, o.y - 26, o.x + o.width, o.y + o.height);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b8892e';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(o.x + 14 + i * 20, o.y + o.height - 8);
      ctx.quadraticCurveTo(o.x + 18 + i * 20, o.y + 18, o.x + 22 + i * 20, o.y + 4);
      ctx.stroke();
    }
  } else if (o.kind === 'corn') {
    ctx.fillStyle = '#f2c531';
    ctx.beginPath();
    ctx.ellipse(o.x + 15, o.y + 15, 11, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d99e12';
    for (let r = -1; r <= 1; r += 1) {
      ctx.beginPath();
      ctx.ellipse(o.x + 15, o.y + 15 + r * 8, 9, 2, 0, 0, Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = '#3f7a2e';
    ctx.beginPath();
    ctx.moveTo(o.x + 15, o.y + 28);
    ctx.lineTo(o.x + 4, o.y + 36);
    ctx.lineTo(o.x + 26, o.y + 36);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawHud(ctx, state) {
  const stage = stageFor(state.distance);
  ctx.fillStyle = 'rgba(43,26,14,0.82)';
  roundRect(ctx, 12, 10, 936, 56, 10);
  ctx.fill();
  ctx.fillStyle = '#ffe9c4';
  ctx.font = 'bold 22px Trebuchet MS, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${Math.floor(state.score)}`, 28, 38);
  ctx.fillText(`DIST ${Math.floor(state.distance)} m`, 250, 38);
  ctx.fillText(`STAGE ${stage.name}`, 470, 38);
  ctx.fillStyle = '#ffd27a';
  ctx.font = 'bold 15px Trebuchet MS, sans-serif';
  ctx.fillText(`LIVES ${state.lives}`, 700, 26);
  for (let i = 0; i < state.lives; i += 1) {
    ctx.beginPath();
    ctx.arc(706 + i * 26, 44, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b06a2e';
    ctx.beginPath();
    ctx.arc(706 + i * 26, 44, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd27a';
  }
  ctx.fillStyle = '#ffe9c4';
  ctx.font = 'bold 15px Trebuchet MS, sans-serif';
  ctx.fillText('FARMER', 800, 30);
  ctx.fillStyle = '#3a2412';
  ctx.fillRect(800, 38, 120, 10);
  ctx.fillStyle = state.farmerMode === FARMER_LUNGE ? '#d93a2b' : '#e8a13a';
  const danger = 1 - state.farmerGap / FARMER.maxGap;
  ctx.fillRect(800, 38, 120 * Math.max(0, Math.min(1, danger)), 10);
  if (state.farmerMode === FARMER_SEARCH) {
    ctx.fillStyle = '#ff5a3c';
    ctx.font = 'bold 16px Trebuchet MS, sans-serif';
    ctx.fillText(`SPOTTED? ${Math.round(state.alert * 100)}% — HIDE IN HAY!`, 28, 92);
  }
  ctx.textAlign = 'left';
}

export function drawWorld(ctx, state, time) {
  drawBackground(ctx, state);
  for (const o of state.obstacles) drawObstacle(ctx, o, time);
  drawFarmer(ctx, state, time);
  drawTurkey(ctx, state, time);
  drawHud(ctx, state);
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(30,16,6,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = accent;
  ctx.font = 'bold 64px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW.width / 2, 190);
  ctx.fillStyle = '#ffe9c4';
  ctx.font = '22px Trebuchet MS, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, VIEW.width / 2, 250 + i * 36));
  ctx.textAlign = 'left';
}

export function drawTitle(ctx, state, time) {
  drawWorld(ctx, state, time);
  overlay(ctx, 'GOBBLE DASH', [
    "Gerald the turkey is on the Thanksgiving menu.",
    'Outrun the farmer, jump the fences, dodge the oven',
    'and the carving knife — hide in the hay when he searches!',
    '',
    'Press ENTER or click to start  ·  Space to jump  ·  Down to hide',
  ], '#ffd27a');
}

export function drawOver(ctx, state) {
  drawWorld(ctx, state, 0);
  if (state.escaped) {
    overlay(ctx, 'ESCAPED!', [
      `Gerald made it ${Math.floor(state.distance)} m — free for another year!`,
      `Final score ${Math.floor(state.score)}  ·  corn ${state.cornEaten}  ·  hides ${state.hides}`,
      '',
      'Press R or ENTER to run again',
    ], '#7ddb6a');
  } else {
    overlay(ctx, 'CAUGHT!', [
      'The farmer got Gerald… this Thanksgiving, the table wins.',
      `Score ${Math.floor(state.score)}  ·  distance ${Math.floor(state.distance)} m`,
      `Best ${state.best}  ·  corn ${state.cornEaten}`,
      '',
      'Press R or ENTER to try again',
    ], '#ff6a4a');
  }
}
