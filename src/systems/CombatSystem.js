import { ExplosionEffect, BurnEffect, DeathEffect } from "../domain/Effect.js";

export class CombatSystem {
  constructor(context) {
    this.context = context;
    // Ambil reference ke fungsi handleGameOver dari GameManager melalui context.
    // Note: Asumsi GameManager akan menyediakan handleGameOver di context
    // atau kita menggunakan callback yang disediakan saat inisialisasi.
    // Di sini kita asumsikan context memiliki akses ke method GameManager.
  }

  /**
   * Memproses damage pada entitas, memeriksa kematian, dan memicu efek.
   */
  applyDamage(entity, damage, isCritical = false) {
    // Entitas Domain (Player/Zombie) hanya menghitung apakah mereka mati (Boolean)
    const isDead = entity.takeDamage(damage, isCritical, this.context.effects);

    if (isDead) {
      if (entity.constructor.name === "Zombie") {
        this.killZombie(entity);
      } else if (entity.constructor.name === "Player") {
        // Memanggil fungsi game over melalui GameManager/Context
        this.context.effects.push(new DeathEffect(entity.x, entity.y));
        this.context.gameOver();
      }
    }
  }

  // --- LOGIKA ZOMBIE ---

  checkZombieAttack() {
    const { player, zombies } = this.context;
    if (!player) return;

    const now = Date.now();
    for (let zombie of zombies) {
      const dist = Math.hypot(player.x - zombie.x, player.y - zombie.y);

      // 1. Cek Serangan Jarak Dekat
      if (dist < 30) {
        if (now - zombie.lastAttack > zombie.attackCooldown) {
          this.applyDamage(player, zombie.damage);
          zombie.lastAttack = now;
        }
      }

      // 2. Cek Damage Over Time (DOT)
      if (zombie.burning && now < zombie.burnEndTime) {
        if (now - zombie.lastBurnTick > 1000) {
          this.applyDamage(zombie, zombie.burnDamage, false);
          zombie.lastBurnTick = now;
          this.context.effects.push(new BurnEffect(zombie.x, zombie.y));
        }
      } else if (zombie.burning) {
        zombie.burning = false; // Burn ended
      }
    }
  }

  killZombie(zombie) {
    const index = this.context.zombies.indexOf(zombie);
    if (index > -1) {
      this.context.zombies.splice(index, 1);
      this.context.score += this.context.wave;
      this.context.zombiesKilled++;
      // Note: DeathEffect sudah dipicu di applyDamage
    }
  }

  // --- LOGIKA PLAYER ---

  checkPlayerMeleeAttack() {
    const { player } = this.context;
    if (!player || player.weapon.type !== "melee") return;

    // Logika Melee Attack (dipicu oleh player.attemptAttack yang menghasilkan effect visual)
    for (let zombie of this.context.zombies) {
      const dist = Math.hypot(zombie.x - player.x, zombie.y - player.y);
      if (dist < player.weapon.range) {
        const isCritical =
          player.weapon.criticalMultiplier > 1 && Math.random() < 0.3;
        const damage =
          player.weapon.damage *
          (isCritical ? player.weapon.criticalMultiplier : 1);
        this.applyDamage(zombie, damage, isCritical);
      }
    }
  }

  checkProjectileHits() {
    const projectilesToKeep = [];
    const { zombies, projectiles, effects } = this.context;

    for (let p of projectiles) {
      let hit = false;

      for (let zombie of zombies) {
        // Cek jarak Projectile ke Zombie
        const dist = Math.hypot(zombie.x - p.x, zombie.y - p.y);
        if (dist < 20) {
          hit = true;
          this.applyDamage(zombie, p.weapon.damage);

          // Special Effects
          if (p.weapon.name === "Wizard Book") {
            zombie.applyBurn(p.weapon.dotDamage, p.weapon.dotDuration);
            effects.push(new BurnEffect(zombie.x, zombie.y));
          } else if (p.weapon.name === "Dual Gun") {
            this.handleExplosion(zombie, p.weapon);
          }
          break;
        }
      }

      if (!hit) {
        projectilesToKeep.push(p);
      }
    }

    this.context.projectiles = projectilesToKeep;
  }

  handleExplosion(centerZombie, weapon) {
    this.context.effects.push(
      new ExplosionEffect(centerZombie.x, centerZombie.y, weapon.aoeRadius)
    );

    for (let otherZombie of this.context.zombies) {
      // Cek AOE dari titik ledakan (posisi centerZombie)
      const aoeDist = Math.hypot(
        otherZombie.x - centerZombie.x,
        otherZombie.y - centerZombie.y
      );
      if (aoeDist < weapon.aoeRadius) {
        this.applyDamage(otherZombie, weapon.damage * 0.5); // Damage AOE 50%
      }
    }
  }

  // --- UPDATE SYSTEM ---

  update() {
    // Player attack (hanya melee yang butuh cek collision di loop)
    this.checkPlayerMeleeAttack();

    // Projectile attack
    this.checkProjectileHits();

    // Zombie attack & DOT
    this.checkZombieAttack();
  }
}
