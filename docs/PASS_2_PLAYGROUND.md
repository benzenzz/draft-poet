# Pass 2: Playground intro → hero → first handoff

Status: **approved and frozen.** Do not change the choreography casually; see §10.

Scope: homepage greeting, hero resolve, and the scroll scene that turns the hero into `#gioi-thieu`. Nothing after the intro section was redesigned. It builds on Pass 1 (`docs/PASS_1_MOTION.md`) and keeps its safety model: content is visible by default, motion is opt-in through `html[data-opening-prototype]`, and failures fall back to the static hero.

Preview: `/?motion=replay` (full greeting every load) · `/` (session-aware) · `/?motion=off` (legacy hero, no route).

## 1. Implementation audit (before build)

- **Section order:** hero (slogan, lead, support, two CTAs, proof, nine-photo reel, notes, seal, sparks) → decorative ticker → `#gioi-thieu` (kicker "01 / POET LÀ AI", heading, overview, team photo) → activities → story band → memories → invites → footer.
- **Reusable components:** `site-header`, `site-footer`, `site-lightbox`; `.container`, `.section-kicker`, `.button`, doodle primitives (`underline-doodle`, `doodle-heading`, `doodle-highlight`, `doodle-spark`, `scribble`); the reveal observer in `app.js`.
- **Assets for this pass:** existing photos (reel), team photo, spark/underline SVGs, and the experimental flower mascot derivative (`ASSET_STATUS.md`). No new asset was needed.
- **Motion system:** Pass 1 GSAP core timeline in `motion.js` (opening only) plus CSS/IntersectionObserver reveals in `app.js` for later sections.
- **Must change:** the Pass 1 greeting ("Hi, POET playground") was invented English copy floating as a separate sign. The hero had no handoff into the next section; it scrolled away as a block.
- **Untouched:** all copy and markup after the hero, functional `app.js`, components, donation/partner pages, backend.
- **Found during QA (pre-existing):** every homepage `.doodle-heading` stayed invisible in Chromium. Their own `clip-path: inset(0 100% 0 0)` gives zero area, which IntersectionObserver never reports. Fixed by doing the same wipe with a CSS mask (see §8).

## 2. Design direction — "playground" as an interaction system

| Principle | Rule |
| --- | --- |
| Spatial | Each screen has one dominant thing. Arrival is empty paper plus one greeting; the hero then opens into its two zones (copy left, scrapbook right). |
| Typography | Type is the entrance. The greeting starts as the largest object on screen and travels into its working role as the hero kicker. It is one element moving, never a duplicate. |
| Objects | Photos, notes and seal are *placed* (short travel, a small rotation settling), never floated in loops. The endless float/wobble/blink loops in the hero are switched off. |
| Section transition | The hero **becomes** the next scene. The keyword ticker (TUỔI TRẺ · NHIỆT HUYẾT · NGHỆ THUẬT · POET) is the primary carrier: it grows into scenery, holds, then settles as the top edge of `#gioi-thieu`. The photo frame is the hero's secondary anchor. The crayon route is a secondary thread that circles the next label. |
| Scroll | One progress value drives the whole scene (§4). Every value is a pure function of scroll position, so it is deterministic and reversible. The frame and ticker hold through counter-translation; there is no CSS pinning and no scroll-jacking. |
| Hover | Micro level only (200ms, strong ease-out), and only where hover is real (`hover: hover`, fine pointer). |
| Pacing | The greeting reads first (≈0.8s), then moves home while the hero assembles. Title before body, the underline lands last. Everything settles by ≈2.3s. |
| Mobile | Same story, shorter: smaller greeting scale, quicker timings, off-screen art left in its final state, and a vertical route from the scrapbook to the label. |

Avoided on purpose: playground equipment, bouncing, sticker scatter, gaming UI, motion without a job.

## 3. Reference translation (maximatherapy.com/programs/3-to-18, studied at 1440 and 390)

