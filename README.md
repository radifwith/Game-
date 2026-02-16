# 🚗 Open World Racer Escape

A high-intensity, browser-based car escape game built with vanilla JavaScript. Race through an infinite world, dodge enemy vehicles, and survive as long as possible!

![Game Preview](https://img.shields.io/badge/Status-Complete-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![Mobile](https://img.shields.io/badge/Mobile-Optimized-green)

## 🎮 Play Now

Simply open `index.html` in your browser - no build process required!

**Live Demo:** [Add your GitHub Pages URL here]

## ✨ Features

### Core Gameplay
- 🎯 **Infinite Open World** - Seamless looping world with no boundaries
- 🕹️ **Dual Control System** - Virtual joystick for mobile + WASD/Arrow keys for desktop
- 🚀 **Boost System** - Speed burst with cooldown mechanic
- 🤖 **Smart AI Enemies** - Predictive pursuit with separation behavior
- 💥 **Dynamic Difficulty** - Progressively harder as you survive longer
- 🎨 **Smooth Animations** - Explosion effects, boost trails, and screen shake
- 🎵 **Procedural Sound Effects** - Web Audio API generated sounds

### Technical Highlights
- ⚡ **60 FPS Performance** - Optimized game loop with delta time
- 📱 **Mobile-First Design** - Responsive UI with touch controls
- 🎪 **Zero Dependencies** - Pure vanilla JavaScript
- 💾 **Local High Score** - Persistent score tracking with localStorage
- 🌈 **Particle System** - Dynamic visual effects
- 📊 **Combo System** - Score multipliers for consecutive kills

## 🎯 How to Play

### Controls

**Mobile:**
- 📱 Use the virtual joystick (bottom-left) to move
- 🚀 Tap the boost button (bottom-right) to activate speed boost

**Desktop:**
- ⌨️ **WASD** or **Arrow Keys** to move
- **SPACE** to boost
- **ESC** or **P** to pause

### Objective
- Survive as long as possible
- Destroy enemy cars by crashing into them
- Avoid obstacles (trees and rocks)
- Build combos for higher scores
- Beat your high score!

### Scoring
- **Survival:** 10 points per second
- **Enemy Destroyed:** 100 points (+ combo multiplier)
- **Near Miss:** 25 points
- **Combo Multiplier:** Up to 1.5x for consecutive kills

## 🛠️ Installation

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/open-world-racer-escape.git
cd open-world-racer-escape
```

2. **Open in browser:**
```bash
# Just open index.html in any modern browser
# Or use a local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

### No Build Process Required!
This game uses vanilla JavaScript with no dependencies or build tools. Just download and play!

## 📁 Project Structure

```
open-world-racer-escape/
├── index.html              # Main HTML file
├── styles.css              # Complete styling and responsive design
├── src/
│   ├── main.js            # Entry point and initialization
│   ├── Game.js            # Main game engine
│   ├── entities/
│   │   ├── PlayerCar.js   # Player vehicle logic
│   │   ├── EnemyCar.js    # Enemy AI and behavior
│   │   └── Obstacle.js    # Trees and rocks
│   ├── systems/
│   │   ├── SpawnManager.js    # Enemy spawning system
│   │   ├── ScoreSystem.js     # Scoring and combos
│   │   └── ParticleSystem.js  # Visual effects
│   ├── ui/
│   │   ├── VirtualJoystick.js # Mobile controls
│   │   └── HUD.js             # UI management
│   └── utils/
│       ├── Constants.js       # Game configuration
│       ├── MathHelpers.js     # Utility functions
│       └── SoundManager.js    # Audio system
└── README.md
```

## 🎨 Game Design

### Infinite World System
The game creates an illusion of an infinite world by:
- Keeping the player at screen center
- Moving background and obstacles opposite to player movement
- Wrapping objects when they go off-screen
- Procedurally spawning enemies at screen edges

### AI Enemy Behavior
Enemies use a sophisticated AI system:
- **Predictive Pursuit:** Aims ahead of player's current velocity
- **Wander Behavior:** Random movement for unpredictability
- **Separation:** Avoids clustering with other enemies
- **Smooth Rotation:** Natural turning animation

### Difficulty Scaling

| Time Survived | Enemy Count | Enemy Speed | Spawn Rate |
|---------------|-------------|-------------|------------|
| 0-30s         | 2-3         | 85%         | 5s         |
| 30-60s        | 3-4         | 90%         | 4s         |
| 60-120s       | 4-5         | 95%         | 3.5s       |
| 120s+         | 5 (max)     | 100%        | 3s         |

## 🔧 Customization

### Modify Game Settings

Edit `src/utils/Constants.js` to customize:

```javascript
GAME_CONFIG = {
    PLAYER: {
        BASE_SPEED: 250,        // Change player speed
        BOOST_MULTIPLIER: 1.4,  // Adjust boost power
        BOOST_DURATION: 3000,   // Boost duration (ms)
    },
    ENEMY: {
        BASE_SPEED: 220,        // Enemy speed
        MAX_COUNT: 5,           // Maximum enemies
    },
    COLORS: {
        PLAYER: '#3498db',      // Change player color
        ENEMY: '#e74c3c',       // Change enemy color
    }
};
```

### Add New Features

The modular structure makes it easy to add:
- New car types
- Power-ups
- Different environments
- Additional obstacles
- Boss enemies
- Multiplayer modes

## 📱 Browser Support

- ✅ Chrome 90+ (Desktop & Mobile)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

### Requirements
- JavaScript enabled
- Canvas support
- Web Audio API support (for sound)

## 🚀 Performance

### Optimization Features
- Delta time-based updates for consistent speed
- Object pooling for particles
- Efficient collision detection
- Minimal DOM manipulation
- Canvas-based rendering
- 60 FPS target on desktop
- 30+ FPS on mid-range mobile devices

### Performance Tips
- Close other browser tabs for best performance
- Use Chrome for optimal frame rate
- Disable browser extensions if experiencing lag

## 📝 Development

### Adding New Enemies
```javascript
// In SpawnManager.js
spawnEnemy() {
    const enemy = new EnemyCar(x, y, this.player);
    enemy.speed = customSpeed;  // Customize
    enemy.color = customColor;  // Customize
    return enemy;
}
```

### Creating New Particle Effects
```javascript
// In ParticleSystem.js
createCustomEffect(x, y) {
    this.particles.push({
        x, y,
        vx: velocityX,
        vy: velocityY,
        life: duration,
        color: '#ffffff'
    });
}
```

## 🐛 Known Issues

- [ ] Occasional physics glitch at very high speeds
- [ ] Mobile landscape mode may need UI adjustment on some devices

## 🗺️ Roadmap

### Phase 1: MVP ✅ (Complete)
- [x] Core gameplay loop
- [x] Virtual joystick controls
- [x] Enemy AI
- [x] Boost system
- [x] Scoring and combos
- [x] Sound effects
- [x] Responsive design

### Phase 2: Polish (Planned)
- [ ] Multiple car options
- [ ] Power-ups (shield, slow-mo)
- [ ] Day/night cycle
- [ ] Weather effects
- [ ] Achievement system

### Phase 3: Social Features (Future)
- [ ] Global leaderboard
- [ ] Share scores
- [ ] Challenge mode
- [ ] Replay system

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Ideas
- Improve AI behavior
- Add new visual effects
- Create new car designs
- Optimize performance
- Add new game modes
- Improve mobile controls

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- Built following the Open World Racer Escape PRD
- Inspired by classic top-down racing games
- Sound effects generated using Web Audio API
- No external libraries or frameworks used

## 📧 Contact

**Project Link:** [https://github.com/yourusername/open-world-racer-escape](https://github.com/yourusername/open-world-racer-escape)

---

**Made with ❤️ and vanilla JavaScript**

*Star ⭐ this repository if you enjoyed playing!*
