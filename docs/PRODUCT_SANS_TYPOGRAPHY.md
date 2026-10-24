# Product Sans — unified website typography

Audit date: 20 October 2026. Scope: V2, legacy pages, donation/payment results, admin login and canvas thank-you text. No original font file may be changed or regenerated.

## 1. Verified files and metadata

| Existing file in `v2/fonts/` | Internal family | Internal subfamily | OS/2 weight | CSS face |
| --- | --- | --- | --- | --- |
| Product Sans Regular.otf | SVN-Product Sans | Regular | 400 | normal 400 |
| Product Sans Italic.otf | SVN-Product Sans | Italic | 400 | italic 400 |
| Product Sans Bold.otf | SVN-Product Sans | Bold | 700 | normal 700 |
| Product Sans Bold Italic.otf | SVN-Product Sans | Bold Italic | 700 | italic 700 |

These are localized SVN files, not verified untouched Google originals. Their version strings include `1.009`, `GOOG` and Adobe makeotf tooling; the copyright name records say “Copyright 2018 Adobe Systems Incorporated. All rights reserved.” These metadata inconsistencies do not establish provenance or modification rights. `Product Sans` is a CSS family alias for the supplied faces; this does not rename their internal metadata.

All four files are static CFF/OpenType faces without an `fvar` table, at1000units/em. Regular/Bold have397glyphs each; Italic/Bold Italic have385each; all map317Unicode characters. Italic angle is−10°, upright angle0°. Scanning project font/source formats, including staged brand materials, found12Product Sans files but only4unique SHA-256 hashes: additional copies of these same four faces, not Light/Medium masters or a Product Sans designspace. Other staged font families are not candidates for this system.

Full name records, weight/style flags, bounds, vertical metrics, cmap coverage and original SHA-256 hashes: `../../audit-work/typography/font-audit.json`. Original file hashes must remain identical after integration.

## 2. Licensing and genuine Light feasibility

