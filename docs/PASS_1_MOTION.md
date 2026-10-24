# Pass 1: reversible opening motion prototype

Scope: the existing homepage header and hero opening only. This is an experiment in motion language, not the full master-brief implementation. The new user request supersedes the previous phase-order gate for this pass.

## Preview and compare

- Full sequence every load: `/?motion=replay`
- Normal session behavior: `/`
- Original hero motion for comparison: `/?motion=off`
- Local preview: `http://127.0.0.1:8766/?motion=replay`

The preview server is a separate workspace tool, `.audit-tools/preview-server.cjs`; it is not part of the deployed site. Run it from `C:/Users/trang/Desktop/DRAFT` with `node .audit-tools/preview-server.cjs` if needed. The site itself remains plain static files and needs no build or package install.

## Files changed

| File | Change |
| --- | --- |
| `index.html` | One opt-in root attribute, bounded fail-open bootstrap, deferred `motion.js` reference, decorative intro markup inside the hero. Existing hero content and everything after it retained. |
| `style.css` | One appended “POET PLAYGROUND — OPENING MOTION (PASS 1)” block; scoped legacy-motion suppression, masks and intro styling. |
| `app.js` | Exclude only hero doodles from the old IntersectionObserver when prototype is on; suppress reel autoplay for reduced motion and pause on preference change. Other functional logic retained. |
| `motion.js` (new) | `initHomepageOpening()` and cleanup, GSAP loading, first/repeat/mobile sequences, storage and interruption handling. |
| `assets/experiments/opening/flower-happy.webp` (new) | Single optimized experimental mascot derivative. |
| `ASSET_STATUS.md` (new) | Source/hash/derivative/status/reference record for the experimental mascot. |
| This document | Test results, exact timing, controls and rollback. |

## Selectors and ownership

Existing selectors reused: `.site-header`, `.hero`, `#hero-title`, `.hero-title-line`, `.hero-lead`, `.hero-support`, `.hero-actions`, `.hero-proof`, `.hero-art`, `#hero-reel`, `.note-top`, `.note-bottom`, `.joy-seal`, `.hero-spark path`, `.underline-doodle path`, `.visual-disclaimer`.

Added: `html[data-opening-prototype="pass1"]`, `.opening-pending`, `.opening-playing`, `.poet-intro`, `.opening-path`, `.opening-sign`, `.opening-greeting-mask`, `.opening-greeting`, temporary `.opening-line-mask`. Read-only state attributes record `data-opening-state`, `data-opening-variant`, `data-opening-duration` (nominal timeline length) and `data-opening-rate` (playback speed). `--opening-path-color` aliases the existing green.

The semantic H1 and Vietnamese text are intact; animation is by whole line. Mask padding protects accents and the underline. Waiting masks are clipped completely to prevent stray accent fragments. The SVG strokes stay invisible until drawing starts, avoiding a rounded-cap dot. The intro has `aria-hidden="true"` and never captures pointer events. Header links are never disabled. Keyboard focus immediately resolves the opening so controls are visible.

GSAP owns only opening transforms/opacity/clipping/stroke. At completion or interruption it clears only owned inline properties, unwraps the temporary masks and hides the decorative intro. CSS determines the final reel/note/seal angles and layout. Layout custom properties, including photo URLs, are retained. The prototype disables legacy infinite decorative loops inside the hero; manual reel play/pause and normal note/button hover remain functional.

## Exact nominal timeline

Seconds are relative to GSAP playback start. Slow startup accelerates the sequence to fit a total first-visit budget of 3.2s desktop / 2.2s mobile, including bootstrap/CDN latency. A slow/failed library takes the static fallback instead.

| Motion | Desktop | Mobile (≤980px) | Repeat visit |
| --- | --- | --- | --- |
| Marker placement | 0.00–0.36 | 0.00–0.36 | Skipped |
| Route drawing | 0.18–0.88 | 0.18–0.68, simpler curve | Skipped |
| Greeting mask reveal | 0.35–0.91 | 0.14–0.50 | Skipped |
| Same marker moves toward headline zone | 0.82–1.60 | 0.46–0.98 | Skipped |
| Greeting leaves its mask | 1.03–1.35 | 0.68–1.00 | Skipped |
| Header settles | 0.18–0.63 | 0.18–0.63 | 0.00–0.20 |
| Three title lines | Starts 0.95 / 1.07 / 1.19, each 0.78s | Starts 0.52 / 0.61 / 0.70, each 0.54s | Starts 0.00 / 0.04 / 0.08, each 0.28s |
| Lead → support → actions → proof | Starts 1.12 / 1.21 / 1.30 / 1.39, each 0.58s | Starts 0.78 / 0.87 / 0.96 / 1.05, each 0.42s | Starts 0.06 / 0.085 / 0.11 / 0.135, each 0.25s |
| Main reel placement | 1.30–2.16 | 0.74–1.34 if in viewport | 0.04–0.38 if in viewport |
| Top / bottom notes | 1.46–1.96 / 1.55–2.07 | 0.90–1.40 / 0.99–1.51 if in viewport | 0.04–0.29 / 0.07–0.32 |
| Seal placement | 1.72–2.18 | 1.16–1.62 if in viewport | 0.10–0.35 |
| Marker / route retire | 1.62–1.90 / 1.95–2.31 | 1.05–1.33 / 1.12–1.48 | Skipped |
| Hero sparks draw | Starts 2.10, 0.05s stagger, 0.40s each | 1.30–1.70 together, if in viewport | Starts 0.20, 0.05s desktop stagger, 0.20s each |
| Underline draw | 2.12–2.77 | 1.20–1.68 | 0.18–0.43 |
| Photo disclaimer | 2.35–2.60 | 1.45–1.70 if in viewport | 0.24–0.49 |
| Cleanup / normal state | 2.85 | 1.90 | 0.55 |

