export function drawWeaponSprite(ctx, weaponName) {
  ctx.save();

  // Semua drawing relatif terhadap titik (0, 0) yang sudah di-translate/rotate sebelumnya.
  switch (weaponName) {
    case "Tangan Kosong":
      // No sprite - completely invisible when not attacking
      break;

    case "Katana":
      // Blade (with gradient for metallic look)
      const gradient = ctx.createLinearGradient(10, -2, 10, 2);
      gradient.addColorStop(0, "#e0e7ff");
      gradient.addColorStop(0.5, "#ffffff");
      gradient.addColorStop(1, "#c7d2fe");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(10, -1.5);
      ctx.lineTo(40, -0.5);
      ctx.lineTo(40, 0.5);
      ctx.lineTo(10, 1.5);
      ctx.closePath();
      ctx.fill();

      // Blade edge (sharp line)
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(10, -1);
      ctx.lineTo(40, -0.3);
      ctx.stroke();

      // Blood groove (hi)
      ctx.strokeStyle = "rgba(100, 100, 120, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(38, 0);
      ctx.stroke();

      // Tsuba (guard) - ornate design
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(10, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Tsuba decoration
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(10, 0, 3, 0, Math.PI * 2);
      ctx.stroke();

      // Tsuka (handle) - wrapped design
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, -2, 10, 4);

      // Handle wrap pattern (tsuka-ito)
      ctx.strokeStyle = "#4a5568";
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const x = 2 + i * 2;
        ctx.beginPath();
        ctx.moveTo(x, -2);
        ctx.lineTo(x + 1, 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 1, -2);
        ctx.lineTo(x, 2);
        ctx.stroke();
      }

      // Kashira (pommel)
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-1, -2.5, 2, 5);

      // Pommel decoration
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "Dual Gun":
      // Detailed dual pistols
      const drawPistol = (offsetY) => {
        ctx.save();
        ctx.translate(0, offsetY);

        // Barrel (front)
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(20, -2.5, 12, 5);

        // Barrel tip
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(31, -2, 2, 4);

        // Muzzle (hole)
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(32, 0, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Slide (top)
        const slideGradient = ctx.createLinearGradient(8, -3.5, 8, -1);
        slideGradient.addColorStop(0, "#4a4a4a");
        slideGradient.addColorStop(1, "#2a2a2a");
        ctx.fillStyle = slideGradient;
        ctx.fillRect(8, -3.5, 24, 3);

        // Slide serrations
        ctx.fillStyle = "#1a1a1a";
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(10 + i * 3, -3.5, 1.5, 2);
        }

        // Frame/Grip
        const gripGradient = ctx.createLinearGradient(5, -1, 5, 4);
        gripGradient.addColorStop(0, "#3a3a3a");
        gripGradient.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = gripGradient;
        ctx.beginPath();
        ctx.moveTo(8, -0.5);
        ctx.lineTo(8, 3.5);
        ctx.lineTo(2, 5);
        ctx.lineTo(2, 1);
        ctx.lineTo(5, -0.5);
        ctx.closePath();
        ctx.fill();

        // Grip texture
        ctx.fillStyle = "#2a2a2a";
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 2; j++) {
            ctx.fillRect(3 + j * 2, 2 + i * 1.2, 1, 0.8);
          }
        }

        // Trigger guard
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(9, 1.5, 2, Math.PI / 2, Math.PI * 1.5);
        ctx.stroke();

        // Trigger
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(8.5, 1, 1.5, 2);

        // Sight (front)
        ctx.fillStyle = "#ff6600";
        ctx.fillRect(30, -4, 1.5, 1.5);

        // Sight (rear)
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(10, -4, 2, 1.5);

        // Highlight on slide
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(12, -3, 15, 1);

        ctx.restore();
      };

      // Draw both pistols
      drawPistol(-8); // Top gun
      drawPistol(8); // Bottom gun

      // Muzzle flash effect (random flicker)
      if (Math.random() > 0.7) {
        const flashY = Math.random() > 0.5 ? -8 : 8;
        ctx.fillStyle = `rgba(255, 200, 0, ${0.6 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(33, flashY);
        ctx.lineTo(38, flashY - 3);
        ctx.lineTo(38, flashY + 3);
        ctx.closePath();
        ctx.fill();

        // Flash glow
        ctx.fillStyle = "rgba(255, 150, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(35, flashY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "Wizard Book":
      // Position book to the side (not above)
      ctx.save();
      ctx.translate(0, -15); // Slightly above center, to the side

      // Floating animation (subtle bob)
      const floatOffset = Math.sin(Date.now() / 300) * 2;
      ctx.translate(0, floatOffset);

      // Magical aura glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#a78bfa";

      // Book cover (purple/violet)
      const bookGradient = ctx.createLinearGradient(0, -14, 0, 14);
      bookGradient.addColorStop(0, "#9333ea");
      bookGradient.addColorStop(0.5, "#7c3aed");
      bookGradient.addColorStop(1, "#6b21a8");
      ctx.fillStyle = bookGradient;
      ctx.fillRect(0, -14, 22, 28);

      // Book spine (left edge)
      ctx.fillStyle = "#581c87";
      ctx.fillRect(0, -14, 3, 28);

      // Spine highlights
      ctx.fillStyle = "#a78bfa";
      ctx.fillRect(0.5, -12, 1.5, 24);

      // Pages (right edge)
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(21, -13, 2, 26);

      // Page lines
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(21.5, -10 + i * 5);
        ctx.lineTo(22.5, -10 + i * 5);
        ctx.stroke();
      }

      // Magical runes on cover
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 8px serif";
      ctx.fillText("✦", 8, -2);
      ctx.fillText("◈", 12, 6);

      // Glowing orb/crystal on cover
      const orbGradient = ctx.createRadialGradient(11, 0, 0, 11, 0, 4);
      orbGradient.addColorStop(0, "#fbbf24");
      orbGradient.addColorStop(0.5, "#f59e0b");
      orbGradient.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = orbGradient;
      ctx.beginPath();
      ctx.arc(11, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Magical particles around book
      ctx.shadowBlur = 8;
      for (let i = 0; i < 3; i++) {
        const angle =
          (Date.now() / 500 + (i * Math.PI * 2) / 3) % (Math.PI * 2);
        const radius = 18;
        const px = 11 + Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;

        ctx.fillStyle = `rgba(168, 85, 247, ${
          0.3 + Math.sin(Date.now() / 200 + i) * 0.2
        })`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.restore();
      break;
  }

  ctx.restore();
}
