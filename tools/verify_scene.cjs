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
