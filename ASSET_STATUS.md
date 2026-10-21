# Asset status

## Suaserif Bold — Hero-only exception (UI-001, 21 October 2026)

The user approved Suaserif Bold for exactly two Hero uses: the Intro greeting lines (“Hành trình niềm vui bắt đầu”, “Đan tay cùng bước, có nhau là nhà”) and lettering on the playground board (“Have fun”, “Big Joy Little Joy”, “Young Joy Collection”, “POET Community”). All other site text remains Product Sans; the global typography system below is unchanged.

| Source | SHA-256 | Production copy | Metadata | Use |
| --- | --- | --- | --- | --- |
| User-installed `%LOCALAPPDATA%\Microsoft\Windows\Fonts\Suaserif-Bold.otf` (byte-identical to the previously unapproved untracked `v2/fonts/Suaserif-Bold.otf` in the Codex worktree, compared by hash only) | `36b054d61abc09b585bc3aedca307c9bb6456cec35ccdb22f1a729f1f9037bd4` | `assets/fonts/suaserif-bold.otf`, unmodified copy, 48,616 B | name ID 1 `Suaserif`, ID 2 `Bold`, ID 4 `Suaserif Bold`, ID 6 `Suaserif-Bold`; usWeightClass 700; fsType 0; full precomposed Vietnamese coverage for the tested alphabet | `v2/world.css` `@font-face` (weight 700) |

**Licence unverified.** The font carries no copyright (ID 0) or licence (ID 13/14) records; `fsType=0` is not a licence grant. Public web embedding needs confirmation from the user/foundry. The other untracked `Cookie Crumble DEMO.otf` remains unapproved and unused.

## Unified Product Sans only — latest typography decision

The user's long-term instruction supersedes all earlier handwritten/display/body font choices. Live website typography now uses only CSS family `Product Sans` with generic `sans-serif` resilience, across V2, legacy routes, donation/admin pages, SVG text and canvas card lettering. Logo/mascot/image artwork remains intact.

The four supplied OTFs identify internally as **SVN-Product Sans**, normal/italic400 and700; originals remain byte-identical.12project/staged copies resolve to4unique hashes, with no genuine300/500or Product Sans source masters found. All134 tested precomposed Vietnamese-specific letters are present; standalone combining marks are missing, but Edge rendered all200valid NFC/NFD specimen cases natively without fallback. No new or modified font binaries were made.

`assets/css/typography.css` is the single face/weight/size source, imported by `style.css` and `v2/v2.css`. Duplicated face declarations and external font requests are removed. Unavailable caption/UI roles explicitly use Regular400; headings use real Bold700; synthesis is disabled. Do not silently restore Cool Crayon, Be Vietnam Pro, Nunito, Baloo2, Itim or pretend400/700is genuine300/500.

**License review remains unresolved for public embedding/modification.** Font name ID14 points to Google's restricted Product Sans license page; `fsType=0`does not supply a license. These localized files have no separate grant in the project. Full assessment, file metadata, implementation and QA limitations: `docs/PRODUCT_SANS_TYPOGRAPHY.md`. Earlier typography notes below are historical.

## POET V3 editorial integration — 20 October 2026

The user authorized the complete V3 master brief after the font-only pass. Product Sans remains the active V2 UI family; the earlier font-only scope note below is historical. V3 uses eight generated static pages and retains the original logo/mascot artwork.

Two authentic images were selected from the user-supplied Drive albums, visually inspected and classified as historical POET activity photographs: `DSC03962.JPG` from Vết Nứt (file `1OUhaFvghUGYCiOgGJTdg6Ufl5pDDCR5w`) and `IMG_4610.jpg` from Final Trip (file `1OWxnIiGqIn2XBqbl5xu2MxAuke8lqHlL`). Responsive derivatives are `assets/editorial/story-vet-nut-{640,1280}.webp` and `story-go-ngai-{640,1280}.webp`. Proportions and colors are preserved; source files are unchanged. These are provisional editorial selections, not final approved article/cover selections and not Mùa 6 destination photos. `assets/editorial/v3-story-manifest.json` records source IDs, original names/dimensions, URLs and derivative sizes. Production uses only project asset URLs; no signed download or temporary workspace path is referenced.

Mùa 6 school imagery, full approved project articles, leader profiles/portraits, volunteer videos and updated benefits PDF remain pending. Existing press-logo assets and original source links are reused; the older “publication logos not supplied” note below is superseded by the 18 October press-strip inventory.

## Product Sans typography — 20 October 2026

