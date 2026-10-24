# POET V3 — implementation inventory

Source review: 20 October 2026. The full user-supplied master brief and all 33 annotated images from `POET WEBSITE_UPDATE_1.md` have been reviewed. Readable extraction, contact sheets and source backups: `../../audit-work/v3/`. AI Studio is not accessible in this session; local source and supplied screenshots are the visual references as permitted by the brief.

## Source decisions

- Latest direct Product Sans request overrides the master brief's earlier GT font instruction.
- The master brief's new stable Bé Mầm / Have fun / perimeter geometry instructions supersede the older route-running / Young Joy signage requests.
- Preserve the Intro glyph/poem choreography, thumbnail transition timings and stable detail CTA. Preserve the wave handoff; point it at the actual thumbnail anchor.
- Preserve approved backgrounds and brand tokens; reduce card radii and excess spacing outside protected motion.
- Prototype images are references, not proof that 78,450,000 VND / 64% / 248 donors / 14 businesses are verified live results. Keep missing campaign statistics explicitly unavailable.
- Final approved Season 6 narrative replaces the old short campaign text and uses Hoàng Văn Thụ, Ea Kiết, Đắk Lắk; 09/2026–01/2027; Young Joy Collection; Big Joy Pop-up; Final Trip.
- Donation API, recipient, QR, bank data and verification remain authoritative. Only confirmed payment may show the new thank-you copy.

## Change inventory / implementation checklist

| Section | Baseline | V3 implementation | Action | Source |
| --- | --- | --- | --- | --- |
| Intro | Four logo glyphs + two poem lines | Keep animation, no nav during Intro | Keep | §6.1; image1 |
| Hero | Inner loop, 6 buildings, running sprout, two signs | Unified perimeter cells, one 3-cell school, 3 distinct 2-cell stalls, one nearby tree, one house after gap; remove benches and old sign; stable sprout; larger swaying flower; Have fun | Modify | §5 |
| Thumbnail | 4 animated slides + dots/pause | Keep choreography, add prev/next, finalized activity names/status | Modify | §6.3; image2 |
| Press strip | Real HHT / Tiền Phong logos | Keep scroll/mask/label behavior | Keep | §6.4; image3 |
| Campaign | Short outdated summary | Final Season 6 narrative, compact summary + expandable longer copy, clear destination/beneficiaries | Modify | §6.5, §13; image32 |
| Progress | Target + missing data | Shared campaign component with actual/missing raised/remaining/percent, 4 brand milestones, two contributor categories, donate + message wall actions | Modify | §6.6; image4 |
| Completed projects | Placeholder covers + inline details | Shared scalable records, honest image states, working detail routes, gallery/source slots | Modify/Add | §6.8, §8.4; image7/17 |
| Press articles | Horizontal rail without covers | Original verified titles, cover image areas, source links, scalable rail | Modify | §6.9, §7.5; image8/13 |
| Participation | Three broad action cards | Parallel concrete individual / business / volunteer pathways | Modify | §6.10; image9 |
| About | Existing identity/mission/people | Editorial identity, 3 audience groups, real scoped count-ups, departments article structure, no invented names/quotes/portraits | Modify | §7; image11–14 |
| Projects | Current/completed tabs, long copy | Reuse campaign/progress, school narrative, real/pending destination photos, scalable completed collection | Modify | §8; image15–17 |
| Individual | PayOS + upcoming cards + wall | Preserve payment; forthcoming Pop-up/Collection statuses, bounded messages + more, working deep link | Keep/Modify | §9; image18–22 |
| Business | BJLJ + empty sponsor state | Distinct two-tab BJLJ/sponsor paths; animated board journey; hover/focus/tap notes; package disclosure + prefilled mail draft | Modify/Add | §10; image23–28 |
| Volunteer | Pending content | Configurable recruitment state and honest editorial/video slots; no fake application or team bios | Modify | §11; image29–31 |
| Footer | Brand/contact/socials | Simplified identity, verified contacts/socials higher in hierarchy, no repeated full nav | Modify | §12; image10 |
| Confirmation | Verified PayOS result page | New thank-you copy only inside confirmed-success branch | Modify | §6.7; image33 |

## Content still requiring confirmation

