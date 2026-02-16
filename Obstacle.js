// Obstacle Entity (Trees and Rocks)
class Obstacle {
    constructor(x, y, type, size) {
        this.x = x;
        this.y = y;
        this.type = type; // 'tree' or 'rock'
        this.size = size;
        this.radius = type === 'tree' ? 
            GAME_CONFIG.OBSTACLES.TREES.COLLISION_RADIUS : 
            GAME_CONFIG.OBSTACLES.ROCKS.COLLISION_RADIUS;
        
        // Visual properties
        this.color = type === 'tree' ? GAME_CONFIG.COLORS.TREE : GAME_CONFIG.COLORS.ROCK;
        this.shadowOffset = size * 0.1;
    }

    update(deltaTime, playerVelocity) {
        // Obstacles move opposite to player velocity (infinite world illusion)
        this.x -= playerVelocity.x * deltaTime;
        this.y -= playerVelocity.y * deltaTime;
    }

    render(ctx) {
        // Render shadow
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.shadowOffset, 
            this.y + this.shadowOffset, 
            this.radius * 0.8, 
            this.radius * 0.5, 
            0, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        if (this.type === 'tree') {
            this.renderTree(ctx);
        } else {
            this.renderRock(ctx);
        }
    }

    renderTree(ctx) {
        ctx.save();
        
        // Tree trunk
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(this.x - 8, this.y - 10, 16, 20);
        
        // Tree foliage (simple circle)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.size / 3, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Foliage details (lighter spots)
        ctx.fillStyle = 'rgba(74, 124, 89, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x - 10, this.y - this.size / 3 - 5, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y - this.size / 3 + 3, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.size / 3, this.size / 2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    renderRock(ctx) {
        ctx.save();
        
        // Rock body (irregular polygon)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const points = 6;
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 / points) * i;
            const variance = 0.8 + Math.sin(i * 2.5) * 0.2;
            const x = this.x + Math.cos(angle) * (this.size / 2) * variance;
            const y = this.y + Math.sin(angle) * (this.size / 2) * variance;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // Rock highlights
        ctx.fillStyle = 'rgba(149, 165, 166, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 5, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 / points) * i;
            const variance = 0.8 + Math.sin(i * 2.5) * 0.2;
            const x = this.x + Math.cos(angle) * (this.size / 2) * variance;
            const y = this.y + Math.sin(angle) * (this.size / 2) * variance;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        };
    }

    // Check if obstacle is too far and needs repositioning (for infinite world)
    needsRepositioning(cameraX, cameraY, worldSize) {
        const halfWorld = worldSize / 2;
        return (
            Math.abs(this.x - cameraX) > halfWorld ||
            Math.abs(this.y - cameraY) > halfWorld
        );
    }

    // Reposition obstacle for infinite world wrapping
    reposition(cameraX, cameraY, worldSize) {
        const halfWorld = worldSize / 2;
        
        if (this.x < cameraX - halfWorld) this.x += worldSize;
        if (this.x > cameraX + halfWorld) this.x -= worldSize;
        if (this.y < cameraY - halfWorld) this.y += worldSize;
        if (this.y > cameraY + halfWorld) this.y -= worldSize;
    }
}
