# Mascot movement and interactive motion

This is the current follow-up to `SOFT_MOTION.md`. It retains the existing board, object positions, official artwork, three-line pink intro, 4.60-second scene handoff, 10.85-second assembly, directional arrows, idle float and pointer wrapper. No packages, configuration or source image assets change.

## Audit and reuse

The existing controller already had one GSAP tile-center route, a closed sequence of 32 tiles starting at order 24, upright two-stride bobbing, four MotionPath leaf timelines, and 14 ambient timelines including idle float. Join Joy previously scaled the whole sign around its ground anchor and changed its face to white on hover. It had no arrival-driven tile highlights. The following changes extend those functions rather than adding a second route or animation engine.

## Running and tile activation

`startMascotPathLoop()` keeps the same route coordinates and direction. Travel remains 0.48–0.68 seconds, using `sine.inOut`. Rests are 0.18 seconds normally and 0.34 seconds at corners, leaving time to read the tile reaction. A circuit is **25.095 seconds**. The two light strides use 2.8/3.4-unit vertical lift and 0.45-unit alternating sideways sway. Corners add a 0.09-second grounded preparation with less than 1.5% compression. The mascot never rotates, and the next circuit closes at the same start coordinates without teleporting.

Each tile contains an initially hidden SVG activation group: a translucent colored halo stroke, a light edge and a brighter tint of its own color. Existing tile faces, side planes and icons are retained; the icon stays above the highlight. No animated blur or filter is used.

The mascot movement tween's **`onComplete`** sets its current tile, then calls `activateTile(order)`. That same tile rises to full highlight/1.035 scale over 0.12 seconds, then settles toward 0.8 opacity and scale 1. The next movement's **`onStart`** calls `deactivateTile()`, fading the old overlay to zero over 0.24 seconds. The first entry tile stays unlit until a real route arrival, so glow never starts before running.

One map owns transient pulse/release animations. Replacements kill the previous tween, completion removes it, and only one tile is active. Pause/visibility changes also pause these effects. Reduced motion, Replay and destruction clear both current state and pending tweens. The overlays inherit the physical tiles' transforms, so they remain aligned during responsive scaling, idle float and cursor movement. Read-only API getters expose `activeTileOrder` and `tileGlowCount` for diagnostics.

## Leaves

The existing four leaves increase **20% from the preceding version**, to scales 1.08, 1.224, 1.368 and 1.512 (17.28–24.192 SVG-unit widths before rotation). Their paths, travel durations, rest intervals, opacity limits, front/back layering and noninteractive behavior are unchanged.

## Join Joy

The same board outline and lettering are wrapped separately from the unchanged post and ground shadow. Its animation origin is now the attachment at the post's top. The click hit area remains fixed while the face grows, and the handwritten destination arrow stays in the same board wrapper.

Hover applies a translucent yellow/coral vector halo, changes the face to a light POET yellow, and deepens the coral lettering for contrast. A single owned GSAP tween grows the face toward 1.12 with `back.out(4.5)` over 0.46 seconds; observed peak scale is about 1.1735. Exit smoothly returns to scale 1 over 0.28 seconds. CSS transitions restore the original face/lettering/halo. New input replaces the old tween rather than adding another animation.

Actual keyboard focus gives equivalent color, halo and focus-outline feedback, with the enlarged state applied immediately. Enter, pointer activation and touch use the existing next-section navigation and heading focus. Touch does not depend on hover. Reduced motion retains static color/halo feedback without sign scaling or tile pulses. The user-facing world pause, independent mascot loop, leaves, pointer drift and arrow remain functional.

## Real browser verification

From `DRAFT` with the existing preview server on port 8766:

```powershell
node .audit-tools/hero-interactive-qa.cjs
```

`--visual` runs the shorter visual/hover check. The main test records actual initial navigation, assembly, a full route circuit and its restart; it continues observing a second circuit to check cleanup. No timeline progress/time setters, speed changes or finish calls generate test states.

Evidence is outside production in `DRAFT/audit-work/hero-interactive/`: `recording/index.html`, `runtime.json`, `qa.json`, `tile-active.png`, `sign-hover.png`, `sign-keyboard.png`, `mobile.png`, `reduced-sign.png` and pre-change source backups. Read-only attribute observations pair arrivals with the exact mascot ground position; rendered samples check highlight intensity, one active/fading tile, transient-tween count, upright body motion and leaf sizes. Real pointer coordinates are taken from the moving sign; automation does not pause the idle float to make interaction possible.

The suite also exercises rapid hover reversal, fixed support/arrow alignment, keyboard Tab/Enter, touch navigation, Replay during a live highlight, pause/resume and reduced motion. Source comparisons remove only the new tile overlays before comparing all other existing scene objects, excluding the intentionally regrouped Join Joy subtree. Its face geometry and the intro/below-Hero content remain unchanged.

Mobile is viewport/touch emulation, not physical-device performance testing. Screencast sampling and injected QA telemetry are not a frame-rate benchmark. The pre-existing remote body-font stylesheet may be blocked by the sandbox; the local display font and scene assets remain available.

Modified runtime sources: `index.html`, `world.js`, `world.css`, `tools/board-playground.mjs`. Supporting docs and `.audit-tools/hero-interactive-qa.cjs` provide reproduction and evidence. Older pass-specific QA commands and recordings describe their corresponding historical versions.
