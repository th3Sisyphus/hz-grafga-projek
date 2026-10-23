import {
  ExplosionEffect,
  BurnEffect,
  DeathEffect,
  DamageNumber,
  HealEffect,
} from "../domain/Effect.js";
import {
  TILE_SIZE,
  TILES,
  SPIKE_DAMAGE,
  SPIKE_TICK_INTERVAL,
} from "../core/Constants.js";
import { Pickup } from "../domain/Pickup.js";
import { DROP_RATES } from "../core/data/items.js";

export class CombatSystem {
  constructor(context) {
    this.context = context;
  }

  applyDamage(entity, damage, isCritical = false) {
    const isDead = entity.takeDamage(
      damage,
      isCritical,
      this.context.effects,
      this.context
    );

    // Update real stats
    if (entity.type === "player") {
      this.context.stats.damageTaken += damage;
    } else if (entity.type === "zombie" || entity.type === "zombie_boss") {
      this.context.stats.damageDealt += damage;
    }

    if (isDead) {
      if (entity.type === "zombie" || entity.type === "zombie_boss") {
        this.killZombie(entity);
      } else if (entity.type === "player") {
        if (this.context.effects.length < 300) {
          this.context.effects.push(new DeathEffect(entity.x, entity.y));
        }
        this.context.gameOver();
      }
    }
  }

  checkSpikeHazards() {
    const { player, zombies, tilemap, time } = this.context;
    if (!tilemap) return;

    const checkEntity = (ent) => {
      if (!ent || ent.health <= 0) return;
      const tx = Math.floor(ent.x / TILE_SIZE);
      const ty = Math.floor(ent.y / TILE_SIZE);

      if (tilemap[ty] && tilemap[ty][tx] === TILES.SPIKE) {
        if (time - (ent.lastSpikeTime || 0) >= SPIKE_TICK_INTERVAL) {
          ent.lastSpikeTime = time;
          this.applyDamage(ent, SPIKE_DAMAGE, false);
        }
      }
    };

    if (player) checkEntity(player);
    for (let i = 0; i < zombies.length; i++) {
      checkEntity(zombies[i]);
    }
  }

  checkZombieAttack(dtNormal = 1) {
    const { player, zombies, time } = this.context;
    if (!player) return;

    // 1. Update StatusEffects pada Player
    if (player.status) {
      player.status.update(this, time);
    }

    for (let i = 0; i < zombies.length; i++) {
      const zombie = zombies[i];
      if (zombie.health <= 0) continue;

      // 2. Update StatusEffects pada Zombie
      if (zombie.status) {
        zombie.status.update(this, time);
      }

      // 3. Update aksi & telegraf khusus musuh (Spitter, Necromancer, Boss)
      if (typeof zombie.updateSpecialBehaviors === "function") {
        zombie.updateSpecialBehaviors(this.context, dtNormal);
      }

      const dist = Math.hypot(player.x - zombie.x, player.y - zombie.y);

      // Jangkauan serangan: Boss (50) lebih luas dari Zombie biasa (30)
      const attackRange = zombie.isBoss ? 50 : 30;

      if (dist < attackRange) {
        if (time - zombie.lastAttack > zombie.attackCooldown) {
          // Berikan damage ke player
          this.applyDamage(player, zombie.damage);
          zombie.lastAttack = time;

          // Ability Boss: Stun setiap 4 pukulan di Fase 1
          if (zombie.isBoss && zombie.phase === 1) {
            zombie.attackCount = (zombie.attackCount || 0) + 1;

            if (zombie.attackCount >= 4) {
              player.applyStun(2000, time);
              zombie.attackCount = 0;

              if (this.context.effects.length < 300) {
                this.context.effects.push(
                  new DamageNumber(player.x, player.y - 40, "STUNNED!", true)
                );
              }
            }
          }
        }
      }
    }
  }

  killZombie(zombie) {
    const index = this.context.zombies.indexOf(zombie);
    if (index > -1) {
      this.context.zombies.splice(index, 1);
      const scoreReward = zombie.isBoss
        ? this.context.wave * 10
        : this.context.wave;
      this.context.score += scoreReward;
      this.context.zombiesKilled++;
      this.context.stats.kills++;

      // Drop koin, medkit, ammo, power-up
      this.spawnDrops(zombie);
    }
  }

