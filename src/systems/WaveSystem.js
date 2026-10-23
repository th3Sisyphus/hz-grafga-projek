import { Zombie, ZombieBoss } from "../domain/Zombie.js";
import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  WAVE_DELAY,
} from "../core/Constants.js";
import { HealEffect } from "../domain/Effect.js";
import { ENEMIES, getBossDataForWave } from "../core/data/enemies.js";

export class WaveSystem {
  constructor(context) {
    this.context = context;
  }

  spawnZombies() {
    const wave = this.context.wave;
    const isBossWave = wave % 3 === 0;

    let eventType = "normal"; // "normal", "horde", "elite"
    if (!isBossWave) {
      if (wave >= 4 && wave % 4 === 0) eventType = "horde";
      else if (wave >= 5 && wave % 5 === 0) eventType = "elite";
    }

    let budget = 24 + wave * 16;
    if (eventType === "horde") budget = Math.round(budget * 1.5);
    if (eventType === "elite") budget = Math.round(budget * 1.25);

    // Tampilkan Banner Intro (Event Wave atau Boss Wave)
    this.showWaveBanner(wave, isBossWave, eventType);

    const { player } = this.context;
    const spawnSingle = (enemyType, isElite = false) => {
      let attempts = 0;
      while (attempts < 50) {
        const x = Math.random() * MAP_WIDTH * TILE_SIZE;
        const y = Math.random() * MAP_HEIGHT * TILE_SIZE;

        if (!this.context.isObstacle(x, y)) {
          const dist = player ? Math.hypot(player.x - x, player.y - y) : 500;
          if (dist > 360) {
            const z = new Zombie(x, y, wave, enemyType);
            if (isElite) {
              z.health = Math.round(z.health * 1.4);
              z.maxHealth = z.health;
              z.damage = Math.round(z.damage * 1.25);
            }
            if (eventType === "horde") {
              z.speed *= 1.1;
            }
            this.context.zombies.push(z);
            return true;
          }
        }
        attempts++;
      }
      return false;
    };

    // 1. Jika Boss Wave, spawn Boss terlebih dahulu
    if (isBossWave) {
      let attempts = 0;
      while (attempts < 50) {
        const x = Math.random() * MAP_WIDTH * TILE_SIZE;
        const y = Math.random() * MAP_HEIGHT * TILE_SIZE;
        if (!this.context.isObstacle(x, y)) {
          const dist = player ? Math.hypot(player.x - x, player.y - y) : 500;
          if (dist > 380) {
            const boss = new ZombieBoss(x, y, wave);
            this.context.zombies.push(boss);
            break;
          }
        }
        attempts++;
      }
      this.context.addTimer(400, () =>
        this.context.soundManager.playZombieSound()
      );
      budget = Math.max(15, Math.round(budget * 0.35)); // sisa budget untuk minion
    }

    // 2. Kumpulkan kandidat musuh berdasarkan minWave
    const availableTypes = Object.keys(ENEMIES).filter((k) => {
      if (eventType === "horde") return k === "normal" || k === "runner";
      return ENEMIES[k].minWave <= wave;
    });

    // 3. Susun gelombang dari total budget cost
    while (budget >= 5) {
      const eligible = availableTypes.filter((k) => ENEMIES[k].cost <= budget);
      if (eligible.length === 0) break;

      // Weighted random selection
      const totalWeight = eligible.reduce(
        (acc, k) => acc + ENEMIES[k].weight,
        0
      );
      let rand = Math.random() * totalWeight;
      let chosenKey = eligible[0];
      for (const k of eligible) {
        rand -= ENEMIES[k].weight;
        if (rand <= 0) {
          chosenKey = k;
          break;
        }
      }

      spawnSingle(chosenKey, eventType === "elite");
      budget -= ENEMIES[chosenKey].cost;
    }
  }

  showWaveBanner(wave, isBossWave, eventType) {
    const banner = document.getElementById("waveBanner");
    const title = document.getElementById("bannerWaveTitle");
    const sub = document.getElementById("bannerWaveSub");
    if (!banner || !title || !sub) return;

    if (isBossWave) {
      const bossData = getBossDataForWave(wave);
      title.textContent = bossData.name;
      sub.textContent =
        bossData.sub || "Peringatan Ancaman Mutasi Tingkat Puncak Sektor!";
      banner.classList.add("active");
      this.context.addTimer(2800, () => banner.classList.remove("active"));
    } else if (eventType === "horde") {
      title.textContent = "PERINGATAN: GELOMBANG HORDE KILAT!";
      sub.textContent = "Kawanan pelari cepat mendekat dari segala penjuru.";
      banner.classList.add("active");
      this.context.addTimer(2400, () => banner.classList.remove("active"));
    } else if (eventType === "elite") {
      title.textContent = "PERINGATAN: KAWANAN ELITE TERDETEKSI!";
      sub.textContent = "Mutasi spesimen berdaya tahan dan daya rusak tinggi.";
      banner.classList.add("active");
      this.context.addTimer(2400, () => banner.classList.remove("active"));
    }
  }

  checkWaveComplete() {
    if (
      this.context.zombies.length === 0 &&
      !this.context.waveDelay &&
      this.context.running &&
      !this.context.waveUpgradeActive &&
      !this.context.shopActive
    ) {
      this.context.waveDelay = true;
      this.context.waveUpgradeActive = true;

      // 1. Regen 20% max HP antar wave (+ bonus modifier jika ada)
      const p = this.context.player;
      if (p) {
        const regenPct = p.waveRegenPercent || 0.2;
        const healAmt = Math.round(p.maxHealth * regenPct);
        p.heal(healAmt);
        if (this.context.effects.length < 300) {
          this.context.effects.push(new HealEffect(p.x, p.y - 30, healAmt));
        }
      }

      // 2. Buka modal upgrade dengan 3 pilihan acak
      if (typeof window.showWaveUpgradeModal === "function") {
        window.showWaveUpgradeModal();
      }
    }
  }

  update() {
    this.checkWaveComplete();
  }
}
