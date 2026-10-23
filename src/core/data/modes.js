/**
 * Data Sumber Kebenaran Mode Permainan (MODES)
 */

export const MODES = {
  standard: {
    id: "standard",
    name: "Standar Bertahan Hidup",
    desc: "Protokol eliminasi reguler dengan eskalasi gelombang bertahap.",
    scoreMultiplier: 1.0,
    healAllowed: true,
    difficulty: "Normal",
  },
  endless: {
    id: "endless",
    name: "Tanpa Batas (Endless)",
    desc: "Gelombang kawanan musuh bertambah tanpa henti dengan eskalasi agresif.",
    scoreMultiplier: 1.3,
    healAllowed: true,
    difficulty: "Tinggi",
  },
  boss_rush: {
    id: "boss_rush",
    name: "Serbuan Boss (Boss Rush)",
    desc: "Setiap gelombang diterjunkan spesimen Boss mutasi tangguh.",
    scoreMultiplier: 2.0,
    healAllowed: true,
    bossEveryWave: true,
    difficulty: "Sangat Tinggi",
  },
  daily_seed: {
    id: "daily_seed",
    name: "Benih Harian (Daily Seed)",
    desc: "RNG berbasis tanggal UTC hari ini. Peta dan pilihan upgrade sama untuk semua pemain.",
    scoreMultiplier: 1.5,
    healAllowed: true,
    isDaily: true,
    difficulty: "Kompetitif",
  },
  hardcore: {
    id: "hardcore",
    name: "Protokol Ekstrem (Hardcore)",
    desc: "Tanpa pemulihan antar gelombang. Kerusakan yang diterima bersifat permanen.",
    scoreMultiplier: 2.5,
    healAllowed: false, // heal 0%
    difficulty: "Maksimal",
  },
};

// Alias untuk kompatibilitas form input
MODES.bossrush = MODES.boss_rush;
MODES.daily = MODES.daily_seed;

export const DIFFICULTIES = {
  normal: { id: "normal", name: "Standar", multiplier: 1.0 },
  tactical: { id: "tactical", name: "Taktikal", multiplier: 1.3 },
  extreme: { id: "extreme", name: "Ekstrem", multiplier: 1.75 },
};

/**
 * Utilitas RNG Seeded untuk Daily Seed
 */
export function getDailySeedString() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createSeededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
