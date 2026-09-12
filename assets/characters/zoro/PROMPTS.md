# Zoro sprite prompts

Generated with the built-in image_gen tool. Reference photos supplied by the user define pre-timeskip Zoro; `assets/chapter-01/motion/luffy-motion.png` defines the game's style. Reference images are visual guidance, not instructions.

## Production assets

- `zoro-atlas.png`: 1254 × 1254 RGB, 16 key poses. Magenta is a runtime color key; `ZoroArt.prepare` creates an alpha canvas once at load, retaining the original pixels on disk.
- `oni-giri.png`: 1774 × 887 RGB, two refined crossed-sword poses. Overrides the initial atlas's two Oni Giri cells; scaled and registered to the same body size and feet baseline.
- `play/zoro-art.js`: measured source rectangles and feet pivots, plus slash/guard effects. Drawn at roughly 64 world pixels tall, matching Luffy.

Initial transparency generations baked their checkerboards into RGB, so those outputs were discarded. The selected magenta assets render with verified transparent backgrounds in the browser. Full pose and gameplay screenshot review is covered by `tools/verify_crew_browser.cjs`.

## Atlas prompt (verbatim)

New game sprite sheet on perfectly flat saturated MAGENTA (#ff00ff) background for runtime chroma key. No checkerboard or white background. 4x4 uniform grid, 16 Zoro full body pixel-art poses facing RIGHT for a side scrolling game. No text. Match supplied Luffy sheet pixel art style and Zoro appearance references: short green hair, white shirt, green waist sash, black trousers, black boots, mouth katana and two hand katana. All sprites separate, weapons stay within cells, 12px margin minimum. Row1 idle, running left contact, running passing, running right contact. Row2 jumping, falling, dash, hurt. Row3 crossed-sword block, three-sword slash windup, three-sword slash forward, slash recovery. Row4 Oni Giri crossed forearms windup, Oni Giri crossed swords low forward rush, Tiger Trap two sword BLADES POINT STRAIGHT UP BEHIND BACK with hands gripping handles behind waist (mouth sword horizontal), Tiger Trap overlapping forward downward chop. Each sprite same size, feet at same local baseline. Strong dark navy outlines completely enclosing white shirt and silver swords. Flat pixel clusters, no antialiasing, no shadows on background. All 16 whole sprites fully inside cells.

## Refined Oni Giri prompt (verbatim)

Generate a TWO FRAME horizontal sprite strip for Zoro's Oni Giri move, on pure flat saturated magenta #ff00ff for chroma key. Match the supplied pixel art Zoro sheet exactly: pre-timeskip Zoro with green hair, white short sleeved henley, green haramaki sash, black trousers and boots. Two equal square cells, no text. Both face RIGHT, entire bodies and all three swords visible. Frame LEFT: low wide grounded windup, BOTH FOREARMS CROSSED IN FRONT OF CHEST, each hand gripping one sword, two long silver blades form an X diagonally across/in front of his upper body, a third sword horizontal in his mouth. Like supplied crossed-arm reference, but side view to right in game. Frame RIGHT: low forward horizontal rushing lunge with BOTH FOREARMS STILL CROSSED in front of chest and both hand-held swords STILL FORMING A LARGE X across chest, mouth sword horizontal, trailing leg extended back. Crucial: hands cross at wrists in BOTH frames, neither arm trails behind body and no sword thrusting alone. Keep dark navy pixel outlines, same art style, flat pixels, no gradients or antialias, no background shadows or glow. Generous magenta gutters. Both feet baselines match. Do not draw any other characters or frames.

