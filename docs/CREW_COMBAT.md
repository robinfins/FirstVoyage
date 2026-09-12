# Crew and health update

The playable build starts with **600 HP**. Defeating Buggy raises maximum health to **720**, and Kuro to **840**. Each first victory adds 120 current HP as well; rematches do not repeat progression rewards. The HUD is a continuous bar with current/maximum HP, and pulses below 25% health.

| Incoming attack | Damage |
|---|---:|
| Cutlass melee | 155 |
| Bruiser melee | 230 |
| Knife projectile | 110 |
| Powder bomb | 140 |
| Buggy melee / detached hand / landing blast | 170 |
| Kuro melee / landing blast | 185 |
| Kuro ranged claw wave | 135 |
| Spikes / fall | 120 |

F consumes one of three meat portions and restores **300 HP** after 0.65 seconds, capped at maximum health. Damage interrupts eating. Resting refills health and meat. These values target four ordinary cutlass hits or three heavy hits to defeat a starting character; human difficulty tuning remains ongoing.

## Checkpoint crew selection

Rest at any activated snail, then choose **Switch character**. Luffy and Zoro are available from the beginning and share health progression, Berries, checkpoints, and boss victories. Switching clears ability charge and temporary combat states. Selection is saved under the existing `straw-hat-first-voyage-v1` key; older saves default to Luffy and keep their progression.

| Input | Luffy | Zoro |
|---|---|---|
| Left click | Aimed punch, 116 reach | Three-sword slash, 90 reach, 25% more damage |
| Space | Ground / air dash | Same dash |
| Right click | Jet Stamp during Gear 2 | Hold frontal guard |
| Q, two bars | Bazooka | Oni Giri |
| R, three bars, after Buggy | Gatling | Tiger Trap |
| X, after Kuro | Gear 2 | No transformation |

Zoro's guard follows the cursor and holds movement. It reduces incoming frontal melee and ranged damage by **70%**, rounded up. Guarding within **0.16 seconds** before a melee hit instead takes no damage and stuns its attacker for **one second**, including bosses. Projectiles and explosions cannot be parried. Rear hits and environmental hazards bypass guard. A new parry cannot be armed more often than every 0.35 seconds; holding guard does not refresh the window. Attacking and guarding are mutually exclusive, and dash releases guard.

**Oni Giri:** crossed-sword startup for 0.18 seconds, then a forward rush at 780 pixels/second through 0.52 seconds. Total commitment 0.72 seconds. The swept sword lane hits each enemy once for 12 times level-scaled base damage. The rush moves farther than an ordinary dash and follows normal stage bounds and gravity. Enemy attacks miss during the active rush; startup, recovery, and environmental hazards remain vulnerable.

**Tiger Trap:** two blades raised vertically behind the back, followed by an overlapping downward chop at 0.48 seconds. One hit for 18 times level-scaled base damage, with 1.1 seconds total commitment. Both specials require starting on the ground and consume charge immediately. Dash can cancel them without refunding charge. Special hits never build meter.

## Assets and checks

Zoro uses 16 generated key poses in `assets/characters/zoro/zoro-atlas.png`, with two refined crossed-sword Oni Giri poses in `assets/characters/zoro/oni-giri.png`, decoded from a magenta color key once at loading. `play/zoro-art.js` supplies measured source rectangles, feet registration, and combat effects. The original image remains unmodified. See the asset folder's `PROMPTS.md` for generation details. Animation remains key-pose based, like the existing prototype.

Run `node tools/verify_crew.cjs` for health, guard/parry, character/save, boss stun, and special-move checks. Existing playable, chapter-two, Gear 2, motion, scene, music, and cleanup checks remain applicable. `tools/verify_crew_browser.cjs` uses Playwright and an installed Edge browser (or `CREW_BROWSER` channel) against a local server; set `CREW_QA_URL` and optionally `CREW_QA_DIR` for the URL and screenshot directory.
