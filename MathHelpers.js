// Mathematical Helper Functions
const MathHelpers = {
    /**
     * Calculate distance between two points
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Calculate angle between two points
     */
    angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Normalize angle to -PI to PI range
     */
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    },

    /**
     * Linear interpolation
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Clamp value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Random float between min and max
     */
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Check circle collision
     */
    circleCollision(x1, y1, r1, x2, y2, r2) {
        const dist = this.distance(x1, y1, x2, y2);
        return dist < (r1 + r2);
    },

    /**
     * Get random point on circle edge
     */
    randomPointOnCircle(centerX, centerY, radius) {
        const angle = Math.random() * Math.PI * 2;
        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        };
    },

    /**
     * Wrap value around min/max (for infinite world)
     */
    wrap(value, min, max) {
        const range = max - min;
        return ((value - min) % range + range) % range + min;
    },

    /**
     * Convert degrees to radians
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Convert radians to degrees
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },

    /**
     * Smooth damp (for smooth camera follow)
     */
    smoothDamp(current, target, velocity, smoothTime, deltaTime) {
        const omega = 2 / smoothTime;
        const x = omega * deltaTime;
        const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        let change = current - target;
        const maxChange = 9999;
        change = this.clamp(change, -maxChange, maxChange);
        const temp = (velocity + omega * change) * deltaTime;
        velocity = (velocity - omega * temp) * exp;
        let output = target + (change + temp) * exp;
        return { value: output, velocity: velocity };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathHelpers;
}
