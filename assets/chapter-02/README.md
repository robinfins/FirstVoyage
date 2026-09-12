# Chapter 02 · Syrup Village

Next planned chapter after Buggy: woodland approach, village rooftops, mansion gates, then Captain Kuro. Asset source pack; not yet wired into the playable route.

## New artwork

- `syrup-dusk-sky.png`: opaque rear sky layer, 1536×1024.
- `syrup-village-midground.png`: village and mansion landscape with alpha. Align the visible earth base when placing it; do not align the padded image bottom to collision ground.
- `syrup-woodland-foreground.png`: six props with alpha. Actual arrangement: tree, bush, tree / fence, gatepost, roots. Extract each independently before placing it. Fence openings must remain transparent.
- `black-cat-pirate-poses.png`: cutlass pirate, claw brawler, knife thrower; four key poses per character. Extract, align feet and establish pivots before animation.
- `kuro-attack-poses.png`: idle, glasses tell, crouch, lunge / crossed-claw tell, slash, recovery, hurt. Wide blades cross nominal column boundaries: do not slice into equal cells. Match sprite scale and collision timing after extraction.

All images are 1536×1024. The four overlay sheets have alpha, but generated edge haze and semitransparent pixels still need visual cleanup before production. These are key poses, not complete animation loops. Preserve originals and save cleaned derivatives separately.

## Layer plan

Sky at 0.02× camera movement; village at 0.35×; collision terrain at 1×; sparse foreground foliage at 1.05×. Keep platforms and enemy tells clear. Use mild independent foliage sway; no ocean wave overlay in this land stage. Treat the village as a finite scenic plate until repeat joins are validated.

Preview: `/assets/chapter-02/preview.html`. Generation used the built-in image-generation tool; exact prompts are in `PROMPTS.md`. Reuse the existing terrain materials and transponder snail until Syrup-specific terrain and checkpoint art are needed.
