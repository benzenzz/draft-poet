# POET — Batch 01 review package

21/10/2026 (UTC+7). **Local verification complete; external PASS/FAIL pending. Batch 02 is not authorized.**

| Handoff field | Value |
| --- | --- |
| Repository | https://github.com/benzenzz/draft-poet |
| Verified local branch | `codex/poet-requirements-polish` |
| Implementation commit | **`d5c83955ade6fabe30ae0c1cbbfe20da5ba6e470`** |
| Baseline commit | `4e65da4444a52ab085f04bc0d5f960c6b4a7e643` |
| Evidence | [`assets/batch-01/`](assets/batch-01/) |
| Source patch | [`application.diff`](assets/batch-01/application.diff) |
| Verification results | [`verification.json`](assets/batch-01/verification.json) |
| Screenshot hashes, dimensions and provenance | [`evidence-manifest.json`](assets/batch-01/evidence-manifest.json) |

This package adds repository-contained evidence for the completed implementation. It does not restart or modify application code. Its documentation/evidence checkpoint follows the implementation commit above; the exact package commit SHA is supplied with final delivery. No push is performed without explicit user permission.

## 1. Scope and requirement IDs

Home/About recovery: **H-01–H-11, A-01–A-05**, subject to **G-01–G-04** and the review gate. The user explicitly resolved **U1**: Home fundraising contains only **Cá nhân** and **Doanh nghiệp**, with the existing data mechanism unchanged. No Intro/Hero, Product Sans, approved-motion or donation-backend redesign.

Full requirement context: [matrix](../POET_REQUIREMENTS_MATRIX.md). The [original implementation report](BATCH_1_REVIEW.md) remains as the historical record; this zero-padded report and its repository assets are the canonical external-review entry point.

## 2. Implemented changes and before/after behavior

| Before | After | Requirement |
| --- | --- | --- |
| Home fundraiser contained three statistic cells, including Học sinh | Exactly two equal-width horizontal cells: Cá nhân and Doanh nghiệp; responsive down to 320px; source values and provisional label unchanged | H-06 / U1 |
| Beneficiary statistic appeared beside donor statistics | Existing 300-pupil fact appears in the campaign/school narrative, outside fundraising statistics | H-04 |
| Previous-project previews used generic summaries/metrics | Approved supplied previews: 120 concert attendees/5 sponsors; school gifts and environmental activities; original images/detail routes retained | H-07 |
| Archive had redundant navigation; press had an extra eyebrow | Approved archive headline; redundant archive link removed; one “Góc nhìn truyền thông” heading | H-07/H-08 |
| Business support CTA said only “Xem cách đồng hành” | “Đồng hành & tài trợ”; same destination and behavior | H-09 |

Existing carousel/press-strip choreography, four-color progress, coral/white fundraising CTA, About photo hero, three mission entries, season-scoped counters, people/recruitment links, nav/footer and payment integration remain intact. About already omitted duplicated Projects content; that omission is preserved. Unresolved suggestions do not become new requirements.

## 3. Changed files

Implementation commit: **17 files, +673/−25**, including five recovery documentation/manifest files. Application-only diff: **12 files, +27/−25**.

- Sources: `v2/tools/site-templates.mjs`, `v2/data/content.mjs`, `v2/site.css`, `v2/tools/build-site.mjs`.
- Generated HTML: `v2/index.html`, `v2/team/index.html`, `v2/du-an/index.html`, `v2/du-an/vet-nut/index.html`, `v2/du-an/go-ngai/index.html`, `v2/dong-hanh/index.html`, `v2/tinh-nguyen-vien/index.html`, `v2/team/phan-ban/index.html`.
- Recovery records: `docs/recovery/POET_REQUIREMENTS_MATRIX.md`, `POET_RECOVERY_PLAN.md`, `POET_PROTECTED_BASELINE.json`, `reviews/PHASE_0_REVIEW.md`, `reviews/BATCH_1_REVIEW.md`.

The CSS change is one scoped declaration: three statistic columns become two. Builder changes only the editorial cache revision. Shared archive data reaches Projects/detail pages; partnership/volunteer/department page changes are generated cache references. This is not implementation of Batch 02/03.

The follow-up review-package checkpoint adds this report, the active implementation status, selected assets/results and links/protocol in existing recovery docs only. No application files change during packaging. No secrets, dependencies, caches, source-material archives or unrelated untracked files are included.

## 4. Deviations from approved specifications

No known unapproved implementation deviation in Batch 01. U1 follows the user's latest explicit two-statistic decision. U3's archive overview note and U4's speculative menu/footer choices remain unchanged pending decisions. The five campaign activities remain in the approved concise three-point narrative, not five new cards. Supplied preview copy is concise and source-backed; no new fundraising figures or unverified profiles were fabricated. Exact live-prototype pixel equivalence is not claimed.

## 5. Tests and actual results

