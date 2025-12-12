// Import ZombieBoss
import { Zombie, ZombieBoss } from "../domain/Zombie.js";
import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  WAVE_DELAY,
} from "../core/Constants.js";

export class WaveSystem {
  constructor(context) {
    this.context = context;
  }

  spawnZombies() {
    const zombieCount = 5 + this.context.wave * 3;
    const { player } = this.context;

    // Helper function untuk spawn entity di lokasi aman
    const spawnEntity = (EntityClass) => {
      let spawned = false;
      let attempts = 0;
      // Coba cari posisi aman maksimal 50 kali
      while (!spawned && attempts < 50) {
        const x = Math.random() * MAP_WIDTH * TILE_SIZE;
        const y = Math.random() * MAP_HEIGHT * TILE_SIZE;

        if (!this.context.isObstacle(x, y)) {
          const dist = Math.hypot(player.x - x, player.y - y);
          // Jarak aman dari player
          if (dist > 400) {
            this.context.zombies.push(new EntityClass(x, y, this.context.wave));
            spawned = true; 
          }
        }
        attempts++;
      }
    };

    // 1. Spawn Zombie Biasa
    for (let i = 0; i < zombieCount; i++) {
      spawnEntity(Zombie);
    }

    // 2. Spawn Zombie BOSS (Setiap kelipatan 3 Wave)
    if (this.context.wave % 3 === 0) {
      spawnEntity(ZombieBoss);
      setTimeout(() => {
        this.context.soundManager.playZombieSound();
      }, Math.random() * 500);
    }
  }

  checkWaveComplete() {
    if (
      this.context.zombies.length === 0 &&
      !this.context.waveDelay &&
      this.context.running
    ) {
      this.context.waveDelay = true;
      this.context.wave++;

      setTimeout(() => {
        if (this.context.running) {
          this.context.waveDelay = false;
          this.spawnZombies();
        }
      }, WAVE_DELAY);
    }
  }

  update() {
    this.checkWaveComplete();
  }
}
