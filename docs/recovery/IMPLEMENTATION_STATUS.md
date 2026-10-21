# POET — Active implementation record

Updated 21/10/2026 (UTC+7), at the Batch 01 review handoff. Update this record at batch milestones, not after each minor edit.

| Field | Current state |
| --- | --- |
| Repository | https://github.com/benzenzz/draft-poet |
| Verified local branch | `codex/poet-requirements-polish` |
| Active batch | Batch 01 — Home & About; implemented, awaiting external PASS/FAIL |
| Application checkpoint | `d5c83955ade6fabe30ae0c1cbbfe20da5ba6e470` |
| Completed requirements | H-01–H-11 and A-01–A-05; protected constraints G-01–G-04; U1 resolved to exactly two Home fundraising statistics |
| Modified application files | Four sources and eight generated pages; detailed list in [canonical review](reviews/BATCH_01_REVIEW.md) |
| Application changes during handoff packaging | None; only recovery docs and selected review evidence |
| Build/tests | Eight-page build; 71 Worker tests passed, zero failed; results belong to the implementation run at the checkpoint above |
| Responsive verification | Home/About passed at 1440×900, 390×844, 768×1024 and 320×740; no horizontal overflow observed |
| Protected verification | 25 guard assertions passed; 62 protected-file hashes and exact Intro/Hero subtree unchanged; Product Sans, approved animations and donation integration preserved |
| Known mismatches | No known unapproved Batch 01 implementation deviation; U3/U4 remain unchanged; live fundraising data and approved editorial/media content remain pending |
| Browser limitations | Windows Edge only; no physical-device/Safari/Firefox claim |
| Canonical review | `docs/recovery/reviews/BATCH_01_REVIEW.md` |
| Repository evidence | `docs/recovery/reviews/assets/batch-01/` — selected full/focused/state screenshots, source patch, verification results and hashes |
| Push status | Not authorized/performed for the recovery branch; wait for explicit permission |
| Pending tasks | User authorizes recovery-branch push → verify exact remote SHA → ChatGPT Work review → user decision/continuation authorization |
| Batch 02/03 | Not started; no authorization inferred from local tests or checkpoint |

If external review returns FAIL, record exact findings, fix only those findings, rerun affected checks, refresh affected evidence and create a new review checkpoint. Preserve approved regions. ChatGPT Work reviews; it must not concurrently edit the same application files.