  spawnDrops(zombie) {
    const { time, pickups } = this.context;
    if (!pickups) return;

    // 1. Koin (nilai menurut tipe zombie)
    if (zombie.isBoss) {
      for (let i = 0; i < 3; i++) {
        pickups.push(new Pickup(zombie.x, zombie.y, "coin", 10, time));
      }
    } else {
      const dropRange = zombie.definition?.dropCoins || [2, 5];
      const coinVal =
        Math.floor(Math.random() * (dropRange[1] - dropRange[0] + 1)) +
        dropRange[0];
      pickups.push(new Pickup(zombie.x, zombie.y, "coin", coinVal, time));
    }

    // 2. Medkit (~8%)
    if (Math.random() < DROP_RATES.medkitChance) {
      pickups.push(new Pickup(zombie.x, zombie.y, "medkit", 40, time));
    }

    // 3. Ammo (~15%)
    if (Math.random() < DROP_RATES.ammoChance) {
      pickups.push(new Pickup(zombie.x, zombie.y, "ammo", 30, time));
    }

    // 4. Power-up sementara (~3%): damage x2, speed, magnet, freeze
    if (
      Math.random() < DROP_RATES.powerupChance ||
      (zombie.isBoss && Math.random() < 0.5)
    ) {
      const keys = ["double_damage", "speed_boost", "magnet", "freeze"];
      const chosen = keys[Math.floor(Math.random() * keys.length)];
      pickups.push(new Pickup(zombie.x, zombie.y, "powerup", 0, time, chosen));
    }
  }

  updateProjectiles(dtNormal = 1) {
    const activeProjectiles = [];
    const { zombies, projectiles, effects, player } = this.context;

    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];
      const isAlive = p.update(this.context, dtNormal);
      if (!isAlive) continue;

      // 1. Proyektil Musuh (Spitter dll)
      if (p.type === "enemy_projectile") {
        if (player && player.health > 0) {
          const dist = Math.hypot(player.x - p.x, player.y - p.y);
          if (dist < 22) {
            this.applyDamage(player, p.damage, false);
            if (p.effectType === "poison") {
              player.status?.apply("poison", 3000, 8, this.context.time);
            }
            p.hit = true;
            continue;
          }
        }
        activeProjectiles.push(p);
        continue;
      }

      // 2. Proyektil Pemain Menghantam Zombie
      let hitZombie = null;
      for (let j = 0; j < zombies.length; j++) {
        const zombie = zombies[j];
        const dist = Math.hypot(zombie.x - p.x, zombie.y - p.y);
        const hitRadius = zombie.isBoss ? 50 : 30;
        if (dist < hitRadius) {
          hitZombie = zombie;
          break;
        }
      }

