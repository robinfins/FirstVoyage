# First Voyage — playable prototype

Current health and Zoro controls: [Crew and health update](CREW_COMBAT.md). This supersedes older single-character and segmented-health descriptions below.

Open **http://127.0.0.1:8766/play/** and choose **Set sail**, **New voyage**, or **Continue voyage**. The canvas takes keyboard focus when you start. Click inside it again after using page controls.

If the local server is stopped, run this from the project folder:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

## Controls

| Input | Action |
|---|---|
| A / D | Move left / right |
| W | Jump; hold for a higher jump |
| W / S at the Sunny stairs | Climb / descend between decks |
| S | Drop through elevated platforms |
| Space | Dash in the movement/facing direction |
| E | Rest, recover dropped berries, or use a travel marker |
| Left mouse click | Punch toward the pointer, including upward and diagonal attacks |
| Q | Gum-Gum Bazooka; consumes two full special bars |
| R | Gum-Gum Gatling; consumes all three special bars |
| Esc | Pause / resume; in fullscreen it leaves fullscreen and pauses |
| Fullscreen button | Fill the screen; also in the pause menu |
| Lock cursor button | Capture the mouse inside the game; also in the pause menu |
| Music button | Toggle the score; Sound toggles the effect blips separately |

A dash has a short cooldown and avoids damage while active. You get one dash in the air, refreshed by landing. Each click is one punch. Jumping uses a short input buffer and coyote window. Moving away from the tab pauses the game. Music and sound effects both start on; the Music and Sound buttons toggle them separately.

## Special-move meter

Three segments sit directly below Luffy's health bar. Every successful ordinary punch adds 20 charge, so five hits fill one segment. Charge is capped at 300 and is cleared on death. Special-move hits never recharge the meter.

**Gum-Gum Bazooka** costs 200 charge. Both arms pull behind Luffy, then fire together after a readable 0.62-second wind-up. The single impact reaches 210 world pixels and deals 12 times the current ordinary-punch damage.

**Gum-Gum Gatling** unlocks permanently after defeating Buggy and costs 300 charge. Luffy commits to an 18-hit barrage lasting 1.8 seconds. The attack begins after 0.18 seconds, then applies one damage pulse every 0.085 seconds within a 165-pixel lane. It deals more total damage than Bazooka but leaves Luffy committed longer.

Both moves require Luffy to be grounded and lock their direction when activated. Movement, jumping, ordinary attacks and interactions are unavailable during the move. Dash cancels either special when a dash is available; consumed bars are not refunded. The controls below the canvas show current charge and only enable a move when its cost and activation conditions are met.

## Fullscreen

**Fullscreen** in the bar under the canvas, and in the pause menu, expands the game shell so the canvas fills the display and the aiming cursor stays over the fight instead of wandering onto the page. The canvas keeps its 960 x 540 backing store and letterboxes to 16:9, so nothing is cropped or distorted at any display shape.

Aim is tracked across the whole shell and clamped to the canvas, so a pointer sitting in the letterbox aims at the nearest edge rather than stranding the crosshair. While playing in fullscreen the system pointer is hidden and the drawn crosshair stands in for it; menus bring it straight back. The page's status line is not on screen there, so transient notifications are drawn at the bottom of the canvas instead.

**Lock cursor** goes further: it captures the mouse outright, so it cannot reach another window or monitor at all. Aiming switches to mouse movement deltas at the same pixels-per-canvas-unit scale as free aiming, so the feel is unchanged, and the crosshair stays clamped to the canvas. It works windowed as well as in fullscreen. Menus release the pointer so they stay clickable, and Escape releases it too; click the canvas to re-arm it. A browser that refuses the request says so and clears the toggle rather than leaving it stuck on.

Escape is reclaimed by the browser in fullscreen: it leaves fullscreen, and the game pauses on the way out. A browser that refuses the request (an embedded view, or an iframe without permission) reports that in the notification line rather than silently doing nothing.

## Levelling

