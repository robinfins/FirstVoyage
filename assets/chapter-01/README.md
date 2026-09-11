# Chapter 01 asset pack

Pirate-only Orange Town, ending at Buggy. The original generated artwork is preserved. The preview now uses **46 cleaned transparent character poses**, separately exported detached limbs/projectiles, and registered flag, snail and ocean frames.

Open the [motion study](../../preview/index.html) through the local server at `http://127.0.0.1:8766/preview/`. This is an art review tool, not a playable game. Read the [chapter design](../../docs/CHAPTER_01.md) for the planned encounters and checkpoint behavior.

## Clean character assets

| Atlas | Poses | Registration |
|---|---|---|
| [Luffy](cleaned/luffy.png) | Idle, run, jump, dash, Pistol, Gear 2 reference | 896 × 576 cells; pivot (448, 536) |
| [Cutlass deckhand](cleaned/pirate-cutlass.png) | 8 idle/walk/slash/hurt poses | 768 × 576 cells; pivot (384, 536) |
| [Deck bruiser](cleaned/pirate-brute.png) | 8 idle/walk/slam/hurt poses | Same |
| [Powder runner](cleaned/pirate-bomber.png) | 8 idle/walk/throw/hurt poses | Same |
| [Buggy melee](cleaned/buggy-melee.png) | 8 idle/lunge/hand-sweep poses | Same |
| [Buggy specials](cleaned/buggy-specials.png) | 8 knife/bomb/split/hurt/defeat poses | Same |

Every atlas has matching individual PNGs in its named `cleaned/` directory. [Registration metadata](cleaned/registration.json) records exact rectangles, feet pivots, original bounds and detached-part offsets. Draw at a fixed scale around the pivot; do not fit each silhouette independently. Transparent gutters prevent neighboring poses or extended weapons entering a frame. Buggy's detached hands, released knives/bombs and split parts are separate PNGs. Small decorative fragments are also retained; the preview suppresses fragments smaller than 1,000 source pixels.

The user authorized scripted pixel cleanup. The reproducible process removes the exterior checkerboard, cleans selected enclosed background holes, trims pale edge fringes, assigns silhouettes to their intended poses, and places them in padded cells. Original character sheets remain under `characters/`, and the original Luffy sheet remains under `assets/concepts/`. Solid-background `*-review.jpg` plates help inspect edges.

These remain key poses. Additional contact/passing frames and attack in-betweens are needed for smooth final animation. The Gear 2 pose is an existing reference only; this chapter does not unlock Gear 2.

## Environment layers

| Layer | Active asset | Scope |
|---|---|---|
| Sunset sky | [Sky](layers/sunset-sky.png) | All four scenes |
| Islands | [Islands](layers/distant-islands.png) | Sunny |
| Ship | [Sunny](layers/sunny-ship-layer.png) | Sunny |
| Buildings | [Town](layers/orange-town-buildings.png) | Dock, streets, circus |
| Tent | [Circus](layers/circus-tent-layer.png) | Circus |
| Water | [Clean wave cycle](cleaned/ocean-wave-cycle.png) | **Sunny only** |
| Flag | [Registered flag](cleaned/sunny-flag-cycle.png) | Sunny mast |
| Checkpoints | [Registered snail](cleaned/checkpoint-snail.png) | Sunny deck, dock A, streets B |

The four ocean phases use actual crest bands rather than equal slices of the source image. They are aligned to a common waterline, have transparent pixels above the crests, and join an opaque `#082740` base below. Each frame is 768 × 64. Finite horizontal drift keeps its edges outside the preview; this is not an endlessly tileable ocean.

The flag uses 512 × 448 cells with hoist pivot (16, 64). The snail uses 576 × 704 cells with ground pivot (288, 656). [Environment registration](cleaned/environment-registration.json) specifies exact rectangles and pivots.

At logical 640 × 360, foreground waterline is 319; the Sunny deck is about 284. Sea runs at 4 frames/second; flag at 6; active snail at 1.5. The ship bobs ±1.5 pixels over 4.5 seconds. Its flag, checkpoint and standing Luffy share the ship transform. The mast extension holds the flag above the sail. Sea animation is independent. Land checkpoints sit at floor Y=278, with space for Luffy and the interaction prompt. There is no checkpoint inside the arena.

## Health overlays

- Gameplay console: [panel](ui/hud-console.svg) plus [health fill](ui/hud-health-fill.svg), [segment grid](ui/hud-health-grid.svg), [meter cell](ui/hud-meter-fill.svg) and its [third-bar variant](ui/hud-meter-fill-hot.svg), [dash fill](ui/hud-dash-fill.svg), [glyph strip](ui/hud-glyphs.svg), [coin](ui/hud-coin.svg), [lock](ui/hud-lock.svg) and [Pistol stamp](ui/hud-pistol-stamp.svg).
- Boss console: [panel](ui/hud-boss-frame.svg) with [fill](ui/hud-boss-fill.svg), a delayed [damage trail](ui/hud-boss-trail.svg) and a [phase-two marker](ui/hud-boss-grid.svg) at half health.
- Legacy 640 × 360 study bars, used by the motion preview only: player [frame](ui/player-frame.svg), [fill](ui/player-fill.svg), [preview](ui/player-full.svg); boss [frame](ui/boss-frame.svg), [fill](ui/boss-fill.svg), [preview](ui/boss-full.svg).
- [HUD metadata](ui/hud-layout.json) defines fill rectangles and screen anchors.

Clip the fill width without stretching the frame. The console is authored at its exact 300 × 100 screen size and drawn 1:1, so nothing is resampled. Every label is baked from a 3 × 5 pixel font in the generator; runtime numbers come from the glyph strip, so the HUD never falls back to a system font. The motion study includes live health controls and a delayed boss damage trail. HUD coordinates stay fixed as the world moves.

## Rebuild and verify

Run from the project root with Python, Pillow, NumPy, OpenCV and Node available:

```sh
python3 tools/clean_sprites.py
python3 tools/clean_environment.py
python3 preview/build_manifest.py
python3 tools/verify_cleanup.py
node tools/verify_scene.cjs
```

The preview itself has no external dependencies. [manifest.json](manifest.json) separates preserved sources from cleaned outputs and provides hashes, exact frame metadata and sequences. [PROMPTS.md](PROMPTS.md) preserves original generation prompts; this cleanup pass used no new generations. [Review checklist](../../docs/NEXT_SESSION.md) records completion and remaining production work.
