import { Zombie } from "../domain/Zombie.js";
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
    const zombieCount = 5 + this.context.wave * 3; // Difficulty curve sedikit dinaikkan
    const { player } = this.context;
    const spawnPoints = [];

    // Mencoba mencari titik spawn valid
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * MAP_WIDTH * TILE_SIZE;
      // FIX: Menggunakan MAP_HEIGHT, bukan MAP_WIDTH
      const y = Math.random() * MAP_HEIGHT * TILE_SIZE;

      if (!this.context.isObstacle(x, y)) {
        const dist = Math.hypot(player.x - x, player.y - y);
        if (dist > 400) {
          // Jarak aman diperbesar
          spawnPoints.push({ x, y });
        }
      }
    }

    // Fallback logic
    if (spawnPoints.length === 0) {
      spawnPoints.push({ x: player.x + 500, y: player.y });
      spawnPoints.push({ x: player.x - 500, y: player.y });
      spawnPoints.push({ x: player.x, y: player.y + 500 });
      spawnPoints.push({ x: player.x, y: player.y - 500 });
    }

    for (let i = 0; i < zombieCount; i++) {
      const point = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
      // Tambahkan sedikit random offset agar tidak spawn tepat di titik pixel yang sama
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 40;

      this.context.zombies.push(
        new Zombie(point.x + offsetX, point.y + offsetY, this.context.wave)
      );
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
