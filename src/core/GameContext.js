import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  TILES,
  SPIKE_DAMAGE,
  SPIKE_TICK_INTERVAL,
} from "./Constants.js";
import { Player } from "../domain/Player.js";
import { SoundManager } from "./SoundManager.js";
import { AchievementTracker } from "./data/achievements.js";
import { MODES } from "./data/modes.js";
import { FxContext } from "../rendering/FxContext.js";

/**
 * World Generation dengan jaminan:
 * 1. Area spawn tengah selalu bebas obstacle.
 * 2. Seluruh area walkable terhubung (Flood Fill).
 * 3. Spike tidak memutus satu-satunya jalur / bottleneck.
 */
function generateConnectedMap() {
  const map = [];
  const cx = Math.floor(MAP_WIDTH / 2);
  const cy = Math.floor(MAP_HEIGHT / 2);

  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      // Border selalu batu
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        row.push(TILES.ROCK);
      }
      // Area spawn tengah (radius 3 tile) selalu rumput
      else if (Math.abs(x - cx) <= 3 && Math.abs(y - cy) <= 3) {
        row.push(TILES.GRASS);
      }
      // Obstacle pohon dan batu (5% chance)
      else if (Math.random() < 0.05) {
        row.push(Math.random() < 0.5 ? TILES.TREE : TILES.ROCK);
      }
      // Spike (hazard lantai, 2% chance)
      else if (Math.random() < 0.02) {
        row.push(TILES.SPIKE);
      }
      // Variasi terrain
      else if (Math.random() < 0.1) {
        row.push(TILES.DIRT);
      } else {
        row.push(TILES.GRASS);
      }
    }
    map.push(row);
  }

  const isSolidObstacle = (tx, ty) => {
    if (tx <= 0 || tx >= MAP_WIDTH - 1 || ty <= 0 || ty >= MAP_HEIGHT - 1) return true;
    const t = map[ty][tx];
    return t === TILES.TREE || t === TILES.ROCK || t === TILES.STONE || t === TILES.SPIKE;
  };

  // 1. Flood fill konektivitas dari tengah (cx, cy)
  const reachable = Array.from({ length: MAP_HEIGHT }, () =>
    Array(MAP_WIDTH).fill(false)
  );
  const queue = [{ x: cx, y: cy }];
  reachable[cy][cx] = true;

  while (queue.length > 0) {
    const { x, y } = queue.shift();
    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < MAP_WIDTH - 1 && ny > 0 && ny < MAP_HEIGHT - 1) {
        if (!isSolidObstacle(nx, ny) && !reachable[ny][nx]) {
          reachable[ny][nx] = true;
          queue.push({ x: nx, y: ny });
        }
      }
    }
  }

  // Buka rintangan yang memutus pulau lantai yang tidak terhubung
  for (let y = 1; y < MAP_HEIGHT - 1; y++) {
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      if (!isSolidObstacle(x, y) && !reachable[y][x]) {
        // Carve jalur lurus ke arah tengah sampai bertemu area reachable
        let curX = x;
        let curY = y;
        while (!reachable[curY][curX]) {
          reachable[curY][curX] = true;
          if (isSolidObstacle(curX, curY)) {
            map[curY][curX] = TILES.GRASS;
          }
          if (curX < cx) curX++;
          else if (curX > cx) curX--;
          if (curY < cy) curY++;
          else if (curY > cy) curY--;
        }
      }
    }
  }

  // 2. Proteksi Spike: spike tidak boleh menutup satu-satunya jalur (bottleneck check)
  const isSafeWalkable = (tx, ty) => {
    if (tx <= 0 || tx >= MAP_WIDTH - 1 || ty <= 0 || ty >= MAP_HEIGHT - 1) return false;
    const t = map[ty][tx];
    return t !== TILES.TREE && t !== TILES.ROCK && t !== TILES.STONE && t !== TILES.SPIKE;
  };

  const safeReachable = Array.from({ length: MAP_HEIGHT }, () =>
    Array(MAP_WIDTH).fill(false)
  );
  const safeQueue = [{ x: cx, y: cy }];
  safeReachable[cy][cx] = true;

  while (safeQueue.length > 0) {
    const { x, y } = safeQueue.shift();
    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < MAP_WIDTH - 1 && ny > 0 && ny < MAP_HEIGHT - 1) {
        if (isSafeWalkable(nx, ny) && !safeReachable[ny][nx]) {
          safeReachable[ny][nx] = true;
          safeQueue.push({ x: nx, y: ny });
        }
      }
    }
  }

  // Jika ada spike yang menyebabkan bottleneck ke area aman lain, ubah spike jadi rumput
  for (let y = 1; y < MAP_HEIGHT - 1; y++) {
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      if (map[y][x] === TILES.SPIKE) {
        const dirs = [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ];
        let createsBottleneck = false;
        for (const [dx, dy] of dirs) {
          const nx = x + dx;
          const ny = y + dy;
          if (isSafeWalkable(nx, ny) && !safeReachable[ny][nx]) {
            createsBottleneck = true;
            break;
          }
        }
        if (createsBottleneck) {
          map[y][x] = TILES.GRASS;
        }
      }
    }
  }

  return map;
}

