# Chapter 01 generation prompts

Built-in image_gen; references are appearance/composition guidance. Final images are saved individually by asset ID. Sheets are animation keyframes and require registration review before production use.

## pirate-cutlass

Reference: assets/concepts/enemy-roster-concepts.png

```text
Generate a NEW animation keyframe sheet. Reference image role: reuse ONLY the first red-bandana pirate's appearance from the enemy lineup. Style: crisp side-view pixel art, visible square pixel clusters, dark navy outlines, restrained 3-tone shading, rich pirate reds and ocean teal shadows. Match the supplied character style. Full bodies and weapons fully contained. No labels, no text, no grid lines, no ground, no contact shadows. Actual transparent alpha background, empty pixels have alpha zero. Layout: exactly 8 frames in a uniform 4-column by 2-row grid, equally sized cells. Each frame faces LEFT, same character size and same feet anchor within its cell; generous empty margins prevent overlap. Reading order left-to-right then top-to-bottom. Subject: lean red-bandana cutlass pirate, red-and-cream striped shirt, dark trousers, brown boots, curved sword. Eight poses: 1 idle guard; 2 idle breath lowered shoulders; 3 walk left foot forward; 4 walk right foot forward; 5 slash wind-up sword behind head; 6 slash attack extended forward left; 7 follow-through recovery low sword; 8 recoil from being hit. Keep the same weapon, bandana and costume in all frames. Large readable differences between wind-up, strike and recovery. Target composition 1536x1024.
```

## pirate-brute

Reference: assets/concepts/enemy-roster-concepts.png

```text
Generate a NEW animation keyframe sheet for a distinct heavy pirate variation in the referenced pixel-art style. Style: crisp side-view pixel art, visible square pixel clusters, dark navy outlines, restrained 3-tone shading, rich pirate reds and ocean teal shadows. Match the supplied character style. Full bodies and weapons fully contained. No labels, no text, no grid lines, no ground, no contact shadows. Actual transparent alpha background, empty pixels have alpha zero. Layout: exactly 8 frames in a uniform 4-column by 2-row grid, equally sized cells. Each frame faces LEFT, same character size and same feet anchor within its cell; generous empty margins prevent overlap. Reading order left-to-right then top-to-bottom. Subject: stocky broad-shouldered pirate deck bruiser, purple headscarf, sleeveless dark teal vest, ochre sash, patched brown trousers, heavy boots, huge wooden belaying club held with both hands. Not a Marine. Eight poses: 1 idle club resting near shoulder; 2 idle breathing; 3 lumbering walk left leg forward; 4 walk right leg forward; 5 exaggerated overhead club wind-up; 6 powerful downward club slam reaching to the left, club fully inside cell; 7 hunched recovery with club on ground level; 8 hurt recoil. Same character and club in every frame. Clear weight and slow readable attack. Target composition 1536x1024.
```

## pirate-bomber

Reference: assets/concepts/enemy-roster-concepts.png

```text
Generate a NEW animation keyframe sheet for a distinct ranged pirate variation in the referenced pixel-art style. Style: crisp side-view pixel art, visible square pixel clusters, dark navy outlines, restrained 3-tone shading, rich pirate reds and ocean teal shadows. Match the supplied character style. Full bodies and weapons fully contained. No labels, no text, no grid lines, no ground, no contact shadows. Actual transparent alpha background, empty pixels have alpha zero. Layout: exactly 8 frames in a uniform 4-column by 2-row grid, equally sized cells. Each frame faces LEFT, same character size and same feet anchor within its cell; generous empty margins prevent overlap. Reading order left-to-right then top-to-bottom. Subject: wiry bomb-throwing pirate, orange bandana, navy-and-cream striped shirt, red waist sash, short dark trousers, boots, brown satchel of round black bombs with short fuses. Not a Marine. Eight poses: 1 idle holding an unlit bomb; 2 idle glance; 3 scurrying walk left leg forward; 4 walk right leg forward; 5 wind-up arm pulled behind body holding a lit bomb; 6 throwing arm extended toward the left, small airborne bomb near hand wholly inside cell; 7 recovery leaning forward empty throwing hand; 8 hurt recoil. Same identity, satchel and proportions throughout. Target composition 1536x1024.
```

## buggy-melee

Reference: assets/concepts/enemy-roster-concepts.png

