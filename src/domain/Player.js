import {
  WEAPONS,
  BASE_PLAYER_HEALTH,
  BASE_PLAYER_SPEED,
} from "../core/Constants.js";
import { MeleeEffect } from "./Effect.js";
import { Projectile } from "./Projectile.js";
import { StatusEffects } from "./StatusEffects.js";
import { CHARACTERS } from "../core/data/characters.js";

export class Player {
  constructor(x, y) {
    this.type = "player";
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;

    // Sistem Status Effects terpadu
    this.status = new StatusEffects(this);

    // Karakter Default
    this.characterKey = "scout";
    this.character = CHARACTERS.scout;

    // Stat Dasar
    this.baseMaxHealth = BASE_PLAYER_HEALTH;
    this.maxHealth = BASE_PLAYER_HEALTH;
    this.health = BASE_PLAYER_HEALTH;
    this.baseSpeed = BASE_PLAYER_SPEED;
    this.speed = BASE_PLAYER_SPEED;

    // Sistem Dua Slot Senjata
    this.primaryWeaponKey = "katana";
    this.secondaryWeaponKey = "dualgun";
    this.activeSlot = 1;
    this.weapon = null;
    this.weaponKey = null;

    // Magazine & Reload untuk Senjata Tembak
    this.magazine = 0;
    this.isReloading = false;
    this.reloadEndTime = 0;

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
    this.waveRegenPercent = 0.2; // 20% default pemulihan antar wave

    // Logistik Toko & Pertahanan
    this.armorReduction = 0; // Maksimal 0.60 (60%)
    this.ammo = 80;
    this.maxAmmo = 250;
    this.weaponTuningBonus = 0; // +15% per upgrade tuning

    // Skill Aktif & i-frame
    this.lastSkillTime = -99999;
    this.isDashing = false;
    this.dashEndTime = 0;
    this.isInvincible = false;
    this.invincibleEndTime = 0;

    this.lastAttack = -99999;
    this.hitFlash = 0;
    this.direction = 0;
    this.stunEndTime = 0;
    this.isStunned = false;
    this.lastFootstepTime = -99999;
    this.footstepInterval = 500;
    this.lastSpikeTime = -99999;
  }

  setCharacter(charKey) {
    const char = CHARACTERS[charKey] || CHARACTERS.scout;
    this.characterKey = charKey;
    this.character = char;

    this.baseMaxHealth = char.health;
    this.maxHealth = char.health;
    this.health = char.health;
    this.baseSpeed = char.speed;
    this.speed = char.speed;
    this.armorReduction = char.armor || 0;

    this.primaryWeaponKey = char.defaultWeapon || "katana";
    this.secondaryWeaponKey = char.secondWeapon || "dualgun";
    this.activeSlot = 1;
    this.setWeapon(this.primaryWeaponKey);
  }

  setWeapon(weaponKey) {
    this.weaponKey = weaponKey;
    this.weapon = WEAPONS[weaponKey] || WEAPONS.katana;
    this.magazine = this.weapon.hasAmmo ? this.weapon.maxMag : Infinity;
    this.isReloading = false;
    this.recalculateStats();
  }

  swapWeapon() {
    this.activeSlot = this.activeSlot === 1 ? 2 : 1;
    const targetKey =
      this.activeSlot === 1 ? this.primaryWeaponKey : this.secondaryWeaponKey;
    this.setWeapon(targetKey);
    return true;
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
    let lifestealBonus = this.character?.lifestealBonus || 0;
    let critChanceBonus = this.character?.critBonus || 0;
    let critMultBonus = 0;
    let aoeMult = 1.0;
    let pierceBonus = this.weapon.pierce || 0;
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
      this.health += this.maxHealth - prevMaxHp;
    }

    const baseWeaponSpeed =
      (this.character?.speed || BASE_PLAYER_SPEED) +
      (this.weapon.speedBonus || 0);
    this.speed = baseWeaponSpeed * speedMult;

    this.effectiveDamage = Math.round(
      this.weapon.damage * damageMult * (1 + (this.weaponTuningBonus || 0))
    );
    this.effectiveCooldown = Math.max(
      80,
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
    this.waveRegenPercent = 0.2 + waveRegenBonus;
  }

  takeDamage(damage) {
    // Kebal jika i-frame aktif
    if (this.isInvincible) {
      return false;
    }

    // Reduksi kerusakan dari Rompi Balistik & Armor Karakter (maksimal 60%)
    const reduction = Math.min(0.6, this.armorReduction || 0);
    const actualDamage = Math.max(1, Math.round(damage * (1 - reduction)));
    this.health -= actualDamage;
    this.hitFlash = 10;
    return this.health <= 0;
  }

  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  addAmmo(amount) {
    this.ammo = Math.min(this.maxAmmo, (this.ammo || 0) + amount);
  }

