# Motion layer

Site-wide motion for the editorial pages, kept out of `site.css`/`site.js` so style work
on those files merges cleanly. The full brief (Vietnamese, with the reasoning for what
does and does not animate) is `animation-master-brief.md` in the project's style-sync folder.

| File | Owns |
| --- | --- |
| `always-motion.js` | Classic script, first in `<head>`: turns the OS reduced-motion setting off for the site. |
| `motion.mjs` | Entry. Reads `html.m-js`, marks `m-ready` plus `m-full` or `m-reduced`. |
| `story.mjs` | `.project-story` scroll stories and `.story-open` openers. Replaces the UI-023 block in `site.js`, which steps aside when `m-ready` is set. |
| `numbers.mjs` | Count-ups for `.pd-stats`, archive `.inline-metrics`, `.budget-sum`; budget split wipe; trip countdown bar. |
| `reveal.mjs` | One-time entrances: plan stations, project gallery, pull quote. |
| `split.mjs` | Word wrapping (`m-w`/`m-wi`) and per-line stagger. |
| `motion.css` | All states and transitions. |

The fundraising card keeps its own reveal in `../fundraising-reveal.mjs` (now 1400ms amount,
1600ms counters, easeOutExpo).

Rules:

- The head script (built by `tools/build-site.mjs`) sets `m-js` only for full motion and
  removes it after 3s if `motion.mjs` never runs, so content is never left hidden.
- Every device plays full motion, including ones whose OS asks for reduced motion (Demi's
  decision, 2026-10-24). `always-motion.js` loads first in `<head>`: it reports
  `prefers-reduced-motion` as off to all scripts and removes the reduce-only CSS blocks.
  Add `?heroMotion=respect` to any page to test the reduced versions.
- Only `transform`, `opacity` and `clip-path` animate. Pinning is `position: sticky`; the
  page scrolls natively. One passive scroll listener, batched with `requestAnimationFrame`.
- Wrappers are custom tags, not `span`, because page rules such as `.pd-stat span` and
  `.story-open-text h2 span{display:block}` would restyle them.
- IntersectionObserver applies the target's own `clip-path`, so a clipped element is
  observed through a neighbour (see `budgetStack`).
