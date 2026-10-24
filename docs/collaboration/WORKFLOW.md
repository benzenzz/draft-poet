# POET — Codex × Claude Code

## Baseline và môi trường

- Baseline website đã xác minh: **`859f5c6afead192cc62dc39c0c6b41fe85f7a912`**, trên `codex/poet-requirements-polish`; gồm H-08/H-09 (`d69cc91f7116775b5f579fd5b72708a074ff40d0`). Không lấy `main`/`master` làm baseline.
- Codex: `C:\Users\trang\Desktop\DRAFT\poet` — branch `codex/poet-requirements-polish` — preview http://127.0.0.1:8766/v2/.
- Claude: `C:\Users\trang\Desktop\DRAFT\poet-claude-ui` — branch `claude/ui-feedback` — preview http://127.0.0.1:8767/v2/.
- Claude bắt đầu từ checkpoint setup chứa file này, kế thừa đúng baseline trên; tra SHA setup bằng `git log -1 --format=%H -- docs/collaboration/WORKFLOW.md`. Hai branch khác nhau, dù ban đầu cùng SHA. Chưa có ticket mới được giao.
- Lúc kiểm tra: chỉ có worktree Codex; không có `claude/batch-2` hay worktree Claude cần phục hồi. Nếu sau này branch đó có công việc riêng, giữ nguyên; không reset/thay thế nó.
- Checkpoint là trạng thái Git có thể bàn giao, **không đồng nghĩa independent QA PASS**. Review Batch 01 vẫn chờ kết luận bên ngoài.

## Quyền ghi và ticket hình ảnh

1. Mỗi feedback là một ticket có ID, ảnh nguồn, mục tiêu, tiêu chí chấp nhận, file được phép ghi, generated outputs, vùng bảo vệ, người thực hiện và reviewer. Chưa có ticket thì không tự triển khai batch/feedback.
2. Codex sở hữu phần shared: `v2/site.css`, `v2/site.js`, `v2/chrome.js`, `v2/fundraising-progress.mjs`, `v2/tools/site-templates.mjs`, `v2/data/content.mjs`, `v2/tools/build-site.mjs`, cùng các điểm tích hợp shared. Chỉ chuyển quyền ghi một phạm vi rõ ràng khi ticket được duyệt.
3. Claude sở hữu component/style/motion riêng được giao bằng danh sách file chính xác trong ticket. Không mặc định rằng khác trang là khác file: Home/About/Projects đang dùng chung template và CSS.
4. Nếu cần file chung: **chỉ một agent được ghi file đó trong một đợt**. Agent còn lại gửi yêu cầu tích hợp hoặc patch gắn với base SHA; không đồng thời sửa bản sao file đó rồi tự ghép.
5. Không đọc/chỉnh working tree đang thay đổi của agent kia. Chỉ bàn giao qua commit đã hoàn tất: gửi SHA, danh sách file, ảnh, lệnh kiểm tra và sai lệch. Reviewer đọc `git show <SHA>:<path>` hoặc snapshot của commit, không đọc file sống của agent kia. Không tự cherry-pick/merge khi chưa được yêu cầu tích hợp.
6. Build trong worktree của mình. Agent sở hữu ticket cập nhật cả source và generated outputs được giao; generated HTML trùng file vẫn là xung đột cần điều phối trước. Không chỉnh HTML generated bằng tay khi đã có template.
7. Mỗi ticket có báo cáo riêng: `docs/collaboration/reviews/<ticket>-codex.md` hoặc `<ticket>-claude.md`; evidence trong thư mục riêng theo ticket/agent. Không cùng sửa một status file. Ghi base/end SHA, diff, viewport, ảnh trước/sau, test và giới hạn; build/test thành công không phải visual PASS.
8. Sau mỗi ticket, dừng chờ review PASS/FAIL và quyền tiếp tục. FAIL chỉ sửa discrepancy được giao. Không tự push, mở PR, merge, deploy hoặc bắt đầu batch tiếp theo.

## Source và generated files chính xác

| Source | Vai trò / output |
| --- | --- |
| `v2/tools/site-templates.mjs`, `v2/data/content.mjs` | Nội dung, markup shared cho tám route bên dưới |
| `v2/tools/build-site.mjs` | Builder giữ nguyên subtree Intro/Hero, sinh tám HTML và `v2/data/site-data.js` |
| `v2/site.css`, `v2/site.js`, `v2/chrome.js` | CSS, interaction, navigation/footer shared; là source runtime, không generated |
| `v2/fundraising-progress.mjs` | Tính tiến độ/quy tắc theme hiện có; giữ nguyên trừ ticket được duyệt rõ |
| `v2/activity-carousel.js`, `v2/press-strip.js` | Source motion đã duyệt; đang protected, không phải phần Claude mặc nhiên được sửa |
| `v2/world.js`, `v2/world.css`, `v2/tools/board-playground.mjs` | Source Intro/Hero/geometry protected; không chạy generator cho feedback editorial |
| `assets/css/typography.css`, `v2/fonts/` | Product Sans và loading/fonts protected |

