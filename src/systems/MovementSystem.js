import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from "../core/Constants.js";

export class MovementSystem {
  constructor(context) {
    this.context = context;
  }

  moveEntity(entity, dx, dy) {
    const { isObstacle } = this.context;
    const nextX = entity.x + dx * entity.speed;
    const nextY = entity.y + dy * entity.speed;
    const halfW = entity.width / 2;
    const halfH = entity.height / 2;

    // Helper collision check
    const checkCollision = (cx, cy) => {
      // Cek titik tengah + sedikit margin
      return isObstacle(cx, cy);
    };

    // Prediksi collision sederhana (cek titik pusat tiles)
    // Untuk game simple top-down, cek obstacle di posisi baru sudah cukup
    if (!this.context.isObstacle(nextX, entity.y)) {
      entity.x = nextX;
    }
    if (!this.context.isObstacle(entity.x, nextY)) {
      entity.y = nextY;
    }

    // Clamp to map bounds
    entity.x = Math.max(
      halfW,
      Math.min(MAP_WIDTH * TILE_SIZE - halfW, entity.x)
    );
    entity.y = Math.max(
      halfH,
      Math.min(MAP_HEIGHT * TILE_SIZE - halfH, entity.y)
    );
  }

  updatePlayerMovement() {
    const { player, keys } = this.context;
    if (!player) return;

    let dx = 0;
    let dy = 0;
    if (keys["w"]) dy -= 1;
    if (keys["s"]) dy += 1;
    if (keys["a"]) dx -= 1;
    if (keys["d"]) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      this.moveEntity(player, dx, dy);
    }
  }

  updateZombieMovement() {
    const { zombies, player } = this.context;
    if (!player) return;

    for (let i = 0; i < zombies.length; i++) {
      const zombie = zombies[i];

      // 1. Chase Player Vector
      let dx = player.x - zombie.x;
      let dy = player.y - zombie.y;
      let dist = Math.hypot(dx, dy);

      if (dist > 0) {
        dx /= dist;
        dy /= dist;
      }

      // 2. Separation Logic (PENTING: Agar zombie tidak menumpuk)
      let pushX = 0;
      let pushY = 0;
      const separationRadius = 30; // Radius toleransi personal zombie

      for (let j = 0; j < zombies.length; j++) {
        if (i === j) continue;
        const other = zombies[j];
        const distOther = Math.hypot(zombie.x - other.x, zombie.y - other.y);

        if (distOther < separationRadius && distOther > 0) {
          // Vektor menjauh dari zombie lain
          const pushFactor = (separationRadius - distOther) / separationRadius;
          pushX += ((zombie.x - other.x) / distOther) * pushFactor;
          pushY += ((zombie.y - other.y) / distOther) * pushFactor;
        }
      }

      // Gabungkan vektor Chase + Separation
      // Berat separation dibuat cukup besar agar efektif
      const finalDx = dx + pushX * 1.5;
      const finalDy = dy + pushY * 1.5;

      // Normalisasi ulang vektor gabungan
      const finalLen = Math.hypot(finalDx, finalDy);
      if (finalLen > 0) {
        this.moveEntity(zombie, finalDx / finalLen, finalDy / finalLen);
      }
    }
  }

  update() {
    this.updatePlayerMovement();
    this.updateZombieMovement();
  }
}