Each supplied face's name ID14 links to [Google's Product Sans license page](https://fonts.google.com/license/productsans). That page says this font is not offered under an open-source license. No separate grant for these SVN copies, web embedding or derivative modification was found in the project. OS/2 `fsType=0` is an embedding bitfield, not a license grant. Modification rights and public-web rights are therefore **not established** by the supplied files.

Google Sans is a separately described derivative family with its own sources/license; the [official Google Sans repository](https://github.com/googlefonts/googlesans) does not authorize treating these Product Sans files as Google Sans or relabeling a different family as Product Sans. No replacement family is introduced.

**Genuine Light 300 cannot be produced reliably from the available sources.** 300 lies outside the 400–700 range, so making it from these faces would require extrapolation, not interpolation. It risks distorted stroke contrast, terminals, counters, spacing, hinting and Vietnamese mark thickness/placement. No negative offset, stroke thinning, width change, fake weight mapping, transform-based simulation or binary generation is authorized/performed.

Medium 500 is numerically between 400 and700, but the two compiled static CFF files are not a verified compatible source-master set. No reliable/authorized Medium is inferred or built. To add 300/500 later requires authentic matching faces or compatible licensed source masters, their corresponding italic faces if needed, a documented right to use/modify them, and a new glyph/rendering review.

This pass changes local CSS references to existing files within the user's requested scope; it does not certify a production font license or grant modification rights. Font-file generation/modification stays deferred.

## 3. Honest weight mapping

| Role | Requested eventual weight | Current actual face |
| --- | --- | --- |
| Captions / metadata / secondary copy | 300 | Regular400, with size/color/spacing hierarchy |
| Body | 400 | Regular400 |
| Navigation / card titles / UI labels | 500 | Regular400; headings/emphasis may use Bold700 |
| Headings / important information | 700 | Bold700 |
| Emphasized italic text | 400 /700 italic | Actual Italic400 / Bold Italic700 |

Only real400/700 weights are registered. There is no300/500 `@font-face`, no fake Light/Medium named face, no faux bold/italic. `font-synthesis:none` is inherited from the root. Desired roles have semantic tokens so authentic future faces can be added without scattering numbers; unavailable roles currently resolve explicitly to Regular400.

## 4. Vietnamese findings before integration

All134 tested Vietnamese-specific precomposed letters map to nonzero glyph IDs inside every supplied font. This means the letters are native to these supplied SVN binaries; it does not prove they were native to Google's original upstream design.

The cmap lacks eight combining marks: U+0300,0301,0303,0309,0323,0302,0306,031B. Therefore standalone marks or arbitrary noncomposable sequences are not covered natively. However, actual Edge shaping of the five requested samples, in both NFC and NFD, recomposed the valid Vietnamese sequences and rendered them entirely with the custom SVN-Product Sans faces. It did not substitute a fallback font for these samples.

The initial browser specimen tested4actual faces ×5sizes (12/14/16/24/48px) ×5sample strings ×2normalizations =200 cases. CDP actual-font inspection found0fallback cases,0NFC/NFD width differences and0cases where ink ascent+descent exceeded the tested1.6 line-height. Screenshots of the pre-integration rendering are in `../../audit-work/typography/before-face-*.png`. The reviewed samples show no missing boxes, obvious mark collisions or clipped accents. Native italic/bold-italic are distinguishable from upright faces. At12px marks are denser, particularly Bold, so secondary copy should use Regular rather than the heavy face.

These results describe the tested Windows Edge renderer and supplied valid Vietnamese strings. They are not a certification of all Vietnamese spellings, standalone combining marks, arbitrary Unicode, every operating system or all browser engines.

## 5. CSS implementation plan

1. Add one shared stylesheet, `assets/css/typography.css`, with the four real font faces, one primary family and generic `sans-serif` fallback, synthesis disabled, semantic weight roles and reusable12/14/16/24/48 size tokens.
2. Import it from the two existing style entrypoints (`style.css` and `v2/v2.css`). Remove duplicate face declarations, old named display/body/hand stacks and external Google Fonts requests. Alias existing typography variables to the single family so layout selectors remain intact.
3. Replace nonexistent weight requests with explicit real-weight tokens. Keep existing component dimensions, spacing, animation timing, geometry and responsive layout rules. Use Regular for unavailable light/UI roles; Bold for headings/emphasis.
4. Apply the same family to SVG text, form controls, debug UI and canvas thank-you lettering. Keep logo/mascot/raster illustration artwork intact: artwork is not a live font-family declaration.
5. Rebuild generated pages; verify font hashes, source motion/layout protection, actual Vietnamese font usage, screenshots, mobile wrapping, Intro playback and donation UI without submitting a live payment.

## 6. Files requiring changes

`assets/css/typography.css` (new central system); `style.css`; `v2/v2.css`; `v2/site.css`; `v2/world.css`; `v2/world.js` (font-readiness request only); `v2/tools/build-site.mjs`; legacy HTML font loaders in root/About/Partnership/Admin/Donation/Return/Cancel; `ung-ho/ung-ho.css`; `ung-ho/card.js`; `ung-ho/result.js`; generated V2 HTML. Documentation: this report, `ASSET_STATUS.md`, `CODEX_CONTEXT.md`.

`v2/tools/board-playground.mjs` was audited and needs no change: its generated text already consumes the common CSS classes. Its source and generated SVG geometry remain identical.

No OTF/TTF/WOFF file, image logo, mascot asset, geometry, campaign content, API recipient/payment verification or animation timeline needs alteration. Any font-metric wrapping adjustment must be reported as such rather than called pixel-identical preservation.

## 7. Integration and final QA

Implemented the shared system using the four existing unchanged faces. The central stylesheet is imported through the legacy and V2 style entrypoints. Removed Google Fonts requests and the Cool Crayon face/preload; replaced old display/hand/body families and nonexistent numeric weights with actual-weight tokens. The Intro's font-readiness request now waits for Product Sans; the rest of `world.js` is byte-identical when that one string is normalized. Canvas card lettering reads family/weight tokens, with the existing canvas layout and donation logic retained.

The central scale's12/14/16/24/48tokens are consumed by existing matching font-size declarations without changing their numeric sizes. Existing responsive clamp sizes and line heights are retained; new `.type-caption`, `.type-meta`, `.type-body`, `.type-title`, `.type-display` helpers support future content. Caption/UI aliases explicitly resolve to400. `code/pre/kbd/samp` also use the same family rather than user-agent monospace; native form controls are normalized.

### Verified results

- Build: `npm.cmd run build:site --prefix v2` succeeds, generating8static pages. Syntax checks pass for changed JS. No dependency, font conversion, outline generation or OTF metadata edit.
- Source preservation: SHA-256 for all four original fonts unchanged. Animation, checkout and donation source hashes preserved, except the single Intro font-readiness string described above. The board generator source and actual SVG match. Comparing CSS after excluding font family/weight/shorthand declarations and resolving same-value size tokens confirms **all other existing CSS declarations are unchanged**. Reflow resulting from the requested new family on formerly handwritten/legacy text is not claimed to be pixel-identical.
- `../../audit-work/typography/after-rendering.json`:200cases after integration, again0actual-font fallback cases,0NFC/NFD advance-width differences and0ink-height excesses at the tested1.6line-height. Before/after specimen metrics are identical for these same supplied Product Sans faces.
- `../../audit-work/typography/site-qa.json`:32route/viewport views across V2, legacy Home/About/Partnership, Donation/Return/Cancel and Admin at1440/390px. All inspected visible text/form components compute to Product Sans with synthesis `none` and weights400/700. Only four registered font faces. No horizontal page overflow, unexpected old-font requests, font HTTP errors or page errors.
- Actual CDP font inspection of the Intro poem, Have fun lettering and stall labels confirms custom SVN-ProductSans / SVN-ProductSansBold glyphs. Fresh Intro → tile assembly → Hero visibly plays at its existing timeline speed. Wave handoff, carousel next and donation modal work. A local canvas fixture generated a Vietnamese thank-you card without creating/submitting a payment.
- `../../audit-work/typography/mobile-intro-qa.json`: real full-motion Intro and completed Hero captured at390and320px with2×device scale and touch emulation. Both poem lines stay within the viewport (rightmost edge340.56px /280.92px respectively); no horizontal overflow. The normal Product Sans400 poem remains readable without changing the Intro layout or timeline.

### Screenshot evidence

[Regular12px](../../audit-work/typography/after-face-0-12px.png) · [Regular48px](../../audit-work/typography/after-face-0-48px.png) · [Italic48px](../../audit-work/typography/after-face-1-48px.png) · [Bold48px](../../audit-work/typography/after-face-2-48px.png) · [Bold Italic48px](../../audit-work/typography/after-face-3-48px.png)

All sizes for each face: [Regular](../../audit-work/typography/after-face-0.png), [Italic](../../audit-work/typography/after-face-1.png), [Bold](../../audit-work/typography/after-face-2.png), [Bold Italic](../../audit-work/typography/after-face-3.png).

Integration: [Intro](../../audit-work/typography/intro-desktop.png) · [Hero](../../audit-work/typography/hero-desktop.png) · [Campaign](../../audit-work/typography/campaign-desktop.png) · [Donation modal](../../audit-work/typography/donation-dialog.png) · [Canvas card](../../audit-work/typography/canvas-card.png).

### Remaining limits / review decisions

- No authentic300/500face or modification license established; no font file was generated, modified or relabeled. Public embedding rights for these SVN copies still need authoritative confirmation. Do not infer them from `fsType=0` or a similarly named open-source family.
- Browser measurements/screenshots are from installed Windows Microsoft Edge (Chromium). No Firefox, WebKit or separate Chrome binary was available; cross-engine and macOS/iOS physical-device consistency remains **untested**. No claim of Safari/Firefox parity is made.
- Valid NFC/NFD sample strings render natively on the tested shaper. Standalone combining marks and arbitrary unsupported characters remain outside the files' cmap coverage. Generic fallback is retained for technical resilience. Existing emoji/symbol ornaments can use browser glyph fallback; this is distinct from the verified native Vietnamese text and does not introduce another CSS design family.
- Logo, mascot and image lettering remain original artwork. Changing a live text family does not redraw embedded raster/vector brand artwork.
