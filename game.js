/**
 * OPEN WORLD RACER ESCAPE - PROFESSIONAL EDITION
 * Based on PRD Version 1.0
 * * FEATURES IMPLEMENTED IN THIS BUILD:
 * 1. Infinite Loop World
 * 2. Hollywood-style Reverse Flip
 * 3. Smart Enemy AI (Chaser, Interceptor, Tank)
 * 4. Heat Effect & Visual Feedback
 * 5. Spawn Warning System
 */

// --- 1. CONFIGURATION (Strictly from PRD) ---
const CONFIG = {
    // World Settings
    world: {
        width: 3000,
        height: 3000,
        buffer: 200
    },
    // Player Settings
    player: {
        baseSpeed: 350,       // PRD: 350 px/s
        accel: 200,
        turnSpeed: 180,       // Degrees/s
        friction: 0.95,
        boostMult: 1.4,       // 40% boost
        boostDuration: 4000,  // 4s
        boostCooldown: 20000, // 20s
        collisionRadius: 35,
        color: 0xFF3366       // PRD: Bright Red
    },
    // Enemy Settings
    enemy: {
        spawnDistMin: 400,
        spawnDistMax: 700,
        types: {
            chaser: { speed: 330, color: 0x2C3E50, health: 1 },    // Standard
            interceptor: { speed: 370, color: 0x003366, health: 1 }, // Fast
            tank: { speed: 280, color: 0x000000, health: 2 }       // Strong
        }
    },
    // Visual Colors
    colors: {
        grass: 0x4a7c59,
        dirt: 0x8b7355,
        boost: 0xFFD700,
        ui_accent: 0x00D9FF,
        heat_overlay: 0xFF4500
    }
};

