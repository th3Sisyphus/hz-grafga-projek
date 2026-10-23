import {
  calculateEnemyStats,
  ENEMIES,
  getBossDataForWave,
} from "../core/data/enemies.js";
import { DamageNumber, DeathEffect, ExplosionEffect } from "./Effect.js";
import { ZombieSprite } from "../rendering/ZombieSprite.js";
import { StatusEffects } from "./StatusEffects.js";
import { EnemyProjectile } from "./Projectile.js";

export class Zombie {
  constructor(x, y, wave, enemyType = "normal") {
    this.type = "zombie";
    this.enemyType = enemyType;
    this.isBoss = false;

    this.x = x;
    this.y = y;
    this.wave = wave;

    // Ambil data arketipe dan hitung stat berskala
    this.definition = ENEMIES[enemyType] || ENEMIES.normal;
    const stats = calculateEnemyStats(enemyType, wave);

    this.health = stats.health;
    this.maxHealth = stats.health;
    this.baseSpeed = stats.speed;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.width = stats.size;
    this.height = stats.size;
    this.color = stats.color;

    // Sistem Status Effects terpadu
    this.status = new StatusEffects(this);

    this.lastAttack = -99999;
    this.attackCooldown = 1000;
    this.hitFlash = 0;
    this.detectionRadius = 280;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderTimer = 0;
    this.lastSpikeTime = -99999;

    // Variabel aksi khusus arketipe
    this.lastSkillTime = -99999;
    this.skillTelegraph = null; // { type, start, duration, ... }

    // Sprite & Animasi
    this.sprite = new ZombieSprite(false);
    this.facingRight = true;
    this.isAttacking = false;
    this.lastX = x;
  }

  takeDamage(damage, isCritical = false, effects = [], context = null) {
    this.health -= damage;
    this.hitFlash = 5;

    // Batasi efek angka kerusakan agar tidak melebihi 300
    if (effects && effects.length < 300) {
      effects.push(new DamageNumber(this.x, this.y, damage, isCritical));
    }

    if (this.health <= 0) {
      this.onDeath(effects, context);
      return true;
    }
    return false;
  }

  onDeath(effects = [], context = null) {
    if (effects && effects.length < 300) {
      effects.push(new DeathEffect(this.x, this.y));
    }

    // Exploder meledak AoE saat mati
    if (this.enemyType === "exploder" && context) {
      const radius = this.definition.explodeRadius || 80;
      const dmg = this.definition.explodeDamage || 45;

      if (effects && effects.length < 300) {
        effects.push(new ExplosionEffect(this.x, this.y, radius));
      }

      // Berikan damage ke Player jika dalam jangkauan
      if (context.player) {
        const dist = Math.hypot(
          context.player.x - this.x,
          context.player.y - this.y
        );
        if (dist <= radius) {
          context.combatSystem?.applyDamage(context.player, dmg, false);
        }
      }

      // Berikan damage ke zombie kawan di sekitar ledakan
      for (let i = 0; i < context.zombies.length; i++) {
        const other = context.zombies[i];
        if (other === this || other.health <= 0) continue;
        const dist = Math.hypot(other.x - this.x, other.y - this.y);
        if (dist <= radius) {
          context.combatSystem?.applyDamage(other, dmg * 0.7, false);
        }
      }
    }
  }

  applyBurn(damage, duration, gameTime = 0) {
    this.status.apply("burn", duration, damage, gameTime);
  }

  updateSpecialBehaviors(context, dtNormal = 1) {
    const time = context.time;
    const player = context.player;
    if (!player || player.health <= 0) return;

    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

    // 1. Spitter (Ranged ludah asam dengan telegraf)
    if (this.enemyType === "spitter") {
      const range = this.definition.shootRange || 260;
      const cooldown = this.definition.spitCooldown || 3000;

      if (!this.skillTelegraph && time - this.lastSkillTime > cooldown) {
        if (distToPlayer <= range && context.hasLineOfSight(this.x, this.y, player.x, player.y)) {
          // Mulai telegraf ancang-ancang menembak 0.6 detik
          // TODO-art: aset telegraph ludah final akan dipoles artis terpisah
          this.skillTelegraph = {
            type: "spit",
            shape: "line",
            startTime: time,
            duration: 600, // 0.6 dtk telegraf
            targetX: player.x,
            targetY: player.y,
            angle: Math.atan2(player.y - this.y, player.x - this.x),
          };
        }
      }

      if (this.skillTelegraph && this.skillTelegraph.type === "spit") {
        if (time - this.skillTelegraph.startTime >= this.skillTelegraph.duration) {
          // Luncurkan proyektil asam
          const angle = this.skillTelegraph.angle;
          context.projectiles.push(
            new EnemyProjectile(this.x, this.y, angle, 4.5, 12, range, "poison")
          );
          this.lastSkillTime = time;
          this.skillTelegraph = null;
        }
      }
    }

    // 2. Necromancer (Summoner minion)
    if (this.enemyType === "necromancer") {
      const cooldown = this.definition.summonCooldown || 6000;
      if (time - this.lastSkillTime > cooldown && context.zombies.length < 40) {
        // Panggil 2 minion zombie biasa di dekat necromancer
        for (let i = 0; i < 2; i++) {
          const ox = this.x + (Math.random() - 0.5) * 60;
          const oy = this.y + (Math.random() - 0.5) * 60;
          if (!context.isObstacle(ox, oy)) {
            const minion = new Zombie(ox, oy, this.wave, "normal");
            minion.health = Math.round(minion.health * 0.7); // Minion sedikit lebih rapuh
            context.zombies.push(minion);
          }
        }
        this.lastSkillTime = time;
      }
    }
  }
}

