/**
 * Appu's Meadow Run - Sprites and Drawing Logic
 * Retro 8-bit side-scrolling runner game.
 */

// Color Palette mapping characters to Hex codes
const SpritesPalette = {
    // Transparency
    '.': 'transparent',
    ' ': 'transparent',

    // Outlines & Core Details
    'k': '#111111', // Black outline
    'd': '#3a3a3a', // Dark Gray
    'g': '#7f8c8d', // Medium Gray
    's': '#bdc3c7', // Light Gray
    'w': '#ffffff', // Pure White
    'W': '#ffffff', // Pure White (Uppercase)
    'i': '#ecf0f1', // Off-White / Shading

    // Appu's Colors (Based on User's Photos)
    'O': '#e67e22', // Bright Orange / Ginger
    'S': '#d35400', // Shadow Orange / Rust
    'P': '#ff80ab', // Pink (nose, ears, paw pads)
    'G': '#4caf50', // Hazel / Green (eyes)

    // Accessories
    'H': '#fbfcfc', // Cream Beige (Harness straps)
    'h': '#ebd6b3', // Dark beige shadow (Harness)
    'B': '#8e44ad', // Magic Purple (Wizard Hat)
    'Y': '#f1c40f', // Star Yellow (Wizard Hat detail, Gold Fish)
    'D': '#1a252f', // Sunglasses Dark lens
    'L': '#ffffff', // Sunglasses white reflection

    // Obstacles
    'V': '#27ae60', // Cactus Green
    'E': '#1e8449', // Cactus Dark Green
    'R': '#c0392b', // Spikes / Danger Red
    't': '#95a5a6', // Trash can gray
    'T': '#7f8c8d', // Trash can dark gray
    'b': '#5d4037', // Bat body brown
    'q': '#2c3e50', // Crow body black/dark blue
    'z': '#f39c12', // Beak/Detail Yellow

    // Collectibles & Scenery
    'r': '#e74c3c', // Heart Red
    'p': '#ff7675', // Light Heart Pink
    'v': '#2ecc71', // Meadow Green
    'm': '#34495e', // Distant Mountain Blue-Gray
    'n': '#2c3e50', // Shadow Mountain Blue-Gray
    'c': '#e1f5fe'  // Cloud light blue-white
};

