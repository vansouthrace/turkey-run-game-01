// Gobble Dash tuning: one place for every number the world and renderer share.
// The turkey, Gerald, flees the Thanksgiving table across three stages:
// the Farmyard, the Barn, and the Kitchen. Reach 1500 m and he escapes.
export const VIEW = { width: 960, height: 540 };
export const GROUND_Y = 468;
export const STEP = 1 / 60;

export const PLAYER = {
  x: 170,
  width: 64,
  height: 58,
  jumpVelocity: -720,
  gravity: 1750,
  hideSeconds: 1.6,
};

export const FARMER = {
  width: 62,
  height: 96,
  catchDistance: 46,
  maxGap: 130,
};

export const STAGES = [
  { name: 'FARMYARD', until: 500, skyTop: '#f7b733', skyBottom: '#fbe3a1', ground: '#8a5a2b' },
  { name: 'BARN', until: 1000, skyTop: '#e08a3c', skyBottom: '#f2c078', ground: '#6e4423' },
  { name: 'KITCHEN', until: 1500, skyTop: '#c65a2e', skyBottom: '#f0a35e', ground: '#5a3a28' },
];

export const ESCAPE_DISTANCE = 1500;
export const START_LIVES = 3;
export const CORN_POINTS = 25;
export const DISTANCE_POINTS_PER_METRE = 2;
export const HIDE_POINTS = 15;

export const OBSTACLES = {
  fence: { width: 34, height: 62 },
  oven: { width: 96, height: 84 },
  knife: { width: 26, height: 64 },
  haystack: { width: 92, height: 66 },
  corn: { width: 30, height: 30 },
};

export function stageFor(distance) {
  for (const stage of STAGES) if (distance < stage.until) return stage;
  return STAGES[STAGES.length - 1];
}

export function speedFor(distance) {
  return 250 + Math.min(190, distance * 0.14);
}

export function spawnGapFor(distance) {
  return Math.max(300, 560 - distance * 0.16);
}
