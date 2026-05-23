/**
 * Appu's Meadow Run - Game Engine
 * Retro 8-bit endless runner.
 */

// Global Game States
const STATE_MENU = 'MENU';
const STATE_PLAYING = 'PLAYING';
const STATE_SHOP = 'SHOP';
const STATE_GAMEOVER = 'GAMEOVER';
const STATE_MILESTONE = 'MILESTONE';

// Appu milestone check-ins: shown every 1000m with a random pic + funny quote
const APPU_MILESTONES = [
    {
        img: 'appu_pics/1CADE408-D9C1-4134-A126-78B00F1027AF.png',
        quote: "Huh? You ran HOW far? I don't even walk to my food bowl."
    },
    {
        img: 'appu_pics/D9DAF0A0-660C-4E0D-A7CF-E6580F54DFBB_converted.png',
        quote: "Excuse me?! I was NAPPING in here. Keep running, please."
    },
    {
        img: 'appu_pics/IMG_0943_converted.png',
        quote: "It's raining. I'm napping. You're running. We are not the same."
    },
    {
        img: 'appu_pics/IMG_0994.png',
        quote: "You're running while I'm still in bed. One of us is doing life right."
    },
    {
        img: 'appu_pics/IMG_1046.png',
        quote: "I claimed this meadow. You're technically trespassing. Keep going though."
    },
    {
        img: 'appu_pics/IMG_1072_converted.png',
        quote: "I'm doing advanced yoga. It's called Reverse Nap. Very spiritual."
    },
    {
        img: 'appu_pics/IMG_1103.png',
        quote: "I trained all week for this. By 'trained' I mean I sat here."
    },
    {
        img: 'appu_pics/IMG_1164.png',
        quote: "I'm judging your running form. 6 out of 10. Paws need work."
    },
    {
        img: 'appu_pics/IMG_1192.png',
        quote: "That's right. I own this whole meadow. Every. Blade. Of. Grass."
    },
    {
        img: 'appu_pics/IMG_1210.png',
        quote: "I found a shortcut. It's full of tissue paper. 10/10 would recommend."
    },
    {
        img: 'appu_pics/IMG_1370_converted.png',
        quote: "I believe in you. Monitoring your progress from my blanket."
    },
    {
        img: 'appu_pics/IMG_1558_converted.png',
        quote: "APPULOCHEESE! That's how I say 'you got this!' in cat."
    },
];

class MusicSynth {
    constructor(audioCtx) {
        this.ctx = audioCtx;
        this.isPlaying = false;
        this.tempo = 115; // BPM
        this.nextNoteTime = 0.0;
        this.step = 0;
        this.timerId = null;

        // Bassline frequencies (Triangle wave arpeggios)
        this.bassSequence = [
            130.81, 130.81, 196.00, 196.00, // C3, C3, G3, G3
            220.00, 220.00, 174.61, 174.61, // A3, A3, F3, F3
            130.81, 130.81, 164.81, 164.81, // C3, C3, E3, E3
            174.61, 174.61, 196.00, 196.00  // F3, F3, G3, G3
        ];

        // Melody frequencies (Sine wave happy meadow arpeggio)
        // 0 represents rest
        this.melodySequence = [
            659.25, 0, 783.99, 880.00, 1046.50, 0, 880.00, 783.99,
            880.00, 0, 783.99, 0, 659.25, 523.25, 587.33, 0,
            659.25, 0, 783.99, 880.00, 1046.50, 1174.66, 1046.50, 880.00,
            1046.50, 0, 1174.66, 0, 1318.51, 0, 0, 0
        ];
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.step = 0;
        this.scheduler();
    }

    scheduler() {
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.scheduleNote(this.step, this.nextNoteTime);
            this.advanceNote();
        }
        this.timerId = setTimeout(() => this.scheduler(), 25);
    }

    advanceNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat; // sixteenth notes
        this.step = (this.step + 1) % 32;
    }

    scheduleNote(step, time) {
        // Trigger bass on alternate sixteenths (eighth note pulse)
        if (step % 2 === 0) {
            const bassIdx = (Math.floor(step / 2)) % this.bassSequence.length;
            const freq = this.bassSequence[bassIdx];
            this.playBassNote(freq, time);
        }

        // Trigger melody notes
        const melFreq = this.melodySequence[step % this.melodySequence.length];
        if (melFreq > 0) {
            this.playMelodyNote(melFreq, time);
        }
    }

    playBassNote(freq, time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    playMelodyNote(freq, time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.025, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.15);
    }

    stop() {
        this.isPlaying = false;
        clearTimeout(this.timerId);
    }
}

class SoundEffects {
    constructor() {
        this.ctx = null;
        this.music = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.music = new MusicSynth(this.ctx);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    startMusic() {
        this.init();
        if (this.music) {
            this.music.start();
        }
    }

    stopMusic() {
        if (this.music) {
            this.music.stop();
        }
    }

    playJump() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playHurt() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.25);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    playFish() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.07);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playHeart() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playGameOver() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const notes = [440, 392, 349, 293]; // A4, G4, F4, D4
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.15);
            osc.frequency.linearRampToValueAtTime(freq - 60, now + idx * 0.15 + 0.25);

            gain.gain.setValueAtTime(0.15, now + idx * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.15 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.15);
            osc.stop(now + idx * 0.15 + 0.25);
        });
    }
}

const sounds = new SoundEffects();

