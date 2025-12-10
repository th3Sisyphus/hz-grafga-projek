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

    if (!this.context.isObstacle(nextX, entity.y)) {
      entity.x = nextX;
    }
    if (!this.context.isObstacle(entity.x, nextY)) {
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

  updatePlayerMovement() {
    const { player, keys, joystickInput } = this.context;
    if (!player) return;

    // LOGIC STUN: Player beku
    if (player.isStunned) return;

    let dx = 0;
    let dy = 0;

    if (joystickInput && joystickInput.active) {
      dx = joystickInput.x;
      dy = joystickInput.y;

      // Langsung gerakkan player menggunakan vector joystick
      this.moveEntity(player, dx, dy);

      // Return agar tidak ditimpa oleh logic keyboard
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
      let currentSpeedMultiplier = 1;

      const distToPlayer = Math.hypot(player.x - zombie.x, player.y - zombie.y);

      if (distToPlayer < zombie.detectionRadius) {
        dx = player.x - zombie.x;
        dy = player.y - zombie.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
          dx /= dist;
          dy /= dist;
        }
      } else {
        currentSpeedMultiplier = 0.5;
        zombie.wanderTimer--;
        if (zombie.wanderTimer <= 0) {
          zombie.wanderAngle += (Math.random() - 0.5) * 2;
          zombie.wanderTimer = 30 + Math.random() * 60;
        }
        dx = Math.cos(zombie.wanderAngle);
        dy = Math.sin(zombie.wanderAngle);
      }

      let pushX = 0;
      let pushY = 0;
      // Radius separasi Boss lebih besar
      const separationRadius =
        zombie.constructor.name === "ZombieBoss" ? 50 : 30;

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

      const finalDx = dx + pushX * 1.5;
      const finalDy = dy + pushY * 1.5;
      const finalLen = Math.hypot(finalDx, finalDy);

      if (finalLen > 0) {
        const oldX = zombie.x;
        const oldY = zombie.y;
        const originalSpeed = zombie.speed;
        zombie.speed = originalSpeed * currentSpeedMultiplier;
        this.moveEntity(zombie, finalDx / finalLen, finalDy / finalLen);
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

  update() {
    this.updatePlayerMovement();
    this.updateZombieMovement();
  }
}
