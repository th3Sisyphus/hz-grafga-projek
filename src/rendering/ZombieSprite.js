/**
 * ZombieSprite - Procedural zombie sprite generator with animations
 */
export class ZombieSprite {
  constructor(isBoss = false) {
    this.isBoss = isBoss;
    this.size = isBoss ? 64 : 32;
    this.animationFrame = 0;
    this.animationTime = 0;
    this.currentAnimation = "walk";

    // Animation configurations
    this.animations = {
      walk: { frames: 4, speed: 150 }, // ms per frame
      attack: { frames: 3, speed: 100 },
    };
  }

  /**
   * Update animation frame based on delta time
   */
  update(deltaTime, isAttacking = false) {
    // Set animation based on state
    this.currentAnimation = isAttacking ? "attack" : "walk";

    const anim = this.animations[this.currentAnimation];
    this.animationTime += deltaTime;

    if (this.animationTime >= anim.speed) {
      this.animationTime = 0;
      this.animationFrame = (this.animationFrame + 1) % anim.frames;
    }
  }

  /**
   * Draw zombie sprite with current animation frame
   */
  draw(ctx, x, y, facingRight = true) {
    ctx.save();
    ctx.translate(x, y);

    // Flip sprite if facing left
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    if (this.currentAnimation === "walk") {
      this.drawWalkFrame(ctx, this.animationFrame);
    } else {
      this.drawAttackFrame(ctx, this.animationFrame);
    }

    ctx.restore();
  }

  /**
   * Draw walking animation frame
   */
  drawWalkFrame(ctx, frame) {
    const size = this.size;
    const halfSize = size / 2;
    const color = this.isBoss ? "#8b0000" : "#4a5d4a"; // Dark red boss, dark green normal
    const darkColor = this.isBoss ? "#5c0000" : "#2d3a2d";
    const skinColor = this.isBoss ? "#6b5b5b" : "#7a8a7a";

    // Body bobbing animation
    const bobOffset = Math.sin((frame * Math.PI) / 2) * 3;

    // Torso (torn shirt)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, bobOffset, size * 0.4, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Exposed ribs (horror detail)
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = size * 0.03;
    for (let i = 0; i < 3; i++) {
      const ribY = bobOffset - size * 0.15 + i * size * 0.12;
      ctx.beginPath();
      ctx.moveTo(-size * 0.25, ribY);
      ctx.lineTo(size * 0.25, ribY);
      ctx.stroke();
    }

    // Torn cloth edges
    ctx.fillStyle = darkColor;
    for (let i = 0; i < 4; i++) {
      const x = -size * 0.3 + i * size * 0.2;
      ctx.fillRect(x, bobOffset + size * 0.35, size * 0.08, size * 0.1);
    }

    // Head (decaying)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(
      0,
      -size * 0.4 + bobOffset,
      size * 0.28,
      size * 0.3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Skull cracks
    ctx.strokeStyle = "#000";
    ctx.lineWidth = size * 0.02;
    ctx.beginPath();
    ctx.moveTo(-size * 0.15, -size * 0.5 + bobOffset);
    ctx.lineTo(-size * 0.1, -size * 0.35 + bobOffset);
    ctx.stroke();

    // Eyes (glowing red/yellow)
    const eyeColor = this.isBoss ? "#ff0000" : "#ffff00";
    ctx.fillStyle = eyeColor;
    ctx.shadowBlur = 5;
    ctx.shadowColor = eyeColor;
    const eyeOffset = size * 0.1;
    ctx.beginPath();
    ctx.arc(-eyeOffset, -size * 0.42 + bobOffset, size * 0.06, 0, Math.PI * 2);
    ctx.arc(eyeOffset, -size * 0.42 + bobOffset, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pupils (dark)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-eyeOffset, -size * 0.42 + bobOffset, size * 0.03, 0, Math.PI * 2);
    ctx.arc(eyeOffset, -size * 0.42 + bobOffset, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Open mouth (showing teeth)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(
      0,
      -size * 0.3 + bobOffset,
      size * 0.12,
      size * 0.08,
      0,
      0,
      Math.PI
    );
    ctx.fill();

    // Teeth
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 4; i++) {
      const toothX = -size * 0.09 + i * size * 0.06;
      ctx.fillRect(toothX, -size * 0.3 + bobOffset, size * 0.04, size * 0.05);
    }

    // Blood dripping from mouth
    ctx.fillStyle = "#8b0000";
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.25 + bobOffset);
    ctx.lineTo(-size * 0.05, -size * 0.15 + bobOffset);
    ctx.lineTo(size * 0.05, -size * 0.15 + bobOffset);
    ctx.fill();

    // Arms (decaying, swinging)
    const armSwing = Math.sin((frame * Math.PI) / 2) * 0.4;
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = size * 0.1;
    ctx.lineCap = "round";

