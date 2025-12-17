// ... (Imports sama)
import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  TILES,
  CAMERA_LERP,
} from "../core/Constants.js";
import { drawWeaponSprite } from "./SpriteUtils.js";

export class Renderer {
  // ... (Constructor & updateCamera sama)
  constructor(context) {
    this.context = context;
    this.ctx = context.ctx;
    this.canvas = context.canvas;
  }

  updateCamera() {
    // (Isi sama seperti sebelumnya)
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

  // ... (drawTree, drawSpike, drawRock, drawTile, drawProjectile, drawEffect sama)
  // Masukkan method drawTree, drawSpike, drawRock, drawTile, drawProjectile, drawEffect yang sudah ada sebelumnya di sini.
  // Saya hanya akan menuliskan yang berubah: drawZombie dan drawPlayer.

  drawTree(ctx, screenX, screenY) {
    /* ... Copy dari kode sebelumnya ... */
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
    ctx.fillStyle = "#5d4037";
    ctx.fillRect(screenX + 16, screenY + 15, 8, 20);
    ctx.fillStyle = "#1b5e20";
    ctx.beginPath();
    ctx.arc(screenX + 20, screenY + 15, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2e7d32";
    ctx.beginPath();
    ctx.arc(screenX + 12, screenY + 12, 10, 0, Math.PI * 2);
    ctx.arc(screenX + 28, screenY + 12, 10, 0, Math.PI * 2);
    ctx.arc(screenX + 20, screenY + 6, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  drawSpike(ctx, screenX, screenY) {
    /* ... Copy dari kode sebelumnya ... */
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(screenX + 5, screenY + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    ctx.fillStyle = "#d1d5db";
    const drawTri = (ox, oy) => {
      ctx.beginPath();
      ctx.moveTo(ox, oy + 20);
      ctx.lineTo(ox + 5, oy);
      ctx.lineTo(ox + 10, oy + 20);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(ox + 5, oy);
      ctx.lineTo(ox + 3, oy + 5);
      ctx.lineTo(ox + 7, oy + 5);
      ctx.fill();
      ctx.fillStyle = "#d1d5db";
    };
    drawTri(screenX + 8, screenY + 10);
    drawTri(screenX + 22, screenY + 10);
    drawTri(screenX + 15, screenY + 15);
  }
  drawRock(ctx, screenX, screenY) {
    /* ... Copy dari kode sebelumnya ... */
    ctx.fillStyle = "#57534e";
    ctx.beginPath();
    ctx.arc(screenX + 20, screenY + 25, 12, 0, Math.PI * 2);
    ctx.arc(screenX + 20, screenY + 15, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#78716c";
    ctx.beginPath();
    ctx.arc(screenX + 18, screenY + 15, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  drawTile(x, y, tile, screenX, screenY) {
    /* ... Copy dari kode sebelumnya ... */
    const ctx = this.ctx;
    if (tile !== TILES.STONE) {
      ctx.fillStyle = "#2d5016";
      ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
    }
    switch (tile) {
      case TILES.GRASS:
        ctx.fillStyle = "#3d6020";
        if ((x + y) % 3 === 0) {
          ctx.fillRect(screenX + 10, screenY + 10, 4, 4);
          ctx.fillRect(screenX + 30, screenY + 25, 3, 3);
        }
        break;
      case TILES.DIRT:
        ctx.fillStyle = "#5c4033";
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#3e2723";
        ctx.fillRect(screenX + 5, screenY + 5, 4, 4);
        ctx.fillRect(screenX + 25, screenY + 30, 4, 4);
        break;
      case TILES.STONE:
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
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

    // ... (Logika arah hadap sama)
    let facing = "down";
    const angle = player.direction;
    if (Math.abs(angle) < Math.PI / 4) facing = "right";
    else if (Math.abs(angle) > (3 * Math.PI) / 4) facing = "left";
    else if (angle > Math.PI / 4 && angle < (3 * Math.PI) / 4) facing = "down";
    else facing = "up";

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + 14, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(screenX, screenY);

    const isHit = player.hitFlash > 0;
    if (isHit) player.hitFlash--;

    // Setup Warna
    const colors = {
      shirt: isHit ? "#ff0000" : "#2c4c8c",
      shirtLight: isHit ? "#ff6666" : "#5a7bb8",
      skin: isHit ? "#ff9999" : "#f4a460",
      hair: isHit ? "#8b4513" : "#6b4423",
      pants: isHit ? "#333333" : "#1a1a2e",
      shoes: isHit ? "#555555" : "#2d2d44",
      white: "#ffffff",
      black: "#000000",
    };

    const scale = 2;
    ctx.scale(scale, scale);
    ctx.translate(-8, -8);
    ctx.imageSmoothingEnabled = false;

    // ... (Gambar Pixel Art Player Sama persis dengan sebelumnya)
    if (facing === "down") {
      ctx.fillStyle = colors.hair;
      ctx.fillRect(4, 2, 8, 3);
      ctx.fillRect(3, 3, 1, 3);
      ctx.fillRect(12, 3, 1, 3);
      ctx.fillStyle = colors.skin;
      ctx.fillRect(4, 3, 8, 5);
      ctx.fillStyle = colors.white;
      ctx.fillRect(5, 5, 2, 2);
      ctx.fillRect(9, 5, 2, 2);
      ctx.fillStyle = colors.black;
      ctx.fillRect(6, 5, 1, 1);
      ctx.fillRect(10, 5, 1, 1);
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(4, 8, 8, 6);
      ctx.fillStyle = colors.skin;
      ctx.fillRect(2, 9, 2, 3);
      ctx.fillRect(12, 9, 2, 3);
      ctx.fillStyle = colors.pants;
      ctx.fillRect(5, 14, 2, 2);
      ctx.fillRect(9, 14, 2, 2);
      ctx.fillStyle = colors.shoes;
      ctx.fillRect(5, 16, 2, 1);
      ctx.fillRect(9, 16, 2, 1);
    } else if (facing === "up") {
      ctx.fillStyle = colors.hair;
      ctx.fillRect(4, 2, 8, 6);
      ctx.fillRect(3, 3, 10, 4);
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(4, 8, 8, 6);
      ctx.fillStyle = colors.skin;
      ctx.fillRect(2, 9, 2, 3);
      ctx.fillRect(12, 9, 2, 3);
      ctx.fillStyle = colors.pants;
      ctx.fillRect(5, 14, 2, 2);
      ctx.fillRect(9, 14, 2, 2);
      ctx.fillStyle = colors.shoes;
      ctx.fillRect(5, 16, 2, 1);
      ctx.fillRect(9, 16, 2, 1);
    } else if (facing === "right") {
      ctx.fillStyle = colors.hair;
      ctx.fillRect(4, 2, 7, 3);
      ctx.fillRect(3, 3, 3, 5);
      ctx.fillStyle = colors.skin;
      ctx.fillRect(6, 3, 5, 5);
      ctx.fillStyle = colors.white;
      ctx.fillRect(9, 5, 2, 2);
      ctx.fillStyle = colors.black;
      ctx.fillRect(10, 5, 1, 1);
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(5, 8, 6, 6);
      ctx.fillStyle = colors.skin;
      ctx.fillRect(7, 9, 3, 3);
      ctx.fillStyle = colors.pants;
      ctx.fillRect(5, 14, 2, 2);
      ctx.fillRect(8, 14, 2, 2);
      ctx.fillStyle = colors.shoes;
      ctx.fillRect(5, 16, 2, 1);
      ctx.fillRect(8, 16, 2, 1);
    } else if (facing === "left") {
      ctx.fillStyle = colors.hair;
      ctx.fillRect(5, 2, 7, 3);
      ctx.fillRect(10, 3, 3, 5);
      ctx.fillStyle = colors.skin;
      ctx.fillRect(5, 3, 5, 5);
      ctx.fillStyle = colors.white;
      ctx.fillRect(5, 5, 2, 2);
      ctx.fillStyle = colors.black;
      ctx.fillRect(5, 5, 1, 1);
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(5, 8, 6, 6);
      ctx.fillStyle = colors.skin;
      ctx.fillRect(6, 9, 3, 3);
      ctx.fillStyle = colors.pants;
      ctx.fillRect(6, 14, 2, 2);
      ctx.fillRect(9, 14, 2, 2);
      ctx.fillStyle = colors.shoes;
      ctx.fillRect(6, 16, 2, 1);
      ctx.fillRect(9, 16, 2, 1);
    }
    ctx.restore();

    // VISUAL STUN
    if (player.isStunned) {
      ctx.save();
      ctx.translate(screenX, screenY - 40);
      // Putar bintang di atas kepala
      const time = Date.now() / 200;
      ctx.fillStyle = "#FFFF00"; // Kuning
      for (let i = 0; i < 3; i++) {
        const angle = time + (i * Math.PI * 2) / 3;
        const sx = Math.cos(angle) * 15;
        const sy = Math.sin(angle) * 5;
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

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

    // Cek apakah Boss
    const isBoss = zombie.constructor.name === "ZombieBoss";

    // Update facing direction based on movement
    if (zombie.x !== zombie.lastX) {
      zombie.facingRight = zombie.x > zombie.lastX;
      zombie.lastX = zombie.x;
    }

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(
      screenX,
      screenY + (isBoss ? 25 : 10),
      isBoss ? 20 : 8,
      isBoss ? 8 : 4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Apply visual effects (hit flash, burning)
    if (zombie.hitFlash > 0) {
      ctx.globalAlpha = 0.7;
      ctx.filter = "brightness(2) saturate(0) hue-rotate(0deg)"; // Red flash
      zombie.hitFlash--;
    } else if (zombie.burning) {
      ctx.filter = "hue-rotate(30deg) saturate(1.5)"; // Orange tint
    }

    // Draw zombie sprite with animation
    zombie.sprite.draw(ctx, screenX, screenY, zombie.facingRight);

    // Reset filters
    ctx.globalAlpha = 1;
    ctx.filter = "none";

    // Burning effect particles
    if (zombie.burning) {
      const time = Date.now() / 100;
      for (let i = 0; i < 3; i++) {
        const offsetX = Math.sin(time + i) * 5;
        const offsetY = -10 - Math.cos(time + i * 2) * 8;
        ctx.fillStyle = `rgba(255, ${100 + Math.sin(time) * 50}, 0, 0.6)`;
        ctx.beginPath();
        ctx.arc(screenX + offsetX, screenY + offsetY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Health Bar (Tetap di posisi absolut)
    const healthBarWidth = zombie.width;
    const healthPercent = zombie.health / zombie.maxHealth;
    const barYOffset = isBoss ? 50 : 30;

    ctx.fillStyle = "#000";
    ctx.fillRect(
      screenX - healthBarWidth / 2,
      screenY - barYOffset,
      healthBarWidth,
      4
    );

    ctx.fillStyle =
      healthPercent > 0.5
        ? "#22c55e"
        : healthPercent > 0.25
        ? "#eab308"
        : "#ef4444";
    ctx.fillRect(
      screenX - healthBarWidth / 2,
      screenY - barYOffset,
      healthBarWidth * healthPercent,
      4
    );
  }

  drawProjectile(projectile, camera) {
    /* ... Copy dari kode sebelumnya ... */
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
    /* ... Copy dari kode sebelumnya dan yang baru ... */
    const ctx = this.ctx;
    const screenX = effect.x - camera.x;
    const screenY = effect.y - camera.y;
    const maxLife = effect.maxLife || 20;
    const alpha = Math.max(0, effect.life / maxLife);

    if (effect.constructor.name === "MeleeEffect") {
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(effect.angle);
      if (effect.weaponName === "Katana") {
        // Outer glow
        ctx.strokeStyle = `rgba(255, 50, 50, ${alpha * 0.3})`;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 45, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();

        // Middle layer
        ctx.strokeStyle = `rgba(255, 100, 100, ${alpha * 0.6})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 42, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();

        // Main slash
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 40, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();

        // Inner edge
        ctx.strokeStyle = `rgba(200, 230, 255, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 38, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();

        // Speed lines
        for (let i = 0; i < 5; i++) {
          const angle = -Math.PI / 3 + (i / 5) * ((2 * Math.PI) / 3);
          ctx.strokeStyle = `rgba(255, 200, 200, ${alpha * 0.4})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 35, Math.sin(angle) * 35);
          ctx.lineTo(Math.cos(angle) * 50, Math.sin(angle) * 50);
          ctx.stroke();
        }

        // Sparkles
        if (alpha > 0.5) {
          for (let i = 0; i < 8; i++) {
            const angle = -Math.PI / 3 + Math.random() * ((2 * Math.PI) / 3);
            const dist = 35 + Math.random() * 10;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * Math.random()})`;
            ctx.beginPath();
            ctx.arc(
              Math.cos(angle) * dist,
              Math.sin(angle) * dist,
              1.5,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 30, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
      }
      ctx.restore();
    } else if (effect.constructor.name === "DamageNumber") {
      // Khusus Text Stun
      if (typeof effect.damage === "string") {
        ctx.font = "bold 24px monospace";
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.fillText(effect.damage, screenX, screenY);
      } else {
        ctx.font = effect.isCritical ? "bold 20px monospace" : "14px monospace";
        ctx.fillStyle = effect.isCritical
          ? `rgba(255, 215, 0, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText(effect.damage, screenX, screenY);
      }
    } else if (effect.constructor.name === "HealEffect") {
      ctx.font = "bold 18px monospace";
      ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`; // Warna Hijau
      // Tampilkan dengan tanda plus
      ctx.fillText("+" + effect.amount, screenX, screenY);
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
    } else if (effect.constructor.name === "MagicTrail") {
      const color =
        effect.colorType === "purple"
          ? `rgba(168, 85, 247, ${alpha})`
          : `rgba(34, 211, 238, ${alpha})`;
      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, effect.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (effect.constructor.name === "SmokeTrail") {
      ctx.fillStyle = `rgba(150, 150, 150, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, effect.size, 0, Math.PI * 2);
      ctx.fill();
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
  // ... (render loop sama)
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
