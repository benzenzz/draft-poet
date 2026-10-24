# UI-004 — follow-up: eyebrow, icon tiles và footer

READY FOR REVIEW; chưa có independent QA PASS.

- Branch: `codex/poet-requirements-polish`.
- Base SHA: `6d6dcf60c868adf1162fec459cfb8252c8f41301`.
- Implementation SHA: `b37aa51de7fdefe99082a97e5b53f4f668d3b832`.
- Báo cáo này được checkpoint riêng sau implementation để ghi đúng SHA. Không push, merge, deploy, đọc/chỉnh worktree Claude hoặc bắt đầu feedback khác.

## Thay đổi theo feedback

| Before | After | Why |
| --- | --- | --- |
| Eyebrow viết hoa | `mỗi hành động đều có ý nghĩa`, toàn bộ chữ thường, căn giữa toàn chiều rộng heading | Yêu cầu mới của người dùng |
| Icon trắng không có tile | Giữ heart/building/users, thêm tile 44×44px, bo 10px; hồng/vàng/xanh theo thứ tự | Theo reference icon có nền màu |
| Ảnh lớp học với roof clip/fade | Footer là khối nền tối `#211F1C`, bo góc trên 16px, không có ảnh hoặc khoảng trống thay ảnh | Theo reference footer plain shape |

Giữ nguyên heading chính, nội dung và thứ tự ba card, destination/CTA palette, toàn bộ footer contacts/roles/phones/email/description/logo/social URLs/copyright. So sánh `chrome.js` với base xác nhận chỉ bỏ biến ảnh và phần chèn ảnh; phần header và footer còn lại giống hệt. Không xóa ảnh gốc hay asset đã chuẩn hóa; asset không còn được footer tải.

## Preview

- [Ba cách đồng hành](http://127.0.0.1:8766/v2/#cung-dong-hanh)
- [Footer](http://127.0.0.1:8766/v2/#lien-he-poet)
- [Home](http://127.0.0.1:8766/v2/)
- [Fixture 100.000đ giữ nguyên](http://127.0.0.1:8766/v2/?fundraisingPreview=100000#gay-quy)

## Kiểm tra thực tế

- `npm.cmd run build:site --prefix v2`: exit 0, sinh tám HTML bằng builder hiện có.
- `node --check` cho `v2/chrome.js`, `v2/tools/site-templates.mjs`, `v2/tools/build-site.mjs`, `v2/tools/tests/ui-004-browser.mjs`, `v2/tools/tests/ui-004-preservation.mjs`: 5/5 exit 0.
- PowerShell: `$env:POET_QA_OUTPUT='.design-tools/output/ui-004-followup'; node v2/tools/tests/ui-004-browser.mjs`: **138 checks passed**, 0 page errors, 0 form/payment submission attempts. Runner chặn request ra ngoài localhost và method ghi dữ liệu.
- `node v2/tools/tests/ui-004-preservation.mjs`: **22 checks passed**. Intro/Hero fragment, motion, font files/loading, People/Archive markup, fundraising calculation/reveal/data, 39 payment/Worker/admin/deployment files và 23 untracked cũ không đổi.
- `git -c core.safecrlf=false diff --check` và `git -c core.safecrlf=false diff --cached --check`: exit 0.
- Xem trực tiếp bốn ảnh section desktop/mobile. 1440×900, 768×844, 390×844 và 320×844 đều không overflow; label lowercase căn giữa; icon tile đúng màu; CTA desktop thẳng hàng. Footer còn đủ thông tin và social controls, không còn ảnh lớp học. Các milestone/count-up/reduced-motion vẫn đạt regression checks.

## Evidence

- [Đồng hành desktop](assets/UI-004-followup/1440-participation.png)
- [Đồng hành mobile](assets/UI-004-followup/390-participation.png)
- [Footer desktop](assets/UI-004-followup/1440-footer.png)
- [Footer mobile](assets/UI-004-followup/390-footer.png)
- [Browser measurements và kết quả](assets/UI-004-followup/browser-results.json)
- [Preservation](assets/UI-004-followup/preservation.json)
- [SHA256/kích thước evidence](assets/UI-004-followup/manifest.json)

Chỉ xuất bốn ảnh của hai phần thay đổi (~217 KiB); các capture không đổi từ regression runner giữ trong output local ignored. Ảnh focused section ẩn sticky navbar chỉ trong thao tác screenshot để không che nội dung; metadata ghi rõ. Không chỉnh source để tạo ảnh QA.

## Changed files / diff

- Source: `v2/chrome.js`, `v2/site.css`, `v2/tools/site-templates.mjs`, `v2/tools/build-site.mjs` (editorial cache revision `ui-004-2`).
- Generated: `v2/index.html`, `v2/team/index.html`, `v2/du-an/index.html`, `v2/dong-hanh/index.html`, `v2/tinh-nguyen-vien/index.html`, `v2/du-an/vet-nut/index.html`, `v2/du-an/go-ngai/index.html`, `v2/team/phan-ban/index.html`. Bảy route ngoài Home chỉ đổi cache revision; không sửa HTML thủ công.
- Regression expectations: `v2/tools/tests/ui-004-browser.mjs`, `v2/tools/tests/ui-004-preservation.mjs`.
- Asset record: `ASSET_STATUS.md`; không thêm hoặc xóa asset.
- Evidence: bốn PNG, browser-results, preservation, manifest tại `docs/collaboration/reviews/assets/UI-004-followup/`.
- Implementation: **22 files, 2651 insertions, 28 deletions**, phần lớn text là QA evidence. Báo cáo này thuộc documentation checkpoint tiếp theo.

## Giới hạn / bàn giao

Microsoft Edge headless, chưa kiểm tra thiết bị vật lý/Safari/Firefox hoặc screen reader thật. Không có live payment/form test. Không tuyên bố build hoặc check count tương đương independent visual PASS.

Shared files và tám generated HTML vẫn cần điều phối khi tích hợp Claude; chưa tích hợp/copy nguyên file từ Claude. 23 file untracked cũ giữ nguyên ngoài commit. Dừng chờ review PASS/FAIL của người dùng.
