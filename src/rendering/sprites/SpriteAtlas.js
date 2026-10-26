/**
 * SpriteAtlas.js
 * Engine Atlas Pre-Baking Offscreen Canvas untuk Hunty Zombie.
 * Mem-bake SELURUH sprite dan varian (flip, hit flash siluet, palette swap)
 * sekali saat startup ke offscreen canvas O(1).
 * Menjamin 0 filter, 0 shadowBlur, 0 gradient runtime.
 */

import { createBakedCanvas } from "./palette.js";
import {
  GRASS_VARIANTS,
  DIRT_VARIANTS,
  DIRT_EDGES,
  STONE_VARIANTS,
  TREE_VARIANTS,
  ROCK_VARIANTS,
  SPIKE_STATES,
  DECORATION_VARIANTS,
} from "./environmentSprites.js";
import { WEAPON_SPRITES } from "./weaponSprites.js";
import {
  KATANA_SLASH_FRAMES,
  CRIT_SLASH_FRAMES,
  FIST_SHOCKWAVE_FRAMES,
  ZOMBIE_CLAW_FRAMES,
  ICHOR_SPLASH_FRAMES,
  ACID_SPIT_FRAMES,
  STUN_STAR_FRAMES,
  GROUND_SLAM_SHOCKWAVE,
} from "./combatFxSprites.js";
import {
  ZOMBIE_NORMAL_FRAMES,
  ZOMBIE_PALETTE_SWAPS,
  ENEMY_ARCHETYPE_PALETTES,
} from "./zombieSpritesData.js";
import { BOSS_FRAMES, BOSS_ENRAGE_PALETTE_MAP } from "./bossSpritesData.js";

export class SpriteAtlas {
  constructor(scale = 2) {
    this.scale = scale;
    this.registry = new Map();
    this.bakeAll();
  }

  /**
   * Daftarkan dan simpan canvas hasil bake
   */
  register(key, canvas) {
    this.registry.set(key, canvas);
  }

  /**
   * Ambil canvas yang sudah di-bake.
   */
  get(key) {
    return this.registry.get(key) || null;
  }

  /**
   * Helper draw cepat dengan integer pixel rounding
   */
  draw(ctx, key, x, y, centered = false) {
    const canvas = this.registry.get(key);
    if (!canvas) return false;

    const px = Math.round(centered ? x - canvas.width / 2 : x);
    const py = Math.round(centered ? y - canvas.height / 2 : y);
    ctx.drawImage(canvas, px, py);
    return true;
  }

