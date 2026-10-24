# Batch 01 — H-08 / H-09 correction review

21 October 2026, UTC+7. Corrected implementation verified for independent external review. Branch: `codex/poet-requirements-polish`. External PASS/FAIL remains pending. No Batch 02, PR, merge or deployment.

## Exact revision identities

- **Before:** `e0a993839c83ef5273c4b518b833d856263241a6` — original Batch 01 review checkpoint.
- **After implementation:** `d69cc91f7116775b5f579fd5b72708a074ff40d0` — `fix: resolve Batch 01 review findings`.
- The following documentation-only checkpoint records that implementation SHA in this report. Its application files are identical to the after-implementation commit. The final pushed package SHA is provided in the handoff and can be read from this report's GitHub commit history. A commit cannot embed its own SHA.

The original baseline measurements remain unchanged. The build, five syntax checks, focused browser regression, protected-region checks and whitespace check were rerun before creating the implementation checkpoint. Numeric results in `after.json` and `preservation.json` identify that verification run; their recorded starting HEAD is the before checkpoint because the candidate was still uncommitted during verification.

## Scope and implementation

| Finding | Before | After | Reason |
| --- | --- | --- | --- |
| H-08 | Counter used rounded card-width steps divided by three articles, even when card starts clamp to the same end | Visible **“Vị trí x / n”** counts distinct reachable scroll-snap positions | Position count now matches navigation, rather than implying individual-article pagination |
| H-08 boundaries | Home actually snapped to 4px because of existing rail padding; Previous could remain enabled | First card's actual start is included; Home/End and arrows/buttons use the same position list | Boundary controls reflect reachable movement |
| H-08 announcements/resize | Raw counter text updated on every scroll; total stayed three | Polite, atomic live text changes only when needed, after scroll settles (scrollend with a 150ms fallback); ResizeObserver rebuilds geometry from rail/cards | Avoids frame-by-frame announcements; adapts to viewport/card changes |
| H-09 | “Doanh nghiệp đồng hành” | **“Doanh nghiệp đồng hành và tài trợ”** | Exact approved wording; existing “Đồng hành & tài trợ” CTA and `#doanh-nghiep` link retained |

Positions are actual card-start offsets clamped to `[0, scrollWidth − clientWidth]`, with duplicate positions within one CSS pixel merged and the final reachable end retained. Existing 4px padding, card widths/gaps and CSS scroll snapping are preserved. The indicator selects the nearest position after a native scroll/drag settles; it does not claim a card number or number of fully visible cards. Wide views can therefore have two positions while narrow views have three. No overflow yields one position and both boundary controls disabled. The static template leaves the count empty until geometry is available, rather than publishing a misleading article count without JavaScript.

Existing reduced-motion/instant versus smooth scrolling is retained. Mouse drag, native touch scrolling and key focus behavior remain. No protected motion source changed. The builder's existing editorial cache revision is advanced to `recovery-batch1-fix1` so the corrected shared controller is reloaded; protected animation revisions are unchanged.

## Measured before/after

Captured on the existing local preview with installed Windows headless Edge via the existing Playwright MCP. Main screenshots use desktop **1440 × 900**, tablet **768 × 1024**, mobile **390 × 844**, narrow **320 × 740**, CSS scale 1. Baseline was captured before application edits. Full numeric states and actions are in [before.json](assets/batch-01-corrections/before.json) and [after.json](assets/batch-01-corrections/after.json).

| Viewport width | clientWidth / scrollWidth | First / final scrollLeft | Old final counter | New first → final | Business heading lines |
| --- | --- | --- | --- | --- | --- |
| 1440 | 1282 / 1508 | 4 / 226 | 1 / 3 | Vị trí 1 / 2 → Vị trí 2 / 2 | 2 |
| 768 | 696 / 985 | 4 / 289 | 2 / 3 | Vị trí 1 / 2 → Vị trí 2 / 2 | 3 |
| 390 | 346 / 940 | 4 / 594 | 3 / 3 | Vị trí 1 / 3 → Vị trí 3 / 3 | 2 |
| 320 | 276 / 755 | 4 / 479 | 3 / 3 | Vị trí 1 / 3 → Vị trí 3 / 3 | 3 |

The reviewer-provided exact case was additionally reproduced at viewport **1346 × 900**: `clientWidth=1198`, `scrollWidth=1413`, `scrollLeft=215`, indicator **“Vị trí 2 / 2”**, Previous enabled, Next disabled. Its old `1 / 3` value is the reviewer-provided observation; our separately captured 1440px baseline demonstrates the same defect at 226px.

