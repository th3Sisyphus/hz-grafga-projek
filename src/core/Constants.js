export const TILE_SIZE = 40;
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;
export const BASE_PLAYER_SPEED = 1.2;
export const BASE_ZOMBIE_SPEED = 1;
export const BASE_ZOMBIE_HEALTH = 100;
export const BASE_PLAYER_HEALTH = 150;
export const WAVE_DELAY = 5000; // 5 seconds
export const CAMERA_LERP = 0.1;

export const TILES = {
  GRASS: 0,
  DIRT: 1,
  STONE: 2,
  TREE: 3,
  ROCK: 4,
};

export const WEAPONS = {
  katana: {
    name: "Katana",
    type: "melee",
    damage: 40,
    criticalMultiplier: 2.5,
    speedBonus: 0.1,
    range: 40,
    cooldown: 500,
  },
  fist: {
    name: "Tangan Kosong",
    type: "melee",
    damage: 50,
    criticalMultiplier: 1,
    speedBonus: 0.3,
    range: 35,
    cooldown: 400,
  },
  wizard: {
    name: "Wizard Book",
    type: "range",
    damage: 35,
    dotDamage: 5,
    dotDuration: 3000,
    speedBonus: 0.2,
    range: 150,
    cooldown: 600,
  },
  dualgun: {
    name: "Dual Gun",
    type: "range",
    damage: 30,
    aoeRadius: 80,
    speedBonus: 0.15,
    range: 200,
    cooldown: 700,
  },
};
