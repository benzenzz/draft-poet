# Prototype restoration visual QA

final result: passed

Scope: navigation and Home Season6 summary/progress only. Date:20October2026. No claim of pixel-perfect identity.

## Source and comparison state

- Source visual truth: `C:/Users/trang/Pictures/Screenshots/Screenshot 2026-10-20 153818.png`,1350×643. Saved review copy: `../audit-work/layout-restoration/prototype-reference.png`.
- Rendered URL: http://127.0.0.1:8766/v2/. Installed Microsoft Edge, CSS viewport1350×631, deviceScaleFactor1. Navigation is sticky; Home campaign starts below it, as in the source.
- Normalize by removing only the source's12px black capture border, yielding1350×631. Do not reproduce this external capture decoration in the app.
- Both source and final render were opened together in `../audit-work/layout-restoration/comparison-desktop.png`. Focused readable header comparison: `comparison-navigation.png`. Mobile full cards: `390-cards.png`; narrow view: `320-cards.png`.

## Findings resolved

| Before | After | Why |
| --- | --- | --- |
| Minimal POET name without organization subtitle | Official logo, organization name and season subtitle; prototype header composition | Restores the requested navigation hierarchy |
| Long Home prose/five bullets and two statistics | Short introduction, three supporting points and three statistics | Restores475px desktop card height and original density |
| Mint progress card and pending-only empty composition | Light coral progress card, full percentage/bar/statistics composition, explicit prototype-data disclosure | Matches the requested restoration without claiming verified live figures |
| First comparison: oversized location label, slightly compressed navigation group and taller stat labels |12px location label, adjusted navigation gaps/dropdown padding and corrected stat label margins | Aligns reference scale and72px desktop stat cards |
| Intermediate comparison: added supporting copy grew card to490px | Reduced only Home paragraph/list gaps; equal475px cards restored | Preserves the source proportions while keeping all three points |
| Squeezed two-column tablet content | Home stacks at900px; all three statistics stay horizontal | Keeps text and controls readable without overflow |

After each visual fix the app was captured again. Final comparison shows no unresolved P0/P1/P2 differences within the authorized restoration scope.

## Required fidelity surfaces

- **Fonts:** Existing Product Sans400and700, `font-synthesis:none`; body and captions are Regular, headings/lead-ins Bold. CDP actual font inspection finds custom SVN-ProductSans and SVN-ProductSansBold for the new Vietnamese text, not a substituted body family. Native supplied font metrics differ from the reference; controlled Home heading sizing approximates its visible width. Font files and global typography CSS are unchanged.
- **Spacing/layout:** At1350px, each card591.5×475px, gap32px, padding32px, radius24px; aligned tops/bottoms. Header74px, primary nav CTA136×36px. Continuous14px progress bar. Mobile/tablet retain readable content and no horizontal page overflow at all nine tested widths.
- **Colors:** Exact coral#EF8A7Dfor Home bar/CTA; very light coral surface and border. The label/badge/note use dark coral for contrast. Cream header/section with yellow dropdown and green active marker. Existing dark green nav CTA retained for white-text contrast; other sections are unchanged.
- **Images/icons:** Original official flower asset retained with `object-fit:contain`; no crop/stretch or new logo approximation. Decorative interface icons are unmodified SVGs from pinned Lucide0.468.0 with license included, rendered as local masks. No generated raster or framework dependency.
- **Copy/content:** Correct Hoàng Văn Thụ/Ea Kiết/Đắk Lắk destination, requested two-line headline, approved09/2026–01/2027timeline, three concise points. Full project copy remains intact. Prototype-only figures are isolated and visibly disclosed; they are not described as live.

## Functional and preservation checks

Evidence: `../audit-work/layout-restoration/qa.json`, `preservation.json`, `motion-qa.json`.

- Build8static pages succeeds; affected JavaScript syntax passes.
- Desktop dropdown/Escape, mobile drawer/focus/inert restoration, active page marker, donation dialog, project-detail and message-wall links pass. No payment/form submission.
-9responsive widths1350/1440/1024/901/900/768/760/390/320: no page overflow or uncaught page errors. Natural content growth at901px and mobile is intentional; never clip updated copy to force a fixed height.
- Project main HTML, other Home sections, Intro/Hero markup, footer code and all original CSS before the scoped addition remain identical. Protected motion/carousel/press/payment UI runtime sources and central typography hashes match the pre-task baseline. Four OTF hashes match the preceding font audit.
- Actual full-motion Intro→Hero and pointer Havefun→wave→thumbnail playback are tested, followed by carousel next. Existing keyboard activation bypasses the wave by design; no animation handler was changed.

