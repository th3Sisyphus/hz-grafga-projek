import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  TILES,
  CAMERA_LERP,
} from "../core/Constants.js";
import { drawWeaponSprite } from "./SpriteUtils.js";

export class Renderer {
  constructor(context) {
    this.context = context;
    this.ctx = context.ctx;
    this.canvas = context.canvas;
  }

  // ========== CAMERA SYSTEM (Infrastructure/View Layer) ==========
  /**
   * Memperbarui posisi kamera berdasarkan posisi Player.
   */
  updateCamera() {
    const { player, camera, canvas } = this.context;
    if (!player) return;

    const targetX = player.x - canvas.width / 2;
    const targetY = player.y - canvas.height / 2;

    // Interpolasi (Lerp) pergerakan kamera untuk efek halus
    camera.x += (targetX - camera.x) * CAMERA_LERP;
    camera.y += (targetY - camera.y) * CAMERA_LERP;

    // Batasan kamera agar tidak keluar dari batas peta
    const maxCameraX = MAP_WIDTH * TILE_SIZE - canvas.width;
    const maxCameraY = MAP_HEIGHT * TILE_SIZE - canvas.height;

    camera.x = Math.max(0, Math.min(maxCameraX, camera.x));
    camera.y = Math.max(0, Math.min(maxCameraY, camera.y));
  }

  // ========== DRAWING HELPERS ==========

  drawTile(x, y, tile, screenX, screenY) {
    const ctx = this.ctx;
    switch (tile) {
      case TILES.GRASS:
        ctx.fillStyle = "#2d5016";
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#3d6020";
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(
            screenX + Math.random() * TILE_SIZE,
            screenY + Math.random() * TILE_SIZE,
            2,
            2
          );
        }
        break;
      case TILES.DIRT:
        ctx.fillStyle = "#4a3728";
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        break;
      case TILES.STONE:
        ctx.fillStyle = "#6b7280";
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        break;
      case TILES.TREE:
        ctx.fillStyle = "#2d5016";
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#654321";
        ctx.fillRect(screenX + 12, screenY + 10, 16, 20);
        ctx.fillStyle = "#1a4d0a";
        ctx.beginPath();
        ctx.arc(screenX + 20, screenY + 15, 15, 0, Math.PI * 2);
        ctx.fill();
        break;
      case TILES.ROCK:
        ctx.fillStyle = "#2d5016";
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#4b5563";
        ctx.beginPath();
        ctx.moveTo(screenX + 10, screenY + 30);
        ctx.lineTo(screenX + 20, screenY + 10);
        ctx.lineTo(screenX + 30, screenY + 30);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }

  drawPlayer(player, camera) {
    const ctx = this.ctx;
    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;

    // Player body - Menggunakan state hitFlash dari Domain untuk logika visual
    if (player.hitFlash > 0) {
      ctx.fillStyle = "#ff0000";
      player.hitFlash--;
    } else {
      ctx.fillStyle = "#3b82f6";
    }
    ctx.fillRect(
      screenX - player.width / 2,
      screenY - player.height / 2,
      player.width,
      player.height
    );

    // Player eyes/details
    ctx.fillStyle = "#1e40af";
    ctx.fillRect(screenX - 10, screenY - 5, 20, 10);
    ctx.fillStyle = "#fff";
    ctx.fillRect(screenX - 5, screenY - 15, 4, 4);
    ctx.fillRect(screenX + 2, screenY - 15, 4, 4);

    // Weapon - Menggunakan state direction dari Domain untuk rotasi
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(player.direction);
    drawWeaponSprite(ctx, player.weapon.name);
    ctx.restore();
  }

