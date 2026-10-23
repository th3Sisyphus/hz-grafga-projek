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

export class CombatSystem {
  constructor(context) {
    this.context = context;
  }

  applyDamage(entity, damage, isCritical = false) {
    const isDead = entity.takeDamage(damage, isCritical, this.context.effects);

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

  checkZombieAttack() {
    const { player, zombies, time } = this.context;
    if (!player) return;

    for (let i = 0; i < zombies.length; i++) {
      const zombie = zombies[i];
      const dist = Math.hypot(player.x - zombie.x, player.y - zombie.y);

      // Jangkauan serangan: Boss (50) lebih luas dari Zombie biasa (30)
      const attackRange = zombie.isBoss ? 50 : 30;

      if (dist < attackRange) {
        if (time - zombie.lastAttack > zombie.attackCooldown) {
          // 1. Berikan damage ke player
          this.applyDamage(player, zombie.damage);
          zombie.lastAttack = time;

          // 2. Ability Boss: Stun setiap 4 pukulan
          if (zombie.isBoss) {
            zombie.attackCount++;

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

      // Handle Burn DOT menggunakan game clock
      if (zombie.burning && time < zombie.burnEndTime) {
        if (time - zombie.lastBurnTick > 500) {
          this.applyDamage(zombie, zombie.burnDamage, false);
          zombie.lastBurnTick = time;
          if (this.context.effects.length < 300) {
            this.context.effects.push(new BurnEffect(zombie.x, zombie.y));
          }
        }
      } else {
        zombie.burning = false;
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
    }
  }

  updateProjectiles(dtNormal = 1) {
    const activeProjectiles = [];
    const { zombies, projectiles, effects } = this.context;

    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];
      const isAlive = p.update(this.context, dtNormal);
      if (!isAlive) continue;

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
        const isCritical = Math.random() < (p.weapon.critChance || 0.1);
        const damage =
          p.weapon.damage * (isCritical ? (p.weapon.criticalMultiplier || 1.5) : 1);
        this.applyDamage(hitZombie, damage, isCritical);

        if (p.weapon.name === "Wizard Book") {
          hitZombie.applyBurn(p.weapon.dotDamage, p.weapon.dotDuration, this.context.time);
          if (effects.length < 300) {
            effects.push(new BurnEffect(hitZombie.x, hitZombie.y));
          }
        } else if (p.weapon.name === "Dual Gun") {
          this.handleExplosion(hitZombie, p.weapon);
        }
      } else {
        activeProjectiles.push(p);
      }
    }
    this.context.projectiles = activeProjectiles;
  }

  handleExplosion(centerZombie, weapon) {
    if (this.context.effects.length < 300) {
      this.context.effects.push(
        new ExplosionEffect(centerZombie.x, centerZombie.y, weapon.aoeRadius)
      );
    }
    for (let i = 0; i < this.context.zombies.length; i++) {
      const otherZombie = this.context.zombies[i];
      const aoeDist = Math.hypot(
        otherZombie.x - centerZombie.x,
        otherZombie.y - centerZombie.y
      );
      if (aoeDist < weapon.aoeRadius) {
        this.applyDamage(otherZombie, weapon.damage * 0.7);
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

        // Validasi kerucut melee memakai field arc dari data senjata!
        if (Math.abs(angleDiff) <= arc) {
          this.context.stats.hits++;
          const critChance = weapon.critChance || 0.2;
          const isCritical = Math.random() < critChance;
          const damage =
            weapon.damage * (isCritical ? weapon.criticalMultiplier : 1);

          this.applyDamage(zombie, damage, isCritical);
          hitAnyZombie = true;

          // Lifesteal
          if (weapon.lifesteal && weapon.lifesteal > 0) {
            const healAmount = Math.floor(damage * weapon.lifesteal);
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

  update(dtNormal = 1) {
    this.updateProjectiles(dtNormal);
    this.checkZombieAttack();
    this.checkSpikeHazards();
  }
}