## Remaining expected differences / follow-up polish

P3: about2px header/card vertical offset after capture-border normalization; supplied Product Sans metrics and official flower instead of the prototype's temporary yellow logo; outlined rather than filled heart. Updated copy, required coral recolor and explicit provisional-data footnote are intentional differences. No unrelated sections were restyled to chase the reference.

Physical-device and other-browser-engine testing remains outside this pass; do not infer Safari/Firefox parity from Edge responsive emulation.

## Implementation checklist

- [x] Restore header composition and functional navigation.
- [x] Restore compact, equal Home cards with three points/three statistics.
- [x] Apply coral progress theme and disclose prototype-only figures.
- [x] Rebuild, compare source/render together and resolve substantive mismatches.
- [x] Verify responsive behavior, real motion handoff and protected source preservation.

---

## Follow-up: Community / Young Joy stalls and Bé Cúc hover

final result: passed

Scope: two stalls, three flower mascot display sizes and their hover interaction. The rejected whole-scene illustrated/cloud pass remains reverted. Previous navigation/campaign work above is unchanged.

**Sources and captures:** current pre-change Hero saved under `../audit-work/stalls-mascots/before/`, user-supplied frontal merchandise-booth illustration, and the explicit architecture/interaction brief. This is an isometric adaptation of the booth reference, not a pixel clone of its frontal composition. Before and after are compared at1440×900, deviceScaleFactor1; both opened together in `comparison.png`. Native stall closeups and all three hover-state screenshots are in the same evidence directory.

**Resolved visual/interaction findings:** previously empty, slab-like booths now have four canopy posts, proper service counters and distinct functions. Community has a folded yellow canopy, supported noticeboard and brochure holder. Young Joy has coral/cream striped pitched canopy, hanging shirt/tote and folded stock. Counter normals face inward and every structural vertex is checked inside the original two-cell envelope. Corrected reflected local polygon winding and canopy slope after the first actual render exposed flat/hidden roof faces; lowered the hanging display so handles clear the visible roof. Signage attaches to the inner eave and fits its plate.

**Fidelity surfaces:**

- Fonts: existing Product Sans; new label text uses actual Bold700 with natural proportions and measured plate fit. No font binary/global scale changes or tiny fake copy.
- Layout: same global camera,32tiles/closed route,50build items and all original anchors.45untargeted objects, including Big Joy, are source-identical. Three Bé Cúc images enlarge uniformly by1.30and keep exact original feet. Hero stage/viewBox and post-Hero main content are unchanged.
- Colors: new stall materials use the brief's five brand hex values and mild tints, scoped locally. The scene retains its current clean vector finish; no revived cloud/grain treatment.
- Artwork: original flower/sprout/logo assets retained. New booth/product shapes are SVG in the same camera, explicitly authorized by the brief. Decorative merchandise is unbranded and representative. No new raster dependencies.
- Content: correct Community/Young Joy labels; no product launch claims, invented official designs, new links or altered season content. Have fun remains actionable; flowers remain decorative without button/focus semantics.

**Motion and QA:** `static-qa.json`, `motion-qa.json`, `touch-qa.json` in `../audit-work/stalls-mascots/`. Build8pages and JS syntax pass. Responsive widths1440/1366/1024/768/390have no horizontal overflow, page errors or failed asset requests. Actual Intro/Hero duration10.8952s/recorded entry timing/13ambient loops match baseline. Each flower anticipates once, expands then settles at1.17/y−7, holds, and returns to1/y0in300ms. Rapid reversal, pause reset and cleanup pass. Reduced motion uses immediate1.035/y0; touch does not hover. Have fun→wave/carousel and touch navigation pass.

**Remaining limits:** the existing full-board mobile composition necessarily makes text/products small; the two roof silhouettes and colors stay distinct. Current character/equipment overlap is the existing intentional depth relationship, with no actionable area occluded. Physical phones, Safari and Firefox were not tested. No unresolved P0/P1/P2 in the targeted change; exact matching of the frontal raster reference is not claimed.
