# POET — Controlled recovery plan

21/10/2026 (UTC+7). **Phase 0 passed; Batch 1 explicitly authorized by the user. Batch 1 awaits its own review. No Batch 2/3 authorization.** The user resolved U1 in favor of exactly two Home fundraising statistics, Cá nhân and Doanh nghiệp, with the existing data sources unchanged.

## Repository and recovery strategy

- Repository: `C:/Users/trang/Desktop/DRAFT/poet`; origin `https://github.com/benzenzz/draft-poet.git`; upstream `https://github.com/benzenzz/poet.git`.
- Verified initial branch `feat/poet-claude-v3`; exact HEAD `4e65da4444a52ab085f04bc0d5f960c6b4a7e643`. Latest website checkpoint `3b19bb7`, followed by handoff commit `4e65da4`.
- Initial tracked and staged diffs empty. Exactly 21 individual untracked files inventoried (Git short status groups some directories); existing handoff says these are intentionally local. Preserve their bytes and ignored source/tool directories.
- Only one existing worktree; recovery branch did not exist. Created **`codex/poet-requirements-polish` from the exact verified baseline** with `git switch -c`. No other checkout/worktree/reset/stash was necessary: tracked source is clean and both branches initially point to identical content, so this creates branch isolation without replacing any working file.
- Existing remote refs were inspected locally; no fetch/push/network synchronization performed. A matching remote-tracking ref is not proof of the current remote server state.
- Baseline inventory (291 tracked files and hashes of 21 pre-existing untracked files): `../../../audit-work/recovery-phase0/repository-baseline.json`. Portable protected-file inventory: `POET_PROTECTED_BASELINE.json`.
- Do not commit Phase 0 automatically. After an authorized batch is implemented and locally verified, create only that batch's explicit-file checkpoint as requested by the recovery specification; never `git add .`. Record the hash in its review package. Do not treat a checkpoint as PASS or authorization for another batch. No merge/main/push/deploy/PR.

## Source and architecture map

The source hierarchy and individual acceptance criteria are in [POET_REQUIREMENTS_MATRIX.md](POET_REQUIREMENTS_MATRIX.md).

| Area | Authoritative/editable source | Generated output / dependencies |
| --- | --- | --- |
| Seasonal/editorial facts | `v2/data/content.mjs` | Shared season, archive, media, contacts, tiers, recruitment records |
| Page structure | `v2/tools/site-templates.mjs` | `home`, `about`, `projects`, `partner`, `archive`, `projectDetail`, `peopleDetail` |
| Static generation | `v2/tools/build-site.mjs` | Eight HTML routes plus `v2/data/site-data.js`; preserve Intro/Hero subtree |
| Shared interactions | `v2/site.js` | Tabs/hash, press rail, counters, business journey/drafts, donation adapter and public wall; edits must be scoped to affected controllers |
| Navigation/footer | `v2/chrome.js` | Web components, shared wordmark/menu/footer; avoid incidental navigation changes |
| Section layouts/tokens | `v2/site.css`, existing `v2/v2.css` tokens | Scope new rules to affected sections; no global type/brand replacement |
| Fundraising | `v2/fundraising-progress.mjs` | Shared calculation/theme and scoped DOM updates; existing continuous four-color implementation is protected behavior |
| Protected opening | `v2/index.html` Hero/Intro subtree; `v2/world.js`, `v2/world.css`, `v2/tools/board-playground.mjs`; vendor GSAP | Do not run geometry generators or edit opening choreography |
| Protected typography | `assets/css/typography.css`, `v2/fonts/` | Real Product Sans 400/700, upright/italic; preserve files, loading and token definitions |
| Protected integrations | `worker/`, `ung-ho/`, `admin/`, existing routing/hosting config | Read-only contract inspection; no real payment/form/email submission |

The active implementation is `/v2/`, not the legacy root homepage. Routes: Home, `/v2/team/`, `/v2/du-an/`, `/v2/dong-hanh/`, `/v2/tinh-nguyen-vien/`, `/v2/du-an/vet-nut/`, `/v2/du-an/go-ngai/`, `/v2/team/phan-ban/`. Individual/business/volunteer use existing tab/hash navigation; do not create new route contracts.

## Local workflow and baseline

Run from `poet/`:

