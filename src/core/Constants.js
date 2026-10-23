export const TILE_SIZE = 40;
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;

export const BASE_PLAYER_SPEED = 2.7;
export const BASE_PLAYER_HEALTH = 300;
export const WAVE_DELAY = 3000;
export const CAMERA_LERP = 0.1;

export const TILES = {
  GRASS: 0,
  DIRT: 1,
  STONE: 2,
  TREE: 3,
  ROCK: 4,
  SPIKE: 5,
};

// Re-export data terpusat agar kompatibilitas (termasuk index.html weapon simulator) tetap terjaga
export { WEAPONS } from "./data/weapons.js";
export {
  BASE_ZOMBIE_HEALTH,
  BASE_ZOMBIE_SPEED,
  BASE_ZOMBIE_DAMAGE,
  SPIKE_DAMAGE,
  SPIKE_TICK_INTERVAL,
  calculateZombieStats,
} from "./data/enemies.js";
