# Platform geometry and object hover correction

This pass changes only the current Hero platform outline, destination cue, explicit outer background, Join Joy post material and passive object hover. The route, object coordinates, sign faces, artwork, intro, master timeline and all existing ambient controllers remain unchanged.

## Causes and geometry

- The generator previously passed a four-vertex rectangle to `prism()`, producing sharp polygon corners on the top, rim, side faces and shadow. CSS rounding cannot change those SVG vertices.
- `roundedOutline()` now projects a 48-unit board-plane radius through the original fixed isometric camera. Four quadratic curves round the top, its inset rim and the offset shadow. The 14-unit extrusion has two actual curved side paths. Their shared front seam uses the same rounded-corner midpoint, and their upper edges are exact subcurves of the top perimeter. Side faces have no overlapping fill areas.
- The rear corner is geometrically rounded but remains partly occluded by the existing school. Moving the school to expose it would change the approved layout. Desktop screenshots show the visible perimeter; the SVG path check verifies all four curves.

## Arrow and background

- The old cue `M240 440…346 284` began on the board. Its new stroke is `M138 270C100 187 163 126 234 146C284 160 312 192 326 214`, with a matching inward arrowhead near Join Joy. It occupies the empty upper-left exterior, above the left bench and outside the buildings. It is a sibling of the board and objects under the same `.world-drift` / `.world-float` parents as Join Joy. No extra overlay, altered viewBox or moving endpoint calculation is needed. The original stroke-drawing timeline is unchanged.
- The inspected running page already inherited cream `--paper: #fbf8f2` from `html`; the SVG, stage and Hero were transparent. There was no external pale-green background layer in the served version. Explicit backgrounds on `.world-wrap` and `.hero--world` now guarantee the same cream locally. The mint SVG platform top and rim are intentionally preserved.
- Only Join Joy's three post faces change. Local `--signpost-pink: #f3a9c4` reuses the existing root website's POET pink value. The cap is lightened with white, and the darker side mixes with the existing coral edge token. The sign face, lettering and position stay the same.

## Hover ownership

Buildings, equipment, trees/flowers, props, stationary characters and Bé Mầm now have one inner `.object-hover` wrapper. Contact shadows stay outside it on the ground. A transparent SVG `use` references the unshifted artwork as a stationary painted silhouette, so lifting the picture cannot make the pointer fall off its bottom edge. This adds no bounding-box rectangles over neighboring objects, no event handlers and no extra GSAP timelines. The reference is `aria-hidden`.

Fine-pointer hover lifts only that object by 7 SVG units using the existing 220 ms entrance easing. Exit reverses the same transition, including rapid pointer reversals. The effect is gated to the fully assembled, playing scene. Reduced-motion and touch views remain stable. Explicit localhost full-motion previews also permit the hover in an embedded browser whose OS media query requests reduced motion. Passive illustrations gain no fake button roles, pointer cursors or keyboard stops. Join Joy keeps its existing actionable hover/focus and touch navigation.

## Verification

Run from DRAFT with the preview server on port 8766:

```powershell
node .audit-tools/hero-geometry-qa.cjs
node .audit-tools/hero-geometry-qa.cjs --lifecycle
```

Evidence is in `audit-work/hero-geometry/`: an uninterrupted initial-navigation recording, desktop 1440 × 900 and mobile 390 × 844 screenshots, an actual object-hover screenshot, reduced-motion capture and `qa.json`. The test uses native pointer/touch input, real timeline playback, sampled exterior arrow coordinates, all four top curves, curved thickness and shadow checks, byte-for-byte served-file comparison, a complete mascot route circuit, tile arrivals, leaf scales and unchanged intro/tiles/sign face/below-Hero content. It does not set animation progress or finish the timeline. The separate lifecycle run checks the explicit full-motion preview while the browser media query requests reduced motion, sign hover/restore, keyboard navigation and Replay ownership; its results are in `qa-lifecycle.json`.

Mobile verification is browser emulation; physical-phone performance is not measured.
