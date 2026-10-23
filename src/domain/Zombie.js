import { calculateZombieStats } from "../core/Constants.js";
import { DamageNumber, DeathEffect } from "./Effect.js";
import { ZombieSprite } from "../rendering/ZombieSprite.js";

export class Zombie {
  constructor(x, y, wave) {
    this.type = "zombie";
    this.enemyType = "normal";
    this.isBoss = false;

    this.x = x;
    this.y = y;
    this.width = 25;
    this.height = 25;
    this.wave = wave;

    // Hitung stat zombie dari kurva persentase
    const stats = calculateZombieStats(wave);
    this.health = stats.health;
    this.maxHealth = stats.health;
    this.speed = stats.speed;
    this.damage = stats.damage;

    this.lastAttack = -99999;
    this.attackCooldown = 1000;
    this.hitFlash = 0;
    this.burning = false;
    this.burnEndTime = 0;
    this.burnDamage = 0;
    this.lastBurnTick = 0;
    this.detectionRadius = 260;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderTimer = 0;
    this.lastSpikeTime = -99999;

    // Sprite & Animation
    this.sprite = new ZombieSprite(false);
    this.facingRight = true;
    this.isAttacking = false;
    this.attackAnimationEnd = 0;
    this.lastX = x;
  }

  takeDamage(damage, isCritical = false, effects = []) {
    this.health -= damage;
    this.hitFlash = 5;

    // Batasi efek angka kerusakan agar tidak melebihi 300
    if (effects.length < 300) {
      effects.push(new DamageNumber(this.x, this.y, damage, isCritical));
    }

    if (this.health <= 0) {
      if (effects.length < 300) {
        effects.push(new DeathEffect(this.x, this.y));
      }
      return true;
    }
    return false;
  }

  applyBurn(damage, duration, gameTime = 0) {
    this.burning = true;
    this.burnDamage = damage;
    this.burnEndTime = gameTime + duration;
    this.lastBurnTick = gameTime;
  }
}

// === ZOMBIE BOSS ===
export class ZombieBoss extends Zombie {
  constructor(x, y, wave) {
    super(x, y, wave);
    this.type = "zombie_boss";
    this.enemyType = "boss";
    this.isBoss = true;

    this.width = 60;
    this.height = 60;

    // Stats Boss: Sangat tangguh dan jangkauan deteksi luas
    const stats = calculateZombieStats(wave);
    this.health = stats.health * 6;
    this.maxHealth = this.health;
    this.damage = Math.round(stats.damage * 1.5);
    this.speed = stats.speed * 0.85;

    this.detectionRadius = 500;
    this.attackCount = 0;

    this.sprite = new ZombieSprite(true);
  }
}
