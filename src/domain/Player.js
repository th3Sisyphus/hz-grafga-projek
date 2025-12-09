import {
  WEAPONS,
  BASE_PLAYER_HEALTH,
  BASE_PLAYER_SPEED,
} from "../core/Constants.js";
import { MeleeEffect } from "./Effect.js";
import { Projectile } from "./Projectile.js";

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.health = BASE_PLAYER_HEALTH;
    this.maxHealth = BASE_PLAYER_HEALTH;
    this.speed = BASE_PLAYER_SPEED;
    this.weapon = null;
    this.lastAttack = 0;
    this.hitFlash = 0;
    this.direction = 0;
    this.stunEndTime = 0;
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

  // Cek apakah player sedang stun
  get isStunned() {
    return Date.now() < this.stunEndTime;
  }

  /**
   * BARU: Mengupdate arah hadap senjata berdasarkan posisi mouse.
   * Dipanggil setiap frame oleh GameManager.
   */
  updateAim(mousePos, camera) {
    const dx = mousePos.x + camera.x - this.x;
    const dy = mousePos.y + camera.y - this.y;
    this.direction = Math.atan2(dy, dx);
  }

  /**
   * Logika attack sekarang hanya fokus pada trigger dan cooldown.
   * Arah (this.direction) sudah diurus oleh updateAim.
   */
  attemptAttack(mousePos, camera, projectiles, effects) {
    if (this.isStunned) return false;

    const now = Date.now();
    if (now - this.lastAttack < this.weapon.cooldown) return false;
    this.lastAttack = now;

    // Arah sudah diupdate di updateAim(), jadi kita langsung pakai this.direction
    // Tapi untuk keamanan (jika mouse bergerak cepat saat klik), kita bisa pastikan update sekali lagi
    this.updateAim(mousePos, camera);

    if (this.weapon.type === "melee") {
      effects.push(
        new MeleeEffect(this.x, this.y, this.direction, this.weapon.name)
      );
    } else {
      projectiles.push(
        new Projectile(this.x, this.y, this.direction, this.weapon)
      );
    }

    return true;
  }
}
