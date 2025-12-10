// ========== EFFECT CLASSES (Domain Layer) ==========
// Bertanggung jawab hanya untuk data dan life cycle (update).
// Semua logika visual (draw) ditangani oleh Renderer.js

export class MeleeEffect {
  constructor(x, y, angle, weaponName) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.weaponName = weaponName;
    this.life = 10;
  }
  update() {
    this.life--;
    return this.life > 0;
  }
}

export class DamageNumber {
  constructor(x, y, damage, isCritical) {
    this.x = x;
    this.y = y;
    this.damage = Math.floor(damage);
    this.isCritical = isCritical;
    this.life = 30;
    this.vy = -2;
  }
  update() {
    this.y += this.vy;
    this.life--;
    return this.life > 0;
  }
}

export class BurnEffect {
  constructor(x, y) {
    // Posisi acak agar api terlihat berkedip-kedip
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.life = 20;
    this.vy = -1;
  }
  update() {
    this.y += this.vy;
    this.life--;
    return this.life > 0;
  }
}

export class ExplosionEffect {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.life = 15;
    this.maxLife = 15;
  }
  update() {
    this.life--;
    return this.life > 0;
  }
}

export class MagicTrail {
  constructor(x, y) {
    this.x = x + (Math.random() - 0.5) * 10; // Sedikit acak posisinya
    this.y = y + (Math.random() - 0.5) * 10;
    this.life = 15;
    this.maxLife = 15;
    this.size = Math.random() * 4 + 2;
    // Warna acak antara Ungu dan Biru Cyan
    this.colorType = Math.random() > 0.5 ? "purple" : "cyan";
  }
  update() {
    this.life--;
    this.size *= 0.9; // Mengecil seiring waktu
    return this.life > 0;
  }
}

export class SmokeTrail {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 8; // Umur pendek
    this.maxLife = 8;
    this.size = Math.random() * 3 + 1;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
  }
  update() {
    this.life--;
    this.x += this.vx;
    this.y += this.vy;
    return this.life > 0;
  }
}
export class HealEffect {
  constructor(x, y, amount) {
    this.x = x;
    this.y = y;
    this.amount = Math.floor(amount);
    this.life = 40; // Tampil sedikit lebih lama
    this.vy = -1; // Naik perlahan
  }
  update() {
    this.y += this.vy;
    this.life--;
    return this.life > 0;
  }
}
export class DeathEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 20;
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
  update() {
    this.life--;
    for (let p of this.particles) {
      p.x += p.vx * 0.5;
      p.y += p.vy * 0.5;
      p.alpha -= 0.02;
      p.size *= 0.97;
    }
    // Hapus partikel yang sudah tidak terlihat
    this.particles = this.particles.filter((p) => p.alpha > 0);
    return this.life > 0 || this.particles.length > 0;
  }
}
