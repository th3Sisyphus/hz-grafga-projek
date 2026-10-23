import { GameContext } from "./GameContext.js";
import { Renderer } from "../rendering/Renderer.js";
import { MovementSystem } from "../systems/MovementSystem.js";
import { CombatSystem } from "../systems/CombatSystem.js";
import { WaveSystem } from "../systems/WaveSystem.js";
import { WAVE_DELAY } from "./Constants.js";

export class GameManager {
  constructor(canvas, uiElements) {
    this.context = new GameContext(canvas);
    this.renderer = new Renderer(this.context);
    this.uiElements = uiElements;

    this.movementSystem = new MovementSystem(this.context);
    this.combatSystem = new CombatSystem(this.context);
    this.waveSystem = new WaveSystem(this.context);

    // Mobile joystick state
    this.joystick = {
      active: false,
      x: 0,
      y: 0,
      origin: { x: 0, y: 0 },
      pointerId: null,
    };

    this._lastFrameTime = 0;
    this.setupInputHandlers();
  }

  setupInputHandlers() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.togglePause();
      }
      this.context.keys[e.key.toLowerCase()] = true;
    });
    document.addEventListener("keyup", (e) => {
      this.context.keys[e.key.toLowerCase()] = false;
    });
    this.context.canvas.addEventListener("mousemove", (e) => {
      const rect = this.context.canvas.getBoundingClientRect();
      this.context.mousePos.x = e.clientX - rect.left;
      this.context.mousePos.y = e.clientY - rect.top;
    });
    this.context.canvas.addEventListener("mousedown", () => {
      this.context.mouseDown = true;
    });
    this.context.canvas.addEventListener("mouseup", () => {
      this.context.mouseDown = false;
    });

    // Mobile joystick handlers
    const { joystickZone, joystickKnob, attackBtn } = this.uiElements;
    if (joystickZone && joystickKnob && attackBtn) {
      const handleJoyStart = (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.joystick.pointerId = touch.identifier;
        this.joystick.active = true;

        const rect = joystickZone.getBoundingClientRect();
        this.joystick.origin = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        this.updateJoystick(touch.clientX, touch.clientY);
      };

      const handleJoyMove = (e) => {
        e.preventDefault();
        if (!this.joystick.active) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.joystick.pointerId) {
            this.updateJoystick(
              e.changedTouches[i].clientX,
              e.changedTouches[i].clientY
            );
            break;
          }
        }
      };

      const handleJoyEnd = (e) => {
        e.preventDefault();
        this.joystick.active = false;
        this.joystick.x = 0;
        this.joystick.y = 0;

        joystickKnob.style.transform = `translate(-50%, -50%)`;
        this.context.joystickInput = { x: 0, y: 0, active: false };
      };

      joystickZone.addEventListener("touchstart", handleJoyStart, {
        passive: false,
      });
      joystickZone.addEventListener("touchmove", handleJoyMove, {
        passive: false,
      });
      joystickZone.addEventListener("touchend", handleJoyEnd, {
        passive: false,
      });
      joystickZone.addEventListener("touchcancel", handleJoyEnd, {
        passive: false,
      });

      const handleAttackStart = (e) => {
        e.preventDefault();
        this.context.mouseDown = true;
        attackBtn.classList.add("pressed");
      };
      const handleAttackEnd = (e) => {
        e.preventDefault();
        this.context.mouseDown = false;
        attackBtn.classList.remove("pressed");
      };

      attackBtn.addEventListener("touchstart", handleAttackStart, {
        passive: false,
      });
      attackBtn.addEventListener("touchend", handleAttackEnd, {
        passive: false,
      });
    }
  }

  updateJoystick(clientX, clientY) {
    const maxRadius = 40;
    let dx = clientX - this.joystick.origin.x;
    let dy = clientY - this.joystick.origin.y;

    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      const ratio = maxRadius / distance;
      dx *= ratio;
      dy *= ratio;
    }

    this.uiElements.joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    const normalizedDistance = distance > maxRadius ? maxRadius : distance;
    const inputRatio = normalizedDistance / maxRadius;

    this.context.joystickInput = {
      x: (dx / normalizedDistance) * inputRatio || 0,
      y: (dy / normalizedDistance) * inputRatio || 0,
      active: distance > 5,
    };

    if (distance > 5) {
      const { player, camera } = this.context;
      let originX = this.context.canvas.width / 2;
      let originY = this.context.canvas.height / 2;

      if (player) {
        originX = player.x - camera.x;
        originY = player.y - camera.y;
      }

      this.context.mousePos.x = originX + this.context.joystickInput.x * 100;
      this.context.mousePos.y = originY + this.context.joystickInput.y * 100;
    }
  }

  togglePause() {
    if (
      !this.context.running ||
      (this.context.player && this.context.player.health <= 0)
    )
      return;

    this.context.paused = !this.context.paused;
    if (this.context.paused) {
      this.uiElements.pauseMenu.classList.remove("hidden");
    } else {
      this.uiElements.pauseMenu.classList.add("hidden");
      this._lastFrameTime = performance.now();
    }
  }

  update(deltaMs) {
    if (!this.context.running) return;

    // Normalisasi delta time ke 60 FPS (1.0 pada 60Hz, 0.417 pada 144Hz)
    const dtNormal = deltaMs / (1000 / 60);

    // Update Game Clock & Timers
    this.context.updateTimers(deltaMs);

    // Player update stun & aim
    if (this.context.player) {
      this.context.player.update(this.context.time);
      if (!this.context.paused) {
        this.context.player.updateAim(this.context.mousePos, this.context.camera);
      }
    }

    // Handle Attack
    if (this.context.mouseDown && this.context.player && !this.context.paused) {
      const didAttack = this.context.player.attemptAttack(
        this.context.mousePos,
        this.context.camera,
        this.context.projectiles,
        this.context.effects,
        this.context.time
      );

      if (didAttack) {
        this.context.stats.shotsFired++;
        const weapon = this.context.player.weapon;

        if (weapon.type === "melee") {
          this.context.soundManager.playWeaponSound(weapon.name, false);
          this.combatSystem.handleMeleeAttack(this.context.player);
        } else if (weapon.type === "range") {
          this.context.soundManager.playWeaponSound(weapon.name);
        }
      }
    }

    // 1. Systems Update with dtNormal
    this.movementSystem.update(dtNormal);
    this.combatSystem.update(dtNormal);
    this.waveSystem.update();

    // 2. Update zombie animations
    for (let i = 0; i < this.context.zombies.length; i++) {
      const zombie = this.context.zombies[i];
      if (this.context.player) {
        const dist = Math.hypot(
          this.context.player.x - zombie.x,
          this.context.player.y - zombie.y
        );
        zombie.isAttacking =
          dist < 40 && this.context.time - zombie.lastAttack < 300;
      }
      zombie.sprite.update(deltaMs, zombie.isAttacking);
    }

    // 3. Effect Update with dtNormal & particle pooling/capping (max 300)
    this.context.effects = this.context.effects.filter((e) =>
      e.update(dtNormal)
    );
    if (this.context.effects.length > 300) {
      this.context.effects.splice(0, this.context.effects.length - 300);
    }

    // 4. Camera Update
    this.renderer.updateCamera();

    // 5. UI Update
    this.updateUI();
  }

  render() {
    this.renderer.render();
    if (this.context.waveDelay && this.context.zombies.length === 0) {
      this.renderer.drawWaveDelayBanner(this.context.wave);
    }
  }

  gameLoop() {
    if (!this.context.running) {
      if (this.context.player && this.context.player.health <= 0) {
        this.handleGameOver();
      }
      return;
    }

    const now = performance.now();
    const rawDelta = this._lastFrameTime ? now - this._lastFrameTime : 16.67;
    this._lastFrameTime = now;
    const deltaMs = Math.min(rawDelta, 100);

    if (!this.context.paused) {
      this.update(deltaMs);
    }
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  updateUI() {
    if (window.uiManager && typeof window.uiManager.updateHUD === "function") {
      window.uiManager.updateHUD(this.context);
      return;
    }
    const player = this.context.player;
    if (!player) return;

    if (this._lastWave !== this.context.wave) {
      this._lastWave = this.context.wave;
      const el = document.getElementById("wave");
      if (el) el.textContent = this.context.wave;
    }
    if (this._lastScore !== this.context.score) {
      this._lastScore = this.context.score;
      const el = document.getElementById("score");
      if (el) el.textContent = this.context.score;
    }
    const zCount = this.context.zombies ? this.context.zombies.length : 0;
    if (this._lastZombies !== zCount) {
      this._lastZombies = zCount;
      const el = document.getElementById("zombieCount");
      if (el) el.textContent = zCount;
    }
    if (this._lastCoins !== this.context.coins) {
      this._lastCoins = this.context.coins;
      const el = document.getElementById("coinCount");
      if (el) el.textContent = this.context.coins !== undefined ? this.context.coins : 0;
    }
    const curHp = Math.max(0, Math.floor(player.health));
    if (this._lastHp !== curHp) {
      this._lastHp = curHp;
      const el = document.getElementById("health");
      if (el) el.textContent = curHp;

      const healthPercent = (curHp / (player.maxHealth || 300)) * 100;
      const hb = document.getElementById("healthBar");
      if (hb) {
        hb.style.width = Math.max(0, healthPercent) + "%";
        if (healthPercent <= 30) hb.classList.add("low");
        else hb.classList.remove("low");
      }

      const vig = document.getElementById("lowHpVignette");
      if (vig) {
        if (healthPercent <= 25) vig.classList.add("active");
        else vig.classList.remove("active");
      }
    }
  }

  showTutorial() {
    this.uiElements.menu.classList.add("hidden");
    this.uiElements.tutorial.classList.remove("hidden");
    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) pauseBtn.style.display = "none";
  }

  showWeaponSelect() {
    this.uiElements.menu.classList.add("hidden");
    this.uiElements.weaponSelect.classList.remove("hidden");
    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) pauseBtn.style.display = "none";
  }

  backToMenu() {
    this.context.running = false;
    this.context.paused = false;
    this.uiElements.menu.classList.remove("hidden");
    this.uiElements.tutorial.classList.add("hidden");
    this.uiElements.weaponSelect.classList.add("hidden");
    this.uiElements.gameOver.classList.add("hidden");
    this.uiElements.pauseMenu.classList.add("hidden");
    this.uiElements.mobileControls.classList.add("hidden");
    this.uiElements.confirmWeapon.disabled = true;
    document
      .querySelectorAll(".weapon-card")
      .forEach((card) => card.classList.remove("selected"));
    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) pauseBtn.style.display = "none";
  }

  selectWeapon(weapon) {
    this.context.selectedWeapon = weapon;
    document
      .querySelectorAll(".weapon-card")
      .forEach((card) => card.classList.remove("selected"));
    document
      .querySelector(`[data-weapon="${weapon}"]`)
      .classList.add("selected");
    this.uiElements.confirmWeapon.disabled = false;
  }

  startGame() {
    if (!this.context.selectedWeapon) return;
    this.uiElements.weaponSelect.classList.add("hidden");
    this.uiElements.mobileControls.classList.remove("hidden");
    this.context.start(this.context.selectedWeapon);

    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) pauseBtn.style.display = "flex";

    // Timer wave delay menggunakan Game Clock
    this.context.addTimer(WAVE_DELAY, () => {
      if (this.context.running) {
        this.context.waveDelay = false;
        this.waveSystem.spawnZombies();
      }
    });

    this._lastFrameTime = performance.now();
    this.gameLoop();
  }

  restartGame() {
    this.uiElements.gameOver.classList.add("hidden");
    this.startGame();
  }

  handleGameOver() {
    const p = this.context.player;
    if (p && p.health <= 0) {
      const finalScore = document.getElementById("finalScore");
      const finalWave = document.getElementById("finalWave");
      const finalKills = document.getElementById("finalKills");
      const finalAccuracy = document.getElementById("finalAccuracy");
      const finalDamage = document.getElementById("finalDamage");
      const finalRecord = document.getElementById("finalRecord");

      if (finalScore)
        finalScore.textContent = this.context.score.toLocaleString("id-ID");
      if (finalWave) finalWave.textContent = this.context.wave;
      if (finalKills) finalKills.textContent = this.context.stats.kills;

      const shots = this.context.stats.shotsFired;
      const hits = this.context.stats.hits;
      const accuracy =
        shots > 0 ? Math.min(100, Math.round((hits / shots) * 100)) : 0;
      if (finalAccuracy) finalAccuracy.textContent = `${accuracy}%`;

      const dmg = Math.round(this.context.stats.damageDealt);
      if (finalDamage) finalDamage.textContent = dmg.toLocaleString("id-ID");

      // Simpan skor tertinggi di localStorage dengan key berversi
      const STORAGE_KEY = "hz_record_v1";
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      } catch (e) {}

      let isNewRecord = false;
      const currentScore = this.context.score;
      const currentWave = this.context.wave;

      if (!saved || currentScore > (saved.score || 0)) {
        isNewRecord = true;
        saved = {
          score: currentScore,
          wave: currentWave,
          kills: this.context.stats.kills,
          date: new Date().toISOString(),
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch (e) {}
      }

      if (finalRecord) {
        if (isNewRecord) {
          finalRecord.textContent = "Rekor Baru Tercipta!";
          finalRecord.style.color = "var(--positive)";
        } else {
          finalRecord.textContent = `Rekor: ${saved.score.toLocaleString(
            "id-ID"
          )}`;
          finalRecord.style.color = "var(--accent)";
        }
      }

      const highScoreRecord = document.getElementById("highScoreRecord");
      const highWaveRecord = document.getElementById("highWaveRecord");
      if (highScoreRecord && saved)
        highScoreRecord.textContent = saved.score.toLocaleString("id-ID");
      if (highWaveRecord && saved)
        highWaveRecord.textContent = `Wave ${saved.wave}`;

      this.uiElements.gameOver.classList.remove("hidden");
      this.uiElements.mobileControls.classList.add("hidden");
    }

    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) pauseBtn.style.display = "none";
    this.uiElements.menu.classList.add("hidden");
    this.uiElements.pauseMenu.classList.add("hidden");
  }
}
