// AI Controller - Advanced enemy behavior patterns
class AIController {
    constructor() {
        this.behaviors = {
            CHASE: 'chase',
            FLANK: 'flank',
            AMBUSH: 'ambush',
            SWARM: 'swarm'
        };
    }

    /**
     * Calculate optimal direction for enemy to pursue player
     */
    calculatePursuitDirection(enemy, player, enemies) {
        // Basic chase behavior with prediction
        const predictedX = player.x + player.velocityX * GAME_CONFIG.ENEMY.PREDICTION_FACTOR;
        const predictedY = player.y + player.velocityY * GAME_CONFIG.ENEMY.PREDICTION_FACTOR;

        let targetAngle = Math.atan2(predictedY - enemy.y, predictedX - enemy.x);

        // Add separation from other enemies
        const separation = this.calculateSeparationForce(enemy, enemies);
        if (separation.strength > 0) {
            targetAngle += separation.angle * separation.strength * 0.3;
        }

        // Add some randomness for unpredictability
        targetAngle += (Math.random() - 0.5) * 0.2;

        return targetAngle;
    }

    /**
     * Calculate separation force to avoid clustering
     */
    calculateSeparationForce(enemy, enemies) {
        let separationX = 0;
        let separationY = 0;
        let count = 0;

        enemies.forEach(other => {
            if (other === enemy || other.isDestroyed) return;

            const dist = MathHelpers.distance(enemy.x, enemy.y, other.x, other.y);
            if (dist < GAME_CONFIG.ENEMY.SEPARATION_DISTANCE && dist > 0) {
                const angle = Math.atan2(enemy.y - other.y, enemy.x - other.x);
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

    /**
     * Calculate flanking position to surround player
     */
    calculateFlankingPosition(enemy, player, enemyIndex) {
        const angleOffset = (Math.PI * 2 / 4) * enemyIndex;
        const flankDistance = 300;
        
        const targetX = player.x + Math.cos(angleOffset) * flankDistance;
        const targetY = player.y + Math.sin(angleOffset) * flankDistance;

        return {
            x: targetX,
            y: targetY,
            angle: Math.atan2(targetY - enemy.y, targetX - enemy.x)
        };
    }

    /**
     * Check if enemy should change behavior
     */
    shouldChangeBehavior(enemy, player) {
        const distance = MathHelpers.distance(enemy.x, enemy.y, player.x, player.y);
        
        // Change behavior based on distance
        if (distance > 400) {
            return this.behaviors.CHASE;
        } else if (distance > 200) {
            return this.behaviors.FLANK;
        } else {
            return this.behaviors.SWARM;
        }
    }

    /**
     * Calculate optimal speed based on distance to player
     */
    calculateOptimalSpeed(enemy, player) {
        const distance = MathHelpers.distance(enemy.x, enemy.y, player.x, player.y);
        const baseSpeed = GAME_CONFIG.ENEMY.BASE_SPEED;

        if (distance > 500) {
            return baseSpeed * 1.1; // Speed up if far
        } else if (distance < 150) {
            return baseSpeed * 0.9; // Slow down if too close
        }

        return baseSpeed;
    }
}

// Create global AI controller instance
const aiController = new AIController();
