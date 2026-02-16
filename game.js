/* ===== CONFIG (PRD STYLE) ===== */
const CONFIG = {
    world:{width:3000,height:3000},

    player:{
        baseSpeed:350,
        accel:0.05,
        turnLerp:0.12,
        friction:0.94,
        boostMult:1.4,
        color:0xFF3366
    },

    enemy:{
        spawnDistMin:400,
        spawnDistMax:650,
        spawnInterval:1800,
        max:5,
        types:{
            chaser:{speed:330,key:'enemy_chaser'},
            interceptor:{speed:370,key:'enemy_interceptor'},
            tank:{speed:280,key:'enemy_tank'}
        }
    },

    score:{perSecond:5,kill:50},

    colors:{
        grass:0x4a7c59,
        dirt:0x8b7355
    }
};

/* ===== BOOT ===== */
class BootScene extends Phaser.Scene{
    constructor(){super('BootScene');}

    preload(){
        this.load.plugin(
            'rexvirtualjoystickplugin',
            'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.77/dist/rexvirtualjoystickplugin.min.js',
            true
        );
    }

    create(){

        /* ground tile */
        const g=this.make.graphics({add:false});
        g.fillStyle(CONFIG.colors.grass);
        g.fillRect(0,0,512,512);
        g.fillStyle(CONFIG.colors.dirt,.5);
        for(let i=0;i<30;i++){
            g.fillCircle(
                Phaser.Math.Between(0,512),
                Phaser.Math.Between(0,512),
                Phaser.Math.Between(20,60)
            );
        }
        g.generateTexture('ground_tile',512,512);

        this.createCar('player_car',CONFIG.player.color);
        this.createCar('enemy_chaser',0x2C3E50);
        this.createCar('enemy_interceptor',0x003366);
        this.createCar('enemy_tank',0x000000,true);

        this.scene.start('GameScene');
    }

    createCar(name,color,isTank=false){
        const g=this.make.graphics({add:false});
        const w=isTank?90:80;
        const h=isTank?150:140;

        g.fillStyle(0x000000,.4);
        g.fillRoundedRect(6,6,w,h,20);

        g.fillStyle(color);
        g.fillRoundedRect(0,0,w,h,20);

        g.fillStyle(0x111111);
        g.fillRoundedRect(10,30,w-20,50,10);

        g.generateTexture(name,w,h);
    }
}

/* ===== GAME ===== */
class GameScene extends Phaser.Scene{
    constructor(){super('GameScene');}

    create(){

        /* world ground */
        this.ground=this.add.tileSprite(
            0,0,
            this.scale.width,
            this.scale.height,
            'ground_tile'
        ).setOrigin(0).setScrollFactor(0);

        /* player */
        this.player=this.physics.add
            .sprite(this.scale.width/2,this.scale.height/2,'player_car')
            .setDepth(10);

        this.playerStats={
            speed:0,
            health:100,
            maxSpeed:CONFIG.player.baseSpeed
        };

        /* camera smooth follow (PRD) */
        this.cameras.main.startFollow(this.player,true,0.08,0.08);

        /* enemies */
        this.enemies=this.physics.add.group();

        this.physics.add.collider(
            this.player,
            this.enemies,
            this.gameOver,
            null,
            this
        );

        /* joystick */
        this.joystick=this.plugins
            .get('rexvirtualjoystickplugin')
            .add(this,{
                x:100,
                y:this.scale.height-100,
                radius:80,
                base:this.add.circle(0,0,80,0x333333,.6),
                thumb:this.add.circle(0,0,40,0xffffff,.9)
            });

        /* spawn loop */
        this.time.addEvent({
            delay:CONFIG.enemy.spawnInterval,
            callback:this.spawnEnemy,
            callbackScope:this,
            loop:true
        });

        /* score system (PRD loop) */
        this.score=0;
        this.scoreText=this.add.text(
            20,20,'SCORE: 0',
            {fontSize:'26px',color:'#fff'}
        ).setScrollFactor(0).setDepth(200);
    }

    update(time,delta){

        if(this.playerStats.health<=0)return;

        /* ===== PLAYER MOVE (PRD smooth) ===== */
        if(this.joystick.force>0){
            const target=this.joystick.rotation+Math.PI/2;

            this.player.rotation=
                Phaser.Math.Angle.RotateTo(
                    this.player.rotation,
                    target,
                    CONFIG.player.turnLerp
                );

            this.playerStats.speed=
                Phaser.Math.Linear(
                    this.playerStats.speed,
                    this.playerStats.maxSpeed,
                    CONFIG.player.accel
                );
        }else{
            this.playerStats.speed*=CONFIG.player.friction;
        }

        this.physics.velocityFromRotation(
            this.player.rotation-Math.PI/2,
            this.playerStats.speed,
            this.player.body.velocity
        );

        /* infinite ground scroll */
        this.ground.tilePositionX+=this.player.body.velocity.x*0.016;
        this.ground.tilePositionY+=this.player.body.velocity.y*0.016;

        /* ===== ENEMY AI (PRD chase) ===== */
        this.enemies.getChildren().forEach(e=>{
            const angle=Phaser.Math.Angle.Between(
                e.x,e.y,
                this.player.x,this.player.y
            );

            e.rotation=angle+Math.PI/2;

            this.physics.velocityFromRotation(
                angle,
                e.speed,
                e.body.velocity
            );
        });

        /* score per second */
        this.score+=CONFIG.score.perSecond*(delta/1000);
        this.scoreText.setText('SCORE: '+Math.floor(this.score));
    }

    /* ===== SPAWN SYSTEM (PRD smart distance) ===== */
    spawnEnemy(){

        if(this.enemies.countActive(true)>=CONFIG.enemy.max)return;

        const dist=Phaser.Math.Between(
            CONFIG.enemy.spawnDistMin,
            CONFIG.enemy.spawnDistMax
        );

        const angle=Math.random()*Math.PI*2;

        const x=this.player.x+Math.cos(angle)*dist;
        const y=this.player.y+Math.sin(angle)*dist;

        /* difficulty scaling (time based PRD) */
        let type='chaser';
        if(this.score>600)type='interceptor';
        if(this.score>1200)type='tank';

        const enemy=this.enemies.create(x,y,CONFIG.enemy.types[type].key);
        enemy.speed=CONFIG.enemy.types[type].speed;
    }

    /* ===== GAME OVER ===== */
    gameOver(){
        this.playerStats.health=0;
        this.physics.pause();

        this.add.text(
            this.scale.width/2,
            this.scale.height/2,
            'GAME OVER',
            {fontSize:'64px',color:'#ff4444'}
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(500);
    }
}

/* ===== GAME CONFIG ===== */
const config={
    type:Phaser.AUTO,
    width:window.innerWidth,
    height:window.innerHeight,
    parent:'game-container',
    physics:{default:'arcade',arcade:{gravity:{y:0}}},
    scene:[BootScene,GameScene]
};

new Phaser.Game(config);