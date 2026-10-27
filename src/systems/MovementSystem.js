import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from "../core/Constants.js";

export class MovementSystem {
  constructor(context) {
    this.context = context;
  }

  moveEntity(entity, dx, dy, dtNormal = 1) {
    const moveStep = entity.speed * dtNormal;
    const nextX = entity.x + dx * moveStep;
    const nextY = entity.y + dy * moveStep;
    const halfW = entity.width / 2;
    const halfH = entity.height / 2;

    // Pengecekan collision multi-point (bounding box) agar entity tidak menembus batas obstacle/spike
    const padW = Math.max(2, halfW - 3);
    const padH = Math.max(2, halfH - 3);

    const canMoveX =
      !this.context.isObstacle(nextX, entity.y) &&
      !this.context.isObstacle(nextX - padW, entity.y - padH) &&
      !this.context.isObstacle(nextX + padW, entity.y - padH) &&
      !this.context.isObstacle(nextX - padW, entity.y + padH) &&
      !this.context.isObstacle(nextX + padW, entity.y + padH);

    if (canMoveX) {
      entity.x = nextX;
    }

    const canMoveY =
      !this.context.isObstacle(entity.x, nextY) &&
      !this.context.isObstacle(entity.x - padW, nextY - padH) &&
      !this.context.isObstacle(entity.x + padW, nextY - padH) &&
      !this.context.isObstacle(entity.x - padW, nextY + padH) &&
      !this.context.isObstacle(entity.x + padW, nextY + padH);

    if (canMoveY) {
      entity.y = nextY;
    }

    entity.x = Math.max(
      halfW,
      Math.min(MAP_WIDTH * TILE_SIZE - halfW, entity.x)
    );
    entity.y = Math.max(
      halfH,
      Math.min(MAP_HEIGHT * TILE_SIZE - halfH, entity.y)
    );
  }

