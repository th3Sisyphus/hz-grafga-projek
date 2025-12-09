import { BASE_ZOMBIE_HEALTH, BASE_ZOMBIE_SPEED } from "../core/Constants.js";
import { DamageNumber, BurnEffect, DeathEffect } from "./Effect.js";

export class Zombie {
  constructor(x, y, wave) {
    this.x = x;
    this.y = y;
    this.width = 25;
    this.height = 25;
    this.wave = wave;

    // Health: Bertambah 1.2 poin per wave (Additive)
    // Wave 1 = 100
    // Wave 2 = 100 + 1.2 = 101.2 (dibulatkan jadi 101)
    // Wave 10 = 100 + 10.8 = 110.8 (dibulatkan jadi 110)
    // Note: Kenaikan ini sangat kecil.
    this.health = Math.floor(BASE_ZOMBIE_HEALTH + (wave - 1) * 1.2);
    this.maxHealth = this.health;

    // Speed: Bertambah 0.1 unit tiap wave
    this.speed = BASE_ZOMBIE_SPEED + (wave - 1) * 0.1;

    // Damage: Bertambah 2 tiap wave
    this.damage = 5 + (wave - 1) * 2;

    // --- STATE LAINNYA ---
    this.lastAttack = 0;
    this.attackCooldown = 1000;
    this.hitFlash = 0;
    this.burning = false;
    this.burnEndTime = 0;
    this.burnDamage = 0;
    this.lastBurnTick = 0;

    // AI STATE
    this.detectionRadius = 250;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderTimer = 0;
  }

  takeDamage(damage, isCritical = false, effects) {
    this.health -= damage;
    this.hitFlash = 5;
    effects.push(new DamageNumber(this.x, this.y, damage, isCritical));
    if (this.health <= 0) {
      effects.push(new DeathEffect(this.x, this.y, damage, isCritical));
      return true;
    }
    return false;
  }

  applyBurn(damage, duration) {
    this.burning = true;
    this.burnDamage = damage;
    this.burnEndTime = Date.now() + duration;
    this.lastBurnTick = Date.now();
  }
}
