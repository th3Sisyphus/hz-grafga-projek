import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from "../core/Constants.js";

export class MovementSystem {
  constructor(context) {
    this.context = context;
  }

  /**
   * Memindahkan entitas (Player atau Zombie) sambil memeriksa collision dengan obstacle.
   */
  moveEntity(entity, dx, dy) {
    const { isObstacle } = this.context;
    const newX = entity.x + dx * entity.speed;
    const newY = entity.y + dy * entity.speed;
    const halfW = entity.width / 2;
    const halfH = entity.height / 2;

    const checkCollision = (cx, cy) => {
      const corners = [
        { x: cx - halfW, y: cy - halfH }, // Top Left
        { x: cx + halfW, y: cy - halfH }, // Top Right
        { x: cx - halfW, y: cy + halfH }, // Bottom Left
        { x: cx + halfW, y: cy + halfH }, // Bottom Right
      ];
      for (let corner of corners) {
        if (isObstacle(corner.x, corner.y)) return true;
      }
      return false;
    };

    // 1. Move X (cek collision di Y lama)
    if (!checkCollision(newX, entity.y)) {
      entity.x = newX;
    }

    // 2. Move Y (cek collision di X baru)
    if (!checkCollision(entity.x, newY)) {
      entity.y = newY;
    }

    // 3. Boundary Check (Player/Zombie tidak boleh keluar map)
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
      // Normalisasi vektor pergerakan
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;

      this.moveEntity(player, dx, dy);
    }
  }

  updateZombieMovement() {
    const { zombies, player } = this.context;
    if (!player) return;

    for (let zombie of zombies) {
      const dx = player.x - zombie.x;
      const dy = player.y - zombie.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0) {
        // Normalisasi dan hitung pergerakan
        const moveX = dx / dist;
        const moveY = dy / dist;

        // Gunakan moveEntity yang sudah memperhitungkan zombie.speed
        this.moveEntity(zombie, moveX, moveY);
      }
    }
  }

  update() {
    this.updatePlayerMovement();
    this.updateZombieMovement();
  }
}
