# First Voyage — playable prototype

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
| Esc | Pause / resume |

A dash has a short cooldown and avoids damage while active. You get one dash in the air, refreshed by landing. Each click is one punch. Jumping uses a short input buffer and coyote window. Moving away from the tab pauses the game. Sound effects can be enabled with the Sound button.

## Special-move meter

Three segments sit directly below Luffy's health bar. Every successful ordinary punch adds 20 charge, so five hits fill one segment. Charge is capped at 300 and is cleared on death. Special-move hits never recharge the meter.

**Gum-Gum Bazooka** costs 200 charge. Both arms pull behind Luffy, then fire together after a readable 0.62-second wind-up. The single impact reaches 210 world pixels and deals 12 times the current ordinary-punch damage.

**Gum-Gum Gatling** unlocks permanently after defeating Buggy and costs 300 charge. Luffy commits to an 18-hit barrage lasting 1.8 seconds. The attack begins after 0.18 seconds, then applies one damage pulse every 0.085 seconds within a 165-pixel lane. It deals more total damage than Bazooka but leaves Luffy committed longer.

Both moves require Luffy to be grounded and lock their direction when activated. Movement, jumping, ordinary attacks and interactions are unavailable during the move. Dash cancels either special when a dash is available; consumed bars are not refunded. The controls below the canvas show current charge and only enable a move when its cost and activation conditions are met.

## Challenge update

The world camera is now 1.35× closer while health bars stay the same screen size. Mouse aiming is converted through that zoom. The game shows only short interaction prompts such as **Press E to rest**; stairs have no tooltip. Travel destinations, region names, notifications and controls live below the canvas. Attacks use poses, warning flashes and ground markers instead of instructional labels.

## Playable route

1. **Sunny:** both decks and the W/S stair connection remain playable. Rest at the galley snail and use the right-hand lower-deck marker to travel.
2. **Broken quays:** 4,200 world pixels, up from 1,840. Nine pirates guard landing patrols, staggered cargo stacks, a signal quay, suspended hoists, a spiked warehouse barricade and a crane crossing. Gaps make platforming mandatory. One hoist moves horizontally. The dock checkpoint is on the signal quay.
3. **Rooftop siege:** 4,800 world pixels, up from 2,080. Ten pirates guard an awning ascent, chimney jumps, a courtyard, a bell-tower crossing and the final barricade. An elevator platform moves vertically. Ground spikes punish careless rushing. A new courtyard checkpoint breaks up the longer route; the circus checkpoint remains before Buggy.
4. **Buggy:** five shuffled attack types in phase one—knife fans, lunges, returning hands, impact bombs and aerial dives. Phase two adds staggered crossfire, double lunges and shorter delays. A landing marker warns of the dive. He closes distance faster, can target an airborne Luffy, and does not immediately repeat an attack type. Victory still grants 50 berries and permanently doubles punch damage.

Melee pirates pursue beyond their original spawn areas. They navigate to connected platforms, jump after Luffy, drop down when needed, and lunge during attacks. Cutlass pirates can follow a first swipe with a second. Cutlass/brute/bomber health is now 5/8/4. Bomb throwers retreat from close pressure and throw more often.

Bombs explode immediately when they touch Luffy or the top, side or underside of terrain, including moving platforms. A swept collision check catches impacts between simulation steps. Bombs falling into a gap continue downward; they do not explode on an invisible floor. Returning hands reverse direction, so crossing their first pass is not the entire dodge.

Rest restores all five health points and respawns ordinary pirates. A nearby pirate prevents resting. Death returns you to the last saved snail and leaves a recoverable berry satchel on your last safe surface. Spike surfaces and moving platforms are excluded from safe-surface recording. Dying again replaces that satchel. The pause menu offers Return to checkpoint as a prototype recovery option.

## Sunny changes

The ship is larger than the art-study composition, with a camera following Luffy across its interior. Luffy is slightly smaller on the Sunny. Both deck floors have collision surfaces aligned with the grass artwork; the stairs connect them. The flag now sits on a pole mounted on the lantern above the round rear roof. The camera pans upward as Luffy reaches the upper deck, revealing that roof and flag.

Ship art, local props and Luffy share a gentle visual bob. Gameplay uses stable ship-local coordinates. Ocean animation remains independent and exclusive to the Sunny. The lower hull is masked by foreground waves; the deck stays clear.

## Saving

Existing checkpoint IDs and boss progression are preserved by this update. Saved checkpoints use their new map positions; old berry satchels are placed on nearby reachable static ground if the map layout has changed.

The browser stores a versioned save under `straw-hat-first-voyage-v1`: last rested checkpoint, saved berries, dropped satchel and Buggy's permanent defeat flag. Resting, death, berry recovery and boss victory write saves. Reload resumes at the saved checkpoint with full health; ordinary enemies reset. New voyage replaces this prototype's save. Browser storage is local to the browser/profile and site origin.

## Implementation and checks

- `play/core.js`: browser-independent fixed-step gameplay, stage data, collision, combat, enemy states, checkpoints and save validation.
- `play/game.js`: canvas renderer, keyboard/mouse input, camera, UI, audio feedback and local storage.
- `play/index.html` / `play/style.css`: title screen, pause menu and controls.
- `play/special-art.js`: articulated two-arm Bazooka and layered Gatling barrage animation, plus the segmented meter renderer.
- `tools/verify_playable.cjs`: seventeen checks cover movement, stairs, directional attacks, special charge/cost/timing/damage/cancellation, melee platform pursuit, attack wind-ups, impact bombs, moving-platform carrying, spikes, parkour reachability, checkpoint compatibility, boss variety, rewards and save validation.

Run `node tools/verify_playable.cjs`. All seventeen checks pass. The route checks isolate traversal from combat; they demonstrate reachable jumps rather than a full human playthrough under enemy pressure. Human playtesting remains necessary.

## Current limits

This is the first compact playable slice. This update raises combat pressure and traversal demands; difficulty still needs tuning from play sessions. The cleaned artwork still uses sparse key poses, so running and attack animation need additional drawings. Rubber punches and flying hazards use simple runtime shapes. Floor/platform art is provisional. The hub shop, inventory, crew conversations, controller/touch support, full audio, shortcut persistence and later bosses are future work. Gear 2 remains outside this chapter. Combat timings need human playtesting beyond the automated checks.

Buggy can be challenged again by pressing E near his arena marker after victory. Rematches preserve the Gatling unlock and do not repeat the first-clear 50-berry reward.
