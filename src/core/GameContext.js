import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  TILES,
  BASE_PLAYER_HEALTH,
} from "./Constants.js";
import { Player } from "../domain/Player.js";

/**
 * Fungsi utilitas untuk membuat peta (seharusnya ada di WorldGenSystem,
 * tapi untuk kepraktisan, diletakkan di sini karena terkait dengan inisialisasi Context).
 */
function generateMap() {
  const map = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        row.push(TILES.ROCK);
      } else if (Math.random() < 0.05) {
        row.push(Math.random() < 0.5 ? TILES.TREE : TILES.ROCK);
      } else if (Math.random() < 0.1) {
        row.push(TILES.DIRT);
      } else {
        row.push(TILES.GRASS);
      }
    }
    map.push(row);
  }
  return map;
}

export class GameContext {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.init();
  }

  /**
   * Mengatur ulang semua state game.
   */
  init() {
    this.running = false;
    this.wave = 1;
    this.score = 0;
    this.zombiesKilled = 0;
    this.waveDelay = true;
    this.selectedWeapon = null;

    // Input State
    this.keys = {};
    this.mousePos = { x: 0, y: 0 };

    // World State
    this.camera = { x: 0, y: 0 };
    this.tilemap = generateMap();

    // Entity State
    this.player = null;
    this.zombies = [];
    this.projectiles = [];
    this.effects = [];
  }

  /**
   * Fungsi yang diakses oleh MovementSystem untuk memeriksa rintangan.
   * Diposisikan di Context karena Map adalah bagian dari state Context.
   */
  isObstacle(x, y) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT)
      return true;

    // Perlu cek apakah tilemap sudah terinisialisasi
    if (!this.tilemap || !this.tilemap[tileY]) return true;

    const tile = this.tilemap[tileY][tileX];
    return tile === TILES.TREE || tile === TILES.ROCK || tile === TILES.STONE;
  }

  /**
   * Memulai game dengan senjata yang dipilih.
   */
  start(weaponKey) {
    this.init(); // Reset semua state
    this.selectedWeapon = weaponKey;
    this.player = new Player(
      (MAP_WIDTH * TILE_SIZE) / 2,
      (MAP_HEIGHT * TILE_SIZE) / 2
    );
    this.player.setWeapon(weaponKey);
    this.running = true;
  }

  /**
   * Metode dipanggil oleh CombatSystem saat Player mati.
   */
  gameOver() {
    this.running = false;
    // Panggilan ke GameManager untuk menampilkan UI Game Over dilakukan di sana
  }
}
