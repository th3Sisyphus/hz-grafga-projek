/**
 * zombieSpritesData.js
 * Seluruh data animasi sprite Zombie Biasa Arah A (16x16 piksel seni, scale 2 = 32x32 px)
 * Memuat: Walk (4 f), Attack (4 f), Spawn (3 f), Death (4 f).
 * Termasuk 4 Palette Swap deterministik dan slot variasi arketipe.
 */

// ==========================================
// 1. ZOMBIE BIASA BASE FRAMES (16x16)
// ==========================================
// Palet Karakter:
//  0: void-black (outline)
//  H: zombie-shadow, I: zombie-mid, J: zombie-light
//  M: rag-shadow, N: rag-mid
//  U: amber-spark (mata 2-px)
//  K: ichor-dark, L: ichor-mid
export const ZOMBIE_NORMAL_FRAMES = {
  // Walk: 4 Frame (150 ms/f) dengan torso bobbing 1px
  walk: [
    // Frame 0: Langkah Kiri Maju, badan condong bungkuk
    [
      "......0000......",
      ".....0JIIJ0.....",
      "....0JUUIIJ0....",
      "....0J00IIJ0....",
      ".....0IIIJ0.....",
      "......0NN0......",
      "....00NNNN0.....",
      "...0IMNNNN00....",
      "..0IIMNNNNMM0...",
      "..000MNNNNMM0...",
      ".....0NNNN00....",
      "....0NN0NN0.....",
      "...0II0.0II0....",
      "...0I0...0I0....",
      "..000.....000...",
      "................",
    ],
    // Frame 1: Tegap / Mid-stride (Bobbing turun 1px)
    [
      "................",
      "......0000......",
      ".....0JIIJ0.....",
      "....0JUUIIJ0....",
      "....0J00IIJ0....",
      ".....0IIIJ0.....",
      "......0NN0......",
      "....00NNNN0.....",
      "...0IIMNNN00....",
      "..0IIIMNNNMM0...",
      "..0000MNNNMM0...",
      ".....0NNNN00....",
      "....0NNNNN0.....",
      "....0II0II0.....",
      "...000..000.....",
      "................",
    ],
    // Frame 2: Langkah Kanan Maju, tangan kiri menjulur lunglai
    [
      "......0000......",
      ".....0JIIJ0.....",
      "....0JUUIIJ0....",
      "....0J00IIJ0....",
      ".....0IIIJ0.....",
      "......0NN0......",
      "....00NNNN0.....",
      "...0IIMNNN00....",
      "..0IIIMNNNMM00..",
      "..0000MNNNMMMI0.",
      ".....0NNNN0000..",
      "....0NN0NN0.....",
      "...0II0.0II0....",
      "..000....0I0....",
      "..........000...",
      "................",
    ],
    // Frame 3: Tegap / Mid-stride kebalikan
    [
      "................",
      "......0000......",
      ".....0JIIJ0.....",
      "....0JUUIIJ0....",
      "....0J00IIJ0....",
      ".....0IIIJ0.....",
      "......0NN0......",
      "....00NNNN0.....",
      "...0IIMNNN00....",
      "..0IIIMNNNMM0...",
      "..0000MNNNMM0...",
      ".....0NNNN00....",
      ".....0NNNN0.....",
      "....0II0II0.....",
      "....000..000....",
      "................",
    ],
  ],

  // Attack: 4 Frame (100 ms/f)
  // F0: Windup condong belakang -> F1: Hantam cakar ke depan -> F2: Strike Hold -> F3: Recover
  attack: [
    // Frame 0: Windup (condong ke belakang, lengan ditarik naik)
    [
      "......0000......",
      ".....0JIIJ0.....",
      "....0JUUIIJ000..",
      "....0J00IIJ0II0.",
      ".....0IIIJ00II0.",
      "......0NN0..00..",
      "....00NNNN0.....",
      "...0MMNNNN00....",
      "..0MMMNNNNMM0...",
      "..0000NNNNMM0...",
      ".....0NNNN00....",
      "....0NNNNN0.....",
      "...0II00II0.....",
      "...0I0..0I0.....",
      "..000....000....",
      "................",
    ],
    // Frame 1: Hantam / Strike (tubuh terjulur ke depan, kedua cakar mencakar)
    [
      "................",
      "................",
      "........0000....",
      ".......0JIIJ0...",
      "......0JUUIIJ0..",
      "......0J00IIJ000",
      ".......0IIIJ00II",
      "......00NN00.0II",
      "....00NNNNN00000",
      "...0MMNNNNNN0III",
      "..0MMMNNNNN00III",
      "..0000NNNN00.000",
      ".....0NN0NN0....",
      "....0II0.0II0...",
      "...000....000...",
      "................",
    ],
    // Frame 2: Strike Hold (kedua tangan di depan dengan cakar tegang)
    [
      "................",
      "................",
      "........0000....",
      ".......0JIIJ0...",
      "......0JUUIIJ0..",
      "......0J00IIJ000",
      ".......0IIIJ00II",
      "......00NN00.0II",
      "....00NNNNN00000",
      "...0MMNNNNNN0III",
      "..0MMMNNNNN00000",
      "..0000NNNN00....",
      ".....0NN0NN0....",
      "....0II0.0II0...",
      "...000....000...",
      "................",
    ],
    // Frame 3: Recovery (kembali tegak lunglai)
    [
      "......0000......",
      ".....0JIIJ0.....",
      "....0JUUIIJ0....",
      "....0J00IIJ0....",
      ".....0IIIJ0.....",
      "......0NN0......",
      "....00NNNN0.....",
      "...0IMNNNN00....",
      "..0IIMNNNNMM0...",
      "..000MNNNNMM0...",
      ".....0NNNN00....",
      "....0NN0NN0.....",
      "...0II0.0II0....",
      "...0I0...0I0....",
      "..000.....000...",
      "................",
    ],
  ],

  // Spawn: 3 Frame (150 ms/f) — Muncul merangkak dari tanah galian
  spawn: [
    // Frame 0: Tangan dan kepala baru mencuat dari tanah
    [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      ".......00.......",
      "......0JJ0......",
      ".....0JUUJ0..00.",
      "....000000000II0",
      "...055666655500.",
      "..0511111111150.",
    ],
    // Frame 1: Tubuh setengah terangkat dari lubang kubur
    [
      "................",
      "................",
      "................",
      "................",
      "................",
      "......0000......",
      ".....0JIIJ0.....",
      "....0JUUIIJ0....",
      "....0J00IIJ0....",
      ".....0IIIJ0.00..",
      "....00NNNN00II0.",
      "...0IIMNNNN000..",
      "..05566665550...",
      ".0511111111150..",
      "055555555555550.",
      "................",
    ],
    // Frame 2: Merangkak berdiri penuh
    [
      "......0000......",
      ".....0JIIJ0.....",
      "....0JUUIIJ0....",
      "....0J00IIJ0....",
      ".....0IIIJ0.....",
      "......0NN0......",
      "....00NNNN0.....",
      "...0IMNNNN00....",
      "..0IIMNNNNMM0...",
      "..000MNNNNMM0...",
      ".....0NNNN00....",
      "....0NN0NN0.....",
      "...0II0.0II0....",
      "..05566665550...",
      ".0511111111150..",
      "................",
    ],
  ],

  // Death: 4 Frame (120 ms/f) — Jatuh tersungkur ke tanah
  death: [
    // Frame 0: Oleng terkena tembakan/tebasan mematikan
    [
      ".....0000.......",
      "....0JIIJ0......",
      "...0JUUIIJ0.....",
      "...0J00IIJ0.....",
      "....0IIIJ0......",
      ".....0NN0.......",
      "...00NNNN0......",
      "..0IMNNNN00.....",
      ".0IIMNNNNMM0....",
      ".000MNNNNMM0....",
      "....0NNNN00.....",
      "...0NN0NN0......",
      "..0II0.0II0.....",
      "..0I0...0I0.....",
      ".000.....000....",
      "................",
    ],
    // Frame 1: Lutut jatuh berdebam
    [
      "................",
      "................",
      "....0000........",
      "...0JIIJ0.......",
      "..0JUUIIJ0......",
      "..0J00IIJ0......",
      "...0IIIJ0.......",
      "....0NN0........",
      "..00NNNN0.......",
      ".0IIMNNN00......",
      ".000MNNNMM0.....",
      "....0NNNN00.....",
      "...00NNNN00.....",
      "..0II0II00......",
      ".0000000........",
      "................",
    ],
    // Frame 2: Tubuh roboh miring menyentuh tanah
    [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "...0000.........",
      "..0JIIJ0000.....",
      ".0JUUIIJNNN00...",
      ".00IIIJNNNNMM0..",
      "..0000NNNNMM00..",
      "...00II00II00...",
      "..0000000000....",
    ],
    // Frame 3: Bangkai tersungkur rata (Tinggal 2-3 detik sebagai decal tanah!)
    [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      ".00000000000000.",
      "0JUUIIJNNNNMMII0",
      "0000000000000000",
    ],
  ],
};

