import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from "../core/Constants.js";

export class MovementSystem {
  constructor(context) {
    this.context = context;
  }

  moveEntity(entity, dx, dy) {
    const { isObstacle } = this.context;
    // Gunakan speed entity. Jika zombie sedang wander (tidak ngejar), kita kurangi speednya sedikit agar terlihat santai
    // Kita handle speed multiplier di updateZombieMovement saja agar moveEntity tetap murni
    const nextX = entity.x + dx * entity.speed;
    const nextY = entity.y + dy * entity.speed;
    const halfW = entity.width / 2;
    const halfH = entity.height / 2;

    const checkCollision = (cx, cy) => {
      return isObstacle(cx, cy);
    };

    // Collision Check (Slide againts walls)
    if (!this.context.isObstacle(nextX, entity.y)) {
      entity.x = nextX;
    }
    if (!this.context.isObstacle(entity.x, nextY)) {
      entity.y = nextY;
    }

    // Boundary Check
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
      let dx = 0;
      let dy = 0;
      let currentSpeedMultiplier = 1; // Default speed

      // 1. Cek Jarak ke Player (AI Brain)
      const distToPlayer = Math.hypot(player.x - zombie.x, player.y - zombie.y);

      if (distToPlayer < zombie.detectionRadius) {
        // === STATE: CHASE (Mengejar) ===
        dx = player.x - zombie.x;
        dy = player.y - zombie.y;

        // Normalize vector
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
          dx /= dist;
          dy /= dist;
        }
        // Zombie lari full speed saat mengejar
      } else {
        // === STATE: WANDER (Jalan-jalan Gabut) ===
        // Zombie jalan lebih pelan saat santai (0.5x speed)
        currentSpeedMultiplier = 0.5;

        // Update arah wander sesekali agar gerakan "organic" (seperti semut)
        zombie.wanderTimer--;
        if (zombie.wanderTimer <= 0) {
          // Ubah arah sedikit random (-1 sampai +1 radian)
          zombie.wanderAngle += (Math.random() - 0.5) * 2;
          zombie.wanderTimer = 30 + Math.random() * 60; // Reset timer (0.5 - 1.5 detik)
        }

        dx = Math.cos(zombie.wanderAngle);
        dy = Math.sin(zombie.wanderAngle);
      }

      // 2. Separation Logic (Wajib ada biar ga numpuk)
      let pushX = 0;
      let pushY = 0;
      const separationRadius = 30;

      for (let j = 0; j < zombies.length; j++) {
        if (i === j) continue;
        const other = zombies[j];
        const distOther = Math.hypot(zombie.x - other.x, zombie.y - other.y);

        if (distOther < separationRadius && distOther > 0) {
          const pushFactor = (separationRadius - distOther) / separationRadius;
          pushX += ((zombie.x - other.x) / distOther) * pushFactor;
          pushY += ((zombie.y - other.y) / distOther) * pushFactor;
        }
      }

      // Gabungkan Vector Utama + Separation
      const finalDx = dx + pushX * 1.5;
      const finalDy = dy + pushY * 1.5;

      // Normalisasi akhir
      const finalLen = Math.hypot(finalDx, finalDy);
      if (finalLen > 0) {
        // Simpan posisi lama untuk cek tabrakan
        const oldX = zombie.x;
        const oldY = zombie.y;

        // Hack sementara: Manipulasi speed zombie langsung di objectnya untuk frame ini
        const originalSpeed = zombie.speed;
        zombie.speed = originalSpeed * currentSpeedMultiplier;

        this.moveEntity(zombie, finalDx / finalLen, finalDy / finalLen);

        // Kembalikan speed asli
        zombie.speed = originalSpeed;

        // 3. WANDER STUCK CHECK
        // Jika sedang WANDER dan posisi tidak berubah (nabrak tembok/batu), putar balik!
        if (distToPlayer >= zombie.detectionRadius) {
          if (
            Math.abs(zombie.x - oldX) < 0.1 &&
            Math.abs(zombie.y - oldY) < 0.1
          ) {
            // Putar balik + sedikit acak
            zombie.wanderAngle += Math.PI + (Math.random() - 0.5);
          }
        }
      }
    }
  }

  update() {
    this.updatePlayerMovement();
    this.updateZombieMovement();
  }
}