The user supplied `v2/fonts/Product Sans Regular.otf`, `Product Sans Bold.otf`, `Product Sans Italic.otf` and `Product Sans Bold Italic.otf` and explicitly requested replacing GT Walsheim. These existing font assets are used directly and remain unmodified. `v2/site.css` registers the four real faces (400/700, normal/italic) as `Product Sans`; all five V2 pages preload the local Regular face through the site builder. All four Unicode cmap tables cover the checked precomposed Vietnamese alphabet. No temporary paths, remote font download, new dependency, or modifications to the handwritten Intro/logo artwork are involved. The user’s latest font request supersedes the older GT typography instruction in the supplied V3 reference document; other V3 content/design changes are outside this font-only pass.

## Scroll-driven press strip — 18 October 2026

The requested files were absent from the repository and were found in the user's Downloads folder. Their artwork was visually checked against the supplied references. Copies now live at `assets/press/originals/1630636423271.jpg` (Hoa Học Trò, 200 × 200) and `assets/press/originals/tienphong_750x750.png` (Báo Tiền Phong, 750 × 750). Lossless, unscaled crops are `assets/press/hoa-hoc-tro.png` (172 × 111) and `assets/press/tien-phong.png` (390 × 83). Only outer whitespace was trimmed, with a four-pixel safety margin; artwork pixels, colors and proportions were preserved. `assets/press/manifest.json` records crop bounds and source SHA-256 hashes. The two logos are publication identity assets used only in the existing Home “Được giới thiệu trên” strip. `v2/data/content.mjs` holds the extensible logo list and article links. No temporary ChatGPT paths are used by the website.

## V2 full-photo activity banners — 18 October 2026

The user-selected playground and bicycle photographs match existing originals `assets/photos/1555514183277626.jpg` and `assets/photos/1555514213277623.jpg`. Both were visually verified on a contact sheet, classified as historical POET activity photographs, and copied into responsive `assets/editorial/playground-joy-{640,1280,1920}.webp` and `bicycle-joy-{640,1280,1920}.webp`. The other two slides reuse reviewed `community-day` and `poet-volunteers` derivatives with additional 1920px copies. Original photographs and existing derivatives remain unchanged. `assets/editorial/banner-manifest.json` records the sources, dimensions and sizes. These are background photographs for the four Home activity slides, with an explicit historical-photo caption; they do not assert new campaign, merch or Pop Up photography. No images were copied from GiveNow.

## V2 editorial finish — October 2026

Four existing POET photographs were reviewed on fresh contact sheets and copied as responsive 640/1280px WebP derivatives into `assets/editorial/`. Originals remain unchanged. `assets/editorial/manifest.json` records source paths, dimensions and byte sizes. No stock images, generated photographs or external reference-site assets were imported.

| Original | Derivative prefix | Classification / use |
| --- | --- | --- |
| `assets/team/team.jpg` | `poet-team` | Authentic group photograph; About introduction |
| `assets/photos/1555514176610960.jpg` | `school-friends` | Historical POET photograph; Home/Projects with an explicit historical caption, never presented as Ea Kiết Mùa 6 |
| `assets/photos/3348058525513502.jpg` | `community-day` | Historical community activity; volunteer branch |
| `assets/photos/3348058835513471.jpg` | `poet-volunteers` | Group activity photograph; people hub, with individual biographies still pending |

The final selected photographs for “Vết Nứt”, Gò Ngãi articles and the Season 6 school remain pending. Existing lettering and mascot derivatives are reused unchanged. Publication names link to verified articles; official publication-logo assets have not been supplied, so the logo strip explicitly marks that content pending.

Local `v2/GTWalsheimVietnameseTrial-{Light,Regular,Bold}-Refined.otf` files are used at 300/400/700 as explicitly requested. Trial font web-use licensing remains unverified. The Hero keeps its existing Cool Crayon display face.

## Current v2 logo intro — user-selected primary and secondary logos

Both staged files were inspected as transparent POET brand assets and explicitly selected by the user for this intro. Source files and existing nav/favicon `assets/brand/poet-logo.webp` are preserved. No other staged assets are promoted.

