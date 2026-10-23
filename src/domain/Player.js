import {
  WEAPONS,
  BASE_PLAYER_HEALTH,
  BASE_PLAYER_SPEED,
} from "../core/Constants.js";
import { MeleeEffect } from "./Effect.js";
import { Projectile } from "./Projectile.js";

export class Player {
  constructor(x, y) {
    this.type = "player";
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;

    // Stat Dasar
    this.baseMaxHealth = BASE_PLAYER_HEALTH;
    this.maxHealth = BASE_PLAYER_HEALTH;
    this.health = BASE_PLAYER_HEALTH;
    this.baseSpeed = BASE_PLAYER_SPEED;
    this.speed = BASE_PLAYER_SPEED;

    this.weapon = null;
    this.weaponKey = null;

    // Modifier Stack
    this.modifiers = [];

    // Nilai Efektif yang Dihitung Ulang dari Modifiers
    this.effectiveDamage = 0;
    this.effectiveCooldown = 400;
    this.effectiveLifesteal = 0;
    this.effectiveCritChance = 0.2;
    this.effectiveCritMult = 2.0;
    this.effectiveAoeRadius = 0;
    this.pierce = 0;
    this.extraProjectiles = 0;
    this.knockbackMultiplier = 1.0;
    this.waveRegenPercent = 0.20; // 20% default pemulihan antar wave

    this.lastAttack = -99999;
    this.hitFlash = 0;
    this.direction = 0;
    this.stunEndTime = 0;
    this.isStunned = false;
    this.lastFootstepTime = -99999;
    this.footstepInterval = 500;
    this.lastSpikeTime = -99999;
  }

  setWeapon(weaponKey) {
    this.weaponKey = weaponKey;
    this.weapon = WEAPONS[weaponKey];
    this.recalculateStats();
  }

  addModifier(upgrade) {
    if (!upgrade) return;
    this.modifiers.push(upgrade);
    this.recalculateStats();
  }

  recalculateStats() {
    if (!this.weapon) return;

    // Stat Dasar
    let maxHpBonus = 0;
    let speedMult = 1.0;
    let damageMult = 1.0;
    let attackSpeedMult = 0;
    let lifestealBonus = 0;
    let critChanceBonus = 0;
    let critMultBonus = 0;
    let aoeMult = 1.0;
    let pierceBonus = 0;
    let multiShotBonus = 0;
    let knockbackMult = 1.0;
    let waveRegenBonus = 0;

    // Akumulasi seluruh Modifier Stack
    for (let i = 0; i < this.modifiers.length; i++) {
      const mod = this.modifiers[i].modifier;
      if (!mod) continue;

      switch (mod.type) {
        case "percent_damage":
          damageMult += mod.value;
          break;
        case "percent_speed":
          speedMult += mod.value;
          break;
        case "percent_attack_speed":
          attackSpeedMult += mod.value;
          break;
        case "flat_hp":
          maxHpBonus += mod.value;
          break;
        case "flat_lifesteal":
          lifestealBonus += mod.value;
          break;
        case "flat_crit_chance":
          critChanceBonus += mod.value;
          break;
        case "flat_crit_mult":
          critMultBonus += mod.value;
          break;
        case "flat_pierce":
          pierceBonus += mod.value;
          break;
        case "flat_multi_shot":
          multiShotBonus += mod.value;
          break;
        case "percent_knockback":
          knockbackMult += mod.value;
          break;
        case "percent_aoe":
          aoeMult += mod.value;
          break;
        case "flat_wave_regen":
          waveRegenBonus += mod.value;
          break;
      }
    }

    // Terapkan hasil rekalkulasi
    const prevMaxHp = this.maxHealth;
    this.maxHealth = this.baseMaxHealth + maxHpBonus;
    if (this.maxHealth > prevMaxHp) {
      this.health += this.maxHealth - prevMaxHp; // HP saat ini ikut bertambah saat max HP naik
    }

    const baseWeaponSpeed = BASE_PLAYER_SPEED + (this.weapon.speedBonus || 0);
    this.speed = baseWeaponSpeed * speedMult;

    this.effectiveDamage = Math.round(this.weapon.damage * damageMult);
    this.effectiveCooldown = Math.max(
      120,
      Math.round(this.weapon.cooldown * (1 / (1 + attackSpeedMult)))
    );
    this.effectiveLifesteal = (this.weapon.lifesteal || 0) + lifestealBonus;
    this.effectiveCritChance = (this.weapon.critChance || 0.15) + critChanceBonus;
    this.effectiveCritMult =
      (this.weapon.criticalMultiplier || 1.5) + critMultBonus;
    this.effectiveAoeRadius = Math.round(
      (this.weapon.aoeRadius || 0) * aoeMult
    );
    this.pierce = pierceBonus;
    this.extraProjectiles = multiShotBonus;
    this.knockbackMultiplier = knockbackMult;
    this.waveRegenPercent = 0.20 + waveRegenBonus;
  }

  takeDamage(damage) {
    this.health -= damage;
    this.hitFlash = 10;
    return this.health <= 0;
  }

  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  update(gameTime) {
    this.isStunned = gameTime < this.stunEndTime;
  }

  applyStun(duration, gameTime = 0) {
    this.stunEndTime = gameTime + duration;
    this.isStunned = true;
  }

  updateAim(mousePos, camera) {
    if (this.isStunned) return;

    const dx = mousePos.x + camera.x - this.x;
    const dy = mousePos.y + camera.y - this.y;
    this.direction = Math.atan2(dy, dx);
  }

  attemptAttack(mousePos, camera, projectiles, effects, gameTime = 0) {
    if (this.isStunned) return false;

    if (gameTime - this.lastAttack < this.effectiveCooldown) return false;
    this.lastAttack = gameTime;

    this.updateAim(mousePos, camera);

    if (this.weapon.type === "melee") {
      effects.push(
        new MeleeEffect(
          this.x,
          this.y,
          this.direction,
          this.weapon.name,
          this.weapon.arc || 1.0
        )
      );
    } else {
      // Spawn proyektil utama
      const p = new Projectile(this.x, this.y, this.direction, this.weapon);
      p.damage = this.effectiveDamage;
      p.pierce = this.pierce;
      p.aoeRadius = this.effectiveAoeRadius || this.weapon.aoeRadius;
      projectiles.push(p);

      // Spawn proyektil tambahan jika ada modifier multi-shot
      if (this.extraProjectiles > 0) {
        for (let i = 1; i <= this.extraProjectiles; i++) {
          const spread = 0.14 * i;
          const p1 = new Projectile(
            this.x,
            this.y,
            this.direction + spread,
            this.weapon
          );
          p1.damage = this.effectiveDamage;
          p1.pierce = this.pierce;
          p1.aoeRadius = this.effectiveAoeRadius || this.weapon.aoeRadius;
          projectiles.push(p1);

          const p2 = new Projectile(
            this.x,
            this.y,
            this.direction - spread,
            this.weapon
          );
          p2.damage = this.effectiveDamage;
          p2.pierce = this.pierce;
          p2.aoeRadius = this.effectiveAoeRadius || this.weapon.aoeRadius;
          projectiles.push(p2);
        }
      }
    }

    return true;
  }
}
