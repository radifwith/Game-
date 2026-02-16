// Main Entry Point
let game;

// Wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

function initializeGame() {
    // Show loading screen
    updateLoadingProgress(0);
    
    // Simulate asset loading with progress
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            startGame();
        }
        updateLoadingProgress(progress);
    }, 100);
}

function updateLoadingProgress(percent) {
    const progressBar = document.getElementById('loading-progress');
    const percentText = document.querySelector('.loading-percent');
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${Math.floor(percent)}%`;
}

function startGame() {
    // Hide loading screen after a brief delay
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        
        // Initialize game components
        initializeComponents();
    }, 500);
}

function initializeComponents() {
    // Create canvas
    const gameContainer = document.getElementById('game-container');
    const canvas = document.createElement('canvas');
    gameContainer.appendChild(canvas);
    
    // Initialize UI components
    virtualJoystick = new VirtualJoystick();
    hud = new HUD();
    
    // Initialize game
    game = new Game(canvas);
    window.game = game; // Make accessible globally
    
    // Show welcome message
    showWelcomeMessage();
}

function showWelcomeMessage() {
    const welcomeHTML = `
        <div class="menu-overlay" id="welcome-screen" style="animation: fadeIn 0.5s ease;">
            <div class="menu-content">
                <h1 style="font-size: 2.5rem; margin-bottom: 20px; color: white;">🚗 OPEN WORLD RACER ESCAPE</h1>
                <div style="color: white; margin: 20px 0; text-align: left; padding: 0 20px;">
                    <h3 style="margin-bottom: 15px;">HOW TO PLAY:</h3>
                    <p style="margin: 10px 0;">📱 <strong>Mobile:</strong> Use joystick to move</p>
                    <p style="margin: 10px 0;">⌨️ <strong>Desktop:</strong> Use WASD or Arrow keys</p>
                    <p style="margin: 10px 0;">🚀 <strong>Boost:</strong> Tap boost button or press SPACE</p>
                    <p style="margin: 10px 0;">🎯 <strong>Goal:</strong> Survive as long as possible!</p>
                    <p style="margin: 10px 0;">💥 <strong>Destroy enemies</strong> by crashing into them</p>
                    <p style="margin: 10px 0;">⏸️ <strong>Pause:</strong> Press ESC or P key</p>
                </div>
                <div style="margin: 20px 0;">
                    <p style="color: #ffd700; font-size: 1.2rem;">High Score: ${GAME_STATE.highScore.toLocaleString()}</p>
                </div>
                <button class="menu-btn" onclick="startGameFromWelcome()" style="font-size: 1.5rem; padding: 20px 40px;">
                    ▶️ START GAME
                </button>
                <div style="margin-top: 20px; color: #aaa; font-size: 0.9rem;">
                    <p>🔊 Sound: ${soundManager.isMuted ? 'OFF' : 'ON'} 
                    <button onclick="toggleSound()" style="margin-left: 10px; padding: 5px 15px; background: #4a7c59; border: none; color: white; border-radius: 5px; cursor: pointer;">Toggle</button></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', welcomeHTML);
}

function startGameFromWelcome() {
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.remove();
        }, 300);
    }
    
    // Resume audio context (required for some browsers)
    if (soundManager.audioContext.state === 'suspended') {
        soundManager.audioContext.resume();
    }
}

function toggleSound() {
    soundManager.toggleMute();
    const soundStatus = document.querySelector('[onclick="toggleSound()"]').parentElement;
    if (soundStatus) {
        soundStatus.innerHTML = `🔊 Sound: ${soundManager.isMuted ? 'OFF' : 'ON'} 
        <button onclick="toggleSound()" style="margin-left: 10px; padding: 5px 15px; background: #4a7c59; border: none; color: white; border-radius: 5px; cursor: pointer;">Toggle</button>`;
    }
}

// Handle page visibility (pause when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && game && !GAME_STATE.isPaused) {
        hud.togglePause();
    }
});

// Prevent scrolling on mobile
document.addEventListener('touchmove', (e) => {
    if (e.target.tagName !== 'BUTTON') {
        e.preventDefault();
    }
}, { passive: false });

// Handle orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (game) {
            game.resizeCanvas();
        }
        if (virtualJoystick) {
            virtualJoystick.updateBasePosition();
        }
    }, 100);
});

// Debug info (can be removed in production)
if (window.location.hash === '#debug') {
    setInterval(() => {
        console.log('FPS:', Math.round(1 / game.deltaTime));
        console.log('Enemies:', game.enemies.filter(e => !e.isDestroyed).length);
        console.log('Score:', game.scoreSystem.getScore());
        console.log('Combo:', game.scoreSystem.getCombo());
    }, 1000);
}

// Export for debugging
window.DEBUG = {
    game: () => game,
    player: () => game?.player,
    enemies: () => game?.enemies,
    config: GAME_CONFIG,
    state: GAME_STATE
};

console.log('%c🚗 Open World Racer Escape ', 'background: #4a7c59; color: white; font-size: 20px; padding: 10px;');
console.log('%cGame loaded successfully! Add #debug to URL for debug info.', 'color: #ffd700;');
