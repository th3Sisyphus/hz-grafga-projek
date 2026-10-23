import { MagicTrail, SmokeTrail } from "./Effect.js";

export class Projectile {
  constructor(x, y, angle, weapon) {
    this.type = "projectile";
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 8;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.weapon = weapon;
    this.distance = 0;
    this.maxDistance = weapon.range;
    this.hit = false;
  }

  update(context, dtNormal = 1) {
    const moveStep = this.speed * dtNormal;
    this.x += Math.cos(this.angle) * moveStep;
    this.y += Math.sin(this.angle) * moveStep;
    this.distance += moveStep;

    // Batasi penambahan partikel trail jika efek sudah mendekati batas 300
    if (context.effects.length < 280) {
      if (this.weapon.name === "Wizard Book") {
        context.effects.push(new MagicTrail(this.x, this.y));
      } else if (this.weapon.name === "Dual Gun") {
        if (Math.random() < 0.5) {
          context.effects.push(new SmokeTrail(this.x, this.y));
        }
      }
    }

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