class Game {
    constructor() {
        // Canvas configurations
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // UI elements
        this.crtContainer = document.querySelector('.crt-container');
        this.startMenu = document.getElementById('startMenu');
        this.shopScreen = document.getElementById('shopScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.gameHUD = document.getElementById('gameHUD');
        this.mobileControls = document.getElementById('mobileControls');
        this.milestoneScreen = document.getElementById('milestoneScreen');

        // HUD stats
        this.hudDistance = document.getElementById('hudDistance');
        this.hudHearts = document.getElementById('hudHearts');
        this.hudFishCount = document.getElementById('hudFishCount');

        // Meta progression (Save/Load)
        this.fish = 0;
        this.highScore = 0;
        this.purchasedSkins = []; // Array of string accessory names
        this.equippedSkins = [];  // Array of string accessory names

        this.loadGameData();

        // Game Settings
        this.state = STATE_MENU;
        this.lastTime = 0;
        this.gameSpeed = 250; // px/sec
        this.maxSpeed = 700;
        this.distanceRun = 0;
        this.fishEarnedThisRun = 0;
        this.nextMilestone = 400;
        this.lastMilestoneIndex = -1;

        // Milestone canvas state
        this.currentMilestoneImg    = null;
        this.currentMilestoneQuote  = '';
        this.currentMilestoneDist   = 0;
        this.milestoneBlink         = 0; // blink timer for "tap to continue" text

        // Preload all milestone images so they're instant when needed
        this.milestoneImages = {};
        APPU_MILESTONES.forEach(entry => {
            const img = new Image();
            img.src = entry.img;
            this.milestoneImages[entry.img] = img;
        });

        // Ground Floor Constants
        this.groundHeight = 130;
        this.floorY = this.height - this.groundHeight; // Y: 270
        this.spriteScale = 2.5;

        // Player Parameters (Chunky 2.5x uniform 8-bit scale)
        this.player = {
            x: 120,
            y: 0,
            vy: 0,
            width: 24 * this.spriteScale,  // 60px
            height: 18 * this.spriteScale, // 45px
            gravity: 1600,
            jumpForce: -580,
            lives: 3,
            maxLives: 5,
            isGrounded: false,
            state: 'running', // running, jumping, ducking, hurt
            runFrame: 0,
            runTimer: 0,
            duckFrame: 0,
            duckTimer: 0,
            invincibilityTimer: 0,
            invincible: false,
            hurtTimer: 0
        };
        // Reset player height
        this.player.y = this.floorY - this.player.height;

        // Environment / Parallax settings
        this.skyTime = 600; // Sky time representing Day/Sunset/Night/Dawn (0 to 2400)
        this.skyCycleSpeed = 10; // rate of time flow
        this.clouds = [];
        this.mountains = [];
        this.trees = [];
        this.groundFlowers = [];
        this.stars = [];
        
        this.initEnvironment();

        // Entity Spawning arrays
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];

        // Spawn Timers
        this.obstacleTimer = 0;
        this.obstacleSpawnDelay = 1.8; // seconds
        this.collectibleTimer = 0;
        this.collectibleSpawnDelay = 3.5; // seconds

        // Controls
        this.keys = {};
        this.initInput();
        this.bindUI();

        // Initial setup
        this.updateHUD();
        this.showScreen(STATE_MENU);

        // Responsive Scaling Setup
        this.resizeGame();
        window.addEventListener('resize', () => this.resizeGame());
        
        // Start Game loop
        requestAnimationFrame((t) => this.loop(t));
    }