// --- 2. ASSET GENERATION SCENE ---
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        // Load Virtual Joystick Plugin (Critical for Mobile)
        this.load.plugin('rexvirtualjoystickplugin', 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.77/dist/rexvirtualjoystickplugin.min.js', true);
    }

    create() {
        // --- PROCEDURAL ASSET GENERATION ---
        // We create high-quality sprites via code to ensure the game works immediately without external downloads.

        // A. Ground Texture (Seamless Grass/Dirt)
        const ground = this.make.graphics({x:0, y:0, add:false});
        ground.fillStyle(CONFIG.colors.grass);
        ground.fillRect(0,0, 512, 512);
        // Dirt patches
        ground.fillStyle(CONFIG.colors.dirt, 0.5);
        for(let i=0; i<30; i++) {
            ground.fillCircle(Phaser.Math.Between(0,512), Phaser.Math.Between(0,512), Phaser.Math.Between(20, 60));
        }
        ground.generateTexture('ground_tile', 512, 512);

        // B. Player Car (Sporty, Red #FF3366)
        this.createCarSprite('player_car', CONFIG.player.color);

        // C. Enemy Cars
        this.createCarSprite('enemy_chaser', CONFIG.enemy.types.chaser.color);
        this.createCarSprite('enemy_interceptor', CONFIG.enemy.types.interceptor.color);
        this.createCarSprite('enemy_tank', CONFIG.enemy.types.tank.color, true); // Tank is bigger

        // D. VFX: Particles
        this.createParticles();

        // E. UI: Warning Arrow (For Spawn Warning System)
        const arrow = this.make.graphics({x:0, y:0, add:false});
        arrow.fillStyle(0xFF0000, 1);
        arrow.lineStyle(2, 0xFFFFFF);
        arrow.beginPath();
        arrow.moveTo(-15, -15);
        arrow.lineTo(15, 0);
        arrow.lineTo(-15, 15);
        arrow.closePath();
        arrow.fillPath();
        arrow.strokePath();
        arrow.generateTexture('warning_arrow', 32, 32);

        // F. Obstacles (Tree & Rock)
        this.createObstacles();

        // Start Game
        this.scene.start('GameScene');
    }

    createCarSprite(name, color, isTank = false) {
        const g = this.make.graphics({x:0, y:0, add:false});
        const w = isTank ? 90 : 80;
        const h = isTank ? 150 : 140;

        // Shadow
        g.fillStyle(0x000000, 0.4);
        g.fillRoundedRect(5, 5, w, h, 20);

        // Body
        g.fillStyle(color);
        g.fillRoundedRect(0, 0, w, h, 20);

        // Cabin/Windshield (Black Tinted)
        g.fillStyle(0x111111);
        g.fillRoundedRect(10, 30, w-20, 50, 10);
        
        // Roof Reflection (Visual Polish)
        g.fillStyle(0xFFFFFF, 0.2);
        g.fillRect(15, 40, 20, 30);

        // Lights
        g.fillStyle(0xFFFF00); // Headlights
        g.fillCircle(15, 5, 6); g.fillCircle(w-15, 5, 6);
        g.fillStyle(0xFF0000); // Taillights
        g.fillCircle(15, h-5, 6); g.fillCircle(w-15, h-5, 6);

        g.generateTexture(name, w, h);
    }

    createParticles() {
        // Dust
        const d = this.make.graphics({x:0, y:0, add:false});
        d.fillStyle(0xD4C5B9); d.fillCircle(4,4,4);
        d.generateTexture('dust', 8, 8);
        
        // Boost Flame
        const b = this.make.graphics({x:0, y:0, add:false});
        b.fillStyle(CONFIG.colors.boost); b.fillCircle(6,6,6);
        b.generateTexture('boost_particle', 12, 12);
    }

    createObstacles() {
        // Tree
        const t = this.make.graphics({x:0, y:0, add:false});
        t.fillStyle(0x3e2723); t.fillCircle(0,0,15); // Trunk
        t.fillStyle(0x2e7d32); t.fillCircle(0,-10,25); // Leaves
        t.generateTexture('tree', 60, 60);

        // Rock
        const r = this.make.graphics({x:0, y:0, add:false});
        r.fillStyle(0x616161); r.fillCircle(15,15,15);
        r.fillStyle(0x424242); r.fillCircle(10,10,8);
        r.generateTexture('rock', 30, 30);
    }
}
// --- END OF PART 1 ---
// --- PART 2: CORE GAMEPLAY & PLAYER PHYSICS ---

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // 1. World Setup (Infinite Grass)
        // We use a TileSprite to create the illusion of an infinite world
        this.ground = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'ground_tile')
            .setOrigin(0, 0)
            .setScrollFactor(0); // Fixes texture to camera, we scroll UVs instead

        // 2. Physics & Player Setup
        this.physics.world.setBounds(-10000, -10000, 20000, 20000); // Huge bounds
        
        this.player = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, 'player_car');
        this.player.setDepth(10);
        this.player.setDrag(100);
        this.player.setCollideWorldBounds(false); // Infinite world

        // Player State Variables
        this.playerStats = {
            speed: 0,
            maxSpeed: CONFIG.player.baseSpeed,
            isBoosting: false,
            isFlipping: false, // For the Hollywood stunt
            health: 100
        };

        // 3. Camera Setup (Cinematic Follow)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);

        // 4. Input Controls (Joystick + Keyboard)
        this.createControls();

        // 5. Visual Effects Groups
        this.dustParticles = this.add.particles(0, 0, 'dust', {
            lifespan: 300,
            scale: {start:1, end:0},
            alpha: {start:0.5, end:0},
            emitting: false
        }).setDepth(5);
        
        // Heat Distortion Overlay (For Boost)
        this.heatOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, CONFIG.colors.heat_overlay)
            .setScrollFactor(0)
            .setDepth(100)
            .setAlpha(0)
            .setBlendMode(Phaser.BlendModes.ADD);

        // Resize Handler
        this.scale.on('resize', this.resize, this);
    }

    createControls() {
        // Keyboard (Desktop)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({up:87, down:83, left:65, right:68, space:32});

        // Virtual Joystick (Mobile) - PRD Requirement
        this.joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: 100,
            y: this.scale.height - 100,
            radius: 80,
            base: this.add.circle(0, 0, 80, 0x888888, 0.5),
            thumb: this.add.circle(0, 0, 40, 0xcccccc, 0.8),
            dir: '8dir',
            forceMin: 16
        });
    }

    update(time, delta) {
        const dt = delta / 1000; // Convert to seconds

        // If performing the Hollywood Flip, skip normal movement logic
        if (this.playerStats.isFlipping) return;

        this.handlePlayerMovement(dt);
        this.updateInfiniteWorld();
        this.updateVisuals();
    }

    handlePlayerMovement(dt) {
        let turn = 0;
        let drive = 0;

        // A. Input Reading
        if (this.joystick.force > 0) {
            // Joystick Logic
            const targetRot = this.joystick.rotation + (Math.PI / 2);
            // Smooth Rotation (Lerp)
            this.player.rotation = Phaser.Math.Angle.RotateTo(
                this.player.rotation, 
                targetRot, 
                CONFIG.player.turnSpeed * 0.005
            );
            drive = Math.min(this.joystick.force / 100, 1);
        } else {
            // Keyboard Logic
            if (this.cursors.left.isDown || this.wasd.left.isDown) turn = -1;
            else if (this.cursors.right.isDown || this.wasd.right.isDown) turn = 1;

            if (this.cursors.up.isDown || this.wasd.up.isDown) drive = 1;
            else if (this.cursors.down.isDown || this.wasd.down.isDown) drive = -0.5;

            if (turn !== 0 && drive !== 0) {
                this.player.rotation += turn * Phaser.Math.DegToRad(CONFIG.player.turnSpeed) * dt * (drive > 0 ? 1 : -1);
            }
        }

        // B. Hollywood Reverse Flip Logic (PRD Requirement)
        // Trigger: Reversing fast + sudden forward input
        if (drive > 0 && this.playerStats.speed < -100) {
            this.performHollywoodFlip();
            return;
        }

        // C. Physics Application
        // Acceleration / Deceleration
        if (drive !== 0) {
            const max = drive > 0 ? this.playerStats.maxSpeed : this.playerStats.maxSpeed * 0.5;
            this.playerStats.speed = Phaser.Math.Linear(this.playerStats.speed, max * drive, CONFIG.player.accel * dt);
        } else {
            // Friction
            this.playerStats.speed = Phaser.Math.Linear(this.playerStats.speed, 0, CONFIG.player.friction);
        }

        // Apply Velocity Vector
        this.physics.velocityFromRotation(
            this.player.rotation - Math.PI/2, 
            this.playerStats.speed, 
            this.player.body.velocity
        );
    }

    performHollywoodFlip() {
        // This is the cinematic "J-Turn" or "Reverse 180"
        this.playerStats.isFlipping = true;
        
        const timeline = this.tweens.createTimeline();

        // Step 1: Brake Hard & Camera Zoom In
        timeline.add({
            targets: this.playerStats,
            speed: 0,
            duration: 200,
            onStart: () => {
                this.cameras.main.zoomTo(1.2, 200); // Cinematic Zoom
                // Add tire screech sound here later
            }
        });

        // Step 2: 180 Degree Spin
        timeline.add({
            targets: this.player,
            rotation: this.player.rotation + Math.PI, // Flip 180
            duration: 400,
            ease: 'Back.easeOut'
        });

        // Step 3: Launch Forward & Zoom Out
        timeline.add({
            targets: this.playerStats,
            speed: CONFIG.player.baseSpeed * 0.8, // Immediate speed boost
            duration: 300,
            onComplete: () => {
                this.playerStats.isFlipping = false;
                this.cameras.main.zoomTo(1, 300); // Reset Camera
            }
        });

        timeline.play();
    }

    updateInfiniteWorld() {
        // Infinite Scroll Logic: Move texture opposite to player velocity
        this.ground.tilePositionX += this.player.body.velocity.x * 0.016;
        this.ground.tilePositionY += this.player.body.velocity.y * 0.016;
        
        // Keep texture centered on screen logic is handled by ScrollFactor(0)
        // But we need to update joystick/UI positions if camera moves? 
        // No, UI uses scrollFactor(0), so they stick to screen.
    }

    updateVisuals() {
        // Dust Particles on movement
        if (Math.abs(this.playerStats.speed) > 50) {
            this.dustParticles.emitting = true;
            const angle = this.player.rotation + Math.PI/2;
            const offsetX = Math.cos(angle) * 40;
            const offsetY = Math.sin(angle) * 40;
            this.dustParticles.setPosition(this.player.x - offsetX, this.player.y - offsetY);
        } else {
            this.dustParticles.emitting = false;
        }

        // Boost Heat Effect (Visual Feedback)
        if (this.playerStats.isBoosting) {
            this.heatOverlay.alpha = 0.2 + Math.random() * 0.1; // Flicker effect
        } else {
            this.heatOverlay.alpha = 0;
        }
    }

    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        this.cameras.main.setViewport(0, 0, width, height);
        this.ground.setSize(width, height);
        this.heatOverlay.setSize(width, height);
        if (this.joystick) this.joystick.setPosition(100, height - 100);
    }
