# Git checkpoint audit — 20 October 2026

Repository: `poet/`. Branch: `feat/poet-claude-v3`. Starting HEAD: `9f1850173bcc2954d9f3a1b7e05cd1876a017ca0`.

The user requested a local, safe checkpoint and explicitly approved leaving historical/draft/unreferenced files outside the commit. No push, merge, deployment, user-file deletion or application-behavior change is authorized by this maintenance pass.

## Included

- Current V2 and related legacy website changes, including typography, approved animation work, shared checkout integration and generated page output.
- Runtime assets referenced by the site/templates, the original press images and their crop manifests, icon license and existing dependency manifests/lockfiles.
- `AGENTS.md`, V2 instructions, installed project skills and their provenance, portable design-tool package/verification sources, current context and implementation/QA reports.
- The header/About/fundraising module and the current unstaged V2 About HTML are included together with their sources.

The website is delivered as static HTML/CSS/JS. Existing `.nojekyll`, generated HTML, `v2/data/site-data.js` and vendored GSAP remain tracked; removing these would break direct static delivery. `v2/tools/build-site.mjs` reproduces the eight current HTML pages exactly without requiring installed runtime dependencies. Cloudflare Worker source/configuration remains unchanged. No deployment workflow/configuration is added or changed.

## Excluded, with local copies preserved

Machine-only `.codex/config.toml`, `.claude/settings.json`, `.claude/settings.local.json`, `.design-tools/trust-project.py`, historical `.taste-skill/inspect/` captures, dependencies/caches/logs, OS/editor temporary files and ignored source materials. Previously tracked `.DS_Store` is removed from the index only; the local file stays intact.

The following 21 reviewed files stay outside the checkpoint by explicit user decision:

| Group | Files |
| --- | --- |
| Draft/reference | `.taste-skill/direction.json`; `POET draft.txt`; `v2/CODEX_CONTEXT.md` (superseded by root context) |
| Unused font | `assets/fonts/fc-dk-cool-crayon.otf` |
| Unused mascot poses | `assets/mascot/be-mam/hop.webp`; `assets/mascot/be-mam/jump.webp` |
| Unused old playground assets | `assets/season-6/playground/sandal-left.webp`; `sandal-right.webp`; `schoolbag.webp`; `slide.webp`; `wheelbarrow.webp` |
| Historical reports/specifications | `docs/ART_DIRECTION_BON_NET.md`; `docs/DESIGN_ENVIRONMENT_AUDIT.md`; `docs/HERO_CORRECTION.md`; `docs/HERO_ILLUSTRATED_REFINEMENT.md`; `docs/HERO_SPEC.md`; `docs/LAUNCH_BLOCKERS.md`; `docs/NEW_MATERIALS_INVENTORY.csv`; `docs/NEW_MATERIALS_REVIEW.md`; `docs/PHASE_0_AUDIT.md`; `docs/V2_FINISH_AUDIT.md` |

`assets/icons/lucide/chevron-down.svg` is included: its reference is constructed dynamically by `navIcon("chevron-down")`, so a literal-filename search alone would incorrectly classify it as unused. Existing tracked experiments and source assets are preserved; they are not deleted merely because they predate this pass.

## Checks and limited hygiene changes

- Inspected status, staged/unstaged diff statistics, tracked files, package configuration, dependency locks, static deployment requirements and relevant code changes before cleanup.
- Scanned candidate source/configuration/document text and any different staged version for recognizable credentials/private keys and suspicious literal assignments. No new credential was found. Two matches are the existing unchanged official PayOS signature unit-test fixture, not a new production secret. No secret values are recorded in this report.
- No changed binary exceeds 5 MiB. Verified candidate tree is approximately 27 MB including existing tracked site assets.
- Built a separate candidate-tree copy: eight HTML pages plus generated site-data reproduce byte-for-byte. This did not overwrite the working website or its generated files.
- All 71 existing Worker unit tests passed in the candidate copy. No live payment, email, form, API write or database operation was performed.
- Whitespace-only cleanup: remove one trailing space in legacy `index.html` and one surplus EOF blank line in each installed `write-swift/SKILL.md` copy. Original bytes were saved outside the repo. No functional application code was changed for this audit.
- Preserve all local source materials and excluded files. No broad `git add .`, reset, clean, forced push or destructive checkout is used.

Full file-by-file classification, original index backup, initial status, candidate-tree build/test results and local evidence are in `../audit-work/git-checkpoint/`. These are local audit artifacts and do not belong to the published website. Final staged-list/secret/whitespace checks and commit identifiers are recorded there and in `docs/CODEX_HANDOFF.md`.