/**
 * Spatial Hash Grid untuk pencarian tetangga O(n) pada separasi zombie
 */
export class SpatialHash {
  constructor(cellSize = 60) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  clear() {
    this.grid.clear();
  }

  _hash(x, y) {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  insert(entity) {
    const key = this._hash(entity.x, entity.y);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push(entity);
  }

  query(x, y, radius) {
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);

    const results = [];
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const cell = this.grid.get(`${cx},${cy}`);
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            results.push(cell[i]);
          }
        }
      }
    }
    return results;
  }
}

export class GameContext {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.soundManager = new SoundManager();
    this.soundManager.loadSounds();
    this.fx = new FxContext(this);

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

    // Game Clock (ms, bertambah HANYA saat game tidak paused)
    this.time = 0;
    this.lastTime = 0;
    this.timers = [];

    // Statistik riil sesi permainan
    this.stats = {
      kills: 0,
      shotsFired: 0,
      hits: 0,
      damageDealt: 0,
      damageTaken: 0,
      timeSurvived: 0,
    };

    this.keys = {};
    this.mousePos = { x: 0, y: 0 };
    this.mouseDown = false;

    this.joystickInput = { x: 0, y: 0, active: false };

    this.camera = { x: 0, y: 0 };
    this.tilemap = generateConnectedMap();

    this.player = null;
    this.zombies = [];
    this.npcs = [];
    this.projectiles = [];
    this.effects = [];
    this.pickups = [];

    // Koin & Power-Up Temporer
    this.coins = 0;
    this.activePowerups = {
      double_damage: 0,
      speed_boost: 0,
      magnet: 0,
      freeze: 0,
    };
    this.waveUpgradeActive = false;
    this.shopActive = false;

    // Karakter, Mode, Combo & Achievements
    this.selectedCharacter = this.selectedCharacter || "scout";
    this.selectedMode = this.selectedMode || "standard";
    this.comboMultiplier = 1.0;
    this.achievementTracker = this.achievementTracker || new AchievementTracker();

    // Flow Field Pathfinding State
    this.flowField = null;
    this.lastFlowFieldTime = -10000;
    this.lastPlayerTileX = -1;
    this.lastPlayerTileY = -1;

