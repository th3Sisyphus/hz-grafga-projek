import { BASE_PLAYER_SPEED } from "../Constants.js";

export const BASE_ZOMBIE_HEALTH = 65;
export const BASE_ZOMBIE_SPEED = 1.0;
export const BASE_ZOMBIE_DAMAGE = 8;
export const SPIKE_DAMAGE = 10;
export const SPIKE_TICK_INTERVAL = 500; // ms

/**
 * ============================================================================
 * ZOMBIE SCALING CURVE FORMULAS:
 * 
 * 1. Health: Pertumbuhan persentase eksponensial (8% per wave):
 *    health(wave) = Math.round(BASE_ZOMBIE_HEALTH * Math.pow(1.08, wave - 1))
 *    - Wave 1: 65 HP  (Katana dmg 70 mati dalam 1 pukulan)
 *    - Wave 10: 130 HP (Katana dmg 70 * 2 = 140 dmg => tepat ~2 pukulan)
 *    - Wave 20: 280 HP (Pemain terampil dengan upgrade/lifesteal tetap bisa menang)
 * 
 * 2. Speed: Kurva asimptotik berbatas (tidak pernah melebihi 90% speed player = 2.43):
 *    maxAllowedSpeed = BASE_PLAYER_SPEED * 0.90 = 2.43
 *    speed(wave) = BASE_ZOMBIE_SPEED + (maxAllowedSpeed - BASE_ZOMBIE_SPEED) * (1 - Math.exp(-0.06 * (wave - 1)))
 *    - Wave 1: 1.00 px/frame (37% player speed)
 *    - Wave 10: 1.59 px/frame (59% player speed)
 *    - Wave 20: 1.97 px/frame (73% player speed)
 *    - Wave Asimptot: -> 2.43 px/frame (< 90% player speed)
 * 
 * 3. Damage: Peningkatan persentase moderat (8% per wave):
 *    damage(wave) = Math.round(BASE_ZOMBIE_DAMAGE * (1 + 0.08 * (wave - 1)))
 *    - Wave 1: 8 dmg
 *    - Wave 10: 14 dmg
 *    - Wave 20: 20 dmg
 * ============================================================================
 */
export function calculateZombieStats(wave) {
  const maxAllowedSpeed = BASE_PLAYER_SPEED * 0.9;
  const speed =
    BASE_ZOMBIE_SPEED +
    (maxAllowedSpeed - BASE_ZOMBIE_SPEED) * (1 - Math.exp(-0.06 * (wave - 1)));

  const health = Math.round(BASE_ZOMBIE_HEALTH * Math.pow(1.08, wave - 1));
  const damage = Math.round(BASE_ZOMBIE_DAMAGE * (1 + 0.08 * (wave - 1)));

  return {
    health,
    speed,
    damage,
  };
}

/**
 * 5 Arketipe Musuh Standar + Normal Zombie
 */
export const ENEMIES = {
  normal: {
    id: "normal",
    name: "Zombie Biasa",
    hpMult: 1.0,
    speedMult: 1.0,
    damageMult: 1.0,
    size: 25,
    behavior: "chase",
    minWave: 1,
    weight: 50,
    cost: 5,
    color: "#4ade80",
    dropCoins: [2, 5],
  },
  runner: {
    id: "runner",
    name: "Runner Cepat",
    hpMult: 0.6,
    speedMult: 1.45,
    damageMult: 0.75,
    size: 22,
    behavior: "chase_fast",
    minWave: 2,
    weight: 35,
    cost: 8,
    color: "#fb923c",
    dropCoins: [3, 6],
  },
  brute: {
    id: "brute",
    name: "Brute Tank",
    hpMult: 2.8,
    speedMult: 0.65,
    damageMult: 1.8,
    size: 36,
    behavior: "tank",
    minWave: 3,
    weight: 20,
    cost: 20,
    color: "#a855f7",
    dropCoins: [8, 14],
  },
  spitter: {
    id: "spitter",
    name: "Spitter Ludah Asam",
    hpMult: 0.9,
    speedMult: 0.85,
    damageMult: 1.2,
    size: 26,
    behavior: "ranged_kite",
    shootRange: 260,
    spitCooldown: 3000,
    minWave: 2,
    weight: 25,
    cost: 14,
    color: "#84cc16",
    dropCoins: [4, 8],
  },
  exploder: {
    id: "exploder",
    name: "Exploder Mutan",
    hpMult: 0.8,
    speedMult: 1.1,
    damageMult: 1.0,
    size: 28,
    behavior: "exploder",
    explodeRadius: 80,
    explodeDamage: 45,
    minWave: 4,
    weight: 15,
    cost: 16,
    color: "#ef4444",
    dropCoins: [5, 10],
  },
  necromancer: {
    id: "necromancer",
    name: "Necromancer Wabah",
    hpMult: 1.6,
    speedMult: 0.75,
    damageMult: 1.0,
    size: 32,
    behavior: "summoner",
    summonCooldown: 6000,
    minWave: 5,
    weight: 10,
    cost: 30,
    color: "#06b6d4",
    dropCoins: [12, 20],
  },
};

/**
 * Data Boss Unik Kelipatan 3 Wave
 */
export const BOSSES = {
  3: {
    id: "brute_boss",
    name: "MUTASI BRUTE PRIMAL",
    sub: "Fase 1: Stun Meter | Fase 2: Teror Serudukan | Fase 3: Hantaman Gempa",
    hpMult: 6.5,
    speedMult: 0.85,
    damageMult: 1.6,
    size: 60,
    color: "#9333ea",
  },
  6: {
    id: "necro_boss",
    name: "PANGGILAN ABADI NECROMANCER",
    sub: "Fase 1: Stun Meter | Fase 2: Serudukan Beruntun | Fase 3: Amukan Jiwa AoE",
    hpMult: 7.5,
    speedMult: 0.9,
    damageMult: 1.8,
    size: 60,
    color: "#0891b2",
  },
  9: {
    id: "abomination",
    name: "ABOMINASI KARANTINA SEKTOR 0",
    sub: "Mutasi Puncak Sektor: Ketahanan, Daya Hancur, dan Kecepatan Ekstrem",
    hpMult: 9.0,
    speedMult: 0.95,
    damageMult: 2.2,
    size: 70,
    color: "#b91c1c",
  },
};

export function getBossDataForWave(wave) {
  if (BOSSES[wave]) return BOSSES[wave];
  // Rotasi untuk wave > 9
  const cycle = ((wave / 3 - 1) % 3) + 1;
  const baseBoss = BOSSES[cycle * 3] || BOSSES[9];
  return {
    ...baseBoss,
    name: `${baseBoss.name} TINGKAT ${Math.floor(wave / 9) + 1}`,
    hpMult: baseBoss.hpMult * (1 + 0.3 * Math.floor(wave / 9)),
    damageMult: baseBoss.damageMult * (1 + 0.2 * Math.floor(wave / 9)),
  };
}

export function calculateEnemyStats(enemyType, wave) {
  const base = calculateZombieStats(wave);
  const def = ENEMIES[enemyType] || ENEMIES.normal;

  return {
    health: Math.round(base.health * def.hpMult),
    speed: Math.min(BASE_PLAYER_SPEED * 0.9, base.speed * def.speedMult),
    damage: Math.round(base.damage * def.damageMult),
    size: def.size,
    color: def.color,
  };
}