Generated outputs của `npm.cmd run build:site --prefix v2`:

```text
v2/index.html
v2/team/index.html
v2/du-an/index.html
v2/dong-hanh/index.html
v2/tinh-nguyen-vien/index.html
v2/du-an/vet-nut/index.html
v2/du-an/go-ngai/index.html
v2/team/phan-ban/index.html
v2/data/site-data.js
```

`v2/index.html` là file hỗn hợp: post-Hero được builder sinh; Intro/Hero nhúng sẵn phải giữ nguyên. Không coi cả file là tự do chỉnh hoặc tái tạo. Root website cũ không phải implementation đang review; preview dùng `/v2/` và asset chung `/assets/`.

## Bảo vệ và dữ liệu local

Đọc `AGENTS.md`, `v2/AGENTS.md`, `docs/CODEX_HANDOFF.md`, specification được duyệt và report liên quan trước mỗi ticket. Hướng dẫn này không thay thế hoặc làm yếu quy tắc hiện có.

Giữ nguyên Intro/Hero, Product Sans/loading, approved animations, fundraising data/calculation, `ung-ho/` (PayOS/checkout), `worker/`, `admin/`, deployment configuration, cùng mọi vùng trong `docs/recovery/POET_PROTECTED_BASELINE.json` và vùng đã được đánh dấu bảo vệ. People và archive geometry chưa được giao sửa. Không giao dịch/thử thanh toán thật, không gửi form thật.

Setup chỉ checkpoint tài liệu/launcher local; không có application correction chưa commit. 23 file untracked có sẵn ở Codex được giữ nguyên, không chuyển sang Claude hoặc stage: 21 file lịch sử đã ghi trong report Batch 01, cộng `v2/fonts/Suaserif-Bold.otf` và `v2/fonts/Cookie Crumble DEMO.otf`. Nguồn/phê duyệt hai font bổ sung chưa được xác nhận; không sử dụng chúng. Không stage secrets, cấu hình cá nhân, cache, node_modules, downloads, output QA tạm hoặc `New materials/`.

## Preview và restart (PowerShell)

Server phải serve **repository root**, không serve riêng thư mục `v2`. Server cũ Codex đang ở 8766 có thể được tái sử dụng sau khi xác nhận PID và root. Port bận: xem `netstat -ano -p TCP`; xác định tiến trình rồi mới quyết định, không kill tiến trình không thuộc ticket. Nếu server vẫn chạy thì không chạy thêm bản trùng port.

Codex — chạy trong terminal riêng và giữ terminal mở:

```powershell
Set-Location 'C:\Users\trang\Desktop\DRAFT\poet'
npm.cmd run preview --prefix v2
```

Claude — launcher local dùng tham số, không đổi `v2/tools/preview.mjs`:

```powershell
Set-Location 'C:\Users\trang\Desktop\DRAFT\poet-claude-ui'
node docs/collaboration/preview-local.mjs --port 8767
```

Launcher generic cũng chạy được ở Codex với `--port 8766` nếu server cũ đã dừng. Nó tự resolve root theo vị trí file trong chính worktree; endpoint `/__poet_preview_identity` trả root/port/PID để xác minh. Cả hai chỉ bind `127.0.0.1`; không phải deploy/backend payment server. Kiểm tra thật `/v2/`, `/v2/team/`, JS/CSS/font và `/assets/`, không chỉ HTTP 200.

## Browser / screenshot

Tái sử dụng Microsoft Edge headless và Playwright MCP hiện có (`.design-tools/package.json`, pinned `@playwright/mcp`); không thêm framework/plugin. Config máy và node_modules không được Git tự chép sang worktree mới. Mỗi agent phải dùng browser session isolated riêng, URL/port worktree của mình, evidence theo ticket; không chia sẻ session đang thao tác.

Setup dùng runner local hiện có để mở và chụp cả hai preview. Đây là kiểm tra khả năng tải/render và chụp ảnh, không phải visual/independent QA PASS. Claude Code chưa được tự động cấu hình MCP riêng: nếu client chưa có browser tool, báo thiếu và thống nhất cấu hình trước khi chọn/cài công cụ bổ sung. Không đọc working tree sống của agent kia để mượn source/config. Không tự cài lại tool chỉ để chạy website tĩnh; website đã có dependencies runtime vendored.
