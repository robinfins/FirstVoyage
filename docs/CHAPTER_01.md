# Chapter 01 — Orange Town and Buggy

This document supersedes the initial concept wherever its opening chapter differs. Chapter 01 contains pirates only: Marines move to a later chapter. Transponder snails replace campfires as the checkpoint identity. The Sunny, Orange Town dock, streets/rooftops, and Buggy's circus share a layered sunset art direction.

## Route and checkpoint placement

Sunny galley → Orange Town landing dock → cutlass tutorial → **Checkpoint A: dock signal station** → warehouse lane with a bruiser → rooftop branch and bomb thrower → shortcut ladder back to A → **Checkpoint B: circus signal station** → short empty approach → Buggy arena → return to the Sunny.

Checkpoint A follows the first two safe learning encounters. Checkpoint B sits outside the sealed boss arena and has no enemies between it and the boss door. Both are sheltered alcoves with a Den Den Mushi on a wooden crate, a lantern, and an explicit interaction prompt. They are visible landmarks rather than hidden collectibles.

On first interaction, the snail wakes, plays a short ring, sets the respawn checkpoint, and saves. Resting refills health and meat, resets living-region ordinary enemies, and preserves shortcuts, collected upgrades, and defeated bosses. Only the current checkpoint gets the stronger active glow; discovered snails remain visibly awake. Rest cannot start while taking damage or while a nearby enemy is actively attacking. A return-to-Sunny action becomes available at discovered snails. The game pauses behind a checkpoint menu.

## Pirate roster

| Pirate | Identity | Attack | Teaches |
|---|---|---|---|
| Cutlass deckhand | Red bandana, striped shirt, curved blade | Obvious backswing → short slash → recovery | Basic spacing and dash timing |
| Deck bruiser | Purple headscarf, teal vest, large wooden club | Slow overhead wind-up → heavy slam → long recovery | Wait for commitment; do not mash into armor |
| Powder runner | Orange bandana, satchel of bombs | Raise lit bomb → lob → reload | Reposition before a delayed explosion |

The first deckhand appears alone. Introduce the bruiser with retreat space. The first powder runner throws across a wide safe lane; do not first introduce it above an unavoidable gap. Mix at most two enemy roles in the first chapter's normal rooms until playtesting supports more.

Each pirate sheet contains eight keyframes: idle A/B, walk A/B, wind-up, strike/release, recovery, hurt. Two walk poses support an early preview; a finished walk needs additional passing/contact frames. These are distinct enemy designs, not just palette swaps. Retain each identity across every animation.

### Starting attack timing hypotheses

| Attack | Wind-up | Active interval | Recovery |
|---|---|---|---|
| Deckhand slash | 0.40 s | 0.12 s | 0.50 s |
| Bruiser slam | 0.80 s | 0.18 s | 0.90 s |
| Powder runner throw | 0.65 s | Projectile spawns once | 1.00 s |

Bombs use a visible, audible fuse of about 1.2 seconds after landing and a compact danger radius. Resolve damage from the explosion once, not from touching the decorative fuse. These values are untested starting points. Adjust for real art scale and movement speed.

## Buggy animation and attacks

Two sheets provide 16 key poses. `buggy-melee` covers idle A/B, lunge wind-up/strike/recovery, and detached-hand sweep wind-up/strike/recovery. `buggy-specials` covers knife-fan wind-up/release, bomb wind-up/release, split/recombine, hurt, and defeat.

Use the existing phase structure: knives, lunge, and detached-hand sweep in phase one; split transition and bombs join below 50% health. A knife fan is aimed from one committed facing direction; it must not track Luffy during release. The hand sweep travels across a readable lane. Splitting is a non-damaging transition with an obvious return location. Death disables all boss-owned hazards.

The cleaned pack exports illustrative knives, bombs, and detached hands as independent PNGs with body-relative offsets. Use these independent projectile/effect sprites so movement and hitboxes are controlled by gameplay. Do not animate the entire boss image to move a projectile. The preview only demonstrates keyframe sequencing; it is not a combat implementation.

## Health overlays

Player HUD: upper-left, straw-gold/navy frame, red fill, a small straw-hat emblem, readable `LUFFY` and current/max health. Start at 5 health, retain visible segment dividers, and size health capacity independently of the frame artwork. Keep meat charges just beneath it when implementing inventory.

