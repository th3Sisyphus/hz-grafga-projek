import { BASE_ZOMBIE_HEALTH, BASE_ZOMBIE_SPEED } from "../core/Constants.js";
import { DamageNumber, BurnEffect, DeathEffect } from "./Effect.js";
import { ZombieSprite } from "../rendering/ZombieSprite.js";

export class Zombie {
  constructor(x, y, wave) {
    this.x = x;
    this.y = y;
    this.width = 25;
    this.height = 25;
    this.wave = wave;
    this.health = Math.floor(BASE_ZOMBIE_HEALTH + (wave - 1) * 1.2);
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
    this.detectionRadius = 250;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderTimer = 0;

    // Animation properties
    this.sprite = new ZombieSprite(false); // false = normal zombie
    this.facingRight = true;
    this.isAttacking = false;
    this.attackAnimationEnd = 0;
    this.lastX = x;
  }

  takeDamage(damage, isCritical = false, effects) {
    this.health -= damage;
    this.hitFlash = 5;
    effects.push(new DamageNumber(this.x, this.y, damage, isCritical));
    if (this.health <= 0) {
      effects.push(new DeathEffect(this.x, this.y));
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

// === ZOMBIE BOSS (New Class) ===
export class ZombieBoss extends Zombie {
  constructor(x, y, wave) {
    super(x, y, wave);
    // Visual: Lebih besar
    this.width = 60;
    this.height = 60;

    // Stats: Sangat tanky dan sakit
    this.health = this.health * 8; // Darah 8x lipat
    this.maxHealth = this.health;
    this.damage = this.damage * 1.5;

    // Speed: Boss biasanya sedikit lebih lambat
    this.speed = this.speed * 0.85;

    // AI: Jangkauan deteksi sangat luas
    this.detectionRadius = 500;

    // Ability: Hit Counter untuk Stun
    this.attackCount = 0;

    // Boss sprite
    this.sprite = new ZombieSprite(true); // true = boss zombie
  }
}
