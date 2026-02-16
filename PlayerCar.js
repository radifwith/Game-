// Player Car Entity
class PlayerCar {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.PLAYER.SIZE.width;
        this.height = GAME_CONFIG.PLAYER.SIZE.height;
        this.angle = 0;
        this.speed = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Boost system
        this.isBoosting = false;
        this.boostTimer = 0;
        this.boostCooldown = 0;
        this.boostTrail = [];
        
        // Visual properties
        this.color = GAME_CONFIG.COLORS.PLAYER;
        this.radius = GAME_CONFIG.COLLISION.PLAYER_RADIUS;
    }

    update(deltaTime) {
        // Get input
        const input = this.getInput();
        
        // Update boost
        this.updateBoost(deltaTime);
        
        // Calculate movement
        if (input.x !== 0 || input.y !== 0) {
            // Get target angle from input
            const targetAngle = Math.atan2(input.y, input.x);
            
            // Smooth rotation
            let angleDiff = targetAngle - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.angle += angleDiff * GAME_CONFIG.PLAYER.ROTATION_SPEED * deltaTime;
            
            // Accelerate
            const maxSpeed = this.isBoosting ? 
                GAME_CONFIG.PLAYER.MAX_SPEED * GAME_CONFIG.PLAYER.BOOST_MULTIPLIER : 
                GAME_CONFIG.PLAYER.MAX_SPEED;
            
            this.speed += GAME_CONFIG.PLAYER.ACCELERATION * deltaTime;
            this.speed = Math.min(this.speed, maxSpeed);
        } else {
            // Decelerate when no input
            this.speed *= GAME_CONFIG.PLAYER.DECELERATION;
            if (this.speed < 1) this.speed = 0;
        }
        
        // Update velocity
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        
        // Player stays at center - we move the world instead
        // So we don't update x/y here
        
        // Update boost trail
        if (this.isBoosting && this.speed > 100) {
            this.boostTrail.push({
                x: this.x,
                y: this.y,
                alpha: GAME_CONFIG.EFFECTS.BOOST_TRAIL_ALPHA,
                size: this.width * 0.8
            });
            
            if (this.boostTrail.length > GAME_CONFIG.EFFECTS.BOOST_TRAIL_LENGTH) {
                this.boostTrail.shift();
            }
        }
        
        // Fade trail
        this.boostTrail.forEach(trail => {
            trail.alpha *= 0.95;
        });
        this.boostTrail = this.boostTrail.filter(trail => trail.alpha > 0.1);
        
        // Update sound based on speed
        soundManager.updateMusicIntensity(this.speed);
    }

    getInput() {
        let inputX = 0;
        let inputY = 0;
        
        // Virtual joystick (mobile)
        if (INPUT.joystick.active) {
            inputX = INPUT.joystick.x;
            inputY = INPUT.joystick.y;
        }
        // Keyboard (desktop)
        else {
            if (INPUT.keyboard.up) inputY -= 1;
            if (INPUT.keyboard.down) inputY += 1;
            if (INPUT.keyboard.left) inputX -= 1;
            if (INPUT.keyboard.right) inputX += 1;
            
            // Normalize diagonal movement
            const magnitude = Math.sqrt(inputX * inputX + inputY * inputY);
            if (magnitude > 0) {
                inputX /= magnitude;
                inputY /= magnitude;
            }
        }
        
        return { x: inputX, y: inputY };
    }

    updateBoost(deltaTime) {
        // Handle boost input
        if (INPUT.boost && this.boostCooldown <= 0 && !this.isBoosting) {
            this.activateBoost();
            INPUT.boost = false;
        }
        
        // Update boost timer
        if (this.isBoosting) {
            this.boostTimer -= deltaTime * 1000;
            if (this.boostTimer <= 0) {
                this.deactivateBoost();
            }
        }
        
        // Update cooldown
        if (this.boostCooldown > 0) {
            this.boostCooldown -= deltaTime * 1000;
            if (this.boostCooldown < 0) this.boostCooldown = 0;
            
            // Update UI
            const cooldownProgress = this.boostCooldown / GAME_CONFIG.PLAYER.BOOST_COOLDOWN;
            hud.updateBoostCooldown(cooldownProgress);
        }
    }

    activateBoost() {
        this.isBoosting = true;
        this.boostTimer = GAME_CONFIG.PLAYER.BOOST_DURATION;
        soundManager.playSound('boost', 1.0);
        hud.showBoostEffect();
    }

    deactivateBoost() {
        this.isBoosting = false;
        this.boostCooldown = GAME_CONFIG.PLAYER.BOOST_COOLDOWN;
    }

    render(ctx) {
        // Render boost trail
        this.boostTrail.forEach(trail => {
            ctx.save();
            ctx.globalAlpha = trail.alpha;
            ctx.fillStyle = GAME_CONFIG.COLORS.BOOST_TRAIL;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, trail.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // Render car body
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Boost glow effect
        if (this.isBoosting) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = GAME_CONFIG.COLORS.PLAYER_BOOST;
        }
        
        // Car body
        ctx.fillStyle = this.isBoosting ? GAME_CONFIG.COLORS.PLAYER_BOOST : this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Car details (windshield)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-this.width / 4, -this.height / 3, this.width / 2, this.height / 4);
        
        // Car outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        };
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isBoosting = false;
        this.boostTimer = 0;
        this.boostCooldown = 0;
        this.boostTrail = [];
    }
}
