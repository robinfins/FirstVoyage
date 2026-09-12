# Production roadmap

Build the smallest good Luffy game before expanding the voyage. Milestones are ordered by dependency, without calendar estimates until team size and available time are known.

## Current build

A compact browser prototype now exists in `play/`. See [playable build notes](PLAYABLE_PROTOTYPE.md) for its implemented systems and limits. The milestones below describe the fuller production target; the initial engine suggestion is not a requirement for this dependency-free prototype.

## 1. Movement and combat laboratory

Create a graybox test room with stairs, low ceilings, gaps, and a target dummy. Implement running, variable jumps, coyote time, input buffering, one air dash, damage grace, basic punches, charged Pistol, and healing. Use simple collision shapes while art is still changing.

**Done when:** keyboard and controller input both work; dash cannot pass through walls; high-speed movement does not tunnel through platforms; an attack hits each target only once per strike; pause and restart are reliable; movement feels responsive without animation-dependent delays.

## 2. Enemy encounter room

Implement shared health, knockback, hurtboxes, attack hitboxes, and state transitions. For Chapter 01, add cutlass deckhand, deck bruiser, and powder runner; Marines belong to later chapters. Establish telegraphs, recovery windows, death rewards, and projectile cleanup.

**Done when:** each enemy can be learned alone; two-enemy encounters remain readable; offscreen enemies do not fire without warning; a single contact does not cause repeated damage; decorative effects never determine collision.

## 3. Orange Town exploration loop

Build the dock, streets, rooftop branch, pirate warehouse lane, shortcut, two Den Den Mushi checkpoint alcoves, and arena entrance. Add camera bounds, room transitions, safe-ground tracking, exploration pickups, checkpoints, death, and the recoverable Berry satchel.

**Done when:** the complete route is traversable with the starting kit; the shortcut persists after death; satchels remain reachable after pit deaths; resting resets ordinary enemies; optional pickups can be found without stopping main progression.

## 4. Buggy encounter

Implement phase one first, then phase two once the original attacks are fair. Give each attack an explicit wind-up, active interval, and recovery. Separate the boss body from detached-hand hazards. Add boss health UI and persistent victory handling.

**Done when:** every pattern has a reachable response; phase changes never cause unavoidable damage; replaying the encounter after a loss is quick; victory grants its reward once and survives reload; new players can explain why an attack hit them.

## 5. Sunny and persistence

Add the Sunny deck, galley rest, Nami's small shop and map, return travel, and a versioned save format. Save permanent progression separately from temporary combat state. Write saves atomically and keep a previous good copy.

**Done when:** purchases charge the correct amount once; rest refills the intended resources; boss flags, shortcuts, pickups, upgrades, and inventory survive closing the game; a missing save starts safely; an invalid save does not crash startup.

## 6. Art, feedback, and slice review

Convert the approved generated concepts into consistent pixel sprites, animation clips, reusable tiles, and parallax layers. Add hit feedback, attack sounds, environmental audio, menus, input rebinding, effect intensity settings, and a simple tutorial.

**Done when:** the entire 15–25-minute slice can be finished without developer tools; art matches collision; text is readable; controller-only navigation works; at least a few fresh players can learn and defeat Buggy. Collect observations before extending scope.

## 7. Chapter 2 and Gear 2

Syrup Village and Kuro are playable. Gear 2 now unlocks after Kuro and spends the shared ability bars for a 3/7/13-second buff. Baratie and Don Krieg remain future scope.

**Done when:** ordinary play unlocks Gear 2 only after Kuro; reload preserves the unlock; death and room changes clear temporary transformation state correctly; transformed stats never permanently accumulate; base form remains viable.

## Suggested implementation structure

Godot's dedicated 2D workflow is a suitable starting option for a small project. Use a stable Godot 4 release when implementation begins, with GDScript for an approachable first build. This is a proposed engine choice; no engine project is initialized in this package.

- `Player`: a `CharacterBody2D` with explicit locomotion, attack, hurt, healing, and transformation state.
- `Combat`: reusable hitbox/hurtbox components; clear teams; one-hit-per-strike tracking.
- `Enemy` and `Boss`: shared movement/damage components, with authored attack state machines.
- `World`: room scenes, checkpoint nodes, safe-ground anchors, camera regions, and shortcut flags.
- `Progression`: unique defeated-boss IDs, permanent upgrades, quest flags, and unlocked voyages.
- `Inventory`: Berries, banked Berries, consumable counts, and equipped passive slot costs.
- `Save`: versioned data with validation, atomic writes, and recovery from a bad file.
- `Presentation`: animation, sound, effects, and camera feedback react to gameplay events.

Keep visual animation timing configurable alongside attack data. Store health, attack timing, cooldowns, drops, and shop prices in editable resources. Avoid a general quest engine or procedural map generator in the first slice.

Official engine references: [Godot 2D overview](https://docs.godotengine.org/en/stable/tutorials/2d/index.html), [CharacterBody2D](https://docs.godotengine.org/en/stable/classes/class_characterbody2d.html).

## Highest-value checks

Use automated checks for persistent progression, single-grant boss rewards, currency transactions, and Gear 2 stat reset. Use hands-on playtesting for timing, jump feel, camera framing, and fairness. Test combat at varied rendering frame rates while retaining fixed-step physics.

Watch for three main production risks: inconsistent generated sprite scale, expanding the campaign before the first boss is fun, and long attack animations that make Luffy feel sluggish. Address them with a locked pixel spec, milestone gates, and early movement testing.