/// Appu's Poses (24x18 grid)
// Body runs sideways, Head turns front to face the player/camera (Matching user's photos)
const AppuSprites = {
    // Run Frame 0
    run0: [
        "........................",
        "........................",
        "......kk................",
        "....kkWWk.......kk..k...",
        "...kWOOk.......kPk.kPk..",
        "...kOOk.......kOPk.kOPk.",
        "....kOk.....kkkOkkkOOk..",
        "....kOk....kOOOOOOWWOk..",
        "....kOkkkkkOOOOOOGWWPk..",
        "....kOkWWWWWWWWWWWWWk...",
        "....kOkWWWWOWWWWWWWk....",
        "....kOkWWWOOOWWWWWWk....",
        "....kOkiiisSSSSiiiiik...",
        "....kSkkkkkkkkkkkkk.....",
        ".....kWik........kik....",
        ".....kWik........kik....",
        ".....kWWk........kWk....",
        "......kk..........k....."
    ],

    // Run Frame 1 (Bobbing down 1px, legs crossing)
    run1: [
        "........................",
        "........................",
        "........................",
        "......kk................",
        "....kkWWk.......kk..k...",
        "...kWOOk.......kPk.kPk..",
        "...kOOk.......kOPk.kOPk.",
        "....kOk.....kkkOkkkOOk..",
        "....kOk....kOOOOOOWWOk..",
        "....kOkkkkkOOOOOOGWWPk..",
        "....kOkWWWWWWWWWWWWWk...",
        "....kOkWWWWOWWWWWWWk....",
        "....kOkWWWOOOWWWWWWk....",
        "....kOkiiisSSSSiiiiik...",
        "....kSkkkkkkkkkkkkk.....",
        ".......kWikkkik.........",
        ".......kWWk.kWk.........",
        "........kk...k.........."
    ],

    // Run Frame 2 (Legs extended opposite)
    run2: [
        "........................",
        "........................",
        "......kk................",
        "....kkWWk.......kk..k...",
        "...kWOOk.......kPk.kPk..",
        "...kOOk.......kOPk.kOPk.",
        "....kOk.....kkkOkkkOOk..",
        "....kOk....kOOOOOOWWOk..",
        "....kOkkkkkOOOOOOGWWPk..",
        "....kOkWWWWWWWWWWWWWk...",
        "....kOkWWWWOWWWWWWWk....",
        "....kOkWWWOOOWWWWWWk....",
        "....kOkiiisSSSSiiiiik...",
        "....kSkkkkkkkkkkkkk.....",
        "......kWik......kik.....",
        ".....kWik........kik....",
        "....kWWk..........kWk...",
        ".....kk............k...."
    ],

    // Run Frame 3 (Bobbing down 1px, legs crossing again)
    run3: [
        "........................",
        "........................",
        "........................",
        "......kk................",
        "....kkWWk.......kk..k...",
        "...kWOOk.......kPk.kPk..",
        "...kOOk.......kOPk.kOPk.",
        "....kOk.....kkkOkkkOOk..",
        "....kOk....kOOOOOOWWOk..",
        "....kOkkkkkOOOOOOGWWPk..",
        "....kOkWWWWWWWWWWWWWk...",
        "....kOkWWWWOWWWWWWWk....",
        "....kOkWWWOOOWWWWWWk....",
        "....kOkiiisSSSSiiiiik...",
        "....kSkkkkkkkkkkkkk.....",
        ".......kWikkkik.........",
        ".......kWWk.kWk.........",
        "........kk...k.........."
    ],

    // Jump Frame (Body tilted, head facing forward)
    jump: [
        "........................",
        "......kk................",
        "....kkWWk.......kk..k...",
        "...kWOOk.......kPk.kPk..",
        "...kOOk.......kOPk.kOPk.",
        "....kOk.....kkkOkkkOOk..",
        "....kOk....kOOOOOOWWOk..",
        "....kOkkkkkOOOOOOGWWPk..",
        "....kOkWWWWWWWWWWWWWk...",
        "....kOkWWWWOWWWWWWWk....",
        "....kOkWWWOOOWWWWWWk....",
        "....kOkiiisSSSSiiiiik...",
        "....kSkkkkkkkkkkkkk.....",
        ".....kWik........kik....",
        "......kWWk.......kWk....",
        ".......kk.........k.....",
        "........................",
        "........................"
    ],

    // Duck Frame 0 (Squished down)
    duck0: [
        "........................",
        "........................",
        "........................",
        "........................",
        "........................",
        "........................",
        "................kk..k...",
        "...............kPk.kPk..",
        "......kk......kOPk.kOPk.",
        "....kkWWk...kkkOkkkOOk..",
        "...kWOOk...kOOOOOOWWOk..",
        "...kOOk....kOOOOOOGWWPk.",
        "....kOkkkkkWWWWWWWWWWk..",
        "....kOkWWWWOWWWWWWWWk...",
        "....kOkWWWOOOWWWWWWk....",
        "....kOkiisSSSSiiiiik....",
        ".....kWWk......kWk......",
        "......kk........k......."
    ],

    // Duck Frame 1 (Bobbing down)
    duck1: [
        "........................",
        "........................",
        "........................",
        "........................",
        "........................",
        "........................",
        "........................",
        "................kk..k...",
        "......kk.......kPk.kPk..",
        "....kkWWk.....kOPk.kOPk.",
        "...kWOOk....kkkOkkkOOk..",
        "...kOOk....kOOOOOOWWOk..",
        "....kOkkkkkOOOOOOGWWPk..",
        "....kOkWWWWWWWWWWWWWk...",
        "....kOkWWWWOWWWWWWWk....",
        "....kOkWWWOOOWWWWWWk....",
        "....kOkiisSSSSiiiiik....",
        ".....kWWk......kWk......",
        "......kk........k......."
    ],

    // Hurt Frame (Startled expression, surprise eye)
    hurt: [
        "........................",
        "......kkkk..............",
        "....kkWWWWk.............",
        "...kWOOOOOk.....kk..k...",
        "...kOOOOOOk....kPk.kPk..",
        "...kOOOOOk....kOPk.kOPk.",
        "....kOOkkkkkkkkOkkkOOk..",
        "....kOOOOOOOOOOOOOOWk...",
        "....kOOOOOOOOOOOOOGWWPk.",
        "....kOkkWWWWWWWWWWWWk...",
        "....kOkkWWWWOWWWWWWWk...",
        "....kOkkWWWOOOWWWWWWk...",
        "....kOkkiiisSSSSiiiiik..",
        "....kSkkkkkkkkkkkkk.....",
        ".....kWik........kik....",
        ".....kWik........kik....",
        ".....kWWk........kWk....",
        "......kk..........k....."
    ]
};

