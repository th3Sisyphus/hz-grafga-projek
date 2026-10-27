/**
 * Renderer.js
 * Sistem Rendering Visual Terpadu "Hunty Zombie" (Arah A: Chunky Pixel Art 1:2)
 *
 * FITUR TEKNIS:
 * 1. Pre-baked ground offscreen canvas (1 drawImage per frame untuk seluruh tanah)
 * 2. Y-Sorting untuk seluruh objek berdiri (pohon, batu, spikes, zombie, player, pickups)
 * 3. Nol ctx.filter, nol shadowBlur, nol gradient runtime
 * 4. Animasi berbasis milidetik & game clock, pause menghentikan animasi
 * 5. Hash 2D deterministik untuk seluruh variasi visual (nol Math.random di render)
 * 6. Indikator kerusakan berarah (directional damage) & hit-stop terintegrasi context.fx
 */

import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  TILES,
  CAMERA_LERP,
} from "../core/Constants.js";
import { drawWeaponSprite } from "./SpriteUtils.js";
import { getSpriteAtlas } from "./sprites/SpriteAtlas.js";
import { hash2D } from "./sprites/palette.js";

export class Renderer {
  constructor(context) {
    this.context = context;
    this.ctx = context.ctx;
    this.canvas = context.canvas;
    this.atlas = getSpriteAtlas(2);

    // Offscreen Canvas untuk lapisan tanah statis (2000x2000)
    this.groundCanvas = null;
    this.groundBakedMap = null;

    // Decal mayat zombie di tanah (maksimal 60 bangkai)
    this.corpses = [];

    // FPS Counter Sederhana
    this.fps = 60;
    this.fpsFrames = 0;
    this.lastFpsUpdate = performance.now();
  }

  /**
   * Bake seluruh lapisan tanah statis (rumput, tanah, batu jalan, dekorasi)
   * ke offscreen canvas SATU KALI per peta.
   */
  bakeGroundLayer(tilemap) {
    if (!tilemap) return;

    const width = MAP_WIDTH * TILE_SIZE;
    const height = MAP_HEIGHT * TILE_SIZE;

    this.groundCanvas = document.createElement("canvas");
    this.groundCanvas.width = width;
    this.groundCanvas.height = height;
    const gCtx = this.groundCanvas.getContext("2d");
    gCtx.imageSmoothingEnabled = false;

    // Gambar setiap tile tanah
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = tilemap[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        // Base tile
        if (tile === TILES.DIRT) {
          // Cek autotile tepi ke rumput
          const isNorthGrass = y > 0 && tilemap[y - 1][x] === TILES.GRASS;
          const isSouthGrass = y < MAP_HEIGHT - 1 && tilemap[y + 1][x] === TILES.GRASS;
          const isWestGrass = x > 0 && tilemap[y][x - 1] === TILES.GRASS;
          const isEastGrass = x < MAP_WIDTH - 1 && tilemap[y][x + 1] === TILES.GRASS;

          if (isNorthGrass) {
            this.atlas.draw(gCtx, "dirt_edge_N", px, py);
          } else if (isSouthGrass) {
            this.atlas.draw(gCtx, "dirt_edge_S", px, py);
          } else if (isWestGrass) {
            this.atlas.draw(gCtx, "dirt_edge_W", px, py);
          } else if (isEastGrass) {
            this.atlas.draw(gCtx, "dirt_edge_E", px, py);
          } else {
            const varIdx = hash2D(x, y, 3);
            this.atlas.draw(gCtx, `dirt_${varIdx}`, px, py);
          }
        } else if (tile === TILES.STONE) {
          const varIdx = hash2D(x, y, 3);
          this.atlas.draw(gCtx, `stone_${varIdx}`, px, py);
        } else {
          // Default: Rumput Rawa 6 varian
          const varIdx = hash2D(x, y, 6);
          this.atlas.draw(gCtx, `grass_${varIdx}`, px, py);
        }

        // Dekorasi tanpa tabrakan (~8% chance, hanya di area terbuka)
        if (
          tile === TILES.GRASS &&
          hash2D(x * 13, y * 37, 100) < 8 &&
          x > 2 &&
          x < MAP_WIDTH - 3 &&
          y > 2 &&
          y < MAP_HEIGHT - 3
        ) {
          const decorIdx = hash2D(x, y, 6);
          const decorCanvas = this.atlas.get(`decor_${decorIdx}`);
          if (decorCanvas) {
            const ox = px + (hash2D(x, y + 1, 8));
            const oy = py + (hash2D(x + 1, y, 8));
            gCtx.drawImage(decorCanvas, ox, oy);
          }
        }
      }
    }

