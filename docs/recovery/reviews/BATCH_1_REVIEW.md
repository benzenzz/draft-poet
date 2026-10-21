# POET — Batch 1 implementation review

**External-review entry point:** [BATCH_01_REVIEW.md](BATCH_01_REVIEW.md), with repository-contained screenshots/results under [assets/batch-01/](assets/batch-01/). This original report is retained as the historical implementation record.

21/10/2026 (UTC+7). **Implemented and locally verified; awaiting reviewer PASS/FAIL. Batch 2 has not started.**

Authorization: user explicitly passed Phase 0, authorized Batch 1, chose exactly two Home fundraising statistics (Cá nhân and Doanh nghiệp), and requested a Git checkpoint. The original student-count record remains factual campaign data; its fundraising statistic cell is completely removed.

## Changes and reasons

| Before | After | Why / requirements |
| --- | --- | --- |
| Home fundraiser had three cells including Học sinh | Exactly two equal-width cells, Cá nhân and Doanh nghiệp; existing values and provisional note preserved | Explicit user decision; H-06/U1 |
| Beneficiary count was in the fundraising statistics; Home summary omitted the campaign name | Existing `season.beneficiaries` (300) and “Công Viên Niềm Vui” appear in the school narrative | H-04; retain the factual context outside donor statistics |
| Short previous-project summaries and generic metrics | Approved image-34 previews: concert 120 attendees/5 sponsors; school gifts and environmental activities; retained original image assets and detail routes | H-07; no season-wide total misattributed to the concert |
| Extra archive navigation and press eyebrow; business CTA omitted sponsorship | Approved archive headline, redundant archive link removed, one “Góc nhìn truyền thông” heading, “Đồng hành & tài trợ” CTA | H-07/H-08/H-09; explicit annotated requirements |

No new fundraising amounts/counts were introduced. `season`, `homepageFundraisingPreview`, confirmed-over-preview selection, progress calculation, real/pending states and backend are unchanged. Home still visibly labels prototype figures as unconfirmed. The five fundraising activities are retained in the existing three-point concise summary; dates remain 09/2026–01/2027 and future activities remain planned.

## Changed files

| Files | Scope |
| --- | --- |
| `v2/tools/site-templates.mjs` | Remove Student markup; dynamic beneficiary/campaign copy; archive/press cleanup; clearer business participation CTA; omit empty eyebrow markup |
| `v2/data/content.mjs` | Only approved previous-project preview records/season attribution and provenance comments; existing photos, URLs and campaign financial records retained |
| `v2/site.css` | **One declaration only:** Home statistics grid changes from three columns to two. Existing responsive spacing, colors, fonts and motion rules unchanged |
| `v2/tools/build-site.mjs` | Editorial cache revision only: `recovery-batch1-1` |
| `v2/index.html`, `v2/team/index.html` | Generated Home/About output |
| `v2/du-an/index.html`, `v2/du-an/vet-nut/index.html`, `v2/du-an/go-ngai/index.html` | Generated shared archive/preview content and cache references; no Projects layout redesign |
| `v2/dong-hanh/index.html`, `v2/tinh-nguyen-vien/index.html`, `v2/team/phan-ban/index.html` | Regenerated editorial cache references only; main content unchanged |
| `docs/recovery/POET_REQUIREMENTS_MATRIX.md`, `docs/recovery/POET_RECOVERY_PLAN.md` | Record Phase 0 PASS, Batch 1 authorization and resolved U1 |
| `docs/recovery/POET_PROTECTED_BASELINE.json`, `docs/recovery/reviews/PHASE_0_REVIEW.md` | Include the already approved Phase 0 records in the first recovery checkpoint |
| `docs/recovery/reviews/BATCH_1_REVIEW.md` | This review package |

The eight generated HTML files remain tracked for static delivery. `v2/data/site-data.js` rebuilt byte-identically and has no Git diff. No production asset/dependency was added or deleted. QA helpers/evidence remain local under `../.audit-tools/` and `../audit-work/recovery-batch1/`; they are not website runtime files.

