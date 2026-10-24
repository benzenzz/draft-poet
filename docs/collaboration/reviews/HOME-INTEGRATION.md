# POET Home — local integration review

READY FOR USER REVIEW. Đây là checkpoint tích hợp cục bộ, **không phải independent QA PASS**. Chưa push, deploy hoặc bắt đầu công việc riêng cho trang Về chúng tôi.

## Nhánh, checkpoint và môi trường

| Vai trò | Nhánh / SHA |
| --- | --- |
| Codex source | `codex/poet-requirements-polish` — `974d33140bc6375742405bfc190dda662ee15112` |
| Claude source | `claude/ui-feedback` — `775fc596ec644c22927bb6029c0c6190a6cd0b63` |
| Common ancestor | `11d29756086f591d868c986c1d1484f0f0a2ad84` |
| Integration | `integration/home-review-20261021` |
| Merge commit, đúng hai parent nguồn ở trên | `0c924cc866b6c9b1d820760518352da8b8876c6d` |
| Backup Codex | `backup/home-codex-20261021` → `974d33140bc6375742405bfc190dda662ee15112` |
| Backup Claude | `backup/home-claude-20261021` → `775fc596ec644c22927bb6029c0c6190a6cd0b63` |

Worktree tích hợp: `C:\Users\trang\Desktop\DRAFT\poet`. Claude giữ nguyên `C:\Users\trang\Desktop\DRAFT\poet-claude-ui` ở source SHA. Không chỉnh file trong worktree Claude, không reset/stash/clean hoặc đổi nhánh backup. Codex đã checkpoint UI-004 follow-up trước task này; không còn tracked changes cần checkpoint thêm. Handoff Claude xác nhận dừng; Git thực tế khớp commit bàn giao, status sạch ở đầu và sau quá trình tích hợp. 23 file untracked cũ ở Codex được kiểm tra hash và bảo toàn, không stage.

## Preview thật