Each captain defeated for the first time raises the crew one level. A level adds 120 maximum HP and a modest raise to base damage, which every attack rides: ordinary punches, Gum-Gum Bazooka and Gum-Gum Gatling all scale from the same figure. The tiers live in `LEVELS` in `play/core.js`.

| Level | Earned by | Base damage | Max health |
|---|---|---|---|
| 1 | Starting kit | 1 | 600 |
| 2 | Buggy | 1.5 | 720 |
| 3 | Kuro | 2 | 840 |

The level is derived from the permanent victory flags rather than stored separately, so existing saves migrate on load and a rematch cannot level him again. The additional 120 HP arrives filled; the rest of the bar is not healed.

Syrup Village is gated behind Buggy, so it is always played at level 2 or better. Its Black Cat crew therefore carries half again the chapter-one health — cutlass 8, bruiser 12, powder runner 6 — which keeps hits-to-kill within one hit of the chapter-one encounters at level 1. Chapter-one enemies are untouched. The scale is per stage via `enemyHp`, and each enemy remembers its spawn health so its bar reads correctly.

## Score

`play/music.js` synthesises three original looping cues with Web Audio — no audio files and no libraries, so they cost nothing to ship and loop seamlessly. They are written in a sea-shanty / adventure idiom; none of them quote an existing One Piece theme.

| Cue | Where | Character |
|---|---|---|
| `hub` | Thousand Sunny | 3/4 waltz in D major, 78 BPM, oom-pah-pah bass, no percussion |
| `stage` | Dock, rooftops, Syrup Village | 4/4 march in D minor, 134 BPM, dotted melody over a walking bass |
| `boss` | Only while a captain is up | 4/4 in D phrygian, 168 BPM, driving eighths and off-beat stabs |

The battle cue belongs to the fight rather than the room. Walking into an arena keeps the march playing, so there is no change until the player crosses the trigger that raises the boss health bar — then it swaps, and the two land together. When the captain falls the battle cue ends and the calm cue takes the aftermath, leaving the victory fanfare room to sound. Re-entering a cleared arena stays calm; taking a rematch brings the battle cue back. Both arenas follow the same rule.

Each cue is eight bars on a sixteenth-note grid. Parts are written as `[note, sixteenths]` runs and flattened to a step table at load; a part shorter than the loop tiles to fill it, which is how one bar of drums covers the whole progression. A part can carry `from: 2`, which holds it back until the intensity rises — the battle cue keeps a sixteenth-note counter-line for boss phase two, worth about a sixth more output level.

Timing uses a lookahead scheduler rather than per-note timers: a 25ms interval queues every step landing inside the next 100ms against `ctx.currentTime`, so note starts are sample-accurate and never drift with the frame rate. Track changes cross-fade through silence over about half a second, so two keys never sound at once. Menus duck the score to 30% instead of cutting it.

Music and effects share one `AudioContext`, created on the first user gesture because browsers refuse to start audio before one. Both are on by default and each has its own toggle, so either can be silenced without the other.

`tools/verify_music.cjs` checks that every note parses and lands in a usable range, that each part tiles the loop exactly, that the phase-two layer exists and has notes, and that note density rises from hub to stage to boss. It also mirrors the cue-selection rule against real `Game` state, covering the approach, the trigger, phase two, the captain's death, a cleared arena and a rematch, in both arenas.

## Sound effects

`play/sfx.js` synthesises every cue the same way — no audio files. Each is layered like a recorded effect: a transient to mark the moment, a body for weight, a tail to let it breathe. Luffy's attacks lean on pitch glides rather than flat tones, because a limb that stretches should sound like it stretches.

| Cue | Built from |
|---|---|
| Punch (the swing) | Air sweeping up 520 to 1900 Hz, an elastic twang gliding up, a low stretch underneath |
| Punch (the connect) | Tight high crack, a 290 to 70 Hz thump for weight, a short square bite |
| Dash | Low push-off, then resonant air rushing 380 to 2600 Hz, with a reversed tail behind it |
| Gum-Gum Bazooka | Wind-up: a rising sawtooth stretch over 0.55s. Fire: 180 to 32 Hz drop, lowpassed blast, crack on top |
| Gum-Gum Gatling | Rev: three rising blips. Each of the eighteen pulses: a dry 35ms crack and a short 330 to 90 Hz thwack |

