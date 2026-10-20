# POET /v2 hero — final animation implementation

Current motion/detail refinement: [MOTION_DETAILS.md](MOTION_DETAILS.md) supersedes the historical timing and explorer-loop descriptions below. Bé Mầm now follows the complete 32-tile route; perimeter objects reveal clockwise, with weighted bounce, shared pointer drift and four ambient leaves. The approved Young Joy sign is retained.

Current playback correction: see [HERO_RUNTIME_DEBUG.md](HERO_RUNTIME_DEBUG.md). Direct inspection of the user's VS Code integrated browser established that its reduced-motion preference is true, unlike the ordinary Edge test contexts. The local Replay control now provides an explicit full-motion preview opt-in that persists for that tab; public/debug-disabled pages continue to honor reduced motion. Current phase boundaries below replace the earlier overlapping reveal timings.

Scope: the approved flat playground composition. Only the sign's corners were visually refined. The board, buildings, equipment layout, source artwork, typography, hidden homepage navigation and below-hero content are preserved. GSAP replaces the previous Web Animations engine on this page; the root website's separate GSAP loader is unchanged.

## Animation tooling and initial audit

Before installation, neither `poet` nor `v2` had a runtime package manifest/lockfile or an installed GSAP package. The legacy root homepage loads GSAP **3.13.0** from its existing pinned CDN loader in `motion.js`; `/v2/index.html` did not load it. MotionPathPlugin and ScrollTrigger were absent from `/v2`. The active hero script was `world.js`; the older `hero.js` was not loaded.

The current intro was a small SVG four-color motif inside the native Web Animations entrance sequence. `intro()` created all animations together; `Promise.all(animation.finished).then(finish)` signalled completion of the entire scene, rather than intro completion. Phase timers and a head fail-open timer also existed. The new implementation retains that motif and introduces an explicit intro completion callback within the master timeline.

The sole npm dependency is official **`gsap@3.13.0`**, pinned to match the root homepage. MotionPathPlugin is bundled in that same package and registered once. No separate path package, ScrollTrigger, smoothing library, framework or second animation engine is loaded by `/v2`.

Static delivery uses exact copies of `dist/gsap.min.js` and `dist/MotionPathPlugin.min.js` in `vendor/gsap/`, totalling **94,147 bytes before transport compression**. Original copyright headers and package licensing notices are retained. `node_modules` is ignored; deployment requires no npm server or CDN access. To reproduce these files:

```powershell
npm ci --prefix v2 --ignore-scripts --no-audit --no-fund
npm run vendor:gsap --prefix v2
```

## Reference techniques studied

The requested eleven search phrases were used: “GSAP stagger drop animation timeline”; “GSAP tile falling animation back.out”; “GSAP assembly animation”; “GSAP object pop up back.out transformOrigin”; “GSAP MotionPathPlugin SVG path”; “GSAP character follow SVG path”; “GSAP responsive MotionPath resize”; “GSAP isometric board animation”; “GSAP game board assembly animation”; “GSAP bounce settle animation”; “GSAP staggered environment reveal”.