| Verification | Actual result | Execution provenance |
| --- | --- | --- |
| `npm.cmd run build:site --prefix v2` | PASS, eight static pages | Completed implementation run before `d5c8395`; not rerun for packaging |
| `node --check` on the three changed JS/MJS sources | PASS | Same implementation run |
| `node --test worker/test/*.test.mjs` | **71 passed / 0 failed**, 16 suites | Same implementation run; mocked tests, no real payments |
| Desktop/mobile UI | **28/30 checks passed**, no failures; 1440×900 and 390×844 | Existing Batch 01 results; application remains byte-identical to the implementation checkpoint |
| Tablet/narrow UI | **24/24 checks passed**, no failures; 768×1024 and 320×740 | Same verified application |
| Natural Intro/Hero → Have fun wave → carousel autoplay | **6 passed / 0 failed**, no timeline seeking | Same verified application |
| Six additional shared routes | **12 passed / 0 failed** | Same verified application |
| Milestone calculation | Five boundaries (0/25/50/75/100%) and two invalid/unknown states passed | Recorded implementation assertions |
| Protected regions | **25 guard assertions passed**; 62 protected files, exact Intro/Hero subtree and 21 original untracked files unchanged | Rechecked during packaging |
| Interaction evidence | **5 passed / 0 failed**: desktop modal open/close; mobile menu open/Escape; no console errors | Captured during packaging, browser-only API fixtures |

Product Sans files/loading and central typography remain unchanged. `chrome.js`, `site.js`, fundraising calculation/controller, activity/press markup, About photo/mission/stats/people markup and partnership templates remain unchanged. All existing financial data/contracts are preserved. Local UI checks covered named controls, alt attributes, Escape/focus restoration, CTA destinations, two equal-width cells and absence of horizontal overflow.

The portable JSON contains individual check names/results and distinguishes reused implementation results from fresh packaging checks. This is focused QA, not full WCAG certification. No real payment, donation, application or email submission occurred. Local success does not constitute the external reviewer's PASS.

## 6. Rendered screenshots

Installed Windows headless Edge through the existing project Playwright MCP. **Desktop viewport 1440×900; mobile viewport 390×844; CSS scale 1×.** Full-page image height follows content. Existing screenshots were reused because application code is unchanged. Focused sections are unscaled pixel crops of actual full-page PNGs; source images/crop rectangles are recorded in the manifest. Interaction screenshots are fresh viewport captures using fixtures. No DOM styling or content was altered for evidence.

| View | Desktop | Mobile |
| --- | --- | --- |
| Home full page | [Full Home](assets/batch-01/desktop-home-full.png) | [Full Home](assets/batch-01/mobile-home-full.png) |
| Two statistics/campaign | [Focused campaign](assets/batch-01/desktop-fundraising.png) | [Focused campaign](assets/batch-01/mobile-fundraising.png) |
| Updated project previews | [Focused archive](assets/batch-01/desktop-achievements.png) | [Focused archive](assets/batch-01/mobile-achievements.png) |
| About full page | [Full About](assets/batch-01/desktop-about-full.png) | [Full About](assets/batch-01/mobile-about-full.png) |
| Simplified shared press heading | [Focused About press](assets/batch-01/desktop-about-press.png) | [Focused About press](assets/batch-01/mobile-about-press.png) |
| Relevant interaction state | [Donation dialog open](assets/batch-01/desktop-donation-dialog.png) | [Navigation menu open](assets/batch-01/mobile-menu-open.png) |

Selection: **12 PNGs, approximately 7.8 MiB total**. Unchanged people-section crops, duplicate Home press crops and unrelated QA images are deliberately excluded. Original local evidence is preserved.

## 7. Known issues and pending tasks

- Home amounts/contributor counts remain explicitly provisional; no season-scoped live feed is added.
- Approved final bios/portraits, long articles, new school photos, updated benefits PDF and volunteer video selection remain pending.
- Safari, Firefox and physical devices remain untested. Existing exact white-on-coral small-text contrast limitations and Product Sans licensing uncertainty remain unchanged.
- Git may emit existing LF/CRLF and inaccessible global-ignore-file warnings. No relevant failed check remains.
- Await explicit permission to push **only** `origin codex/poet-requirements-polish`; no merge/deploy. ChatGPT Work cannot inspect unpublished local commits through GitHub until that push completes.
- After push, report and verify the exact remote ref and SHA. External reviewer inspects without concurrently editing application files. Await reviewer PASS/FAIL and user continuation authorization before Batch 02. FAIL fixes only reported discrepancies and produces a new checkpoint.

## 8. Checkpoint identity

Implementation reviewed: **`d5c83955ade6fabe30ae0c1cbbfe20da5ba6e470`** on `codex/poet-requirements-polish`. Source-only portable patch covers baseline `4e65da4` → implementation `d5c8395`. The review-package checkpoint contains documentation/evidence only and follows that commit; exact SHA is in final handoff. No push/merge/deploy is implied by either local checkpoint.