// ==========================================
// 2. PALETTE SWAPS DETERMINISTIK ZOMBIE BIASA
// ==========================================
// Dipilih berdasarkan hash2D(zombie.id, 0, 4)
export const ZOMBIE_PALETTE_SWAPS = [
  // Swap 0: Original Hospital/Civilian (default: baju kelabu-biru, kulit pucat zaitun)
  null,
  // Swap 1: Rotting Soldier (baju loreng hijau gelap, kulit kecokelatan busuk)
  {
    M: "E", // rag-shadow -> canopy-shadow
    N: "F", // rag-mid    -> canopy-mid
    H: "5", // zombie-shd -> dirt-shadow
    I: "6", // zombie-mid -> dirt-mid
    J: "7", // zombie-lgt -> dirt-light
  },
  // Swap 2: Hazmat / Miner Worker (baju kusam oranye-bata, kulit kelabu-ungu)
  {
    M: "S", // rag-shadow -> hazard-deep
    N: "T", // rag-mid    -> safety-orange
    H: "2", // zombie-shd -> slate-shadow
    I: "3", // zombie-mid -> slate-mid
    J: "4", // zombie-lgt -> slate-light
  },
  // Swap 3: Toxic Ghoul (baju hitam arang robek, kulit hijau lumut gelap)
  {
    M: "0", // rag-shadow -> void-black
    N: "1", // rag-mid    -> night-abyss
    H: "8", // zombie-shd -> swamp-shadow
    I: "9", // zombie-mid -> swamp-mid
    J: "A", // zombie-lgt -> swamp-light
    U: "V", // mata amber -> vital-green (mata hijau beracun menyala)
  },
];

// ==========================================
// 3. SILUET & PALETTE KHUSUS ARKETIPE MUSUH BARU
// ==========================================
// Slot warna dan siluet yang disiapkan untuk Runner, Brute, Spitter, Exploder, Necromancer
export const ENEMY_ARCHETYPE_PALETTES = {
  runner: {
    M: "S", N: "T", // Oranye pelari cepat
    H: "1", I: "H", J: "I",
  },
  brute: {
    M: "O", N: "P", // Baja zirah kelabu
    H: "B", I: "C", J: "D", // Daging tebal cokelat
  },
  spitter: {
    M: "8", N: "9", // Hijau lumut rawa
    H: "8", I: "A", J: "V", // Perut beracun hijau terang
    U: "V",
  },
  exploder: {
    M: "S", N: "T", // Perut ambar membara
    H: "K", I: "S", J: "U",
    U: "R", // Mata putih berpijar
  },
  necromancer: {
    M: "1", N: "0", // Jubah hitam pekat
    H: "2", I: "3", J: "4", // Kulit mayat pucat
    U: "V", // Mata hijau arwah
  },
};
