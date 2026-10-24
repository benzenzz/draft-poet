# Hero motion and detail refinement — 2026-10-17

Latest motion: [SOFT_MOTION.md](SOFT_MOTION.md) adds one idle-float wrapper/timeline to the existing motion system, blends it with returning cursor response, and updates the intro and diagnostics. There are now 14 ambient timelines. The route and scene geometry below are retained.

Current intro/interaction update: [INTRO_MOTION.md](INTRO_MOTION.md) replaces the motif-only intro below with a dedicated 5.20-second scene and curved handoff. Join Joy is larger and interactive, with a delayed drawn arrow. The route, drift and leaf system described here remain in use.

This is the current motion specification. It supersedes the earlier four-tile explorer loop and timing tables in `ANIMATION_IMPLEMENTATION.md`. The approved flat board, buildings, equipment, palette, hidden navigation and Young Joy sign remain intact.

## Route and choreography

- Bé Mầm uses the same official standing artwork, at its previous size, inside the scene SVG. Its feet travel through the actual centers of all 32 route tiles, beginning at existing bottom corner tile 24, proceeding 25…31, 0…23, and closing at 24. Travel takes 0.60–0.85 seconds per step, with a 0.30-second hold and a 1.7-unit walking bob. One circuit takes 32.969 seconds. The return uses the same continuous coordinates, without teleporting.
- SVG depth ordering follows the mascot's ground position. Two Bé Cúc figures move slightly out of the walking lane: explorer to `(360,600)` and welcome to `(110,505)`. Their source artwork and scale are unchanged. The juice figure remains in place.
- Both tile arrows and the green directional post agree with their next route step. The post's face now follows that direction in the same projection.
- The existing 0.56-second Intro leads into the 32 tile drops, starting at tile 24. Each tile takes 0.60 seconds to fall and settle, with 0.055-second staggering. World reveals begin after the last landing.
- Four central play structures enter first. The 24 surrounding buildings, vegetation and props (including the secondary Join Joy wayfinder) then reveal clockwise from the starting corner, ordered by their actual projected ground anchors, 0.105 seconds apart. Both signs participate at their perimeter positions. Mascots enter after these reveals settle. With the added wayfinder, the full Intro/assembly timeline lasts 6.810 seconds; the prior recording below predates that additional object.
- Pops use separate weight profiles: buildings overshoot to 1.025 scale, equipment 1.055, the sign 1.04, vegetation 1.075 and small details 1.08. Each rises, overshoots, compresses, rebounds slightly, then settles at its exact original transform.

## Ambient motion and lifecycle

After assembly, a single wrapper moves the board, shadows, objects and mascots together. Fine-pointer movement drives a maximum ±5 SVG-unit horizontal and ±3.5-unit vertical offset, smoothed over 0.45 seconds. There is no perspective tilt. Pointer exit returns to center. Touch/coarse pointers disable this drift.

Four lightweight SVG leaves use varied curved paths, 12–17.1-second travel, staggered starts and 4–7.9-second rests. Two pass behind the world, two in front. Their opacity is limited to 0.30/0.42. They remain hidden until assembly completes.

There are 13 owned ambient timelines: one mascot route, four leaves, three Bé Cúc idles, three flower sways, one swing and one seesaw. Replay kills the previous master, ambient timelines and drift tweens before rebuilding. The existing pause control, offscreen/document-hidden suspension and cleanup also cover the new motion. No dependency was added.

Reduced motion shows the complete static illustration without the entrance, route, leaves or pointer drift. The existing localhost-only Replay/full-motion opt-in remains available for the VS Code embedded browser, which reports reduced motion on this machine. `?heroMotion=full` opts in for the local preview; `?heroMotion=respect` clears that preference; `?heroDebug=0` disables diagnostics and honors the system preference.

## Tree detail

Each original rounded canopy silhouette is preserved. A valid curved lower shade is clipped to that silhouette and softened to 0.62 opacity. This removes the disconnected dark shape and the previous malformed SVG path console errors. Tree anchors and sizes are unchanged.

## Verification and reproduction

From `DRAFT` with the existing preview server on port 8766:

```powershell
node poet/v2/tools/board-playground.mjs --write
node --check poet/v2/world.js
node .audit-tools/hero-motion-details-qa.cjs
```

The QA script records actual page navigation, Intro, assembly and a complete mascot circuit at normal playback speed. It never sets timeline progress, time or speed. Read-only rendered-coordinate samples verify adjacent stops, exact center landings, the closed-loop repeat, walking bob, deferred leaves, drift bounds and perimeter reveal order. Objects first visible in the same sampled frame are treated as a tie, rather than incorrectly ordered by DOM traversal.

Evidence is outside the website runtime, under `DRAFT/audit-work/hero-motion-details/`:

- `recording/index.html`: recorded-speed player from browser screencast frames.
- `runtime.json`: actual rendered coordinates, route stops, reveal observations and runtime events.
- `qa.json`: Replay, pause/resume, reload, arrows, desktop/tablet/mobile and reduced-motion assertions; JavaScript and console errors.
- `assembled.png`, `loop-return.png`, `laptop.png`, `tablet.png`, `mobile.png`, `small-mobile.png`: observed browser captures.
- `embedded-runtime.json`: actual VS Code runtime events showing the preview override, completed assembly and sequential mascot stops.
- `before/`: pre-refinement source backups.

Responsive checks use 1440×900, 1366×768, 1024×768, 430×932 and 390×844 viewports. Mobile is browser emulation; physical-phone performance is unverified. Screencast recording can drop frames under load, so it is evidence of real playback rather than a frame-rate benchmark.
