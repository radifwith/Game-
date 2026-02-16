// Spawn Manager - Handles enemy spawning
class SpawnManager {
    constructor(player) {
        this.player = player;
        this.spawnTimer = 0;
        this.currentSpawnRate = GAME_CONFIG.ENEMY.SPAWN_INTERVAL;
        this.currentMaxEnemies = GAME_CONFIG.ENEMY.INITIAL_COUNT;
        this.currentSpeedMultiplier = 0.85;
    }

    update(deltaTime, enemies, survivalTime) {
        // Update difficulty based on survival time
        this.updateDifficulty(survivalTime);

        // Spawn new enemies
        this.spawnTimer += deltaTime * 1000;
        if (this.spawnTimer >= this.currentSpawnRate) {
            this.spawnTimer = 0;
            
            // Count active enemies
            const activeEnemies = enemies.filter(e => !e.isDestroyed).length;
            
            if (activeEnemies < this.currentMaxEnemies) {
                return this.spawnEnemy();
            }
        }

        return null;
    }

    updateDifficulty(survivalTime) {
        // Find current difficulty tier
        let currentTier = GAME_CONFIG.DIFFICULTY.TIME_THRESHOLDS[0];
        
        for (let tier of GAME_CONFIG.DIFFICULTY.TIME_THRESHOLDS) {
            if (survivalTime >= tier.time) {
                currentTier = tier;
            }
        }

        this.currentMaxEnemies = currentTier.enemies;
        this.currentSpawnRate = currentTier.spawnRate;
        this.currentSpeedMultiplier = currentTier.speed;
    }

    spawnEnemy() {
        // Spawn enemy at edge of screen
        const spawnAngle = Math.random() * Math.PI * 2;
        const spawnDistance = GAME_CONFIG.ENEMY.SPAWN_DISTANCE;
        
        const spawnX = this.player.x + Math.cos(spawnAngle) * spawnDistance;
        const spawnY = this.player.y + Math.sin(spawnAngle) * spawnDistance;

        const enemy = new EnemyCar(spawnX, spawnY, this.player);
        enemy.speed *= this.currentSpeedMultiplier;

        return enemy;
    }

    reset() {
        this.spawnTimer = 0;
        this.currentSpawnRate = GAME_CONFIG.ENEMY.SPAWN_INTERVAL;
        this.currentMaxEnemies = GAME_CONFIG.ENEMY.INITIAL_COUNT;
        this.currentSpeedMultiplier = 0.85;
    }

    getDifficultyInfo() {
        return {
            maxEnemies: this.currentMaxEnemies,
            spawnRate: this.currentSpawnRate,
            speedMultiplier: this.currentSpeedMultiplier
        };
    }
}