    // Left arm
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, bobOffset - size * 0.1);
    ctx.lineTo(-size * 0.4, size * 0.2 + armSwing * size * 0.25);
    ctx.stroke();

    // Left hand (claw)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(
      -size * 0.4,
      size * 0.2 + armSwing * size * 0.25,
      size * 0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Claws on left hand
    ctx.strokeStyle = "#000";
    ctx.lineWidth = size * 0.02;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(
        -size * 0.4 - size * 0.04 + i * size * 0.04,
        size * 0.2 + armSwing * size * 0.25
      );
      ctx.lineTo(
        -size * 0.4 - size * 0.04 + i * size * 0.04,
        size * 0.28 + armSwing * size * 0.25
      );
      ctx.stroke();
    }

    // Right arm
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = size * 0.1;
    ctx.beginPath();
    ctx.moveTo(size * 0.3, bobOffset - size * 0.1);
    ctx.lineTo(size * 0.4, size * 0.2 - armSwing * size * 0.25);
    ctx.stroke();

    // Right hand (claw)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(
      size * 0.4,
      size * 0.2 - armSwing * size * 0.25,
      size * 0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Claws on right hand
    ctx.strokeStyle = "#000";
    ctx.lineWidth = size * 0.02;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(
        size * 0.4 - size * 0.04 + i * size * 0.04,
        size * 0.2 - armSwing * size * 0.25
      );
      ctx.lineTo(
        size * 0.4 - size * 0.04 + i * size * 0.04,
        size * 0.28 - armSwing * size * 0.25
      );
      ctx.stroke();
    }

    // Legs (torn pants, walking)
    const legSwing = Math.sin((frame * Math.PI) / 2) * 0.5;
    ctx.strokeStyle = "#2c2c2c"; // Dark pants
    ctx.lineWidth = size * 0.12;

    // Left leg
    ctx.beginPath();
    ctx.moveTo(-size * 0.15, size * 0.35);
    ctx.lineTo(-size * 0.2 + legSwing * size * 0.2, size * 0.55);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(size * 0.15, size * 0.35);
    ctx.lineTo(size * 0.2 - legSwing * size * 0.2, size * 0.55);
    ctx.stroke();

    // Feet (shoes)
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(
      -size * 0.25 + legSwing * size * 0.2,
      size * 0.53,
      size * 0.12,
      size * 0.06
    );
    ctx.fillRect(
      size * 0.15 - legSwing * size * 0.2,
      size * 0.53,
      size * 0.12,
      size * 0.06
    );

    // Boss specific details
    if (this.isBoss) {
      // Larger spikes on back
      ctx.fillStyle = "#660000";
      for (let i = 0; i < 4; i++) {
        const spikeX = -size * 0.3 + i * size * 0.2;
        ctx.beginPath();
        ctx.moveTo(spikeX, bobOffset - size * 0.15);
        ctx.lineTo(spikeX - size * 0.08, bobOffset - size * 0.35);
        ctx.lineTo(spikeX + size * 0.08, bobOffset - size * 0.15);
        ctx.fill();
      }

      // Boss crown/horns
      ctx.fillStyle = "#8b0000";
      ctx.beginPath();
      ctx.moveTo(-size * 0.2, -size * 0.55 + bobOffset);
      ctx.lineTo(-size * 0.15, -size * 0.7 + bobOffset);
      ctx.lineTo(-size * 0.1, -size * 0.55 + bobOffset);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(size * 0.1, -size * 0.55 + bobOffset);
      ctx.lineTo(size * 0.15, -size * 0.7 + bobOffset);
      ctx.lineTo(size * 0.2, -size * 0.55 + bobOffset);
      ctx.fill();
    }
  }

  /**
   * Draw attack animation frame
   */
  drawAttackFrame(ctx, frame) {
    const size = this.size;
    const color = this.isBoss ? "#8b0000" : "#4a5d4a";
    const darkColor = this.isBoss ? "#5c0000" : "#2d3a2d";
    const skinColor = this.isBoss ? "#6b5b5b" : "#7a8a7a";

    // Lunge forward animation
    const lungeOffset = frame * size * 0.2;
    const leanAngle = frame * 0.15;

    // Torso (leaning forward aggressively)
    ctx.save();
    ctx.translate(lungeOffset, 0);
    ctx.rotate(leanAngle);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.4, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Exposed ribs
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = size * 0.03;
    for (let i = 0; i < 3; i++) {
      const ribY = -size * 0.15 + i * size * 0.12;
      ctx.beginPath();
      ctx.moveTo(-size * 0.25, ribY);
      ctx.lineTo(size * 0.25, ribY);
      ctx.stroke();
    }

    ctx.restore();

    // Head (lunging forward)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(
      lungeOffset + size * 0.25,
      -size * 0.3,
      size * 0.28,
      size * 0.3,
      leanAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Eyes (wide and angry)
    const eyeColor = this.isBoss ? "#ff0000" : "#ffff00";
    ctx.fillStyle = eyeColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = eyeColor;
    ctx.beginPath();
    ctx.arc(
      lungeOffset + size * 0.15,
      -size * 0.35,
      size * 0.08,
      0,
      Math.PI * 2
    );
    ctx.arc(
      lungeOffset + size * 0.35,
      -size * 0.35,
      size * 0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pupils (dilated)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(
      lungeOffset + size * 0.15,
      -size * 0.35,
      size * 0.04,
      0,
      Math.PI * 2
    );
    ctx.arc(
      lungeOffset + size * 0.35,
      -size * 0.35,
      size * 0.04,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Mouth (wide open, screaming)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(
      lungeOffset + size * 0.25,
      -size * 0.18,
      size * 0.15,
      size * 0.12,
      0,
      0,
      Math.PI
    );
    ctx.fill();

    // Sharp teeth (more visible)
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 5; i++) {
      const toothX = lungeOffset + size * 0.12 + i * size * 0.06;
      // Upper teeth
      ctx.fillRect(toothX, -size * 0.18, size * 0.04, size * 0.06);
      // Lower teeth
      ctx.fillRect(
        toothX + size * 0.02,
        -size * 0.12,
        size * 0.03,
        size * 0.05
      );
    }

    // Blood dripping (more intense)
    ctx.fillStyle = "#8b0000";
    ctx.beginPath();
    ctx.moveTo(lungeOffset + size * 0.2, -size * 0.12);
    ctx.lineTo(lungeOffset + size * 0.15, 0);
    ctx.lineTo(lungeOffset + size * 0.25, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(lungeOffset + size * 0.3, -size * 0.12);
    ctx.lineTo(lungeOffset + size * 0.28, 0);
    ctx.lineTo(lungeOffset + size * 0.32, 0);
    ctx.fill();

    // Arms (reaching forward aggressively)
    const reachDistance = lungeOffset + size * 0.5;
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = size * 0.1;
    ctx.lineCap = "round";

    // Both arms extended forward
    ctx.beginPath();
    ctx.moveTo(lungeOffset, -size * 0.15);
    ctx.lineTo(reachDistance, -size * 0.25);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(lungeOffset, size * 0.05);
    ctx.lineTo(reachDistance, -size * 0.05);
    ctx.stroke();

    // Hands (claws extended)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(reachDistance, -size * 0.25, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(reachDistance, -size * 0.05, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Sharp claws (extended)
    ctx.strokeStyle = "#000";
    ctx.lineWidth = size * 0.03;
    for (let i = 0; i < 4; i++) {
      const clawAngle = -0.5 + i * 0.3;
      // Top hand claws
      ctx.beginPath();
      ctx.moveTo(reachDistance, -size * 0.25);
      ctx.lineTo(
        reachDistance + Math.cos(clawAngle) * size * 0.12,
        -size * 0.25 + Math.sin(clawAngle) * size * 0.12
      );
      ctx.stroke();

      // Bottom hand claws
      ctx.beginPath();
      ctx.moveTo(reachDistance, -size * 0.05);
      ctx.lineTo(
        reachDistance + Math.cos(clawAngle) * size * 0.12,
        -size * 0.05 + Math.sin(clawAngle) * size * 0.12
      );
      ctx.stroke();
    }

    // Legs (bracing for attack)
    ctx.strokeStyle = "#2c2c2c";
    ctx.lineWidth = size * 0.12;

    ctx.beginPath();
    ctx.moveTo(-size * 0.1, size * 0.35);
    ctx.lineTo(-size * 0.3, size * 0.55);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size * 0.1, size * 0.35);
    ctx.lineTo(0, size * 0.55);
    ctx.stroke();

    // Feet
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-size * 0.35, size * 0.53, size * 0.12, size * 0.06);
    ctx.fillRect(-size * 0.05, size * 0.53, size * 0.12, size * 0.06);

    // Boss attack effects
    if (this.isBoss && frame === 2) {
      // Impact shockwave
      ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
      ctx.lineWidth = size * 0.05;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(reachDistance, -size * 0.15 + i * size * 0.1);
        ctx.lineTo(reachDistance + size * 0.25, -size * 0.2 + i * size * 0.1);
        ctx.stroke();
      }

      // Blood splatter
      ctx.fillStyle = "rgba(139, 0, 0, 0.7)";
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = size * 0.3 + Math.random() * size * 0.2;
        ctx.beginPath();
        ctx.arc(
          reachDistance + Math.cos(angle) * dist,
          -size * 0.15 + Math.sin(angle) * dist,
          size * 0.04,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}
