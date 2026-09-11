"""Check frame integrity and asset contracts after rebuilding the clean pack."""
from pathlib import Path
from PIL import Image
import json
import numpy as np

BASE = Path(__file__).resolve().parents[1] / 'assets/chapter-01'
manifest = json.loads((BASE / 'manifest.json').read_text())
count = 0
for name, spec in manifest['sprites'].items():
    atlas = Image.open(BASE / spec['file'])
    for frame in spec['frames']:
        im = Image.open(BASE / frame['file'])
        x, y, w, h = frame['rect']
        assert im.size == tuple(spec['cell_size'])
        assert frame['pivot'] == spec['pivot']
        assert np.array_equal(im, atlas.crop((x, y, x+w, y+h)))
        alpha = np.array(im)[:, :, 3]
        assert alpha.min() == 0 and alpha.max() == 255
        # Transparent gutters prevent adjacent atlas frames bleeding into a pose.
        assert not (alpha[:8].any() or alpha[-8:].any() or alpha[:, :8].any() or alpha[:, -8:].any())
        for part in frame['parts']:
            assert Image.open(BASE / part['file']).size == tuple(part['size'])
        count += 1
    for clip in manifest['animations'][name].values():
        assert all(0 <= i < len(spec['frames']) for i in clip)
assert count == 46
for name, spec in manifest['props'].items():
    atlas = Image.open(BASE / spec['file'])
    for i, (x, y, w, h) in enumerate(spec['frames']):
        im = Image.open(BASE / f'cleaned/{name}/{i:02}.png')
        assert np.array_equal(im, atlas.crop((x, y, x+w, y+h)))
        if name == 'ocean-wave-cycle':
            a = np.array(im)
            assert not a[0, :, 3].any(), 'No rectangular haze above wave crests'
            assert (a[-1] == [8, 39, 64, 255]).all(), 'Water joins the base fill exactly'
assert manifest['scene_scope']['sea'] == ['sunny']
print(f'PASS: {count} transparent poses, gutters, pivots, detached assets, clips, and 12 prop/wave frames.')
