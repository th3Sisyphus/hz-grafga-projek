/**
 * Data Sumber Kebenaran Barang Toko dan Drop System (ITEMS)
 */

export const SHOP_ITEMS = [
  {
    id: "medkit",
    name: "Kotak P3K Lapangan",
    cost: 50,
    desc: "Memulihkan 80 poin vitalitas kesehatan seketika.",
    effect: { type: "heal", amount: 80 },
  },
  {
    id: "ammo",
    name: "Kantong Munisi Penuh",
    cost: 40,
    desc: "Mengisi penuh kembali cadangan munisi operatif.",
    effect: { type: "ammo", amount: 50 },
  },
  {
    id: "armor",
    name: "Rompi Balistik Ringan",
    cost: 90,
    desc: "Mengurangi 15% seluruh kerusakan yang diterima (maksimal 60%).",
    effect: { type: "armor", reduction: 0.15 },
  },
  {
    id: "tuning",
    name: "Penyetelan Senjata Tempur",
    cost: 75,
    desc: "Meningkatkan +15% daya rusak permanen senjata aktif.",
    effect: { type: "weapon_damage", bonus: 0.15 },
  },
];

export const DROP_RATES = {
  medkitChance: 0.08, // ~8%
  ammoChance: 0.15,   // ~15%
  powerupChance: 0.03, // ~3%
};

export const POWERUPS = {
  double_damage: {
    id: "double_damage",
    name: "Kerusakan Ganda (x2)",
    duration: 10000, // 10 detik
    color: "#ff4a1f",
  },
  speed_boost: {
    id: "speed_boost",
    name: "Akselerasi Cepat (+50%)",
    duration: 10000,
    color: "#f0b429",
  },
  magnet: {
    id: "magnet",
    name: "Magnet Logistik",
    duration: 10000,
    color: "#a855f7",
  },
  freeze: {
    id: "freeze",
    name: "Pembekuan Kawanan",
    duration: 6000, // 6 detik
    color: "#22d3ee",
  },
};