  updatePlayerMovement(dtNormal = 1) {
    const { player, keys, joystickInput } = this.context;
    if (!player) return;

    // Player stunned (baik via flag langsung atau status effects)
    if (player.isStunned || player.status?.isStunned(this.context.time)) return;

    let dx = 0;
    let dy = 0;

    const isSpeedBoost =
      this.context.activePowerups &&
      this.context.activePowerups.speed_boost > this.context.time;
    const isDashBoost = player.isDashing
      ? (player.character?.skill?.speedBoost || 2.5)
      : 1.0;
    const statusMult = player.status?.getSpeedMultiplier(this.context.time) || 1.0;
    const playerDt = dtNormal * (isSpeedBoost ? 1.5 : 1.0) * isDashBoost * statusMult;

    if (joystickInput && joystickInput.active) {
      dx = joystickInput.x;
      dy = joystickInput.y;
      this.moveEntity(player, dx, dy, playerDt);
      return;
    }

    if (keys["w"]) dy -= 1;
    if (keys["s"]) dy += 1;
    if (keys["a"]) dx -= 1;
    if (keys["d"]) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      this.moveEntity(player, dx, dy, playerDt);

      // Play footstep sound menggunakan game clock
      const now = this.context.time;
      if (now - player.lastFootstepTime > player.footstepInterval) {
        this.context.soundManager.playFootstep();
        player.lastFootstepTime = now;
      }
    } else {
      this.context.soundManager.stopFootstepLoop();
    }
  }

  updateZombieMovement(dtNormal = 1) {
    const { zombies, player } = this.context;
    if (!player) return;

    // Perbarui flow field tiap ~0.4 detik (400ms)
    this.context.updateFlowField();

    // Rebuild spatial hash untuk separasi O(n)
    this.context.spatialHash.clear();
    for (let i = 0; i < zombies.length; i++) {
      this.context.spatialHash.insert(zombies[i]);
    }

    for (let i = 0; i < zombies.length; i++) {
      const zombie = zombies[i];
      if (zombie.health <= 0) continue;

      // Jika boss sedang meluncur dalam aksi charge atau stun, abaikan movement normal
      if (zombie.isCharging || zombie.status?.isStunned(this.context.time)) {
        continue;
      }

      // Jika spitter/boss sedang ancang-ancang telegraf serangan, diam di tempat
      if (zombie.skillTelegraph || zombie.activeTelegraph) {
        continue;
      }

      let dx = 0;
      let dy = 0;
      let currentSpeedMultiplier = 1;
      if (
        this.context.activePowerups &&
        this.context.activePowerups.freeze > this.context.time
      ) {
        currentSpeedMultiplier *= 0.2; // Slow 80% (Pembekuan Kawanan)
      }

      // Aplikasikan status effects slow / freeze entitas
      if (zombie.status) {
        currentSpeedMultiplier *= zombie.status.getSpeedMultiplier(
          this.context.time
        );
      }

      const distToPlayer = Math.hypot(player.x - zombie.x, player.y - zombie.y);

      if (distToPlayer < zombie.detectionRadius) {
        // Cek apakah ada garis lurus bebas obstacle
        const hasLOS = this.context.hasLineOfSight(
          zombie.x,
          zombie.y,
          player.x,
          player.y
        );

        if (hasLOS) {
          // Garis lurus ke arah player
          dx = (player.x - zombie.x) / distToPlayer;
          dy = (player.y - zombie.y) / distToPlayer;
        } else {
          // Di balik obstacle: ikuti vektor flow field BFS
          const tx = Math.floor(zombie.x / TILE_SIZE);
          const ty = Math.floor(zombie.y / TILE_SIZE);
          const flow = this.context.getFlowDirection(tx, ty);

          if (flow.dx !== 0 || flow.dy !== 0) {
            dx = flow.dx;
            dy = flow.dy;
          } else {
            // Fallback ke arah player langsung jika di luar grid
            dx = (player.x - zombie.x) / distToPlayer;
            dy = (player.y - zombie.y) / distToPlayer;
          }
        }
      } else {
        // Wandering saat di luar radius deteksi
        currentSpeedMultiplier = 0.5;
        zombie.wanderTimer -= dtNormal;
        if (zombie.wanderTimer <= 0) {
          zombie.wanderAngle += (Math.random() - 0.5) * 2;
          zombie.wanderTimer = 30 + Math.random() * 60;
        }
        dx = Math.cos(zombie.wanderAngle);
        dy = Math.sin(zombie.wanderAngle);
      }

      // Separasi antar-zombie menggunakan Spatial Hash (O(n))
      let pushX = 0;
      let pushY = 0;
      const separationRadius = zombie.isBoss ? 50 : 30;
      const neighbors = this.context.spatialHash.query(
        zombie.x,
        zombie.y,
        separationRadius
      );

      for (let j = 0; j < neighbors.length; j++) {
        const other = neighbors[j];
        if (other === zombie) continue;
        const distOther = Math.hypot(zombie.x - other.x, zombie.y - other.y);

        if (distOther < separationRadius && distOther > 0) {
          const pushFactor = (separationRadius - distOther) / separationRadius;
          pushX += ((zombie.x - other.x) / distOther) * pushFactor;
          pushY += ((zombie.y - other.y) / distOther) * pushFactor;
        }
      }

      const finalDx = dx + pushX * 1.5;
      const finalDy = dy + pushY * 1.5;
      const finalLen = Math.hypot(finalDx, finalDy);

      if (finalLen > 0) {
        const oldX = zombie.x;
        const oldY = zombie.y;
        const originalSpeed = zombie.speed;
        zombie.speed = originalSpeed * currentSpeedMultiplier;
        this.moveEntity(
          zombie,
          finalDx / finalLen,
          finalDy / finalLen,
          dtNormal
        );
        zombie.speed = originalSpeed;

        if (distToPlayer >= zombie.detectionRadius) {
          if (
            Math.abs(zombie.x - oldX) < 0.1 &&
            Math.abs(zombie.y - oldY) < 0.1
          ) {
            zombie.wanderAngle += Math.PI + (Math.random() - 0.5);
          }
        }
      }
    }
  }

  update(dtNormal = 1) {
    this.updatePlayerMovement(dtNormal);
    this.updateZombieMovement(dtNormal);
  }
}
