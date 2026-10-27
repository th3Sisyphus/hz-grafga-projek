/**
 * titleScreen.js
 * 3D Diorama Mouse Tilt Parallax Engine, Tactile SFX, and Modal System
 * for Hunty Zombie Title Screen (index.html).
 */

(function () {
  "use strict";

  // =========================================================================
  // 1. Web Audio API Tactile Sound FX Engine (Zero External Audio Lag)
  // =========================================================================
  let audioCtx = null;
  let sfxMuted = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playTactileSfx(type = "click") {
    if (sfxMuted) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      if (type === "hover") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "click") {
        // Chunky mechanical punch click
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "openModal") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === "closeModal") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Bind audio unlock on first interaction
  window.addEventListener("pointerdown", initAudio, { once: true });
  window.addEventListener("keydown", initAudio, { once: true });

  // =========================================================================
  // 2. 3D Diorama Mouse Tilt Parallax Engine
  // =========================================================================
  const stage = document.getElementById("dioramaStage");
  const island = document.querySelector(".voxel-island");
  const hudTitle = document.querySelector(".title-headline-3d");

  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  let targetTransX = 0;
  let targetTransY = 0;
  let currentTransX = 0;
  let currentTransY = 0;

  const MAX_TILT_DEG_X = 14; // Pitch (Up/Down)
  const MAX_TILT_DEG_Y = 20; // Yaw (Left/Right)
  const MAX_TRANS_PX = 24;
  const LERP_FACTOR = 0.075;

  function onPointerMove(e) {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    // Normalized coordinates from -1 (left/top) to +1 (right/bottom)
    const normX = (e.clientX / w) * 2 - 1;
    const normY = (e.clientY / h) * 2 - 1;

    // Pitch: moving mouse down pitches forward (negative rotX)
    targetRotX = -normY * MAX_TILT_DEG_X;
    targetRotY = normX * MAX_TILT_DEG_Y;

    targetTransX = normX * MAX_TRANS_PX;
    targetTransY = normY * (MAX_TRANS_PX * 0.7);
  }

  function onPointerLeave() {
    targetRotX = 0;
    targetRotY = 0;
    targetTransX = 0;
    targetTransY = 0;
  }

  window.addEventListener("pointermove", onPointerMove);
  document.addEventListener("mouseleave", onPointerLeave);

  // Device orientation / gyroscope support for mobile
  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma !== null && e.beta !== null) {
      const normX = Math.max(-1, Math.min(1, e.gamma / 35));
      const normY = Math.max(-1, Math.min(1, (e.beta - 40) / 35));
      targetRotX = -normY * MAX_TILT_DEG_X;
      targetRotY = normX * MAX_TILT_DEG_Y;
    }
  });

  function renderTiltLoop() {
    // Smooth lerp
    currentRotX += (targetRotX - currentRotX) * LERP_FACTOR;
    currentRotY += (targetRotY - currentRotY) * LERP_FACTOR;
    currentTransX += (targetTransX - currentTransX) * LERP_FACTOR;
    currentTransY += (targetTransY - currentTransY) * LERP_FACTOR;

    if (stage) {
      stage.style.transform = `
        rotateX(${currentRotX.toFixed(3)}deg)
        rotateY(${currentRotY.toFixed(3)}deg)
        translate3d(${currentTransX.toFixed(2)}px, ${currentTransY.toFixed(2)}px, 0)
      `;
    }

    if (hudTitle) {
      // Differential counter-tilt for extruded title pop
      const subX = currentRotX * 0.35;
      const subY = currentRotY * 0.45;
      hudTitle.style.transform = `translateZ(30px) rotateX(${subX.toFixed(2)}deg) rotateY(${subY.toFixed(2)}deg)`;
    }

    requestAnimationFrame(renderTiltLoop);
  }
  requestAnimationFrame(renderTiltLoop);

  // =========================================================================
  // 3. Atmosphere Particles Canvas (Sparks, Ash & Embers)
  // =========================================================================
  const canvas = document.getElementById("atmosphereCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const MAX_PARTICLES = 50;

    class EmberParticle {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 10;
        this.size = Math.random() * 2.5 + 1;
        this.speedY = -(Math.random() * 0.8 + 0.3);
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.fadeSpeed = Math.random() * 0.004 + 0.002;
        this.isSpark = Math.random() < 0.35;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.alpha -= this.fadeSpeed;
        if (this.alpha <= 0 || this.y < -10) {
          this.reset();
        }
      }
      draw(c) {
        c.fillStyle = this.isSpark
          ? `rgba(255, 74, 31, ${this.alpha})`
          : `rgba(240, 180, 41, ${this.alpha * 0.75})`;
        c.fillRect(Math.round(this.x), Math.round(this.y), Math.round(this.size), Math.round(this.size));
      }
    }

    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push(new EmberParticle());
    }

    function animAtmosphere() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }
      requestAnimationFrame(animAtmosphere);
    }
    requestAnimationFrame(animAtmosphere);
  }

  // =========================================================================
  // 4. Modal Overlays System & Tactile Button Listeners
  // =========================================================================
  const modals = {
    caraBermain: document.getElementById("modalCaraBermain"),
    achievements: document.getElementById("modalAchievements"),
    credits: document.getElementById("modalCredits"),
  };

  function openModal(id) {
    const m = modals[id];
    if (m) {
      m.classList.add("active");
      playTactileSfx("openModal");
      if (id === "achievements") {
        syncAchievementsUI();
      }
    }
  }

  function closeModal(id) {
    const m = modals[id];
    if (m) {
      m.classList.remove("active");
      playTactileSfx("closeModal");
    }
  }

  function closeAllModals() {
    Object.keys(modals).forEach((k) => {
      if (modals[k] && modals[k].classList.contains("active")) {
        closeModal(k);
      }
    });
  }

  // Buttons open trigger
  document.getElementById("btnCaraBermain")?.addEventListener("click", () => {
    openModal("caraBermain");
  });
  document.getElementById("btnAchievements")?.addEventListener("click", () => {
    openModal("achievements");
  });
  document.getElementById("btnCredits")?.addEventListener("click", () => {
    openModal("credits");
  });

  // Sound feedback on button hover & click
  document.querySelectorAll(".btn-tactile, .btn-tactile-mini, .btn-close-modal").forEach((btn) => {
    btn.addEventListener("mouseenter", () => playTactileSfx("hover"));
    btn.addEventListener("click", (e) => {
      if (!btn.classList.contains("btn-close-modal")) {
        playTactileSfx("click");
      }
    });
  });

  // Close buttons inside modals
  document.querySelectorAll(".btn-close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-modal-target");
      if (modalId) closeModal(modalId);
      else closeAllModals();
    });
  });

  // Close on backdrop click
  document.querySelectorAll(".title-modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // Close on Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllModals();
    }
  });

  // Audio Toggle Button
  const btnToggleSfx = document.getElementById("btnToggleSfx");
  if (btnToggleSfx) {
    btnToggleSfx.addEventListener("click", () => {
      sfxMuted = !sfxMuted;
      btnToggleSfx.innerHTML = sfxMuted
        ? '<span class="btn-icon">🔇</span> SFX: OFF'
        : '<span class="btn-icon">🔊</span> SFX: ON';
      if (!sfxMuted) playTactileSfx("click");
    });
  }

  // =========================================================================
  // 5. Synchronize High Score & Achievements from LocalStorage
  // =========================================================================
  function syncAchievementsUI() {
    let unlockedMap = {};
    let highWave = 1;
    let highScore = 0;

    try {
      const rawAch = localStorage.getItem("hz_achievements_v1");
      if (rawAch) unlockedMap = JSON.parse(rawAch);

      const rawRec = localStorage.getItem("hz_record_v1");
      if (rawRec) {
        const parsed = JSON.parse(rawRec);
        highWave = parsed.wave || 1;
        highScore = parsed.score || 0;
      }
    } catch (e) {}

    // Update title screen high score pill
    const pillScore = document.getElementById("titleHighScore");
    const pillWave = document.getElementById("titleHighWave");
    if (pillScore) pillScore.textContent = highScore.toLocaleString("id-ID");
    if (pillWave) pillWave.textContent = highWave;

    // Update modal achievements cards
    document.querySelectorAll(".achievement-card-ui").forEach((card) => {
      const achKey = card.getAttribute("data-ach-id");
      const isUnlocked = !!unlockedMap[achKey];
      const badge = card.querySelector(".ach-status-badge");

      if (isUnlocked) {
        card.classList.add("unlocked");
        if (badge) {
          badge.textContent = "TERBUKA";
          badge.className = "ach-status-badge unlocked";
        }
      } else {
        card.classList.remove("unlocked");
        if (badge) {
          badge.textContent = "TERKUNCI";
          badge.className = "ach-status-badge locked";
        }
      }
    });
  }

  // Initial sync
  syncAchievementsUI();
})();
