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

    // Setup Warna (TODO-art: palette-swap karakter operatif)
    let baseShirt = "#2c4c8c";
    let baseLight = "#5a7bb8";
    if (player.characterKey === "scout") {
      baseShirt = "#10b981";
      baseLight = "#34d399";
    } else if (player.characterKey === "vanguard") {
      baseShirt = "#64748b";
      baseLight = "#94a3b8";
    } else if (player.characterKey === "arcane") {
      baseShirt = "#8b5cf6";
      baseLight = "#a78bfa";
    }

    const colors = {
      shirt: isHit ? "#ff0000" : baseShirt,
      shirtLight: isHit ? "#ff6666" : baseLight,
      skin: isHit ? "#ff9999" : "#f4a460",
      hair: isHit ? "#8b4513" : "#6b4423",
      pants: isHit ? "#333333" : "#1a1a2e",
      shoes: isHit ? "#555555" : "#2d2d44",
      white: "#ffffff",
      black: "#000000",
    };

    // Efek i-frame (kedip saat dash / skill invulnerable)
    if (player.isInvulnerable && player.isInvulnerable(this.context.time)) {
      ctx.globalAlpha = 0.4 + Math.sin(this.context.time / 30) * 0.3;
    }

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
      // Putar bintang di atas kepala menggunakan game clock
      const time = this.context.time / 200;
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
    drawWeaponSprite(ctx, player.weapon.name, this.context.time);
    ctx.restore();
  }

  drawZombie(zombie, camera) {
    const ctx = this.ctx;
    const screenX = zombie.x - camera.x;
    const screenY = zombie.y - camera.y;

    // Cek apakah Boss
    const isBoss = zombie.isBoss || zombie.type === "zombie_boss";

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

    // Apply visual effects & TODO-art: palette-swap placeholder per tipe musuh
    if (zombie.hitFlash > 0) {
      ctx.globalAlpha = 0.7;
      ctx.filter = "brightness(2) saturate(0) hue-rotate(0deg)"; // Red flash
      zombie.hitFlash--;
    } else if (zombie.status?.isFrozen(this.context.time)) {
      ctx.filter = "hue-rotate(190deg) saturate(2) brightness(1.2)"; // Cyan freeze
    } else if (zombie.status?.isPoisoned(this.context.time)) {
      ctx.filter = "hue-rotate(90deg) saturate(1.8)"; // Green poison
    } else if (zombie.status?.isBurning(this.context.time) || zombie.burning) {
      ctx.filter = "hue-rotate(30deg) saturate(1.8)"; // Orange fire
    } else {
      // TODO-art: palette-swap placeholder arketipe musuh
      switch (zombie.enemyType) {
        case "runner":
          ctx.filter = "hue-rotate(65deg) saturate(1.7)";
          break;
        case "brute":
          ctx.filter = "hue-rotate(250deg) saturate(1.5) brightness(0.85)";
          break;
        case "spitter":
          ctx.filter = "hue-rotate(105deg) saturate(1.8)";
          break;
        case "exploder":
          ctx.filter = "hue-rotate(340deg) saturate(2.2) brightness(1.1)";
          break;
        case "necromancer":
          ctx.filter = "hue-rotate(180deg) saturate(1.8)";
          break;
      }
    }

    // Draw zombie sprite with animation
    zombie.sprite.draw(ctx, screenX, screenY, zombie.facingRight);

    // Reset filters
    ctx.globalAlpha = 1;
    ctx.filter = "none";

    // Burning effect particles menggunakan game clock
    if (zombie.burning) {
      const time = this.context.time / 100;
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
    const ctx = this.ctx;
    const screenX = projectile.x - camera.x;
    const screenY = projectile.y - camera.y;

    // Render proyektil musuh (ludah asam Spitter)
    if (projectile.type === "enemy_projectile") {
      ctx.fillStyle = "#84cc16";
      ctx.beginPath();
      ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4d7c0f";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#d9f99d";
      ctx.fillRect(screenX - 1.5, screenY - 1.5, 3, 3);
      return;
    }

    if (projectile.weapon?.name === "Wizard Book") {
      // Fire projectile effect
      const time = this.context.time / 100;

      // Outer flame glow
      const outerGlow = ctx.createRadialGradient(
        screenX,
        screenY,
        0,
        screenX,
        screenY,
        12
      );
      outerGlow.addColorStop(0, "rgba(255, 100, 0, 0.8)");
      outerGlow.addColorStop(0.5, "rgba(255, 50, 0, 0.4)");
      outerGlow.addColorStop(1, "rgba(255, 0, 0, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Main fireball
      const fireGradient = ctx.createRadialGradient(
        screenX,
        screenY,
        0,
        screenX,
        screenY,
        8
      );
      fireGradient.addColorStop(0, "#fff");
      fireGradient.addColorStop(0.3, "#ffff00");
      fireGradient.addColorStop(0.6, "#ff6600");
      fireGradient.addColorStop(1, "#ff0000");
      ctx.fillStyle = fireGradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Flickering flame particles
      for (let i = 0; i < 5; i++) {
        const angle = (time + i * 1.2) % (Math.PI * 2);
        const dist = 6 + Math.sin(time * 2 + i) * 2;
        const px = screenX + Math.cos(angle) * dist;
        const py = screenY + Math.sin(angle) * dist;
        const size = 2 + Math.sin(time * 3 + i) * 1;

        ctx.fillStyle = `rgba(255, ${150 + Math.sin(time + i) * 50}, 0, ${
          0.6 + Math.sin(time * 2 + i) * 0.3
        })`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core glow (white hot center)
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Trailing smoke/embers
      const dx = projectile.vx;
      const dy = projectile.vy;
      const speed = Math.hypot(dx, dy);
      if (speed > 0) {
        const trailAngle = Math.atan2(dy, dx) + Math.PI;
        for (let i = 0; i < 3; i++) {
          const trailDist = 10 + i * 5;
          const tx = screenX + Math.cos(trailAngle) * trailDist;
          const ty = screenY + Math.sin(trailAngle) * trailDist;
          const trailSize = 3 - i;

          ctx.fillStyle = `rgba(100, 100, 100, ${0.3 - i * 0.1})`;
          ctx.beginPath();
          ctx.arc(tx, ty, trailSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // Dual Gun - Realistic bullet
      const angle = Math.atan2(projectile.vy, projectile.vx);

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(angle);

      // Bullet casing (metallic)
      const bulletGradient = ctx.createLinearGradient(0, -2, 0, 2);
      bulletGradient.addColorStop(0, "#d4af37"); // Gold
      bulletGradient.addColorStop(0.5, "#ffd700");
      bulletGradient.addColorStop(1, "#b8860b");
      ctx.fillStyle = bulletGradient;
      ctx.fillRect(-3, -1.5, 6, 3);

      // Bullet tip (lead)
      ctx.fillStyle = "#4a4a4a";
      ctx.beginPath();
      ctx.moveTo(3, -1.5);
      ctx.lineTo(5, 0);
      ctx.lineTo(3, 1.5);
      ctx.closePath();
      ctx.fill();

      // Bullet highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(-2, -1, 4, 0.8);

      ctx.restore();

      // Tracer trail
      ctx.strokeStyle = "rgba(255, 200, 100, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX - projectile.vx * 2, screenY - projectile.vy * 2);
      ctx.stroke();
    }
  }

  drawEffect(effect, camera) {
    const ctx = this.ctx;
    const screenX = effect.x - camera.x;
    const screenY = effect.y - camera.y;
    const maxLife = effect.maxLife || 20;
    const alpha = Math.max(0, effect.life / maxLife);

    if (effect.type === "melee") {
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(effect.angle);

      const halfArc = effect.arc !== undefined ? effect.arc : 1.0;

      if (effect.weaponName === "Katana") {
        // Outer glow
        ctx.strokeStyle = `rgba(255, 50, 50, ${alpha * 0.3})`;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 45, -halfArc, halfArc);
        ctx.stroke();

        // Middle layer
        ctx.strokeStyle = `rgba(255, 100, 100, ${alpha * 0.6})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 42, -halfArc, halfArc);
        ctx.stroke();

        // Main slash
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 40, -halfArc, halfArc);
        ctx.stroke();

        // Inner edge
        ctx.strokeStyle = `rgba(200, 230, 255, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 38, -halfArc, halfArc);
        ctx.stroke();

        // Speed lines
        for (let i = 0; i < 5; i++) {
          const angle = -halfArc + (i / 5) * (halfArc * 2);
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
            const angle = -halfArc + Math.random() * (halfArc * 2);
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
        // Bare Fist - Large transparent fist
        const fistSize = 35;
        const fistAlpha = alpha * 2; // More transparent

        // Fist base (palm)
        ctx.fillStyle = `rgba(255, 200, 150, ${fistAlpha})`;
        ctx.beginPath();
        ctx.ellipse(fistSize, 0, 18, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Knuckles (4 fingers)
        for (let i = 0; i < 4; i++) {
          const knuckleY = -12 + i * 8;
          ctx.fillStyle = `rgba(230, 180, 130, ${fistAlpha})`;
          ctx.beginPath();
          ctx.ellipse(fistSize + 15, knuckleY, 8, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Knuckle highlights
          ctx.fillStyle = `rgba(255, 220, 180, ${fistAlpha * 0.8})`;
          ctx.beginPath();
          ctx.ellipse(fistSize + 13, knuckleY - 2, 4, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Thumb
        ctx.fillStyle = `rgba(255, 200, 150, ${fistAlpha})`;
        ctx.beginPath();
        ctx.ellipse(fistSize - 5, -15, 7, 10, -0.5, 0, Math.PI * 2);
        ctx.fill();

        // Wrist/forearm
        ctx.fillStyle = `rgba(220, 170, 120, ${fistAlpha * 0.7})`;
        ctx.fillRect(fistSize - 25, -8, 20, 16);

        // Impact lines (motion blur)
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          const offsetY = -10 + i * 10;
          ctx.beginPath();
          ctx.moveTo(fistSize + 20, offsetY);
          ctx.lineTo(fistSize + 35, offsetY);
          ctx.stroke();
        }

        // Impact waves (when alpha is high)
        if (alpha > 0.7) {
          ctx.strokeStyle = `rgba(255, 200, 100, ${alpha * 0.5})`;
          ctx.lineWidth = 2;
          for (let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.arc(fistSize + 25, 0, 20 + i * 10, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    } else if (effect.type === "damage_number") {
      // Khusus Text Stun
      if (typeof effect.damage === "string") {
        ctx.font = "bold 22px 'Hanken Grotesk', sans-serif";
        ctx.fillStyle = `rgba(240, 180, 41, ${alpha})`;
        ctx.fillText(effect.damage, screenX, screenY);
      } else {
        ctx.font = effect.isCritical ? "bold 20px 'Hanken Grotesk', sans-serif" : "15px 'Hanken Grotesk', sans-serif";
        ctx.fillStyle = effect.isCritical
          ? `rgba(240, 180, 41, ${alpha})`
          : `rgba(239, 240, 241, ${alpha})`;
        ctx.fillText(effect.damage, screenX, screenY);
      }
    } else if (effect.type === "heal") {
      ctx.font = "bold 18px 'Hanken Grotesk', sans-serif";
      ctx.fillStyle = `rgba(46, 196, 134, ${alpha})`;
      // Tampilkan dengan tanda plus
      ctx.fillText("+" + effect.amount, screenX, screenY);
    } else if (effect.type === "burn") {
      const size = 8 * (effect.life / 20);
      ctx.fillStyle = `rgba(255, 74, 31, ${alpha})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (effect.type === "explosion") {
      const currentRadius = effect.radius * (1 - alpha);
      const progress = 1 - alpha;

      // Outer shockwave (expanding ring)
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(screenX, screenY, currentRadius * 1.2, 0, Math.PI * 2);
      ctx.stroke();

      // Main explosion fire (orange)
      const fireGradient = ctx.createRadialGradient(
        screenX,
        screenY,
        0,
        screenX,
        screenY,
        currentRadius
      );
      fireGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      fireGradient.addColorStop(0.3, `rgba(255, 200, 0, ${alpha * 0.8})`);
      fireGradient.addColorStop(0.6, `rgba(255, 100, 0, ${alpha * 0.6})`);
      fireGradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
      ctx.fillStyle = fireGradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright core
      ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, currentRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Smoke clouds (expanding)
      if (progress > 0.3) {
        const smokeRadius = currentRadius * 1.5;
        const smokeAlpha = alpha * 0.5;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const dist =
            smokeRadius * (0.7 + Math.sin(progress * Math.PI + i) * 0.3);
          const sx = screenX + Math.cos(angle) * dist;
          const sy = screenY + Math.sin(angle) * dist;

          ctx.fillStyle = `rgba(80, 80, 80, ${smokeAlpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, currentRadius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Debris particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + progress * 0.5;
        const dist = currentRadius * (0.8 + progress * 0.5);
        const px = screenX + Math.cos(angle) * dist;
        const py = screenY + Math.sin(angle) * dist;

        ctx.fillStyle = `rgba(200, 100, 0, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flash effect (early stage)
      if (alpha > 0.7) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(alpha - 0.7) * 2})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, currentRadius * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (effect.type === "death") {
      for (let p of effect.particles) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(180, 255, 220, ${p.alpha})`;
        ctx.arc(screenX + p.x, screenY + p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (effect.type === "magic_trail") {
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
    } else if (effect.type === "smoke_trail") {
      ctx.fillStyle = `rgba(150, 150, 150, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, effect.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  drawPickup(pickup, camera) {
    const screenX = pickup.x - camera.x;
    const screenY = pickup.y - camera.y;

    if (
      screenX < -30 ||
      screenX > this.canvas.width + 30 ||
      screenY < -30 ||
      screenY > this.canvas.height + 30
    ) {
      return;
    }

    const time = this.context.time || 0;

    // Kedip jika sisa waktu tinggal < 3 detik
    const remainingTime = pickup.duration - (time - pickup.spawnTime);
    if (remainingTime < 3000) {
      if (Math.floor(time / 150) % 2 === 0) return;
    }

    const bob = Math.sin(time / 200) * 2;
    const drawY = screenY + bob;
    const ctx = this.ctx;

    // Bayangan tanah
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + 8, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (pickup.pickupType === "coin") {
      // Koin emas retro
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.arc(screenX, drawY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#854d0e";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(screenX - 1, drawY - 1, 2, 2);
    } else if (pickup.pickupType === "medkit") {
      // Medkit retro
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(screenX - 7, drawY - 7, 14, 14);
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 1;
      ctx.strokeRect(screenX - 7, drawY - 7, 14, 14);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(screenX - 2, drawY - 5, 4, 10);
      ctx.fillRect(screenX - 5, drawY - 2, 10, 4);
    } else if (pickup.pickupType === "ammo") {
      // Amunisi retro
      ctx.fillStyle = "#b45309";
      ctx.fillRect(screenX - 6, drawY - 5, 12, 10);
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 1;
      ctx.strokeRect(screenX - 6, drawY - 5, 12, 10);
      ctx.fillStyle = "#fde047";
      ctx.fillRect(screenX - 4, drawY - 3, 3, 6);
      ctx.fillRect(screenX + 1, drawY - 3, 3, 6);
    } else if (pickup.pickupType === "powerup") {
      // Power-up diamond
      const colors = {
        double_damage: "#ff4a1f",
        speed_boost: "#f0b429",
        magnet: "#a855f7",
        freeze: "#22d3ee",
      };
      const col = colors[pickup.powerupId] || "#ffffff";
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(screenX, drawY - 8);
      ctx.lineTo(screenX + 8, drawY);
      ctx.lineTo(screenX, drawY + 8);
      ctx.lineTo(screenX - 8, drawY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(screenX - 1.5, drawY - 1.5, 3, 3);
    }
  }

  drawTelegraphs(camera) {
    const ctx = this.ctx;
    const time = this.context.time || 0;
    const zombies = this.context.zombies || [];

    for (let i = 0; i < zombies.length; i++) {
      const z = zombies[i];
      if (z.health <= 0) continue;

      // 1. Telegraf Serangan Kuat Boss (Charge Line & Ground Slam Circle)
      // TODO-art: aset telegraf visual final dikerjakan terpisah
      const tg = z.activeTelegraph;
      if (tg) {
        const elapsed = time - tg.startTime;
        const progress = Math.min(1.0, Math.max(0, elapsed / tg.duration));

        if (tg.shape === "line") {
          const sx = tg.startX - camera.x;
          const sy = tg.startY - camera.y;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(tg.angle);

          // Area peringatan semi-transparan (Flat OLED safety red)
          ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
          ctx.fillRect(0, -tg.width / 2, tg.length, tg.width);

          // Bar meteran pengisian progresif
          ctx.fillStyle = "rgba(239, 68, 68, 0.45)";
          ctx.fillRect(0, -tg.width / 2, tg.length * progress, tg.width);

          // Garis batas tegas
          ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(0, -tg.width / 2, tg.length, tg.width);

          ctx.restore();
        } else if (tg.shape === "circle") {
          const cx = tg.x - camera.x;
          const cy = tg.y - camera.y;

          ctx.save();
          // Area lingkaran luar
          ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
          ctx.beginPath();
          ctx.arc(cx, cy, tg.radius, 0, Math.PI * 2);
          ctx.fill();

          // Lingkaran progres mengembang ke luar
          ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
          ctx.beginPath();
          ctx.arc(cx, cy, tg.radius * progress, 0, Math.PI * 2);
          ctx.fill();

          // Garis batas lingkaran
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, tg.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }
      }

      // 2. Telegraf Ludah Asam Spitter (Line dash)
      const st = z.skillTelegraph;
      if (st && st.shape === "line") {
        const sx = z.x - camera.x;
        const sy = z.y - camera.y;
        const elapsed = time - st.startTime;
        const progress = Math.min(1.0, elapsed / st.duration);

        ctx.save();
        ctx.strokeStyle = `rgba(132, 204, 22, ${0.4 + progress * 0.5})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(st.targetX - camera.x, st.targetY - camera.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
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
  // ... (render loop)
  render() {
    const { tilemap, camera, zombies, player, projectiles, effects, pickups } =
      this.context;
    const ctx = this.ctx;

    let shakeX = 0;
    let shakeY = 0;
    if (this.context.screenShake > 0) {
      if (this.context.settings?.screenShake !== false) {
        shakeX = (Math.random() - 0.5) * this.context.screenShake;
        shakeY = (Math.random() - 0.5) * this.context.screenShake;
      }
      this.context.screenShake = Math.max(0, this.context.screenShake - 0.5);
    }

    ctx.save();
    if (shakeX !== 0 || shakeY !== 0) {
      ctx.translate(shakeX, shakeY);
    }

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
    if (pickups) {
      for (let pickup of pickups) {
        this.drawPickup(pickup, camera);
      }
    }
    this.drawTelegraphs(camera);
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

    ctx.restore();
  }
}
