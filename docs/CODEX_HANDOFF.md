# POET — Codex handoff

Updated: 20 October 2026, UTC+7. Read this before older context notes.

## Git and current status

- Repository: `poet/`; current branch: **`feat/poet-claude-v3`**.
- Website checkpoint: **`3b19bb7`**, `chore: checkpoint POET website before Codex handoff` — 151 changed files, including removal of the tracked `.DS_Store` entry only. Its local copy remains.
- This handoff is saved in a separate documentation commit. Use `git log -2 --oneline` for both commits.
- No push, merge or deployment was performed. The older branch name and “untracked V2/no checkpoint yet” statements in historical context are superseded by this file.
- User approved leaving **21** historical/draft/unused files outside Git. They remain locally available and intentionally appear as untracked. **10** previously staged machine-specific/QA files were unstaged and ignored. Dependencies, source materials and other local settings are also ignored. Full classification: [GIT_CHECKPOINT_AUDIT.md](GIT_CHECKPOINT_AUDIT.md). Do not add these files wholesale or delete them.

## Completed and approved

- Combined `/v2/` flow: animated secondary-logo/poem intro → isometric playground → Join Joy or downward-scroll liquid wave → four-image activity carousel → scroll-driven press logos → remaining website.
- Hero keeps its approved board layout, mascot/equipment motion, interactive hover, two refined Community/Young Joy stalls, and larger Bé Cúc with elastic hover. Circular ground shadows are hidden. The rejected clouds/painterly scene treatment stays reverted. The Hero playback control was restored with that rollback.
- Carousel holds each completed image/text reveal for 1.5 seconds, retains the detail CTA, dots and controls. Press logos move with scroll under the stationary label mask.
- Product Sans is the only intentional font family. Verified 400/700 upright/italic faces remain unchanged; do not invent Light/Medium masters or synthesize weights.
- Header uses a single colored Product Sans Bold POET homepage link: P coral, O blue, E green, T yellow. Navigation height/menu structure remains.
- About starts with the existing team photograph, subtle bottom overlay and white “Một nhóm bạn trẻ, cùng làm điều có ích.” headline. Establishment/purpose copy sits once immediately below; later sections remain intact.
- Fundraising is one continuous four-color track with a full-width saturated gradient clipped to calculated progress. Milestones: coral <25%, yellow 25–<50%, green 50–<75%, blue ≥75%. Card accents follow the stage; **donation CTAs remain coral #EF8A7D with white text and white hearts**, overriding the attached brief's dynamic CTA color suggestion.
- Existing Worker/PayOS integration and shared checkout module are included. This audit did not change payment behavior or submit a payment/form.

## Architecture and sources

Vanilla HTML/CSS/JavaScript, web components, local GSAP 3.13.0/MotionPathPlugin for the Hero, native/CSS animation elsewhere. No framework migration.

| Source | Responsibility |
| --- | --- |
| `v2/index.html`, `v2/world.js`, `v2/world.css` | Intro/Hero markup, choreography/lifecycle and scene styles |
| `v2/tools/board-playground.mjs` | Current SVG geometry generator; run only for deliberate Hero geometry changes |
| `v2/tools/site-templates.mjs`, `v2/data/content.mjs` | Post-Hero sections, route templates and approved site/campaign data |
| `v2/tools/build-site.mjs` | Eight static route outputs and generated `data/site-data.js`; preserves Hero subtree |
| `v2/chrome.js`, `v2/site.css`, `v2/site.js` | Shared navigation/footer, editorial layouts and interactions |
| `v2/fundraising-progress.mjs` | Shared percentage/theme logic; scoped attribute-driven DOM updates |
| `v2/activity-carousel.js`, `v2/press-strip.js` | Activity transition and reversible press-strip motion |
| `assets/css/typography.css`, `v2/fonts/` | Central typography system and original OTF faces |
| `ung-ho/checkout.js`, `worker/` | Existing checkout contract and backend; do not use live operations for visual QA |

Keep generated HTML, `.nojekyll`, site-data and vendored GSAP tracked: direct static delivery depends on them. Edit templates/data before rebuilding; do not replace the current board with older `playground.mjs` or `floating-playground.mjs` experiments. Source materials stay in ignored `New materials/`; asset-selection rules in AGENTS still apply.

## Continue locally

From repository root:

```powershell
npm.cmd run preview --prefix v2
npm.cmd run build:site --prefix v2
node --test worker/test/*.test.mjs
```

Preview is **http://127.0.0.1:8766/v2/**; About is `/v2/team/`. Keep the preview process alive. It serves the entire repository and `.mjs` with the correct MIME type. If the port is occupied, check the existing server first. Static build works without reinstalling dependencies; if intentionally refreshing vendored GSAP, use the pinned V2 lockfile first.

Read root `AGENTS.md`, `v2/AGENTS.md`, this handoff, then root `CODEX_CONTEXT.md` (especially latest sections 17–19) and the relevant implementation report. The local `v2/CODEX_CONTEXT.md` is an older excluded copy. Machine-specific MCP/plugin configuration remains on this computer but is deliberately not committed; `.design-tools/verify-mcp.mjs` needs that local MCP configuration to run.

## Verification and remaining limits

- Candidate tree built byte-identical to eight current HTML pages and generated site-data; 71 Worker unit tests passed.
- Browser loaded all eight V2 routes using only candidate-tree files, with external APIs stubbed: no missing runtime assets, horizontal overflow or JavaScript errors. Staged whitespace and credential-pattern checks passed.
- Latest UI QA covered five viewport sizes and nine fundraising milestones (0, 10, 25, 49, 50, 64.33, 75, 99, 100%), correct pixel colors, smooth reversibility/data updates, reduced motion and mobile menu/Escape behavior. Evidence remains outside Git in `../audit-work/`.
- No known failing check from this pass. Physical phones, Safari and Firefox remain unverified. Exact requested white-on-coral small-button text has limited contrast; retain the user's explicit palette unless they approve a change.
- Fundraising figures shown on Home are explicitly labeled prototype examples, not verified live totals. Actual season amounts/counts remain pending in data; no live fundraising feed has been added. Do not remove the provisional label without an approved data source.
- Product Sans public-web/modification licensing and genuine 300/500 faces remain unresolved; see `PRODUCT_SANS_TYPOGRAPHY.md`. Do not modify original fonts or claim a production license.
- Future content/season updates require approved facts/assets. No additional frontend change is pending from the audit request itself. No deployment should be inferred from this local checkpoint.
