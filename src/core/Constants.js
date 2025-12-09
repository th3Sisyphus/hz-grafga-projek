export const TILE_SIZE = 40;
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;

// BALANCE FIX: Kecepatan asli terlalu lambat.
export const BASE_PLAYER_SPEED = 3.5;
export const BASE_ZOMBIE_SPEED = 2.0;

export const BASE_ZOMBIE_HEALTH = 100;
export const BASE_PLAYER_HEALTH = 150;
export const WAVE_DELAY = 3000; // 3 seconds cukup, 5 kelamaan
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
    speedBonus: 0.5,
    range: 60, // Range diperbesar sedikit
    cooldown: 400,
  },
  fist: {
    name: "Tangan Kosong",
    type: "melee",
    damage: 50,
    criticalMultiplier: 1,
    speedBonus: 1.0, // Mobilitas tinggi
    range: 45,
    cooldown: 300,
  },
  wizard: {
    name: "Wizard Book",
    type: "range",
    damage: 45,
    dotDamage: 10,
    dotDuration: 3000,
    speedBonus: 0.2,
    range: 300, // Range diperbaiki agar worth it
    cooldown: 600,
  },
  dualgun: {
    name: "Dual Gun",
    type: "range",
    damage: 25,
    aoeRadius: 100,
    speedBonus: 0.4,
    range: 400, // Range tembak harus jauh
    cooldown: 500,
  },
};