    this.groundBakedMap = tilemap;
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

  /**
   * Catat bangkai mayat zombie saat mati
   */
  addCorpse(x, y, isBoss, facingRight, swap = 0) {
    this.corpses.push({
      x,
      y,
      isBoss,
      facingRight,
      swap,
      time: this.context.time || performance.now(),
      alpha: 1.0,
    });
    // Batasi jumlah bangkai agar tidak bocor memori (maksimal 60)
    if (this.corpses.length > 60) {
      this.corpses.shift();
    }
  }

  /**
   * Render Player (grid 16px scale 2 = 32px)
   */
  drawPlayer(player, camera) {
    const ctx = this.ctx;
    const screenX = Math.round(player.x - camera.x);
    const screenY = Math.round(player.y - camera.y);

    // Arah hadap
    let facing = "down";
    const angle = player.direction;
    if (Math.abs(angle) < Math.PI / 4) facing = "right";
    else if (Math.abs(angle) > (3 * Math.PI) / 4) facing = "left";
    else if (angle > Math.PI / 4 && angle < (3 * Math.PI) / 4) facing = "down";
    else facing = "up";

    // Bayangan tanah padat berindeks palet (tanpa blur)
    ctx.fillStyle = "#121417";
    ctx.fillRect(screenX - 8, screenY + 12, 16, 4);

    ctx.save();
    ctx.translate(screenX, screenY);

    const isHit = player.hitFlash > 0;
    if (isHit) player.hitFlash--;

    // Setup Warna
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

    // Jika terkena hit flash, gunakan warna siluet putih murni (#f8fafc)
    const colors = {
      shirt: isHit ? "#f8fafc" : baseShirt,
      shirtLight: isHit ? "#ffffff" : baseLight,
      skin: isHit ? "#f8fafc" : "#f4a460",
      hair: isHit ? "#e2e8f0" : "#6b4423",
      pants: isHit ? "#cbd5e1" : "#1a1a2e",
      shoes: isHit ? "#94a3b8" : "#2d2d44",
      white: "#ffffff",
      black: "#08090a",
    };

    // Efek i-frame (kedip saat dash / skill invulnerable)
    if (
      player.isInvincible ||
      (typeof player.isInvulnerable === "function" &&
        player.isInvulnerable(this.context.time))
    ) {
      ctx.globalAlpha = 0.4 + Math.sin(this.context.time / 30) * 0.3;
    }

    const scale = 2;
    ctx.scale(scale, scale);
    ctx.translate(-8, -8);
    ctx.imageSmoothingEnabled = false;

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

    // Visual Stun Bintang Piksel Berputar (tanpa Math.random)
    if (player.isStunned) {
      const time = this.context.time || performance.now();
      const starFrame = Math.floor(time / 120) % 3;
      const starCanvas = this.atlas.get(`stun_star_${starFrame}`);
      if (starCanvas) {
        for (let i = 0; i < 3; i++) {
          const orbitAngle = (time / 250) + (i * Math.PI * 2) / 3;
          const sx = screenX + Math.round(Math.cos(orbitAngle) * 16);
          const sy = screenY - 24 + Math.round(Math.sin(orbitAngle) * 6);
          ctx.drawImage(starCanvas, sx - starCanvas.width / 2, sy - starCanvas.height / 2);
        }
      }
    }

    // Weapon Sprite
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(player.direction);
    drawWeaponSprite(ctx, player.weapon.name, this.context.time);
    ctx.restore();
  }

