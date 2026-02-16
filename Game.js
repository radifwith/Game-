// Main Game Class
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Game entities
        this.player = null;
        this.enemies = [];
        this.obstacles = [];
        
        // Game systems
        this.spawnManager = null;
        this.scoreSystem = null;
        this.particleSystem = null;
        
        // Game state
        this.isPaused = false;
        this.isGameOver = false;
        this.survivalTime = 0;
        this.enemiesDestroyed = 0;
        
        // Camera
        this.cameraX = 0;
        this.cameraY = 0;
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Background tiles
        this.backgroundTiles = [];
        
        this.init();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const aspect = GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.CANVAS_HEIGHT;
        
        let width = container.clientWidth;
        let height = container.clientHeight;
        
        if (width / height > aspect) {
            width = height * aspect;
        } else {
            height = width / aspect;
        }
        
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }

    init() {
        // Create player at center
        this.player = new PlayerCar(
            GAME_CONFIG.CANVAS_WIDTH / 2,
            GAME_CONFIG.CANVAS_HEIGHT / 2
        );
        
        // Initialize systems
        this.spawnManager = new SpawnManager(this.player);
        this.scoreSystem = new ScoreSystem();
        this.particleSystem = new ParticleSystem();
        
        // Create initial enemies
        for (let i = 0; i < GAME_CONFIG.ENEMY.INITIAL_COUNT; i++) {
            const enemy = this.spawnManager.spawnEnemy();
            if (enemy) this.enemies.push(enemy);
        }
        
        // Create obstacles
        this.createObstacles();
        
        // Create background tiles
        this.createBackgroundTiles();
        
        // Set camera
        this.cameraX = this.player.x;
        this.cameraY = this.player.y;
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }

    createObstacles() {
        const centerX = GAME_CONFIG.CANVAS_WIDTH / 2;
        const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2;
        
        // Create trees
        for (let i = 0; i < GAME_CONFIG.OBSTACLES.TREES.COUNT; i++) {
            let x, y;
            let validPosition = false;
            let attempts = 0;
            
            while (!validPosition && attempts < 50) {
                x = MathHelpers.randomRange(
                    centerX - GAME_CONFIG.WORLD_WIDTH / 2,
                    centerX + GAME_CONFIG.WORLD_WIDTH / 2
                );
                y = MathHelpers.randomRange(
                    centerY - GAME_CONFIG.WORLD_HEIGHT / 2,
                    centerY + GAME_CONFIG.WORLD_HEIGHT / 2
                );
                
                // Check distance from center
                const distFromCenter = MathHelpers.distance(x, y, centerX, centerY);
                if (distFromCenter < GAME_CONFIG.OBSTACLES.MIN_DISTANCE_FROM_CENTER) {
                    attempts++;
                    continue;
                }
                
                // Check distance from other obstacles
                validPosition = true;
                for (let obstacle of this.obstacles) {
                    const dist = MathHelpers.distance(x, y, obstacle.x, obstacle.y);
                    if (dist < GAME_CONFIG.OBSTACLES.MIN_DISTANCE_BETWEEN) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            if (validPosition) {
                const size = MathHelpers.randomRange(
                    GAME_CONFIG.OBSTACLES.TREES.MIN_SIZE,
                    GAME_CONFIG.OBSTACLES.TREES.MAX_SIZE
                );
                this.obstacles.push(new Obstacle(x, y, 'tree', size));
            }
        }
        
        // Create rocks
        for (let i = 0; i < GAME_CONFIG.OBSTACLES.ROCKS.COUNT; i++) {
            let x, y;
            let validPosition = false;
            let attempts = 0;
            
            while (!validPosition && attempts < 50) {
                x = MathHelpers.randomRange(
                    centerX - GAME_CONFIG.WORLD_WIDTH / 2,
                    centerX + GAME_CONFIG.WORLD_WIDTH / 2
                );
                y = MathHelpers.randomRange(
                    centerY - GAME_CONFIG.WORLD_HEIGHT / 2,
                    centerY + GAME_CONFIG.WORLD_HEIGHT / 2
                );
                
                const distFromCenter = MathHelpers.distance(x, y, centerX, centerY);
                if (distFromCenter < GAME_CONFIG.OBSTACLES.MIN_DISTANCE_FROM_CENTER) {
                    attempts++;
                    continue;
                }
                
                validPosition = true;
                for (let obstacle of this.obstacles) {
                    const dist = MathHelpers.distance(x, y, obstacle.x, obstacle.y);
                    if (dist < GAME_CONFIG.OBSTACLES.MIN_DISTANCE_BETWEEN) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            if (validPosition) {
                const size = MathHelpers.randomRange(
                    GAME_CONFIG.OBSTACLES.ROCKS.MIN_SIZE,
                    GAME_CONFIG.OBSTACLES.ROCKS.MAX_SIZE
                );
                this.obstacles.push(new Obstacle(x, y, 'rock', size));
            }
        }
    }

    createBackgroundTiles() {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        const tilesX = Math.ceil(GAME_CONFIG.CANVAS_WIDTH / tileSize) + 2;
        const tilesY = Math.ceil(GAME_CONFIG.CANVAS_HEIGHT / tileSize) + 2;
        
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                this.backgroundTiles.push({
                    x: x * tileSize - tileSize,
                    y: y * tileSize - tileSize,
                    type: Math.random() < 0.6 ? 'grass' : 'dirt'
                });
            }
        }
    }

    gameLoop(currentTime = 0) {
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.deltaTime = Math.min(this.deltaTime, 0.1); // Cap at 100ms
        this.lastTime = currentTime;
        
        if (!this.isPaused && !this.isGameOver) {
            this.update(this.deltaTime);
        }
        
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update survival time
        this.survivalTime += deltaTime * 1000;
        
        // Update player
        this.player.update(deltaTime);
        
        // Update camera (player stays at center, world moves)
        this.cameraX = this.player.x;
        this.cameraY = this.player.y;
        
        // Update obstacles (move with world)
        this.obstacles.forEach(obstacle => {
            obstacle.update(deltaTime, {
                x: this.player.velocityX,
                y: this.player.velocityY
            });
        });
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.enemies);
        });
        
        // Spawn new enemies
        const newEnemy = this.spawnManager.update(deltaTime, this.enemies, this.survivalTime);
        if (newEnemy) {
            this.enemies.push(newEnemy);
        }
        
        // Update score system
        this.scoreSystem.update(deltaTime);
        
        // Update particle system
        this.particleSystem.update(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Remove destroyed enemies
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isDestroyed && enemy.destroyAnimationTimer > GAME_CONFIG.EFFECTS.EXPLOSION_DURATION / 1000) {
                return false;
            }
            return true;
        });
        
        // Update HUD
        hud.updateScore(this.scoreSystem.getScore());
        hud.updateTime(this.survivalTime);
    }

    checkCollisions() {
        const playerBounds = this.player.getBounds();
        
        // Check player vs enemies
        this.enemies.forEach(enemy => {
            if (enemy.isDestroyed) return;
            
            const enemyBounds = enemy.getBounds();
            const dist = MathHelpers.distance(
                playerBounds.x, playerBounds.y,
                enemyBounds.x, enemyBounds.y
            );
            
            // Collision
            if (dist < playerBounds.radius + enemyBounds.radius) {
                enemy.destroy();
                this.enemiesDestroyed++;
                this.scoreSystem.addEnemyDestroyed();
                this.particleSystem.createExplosion(enemy.x, enemy.y);
            }
            // Near miss
            else if (dist < GAME_CONFIG.SCORE.NEAR_MISS_DISTANCE) {
                if (!enemy.nearMissTriggered) {
                    enemy.nearMissTriggered = true;
                    this.scoreSystem.addNearMiss();
                    this.particleSystem.createNearMissEffect(enemy.x, enemy.y);
                }
            } else {
                enemy.nearMissTriggered = false;
            }
        });
        
        // Check player vs obstacles
        this.obstacles.forEach(obstacle => {
            const obstacleBounds = obstacle.getBounds();
            const dist = MathHelpers.distance(
                playerBounds.x, playerBounds.y,
                obstacleBounds.x, obstacleBounds.y
            );
            
            if (dist < playerBounds.radius + obstacleBounds.radius) {
                // Slow down player
                this.player.speed *= (1 - GAME_CONFIG.COLLISION.OBSTACLE_DAMAGE);
                soundManager.playSound('collision', 0.5);
                this.particleSystem.addScreenShake(0.1);
            }
        });
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake
        const shake = this.particleSystem.getScreenShake();
        this.ctx.save();
        this.ctx.translate(shake.x, shake.y);
        
        // Calculate camera offset
        const offsetX = this.canvas.width / 2 - this.cameraX;
        const offsetY = this.canvas.height / 2 - this.cameraY;
        
        this.ctx.save();
        this.ctx.translate(offsetX, offsetY);
        
        // Render background tiles
        this.renderBackground();
        
        // Render obstacles
        this.obstacles.forEach(obstacle => obstacle.render(this.ctx));
        
        // Render enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Render player
        this.player.render(this.ctx);
        
        // Render particles
        this.particleSystem.render(this.ctx);
        
        this.ctx.restore();
        this.ctx.restore();
    }

    renderBackground() {
        this.backgroundTiles.forEach(tile => {
            this.ctx.fillStyle = tile.type === 'grass' ? 
                GAME_CONFIG.COLORS.GRASS : 
                GAME_CONFIG.COLORS.DIRT;
            this.ctx.fillRect(tile.x, tile.y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        });
    }

    setPaused(paused) {
        this.isPaused = paused;
    }

    restart() {
        // Reset game state
        this.isPaused = false;
        this.isGameOver = false;
        this.survivalTime = 0;
        this.enemiesDestroyed = 0;
        
        // Reset player
        this.player.reset(GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2);
        
        // Reset enemies
        this.enemies = [];
        for (let i = 0; i < GAME_CONFIG.ENEMY.INITIAL_COUNT; i++) {
            const enemy = this.spawnManager.spawnEnemy();
            if (enemy) this.enemies.push(enemy);
        }
        
        // Reset systems
        this.spawnManager.reset();
        this.scoreSystem.reset();
        this.particleSystem.reset();
        
        // Reset camera
        this.cameraX = this.player.x;
        this.cameraY = this.player.y;
    }

    gameOver() {
        this.isGameOver = true;
        this.scoreSystem.saveHighScore();
        hud.showGameOver(
            this.scoreSystem.getScore(),
            this.survivalTime,
            this.enemiesDestroyed
        );
    }

    showMainMenu() {
        // Would show main menu - for now just restart
        this.restart();
    }
}