      if (hitZombie) {
        this.context.stats.hits++;
        const critChance =
          player?.effectiveCritChance ?? p.weapon.critChance ?? 0.1;
        const isCritical = Math.random() < critChance;
        const critMult =
          player?.effectiveCritMult ?? p.weapon.criticalMultiplier ?? 1.5;
        let baseDmg = p.damage || p.weapon.damage;
        if (this.context.activePowerups?.double_damage > this.context.time) {
          baseDmg *= 2;
        }
        const damage = baseDmg * (isCritical ? critMult : 1);

        this.applyDamage(hitZombie, damage, isCritical);

        // Knockback dari proyektil
        const kbMult = player?.knockbackMultiplier || 1.0;
        const kbDist = 10 * kbMult;
        hitZombie.x += Math.cos(p.angle) * kbDist;
        hitZombie.y += Math.sin(p.angle) * kbDist;

        if (p.weapon.name === "Wizard Book") {
          hitZombie.status?.apply(
            "burn",
            p.weapon.dotDuration,
            p.weapon.dotDamage,
            this.context.time
          );
          if (effects.length < 300) {
            effects.push(new BurnEffect(hitZombie.x, hitZombie.y));
          }
        } else if (p.weapon.name === "Dual Gun") {
          const aoeRad = p.aoeRadius || p.weapon.aoeRadius;
          this.handleExplosion(hitZombie, damage, aoeRad);
        }

        // Penetrasi (Pierce)
        p.pierceCount = (p.pierceCount || 0) + 1;
        if (p.pierceCount <= (p.pierce || 0)) {
          // Masih bisa menembus zombie berikutnya
          activeProjectiles.push(p);
        } else {
          p.hit = true;
        }
      } else {
        activeProjectiles.push(p);
      }
    }
    this.context.projectiles = activeProjectiles;
  }

  handleExplosion(centerZombie, baseDamage, aoeRadius) {
    if (this.context.effects.length < 300) {
      this.context.effects.push(
        new ExplosionEffect(centerZombie.x, centerZombie.y, aoeRadius)
      );
    }
    for (let i = 0; i < this.context.zombies.length; i++) {
      const otherZombie = this.context.zombies[i];
      const aoeDist = Math.hypot(
        otherZombie.x - centerZombie.x,
        otherZombie.y - centerZombie.y
      );
      if (aoeDist < aoeRadius) {
        this.applyDamage(otherZombie, baseDamage * 0.7);
      }
    }
  }

  handleMeleeAttack(player) {
    const { zombies } = this.context;
    const weapon = player.weapon;
    const range = weapon.range;
    const arc = weapon.arc !== undefined ? weapon.arc : 1.0;

    let hitAnyZombie = false;

    for (let i = 0; i < zombies.length; i++) {
      const zombie = zombies[i];
      const dist = Math.hypot(zombie.x - player.x, zombie.y - player.y);

      if (dist <= range + zombie.width / 2) {
        const angleToZombie = Math.atan2(
          zombie.y - player.y,
          zombie.x - player.x
        );
        let angleDiff = angleToZombie - player.direction;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (Math.abs(angleDiff) <= arc) {
          this.context.stats.hits++;
          const critChance =
            player.effectiveCritChance !== undefined
              ? player.effectiveCritChance
              : weapon.critChance || 0.2;
          const isCritical = Math.random() < critChance;
          const critMult =
            player.effectiveCritMult !== undefined
              ? player.effectiveCritMult
              : weapon.criticalMultiplier || 1.5;
          let baseDmg = player.effectiveDamage || weapon.damage;
          if (this.context.activePowerups?.double_damage > this.context.time) {
            baseDmg *= 2;
          }
          const damage = baseDmg * (isCritical ? critMult : 1);

          this.applyDamage(zombie, damage, isCritical);
          hitAnyZombie = true;

          // Knockback
          const kbMult = player.knockbackMultiplier || 1.0;
          const kbDist = 14 * kbMult;
          const kbAngle = Math.atan2(zombie.y - player.y, zombie.x - player.x);
          zombie.x += Math.cos(kbAngle) * kbDist;
          zombie.y += Math.sin(kbAngle) * kbDist;

          // Lifesteal
          const lifestealRate =
            player.effectiveLifesteal !== undefined
              ? player.effectiveLifesteal
              : weapon.lifesteal || 0;
          if (lifestealRate > 0) {
            const healAmount = Math.floor(damage * lifestealRate);
            if (healAmount >= 1) {
              player.heal(healAmount);
              if (this.context.effects.length < 300) {
                this.context.effects.push(
                  new HealEffect(player.x, player.y - 30, healAmount)
                );
              }
            }
          }
        }
      }
    }

    if (hitAnyZombie) {
      this.context.soundManager.playWeaponSound(weapon.name, true);
    }
  }

  updatePickups(dtNormal = 1) {
    if (!this.context.pickups) return;
    this.context.pickups = this.context.pickups.filter((p) =>
      p.update(this.context, dtNormal)
    );
  }

  update(dtNormal = 1) {
    this.updateProjectiles(dtNormal);
    this.checkZombieAttack(dtNormal);
    this.checkSpikeHazards();
    this.updatePickups(dtNormal);
  }
}
