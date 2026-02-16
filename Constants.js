// Game Constants and Configuration
const GAME_CONFIG = {
    // Canvas Settings
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    
    // World Settings
    WORLD_WIDTH: 3000,
    WORLD_HEIGHT: 3000,
    TILE_SIZE: 512,
    
    // Player Settings
    PLAYER: {
        BASE_SPEED: 250,
        MAX_SPEED: 350,
        ACCELERATION: 150,
        DECELERATION: 0.95,
        ROTATION_SPEED: 3.5,
        SIZE: { width: 40, height: 60 },
        BOOST_MULTIPLIER: 1.4,
        BOOST_DURATION: 3000,
        BOOST_COOLDOWN: 20000
    },
    
    // Enemy Settings
    ENEMY: {
        BASE_SPEED: 220,
        SPEED_VARIANCE: 30,
        SIZE: { width: 38, height: 58 },
        MAX_COUNT: 5,
        SPAWN_DISTANCE: 600,
        INITIAL_COUNT: 2,
        SPAWN_INTERVAL: 5000,
        PREDICTION_FACTOR: 0.3,
        WANDER_STRENGTH: 0.1,
        SEPARATION_DISTANCE: 80
    },
    
    // Difficulty Scaling
    DIFFICULTY: {
        TIME_THRESHOLDS: [
            { time: 0, enemies: 2, speed: 0.85, spawnRate: 5000 },
            { time: 30000, enemies: 3, speed: 0.90, spawnRate: 4000 },
            { time: 60000, enemies: 4, speed: 0.95, spawnRate: 3500 },
            { time: 120000, enemies: 5, speed: 1.0, spawnRate: 3000 }
        ]
    },
    
    // Obstacle Settings
    OBSTACLES: {
        TREES: {
            COUNT: 18,
            MIN_SIZE: 40,
            MAX_SIZE: 60,
            COLLISION_RADIUS: 25
        },
        ROCKS: {
            COUNT: 12,
            MIN_SIZE: 30,
            MAX_SIZE: 50,
            COLLISION_RADIUS: 20
        },
        MIN_DISTANCE_FROM_CENTER: 200,
        MIN_DISTANCE_BETWEEN: 80
    },
    
    // Collision Settings
    COLLISION: {
        PLAYER_RADIUS: 25,
        ENEMY_RADIUS: 24,
        OBSTACLE_DAMAGE: 0.3,
        ENEMY_COLLISION_STUN: 300,
        EXPLOSION_RADIUS: 80
    },
    
    // Scoring System
    SCORE: {
        SURVIVAL_PER_SECOND: 10,
        ENEMY_DESTROYED: 100,
        NEAR_MISS: 25,
        NEAR_MISS_DISTANCE: 60,
        COMBO_MULTIPLIER: 1.5,
        COMBO_TIMEOUT: 3000
    },
    
    // Visual Effects
    EFFECTS: {
        BOOST_TRAIL_LENGTH: 15,
        BOOST_TRAIL_ALPHA: 0.6,
        EXPLOSION_PARTICLES: 20,
        EXPLOSION_DURATION: 800,
        SCREEN_SHAKE_INTENSITY: 8,
        SCREEN_SHAKE_DURATION: 200,
        NEAR_MISS_GLOW_DURATION: 300
    },
    
    // Colors
    COLORS: {
        BACKGROUND: '#4a7c59',
        GRASS: '#4a7c59',
        DIRT: '#8b7355',
        PLAYER: '#3498db',
        PLAYER_BOOST: '#f1c40f',
        ENEMY: '#e74c3c',
        TREE: '#2d5016',
        ROCK: '#7f8c8d',
        EXPLOSION: '#ff6b35',
        BOOST_TRAIL: '#ffd700',
        NEAR_MISS_GLOW: '#00ffff'
    },
    
    // Audio Settings
    AUDIO: {
        MASTER_VOLUME: 0.7,
        SFX_VOLUME: 0.8,
        MUSIC_VOLUME: 0.4
    }
};

// Input State
const INPUT = {
    joystick: { x: 0, y: 0, active: false },
    keyboard: { up: false, down: false, left: false, right: false },
    boost: false,
    pause: false
};

// Game State
const GAME_STATE = {
    currentScene: 'MENU',
    score: 0,
    highScore: localStorage.getItem('highScore') || 0,
    survivalTime: 0,
    enemiesDestroyed: 0,
    combo: 0,
    comboTimer: 0,
    isPaused: false,
    isGameOver: false
};