- Campaign-scoped raised amount, contributor counts and completion percentage.
- Final long-form project article copy and final photo selection. Two authentic album images have been downloaded, reviewed and integrated as provisional editorial covers; destination imagery for Mùa 6 is still missing.
- Department/leader profiles, portraits, member counts and quotes; volunteer video selection and recruitment dates.
- Exact in-kind/financial sponsorship entitlements and any formal cooperation process requirements.
- Existing benefits PDF is available locally as a reference; updated approved edition remains pending.
- Editorial decision on the completed-project overview note marked for confirmation is retained, not silently deleted.

## Implemented

All rows above now have their UI, data structure, route and applicable interaction implemented. Pending factual/editorial material remains visibly pending, rather than fabricated. This is an implementation of the supplied brief, not a claim that unpublished source content has been approved.

- **Hero:** one 9×9 coordinate grid, 88-unit cells, 32 touching perimeter tiles; school spans cells 1–3, two clear cells before the house in cell 6. Three distinct two-cell stalls use awning / merchandise / community treatments. One school tree; no benches or old Young Joy billboard. Bé Mầm stays in place with breathing only; flowers are larger and sway gently. “Have fun” retains keyboard, pointer, wave handoff, focus feedback and controlled idle invitation. The transparent mobile hit area is enlarged.
- **Motion preserved:** original four-glyph logo and two poem lines; Intro timing; image/text dissolve and reveal; 1.5s reading hold; persistent detail CTA; click/wheel liquid handoff. No library or animation dependency added.
- **Home:** carousel previous/next and existing dots/pause/swipe/keys; finalized activity names; real press logos and stationary mask; campaign summary, dates, destination and 300 beneficiaries; shared progress component; real completed-project covers/detail links; media covers; three explicit participation paths.
- **Projects:** same campaign/progress component, complete approved narrative, school context, documented budget and pending destination-photo slot. Completed-project tab uses shared records. New working routes: `/v2/du-an/vet-nut/` and `/v2/du-an/go-ngai/`. These contain verified introductions, metrics, authentic cover photographs and original album/article links; full editorial stories remain pending.
- **About:** concise identity, three audience missions, real Mùa 5 scoped counters, people article at `/v2/team/phan-ban/`, media rail, no duplicate project collection. No fabricated leader portraits, headcounts, quotes or department responsibilities.
- **Individuals:** PayOS flow preserved; “Sắp được bật mí” for both upcoming activities; real message wall remains bounded with “Xem thêm”; `#loi-nhan` opens the correct parent tab.
- **Business:** brand/sponsor tabs; journey mascot moves on selection through transform, notes appear on hover/focus/tap and close on Escape/leave; ten verified tier disclosures; package-to-contact selection; reviewable editable `mailto:poet.npo@gmail.com` draft with copy fallback. Sponsor path explains documented financial/in-kind needs and qualifies suggested process/recognition as matters to agree, not guaranteed entitlements.
- **Volunteer:** existing structure retained, four known departments, no Điều hành listing card, configurable recruitment/video slots and honest unpublished states.
- **Footer/payment result:** verified contact/social links higher in hierarchy; simplified footer; approved thank-you copy inside confirmed-success branch only. Recipient, bank/QR data, API, checkout and payment verification logic were not changed.

## Files / reusable parts

Source: `v2/data/content.mjs`, `v2/tools/site-templates.mjs`, `v2/tools/build-site.mjs`, `v2/tools/board-playground.mjs`, `v2/world.js`, `v2/world.css`, `v2/site.css`, `v2/site.js`, `v2/activity-carousel.js`, `v2/chrome.js`, `ung-ho/result.js`, `ung-ho/return.html`.

Generated pages: Home, About, Projects, Partnership, Volunteer, two project detail pages and departments article. Shared `campaign`, `fundraising`, `archive` and `projectDetail` consume the same seasonal/project records. Recruitment/video/destination-photo slots are configured in `content.mjs`; no CMS or backend was added.

New production assets: four `assets/editorial/story-{vet-nut,go-ngai}-{640,1280}.webp` derivatives and `v3-story-manifest.json`. Originals remain intact in the user-provided Drive folders. Photos are not represented as new Mùa 6 school imagery. Unrelated legacy root-page edits already present in the repository were not reverted or included in a new commit.

## Validation

