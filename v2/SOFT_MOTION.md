# Intro, transition and idle float refinement

Latest update: [INTERACTIVE_MOTION.md](INTERACTIVE_MOTION.md) adds arrival-synchronized tile highlights and stronger Join Joy feedback, enlarges the four leaves another 20%, and sets the running loop to 25.095 seconds with slightly longer rests for readable activation. Use its QA command for the current implementation; the pass-specific measurements below preserve the previous version.

Current scope: the intro's three lines and pastel background, softer scene handoff, layered idle/cursor movement, and opt-in diagnostics. Every existing playground object's SVG subtree, all raster assets, below-Hero content and the rest of the animation choreography remain unchanged.

## Running route and leaf-size follow-up

The existing single Bé Mầm timeline now completes its same 32-tile route in **23.335 seconds**, previously 32.969. Travel takes 0.48–0.68 seconds per tile. Corner tiles hold for 0.32 seconds; intermediate tiles have a short 0.12-second breath before continuing. Each move uses two light vertical strides, alternating 2.8/3.4 SVG-unit lift, and returns the body to its exact standing position at the stop. There is no rotation, stretching, new character or second movement controller. The route's coordinates, depth ordering and exact closed-loop seam are unchanged.

The same four leaves now use scales **0.90, 1.02, 1.14 and 1.26**, approximately 26–29% larger than their earlier 0.70/0.80/0.90/1.00 sizes. Scale is explicit at both ends of the rotation tween so it stays consistent through the wind cycles. Paths, opacity limits, travel/rest durations, layering and particle count remain unchanged. Pause, reduced motion and Replay retain their existing ownership rules.

Run `node .audit-tools/hero-motion-details-qa.cjs --play` for the follow-up verification. `DRAFT/audit-work/hero-route-play/` contains actual first navigation/full-circuit recording, observed adjacent tile-center stops, body-bob samples, leaf-size measurements, Replay/refresh/mobile/reduced-motion checks and pre-change source backups. Normal recording has no debug controls. The HTML must match its source backup except for the animation-script cache tag.

## Intro and handoff

The intro now contains only:

> POET  
> hành trình niềm vui bắt đầu  
> đan tay cùng bước, có nhau là nhà

The removed kicker leaves no placeholder. The three-line composition is centered with the title's margin reset. The curtain uses `color-mix(in srgb, var(--coral) 12%, white)`, approximately **#FFF1EF**, a soft pastel pink. Typography and its four POET colors are retained.

Masked text begins at 0.18, 0.98 and 1.73 seconds, keeping the handwritten, staggered reveal. After a reading hold, the text exits gently over 0.65 seconds with `sine.inOut`. The curved curtain lifts over 1.60 seconds, also with `sine.inOut`, rather than the earlier sharper 1.05-second `power3.inOut` movement. The four-color motif appears during the opening and fades through the handoff.

The intro child timeline's **`world-open` label at 4.60 seconds** is the assembly boundary and emits `poet:intro-complete`. The curtain/motif tail continues until **5.00 seconds**, providing 0.40 seconds of overlap with the falling tiles. This is an authored timeline boundary, not a timeout guessing when the intro is finished. The complete normal Intro → assembled world is **10.85 seconds**. Existing tile impacts, clockwise weighted pops, mascot entrances and subsequent cue remain in sequence.

Reduced motion retains its static text hold and short opacity fade into the assembled scene. It has no curtain translation, tile drops, object pops, board float, cursor translation or ambient loops.

## Two independent transform layers

The SVG now wraps its existing `.world-drift` group in `.world-float`. The inner group continues to contain the board, shadows, objects, mascots, both signs and annotation. Neither system writes the other's transform:

- **Idle parent:** one repeating `poet-board-float` timeline starts only after assembly. Its 12.8-second cycle uses `sine.inOut`, horizontal offsets within ±1.1 SVG units and vertical offsets from −2.2 to +1.6. It closes exactly at `(0,0)` without rotational sway.
- **Cursor child:** the existing ±5/±3.5-unit cursor response remains smoothed over 0.45 seconds. One owned GSAP delayed callback returns this child to zero after 0.70 seconds without pointer movement, leaving the parent breathing naturally. Pointer exit also recenters it. Coarse/touch pointers have no cursor translation.

There are now **14 ambient timelines**: the existing 13 plus one board-float loop. The handwriting arrow remains a separate one-shot cue. Pause, visibility/offscreen suspension and live reduced-motion changes cover both transform layers. Replay kills the old timelines, drift tweens and pointer-settle callback, then restores the float wrapper before construction. The same parent-space projection and mascot depth ordering continue to place feet on actual tile centers.

## Debug mode

Normal `/v2/` loads create no runtime panel, controlled-test buttons, Replay button or diagnostics sampling API. These require **`?heroDebug=1`** on a loopback hostname. Public hosts never enable them. The user-facing pause/resume control still manages ongoing world motion.

The explicit local **`?heroMotion=full`** preview works independently of diagnostics, allowing the VS Code embedded browser to show full motion without debug UI. `?heroMotion=respect` clears the saved local opt-in. `?heroDebug=0` forces respect for the system motion preference.

## Verification

From `DRAFT`, with the existing preview server on port 8766:

```powershell
node .audit-tools/hero-soft-motion-qa.cjs
```

This records actual navigation and normal-speed Intro/assembly followed by a complete idle-float cycle **without any pointer input**. Read-only runtime samples check the overlap, idle range, deferred ambient/cue, and exact mascot tile stops. Real pointer moves verify added response and subsequent recentering while idle continues. Actual pause/resume and debug-mode Replay clicks verify lifecycle ownership. Tablet, mobile/touch emulation, reduced motion, and full preview without diagnostics are checked separately.

`DRAFT/audit-work/hero-soft-motion/` contains `recording/index.html`, `runtime.json`, `qa.json`, fresh screenshots and `before/` source backups. Scene-subtree and below-Hero source comparisons verify the scope. No timeline seeking, speed manipulation or finish calls generate the screenshots. Browser emulation does not establish physical-phone performance; screencast sampling is not a frame-rate benchmark. The sandbox may block the pre-existing remote Google body-font stylesheet; the local display font and scene assets remain available.

Modified runtime files: `index.html`, `world.css`, `world.js`, `hero-debug.js`, `tools/board-playground.mjs`. Supporting motion docs and QA helpers are updated. No package or configuration changes.