// === ZOMBIE BOSS ===
export class ZombieBoss extends Zombie {
  constructor(x, y, wave) {
    super(x, y, wave, "normal");
    this.type = "zombie_boss";
    this.enemyType = "boss";
    this.isBoss = true;

    // Data Boss spesifik wave kelipatan 3
    this.bossData = getBossDataForWave(wave);
    this.name = this.bossData.name;
    this.width = this.bossData.size || 60;
    this.height = this.bossData.size || 60;
    this.color = this.bossData.color || "#9333ea";

    // Hitung Stat Boss (HP besar, damage kuat)
    const baseStats = calculateEnemyStats("normal", wave);
    this.health = Math.round(baseStats.health * this.bossData.hpMult);
    this.maxHealth = this.health;
    this.damage = Math.round(baseStats.damage * this.bossData.damageMult);
    this.baseSpeed = baseStats.speed * this.bossData.speedMult;
    this.speed = this.baseSpeed;

    this.detectionRadius = 550;
    this.attackCount = 0; // Stun meter: 0-4 pukulan
    this.phase = 1; // 1: Stun, 2: Charge, 3: Enrage & Slam

    // Timer Skill Boss
    this.lastChargeTime = -99999;
    this.lastSlamTime = -99999;
    this.isCharging = false;
    this.chargeVx = 0;
    this.chargeVy = 0;
    this.chargeEndTime = 0;

    // Telegraf aktif yang akan digambar oleh Renderer
    // TODO-art: data bentuk dan radius telegraf dipakai tugas art berikutnya
    this.activeTelegraph = null;

    this.sprite = new ZombieSprite(true);
  }

  updatePhase() {
    const hpPct = this.health / this.maxHealth;
    if (hpPct > 0.66) {
      this.phase = 1;
    } else if (hpPct > 0.33) {
      this.phase = 2;
    } else {
      this.phase = 3;
    }
  }

  updateSpecialBehaviors(context, dtNormal = 1) {
    this.updatePhase();
    const time = context.time;
    const player = context.player;
    if (!player || player.health <= 0) return;

    // Bersihkan telegraf yang sudah usai
    if (this.activeTelegraph && time >= this.activeTelegraph.endTime) {
      const tg = this.activeTelegraph;
      this.activeTelegraph = null;

      // Eksekusi aksi setelah telegraf selesai
      if (tg.type === "charge") {
        // Luncurkan charge cepat ke arah player
        this.isCharging = true;
        this.chargeEndTime = time + 700; // Meluncur selama 700ms
        const angle = tg.angle;
        this.chargeVx = Math.cos(angle) * 11;
        this.chargeVy = Math.sin(angle) * 11;

        // Panggil 2 minion saat charge
        for (let i = 0; i < 2; i++) {
          const mx = this.x + (Math.random() - 0.5) * 80;
          const my = this.y + (Math.random() - 0.5) * 80;
          if (!context.isObstacle(mx, my)) {
            context.zombies.push(new Zombie(mx, my, this.wave, "runner"));
          }
        }
      } else if (tg.type === "slam") {
        // Hantaman gempa Ground Slam AoE
        const radius = tg.radius || 90;
        const slamDamage = Math.round(this.damage * 1.5);

        if (context.effects.length < 300) {
          context.effects.push(new ExplosionEffect(this.x, this.y, radius));
        }

        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist <= radius) {
          context.combatSystem?.applyDamage(player, slamDamage, false);
          // Knockback kuat
          const angle = Math.atan2(player.y - this.y, player.x - this.x);
          player.x += Math.cos(angle) * 30;
          player.y += Math.sin(angle) * 30;
        }
      }
    }

    // Tangani pergerakan charge aktif
    if (this.isCharging) {
      if (time < this.chargeEndTime) {
        const nextX = this.x + this.chargeVx * dtNormal;
        const nextY = this.y + this.chargeVy * dtNormal;
        if (!context.isObstacle(nextX, nextY)) {
          this.x = nextX;
          this.y = nextY;
        }

        // Cek tabrakan charge dengan player
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < 45) {
          context.combatSystem?.applyDamage(player, Math.round(this.damage * 1.2), false);
          this.isCharging = false;
        }
      } else {
        this.isCharging = false;
      }
      return;
    }

    // FASE 2: Charge Lurus dengan Telegraf Garis >= 0.8 detik (850ms)
    if (this.phase === 2 || this.phase === 3) {
      if (!this.activeTelegraph && time - this.lastChargeTime > 6000) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        // TODO-art: telegraf serudukan garis 320x40px
        this.activeTelegraph = {
          type: "charge",
          shape: "line",
          startX: this.x,
          startY: this.y,
          angle,
          length: 320,
          width: 44,
          startTime: time,
          duration: 850, // >= 0.8 dtk
          endTime: time + 850,
        };
        this.lastChargeTime = time;
      }
    }

    // FASE 3: Enrage (+30% speed) + Ground Slam AoE dengan Telegraf Lingkaran >= 0.8 detik
    if (this.phase === 3) {
      this.speed = this.baseSpeed * 1.3;

      if (!this.activeTelegraph && time - this.lastSlamTime > 7000) {
        // TODO-art: telegraf hantaman tanah lingkaran radius 90px
        this.activeTelegraph = {
          type: "slam",
          shape: "circle",
          x: this.x,
          y: this.y,
          radius: 95,
          startTime: time,
          duration: 850, // >= 0.8 dtk
          endTime: time + 850,
        };
        this.lastSlamTime = time;
      }
    }
  }
}
