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
      ctx.fillStyle = "#111";

      // Gun 1
      ctx.fillRect(10, -10, 16, 5);
      ctx.fillRect(22, -10, 4, 3);

      // Gun 2
      ctx.fillRect(10, 5, 16, 5);
      ctx.fillRect(22, 5, 4, 3);
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
