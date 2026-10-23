import {
  WEAPONS,
  BASE_PLAYER_HEALTH,
  BASE_PLAYER_SPEED,
} from "../core/Constants.js";
import { MeleeEffect } from "./Effect.js";
import { Projectile } from "./Projectile.js";

export class Player {
  constructor(x, y) {
    this.type = "player";
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.health = BASE_PLAYER_HEALTH;
    this.maxHealth = BASE_PLAYER_HEALTH;
    this.speed = BASE_PLAYER_SPEED;
    this.weapon = null;
    this.lastAttack = -99999;
    this.hitFlash = 0;
    this.direction = 0;
    this.stunEndTime = 0;
    this.isStunned = false;
    this.lastFootstepTime = -99999;
    this.footstepInterval = 500;
    this.lastSpikeTime = -99999;
  }

  setWeapon(weaponKey) {
    this.weapon = WEAPONS[weaponKey];
    this.speed = BASE_PLAYER_SPEED + this.weapon.speedBonus;
  }

  takeDamage(damage) {
    this.health -= damage;
    this.hitFlash = 10;
    return this.health <= 0;
  }

  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  update(gameTime) {
    this.isStunned = gameTime < this.stunEndTime;
  }

  applyStun(duration, gameTime = 0) {
    this.stunEndTime = gameTime + duration;
    this.isStunned = true;
  }

  updateAim(mousePos, camera) {
    if (this.isStunned) return;

    const dx = mousePos.x + camera.x - this.x;
    const dy = mousePos.y + camera.y - this.y;
    this.direction = Math.atan2(dy, dx);
  }

  attemptAttack(mousePos, camera, projectiles, effects, gameTime = 0) {
    if (this.isStunned) return false;

    if (gameTime - this.lastAttack < this.weapon.cooldown) return false;
    this.lastAttack = gameTime;

    this.updateAim(mousePos, camera);

    if (this.weapon.type === "melee") {
      effects.push(
        new MeleeEffect(
          this.x,
          this.y,
          this.direction,
          this.weapon.name,
          this.weapon.arc || 1.0
        )
      );
    } else {
      projectiles.push(
        new Projectile(this.x, this.y, this.direction, this.weapon)
      );
    }

    return true;
  }
}
