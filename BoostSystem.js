// Boost System - Manages boost mechanics and effects
class BoostSystem {
    constructor(player) {
        this.player = player;
        this.isActive = false;
        this.duration = GAME_CONFIG.PLAYER.BOOST_DURATION;
        this.cooldown = GAME_CONFIG.PLAYER.BOOST_COOLDOWN;
        this.timer = 0;
        this.cooldownTimer = 0;
        this.trail = [];
    }

    update(deltaTime) {
        // Update boost timer
        if (this.isActive) {
            this.timer += deltaTime * 1000;
            
            if (this.timer >= this.duration) {
                this.deactivate();
            }
            
            // Add trail particles
            this.addTrailParticle();
        }

        // Update cooldown
        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= deltaTime * 1000;
            if (this.cooldownTimer < 0) {
                this.cooldownTimer = 0;
            }
        }

        // Update trail
        this.updateTrail(deltaTime);
    }

    activate() {
        if (!this.canActivate()) return false;

        this.isActive = true;
        this.timer = 0;
        soundManager.playSound('boost', 1.0);
        
        return true;
    }

    deactivate() {
        this.isActive = false;
        this.timer = 0;
        this.cooldownTimer = this.cooldown;
    }

    canActivate() {
        return !this.isActive && this.cooldownTimer <= 0;
    }

    addTrailParticle() {
        this.trail.push({
            x: this.player.x,
            y: this.player.y,
            alpha: 1.0,
            size: this.player.width * 0.8,
            createdAt: Date.now()
        });

        // Limit trail length
        if (this.trail.length > GAME_CONFIG.EFFECTS.BOOST_TRAIL_LENGTH) {
            this.trail.shift();
        }
    }

    updateTrail(deltaTime) {
        // Fade out trail particles
        this.trail.forEach(particle => {
            particle.alpha *= 0.92;
        });

        // Remove dead particles
        this.trail = this.trail.filter(p => p.alpha > 0.1);
    }

    renderTrail(ctx) {
        this.trail.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = GAME_CONFIG.COLORS.BOOST_TRAIL;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    getCooldownProgress() {
        return this.cooldownTimer / this.cooldown;
    }

    reset() {
        this.isActive = false;
        this.timer = 0;
        this.cooldownTimer = 0;
        this.trail = [];
    }
}
