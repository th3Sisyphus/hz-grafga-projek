// ========== EFFECT CLASSES (Domain Layer) ==========
// Bertanggung jawab untuk data dan life cycle (update).
// Semua logika visual (draw) ditangani oleh Renderer.js

export class MeleeEffect {
  constructor(x, y, angle, weaponName, arc = 1.0, range = 80, isCritical = false) {
    this.type = "melee";
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.weaponName = weaponName;
    this.arc = arc; // Setengah sudut kerucut (radian)
    this.range = range; // Jangkauan jangkauan visual senjata
    this.isCritical = isCritical;
    this.life = 14; // ~240 ms pada 60 FPS
    this.maxLife = 14;
    this.frame = 0;
  }
  update(dt = 1) {
    this.life -= dt;
    const progress = 1 - Math.max(0, this.life / this.maxLife);
    this.frame = Math.min(3, Math.floor(progress * 4));
    return this.life > 0;
  }
}

export class IchorSplashEffect {
  constructor(x, y) {
    this.type = "ichor_splash";
    this.x = x;
    this.y = y;
    this.life = 10;
    this.maxLife = 10;
    this.frame = 0;
  }
  update(dt = 1) {
    this.life -= dt;
    const progress = 1 - Math.max(0, this.life / this.maxLife);
    this.frame = Math.min(2, Math.floor(progress * 3));
    return this.life > 0;
  }
}

export class ZombieClawEffect {
  constructor(x, y) {
    this.type = "zombie_claw";
    this.x = x;
    this.y = y;
    this.life = 12;
    this.maxLife = 12;
    this.frame = 0;
  }
  update(dt = 1) {
    this.life -= dt;
    const progress = 1 - Math.max(0, this.life / this.maxLife);
    this.frame = Math.min(2, Math.floor(progress * 3));
    return this.life > 0;
  }
}

export class GroundSlamEffect {
  constructor(x, y, radius = 95) {
    this.type = "ground_slam";
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.life = 18;
    this.maxLife = 18;
  }
  update(dt = 1) {
    this.life -= dt;
    return this.life > 0;
  }
}


export class DamageNumber {
  constructor(x, y, damage, isCritical = false) {
    this.type = "damage_number";
    this.x = x;
    this.y = y;
    this.damage = typeof damage === "string" ? damage : Math.floor(damage);
    this.isCritical = isCritical;
    this.life = 30;
    this.maxLife = 30;
    this.vy = -2;
  }
  update(dt = 1) {
    this.y += this.vy * dt;
    this.life -= dt;
    return this.life > 0;
  }
}

export class BurnEffect {
  constructor(x, y) {
    this.type = "burn";
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.life = 20;
    this.maxLife = 20;
    this.vy = -1;
  }
  update(dt = 1) {
    this.y += this.vy * dt;
    this.life -= dt;
    return this.life > 0;
  }
}

export class ExplosionEffect {
  constructor(x, y, radius) {
    this.type = "explosion";
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.life = 15;
    this.maxLife = 15;
  }
  update(dt = 1) {
    this.life -= dt;
    return this.life > 0;
  }
}

export class MagicTrail {
  constructor(x, y) {
    this.type = "magic_trail";
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y + (Math.random() - 0.5) * 10;
    this.life = 15;
    this.maxLife = 15;
    this.size = Math.random() * 4 + 2;
    this.colorType = Math.random() > 0.5 ? "purple" : "cyan";
  }
  update(dt = 1) {
    this.life -= dt;
    this.size *= Math.pow(0.9, dt);
    return this.life > 0;
  }
}

export class SmokeTrail {
  constructor(x, y) {
    this.type = "smoke_trail";
    this.x = x;
    this.y = y;
    this.life = 8;
    this.maxLife = 8;
    this.size = Math.random() * 3 + 1;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
  }
  update(dt = 1) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    return this.life > 0;
  }
}

export class HealEffect {
  constructor(x, y, amount) {
    this.type = "heal";
    this.x = x;
    this.y = y;
    this.amount = Math.floor(amount);
    this.life = 40;
    this.maxLife = 40;
    this.vy = -1;
  }
  update(dt = 1) {
    this.y += this.vy * dt;
    this.life -= dt;
    return this.life > 0;
  }
}

export class DeathEffect {
  constructor(x, y) {
    this.type = "death";
    this.x = x;
    this.y = y;
    this.life = 20;
    this.maxLife = 20;
    this.particles = [];

    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: 0,
        y: 0,
        size: 8 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -1 - Math.random() * 1.5,
        alpha: 1,
      });
    }
  }
  update(dt = 1) {
    this.life -= dt;
    for (let p of this.particles) {
      p.x += p.vx * 0.5 * dt;
      p.y += p.vy * 0.5 * dt;
      p.alpha -= 0.02 * dt;
      p.size *= Math.pow(0.97, dt);
    }
    this.particles = this.particles.filter((p) => p.alpha > 0);
    return this.life > 0 || this.particles.length > 0;
  }
}
