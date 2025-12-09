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

    this.setupInputHandlers();
  }

  setupInputHandlers() {
    document.addEventListener("keydown", (e) => {
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
  }

  update() {
    if (!this.context.running) return;

    // 0. Handle Continuous Input (Auto fire jika mouse ditahan)
    if (this.context.mouseDown && this.context.player) {
      this.context.player.attemptAttack(
        this.context.mousePos,
        this.context.camera,
        this.context.projectiles,
        this.context.effects
      );
    }

    // 1. Systems Update
    this.movementSystem.update();
    this.combatSystem.update(); // Sekarang handle projectiles movement & collision
    this.waveSystem.update();

    // 2. Effect Update (Visual only)
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

    this.update();
    this.render();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  // ... (UI Handlers dibawahnya biarkan tetap sama, itu sudah oke)
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
  }

  showWeaponSelect() {
    this.uiElements.menu.classList.add("hidden");
    this.uiElements.weaponSelect.classList.remove("hidden");
  }

  backToMenu() {
    this.context.running = false;
    this.uiElements.menu.classList.remove("hidden");
    this.uiElements.tutorial.classList.add("hidden");
    this.uiElements.weaponSelect.classList.add("hidden");
    this.uiElements.gameOver.classList.add("hidden");
    this.uiElements.confirmWeapon.disabled = true;
    document
      .querySelectorAll(".weapon-card")
      .forEach((card) => card.classList.remove("selected"));
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
    this.context.start(this.context.selectedWeapon);

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
      document.getElementById("finalScore").textContent = this.context.score;
      document.getElementById("finalWave").textContent = this.context.wave;
      this.uiElements.gameOver.classList.remove("hidden");
    }
    this.uiElements.menu.classList.add("hidden");
  }
}
