# POET — Phase 0 recovery review

21/10/2026 (UTC+7). **Ready for Phase 0 review; Batch 1 has not started.** This is a baseline/setup report, not an implementation PASS.

## Repository and changes

- Initial branch: `feat/poet-claude-v3`. HEAD exactly matches requested baseline `4e65da4444a52ab085f04bc0d5f960c6b4a7e643`.
- Current branch: **`codex/poet-requirements-polish`**, created at that same commit after checking branches/worktrees and confirming no tracked/staged modifications. Only one worktree existed. Existing untracked and ignored materials were retained in place.
- Origin: `https://github.com/benzenzz/draft-poet.git`; upstream: `https://github.com/benzenzz/poet.git`. Remote refs were inspected locally; no fetch/push/merge/deploy/PR or commit.
- New repository files only:
  - `docs/recovery/POET_REQUIREMENTS_MATRIX.md` — source precedence, current-vs-desired requirements, acceptance criteria and unresolved decisions.
  - `docs/recovery/POET_RECOVERY_PLAN.md` — three gated batches, target files, tests, source/protection constraints and checkpoint policy.
  - `docs/recovery/POET_PROTECTED_BASELINE.json` — 62 protected-file SHA-256 snapshots and exact Intro/Hero subtree hash for later comparison.
  - `docs/recovery/reviews/PHASE_0_REVIEW.md` — this report and visual evidence index.
- Phase 0 helpers under `../../../../.audit-tools/poet-recovery-phase0-*` and evidence under `../../../../audit-work/recovery-phase0/` are outside the website repository. Screenshots are in the existing ignored MCP output directory. No production asset was added or selected.
- **Git diff summary:** tracked diff empty; staged diff empty; four new, unstaged recovery documentation/manifest files. The original 21 individual untracked files are unchanged. `git status --short` groups the new directory as `?? docs/recovery/`; do not mistake an empty tracked diff for no new files.

## Sources located and reconciled

Read current recovery specification, root and V2 `AGENTS.md`, latest handoff, latest context §§16–19 and relevant V3/header/About/fundraising/typography/layout reports. Read active data, route templates and shared interaction/layout source. Read only the public-wall handler/store/config contract from Worker; no backend rewrite/audit.

Located `C:/Users/trang/Downloads/POET WEBSITE_ĐẶC BIỆT ĐỌC KĨ.md`: text read and **35 original annotated images** inspected through six contact sheets. This is newer/more complete than the old 33-image `POET WEBSITE_UPDATE_1.md` evidence. In particular, the later preview copy supplies specific previous-project descriptions. Record those without falsely assigning season-wide revenue to a single concert.

Located local AI Studio export ZIP `clb-thiện-nguyện-poet.zip`. Read relevant `App.tsx`, `HomeView.tsx`, `AboutView.tsx`, `ProjectsView.tsx`, `PartnerView.tsx`, `MessageWall.tsx`, data, styles and README selections. README points to app `d8d93f7c-d72a-418c-afc9-ce29eb01878c`; the live app was not inspected, and export freshness is unverified. Prototype React/Tailwind, alternate fonts, fabricated/mock content and in-memory donation/message success are not production requirements.

Existing approved content and assets are available in `v2/data/content.mjs`, `ASSET_STATUS.md`, `assets/`, local `New materials/` and existing source extracts. `HỒ SƠ BIG JOY LITTLE JOY.pdf` is present in Downloads; reference benefits PDF exists at `docs/quyen-loi-big-joy-little-joy.pdf`. No new authoritative verification of every dossier/PDF/benefits-site field is claimed here. Reconcile source/version in Batch 2 before modifying benefits.

## Protected scope

- Exact Intro/Hero subtree; scene controller/styles/generator; GSAP/vendor runtime; carousel and reversible press motion.
- Product Sans original files, actual 400/700 faces and central typography/loading; approved brand tokens, colored header wordmark and coral/white donation CTA treatment.
- Worker/payment/checkout/admin/form contracts, routing and hosting configuration. No live transaction, donation, application or email was submitted.
- Existing assets, documentation, branch history and user local materials. Rejected cloud/texture treatment remains rejected. No Hero generator was run.
- Shared editable files contain protected behaviors too: future patches must compare typography loading, wordmark/CTA and donation-adapter regions even when their filenames are allowed targets. Hashing selected files alone cannot prove all runtime behavior is preserved.

