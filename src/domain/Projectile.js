export class Projectile {
  constructor(x, y, angle, weapon) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 8;
    this.weapon = weapon;
    this.distance = 0;
    this.maxDistance = weapon.range;
    this.hit = false; // State untuk CombatSystem
  }

  /**
   * HANYA mengurus pergerakan dan cek obstacle/jarak.
   * Collision dengan Zombie diurus oleh CombatSystem.
   * @returns {boolean} True jika proyektil masih in-flight dan belum menabrak apa-apa.
   */
  update(context) {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.distance += this.speed;

    // Proyektil mati jika:
    // 1. Mencapai jarak maksimum
    // 2. Menabrak obstacle
    // 3. Sudah ditandai 'hit' oleh CombatSystem
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