    // Spatial Hash untuk optimasi separasi
    this.spatialHash = new SpatialHash(60);
  }

  activatePowerup(powerupId) {
    const duration = powerupId === "freeze" ? 6000 : 10000;
    this.activePowerups[powerupId] = this.time + duration;

    // Tampilkan notifikasi banner taktis jika ada di DOM
    const banner = document.getElementById("waveBanner");
    const title = document.getElementById("bannerWaveTitle");
    const sub = document.getElementById("bannerWaveSub");
    if (banner && title && sub) {
      const names = {
        double_damage: "POWER-UP: KERUSAKAN GANDA (x2)",
        speed_boost: "POWER-UP: AKSELERASI CEPAT (+50%)",
        magnet: "POWER-UP: MAGNET LOGISTIK AKTIF",
        freeze: "POWER-UP: PEMBEKUAN KAWANAN (-80%)",
      };
      title.textContent = names[powerupId] || "POWER-UP DIAKTIFKAN";
      sub.textContent = `Durasi aktif: ${duration / 1000} detik`;
      banner.classList.add("active");
      this.addTimer(2000, () => banner.classList.remove("active"));
    }
  }

  /**
   * Jadwalkan timer berbasis game clock (tidak berjalan saat game di-pause)
   */
  addTimer(delayMs, callback) {
    this.timers.push({
      triggerTime: this.time + delayMs,
      callback,
    });
  }

  updateTimers(dtMs) {
    if (this.paused || !this.running) return;

    this.time += dtMs;

    // Eksekusi timers yang sudah matang
    const remaining = [];
    for (let i = 0; i < this.timers.length; i++) {
      const timer = this.timers[i];
      if (this.time >= timer.triggerTime) {
        try {
          timer.callback();
        } catch (err) {
          console.error("Timer callback error:", err);
        }
      } else {
        remaining.push(timer);
      }
    }
    this.timers = remaining;
  }

  isObstacle(x, y) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT)
      return true;

    if (!this.tilemap || !this.tilemap[tileY]) return true;

    const tile = this.tilemap[tileY][tileX];

    // SPIKE adalah obstacle yang TIDAK BISA DILEWATI oleh player maupun zombie
    return (
      tile === TILES.TREE ||
      tile === TILES.ROCK ||
      tile === TILES.STONE ||
      tile === TILES.SPIKE
    );
  }

  isTileObstacle(tileX, tileY) {
    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT)
      return true;
    if (!this.tilemap || !this.tilemap[tileY]) return true;
    const tile = this.tilemap[tileY][tileX];
    return (
      tile === TILES.TREE ||
      tile === TILES.ROCK ||
      tile === TILES.STONE ||
      tile === TILES.SPIKE
    );
  }

  /**
   * Flow Field BFS dari posisi player ke seluruh tile walkable.
   * Dihitung ulang tiap ~0.4 dtk atau saat player berpindah tile.
   */
  updateFlowField() {
    if (!this.player) return;

    const ptx = Math.floor(this.player.x / TILE_SIZE);
    const pty = Math.floor(this.player.y / TILE_SIZE);

    // Cek cooldown kalkulasi (0.4 detik / 400ms)
    if (
      this.flowField &&
      this.time - this.lastFlowFieldTime < 400 &&
      ptx === this.lastPlayerTileX &&
      pty === this.lastPlayerTileY
    ) {
      return;
    }

    this.lastFlowFieldTime = this.time;
    this.lastPlayerTileX = ptx;
    this.lastPlayerTileY = pty;

    // Matriks jarak BFS
    const dist = Array.from({ length: MAP_HEIGHT }, () =>
      Array(MAP_WIDTH).fill(9999)
    );

    const queue = [];
    if (!this.isTileObstacle(ptx, pty)) {
      dist[pty][ptx] = 0;
      queue.push({ x: ptx, y: pty });
    } else {
      // Jika player berada di boundary/obstacle, cari tetangga terdekat
      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dx, dy] of dirs) {
        const nx = ptx + dx;
        const ny = pty + dy;
        if (!this.isTileObstacle(nx, ny)) {
          dist[ny][nx] = 0;
          queue.push({ x: nx, y: ny });
        }
      }
    }

    const dirs = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ];

    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const currentDist = dist[y][x];

      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
          if (!this.isTileObstacle(nx, ny)) {
            // Hindari pergerakan diagonal melintasi sudut dua obstacle
            if (dx !== 0 && dy !== 0) {
              if (this.isTileObstacle(x + dx, y) || this.isTileObstacle(x, y + dy)) {
                continue;
              }
            }
            const moveCost = dx !== 0 && dy !== 0 ? 1.414 : 1.0;
            const newDist = currentDist + moveCost;
            if (newDist < dist[ny][nx]) {
              dist[ny][nx] = newDist;
              queue.push({ x: nx, y: ny });
            }
          }
        }
      }
    }

    // Bangun vektor gradien dari matriks jarak
    const field = Array.from({ length: MAP_HEIGHT }, () =>
      Array.from({ length: MAP_WIDTH }, () => ({ dx: 0, dy: 0 }))
    );

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (this.isTileObstacle(x, y) || dist[y][x] === 0) continue;

        let bestDist = dist[y][x];
        let bestDx = 0;
        let bestDy = 0;

        for (const [dx, dy] of dirs) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
            if (dist[ny][nx] < bestDist) {
              bestDist = dist[ny][nx];
              bestDx = dx;
              bestDy = dy;
            }
          }
        }

        const len = Math.hypot(bestDx, bestDy);
        if (len > 0) {
          field[y][x] = { dx: bestDx / len, dy: bestDy / len };
        }
      }
    }

    this.flowField = field;
  }

  getFlowDirection(tileX, tileY) {
    if (!this.flowField) return { dx: 0, dy: 0 };
    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
      return { dx: 0, dy: 0 };
    }
    return this.flowField[tileY][tileX] || { dx: 0, dy: 0 };
  }

  /**
   * Cek apakah ada garis lurus bebas obstacle antara dua titik
   */
  hasLineOfSight(x0, y0, x1, y1) {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const stepSize = TILE_SIZE / 2; // 20px step
    const steps = Math.ceil(dist / stepSize);
    if (steps <= 1) return true;

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const cx = x0 + (x1 - x0) * t;
      const cy = y0 + (y1 - y0) * t;
      if (this.isObstacle(cx, cy)) {
        return false;
      }
    }
    return true;
  }

  findSafeSpawn() {
    let centerX = Math.floor(MAP_WIDTH / 2);
    let centerY = Math.floor(MAP_HEIGHT / 2);

    let radius = 0;
    const maxRadius = Math.min(MAP_WIDTH, MAP_HEIGHT) / 2;

    while (radius < maxRadius) {
      for (let y = centerY - radius; y <= centerY + radius; y++) {
        for (let x = centerX - radius; x <= centerX + radius; x++) {
          const worldX = x * TILE_SIZE + TILE_SIZE / 2;
          const worldY = y * TILE_SIZE + TILE_SIZE / 2;
          if (!this.isObstacle(worldX, worldY)) {
            return { x: worldX, y: worldY };
          }
        }
      }
      radius++;
    }

    return { x: TILE_SIZE * 2, y: TILE_SIZE * 2 };
  }

  addCombo() {
    this.comboMultiplier = Math.min(
      5.0,
      Math.round((this.comboMultiplier + 0.1) * 10) / 10
    );
    if (this.comboMultiplier >= 3.0) {
      this.achievementTracker.unlock("combo_master");
    }
  }

  resetCombo() {
    this.comboMultiplier = 1.0;
  }

  start(weaponKey, characterKey = null, modeKey = null, secondaryWeaponKey = null) {
    if (characterKey) this.selectedCharacter = characterKey;
    if (modeKey) this.selectedMode = modeKey;
    if (secondaryWeaponKey) this.selectedSecondaryWeapon = secondaryWeaponKey;

    this.init();
    this.selectedWeapon = weaponKey;

    const spawnPos = this.findSafeSpawn();
    this.player = new Player(spawnPos.x, spawnPos.y);

    if (this.selectedCharacter) {
      this.player.setCharacter(this.selectedCharacter);
    }
    if (weaponKey) {
      this.player.setPrimaryWeapon(weaponKey);
    }
    if (this.selectedSecondaryWeapon) {
      this.player.setSecondaryWeapon(this.selectedSecondaryWeapon);
    }

    // Jika mode Hardcore: tanpa heal (waveRegen 0%)
    if (this.selectedMode === "hardcore") {
      this.player.waveRegenPercent = 0;
    }

    this.running = true;
  }

  gameOver() {
    this.running = false;
  }
}
