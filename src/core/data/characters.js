/**
 * Data Sumber Kebenaran Karakter Operatif (CHARACTERS)
 */

export const CHARACTERS = {
  scout: {
    id: "scout",
    name: "Scout",
    role: "Operatif Pengintai",
    tagline: "Kecepatan tinggi, refleks tajam, spesialis senjata laras ganda.",
    health: 240,
    speed: 3.2,
    armor: 0,
    critBonus: 0.05,
    lifestealBonus: 0,
    defaultWeapon: "dualgun",
    secondWeapon: "katana",
    skill: {
      id: "dash",
      name: "Tactical Dash",
      desc: "Melesat cepat menghindari kepungan musuh dengan i-frame (450ms).",
      cooldown: 4000,
      duration: 450,
      speedBoost: 3.2,
    },
  },
  vanguard: {
    id: "vanguard",
    name: "Vanguard",
    role: "Garda Depan Pelindung",
    tagline: "Pertahanan baja balistik dan spesialis pertempuran jarak dekat.",
    health: 380,
    speed: 2.3,
    armor: 0.2, // 20% reduksi kerusakan dasar
    critBonus: 0,
    lifestealBonus: 0,
    defaultWeapon: "shotgun",
    secondWeapon: "fist",
    skill: {
      id: "fortress",
      name: "Benteng Baja",
      desc: "Kebal dari seluruh kerusakan selama 2.2 detik dan mementalkan zombie sekitar.",
      cooldown: 10000,
      duration: 2200,
      knockbackRadius: 100,
    },
  },
  arcane: {
    id: "arcane",
    name: "Arcane Survivor",
    role: "Penyintas Mistis",
    tagline: "Manipulasi elemen api dan es dengan peluang serangan kritikal tinggi.",
    health: 270,
    speed: 2.7,
    armor: 0.05,
    critBonus: 0.15,
    lifestealBonus: 0.05,
    defaultWeapon: "wizard",
    secondWeapon: "flamethrower",
    skill: {
      id: "frost_nova",
      name: "Ledakan Beku (Frost Nova)",
      desc: "Membekukan seluruh kawanan zombie dalam radius 200px selama 3.5 detik.",
      cooldown: 8000,
      duration: 3500,
      radius: 200,
    },
  },
};
