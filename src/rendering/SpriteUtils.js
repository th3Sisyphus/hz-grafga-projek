export function drawWeaponSprite(ctx, weaponName) {
  ctx.save();

  // Semua drawing relatif terhadap titik (0, 0) yang sudah di-translate/rotate sebelumnya.
  switch (weaponName) {
    case "Tangan Kosong":
      // Glove
      ctx.fillStyle = "#d97706";
      ctx.beginPath();
      ctx.roundRect(10, -6, 14, 12, 4);
      ctx.fill();
      break;

    case "Katana":
      // Blade
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(35, 0);
      ctx.stroke();

      // Handle
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
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
