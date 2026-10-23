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

    const spawnEntity = (EntityClass) => {
      let spawned = false;
      let attempts = 0;
      while (!spawned && attempts < 60) {
        const x = Math.random() * MAP_WIDTH * TILE_SIZE;
        const y = Math.random() * MAP_HEIGHT * TILE_SIZE;

        if (!this.context.isObstacle(x, y)) {
          const dist = player ? Math.hypot(player.x - x, player.y - y) : 500;
          if (dist > 380) {
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
      this.context.addTimer(Math.random() * 500, () => {
        this.context.soundManager.playZombieSound();
      });
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

      // Timer wave delay menggunakan Game Clock (terjeda saat game paused)
      this.context.addTimer(WAVE_DELAY, () => {
        if (this.context.running) {
          this.context.waveDelay = false;
          this.spawnZombies();
        }
      });
    }
  }

  update() {
    this.checkWaveComplete();
  }
}