## Verification

Commands run from `poet/` unless indicated:

| Check | Command / evidence | Result |
| --- | --- | --- |
| Static build | `npm.cmd run build:site --prefix v2` | PASS, eight pages; run once after source edits |
| Syntax | `node --check` on `v2/tools/site-templates.mjs`, `v2/data/content.mjs`, `v2/tools/build-site.mjs` | PASS |
| Existing Worker suite | `node --test worker/test/*.test.mjs` | **71 passed, 0 failed**, 16 suites; mocked unit tests, no real payment |
| Protected guards | From DRAFT: `node .audit-tools/poet-recovery-batch1-qa.mjs preservation` | 25 guard assertions; **62 protected files byte-identical**, exact Intro/Hero subtree unchanged, all 21 original untracked files preserved |
| Extra shared-source guards | Same preservation report | `chrome.js`, `site.js`, fundraising module, activity/press markup, complete About photo/mission/statistics/people markup and Individual/Business/Volunteer templates unchanged |
| Data guards | Same preservation report | Season, preview financial data, four activities, scoped Mùa 5 impact, press/media, contacts/socials, tiers/journey and recruitment data unchanged |
| Desktop/mobile QA | From DRAFT: same script with `desktop` / `mobile` | PASS: 28 / 30 checks; donor cells, copy/order, CTA destinations, modal open/Escape/focus, next/previous carousel, mobile menu/Escape and named accessible controls |
| Tablet/narrow QA | Same script with `tablet` / `narrow` | PASS: 24 checks each; Home/About at 768×1024 and 320×740 |
| Milestone calculation | Read-only Node assertions against `fundraisingState` | PASS: 0/25/50/75/100% stage boundaries; null raised and zero target remain unknown |
| Natural playback | Same script with `motion` | PASS: six checks; natural Intro/Hero completion, GSAP 3.13.0, Have fun → wave start/complete → `#hoat-dong`, then actual carousel autoplay; no timeline seeking |
| Shared route regression | Same script with `smoke` | PASS: six additional routes, no console errors or horizontal overflow; not implementation of later batches |
| Patch check | `git diff --check` before staging; staged check before checkpoint | PASS; expected Git LF/CRLF normalization warnings only |

All four tested widths have exactly two equally wide, horizontal donor cells; desktop cells are 256.5px each, mobile 390px cells are 144.5px each. No page overflow observed. Product Sans computes correctly. All images retain alt attributes; decorative/inert/aria-hidden clones are excluded from accessible-name checks. Local CTA URLs return success. Nav, footer, About hero, scoped counters and existing content remain usable. This is focused accessibility coverage, not a claim of a comprehensive WCAG certification. Existing user-approved small white-on-coral contrast limitations are unchanged.

Current evidence: `../../../../audit-work/recovery-batch1/{preservation,desktop-qa,mobile-qa,tablet-qa,narrow-qa,motion-qa,smoke-qa,evidence-qa}.json`. The lost session's 79-test/45-check counts are not used as current evidence.

## Screenshots

Actual local site rendered in installed Windows headless Edge through the existing project Playwright MCP. **Desktop 1440×900; mobile 390×844; 1× CSS pixel scale.** Full-page PNGs have content-dependent heights. Layout captures use reduced motion; natural Hero playback is captured separately. Public API data/settings use browser-only QA fixtures; no donation/form/email is submitted.

Section images below are **unscaled pixel crops of actual full-page PNGs**, with crop coordinates/source PNGs recorded in `evidence-qa.json`. This avoids the sticky header appearing over the middle of tall element screenshots. No website style, asset or content is altered to create these images.