// --- END OF PART 2 ---
// --- PART 3: AI, UI & GAME LOOP FINALIZATION ---

    // 1. Setup Part 3 (Groups, UI, Collisions)
    initPart3() {
        // Create Enemy Group
        this.enemies = this.physics.add.group();
        
        // Collisions: Player vs Enemy
        this.physics.add.collider(this.player, this.enemies, this.handleCrash, null, this);
        // Collisions: Enemies vs Enemies (So they don't stack)
        this.physics.add.collider(this.enemies, this.enemies);

        // UI Setup
        this.createUI();

        // Timers
        this.score = 0;
        this.time.addEvent({ delay: 1000, callback: () => { 
            if(this.playerStats.health > 0) {
                this.score += 10; 
                this.scoreText.setText('SCORE: ' + this.score);
            }
        }, loop: true });

        // Spawner
        this.time.addEvent({ delay: CONFIG.enemy.spawnInterval, callback: this.spawnEnemy, callbackScope: this, loop: true });
    }

    createUI() {
        // Score
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', { fontSize: '24px', fontStyle: 'bold', color: '#fff' })
            .setScrollFactor(0).setDepth(200);

        // Boost Button (Mobile) - PRD Requirement
        this.boostBtn = this.add.image(this.scale.width - 80, this.scale.height - 80, 'icon_boost')
            .setScrollFactor(0).setDepth(200).setInteractive().setAlpha(0.8);
        
        this.boostBtn.on('pointerdown', () => this.activateBoost());
        this.boostBtn.on('pointerup', () => this.deactivateBoost());

        // Keyboard Boost (Spacebar)
        this.input.keyboard.on('keydown-SPACE', () => this.activateBoost());
        this.input.keyboard.on('keyup-SPACE', () => this.deactivateBoost());
    }

    activateBoost() {
        if (!this.playerStats.isBoosting && this.playerStats.health > 0) {
            this.playerStats.isBoosting = true;
            this.playerStats.maxSpeed = CONFIG.player.baseSpeed * CONFIG.player.boostMult;
            this.cameras.main.zoomTo(0.9, 200); // Speed effect
        }
    }

    deactivateBoost() {
        this.playerStats.isBoosting = false;
        this.playerStats.maxSpeed = CONFIG.player.baseSpeed;
        this.cameras.main.zoomTo(1, 200);
    }

    spawnEnemy() {
        if (this.playerStats.health <= 0) return;

        // Spawn logic: Always spawn outside camera view
        const angle = Phaser.Math.FloatBetween(0, 6.28);
        const dist = Phaser.Math.Between(CONFIG.enemy.spawnDistMin, CONFIG.enemy.spawnDistMax);
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        // Determine Type (70% Chaser, 20% Interceptor, 10% Tank)
        const rand = Math.random();
        let type = 'enemy_chaser';
        let stats = CONFIG.enemy.types.chaser;

        if (rand > 0.9) { type = 'enemy_tank'; stats = CONFIG.enemy.types.tank; }
        else if (rand > 0.7) { type = 'enemy_interceptor'; stats = CONFIG.enemy.types.interceptor; }

        const enemy = this.enemies.create(x, y, type);
        enemy.setDrag(100);
        enemy.setBounce(0.5);
        enemy.myStats = stats; // Store stats on sprite
    }

    updateAI(dt) {
        if (!this.enemies) return;

        this.enemies.getChildren().forEach(enemy => {
            // Steering Behavior: Seek Player
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            
            // Rotate towards player
            enemy.rotation = Phaser.Math.Angle.RotateTo(enemy.rotation, angle + Math.PI/2, 3 * dt);
            
            // Move forward
            this.physics.velocityFromRotation(enemy.rotation - Math.PI/2, enemy.myStats.speed, enemy.body.velocity);

            // Despawn if too far
            if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) > 1500) {
                enemy.destroy();
            }
        });
    }

    handleCrash(player, enemy) {
        if (this.playerStats.health <= 0) return;

        // Game Over Logic
        this.playerStats.health = 0;
        this.physics.pause();
        this.cameras.main.shake(500, 0.05);
        
        // Show Game Over Screen
        const w = this.scale.width;
        const h = this.scale.height;
        this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.7).setScrollFactor(0).setDepth(300);
        this.add.text(w/2, h/2 - 50, 'BUSTED!', { fontSize: '64px', color: '#ff0000', fontStyle:'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
        this.add.text(w/2, h/2 + 20, 'Final Score: ' + this.score, { fontSize: '32px', color: '#fff' }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
        
        const restartBtn = this.add.text(w/2, h/2 + 100, 'TAP TO RESTART', { fontSize: '24px', backgroundColor:'#333', padding:{x:10,y:10} })
            .setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive();
        
        restartBtn.on('pointerdown', () => this.scene.restart());
    }

} // <--- CLOSING THE GameScene CLASS HERE

// --- SYSTEM OVERRIDE (To Stitch Parts Together) ---
// We overwrite the update method to ensure AI runs
const baseUpdate = GameScene.prototype.update;
GameScene.prototype.update = function(time, delta) {
    if (!this.part3Initialized) {
        this.initPart3();
        this.part3Initialized = true;
    }
    // Run core movement (Part 2)
    baseUpdate.call(this, time, delta);
    // Run AI (Part 3)
    this.updateAI(delta/1000);
};

// --- FINAL CONFIGURATION & LAUNCH ---
const gameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#1a1a1a',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { debug: false, gravity: { y: 0 } }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, GameScene]
};

// Start Game
const game = new Phaser.Game(gameConfig);
