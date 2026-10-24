# Hero layout, occlusion and signage refinement

Scope: the slide's internal paint order, the right-edge bench orientation, and one secondary Join Joy wayfinder. The main Young Joy sign, tile route, buildings, equipment coordinates, mascots, palette and below-Hero content are preserved.

In `tools/board-playground.mjs`, `slide()` previously painted its rear ladder after the opaque deck. The top rungs therefore appeared across the deck's visible surface, while supports had the wrong overlap. The new order is rear access, rear supports, deck, near supports, chute and canopy. All existing structural coordinates and dimensions remain unchanged. Only genuine intersections are hidden behind the deck.

The bench at `(760,590)` now has its long axis along the right board edge and its seat opens toward `+u`, away from the adjacent tree. Its anchor, size, colors and contact shadow are retained. The other bench is unchanged.

A small single-post wayfinder at `(48,620)` fills the open left perimeter strip. Its text is “Join Joy,” using the existing local display font, with a green frame, coral lettering accent and shallow projected depth. The arrow points toward the lower-left foreground. It is a decorative scene object, without a button or navigation action, and remains secondary to the existing landscape Young Joy sign.

`world.js` is byte-identical to the pre-pass backup. Its existing `.prop` discovery automatically includes the new sign in the clockwise reveal, drift wrapper, pause, reduced-motion fallback and Replay cleanup. There are now 24 perimeter objects, extending assembly by one 0.105-second stagger to 6.810 seconds. The 32-tile mascot route and 13 ambient timelines are unchanged.

Reproduction from `DRAFT`:

```powershell
node poet/v2/tools/board-playground.mjs --write
node .audit-tools/hero-layout-qa.cjs
```

Evidence lives outside production in `audit-work/hero-layout/`: original source backups, before/after object snapshots, desktop/tablet/mobile screenshots, slide/bench/sign close-ups and `qa.json`. The browser test compares every existing scene object except the two deliberately refined objects against the baseline; the main sign and all other object markup must match exactly. It also checks unchanged below-Hero markup/controller, viewport overflow, natural initial playback, walking progression and actual Replay clicks. Mobile checks use viewport emulation.

The previous full-circuit recording in `audit-work/hero-motion-details/` predates this secondary sign. It remains evidence for the unchanged route logic; the current layout screenshots and Replay measurements are in `audit-work/hero-layout/`.
