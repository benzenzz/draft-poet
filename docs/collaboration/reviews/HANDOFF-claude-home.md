# Bàn giao Home — Claude (`claude/ui-feedback`)

- Base: `11d2975`. Head: commit chứa file này (`git log -1 --format=%H -- docs/collaboration/reviews/HANDOFF-claude-home.md`).
- Kiểm tra lúc bàn giao: working tree sạch; `node --check` site.js/world.js đạt; `build:site` tái tạo generated khớp commit (chỉ khác CRLF/LF); preview 8767 phục vụ đúng worktree này.
- Chưa push/merge/rebase. Không đụng worktree Codex. Chưa bắt đầu trang Về chúng tôi.

## Commit

| Ticket | Implementation | Docs |
| --- | --- | --- |
| UI-001 Intro + Hero | `ff7967c` | `7d8741c` |
| UI-003 Dấu ấn tự hào + Góc nhìn truyền thông | `4f0fdcc` → rev2 `f2558aa` → rev3 `4d6cec4` → rev4 `968408f` → rev5 `426693e` | `a33c5b6`, `226c143`, `c5eb8b4`, `fde1316`, `e956c14` |

## File thay đổi (11d2975 → head, ngoài docs)

| File | Loại | Thay đổi |
| --- | --- | --- |
| `v2/world.js`, `v2/world.css`, `v2/tools/board-playground.mjs` | Hero source (protected, ngoại lệ UI-001) | Lời chào ×1.5, Suaserif, hover tile, bo góc tile, biển Have fun có trụ, bỏ nút pause |
| `assets/fonts/suaserif-bold.otf`, `ASSET_STATUS.md` | asset | Font mới + ghi nhận nguồn/licence chưa xác minh |
| `v2/tools/site-templates.mjs` | **shared template** | `rail()` xóa; `press()` viết lại thành lưới 3 thẻ, `id="truyen-thong"`, heading `head('','Góc nhìn truyền thông')`; `archive()` bỏ đoạn ghi chú fine-print (markup thẻ không đổi) |
| `v2/site.css` | **shared CSS** | Xóa `.rail*`, `.rail-controls*`, `.media-cover/.media-copy`, `.archive-editorial-note`; khối mới `.archive-section,.press-section` (biến màu), `.press-grid/.media-card/.media-meta/.media-foot`; archive: grid 2 cột, `.story-card`/`.story-copy` flex, ảnh `clamp(160px,28vh,300px)`, màu chữ; reveal `html.reveal-motion .archive-grid …` |
| `v2/site.js` | **shared JS** | Xóa controller `[data-carousel]`; reveal: `previewMotion` (localhost, `?heroMotion=respect` tắt), class `reveal-motion`, observer riêng threshold .3 cho archive, ≥761px reveal cả cặp |
| `v2/data/content.mjs` | content | **Không đổi** |
| `v2/index.html` | generated (hỗn hợp) | SVG Hero sinh bằng `board-playground.mjs --write`; xóa tay nút pause; post-Hero từ `build:site` |
| `v2/team/index.html`, `v2/du-an/index.html` | generated | Section press (Team) và bỏ ghi chú archive (Dự án) |

Patch shared: `UI-003-claude/shared-files.patch` (`git diff 7d8741c 426693e` cho site.css/site.js/site-templates.mjs). Patch đề nghị cho Codex: `UI-001-claude/build-site-heroVersion.patch` (bump cache `heroVersion`, chưa áp).

## Tích hợp cần lưu ý

- Ba shared file trên trùng phạm vi Codex UI-002 (header/carousel/fundraising) → xung đột khả năng cao ở `site.css`/`site.js`; áp sau UI-002, ưu tiên phần của Codex ở vùng header/carousel/fundraising.
- Dòng CSS dùng chung còn mảnh chết cố ý để lại: `.media-card{width:45%}` (đã bị override), `.rail{gap:20px}`, `.rail-controls{…}.rail-help{…}`, `.rail-controls button…:hover` — dọn sau khi gộp.
- Generated phải build lại sau khi gộp source (`npm.cmd run build:site --prefix v2`), không chỉnh tay.

## Hoàn thành / còn lại

- Hoàn thành, chờ review: UI-001 (A1–A2, B1–B5), UI-003 rev5 (theo phản hồi người dùng, gồm quyết định bỏ điều khiển rail).
- Còn mở / chưa xác minh: so khớp ảnh tham chiếu UI-001 (ảnh không có trong phiên); licence Suaserif; bỏ nút pause Hero làm thiếu WCAG 2.2.2 (cần quyết định); tiêu đề hover `#399F78` chỉ đạt tương phản chữ lớn; mobile 320px thẻ archive 2 cao hơn màn hình 72px; vạch số liệu và link CTA archive chưa đổi màu (chờ ý người dùng); điện thoại thật/Safari/Firefox chưa kiểm.

## Preview & evidence

- http://127.0.0.1:8767/v2/ · http://127.0.0.1:8767/v2/#dau-an · http://127.0.0.1:8767/v2/#truyen-thong
- Restart: `Set-Location 'C:\Users\trang\Desktop\DRAFT\poet-claude-ui'; node docs/collaboration/preview-local.mjs --port 8767`
- Screenshots: `docs/collaboration/reviews/UI-001-claude/`, `docs/collaboration/reviews/UI-003-claude/` (tiền tố `rev2-`…`rev5-` cho các vòng sửa). Báo cáo: `UI-001.md`, `UI-003.md`.