  startReload(gameTime) {
    if (
      !this.weapon.hasAmmo ||
      this.isReloading ||
      this.magazine >= this.weapon.maxMag ||
      this.ammo <= 0
    ) {
      return false;
    }
    this.isReloading = true;
    this.reloadEndTime = gameTime + this.weapon.reloadTime;
    return true;
  }

  triggerSkill(context) {
    const time = context.time;
    const skill = this.character?.skill;
    if (!skill) return false;

    if (time - this.lastSkillTime < skill.cooldown) {
      return false; // Sedang cooldown
    }

    this.lastSkillTime = time;

    switch (skill.id) {
      case "dash":
        // Tactical Dash: i-frame 450ms dan lesatan cepat
        this.isDashing = true;
        this.dashEndTime = time + skill.duration;
        this.isInvincible = true;
        this.invincibleEndTime = time + skill.duration;
        break;

      case "fortress":
        // Benteng Baja: Invincible 2.2 detik + gelombang tolak zombie
        this.isInvincible = true;
        this.invincibleEndTime = time + skill.duration;
        if (context && context.zombies) {
          for (let i = 0; i < context.zombies.length; i++) {
            const z = context.zombies[i];
            const dist = Math.hypot(z.x - this.x, z.y - this.y);
            if (dist < (skill.knockbackRadius || 120)) {
              const angle = Math.atan2(z.y - this.y, z.x - this.x);
              z.x += Math.cos(angle) * 40;
              z.y += Math.sin(angle) * 40;
            }
          }
        }
        break;

      case "frost_nova":
        // Frost Nova: Membekukan seluruh zombie dalam radius 200px selama 3.5s
        if (context && context.zombies) {
          for (let i = 0; i < context.zombies.length; i++) {
            const z = context.zombies[i];
            const dist = Math.hypot(z.x - this.x, z.y - this.y);
            if (dist <= (skill.radius || 200)) {
              z.status?.apply("freeze", skill.duration || 3500, 0.2, time);
            }
          }
        }
        break;
    }

    return true;
  }

  update(gameTime) {
    this.isStunned = gameTime < this.stunEndTime;
    this.isInvincible = gameTime < this.invincibleEndTime;
    this.isDashing = gameTime < this.dashEndTime;

    // Selesaikan Reload
    if (this.isReloading && gameTime >= this.reloadEndTime) {
      const needed = (this.weapon.maxMag || 0) - this.magazine;
      const reloaded = Math.min(needed, this.ammo);
      this.magazine += reloaded;
      this.ammo -= reloaded;
      this.isReloading = false;
    }
  }

  applyStun(duration, gameTime = 0) {
    if (this.isInvincible) return;
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

    // Cek amunisi senjata tembak
    if (this.weapon.hasAmmo) {
      if (this.isReloading) return false;
      if (this.magazine <= 0) {
        this.startReload(gameTime);
        return false;
      }
    }

    if (gameTime - this.lastAttack < this.effectiveCooldown) return false;
    this.lastAttack = gameTime;

    // Kurangi amunisi jika ada
    if (this.weapon.hasAmmo) {
      this.magazine--;
      if (this.magazine <= 0 && this.ammo > 0) {
        this.startReload(gameTime);
      }
    }

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
      const pellets = this.weapon.pellets || 1;
      const spread = this.weapon.spread || 0.12;

      // Spawn proyektil (Shotgun 5 pellets, lainnya 1 pellet)
      for (let pIdx = 0; pIdx < pellets; pIdx++) {
        let angle = this.direction;
        if (pellets > 1) {
          angle += (pIdx - (pellets - 1) / 2) * spread;
        }

        const p = new Projectile(this.x, this.y, angle, this.weapon);
        p.damage = this.effectiveDamage;
        p.pierce = this.pierce;
        p.aoeRadius = this.effectiveAoeRadius || this.weapon.aoeRadius;
        if (this.weapon.id === "sniper") p.speed = 14;
        projectiles.push(p);
      }

      // Proyektil tambahan dari modifier multi-shot
      if (this.extraProjectiles > 0) {
        for (let i = 1; i <= this.extraProjectiles; i++) {
          const s = 0.14 * i;
          const p1 = new Projectile(
            this.x,
            this.y,
            this.direction + s,
            this.weapon
          );
          p1.damage = this.effectiveDamage;
          p1.pierce = this.pierce;
          projectiles.push(p1);

          const p2 = new Projectile(
            this.x,
            this.y,
            this.direction - s,
            this.weapon
          );
          p2.damage = this.effectiveDamage;
          p2.pierce = this.pierce;
          projectiles.push(p2);
        }
      }
    }

    return true;
  }
}
