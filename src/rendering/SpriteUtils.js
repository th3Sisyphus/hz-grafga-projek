/**
 * SpriteUtils.js
 * Utilitas rendering senjata dan ikon berbasis SpriteAtlas pre-baked.
 * Zero gradient, zero shadowBlur, zero Math.random.
 */

import { getSpriteAtlas } from "./sprites/SpriteAtlas.js";

const WEAPON_MAP = {
  Katana: "katana",
  katana: "katana",
  "Tangan Kosong": "fist",
  fist: "fist",
  "Wizard Book": "wizard",
  "Kitab Sihir": "wizard",
  wizard: "wizard",
  "Dual Gun": "dualgun",
  "Pistol Ganda": "dualgun",
  dualgun: "dualgun",
  Shotgun: "shotgun",
  "Shotgun Penumpas": "shotgun",
  shotgun: "shotgun",
};

/**
 * Gambar sprite senjata di tangan pemain.
 * ctx diasumsikan sudah ditranslate dan dirotasi sesuai arah hadap pemain.
 */
export function drawWeaponSprite(ctx, weaponName, gameTime = null) {
  const atlas = getSpriteAtlas();
  const wKey = WEAPON_MAP[weaponName] || "katana";

  let pose = "idle";
  const t = gameTime !== null && gameTime !== undefined ? gameTime : performance.now();

  if (wKey === "wizard") {
    // Buku sihir memiliki 2 frame halaman berkibar lembut (300 ms per frame)
    const f = Math.floor(t / 300) % 3;
    pose = f === 0 ? "idle" : f === 1 ? "flutter1" : "flutter2";
  }

  const canvas = atlas.get(`weapon_${wKey}_${pose}`);
  if (!canvas) return;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Offset anchor tangan agar senjata berada di depan tubuh player
  let offsetX = 10;
  let offsetY = -canvas.height / 2;

  if (wKey === "fist") {
    offsetX = 6;
    offsetY = -canvas.height / 2 + 2;
  } else if (wKey === "wizard") {
    offsetX = 8;
    offsetY = -canvas.height / 2 - 4;
  } else if (wKey === "dualgun") {
    offsetX = 12;
    offsetY = -canvas.height / 2;
  } else if (wKey === "shotgun") {
    offsetX = 14;
    offsetY = -canvas.height / 2;
  }

  ctx.drawImage(canvas, Math.round(offsetX), Math.round(offsetY));
  ctx.restore();
}

/**
 * Ambil canvas ikon senjata untuk HUD / Weapon Select Screen
 */
export function getWeaponIconCanvas(weaponName) {
  const atlas = getSpriteAtlas();
  const wKey = WEAPON_MAP[weaponName] || "katana";
  return atlas.get(`weapon_${wKey}_icon`);
}
