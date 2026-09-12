const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const geometry = vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../preview/scene-geometry.js'), 'utf8') + '\nSceneGeometry');
for (const camera of [-100, 0, 100]) {
  for (const time of [0, 1.125, 2.25, 3.375, 4.5]) {
    const sunny = geometry.get('sunny', camera, time, false);
    assert(sunny.water);
    assert.equal(sunny.checkpoints[0].y, sunny.player.y);
    assert.equal(sunny.groundY - sunny.ship.y, 249);
    assert.equal(sunny.flag.x - sunny.ship.x, 303);
    assert.equal(sunny.flag.y - sunny.ship.y, -22);
    assert(sunny.groundY < sunny.waterline - 20);
    for (const stage of ['dock', 'streets', 'circus']) {
      const land = geometry.get(stage, camera, time, false);
      assert.equal(land.water, false);
      assert.equal(land.checkpoints.length, stage === 'circus' ? 0 : 1);
      for (const snail of land.checkpoints) {
        assert.equal(snail.y, land.groundY);
        assert(Math.abs(snail.x - land.player.x) > 80);
        assert(snail.x >= 60 && snail.x <= 610);
      }
    }
  }
}
assert.deepEqual(geometry.get('sunny', 0, 0, true), geometry.get('sunny', 0, 99, true));
console.log('PASS: four stages, camera extremes, shared deck/flag anchors, checkpoint clearance and reduced motion.');

// The overlay's left column is only as tidy as its weakest anchor: the Gear 2 badge used to sit
// 64px in from the rest, which read as a floating plate. Lift the geometry straight out of
// game.js so a hard-coded x can never quietly reintroduce a second gutter.
const hudSrc = fs.readFileSync(path.join(__dirname, '../play/game.js'), 'utf8');
// Up to and including the HUD.gear line: the gear anchor is derived from HUD.stamp, so the
// literal cannot be matched by hunting for a closing bracket.
const hudLiteral = hudSrc.match(/const HUD_X=[\s\S]*?^HUD\.gear=[^\n]*;/m);
assert(hudLiteral, 'game.js should declare HUD_X and the HUD geometry table');
// Round-tripped through JSON: arrays built inside a vm realm have their own Array prototype,
// so a deep-equal against ours fails on identical numbers.
const HUD = JSON.parse(vm.runInNewContext(hudLiteral[0] + '\nJSON.stringify(HUD)'));
const consoleLayout = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/chapter-01/ui/hud-layout.json'), 'utf8')).console;
const gutter = consoleLayout.left_gutter;
assert.equal(typeof gutter, 'number', 'hud-layout.json should name the shared left gutter');
for (const [name, x] of [['console', HUD.x], ['level badge', HUD.stamp[0]], ['meat panel', HUD.meat[0]]]) {
  assert.equal(x, gutter, `${name} should start at the shared left gutter`);
}
assert.deepEqual(consoleLayout.gear.screen_anchor, HUD.gear.slice(0, 2), 'hud-layout.json gear anchor should match game.js');
assert.deepEqual(consoleLayout.gear.size, HUD.gear.slice(2), 'hud-layout.json gear size should match game.js');
assert.deepEqual(consoleLayout.meat.panel_size, HUD.meat.slice(2), 'hud-layout.json meat panel size should match game.js');
assert.deepEqual(consoleLayout.meat.screen_anchor, HUD.meat.slice(0, 2), 'hud-layout.json meat anchor should match game.js');
assert.deepEqual(consoleLayout.level.screen_anchor, HUD.stamp.slice(0, 2), 'hud-layout.json level anchor should match game.js');
// The Gear 2 badge is deliberately off the gutter: it pairs with the level stamp on one row.
assert.equal(HUD.gear[1], HUD.stamp[1], "the gear badge should share the level stamp's row");
assert.equal(HUD.gear[0], HUD.stamp[0] + HUD.stamp[2] + consoleLayout.gear.gap_from_level_badge,
  "the gear badge should sit one fixed gap off the level stamp's right edge");