| Affected view | Desktop | Mobile |
| --- | --- | --- |
| Home full page | [desktop-home-full.png](../../../.design-tools/output/recovery-batch1/desktop-home-full.png) | [mobile-home-full.png](../../../.design-tools/output/recovery-batch1/mobile-home-full.png) |
| Campaign + two donor statistics | [desktop-fundraising.png](../../../.design-tools/output/recovery-batch1/desktop-fundraising.png) | [mobile-fundraising.png](../../../.design-tools/output/recovery-batch1/mobile-fundraising.png) |
| Approved project previews | [desktop-achievements.png](../../../.design-tools/output/recovery-batch1/desktop-achievements.png) | [mobile-achievements.png](../../../.design-tools/output/recovery-batch1/mobile-achievements.png) |
| Home press section | [desktop-home-press.png](../../../.design-tools/output/recovery-batch1/desktop-home-press.png) | [mobile-home-press.png](../../../.design-tools/output/recovery-batch1/mobile-home-press.png) |
| About full page | [desktop-about-full.png](../../../.design-tools/output/recovery-batch1/desktop-about-full.png) | [mobile-about-full.png](../../../.design-tools/output/recovery-batch1/mobile-about-full.png) |
| About people section | [desktop-about-people.png](../../../.design-tools/output/recovery-batch1/desktop-about-people.png) | [mobile-about-people.png](../../../.design-tools/output/recovery-batch1/mobile-about-people.png) |
| About press section | [desktop-about-press.png](../../../.design-tools/output/recovery-batch1/desktop-about-press.png) | [mobile-about-press.png](../../../.design-tools/output/recovery-batch1/mobile-about-press.png) |

Preserved natural Hero: [desktop-hero-natural.png](../../../.design-tools/output/recovery-batch1/desktop-hero-natural.png). Total: 15 PNGs. Phase 0 images remain available under the sibling `recovery-phase0/` output directory for baseline comparison. Exact live-prototype pixel equivalence is not claimed.

## Requirement coverage and remaining limits

- H-01–H-03: section order and approved activity/press motion preserved and checked. H-04–H-06: concise campaign facts, continuous four-color progress and exactly two donor cells implemented/verified.
- H-07–H-09: approved previews/headings, functional detail destinations, media rail and three support pathways retained; explicit redundancy removed. Shared archive updates necessarily reach the completed-project tab and detail routes.
- H-10/H-11: existing footer contacts/socials and navigation retained. U4's speculative menu/footer changes remain unapproved and unchanged.
- A-01–A-05: approved photo hero/introduction, three mission entries, season-scoped counters, people/recruitment links retained. About has no duplicate Projects collection. Only its shared press heading and participation CTA text change.
- U3's existing archive overview note is retained; no inferred removal. Unapproved biographies, portraits, quotes, final long articles, new school photos and live fundraising figures remain pending. No fabricated replacement data.
- Physical devices, Safari and Firefox remain untested. No new video, corporate board, wall pagination, sponsorship entitlement, recruitment behavior or backend work: those remain behind Batch 2/3 gates.
- QA setup corrections addressed decorative clone name checks, carousel autoplay races and moving-target click auto-wait. Current source uses `#hoat-dong`; the older context's `#noi-dung` handoff expectation was corrected in QA, not in the protected controller. No application regression was fixed by modifying protected animation code.

## Git checkpoint and review gate

- Branch: **`codex/poet-requirements-polish`**. Starting commit: `4e65da4444a52ab085f04bc0d5f960c6b4a7e643`.
- Checkpoint subject: **`feat: recover POET Home and About requirements (batch 1)`**. This report is included in that same checkpoint; its exact commit ID is provided with final delivery. Retrieve it with `git log -1 --format=%H -- docs/recovery/reviews/BATCH_1_REVIEW.md`.
- Application diff: **12 files, 27 insertions / 25 deletions**, plus five recovery documentation/manifest files. Stage these explicit paths only; no wholesale untracked staging.
- Preserve all 21 original untracked local files. Leave preview running. No push, merge, deploy or PR.

**Stop here for PASS/FAIL review.** PASS preserves Batch 1; Batch 2 still requires explicit authorization. FAIL fixes only reported discrepancies and resubmits relevant checks/screenshots.