Repeated cues vary by a few per cent in pitch and filter each time, so punch spam and an eighteen-hit Gatling never sound stamped out. Levels are deliberately ordered — the whiff sits under the connect, which sits well under the Bazooka — so volume tracks impact.

The effect bus runs hot at 2.3 and feeds a limiter, so cues can sit above the score without clipping when several land together. The limiter also tightens the range: raising the bus lifted the quiet cues far more than the loud ones, which is what makes a punch audible without turning the Bazooka into a wall.

Measured in the running game: Bazooka fire peaks at 0.36 RMS, a connect at 0.23, the Gatling pulse at 0.21, the dash at 0.18, the whiff at 0.12. The busiest moment in the game — a full Gatling burst over the phase-two battle cue — peaks at 0.35 combined, leaving 0.65 of headroom, with effects sitting about 1.3x above the music.

`tools/verify_music.cjs` also checks the effects: it reads every `emit()` in `core.js` and asserts each sounding event has a cue, so a newly added event cannot ship silent. Only `save` and `stage` are silent by design.

## First-clear pop-ups

Beating a captain for the first time pauses the game and explains what it just handed you: the key, what it costs, and the rules that are easy to miss — that Gatling commits Luffy for the whole barrage, that Gear 2's activation can be cancelled by a hit. It waits 2.6 seconds so the victory shout lands first, and it fires only on a first clear; rematches skip it. The copy in `UNLOCKS` in `play/game.js` follows the real figures in `core.js`, so it stays true if those are retuned.

The `victory` event carries `first` and `boss`, and `tools/verify_gear.cjs` asserts that detail survives, since the pop-up keys off it.

## Heads-up display

One console in the upper-left carries the straw-hat crest, Luffy's name, the berry count, current/maximum health, the health track, the three special segments, the dash cooldown and both special-move keys. The continuous health track pulses its rim below 25% health. A full special segment shimmers. Gum-Gum Gatling shows a padlock until Buggy is defeated. Below the console sit the `LVL` badge and, once Kuro has fallen, the Gear 2 badge: an `X` cap, the name, and a well that drains through the transformation with the seconds left beside it. It dims when there is not a full bar to spend. Both badges share the console's plate and its baked pixel lettering — the Gear indicator and the meat label were the last HUD text drawn in the browser's own font, which is why they looked washed out beside everything else. Health uses a numeric pool with no segment dividers. Character name, crest and move labels follow the selected crew member. The medallion carries Luffy's straw hat, baked into `hud-console.svg`; playing as Zoro covers it with `hud-zoro-crest.svg`, his three gold earrings drawn from the same generator in the same pixel idiom. It replaces the whole medallion rather than just the emblem, because masking a pixel disc with a canvas arc left an antialiased crescent of straw hat around the rim -- and because the cropped portrait it replaces was a slice of generated character art, which read as a photograph pasted into a pixel HUD. `tools/verify_scene.cjs` reads the console's own medallion rows out of the SVG and fails if the crest is ever too small or off-centre to cover them. The boss console at the bottom of the screen uses the same plate, lettering and palette: Buggy's name, the current phase, a red health fill, a pale trail that drains a beat later so a heavy hit stays readable, and a gold tick at the half-health point where he splits into phase two. It appears only once the encounter starts. The console, the `LVL` badge and the meat panel all start at the same x, so the left of the screen reads as one straight gutter. The Gear 2 badge is the deliberate exception: it shares the `LVL` badge's row, placed a fixed gap off its right edge, so the two read as a pair on one line rather than as a stack. `tools/verify_scene.cjs` lifts the geometry table out of `play/game.js` and fails if a gutter anchor drifts, if the badge pair comes apart, or if anything falls out of step with `hud-layout.json`.

## Challenge update

