import {
  ExplosionEffect,
  BurnEffect,
  DeathEffect,
  DamageNumber,
  HealEffect,
} from "../domain/Effect.js";

export class CombatSystem {
  constructor(context) {
    this.context = context;
  }

  applyDamage(entity, damage, isCritical = false) {
    const isDead = entity.takeDamage(damage, isCritical, this.context.effects);
    if (isDead) {
      if (
        entity.constructor.name === "Zombie" ||
        entity.constructor.name === "ZombieBoss"
      ) {
        this.killZombie(entity);
      } else if (entity.constructor.name === "Player") {
        this.context.effects.push(new DeathEffect(entity.x, entity.y));
        this.context.gameOver();
      }
    }
  }

  checkZombieAttack() {
    const { player, zombies } = this.context;
    if (!player) return;

    const now = Date.now();
    for (let zombie of zombies) {
      const dist = Math.hypot(player.x - zombie.x, player.y - zombie.y);

      // Jangkauan serangan: Boss (50) lebih luas dari Zombie biasa (30)
      const attackRange = zombie.constructor.name === "ZombieBoss" ? 50 : 30;

      if (dist < attackRange) {
        if (now - zombie.lastAttack > zombie.attackCooldown) {
          // 1. Berikan damage ke player
          this.applyDamage(player, zombie.damage);
          zombie.lastAttack = now;

          // 2. LOGIKA BOSS ABILITY: STUN
          if (zombie.constructor.name === "ZombieBoss") {
            zombie.attackCount++;

            // Jika sudah memukul 3 kali sebelumnya, pukulan ke-4 ini memberi STUN
            if (zombie.attackCount >= 4) {
              player.applyStun(2000); // Stun selama 2 detik (2000ms)
              zombie.attackCount = 0; // Reset counter

              // Visual Text feedback
              this.context.effects.push(
                new DamageNumber(player.x, player.y - 40, "STUNNED!", true)
              );
            }
          }
        }
      }

      // Handle Burn DOT
      if (zombie.burning && now < zombie.burnEndTime) {
        if (now - zombie.lastBurnTick > 500) {
          this.applyDamage(zombie, zombie.burnDamage, false);
          zombie.lastBurnTick = now;
          this.context.effects.push(new BurnEffect(zombie.x, zombie.y));
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
      // Boss memberikan score lebih banyak
      const scoreReward =
        zombie.constructor.name === "ZombieBoss"
          ? this.context.wave * 10
          : this.context.wave;
      this.context.score += scoreReward;
      this.context.zombiesKilled++;
    }
  }

  // ... (Sisa method tidak berubah: checkPlayerMeleeAttack, updateProjectiles, handleExplosion, dll)

  checkPlayerMeleeAttack() {
    const { player } = this.context;
    if (!player || player.weapon.type !== "melee") return;
  }

  updateProjectiles() {
    const activeProjectiles = [];
    const { zombies, projectiles, effects, player } = this.context;

    for (let p of projectiles) {
      const isAlive = p.update(this.context);
      if (!isAlive) continue;

      let hitZombie = null;
      for (let zombie of zombies) {
        const dist = Math.hypot(zombie.x - p.x, zombie.y - p.y);
        // Hitbox projectile juga disesuaikan untuk Boss
        const hitRadius = zombie.constructor.name === "ZombieBoss" ? 50 : 30;
        if (dist < hitRadius) {
          hitZombie = zombie;
          break;
        }
      }

      if (hitZombie) {
        this.applyDamage(hitZombie, p.weapon.damage);
        if (p.weapon.name === "Wizard Book") {
          hitZombie.applyBurn(p.weapon.dotDamage, p.weapon.dotDuration);
          effects.push(new BurnEffect(hitZombie.x, hitZombie.y));
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
    this.context.effects.push(
      new ExplosionEffect(centerZombie.x, centerZombie.y, weapon.aoeRadius)
    );
    for (let otherZombie of this.context.zombies) {
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

    let hitAnyZombie = false; // Track apakah ada zombie yang kena

    for (let zombie of zombies) {
      const dist = Math.hypot(zombie.x - player.x, zombie.y - player.y);
      // Kompensasi ukuran zombie
      if (dist <= range + zombie.width / 2) {
        const angleToZombie = Math.atan2(
          zombie.y - player.y,
          zombie.x - player.x
        );
        let angleDiff = angleToZombie - player.direction;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (Math.abs(angleDiff) < 1.5) {
          const isCritical = Math.random() < 0.3;
          const damage =
            weapon.damage * (isCritical ? weapon.criticalMultiplier : 1);
          this.applyDamage(zombie, damage, isCritical);

          hitAnyZombie = true; // Ada zombie yang kena!

          // === LOGIKA LIFESTEAL (BARU) ===
          if (weapon.lifesteal && weapon.lifesteal > 0) {
            const healAmount = Math.floor(damage * weapon.lifesteal);
            if (healAmount >= 1) {
              player.heal(healAmount);
              // Spawn efek visual angka hijau
              this.context.effects.push(
                new HealEffect(player.x, player.y - 30, healAmount)
              );
            }
          }
        }
      }
    }

    if (hitAnyZombie) {
      this.context.soundManager.playWeaponSound(weapon.name, true);
    }
  }

  update() {
    this.updateProjectiles();
    this.checkZombieAttack();
  }
}

// checkPlayerMeleeAttack() {
//     const { player } = this.context;
//     if (!player || player.weapon.type !== "melee") return;

//     // Melee hanya perlu di cek sekali saat animasi serangan terjadi (di handle terpisah via event biasanya),
//     // tapi untuk arsitektur saat ini kita cek jarak setiap frame sangat boros.
//     // Namun karena struktur yang ada, kita biarkan tapi pastikan logic-nya benar.
//     // Note: Seharusnya damage melee hanya apply SEKALI per swing, bukan per frame.
//     // Logic ini ada flaw, tapi kita perbaiki collision-nya dulu.
//   }