```text
Generate a NEW first-boss animation keyframe sheet. Use ONLY Buggy the Clown, the fourth character in the reference lineup, preserving his design: blue hair, red clown nose, orange pirate captain hat, orange fur-edged cape, red-and-white striped shirt, green baggy trousers, boots, white gloves and knives. Style: crisp side-view pixel art, visible square pixel clusters, dark navy outlines, restrained 3-tone shading, rich pirate reds and ocean teal shadows. Match the supplied character style. Full bodies and weapons fully contained. No labels, no text, no grid lines, no ground, no contact shadows. Actual transparent alpha background, empty pixels have alpha zero. Layout: exactly 8 frames in a uniform 4-column by 2-row grid, equally sized cells. Each frame faces LEFT, same character size and same feet anchor within its cell; generous empty margins prevent overlap. Reading order left-to-right then top-to-bottom. Eight sequentially indexed poses: 1 cocky combat idle; 2 idle bounce; 3 body lunge crouched wind-up; 4 lunging knife attack forward left; 5 lunge recovery with one knee bent; 6 Chop-Chop hand sweep wind-up with detached knife hand near shoulder; 7 sweeping detached knife hand far to the left with body leaning back, all inside cell; 8 hand returns and boss regains guard. Readable aggressive face. Preserve same scale and clothing. No other characters, no Marine. Target composition 1536x1024.
```

## buggy-specials

Reference: assets/concepts/enemy-roster-concepts.png

```text
Generate a NEW first-boss animation keyframe sheet. Use ONLY Buggy the Clown, fourth character in reference: blue hair, red clown nose, orange captain hat, orange fur-edged cape, red-white striped shirt, green trousers, boots, gloves and knives. Style: crisp side-view pixel art, visible square pixel clusters, dark navy outlines, restrained 3-tone shading, rich pirate reds and ocean teal shadows. Match the supplied character style. Full bodies and weapons fully contained. No labels, no text, no grid lines, no ground, no contact shadows. Actual transparent alpha background, empty pixels have alpha zero. Layout: exactly 8 frames in a uniform 4-column by 2-row grid, equally sized cells. Each frame faces LEFT, same character size and same feet anchor within its cell; generous empty margins prevent overlap. Reading order left-to-right then top-to-bottom. Eight poses: 1 knife-fan wind-up with three knives raised in one glove; 2 release three knives forward LEFT, knives contained in cell; 3 bomb toss wind-up with a round black lit bomb; 4 bomb release upward-left; 5 Chop-Chop split with head, torso, gloved hands, and boots separated vertically but contained in one cell; 6 recombination crouch with body pieces almost assembled; 7 hurt recoil; 8 defeated sitting slump with fallen hat nearby. Same proportions and character scale for intact body frames. Wide empty margin for every attack. Target composition 1536x1024.
```

## checkpoint-snail

Reference: text only

```text
Use case: stylized-concept. Generate a game animation asset: a One Piece transponder snail / Den Den Mushi checkpoint in four animation states, equally spaced in one horizontal strip of four equal cells. Genuine transparent alpha, no checkerboard artwork. Side view facing left, consistent baseline and size. A friendly peach-colored snail with expressive eyestalks, a turquoise spiral shell fitted with a cream telephone handset and small red receiver buttons, perched on a small wooden crate with a warm brass lantern beside it. Same composition in every frame. Frame 1 asleep / inactive eyes closed and dim lantern; frame 2 waking with eyes half open and lantern glowing; frame 3 active with eyes raised and handset wiggling; frame 4 active blink with handset tilted oppositely. No letters, icons, labels, scenery or border. Crisp chunky pixel art, navy outlines, warm amber/teal/red palette. All props stay wholly inside cells. These frames will represent a checkpoint wake-up and idle loop.
```

## sunny-ship-layer

Reference: assets/concepts/sunny-hub-concept.png

```text
Use case: stylized-concept. Generate a NEW isolated environment layer based on the supplied Sunny hub reference. Subject: the Thousand Sunny in strict side-on cutaway, the entire ship hull and walkable grass deck, lion sun figurehead at LEFT, cozy kitchen, navigation desk and shipwright nook, round cabin windows, orange trees, mast and furled sail. Keep the warm wood and amber lantern lighting and the same visual language as reference. Show full bow and stern and complete mast inside canvas with padding. Background must be genuine transparent alpha. Remove ocean, waves, sky, islands, and background completely. Do not include a flag; it will be separate animated art. No characters, UI, text or labels. The ship alone is one independent layer to bob gently over an independently animated sea. Wide landscape composition, pixel-art clusters with crisp hard edges and navy shadow outlines. Keep a clear flat deck standing surface.
```

## sunset-sky

Reference: text only