## Current local verification

| Check | Command / method | Current result |
| --- | --- | --- |
| Git baseline | Requested rev-parse/branch/status/log/remotes/worktrees/branches | Exact baseline confirmed; no initial tracked/staged changes |
| Preview | `npm.cmd run preview --prefix v2` | Started documented local server; Home HEAD 200; server left running on 127.0.0.1:8766 |
| Preservation | `node .audit-tools/poet-recovery-phase0-verify.cjs` from DRAFT | **291 original tracked files unchanged; 21 pre-existing untracked files unchanged; 62 protected-file hashes unchanged; Intro/Hero subtree unchanged** |
| Data sanity | Read-only Node import of `v2/data/content.mjs` | Seven budget rows total 121,950,000, equal target; ten tiers 1/3/5/10/15/20/25/30/35/40m; four activities; four journey stages; recruitment closed; zero video entries |
| Baseline desktop/mobile | `node .audit-tools/poet-recovery-phase0-browser.mjs desktop` and `mobile` from DRAFT, using configured project Playwright MCP | Six full-page renders per size plus one naturally completed Hero per size: **14 actual PNGs** |
| Responsive observation | DOM widths on the six views, both sizes | No horizontal page overflow at 1440×900 or 390×844; body computes to Product Sans |
| Natural Hero playback | No-preference media; plain `/v2/`; wait 12.5s after fonts; no seeking | Both captures report `POETWorld.state = alive`, GSAP 3.13.0 |
| Press asset clarification | HEAD `/assets/press/hoa-hoc-tro.png` and `/assets/press/tien-phong.png` | Both HTTP 200, image/png; in-view press logos visibly render in screenshots |
| Whitespace/tracked patch | `git diff --check`, `git diff --stat`, `git diff --cached --stat` | Tracked/staged patch empty; `diff --check` has no error; this command does not validate untracked new docs |
| Application build/unit suite | Not run | Intentional: Phase 0 changes no application code; builder writes generated HTML. Historical 79/45 and older 71-test counts are **not** fresh local results |

Preservation record: `../../../../audit-work/recovery-phase0/phase0-preservation.json`. Browser logs: `desktop-capture.json`, `mobile-capture.json` in the same directory. These are read-only setup checks, not 79 application tests or 45 protected-region behavioral tests.

## Visual evidence

Installed Windows **headless Microsoft Edge**, via existing project-local Playwright MCP. CSS viewport **1440×900 desktop**, **390×844 mobile**, 1× scale. These are emulated viewport sizes, not physical device/touch validation. Full-page PNG heights vary with page content.

Layout captures use reduced-motion; Home also has explicit `heroMotion=respect&carouselMotion=respect&pressMotion=respect`. Home's static reduced Intro is visible in its full-page capture. Separate natural full-motion Hero images establish the actual current playground. All captures are actual renders, not prototype copies or simulated screenshots. Reviewed original-size source PNGs through the available image viewer; long-page tool previews may be downscaled.

| View | Desktop | Mobile |
| --- | --- | --- |
| Home + shared shell | [desktop-home.png](../../../.design-tools/output/recovery-phase0/desktop-home.png) | [mobile-home.png](../../../.design-tools/output/recovery-phase0/mobile-home.png) |
| About | [desktop-about.png](../../../.design-tools/output/recovery-phase0/desktop-about.png) | [mobile-about.png](../../../.design-tools/output/recovery-phase0/mobile-about.png) |
| Projects, ongoing tab | [desktop-projects.png](../../../.design-tools/output/recovery-phase0/desktop-projects.png) | [mobile-projects.png](../../../.design-tools/output/recovery-phase0/mobile-projects.png) |
| Individual, empty fixture wall | [desktop-individual.png](../../../.design-tools/output/recovery-phase0/desktop-individual.png) | [mobile-individual.png](../../../.design-tools/output/recovery-phase0/mobile-individual.png) |
| Business, first tier / brand tab | [desktop-business.png](../../../.design-tools/output/recovery-phase0/desktop-business.png) | [mobile-business.png](../../../.design-tools/output/recovery-phase0/mobile-business.png) |
| Volunteer, closed/pending | [desktop-volunteer.png](../../../.design-tools/output/recovery-phase0/desktop-volunteer.png) | [mobile-volunteer.png](../../../.design-tools/output/recovery-phase0/mobile-volunteer.png) |
| Naturally completed Hero | [desktop-hero-full-motion.png](../../../.design-tools/output/recovery-phase0/desktop-hero-full-motion.png) | [mobile-hero-full-motion.png](../../../.design-tools/output/recovery-phase0/mobile-hero-full-motion.png) |