| # | Reference principle (abstracted) | POET translation |
| --- | --- | --- |
| 01 | Each scene owns the full viewport; there are few objects per screen | Arrival screen = paper + greeting only; hero = two zones |
| 02 | Very large type acts as scenery ("learn", the giant headline) | The greeting is the scenery on arrival, then shrinks into a kicker |
| 03 | Imagery and type are separated by clear zones, with occasional deliberate overlap | Copy and scrapbook keep their zones; the ticker passes in front of the frame only after the copy has moved up, and never over text that is still on screen |
| 04 | Scroll builds anticipation: you see the next thing coming before it arrives | The ticker rises into view and the route grows toward a label that is not yet visible |
| 05 | One scene hands off to the next through a shared element | The ticker, the band between the two sections, becomes the scenery of the transition and then the top edge of the intro |
| 06 | Whitespace opens and closes along the journey | Empty arrival → dense hero → scrapbook opens around the frame → band + frame → band + intro |
| 07 | Some elements stay still while others move | The frame holds (p .12–.55) and the ticker holds twice (.40–.60, .78–1) while the page moves under them |
| 08 | Restraint: one move per scene | Greeting travel, hero placement, then a single scroll scene with one carrier |
| 09 | Hierarchy holds during animation | The title is fully set before body copy; the underline comes after the title |
| 10 | Mobile keeps the sequence and drops spatial tricks | The order and handoff are kept; parallax and large travel are removed |

**Not copied:** branding, illustration style, typefaces, colour fields, the card-deck pin, the diagonal photo wipe, the giant per-letter word, Lenis smooth scrolling, the page structure, and the "Next stop" teaser.

## 4. Motion system

| Level | Range | Used for in this pass |
| --- | --- | --- |
| Micro | 150–300ms | Poster-note hover (`--motion-micro` 200ms, `--ease-out-strong`) |
| Component | 300–650ms | Note/seal placement 0.44–0.48s; body copy 0.5s; underline 0.5s |
| Scene | 700–1200ms | Greeting travel 0.7s; reel placement 0.8s |
| Scroll story | progress | The hero → intro scene: individual `translate` / `rotate` / `scale` / `opacity` properties and the route's `stroke-dashoffset`, all written in one rAF-throttled scroll handler |

GSAP eases come from `MOTION` in `motion.js`: `power3.out` for entrances, `power4.out` for the hero, `power4.inOut` for on-screen travel. Properties are transform, opacity, SVG stroke, and clip-path (the line masks only). There are no new dependencies; GSAP 3.13 core is loaded from the CDN as in Pass 1. ScrollTrigger was not needed.

Desktop timeline at 1× (the timeline may speed up to at most 1.35× to absorb CDN/font latency):

| Time (s) | Event | Mobile |
| --- | --- | --- |
| 0.05–0.65 | Mascot settles; greeting text rises through its mask | same |
| 0.15–0.60 | Header settles | same |
| 0.78–1.48 | Greeting travels and scales into the kicker slot | 0.60–1.15 |
| 1.00–1.80 | Reel placed; notes +0.18/+0.28; seal +0.45 | 0.95–, only if in view |
| 1.12–1.95 | Three title lines through masks (0.09 stagger) | 1.00–1.64 |
| 1.28–2.02 | Lead → support → actions → proof | 1.12–1.78 |
| 1.66–2.16 | Crayon underline draws | 1.38–1.80 |
| 1.85–2.33 | Sparks, photo disclaimer, clean-up | to 1.85 |

Repeat visit in the same session: 0.55s entrance, greeting fades in place. Scroll, keyboard focus, resize or pagehide during the opening jump straight to the final state. The scroll scene starts only after the opening has finished (in any state).

### Scroll scene (desktop, > 980px)

`p = scrollY / sceneEnd`, where `sceneEnd` is the scroll position at which the ticker's own layout slot reaches the **handoff Y**: `max(18% of viewport height, header height + 16px)`. Because the scene ends exactly where the page puts the ticker anyway, it rejoins normal flow with no jump.