The world camera is now 1.35× closer while health bars stay the same screen size. Mouse aiming is converted through that zoom. The game shows only short interaction prompts such as **Press E to rest**; stairs have no tooltip. Travel destinations, region names, notifications and controls live below the canvas. Attacks use poses, warning flashes and ground markers instead of instructional labels.

## Playable route

1. **Sunny:** both decks and the W/S stair connection remain playable. Rest at the galley snail and use the right-hand lower-deck marker to travel.
2. **Broken quays:** 4,200 world pixels, up from 1,840. Nine pirates guard landing patrols, staggered cargo stacks, a signal quay, suspended hoists, a spiked warehouse barricade and a crane crossing. Gaps make platforming mandatory. One hoist moves horizontally. The dock checkpoint is on the signal quay.
3. **Rooftop siege:** 4,800 world pixels, up from 2,080. Ten pirates guard an awning ascent, chimney jumps, a courtyard, a bell-tower crossing and the final barricade. An elevator platform moves vertically. Ground spikes punish careless rushing. A new courtyard checkpoint breaks up the longer route; the circus checkpoint remains before Buggy.
4. **Buggy:** five shuffled attack types in phase one—knife fans, lunges, returning hands, impact bombs and aerial dives. Phase two adds staggered crossfire, double lunges and shorter delays. A landing marker warns of the dive. He closes distance faster, can target an airborne Luffy, and does not immediately repeat an attack type. Victory still grants 50 berries and levels Luffy up.

Melee pirates pursue beyond their original spawn areas. They navigate to connected platforms, jump after Luffy, drop down when needed, and lunge during attacks. Cutlass pirates can follow a first swipe with a second. Cutlass/brute/bomber health is now 5/8/4. Bomb throwers retreat from close pressure and throw more often.

Bombs explode immediately when they touch Luffy or the top, side or underside of terrain, including moving platforms. A swept collision check catches impacts between simulation steps. Bombs falling into a gap continue downward; they do not explode on an invisible floor. Returning hands reverse direction, so crossing their first pass is not the entire dodge.

Resting opens a card with two choices: **Resume** and **Fast travel**. Fast travel lists islands — Thousand Sunny, Orange Town, Syrup Village — and choosing one lists the snails activated on it, with the area beneath each name and **You are here** on the one you are standing at. An island appears only once it has an activated snail: somewhere you walked past but never saved at is not somewhere you can travel to. Islands and snails are listed in voyage order rather than the order they happened to be activated in, and `Esc` walks back out one view at a time before it leaves the rest. This replaces a single flat row of every activated snail, which stopped being readable once the second island opened up. The grouping lives in `ISLANDS` in `core.js`, with chapter two naming its own island alongside its stages; `tools/verify_playable.cjs` fails if a stage with snails is missing from that list, since its snails would silently vanish from the menu rather than erroring. Rest restores all five health points and respawns ordinary pirates. A nearby pirate prevents resting. Death returns you to the last saved snail and leaves a recoverable berry satchel on your last safe surface. Spike surfaces and moving platforms are excluded from safe-surface recording. Dying again replaces that satchel. The pause menu offers Return to checkpoint as a prototype recovery option.

## Scale and scenery

Luffy stands about 64 world pixels tall. The pirates were drawn shorter than that — an Orange Town cutlass reached 58 — so grown men read as smaller than a teenager. Sprite scales now put them clearly above him: chapter-one cutlass 69, powder runner 73, bruiser 91; Syrup's Black Cats 75-81. Bosses sit above the crew again: Buggy 90-96 depending on the sheet, Kuro 111. Only the artwork changed; hitboxes and attack ranges live in `core.js` and are untouched.

Health bars and wind-up tells are placed from each sprite's measured art height rather than a fixed offset, so they clear the head at any scale. `ENEMY_ART`, `CAT_ART` and `BOSS_ART` in `play/game.js` hold those measurements; the boss figures are each sheet's tallest frame, so a tell never lands inside a raised pose.