| Asset | Source | Source SHA-256 | Production asset | Processing and current references |
| --- | --- | --- | --- | --- |
| Primary POET logo, assembly landing mark | `New materials/LOGO CHÍNH.png`, 2160 × 2700 | `accafa458ccf6a865e0cdbad233b918e6aee0bfa797876de0d9a8b02b2cdd7d3` | `assets/brand/poet-primary-intro.webp`, 224 × 294, 25,594 B | Transparent margin trimmed and downsampled for the 84 × 110 SVG handoff mark; original artwork/palette retained. Replaces the four generic diamonds in `v2/index.html` `.intro-mark`; generated by `v2/tools/board-playground.mjs`. |
| Secondary POET logo, letter-by-letter intro | `New materials/LOGO PHỤ.png`, 240 × 240 | `7643c2082225e10918007b22dfd883f846643cd739e88709fc31285b05bfe4f6` | `assets/brand/poet-secondary.png`, 240 × 240, 23,563 B | Byte-identical normalized copy. Four disjoint SVG clips retain the exact P, flower O, e and T pixels while animating each independently. The final logo arrangement is unchanged. Referenced by `.intro-logo-letter image`; no separate raster letter copies. |

Reproduction: `node .audit-tools/prepare-intro-logos.cjs` from DRAFT. Inspection bounds, source hashes and output hashes are recorded in `audit-work/hero-logo-intro/assets.json`.

## Pass 1 / Pass 2 opening prototype

Only the asset below is selected for this experiment. Pass 2 reuses the same derivative (no new asset); it now sits in the hero greeting kicker instead of a separate intro sign. This does not promote the remainder of `New materials/`. The complete initial inventory is in `docs/NEW_MATERIALS_INVENTORY.csv`; the authority and font/color conflicts remain documented in `docs/PHASE_0_AUDIT.md`.

| Asset | Source | Source SHA-256 | Derivative | Status | Code references |
| --- | --- | --- | --- | --- | --- |
| Happy flower mascot | `New materials/MASCOT/Bé Cúc Young Joy/Cúc Tươi Cười.png` | `bb07092f0d3f39ad5eb59342f91945a23115a0071ef3028c32213b3fe5a9e64e` | `assets/experiments/opening/flower-happy.webp`, 192 × 192, 5,752 bytes; resized from 2008 × 2008 PNG with transparency retained | Experimental only; inspect in this motion test, not approval of an evergreen brand asset. Shown at 40px (34px mobile) at rest and scaled up to ~136px during the greeting, so it is slightly soft on 2× screens; a 384px derivative from the same source would fix that if the mascot is approved | `index.html` decorative `.hero-hello img` (Pass 2; Pass 1 `.opening-sign` removed) |

The source and designer-pack copy are byte-identical. The inspected high-resolution separate pose was preferred over a composite mascot sheet or raster logo crop. No production asset was overwritten. The original remains staged. Existing logo, photos, seal and spark SVGs remain in use. Palette/font conflicts were avoided by retaining the site's existing tokens and typography.

To remove the experiment, remove its intro markup and motion hooks, then remove this manifest entry and the experimental derivative when no longer referenced. Never remove the original source.

## v2 hero (Bốn Nét), branch `poet-redesign-v2`

Selected for the new hero only (`v2/index.html`). Derivatives were trimmed of transparent margin and resized to 2× their largest display size in headless Edge (canvas WebP encoder). Originals stay staged and untouched. The legacy site does not reference any of these.

