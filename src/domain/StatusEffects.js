/**
 * Sistem Terpadu Status Effects (STATUS_EFFECTS)
 * Digunakan oleh Player dan seluruh Musuh (Zombie / Boss).
 * Efek: burn, slow, freeze, poison, stun, knockback.
 */

export class StatusEffects {
  constructor(owner) {
    this.owner = owner; // Entitas pemilik (Player, Zombie, Boss)
    this.effects = {
      burn: null,      // { endTime, damage, lastTick, tickInterval: 500 }
      poison: null,    // { endTime, damage, lastTick, tickInterval: 1000 }
      slow: null,      // { endTime, multiplier: 0.5 }
      freeze: null,    // { endTime, multiplier: 0.2 }
      stun: null,      // { endTime }
    };
  }

  apply(type, duration, value = 0, gameTime = 0) {
    const endTime = gameTime + duration;

    switch (type) {
      case "burn":
        this.effects.burn = {
          endTime,
          damage: value || 12,
          lastTick: gameTime,
          tickInterval: 500,
        };
        break;

      case "poison":
        this.effects.poison = {
          endTime,
          damage: value || 8,
          lastTick: gameTime,
          tickInterval: 800,
        };
        break;

      case "slow":
        this.effects.slow = {
          endTime,
          multiplier: Math.max(0.2, value || 0.5),
        };
        break;

      case "freeze":
        this.effects.freeze = {
          endTime,
          multiplier: Math.max(0.1, value || 0.2),
        };
        break;

      case "stun":
        this.effects.stun = {
          endTime,
        };
        if (typeof this.owner.applyStun === "function") {
          this.owner.applyStun(duration, gameTime);
        }
        break;

      case "knockback":
        if (value && typeof value.angle === "number") {
          const dist = value.distance || 15;
          this.owner.x += Math.cos(value.angle) * dist;
          this.owner.y += Math.sin(value.angle) * dist;
        }
        break;
    }
  }

  isStunned(gameTime) {
    return this.effects.stun && gameTime < this.effects.stun.endTime;
  }

  isFrozen(gameTime) {
    return this.effects.freeze && gameTime < this.effects.freeze.endTime;
  }

  isBurning(gameTime) {
    return this.effects.burn && gameTime < this.effects.burn.endTime;
  }

  isPoisoned(gameTime) {
    return this.effects.poison && gameTime < this.effects.poison.endTime;
  }

  getSpeedMultiplier(gameTime) {
    let mult = 1.0;
    if (this.effects.freeze && gameTime < this.effects.freeze.endTime) {
      mult *= this.effects.freeze.multiplier;
    }
    if (this.effects.slow && gameTime < this.effects.slow.endTime) {
      mult *= this.effects.slow.multiplier;
    }
    return mult;
  }

  /**
   * Update DOT (Burn, Poison) dan bersihkan efek yang sudah usai
   */
  update(combatSystem, gameTime) {
    // 1. Burn DOT
    if (this.effects.burn) {
      if (gameTime < this.effects.burn.endTime) {
        if (gameTime - this.effects.burn.lastTick >= this.effects.burn.tickInterval) {
          this.effects.burn.lastTick = gameTime;
          combatSystem.applyDamage(this.owner, this.effects.burn.damage, false);
        }
      } else {
        this.effects.burn = null;
      }
    }

    // 2. Poison DOT
    if (this.effects.poison) {
      if (gameTime < this.effects.poison.endTime) {
        if (gameTime - this.effects.poison.lastTick >= this.effects.poison.tickInterval) {
          this.effects.poison.lastTick = gameTime;
          combatSystem.applyDamage(this.owner, this.effects.poison.damage, false);
        }
      } else {
        this.effects.poison = null;
      }
    }

    // 3. Slow & Freeze expiration
    if (this.effects.slow && gameTime >= this.effects.slow.endTime) {
      this.effects.slow = null;
    }
    if (this.effects.freeze && gameTime >= this.effects.freeze.endTime) {
      this.effects.freeze = null;
    }
    if (this.effects.stun && gameTime >= this.effects.stun.endTime) {
      this.effects.stun = null;
    }
  }
}
