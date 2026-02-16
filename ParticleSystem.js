// Particle System - Handles visual effects
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.screenShake = 0;
        this.screenShakeX = 0;
        this.screenShakeY = 0;
    }

    update(deltaTime) {
        // Update particles
        this.particles.forEach(particle => {
            particle.life -= deltaTime;
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.alpha = Math.max(0, particle.life / particle.maxLife);
            particle.size *= 0.98;
        });

        // Remove dead particles
        this.particles = this.particles.filter(p => p.life > 0);

        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake -= deltaTime;
            const intensity = this.screenShake * GAME_CONFIG.EFFECTS.SCREEN_SHAKE_INTENSITY;
            this.screenShakeX = (Math.random() - 0.5) * intensity * 2;
            this.screenShakeY = (Math.random() - 0.5) * intensity * 2;
        } else {
            this.screenShakeX = 0;
            this.screenShakeY = 0;
        }
    }

    render(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    createExplosion(x, y, color = GAME_CONFIG.COLORS.EXPLOSION) {
        const particleCount = GAME_CONFIG.EFFECTS.EXPLOSION_PARTICLES;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i + (Math.random() - 0.5) * 0.5;
            const speed = MathHelpers.randomRange(100, 300);
            const size = MathHelpers.randomRange(3, 8);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: GAME_CONFIG.EFFECTS.EXPLOSION_DURATION / 1000,
                maxLife: GAME_CONFIG.EFFECTS.EXPLOSION_DURATION / 1000,
                alpha: 1,
                size: size,
                color: color
            });
        }

        this.addScreenShake(GAME_CONFIG.EFFECTS.SCREEN_SHAKE_DURATION / 1000);
    }

    createBoostParticles(x, y) {
        const particleCount = 3;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = MathHelpers.randomRange(50, 150);
            const size = MathHelpers.randomRange(2, 5);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5,
                maxLife: 0.5,
                alpha: 1,
                size: size,
                color: GAME_CONFIG.COLORS.BOOST_TRAIL
            });
        }
    }

    createNearMissEffect(x, y) {
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = MathHelpers.randomRange(80, 150);
            const size = MathHelpers.randomRange(2, 4);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: GAME_CONFIG.EFFECTS.NEAR_MISS_GLOW_DURATION / 1000,
                maxLife: GAME_CONFIG.EFFECTS.NEAR_MISS_GLOW_DURATION / 1000,
                alpha: 1,
                size: size,
                color: GAME_CONFIG.COLORS.NEAR_MISS_GLOW
            });
        }
    }

    addScreenShake(duration) {
        this.screenShake = Math.max(this.screenShake, duration);
    }

    getScreenShake() {
        return {
            x: this.screenShakeX,
            y: this.screenShakeY
        };
    }

    reset() {
        this.particles = [];
        this.screenShake = 0;
        this.screenShakeX = 0;
        this.screenShakeY = 0;
    }
}
