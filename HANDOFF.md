# POET WEBSITE · Handoff chung cho ChatGPT Work & Claude

> **Đọc file này trước khi làm tiếp.** Đây là "bộ nhớ chung" giữa ChatGPT Work, Claude và Codex.
> Cuối mỗi phiên: cập nhật mục 3, 4, 5 và thêm 1 dòng vào mục 8 (Nhật ký).
> Không ghi mật khẩu, API key, token, thông tin thanh toán, số điện thoại hay email cá nhân.

_Cập nhật lần cuối: 2026-10-21 · bởi: Claude (tóm tắt từ tài liệu trong folder local `DRAFT/poet` và `DRAFT/poet-claude-ui`)_

---

## 1. Dự án & vai trò
- Website phi lợi nhuận **POET**, ẩn dụ "sân chơi" (playground): isometric, minh họa thân thiện, chuyển động xúc giác, 4 màu thương hiệu, nội dung tiếng Việt.
- Site đang phát triển nằm ở **`/v2/`** (không phải homepage cũ ở root).
- **Demi**: chủ dự án, duyệt PASS/FAIL, quyết định cuối.
- **ChatGPT Work**: điều phối và review: viết ticket, review evidence, trả PASS/FAIL. **Không** sửa cùng lúc file ứng dụng.
- **Codex**: worktree `DRAFT/poet`, branch `codex/poet-requirements-polish`, preview `http://127.0.0.1:8766/v2/`. Sở hữu các file shared.
- **Claude Code (local)**: worktree `DRAFT/poet-claude-ui`, branch `claude/ui-feedback`, preview `http://127.0.0.1:8767/v2/`. Chỉ sửa đúng danh sách file mà ticket giao.

## 2. Quy tắc phối hợp (tóm tắt `docs/collaboration/WORKFLOW.md`)
1. Mỗi feedback là một **ticket** gồm: ID, ảnh nguồn, mục tiêu, tiêu chí chấp nhận, file được ghi, vùng bảo vệ, người làm, reviewer. Không có ticket thì không làm.
2. **Codex sở hữu file shared**: `v2/site.css`, `v2/site.js`, `v2/chrome.js`, `v2/fundraising-progress.mjs`, `v2/tools/site-templates.mjs`, `v2/data/content.mjs`, `v2/tools/build-site.mjs`.
3. Một file shared chỉ có **một agent ghi trong một đợt**. Agent còn lại gửi patch kèm base SHA.
4. Bàn giao qua **commit đã hoàn tất** (SHA, danh sách file, ảnh, lệnh kiểm tra). Không đọc hay sửa working tree đang mở của agent kia.
5. HTML generated thì build lại bằng `npm.cmd run build:site --prefix v2`, không sửa tay.
6. Báo cáo theo ticket: `docs/collaboration/reviews/<ticket>.md` (+ thư mục evidence).
7. Xong ticket thì **dừng chờ PASS/FAIL**. Không tự push, mở PR, merge, deploy hay bắt đầu batch mới.

## 3. Trạng thái hiện tại (21/10/2026)
| Ticket | Người làm | Nội dung | Trạng thái |
|---|---|---|---|
| Batch 01 (Home & About, H-01–H-11, A-01–A-05) | Codex | Recovery batch | Đã xong, **chờ ChatGPT Work review**. Chưa push |
| UI-001 Intro + Hero | Claude | Lời chào ×1.5, font Suaserif, hover/bo góc tile, biển "Have fun" có trụ, bỏ nút pause | Chờ review |
| UI-002 Header / carousel / fundraising | Codex | | Chờ review |
| UI-003 "Dấu ấn tự hào" + "Góc nhìn truyền thông" | Claude | Bỏ rail, lưới 3 thẻ báo chí, archive 2 cột, rev1→rev5 | Chờ review |
| UI-004 + follow-up | Codex | Eyebrow chữ thường, icon tile 44px màu, footer nền tối `#211F1C` không ảnh | Chờ review (138 + 22 checks pass) |

- **Chưa tích hợp** nhánh Claude vào nhánh Codex. Dự kiến xung đột ở `site.css`/`site.js`/`site-templates.mjs`: áp UI-003 **sau** UI-002 và ưu tiên phần của Codex ở header/carousel/fundraising.
- Ngoài ra, một phiên Claude trên cloud đã làm một bản redesign tĩnh (10 commit trên nhánh `claude/cool-ramanujan-4vgwbc`, chưa push) và đang chờ review trước khi làm animation. _Cần Demi xác nhận bản này có còn dùng không._

