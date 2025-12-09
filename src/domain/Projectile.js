class Projectile {
  constructor(x, y, angle, weapon) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 8;
    this.weapon = weapon;
    this.distance = 0;
    this.maxDistance = weapon.range;
    this.hit = false;
  }

  update(context) {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.distance += this.speed;

    if (this.distance >= this.maxDistance || context.isObstacle(this.x, this.y)) {
      return false;
    }

    for (let zombie of zombies) {
      const dist = Math.hypot(zombie.x - this.x, zombie.y - this.y);
      if (dist < 20) {
        zombie.takeDamage(this.weapon.damage);

        if (this.weapon.name === "Wizard Book") {
          zombie.applyBurn(this.weapon.dotDamage, this.weapon.dotDuration);
          effects.push(new BurnEffect(zombie.x, zombie.y));
        } else if (this.weapon.name === "Dual Gun") {
          effects.push(
            new ExplosionEffect(zombie.x, zombie.y, this.weapon.aoeRadius)
          );
          for (let otherZombie of zombies) {
            if (otherZombie !== zombie) {
              const aoeDist = Math.hypot(
                otherZombie.x - zombie.x,
                otherZombie.y - zombie.y
              );
              if (aoeDist < this.weapon.aoeRadius) {
                otherZombie.takeDamage(this.weapon.damage * 0.5);
              }
            }
          }
        }

        return false;
      }
    }

    return true;
  }

  draw() {
    const screenX = this.x - gameState.camera.x;
    const screenY = this.y - gameState.camera.y;

    if (this.weapon.name === "Wizard Book") {
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ff6600";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
