/**
 * Data Sumber Kebenaran Upgrade Antar Gelombang (UPGRADES)
 * Minimal 12 upgrade unik dengan variasi Rarity (Common, Rare, Epic).
 * Sistem pengundian memakai bobot peluang (weight).
 */

export const RARITIES = {
  common: { name: "Umum", color: "var(--ink-secondary)", weight: 60 },
  rare: { name: "Langka", color: "var(--warning)", weight: 30 },
  epic: { name: "Epik", color: "var(--accent)", weight: 10 },
};

export const UPGRADES = [
  {
    id: "heavy_caliber",
    name: "Kaliber Berat",
    statKey: "damage",
    desc: "Meningkatkan daya hancur semua tipe serangan.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L1 21H23L12 2ZM12 6L19.5 19H4.5L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z"/></svg>`,
    rarity: "common",
    effectLabel: "+25% Kerusakan Serangan",
    modifier: { type: "percent_damage", value: 0.25 },
  },
  {
    id: "heavy_caliber_epic",
    name: "Kaliber Amunisi Berat",
    statKey: "damage",
    desc: "Peningkatan masif daya penetrasi balistik senjata.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L1 21H23L12 2ZM12 6L19.5 19H4.5L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z"/></svg>`,
    rarity: "epic",
    effectLabel: "+60% Kerusakan Serangan",
    modifier: { type: "percent_damage", value: 0.60 },
  },
  {
    id: "adrenaline_boost",
    name: "Pendorong Adrenalin",
    statKey: "speed",
    desc: "Mempercepat manuver kiting menjauh dari kawanan.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 5.5C14.6 5.5 15.5 4.6 15.5 3.5C15.5 2.4 14.6 1.5 13.5 1.5C12.4 1.5 11.5 2.4 11.5 3.5C11.5 4.6 12.4 5.5 13.5 5.5ZM9.8 8.9L7 23H9.1L10.6 16.5L13.1 19V23H15.1V17.5L12.9 15L13.6 11.5C15 13.2 17.2 14.5 19.5 14.5V12.5C17.6 12.5 15.8 11.3 14.8 9.8L13.8 8.2C13.4 7.6 12.8 7.2 12.1 7.2C11.8 7.2 11.5 7.3 11.2 7.4L6 9.6V14.5H8V11L9.8 8.9Z"/></svg>`,
    rarity: "common",
    effectLabel: "+18% Kecepatan Lari",
    modifier: { type: "percent_speed", value: 0.18 },
  },
  {
    id: "siphon_strike",
    name: "Tebasan Siphon",
    statKey: "lifesteal",
    desc: "Menyerap vitalitas darah musuh saat serangan berhasil.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/></svg>`,
    rarity: "common",
    effectLabel: "+8% Pemulihan Darah (Lifesteal)",
    modifier: { type: "flat_lifesteal", value: 0.08 },
  },
  {
    id: "siphon_vampiric",
    name: "Esensi Vampir",
    statKey: "lifesteal",
    desc: "Penyerapan darah ekstrem pada setiap benturan telak.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/></svg>`,
    rarity: "rare",
    effectLabel: "+15% Pemulihan Darah (Lifesteal)",
    modifier: { type: "flat_lifesteal", value: 0.15 },
  },
  {
    id: "rapid_trigger",
    name: "Mekanisme Cepat",
    statKey: "attack_speed",
    desc: "Mempersingkat interval cooldown senjata.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2.05V4.07C16.39 4.58 19 7.48 19 11C19 11.34 18.97 11.67 18.92 12H20.94C20.98 11.67 21 11.34 21 11C21 6.37 17.44 2.58 13 2.05M12 6C9.24 6 7 8.24 7 11C7 12.38 7.56 13.63 8.46 14.54L9.88 13.12C9.33 12.57 9 11.83 9 11C9 9.34 10.34 8 12 8C12.83 8 13.57 8.33 14.12 8.88L15.54 7.46C14.63 6.56 13.38 6 12 6M13 19.93V17.91C16.39 17.4 19 14.5 19 11H21C21 15.63 17.44 19.42 13 19.93M3 11C3 6.37 6.56 2.58 11 2.05V4.07C7.61 4.58 5 7.48 5 11C5 11.34 5.03 11.67 5.08 12H3.06C3.02 11.67 3 11.34 3 11Z"/></svg>`,
    rarity: "rare",
    effectLabel: "+25% Kecepatan Serang",
    modifier: { type: "percent_attack_speed", value: 0.25 },
  },
  {
    id: "titan_armor",
    name: "Fisik Tangguh",
    statKey: "max_hp",
    desc: "Meningkatkan daya tahan tubuh dan kapasitas darah total.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z"/></svg>`,
    rarity: "common",
    effectLabel: "+60 Kapasitas Darah (HP)",
    modifier: { type: "flat_hp", value: 60 },
  },
  {
    id: "titan_plate",
    name: "Pelindung Eksoskeleton",
    statKey: "max_hp",
    desc: "Penambahan kesehatan skala besar untuk bertahan dari kawanan.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z"/></svg>`,
    rarity: "rare",
    effectLabel: "+120 Kapasitas Darah (HP)",
    modifier: { type: "flat_hp", value: 120 },
  },
  {
    id: "precision_lens",
    name: "Fokus Kritis",
    statKey: "crit_chance",
    desc: "Meningkatkan peluang tebasan mengenai titik vital.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 4.07C16.61 4.54 19.46 7.39 19.93 11H17.82C17.38 8.53 15.47 6.62 13 6.18V4.07ZM11 4.07V6.18C8.53 6.62 6.62 8.53 6.18 11H4.07C4.54 7.39 7.39 4.54 11 4.07ZM4.07 13H6.18C6.62 15.47 8.53 17.38 11 17.82V19.93C7.39 19.46 4.54 16.61 4.07 13ZM13 19.93V17.82C15.47 17.38 17.38 15.47 17.82 13H19.93C19.46 16.61 16.61 19.46 13 19.93Z"/></svg>`,
    rarity: "common",
    effectLabel: "+15% Peluang Kritis",
    modifier: { type: "flat_crit_chance", value: 0.15 },
  },
  {
    id: "lethal_execution",
    name: "Tebasan Mematikan",
    statKey: "crit_mult",
    desc: "Melipatgandakan dampak kerusakan saat serangan kritis terjadi.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2L3 6V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V6L18 2H6ZM12 17L7 12H10V9H14V12H17L12 17Z"/></svg>`,
    rarity: "rare",
    effectLabel: "+0.8x Pengali Kritis",
    modifier: { type: "flat_crit_mult", value: 0.8 },
  },
  {
    id: "ballistic_pierce",
    name: "Amunisi Menembus",
    statKey: "pierce",
    desc: "Proyektil tembakan menembus rintangan zombie tambahan.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 19.5L12 10L14 12L4.5 21.5H2.5V19.5ZM16.5 4.5L19.5 7.5L8.5 18.5H5.5V15.5L16.5 4.5ZM21.5 5.5L18.5 2.5C18.1 2.1 17.5 2.1 17.1 2.5L15.5 4.1L19.9 8.5L21.5 6.9C21.9 6.5 21.9 5.9 21.5 5.5Z"/></svg>`,
    rarity: "rare",
    effectLabel: "+1 Penetrasi Target Musuh",
    modifier: { type: "flat_pierce", value: 1 },
  },
  {
    id: "multi_chamber",
    name: "Laras Ganda Berantai",
    statKey: "multi_shot",
    desc: "Menembakkan proyektil tambahan menyebar pada setiap tembakan.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6H20V8H4V6ZM4 11H20V13H4V11ZM4 16H20V18H4V16Z"/></svg>`,
    rarity: "epic",
    effectLabel: "+1 Tambahan Proyektil",
    modifier: { type: "flat_multi_shot", value: 1 },
  },
  {
    id: "shockwave_blast",
    name: "Dentuman Kejut",
    statKey: "knockback",
    desc: "Mendorong zombie ke belakang lebih jauh saat terbentur.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 2H9V8.5L4 3.5V11H11V9H5.5L9 5.5V2ZM13 2V5.5L16.5 9H11V11H18V3.5L13 8.5V2ZM11 22H13V15.5L18 20.5V13H11V15H16.5L13 18.5V22ZM9 22V18.5L5.5 15H11V13H4V20.5L9 15.5V22Z"/></svg>`,
    rarity: "common",
    effectLabel: "+50% Daya Dorong (Knockback)",
    modifier: { type: "percent_knockback", value: 0.5 },
  },
  {
    id: "field_expansion",
    name: "Perluasan Radius Ledakan",
    statKey: "aoe_radius",
    desc: "Memperluas area ledakan proyektil dan sambaran tebasan.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z"/></svg>`,
    rarity: "rare",
    effectLabel: "+35% Radius Area Efek (AoE)",
    modifier: { type: "percent_aoe", value: 0.35 },
  },
  {
    id: "logistics_ration",
    name: "Ransum Lapangan Ekstra",
    statKey: "wave_regen",
    desc: "Meningkatkan regenerasi otomatis darah antar pergantian gelombang.",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM18 14H14V18H10V14H6V10H10V6H14V10H18V14Z"/></svg>`,
    rarity: "common",
    effectLabel: "+15% Pemulihan Ekstra Antar Wave",
    modifier: { type: "flat_wave_regen", value: 0.15 },
  },
];

/**
 * Mengundi 3 upgrade acak tanpa duplikat berdasarkan bobot Rarity
 */
export function drawRandomUpgrades(count = 3) {
  const pool = [...UPGRADES];
  const results = [];

  while (results.length < count && pool.length > 0) {
    // Hitung total bobot tersisa
    const totalWeight = pool.reduce(
      (sum, item) => sum + (RARITIES[item.rarity]?.weight || 50),
      0
    );

    let randomVal = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < pool.length; i++) {
      const itemWeight = RARITIES[pool[i].rarity]?.weight || 50;
      if (randomVal <= itemWeight) {
        selectedIndex = i;
        break;
      }
      randomVal -= itemWeight;
    }

    results.push(pool[selectedIndex]);
    pool.splice(selectedIndex, 1);
  }

  return results;
}
