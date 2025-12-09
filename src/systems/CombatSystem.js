import { ExplosionEffect, BurnEffect, DeathEffect } from "../domain/Effect.js";

export class CombatSystem {
  constructor(context) {
    this.context = context;
  }

  applyDamage(entity, damage, isCritical = false) {
    const isDead = entity.takeDamage(damage, isCritical, this.context.effects);
    if (isDead) {
      if (entity.constructor.name === "Zombie") {
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
      if (dist < 30) {
        if (now - zombie.lastAttack > zombie.attackCooldown) {
          this.applyDamage(player, zombie.damage);
          zombie.lastAttack = now;
        }
      }
      // Handle DOT Burn
      if (zombie.burning && now < zombie.burnEndTime) {
        if (now - zombie.lastBurnTick > 500) {
          // Tick lebih cepat (0.5s)
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
      this.context.score += this.context.wave;
      this.context.zombiesKilled++;
    }
  }

  checkPlayerMeleeAttack() {
    const { player } = this.context;
    if (!player || player.weapon.type !== "melee") return;

    // Melee hanya perlu di cek sekali saat animasi serangan terjadi (di handle terpisah via event biasanya),
    // tapi untuk arsitektur saat ini kita cek jarak setiap frame sangat boros.
    // Namun karena struktur yang ada, kita biarkan tapi pastikan logic-nya benar.
    // Note: Seharusnya damage melee hanya apply SEKALI per swing, bukan per frame.
    // Logic ini ada flaw, tapi kita perbaiki collision-nya dulu.
  }

  updateProjectiles() {
    // SINGLE LOOP ARCHITECTURE: Update Posisi & Cek Collision disini
    const activeProjectiles = [];
    const { zombies, projectiles, effects, player } = this.context;

    for (let p of projectiles) {
      // 1. Update Movement via Method Projectile (mengembalikan false jika hit wall/range)
      const isAlive = p.update(this.context);

      if (!isAlive) continue; // Skip jika mati kena tembok/range

      // 2. Cek Collision dengan Zombie
      let hitZombie = null;
      for (let zombie of zombies) {
        const dist = Math.hypot(zombie.x - p.x, zombie.y - p.y);
        // Hitbox agak diperbesar sedikit (30)
        if (dist < 30) {
          hitZombie = zombie;
          break;
        }
      }

      if (hitZombie) {
        // Apply Damage Logic
        this.applyDamage(hitZombie, p.weapon.damage);

        // Special Effects
        if (p.weapon.name === "Wizard Book") {
          hitZombie.applyBurn(p.weapon.dotDamage, p.weapon.dotDuration);
          effects.push(new BurnEffect(hitZombie.x, hitZombie.y));
        } else if (p.weapon.name === "Dual Gun") {
          this.handleExplosion(hitZombie, p.weapon);
        }
        // Proyektil hancur setelah kena
      } else {
        // Keep projectile
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
        this.applyDamage(otherZombie, weapon.damage * 0.7); // 70% damage
      }
    }
  }

  handleMeleeAttack(player) {
    const { zombies } = this.context;
    const weapon = player.weapon;
    const range = weapon.range;

    for (let zombie of zombies) {
      // 1. Cek Jarak
      const dist = Math.hypot(zombie.x - player.x, zombie.y - player.y);
      if (dist <= range) {
        // 2. Cek Sudut (Agar tidak pukul zombie di belakang)
        const angleToZombie = Math.atan2(
          zombie.y - player.y,
          zombie.x - player.x
        );
        let angleDiff = angleToZombie - player.direction;

        // Normalisasi sudut agar selalu di range -PI sampai PI
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Sudut toleransi 1.5 radian (~85 derajat kiri-kanan)
        if (Math.abs(angleDiff) < 1.5) {
          // HIT!
          const isCritical = Math.random() < 0.3;
          const damage =
            weapon.damage * (isCritical ? weapon.criticalMultiplier : 1);
          this.applyDamage(zombie, damage, isCritical);
        }
      }
    }
  }

  update() {
    // Kita pindahkan logic update projectile sepenuhnya kesini
    this.updateProjectiles();
    this.checkZombieAttack();
  }
}
