/**
 * HUNTY ZOMBIE — The 32-Color Quarantine Palette
 * Seluruh visual in-game hanya menggunakan 32 warna baku ini.
 */

export const PALETTE = [
  "#08090a", // 0: void-black (Outline, bayangan terdalam)
  "#121417", // 1: night-abyss (Bayangan entitas)
  "#1b1e23", // 2: slate-shadow (Batu gelap)
  "#2a2f38", // 3: slate-mid (Batu sedang)
  "#3f4754", // 4: slate-light (Batu terang)
  "#1a1612", // 5: dirt-shadow (Tanah gelap)
  "#2e251b", // 6: dirt-mid (Tanah sedang)
  "#4a3d2e", // 7: dirt-light (Tanah terang)
  "#131c14", // 8: swamp-shadow (Rumput rawa bayangan)
  "#223324", // 9: swamp-mid (Rumput rawa dasar)
  "#374f3a", // A: swamp-light (Rumput rawa terang)
  "#1c140e", // B: bark-shadow (Kulit pohon bayangan)
  "#302014", // C: bark-mid (Kulit pohon dasar)
  "#483422", // D: bark-light (Kulit pohon terang)
  "#19241b", // E: canopy-shadow (Daun bayangan)
  "#2a3d2e", // F: canopy-mid (Daun dasar)
  "#3f5944", // G: canopy-light (Daun terang)
  "#1c2420", // H: zombie-shadow (Daging zombie bayangan)
  "#2f3d35", // I: zombie-mid (Daging zombie dasar)
  "#4d6155", // J: zombie-light (Daging zombie terang)
  "#241818", // K: ichor-dark (Cairan/darah gelap)
  "#402222", // L: ichor-mid (Cairan/darah sedang)
  "#20232a", // M: rag-shadow (Baju robek bayangan)
  "#363b47", // N: rag-mid (Baju robek dasar)
  "#2b333d", // O: steel-shadow (Baja bayangan)
  "#526070", // P: steel-mid (Baja sedang)
  "#94a3b8", // Q: steel-light (Baja terang / mata pisau)
  "#e2e8f0", // R: steel-gleam (Kilau baja putih-terang)
  "#cc3714", // S: hazard-deep (Oranye tua bahaya)
  "#ff4a1f", // T: safety-orange (Safety Orange UI token)
  "#f0b429", // U: amber-spark (Mata zombie / percikan crit)
  "#2ec486", // V: vital-green (Hijau penyembuh UI token)
];

// Peta karakter ASCII 1-karakter ke index warna palet
export const CHAR_TO_INDEX = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9, "A": 10, "B": 11, "C": 12, "D": 13, "E": 14, "F": 15,
  "G": 16, "H": 17, "I": 18, "J": 19, "K": 20, "L": 21, "M": 22, "N": 23,
  "O": 24, "P": 25, "Q": 26, "R": 27, "S": 28, "T": 29, "U": 30, "V": 31,
};

/**
 * Konversi string pixel art berindeks palet ke offscreen canvas.
 * @param {string[]} rows - Array string, tiap karakter mewakili 1 piksel. Titik '.' menandakan transparan.
 * @param {number} scale - Faktor skala perbesaran integer (1, 2, 4, dll)
 * @param {boolean|Object} options - Opsi whiteSilhouette atau object { whiteSilhouette, flipX, colorMap }
 * @returns {HTMLCanvasElement}
 */
export function createBakedCanvas(rows, scale = 1, options = false) {
  const height = rows.length;
  const width = rows[0].length;

  let whiteSilhouette = false;
  let flipX = false;
  let colorMap = null;

  if (typeof options === "boolean") {
    whiteSilhouette = options;
  } else if (options && typeof options === "object") {
    whiteSilhouette = !!options.whiteSilhouette;
    flipX = !!options.flipX;
    colorMap = options.colorMap || null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const imgData = ctx.createImageData(canvas.width, canvas.height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const row = rows[y];
    for (let x = 0; x < width; x++) {
      // Jika flipX, baca baris secara terbalik
      const srcX = flipX ? width - 1 - x : x;
      let char = row[srcX];
      if (char === "." || char === " ") continue;

      // Terapkan palette swap jika ada colorMap
      if (colorMap && colorMap[char]) {
        char = colorMap[char];
      }

      let r, g, b, a = 255;
      if (whiteSilhouette) {
        r = 248; g = 250; b = 252;
      } else {
        const idx = CHAR_TO_INDEX[char] !== undefined ? CHAR_TO_INDEX[char] : 0;
        const hex = PALETTE[idx] || "#000000";
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      }

      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = x * scale + sx;
          const py = y * scale + sy;
          const offset = (py * canvas.width + px) * 4;
          data[offset] = r;
          data[offset + 1] = g;
          data[offset + 2] = b;
          data[offset + 3] = a;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Hash deterministik 2D untuk variasi visual berbasis posisi atau id (tanpa Math.random di render)
 */
export function hash2D(x, y, modulo = 1000) {
  const h = ((x * 374761393 + y * 668265263) ^ 0x5bf03635) >>> 0;
  return modulo ? (h % modulo) : h;
}