- `npm.cmd run build:site --prefix v2` — eight static pages generated successfully; budget sum checked against target. Node syntax checks passed for changed JS/modules. No dependency added.
- `../../audit-work/v3/browser-qa.json` — 32 route/viewport checks at 1440, 1024, 768 and 390px; no horizontal overflow or detected broken images, no page errors. Actual clicks verified previous/next, Have fun wave, stable sprout, journey focus/Escape, tier-to-form selection and reviewable email draft. Message-wall deep link and unverified payment waiting state verified.
- `../../audit-work/v3/final-qa.json` — served HTML/JS/CSS byte-equal to project files, cache `no-store`; fresh and returning refresh play; 13 owned ambient timelines after reload, no path timeline. Actual wheel wave, carousel autoplay, shared campaign output, both detail routes, sponsor selection, donation modal Escape and mobile menu verified. 35 unique internal route/asset targets returned success; no local failing responses or page errors.
- Press strip actual scroll samples: scrollY 1387→1567→1447; translateX −358.403→−297.772→−338.193px. Label computed transform stayed `none`. Explicit reduced-motion review held the strip static and created zero Hero ambient timelines.
- Uninterrupted initial playback sampled natural wall-clock timestamps, without setting GSAP progress: glyph reveal, tile fall/landing, world pop and final scene are recorded in `playback-*.png` and `browser-qa.json`. Current assembly completes at approximately 10.90s; Intro choreography was retained.
- `../../audit-work/v3/release-qa.json` — final shared-cell placement and 32 tiles / three stalls checked, mobile Have fun target approximately 82×71px, single/empty carousel initialization smoke checks, and the success copy verified using an explicitly mocked API-status fixture. The fixture did not create an order or perform a payment.
- `../../audit-work/v3/touch-qa.json` — actual Playwright touchscreen taps at 390px activated Have fun and completed the wave, then opened/closed journey notes by tapping the same milestone. No page errors. This is touch emulation, not a physical-device result.
- Local preview deliberately retains the previously approved full-motion default for VS Code embedded browser. To inspect OS-reduced behavior locally use `?heroMotion=respect&carouselMotion=respect&pressMotion=respect`; public-host behavior honors OS reduced motion.

### Visual evidence

Evidence directory: `../../audit-work/v3/`. Final screenshots: `home-desktop-full.png`, `hero-desktop.png`, `about-desktop.png`, `project-desktop.png`, `business-desktop.png`, `sponsor-desktop.png`, `hero-mobile.png`, `home-mobile-full.png`, `business-mobile.png`. Browser QA is Edge headless; phone-size/touch emulation does not substitute for physical iOS/Android hardware.

[Homepage](../../audit-work/v3/home-desktop-full.png) · [Hero](../../audit-work/v3/hero-desktop.png) · [About](../../audit-work/v3/about-desktop.png) · [Current project](../../audit-work/v3/project-desktop.png) · [Business](../../audit-work/v3/business-desktop.png) · [Mobile](../../audit-work/v3/home-mobile-full.png)

## Remaining limits

AI Studio could not be accessed in this session, so comparison used all 33 supplied annotated screenshots and existing approved implementation. Final editorial stories/selected photos, Mùa 6 destination images, live campaign totals, individual profiles, recruitment/video material, exact sponsor recognition terms and updated benefits PDF still require POET content approval. Existing media source titles/dates and PDF caveat remain visible. No live payment was made, no external form submitted, no email sent, no deployment/commit/push performed. Payment-success copy is a UI change; a status-fixture test is not evidence of a real paid transaction.

## Follow-up: campaign prototype restoration

Latest direct request supersedes the earlier mint section / four-color milestone treatment. Restored two equal separate cards with the reference's light backgrounds and bottom-aligned actions, on an unboxed cream section background. Progress and donate button use the supplied brand pink `#EF8A7D`; button text uses dark brand ink for readability. Replaced the left card with the latest yellow-marked copy and all five activities. Shared component updates both Home and Projects; existing motion and payment runtime are unchanged. Missing live totals/counts remain pending.

Build succeeded. `../../audit-work/campaign-prototype/qa.json` verifies eight Home/Projects views at1440/1024/768/390, pink RGB239/138/125, no horizontal overflow/pageerrors, equal card heights on desktop, donate dialog and detail links. [Desktop section](../../audit-work/campaign-prototype/1440-home.png) · [Mobile section](../../audit-work/campaign-prototype/390-home.png).