```powershell
npm.cmd run preview --prefix v2
# Existing server: http://127.0.0.1:8766/v2/ — keep alive; inspect occupied port first.
# Only after authorized template/data implementation:
npm.cmd run build:site --prefix v2
# Existing protected-backend regression suite, when relevant to batch regression:
node --test worker/test/*.test.mjs
```

No dependency install or framework build is needed. Build writes generated files; **do not run it in Phase 0**. Future batches edit templates/data first, regenerate once, then inspect every generated diff. Avoid running `board-playground.mjs --write` because no Hero geometry task is authorized.

Baseline capture uses the existing project-local Microsoft Playwright MCP and installed headless Edge, not a new browser server installation. Fixed CSS viewport sizes: **desktop 1440×900**, **mobile 390×844**, device scale 1. Mobile screenshots are narrow viewport captures; they are not proof of a physical phone or touch behavior. Capture Home/About/Projects/Individual/Business/Volunteer with shared nav/footer, plus naturally completed full-motion Hero. Baseline page-layout captures use OS reduced-motion and explicit local respect flags on Home for repeatability; separate Hero captures use natural full-motion playback without seeking. Public wall data is an explicitly empty browser-only fetch fixture. Do not confuse fixture content with production data or a verified live empty state.

Actual screenshots are saved under `../../.design-tools/output/recovery-phase0/` (the existing MCP's permitted, ignored output directory). Capture logs, preservation records and source extracts: `../../../audit-work/recovery-phase0/`. Original reference material is preserved, and extracted reference images are not promoted into production assets. Browser limitations and capture results are recorded in `reviews/PHASE_0_REVIEW.md`.

## Batch 1 — Home & About

**Entry gate satisfied on 21/10/2026:** explicit user approval of Phase 0 and Batch 1. U1 resolved: remove the Student statistic completely, use two balanced responsive cells, keep the current data mechanism and introduce no new fundraising figures. Keep other unresolved design suggestions at baseline.

Requirements: H-01–H-11, A-01–A-05 and G/Q constraints. Preserve already completed carousel/press/hero behavior. Reconcile M's latest Home/achievement copy and About hierarchy without duplicate Projects content. Keep all unverified facts pending, and retain approved About photo hero and continuous fundraising track.

**Candidate source files:** `v2/tools/site-templates.mjs`, `v2/data/content.mjs`, section-scoped `v2/site.css`; `v2/chrome.js` only for an explicit footer/navigation delta. `v2/tools/build-site.mjs` only if a cache revision must change. `v2/site.js` only if the approved scoped interaction requires it. Do not modify carousel/press/scene files merely to restyle post-Hero content.

**Generated candidates:** `v2/index.html`, `v2/team/index.html`, shared-content/cache-affected route HTML, and `v2/data/site-data.js` only if relevant source changes generate a real delta. Because archive and shell are shared, inspect Projects/detail-page changes even though their redesign belongs to Batch 3.

**Verification:** one static build; syntax checks on changed modules; content/order/CTA assertions using generated output; approved financial facts and provisional labels; affected-region desktop/mobile screenshots at 1440×900 and 390×844, plus 768×1024 and narrow 320px overflow checks if layout changes warrant them. Test focus/menu/Escape, images, reduced motion. Compare protected hashes and Intro/Hero subtree. Observe natural Intro/Hero→wave→carousel once if shared code/shell may affect them. Do not rerun unrelated audits. Record actual results, then checkpoint the verified explicit files, write `reviews/BATCH_1_REVIEW.md`, and stop.

## Batch 2 — Individual & Business

**Entry gate:** Batch 1 PASS **and explicit authorization to begin Batch 2**. A PASS alone does not authorize automatic continuation.

Requirements: I-01–I-05, B-01–B-05 and protected constraints. Retain pending Pop-up/Collection and unchanged checkout. Implement bounded client-side wall pagination on the actual returned list. Proposed page size **6**, previous/next + active page, disabled boundaries, announced status and reasonable keyboard focus. Test page size 0/1/exact/partial/multiple; distinguish displayed returned records from all-time totals.

**API constraint:** GET `/api/donations` returns `{donations,totalAmount,totalCount}`. Worker supports only `sort=new` or `sort=amount`, limits public list to **30**, and ignores other query parameters. There is no page/offset/cursor. Paginate at most the returned 30 entries, disclose the limitation where needed, and never imply access to complete historical records. Keep submission/moderation/hidden-message handling unchanged. No new standalone message persistence.

Reconcile ten existing tiers with the specified authoritative benefit source before any benefits edits. Keep financial amounts 1/3/5/10/15/20/25/30/35/40 million unless an approved source explicitly changes them. Preserve cumulative semantics, disclosures, selectable tier and editable email draft to `poet.npo@gmail.com`. Restore the four-stage illustrated business board using approved Bé Cúc art; scoped SVG/CSS geometry can represent the reference without touching Hero. If staged artwork is chosen, inventory/approve/normalize it under AGENTS before integration. Retain reference-PDF caveat until a verified replacement exists.

**Candidate source files:** `v2/tools/site-templates.mjs`, `v2/site.js` (only wall/journey/tier/draft portions), scoped `v2/site.css`, `v2/data/content.mjs` only for verified content/config. A small isolated wall/journey module is an option only if needed for maintainability; no new framework/dependency. Existing approved assets should suffice. `v2/tools/build-site.mjs` only for necessary revision updates.

**Generated candidates:** `/v2/dong-hanh/`, `/v2/tinh-nguyen-vien/` (shared partner template), and other routes only when shared version/data references actually change. No `worker/`, `ung-ho/`, admin or deployment edits.

**Verification:** meaningful state-machine/pagination tests; mocked delay/empty/error/retry/success, malformed response, anonymous/hidden text and safe text rendering; previous/next boundaries and page transitions; keyboard/ARIA; all ten tier selectors/disclosures; validation and draft-copy/mailto behavior without sending; all four board stops, hover/focus/tap/Escape, resize and reduced motion. Build once, relevant syntax, protected diff/hash checks and existing Worker suite once as integration guard. Capture desktop/mobile default + wall/error/page/tier/board states. Recheck only affected Batch 1 shared sections. Write/checkpoint `reviews/BATCH_2_REVIEW.md`, then stop.

## Batch 3 — Projects & Volunteers

**Entry gate:** Batch 2 PASS **and explicit authorization to begin Batch 3**. Resolve U3/U6 if they affect planned removals.

Requirements: P-01–P-03, V-01–V-02. Retain correct two project tab labels and verified data. Reuse approved archive/campaign components. Simplify only identified layout/content duplication. Keep all seven budget rows, quantities and total **121,950,000 VND**. Existing mobile table already uses a stacked grid: retain it if acceptance checks pass, or choose a semantic, keyboard-scrollable table wrapper when warranted by approved reference. Never alter amounts for presentation.

Recruitment is closed/pending in current data (`open:false`, no application URL/date); existing Facebook contact is the honest fallback. Define and document an explicit video approval condition instead of treating any nonempty array as permission to publish. Only approved entries with a valid public destination and necessary metadata may render. Empty, draft, malformed, rejected and invalid-URL items must remain unplayable; preserve source videos. Do not invent newsletter storage/application endpoints.

**Candidate source files:** `v2/tools/site-templates.mjs`, scoped `v2/site.css`, `v2/data/content.mjs` for approved media/config; `v2/site.js` only if approved interaction requires it; builder only for necessary cache revision. **Generated:** `/v2/du-an/`, `/v2/tinh-nguyen-vien/`, `/v2/dong-hanh/` and shared archive routes where output actually changes.

**Verification:** build/syntax; project tab/hash/keyboard navigation; exact budget arithmetic and unchanged row values; semantic headers/units and readable columns at desktop/mobile/320px; all CTA destinations; closed/open-with-valid-link recruitment fixtures; approved-only video gating fixtures. Capture current/completed project, budget, volunteer pending/media states at fixed desktop/mobile sizes. Test menu/Escape/reduced motion and affected earlier shared components. Compare protected hashes/Intro-Hero subtree. Checkpoint/report `reviews/BATCH_3_REVIEW.md`, then stop.

## Final QA and review policy

After the three batches are independently approved, run an explicitly authorized focused final regression across eight routes, nav/footer, actual user paths, accessibility and protected groups. Reuse useful batch evidence; broaden testing only for outstanding risk. “79 tests / 45 protected checks” describes the lost cloud session, not this checkout. Existing handoff's 71-test history is also not a fresh result.

Each report must list changed paths/reasons/requirement IDs; exact build/test commands/results; protected checks; screenshots/viewports/interaction states; remaining discrepancies/missing content/browser limits; branch/commit and remaining working-tree changes. A build pass is not a visual PASS. After FAIL, fix only reviewer findings; after PASS, preserve them and wait for explicit next-batch authorization.
