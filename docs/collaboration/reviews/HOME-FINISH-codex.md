# Home finishing — local review, 2026-10-22

Base HEAD: `7360ba408c6270767bea2c7a7a0ca09621c3d269`, branch `integration/home-review-20261021`. Earlier approved, uncommitted Hero edits were preserved. This batch is uncommitted; no independent QA PASS is claimed.

- Removed the added shrub/planters; retained tile symbols and the large tree.
- Supplied smiling-flower PNG trimmed into the navbar dropdown icon; original preserved, provenance in `ASSET_STATUS.md`. Menu destinations unchanged.
- Lowercase, centered italic greeting with tighter leading and sequential line entry; measured normal flow 3.71–3.74 seconds.
- Repositioned flower characters; added an inner placement layer and `mascot-drag.mjs` for pointer/touch/keyboard movement, scene-coordinate conversion, board limits, obstacle/character clearance, cancellation and depth ordering. Existing Hero entry/idle retain their owners.
- Audio preference is persisted separately from runtime state. Native autoplay attempt, one suitable gesture retry, manual-mute persistence, no tile notes during drag. No new audio engine or dependencies.
- Home affiliation/press columns, unchanged press links; affiliation remains **Đang cập nhật** because no confirmed organization/logo was found. Home metrics retain `120, 5` and `30, 10, 5` with their original meanings.
- School geometry references the supplied photograph: single storey, orange roof/porch, white columns, cream doors, ventilation slots, steps and mural bands.

Validation: `npm.cmd run build:site --prefix v2`; seven changed-module `node --check` commands; `node --test v2/tools/tests/tile-piano.test.mjs` (3 passed); `node v2/tools/tests/home-finish-browser.mjs` (1440/1280/390/360 passed); `node v2/tools/tests/hero-rise-browser.mjs` (four normal viewports plus reduced motion passed); `git diff --check` passed. Additional browser checks covered native CDP touch/cancel and autoplay blocked/allowed test profiles (the allowed flag was QA-only), first-gesture unlock and persistent mute. Forms/payment writes were not submitted.

Preview: http://127.0.0.1:8768/v2/ — response contents matched the actual Codex files. Existing 8766 process was preserved. Evidence: `.design-tools/output/HOME-FINISH/` (`1440-home.png`, `390-home.png`, `1440-hero.png`, `390-hero.png`, `mascot-drag.webm`, `results.json`). Video is silent.

Source changes: `v2/chrome.js`, `v2/world.js`, `v2/world.css`, `v2/site.css`, `v2/tile-piano.mjs`, `v2/mascot-drag.mjs`, `v2/tools/board-playground.mjs`, `v2/tools/build-site.mjs`, `v2/tools/site-templates.mjs`; generated Home HTML; one PNG derivative; focused tests and provenance. No changes to payment/Worker/admin, fundraising data, font files or other generated routes; Claude worktree untouched.

Limitations: no human listening test, physical phone, Safari or Firefox verification. Affiliation identity/logo still requires confirmed input. No commit, push, merge or deployment.
