# Terrain refresh

`pirate-terrain-atlas.png` was generated with the built-in image-generation tool. Four quadrants: dock planks, mossy stone foundations, sandstone coping, reinforced timber. The renderer samples each quadrant and repeats it in world coordinates. Foreground landing lips remain readable; distant foundation textures are darkened.

Final generation prompt:

Use case: stylized-concept. Asset type: single terrain texture atlas for a pixel-art pirate-town side-scrolling platformer. Create a square 1024x1024 image with exactly four equal 512x512 quadrants, no margins or dividers. Top left: seamless weathered warm brown wooden dock planks with occasional iron nails, front-facing horizontal planks. Top right: seamless dusky purple gray rough stone masonry foundation blocks with moss in cracks. Bottom left: seamless warm sandstone cobblestone masonry with worn edges and a few tiny weeds. Bottom right: seamless dark timber beams with iron bindings for suspended wooden platforms. All textures fill their quadrant edge to edge, flat orthographic front elevation, consistent chunky pixel art, warm amber highlights and deep navy shadows, restrained contrast, no perspective, no text, no objects, no transparency. This atlas will be sampled as repeating surface textures on playable terrain and the distant town foundations.

The generator returned 1254×1254; quadrant sampling uses the actual dimensions.

`../layers/sunny-rails-foreground.png` is a scripted silhouette extraction from the existing ship art, using the user's authorization for pixel cleanup. Rebuild with `python3 tools/build_terrain_layers.py`. Openings are transparent, rather than copied scenery. Review materials and punch poses at `/play/art-review.html`.
