# Straw Hat: Grand Line — game overview

Version 0.1 · Proposed direction · 10 September 2026

Chapter 01 update: [Orange Town and Buggy](CHAPTER_01.md) now defines the current opening scope. It uses pirate enemies only and Den Den Mushi checkpoints. The original campaign overview below is retained as broader context.

## The promise

Play as pre-timeskip Monkey D. Luffy in a pixel-art action platformer with demanding but readable combat, interwoven routes, memorable One Piece bosses, and a home aboard the Thousand Sunny. Dash through an attack, land a stretched punch, open a shortcut, and return to the crew stronger than before.

The Sunny is available from the beginning. This is a deliberately condensed alternate retelling: familiar islands and enemies retain their broad order, while crew availability, ship timing, and power unlocks are adapted for the game. Gear 2 after the third boss is an intentional change to the original story. Later chapters below are a proposed roadmap, not first-build scope.

## Design pillars

1. **Elastic combat.** Luffy's punches have reach, stretch, recoil, and strong impact. Dashing and jumping create openings; positioning matters more than grinding.
2. **Fair danger.** Enemies telegraph attacks with poses, sound, and readable effects. Damage comes from committed attacks and explicit hazards, rather than every incidental overlap.
3. **A world that opens up.** New abilities unlock routes in earlier areas. Each island connects back to its dock through useful shortcuts.
4. **A crew worth coming home to.** The Sunny provides rest, upgrades, consumables, conversations, and the voyage map.

## The core loop

Rest aboard the Sunny → choose an island → explore linked rooms → fight pirates and Marines → collect Berries and hidden upgrades → open shortcuts and checkpoints → learn and defeat a boss → bring a story reward home → unlock a new ability or voyage.

Islands are distinct interconnected regions selected from Nami's chart. Inside a region, movement between rooms is continuous; sailing is initially a short transition rather than a separate sailing simulation. Rest points allow return to the Sunny so shopping does not require retracing every room.

## Luffy's starting kit

| Action | Intended behavior |
|---|---|
| Run and jump | Quick acceleration, variable jump height, modest air steering, jump buffering, and coyote time. |
| Dash | Short directional burst with a clear cooldown. One air dash refreshes on landing. Invulnerability occupies only part of the dash. |
| Light attack | Two quick close punches followed by a more committed finisher. Avoid a long combo that traps the player. |
| Gum-Gum Pistol | Hold and release attack for a longer stretched punch. Reach trades against a visible wind-up and recovery. |
| Air attack | A short forward punch that preserves control and can hit airborne enemies. |
| Eat meat | Limited healing charges, restored at rest. Eating takes time and can be interrupted. |
| Interact | Talk, buy, rest, open doors, collect important items, and sail. |

There is no stamina cost for basic movement or ordinary punches. The souls-like tension comes from timing, healing commitment, recovery after attacks, checkpoints, and recovering dropped currency. The first prototype does not need parrying, weapon switching, or a large combo tree.

Suggested controls: A/D or left stick to move; Space / south face button to jump; Shift / right shoulder to dash; J / west face button to attack; K / north face button to heal; E / interact prompt to interact; Q / left shoulder for Gear 2 once unlocked. Support rebinding and controller prompts before a public demo.

### Initial tuning hypotheses

These values are starting points for playtesting, not validated balance. Simulate at a fixed 60 Hz and author movement in logical pixels per second.

| Parameter | Starting target |
|---|---|
| Logical viewport | 640 × 360; integer upscaling where possible |
| Luffy visual height | Approximately 56–64 logical pixels including hat |
| Movement speed | 150 logical pixels/second |
| Jump | About 80–90 pixels high; variable with button hold |
| Coyote time / jump buffer | 0.10 / 0.12 seconds |
| Dash | 0.18 seconds at 400 pixels/second; 0.55-second start-to-start cooldown |
| Dash invulnerability | Starts 0.03 seconds into dash; lasts 0.10 seconds |
| Starting health / healing | 5 health segments; 3 meat charges restoring 2 segments each |
| Heal commitment | 0.85 seconds; consume a charge when healing completes |
| Damage grace period | Approximately 0.8 seconds to avoid repeated damage from one attack |

