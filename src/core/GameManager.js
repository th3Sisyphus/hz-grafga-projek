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
      // --- Joystick Logic ---
      const handleJoyStart = (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.joystick.pointerId = touch.identifier;
        this.joystick.active = true;

        // Set Origin ke tengah zona
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

        // Reset Visual
        joystickKnob.style.transform = `translate(-50%, -50%)`;

        // FIX: Reset State Context Joystick
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

      // --- Attack Button Logic ---
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

    // === FIX: MOBILE AIMING ===
    // Jangan pakai tengah layar (rect.width/2).
    // Pakai posisi relatif player terhadap kamera.
    if (distance > 5) {
      const { player, camera } = this.context;

      // Default ke tengah jika player belum ada
      let originX = this.context.canvas.width / 2;
      let originY = this.context.canvas.height / 2;

      // Jika player ada, gunakan posisi layarnya yang akurat
      if (player) {
        originX = player.x - camera.x;
        originY = player.y - camera.y;
      }

      // Set mousePos relatif terhadap posisi player yang sebenarnya
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
    }
  }

  update() {
    if (!this.context.running) return;

    // FIX: Selalu update arah hadap player mengikuti mouse (Hover Aiming)
    if (this.context.player && !this.context.paused) {
      this.context.player.updateAim(this.context.mousePos, this.context.camera);
    }

    // Handle Attack
    if (this.context.mouseDown && this.context.player && !this.context.paused) {
      const didAttack = this.context.player.attemptAttack(
        this.context.mousePos,
        this.context.camera,
        this.context.projectiles,
        this.context.effects
      );

      if (didAttack && this.context.player.weapon.type === "melee") {
        this.combatSystem.handleMeleeAttack(this.context.player);
      }
    }

    // 1. Systems Update
    this.movementSystem.update();
    this.combatSystem.update();
    this.waveSystem.update();

    // 2. Effect Update
    this.context.effects = this.context.effects.filter((e) => e.update());

    // 3. Camera Update
    this.renderer.updateCamera();

    // 4. UI Update
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

    if (!this.context.paused) {
      this.update();
    }
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  // ... (Sisa method UI tetap sama seperti sebelumnya)
  updateUI() {
    const player = this.context.player;
    if (!player) return;

    document.getElementById("wave").textContent = this.context.wave;
    document.getElementById("score").textContent = this.context.score;
    document.getElementById("zombieCount").textContent =
      this.context.zombies.length;
    document.getElementById("health").textContent = Math.max(
      0,
      Math.floor(player.health)
    );
    const healthPercent = (player.health / player.maxHealth) * 100;
    document.getElementById("healthBar").style.width =
      Math.max(0, healthPercent) + "%";
  }

  showTutorial() {
    this.uiElements.menu.classList.add("hidden");
    this.uiElements.tutorial.classList.remove("hidden");
    document.getElementById("pauseBtn").style.display = "none"; // ADDED
  }

  showWeaponSelect() {
    this.uiElements.menu.classList.add("hidden");
    this.uiElements.weaponSelect.classList.remove("hidden");
    document.getElementById("pauseBtn").style.display = "none"; // ADDED
  }

  backToMenu() {
    this.context.running = false;
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
    document.getElementById("pauseBtn").style.display = "none"; // ADDED
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
    document.getElementById("pauseBtn").style.display = "block"; // ADDED

    setTimeout(() => {
      if (this.context.running) {
        this.context.waveDelay = false;
        this.waveSystem.spawnZombies();
      }
    }, WAVE_DELAY);

    this.gameLoop();
  }

  restartGame() {
    this.uiElements.gameOver.classList.add("hidden");
    this.startGame();
  }

  handleGameOver() {
    if (this.context.player && this.context.player.health <= 0) {
      const finalScore = document.getElementById("finalScore");
      const finalWave = document.getElementById("finalWave");
      if (finalScore) finalScore.textContent = this.context.score;
      if (finalWave) finalWave.textContent = this.context.wave;

      this.uiElements.gameOver.classList.remove("hidden");
      // kontrol joystik disembunyikan saat game over
      this.uiElements.mobileControls.classList.add("hidden");
    }
    document.getElementById("pauseBtn").style.display = "none"; // ADDED
    this.uiElements.menu.classList.add("hidden");
    this.uiElements.pauseMenu.classList.add("hidden");
  }
}