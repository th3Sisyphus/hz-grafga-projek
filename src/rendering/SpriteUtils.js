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
      // Book cover
      ctx.fillStyle = "#7c3aed";
      ctx.fillRect(10, -12, 20, 24);

      // Spine
      ctx.fillStyle = "#a78bfa";
      ctx.fillRect(10, -12, 4, 24);

      // Magical glow line
      ctx.strokeStyle = "rgba(147, 197, 253, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(28, -10);
      ctx.lineTo(28, 10);
      ctx.stroke();
      break;
  }

  ctx.restore();
}
