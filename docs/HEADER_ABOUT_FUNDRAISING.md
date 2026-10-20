# Header, About hero and fundraising update — 20 October 2026

User confirmed implementing the complete attached brief, with the latest direct instruction taking precedence for donation buttons: both navigation and fundraising CTAs remain brand coral pink (#EF8A7D), with white lettering and white heart icons. These buttons do not change with fundraising milestones.

## Result

- Header branding is one accessible homepage link, displaying Product Sans Bold POET with P #EF8A7D, O #5CA6D4, E #399F78, T #FEE161. A fine dark outline keeps the yellow T distinguishable. Header heights, navigation structure and mobile menu behavior are preserved. Footer and other branding are unchanged.
- About begins with the existing poet-team editorial photograph, a bottom gradient and the exact headline “Một nhóm bạn trẻ, cùng làm điều có ích.” The desktop hero is 72svh; mobile is 62svh with practical height limits. The organizational introduction and original caption text now sit immediately below. Later About sections retain their content and order. The optional reveal changes image opacity only and respects reduced motion.
- Fundraising retains its existing amount/goal/statistics/divider/action layout. One pale, continuous four-color track sits beneath one full-width saturated gradient. A clip-path reveals the latter to the calculated percentage. The gradient never shrinks into the filled portion, so all milestone boundaries remain fixed.

## Calculation and milestones

`progress = clamp(raised / target * 100, 0, 100)` when raised is finite/nonnegative and target is finite/positive. Null/missing/invalid data remains “Chờ cập nhật”, with no false 0% claim. Overfunding caps the visual bar at 100% and the remaining amount at zero.

| Progress | Accent | Color |
| --- | --- | --- |
| 0 ≤ p < 25 | Coral | #EF8A7D |
| 25 ≤ p < 50 | Yellow | #FEE161 |
| 50 ≤ p < 75 | Green | #399F78 |
| 75 ≤ p ≤ 100 | Blue | #5CA6D4 |

Card tint, border, badge, divider and decorative accents follow the milestone. Badge text stays dark for contrast. Donation buttons stay pink/white as explicitly requested. Prototype amounts are still marked as illustrative and unverified; actual season data was not changed or replaced with prototype values.

`v2/fundraising-progress.mjs` supplies shared calculation/theme functions to the static builder and browser. Each card receives `data-raised`, `data-target`, `data-provisional` and calculated CSS properties. A scoped MutationObserver updates amount, goal, remaining amount, percentage, theme and ARIA when these data attributes change. No polling, backend, autoplay, or per-frame render loop was introduced. CSS animates clip-path and card colors over 550ms; reduced motion disables these transitions. The controller is ready for an approved future data source, but does not invent or fetch live fundraising data.

## Source and generated files

| File | Change |
| --- | --- |
| v2/chrome.js | Header wordmark; existing donation icon retained |
| v2/site.css | Wordmark, About hero and responsive copy, milestone themes/progress, white/pink CTAs |
| v2/site.js | Initialize scoped fundraising controller |
| v2/fundraising-progress.mjs | Shared state calculation and dynamic DOM updates |
| v2/tools/site-templates.mjs | About markup, fundraising data/ARIA hooks and heart CTAs |
| v2/tools/build-site.mjs | Refresh editorial asset revision without changing Hero/carousel versions |
| v2/index.html, v2/team/index.html, v2/du-an/index.html, v2/dong-hanh/index.html, v2/tinh-nguyen-vien/index.html, v2/du-an/vet-nut/index.html, v2/du-an/go-ngai/index.html, v2/team/phan-ban/index.html | Regenerated static output |
| CODEX_CONTEXT.md | Record current decisions |

No new images, fonts, packages, payment behavior or organizational facts were introduced. Original font and photograph files are unchanged.

## Validation

- `npm.cmd run build:site --prefix v2`: eight static pages built without errors or warnings.
- Syntax checks passed for the changed JavaScript/module sources and builder.
- Microsoft Edge screenshots at 1440, 1024, 768, 390 and 320px: no horizontal overflow/page errors/failed HTTP requests; readable white About headline, one preserved establishment paragraph, correct wordmark colors, visible white hearts, functional mobile menu/Escape/focus return.
- Progress tested at 0, 10, 25, 49, 50, 64.33, 75, 99 and 100%. Pixel samples validate saturated versus pale colors at fixed track positions; card height stays constant. Unknown data and zero target retain the pending state.
- Actual non-reduced rendering confirms an intermediate clip-path between the old and final positions. Reduced-motion checks confirm zero-duration progress transitions.
- Protected source hashes unchanged: world.js, world.css, board-playground.mjs, activity-carousel.js, press-strip.js, data/content.mjs and shared typography.css. Generated Hero subtree is identical; About markup after the new introduction matches the previous version.
- Evidence and exact before snapshots: `../audit-work/header-about-fundraising/`; summary: `qa.json`. QA helper: `../.audit-tools/header-about-funding-qa.cjs`.

Validation covers Edge on Windows and emulated mobile/tablet viewports, not physical devices or Safari/Firefox. The requested white text on exact brand coral has limited small-text contrast; the explicit user color direction was preserved. No other implementation issues were found. No live donation or form submission was performed.

Preview: http://127.0.0.1:8766/v2/ and http://127.0.0.1:8766/v2/team/.
