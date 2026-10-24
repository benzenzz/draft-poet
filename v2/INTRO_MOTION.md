# Intro and Hero motion refinement

## Current logo intro

The user-selected secondary logo replaces the plain POET heading. Four disjoint SVG clips animate its original P, flower O, e and T pixels at 0.18 / 0.36 / 0.54 / 0.72 seconds. At 1.45 seconds the assembled logo moves from the viewport center to the left column over 0.65 seconds, shrinking at the same time. Its final visible height is approximately 5% taller than the two poem lines' measured ink height. The right edge stays fixed while scaling, preserving the gap beside the left-aligned poem. Both lines now start with capitals: “Hành…” and “Đan…”. They reveal at 2.20 and 2.78 seconds. Font/image readiness precedes the one master timeline; no timers guess these transitions. Reduced motion uses the same fitted final logo size immediately.

The pink curtain begins lifting at 4.75 seconds, the scene opens at 5.95 seconds, and the primary POET logo replaces the generic four-diamond handoff mark. Full Intro → assembled Hero is now 11.6656 seconds, retaining the more recent faster clockwise object reveal. The secondary logo's final 2 × 2 layout, source pixels and poem spelling are preserved. Narrow mobile remains two columns; reduced motion shows the final logo/poem composition without staged movement. Replay restores all four glyphs and the logo offset before starting again.

Brand sources, derivatives and hashes are recorded in `../ASSET_STATUS.md`. Run `node .audit-tools/hero-logo-intro-qa.cjs` from DRAFT. `audit-work/hero-logo-intro/` contains the uninterrupted playback recording, letter/centered/poem/primary-handoff screenshots, mobile 390/320 captures, reduced-motion view and runtime observations. Tests observe actual navigation and Replay without changing timeline time/progress. The playground SVG, apart from the requested handoff mark, and all below-Hero content compare unchanged with the source backup.

The sections below and [SOFT_MOTION.md](SOFT_MOTION.md) preserve earlier implementation and verification history; their former plain-text intro timings are superseded by this logo pass.

The current intro/interaction implementation supersedes the earlier 0.56-second motif-only intro described in `MOTION_DETAILS.md`. Playground geometry, the approved Young Joy artwork, corrected slide layering, bench orientation, the 32-tile route, and the existing ambient system remain intact.

## Reference analysis

Observed [AUGE](https://auge-xp.com/) through actual fresh-navigation browser playback before implementation. Its centered identity holds while an italic secondary word changes and briefly slices/scrambles. A curved dark sweep crosses the light field, inverts its lettering, then lifts to expose the main page. The visible pacing alternates identity holds with quick, accelerating transitions. It is not a literal handwriting stroke, and the capture does not establish a 3D camera move or the site's exact easing functions.

The POET adaptation uses staged text, a reading hold and a curved scene handoff. It retains soft POET colors and avoids the reference's scramble, inversion, branding, code and imagery. Observation notes and the original 19.95-second recording are in `DRAFT/audit-work/auge-reference/`.

## Intro lifecycle

The HTML scene contains the exact text:

> Lời ngỏ:  
> POET  
> hành trình niềm vui bắt đầu  
> đan tay cùng bước, có nhau là nhà

The existing local display font provides the provisional handwritten treatment. The four lines reveal at 0.12, 0.62, 1.33 and 2.08 seconds. Words/letters rise through individual masks with `power3.out`; text padding preserves Vietnamese accents and descenders. The finished text holds before fading slightly upward. At 4.15 seconds the mint curtain lifts with a curved lower edge; the existing four-color motif bridges that opening into the world. The intro ends at 5.20 seconds, when the first tile starts falling.

One master owns the intro child and existing assembly. `INTRO` comes from the child timeline's actual duration; its completion callback emits `poet:intro-complete`. No timer guesses the handoff. Images and the local font are ready before playback, and hidden/offscreen pages pause. The full Intro → assembled world lasts 11.45 seconds. There is no storage-based intro skip; direct content links/restored scrolling may bypass the intro, while Replay explicitly includes it.

Reduced motion shows all intro text without stagger or translation, holds for 3.2 seconds, then fades over 0.2 seconds into the static complete playground. It skips tile drops, object entrances, mascot travel, pointer drift, leaf loops and hover scaling. The destination arrow is static. The existing localhost-only full-motion preview override continues to work for VS Code's reduced-motion environment. With no JavaScript or missing libraries, the page fails open to the static Hero and native destination link.

## Join Joy and drawn cue

Join Joy's physical illustration is 1.35 times its previous size about its existing ground anchor. Its SVG link has a larger transparent hit area, visible keyboard focus and an accessible name. Fine-pointer hover scales a separate inner group to 1.075 over 0.28 seconds with `back.out(1.5)`, then settles; pointer exit returns over 0.22 seconds with `power2.out`. Overwriting the existing tween makes rapid reversals continuous. Touch and reduced motion do not trigger hover scaling.

Click, tap or Enter activates the existing `#noi-dung` section and focuses its first heading. Scrolling honors reduced motion. The sign stays disabled until assembly completes; afterward its hit target and illustration move with the same board wrapper.

The SVG annotation shares that wrapper so its tip stays aligned with the sign during drift. Assembly completion creates one owned cue timeline: 0.30-second rest, 0.85-second curved stroke draw, then a 0.25-second arrowhead completion. Actual `getTotalLength()` values drive `stroke-dasharray`/`stroke-dashoffset`; no drawing plugin is needed. Pause, visibility suspension, reduced-motion changes and Replay also manage this cue. Replay kills the old cue and hover tween before restoring initial attributes.

The original mascot loop remains 32 adjacent tile centers with exact closure, 0.60–0.85-second travel and 0.30-second holds. Pointer drift remains ±5/±3.5 SVG units. Four sparse leaves and the existing playground idles remain 13 owned ambient timelines; the separate arrow is a one-shot cue. No packages or configuration changed.

## Browser verification

From `DRAFT`, with the existing preview server on port 8766:

```powershell
node .audit-tools/hero-intro-qa.cjs
node .audit-tools/hero-intro-qa.cjs --verify
```

The first command records actual initial navigation and normal-speed playback, without timeline progress/time setters, speed changes or finish calls. Read-only samples cover line ordering, masked text, curtain movement, falling tile transforms, deferred leaves/arrow, subsequent mascot stops, real hover, pointer drift, destination clicks, Replay cleanup, hard refresh, tablet/mobile and reduced motion. The second compares all existing scene objects except the intentionally enhanced Join Joy subtree against the source backup and checks keyboard focus/Enter activation.

Evidence is in `DRAFT/audit-work/hero-intro/`: `recording/index.html`, `runtime.json`, `qa.json`, `qa-verification.json`, intro/handoff/falling/Hero screenshots and `before/` source backups. The recorded scene is actual rendered playback; snapshots do not manufacture timeline states. Mobile uses viewport/touch emulation, not a physical phone. The sandbox may block the pre-existing remote Google body-font stylesheet; the local display font and local scene assets remain available. Screencast sampling is not a frame-rate benchmark.

Modified runtime sources: `index.html`, `world.js`, `world.css`, `tools/board-playground.mjs`. Existing below-Hero source content and production raster assets are unchanged.