## 4. Việc tiếp theo
1. ChatGPT Work review Batch 01, UI-001…UI-004 và trả PASS/FAIL cho từng ticket.
2. FAIL thì chỉ sửa đúng điểm bị nêu. PASS thì Demi cho phép tích hợp: Codex áp patch của Claude, build lại, chạy regression.
3. Demi cho phép push nhánh recovery thì xác minh SHA trên remote.
4. Batch 02/03: **chưa bắt đầu**, chờ ticket.

## 5. Câu hỏi đang mở cho Demi
- Bỏ nút pause ở Hero làm thiếu WCAG 2.2.2 (cần cách dừng chuyển động). Giữ bỏ hay thêm lại?
- Licence font **Suaserif** chưa xác minh. Licence dùng web của **Product Sans** cũng chưa rõ.
- Màu hover tiêu đề `#399F78` chỉ đạt tương phản cho chữ lớn.
- Mobile 320px: thẻ archive thứ 2 cao hơn màn hình 72px.
- Vạch số liệu và link CTA của archive có đổi màu không?
- Số liệu gây quỹ trên Home hiện là **ví dụ prototype**, chưa phải số thật. Cần nguồn dữ liệu được duyệt.
- Chưa test trên điện thoại thật, Safari, Firefox.

## 6. Quyết định đã chốt (không đổi trừ khi Demi yêu cầu)
- Stack: HTML/CSS/JS thuần + web components. GSAP 3.13.0 (+MotionPathPlugin) chỉ cho Hero, còn lại dùng CSS/Web Animations. **Không** React, Three.js, Framer Motion, Lenis, Tailwind hay thư viện component/icon.
- Font: **chỉ Product Sans** 400/700 (thường/nghiêng). Không tự tạo weight 300/500.
- Header: wordmark POET Product Sans Bold, P coral, O blue, E green, T yellow.
- Nút ủng hộ: **luôn coral `#EF8A7D`, chữ và tim màu trắng** ở mọi mốc.
- Thanh gây quỹ: 1 track 4 màu, coral <25%, vàng 25–<50%, xanh lá 50–<75%, xanh dương ≥75%.
- Flow Home: intro logo/thơ → playground isometric → Join Joy / sóng → carousel 4 ảnh (giữ 1.5s) → dải logo báo chí chạy theo scroll → phần còn lại.
- Hero illustrated/mây đã bị **từ chối và revert**. Bóng tròn dưới đất bị ẩn.
- Tôn trọng `prefers-reduced-motion`. Không hijack scroll.
- **Vùng bảo vệ**: Intro/Hero, font/loading, animation đã duyệt, dữ liệu và cách tính gây quỹ, `ung-ho/` (checkout), `worker/`, `admin/`, cấu hình deploy. Không test thanh toán hay gửi form thật.
- Tránh: layout SaaS chung chung, bento vô cớ, glassmorphism, pill/bo góc quá nhiều, gradient tùy tiện.

## 7. Lệnh hay dùng (PowerShell, chạy ở gốc repo)
```powershell
npm.cmd run preview --prefix v2                          # Codex, cổng 8766
node docs/collaboration/preview-local.mjs --port 8767    # Claude
npm.cmd run build:site --prefix v2
node --test worker/test/*.test.mjs
```
Tài liệu nên đọc trước mỗi ticket: `AGENTS.md`, `v2/AGENTS.md`, `docs/CODEX_HANDOFF.md`, `docs/collaboration/WORKFLOW.md`, `CODEX_CONTEXT.md` (mục 17–19), report của ticket liên quan.

## 8. Nhật ký phiên (mới nhất ở trên)
| Ngày | AI | Đã làm | Ghi chú |
|---|---|---|---|
| 2026-10-21 | Claude (cloud) | Tạo file handoff, tóm tắt từ tài liệu local | Chưa có lịch sử chat ChatGPT Work |

## 9. Prompt mẫu
**Mở phiên mới (ChatGPT Work hoặc Claude):**
> Đọc file handoff tại https://raw.githubusercontent.com/benzenzz/draft-poet/claude/project-thread-evh9bg/HANDOFF.md . Tóm tắt trạng thái trong 5 dòng, rồi làm tiếp mục "Việc tiếp theo" số 1. Cuối phiên, viết lại mục 3, 4, 5 và một dòng nhật ký để tôi dán vào file.