assert(HUD.gear[0] + HUD.gear[2] <= HUD.x + HUD.w, 'the badge row should not overhang the console above it');
assert(HUD.meat[1] + HUD.meat[3] <= 540, 'the meat panel should stay on screen');
// Zoro's crest plate hides Luffy's baked-in straw hat by redrawing the whole medallion, so it has
// to stay centred on it and stay at least as large as the disc it is covering -- off by a pixel and
// a crescent of straw hat shows around the rim.
const crest = consoleLayout.crest;
assert.deepEqual(crest.medallion_centre, HUD.medallion, 'hud-layout.json medallion should match game.js');
assert.equal(crest.size, HUD.crestSize, 'hud-layout.json crest size should match game.js');
const crestSvg = fs.readFileSync(path.join(__dirname, '../assets/chapter-01/ui/hud-zoro-crest.svg'), 'utf8');
const dims = crestSvg.match(/width="(\d+)" height="(\d+)"/);
assert(dims && Number(dims[1]) === HUD.crestSize && Number(dims[2]) === HUD.crestSize,
  'hud-zoro-crest.svg should be drawn 1:1 at the crest size, not resampled');
const consoleSvg = fs.readFileSync(path.join(__dirname, '../assets/chapter-01/ui/hud-console.svg'), 'utf8');
// The console's outermost medallion ring is the widest row of its edge disc: one run as wide as
// the disc's diameter, centred on it. Find it, and require the crest to cover that span.
const runs = [...consoleSvg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="1"/g)]
  .map(m => ({x: +m[1], y: +m[2], w: +m[3]}))
  .filter(r => r.y === HUD.medallion[1] && r.x < HUD.medallion[0] && r.x + r.w > HUD.medallion[0]);
const widest = Math.max(...runs.map(r => r.w));
assert(widest > 0, 'the console should draw a medallion row through the crest centre');
assert(HUD.crestSize >= widest, `crest (${HUD.crestSize}px) must cover the medallion (${widest}px)`);
// The sea used to be drawn 0.78x across but 0.54x down from a strip saved at a quarter of the
// resolution it was cleaned at -- stretched and magnified 2.1x at once. Both halves of that are
// easy to reintroduce by editing one number, so pin the shape of the fix rather than the values.
const seaLiteral = hudSrc.match(/const SEA_SCALE=\{[^}]*\};/);
assert(seaLiteral, 'game.js should declare SEA_SCALE');
const SEA = JSON.parse(vm.runInNewContext(seaLiteral[0] + '\nJSON.stringify(SEA_SCALE)'));
const zoom = Number(hudSrc.match(/const ZOOM=([\d.]+)/)[1]);
for (const layer of ['front', 'rear']) {
  assert.equal(typeof SEA[layer], 'number',
    `SEA_SCALE.${layer} should be one number, so the tile cannot be given a width and a height that disagree`);
  // World units per source pixel, times the world zoom, is screen pixels per source pixel.
  const onScreen = SEA[layer] * zoom;
  assert(onScreen <= 1,
    `the ${layer} sea is magnified ${onScreen.toFixed(2)}x on screen; it should be drawn at or below one screen pixel per source pixel`);
}
assert(SEA.rear < SEA.front, 'the distant sea should be drawn smaller than the foreground surf');
const ocean = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../assets/chapter-01/cleaned/environment-registration.json'), 'utf8'))['ocean-wave-cycle'];
assert(Array.isArray(ocean.cell_size) && Array.isArray(ocean.pivot), 'the ocean needs a registration');
assert(ocean.pivot[1] > 0 && ocean.pivot[1] < ocean.cell_size[1],
  'the waterline pivot should sit inside the wave strip; sea() places the crest from it');
// A tile has to cover half the view at least, or mirrored joins land repeatedly across the screen.
assert(ocean.cell_size[0] * SEA.front > 960 / zoom / 2,
  'the foreground wave tile is too narrow to cover the view');
console.log('PASS: HUD overlays share one left gutter, the badge row pairs up, the Zoro crest covers the medallion, the sea is drawn unstretched and unmagnified, and game.js agrees with hud-layout.json.');