Boss HUD: lower-center, longer navy/gold frame with circus-red accents, `BUGGY THE CLOWN` above it, a red fill, and a delayed pale damage trail. Show it only while the encounter is active; hide it outside the arena and after defeat. Freeze it with pause. Health percentage is clamped to [0, 1], and the actual fill updates immediately when damage is confirmed.

UI lives in screen space and never inherits camera parallax or ship bobbing. Both frames and fills are separate transparent SVG assets with integer coordinates and square edges. They can be rasterized at the chosen integer display scale later; health values and clipping remain runtime-controlled. Composite full-bar SVGs are also supplied for visual review.

Logical 640 × 360 layout: player bar at (12, 12), 204 × 40 including name; boss bar at (90, 306), 460 × 42. The frame JSON defines exact fill rectangles. The preview includes independent health controls to show full, partial, and empty states.

## Layered environment plan

Layers are independent image files. A flattened concept cannot supply hidden scenery, so this pack generates new compositing layers inspired by the approved concepts. Small differences in architecture are expected; the old full scenes remain art references.

| Back to front | Motion / role | Sunny | Dock / streets | Circus |
|---|---|---|---|---|
| Sky | Camera factor 0.03; very slow drift | Shared sunset | Shared sunset | Shared sunset |
| Distant islands | Factor 0.12 | Visible | Hidden | Hidden |
| Sea behind scene | Factor 0.22; independent wave phase | Broad ocean | None | None |
| Architecture | Factor 0.55 | Ship cabin detail belongs with ship | Orange Town houses | Town skyline behind tent |
| Main scene | Factor 1.00 | Ship/deck assembly | Collidable floor authored separately | Circus tent behind collidable arena |
| Foreground surf | Factor 1.08; offset wave phase | Masks lower hull | None | None |
| Flag / props | Local anchored animation | Flag follows mast | Checkpoint snail near path | Checkpoint outside arena |
| HUD | Screen space | Player only | Player only | Player + boss |

The dock and streets are variations of one Orange Town stage set, not unrelated backgrounds. The circus reuses the sunset sky and town architecture, then adds its own tent. Animated water and island layers are exclusive to the Sunny; all three Orange Town views are land environments. This provides consistent atmosphere without baking everything into one picture. Subsequent stages should follow the same layer contract, with biome-specific artwork.

## Ocean, ship and flag motion

The ocean sheet contains four temporal phases stacked vertically. Display one strip at a time, 4 frames/second, with the rear ocean and foreground surf starting at different phases. Add gentle horizontal drift; evaluate edge joins before enabling infinite repeats. If the art is not seamless, use finite stage bounds or overlapping/crossfaded strips in the prototype. Do not label an untested generated strip seamless.

The flag has four horizontal frames with a fixed hoist anchor. Play at 6 frames/second. Its animation moves relative to the mast, and the mast moves with the ship. A flag must not drift off its attachment point as its frame changes width.

For the Sunny, begin with vertical bobbing only: about ±1.5 logical pixels over 4.5 seconds. Move the ship art, walkable deck collider, local props, and grounded passengers together. Use the engine's moving-platform support or apply one shared platform displacement; do not apply it twice. Keep camera horizon mostly stable and do not roll the gameplay floor in the first implementation. A tiny visual sail/rigging sway can be added separately later. Airborne Luffy follows ordinary physics and inherits platform velocity only as deliberately designed.

Use camera position to move parallax layers and elapsed simulation time to advance waves/flag. Do not tie animation speed to walking input or display frame rate. A motion-reduction setting freezes bobbing and reduces nonessential drift while retaining clear gameplay tells.

## Asset registration and limitations

The generated originals are preserved as source references. The active cleaned pack contains 46 transparent character poses in padded cells with authored feet pivots, plus separately exported detached parts. Use the exact metadata in `assets/chapter-01/manifest.json`; do not slice the original sheets into equal cells. Luffy's existing Gear 2 reference is retained in the asset viewer only and does not change chapter progression.

The flag uses a fixed hoist pivot above the sail, while the snail uses a fixed crate-base pivot on the deck or ground. Both follow the same Sunny assembly transform as standing Luffy. Ocean crests are registered across four phases, with transparent sky and a shared opaque base color. The preview uses finite drift, not infinite water tiling.

The local motion preview assembles the saved layers, cycles atlas frames, and overlays live health fills. It is an art review tool, not a playable level. Collision, enemy AI, save logic, hitboxes, final in-between frames, and audio remain implementation work. Runtime checkpoint alcoves and moving-platform colliders still need to be built around the reviewed placement anchors.
