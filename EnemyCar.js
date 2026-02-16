// Enemy Car Entity with AI
class EnemyCar {
    constructor(x, y, player) {
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.ENEMY.SIZE.width;
        this.height = GAME_CONFIG.ENEMY.SIZE.height;
        this.angle = 0;
        this.speed = GAME_CONFIG.ENEMY.BASE_SPEED + MathHelpers.randomRange(-GAME_CONFIG.ENEMY.SPEED_VARIANCE, GAME_CONFIG.ENEMY.SPEED_VARIANCE);
        this.velocityX = 0;
        this.velocityY = 0;
        
        this.player = player;
        this.color = GAME_CONFIG.COLORS.ENEMY;
        this.radius = GAME_CONFIG.COLLISION.ENEMY_RADIUS;
        
        // AI properties
        this.targetX = x;
        this.targetY = y;
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.updateTargetTimer = 0;
        
        this.isDestroyed = false;
        this.destroyAnimationTimer = 0;
    }

    update(deltaTime, enemies) {
        if (this.isDestroyed) {
            this.destroyAnimationTimer += deltaTime;
            return;
        }

        // Update AI target periodically
        this.updateTargetTimer += deltaTime;
        if (this.updateTargetTimer > 0.5) {
            this.updateTarget();
            this.updateTargetTimer = 0;
        }

        // Calculate direction to target with prediction
        const predictedPlayerX = this.player.x + this.player.velocityX * GAME_CONFIG.ENEMY.PREDICTION_FACTOR;
        const predictedPlayerY = this.player.y + this.player.velocityY * GAME_CONFIG.ENEMY.PREDICTION_FACTOR;

        let targetAngle = Math.atan2(predictedPlayerY - this.y, predictedPlayerX - this.x);

        // Add wander behavior
        this.wanderAngle += (Math.random() - 0.5) * 2;
        targetAngle += Math.sin(this.wanderAngle) * GAME_CONFIG.ENEMY.WANDER_STRENGTH;

        // Separation from other enemies
        const separationForce = this.calculateSeparation(enemies);
        targetAngle += separationForce.angle * separationForce.strength;

        // Smooth rotation
        let angleDiff = targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        this.angle += angleDiff * 2.5 * deltaTime;

        // Update velocity
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;

        // Update position
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    updateTarget() {
        // Simple chase behavior - target player position
        this.targetX = this.player.x;
        this.targetY = this.player.y;
    }

    calculateSeparation(enemies) {
        let separationX = 0;
        let separationY = 0;
        let count = 0;

        enemies.forEach(enemy => {
            if (enemy === this || enemy.isDestroyed) return;

            const dist = MathHelpers.distance(this.x, this.y, enemy.x, enemy.y);
            if (dist < GAME_CONFIG.ENEMY.SEPARATION_DISTANCE && dist > 0) {
                const angle = Math.atan2(this.y - enemy.y, this.x - enemy.x);
                const force = (GAME_CONFIG.ENEMY.SEPARATION_DISTANCE - dist) / GAME_CONFIG.ENEMY.SEPARATION_DISTANCE;
                separationX += Math.cos(angle) * force;
                separationY += Math.sin(angle) * force;
                count++;
            }
        });

        if (count > 0) {
            separationX /= count;
            separationY /= count;
            const strength = Math.sqrt(separationX * separationX + separationY * separationY);
            const angle = Math.atan2(separationY, separationX);
            return { angle, strength: Math.min(strength, 1) };
        }

        return { angle: 0, strength: 0 };
    }

    destroy() {
        this.isDestroyed = true;
        this.destroyAnimationTimer = 0;
        soundManager.playSound('explosion', 0.8);
    }

    render(ctx) {
        if (this.isDestroyed) {
            // Explosion animation
            const progress = this.destroyAnimationTimer / (GAME_CONFIG.EFFECTS.EXPLOSION_DURATION / 1000);
            if (progress < 1) {
                ctx.save();
                ctx.globalAlpha = 1 - progress;
                ctx.fillStyle = GAME_CONFIG.COLORS.EXPLOSION;
                
                const explosionSize = this.width * (1 + progress * 2);
                ctx.beginPath();
                ctx.arc(this.x, this.y, explosionSize / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Particles
                const particleCount = 8;
                for (let i = 0; i < particleCount; i++) {
                    const angle = (Math.PI * 2 / particleCount) * i;
                    const dist = progress * 50;
                    const px = this.x + Math.cos(angle) * dist;
                    const py = this.y + Math.sin(angle) * dist;
                    ctx.fillStyle = '#ff6b35';
                    ctx.beginPath();
                    ctx.arc(px, py, 5 * (1 - progress), 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            }
            return;
        }

        // Render car
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Car body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Car details (windshield)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-this.width / 4, -this.height / 3, this.width / 2, this.height / 4);

        // Car outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        };
    }

    isOffScreen(cameraX, cameraY, screenWidth, screenHeight) {
        const margin = 200;
        return (
            this.x < cameraX - screenWidth / 2 - margin ||
            this.x > cameraX + screenWidth / 2 + margin ||
            this.y < cameraY - screenHeight / 2 - margin ||
            this.y > cameraY + screenHeight / 2 + margin
        );
    }
}