| Asset | Source | Source SHA-256 | Derivative | Status | Code references |
| --- | --- | --- | --- | --- | --- |
| Slide | `New materials/CÔNG VIÊN NIỀM VUI/Cầu Tuột.png` (2008²) | `4ff7d34ea2b95d27389b10a95370cd9ba737cf470529d7428a8f91e24a9a60fd` | `assets/season-6/playground/slide.webp`, 560 × 421, 51,596 B | Season 6 campaign asset; in use | `v2/index.html` `[data-obj="slide"]` |
| Wheelbarrow | `New materials/CÔNG VIÊN NIỀM VUI/Xe Rùa.png` | `ac75fa0b9aecc41e839dc36bb81f739d4555ee059aa890538639049cf5a46f3c` | `assets/season-6/playground/wheelbarrow.webp`, 480 × 309, 63,252 B | Season 6; in use (≥701px) | `[data-obj="wheelbarrow"]` |
| Schoolbag | `New materials/CÔNG VIÊN NIỀM VUI/Cặp Sách.png` | `98456967b3a7832e4eef4006e4b85482fb423601de79cb85fb9d3f7d69c3f79a` | `assets/season-6/playground/schoolbag.webp`, 360 × 311, 75,532 B | Season 6; in use (≥1181px) | `[data-obj="schoolbag"]` |
| Sandals (split into two) | `New materials/CÔNG VIÊN NIỀM VUI/Dép Lào.png` | `3379a5aa2a290802a77c5f38905811846205d0a9b5613afdf8cbacca04b98ec8` | `assets/season-6/playground/sandal-left.webp` 147 × 300, 21,598 B; `sandal-right.webp` 148 × 300, 21,426 B | Season 6; split at the empty gap between the pair so each can enter separately | `[data-obj="sandal-a"]`, `[data-obj="sandal-b"]` |
| Bé Mầm, standing | `New materials/MASCOT/Bé Mầm Nhí Nhảnh/8.png` | `44934e72758986d845f3cfdd344b4f8f15480275731499c2000b9b9c49c74bf7` | `assets/mascot/be-mam/stand.webp`, 310 × 400, 10,922 B | Mascot role still to be confirmed by POET (see materials review) | `.mascot .pose-stand`, `.mascot-slot` |
| Bé Mầm, jumping | `New materials/MASCOT/Bé Mầm Nhí Nhảnh/9.png` | `547f3b98e69565902f8f974f6db7eaa506b5a6ded19312b1dc3ae581a469cfc1` | `assets/mascot/be-mam/jump.webp`, 310 × 400, 11,472 B | Same crop box as standing, so poses swap without a jump | `.mascot .pose-jump` |
| Primary logo | `New materials/LOGO CHÍNH.png` (2160 × 2700) | `accafa458ccf6a865e0cdbad233b918e6aee0bfa797876de0d9a8b02b2cdd7d3` | `assets/brand/poet-logo.webp`, 98 × 128, 8,504 B | Raster logo for the v2 nav and favicon; legacy `assets/logo/` JPG untouched | `.wordmark img`, `<link rel="icon">` |
| FC DK Cool Crayon | `New materials/BRAND GUIDELINE/POET TỔNG/FONT BRANDGUIDELINE/FC-DK-Cool-Crayon.otf` | `94c43c0c28032ffda8486f5611e9f239b0d4ca4240ea7e57bbc94f90caf6c938` | `assets/fonts/fc-dk-cool-crayon.otf`, unmodified copy, 1,242,392 B | **Web licence unconfirmed.** Over budget: needs a subset WOFF2 (no font tooling available here) | `v2/v2.css` `@font-face` |

Per-object budget in `docs/HERO_SPEC.md` is 45 KB; slide, wheelbarrow and schoolbag exceed it because the crayon texture lives in the alpha channel, which the encoder keeps lossless. Total hero images are 264 KB (budget 280 KB). Seesaw and swing exist only inside `PLAYGROUND CONCEPT.jpg` (reference only) and are not used.

**Update (hero build, isometric):** `v2/index.html` no longer references the playground PNG derivatives (slide, wheelbarrow, schoolbag, sandals); those objects are now drawn as SVG by `v2/tools/playground.mjs`. The derivatives stay in `assets/season-6/playground/` (still referenced by `v2/hero-layout.html`) until a decision is made. Bé Mầm (`assets/mascot/be-mam/`) and the logo are still in use.

## v2 joy park world (static, under review)