| p | Ticker (primary carrier) | Photo frame (secondary anchor) | Other |
| --- | --- | --- | --- |
| 0–.20 | Straightens from −1.2° to 0°, in its own slot | Moves with the page | Notes and seal open outward (0–.30); disclaimer fades (.12–.22) |
| .12–.40 | (.20–.40) Rises and scales to **1.6×**, never above the hero copy that is still on screen (24px clearance) | Holds its viewport position from .12, straightens 2.5°, grows to 1.12×, drifts toward the centre only as far as the copy and the route line allow | Notes, seal and sparks fade (.25–.42) |
| .40–.60 | **Settle:** holds still at `holdY` = mid-screen, or just below the copy as it stands at p .40, whichever is lower | Still holding (until .55) | — |
| .55–.80 | (.60–.78) Shrinks to 1× and travels to the handoff Y | Exit: moves with the page, lifts by an extra 12% of viewport height, shrinks to 0.92×, slides 40px right. Opacity only at the end (.72–.80) | — |
| .66–.84 | — | Still visible above and behind the band until about .74 | Intro rises in below the band (scrubbed opacity and a 32px lift): label .66–.75 → heading .68–.78 → paragraph .72–.84. The heading's doodle wipe replays as it shows |
| .78–1 | **Holds exactly at the handoff Y**, flat, 1× | Gone | Route loop closes around "01 / POET LÀ AI" |
| > 1 | Back in normal flow at the same position | — | — |

The ticker drifts sideways only while it is enlarged (−60px at 1.6×, 0 at 1×), so its edges never leave a paper strip.

**Layering** (`style.css` Pass 2 block): intro content `#gioi-thieu > *` z-index 3 (foreground) → `.ticker-clip` z-index 2 (carrier) → `.hero-art` z-index 1 (photo during its exit). The route has no z-index and runs under all three. On desktop the intro label and paragraph have their CSS reveal transition turned off, because the scene scrubs them directly.

### Mobile (≤ 980px)

The same order and the same carrier, without holds, sideways travel or intro scrubbing. The ticker straightens and swells to 1.3× as it crosses the screen; the frame straightens and grows 4% as it passes. The route starts under the scrapbook and its loop closes as the label reaches ~62% of the viewport. The intro reveals through the existing observer.

### Reduced motion

No GSAP and no scroll scene: the hero is in its final state at once, all scene styles are cleared, the route is shown complete, and reel autoplay is off. Content, order and navigation are unchanged.

## 5. Page journey

| Scene | Purpose | Entry | Scroll transformation | Exit / handoff |
| --- | --- | --- | --- | --- |
| Arrival | Greet | Paper, dimmed header, greeting centred | none | The greeting travels to the kicker |
| Hero | Identity → proposition → actions | Kicker, title, copy, scrapbook placed | The scrapbook opens around the photo frame; the frame holds, straightens and grows into the anchor | The ticker rises and takes over as the carrier; the frame leaves behind it |
| Ticker band | Carrier between the scenes | Tilted strip under the hero | Straightens, grows into scenery (1.6×), holds, shrinks back | Settles flat at the handoff Y as the top edge of the intro |
| `#gioi-thieu` | Who POET is | Label → heading → paragraph rise in under the settled band | The route loop closes around the label; the heading's wipe plays as it shows | Its final state is the start for the activities section (next pass) |

## 6. System vs season

- **System (reusable):** the route primitive (`.route-handoff` with `data-route-from`, `data-route-from-mobile` and `data-route-to`; any two anchors), the scroll scene's structure (one progress value, transform-free measurement, carrier hold and handoff), greeting→kicker travel (works on any `.hero-hello`), line masks, motion levels and eases, the reduced-motion and fail-open rules. The scene works on the ticker and frame elements, not on their content, so a new season's ticker phrase or photos need no code change.
- **Season (swap per season):** `--season-route` (crayon colour, now `--yellow`), `--season-hello` (greeting colour, now `--green`), the mascot image and greeting text in `index.html`. `motion.js` contains no season names, colours or copy.

## 7. Files changed