Artwork below the mobile viewport is left in its final state immediately; no invisible entrance is queued. Mobile placement distances are halved (frame 13px versus 26px; supporting notes 6.5px versus 13px); copy moves 8px versus 14px. The path remains the same visual element as the heading starts, so there is no full-screen fade-out / unrelated fade-in transition.

## Assets

Reviewed staging inventory reused from Phase 0. The separate 2008 × 2008 `Cúc Tươi Cười.png` was inspected and resized to a transparent 192 × 192 WebP (5,752 bytes) for the 72px desktop / 56px mobile marker. Root/source and designer copy share the same SHA-256. See `ASSET_STATUS.md` for the exact source path and hash. No source was deleted or overwritten. The mascot is an experimental choice, not a new evergreen brand decision. Existing photos, logo, seal and spark/underline SVGs are retained. The route is one new inline SVG path computed for the hero size; it is a motion primitive, not an invented brand illustration.

## Sessions, accessibility and failure behavior

`sessionStorage.poetIntroPlayed = '1'` records a session visit. First visit plays the full sequence; later homepage visits use the .55s entrance without greeting/path. `?motion=replay` forces the full sequence without clearing storage. No permanent localStorage is used for this opening. Denied storage is caught; the full bounded sequence still works.

Reduced motion skips loading GSAP and shows the hero/underline/art/header immediately; reel autoplay is stopped (manual play remains available). A preference change during playback resolves the hero and pauses autoplay. Scroll past 80px, resize, keyboard focus or pagehide also resolves the opening. Anchor/deep-link visits skip it.

GSAP core 3.13.0 loads asynchronously from its pinned CDN URL; no plugin is loaded. Functional app.js and later sections do not wait for it. The loader has a 950ms deadline; the independent head bootstrap has a 1200ms fail-open guard if motion.js fails. Once fallback has occurred, a late CDN response cannot rehide the hero. With JavaScript disabled, the prototype CSS shows a static complete hero. As before, shared navigation itself requires JavaScript.

## Conflicts handled and scope limits

The original CSS had hero-wide entrance animations, floating frame/seal loops and an underline animation. The old observer also owned hero sparks. These would compete with GSAP, so the opt-in attribute suppresses only those hero rules and filters only those hero observer targets. Unrelated app.js functions, shared component files, other pages and all post-hero markup were not rewritten. The old slogan is intentionally retained as existing visual copy for this experiment; this pass does not resolve master-brief factual/brand questions.

No ScrollTrigger, Lenis, character splitting, parallax, scroll scenes, added ticker/section/footer animation, content rewrite, page redesign, navigation redesign, backend/payment change, React/Vite or site package/build setup. Existing later-section animations continue unchanged. Playwright and asset-resize tooling live outside the website in workspace-only `.audit-tools/`.

## Validation

18 headless Edge/Playwright browser checks passed with no page errors: natural desktop sequence/final cleanup; handoff frames; session repeat; 1440/1024/768/390 viewports without horizontal overflow; offscreen mobile art; menu interaction; initial and live reduced motion; keyboard focus; resize; GSAP failure; motion.js failure; off switch; anchor skip; `/poet/` hosting prefix; denied storage; no-JavaScript static state. The browser tool fallback was explicitly authorized by the user. Screenshots were inspected; the accent/cap artifacts found in the first run were fixed before the accepted run.

Evidence: [test results](../../audit-work/pass1/check-results.json), [marker](../../audit-work/pass1/01-marker.png), [handoff](../../audit-work/pass1/02-handoff.png), [assembly](../../audit-work/pass1/03-assembly.png), [desktop final](../../audit-work/pass1/desktop-final.png), [390px final](../../audit-work/pass1/final-390.png), [reduced-motion mobile](../../audit-work/pass1/reduced-mobile.png).

API behavior follows the official [GSAP timeline guide](https://gsap.com/docs/v3/GSAP/) and [CSS clearProps documentation](https://gsap.com/docs/v3/GSAP/CorePlugins/CSS/). Visual QA covers the named Edge viewports, not Safari/iOS rendering or real-device performance.

## Rollback

For immediate comparison, use `?motion=off`; this removes the opt-in root attribute before styles/app initialization and restores the old hero motion/observer behavior. To disable persistently without changing URLs, remove `data-opening-prototype="pass1"` from `index.html`; the bootstrap, `motion.js` and intro markup then remain inert.

For a complete file rollback, the three original tracked files were copied before editing to `C:/Users/trang/Desktop/DRAFT/audit-work/pass1-baseline/`. Restore `index.html`, `style.css`, `app.js` from those copies after checking for later edits. Then remove the added motion.js, intro experiment derivative, manifest entry and this report as appropriate. Keep every original staged material. Do not use a broad `git reset` or overwrite later user work. No commit/push/deployment was made.