| Asset | Source | Source SHA-256 | Derivative | Status | Code references |
| --- | --- | --- | --- | --- | --- |
| Bé Mầm, hopping on one leg | `New materials/MASCOT/Bé Mầm Nhí Nhảnh/9.png` | `547f3b98e69565902f8f974f6db7eaa506b5a6ded19312b1dc3ae581a469cfc1` | `assets/mascot/be-mam/hop.webp`, 310 × 400, 11,532 B | **Modified pose (approved by the user for the prototype):** right leg erased and redrawn raised and bent, ink and foot colours sampled from the drawing; same crop box as stand/jump. Needs POET brand approval before launch | `v2/index.html` `.mascot .pose-hop` |
| Bé Cúc Vui Tươi | `New materials/MASCOT/Bé Cúc Young Joy/Cúc VuiTuoi.png` | `64a050d3bf1a2546c4376ec854978cd6ed1bfbf26b6b747a75376721bdd4b137` | `assets/mascot/be-cuc/vui-tuoi.webp`, 180 × 200, 9,702 B | Daisy by the swing | `[data-obj="daisy-vui-tuoi"]` |
| Bé Cúc Du Lịch | `New materials/MASCOT/Bé Cúc Young Joy/Cúc Du Lịch.png` | `eca534b6212ee7aaca8baee1233d062765a16d47fc175cf2c9ccb62b6142d5e5` | `assets/mascot/be-cuc/du-lich.webp`, 239 × 200, 11,146 B | Daisy on the path | `[data-obj="daisy-du-lich"]` |
| Bé Cúc Sóng Gió | `New materials/MASCOT/Bé Cúc Young Joy/Cúc Sóng Gió.png` | `9a2e2e6389dd0b3433b22247fe1eb8445c2aaac070de1a6b5ebfbf4b5181744c` | `assets/mascot/be-cuc/song-gio.webp`, 147 × 200, 8,450 B | Daisy at the seesaw | `[data-obj="daisy-song-gio"]` |
| Bé Cúc Enjoy | `New materials/MASCOT/Bé Cúc Young Joy/Cúc Enjoy.png` | `e5894c8f48f9469e454315733f22709ed4864361cf0170ba393d110afaaf1780` | `assets/mascot/be-cuc/enjoy.webp`, 183 × 200, 9,918 B | Daisy at booth 1 | `[data-obj="daisy-enjoy"]` |
| “Công Viên Niềm Vui” lettering | `New materials/CÔNG VIÊN NIỀM VUI/Công Viên Niềm Vui.png` | `82e224e3d7c6ab928fc647f3a7c03268bfa0b1cc4d5550f366fd969c95ec788a` | `assets/season-6/lettering/cong-vien-niem-vui.webp`, 214 × 360, 20,178 B | Superseded on the current Hero sign by the user-selected Young Joy artwork. Original source and derivative retained unchanged. | Previous sign variants; no longer referenced by the current `[data-obj="park-sign"]` |
| “Big Joy Little Joy” lettering | `New materials/Big joy little joy.png` (added after Phase 0; now in the inventory CSV) | `d5ba96c92c2cedd0fe83e5451ecaf91d73e7a07d72961e54019d356dfc375e42` | `assets/season-6/lettering/big-joy-little-joy.webp`, 520 × 233, 22,466 B | Painted onto the billboard face | `[data-obj="sign-big-joy"]` |
| “(dân chơi) Young Joy” lettering | `New materials/(DÂN CHƠI) YOUNG JOY/19.png` | `77aa35e55304ae3b68109788198e7e8f363e85fee7f8d15b2fde9fa788058ce0` | `assets/season-6/lettering/dan-choi-young-joy.webp`, 460 × 228, 27,116 B | User-selected replacement for the current upper-right Hero sign. Existing transparent derivative matches the attached lettering, including Vietnamese accents and the flower O. Reused unchanged on a landscape board; no duplicate asset created. Staged source and identical designer-pack copy remain untouched. | `v2/index.html` `[data-obj="park-sign"] .park-sign-lettering`; generated by `v2/tools/board-playground.mjs`; earlier prototype booth-3 banner retained separately |

Schools, trees, booths, sign structures and the grass island are vector drawings generated by `v2/tools/playground.mjs` (no raster sources).

## Navigation / Home prototype restoration — 20 October 2026

Reused the existing official `assets/brand/poet-logo.webp` without modifying or replacing it. The prototype's temporary yellow POET tile remains reference-only.

Added six unmodified interface SVGs from the official pinned Lucide0.468.0 repository: `heart`, `sparkles`, `chevron-down`, `circle-check`, `users`, `building-2`, under `assets/icons/lucide/`. Source: `https://github.com/lucide-icons/lucide/tree/0.468.0/icons`. Upstream `LICENSE` is included in the same directory. These are decorative local CSS masks for the restored nav and Home campaign preview; no package, CDN runtime or new brand illustration. Original SVG colors are controlled through CSS `currentColor`; source geometry is unchanged.

Visual reference: user-provided `Screenshot 2026-10-20 153818.png`; review copy and combined comparison are outside production assets in `../audit-work/layout-restoration/`. No screenshot is used as website content. See `docs/PROTOTYPE_LAYOUT_RESTORATION.md`.

## Two stall structures and Bé Cúc hover — 20 October 2026

User's attached frontal merchandise-booth image is a visual reference only. No watermark, reference bitmap or new raster material is copied into the website. No finished official merchandise design was found in the existing project/staged inventory; the new plain shirt, tote and folded-shirt stack are representative decorative SVG products, not official product claims.

Production changes are code-native SVG in `v2/tools/board-playground.mjs`: Community's yellow folded canopy/reception display and Young Joy Collection's coral/cream striped canopy, sales counter and merchandise rail. Same board camera, positions and two-cell structural limits. Big Joy Little Joy artwork remains unchanged. Existing `assets/mascot/be-cuc/{vui-tuoi,du-lich,enjoy}.webp` are reused unchanged at1.30display size; Bé Mầm/logo/font files remain untouched. No new font, texture, cloud, engine or dependency. Report: `docs/HERO_STALLS_MASCOT_REFINEMENT.md`; evidence: `../audit-work/stalls-mascots/`.