  /**
   * Render Zombie / Boss
   */
  drawZombie(zombie, camera) {
    const ctx = this.ctx;
    const screenX = Math.round(zombie.x - camera.x);
    const screenY = Math.round(zombie.y - camera.y);

    const isBoss = zombie.isBoss || zombie.type === "zombie_boss";

    // Update arah hadap
    if (zombie.x !== zombie.lastX) {
      zombie.facingRight = zombie.x > zombie.lastX;
      zombie.lastX = zombie.x;
    }

    // Bayangan tanah padat piksel (tanpa blur)
    ctx.fillStyle = "#121417";
    if (isBoss) {
      ctx.fillRect(screenX - 16, screenY + 22, 32, 8);
    } else {
      ctx.fillRect(screenX - 8, screenY + 10, 16, 4);
    }

    // Cek status hit flash & enrage
    const isHit = zombie.hitFlash > 0;
    if (isHit) zombie.hitFlash--;
    const isEnraged = isBoss && zombie.phase === 3;

    // Draw sprite via pre-baked atlas (0 filter!)
    zombie.sprite.draw(ctx, screenX, screenY, zombie.facingRight, isHit, isEnraged);

    // Partikel pembakaran: bintik piksel oranye padat (tanpa gradient)
    if (zombie.burning || zombie.status?.isBurning(this.context.time)) {
      const time = this.context.time || 0;
      for (let i = 0; i < 3; i++) {
        const hx = ((time / 50 + i * 37) % 16) - 8;
        const hy = -10 - ((time / 40 + i * 29) % 12);
        ctx.fillStyle = i % 2 === 0 ? "#ff4a1f" : "#f0b429";
        ctx.fillRect(screenX + Math.round(hx), screenY + Math.round(hy), 2, 2);
      }
    }

    // Health Bar
    const healthBarWidth = isBoss ? 56 : 28;
    const healthPercent = Math.max(0, Math.min(1, zombie.health / zombie.maxHealth));
    const barYOffset = isBoss ? 44 : 22;

    ctx.fillStyle = "#08090a";
    ctx.fillRect(
      screenX - healthBarWidth / 2 - 1,
      screenY - barYOffset - 1,
      healthBarWidth + 2,
      5
    );

    ctx.fillStyle =
      healthPercent > 0.5
        ? "#2ec486"
        : healthPercent > 0.25
        ? "#f0b429"
        : "#ff4a1f";
    ctx.fillRect(
      screenX - healthBarWidth / 2,
      screenY - barYOffset,
      Math.round(healthBarWidth * healthPercent),
      3
    );
  }

  /**
   * Render Proyektil (Pistol, Shotgun, Wizard Orb, Acid)
   */
  drawProjectile(projectile, camera) {
    const ctx = this.ctx;
    const screenX = Math.round(projectile.x - camera.x);
    const screenY = Math.round(projectile.y - camera.y);

    // Ludah asam musuh (Spitter)
    if (projectile.type === "enemy_projectile") {
      const f = Math.floor((this.context.time || 0) / 100) % 2;
      const canvas = this.atlas.get(`acid_spit_${f}`);
      if (canvas) {
        ctx.drawImage(canvas, screenX - canvas.width / 2, screenY - canvas.height / 2);
      }
      return;
    }

    // Wizard Magic Orb
    if (projectile.weapon?.name === "Wizard Book" || projectile.weapon?.name === "Kitab Sihir") {
      const time = this.context.time || 0;
      // Inti api piksel konsentris 3-nada (R: putih, U: ambar, T: oranye)
      ctx.fillStyle = "#ff4a1f";
      ctx.fillRect(screenX - 5, screenY - 5, 10, 10);
      ctx.fillStyle = "#f0b429";
      ctx.fillRect(screenX - 3, screenY - 3, 6, 6);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(screenX - 1, screenY - 1, 2, 2);

      // Ekor percikan piksel deterministik
      for (let i = 1; i <= 3; i++) {
        const ox = Math.round(Math.cos(projectile.direction + Math.PI) * (i * 4));
        const oy = Math.round(Math.sin(projectile.direction + Math.PI) * (i * 4));
        ctx.fillStyle = i === 1 ? "#f0b429" : "#ff4a1f";
        ctx.fillRect(screenX + ox, screenY + oy, 3 - i + 1, 3 - i + 1);
      }
      return;
    }

    // Dual Gun / Shotgun Bullet Tracer
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(projectile.direction);
    // Badan peluru baja berkilau
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(-6, -1, 12, 2);
    ctx.fillStyle = "#f0b429";
    ctx.fillRect(-10, -1, 4, 2);
    ctx.restore();
  }

