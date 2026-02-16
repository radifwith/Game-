// Score System - Handles scoring, combos, and achievements
class ScoreSystem {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.lastComboTime = 0;
        this.nearMissCount = 0;
    }

    update(deltaTime) {
        // Add survival points
        this.score += GAME_CONFIG.SCORE.SURVIVAL_PER_SECOND * deltaTime;

        // Update combo timer
        if (this.combo > 0) {
            this.comboTimer -= deltaTime * 1000;
            if (this.comboTimer <= 0) {
                this.resetCombo();
            }
        }
    }

    addEnemyDestroyed() {
        const basePoints = GAME_CONFIG.SCORE.ENEMY_DESTROYED;
        const comboMultiplier = 1 + (this.combo * 0.2);
        const points = basePoints * comboMultiplier;
        
        this.score += points;
        this.increaseCombo();
        
        soundManager.playSound('combo', 0.6);
        
        return points;
    }

    addNearMiss() {
        const points = GAME_CONFIG.SCORE.NEAR_MISS * (1 + this.combo * 0.1);
        this.score += points;
        this.nearMissCount++;
        
        soundManager.playSound('nearMiss', 0.4);
        
        return points;
    }

    increaseCombo() {
        this.combo++;
        this.comboTimer = GAME_CONFIG.SCORE.COMBO_TIMEOUT;
        hud.updateCombo(this.combo);
    }

    resetCombo() {
        this.combo = 0;
        this.comboTimer = 0;
        hud.updateCombo(this.combo);
    }

    getScore() {
        return Math.floor(this.score);
    }

    getCombo() {
        return this.combo;
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.lastComboTime = 0;
        this.nearMissCount = 0;
    }

    saveHighScore() {
        const currentHighScore = parseInt(localStorage.getItem('highScore') || '0');
        if (this.score > currentHighScore) {
            localStorage.setItem('highScore', Math.floor(this.score).toString());
            GAME_STATE.highScore = Math.floor(this.score);
            return true;
        }
        return false;
    }
}
