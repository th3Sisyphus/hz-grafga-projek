/**
 * ZombieSprite.js
 * Sprite controller berbasis SpriteAtlas Offscreen Canvas.
 * Menggantikan seluruh render prosedural dan ctx.filter dengan pre-baked sprite atlas.
 */

import { getSpriteAtlas } from "./sprites/SpriteAtlas.js";

export class ZombieSprite {
  constructor(isBoss = false, enemyType = "normal", seed = 0) {
    this.isBoss = isBoss;
    this.enemyType = enemyType;
    this.size = isBoss ? 64 : 32;
    this.paletteSwap = isBoss ? 0 : Math.abs(seed % 4);

    this.currentAnimation = "walk";
    this.animationFrame = 0;
    this.animationTime = 0;

    // Konfigurasi durasi per frame (berbasis milidetik)
    this.animations = {
      walk: { frames: 4, speed: 150 }, // 150 ms per frame
      attack: { frames: isBoss ? 5 : 4, speed: isBoss ? 110 : 100 },
      spawn: { frames: 3, speed: 150 },
      death: { frames: isBoss ? 6 : 4, speed: 120 },
    };

    this.atlas = getSpriteAtlas();
  }

  /**
   * Update animasi berbasis delta waktu milidetik
   */
  update(deltaTimeMs, isAttacking = false) {
    // Jika sedang dalam animasi kematian, jangan kembali ke walk/attack
    if (this.currentAnimation === "death") {
      const anim = this.animations.death;
      this.animationTime += deltaTimeMs;
      if (this.animationTime >= anim.speed) {
        this.animationTime = 0;
        if (this.animationFrame < anim.frames - 1) {
          this.animationFrame++;
        }
      }
      return;
    }

    const nextAnim = isAttacking ? "attack" : "walk";
    if (this.currentAnimation !== nextAnim) {
      this.currentAnimation = nextAnim;
      this.animationFrame = 0;
      this.animationTime = 0;
    }

    const anim = this.animations[this.currentAnimation];
    this.animationTime += deltaTimeMs;

    if (this.animationTime >= anim.speed) {
      this.animationTime = 0;
      this.animationFrame = (this.animationFrame + 1) % anim.frames;
    }
  }

  /**
   * Mulai animasi kematian
   */
  playDeath() {
    this.currentAnimation = "death";
    this.animationFrame = 0;
    this.animationTime = 0;
  }

  /**
   * Render sprite menggunakan canvas yang telah di-bake di atlas (O(1))
   */
  draw(ctx, x, y, facingRight = true, isHit = false, isEnraged = false) {
    const dir = facingRight ? "right" : "left";
    let key;

    if (this.isBoss) {
      const prefix = isEnraged ? "boss_enraged" : "boss";
      const hitSuffix = isHit ? "_hit" : "";
      key = `${prefix}_${this.currentAnimation}_${this.animationFrame}_${dir}${hitSuffix}`;
    } else {
      const hitSuffix = isHit ? "_hit" : "";
      // Cek apakah arketipe musuh khusus
      if (
        this.enemyType === "runner" ||
        this.enemyType === "brute" ||
        this.enemyType === "spitter" ||
        this.enemyType === "exploder" ||
        this.enemyType === "necromancer"
      ) {
        key = `zombie_${this.enemyType}_${this.currentAnimation}_${this.animationFrame}_${dir}${hitSuffix}`;
      } else {
        key = `zombie_normal_${this.currentAnimation}_${this.animationFrame}_s${this.paletteSwap}_${dir}${hitSuffix}`;
      }
    }

    // Jika key tidak ditemukan (fallback)
    let canvas = this.atlas.get(key);
    if (!canvas) {
      canvas = this.atlas.get(`zombie_normal_walk_0_s0_right`);
    }

    if (canvas) {
      const px = Math.round(x - canvas.width / 2);
      const py = Math.round(y - canvas.height / 2);
      ctx.drawImage(canvas, px, py);
    }
  }
}
