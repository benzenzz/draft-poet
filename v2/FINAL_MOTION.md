# Final intro → hero → thumbnails

Start the local server from DRAFT with `npm run preview --prefix poet/v2`
(or `npm run preview` inside `poet/v2`). Keep that terminal running, then open
http://127.0.0.1:8766/v2/. A connection-refused error means the local server
is not running; changing animation query parameters will not fix it.

The integrated version is `/v2/`. The focused animation review is
`/v2/?showcase=1`; it uses the same markup and controllers, showing the intro,
hero, four activity thumbnails and press strip.

- `world.js` owns the four-letter logo intro, poem, curtain, playground assembly,
  mascot route, tile highlights, leaves, board float and Join Joy interaction.
- Join Joy and the completed hero's downward wheel gesture share one curved
  transition to the activity banner. Keyboard activation navigates directly.
- `activity-carousel.js` owns the four thumbnail transitions, image/caption
  choreography, persistent detail link, pause control and touch/keyboard input.
  Autoplay waits for the hero handoff to complete and pauses offscreen.
- `press-strip.js` retains the final reversible press motion below the thumbnails.

The homepage and generated pages use the `final-motion-2` asset revision. Run
`npm run build:site --prefix poet/v2` from DRAFT to regenerate the pages while
preserving the intro/hero markup. Historical pass documents remain as evidence;
the current files above are the final combined implementation.

The plain localhost `/v2/` URL defaults to full motion for this user's animation
review, including VS Code webviews reporting system reduced motion. No preview
query parameters or stored opt-in are required. Public hosts still respect
system reduced motion. To test reduced motion locally, use
`/v2/?heroMotion=respect&carouselMotion=respect&pressMotion=respect`.

Integration verification from DRAFT, with the preview server on port 8766:

```powershell
node .audit-tools/combined-flow-qa.cjs
node .audit-tools/join-wave-qa.cjs
```

These observe real playback, desktop/mobile layout, all four thumbnails,
handoff ownership, keyboard navigation and reduced motion. Evidence is written
under `audit-work/combined-flow/` and `audit-work/join-wave/`.
