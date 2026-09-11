/* Shared placement rules. Artwork pivots and terrain anchors use logical pixels. */
const SceneGeometry = {
  get(stage, camera, time, reducedMotion) {
    if (stage === 'sunny') {
      const bob = reducedMotion ? 0 : Math.sin(time * Math.PI * 2 / 4.5) * 1.5;
      const ship = { x: Math.round(-camera * .4), y: Math.round(35 + bob), w: 640, h: 360 };
      const deckY = ship.y + Math.round(650 / 941 * ship.h);
      return { water: true, waterline: 319, ship, groundY: deckY,
        flag: { x: ship.x + 303, y: ship.y - 22, mastEndY: ship.y + 6 },
        checkpoints: [{ x: ship.x + 237, y: deckY, name: 'Sunny galley', scale: 1 / 20 }],
        player: { x: ship.x + 166, y: deckY } };
    }
    return { water: false, groundY: 278,
      checkpoints: stage === 'circus' ? [] : [{ x: (stage === 'dock' ? 180 : 494) - camera, y: 278,
        name: stage === 'dock' ? 'A · Dock signal' : 'B · Circus approach', scale: 1 / 18 }],
      player: { x: 295 - camera, y: 278 } };
  }
};