Use a narrower gameplay hurtbox than Luffy's hat silhouette. Rubber arms and visual dash trails must not expand his body hurtbox. Attack hitboxes exist only during their active frames. Allow dash cancellation after the first two punches connect or recover; the finisher and charged punch retain meaningful commitment.

## Death and checkpoints

- Rest at safe campfires or the Sunny's galley to refill health and meat. Ordinary enemies reset; defeated bosses stay defeated.
- On death, drop carried Berries as a recoverable treasure satchel near the last safe ground position. Never place it inside a lethal pit or underwater.
- Dying again before retrieval replaces the old satchel. Permanent upgrades, unlocked doors, boss victories, and quest items persist.
- Place a rest point immediately before Buggy. Once a shortcut is opened, later boss returns should also be short.
- Water and bottomless pits return Luffy to safe ground and remove one health segment. This supports his inability to swim without forcing a complete runback for every missed jump.

## The Sunny hub

Make the main deck a compact, walkable side-view space with recognizable woodwork, grass, orange trees, the lion figurehead, and a warm galley. Services should be close together. The crew is available as needed by this alternate retelling.

| Crew / place | Service | Example |
|---|---|---|
| Sanji / galley | Rest, healing capacity, consumables | Meat ration upgrade; boxed meal for a temporary defense buff |
| Nami / chart table | Shop, maps, voyage selection, Berry storage | Island map; return-to-checkpoint item; deposit carried Berries |
| Usopp / workbench | Equip passive trinkets with a slot budget | Longer pickup range; extra Berries; slightly faster recovery after healing |
| Chopper / infirmary | Permanent health growth | Collect four Vitality Fragments to gain one health segment |
| Franky / ship station | Later hub and shortcut upgrades | Improve access between deck services; unlock region return routes |

For the first build, implement only Sanji's rest point and Nami's shop/chart; other stations can remain visual placeholders. Use one common currency, Berries. Boss rewards and exploration fragments unlock major powers so spending cannot accidentally prevent progression. Start with three trinket slots and make powerful effects consume more than one.

Suggested first shop inventory: island map, single-use return item, and a meal that reduces the next hit by one health segment, to a minimum of one damage. Avoid an unlimited full-heal shop item. Ordinary level-ups are limited health/healing/passive improvements, with damage upgrades kept modest so earlier enemy patterns remain relevant.

## Proposed campaign and upgrades

| Chapter | Boss | Combat lesson | Permanent reward / world change |
|---|---|---|---|
| 1 · Orange Town | Buggy | Dash timing; choose safe moments to punish | First captain victory; dock access and Nami's next voyage |
| 2 · Syrup Village | Kuro | Fast approach tells; resist chasing | Second captain victory; rubber wall rebound opens vertical routes |
| 3 · Baratie | Don Krieg | Armor openings; punish committed attacks | Third captain victory; unlock Gear 2 after returning to the Sunny |
| 4 · Arlong Park | Arlong | Water hazards; controlled aggression | Rubber grapple for clearly marked anchors; optional East Blue routes |
| 5 · Alabasta | Crocodile | Arena control; interact with water sources to expose him | Gear 2 efficiency upgrade and route toward the sky islands |
| 6 · Skypiea | Enel | Vertical hazards and timing | Advanced aerial recovery; narrative reactions to Luffy's rubber body |
| 7 · Enies Lobby | Rob Lucci | Combine mobility, spacing, and burst windows | Gear 3 as a later expansion reward; first major campaign endpoint |

The Buggy prototype is the first deliverable. The three-boss East Blue arc is the next meaningful milestone. Arlong and everything beyond remain expansion scope until the basic game feels good.

### Gear 2: the three-boss payoff

Defeat Buggy, Kuro, and Don Krieg. Store their unique boss IDs as permanent victories. When all three are present, Sanji's galley gains a short recovery/training interaction that unlocks Gear 2 and a nearby practice encounter. Repeated victories over one boss must not count as three.