Implementation draws on official [Timeline](https://gsap.com/docs/v3/GSAP/Timeline/), [CSS/SVG origins](https://gsap.com/docs/v3/GSAP/CorePlugins/CSS/), [MotionPathPlugin](https://gsap.com/docs/v3/Plugins/MotionPathPlugin/) and [lifecycle/context](https://gsap.com/docs/v3/GSAP/gsap.context%28%29/) documentation, plus the installed 3.13.0 source for path offsets. No third-party animation system or example artwork was copied. Timelines provide sequencing and lifecycle control; authored `svgOrigin` values anchor physical objects; MotionPath uses the scene's SVG units without viewport alignment calculations.

## Intro integration and master timeline

`world.js` owns one `poet-hero-master` timeline, including the intro child timeline and the construction phases. The existing motif exits over **0.56 seconds**. Its actual child `onComplete` resolves `introFinished` and emits the bubbling **`poet:intro-complete`** event. The first tile begins at that exact timeline boundary. No timeout guesses the end of the intro. The final master callback emits **`poet:hero-ready`** and starts ambient timelines once.

Static markup is the complete world. Initial readiness awaits the actual hero-image decode promises and two render frames, letting first paint settle before the timed intro begins; it does not guess readiness with a timeout. A temporary `world-building` class stages hidden pieces; deferred `fromTo` tweens apply transforms at their authored activation points. Missing libraries/controller remove the gate on the actual page `load` event and leave the final illustration visible. Only reduced motion bypasses construction. Deep links and restored scroll may skip the greeting; assembly still runs when the Hero is visible. Ordinary clicks, keyboard input, touch and scrolling never complete the timeline. The old Web Animations loops and phase timers are removed.

## Tile assembly

All **32** tiles use explicit numeric `data-order` route metadata. They fall in that order, **55 ms apart**, from deterministic, varying **420–630 SVG-unit** offsets. Final geometry is untouched. Each piece has **0.60 seconds** of motion: 0.36-second `power3.in` descent, 0.06-second impact at `scaleY: .98`, 0.08-second tiny rebound, and 0.10-second settle at exactly `y: 0`, `scaleY: 1`. The route completes approximately **2.31 seconds after intro exit**.

## World reveal

Times below are measured from intro completion, not page load.

| Group | Time | Character |
| --- | --- | --- |
| Tiles | 0–2.305s | Ordered gravity drops; subtle local impact. |
| Board | 0.88–1.32s | Shallow supporting board rises into place. |
| Primary playground | 2.305–3.115s | Begins after the final tile settles; controlled `back.out(.85)`, plus restrained seat/plank settles. |
| Six buildings | 2.635–3.510s | 30-unit rise, .85 initial scale, low `back.out(.28)` overshoot. |
| Environment | From 3.125s | Trees, bushes, benches, lamps, fence and small directional props. |
| Flowers | 3.485–3.985s | Small playful pop-ups. |
| Rounded sign | 3.985–4.545s | Starts after the world reveal; anchored rise and restrained `back.out(.55)`. |
| Mascots | 4.545–5.145s | Begin after the sign settles; Bé Mầm lands with a small settle. |
| Ambient state | After 5.145s | Sparse activity; no structural bouncing. Full master including Intro lasts 5.705s. |

Major object origins come from the generator's actual projected ground points, stored as nonvisual `data-origin` metadata. Internal swing, seesaw and character pivots use their own authored points. The sign has actual projected rounded rectangles on all four corners: 14-unit outer and 9-unit inner radii. Existing colored “CÔNG / VIÊN / NIỀM / VUI” artwork and upper-right placement remain intact.

## Mascot movement and responsive handling

One explorer uses MotionPathPlugin. The invisible `#poet-mascot-route` lies in the **same 1530×838 SVG viewBox** as the board. Its four stops correspond to near-edge tiles **30 → 29 → 28 → 27**. This clear lane avoids equipment and building silhouettes; existing scene depth order remains sufficient. The route is generated from the tile centers at the mascot's foot elevation.

The **16-second return loop** has six 1.7-second travel segments, 0.8/1.2-second pauses at selected stops and an initial 0.6-second pause. `autoRotate: false` preserves the upright artwork. A 2-unit bob and 0.55-degree sway run only during walking, with no invented leg cycle or body distortion. Two other Bé Cúc figures use occasional 1.5-unit idle bobs; Bé Mầm remains planted.

MotionPath offsets compensate for the character's existing baked SVG coordinates. Path, character and board scale together; no viewport-pixel route, resize listener or per-frame DOM measurement is needed. Browser checks compare transformed foot coordinates against path points before and after resizing, including every stop and reverse segment.

## Ambient, reduced motion and cleanup

Swing and seesaw movements are small and separated by holds. Flowers sway in staggered loops; idle mascots have long rests. Tiles, buildings, board and sign stay still after assembly. There is no permanent `will-change` blanket or continuously animated filter, blur, shadow, layout property or inherited CSS variable.

The motion control pauses/resumes all ambient timelines. IntersectionObserver, page visibility and back/forward-cache suspension stop offscreen work. Startup uses that same visibility gate, rather than unconditionally playing after asset decoding. IntersectionObserver requires at least 1% visible area, since edge contact alone counts as intersecting. A live reduced-motion preference change completes construction, kills all ambient/path timelines and shows the static scene; disabling it creates one fresh ambient set.

Duplicate script execution returns the existing controller. `destroy()` kills owned timelines, aborts media/page listeners, disconnects the observer and restores original attributes. `replay()` destroys the prior instance before rebuilding the full intro and assembly. The temporary fixed **Replay Hero** button appears only on localhost/127.0.0.1/IPv6 loopback; disable it with `?heroDebug=0`, or remove the final control block in `world.js` and `.hero-replay-debug` CSS before release. Replay respects reduced motion. `seek()` is retained for earlier diagnostic tooling, but the playback regression suite never calls it.

## Playback correction — 2026-10-17

The earlier report did not establish that first-load playback survived normal user input. At the actual `http://127.0.0.1:8766/v2/` preview, a click during image readiness set `resolved=true` before a master existed; initialization then returned without creating one. Wheel/scroll input sought the entire master to its end. Hashes/restored scroll bypassed construction, and startup unconditionally played even when an earlier visibility callback had already paused the page. A deep-link regression also exposed edge-only IntersectionObserver contact as a false visible state.

The current lifecycle removes those generic finish handlers, separates greeting skip from assembly skip, and starts/resumes the single paused master through `syncMotion()` after readiness. The intro's own completion callback remains the assembly boundary; it never waits for an external Intro event. There is no session/local storage skip and no CSS animation overriding GSAP's group transforms. GSAP and MotionPathPlugin returned HTTP 200 with no page errors during reproduction. Reduced motion intentionally keeps a static complete scene.

Current browser evidence is in the parent workspace's `audit-work/hero-playback/`. `diagnosis-before.json` records the reproduced failures. `first-load/index.html` plays actual screencast frames captured **before navigation**, with observed timestamps and telemetry; `first-load/storyboard.png` shows five distinct rendered states. No GSAP progress setters, seeking, or replay are used to manufacture this initial-load evidence. The earlier animation recording began with an API replay and is not first-navigation evidence.

Run `node .audit-tools/hero-playback-qa.cjs` from `DRAFT` against the running port 8766 preview. It observes natural descent, impact compression, rebound, object opacity changes, and normal phase timing; tests fresh and returning contexts, uncached refresh, input while assets load, restored scroll, real Replay Hero clicks (including during assembly and repeated clicks), offscreen deep links, mobile touch, reduced motion, and debug-control disabling. Browser emulation does not establish behavior inside VS Code's embedded webview or on a physical phone.

Final results: desktop 1440×900 and mobile 390×844 passed; the first-navigation recording contains 273 frames and five distinct sampled rendered states. Observed playback covered 4.65 timeline seconds in 4.713 real seconds. There were no page JavaScript errors. Reduced-motion initial load and replay both remained static with zero ambient loops. The scene SVG, all below-hero markup, and the tile/object/mascot choreography functions compare unchanged against the pre-fix backup.

`node .audit-tools/hero-playback-qa.cjs --lifecycle` additionally passed browser freeze/resume, offscreen pause/resume mid-assembly, duplicate-script protection, live reduced-motion changes, and timeline cleanup. Headless Edge keeps separate test tabs marked visible, so native background-tab visibility is recorded as a test-environment limitation rather than a pass. Browser lifecycle `freeze`/`resume` events are handled in addition to visibility and back/forward-cache events. See `qa.json`, `qa-lifecycle.json`, and `offscreen.json` for observations.

## Visual and performance QA

Evidence and pre-change copies: `../audit-work/hero-animation/` in the parent `DRAFT` workspace. The suite runs the actual static page in installed headless Edge at **1440×900, 1366×768, 1024×768, 430×932 and 390×844**. It checks natural intro events, 32 precise landings, phase hierarchy, sign radii/lettering, MotionPath stops and responsive alignment, pause/offscreen behavior, live reduced motion, duplicate initialization, replay/cleanup, keyboard interruption, missing scripts, static no-JavaScript content, no overflow and no browser JS errors. It also verifies unchanged non-sign artwork and byte-identical lower-page content, footer, shared navigation code and base stylesheet.

`record-hero-animation.cjs` captures more than 22 seconds of actual Edge-rendered frames at recorded speed, including intro, assembly and one full mascot route. The recording's local HTML player and sampled storyboard are inspection artifacts, not website dependencies. Performance is measured separately without recording overhead at normal and 4× CPU speed. Initial SVG setup was deferred into staggered entrances after profiling found eager transform initialization caused startup long tasks; decoding and first paint were separated from the timed entrance. No compositor-only or physical-phone performance guarantee is claimed: SVG transforms still involve browser layout/paint.

Final isolated measurements from `performance.json`:

| Profile | Recorded frame intervals | Median | 95th percentile | Worst active-animation interval | Intervals above 33.4ms | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Normal CPU | 292 | 16.7ms | 17.0ms | 33.3ms | 0 | 0 |
| 4× CPU throttle | 274 | 16.7ms | 16.9ms | 66.8ms | 6 | 0 |

The throttled cold load still records startup long tasks of up to 190ms before active choreography and a 58ms task around completion. These are retained in the evidence, not treated as a physical-device pass. A real mid-range phone test remains outside the available environment. Normal-speed profiling records no long tasks.

Run from `DRAFT`:

```powershell
node .audit-tools/hero-animation-qa.cjs
node .audit-tools/profile-hero-animation.cjs
node .audit-tools/record-hero-animation.cjs
```

## Files modified or added

- `v2/index.html`: local runtime loading, event-based fail-open gate, generated animation metadata/path and rounded sign.
- `v2/world.js`: GSAP master, reveal hierarchy, MotionPath, ambient control and lifecycle.
- `v2/world.css`: temporary construction state and SVG transform-origin compatibility.
- `v2/tools/board-playground.mjs`: true rounded sign, invisible route and authored pivot metadata.
- `v2/package.json`, `v2/package-lock.json`, `v2/.gitignore`: one pinned dependency, reproducible install and ignored install tree.
- `v2/tools/vendor-gsap.mjs`, `v2/vendor/gsap/*`: exact official static runtime copies and notices.
- `v2/ANIMATION_IMPLEMENTATION.md`, `v2/HERO_BOARD.md`: current implementation notes and reference links.
- Parent-workspace `.audit-tools/hero-animation-qa.cjs`, `profile-hero-animation.cjs`, `record-hero-animation.cjs`: verification only.
