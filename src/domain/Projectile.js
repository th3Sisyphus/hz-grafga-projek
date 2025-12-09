// FIX: Import effect baru
import { MagicTrail, SmokeTrail } from "./Effect.js";

export class Projectile {
  constructor(x, y, angle, weapon) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 8;
    this.weapon = weapon;
    this.distance = 0;
    this.maxDistance = weapon.range;
    this.hit = false;
  }

  update(context) {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.distance += this.speed;

    // ========== NEW: SPAWN TRAIL PARTICLES ==========
    // Spawn effect setiap frame (atau setiap frame ganjil untuk performa)
    if (this.weapon.name === "Wizard Book") {
      // Efek Magis: Banyak partikel kecil
      context.effects.push(new MagicTrail(this.x, this.y));
    } else if (this.weapon.name === "Dual Gun") {
      // Efek Asap/Debu: Lebih sedikit
      if (Math.random() < 0.5) {
        context.effects.push(new SmokeTrail(this.x, this.y));
      }
    }
    // ================================================

    if (
      this.distance >= this.maxDistance ||
      context.isObstacle(this.x, this.y) ||
      this.hit
    ) {
      return false;
    }

    return true;
  }
}