  /**
   * Proses baking seluruh sprite saat startup
   */
  bakeAll() {
    const scale = this.scale;

    // 1. Lingkungan (Tiles & Obstacles)
    for (let i = 0; i < GRASS_VARIANTS.length; i++) {
      this.register(`grass_${i}`, createBakedCanvas(GRASS_VARIANTS[i], scale));
    }
    for (let i = 0; i < DIRT_VARIANTS.length; i++) {
      this.register(`dirt_${i}`, createBakedCanvas(DIRT_VARIANTS[i], scale));
    }
    for (const [edge, rows] of Object.entries(DIRT_EDGES)) {
      this.register(`dirt_edge_${edge}`, createBakedCanvas(rows, scale));
    }
    for (let i = 0; i < STONE_VARIANTS.length; i++) {
      this.register(`stone_${i}`, createBakedCanvas(STONE_VARIANTS[i], scale));
    }
    for (let i = 0; i < TREE_VARIANTS.length; i++) {
      for (let f = 0; f < TREE_VARIANTS[i].frames.length; f++) {
        this.register(
          `tree_${i}_${f}`,
          createBakedCanvas(TREE_VARIANTS[i].frames[f], scale)
        );
      }
    }
    for (let i = 0; i < ROCK_VARIANTS.length; i++) {
      this.register(`rock_${i}`, createBakedCanvas(ROCK_VARIANTS[i], scale));
    }
    this.register(
      "spike_retracted",
      createBakedCanvas(SPIKE_STATES.retracted, scale)
    );
    this.register(
      "spike_extended",
      createBakedCanvas(SPIKE_STATES.extended, scale)
    );
    for (let i = 0; i < DECORATION_VARIANTS.length; i++) {
      this.register(`decor_${i}`, createBakedCanvas(DECORATION_VARIANTS[i], scale));
    }

    // 2. Senjata (Katana, Fist, Wizard, Dualgun, Shotgun)
    for (const [wKey, data] of Object.entries(WEAPON_SPRITES)) {
      for (const [pose, rows] of Object.entries(data)) {
        if (pose === "anchor") continue;
        // Normal & Flipped
        this.register(`weapon_${wKey}_${pose}`, createBakedCanvas(rows, scale));
        this.register(
          `weapon_${wKey}_${pose}_flip`,
          createBakedCanvas(rows, scale, { flipX: true })
        );
      }
    }

    // 3. Efek Tempur (Combat FX)
    for (let i = 0; i < KATANA_SLASH_FRAMES.length; i++) {
      this.register(
        `slash_katana_${i}`,
        createBakedCanvas(KATANA_SLASH_FRAMES[i], scale)
      );
      this.register(
        `slash_katana_${i}_flip`,
        createBakedCanvas(KATANA_SLASH_FRAMES[i], scale, { flipX: true })
      );
    }
    for (let i = 0; i < CRIT_SLASH_FRAMES.length; i++) {
      this.register(
        `slash_crit_${i}`,
        createBakedCanvas(CRIT_SLASH_FRAMES[i], scale)
      );
      this.register(
        `slash_crit_${i}_flip`,
        createBakedCanvas(CRIT_SLASH_FRAMES[i], scale, { flipX: true })
      );
    }
    for (let i = 0; i < FIST_SHOCKWAVE_FRAMES.length; i++) {
      this.register(
        `fist_shockwave_${i}`,
        createBakedCanvas(FIST_SHOCKWAVE_FRAMES[i], scale)
      );
    }
    for (let i = 0; i < ZOMBIE_CLAW_FRAMES.length; i++) {
      this.register(
        `zombie_claw_${i}`,
        createBakedCanvas(ZOMBIE_CLAW_FRAMES[i], scale)
      );
    }
    for (let i = 0; i < ICHOR_SPLASH_FRAMES.length; i++) {
      this.register(
        `ichor_splash_${i}`,
        createBakedCanvas(ICHOR_SPLASH_FRAMES[i], scale)
      );
    }
    for (let i = 0; i < ACID_SPIT_FRAMES.length; i++) {
      this.register(
        `acid_spit_${i}`,
        createBakedCanvas(ACID_SPIT_FRAMES[i], scale)
      );
    }
    for (let i = 0; i < STUN_STAR_FRAMES.length; i++) {
      this.register(
        `stun_star_${i}`,
        createBakedCanvas(STUN_STAR_FRAMES[i], scale)
      );
    }
    this.register(
      "ground_slam_ring",
      createBakedCanvas(GROUND_SLAM_SHOCKWAVE[0], scale)
    );

    // 4. Zombie Biasa (Walk, Attack, Spawn, Death) x (Normal, Flip) x (Hit Flash) x (4 Palette Swaps + Arketipe)
    const animTypes = ["walk", "attack", "spawn", "death"];
    for (const anim of animTypes) {
      const frames = ZOMBIE_NORMAL_FRAMES[anim];
      for (let f = 0; f < frames.length; f++) {
        const rows = frames[f];

        // 4 Palette Swaps Warga/Militer/Hazmat/Ghoul
        for (let s = 0; s < ZOMBIE_PALETTE_SWAPS.length; s++) {
          const colorMap = ZOMBIE_PALETTE_SWAPS[s];
          const baseKey = `zombie_normal_${anim}_${f}_s${s}`;

          // Normal
          this.register(
            `${baseKey}_right`,
            createBakedCanvas(rows, scale, { colorMap, flipX: false })
          );
          // Flipped Left
          this.register(
            `${baseKey}_left`,
            createBakedCanvas(rows, scale, { colorMap, flipX: true })
          );
          // Hit Flash Siluet Putih (tanpa ctx.filter!)
          this.register(
            `${baseKey}_right_hit`,
            createBakedCanvas(rows, scale, {
              whiteSilhouette: true,
              flipX: false,
            })
          );
          this.register(
            `${baseKey}_left_hit`,
            createBakedCanvas(rows, scale, {
              whiteSilhouette: true,
              flipX: true,
            })
          );
        }

        // Arketipe Musuh Khusus (Runner, Brute, Spitter, Exploder, Necromancer)
        for (const [archKey, archMap] of Object.entries(
          ENEMY_ARCHETYPE_PALETTES
        )) {
          const baseKey = `zombie_${archKey}_${anim}_${f}`;
          this.register(
            `${baseKey}_right`,
            createBakedCanvas(rows, scale, { colorMap: archMap, flipX: false })
          );
          this.register(
            `${baseKey}_left`,
            createBakedCanvas(rows, scale, { colorMap: archMap, flipX: true })
          );
          this.register(
            `${baseKey}_right_hit`,
            createBakedCanvas(rows, scale, {
              whiteSilhouette: true,
              flipX: false,
            })
          );
          this.register(
            `${baseKey}_left_hit`,
            createBakedCanvas(rows, scale, {
              whiteSilhouette: true,
              flipX: true,
            })
          );
        }
      }
    }

    // 5. Boss (Walk 4f, Attack 5f, Death 6f) x (Normal & Enrage Fase 3) x (Hit Flash) x (Right & Left)
    const bossAnims = ["walk", "attack", "death"];
    for (const anim of bossAnims) {
      const frames = BOSS_FRAMES[anim];
      for (let f = 0; f < frames.length; f++) {
        const rows = frames[f];

        // Normal Phase 1 & 2
        this.register(
          `boss_${anim}_${f}_right`,
          createBakedCanvas(rows, scale, { flipX: false })
        );
        this.register(
          `boss_${anim}_${f}_left`,
          createBakedCanvas(rows, scale, { flipX: true })
        );
        this.register(
          `boss_${anim}_${f}_right_hit`,
          createBakedCanvas(rows, scale, {
            whiteSilhouette: true,
            flipX: false,
          })
        );
        this.register(
          `boss_${anim}_${f}_left_hit`,
          createBakedCanvas(rows, scale, {
            whiteSilhouette: true,
            flipX: true,
          })
        );

        // Enraged Phase 3 (Merah Ambar Panas)
        this.register(
          `boss_enraged_${anim}_${f}_right`,
          createBakedCanvas(rows, scale, {
            colorMap: BOSS_ENRAGE_PALETTE_MAP,
            flipX: false,
          })
        );
        this.register(
          `boss_enraged_${anim}_${f}_left`,
          createBakedCanvas(rows, scale, {
            colorMap: BOSS_ENRAGE_PALETTE_MAP,
            flipX: true,
          })
        );
      }
    }
  }
}

// Global Singleton Instance untuk kenyamanan runtime
let globalAtlas = null;
export function getSpriteAtlas(scale = 2) {
  if (!globalAtlas) {
    globalAtlas = new SpriteAtlas(scale);
  }
  return globalAtlas;
}
