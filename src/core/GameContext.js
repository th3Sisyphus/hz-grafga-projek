import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, TILES } from "./Constants.js";
import { Player } from "../domain/Player.js";

/**
 * World Generation dengan probabilitas Spike
 */
function generateMap() {
  const map = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      // Border selalu batu
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        row.push(TILES.ROCK);
      }
      // Obstacles
      else if (Math.random() < 0.05) {
        row.push(Math.random() < 0.5 ? TILES.TREE : TILES.ROCK);
      }
      // Spikes (Lebih jarang, 2% chance)
      else if (Math.random() < 0.02) {
        row.push(TILES.SPIKE);
      }
      // Terrain
      else if (Math.random() < 0.1) {
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

  init() {
    this.running = false;
    this.paused = false;
    this.wave = 1;
    this.score = 0;
    this.zombiesKilled = 0;
    this.waveDelay = true;
    this.selectedWeapon = null;

    this.keys = {};
    this.mousePos = { x: 0, y: 0 };
    this.mouseDown = false;

    this.camera = { x: 0, y: 0 };
    this.tilemap = generateMap();

    this.player = null;
    this.zombies = [];
    this.projectiles = [];
    this.effects = [];

    this.joystick = { x: 0, y: 0, active: false };
  }

  isObstacle(x, y) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    // Bounds check
    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT)
      return true;

    if (!this.tilemap || !this.tilemap[tileY]) return true;

    const tile = this.tilemap[tileY][tileX];

    // Definisi Obstacle: Pohon, Batu, Dinding, dan Spike
    return (
      tile === TILES.TREE ||
      tile === TILES.ROCK ||
      tile === TILES.STONE ||
      tile === TILES.SPIKE
    );
  }

  /**
   * BARU: Mencari koordinat aman untuk spawn player
   * Menghindari spawn di dalam batu/pohon/spike
   */
  findSafeSpawn() {
    // Mulai dari tengah map
    let centerX = Math.floor(MAP_WIDTH / 2);
    let centerY = Math.floor(MAP_HEIGHT / 2);

    // Spiral search radius
    let radius = 0;
    const maxRadius = Math.min(MAP_WIDTH, MAP_HEIGHT) / 2;

    while (radius < maxRadius) {
      // Scan area sekitar radius
      for (let y = centerY - radius; y <= centerY + radius; y++) {
        for (let x = centerX - radius; x <= centerX + radius; x++) {
          // Konversi grid ke world coordinates
          const worldX = x * TILE_SIZE + TILE_SIZE / 2;
          const worldY = y * TILE_SIZE + TILE_SIZE / 2;

          // Cek apakah tile ini obstacle
          if (!this.isObstacle(worldX, worldY)) {
            return { x: worldX, y: worldY };
          }
        }
      }
      radius++;
    }

    // Fallback jika map entah kenapa penuh obstacle (mustahil tapi aman)
    return { x: TILE_SIZE * 2, y: TILE_SIZE * 2 };
  }

  start(weaponKey) {
    this.init();
    this.selectedWeapon = weaponKey;
    const spawnPos = this.findSafeSpawn();
    this.player = new Player(spawnPos.x, spawnPos.y);
    this.player.setWeapon(weaponKey);
    this.running = true;
  }

  gameOver() {
    this.running = false;
  }
}