The circus tent art stops at world y 413.6 while the arena floor is at 430, which left the tent hanging in mid-air. `layers/circus-base.svg` fills that band with the tent's dark underside, a striped valance and a packed-earth berm with roped stakes, drawn on the tent's own 0.3 camera factor so the two stay attached. Only about 28 of its rows clear the floor, so the band is kept flat: a scalloped hem is lost at that size, and drawing one over the sky showed daylight between its points.

## Travel signs

Every stage exit is marked by a wooden signpost: a planked board with iron straps, nail heads and a carved destination name, on a grained post braced at the foot. The post runs to the very bottom row of the asset, because the sign is drawn with its bottom edge on the ground line — empty rows there read as the post hovering, which is exactly what an earlier version did. Angled braces rather than an earth mound, so the foot reads correctly on planking, stone and the Sunny's grass alike. The name and the direction chevron tell you where the marker leads before you press E. Boards are generated by `assets/chapter-01/ui/build_hud.py` into `assets/chapter-01/props/`, and the lettering comes from the same 3 x 5 pixel font as the HUD, which now carries the full alphabet so any label can be set at runtime.

Sign labels are set at a wider advance than HUD numbers, because world text passes through the 1.35x camera zoom and tight letters run together. The board is sized so the longest label still clears the iron straps. No label uses W, M or N: three pixels is not enough width to separate those from H once the zoom blurs them, so the rooftop route is signed ROOFS rather than TOWN and the hub is SHIP rather than SUNNY. The same glyphs are fine in the HUD, which draws at 1:1 screen scale.

## Sunny changes

The ship is larger than the art-study composition, with a camera following Luffy across its interior. Luffy is slightly smaller on the Sunny. Both deck floors have collision surfaces aligned with the grass artwork; the stairs connect them. The flag now sits on a pole mounted on the lantern above the round rear roof. The camera pans upward as Luffy reaches the upper deck, revealing that roof and flag.

The deck railing stays in front of the crew. Its balusters stop at world y 397 while the deck runs to 407, and that bare strip used to leave Luffy's sandals visible below the railing, detached from the legs behind it. The bottom of the deck grass is now redrawn in front as well, closing the strip so he stands in the lawn with the railing crossing his shins. It reuses the ship layer's own draw call under a clip, so the foreground copy lands pixel-identical on the background one. Ship art, local props and Luffy share a gentle visual bob. Gameplay uses stable ship-local coordinates. Ocean animation remains independent and exclusive to the Sunny. The water now uses the camera factors from the chapter layer contract — 0.22 for the sea behind the ship, 1.08 for the foreground surf — instead of being pinned to the screen, so the waves hold their place in the world and the ship sails past them. The finite wave strip is mirror-tiled to cover the wider travel; alternate copies flip, so a join is continuous regardless of how the source edges meet. The lower hull is masked by foreground waves; the deck stays clear.

## Saving

Existing checkpoint IDs and boss progression are preserved by this update. Saved checkpoints use their new map positions; old berry satchels are placed on nearby reachable static ground if the map layout has changed.

The browser stores a versioned save under `straw-hat-first-voyage-v1`. That key keeps the project's earlier working title on purpose: renaming it would orphan every save already in a player's browser, and the string is internal — nothing shows it. Leave it alone unless you also write a migration that reads the old key. It holds: last rested checkpoint, saved berries, dropped satchel and Buggy's permanent defeat flag. Resting, death, berry recovery and boss victory write saves. Reload resumes at the saved checkpoint with full health; ordinary enemies reset. New voyage replaces this prototype's save. Browser storage is local to the browser/profile and site origin.

## Implementation and checks

