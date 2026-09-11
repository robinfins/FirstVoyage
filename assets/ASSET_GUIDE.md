# Initial asset pack

The expanded [Chapter 01 asset pack](chapter-01/README.md) adds pirate and Buggy pose sheets, real environment layers, animated props and health overlays. This page describes the original four concepts.

These images establish a pixel-art direction and provide character, pose, and environment references. They are generated concept assets. They are not validated animation atlases, seamless tile sets, or separated parallax layers. Keep the original PNGs intact; create production derivatives after approving the look.

## Included concepts

| File | Contents | First intended use |
|---|---|---|
| [Luffy key poses](concepts/luffy-action-sheet.png) | Idle, run, jump, dash, stretched punch, Gear 2 | Approve costume, silhouette, and move language |
| [Sunny hub](concepts/sunny-hub-concept.png) | Side-view ship deck and service areas | Guide hub composition, palette, and room art |
| [Enemy roster](concepts/enemy-roster-concepts.png) | Pirate fighter, Marine swordsman, Marine rifleman, Buggy | Establish silhouettes and relative visual scale |
| [Buggy arena](concepts/buggy-arena-concept.png) | Orange Town circus courtyard | Guide the first boss room's atmosphere and combat space |

Exact prompts are recorded in [GENERATION_PROMPTS.md](GENERATION_PROMPTS.md). Generation used the built-in image_gen tool. The Luffy reference was supplied by the user; its source file was left untouched.

## Verified output and cleanup notes

- **Luffy:** 1536 × 1024, RGB. Six recognizable key poses are present. The gray-and-white checkerboard is baked into the pixels, not transparency. An imagegen background-removal retry also returned RGB, so the original is retained as the selected pose reference. Background removal remains production work. The extended punch also exceeds a simple equal-width cell layout; do not auto-slice it as a 3 × 2 animation atlas.
- **Enemy lineup:** 1991 × 789, RGBA with actual transparent pixels. All four silhouettes are separate, with a larger Buggy and a detached hand. Normalize outlines and scale, and clean up cap lettering before production.
- **Sunny:** 1672 × 941, RGB. The image establishes the deck, figurehead, warm service nooks, and depth. The scene is flattened; its background and foreground are not separate layers.
- **Buggy arena:** 1672 × 941, RGB. A clear central floor and two raised side platforms are present. The illustrated ground has depth; establish the exact side-view collision baseline during grayboxing.

File metadata and integrity hashes are recorded in [manifest.json](manifest.json). No production-ready animation or seamless tiling is claimed.

## Proposed production pixel specification

- Logical game viewport: **640 × 360**. Prefer integer display scaling and nearest-neighbor texture filtering.
- Luffy: approximately **56–64 pixels** from sandals to hat; standard body frames on a **96 × 96** transparent canvas with one consistent feet pivot.
- Grunts: approximately **56–64 pixels** tall, sharing the same world scale.
- Buggy: approximately **80–96 pixels** tall; allow a larger canvas for knives and detached parts.
- Terrain: **16 × 16** base tiles, assembled into larger modules. High-contrast top edges identify solid ground.
- Palette: start around 24–32 shared colors with limited per-material shades; preserve costume colors while reducing background contrast.
- Character art: navy outlines, clear silhouettes, transparent background. Preserve hats and feet in every frame.
- Effects: punches, dust, steam, and detached hands use separate layers or sprites so they can be timed and positioned independently.

The generated images are larger concept renders. Their visible pixel clusters do not guarantee a perfectly uniform logical grid. Do not assume the six Luffy poses can be divided into equal engine-ready animation cells without cleanup. Rebuild or clean up at the target resolution and check every frame at actual gameplay size.

## Animation backlog for the Buggy slice

| Asset | Required clips | Suggested initial frame budget |
|---|---|---|
| Luffy | Idle, run, jump rise/apex/fall, dash, three punch strikes, charged Pistol, hurt, heal, defeat | Idle 4; run 8; jump 3; dash 3; each punch 4–6; Pistol 6; hurt 2; heal 6; defeat 6 |
| Pirate | Idle, patrol, slash, hurt, defeat | 4 / 6 / 6 / 2 / 5 |
| Marine swordsman | Idle, patrol, brace/lunge, hurt, defeat | 4 / 6 / 6 / 2 / 5 |
| Marine rifleman | Idle, patrol, aim/fire/recover, hurt, defeat | 4 / 6 / 8 / 2 / 5 |
| Buggy | Idle, knife throw, hand sweep, lunge, split/recombine, bomb toss, hurt, defeat | Author telegraph, active, and recovery poses separately before adding in-betweens |
| Effects | Hit spark, rubber stretch, dash dust, muzzle flash, bullet, bomb warning/explosion, healing | Short readable loops or bursts; avoid covering attack tells |

Budgets are estimates for planning. Tune gameplay windows separately from the number of drawn frames. Gear 2 animation variants and steam belong to the later three-boss milestone, except for an optional developer preview.

## Environment conversion backlog

1. Sunny: separate ocean/sky, distant islands, ship backdrop, solid deck, and foreground details. Build actual collision from a graybox layout; do not trace decorative ropes as platforms.
2. Orange Town: draw ground, wall, roof, stair, and one-way-platform modules. Include inside/outside corners and test repeated tiles for seams.
3. Buggy arena: separate tent/background from the flat playable floor and side platforms. Keep barrels outside the primary fight space unless deliberately designed as collidable objects.
4. Hub props: create a rest marker, galley counter, meat plate, chart table, treasure container, and workbench as reusable sprites.
5. UI: author original health segments, meat-charge indicator, Berry counter, boss health bar, interaction prompt, and the later Drive meter.

## Import and review checklist

- Confirm dimensions and alpha from the manifest before importing.
- Inspect outlines at 1× logical resolution and under the intended display scaling.
- Lock one palette, outline thickness, feet pivot, and character scale across animations.
- Define hitboxes separately from visual effects and transparent padding.
- Playtest the graybox, then align art to confirmed collision and camera bounds.
- Treat the sheet as key-pose reference until the missing frames, registration, and timings have been authored.