// Ground Obstacles
const ObstacleSprites = {
    // Pixel Mouse (Ground - moves fast)
    mouse: [
        "......kk........",
        ".....kWWk.......",
        "..kk.kWWk.k.....",
        ".kWWk.kk.kPk....",
        "kWWWWkkkkWWk....",
        "kWWWWWWWWWWk....",
        "kWWWWWWWWWWk....",
        ".kWWWWWWWWk.....",
        "..kWWkkWWk......",
        "...kk..kk......."
    ],

    // Cactus (Ground - simple jump obstacle)
    cactus: [
        "......kk......",
        ".....kVVk.....",
        ".....kVVk.kk..",
        "..kk.kVVkkVVk.",
        ".kVVkkVVkkVVk.",
        ".kVVkkVVkkVVk.",
        ".kVVkkVVkkVVk.",
        ".kVVkkVVkkVVk.",
        "..kVVVVVVVVk..",
        "...kkkVVkkk...",
        ".....kVVk.....",
        ".....kVVk.....",
        ".....kVVk.....",
        ".....kVVk.....",
        ".....kVVk.....",
        ".....kVVk.....",
        "....kkVVkk....",
        "....kkkkkk...."
    ],

    // Trash Can (Ground - medium block)
    trashcan: [
        "....kkkkkk....",
        "...ktWWWWtk...",
        "..kttttttttk..",
        "..ktTttTttTk..",
        "..kttttttttk..",
        "...kTTTTTTk...",
        "...ktTttTtk...",
        "...ktTttTtk...",
        "...ktTttTtk...",
        "...ktTttTtk...",
        "...ktTttTtk...",
        "...ktTttTtk...",
        "...ktTttTtk...",
        "...ktTttTtk...",
        "...kTTTTTTk...",
        "....kkkkkk...."
    ],

    // Spikes (Ground - flat spikes)
    spikes: [
        "...k.k.k.k...",
        "..kRkRkRkRk..",
        ".kRRkRRkRRkR.",
        "kRRRkRRRkRRRk",
        "kRRRkRRRkRRRk",
        "kRRRkRRRkRRRk",
        "kkkkkkkkkkkkk"
    ],

    // Bat (Air - wings up)
    batUp: [
        "k.k.........k.k.",
        "kbk.........kbk.",
        "kbbkk.....kkbbk.",
        "kbbbbkkkkkbbbbk.",
        ".kbbbbbbbbbbbk..",
        "..kbbkkkkkbbk...",
        "...kbk.k.kbk....",
        "....kk...kk....."
    ],

    // Bat (Air - wings down)
    batDown: [
        "....kk...kk.....",
        "...kbkkkkkbk....",
        "..kbbbbbbbbbk...",
        ".kbbbbbbbbbbbk..",
        "kbbbbkkkkkbbbbk.",
        "kbbkk.....kkbbk.",
        "kbk.........kbk.",
        "k.k.........k.k."
    ],

    // Crow (Air - wings flap up)
    crowUp: [
        "......kkk.......",
        "....kkqqqkk.....",
        "..kkqqqqqqqkk...",
        "kkqqqqqqqqqqqkk.",
        "kqqqkkqqqkkqqzk.",
        "kkk..kqqqk.kzzk.",
        ".....kqqqk..kk..",
        "......kqk.......",
        "......kk........"
    ],

    // Crow (Air - wings flap down)
    crowDown: [
        "......kk........",
        "......kqk.......",
        ".....kqqqk..kk..",
        "kkk..kqqqk.kzzk.",
        "kqqqkkqqqkkqqzk.",
        "kkqqqqqqqqqqqkk.",
        "..kkqqqqqqqkk...",
        "....kkqqqkk.....",
        "......kkk......."
    ]
};

// Collectibles
const CollectibleSprites = {
    // Retro Heart (Heals player)
    heart: [
        "..kkk...kkk..",
        ".krrrk.krrrk.",
        "krrrrrkrrrrrk",
        "krrprrrrrrrrk",
        "krrrrrrrrrrrk",
        ".krrrrrrrrrk.",
        "..krrrrrrrk..",
        "...krrrrrk...",
        "....krrrk....",
        ".....krk.....",
        "......k......"
    ],

    // Gold Fish (Currency)
    fish: [
        "....kkkk....",
        "..kkYYYYkk..",
        ".kYYYYYYYYk.",
        "kYYYYYYYYYk.",
        "kYYYkYYYYkk.",
        "kYYYYYYYYYkk",
        ".kYYYYYYYYk.",
        "..kkYYYYkk..",
        "....kkkk...."
    ]
};

// Accessories (Drawn over Appu's sprite dynamically)
const AccessorySprites = {
    // Wizard Hat (Sitting on head)
    wizardHat: [
        ".....kk.....",
        "....kBBk....",
        "...kBYYBk...",
        "...kBBBBk...",
        "..kBBBBBBk..",
        ".kBBBBBBBBk.",
        "kBBBBBBBBBBk",
        "kkkkkkkkkkkk"
    ],

    // Sunglasses (Cool black shades)
    sunglasses: [
        "kkkkkkk.....",
        "......kDLk..",
        ".......kk..."
    ],

    // Harness Normal (Equipped torso straps)
    harnessNormal: [
        "...HHHH.....",
        "..H..HH.....",
        "..HHHHH.....",
        "..H..HH.....",
        "..H..HH....."
    ],

    // Harness Duck (Slightly squished version for ducking frames)
    harnessDuck: [
        "...HHHH.....",
        "..H..HH.....",
        "..HHHHH.....",
        "..H..HH....."
    ]
};

