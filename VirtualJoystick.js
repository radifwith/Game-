// Virtual Joystick Controller
class VirtualJoystick {
    constructor() {
        this.container = document.getElementById('joystick-container');
        this.base = this.container.querySelector('.joystick-base');
        this.thumb = this.container.querySelector('.joystick-thumb');
        
        this.active = false;
        this.touchId = null;
        this.baseX = 0;
        this.baseY = 0;
        this.thumbX = 0;
        this.thumbY = 0;
        this.maxDistance = 40; // Maximum thumb displacement
        
        this.init();
    }

    init() {
        // Get base position
        const rect = this.base.getBoundingClientRect();
        this.baseX = rect.left + rect.width / 2;
        this.baseY = rect.top + rect.height / 2;

        // Touch events
        this.container.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.container.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        this.container.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });

        // Mouse events (for desktop testing)
        this.container.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Update position on window resize
        window.addEventListener('resize', () => this.updateBasePosition());
    }

    updateBasePosition() {
        const rect = this.base.getBoundingClientRect();
        this.baseX = rect.left + rect.width / 2;
        this.baseY = rect.top + rect.height / 2;
    }

    onTouchStart(e) {
        if (!this.active && e.touches.length > 0) {
            e.preventDefault();
            this.active = true;
            this.touchId = e.touches[0].identifier;
            this.thumb.classList.add('active');
            this.updateThumbPosition(e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    onTouchMove(e) {
        if (!this.active) return;
        e.preventDefault();

        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === this.touchId) {
                this.updateThumbPosition(e.touches[i].clientX, e.touches[i].clientY);
                break;
            }
        }
    }

    onTouchEnd(e) {
        if (!this.active) return;

        let touchEnded = true;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === this.touchId) {
                touchEnded = false;
                break;
            }
        }

        if (touchEnded) {
            this.reset();
        }
    }

    onMouseDown(e) {
        if (!this.active) {
            this.active = true;
            this.thumb.classList.add('active');
            this.updateThumbPosition(e.clientX, e.clientY);
        }
    }

    onMouseMove(e) {
        if (!this.active) return;
        this.updateThumbPosition(e.clientX, e.clientY);
    }

    onMouseUp(e) {
        if (this.active) {
            this.reset();
        }
    }

    updateThumbPosition(clientX, clientY) {
        // Calculate delta from base
        let deltaX = clientX - this.baseX;
        let deltaY = clientY - this.baseY;

        // Calculate distance
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Limit to max distance
        if (distance > this.maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = Math.cos(angle) * this.maxDistance;
            deltaY = Math.sin(angle) * this.maxDistance;
        }

        // Update thumb visual position
        this.thumbX = deltaX;
        this.thumbY = deltaY;
        this.thumb.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

        // Update input state (normalized -1 to 1)
        INPUT.joystick.x = deltaX / this.maxDistance;
        INPUT.joystick.y = deltaY / this.maxDistance;
        INPUT.joystick.active = true;
    }

    reset() {
        this.active = false;
        this.touchId = null;
        this.thumbX = 0;
        this.thumbY = 0;
        this.thumb.style.transform = 'translate(-50%, -50%)';
        this.thumb.classList.remove('active');

        // Reset input state
        INPUT.joystick.x = 0;
        INPUT.joystick.y = 0;
        INPUT.joystick.active = false;
    }

    getInput() {
        return {
            x: INPUT.joystick.x,
            y: INPUT.joystick.y,
            active: INPUT.joystick.active
        };
    }
}

// Initialize joystick when DOM is ready
let virtualJoystick;
