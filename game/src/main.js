// Gobble Dash entry point: screens, the fixed-step loop, sounds and input.
// ?shot=start|play|end renders one staged frame for screenshots instead of playing.
import { STEP } from './config.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { World, EVENT_CAUGHT, EVENT_CORN, EVENT_ESCAPED, EVENT_HIDE, EVENT_HIT, EVENT_SPOTTED } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, drawOver, drawTitle, drawWorld } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const world = new World(20261127);
const input = new Input(canvas);
const sounds = new SoundBank();

let screen = SCREEN_TITLE;
let accumulator = 0;
let lastTime = performance.now();
let best = 0;
let overAt = 0;

function handleEvents(events) {
  if (events & EVENT_CORN) sounds.corn();
  if (events & EVENT_HIDE) sounds.hide();
  if (events & EVENT_SPOTTED) sounds.spotted();
  if (events & EVENT_HIT) sounds.thud();
  if (events & EVENT_CAUGHT) {
    sounds.caught();
    sounds.stopMusic();
    screen = SCREEN_OVER;
    overAt = performance.now();
  }
  if (events & EVENT_ESCAPED) {
    sounds.escaped();
    sounds.stopMusic();
    screen = SCREEN_OVER;
    overAt = performance.now();
  }
}

function startGame() {
  sounds.ensure();
  sounds.startMusic();
  sounds.gobble();
  world.reset();
  world.state.best = best;
  screen = SCREEN_PLAY;
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  if (screen === SCREEN_TITLE) {
    if (input.takeConfirm() || input.takeJump()) startGame();
    drawTitle(ctx, world.state, now / 1000);
  } else if (screen === SCREEN_PLAY) {
    accumulator += dt;
    while (accumulator >= STEP) {
      accumulator -= STEP;
      const events = world.step(STEP, input.takeJump() ? 1 : 0, input.hideHeld);
      handleEvents(events);
      if (world.state.runOver) break;
    }
    if (input.takeRestart()) startGame();
    if (world.state.best > best) best = world.state.best;
    drawWorld(ctx, world.state, now / 1000);
  } else {
    // A short grace period stops the jump that killed the turkey from instantly restarting.
    if (now - overAt > 600 && (input.takeConfirm() || input.takeRestart() || input.takeJump())) startGame();
    drawOver(ctx, world.state);
  }
  requestAnimationFrame(frame);
}

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  const staged = stageShot(shot, world);
  best = staged.best;
  world.state.best = best;
  screen = staged.screen;
  if (screen === SCREEN_TITLE) drawTitle(ctx, world.state, 2);
  else if (screen === SCREEN_PLAY) drawWorld(ctx, world.state, 2);
  else drawOver(ctx, world.state);
} else {
  requestAnimationFrame(frame);
}
