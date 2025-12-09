import {
  WEAPONS,
  BASE_PLAYER_HEALTH,
  BASE_PLAYER_SPEED,
} from "../core/Constants.js";
import { MeleeEffect, DeathEffect } from "./Effect.js";
import { Projectile } from "./Projectile.js";

export class Player {
  constructor(x, y) {
    // ========== Data & State Internal ==========
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.health = BASE_PLAYER_HEALTH;
    this.maxHealth = BASE_PLAYER_HEALTH;
    this.speed = BASE_PLAYER_SPEED;
    this.weapon = null;
    this.lastAttack = 0;
    this.hitFlash = 0; // Tetap di sini, tapi di-update oleh CombatSystem
    this.direction = 0; // Sudut arah hadap, di-set saat attack
  }

  // --- Core Domain Logic ---

  /**
   * Mengubah senjata dan menyesuaikan kecepatan dasar Player.
   */
  setWeapon(weaponKey) {
    this.weapon = WEAPONS[weaponKey];
    this.speed = BASE_PLAYER_SPEED + this.weapon.speedBonus;
  }

  /**
   * Menerima damage. HANYA mengurangi health dan mengeset hitFlash.
   * Tidak memanggil gameOver() atau memanipulasi array effects global.
   * @returns {boolean} True jika Player mati (health <= 0).
   */
  takeDamage(damage) {
    this.health -= damage;
    this.hitFlash = 10; // State untuk visual hit flash (dikonsumsi oleh Renderer)
    return this.health <= 0;
  }

  /**
   * Logika pemicuan serangan. Bertanggung jawab untuk mengecek cooldown,
   * menghitung arah, dan menghasilkan entitas Projectile atau Effect.
   * Logika damage sesungguhnya ditangani oleh CombatSystem.
   */
  attemptAttack(mousePos, camera, projectiles, effects) {
    const now = Date.now();
    if (now - this.lastAttack < this.weapon.cooldown) return;
    this.lastAttack = now;

    // 1. Hitung arah hadap (Direction adalah data murni)
    const dx = mousePos.x + camera.x - this.x;
    const dy = mousePos.y + camera.y - this.y;
    this.direction = Math.atan2(dy, dx); // Simpan arah hadap untuk rendering weapon

    // 2. Memicu Entitas/Efek yang diperlukan (Domain to Domain/Effect)
    if (this.weapon.type === "melee") {
      // Melee hanya menghasilkan Effect untuk visual slash
      effects.push(
        new MeleeEffect(this.x, this.y, this.direction, this.weapon.name)
      );
      // Damage akan dihitung oleh CombatSystem yang mengiterasi Zombie dan Player
    } else {
      // Range menghasilkan Projectile
      projectiles.push(
        new Projectile(this.x, this.y, this.direction, this.weapon)
      );
    }

    return true; // Serangan berhasil dipicu
  }

  // --- Catatan: Fungsi yang Dihapus ---
  // 1. move(): Dipindahkan ke MovementSystem.js.
  // 2. meleeAttack()/rangeAttack(): Dihapus/digabung ke attemptAttack().
  // 3. draw(): Dipindahkan ke Renderer.js.
  // 4. Akses ke gameState/zombies/isObstacle/gameOver: Dihapus dan dipindahkan ke System yang sesuai.
}
