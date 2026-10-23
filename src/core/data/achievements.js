/**
 * Data Sumber Kebenaran Pencapaian (ACHIEVEMENTS)
 */

export const ACHIEVEMENTS = [
  {
    id: "first_blood",
    title: "Darah Pertama",
    desc: "Mengeliminasi spesimen zombie pertama di arena pertempuran.",
    icon: "01",
  },
  {
    id: "kill_50",
    title: "Pembantai Kawanan",
    desc: "Menghabisi total 50 spesimen zombie dalam operasi aktif.",
    icon: "50",
  },
  {
    id: "kill_200",
    title: "Pemberantas Wabah",
    desc: "Mencapai akumulasi 200 eliminasi zombie di seluruh sesi.",
    icon: "2K",
  },
  {
    id: "boss_slayer",
    title: "Penakluk Mutasi",
    desc: "Menumbangkan spesimen Boss pertama pada gelombang kelipatan 3.",
    icon: "BS",
  },
  {
    id: "wave_5",
    title: "Penyintas Handal",
    desc: "Berhasil bertahan hidup dan menembus hingga Gelombang 5.",
    icon: "W5",
  },
  {
    id: "wave_10",
    title: "Veteran Karantina",
    desc: "Mencapai Gelombang 10 dalam pertempuran bertahan hidup.",
    icon: "WX",
  },
  {
    id: "coin_hoarder",
    title: "Kolektor Amunisi",
    desc: "Mengumpulkan total 100 Koin Pemburu dari hasil eliminasi.",
    icon: "KC",
  },
  {
    id: "combo_master",
    title: "Penguasa Refleks",
    desc: "Mencapai pengali skor Combo Multiplier x3.0 tanpa terkena pukulan.",
    icon: "3X",
  },
  {
    id: "upgrade_enthusiast",
    title: "Ahli Modifikasi",
    desc: "Memilih dan menumpuk minimal 5 kartu modifikasi persenjataan.",
    icon: "UP",
  },
];

const STORAGE_KEY = "hz_achievements_v1";

export class AchievementTracker {
  constructor() {
    this.unlocked = this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.unlocked));
    } catch (e) {}
  }

  unlock(id) {
    if (this.unlocked[id]) return; // Sudah terbuka
    const ach = ACHIEVEMENTS.find((a) => a.id === id);
    if (!ach) return;

    this.unlocked[id] = Date.now();
    this.save();
    this.showToast(ach);
  }

  isUnlocked(id) {
    return !!this.unlocked[id];
  }

  showToast(ach) {
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML = `
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); font-weight: 700;">
        PENCAPAIAN TERBUKA!
      </div>
      <div style="font-size: 14px; font-weight: 800; color: var(--ink); margin: 2px 0;">
        ${ach.title}
      </div>
      <div style="font-size: 11px; color: var(--ink-secondary);">
        ${ach.desc}
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 50);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }
}
