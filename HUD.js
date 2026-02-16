// HUD Manager - Handles UI updates
class HUD {
    constructor() {
        this.scoreElement = document.getElementById('score-value');
        this.timeElement = document.getElementById('time-value');
        this.comboElement = document.getElementById('combo-value');
        this.comboDisplay = document.getElementById('combo-display');
        this.boostButton = document.getElementById('boost-button');
        this.boostCooldownOverlay = this.boostButton.querySelector('.boost-cooldown-overlay');
        this.pauseButton = document.getElementById('pause-btn');
        this.pauseMenu = document.getElementById('pause-menu');
        
        this.init();
    }

    init() {
        // Boost button events
        this.boostButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            INPUT.boost = true;
        });
        this.boostButton.addEventListener('mousedown', (e) => {
            INPUT.boost = true;
        });

        // Pause button events
        this.pauseButton.addEventListener('click', () => {
            this.togglePause();
        });

        // Pause menu buttons
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('main-menu-btn').addEventListener('click', () => {
            this.goToMainMenu();
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' || e.code === 'KeyP') {
                this.togglePause();
            }
            if (e.code === 'Space') {
                e.preventDefault();
                INPUT.boost = true;
            }
            
            // Arrow keys
            if (e.code === 'ArrowUp' || e.code === 'KeyW') INPUT.keyboard.up = true;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') INPUT.keyboard.down = true;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') INPUT.keyboard.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') INPUT.keyboard.right = true;
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowUp' || e.code === 'KeyW') INPUT.keyboard.up = false;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') INPUT.keyboard.down = false;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') INPUT.keyboard.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') INPUT.keyboard.right = false;
        });
    }

    updateScore(score) {
        this.scoreElement.textContent = Math.floor(score).toLocaleString();
    }

    updateTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    updateCombo(combo) {
        if (combo > 1) {
            this.comboElement.textContent = `x${combo}`;
            this.comboDisplay.classList.add('active');
        } else {
            this.comboDisplay.classList.remove('active');
        }
    }

    updateBoostCooldown(progress) {
        // progress: 0 (ready) to 1 (full cooldown)
        const percentage = progress * 100;
        this.boostCooldownOverlay.style.height = `${percentage}%`;
        
        if (progress > 0) {
            this.boostButton.classList.add('cooldown');
            this.boostButton.classList.remove('active');
        } else {
            this.boostButton.classList.remove('cooldown');
            this.boostButton.classList.add('active');
        }
    }

    showBoostEffect() {
        this.boostButton.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.boostButton.style.transform = 'scale(1)';
        }, 200);
    }

    togglePause() {
        GAME_STATE.isPaused = !GAME_STATE.isPaused;
        
        if (GAME_STATE.isPaused) {
            this.pauseMenu.classList.remove('hidden');
            this.pauseButton.textContent = '▶️';
        } else {
            this.pauseMenu.classList.add('hidden');
            this.pauseButton.textContent = '⏸️';
        }

        // Notify game
        if (window.game) {
            window.game.setPaused(GAME_STATE.isPaused);
        }
    }

    restartGame() {
        this.pauseMenu.classList.add('hidden');
        GAME_STATE.isPaused = false;
        if (window.game) {
            window.game.restart();
        }
    }

    goToMainMenu() {
        this.pauseMenu.classList.add('hidden');
        GAME_STATE.isPaused = false;
        if (window.game) {
            window.game.showMainMenu();
        }
    }

    showGameOver(score, time, enemiesDestroyed) {
        // Create game over screen
        const gameOverHTML = `
            <div class="menu-overlay" id="game-over-screen">
                <div class="menu-content">
                    <h2>💥 GAME OVER</h2>
                    <div style="margin: 20px 0; color: white;">
                        <p style="font-size: 1.2rem; margin: 10px 0;">Score: <strong>${Math.floor(score).toLocaleString()}</strong></p>
                        <p style="font-size: 1rem; margin: 10px 0;">Time: <strong>${this.formatTime(time)}</strong></p>
                        <p style="font-size: 1rem; margin: 10px 0;">Enemies Destroyed: <strong>${enemiesDestroyed}</strong></p>
                        ${score > GAME_STATE.highScore ? '<p style="color: #ffd700; font-size: 1.3rem; margin: 15px 0;">🏆 NEW HIGH SCORE! 🏆</p>' : ''}
                    </div>
                    <button class="menu-btn" onclick="hud.restartFromGameOver()">🔄 PLAY AGAIN</button>
                    <button class="menu-btn" onclick="hud.goToMainMenu()">🏠 MAIN MENU</button>
                </div>
            </div>
        `;

        // Remove existing game over screen if any
        const existing = document.getElementById('game-over-screen');
        if (existing) existing.remove();

        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', gameOverHTML);
    }

    restartFromGameOver() {
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) gameOverScreen.remove();
        this.restartGame();
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    updateLoadingProgress(percent) {
        const progressBar = document.getElementById('loading-progress');
        const percentText = document.querySelector('.loading-percent');
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (percentText) percentText.textContent = `${Math.floor(percent)}%`;
    }
}

// Create global HUD instance
let hud;
