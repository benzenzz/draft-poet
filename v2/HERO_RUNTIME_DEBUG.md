# Actual Hero runtime investigation — 2026-10-17

Subsequent refinement: [MOTION_DETAILS.md](MOTION_DETAILS.md) describes the current route, timing and fresh playback evidence. Its tree cleanup also resolves the malformed SVG canopy paths noted in this historical investigation. The explicit local reduced-motion preview opt-in remains in place.

This report supersedes the earlier claim that the user's embedded-browser playback problem was resolved by the first lifecycle pass.

**ROOT CAUSE:** In the user's actual VS Code integrated browser (Code 1.142.0 / Electron 43.7.7), `matchMedia('(prefers-reduced-motion: reduce)').matches` is **true**. The earlier `world.js`, `initialize()` at line 184, called `completeHero()` and returned without ever creating a master timeline. Replay used the same condition, so it also remained static. The corresponding current guard is `world.js:199`, mediated by the explicit local-preview opt-in at line 19. Ordinary Edge reported **false**, explaining why its earlier tests did not reproduce this environment. This was verified directly in the existing VS Code window and then captured in runtime logs; it is not inferred from Windows settings.

**SERVED FILES:** The running process on port 8766 was `node .audit-tools/preview-server.cjs`. Its document root is `C:\Users\trang\Desktop\DRAFT\poet`, now resolved relative to the server script rather than the shell's current directory. `/__hero-runtime/status` reports the root. Served HTML, CSS, `chrome.js`, `world.js`, GSAP and MotionPathPlugin matched workspace bytes/SHA-256 hashes. Runtime responses were HTTP 200 with `Cache-Control: no-store`. The embedded browser logged the current `world.js?v=hero-runtime-4`; its displayed diagnostics build also matched. There is no evidence of stale served files or CSS preventing movement.

**EVIDENCE:** Parent-workspace files under `audit-work/hero-runtime/` contain the actual observations:

- `served-files-before.json`: served/local hashes and HTTP/cache headers before edits.
- `browser-before.json`: default-preference headless and visible Edge measurements, including console warnings and loaded script URLs.
- `embedded-events.jsonl`: locally collected execution logs, including the actual VS Code user agent, per-navigation client ID, preference, visibility, tile/object counts, paused/progress state and computed transforms.
- `embedded-verified.json`: assertions against the actual VS Code logs, including the initial reduced/static branch and a subsequent uninterrupted reload with stored opt-in.
- `vscode-first-load/index.html`: 25 consecutive native captures over 7.704 seconds after clicking the real embedded Reload control. Capture timestamps are preserved; approximately three frames per second. No animation timeline setters were used. `capture.json` records zero capture errors for this recording.
- `full-first-navigation/index.html`: denser visible-Edge screencast started before navigation, plus separate controlled-tile and controlled-object recordings.
- `qa-full.json`, `qa-controlled.json`, `qa-preferences.json`: browser execution, clicks, network/body comparisons, observations and assertions. The earlier `vscode-reload/` capture attempt was interrupted by a capture-target change and is not the completed recording.

Actual VS Code observations:

| Observation | Measured result |
| --- | --- |
| Before opt-in | `reducedMotion: true`, `visibility: visible`, `HERO_STATIC`, no master |
| Target selection | 32 existing tiles, 30 existing world object groups |
| Controlled tile | Rendered Y 277.79187 → 27.79183 → 277.79187 CSS px; bounce observed; original attributes restored |
| Controlled school | Scale 0.3 → peak 1.1078 → 1; original attributes restored; ground-contact drift below 0.001 CSS px |
| Master before/during/after | Tile computed transform `none` (opacity 0) → `matrix(1,0,0,1,0,-406.297)` (opacity 1) → identity |
| Fresh reload after explicit opt-in | Master created at 333.2 ms, playing at 334.3 ms, Intro completes at 886.3 ms, world pops at 3204.1 ms, complete at 6045.2 ms; master duration 5.705 s |
| Preference during that reload | Still `reducedMotion: true`; local preview override true; playing is unpaused; progress reaches 1 |

**FIX:** `hero-debug.js` provides temporary localhost-only instrumentation and the requested TEST TILE DROP / TEST OBJECT POP controls. Each test stops the existing controller, animates an existing SVG group in its own viewBox, and restores its exact saved attributes. The tile's SVG offset is computed from `getScreenCTM()` to produce 250 actual screen pixels; the school scales around its authored ground contact. Starting another test cancels and restores the previous one. Replay cancels an active test before rebuilding the single master and its ambient set.

The local Replay Hero button explicitly opts this development tab into full-motion preview. The dedicated `sessionStorage` key `poet:hero:preview-motion=full` preserves that affirmative choice across reloads. The early HTML gate reads the same choice, preventing a static-scene flash before assembly. No OS or VS Code preference is changed. Without that opt-in, reduced motion still intentionally selects a static scene.

The master now derives world entrance from the last tile's actual settle time, sign entrance from the end of the world reveal, and mascot entrance from the sign's end. Intro completion remains the real timeline boundary; skipped/absent Intro uses the direct assembly path. No timeout guesses the end of Intro. The approved scene SVG and all below-Hero markup compare unchanged against the pre-investigation backup.

**BROWSER TEST:** Both test buttons were clicked in the user's existing VS Code preview, then Replay was clicked, and the real Reload button was clicked for the completed recording. Its actual logs contain HERO_SCRIPT_LOADED, GSAP_AVAILABLE, HERO_INITIALIZED, HERO_TIMELINE_CREATED, HERO_TIMELINE_PLAYING, INTRO_COMPLETE, TILE_ASSEMBLY_STARTED, WORLD_POP_STARTED and HERO_TIMELINE_COMPLETE. Visible Edge independently recorded uninterrupted navigation and both real button tests. Preference regression checks verified the initially static reduced-motion state, explicit Replay opt-in, remembered opt-in on refresh, debug-disabled static behavior, resetting the opt-in, and an explicit full-motion URL.

**REMAINING ISSUES / DISABLING:** New reduced-motion tabs intentionally remain static until opted in. To preview immediately in any local tab use `/v2/?heroMotion=full`. To clear the tab's opt-in use `/v2/?heroMotion=respect`. `?heroDebug=0` disables all diagnostics/controls and honors reduced motion even if an opt-in key exists. Non-loopback hosts never enable the diagnostics or override. The small initial native capture failure was a recording-helper issue; the completed 25-frame recording has no gaps reported by the capture helper. Four existing `.tree-shade` SVG path parsing warnings remain in the unchanged scene markup; they did not prevent observed tile/building motion. No uncaught page JavaScript exceptions occurred in the browser runs.

Files changed for this investigation: `v2/index.html`, `v2/world.js`, `v2/world.css`, new `v2/hero-debug.js`, this report and the implementation notes. Parent-workspace tooling: `.audit-tools/hero-runtime-investigate.cjs`, `hero-runtime-qa.cjs`, `hero-runtime-report.cjs`, and the temporary local diagnostic routes in `preview-server.cjs`. No dependency, illustration, branding, sign, mascot, building or board geometry was changed.
