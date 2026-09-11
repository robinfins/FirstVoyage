# Cleanup checklist — reviewed September 10, 2026

The five requested fixes have been applied to the local motion preview and asset pack. Scope remains pirate-only through Buggy. Scripted pixel cleanup was explicitly authorized; original artwork is preserved.

- [x] **Clean sprites and frame registration.** Removed baked checkerboards, assigned overlapping source regions to individual poses, added transparent gutters and fixed feet pivots. Exported 46 body frames and independent Buggy limbs/knives/bombs. The viewer renders at a constant scale and includes background, detached-part and pivot controls.
- [x] **Ocean only on the Sunny.** Dock, streets and circus no longer draw rear sea or foreground surf. Stage metadata and design documentation agree.
- [x] **Correct ocean composition.** Extracted actual crest bands, aligned waterlines, removed sky haze, blended to a shared opaque sea base, and placed foreground water around the lower hull. Deck stays clear. Finite drift and wave phase run independently of ship bobbing.
- [x] **Fix the flag attachment.** Added a mast extension above the sail; all four flag frames use one hoist pivot and inherit the ship transform.
- [x] **Ground the snail checkpoints.** Registered crate-base pivots, corrected scale and left room for Luffy/prompts. Sunny checkpoint follows deck bobbing. Dock A and streets B sit on the floor; the circus arena contains no checkpoint.

## Verification

- Inspected all six character proof sheets on a solid background; corrected residual background holes and a Luffy dash fragment during review.
- Visually reviewed Sunny, dock, streets and circus in the browser, including motion/pause and Buggy split/recombine sequencing.
- Asset checks pass for all 46 frame/atlas matches, alpha, transparent gutters, common pivots, detached-part sizes, valid animation indices and 12 prop/wave frames.
- Scene checks pass across camera extremes and bobbing phases: no land water, fixed ship-local anchors, checkpoint clearance and reduced-motion stability.

Run `python3 tools/verify_cleanup.py` and `node tools/verify_scene.cjs` from the project root.

## Next production work

These are cleaned key poses, not complete smooth animations. Draw the missing in-betweens, then tune timings in a playable prototype. Implement collisions, enemy AI, projectile hitboxes, checkpoint saving and sheltered checkpoint geometry. Ground blocks remain preview placeholders. The ocean supports the finite preview composition; endless horizontal tiling needs separate edge work.

## Files

- [Motion preview](../preview/index.html)
- [Scene anchors](../preview/scene-geometry.js)
- [Renderer](../preview/preview.js)
- [Cleaned asset guide](../assets/chapter-01/README.md)
- [Sprite cleanup](../tools/clean_sprites.py)
- [Environment cleanup](../tools/clean_environment.py)
- [Metadata builder](../preview/build_manifest.py)