The wall uses an explicit browser-only empty-list fetch fixture after navigation, before scrolling the wall into view. It is not proof that the live API is empty. No forms or payment actions are triggered. Hidden sibling-tab wall text in logs is not an observed user-visible failure.

## Discrepancies, risks and missing information

1. **Home statistics conflict:** M says only Individual/Business, but the newer explicitly approved baseline has three cells including Students. U1 in the matrix requires a reviewer decision; current three-cell baseline is unchanged.
2. **Wall recovery gap:** current “Xem thêm” is not pagination. Actual Worker public list caps at 30, only supports sort and ignores page/cursor. Proposed client pagination is honest about the returned subset; proposed 6/page is a documented implementation choice, not a recovered exact measurement.
3. **Board recovery gap:** current four-stop journey is a straight desktop track / vertical mobile track, not the illustrated board in M. Restore within Business only after Batch 2 approval; exact geometry is not supplied. Existing Bé Cúc art is available. Source board PNG remains reference/staging material.
4. **Video gate gap:** current nonempty array directly displays links; explicit approval/validity filtering still needs Batch 3. No approved video list exists, so pending content remains appropriate.
5. **Editorial gaps:** approved individual profiles/portraits/quotes, selected Mùa 6 destination photos, final long stories, live campaign totals/counts, recruitment dates/application URL and updated benefits PDF remain unavailable. Existing reference PDF has a visible schedule caveat. Do not fabricate replacements.
6. **Unresolved suggestions:** navigation wording, footer exploration links, completed-project overview note and exact extra section removals are not silently approved by “consider” or “simplified layout”. See U3–U6 in matrix.
7. **Screenshot observations:** initial DOM samples include unloaded offscreen press clones/carousel img placeholders. Actual screenshots show in-view logos and asset HEADs return 200; these samples do not prove broken assets. Complete image/response/interaction assertions belong to affected batch QA. Phase 0 did not run a comprehensive accessibility or runtime-error audit, exercise every hidden tab/tier, or test wall error/retry/loading transitions. Those checks are planned, not passed.
8. **Tool limitations handled:** grouped `browser_run_code_unsafe` captures timed out; standard MCP navigate/evaluate/screenshot tools succeeded. MCP refused screenshot destinations outside its roots, so final PNGs were saved in its existing allowed output directory. Earlier failed attempts are not successful screenshot evidence. No second browser package/server was installed.
9. **Browser/rights limits:** Safari, Firefox, physical iOS/Android and touch behavior unverified. Font public-web licensing remains unresolved; exact approved white-on-coral small text retains its recorded contrast limitation. No color/font change is authorized by Phase 0.
10. **Lost work:** no recovered cloud patch/commit or 79-test/45-check suite was found among the inspected branch/worktree/relevant source records. These historical counts cannot certify the new work. This plan reconstructs verified requirement deltas from available sources; it does not claim byte-for-byte recovery of the lost cloud workspace or pixel-perfect live-prototype equivalence.

## Approval gate

Review the matrix and three-batch plan, resolve U1 before a statistic-count change, and explicitly authorize Batch 1. No Batch 1–3 application code has been changed, no commit exists beyond baseline, and no next batch starts automatically. After each authorized batch, submit an isolated verified checkpoint/review package and wait for PASS plus explicit next-step authorization. FAIL corrections are limited to reported discrepancies.