- `play/core.js`: browser-independent fixed-step gameplay, stage data, collision, combat, enemy states, checkpoints and save validation.
- `play/game.js`: canvas renderer, keyboard/mouse input, camera, UI, audio feedback and local storage.
- `play/index.html` / `play/style.css`: title screen, pause menu and controls.
- `play/special-art.js`: articulated two-arm Bazooka and layered Gatling barrage animation.
- `assets/chapter-01/ui/build_hud.py`: regenerates the HUD console, bar fills, pixel glyph strip and badges as transparent SVGs. Geometry is mirrored in `ui/hud-layout.json`; `drawHud` in `play/game.js` draws every piece at its authored size.
- `tools/verify_playable.cjs`: seventeen checks cover movement, stairs, directional attacks, special charge/cost/timing/damage/cancellation, melee platform pursuit, attack wind-ups, impact bombs, moving-platform carrying, spikes, parkour reachability, checkpoint compatibility, boss variety, rewards and save validation.

Run `node tools/verify_playable.cjs`. All seventeen checks pass. The route checks isolate traversal from combat; they demonstrate reachable jumps rather than a full human playthrough under enemy pressure. Human playtesting remains necessary.

## Current limits

This is the first compact playable slice. This update raises combat pressure and traversal demands; difficulty still needs tuning from play sessions. The cleaned artwork still uses sparse key poses, so running and attack animation need additional drawings. Rubber punches and flying hazards use simple runtime shapes. Floor/platform art is provisional. The hub shop, inventory, crew conversations, controller/touch support, full audio, shortcut persistence and later bosses are future work. Gear 2 unlocks after Kuro in Chapter 2. Combat timings need human playtesting beyond the automated checks.

Buggy can be challenged again by pressing E near his arena marker after victory. Rematches preserve the Gatling unlock and do not repeat the first-clear 50-berry reward.


## Chapter 2 combat update

Desktop changes through `1433dc7` are preserved. Trees now root into solid ground sections instead of spanning parkour gaps. Kuro cycles through lunges, claw swipes, retreat-and-dash feints, aimed aerial dives with landing shockwaves, and ranged claw fans. His second phase adds repeated pursuit dashes. Windups, afterimages, claw arcs and recovery poses make both bosses more readable.

Kuro permanently unlocks **Gear 2**. **X** spends all charge: 1/2/3 whole bars grant **3/7/13 seconds** after a 0.6-second ground-fist startup. Partial leftover charge is also consumed. Startup can be interrupted; no refund. Hold left click for automatic punches at twice normal speed; dash cooldown is halved. Red skin, a faint glow, steam and a countdown indicate the buff. **Right click** fires an aimed **Jet Stamp**, one heavy hit (12× level-scaled base damage, matching Bazooka), and ends the buff immediately. Room changes, resting and death clear Gear 2; pausing freezes its timer. Existing Kuro-cleared saves receive the unlock automatically.

Validation: `node tools/verify_gear.cjs` covers durations, interruption, pause, attack cadence, dash cooldown, finisher damage, state cleanup, save unlock and Kuro move variety. Existing playable, chapter, motion and scene checks also pass. Animation uses the existing artwork with runtime effects; difficulty still needs human playtesting.


## Kuro arena and phase-two revision

Kaya's mansion now follows the user's series reference, rendered in the game's pixel-art style: blue roof, curved gable, balcony, white fence and large left-hand tree. The courtyard has its own ground treatment and restrained background movement. Art prompts and source/atlas details are recorded in `assets/chapter-02/ARENA_ART.md` and `assets/chapter-01/motion/JET_STAMP.md`.

At half health Kuro immediately discards his first-phase attacks and enters a 1.05-second telegraphed phase change. Phase two uses a distinct shuffled set: three retargeted pursuit dashes, two aimed pounces, two staggered claw volleys, and a faster flurry. Each combo has its own short follow-up tells and a final 0.75-second recovery opening. Ranged attacks now release from his hand during the claw sweep, then return to standing, instead of using a lunge or collapse pose.

Jet Stamp uses four new full-body kick poses and deals exactly the same damage as Bazooka (12× current level damage), once per enemy. It impacts at 0.25 seconds and completes its retraction by 0.72 seconds. Gear 2 ends mechanically immediately on Jet Stamp, or at expiry, with one exit cue and a 0.65-second visual steam/tint fade. Stronger transformation entry cues and a distinct kick windup/impact cue accompany the move.
