const CONFIG = {
    world: { width: 3000, height: 3000 },
    player: { baseSpeed: 350, accel: 200, turnSpeed: 180, friction: 0.95, boostMult: 1.4, color: 0xFF3366 },
    enemy: { spawnDistMin: 400, spawnDistMax: 700, spawnInterval: 1800, types: { chaser: { speed: 330, color: 0x2C3E50 }, interceptor: { speed: 370, color: 0x003366 }, tank: { speed: 280, color: 0x000000 } } },
    colors: { grass: 0x4a7c59, dirt: 0x8b7355, boost: 0xFFD700, heat_overlay: 0xFF4500 }
};

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() { this.load.plugin('rexvirtualjoystickplugin', 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.77/dist/rexvirtualjoystickplugin.min.js', true); }
    create() {
        const ground = this.make.graphics({x:0, y:0, add:false});
        ground.fillStyle(CONFIG.colors.grass); ground.fillRect(0,0, 512, 512);
        ground.fillStyle(CONFIG.colors.dirt, 0.5);
        for(let i=0; i<30; i++) ground.fillCircle(Phaser.Math.Between(0,512), Phaser.Math.Between(0,512), Phaser.Math.Between(20, 60));
        ground.generateTexture('ground_tile', 512, 512);
        this.createCar('player_car', CONFIG.player.color);
        this.createCar('enemy_chaser', CONFIG.enemy.types.chaser.color);
        this.createCar('enemy_interceptor', CONFIG.enemy.types.interceptor.color);
        this.createCar('enemy_tank', CONFIG.enemy.types.tank.color, true);
        this.scene.start('GameScene');
    }
    createCar(name, color, isTank = false) {
        const g = this.make.graphics({x:0, y:0, add:false});
        const w = isTank ? 90 : 80; const h = isTank ? 150 : 140;
        g.fillStyle(0x000000, 0.4); g.fillRoundedRect(5, 5, w, h, 20);
        g.fillStyle(color); g.fillRoundedRect(0, 0, w, h, 20);
        g.fillStyle(0x111111); g.fillRoundedRect(10, 30, w-20, 50, 10);
        g.generateTexture(name, w, h);
    }
}

class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }
    create() {
        this.ground = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'ground_tile').setOrigin(0).setScrollFactor(0);
        this.player = this.physics.add.sprite(this.scale.width/2, this.scale.height/2, 'player_car').setDepth(10);
        this.playerStats = { speed: 0, maxSpeed: CONFIG.player.baseSpeed, health: 100 };
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.player, this.enemies, () => {
            this.playerStats.health = 0; this.physics.pause();
            this.add.text(this.scale.width/2, this.scale.height/2, 'GAME OVER', {fontSize:'64px', color:'#f00'}).setOrigin(0.5).setScrollFactor(0);
        }, null, this);
        this.joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, { x: 100, y: this.scale.height - 100, radius: 80, base: this.add.circle(0, 0, 80, 0x888888, 0.5), thumb: this.add.circle(0, 0, 40, 0xcccccc, 0.8) });
        this.time.addEvent({ delay: CONFIG.enemy.spawnInterval, callback: this.spawnEnemy, callbackScope: this, loop: true });
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', { fontSize: '24px', color: '#fff' }).setScrollFactor(0).setDepth(200);
    }
    update(time, delta) {
        if (this.playerStats.health <= 0) return;
        if (this.joystick.force > 0) {
            this.player.rotation = Phaser.Math.Angle.RotateTo(this.player.rotation, this.joystick.rotation + Math.PI/2, 0.1);
            this.playerStats.speed = Phaser.Math.Linear(this.playerStats.speed, CONFIG.player.baseSpeed, 0.05);
        } else { this.playerStats.speed *= CONFIG.player.friction; }
        this.physics.velocityFromRotation(this.player.rotation - Math.PI/2, this.playerStats.speed, this.player.body.velocity);
        this.ground.tilePositionX += this.player.body.velocity.x * 0.016;
        this.ground.tilePositionY += this.player.body.velocity.y * 0.016;
        this.enemies.getChildren().forEach(e => {
            const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
            e.rotation = angle + Math.PI/2;
            this.physics.velocityFromRotation(angle, 300, e.body.velocity);
        });
    }
    spawnEnemy() {
        const angle = Math.random() * Math.PI * 2;
        const x = this.player.x + Math.cos(angle) * 600;
        const y = this.player.y + Math.sin(angle) * 600;
        this.enemies.create(x, y, 'enemy_chaser');
    }
}

const config = { type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight, parent: 'game-container', physics: { default: 'arcade' }, scene: [BootScene, GameScene] };
new Phaser.Game(config);
