// Gobble Dash world: the turkey, the farmer, the obstacles and the three stages.
// Pure rules — no drawing, no sound — so the screenshot stager can run it headless.
import {
  CORN_POINTS, DISTANCE_POINTS_PER_METRE, ESCAPE_DISTANCE, FARMER, GROUND_Y,
  HIDE_POINTS, OBSTACLES, PLAYER, START_LIVES, speedFor, spawnGapFor, stageFor,
} from './config.js';

export const KIND_FENCE = 'fence';
export const KIND_OVEN = 'oven';
export const KIND_KNIFE = 'knife';
export const KIND_HAYSTACK = 'haystack';
export const KIND_CORN = 'corn';

export const EVENT_CORN = 1;
export const EVENT_HIT = 2;
export const EVENT_HIDE = 4;
export const EVENT_SPOTTED = 8;
export const EVENT_CAUGHT = 16;
export const EVENT_ESCAPED = 32;

export const FARMER_CHASE = 'chase';
export const FARMER_SEARCH = 'search';
export const FARMER_LUNGE = 'lunge';

function makeRng(seed) {
  let value = seed >>> 0 || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export class World {
  constructor(seed = 20261127) {
    this.rng = makeRng(seed);
    this.reset();
  }

  reset() {
    this.state = {
      distance: 0,
      score: 0,
      lives: START_LIVES,
      best: 0,
      player: { x: PLAYER.x, y: GROUND_Y - PLAYER.height, vy: 0, onGround: true, hiding: false, hideTimer: 0 },
      farmerGap: 90,
      farmerMode: FARMER_CHASE,
      farmerTimer: 4,
      alert: 0,
      obstacles: [],
      spawnX: 1000,
      time: 0,
      runOver: false,
      escaped: false,
      message: '',
      invulnerable: 0,
      cornEaten: 0,
      hides: 0,
    };
    this.spawnInitial();
  }

  spawnInitial() {
    const s = this.state;
    s.obstacles.push(this.makeObstacle(KIND_CORN, 560, 0));
    s.obstacles.push(this.makeObstacle(KIND_FENCE, 820, 0));
    s.obstacles.push(this.makeObstacle(KIND_HAYSTACK, 1080, 0));
  }

  makeObstacle(kind, x, heightOffset) {
    const dims = OBSTACLES[kind];
    const y = kind === KIND_KNIFE
      ? -dims.height
      : kind === KIND_CORN
        ? GROUND_Y - 120 + heightOffset
        : GROUND_Y - dims.height;
    return { kind, x, y, width: dims.width, height: dims.height, active: true, vy: kind === KIND_KNIFE ? 0 : 0, seed: this.rng() };
  }

  spawnNext() {
    const s = this.state;
    const roll = this.rng();
    const stage = stageFor(s.distance);
    let kind = KIND_FENCE;
    if (stage.name === 'KITCHEN') {
      kind = roll < 0.34 ? KIND_OVEN : roll < 0.62 ? KIND_KNIFE : roll < 0.8 ? KIND_FENCE : KIND_CORN;
    } else if (stage.name === 'BARN') {
      kind = roll < 0.4 ? KIND_FENCE : roll < 0.62 ? KIND_KNIFE : roll < 0.82 ? KIND_HAYSTACK : KIND_CORN;
    } else {
      kind = roll < 0.45 ? KIND_FENCE : roll < 0.7 ? KIND_HAYSTACK : roll < 0.88 ? KIND_CORN : KIND_KNIFE;
    }
    const obstacle = this.makeObstacle(kind, 1000 + this.rng() * 120, 0);
    if (kind === KIND_KNIFE) obstacle.vy = 320 + s.distance * 0.12;
    s.obstacles.push(obstacle);
    if (this.rng() < 0.45) s.obstacles.push(this.makeObstacle(KIND_CORN, obstacle.x + 130, (this.rng() - 0.5) * 40));
    s.spawnX = obstacle.x + spawnGapFor(s.distance);
  }

  overlaps(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  playerBox() {
    const p = this.state.player;
    // A slightly forgiving hitbox: the turkey's tail feathers don't count.
    return { x: p.x + 8, y: p.y + 6, width: PLAYER.width - 16, height: PLAYER.height - 12 };
  }

  step(dt, move, hideHeld) {
    const s = this.state;
    if (s.runOver) return 0;
    let events = 0;
    s.time += dt;
    const speed = speedFor(s.distance);
    const p = s.player;

    if (move !== 0 && p.onGround && !p.hiding) {
      p.vy = PLAYER.jumpVelocity;
      p.onGround = false;
    }
    p.vy += PLAYER.gravity * dt;
    p.y += p.vy * dt;
    if (p.y >= GROUND_Y - PLAYER.height) {
      p.y = GROUND_Y - PLAYER.height;
      p.vy = 0;
      p.onGround = true;
    }

    const nearHay = s.obstacles.some((o) => o.active && o.kind === KIND_HAYSTACK
      && Math.abs(o.x + o.width / 2 - (p.x + PLAYER.width / 2)) < 90 && p.onGround);
    if (hideHeld && nearHay && !p.hiding) {
      p.hiding = true;
      p.hideTimer = PLAYER.hideSeconds;
      s.hides += 1;
      s.score += HIDE_POINTS;
      events |= EVENT_HIDE;
    }
    if (p.hiding) {
      p.hideTimer -= dt;
      if (p.hideTimer <= 0) p.hiding = false;
    }

    s.distance += (speed * dt) / 14;
    s.score += DISTANCE_POINTS_PER_METRE * (speed * dt) / 14;

    this.updateFarmer(dt, speed);
    if (s.runOver && !s.escaped) events |= EVENT_CAUGHT;
    if (s.farmerMode === FARMER_SEARCH && s.alert >= 1) {
      s.farmerMode = FARMER_LUNGE;
      s.farmerTimer = 0.9;
      events |= EVENT_SPOTTED;
    }

    for (const o of s.obstacles) {
      o.x -= speed * dt;
      if (o.kind === KIND_KNIFE) o.y += (o.vy || 300) * dt;
      if (o.x + o.width < -40 || o.y > 620) o.active = false;
    }
    s.obstacles = s.obstacles.filter((o) => o.active);
    const last = s.obstacles[s.obstacles.length - 1];
    if (!last || last.x < 700) this.spawnNext();

    const box = this.playerBox();
    for (const o of s.obstacles) {
      if (!o.active) continue;
      if (o.kind === KIND_CORN) {
        if (this.overlaps(box, o)) {
          o.active = false;
          s.cornEaten += 1;
          s.score += CORN_POINTS;
          events |= EVENT_CORN;
        }
        continue;
      }
      if (o.kind === KIND_HAYSTACK) continue;
      if (p.hiding) continue;
      if (this.overlaps(box, o) && s.invulnerable <= 0) {
        o.active = false;
        events |= this.hitTurkey();
        break;
      }
    }

    if (s.invulnerable > 0) s.invulnerable -= dt;
    if (s.distance >= ESCAPE_DISTANCE) {
      s.runOver = true;
      s.escaped = true;
      s.message = 'ESCAPED!';
      events |= EVENT_ESCAPED;
    }
    if (s.score > s.best) s.best = Math.floor(s.score);
    return events;
  }

  updateFarmer(dt, speed) {
    const s = this.state;
    s.farmerTimer -= dt;
    if (s.farmerMode === FARMER_CHASE) {
      s.farmerGap += 14 * dt;
      if (s.farmerGap > FARMER.maxGap) s.farmerGap = FARMER.maxGap;
      if (s.farmerTimer <= 0) {
        s.farmerMode = FARMER_SEARCH;
        s.farmerTimer = 2.2;
      }
    } else if (s.farmerMode === FARMER_SEARCH) {
      s.farmerGap += 4 * dt;
      const p = s.player;
      if (!p.hiding) s.alert += dt * 0.45;
      else s.alert = Math.max(0, s.alert - dt * 0.8);
      if (s.farmerTimer <= 0) {
        s.farmerMode = FARMER_CHASE;
        s.farmerTimer = 3.5 + this.rng() * 2;
        s.alert = Math.max(0, s.alert - 0.4);
      }
    } else if (s.farmerMode === FARMER_LUNGE) {
      s.farmerGap -= 260 * dt;
      if (s.farmerTimer <= 0) {
        s.farmerMode = FARMER_CHASE;
        s.farmerTimer = 4;
        s.alert = 0;
      }
    }
    const farmerX = this.state.player.x - s.farmerGap - FARMER.width;
    if (farmerX + FARMER.width >= this.state.player.x - FARMER.catchDistance && this.state.invulnerable <= 0) {
      this.hitTurkey();
    }
  }

  hitTurkey() {
    const s = this.state;
    s.lives -= 1;
    s.farmerGap = 90;
    s.farmerMode = FARMER_CHASE;
    s.farmerTimer = 4;
    s.alert = 0;
    s.invulnerable = 2;
    if (s.lives <= 0) {
      s.runOver = true;
      s.escaped = false;
      s.message = 'CAUGHT!';
      return EVENT_HIT | EVENT_CAUGHT;
    }
    return EVENT_HIT;
  }
}