Heading checks measured text ranges, container boxes and overflow; Vietnamese text remains visible at all four widths, and screenshots were visually inspected. Font glyph bounds can extend outside their line box while overflow is visible; this is not clipping. No heading/card CSS was changed.

## Commands and actual results

Run from repository root, `C:\Users\trang\Desktop\DRAFT\poet`; preview already running at `http://127.0.0.1:8766/v2/`. No dependency installation or preview restart.

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
node docs/recovery/reviews/assets/batch-01-corrections/regression.mjs before
node --check v2/site.js
node --check v2/tools/site-templates.mjs
npm.cmd run build:site --prefix v2
node --check v2/tools/build-site.mjs
node --check docs/recovery/reviews/assets/batch-01-corrections/regression.mjs
node --check docs/recovery/reviews/assets/batch-01-corrections/preservation.mjs
node docs/recovery/reviews/assets/batch-01-corrections/regression.mjs after
node docs/recovery/reviews/assets/batch-01-corrections/preservation.mjs
git diff --check
git diff --cached --unified=0 --output=docs/recovery/reviews/assets/batch-01-corrections/corrections.diff -- v2/site.js v2/tools/site-templates.mjs v2/tools/build-site.mjs
git diff --stat
```

- Baseline capture: exit 0, four viewports, **9 focused screenshots**; observations rather than assertions against already known failures. The script refuses to overwrite baseline from edited application sources.
- Build: exit 0, eight static routes regenerated. Earlier builds followed the template change and final cache revision. A fresh requested pre-commit build also passed without further application changes.
- Syntax checks: exit 0 for all five files: the three changed application JS/MJS sources and both evidence harnesses.
- Final browser regression: **162 passed, 0 failed**, exit 0; **9 after screenshots**. Next navigation reaches every distinct point; ArrowLeft/Right, Home/End, boundary states and polite/atomic semantics verified at four widths. Same live instance resized through 1440/768/390/320; exact reported geometry verified; Home shared instance verified; smooth scrolling verified; no browser console errors.
- No-overflow fixture: browser-only removal of two articles, with no CSS changes or fixture screenshots. One reachable position and both controls disabled. Navigation restored real three-article content before the smooth-scroll test. Production content was never modified.
- Preservation: **22 passed, 0 failed**, exit 0. [preservation.json](assets/batch-01-corrections/preservation.json) records 62 protected files byte-identical, exact Intro/Hero fragment, unchanged Product Sans/CSS, approved animations, fundraising data/controller and PayOS/Worker/admin files. Deployment configuration/static delivery files remain unchanged. About/People and archive markup unchanged. All generated HTML changes equal the approved text/status transformation plus cache revision; shared `site.js` outside the rail controller is identical to baseline. Exact generated transformations also preserve Product Sans preload/loading references. `git diff --check` passed. The staged whitespace check initially flagged a blank context line inside the nested evidence patch; regenerating that patch with zero context removed the artifact whitespace, and the staged check then passed. The preservation harness now supports review from a descendant commit while always comparing against the exact before SHA.
- Troubleshooting during development: an early regression caught the real 4px first-snap boundary and it was corrected. A subsequent heading assertion incorrectly treated visible font glyph overhang as clipping; the assertion was corrected to test actual clipping/overflow and glyph horizontal bounds. The final run above passed after both corrections; no failing application check remains.
- Worker/payment tests were not repeated: backend, integrations and financial data are unchanged and covered by preservation checks. No real payment, form or admin action was performed.

## Screenshots and portable evidence

All evidence: [assets/batch-01-corrections/](assets/batch-01-corrections/). **18 PNGs, 2,264,568 bytes total (~2.16 MiB)**. These are actual rendered section captures, not mockups or scaled crops; no page styling was changed for screenshots. Existing Batch 01 evidence remains intact.

| Width | Press before / after | Participation before / after |
| --- | --- | --- |
| 1440 | [Before](assets/batch-01-corrections/before-1440-press-start.png) / [After](assets/batch-01-corrections/after-1440-press-start.png) | [Before](assets/batch-01-corrections/before-1440-participation.png) / [After](assets/batch-01-corrections/after-1440-participation.png) |
| 768 | [Before](assets/batch-01-corrections/before-768-press-start.png) / [After](assets/batch-01-corrections/after-768-press-start.png) | [Before](assets/batch-01-corrections/before-768-participation.png) / [After](assets/batch-01-corrections/after-768-participation.png) |
| 390 | [Before](assets/batch-01-corrections/before-390-press-start.png) / [After](assets/batch-01-corrections/after-390-press-start.png) | [Before](assets/batch-01-corrections/before-390-participation.png) / [After](assets/batch-01-corrections/after-390-participation.png) |
| 320 | [Before](assets/batch-01-corrections/before-320-press-start.png) / [After](assets/batch-01-corrections/after-320-press-start.png) | [Before](assets/batch-01-corrections/before-320-participation.png) / [After](assets/batch-01-corrections/after-320-participation.png) |

Desktop end state: [incorrect counter before](assets/batch-01-corrections/before-1440-press-end.png) / [reachable position after](assets/batch-01-corrections/after-1440-press-end.png). Keyboard-focused start screenshots intentionally show the existing focus outline.

Runnable [browser regression](assets/batch-01-corrections/regression.mjs), [preservation checks](assets/batch-01-corrections/preservation.mjs), [source diff](assets/batch-01-corrections/corrections.diff) and [evidence hashes](assets/batch-01-corrections/evidence-manifest.json) accompany the numeric results. Browser harness requires the existing project-local `.codex/config.toml` and Playwright MCP installation; no machine configuration is included in evidence.

## Changed files / Git diff

Tracked application changes: **11 files, +47 / −21**.

- `v2/site.js`: shared rail controller only.
- `v2/tools/site-templates.mjs`: rail status markup and business heading only.
- `v2/tools/build-site.mjs`: editorial cache revision only.
- Generated: `v2/index.html`, `v2/team/index.html`, `v2/du-an/index.html`, `v2/dong-hanh/index.html`, `v2/tinh-nguyen-vien/index.html`, `v2/du-an/vet-nut/index.html`, `v2/du-an/go-ngai/index.html`, `v2/team/phan-ban/index.html`. Five routes change cache references only; Home/About also change shared press status/heading; Projects changes shared heading.
- New review files: this report and its evidence directory. No previous documentation/assets removed. Existing historical untracked files retained.

## Remaining limits / review gate

No known discrepancy with these two corrections. Screen-reader announcement attributes/timing were inspected/tested in Edge; actual NVDA/VoiceOver speech, physical devices, Safari and Firefox were not tested. Previously documented content/licensing/contrast limitations remain outside this correction scope. People redesign and archive geometry observations are explicitly deferred.

The user explicitly authorized committing and pushing this corrected checkpoint only. Await external PASS/FAIL before any further implementation. No real payment, donation, application, contact form or administrative submission occurred.

## Deliberately excluded local files

These **21 pre-existing files** remain untracked, unchanged and outside both checkpoints. Ignored caches, dependencies, credentials, machine configuration, downloads and `New materials/` source files are also excluded. No blanket staging is used.

```text
.taste-skill/direction.json
POET draft.txt
assets/fonts/fc-dk-cool-crayon.otf
assets/mascot/be-mam/hop.webp
assets/mascot/be-mam/jump.webp
assets/season-6/playground/sandal-left.webp
assets/season-6/playground/sandal-right.webp
assets/season-6/playground/schoolbag.webp
assets/season-6/playground/slide.webp
assets/season-6/playground/wheelbarrow.webp
docs/ART_DIRECTION_BON_NET.md
docs/DESIGN_ENVIRONMENT_AUDIT.md
docs/HERO_CORRECTION.md
docs/HERO_ILLUSTRATED_REFINEMENT.md
docs/HERO_SPEC.md
docs/LAUNCH_BLOCKERS.md
docs/NEW_MATERIALS_INVENTORY.csv
docs/NEW_MATERIALS_REVIEW.md
docs/PHASE_0_AUDIT.md
docs/V2_FINISH_AUDIT.md
v2/CODEX_CONTEXT.md
```

## Authorized checkpoint commands

The complete staged list (37 files) and summary were shown before the implementation commit: 37 files, +3325/−21 including evidence; application-only 11 files, +47/−21. The subsequent checkpoint changes this report only to record the exact implementation SHA. Both checkpoints are on the existing recovery branch.

```powershell
git diff --cached --name-only
git diff --cached --stat
git diff --cached --check
git commit -m "fix: resolve Batch 01 review findings"
git add -- docs/recovery/reviews/BATCH_01_CORRECTIONS.md
git diff --cached --name-only
git diff --cached --stat
git diff --cached --check
git commit -m "docs: record corrected Batch 01 implementation SHA"
git push -u origin codex/poet-requirements-polish
git ls-remote --heads origin refs/heads/codex/poet-requirements-polish
```

Before push, origin was verified at the exact before SHA, so the update is a normal fast-forward. Final push/remote verification results are delivered with the exact final package SHA in the handoff. No force push, merge, deployment, PR or next-batch work is authorized by this record.
