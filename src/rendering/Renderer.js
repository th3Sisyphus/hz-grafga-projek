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

  updateCamera() {
    const { player, camera, canvas } = this.context;
    if (!player) return;

    const targetX = player.x - canvas.width / 2;
    const targetY = player.y - canvas.height / 2;

    camera.x += (targetX - camera.x) * CAMERA_LERP;
    camera.y += (targetY - camera.y) * CAMERA_LERP;

    const maxCameraX = MAP_WIDTH * TILE_SIZE - canvas.width;
    const maxCameraY = MAP_HEIGHT * TILE_SIZE - canvas.height;

    camera.x = Math.max(0, Math.min(maxCameraX, camera.x));
    camera.y = Math.max(0, Math.min(maxCameraY, camera.y));
  }

  // ========== ASSET DRAWING (NEW) ==========

  drawTree(ctx, screenX, screenY) {
    // Bayangan
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(
      screenX + TILE_SIZE / 2,
      screenY + TILE_SIZE - 5,
      12,
      6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Batang
    ctx.fillStyle = "#5d4037";
    ctx.fillRect(screenX + 16, screenY + 15, 8, 20);

    // Daun (Cluster of circles)
    ctx.fillStyle = "#1b5e20"; // Dark Green
    ctx.beginPath();
    ctx.arc(screenX + 20, screenY + 15, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2e7d32"; // Lighter Green
    ctx.beginPath();
    ctx.arc(screenX + 12, screenY + 12, 10, 0, Math.PI * 2); // Kiri
    ctx.arc(screenX + 28, screenY + 12, 10, 0, Math.PI * 2); // Kanan
    ctx.arc(screenX + 20, screenY + 6, 10, 0, Math.PI * 2); // Atas
    ctx.fill();
  }

  drawSpike(ctx, screenX, screenY) {
    // Base Plate
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(screenX + 5, screenY + 5, TILE_SIZE - 10, TILE_SIZE - 10);

    // Spikes (3 triangles)
    ctx.fillStyle = "#d1d5db"; // Silver
    const drawTri = (ox, oy) => {
      ctx.beginPath();
      ctx.moveTo(ox, oy + 20);
      ctx.lineTo(ox + 5, oy); // Tip
      ctx.lineTo(ox + 10, oy + 20);
      ctx.fill();

      // Darah di ujung (Opsional, biar serem dikit)
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(ox + 5, oy);
      ctx.lineTo(ox + 3, oy + 5);
      ctx.lineTo(ox + 7, oy + 5);
      ctx.fill();
      ctx.fillStyle = "#d1d5db"; // Reset color
    };

    drawTri(screenX + 8, screenY + 10);
    drawTri(screenX + 22, screenY + 10);
    drawTri(screenX + 15, screenY + 15);
  }

  drawRock(ctx, screenX, screenY) {
    // Main rock
    ctx.fillStyle = "#57534e";
    ctx.beginPath();
    ctx.arc(screenX + 20, screenY + 25, 12, 0, Math.PI * 2); // Bottom part
    ctx.arc(screenX + 20, screenY + 15, 10, 0, Math.PI * 2); // Top part
    ctx.fill();

    // Highlight
    ctx.fillStyle = "#78716c";
    ctx.beginPath();
    ctx.arc(screenX + 18, screenY + 15, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTile(x, y, tile, screenX, screenY) {
    const ctx = this.ctx;

    // Render Ground Layer First
    if (tile !== TILES.STONE) {
      // Default Grass background for transparence
      ctx.fillStyle = "#2d5016";
      ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
    }

    switch (tile) {
      case TILES.GRASS:
        // Texture rumput sederhana
        ctx.fillStyle = "#3d6020";
        if ((x + y) % 3 === 0) {
          // Pattern simple
          ctx.fillRect(screenX + 10, screenY + 10, 4, 4);
          ctx.fillRect(screenX + 30, screenY + 25, 3, 3);
        }
        break;

      case TILES.DIRT:
        ctx.fillStyle = "#5c4033";
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        // Detail kerikil
        ctx.fillStyle = "#3e2723";
        ctx.fillRect(screenX + 5, screenY + 5, 4, 4);
        ctx.fillRect(screenX + 25, screenY + 30, 4, 4);
        break;

      case TILES.STONE: // Wall Border
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        // Brick pattern
        ctx.strokeStyle = "#374151";
        ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        break;

      case TILES.TREE:
        this.drawTree(ctx, screenX, screenY);
        break;

      case TILES.ROCK:
        this.drawRock(ctx, screenX, screenY);
        break;

      case TILES.SPIKE:
        this.drawSpike(ctx, screenX, screenY);
        break;
    }
  }

  drawPlayer(player, camera) {
    const ctx = this.ctx;
    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + 16, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(player.direction);

    // Hit flash effect
    const isHit = player.hitFlash > 0;
    if (isHit) player.hitFlash--;

    // Scale for pixel art (each pixel = 2x2)
    const scale = 2;
    ctx.scale(scale, scale);

    // Center the sprite
    ctx.translate(-8, -8);

    // Disable image smoothing for crisp pixels
    ctx.imageSmoothingEnabled = false;

    // Body - Dark blue shirt
    ctx.fillStyle = isHit ? "#ff0000" : "#2c4c8c";
    ctx.fillRect(4, 8, 8, 6); // Torso

    // Arms
    ctx.fillStyle = isHit ? "#ff6666" : "#5a7bb8";
    ctx.fillRect(2, 9, 2, 4); // Left arm
    ctx.fillRect(12, 9, 2, 4); // Right arm

    // Head - Skin tone
    ctx.fillStyle = isHit ? "#ff9999" : "#f4a460";
    ctx.fillRect(4, 3, 8, 6); // Head

    // Hair - Brown
    ctx.fillStyle = isHit ? "#8b4513" : "#6b4423";
    ctx.fillRect(3, 2, 10, 3); // Hair top
    ctx.fillRect(3, 3, 2, 2); // Left hair
    ctx.fillRect(11, 3, 2, 2); // Right hair
    ctx.fillRect(5, 1, 6, 2); // Hair spikes

    // Eyes - White
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(5, 5, 2, 2); // Left eye
    ctx.fillRect(9, 5, 2, 2); // Right eye

    // Pupils - Black
    ctx.fillStyle = "#000000";
    ctx.fillRect(6, 5, 1, 1); // Left pupil
    ctx.fillRect(10, 5, 1, 1); // Right pupil

    // Mouth
    ctx.fillStyle = "#000000";
    ctx.fillRect(6, 7, 4, 1); // Smile

    // Legs - Dark pants
    ctx.fillStyle = isHit ? "#333333" : "#1a1a2e";
    ctx.fillRect(5, 14, 2, 3); // Left leg
    ctx.fillRect(9, 14, 2, 3); // Right leg

    // Feet
    ctx.fillStyle = isHit ? "#555555" : "#2d2d44";
    ctx.fillRect(4, 16, 3, 1); // Left foot
    ctx.fillRect(9, 16, 3, 1); // Right foot

    ctx.restore();

    // Weapon
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

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + 10, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Zombie Body (more realistic)
    if (zombie.hitFlash > 0) {
      ctx.fillStyle = "#ff0000"; // Flash of red when hit
      zombie.hitFlash--;
    } else if (zombie.burning) {
      ctx.fillStyle = "#ff6600"; // Burning effect
    } else {
      ctx.fillStyle = "#22c55e"; // Default healthy zombie skin
    }

    // Draw Zombie Body (with more details)
    ctx.beginPath();
    ctx.arc(screenX, screenY, zombie.width / 2, 0, Math.PI * 2); // Round body
    ctx.fill();

    // Rotten skin spots (more detailed)
    ctx.fillStyle = "#14532d";
    ctx.beginPath();
    ctx.arc(screenX - 12, screenY - 5, 4, 0, Math.PI * 2); // More detailed rot
    ctx.arc(screenX + 10, screenY + 7, 3, 0, Math.PI * 2);
    ctx.arc(screenX, screenY + 10, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw zombie head (separate from body)
    ctx.fillStyle = "#3b3b3b"; // Skin color for head
    ctx.beginPath();
    ctx.arc(
      screenX,
      screenY - zombie.width / 2 - 10,
      zombie.width / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Eyes (with a creepy look)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(screenX - 7, screenY - zombie.width / 2 - 15, 3, 0, Math.PI * 2); // Left eye
    ctx.arc(screenX + 7, screenY - zombie.width / 2 - 15, 3, 0, Math.PI * 2); // Right eye
    ctx.fill();

    ctx.fillStyle = "#000000"; // Dark pupils
    ctx.beginPath();
    ctx.arc(screenX - 7, screenY - zombie.width / 2 - 15, 1, 0, Math.PI * 2); // Left pupil
    ctx.arc(screenX + 7, screenY - zombie.width / 2 - 15, 1, 0, Math.PI * 2); // Right pupil
    ctx.fill();

    // Mouth (add details)
    ctx.fillStyle = "#cc0000"; // Red for blood
    ctx.beginPath();
    ctx.arc(screenX, screenY - zombie.width / 2 - 5, 6, 0, Math.PI);
    ctx.fill();

    // Blood dripping down from mouth
    ctx.strokeStyle = "#8B0000"; // Dark red for blood
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screenX - 4, screenY - zombie.width / 2); // Start from mouth
    ctx.lineTo(screenX - 8, screenY - zombie.width / 2 + 10); // First drip
    ctx.lineTo(screenX, screenY - zombie.width / 2 + 15); // Second drip
    ctx.lineTo(screenX + 4, screenY - zombie.width / 2 + 10); // Third drip
    ctx.stroke();

    // Health bar (with realistic color coding)
    const healthBarWidth = zombie.width;
    const healthPercent = zombie.health / zombie.maxHealth;
    ctx.fillStyle = "#000";
    ctx.fillRect(screenX - healthBarWidth / 2, screenY - 30, healthBarWidth, 4);
    ctx.fillStyle =
      healthPercent > 0.5
        ? "#22c55e"
        : healthPercent > 0.25
        ? "#eab308"
        : "#ef4444";
    ctx.fillRect(
      screenX - healthBarWidth / 2,
      screenY - 30,
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

    if (effect.constructor.name === "MeleeEffect") {
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(effect.angle);

      if (effect.weaponName === "Katana") {
        ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 40, -Math.PI / 3, Math.PI / 3); // Slash lebih lebar
        ctx.stroke();
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 30, -Math.PI / 4, Math.PI / 4);
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

  render() {
    const { tilemap, camera, zombies, player, projectiles, effects } =
      this.context;
    const ctx = this.ctx;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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

    for (let zombie of zombies) {
      this.drawZombie(zombie, camera);
    }

    if (player) {
      this.drawPlayer(player, camera);
    }

    for (let projectile of projectiles) {
      this.drawProjectile(projectile, camera);
    }

    for (let effect of effects) {
      this.drawEffect(effect, camera);
    }
  }
}