    // Simple FNV-1a checksum to detect casual localStorage tampering.
    // Not cryptographic — just enough to catch someone editing values in dev tools.
    _checksum(str) {
        let hash = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193) >>> 0;
        }
        return hash.toString(16);
    }

    _savePayload(fish, highScore, purchased, equipped) {
        return `appu|${fish}|${highScore}|${JSON.stringify(purchased)}|${JSON.stringify(equipped)}`;
    }

    loadGameData() {
        try {
            this.purchasedSkins = JSON.parse(localStorage.getItem('appu_purchased_skins')) || [];
            this.equippedSkins = JSON.parse(localStorage.getItem('appu_equipped_skins')) || [];
        } catch (e) {
            this.purchasedSkins = [];
            this.equippedSkins = [];
        }

        // Grant 150 starter fish if first time loading or if player has 0 fish and has purchased nothing
        const storedFish = localStorage.getItem('appu_fish');
        if (storedFish === null || (parseInt(storedFish) === 0 && this.purchasedSkins.length === 0)) {
            this.fish = 150;
            localStorage.setItem('appu_fish', '150');
        } else {
            this.fish = parseInt(storedFish) || 0;
        }

        this.highScore = parseFloat(localStorage.getItem('appu_highscore')) || 0;

        // Integrity check: if a checksum exists and doesn't match, reset data
        const storedChecksum = localStorage.getItem('appu_save_cs');
        if (storedChecksum !== null) {
            const expected = this._checksum(this._savePayload(
                this.fish, this.highScore.toFixed(0), this.purchasedSkins, this.equippedSkins
            ));
            if (storedChecksum !== expected) {
                console.warn("Save data integrity check failed — resetting to defaults.");
                this.fish = 150;
                this.highScore = 0;
                this.purchasedSkins = [];
                this.equippedSkins = [];
                this.saveGameData();
                return;
            }
        }

        console.log("LOADED SAVE DATA - Fish:", this.fish, "Purchased Skins:", this.purchasedSkins, "Equipped Skins:", this.equippedSkins);
    }

    saveGameData() {
        localStorage.setItem('appu_fish', this.fish);
        localStorage.setItem('appu_highscore', this.highScore.toFixed(0));
        localStorage.setItem('appu_purchased_skins', JSON.stringify(this.purchasedSkins));
        localStorage.setItem('appu_equipped_skins', JSON.stringify(this.equippedSkins));
        // Write checksum so we can detect tampering on next load
        localStorage.setItem('appu_save_cs', this._checksum(this._savePayload(
            this.fish, this.highScore.toFixed(0), this.purchasedSkins, this.equippedSkins
        )));
        console.log("SAVED SAVE DATA - Fish:", this.fish, "Purchased Skins:", this.purchasedSkins, "Equipped Skins:", this.equippedSkins);
    }

    initEnvironment() {
        // Initialize mountains
        for (let i = 0; i < 4; i++) {
            this.mountains.push({
                x: i * 260 + Math.random() * 50,
                scale: 3.5 + Math.random() * 1.5
            });
        }

        // Initialize trees
        for (let i = 0; i < 6; i++) {
            this.trees.push({
                x: i * 150 + Math.random() * 40,
                scale: 3.0 + Math.random() * 1.0
            });
        }

        // Initialize clouds
        for (let i = 0; i < 3; i++) {
            this.clouds.push({
                x: i * 300 + Math.random() * 100,
                y: 30 + Math.random() * 70,
                speed: 0.15 + Math.random() * 0.15,
                scale: 2.0 + Math.random() * 1.5
            });
        }

        // Initialize stars (night elements)
        for (let i = 0; i < 20; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * 180,
                blinkSpeed: 1.5 + Math.random() * 3.0,
                phase: Math.random() * Math.PI
            });
        }

        // Initialize ground flowers in the meadow
        for (let i = 0; i < 8; i++) {
            this.groundFlowers.push({
                x: i * 110 + Math.random() * 50,
                scale: 1.5 + Math.random() * 1.0
            });
        }
    }

    initInput() {
        // Keyboard handlers
        window.addEventListener('keydown', (e) => {
            // Any key dismisses milestone screen
            if (this.state === STATE_MILESTONE) {
                this.dismissMilestone();
                return;
            }
            if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
                e.preventDefault(); // Stop page scrolling
            }
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Get Duck & Jump button references
        const btnDuck = document.getElementById('btnMobileDuck');
        const btnJump = document.getElementById('btnMobileJump');

        // Duck button touch / mouse handlers
        btnDuck.addEventListener('touchstart', (e) => {
            if (this.state === STATE_PLAYING) {
                e.preventDefault();
                e.stopPropagation();
                this.keys['MobileDuck'] = true;
                this.keys['MobileJump'] = false;
            }
        }, { passive: false });

        btnDuck.addEventListener('touchend', (e) => {
            if (this.state === STATE_PLAYING) {
                e.preventDefault();
                e.stopPropagation();
                this.keys['MobileDuck'] = false;
            }
        }, { passive: false });

        btnDuck.addEventListener('touchcancel', (e) => {
            e.stopPropagation();
            this.keys['MobileDuck'] = false;
        });

        btnDuck.addEventListener('mousedown', (e) => {
            if (this.state === STATE_PLAYING) {
                e.stopPropagation();
                this.keys['MobileDuck'] = true;
                this.keys['MobileJump'] = false;
            }
        });

        btnDuck.addEventListener('mouseup', (e) => {
            if (this.state === STATE_PLAYING) {
                e.stopPropagation();
                this.keys['MobileDuck'] = false;
            }
        });

        // Jump button touch / mouse handlers (specifically for the visual JUMP button on left)
        btnJump.addEventListener('touchstart', (e) => {
            if (this.state === STATE_PLAYING) {
                e.preventDefault();
                e.stopPropagation();
                this.keys['MobileJump'] = true;
            }
        }, { passive: false });

        btnJump.addEventListener('touchend', (e) => {
            if (this.state === STATE_PLAYING) {
                e.preventDefault();
                e.stopPropagation();
                this.keys['MobileJump'] = false;
            }
        }, { passive: false });

        btnJump.addEventListener('touchcancel', (e) => {
            e.stopPropagation();
            this.keys['MobileJump'] = false;
        });

        btnJump.addEventListener('mousedown', (e) => {
            if (this.state === STATE_PLAYING) {
                e.stopPropagation();
                this.keys['MobileJump'] = true;
            }
        });

        btnJump.addEventListener('mouseup', (e) => {
            if (this.state === STATE_PLAYING) {
                e.stopPropagation();
                this.keys['MobileJump'] = false;
            }
        });

        // Window (anywhere else) touch / mouse handlers for Jump
        window.addEventListener('touchstart', (e) => {
            if (this.state === STATE_MILESTONE) {
                this.dismissMilestone();
                return;
            }
            if (this.state === STATE_PLAYING) {
                // If it is not on the duck or jump buttons
                if (e.target !== btnDuck && e.target !== btnJump) {
                    e.preventDefault();
                    this.keys['MobileJump'] = true;
                }
            }
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            if (this.state === STATE_PLAYING) {
                e.preventDefault();
                this.keys['MobileJump'] = false;
            }
        }, { passive: false });

        window.addEventListener('touchcancel', (e) => {
            if (this.state === STATE_PLAYING) {
                this.keys['MobileJump'] = false;
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (this.state === STATE_MILESTONE) {
                this.dismissMilestone();
                return;
            }
            if (this.state === STATE_PLAYING) {
                if (e.target !== btnDuck && e.target !== btnJump) {
                    this.keys['MobileJump'] = true;
                }
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (this.state === STATE_PLAYING) {
                this.keys['MobileJump'] = false;
            }
        });
    }

    bindUI() {
        // Start Menu Button Bindings
        document.getElementById('btnPlay').onclick = () => {
            sounds.init();
            this.startNewGame();
        };

        document.getElementById('btnShop').onclick = () => {
            sounds.init();
            this.openShop();
        };

        // Shop Screen Button Bindings
        document.getElementById('btnBackToMenu').onclick = () => {
            sounds.playJump();
            this.showScreen(STATE_MENU);
        };

        document.getElementById('btnResetData').onclick = () => {
            if (confirm("Reset all game data (fish coins, highscore, purchases)?")) {
                localStorage.clear();
                location.reload();
            }
        };

        // Shop items grids click handler
        const shopButtons = document.querySelectorAll('.btn-shop');
        shopButtons.forEach(button => {
            button.onclick = () => {
                const skin = button.getAttribute('data-item');
                const cost = parseInt(button.getAttribute('data-cost'));
                this.handleShopAction(skin, cost, button);
            };
        });

        // Game Over Button Bindings
        document.getElementById('btnRestart').onclick = () => {
            sounds.init();
            this.startNewGame();
        };

        document.getElementById('btnMenuFromGameOver').onclick = () => {
            sounds.playJump();
            this.showScreen(STATE_MENU);
        };

        document.getElementById('btnMilestoneContinue').onclick = () => {
            this.dismissMilestone();
        };
    }

    showScreen(state) {
        this.state = state;

        // Hide all screens first
        this.startMenu.classList.add('hidden');
        this.shopScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.milestoneScreen.classList.add('hidden');
        this.gameHUD.classList.add('hidden');
        this.mobileControls.classList.add('hidden');

        // Stop music sequencer if not in PLAYING state
        if (state !== STATE_PLAYING) {
            sounds.stopMusic();
        }

        if (state === STATE_MENU) {
            this.startMenu.classList.remove('hidden');
            document.getElementById('menuHighScore').innerText = this.highScore.toFixed(0);
        } else if (state === STATE_SHOP) {
            this.shopScreen.classList.remove('hidden');
            this.updateShopUI();
            this.drawShopPreviews();
        } else if (state === STATE_PLAYING) {
            this.gameHUD.classList.remove('hidden');
            this.mobileControls.classList.remove('hidden');
            sounds.startMusic(); // Start background music loops!
        } else if (state === STATE_GAMEOVER) {
            this.gameOverScreen.classList.remove('hidden');
            document.getElementById('goDistance').innerText = this.distanceRun.toFixed(0);
            document.getElementById('goFishEarned').innerText = this.fishEarnedThisRun;
            document.getElementById('goHighScore').innerText = this.highScore.toFixed(0);
        } else if (state === STATE_MILESTONE) {
            // Milestone is drawn on canvas — just keep HUD visible
            this.gameHUD.classList.remove('hidden');
            this.mobileControls.classList.remove('hidden');
            // (no DOM overlay — card is rendered directly onto the canvas)
        }
    }

    resizeGame() {
        const isMobile = window.innerWidth <= 860;
        const targetW = isMobile ? 800 : 836;
        const targetH = isMobile ? 400 : 436;
        
        const windowW = window.innerWidth;
        const windowH = window.innerHeight;
        
        const margin = isMobile ? 0 : 16;
        const scaleX = (windowW - margin) / targetW;
        const scaleY = (windowH - margin) / targetH;
        
        // Scale to fit viewport perfectly
        const scale = Math.min(scaleX, scaleY);
        
        this.crtContainer.style.transform = `scale(${scale})`;
        this.crtContainer.style.transformOrigin = 'center center';
    }

    startNewGame() {
        this.showScreen(STATE_PLAYING);
        
        // Reset Player stats
        this.player.lives = 3;
        this.player.vy = 0;
        this.player.y = this.floorY - this.player.height;
        this.player.isGrounded = true;
        this.player.state = 'running';
        this.player.invincibilityTimer = 0;
        this.player.invincible = false;

        // Reset game environment stats
        this.gameSpeed = 260;
        this.distanceRun = 0;
        this.fishEarnedThisRun = 0;
        this.nextMilestone = 400;
        this.lastMilestoneIndex = -1;
        this.obstacleTimer = 0.5; // Spawn first obstacle quick
        this.collectibleTimer = 1.5; // Spawn first coin soon

        // Clear spawns
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];

        this.updateHUD();
        sounds.playJump();
    }

    openShop() {
        this.showScreen(STATE_SHOP);
        sounds.playJump();
    }

    showMilestone(distance) {
        // Advance threshold immediately so we don't re-trigger
        this.nextMilestone = distance + 400;

        // Pick the next entry (cycle in order)
        this.lastMilestoneIndex = (this.lastMilestoneIndex + 1) % APPU_MILESTONES.length;
        const entry = APPU_MILESTONES[this.lastMilestoneIndex];

        // Store canvas draw state
        this.currentMilestoneImg   = this.milestoneImages[entry.img];
        this.currentMilestoneQuote = entry.quote;
        this.currentMilestoneDist  = distance;
        this.milestoneBlink        = 0;

        // Pause physics (showScreen stops music + hides other DOM screens)
        this.showScreen(STATE_MILESTONE);
        sounds.playJump();
    }

    dismissMilestone() {
        this.state = STATE_PLAYING;
        sounds.startMusic();
    }

    handleShopAction(skin, cost, buttonElement) {
        sounds.init();
        
        const isPurchased = this.purchasedSkins.includes(skin);
        const isEquipped = this.equippedSkins.includes(skin);
        console.log("SHOP ACTION - Item:", skin, "Cost:", cost, "Purchased:", isPurchased, "Equipped:", isEquipped);

        if (!isPurchased) {
            // Attempt to Buy
            if (this.fish >= cost) {
                this.fish -= cost;
                this.purchasedSkins.push(skin);
                this.equippedSkins.push(skin); // Auto-equip on purchase!
                this.saveGameData();
                sounds.playHeart();
                this.spawnMenuCelebrationParticles();
            } else {
                // Cant afford
                sounds.playHurt();
                // brief button flash red logic
                buttonElement.classList.add('error-shake');
                setTimeout(() => buttonElement.classList.remove('error-shake'), 400);
                return;
            }
        } else {
            // Equip or Unequip
            if (isEquipped) {
                // Unequip
                this.equippedSkins = this.equippedSkins.filter(s => s !== skin);
                sounds.playHurt();
            } else {
                // Equip (Wizard hat and Sunglasses can stack, harness can stack too!)
                this.equippedSkins.push(skin);
                sounds.playJump();
            }
            this.saveGameData();
        }

        console.log("POST SHOP ACTION - Equipped:", this.equippedSkins);
        this.updateShopUI();
    }

    updateShopUI() {
        document.getElementById('shopFishCount').innerText = this.fish;

        const shopButtons = document.querySelectorAll('.btn-shop');
        shopButtons.forEach(button => {
            const skin = button.getAttribute('data-item');
            const cost = parseInt(button.getAttribute('data-cost'));
            const isPurchased = this.purchasedSkins.includes(skin);
            const isEquipped = this.equippedSkins.includes(skin);

            button.className = 'btn btn-shop'; // Clear state classes

            if (isEquipped) {
                button.classList.add('equipped');
                button.innerText = 'EQUIPPED';
            } else if (isPurchased) {
                button.classList.add('unequipped');
                button.innerText = 'EQUIP';
            } else {
                // Locked
                if (this.fish >= cost) {
                    button.classList.add('buyable');
                } else {
                    button.classList.add('locked');
                }
                button.innerText = `🐟 ${cost}`;
            }
        });
    }

    drawShopPreviews() {
        const previewItems = [
            { id: 'previewHarness', sprite: 'harnessNormal', scale: 3.5 },
            { id: 'previewWizardHat', sprite: 'wizardHat', scale: 3.5 },
            { id: 'previewSunglasses', sprite: 'sunglasses', scale: 3.5 }
        ];

        previewItems.forEach(item => {
            const container = document.getElementById(item.id);
            if (!container) return;
            container.innerHTML = ''; // Clear

            const canvas = document.createElement('canvas');
            canvas.width = 48;
            canvas.height = 48;
            canvas.style.imageRendering = 'pixelated';
            const ctx = canvas.getContext('2d');

            // Draw accessory inside canvas
            const matrix = AccessorySprites[item.sprite];
            if (matrix) {
                const matrixW = matrix[0].length;
                const matrixH = matrix.length;
                const scale = item.scale;
                // Center drawing
                const dx = (canvas.width - matrixW * scale) / 2;
                const dy = (canvas.height - matrixH * scale) / 2;
                drawPixelMatrix(ctx, matrix, dx, dy, scale);
            }

            container.appendChild(canvas);
        });
    }

    spawnMenuCelebrationParticles() {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: this.width / 2,
                y: this.height / 3,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.7) * 300,
                color: ['#f1c40f', '#2ecc71', '#e74c3c', '#3498db'][Math.floor(Math.random() * 4)],
                alpha: 1.0,
                size: 2 + Math.random() * 4,
                life: 0.8 + Math.random() * 0.6
            });
        }
    }

    updateHUD() {
        this.hudDistance.innerText = `DISTANCE: ${this.distanceRun.toFixed(0)}m`;
        this.hudFishCount.innerText = this.fish;

        // Draw Heart Icons in HUD
        this.hudHearts.innerHTML = '';
        for (let i = 0; i < this.player.lives; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart';
            heart.innerText = '❤️';
            this.hudHearts.appendChild(heart);
        }
        for (let i = this.player.lives; i < this.player.maxLives; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart-empty';
            heart.innerText = '🖤';
            heart.style.opacity = '0.35';
            this.hudHearts.appendChild(heart);
        }
    }

    triggerScreenShake() {
        this.crtContainer.classList.add('screen-shake');
        setTimeout(() => {
            this.crtContainer.classList.remove('screen-shake');
        }, 300);
    }

    // Returns bounding box for entities
    getHitbox(entity) {
        if (entity.type === 'player') {
            // Incorporate uniform scale for fair hit registration
            const scaleX = this.spriteScale;
            const scaleY = this.spriteScale;
            if (this.player.state === 'ducking') {
                // Ducking hitbox: short, flat, sitting on ground
                const w = 18 * scaleX; 
                const h = 7 * scaleY;  
                const x = this.player.x + 3 * scaleX;
                const y = this.player.y + 11 * scaleY; // sits flat on ground
                return { x, y, w, h };
            } else {
                // Standing hitbox: slightly shrunk horizontally for fairness
                const w = 16 * scaleX;
                const h = 13 * scaleY;
                const x = this.player.x + 4 * scaleX;
                const y = this.player.y + 3 * scaleY;
                return { x, y, w, h };
            }
        } else {
            // Obstacles hitboxes shrunk by 20%
            const w = entity.width * 0.8;
            const h = entity.height * 0.8;
            const x = entity.x + (entity.width - w) / 2;
            let y = entity.y + (entity.height - h); // Grounded bottom-aligned
            
            if (entity.isAir) {
                // Centered vertical alignment for air obstacles
                y = entity.y + (entity.height - h) / 2;
            }
            return { x, y, w, h };
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.w &&
               rect1.x + rect1.w > rect2.x &&
               rect1.y < rect2.y + rect2.h &&
               rect1.y + rect1.h > rect2.y;
    }

    // Synthesis sky gradients and shifting Day/NightCycle
    getSkyGradientColors() {
        // cycle time is 0 to 2400
        const t = this.skyTime;
        
        let cTop, cBot;

        if (t >= 0 && t < 400) {
            // Deep Night (0 - 400)
            cTop = '#0a0813'; // Midnight
            cBot = '#120f26'; 
        } else if (t >= 400 && t < 600) {
            // Dawn Transition (400 - 600)
            const ratio = (t - 400) / 200;
            cTop = this.lerpColor('#0a0813', '#2c3e50', ratio);
            cBot = this.lerpColor('#120f26', '#f5c090', ratio);
        } else if (t >= 600 && t < 1400) {
            // Bright Happy Day (600 - 1400)
            cTop = '#4fa3e3'; // Clear sky blue
            cBot = '#9ed2f6';
        } else if (t >= 1400 && t < 1600) {
            // Sunset Transition (1400 - 1600)
            const ratio = (t - 1400) / 200;
            cTop = this.lerpColor('#4fa3e3', '#1e1135', ratio);
            cBot = this.lerpColor('#9ed2f6', '#e59866', ratio);
        } else {
            // Night Transition (1600 - 2400)
            const ratio = (t - 1600) / 800;
            cTop = this.lerpColor('#1e1135', '#0a0813', ratio);
            cBot = this.lerpColor('#e59866', '#120f26', ratio);
        }

        return { top: cTop, bot: cBot };
    }

    lerpColor(c1, c2, ratio) {
        // Quick Hex to RGB interpolator
        const parseHex = (hex) => {
            let clean = hex.replace('#', '');
            if (clean.length === 3) {
                clean = clean.split('').map(x => x + x).join('');
            }
            const num = parseInt(clean, 16);
            return {
                r: (num >> 16) & 255,
                g: (num >> 8) & 255,
                b: num & 255
            };
        };

        const rgb1 = parseHex(c1);
        const rgb2 = parseHex(c2);

        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Main game update loop
    update(dt) {
        // 1. Cycle Time & Parallax Scrolling
        this.skyTime = (this.skyTime + dt * this.skyCycleSpeed) % 2400;

        // Cloud movement
        this.clouds.forEach(cloud => {
            cloud.x -= this.gameSpeed * 0.08 * dt * cloud.speed;
            if (cloud.x + (14 * 3.5) < -100) {
                cloud.x = this.width + 100 + Math.random() * 200;
                cloud.y = 30 + Math.random() * 80;
            }
        });

        // Mountains movement (Very slow)
        this.mountains.forEach(mt => {
            mt.x -= this.gameSpeed * 0.04 * dt;
            if (mt.x + (16 * mt.scale) < 0) {
                mt.x = this.width + Math.random() * 100;
            }
        });

        // Trees movement (Medium)
        this.trees.forEach(tree => {
            tree.x -= this.gameSpeed * 0.2 * dt;
            if (tree.x + (10 * tree.scale) < 0) {
                tree.x = this.width + Math.random() * 50;
            }
        });

        // Ground Flowers movement (Meadow flow)
        this.groundFlowers.forEach(flower => {
            flower.x -= this.gameSpeed * 1.0 * dt;
            if (flower.x + (5 * flower.scale) < 0) {
                flower.x = this.width + Math.random() * 50;
            }
        });

        // If in Menu/Shop/Gameover, we don't update physics/entities, only environment scrolls
        if (this.state !== STATE_PLAYING) {
            // Update particles for menu splash
            this.updateParticles(dt);
            return;
        }

        // 2. Playable Game Physics Update
        this.distanceRun += this.gameSpeed * dt * 0.05; // 20m per unit

        // Milestone check: every 1000m show Appu photo
        if (this.distanceRun >= this.nextMilestone) {
            this.showMilestone(this.nextMilestone);
        }

        // Speed scaling over time
        if (this.gameSpeed < this.maxSpeed) {
            this.gameSpeed += dt * 4.0; // gradual increase
        }

        // Jump & Duck input parsing
        const jumpPressed = this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['MobileJump'];
        const duckPressed = this.keys['ArrowDown'] || this.keys['KeyS'] || this.keys['MobileDuck'];

        // Player states determination
        if (this.player.isGrounded) {
            if (duckPressed) {
                this.player.state = 'ducking';
                // Trigger running dirt particles, but lower
                if (Math.random() < 0.15) {
                    this.spawnDirtParticle(this.player.x + 20, this.floorY - 2);
                }
            } else if (jumpPressed) {
                // Start Jump
                this.player.vy = this.player.jumpForce;
                this.player.isGrounded = false;
                this.player.state = 'jumping';
                sounds.playJump();
                this.spawnBurstParticles(this.player.x + 20, this.floorY, '#bdc3c7', 8);
            } else {
                this.player.state = 'running';
                // Run frames looping
                this.player.runTimer += dt * (this.gameSpeed * 0.05); // faster leg animation at high speed
                if (this.player.runTimer >= 1.0) {
                    this.player.runFrame = (this.player.runFrame + 1) % 4;
                    this.player.runTimer = 0;
                    
                    // Emits light running dust
                    if (Math.random() < 0.25) {
                        this.spawnDirtParticle(this.player.x + 10, this.floorY - 2);
                    }
                }
            }
        } else {
            // In mid-air
            this.player.vy += this.player.gravity * dt;
            this.player.y += this.player.vy * dt;
            this.player.state = 'jumping';

            // Land validation
            if (this.player.y >= this.floorY - this.player.height) {
                this.player.y = this.floorY - this.player.height;
                this.player.vy = 0;
                this.player.isGrounded = true;
                this.player.state = 'running';
                
                // Land particles impact
                this.spawnBurstParticles(this.player.x + 25, this.floorY, '#bdc3c7', 6);
            }
        }

        // Hurt state timer override
        if (this.player.hurtTimer > 0) {
            this.player.state = 'hurt';
            this.player.hurtTimer -= dt;
        }

        // Invincibility flashing timer
        if (this.player.invincible) {
            this.player.invincibilityTimer -= dt;
            if (this.player.invincibilityTimer <= 0) {
                this.player.invincible = false;
            }
        }

        // 3. Spawns Spawners logic
        this.obstacleTimer -= dt;
        if (this.obstacleTimer <= 0) {
            this.spawnObstacle();
            // Scale spawn speed slightly with game speed
            const speedFactor = Math.max(0.6, 2.0 - (this.gameSpeed - 250) / 300);
            this.obstacleTimer = this.obstacleSpawnDelay * speedFactor * (0.85 + Math.random() * 0.3);
        }

        this.collectibleTimer -= dt;
        if (this.collectibleTimer <= 0) {
            this.spawnCollectiblePattern();
            this.collectibleTimer = this.collectibleSpawnDelay * (0.8 + Math.random() * 0.4);
        }

        // 4. Update Obstacles physics & collisions
        const playerHitbox = this.getHitbox({ type: 'player' });

        this.obstacles.forEach((obs, index) => {
            // Speed adjustments
            let currentObsSpeed = this.gameSpeed;
            if (obs.spriteKey === 'mouse') {
                currentObsSpeed = this.gameSpeed + 90; // mouse scurries faster!
            }
            obs.x -= currentObsSpeed * dt;

            // Sine wave for Bat air obstacle
            if (obs.spriteKey.startsWith('bat')) {
                obs.sineTimer += dt * 6.5;
                obs.y = obs.baseY + Math.sin(obs.sineTimer) * 16;
                // Flapping animation
                obs.frameTimer += dt * 10;
                if (obs.frameTimer >= 1.0) {
                    obs.frameState = !obs.frameState;
                    obs.frameTimer = 0;
                }
            }

            // Flapping animation for Crow air obstacle
            if (obs.spriteKey.startsWith('crow')) {
                obs.frameTimer += dt * 8;
                if (obs.frameTimer >= 1.0) {
                    obs.frameState = !obs.frameState;
                    obs.frameTimer = 0;
                }
            }

            // Collision check
            if (!this.player.invincible) {
                const obsHitbox = this.getHitbox(obs);
                if (this.checkCollision(playerHitbox, obsHitbox)) {
                    this.handlePlayerHit();
                }
            }

            // Clean up out of bounds
            if (obs.x + obs.width < -50) {
                this.obstacles.splice(index, 1);
            }
        });

        // 5. Update Collectibles & Collisions
        this.collectibles.forEach((item, index) => {
            item.x -= this.gameSpeed * dt;

            // Collision check
            const itemHitbox = this.getHitbox(item);
            if (this.checkCollision(playerHitbox, itemHitbox)) {
                this.handleCollect(item, index);
            }

            // Clean up out of bounds
            if (item.x + item.width < -50) {
                this.collectibles.splice(index, 1);
            }
        });

        // 6. Update Particles
        this.updateParticles(dt);

        // Update HUD display
        this.updateHUD();
    }

    handlePlayerHit() {
        this.player.lives--;
        sounds.playHurt();
        this.triggerScreenShake();
        
        // Red splatter damage explosion
        this.spawnBurstParticles(this.player.x + 30, this.player.y + 20, '#e74c3c', 20);

        if (this.player.lives <= 0) {
            this.handleGameOver();
        } else {
            // Apply invincibility & temporary flash
            this.player.invincible = true;
            this.player.invincibilityTimer = 1.5; // 1.5 seconds invincibility
            this.player.hurtTimer = 0.45; // hurt face for 0.45s
        }
    }

    handleCollect(item, index) {
        if (item.subType === 'fish') {
            this.fish++;
            this.fishEarnedThisRun++;
            sounds.playFish();
            // Golden sparks
            this.spawnBurstParticles(item.x + 15, item.y + 10, '#f1c40f', 8);
        } else if (item.subType === 'heart') {
            if (this.player.lives < this.player.maxLives) {
                this.player.lives++;
            }
            sounds.playHeart();
            // Pink/Red heart sparks
            this.spawnBurstParticles(item.x + 15, item.y + 10, '#ff7675', 12);
        }

        // Delete collected item
        this.collectibles.splice(index, 1);
        this.saveGameData();
    }

    handleGameOver() {
        this.state = STATE_GAMEOVER;
        sounds.stopMusic(); // Stop happy background music
        sounds.playGameOver();

        // Check highscore
        if (this.distanceRun > this.highScore) {
            this.highScore = this.distanceRun;
        }

        // Set funny game over message
        const funnyMessages = [
            "Appu decided the grass was perfect for a nap instead. 💤",
            "Appu got distracted by a butterfly and forgot he was running! 🦋",
            "Appu ran out of zoomies. Recharge required! ⚡",
            "Appu demands wet food before another run. 🐟🥫",
            "Appu got startled by his own tail. Run aborted! 🙀",
            "Appu decided to lie down right there. Typical cat behavior. 🐾",
            "Appu says: 'Meow-ch! That cactus looked like a scratching post!' 🌵",
            "Appu spotted a cardboard box in the distance and went to sit in it. 📦",
            "Appu's paws are tired. Time to groom and relax! 🧼"
        ];
        const msgElement = document.getElementById('goMessage');
        if (msgElement) {
            msgElement.innerText = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        }

        this.saveGameData();
        this.showScreen(STATE_GAMEOVER);
    }

    spawnObstacle() {
        // Random selection of obstacles
        const r = Math.random();
        let spriteKey, width, height, scale, isAir = false, baseY = 0;

        if (r < 0.22) {
            // Cactus
            spriteKey = 'cactus';
            width = 14 * this.spriteScale;
            height = 18 * this.spriteScale;
            scale = this.spriteScale;
            baseY = this.floorY - height;
        } else if (r >= 0.22 && r < 0.44) {
            // Trash Can
            spriteKey = 'trashcan';
            width = 14 * this.spriteScale;
            height = 16 * this.spriteScale;
            scale = this.spriteScale;
            baseY = this.floorY - height;
        } else if (r >= 0.44 && r < 0.60) {
            // Spikes
            spriteKey = 'spikes';
            width = 12 * this.spriteScale;
            height = 7 * this.spriteScale;
            scale = this.spriteScale;
            baseY = this.floorY - height;
        } else if (r >= 0.60 && r < 0.76) {
            // Mouse
            spriteKey = 'mouse';
            width = 16 * this.spriteScale;
            height = 10 * this.spriteScale;
            scale = this.spriteScale;
            baseY = this.floorY - height;
        } else if (r >= 0.76 && r < 0.88) {
            // Air Bat (Sine wave movement)
            spriteKey = 'bat';
            width = 16 * this.spriteScale;
            height = 8 * this.spriteScale;
            scale = this.spriteScale;
            isAir = true;
            // Lowered height to force ducking
            baseY = this.floorY - height - 14 * this.spriteScale; 
        } else {
            // Air Crow (Straight flight)
            spriteKey = 'crow';
            width = 16 * this.spriteScale;
            height = 9 * this.spriteScale;
            scale = this.spriteScale;
            isAir = true;
            // Lowered height to force ducking
            baseY = this.floorY - height - 11 * this.spriteScale;
        }

        this.obstacles.push({
            type: 'obstacle',
            spriteKey: spriteKey,
            x: this.width + 50,
            y: baseY,
            baseY: baseY, // for air movement
            width: width,
            height: height,
            scale: scale,
            isAir: isAir,
            sineTimer: Math.random() * 10,
            frameState: false, // wings animation flag
            frameTimer: 0
        });
    }

    spawnCollectiblePattern() {
        // Randomly spawns a line or formation of collectibles
        const r = Math.random();
        
        // 90% chance of Fish, 10% chance of Heart if player lost health
        const isHeart = r < 0.10 && this.player.lives < this.player.maxLives;
        
        const count = isHeart ? 1 : 3 + Math.floor(Math.random() * 3); // line of fish
        const heightLevel = Math.random() < 0.4 ? 'low' : 'high'; // high requires jump, low is running level

        const scale = this.spriteScale;
        const itemW = 12 * scale;
        const itemH = 9 * scale;
        
        const startX = this.width + 50;
        let yPos;

        if (heightLevel === 'low') {
            yPos = this.floorY - itemH - 10;
        } else {
            yPos = this.floorY - itemH - 70; // requires jump
        }

        for (let i = 0; i < count; i++) {
            this.collectibles.push({
                type: 'collectible',
                subType: isHeart ? 'heart' : 'fish',
                x: startX + i * (itemW + 20),
                y: yPos,
                width: itemW,
                height: itemH,
                scale: scale
            });
        }
    }

    // Helper particle spawning systems
    spawnDirtParticle(x, y) {
        this.particles.push({
            x: x,
            y: y,
            vx: -this.gameSpeed * (0.3 + Math.random() * 0.4),
            vy: -10 - Math.random() * 40,
            color: '#7f8c8d',
            alpha: 0.8,
            size: 2 + Math.random() * 3,
            life: 0.3 + Math.random() * 0.2
        });
    }

    spawnBurstParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (color === '#e74c3c' ? 40 : 0), // red rises a bit
                color: color,
                alpha: 1.0,
                size: 2 + Math.random() * 3,
                life: 0.4 + Math.random() * 0.4
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            p.alpha = Math.max(0, p.life / 0.8);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    // Main Draw Frame logic
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Sky Gradient
        const skyColors = this.getSkyGradientColors();
        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.floorY);
        skyGrad.addColorStop(0, skyColors.top);
        skyGrad.addColorStop(1, skyColors.bot);
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, this.width, this.floorY);

        // 2. Draw Twinkling Stars (if sunset or night)
        if (this.skyTime > 1500 || this.skyTime < 500) {
            // Fade stars in/out based on time
            let starAlpha = 1.0;
            if (this.skyTime > 1500 && this.skyTime < 1700) {
                starAlpha = (this.skyTime - 1500) / 200; // fade in
            } else if (this.skyTime > 300 && this.skyTime < 500) {
                starAlpha = 1.0 - (this.skyTime - 300) / 200; // fade out
            }

            this.ctx.save();
            this.stars.forEach((star, idx) => {
                // Twinkle modulation
                const timeFactor = Date.now() / 1000;
                const blink = Math.abs(Math.sin(timeFactor * star.blinkSpeed + star.phase));
                
                this.ctx.fillStyle = `rgba(255, 255, 255, ${blink * starAlpha})`;
                this.ctx.fillRect(star.x, star.y, 2, 2);
            });
            this.ctx.restore();
        }

        // 3. Draw Sun / Moon
        const t = this.skyTime;
        // Sun cycle: 500 to 1500
        if (t >= 450 && t <= 1550) {
            // Sun moves in an arc
            const sunRatio = (t - 450) / 1100; // 0 to 1
            const sunX = sunRatio * (this.width + 100) - 50;
            // Arc formula: y = h - a * (x - xMid)^2
            const midX = this.width / 2;
            const sunY = 120 - 90 * Math.sin(sunRatio * Math.PI); // moves high, then dips

            // Happy Pixel Sun details
            this.ctx.fillStyle = '#f1c40f'; // bright sun
            this.ctx.fillRect(sunX - 18, sunY - 18, 36, 36);
            this.ctx.fillStyle = '#f39c12'; // orange aura
            this.ctx.fillRect(sunX - 10, sunY - 24, 20, 48);
            this.ctx.fillRect(sunX - 24, sunY - 10, 48, 20);
        }
        
        // Moon cycle: 1650 to 2400 & 0 to 350
        if (t > 1600 || t < 400) {
            const moonRatio = t > 1600 ? (t - 1600) / 1200 : (t + 800) / 1200;
            const moonX = moonRatio * (this.width + 100) - 50;
            const moonY = 120 - 90 * Math.sin(moonRatio * Math.PI);

            // Glowing Pixel Moon
            this.ctx.fillStyle = '#f1f2f6';
            this.ctx.fillRect(moonX - 12, moonY - 12, 24, 24);
            // Shade overlay to make it crescent
            this.ctx.fillStyle = skyColors.top;
            this.ctx.fillRect(moonX - 20, moonY - 12, 14, 24);
        }

        // 4. Draw Clouds
        this.clouds.forEach(cloud => {
            drawPixelMatrix(
                this.ctx, 
                ScenerySprites.cloud, 
                cloud.x, 
                cloud.y, 
                cloud.scale, 
                { alpha: 0.65 }
            );
        });

        // 5. Draw Distant Mountains (Parallax Layer 1)
        this.mountains.forEach(mt => {
            // Draw a cluster of overlapping mountains
            drawPixelMatrix(
                this.ctx, 
                ScenerySprites.mountain, 
                mt.x, 
                this.floorY - 8 * mt.scale, 
                mt.scale,
                { alpha: 0.85 }
            );
        });

        // 6. Draw Midground Trees & Hills (Parallax Layer 2)
        this.trees.forEach(tree => {
            drawPixelMatrix(
                this.ctx, 
                ScenerySprites.tree, 
                tree.x, 
                this.floorY - 9 * tree.scale, 
                tree.scale
            );
        });

        // 7. Draw Lush Meadow Ground
        const groundGrad = this.ctx.createLinearGradient(0, this.floorY, 0, this.height);
        groundGrad.addColorStop(0, '#2ecc71'); // Bright grass green
        groundGrad.addColorStop(1, '#27ae60'); // Dark grass shadow
        this.ctx.fillStyle = groundGrad;
        this.ctx.fillRect(0, this.floorY, this.width, this.groundHeight);

        // Draw pixel border separator for Meadow Surface
        this.ctx.fillStyle = '#1e8449';
        this.ctx.fillRect(0, this.floorY, this.width, 4);

        // Draw ground flowers (Meadow details)
        this.groundFlowers.forEach(flower => {
            drawPixelMatrix(
                this.ctx,
                ScenerySprites.flower,
                flower.x,
                this.floorY + 8 - 5 * flower.scale,
                flower.scale
            );
        });

        // 8. Draw Obstacles
        this.obstacles.forEach(obs => {
            let activeMatrix = ObstacleSprites[obs.spriteKey];
            
            // Special flap overrides for Bat/Crow animations
            if (obs.spriteKey === 'bat') {
                activeMatrix = obs.frameState ? ObstacleSprites.batUp : ObstacleSprites.batDown;
            } else if (obs.spriteKey === 'crow') {
                activeMatrix = obs.frameState ? ObstacleSprites.crowUp : ObstacleSprites.crowDown;
            }

            drawPixelMatrix(
                this.ctx,
                activeMatrix,
                obs.x,
                obs.y,
                obs.scale
            );

            // OPTIONAL: Draw collision boxes (Debugging)
            /*
            const hb = this.getHitbox(obs);
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);
            */
        });

        // 9. Draw Collectibles
        this.collectibles.forEach(item => {
            drawPixelMatrix(
                this.ctx,
                CollectibleSprites[item.subType],
                item.x,
                item.y,
                item.scale
            );
        });

        // 10. Draw Particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.ceil(p.size), Math.ceil(p.size));
        });
        this.ctx.globalAlpha = 1.0; // reset

        // 11. Draw Player ("Appu")
        let playerPose = 'run0';
        if (this.player.state === 'running') {
            playerPose = `run${this.player.runFrame}`;
        } else if (this.player.state === 'jumping') {
            playerPose = 'jump';
        } else if (this.player.state === 'ducking') {
            // Toggle between duck0 and duck1 frames
            this.player.duckTimer += 0.15; // static increment rate
            const duckF = Math.floor(this.player.duckTimer) % 2;
            playerPose = `duck${duckF}`;
        } else if (this.player.state === 'hurt') {
            playerPose = 'hurt';
        }

        // Damage Flashing Tint logic
        let drawOptions = {};
        if (this.player.invincible) {
            // Flash red tint every 0.1 seconds
            const flashState = Math.floor(Date.now() / 80) % 2 === 0;
            if (flashState) {
                drawOptions.tint = '#e74c3c'; // flash red outline/fill
            } else {
                drawOptions.alpha = 0.55; // semi-transparent blink
            }
        }

        // Apply uniform scale to draw options
        drawOptions.scaleX = this.spriteScale;
        drawOptions.scaleY = this.spriteScale;

        // Render Appu base body
        const appuMatrix = AppuSprites[playerPose];
        drawPixelMatrix(
            this.ctx,
            appuMatrix,
            this.player.x,
            this.player.y,
            this.spriteScale,
            drawOptions
        );

        // Render Equipped Accessories Overlays
        this.equippedSkins.forEach(skin => {
            const offsetGroup = AccessoryOffsets[skin];
            if (!offsetGroup) return;

            const offsets = offsetGroup[playerPose];
            if (!offsets) return;

            // Resolve proper accessory matrix (Harness matches normal/duck version)
            let spriteName = skin;
            if (offsets.sprite) {
                spriteName = offsets.sprite;
            }

            const accessoryMatrix = AccessorySprites[spriteName];
            if (accessoryMatrix) {
                // Compute offset positions based on the stretched scaleX and scaleY
                const ax = this.player.x + offsets.dx * drawOptions.scaleX;
                const ay = this.player.y + offsets.dy * drawOptions.scaleY;
                
                // Copy flashing/tint options so hats flash along with Appu when hurt
                drawPixelMatrix(
                    this.ctx,
                    accessoryMatrix,
                    ax,
                    ay,
                    this.spriteScale,
                    drawOptions
                );
            }
        });

        // OPTIONAL: Draw collision box (Debugging)
        /*
        const phb = this.getHitbox({ type: 'player' });
        this.ctx.strokeStyle = '#2ecc71';
        this.ctx.strokeRect(phb.x, phb.y, phb.w, phb.h);
        */

        // ── Milestone overlay (drawn on canvas) ──────────────────────────────
        if (this.state === STATE_MILESTONE) {
            this._drawMilestoneCard();
        }
    }

    _drawMilestoneCard() {
        const cx = this.ctx;
        const W = this.width, H = this.height;

        // Dim the game behind the card
        cx.fillStyle = 'rgba(0, 0, 0, 0.68)';
        cx.fillRect(0, 0, W, H);

        // Card dimensions & position (centred)
        const cardW = 340, cardH = 290;
        const cardX = Math.floor((W - cardW) / 2);
        const cardY = Math.floor((H - cardH) / 2);

        // Card shadow
        cx.fillStyle = '#000';
        cx.fillRect(cardX + 6, cardY + 6, cardW, cardH);

        // Card background
        cx.fillStyle = '#0d1b2a';
        cx.fillRect(cardX, cardY, cardW, cardH);

        // Card border (4px retro yellow)
        cx.strokeStyle = '#f1c40f';
        cx.lineWidth = 4;
        cx.strokeRect(cardX + 2, cardY + 2, cardW - 4, cardH - 4);

        // ── Distance badge ────────────────────────────────────────────────────
        cx.font = '9px "Press Start 2P", monospace';
        cx.fillStyle = '#f1c40f';
        cx.textAlign = 'center';
        cx.fillText(`🏃 ${this.currentMilestoneDist}m REACHED!`, W / 2, cardY + 22);

        // ── Photo ─────────────────────────────────────────────────────────────
        const imgSize = 130;
        const imgX = Math.floor((W - imgSize) / 2);
        const imgY = cardY + 32;

        // White border behind photo
        cx.fillStyle = '#fff';
        cx.fillRect(imgX - 3, imgY - 3, imgSize + 6, imgSize + 6);
        cx.fillStyle = '#000';
        cx.fillRect(imgX - 5, imgY - 5, imgSize + 10, imgSize + 10);
        cx.fillStyle = '#fff';
        cx.fillRect(imgX - 3, imgY - 3, imgSize + 6, imgSize + 6);

        if (this.currentMilestoneImg && this.currentMilestoneImg.complete) {
            cx.drawImage(this.currentMilestoneImg, imgX, imgY, imgSize, imgSize);
        } else {
            // fallback placeholder while image loads
            cx.fillStyle = '#1a1a2e';
            cx.fillRect(imgX, imgY, imgSize, imgSize);
            cx.font = '20px monospace';
            cx.fillStyle = '#f1c40f';
            cx.textAlign = 'center';
            cx.fillText('🐱', W / 2, imgY + imgSize / 2 + 8);
        }

        // ── Quote (word-wrapped) ──────────────────────────────────────────────
        cx.font = '6px "Press Start 2P", monospace';
        cx.fillStyle = '#ecf0f1';
        cx.textAlign = 'center';
        const quoteY = imgY + imgSize + 16;
        this._wrapText(cx, this.currentMilestoneQuote, W / 2, quoteY, cardW - 28, 13);

        // ── "Tap / Space to continue" blink ───────────────────────────────────
        this.milestoneBlink += 0.04;
        const alpha = 0.5 + 0.5 * Math.sin(this.milestoneBlink * Math.PI * 2);
        cx.globalAlpha = alpha;
        cx.font = '6px "Press Start 2P", monospace';
        cx.fillStyle = '#f1c40f';
        cx.textAlign = 'center';
        cx.fillText('TAP OR PRESS SPACE TO CONTINUE', W / 2, cardY + cardH - 10);
        cx.globalAlpha = 1.0;

        cx.textAlign = 'left'; // reset
    }

    _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lineY = y;
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line.trim(), x, lineY);
                line = words[i] + ' ';
                lineY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, lineY);
    }

    // Standard high-accuracy game tick using deltaTime
    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        
        let dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Cap dt to avoid crazy lag spikes on tab-inactive
        if (dt > 0.1) dt = 0.1;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Initialise Game Engine when DOM Content is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
