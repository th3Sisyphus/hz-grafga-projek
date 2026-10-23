export class Pickup {
  constructor(x, y, type, value, gameTime, powerupId = null) {
    this.type = "pickup";
    this.pickupType = type; // "coin", "medkit", "ammo", "powerup"
    this.value = value;
    this.powerupId = powerupId;
    this.x = x + (Math.random() - 0.5) * 16;
    this.y = y + (Math.random() - 0.5) * 16;
    this.spawnTime = gameTime;
    this.duration = 12000; // 12 detik despawn
    this.collected = false;
  }

  update(context, dtNormal = 1) {
    const { player, time } = context;
    if (!player) return false;

    // Cek batas waktu (hilang setelah ~12 detik)
    if (time - this.spawnTime > this.duration) {
      return false;
    }

    const dist = Math.hypot(player.x - this.x, player.y - this.y);

    // Radius magnetik: default 75px, atau 600px saat powerup magnet aktif
    const isMagnetActive =
      context.activePowerups && context.activePowerups.magnet > time;
    const magnetRadius = isMagnetActive ? 600 : 75;

    if (dist < magnetRadius && dist > 0) {
      // Semakin dekat, semakin cepat tertarik
      const pullSpeed = (isMagnetActive ? 12 : 7) * dtNormal;
      this.x += ((player.x - this.x) / dist) * pullSpeed;
      this.y += ((player.y - this.y) / dist) * pullSpeed;
    }

    // Radius koleksi sentuhan (20px)
    if (dist < 22) {
      this.collected = true;
      this.onCollect(context);
      return false;
    }

    return true;
  }

  onCollect(context) {
    const { player, soundManager } = context;

    switch (this.pickupType) {
      case "coin":
        context.coins += this.value;
        break;

      case "medkit":
        player.heal(this.value || 40);
        break;

      case "ammo":
        if (typeof player.addAmmo === "function") {
          player.addAmmo(this.value || 30);
        }
        break;

      case "powerup":
        if (this.powerupId && typeof context.activatePowerup === "function") {
          context.activatePowerup(this.powerupId);
        }
        break;
    }
  }
}