// Accessories offsets per Appu frame (in grid units).
// Offsets are { dx, dy } relative to Appu's top-left pixel.
const AccessoryOffsets = {
    wizardHat: {
        run0: { dx: 11, dy: -1 },
        run1: { dx: 11, dy: 0 },
        run2: { dx: 11, dy: -1 },
        run3: { dx: 11, dy: 0 },
        jump: { dx: 11, dy: -2 },
        duck0: { dx: 10, dy: 2 },
        duck1: { dx: 11, dy: 3 },
        hurt: { dx: 12, dy: -1 }
    },
    sunglasses: {
        run0: { dx: 10, dy: 7 },
        run1: { dx: 10, dy: 8 },
        run2: { dx: 10, dy: 7 },
        run3: { dx: 10, dy: 8 },
        jump: { dx: 10, dy: 6 },
        duck0: { dx: 11, dy: 10 },
        duck1: { dx: 10, dy: 11 },
        hurt: { dx: 11, dy: 7 }
    },
    harness: {
        run0: { dx: 7, dy: 9, sprite: 'harnessNormal' },
        run1: { dx: 7, dy: 10, sprite: 'harnessNormal' },
        run2: { dx: 7, dy: 9, sprite: 'harnessNormal' },
        run3: { dx: 7, dy: 10, sprite: 'harnessNormal' },
        jump: { dx: 7, dy: 8, sprite: 'harnessNormal' },
        duck0: { dx: 7, dy: 12, sprite: 'harnessDuck' },
        duck1: { dx: 7, dy: 13, sprite: 'harnessDuck' },
        hurt: { dx: 7, dy: 9, sprite: 'harnessNormal' }
    }
};

// Scenery elements for building parallax backgrounds
const ScenerySprites = {
    // A single mountain peak (drawn using tiles)
    mountain: [
        ".......ww.......",
        "......wmmw......",
        ".....wmmmmw.....",
        "....wmnnnnmw....",
        "...wmnnnnnnmw...",
        "..wmnnnnnnnnmw..",
        ".wmnnnnnnnnnnmw.",
        "wmnnnnnnnnnnnnmw"
    ],

    // Pine Tree
    tree: [
        "....vv....",
        "...vvvv...",
        "..vvvvvv..",
        "..vvvvvv..",
        ".vvvvvvvv.",
        "vvvvvvvvvv",
        "vvvvvvvvvv",
        "...kkk....",
        "...kkk...."
    ],

    // Happy Cloud
    cloud: [
        "....ccccc....",
        "..ccccccccc..",
        ".cccccccccccc.",
        "cccccccccccccc",
        "cccccccccccccc",
        ".cccccccccccc."
    ],

    // Little Flower (adds happiness to meadows!)
    flower: [
        "..R..",
        ".RYR.",
        "..R..",
        "..v..",
        ".vvv."
    ]
};

/**
 * Custom function to render 2D pixel matrices onto canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx - Target 2D rendering context
 * @param {Array<string>} matrix - 2D grid array of single-character strings
 * @param {number} x - X coordinate to draw at
 * @param {number} y - Y coordinate to draw at
 * @param {number} scale - Drawing scale (pixel size multiplier)
 * @param {Object} options - Custom render settings (alpha, flipX, tint, flash)
 */
function drawPixelMatrix(ctx, matrix, x, y, scale, options = {}) {
    if (!matrix || matrix.length === 0) return;

    const numRows = matrix.length;
    const numCols = matrix[0].length;

    const flipX = !!options.flipX;
    const alpha = options.alpha !== undefined ? options.alpha : 1.0;
    const tint = options.tint || null; // Force color overlay

    // Determine horizontal and vertical scale overrides
    const scaleX = options.scaleX !== undefined ? options.scaleX : scale;
    const scaleY = options.scaleY !== undefined ? options.scaleY : scale;

    ctx.save();
    ctx.globalAlpha = alpha;

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            const char = matrix[r][c];
            if (char === '.' || char === ' ') continue; // Transparent

            let color = SpritesPalette[char] || '#ffffff';

            if (tint) {
                // Ignore black outlines or keep outlines black, flash color overlay
                if (char !== 'k') {
                    color = tint;
                }
            }

            ctx.fillStyle = color;

            // Calculate pixel position with flipping option and separate scales
            const targetCol = flipX ? (numCols - 1 - c) : c;
            const px = x + targetCol * scaleX;
            const py = y + r * scaleY;

            ctx.fillRect(
                Math.floor(px), 
                Math.floor(py), 
                Math.ceil(scaleX), 
                Math.ceil(scaleY)
            );
        }
    }

    ctx.restore();
}
