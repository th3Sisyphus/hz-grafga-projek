import { Zombie } from "../domain/Zombie.js";
import { TILE_SIZE, MAP_WIDTH, WAVE_DELAY } from "../core/Constants.js";

export class WaveSystem {
  constructor(context) {
    this.context = context;
  }

  spawnZombies() {
    const zombieCount = 3 + this.context.wave * 2;
    const { player } = this.context;
    const spawnPoints = [];

    // Cari 10 titik spawn yang aman dan jauh dari player
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * MAP_WIDTH * TILE_SIZE;
      const y = Math.random() * MAP_WIDTH * TILE_SIZE; // Menggunakan MAP_WIDTH untuk kesederhanaan, aslinya MAP_HEIGHT

      if (!this.context.isObstacle(x, y)) {
        const dist = Math.hypot(player.x - x, player.y - y);
        if (dist > 300) {
          // Jarak spawn minimal 300 unit
          spawnPoints.push({ x, y });
        }
      }
    }

    // Jika tidak ada spawn point yang ideal, coba di luar layar.
    if (spawnPoints.length === 0) {
      // Fallback: spawn 100px di luar batas kanan/bawah
      spawnPoints.push({ x: player.x + 500, y: player.y + 100 });
      spawnPoints.push({ x: player.x - 500, y: player.y - 100 });
      spawnPoints.push({ x: player.x + 100, y: player.y + 500 });
    }

    for (let i = 0; i < zombieCount; i++) {
      if (spawnPoints.length > 0) {
        const point =
          spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        this.context.zombies.push(
          new Zombie(point.x, point.y, this.context.wave)
        );
      }
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

      // Set timeout untuk wave berikutnya
      setTimeout(() => {
        if (this.context.running) {
          // Pastikan game belum Game Over saat timeout selesai
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
