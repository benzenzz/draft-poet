# Trust strip — local review, 2026-10-22

Base HEAD `7360ba408c6270767bea2c7a7a0ca09621c3d269`, branch `integration/home-review-20261021`. Prior uncommitted work was preserved. No commit/push/merge/deploy or independent QA PASS.

Implementation files: `v2/tools/site-templates.mjs`, `v2/site.css`, generated `v2/index.html`. No JavaScript or logo file changes. The artifact URL could not be read by the browser-fetch tool; implementation follows the supplied written “Bản chốt” specification.

- Desktop 1440/1280: one centered row, measured height **75px**, padding 22px, gaps **24 / 28 / 56px**, separator **1×24px**. Label 15px/400 using `--poet-muted`; measured contrast **5.48:1** against `--poet-cream`.
- Final logo heights, VNV / Hoa Học Trò / Tiền Phong: **26 / 30 / 17px desktop**, **22 / 26 / 15px mobile**. Original colors, existing alt text, order and article destinations retained. The previously approved CSS framing of VNV padding is retained; source PNGs are unchanged.
- 768: centered wrapped groups, no vertical separator. 390/320: two rows, labels left/logos right, 14px row padding, 18px logo gap, horizontal divider. No overflow or clipped labels.
- No icons/eyebrows added. Link hover lifts 2px in 200ms; focus outline 3px with 4px offset. Reduced motion removes hover movement/transition. Extended transparent hit areas preserve a compact strip without reducing link usability.

Checks: `npm.cmd run build:site --prefix v2`, `node --check v2/tools/site-templates.mjs`, `node --check v2/site.js`, `node --test v2/tools/tests/tile-piano.test.mjs` (3 passed), `git diff --check`. Focused browser checks passed at 1440, 1280, 768, 390, 320, including center alignment, spacing, contrast, links, focus and reduced motion; no new page JavaScript errors observed. SHA-256 comparisons: **19 protected files unchanged**, and Home HTML outside this section identical to the pre-ticket snapshot.

Existing `home-finish-browser.mjs` passes desktop but has a pre-existing mobile assertion expecting menu text to remain visible **after Escape closes the mobile menu** (line 45). Original test file is preserved under the ticket's file restrictions. A temporary in-memory variant uses the correct expected visibility for the closed mobile menu; it passed all four viewports (1440/1280/390/360). This is a test-harness discrepancy, not a navbar change in this ticket.

Evidence: `.design-tools/output/TRUST-STRIP/{1440,1280,768,390,320}.png`, `checks.json`, `before.json`. Preview http://127.0.0.1:8768/v2/#presse.

Limitations: the available PNG logo sources have white backing; no equivalent transparent artwork was found or fabricated. No image processing or new links. Physical phones/Safari/Firefox were not tested. No forms or payment transactions were submitted.
