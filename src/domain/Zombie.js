import { BASE_ZOMBIE_HEALTH, BASE_ZOMBIE_SPEED } from "../core/Constants.js";
import { DamageNumber, BurnEffect, DeathEffect } from "./Effect.js";

export class Zombie {
  constructor(x, y, wave) {
    this.x = x;
    this.y = y;
    this.width = 25;
    this.height = 25;
    this.wave = wave;
    this.health = BASE_ZOMBIE_HEALTH + (wave - 1) * 3;
    this.maxHealth = this.health;
    this.speed = BASE_ZOMBIE_SPEED + (wave - 1) * 0.1;
    this.damage = 5 + (wave - 1) * 2;
    this.lastAttack = 0;
    this.attackCooldown = 1000;
    this.hitFlash = 0;
    this.burning = false;
    this.burnEndTime = 0;
    this.burnDamage = 0;
    this.lastBurnTick = 0;
  }

  // Logic movement dipindahkan ke MovementSystem
  // Logic combat dipindahkan ke CombatSystem

  takeDamage(damage, isCritical = false, effects) {
    this.health -= damage;
    this.hitFlash = 5;

    effects.push(new DamageNumber(this.x, this.y, damage, isCritical));

    return this.health <= 0;
  }

  applyBurn(damage, duration) {
    this.burning = true;
    this.burnDamage = damage;
    this.burnEndTime = Date.now() + duration;
    this.lastBurnTick = Date.now();
  }
}
