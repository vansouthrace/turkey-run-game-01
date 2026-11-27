// Screenshot scenes for ?shot=start|play|end. Each one runs the real rules
// forward from a fresh world with a simple autopilot, so every frame is what a
// short real game looks like, and the same seed always gives the same frame.
import { START_LIVES, STEP } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 4;
const PLAY_SECONDS = 24;
const END_LIMIT_SECONDS = 600;
const HORIZON_PLAY = 0.8;
const HORIZON_END = 0.2;
const SAMPLE = 1 / 30;

function nearestThreat(state) {
  const box = state.player.x + 64;
  let best = null;
  for (const o of state.obstacles) {
    if (!o.active || o.kind === 'corn' || o.kind === 'haystack') continue;
    if (o.x + o.width < box) continue;
    if (best === null || o.x < best.x) best = o;
  }
  return best;
}

function autopilot(world, horizon) {
  const state = world.state;
  const threat = nearestThreat(state);
  if (!threat) return 0;
  const gap = threat.x - (state.player.x + 64);
  const speed = 250 + Math.min(190, state.distance * 0.14);
  const timeToReach = gap / speed;
  // A falling knife is dodged by running on, never by jumping into it.
  if (threat.kind === 'knife') return 0;
  // Jump late: 0.2 s into the jump the turkey is already ~120 px up, and it
  // stays airborne 0.82 s — long enough for even the wide oven to pass under.
  if (timeToReach < 0.2 && timeToReach > -0.1 && state.player.onGround) return 1;
  return 0;
}

export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end') {
    for (let i = 0; i < START_SECONDS / STEP; i += 1) world.step(STEP, 0, false);
    // The title screen is a fresh game: full lives, no longer mid-chase.
    world.state.lives = START_LIVES;
    world.state.runOver = false;
    world.state.invulnerable = 2;
    return { screen: SCREEN_TITLE, best: 0 };
  }
  const limit = name === 'end' ? END_LIMIT_SECONDS : PLAY_SECONDS;
  const horizon = name === 'end' ? HORIZON_END : HORIZON_PLAY;
  for (let i = 0; i < limit / STEP; i += 1) {
    world.step(STEP, autopilot(world, horizon), false);
    if (world.state.runOver) break;
  }
  const over = world.state.runOver;
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: world.state.best };
}