```text
Use case: stylized-concept. Generate ONLY a wide pixel-art sunset sky background plate for a side-scrolling One Piece pirate platformer. Orange-pink sunset along the bottom fifth, purple-blue upper sky, restrained soft-shaped but hard-pixel-edged clouds at upper edges, small sun low near horizontal center. Entire image is sky, no ocean, no water, no islands, no land, no ships, no buildings, no foreground, no words. The gradient is made of subtle discrete pixel bands and dithering, not smooth vector art. Rich but quiet colors to sit behind warm wooden pirate environments. Wide 16:9 image. Opaque backdrop. Keep upper middle spacious for silhouettes.
```

## distant-islands

Reference: assets/concepts/sunny-hub-concept.png

```text
Use case: stylized-concept. Generate ONLY an isolated far-distance island silhouette layer inspired by the supplied Sunny ocean background. Genuine transparent alpha background. Wide horizontal cluster of three subtropical rocky islands, low cliffs and sparse palm silhouettes, desaturated blue-teal and purple with 3-tone pixel shading, delicate warm rim on upper edges. Islands terminate at the same flat sea-level baseline near bottom of image. No water, no sky, no sun, no ship, no clouds, no foreground objects, no text. Large transparent empty area above islands. Compose as a distant parallax layer; islands should be small low silhouettes with quiet detail. Crisp pixel art, wide horizontal landscape.
```

## orange-town-buildings

Reference: assets/concepts/buggy-arena-concept.png

```text
Use case: stylized-concept. Generate ONLY a detached side-view background buildings layer for Orange Town before the Buggy fight, consistent with reference pixel-art palette. A row of weathered plaster-and-timber seaside pirate-town houses, orange terracotta roofs, shutters, warm lit windows, a low archway opening and two palm trees. The buildings occupy the lower two-thirds and terminate on a common flat baseline. Genuine transparent alpha around architecture and between rooftop silhouettes. No sky, no clouds, no ocean, no ground plane, no floor or road, no people, no circus tent, no text. Strict orthographic side elevation, not an isometric view. Violet and navy dusk shadows, selective amber windows, muted contrast suitable for a scrolling middle-distance layer. Wide panoramic strip with varied roof heights and full buildings contained inside canvas.
```

## circus-tent-layer

Reference: assets/concepts/buggy-arena-concept.png

```text
Use case: stylized-concept. Generate ONLY an isolated circus backdrop layer for Buggy's boss arena from the reference. Central large weathered red-and-cream striped pirate circus tent with dark open entrance, two warm hanging lanterns, a few slack pennant ropes connected to short side posts. Full tent roof and sides inside canvas. Genuine transparent alpha background around the tent and through large side gaps. No sky, ocean, town buildings, ground plane, cobblestone floor, barrels, platforms, people, boss or UI. Keep the central opening dark so combat silhouettes read in front of it. Crisp detailed pixel art with deliberate square clusters, dark navy contours, muted red/violet dusk shading and small amber highlights. Wide landscape, straight-on side-scrolling environment layer.
```

## ocean-wave-cycle

Reference: text only

```text
Use case: stylized-concept. Generate a 4-frame sprite sheet of an animated foreground ocean strip for a pixel-art pirate platformer. Layout: exactly four equal-width horizontal panels STACKED VERTICALLY, one animation frame per row, a 1-column x 4-row sheet. Same strip position and baseline in every frame, generous empty separator margins. Each frame is a long narrow navy-and-teal sea band with a few jagged white and pale-cyan foam crests along its upper edge, lower edge flat. Frame progression: swell forming, crest rising, crest breaking, foam settling; wave features advance subtly, not a completely different sea each frame. Genuine transparent alpha above the irregular crests and between all four strips. No checkerboard artwork. No sky, horizon, ship, land, characters, text, labels or panel borders. Crisp hard-edged square pixel clusters, no blur or painterly gradients. Each strip can be drawn as a foreground layer over a separate base ocean color. Keep left/right water height and palette similar for repeat-friendly joins; no claim of perfect seamlessness. Wide sheet composition 1536x1024.
```

## sunny-flag-cycle

Reference: text only

```text
Use case: stylized-concept. Generate a transparent pixel-art animation sprite sheet for the Thousand Sunny flag. Exactly four equal cells in a single horizontal row, four successive frames of the SAME black pirate flag with the Straw Hat Pirates' skull-and-crossbones wearing a straw hat. Hoist edge at LEFT with exactly the same fixed anchor in every frame. Fabric extends to RIGHT and changes shape as a wind wave travels along it: relaxed wave, upward crest, stretched wave, downward crest. No flagpole; no sky, ship, scenery, labels or borders. Genuine transparent alpha around each flag, large clear spacing, no checkerboard drawing. Simple legible off-white skull and crossed bones, small golden hat with red band. Deliberate low-resolution square pixel clusters, hard navy/black edges and restrained fabric shading. Full flag stays inside each cell and has consistent size.
```