  drawZombie(zombie, camera) {
    const ctx = this.ctx;
    const screenX = zombie.x - camera.x;
    const screenY = zombie.y - camera.y;

    // Zombie body
    if (zombie.hitFlash > 0) {
      ctx.fillStyle = "#ff0000";
      zombie.hitFlash--;
    } else if (zombie.burning) {
      ctx.fillStyle = "#ff6600";
    } else {
      ctx.fillStyle = "#22c55e";
    }

    ctx.fillRect(
      screenX - zombie.width / 2,
      screenY - zombie.height / 2,
      zombie.width,
      zombie.height
    );

    // Zombie details
    ctx.fillStyle = "#166534";
    ctx.fillRect(screenX - 8, screenY - 8, 6, 8);
    ctx.fillRect(screenX + 2, screenY - 8, 6, 8);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(screenX - 6, screenY + 5, 3, 3);
    ctx.fillRect(screenX + 3, screenY + 5, 3, 3);

    // Health bar
    const healthBarWidth = zombie.width;
    const healthPercent = zombie.health / zombie.maxHealth;
    ctx.fillStyle = "#000";
    ctx.fillRect(screenX - healthBarWidth / 2, screenY - 20, healthBarWidth, 4);
    ctx.fillStyle =
      healthPercent > 0.5
        ? "#22c55e"
        : healthPercent > 0.25
        ? "#eab308"
        : "#ef4444";
    ctx.fillRect(
      screenX - healthBarWidth / 2,
      screenY - 20,
      healthBarWidth * healthPercent,
      4
    );
  }

  drawProjectile(projectile, camera) {
    const ctx = this.ctx;
    const screenX = projectile.x - camera.x;
    const screenY = projectile.y - camera.y;

    if (projectile.weapon.name === "Wizard Book") {
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ff6600";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawEffect(effect, camera) {
    const ctx = this.ctx;
    const screenX = effect.x - camera.x;
    const screenY = effect.y - camera.y;
    const alpha = effect.life / (effect.maxLife || 20);

    // Menggunakan constructor.name untuk menentukan efek yang digambar
    if (effect.constructor.name === "MeleeEffect") {
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(effect.angle);

      if (effect.weaponName === "Katana") {
        ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 30, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 25, -Math.PI / 6, Math.PI / 6);
        ctx.stroke();
      }
      ctx.restore();
    } else if (effect.constructor.name === "DamageNumber") {
      ctx.font = effect.isCritical ? "bold 20px monospace" : "14px monospace";
      ctx.fillStyle = effect.isCritical
        ? `rgba(255, 215, 0, ${alpha})`
        : `rgba(255, 255, 255, ${alpha})`;
      ctx.textAlign = "center";
      ctx.fillText(effect.damage, screenX, screenY);
    } else if (effect.constructor.name === "BurnEffect") {
      const size = 8 * (effect.life / 20);
      ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (effect.constructor.name === "ExplosionEffect") {
      const currentRadius = effect.radius * (1 - alpha);

      ctx.strokeStyle = `rgba(255, 165, 0, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(screenX, screenY, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 69, 0, ${alpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, screenY, currentRadius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    } else if (effect.constructor.name === "DeathEffect") {
      for (let p of effect.particles) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(180, 255, 220, ${p.alpha})`;
        ctx.arc(screenX + p.x, screenY + p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawWaveDelayBanner(waveNumber) {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 36px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `WAVE ${waveNumber}`,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.font = "20px monospace";
    this.ctx.fillText(
      "Get Ready...",
      this.canvas.width / 2,
      this.canvas.height / 2 + 40
    );
  }

  // ========== MAIN RENDER LOOP ==========
  render() {
    const { tilemap, camera, zombies, player, projectiles, effects } =
      this.context;
    const ctx = this.ctx;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Tilemap
    const startX = Math.floor(camera.x / TILE_SIZE);
    const startY = Math.floor(camera.y / TILE_SIZE);
    const endX = Math.min(
      MAP_WIDTH,
      startX + Math.ceil(this.canvas.width / TILE_SIZE) + 1
    );
    const endY = Math.min(
      MAP_HEIGHT,
      startY + Math.ceil(this.canvas.height / TILE_SIZE) + 1
    );

    for (let y = Math.max(0, startY); y < endY; y++) {
      for (let x = Math.max(0, startX); x < endX; x++) {
        const screenX = x * TILE_SIZE - camera.x;
        const screenY = y * TILE_SIZE - camera.y;
        this.drawTile(x, y, tilemap[y][x], screenX, screenY);
      }
    }

    // 2. Draw Entities
    for (let zombie of zombies) {
      this.drawZombie(zombie, camera);
    }

    if (player) {
      this.drawPlayer(player, camera);
    }

    // 3. Draw Projectiles
    for (let projectile of projectiles) {
      this.drawProjectile(projectile, camera);
    }

    // 4. Draw Effects (on top of everything)
    for (let effect of effects) {
      this.drawEffect(effect, camera);
    }
  }
}
