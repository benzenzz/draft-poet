# Navigation and Season 6 Home preview restoration

20 October 2026. Implemented the user's attached restoration task in the existing vanilla V2 site. Local preview: http://127.0.0.1:8766/v2/.

## Visual source and scope

The target is the supplied original prototype with organization name/subtitle, three supporting points and three statistic cards. Its original capture is `C:/Users/trang/Pictures/Screenshots/Screenshot 2026-10-20 153818.png` (1350×643). This is the full-organization header/three-statistics image described by the brief's concrete requirements. The current simplified header/tall pending-data panel is not the target.

Only navigation and Home's Season 6 preview changed. Full approved five-activity copy remains on the existing project page; its generated main HTML is byte-identical to the pre-task baseline. Intro/Hero markup, animation sources, carousel, press strip, other Home sections and footer are preserved.

## Layout and color changes

- Header restored to logo + “CLB Thiện Nguyện POET” + “Mùa 6 · Công Viên Niềm Vui”, centered navigation group, outlined partner dropdown, separate donation CTA. Existing official POET flower logo is retained rather than substituting the prototype's temporary yellow wordmark.
- Desktop header is74px; donation button is136×36px. At1350px, cards are591.5×475px, gap32px, inner padding32px, radius24px. At1440px the centered container is capped at1350px; cards remain475px high. At1024px both cards are475px high with24px gap. At901px they grow equally to492.09px to keep content readable.
- At900px and below, Home cards stack and use natural content height. Mobile navigation retains its drawer, keyboard focus behavior, background inert state and Escape handling. Three statistics remain horizontally aligned; decorative stat icons are omitted at600px and below to keep labels readable.
- Progress surface is `#FFF9F6`, border/divider `#F0C4BD`, bar and donation CTA `#EF8A7D`. Badge and small explanatory copy use readable dark coral. No green enclosing section or mint progress panel on Home.
- Header uses approved cream/yellow/green accents; the existing dark green CTA shade is retained for readable white text. Other page color systems are unchanged.
- Product Sans remains the sole design family, with real400 body and700 emphasis faces. No font binary or global typography token changed. The Home heading uses33px/1.14 with normal tracking to approximate the reference's visible heading width with the supplied Product Sans metrics. Other heading styles are unchanged.

## Content and provisional figures

Home now has a short approved-school introduction and exactly three concise supporting points: safer play/learning space; Big Joy Little Joy and community fundraising; Young Joy Collection, planned Pop-up and Final Trip. Timeline is09/2026–01/2027. The detail CTA opens `/v2/du-an/#dang-thuc-hien`.

The user explicitly authorized prototype reference figures when newer verified figures are absent. A separate `homepageFundraisingPreview` record supplies78,450,000raised,248individuals and14businesses. The verified target remains121,950,000 and student count300. Remaining43,500,000 and64%rounded are computed. `season.raised`, `season.individuals` and `season.businesses` remain null; no API/payment record was changed.

The Home badge has an asterisk and a visible note explicitly identifies the amount/contributor figures as unconfirmed prototype examples. “Trực tiếp” was removed from this preview label. Any finite confirmed field supplied later takes priority over its corresponding preview field. The project page continues to display pending figures, without importing preview numbers.

## Files modified

Source: `v2/chrome.js` (navigation markup only), `v2/site.css` (appended navigation/Home-specific rules), `v2/data/content.mjs` (separate preview record), `v2/tools/site-templates.mjs` (Home-only preview renderer), `v2/tools/build-site.mjs` (style/chrome cache revision).

Generated: `v2/index.html`, `v2/team/index.html`, `v2/du-an/index.html`, `v2/dong-hanh/index.html`, `v2/tinh-nguyen-vien/index.html`, `v2/du-an/vet-nut/index.html`, `v2/du-an/go-ngai/index.html`, `v2/team/phan-ban/index.html`. Subpage body content is unchanged; rebuilt head references load the current shared navigation styles/runtime.

Assets: six unmodified, pinned Lucide0.468.0 SVGs and upstream license under `assets/icons/lucide/`. Static SVG masks require no package installation or third-party runtime request. Documentation: this report, root `design-qa.md`, `ASSET_STATUS.md`, `CODEX_CONTEXT.md`.

## Validation and remaining differences

Build command from DRAFT: `npm.cmd run build:site --prefix poet/v2` succeeds and generates8pages. Syntax checks pass for the affected JS modules.

Microsoft Edge/Playwright layout checks cover1350,1440,1024,901,900,768,760,390and320px. No horizontal page overflow or page errors. Tested dropdown/Escape, mobile drawer/focus/inert state, active project navigation, donation dialog open/close, detail link and message-wall link. No live payment or form was submitted.

Final same-width source/render comparison and focused navigation comparison: `../../audit-work/layout-restoration/comparison-desktop.png` and `comparison-navigation.png`. The source's12px black capture border is removed; the implementation viewport is1350×631at1×density. Card horizontal geometry and heights align closely. The header/card vertical position differs by about2px; Product Sans text metrics, official flower logo, outlined heart, approved replacement copy, coral treatment and provisional-data note intentionally differ from the reference. This is not a claim of pixel-perfect identity.

Preservation and functional evidence: `../../audit-work/layout-restoration/preservation.json`, `qa.json`, `motion-qa.json`, desktop/mobile screenshots. The real Intro→Hero→wave→carousel path is exercised separately without seeking/fast-forwarding the animation. Four original OTF hashes still match the preceding font audit.

Browser coverage is installed Windows Edge, including emulated responsive widths. Physical phones, Safari and Firefox were not tested in this pass.