- [Home tích hợp](http://127.0.0.1:8766/v2/)
- [Fixture 100.000đ](http://127.0.0.1:8766/v2/?fundraisingPreview=100000#gay-quy)
- [Archive](http://127.0.0.1:8766/v2/#dau-an) · [Media grid](http://127.0.0.1:8766/v2/#truyen-thong)
- [Ba cách đồng hành](http://127.0.0.1:8766/v2/#cung-dong-hanh) · [Footer](http://127.0.0.1:8766/v2/#lien-he-poet)
- [Reduced-motion respect mode](http://127.0.0.1:8766/v2/?heroMotion=respect&carouselMotion=respect&pressMotion=respect)

Tái sử dụng Node preview PID 15508 tại 127.0.0.1:8766, serve repository root. Sau merge commit, HTTP response của Home, site.css/site.js/chrome.js, world.js/world.css, Suaserif và Product Sans Bold khớp **SHA256 byte-for-byte** với file trong worktree này; không chỉ dựa vào HTTP 200. Xem [served-after-commit.json](assets/HOME-INTEGRATION/served-after-commit.json). Không đổi source server hoặc hardcode thêm port.

Restart nếu server dừng: từ repository root chạy `npm.cmd run preview --prefix v2`; kiểm tra port/PID trước khi khởi chạy để tránh trùng server.

## Ghép từng phần

| Vùng | Kết quả tích hợp |
| --- | --- |
| Intro/Hero/board | `world.js`, `world.css`, generator và embedded Hero/SVG khớp Claude; giữ greeting ×1.5, rounded tile corners, hover màu thương hiệu, biển Have fun/posts và không có pause button theo bàn giao |
| Font | Product Sans/loading/binary gốc không đổi; Suaserif chỉ trong greeting/board đúng ngoại lệ Claude; header Product Sans Bold 700, 4 màu, không outline |
| Activity carousel | Giữ nguyên source/template Codex UI-002: autoplay, previous/next/dots, CTA cố định, behavior focus/reduced motion; không đưa nút pause/ảnh ghi chú cũ từ branch Claude trở lại |
| Fundraising | Giữ nguyên calculation, count-up 500/750ms, target, provisional metadata, các thống kê, milestone và module local preview của Codex |
| Archive/media | Giữ template/CSS/reveal của Claude rev5; archive 2 cột desktop, media 3 text cards và stretched headline link; rail đã được thiết kế grid thay thế |
| Warm heading / participation / footer | Giữ UI-004 mới nhất: heading warm-dark; eyebrow lowercase căn giữa; 3 icon tile màu và exact card copy/CTA; footer nền tối bo góc, không ảnh lớp học, đủ logo/contact/social |
| Payment/QR/API/Worker/admin/deploy | Không đổi source, secrets, dữ liệu giao dịch hoặc configuration |

Không phát hiện phần triển khai còn thiếu trong danh sách cần cùng tồn tại. About/Projects HTML chỉ được builder tái tạo vì dùng chung component/cache; không triển khai hay thiết kế mới cho trang Về chúng tôi.

## Conflict và lỗi phát sinh do tích hợp

Có **4 file conflict Git**; không xử lý hàng loạt bằng nguyên file ours/theirs:

1. `v2/tools/site-templates.mjs`: hunk activity/press được tách, ghép activity của Codex với press-grid của Claude; không khôi phục `rail()`. Giữ archive của Claude, Home participation/fundraising của Codex.
2. `v2/site.css`: hai hunk chồng việc xóa playback/rail được xử lý theo chức năng — bỏ cả rail CSS và playback CSS chết, giữ dots hover. Phần CSS mới của hai bên đều giữ.
3. `v2/index.html`: conflict chỉ nằm trong post-Hero generated markup; Hero đã auto-merge đúng Claude. Chỉ dùng markup tạm đủ cấu trúc cho builder; toàn bộ main editorial được sinh lại từ merged templates.
4. `v2/team/index.html`: generated page được sinh lại sau khi source đã ghép. Không chỉnh thiết kế About.

Semantic integration fix: rule hover/focus chung của Codex nằm cuối CSS sẽ đè `#399F78` của card Claude; bỏ đúng hai override này để Claude sở hữu interaction archive/media, trong khi heading mặc định vẫn warm-dark. Dọn đúng các mảnh rail/media-width không dùng mà handoff nêu, không refactor cả CSS.

Áp patch đề nghị `heroVersion=ui-001-1` trong builder; editorial revision mới `home-integration-1`. Giữ nguyên các revision carousel/press và protected source.

## Lệnh và kết quả

| Lệnh | Kết quả thực tế |
| --- | --- |
| `npm.cmd run build:site --prefix v2` | Thành công sau hợp nhất source |
| `node v2/tools/build-site.mjs` | Final reproducibility: 8 HTML + site-data byte-identical |
| `node --check <15 file>` | 15/15; danh sách chính xác trong commands-results |
| `node --test v2/tools/tests/ui-002.test.mjs v2/tools/tests/ui-004.test.mjs` | 6 passed, 0 failed |
| `$env:POET_QA_OUTPUT='.design-tools/output/home-integration/editorial'; node v2/tools/tests/ui-004-browser.mjs` | 138 checks passed; 1440/768/390/320px, static QA dùng respect mode |
| `node v2/tools/tests/home-integration-browser.mjs` | 46 checks passed; natural Intro→Hero, hover/click/tap, handoff, autoplay/manual carousel, press strip, archive/media, Donate dialog, reduced motion |
| `node v2/tools/tests/home-integration-preservation.mjs` | 39 checks passed, đối chiếu source theo đúng chủ sở hữu hai SHA |
| `node v2/tools/tests/home-integration-preview.mjs` | 8 served files khớp worktree + focused archive screenshots |
| `node v2/tools/tests/home-integration-preview.mjs --identity-only` sau merge | Branch integration / merge SHA đúng, 8 served files khớp byte |
| `git -c core.safecrlf=false diff --check` | exit 0 cho nội dung đang hợp nhất |
| `git -c core.safecrlf=false diff --cached --check` | **exit 2:** một dòng whitespace cũ ở patch Claude, xem bên dưới |
| `git -c core.safecrlf=false diff --cached --check -- . ':(exclude)docs/collaboration/reviews/UI-003-claude/shared-files.patch'` | exit 0 cho toàn bộ file còn lại |

Ngoại lệ whitespace: `docs/collaboration/reviews/UI-003-claude/shared-files.patch:146` là dòng context trống có prefix của unified patch. File này byte-identical với Claude SHA; giữ nguyên artifact bàn giao, không thay đổi patch để che cảnh báo. Đây không phải lỗi source/runtime phát sinh khi ghép. Không báo full staged whitespace PASS.

Các lần chạy QA ban đầu phát hiện lỗi harness: dùng id thay cho `data-obj` của tile, đo archive trước khi trạng thái CSS khởi tạo đã ổn định, và kiểm ARIA ngay trước khi carousel decode ảnh xong. Đã sửa harness/chờ trạng thái thật rồi chạy lại; không seek/replay/finish timeline, ép class reveal hoặc sửa animation để vượt kiểm tra. Focused archive screenshot được chụp trong viewport vừa thẻ để tránh capture vùng ngoài viewport chưa paint; layout/source không thay để chụp.

## Số đo/behavior đã xác nhận

- Hero desktop/mobile đi tự nhiên qua Intro → tiles/board → playground → buildings/environment/details/sign/mascots → alive. Master duration 9.3118667s, khớp bàn giao Claude; không dùng timeline seek.
- Desktop tile hover đổi đúng một tile, rời chuột khôi phục; click và mobile tap vào mặt Have fun hit đúng link, wave kết thúc và carousel hoạt động.
- Archive desktop: 628.8125×578.6875px/thẻ, ảnh 252px; khớp số đo rev4/rev5 Claude. CTA nằm trong thẻ, không mất/cắt nội dung. Reveal thẻ 2 trễ khoảng 500ms.
- Media: 3 card text, không cover/rail; một anchor mỗi card, desktop 3 cột/mobile 1 cột, title hover/focus green `#399F78`.
- Fixture: raised=100000, target=121950000, progress=0.0820008200%; tint/border/badge và Donate CTA trong card coral, không recolor navbar. Default giữ 78.450.000 VNĐ/248 cá nhân/14 doanh nghiệp và provisional=true.
- Không overflow ngang ở 1440/768/390/320px; natural interaction checks 1440/390px cũng đạt.
- **0 page errors, 0 console errors, 0 local HTTP failures, 0 write/submission attempts.** Donate modal chỉ mở/đóng; GET `/api/settings` có 2 fixture responses để kiểm UI. Không gọi backend thật, không submit form hay giao dịch/thanh toán.

## Đối chiếu và evidence

Đã xem so sánh Hero desktop/mobile với `UI-001-claude/after-*-hero.png`, archive với `UI-003-claude/rev5-archive-1440.png`/số đo rev4, participation/footer với UI-004 follow-up. Ảnh Claude mobile DPR2 được đối chiếu theo CSS pixels với capture tích hợp DPR1. Source identity checks giữ nguyên Hero/board/animation của Claude và các component Codex, không chỉ dựa vào mắt hoặc build.

- [1440-activity.png](assets/HOME-INTEGRATION/1440-activity.png) — 1440×900
- [1440-archive.png](assets/HOME-INTEGRATION/1440-archive.png) — 1440×858
- [1440-board-hover.png](assets/HOME-INTEGRATION/1440-board-hover.png) — 1440×900
- [1440-footer.png](assets/HOME-INTEGRATION/1440-footer.png) — 1440×464
- [1440-fundraising-100000.png](assets/HOME-INTEGRATION/1440-fundraising-100000.png) — 591×479
- [1440-fundraising-default.png](assets/HOME-INTEGRATION/1440-fundraising-default.png) — 591×476
- [1440-header.png](assets/HOME-INTEGRATION/1440-header.png) — 1440×74
- [1440-hero.png](assets/HOME-INTEGRATION/1440-hero.png) — 1440×900
- [1440-intro.png](assets/HOME-INTEGRATION/1440-intro.png) — 1440×900
- [1440-media-hover.png](assets/HOME-INTEGRATION/1440-media-hover.png) — 1440×900
- [1440-media.png](assets/HOME-INTEGRATION/1440-media.png) — 1440×517
- [1440-participation.png](assets/HOME-INTEGRATION/1440-participation.png) — 1282×547
- [390-activity.png](assets/HOME-INTEGRATION/390-activity.png) — 390×844
- [390-archive-card-1.png](assets/HOME-INTEGRATION/390-archive-card-1.png) — 346×565
- [390-archive-card-2.png](assets/HOME-INTEGRATION/390-archive-card-2.png) — 346×625
- [390-footer.png](assets/HOME-INTEGRATION/390-footer.png) — 390×756
- [390-fundraising-100000.png](assets/HOME-INTEGRATION/390-fundraising-100000.png) — 346×507
- [390-fundraising-default.png](assets/HOME-INTEGRATION/390-fundraising-default.png) — 346×484
- [390-header.png](assets/HOME-INTEGRATION/390-header.png) — 390×72
- [390-hero.png](assets/HOME-INTEGRATION/390-hero.png) — 390×844
- [390-intro.png](assets/HOME-INTEGRATION/390-intro.png) — 390×844
- [390-media.png](assets/HOME-INTEGRATION/390-media.png) — 390×844
- [390-participation.png](assets/HOME-INTEGRATION/390-participation.png) — 346×1290

23 PNG, tổng 2.75 MiB. Natural screenshots là viewport 1440×900 hoặc 390×844, chuyển động ở frame tự nhiên. Focused section/card captures dùng cùng viewport và chỉ ẩn sticky navbar khi chụp để đọc đủ nội dung; metadata nằm trong JSON. Mobile archive tách hai ảnh thẻ; media mobile là viewport, không tuyên bố full-page.

[Commands/results](assets/HOME-INTEGRATION/commands-results.json) · [Natural flow](assets/HOME-INTEGRATION/natural-results.json) · [Editorial checks](assets/HOME-INTEGRATION/editorial-results.json) · [Preservation](assets/HOME-INTEGRATION/preservation.json) · [Preflight/23 untracked hashes](assets/HOME-INTEGRATION/preflight.json) · [Preview sau commit](assets/HOME-INTEGRATION/served-after-commit.json) · [Manifest SHA256](assets/HOME-INTEGRATION/manifest.json).

## Git diff và file list

Merge commit có hai parent đúng source SHAs. So với Codex parent: **141 files changed, 11345 insertions, 184 deletions**, gồm cả báo cáo/screenshots Claude đã commit từ trước và evidence integration. Không phải 141 application files mới được thiết kế. Danh sách chính xác: [merged-files.json](assets/HOME-INTEGRATION/merged-files.json).

Application/source nhận từ Claude: `world.js`, `world.css`, `board-playground.mjs`, `assets/fonts/suaserif-bold.otf`, phần shared `site.css`, `site.js`, `site-templates.mjs`, và asset record. Phần tích hợp bổ sung: cache trong `build-site.mjs`, giải quyết shared overrides/unused fragments, 8 generated HTML, 3 integration QA scripts và expectation green/respect-mode của `ui-004-browser.mjs`. Các module fundraising/carousel/chrome, original typography, official content và payment/backend không đổi so với Codex. Không stage 23 untracked cũ, secrets/config cá nhân, cache/node_modules, source `New materials/` hoặc QA output tạm.

Báo cáo này, post-commit preview proof và cập nhật manifest được lưu trong documentation checkpoint tiếp theo; application tree không đổi sau QA/merge commit.

## Phần còn mở / vấn đề có sẵn

- Chờ người dùng kiểm tra Home tích hợp; chưa có independent PASS, chưa bắt đầu trang Về chúng tôi.
- Suaserif licence chưa xác nhận theo bàn giao Claude; không giải quyết licensing hoặc public deployment trong task local này.
- Hero không còn pause control theo bản bàn giao. Hạn chế WCAG 2.2.2 mà Claude đã ghi nhận được giữ nguyên để người dùng quyết định, không tự thêm lại/redesign.
- `#399F78` hover dùng cho headline lớn/bold, không chứng nhận tương phản cho mọi loại chữ. Vạch số liệu/underline link archive giữ trạng thái hiện có, không tự đổi thiết kế.
- Trên 320px, archive card thứ hai cao hơn viewport ngắn như Claude đã ghi; không có overflow ngang, chưa sửa chiều cao/font để né giới hạn đó.
- Default localhost vẫn giữ full-motion preview policy của Claude/nguồn hiện tại; dùng respect URL cùng thiết lập reduced motion để kiểm chế độ giảm chuyển động. Không làm yếu source policy hoặc thay animation.
- Không xác minh lại ảnh tham chiếu gốc UI-001 chưa có trong phiên Claude; đã đối chiếu rendered handoff của Claude. Điện thoại thật/Safari/Firefox/screen reader và OS/background-tab behavior chưa xác minh.
- Không có live API/payment end-to-end test; backend/transaction data được kiểm bất biến theo diff/source.
- Một cảnh báo whitespace trong archived patch Claude như đã nêu; các kiểm tra source/build/runtime còn lại đạt.

**Dừng chờ người dùng review. Không push, deploy, merge thêm nhánh hoặc làm trang Về chúng tôi.**
