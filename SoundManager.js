// Sound Manager - Handles all audio playback
class SoundManager {
    constructor() {
        this.sounds = {};
        this.musicIntensity = 1.0;
        this.isMuted = false;
        this.init();
    }

    init() {
        // Create audio context for web audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Initialize sound buffers (using simple oscillators for now)
        this.createSounds();
    }

    createSounds() {
        // We'll use oscillators to create simple sound effects
        // In production, you'd load actual audio files
        this.soundConfig = {
            boost: { type: 'sawtooth', frequency: 220, duration: 0.3 },
            explosion: { type: 'noise', duration: 0.4 },
            collision: { type: 'square', frequency: 110, duration: 0.2 },
            nearMiss: { type: 'sine', frequency: 880, duration: 0.15 },
            combo: { type: 'sine', frequency: 660, duration: 0.25 }
        };
    }

    playSound(soundName, volume = 1.0) {
        if (this.isMuted) return;

        const config = this.soundConfig[soundName];
        if (!config) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            if (config.type === 'noise') {
                // Create white noise for explosion
                const bufferSize = this.audioContext.sampleRate * config.duration;
                const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                const output = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                const noise = this.audioContext.createBufferSource();
                noise.buffer = buffer;
                noise.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                gainNode.gain.setValueAtTime(volume * GAME_CONFIG.AUDIO.SFX_VOLUME, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);
                noise.start(this.audioContext.currentTime);
                noise.stop(this.audioContext.currentTime + config.duration);
            } else {
                oscillator.type = config.type;
                oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                gainNode.gain.setValueAtTime(volume * GAME_CONFIG.AUDIO.SFX_VOLUME, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + config.duration);
            }
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }

    updateMusicIntensity(speed) {
        // Adjust music intensity based on player speed
        const normalizedSpeed = speed / GAME_CONFIG.PLAYER.MAX_SPEED;
        this.musicIntensity = MathHelpers.lerp(this.musicIntensity, normalizedSpeed, 0.1);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    setVolume(volume) {
        GAME_CONFIG.AUDIO.MASTER_VOLUME = MathHelpers.clamp(volume, 0, 1);
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();
