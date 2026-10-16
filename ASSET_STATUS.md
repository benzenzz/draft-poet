# Asset status

## Pass 1 / Pass 2 opening prototype

Only the asset below is selected for this experiment. Pass 2 reuses the same derivative (no new asset); it now sits in the hero greeting kicker instead of a separate intro sign. This does not promote the remainder of `New materials/`. The complete initial inventory is in `docs/NEW_MATERIALS_INVENTORY.csv`; the authority and font/color conflicts remain documented in `docs/PHASE_0_AUDIT.md`.

| Asset | Source | Source SHA-256 | Derivative | Status | Code references |
| --- | --- | --- | --- | --- | --- |
| Happy flower mascot | `New materials/MASCOT/Bé Cúc Young Joy/Cúc Tươi Cười.png` | `bb07092f0d3f39ad5eb59342f91945a23115a0071ef3028c32213b3fe5a9e64e` | `assets/experiments/opening/flower-happy.webp`, 192 × 192, 5,752 bytes; resized from 2008 × 2008 PNG with transparency retained | Experimental only; inspect in this motion test, not approval of an evergreen brand asset. Shown at 40px (34px mobile) at rest and scaled up to ~136px during the greeting, so it is slightly soft on 2× screens; a 384px derivative from the same source would fix that if the mascot is approved | `index.html` decorative `.hero-hello img` (Pass 2; Pass 1 `.opening-sign` removed) |

The source and designer-pack copy are byte-identical. The inspected high-resolution separate pose was preferred over a composite mascot sheet or raster logo crop. No production asset was overwritten. The original remains staged. Existing logo, photos, seal and spark SVGs remain in use. Palette/font conflicts were avoided by retaining the site's existing tokens and typography.

To remove the experiment, remove its intro markup and motion hooks, then remove this manifest entry and the experimental derivative when no longer referenced. Never remove the original source.