| File | Change |
| --- | --- |
| `index.html` | Pass 1 intro sign removed; `.hero-hello` kicker ("Hi, lời ngỏ từ POET", from Website Audit) added to the hero copy; route `<svg>` after `#gioi-thieu`; flag `pass2` |
| `style.css` | Pass 1 block replaced by the Pass 2 block (tokens, kicker, scene layering, route, hover gating, mobile, reduced motion); `.doodle-heading` reveal switched from clip-path to mask |
| `motion.js` | Greeting→kicker opening; hero → intro scroll scene with the route; bounded font wait, run in parallel with the GSAP download |
| `app.js` | No Pass 2 changes (its diff is Pass 1) |
| `ASSET_STATUS.md` | Mascot reference updated (same derivative, new role) |

## 8. QA (Edge/Chromium via Playwright, local preview)

Final run on the frozen scene:

- 1440×900, 1024×768, 390×844: the full opening plays and ends `complete`; no horizontal overflow at any sampled scroll position; no page errors.
- **Ticker holds** (measured band top): 1440 → 536px through p .45–.55, then 148px through .78–1; 1024 → 503px, then 124px. It continues with the page after p 1 with no jump, and its right edge stays past the viewport at every sample (no paper strip).
- **Photo exit:** it stays visible above and behind the band until about p .74, then fades by .80. It never ghosts over the keywords. Its bottom edge stays at least 120px above the intro label, and it never crosses the route's vertical line.
- **Intro takeover:** heading 65% visible at p .74 and fully visible at .78 on both desktop widths, with no empty beat between the photo's exit and the heading. Not crowded at 1440: photo, band and heading stay separate.
- **Mobile (390):** ticker straightens and swells, frame straightens, intro reveals normally; unchanged from the previous approved run.
- The route starts at the underline and runs down the gutter, not across text, and closes its loop around "01 / POET LÀ AI" at all three widths. On phones the loop's side padding shrinks to stay inside the page.
- The intro heading and all four later homepage headings now reveal. Before, none did: the clip-path observer bug existed before this pass.
- Reduced motion (1440 and 390): `reduced` state, greeting visible, route complete, no scene styles, reel paused.
- GSAP blocked → `fallback`, readable hero, and the route still draws. `?motion=off` → no prototype, no route. JS disabled → static hero, greeting visible, route hidden. Tab during the opening → `skipped-focus`, masks removed.
- Not tested: Safari/Firefox, real phones, throttled network, screen readers.

## 9. Rollback

Remove `data-opening-prototype`, the head bootstrap, `motion.js`, the route `<svg>` and the Pass 2 CSS block. Removing them restores the legacy hero and the tilted, static ticker. The `.hero-hello` kicker is plain content; keep it or delete it. Keep the `.doodle-heading` mask fix either way, since without it the section headings stay hidden.

## 10. Decisions not to change casually

- **The ticker is the only primary carrier.** Adding a second travelling object, or making the frame lead the handoff again, brings back competing motion.
- **`sceneEnd` is defined by the ticker reaching its handoff Y.** Ending the scene anywhere else makes the band jump when it rejoins the page.
- **Layer order: intro (3) → ticker (2) → hero art (1), route unlayered.** Putting the frame above the ticker brings back the ghosted photo over the keywords.
- **The frame moves before it fades** (lift 12% of viewport height, opacity only from p .72). A larger lift reopens the empty beat at 1024; an earlier fade makes it ghost.
- **The intro is scrubbed from p .66 and must be readable before .80.** Do not convert it back to a threshold reveal: hidden content that still takes up space leaves a blank screen.
- **The ticker peaks at 1.6× and drifts only while enlarged.** Drift at 1× leaves a paper strip at the edge.
- **Copy safety:** the ticker never rises over hero copy that is still on screen, and the frame's centre drift is capped by the copy and the route line. This keeps CTAs readable and clickable.
- **Measurement is transform-free** (offset metrics) and all scene writes use individual `translate` / `rotate` / `scale` properties, so CSS transforms (tilts, hover) stay intact and measuring never feeds back into itself.
- **Known behaviour:** the sticky header shrinks by about 16px on scroll, which shifts the page up slightly after measurement, so the observed handoff Y is about 14px above the formula (148px against 162px at 1440×900). It is stable and needs no fix.