  /**
   * Render Efek Tempur (Melee Arc, Shockwave, Ichor Splash, Claw, Stun, Heal)
   */
  drawEffect(effect, camera) {
    const ctx = this.ctx;
    const screenX = Math.round(effect.x - camera.x);
    const screenY = Math.round(effect.y - camera.y);
    const alpha = Math.max(0, Math.min(1, effect.life / effect.maxLife));

    if (effect.type === "melee") {
      const isKatana = effect.weaponName === "Katana" || effect.weaponName === "katana";
      const isFist = effect.weaponName === "Tangan Kosong" || effect.weaponName === "fist";

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(effect.angle);

      if (isKatana) {
        // Sprite tebasan piksel tajam dari atlas
        const frame = Math.min(3, effect.frame || 0);
        const slashKey = effect.isCritical
          ? `slash_crit_${frame}`
          : `slash_katana_${frame}`;
        const canvas = this.atlas.get(slashKey);
        if (canvas) {
          // Posisi tebasan di depan bilah katana
          const forwardOffset = Math.round(effect.range * 0.45);
          ctx.drawImage(
            canvas,
            forwardOffset,
            Math.round(-canvas.height / 2)
          );
        }
      } else if (isFist) {
        // Cincin kejut pukulan kepalan perban
        const frame = Math.min(2, effect.frame || 0);
        const canvas = this.atlas.get(`fist_shockwave_${frame}`);
        if (canvas) {
          ctx.drawImage(canvas, 10, Math.round(-canvas.height / 2));
        }
      }

      ctx.restore();
    } else if (effect.type === "ichor_splash") {
      // Percikan cairan zombie di koordinat ZOMBIE
      const frame = Math.min(2, effect.frame || 0);
      const canvas = this.atlas.get(`ichor_splash_${frame}`);
      if (canvas) {
        ctx.drawImage(canvas, screenX - canvas.width / 2, screenY - canvas.height / 2);
      }
    } else if (effect.type === "zombie_claw") {
      // Sabetan cakar 3 frame di tubuh player
      const frame = Math.min(2, effect.frame || 0);
      const canvas = this.atlas.get(`zombie_claw_${frame}`);
      if (canvas) {
        ctx.drawImage(canvas, screenX - canvas.width / 2, screenY - canvas.height / 2);
      }
    } else if (effect.type === "ground_slam") {
      // Hantaman gempa boss cincin kejut
      const canvas = this.atlas.get("ground_slam_ring");
      if (canvas) {
        const progress = 1 - alpha;
        const currentScale = 0.5 + progress * 0.8;
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(currentScale, currentScale);
        ctx.globalAlpha = alpha;
        ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        ctx.restore();
      }
    } else if (effect.type === "damage_number") {
      ctx.font = effect.isCritical
        ? "bold 18px monospace"
        : "bold 14px monospace";
      ctx.fillStyle = effect.isCritical ? "#f0b429" : "#f8fafc";
      ctx.fillText(effect.damage, screenX, screenY);
    } else if (effect.type === "heal") {
      ctx.font = "bold 16px monospace";
      ctx.fillStyle = "#2ec486";
      ctx.fillText("+" + effect.amount, screenX, screenY);
    } else if (effect.type === "burn") {
      ctx.fillStyle = "#ff4a1f";
      ctx.fillRect(screenX - 2, screenY - 2, 4, 4);
    } else if (effect.type === "explosion") {
      // Ledakan piksel tajam bertingkat
      const rad = Math.round(effect.radius * (1 - alpha));
      ctx.strokeStyle = "#ff4a1f";
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX - rad, screenY - rad, rad * 2, rad * 2);
      ctx.fillStyle = "#f0b429";
      ctx.fillRect(screenX - rad / 2, screenY - rad / 2, rad, rad);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(screenX - rad / 4, screenY - rad / 4, rad / 2, rad / 2);
    }
  }

  /**
   * Render Telegraf Serangan Boss & Musuh (Hazard Chevrons)
   */
  drawTelegraphs(camera) {
    const ctx = this.ctx;
    const time = this.context.time || performance.now();
    const zombies = this.context.zombies || [];

    for (let i = 0; i < zombies.length; i++) {
      const z = zombies[i];
      if (z.health <= 0) continue;

      // 1. Telegraf Boss (Charge Line & Ground Slam Circle)
      const tg = z.activeTelegraph;
      if (tg) {
        const elapsed = time - tg.startTime;
        const progress = Math.min(1.0, Math.max(0, elapsed / tg.duration));

        if (tg.shape === "line") {
          const sx = Math.round(tg.startX - camera.x);
          const sy = Math.round(tg.startY - camera.y);

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(tg.angle);

          // Jalur semi-transparan flat red
          ctx.fillStyle = "rgba(204, 55, 20, 0.25)";
          ctx.fillRect(0, -tg.width / 2, tg.length, tg.width);

          // Bar pengisian progresif
          ctx.fillStyle = "rgba(255, 74, 31, 0.5)";
          ctx.fillRect(0, -tg.width / 2, Math.round(tg.length * progress), tg.width);

          // Garis batas striping bahaya piksel (Hazard Stripes)
          ctx.strokeStyle = "#ff4a1f";
          ctx.lineWidth = 2;
          ctx.strokeRect(0, -tg.width / 2, tg.length, tg.width);

          // Striping diagonal chevron bahaya
          ctx.strokeStyle = "rgba(255, 74, 31, 0.6)";
          ctx.lineWidth = 2;
          const stripeStep = 20;
          for (let px = 0; px < tg.length; px += stripeStep) {
            ctx.beginPath();
            ctx.moveTo(px, -tg.width / 2);
            ctx.lineTo(px + 10, tg.width / 2);
            ctx.stroke();
          }

          ctx.restore();
        } else if (tg.shape === "circle") {
          const cx = Math.round(tg.x - camera.x);
          const cy = Math.round(tg.y - camera.y);

          ctx.save();
          // Lingkaran bahaya luar
          ctx.fillStyle = "rgba(204, 55, 20, 0.22)";
          ctx.beginPath();
          ctx.arc(cx, cy, tg.radius, 0, Math.PI * 2);
          ctx.fill();

          // Pengisian konsentris
          ctx.fillStyle = "rgba(255, 74, 31, 0.45)";
          ctx.beginPath();
          ctx.arc(cx, cy, Math.round(tg.radius * progress), 0, Math.PI * 2);
          ctx.fill();

          // Border piksel tebal
          ctx.strokeStyle = "#ff4a1f";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, tg.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }
      }

      // 2. Telegraf Ludah Spitter
      const st = z.skillTelegraph;
      if (st && st.shape === "line") {
        const sx = Math.round(z.x - camera.x);
        const sy = Math.round(z.y - camera.y);

        ctx.save();
        ctx.strokeStyle = "#2ec486";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(Math.round(st.targetX - camera.x), Math.round(st.targetY - camera.y));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
  }

  /**
   * Indikator Arah Kerusakan di Tepi Layar (Directional Damage Vignette)
   */
  drawDirectionalDamageIndicators() {
    const fx = this.context.fx;
    if (!fx || !fx.directionalIndicators || fx.directionalIndicators.length === 0) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < fx.directionalIndicators.length; i++) {
      const ind = fx.directionalIndicators[i];
      if (ind.alpha <= 0) continue;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ind.angle);

      // Busur merah tegas di tepi layar
      const dist = Math.min(w, h) * 0.46;
      ctx.strokeStyle = `rgba(255, 74, 31, ${ind.alpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, dist, -0.25, 0.25);
      ctx.stroke();

      // Panah chevron di tengah
      ctx.fillStyle = `rgba(255, 74, 31, ${ind.alpha})`;
      ctx.beginPath();
      ctx.moveTo(dist + 6, 0);
      ctx.lineTo(dist - 6, -8);
      ctx.lineTo(dist - 2, 0);
      ctx.lineTo(dist - 6, 8);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  drawPickup(pickup, camera) {
    const screenX = Math.round(pickup.x - camera.x);
    const screenY = Math.round(pickup.y - camera.y);

    if (
      screenX < -30 ||
      screenX > this.canvas.width + 30 ||
      screenY < -30 ||
      screenY > this.canvas.height + 30
    ) {
      return;
    }

    const time = this.context.time || 0;
    const remainingTime = pickup.duration - (time - pickup.spawnTime);
    if (remainingTime < 3000 && Math.floor(time / 150) % 2 === 0) {
      return;
    }

    const bob = Math.round(Math.sin(time / 200) * 2);
    const drawY = screenY + bob;
    const ctx = this.ctx;

    // Bayangan
    ctx.fillStyle = "#121417";
    ctx.fillRect(screenX - 6, screenY + 6, 12, 3);

    if (pickup.pickupType === "coin") {
      ctx.fillStyle = "#f0b429";
      ctx.fillRect(screenX - 5, drawY - 5, 10, 10);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(screenX - 2, drawY - 2, 4, 4);
    } else if (pickup.pickupType === "medkit") {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(screenX - 6, drawY - 6, 12, 12);
      ctx.fillStyle = "#2ec486";
      ctx.fillRect(screenX - 2, drawY - 5, 4, 10);
      ctx.fillRect(screenX - 5, drawY - 2, 10, 4);
    } else if (pickup.pickupType === "ammo") {
      ctx.fillStyle = "#302014";
      ctx.fillRect(screenX - 6, drawY - 5, 12, 10);
      ctx.fillStyle = "#f0b429";
      ctx.fillRect(screenX - 4, drawY - 3, 3, 6);
      ctx.fillRect(screenX + 1, drawY - 3, 3, 6);
    } else if (pickup.pickupType === "powerup") {
      ctx.fillStyle = "#ff4a1f";
      ctx.fillRect(screenX - 6, drawY - 6, 12, 12);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(screenX - 2, drawY - 2, 4, 4);
    }
  }

  drawWaveDelayBanner(waveNumber) {
    this.ctx.fillStyle = "rgba(8, 9, 10, 0.75)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 32px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `GELOMBANG ${waveNumber}`,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.font = "16px monospace";
    this.ctx.fillStyle = "#ff4a1f";
    this.ctx.fillText(
      "Bersiaplah Menghadapi Kawanan...",
      this.canvas.width / 2,
      this.canvas.height / 2 + 36
    );
  }

  /**
   * Main Render Pipeline
   */
  render() {
    const { tilemap, camera, zombies, player, projectiles, effects, pickups } =
      this.context;
    const ctx = this.ctx;

    // Hitung FPS
    this.fpsFrames++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round((this.fpsFrames * 1000) / (now - this.lastFpsUpdate));
      this.fpsFrames = 0;
      this.lastFpsUpdate = now;
    }

    // Pastikan pixel art selalu tajam
    ctx.imageSmoothingEnabled = false;

    // Shake kamera deterministik dari context.fx
    const shake = this.context.fx ? this.context.fx.getShakeOffset() : { x: 0, y: 0 };

    ctx.save();
    if (shake.x !== 0 || shake.y !== 0) {
      ctx.translate(shake.x, shake.y);
    }

    // 1. Bake ground canvas jika belum ada atau map berubah
    if (!this.groundCanvas || this.groundBakedMap !== tilemap) {
      this.bakeGroundLayer(tilemap);
    }

    // 2. Blit satu kali lapisan tanah statis (O(1))
    const camX = Math.round(camera.x);
    const camY = Math.round(camera.y);
    ctx.drawImage(
      this.groundCanvas,
      camX,
      camY,
      this.canvas.width,
      this.canvas.height,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    // 3. Render Bangkai Mayat Decal di Tanah (sebelum entitas berdiri)
    const time = this.context.time || now;
    for (let i = this.corpses.length - 1; i >= 0; i--) {
      const c = this.corpses[i];
      const age = time - c.time;
      if (age > 2800) {
        this.corpses.splice(i, 1);
        continue;
      }
      const alpha = age > 2000 ? Math.max(0, 1 - (age - 2000) / 800) : 1.0;
      ctx.save();
      ctx.globalAlpha = alpha;
      const key = c.isBoss
        ? `boss_death_5_${c.facingRight ? "right" : "left"}`
        : `zombie_normal_death_3_s${c.swap}_${c.facingRight ? "right" : "left"}`;
      this.atlas.draw(ctx, key, c.x - camera.x, c.y - camera.y, true);
      ctx.restore();
    }

    // 4. Koleksi renderables untuk Y-SORT
    const renderables = [];

    // Pohon & Batu berdiri di area pandang kamera
    const startX = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
    const startY = Math.max(0, Math.floor(camY / TILE_SIZE) - 2);
    const endX = Math.min(MAP_WIDTH, startX + Math.ceil(this.canvas.width / TILE_SIZE) + 2);
    const endY = Math.min(MAP_HEIGHT, startY + Math.ceil(this.canvas.height / TILE_SIZE) + 3);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = tilemap[y][x];
        const screenX = x * TILE_SIZE - camX;
        const screenY = y * TILE_SIZE - camY;

        if (tile === TILES.TREE) {
          // Pohon berdiri: kaki pohon berada di (y + 1) * TILE_SIZE
          const treeVar = hash2D(x, y, 3);
          const swayFrame = Math.floor(time / 600) % 2;
          renderables.push({
            y: (y + 1) * TILE_SIZE,
            draw: () => {
              const canvas = this.atlas.get(`tree_${treeVar}_${swayFrame}`);
              if (canvas) {
                // Posisi pohon sedikit bergeser agar bayangannya pas di petak tile
                ctx.drawImage(canvas, screenX - 4, screenY - 28);
              }
            },
          });
        } else if (tile === TILES.ROCK) {
          const rockVar = hash2D(x, y, 3);
          renderables.push({
            y: (y + 1) * TILE_SIZE,
            draw: () => {
              this.atlas.draw(ctx, `rock_${rockVar}`, screenX, screenY);
            },
          });
        } else if (tile === TILES.SPIKE) {
          renderables.push({
            y: (y + 0.5) * TILE_SIZE,
            draw: () => {
              this.atlas.draw(ctx, "spike_extended", screenX, screenY);
            },
          });
        }
      }
    }

    // Pickups
    if (pickups) {
      for (let pickup of pickups) {
        renderables.push({
          y: pickup.y,
          draw: () => this.drawPickup(pickup, camera),
        });
      }
    }

    // Zombies
    for (let zombie of zombies) {
      renderables.push({
        y: zombie.y,
        draw: () => this.drawZombie(zombie, camera),
      });
    }

    // Player
    if (player) {
      renderables.push({
        y: player.y,
        draw: () => this.drawPlayer(player, camera),
      });
    }

    // Urutkan berdasarkan koordinat Y (Y-SORT)
    renderables.sort((a, b) => a.y - b.y);

    // Gambar seluruh renderables secara berurutan
    for (let item of renderables) {
      item.draw();
    }

    // 5. Telegraf di atas tanah
    this.drawTelegraphs(camera);

    // 6. Proyektil di atas entitas
    for (let projectile of projectiles) {
      this.drawProjectile(projectile, camera);
    }

    // 7. Efek Tempur di atas segalanya
    for (let effect of effects) {
      this.drawEffect(effect, camera);
    }

    // 8. Indikator Arah Kerusakan (Directional Damage Vignette)
    this.drawDirectionalDamageIndicators();

    // 9. Overlay Pudar Stun Player
    if (player && player.isStunned) {
      ctx.fillStyle = "rgba(240, 180, 41, 0.12)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 10. Zombie Off-screen Direction Indicator (Tracker/Radar)
    this.drawZombieOffscreenIndicators(camera);

    // 11. FPS & Performance Counter di Pojok Atas
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = this.fps >= 55 ? "#2ec486" : "#ff4a1f";
    ctx.fillText(`${this.fps} FPS | Sprites: Baked Atlas | Filters: 0`, 12, 20);

    ctx.restore();
  }

  /**
   * Zombie Off-screen Direction Indicator (Tracker/Radar)
   * KONDISI AKTIF: HANYA aktif jika sudah TIDAK ADA NPC yang hidup di map (npcs.length === 0)
   * DETEKSI TARGET: Loop semua zombie aktif yang posisinya berada di luar batas viewport/kamera saat ini
   * INDIKATOR VISUAL: Panah/segitiga merah berputar (Math.atan2) clamped edge margin ~25-30px, outline putih tipis
   * Dipanggil di layer HUD/UI canvas teratas
   */
  drawZombieOffscreenIndicators(camera) {
    const { player, zombies, npcs } = this.context;
    if (!player || player.health <= 0 || !zombies || zombies.length === 0) return;

    // KONDISI AKTIF: HANYA aktif jika sudah TIDAK ADA NPC yang hidup di map (npcs.length === 0)
    const hasLivingNpc = npcs && npcs.length > 0 && npcs.some((npc) => npc.health > 0);
    if (hasLivingNpc) return;

    const ctx = this.ctx;
    const viewW = this.canvas.width;
    const viewH = this.canvas.height;
    const camX = camera.x;
    const camY = camera.y;

    // Batas viewport kamera dalam koordinat dunia
    const viewLeft = camX;
    const viewRight = camX + viewW;
    const viewTop = camY;
    const viewBottom = camY + viewH;

    // Posisi layar pemain
    const playerScreenX = player.x - camX;
    const playerScreenY = player.y - camY;

    // Clamped edge margin (~25-30px dari border canvas)
    const margin = 28;
    const minX = margin;
    const maxX = viewW - margin;
    const minY = margin;
    const maxY = viewH - margin;

    // Anchor ray-cast dari posisi screen pemain yang di-clamp di dalam margin layar
    const startX = Math.max(minX + 1, Math.min(maxX - 1, playerScreenX));
    const startY = Math.max(minY + 1, Math.min(maxY - 1, playerScreenY));

    for (let i = 0; i < zombies.length; i++) {
      const zombie = zombies[i];
      if (zombie.health <= 0) continue;

      // DETEKSI TARGET: Periksa apakah zombie berada di luar batas viewport/kamera
      const isOffScreen =
        zombie.x < viewLeft ||
        zombie.x > viewRight ||
        zombie.y < viewTop ||
        zombie.y > viewBottom;

      if (!isOffScreen) continue;

      // INDIKATOR VISUAL: Hitung sudut vektor arah dari Player ke Zombie
      const dx = zombie.x - player.x;
      const dy = zombie.y - player.y;
      const angle = Math.atan2(dy, dx);

      // Hitung perpotongan ray dari startX/startY sepanjang cos/sin angle ke tepi layar
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      let t = Infinity;
      if (cosA > 0.0001) {
        t = Math.min(t, (maxX - startX) / cosA);
      } else if (cosA < -0.0001) {
        t = Math.min(t, (minX - startX) / cosA);
      }

      if (sinA > 0.0001) {
        t = Math.min(t, (maxY - startY) / sinA);
      } else if (sinA < -0.0001) {
        t = Math.min(t, (minY - startY) / sinA);
      }

      let drawX = startX + cosA * t;
      let drawY = startY + sinA * t;

      // Clamping ganda agar presisi di margin tepi layar
      drawX = Math.max(minX, Math.min(maxX, drawX));
      drawY = Math.max(minY, Math.min(maxY, drawY));

      // Gambar indikator panah/segitiga merah berputar menghadap arah zombie
      ctx.save();
      ctx.translate(drawX, drawY);
      ctx.rotate(angle);

      const isBoss = !!zombie.isBoss;
      const arrowLength = isBoss ? 16 : 12;
      const arrowWidth = isBoss ? 11 : 8;

      ctx.beginPath();
      ctx.moveTo(arrowLength, 0); // Ujung panah menunjuk ke arah target zombie
      ctx.lineTo(-arrowLength * 0.75, -arrowWidth);
      ctx.lineTo(-arrowLength * 0.35, 0); // Lekukan belakang (notch)
      ctx.lineTo(-arrowLength * 0.75, arrowWidth);
      ctx.closePath();

      // Warna panah merah kontras
      ctx.fillStyle = isBoss ? "#ff1744" : "#e53935";
      ctx.fill();

      // Outline putih tipis agar kontras di segala jenis latar map
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.restore();
    }
  }
}
