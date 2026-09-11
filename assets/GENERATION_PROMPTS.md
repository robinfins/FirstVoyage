# Generation prompts

Generated with the built-in image_gen tool. These are the exact submitted prompts. The Luffy image used the user's supplied `/Users/robinfins/Downloads/LuffyPreTimeskip.webp` as an appearance reference; the other concepts were generated from text. Original generated files are preserved in `concepts/`. A separate Luffy transparency correction was requested through the same built-in tool; its exact prompt appears below.

## luffy-action-sheet

```text
Use case: stylized-concept
Asset type: pixel-art platformer character key-pose sheet for a One Piece fan game.
Input images: the supplied LuffyPreTimeskip.webp is a character appearance reference only; generate a new asset.
Subject: pre-timeskip Monkey D. Luffy, straw hat with red band, black messy hair, sleeveless red open vest, blue shorts with white cuffs, sandals, lean body. Keep this exact costume in all poses.
Composition: wide 3 by 2 grid of six isolated full-body poses, every pose facing right, each occupying its own equally sized spacious cell with generous margins. Reading order: relaxed fighting idle; forward run; airborne jump; very low forward dash with small dust pixels; stretched rubber straight punch with the fist extending to the right and fully contained inside its cell; Gear 2 crouch with light steam and subtly pink skin. Same head/body scale throughout. Gear 2 keeps straw hat and costume.
Style: crisp deliberate low-resolution pixel art, visible square pixel clusters, approximately 64-pixel-tall character design enlarged with nearest-neighbor appearance, dark navy outlines, 3-tone shading, readable silhouette, expressive but compact face, rich red, golden straw, ocean blue and warm skin colors.
Background: genuinely transparent alpha, empty between poses. No checkerboard painted into the image.
Constraints: no text, no labels, no frame borders, no ground, no UI, no watermark, no blur, no smooth vector edges. This is a six-key-pose concept sheet, not a complete animation. Make all six poses visibly distinct and do not crop hat, fist or sandals.
```

## sunny-hub-concept

```text
Use case: stylized-concept
Asset type: wide environmental concept art for the walkable hub of a side-scrolling pixel-art One Piece platformer.
Primary request: the Thousand Sunny as a warm welcoming upgrade hub after dangerous island adventures.
Scene: strict side-on gameplay cutaway of the recognizable Thousand Sunny ship at sunset, lion/sun figurehead at left, green grass deck, mast and rolled sails, orange trees on upper deck, warm wood cabins with round windows. Show a long clear horizontal walkable grass-and-wood deck occupying the lower third, with three cozy service nooks integrated behind it: open kitchen serving a plate of meat, navigation table with maps and treasure, small shipwright workbench with tools. A few compact wooden steps connect a raised rear deck. Ocean and distant islands form subdued depth layers, warm lanterns against teal evening shadows. The deck is the focus, fully visible edge to edge.
Style: carefully crafted pixel-art game environment, low-resolution square clusters and hard edges, approximately 640x360 logical pixels enlarged, restrained three-tone materials, visually rich foreground wood and foliage with quieter background shapes, golden amber lighting and deep ocean teal, inviting mood.
Constraints: wide 16:9 composition, orthographic side view, readable platform geometry, no characters, no UI, no lettering, no logos or watermark. Original platform layout. No smooth painting or isometric perspective. Single cohesive background concept, not a tile sheet.
```

## enemy-roster-concepts

```text
Use case: stylized-concept
Asset type: pixel-art enemy character lineup for a side-view One Piece platformer.
Subject: exactly four separate full-body characters in a single horizontal row on a genuinely transparent alpha background. First: basic pirate cutlass fighter with striped shirt, red bandana, ragged trousers and curved sword. Second: basic Marine swordsman with white sleeveless uniform, blue neckerchief, navy trousers and white cap. Third: Marine rifleman in same uniform holding a long musket. Fourth: Buggy the Clown as the larger first boss, recognizable red clown nose, blue hair, pirate captain hat with skull motif, red-and-white striped shirt, orange coat and cape, holding knives, with one detached gloved hand floating close to him to suggest his Chop-Chop power.
Style: crisp low-resolution pixel art with deliberate square clusters, dark navy outline, restrained 3-tone shading, compact expressive characters, clear gameplay silhouettes. Ordinary foes approximately 64 logical pixels tall, Buggy about 90 logical pixels tall. Enemies all face left in combat-ready poses, same baseline, full bodies and weapons contained with generous spacing.
Palette: warm skin, ocean navy, off-white uniforms, pirate reds and Buggy oranges, readable against dark ocean backgrounds.
Constraints: no captions, no labels, no UI, no floor, no decorative border, no shadows detached beneath feet, no painted checkerboard, no blur. Separate silhouettes do not overlap. Character concept lineup, not a complete animation sheet.
```

## buggy-arena-concept

```text
Use case: stylized-concept
Asset type: pixel-art boss arena environment for the opening chapter of a side-scrolling One Piece platformer.
Primary request: an abandoned seaside circus courtyard in Orange Town for Buggy the Clown's first boss fight.
Scene: a broad flat cobblestone combat floor across the bottom quarter, two short wooden side platforms with clear landing surfaces, weathered red-and-cream striped circus tent in the background center, pirate pennants, dockside barrels and crates pushed to the far edges, rooftops and ocean glimpsed in the distance. Damaged festive atmosphere, moody dusk with warm lanterns against deep navy and purple shadows. Keep the middle two-thirds uncluttered for readable dodge and punch combat. Foreground floor has high-contrast top edges; background tent and buildings have quieter contrast.
Style: detailed but deliberate low-resolution pixel art with visible square clusters, approximately 640x360 logical pixels enlarged using hard-edged nearest-neighbor appearance, consistent dark navy outlines and 3-tone shading, side-view orthographic camera.
Constraints: single wide 16:9 environment concept, no characters, no boss baked in, no text, no UI, no logos, no watermark, no isometric viewpoint, no smooth brushwork. Distinct shapes and simple readable platforms. Not a tile sheet.
```

## Luffy transparency correction

Result: the edit returned another opaque RGB image with a background pattern. It was not selected. The original pose reference remains in the project; this unsuccessful iteration is recorded here for reproducibility.

Input: `concepts/luffy-action-sheet.png`, the first generated sheet, which contained a baked-in checkerboard rather than alpha.

```text
Use case: background-extraction
Edit target: the supplied generated six-pose pixel-art Luffy character sheet.
Change only the background: remove the entire gray-and-white checkerboard pattern and replace it with genuine transparent alpha. The checkerboard is unwanted baked-in background, not artwork. Keep all six characters, their poses, scale, arrangement, costume colors, crisp pixel outlines, fully extended rubber punch, dash dust and Gear 2 steam unchanged. Do not repaint or redraw Luffy. Preserve the transparent wispy effects with appropriate alpha. Do not put in a white, gray, black, or checkerboard replacement background. Output a transparent PNG at the same canvas dimensions. No additional text or elements.
```
