# Luffy movement refresh

Generated using the built-in image-generation tool; prompt in `PROMPT.txt`. Original artwork is retained in `luffy-motion-source.png`. The script `tools/build_luffy_motion.py` removes the exterior checkerboard, isolates each character and registers the hips and feet on a 384×384 cell. Output: `luffy-motion.png`, a 4×4 atlas, with source registration recorded in `registration.json`.

The runtime uses six run poses (0, 2, 3, 4, 6, 7), four slower walk/stair poses (8–11), four velocity-driven jump poses (12–15), and a brief stationary landing crouch (1). The two deep crouches in the source run row are excluded from the run loop to avoid a large vertical pop. Cadence follows distance travelled; facing is mirrored. Existing idle, dash and combat artwork remains in use so the articulated attack renderer retains its source registration. These are generated key poses, not hand-authored frame-perfect animation.

Run `node tools/verify_motion.cjs` to check state selection and cadence. Preview the cycles at `/play/motion-review.html`.

## Full-body stride replacement

The procedural leg experiment has been removed. Ground locomotion now renders six complete drawn poses from `luffy-stride.png`, including passing and lifted-knee poses with corresponding upper-body changes. No drawn body parts are replaced with geometric limbs. Rebuild with `tools/build_luffy_stride.py`; original source and generation prompt are preserved. The original jump frames and combat animations are unchanged.