After unlocking it, dealing damage fills a 0–100 Drive meter. At full meter, activate an approximately eight-second transformation: steam, subtly pink skin, quicker punch recovery, a shorter dash cooldown, and Jet Pistol replacing the charged punch. Start with roughly 20% faster attack recovery; tune through playtesting. The meter cannot refill while transformed, and taking damage does not generate Drive.

When time expires, return to the base kit without forced immobility. Activation offers a short readable animation, not a free heal. Gear 2 must feel powerful without making every boss damage window safe. Mandatory traversal depends on permanent movement abilities; Gear 2 initially opens optional speed challenges so an empty meter cannot trap the player.

## First enemy set

| Enemy | Readable tell | Attack / response |
|---|---|---|
| Pirate cutlass fighter | Steps back and raises blade | Slow committed slash; dash through or retreat and punish |
| Marine swordsman | Braces behind his weapon | Short forward lunge; bait it, jump or dash past, strike from behind |
| Marine rifleman | Plants feet and raises barrel | A single visible projectile after an aim cue; jump or use the dash window |

Introduce each enemy alone before mixing them. Keep Marines' off-white uniforms and pirates' warm reds readable against the environment. Standard grunts share damage/knockback systems, but have distinct attack timing and posture.

### Buggy: first boss specification

**Arena:** broad circus courtyard with a flat center, two low side platforms, no lethal pits, and minimal visual clutter behind attacks.

**Phase one, 100–50% health:** alternate a clearly wound-up knife spread, a detached-hand sweep across floor height, and a body lunge. Never start a new attack before the previous one leaves a safe response. Buggy's torso is the main damage target; detached hands are hazards, not extra damageable targets in the first implementation.

**Phase two, below 50%:** briefly split apart, then recombine in a readable position. Add one telegraphed bouncing bomb pattern and selected two-move sequences. Leave a larger recovery after a full sequence. The split transition must not damage the player without warning.

**Fairness rules:** show the wind-up before an attack becomes harmful; preserve at least one reachable safe region; do not spawn bombs underneath Luffy; distinguish harmless decoration from projectiles; keep phase transitions consistent after retries.

**Reward:** boss victory persists immediately, Berries go directly to the player, the next route unlocks, and the Sunny gains a new conversation. Gear 2 progress displays as one of three captain victories.

## Visual and audio direction

Use crisp pixel clusters, controlled shading, and dark navy contours. Luffy's straw hat, red vest, blue shorts, sandals, and long-limbed silhouette remain readable at gameplay scale. Gear 2 adds sparse steam that does not hide an enemy's tell. Sunny scenes lean toward amber, grass green, and warm wood; hostile regions favor blue, teal, purple, and selective red accents.

Use original room compositions and interface art. The Hollow Knight influence is in exploration rhythm, responsive combat, atmospheric depth, and the return-to-safety loop. Favor adventurous loneliness between encounters and a lively crew hub.

Audio priorities: distinct attack tells, elastic punch/recoil sounds, a dash cue, strong hit confirmation, ambient sea and rigging, and a warmer musical palette aboard the Sunny. Pair audio warnings with visible cues. Include adjustable screen shake and flashing effects.

## First playable slice

Aim for 15–25 minutes for a new player: Sunny deck → Orange Town dock tutorial → street fight → rooftop branch with a hidden health fragment → Marine lane → shortcut to dock → pre-boss rest → Buggy courtyard → return to the Sunny.

The prototype includes run, variable jump, ground/air dash, light combo, charged punch, healing, three grunt archetypes, one boss, rest/death/recovery, one shop, one optional pickup, and saving. It does not include the entire campaign. A developer-only Gear 2 preview can test the eventual payoff, but ordinary progression must leave it locked until the three-boss milestone exists.

Success means a player understands the dash window, can read Buggy's attacks after a few attempts, opens a meaningful shortcut, uses the Sunny's services, and wants to try the next island.
