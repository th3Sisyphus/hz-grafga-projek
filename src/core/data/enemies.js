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
