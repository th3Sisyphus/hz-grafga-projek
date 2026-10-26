/**
 * FxContext.js
 * API context.fx untuk Hit-Stop, Screen Shake deterministik, dan Directional Damage Vignette.
 * Dapat dimatikan atau dikonfigurasi melalui settings.
 */

export class FxContext {
  constructor(context) {
    this.context = context;
    this.hitStopEndTime = 0;
    this.shakeIntensity = 0;
    this.shakeSeed = 0;
    this.directionalIndicators = []; // { angle, alpha, maxAlpha, duration, startTime }
  }

  /**
   * Memicu hit-stop micro-freeze (40-60 ms) saat tebasan mengenai zombie
   */
  hitStop(durationMs = 50) {
    if (this.context.settings?.hitStop === false) return;
    const now = performance.now();
    this.hitStopEndTime = Math.max(this.hitStopEndTime, now + durationMs);
  }

  /**
   * Cek apakah saat ini sedang dalam kondisi hit-stop
   */
  isHitStopped() {
    return performance.now() < this.hitStopEndTime;
  }

  /**
   * Memicu screen shake deterministik
   */
  shake(intensity = 6) {
    if (this.context.settings?.screenShake === false) return;
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  /**
   * Indikator arah serangan musuh di tepi layar (busur merah di tepi canvas)
   */
  addDirectionalDamage(sourceX, sourceY) {
    if (!this.context.player) return;
    const angle = Math.atan2(
      sourceY - this.context.player.y,
      sourceX - this.context.player.x
    );
    this.directionalIndicators.push({
      angle,
      alpha: 1.0,
      startTime: this.context.time,
      duration: 500, // 500 ms pudar
    });
  }

  /**
   * Update per frame
   */
  update(dt = 1) {
    // Redam intensitas getaran layar
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - 0.4 * dt);
      this.shakeSeed = (this.shakeSeed + 1) % 1000;
    }

    // Update indikator arah
    const time = this.context.time;
    for (let i = this.directionalIndicators.length - 1; i >= 0; i--) {
      const ind = this.directionalIndicators[i];
      const elapsed = time - ind.startTime;
      ind.alpha = Math.max(0, 1.0 - elapsed / ind.duration);
      if (ind.alpha <= 0) {
        this.directionalIndicators.splice(i, 1);
      }
    }
  }

  /**
   * Hitung offset kamera akibat shake deterministik (tanpa Math.random di render)
   */
  getShakeOffset() {
    if (this.shakeIntensity <= 0 || this.context.settings?.screenShake === false) {
      return { x: 0, y: 0 };
    }
    // Hash deterministik dari shakeSeed
    const h1 = ((this.shakeSeed * 374761393) ^ 0x5bf03635) >>> 0;
    const h2 = ((this.shakeSeed * 668265263) ^ 0x9e3779b9) >>> 0;
    const normX = ((h1 % 1000) / 500) - 1.0;
    const normY = ((h2 % 1000) / 500) - 1.0;

    return {
      x: Math.round(normX * this.shakeIntensity),
      y: Math.round(normY * this.shakeIntensity),
    };
  }
}
