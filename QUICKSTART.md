# ⚡ Quick Start Guide

Get the game running in **under 1 minute**!

## 🎮 Play Instantly

### Option 1: Open Directly (Fastest)
1. Double-click `index.html`
2. Game opens in your browser
3. Start playing!

**Note:** Some browsers may block features when opening files directly. For best experience, use Option 2.

### Option 2: Local Server (Recommended)

#### Using Python (Most Common)
```bash
cd open-world-racer-escape
python -m http.server 8000
```
Then open: http://localhost:8000

#### Using Python 2
```bash
python -m SimpleHTTPServer 8000
```

#### Using Node.js
```bash
npx http-server
```

#### Using PHP
```bash
php -S localhost:8000
```

## 📱 Controls

### Mobile
- **Joystick** (bottom-left): Move your car
- **Boost Button** (bottom-right): Speed boost

### Desktop
- **WASD** or **Arrow Keys**: Move
- **SPACE**: Boost
- **ESC** or **P**: Pause

## 🎯 Quick Test Checklist

Open the game and verify:
- [ ] You see the welcome screen
- [ ] Click "START GAME"
- [ ] Car appears in center
- [ ] You can control the car
- [ ] Boost button works
- [ ] Enemies appear and chase you
- [ ] Collision detection works
- [ ] Score increases
- [ ] Game over screen appears

## 🐛 Troubleshooting

### Game doesn't load
**Fix:** Open browser console (F12) and check for errors

### Controls don't work
**Fix:** Make sure you clicked on the game area first

### No sound
**Fix:** Click anywhere on the page first (browser audio policy)

### Performance issues
**Fix:** Close other tabs, use Chrome for best performance

## 🚀 Next Steps

1. ✅ Test the game locally
2. 📖 Read full [README.md](README.md)
3. 🌐 Deploy to GitHub Pages (see [DEPLOYMENT.md](DEPLOYMENT.md))
4. 🎨 Customize and add features
5. 🤝 Contribute improvements

## 💡 Quick Tips

- **High Score** is saved locally in your browser
- **Pause** anytime with ESC or the pause button
- **Combo system** rewards consecutive kills
- **Difficulty** increases over time
- **Near misses** give bonus points

## 📊 Performance Targets

- **Desktop:** 60 FPS
- **Mobile (High-end):** 60 FPS
- **Mobile (Mid-range):** 30-45 FPS

## 🎮 Browser Support

✅ **Recommended:**
- Chrome 90+ (Desktop & Mobile)
- Safari 14+ (Desktop & Mobile)
- Firefox 88+
- Edge 90+

## 🔧 Development Mode

Add `#debug` to the URL to see debug info in console:
```
http://localhost:8000/#debug
```

This shows:
- Current FPS
- Active enemies count
- Score and combo
- Game state

## 📝 File Structure Overview

```
open-world-racer-escape/
├── index.html          ← Start here (open in browser)
├── styles.css          ← All game styles
├── src/
│   ├── main.js        ← Entry point
│   ├── Game.js        ← Main game engine
│   ├── entities/      ← Player, enemies, obstacles
│   ├── systems/       ← Spawning, scoring, effects
│   ├── ui/            ← Controls and HUD
│   └── utils/         ← Helpers and config
└── README.md          ← Full documentation
```

## 🎨 Customization Quick Guide

Want to change something? Here are common tweaks:

### Change Player Speed
`src/utils/Constants.js` → `PLAYER.BASE_SPEED`

### Change Colors
`src/utils/Constants.js` → `COLORS` section

### Adjust Difficulty
`src/utils/Constants.js` → `DIFFICULTY` section

### Modify Controls
`src/ui/VirtualJoystick.js` and `src/ui/HUD.js`

## ❓ Need Help?

1. Check [README.md](README.md) for detailed info
2. See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting
3. Read [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
4. Open an issue on GitHub

---

**You're ready to play! 🎮**

Enjoy the game, and feel free to customize it to make it your own!
