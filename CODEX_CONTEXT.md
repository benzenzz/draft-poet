# CODEX CONTEXT — POET / V2

Cập nhật: **20/10/2026, Asia/Bangkok**.

### Cập nhật mới nhất: Product Sans

Theo yêu cầu trực tiếp mới nhất, GT Walsheim đã được thay bằng **Product Sans** trong toàn bộ runtime V2. Dùng 4 file có sẵn trong `v2/fonts/`: Regular/Bold/Italic/Bold Italic (400/700, normal/italic), đã kiểm tra đủ ký tự tiếng Việt. `v2/site.css` đổi font-face và `--poet-font`; builder đổi preload cho cả 5 trang và dùng `data-site-font` để build lặp không tạo preload trùng. Shared CSS revision mới là `product-sans-1`; motion vẫn `final-motion-2`. Handwritten Intro, artwork, animation và nội dung không bị thay trong đợt font này. Tài liệu V3 đính kèm vẫn ghi dùng GT, nhưng yêu cầu Product Sans mới hơn được ưu tiên. Chưa triển khai các thay đổi V3 khác chỉ vì chúng có trong tài liệu tham chiếu. Prototype AI Studio không truy cập được qua công cụ của phiên; không coi là đã inspect prototype live. Evidence font/coverage/screenshot nằm ở `../audit-work/product-sans/`, scripts kiểm tra ở `../.audit-tools/product-sans-*.cjs`.

Đây là bản tóm tắt bàn giao các yêu cầu, thay đổi code, lệnh quan trọng, kết quả kiểm tra và việc cần lưu ý. Đây không phải bản chép nguyên văn mọi tool call trong lịch sử. Phần lịch sử cũ được đối chiếu thêm với tài liệu có sẵn; trạng thái hiện tại được đọc lại từ source và evidence của lần sửa gần nhất.

## 1. Workspace, repository và trạng thái bàn giao

- Workspace đang mở: `C:\Users\trang\Desktop\DRAFT`.
- **Gốc dự án / Git repository:** `C:\Users\trang\Desktop\DRAFT\poet` — file này nằm ở đây.
- Branch hiện tại: `poet-redesign-v2`.
- Website đang phát triển: `poet/v2`, không phải homepage legacy ở `poet/index.html`.
- Trang chính: **http://127.0.0.1:8766/v2/**.
- Stack hiện tại: HTML/CSS/JavaScript thuần, web components, GSAP 3.13.0 + MotionPathPlugin cục bộ cho Hero; Web Animations API cho carousel; GSAP/rAF cho dải logo báo chí.
- Không thêm React, Three.js, Framer Motion, Lenis hoặc dependency animation mới cho các đợt sửa gần đây.
- Có nhiều thay đổi có sẵn và nhiều file chưa được Git theo dõi, trong đó toàn bộ `v2/` hiện xuất hiện là untracked. Không reset, clean, checkout đè hoặc xóa chúng.
- “Merge vào main V2” trong trao đổi là **tích hợp vào trang `/v2/`**. Không đồng nghĩa đã merge Git branch, commit, push hay deploy. Các bước Git/deploy đó chưa được thực hiện trong công việc gần nhất.

### Yêu cầu cuối cùng trước khi xuất context

Người dùng phản ánh animation từng chữ Intro và lắp ráp Hero bị mất sau khi mở link main không có query parameters. Đã tái hiện nhánh reduced motion và sửa mặc định của localhost. Kiểm tra runtime sau sửa đã hoàn tất; đã mở lại trang chính. Chưa có xác nhận trực quan cuối cùng từ người dùng trong VS Code sau lần sửa đó.

Yêu cầu hiện tại chỉ là tạo file context này. Không có yêu cầu thiết kế/triển khai mới đang chờ xác định, và không có bài test dài nào còn chạy từ lượt sửa trước.

## 2. Những quyết định của người dùng cần giữ

1. Giữ phong cách POET, bảng màu, font và tiếng Việt có dấu; không tự thiết kế lại sân chơi.
2. Luồng chính: **Intro → Hero sân chơi → 4 thumbnail → “Được giới thiệu trên” → toàn bộ nội dung website bên dưới**.
3. Người dùng đã chọn rõ **giữ toàn bộ website bên dưới**. Không gửi link `showcase=1` như bản chính nữa.
4. Intro dùng logo phụ POET, hiện từng chữ/hình P–O hoa–e–T. Sau đó logo thu nhỏ và dịch trái; hai dòng thơ bên phải căn trái, viết hoa đầu dòng:
   - “Hành trình niềm vui bắt đầu”
   - “Đan tay cùng bước, có nhau là nhà”
5. Logo chính POET thay motif bốn viên gạch ở bước nối Intro sang Hero.
6. Hero giữ bố cục isometric đã duyệt: bảng Young Joy, Join Joy, mũi tên viết tay, mascots, nhà và thiết bị sân chơi.
7. Tiles bình thường nhạt màu; tile bé mầm đang đứng/đáp lên mới đậm và phát sáng, đi qua thì nhạt lại.
8. Bé mầm chạy/nhảy theo vòng route, có nhịp nghỉ và bob nhẹ; leaves lớn hơn nhưng vẫn ít và nhẹ.
9. Thumbnail là ảnh phủ khung toàn chiều ngang, có 4 nút tròn chọn lại và nút pause. Chữ/ảnh chuyển mượt theo video tham chiếu.
10. **Giữ ảnh rõ thêm 1,5 giây sau khi hiệu ứng kết thúc**, không tính 1,5 giây cho cả chuyển cảnh.
11. Nút **“Xem thông tin chi tiết” đứng yên** khi ảnh/chữ chuyển. Link cập nhật theo slide.
12. Dải logo báo chí chỉ chuyển theo scroll: xuống → phải, lên → trái, không tự chạy marquee. Chữ “Được giới thiệu trên” giữ nguyên vị trí, typography và không chuyển động.
13. Bấm Join Joy **hoặc cuộn chuột xuống từ Hero đã dựng xong** đều chạy cùng chuyển cảnh lấy đà → bay lên → sóng liquid mở thumbnail. Không tạo hai timeline trùng.

## 3. Bản đồ source và cách build

| File / thư mục | Vai trò |
| --- | --- |
| `AGENTS.md` | Chính sách assets, định hướng thiết kế, stack, kỹ năng và QA; đọc trước khi sửa |
| `v2/index.html` | HTML trang chính, Intro/Hero SVG, boot scripts; phần dưới Hero được builder tạo lại |
| `v2/world.js` | Intro, assembly, bé mầm, tiles, ambient loops, Join Joy và chuyển cảnh bằng scroll |
| `v2/world.css` | Hình học và style riêng Hero; lớp sóng `.hero-join-wave` |
| `v2/hero-debug.js` | Diagnostics localhost, chỉ bật khi `heroDebug=1` |
| `v2/activity-carousel.js` | 4 ảnh thumbnail, chữ, autoplay, dots, pause và CTA cố định |
| `v2/press-strip.js` | Dải logo lặp, scroll reversible, masking/layout measurement |
| `v2/site.css` | Styles cho website ngoài Hero, carousel, press strip và shell |
| `v2/site.js` | Runtime chung; import carousel và press strip |
| `v2/chrome.js` | Navigation/footer bằng web components |
| `v2/data/content.mjs` | Nguồn dữ liệu nội dung, activities và `pressLogos` |
| `v2/tools/site-templates.mjs` | Template sections, carousel và press strip |
| `v2/tools/build-site.mjs` | Build 5 trang static; giữ subtree Intro/Hero |
| `v2/tools/preview.mjs` | Server preview Node nội bộ mới thêm |
| `v2/package.json` | Scripts `preview`, `build:site`, `vendor:gsap`; GSAP 3.13.0 |
| `v2/vendor/gsap/` | GSAP và MotionPathPlugin cục bộ |
| `assets/press/` | Logo báo chí bản gốc, bản crop và manifest |
| `ASSET_STATUS.md` | Nguồn và trạng thái assets |

Builder tạo/cập nhật `v2/index.html`, `v2/team/index.html`, `v2/du-an/index.html`, `v2/dong-hanh/index.html`, `v2/tinh-nguyen-vien/index.html` và `v2/data/site-data.js`.

Sửa section/data trong template và `content.mjs`, rồi chạy build; đừng chỉ sửa phần HTML generated. Hero vẫn nằm trong `index.html`; các generator hình học cũ ở `v2/tools/` có thể ghi đè artwork, chỉ chạy lại khi thật sự cần thay hình học.

Revision motion đang dùng: **`final-motion-2`**, đặt ở `motionVersion` trong builder và imports trong `site.js`. Revision shared CSS: **`product-sans-1`**, đặt ở `styleVersion` trong builder. `hero-debug.js` dùng query/build `hero-runtime-6`.

## 4. Hai nguyên nhân lỗi đã xử lý gần nhất

### A. `ERR_CONNECTION_REFUSED (-102)`

Server cổng 8766 đã dừng; đây là lỗi kết nối, không phải animation hay query parameters.

Đã thêm `v2/tools/preview.mjs` và script npm `preview`. Server:

- Bind `127.0.0.1:8766`, chỉ dùng local.
- Document root là thư mục `poet`, nên `/v2/` và `../assets/` cùng hoạt động.
- Có MIME cho JS/MJS/CSS/font/SVG/images; gửi `Cache-Control: no-store`.
- Hỗ trợ GET/HEAD, phục vụ toàn bộ website static.
- Đã khởi động bằng `Start-Process` ẩn và mở URL trong browser.

Lần khởi động đó trả PID `13560`, nhưng PID/server có thể thay đổi. Không dùng PID lịch sử để kill process. Kiểm tra trạng thái trước; không chạy thêm server nếu cổng đã có preview hoạt động.

**Server mới không phải server diagnostics cũ:** `.audit-tools/preview-server.cjs` có endpoint `/__hero-runtime/events`; `v2/tools/preview.mjs` chỉ là static preview và không nhận POST diagnostics. Nếu cần thu logs debug qua endpoint cũ, chọn lại server phù hợp; tránh chạy hai server cùng cổng.

### B. Mất animation Intro/Hero khi chuyển từ link preview sang link main

Trước đây link có `heroMotion=full` bật đầy đủ animation, nhưng URL trần `/v2/` theo OS `prefers-reduced-motion`. Khi browser/webview báo `reduce`, code dùng Intro tĩnh và bỏ qua assembly.

Đã tái hiện bằng browser với reduced motion:

- Trước sửa, localhost URL trần: **0 transform tiles trong phase assembly**, không có phase tiles.
- Trước sửa, `heroMotion=full`: **28 transform tiles khác nhau**, có assembly.
- Sau sửa, localhost URL trần: **27 transform tiles khác nhau**, Intro glyphs có opacity trung gian, đủ phases tiles → mascots → alive.
- Refresh URL trần: Intro và assembly phát lại.
- Mobile URL trần: **27 transform tiles khác nhau**, có đầy đủ Intro/Hero.

Không khẳng định đã đọc được preference trực tiếp từ phiên VS Code của người dùng. Nhánh lỗi được tái hiện ở runtime trong browser mô phỏng reduced motion, và bản sửa được kiểm tra với cùng điều kiện.

### Chính sách motion hiện tại — rất quan trọng

- Với host `localhost`, `127.0.0.1`, `[::1]`: **mặc định full motion**, theo yêu cầu người dùng xem đầy đủ bản local, không cần query hay session opt-in.
- `world.js`: localhost full nếu `heroMotion !== 'respect'` và `heroDebug !== '0'`.
- `activity-carousel.js`: localhost full nếu `carouselMotion !== 'respect'`.
- `press-strip.js`: localhost full nếu `pressMotion !== 'respect'`.
- Host public vẫn tôn trọng OS reduced motion. Đã kiểm tra qua origin public mô phỏng `https://poet.test`, được route về assets local; không phải deploy thật.
- Xem reduced motion local bằng URL bên dưới. Đừng “sửa” việc localhost full về hành vi cũ rồi làm mất animation trong bản người dùng đang duyệt.

```text
http://127.0.0.1:8766/v2/
http://127.0.0.1:8766/v2/?heroMotion=respect&carouselMotion=respect&pressMotion=respect
```

`heroOnly=1` ẩn nội dung dưới Hero. `showcase=1` chỉ giữ Intro/Hero + thumbnails + báo chí, ẩn phần dưới và footer. Hai mode này vẫn tồn tại để review, **không phải bản chính người dùng đã chọn**.

Hash/deep link hoặc scroll được restore có thể bỏ Intro theo logic `skipIntro`; không có cờ “đã xem Intro” lưu để tự bỏ Intro trên mọi lượt mới. Khi kiểm tra từ đầu, dùng URL trần không có `#noi-dung`/`#hoat-dong`/`#presse`.

## 5. Chi tiết animation hiện tại

### Intro và Hero

- Một GSAP master sở hữu Intro và assembly; controller `window.POETWorld` có `state`, `phaseEvents`, `masterTimeline`, ambient timelines, `replay()` và cleanup.
- Chờ assets/fonts sẵn sàng và paint trước khi chạy; pause khi hidden/offscreen.
- Các chữ/hình logo phụ reveal lần lượt ở khoảng 0.18 / 0.36 / 0.54 / 0.72 giây.
- Logo dịch trái + thu nhỏ bắt đầu 1.45 giây, duration 0.65 giây; height sau thu nhỏ khoảng 5% hơn chiều cao ink của 2 dòng thơ.
- Hai dòng thơ reveal khoảng 2.20 và 2.78 giây; curtain mở world khoảng 5.95 giây.
- Tổng Intro → assembled Hero khoảng **11.6656 giây**.
- Tile stagger 0.055 giây, duration 0.60 giây; tiếp theo world objects/sign/mascots; ambient chỉ sau completion.
- Không dùng `.seek()`, `.progress()` setters hoặc `.finish()` để tạo ảnh QA giả. API debug có tồn tại, nhưng kiểm tra playback phải quan sát thời gian thật.

### Wave up: Join Joy và wheel

`transitionToActivities({keyboard=false, source='click'})` nằm trong `world.js`:

1. Tạm dừng ambient; phát event `poet:hero-handoff` với `{phase:'start',source}`.
2. `.stage` hạ 22px, scaleX 1.015 / scaleY 0.975 trong 0.24 giây để lấy đà.
3. Bay lên khoảng 1.12 viewport height trong 0.72 giây, stretch nhẹ.
4. Một SVG curtain fixed `.hero-join-wave`, màu hồng nhạt POET, morph hai đường cong và đi lên.
5. Khi curtain che kín, chuyển tới `#hoat-dong` bằng scroll instant, cập nhật hash `#noi-dung`; sau đó sóng rời lên trên.
6. Tổng khoảng 1.55 giây; xóa overlay, restore stage, phát `{phase:'complete',source}` và cho carousel chạy.

Một biến `handoff` và một timeline `poet-join-wave` chặn chạy trùng. Escape hoàn tất chuyển cảnh và cleanup. Visibility/page suspension, reduced motion, replay/destroy cũng có cleanup/pause phù hợp.

Wheel listener non-passive, có AbortSignal:

- Chỉ bắt hướng xuống sau khi Hero hoàn tất, Hero còn chiếm ít nhất khoảng 65% viewport và có section thumbnail.
- Bỏ qua wheel ngang, Ctrl/Meta zoom, form/dialog/debug panel, menu mở, `heroOnly`, và reduced-motion thực sự.
- Chặn wheel burst trong lúc handoff, kể cả nhịp lấy đà trước khi overlay phủ màn hình.
- Sau khi tới nội dung, wheel trở về native; lên trên không kích hoạt sóng; quay lại Hero rồi xuống có thể kích hoạt lại.
- Wheel không tự chuyển keyboard focus. Click Join Joy có focus heading; Enter đi trực tiếp thay vì liquid animation.
- Người dùng chỉ yêu cầu wheel chuột; không bổ sung swipe-trigger wave riêng. Touch vẫn giữ hành vi hiện có.

### Thumbnail carousel

- 4 slides full-width; crossfade ảnh khoảng 600ms, giữ cùng crop, không pan/zoom ảnh.
- Chữ cũ fade ~180ms; label bắt đầu ~550ms, title ~800ms, supporting text ~950ms; scale nhẹ hơn trên mobile.
- Giữ **1.500ms sau khi toàn bộ transition hoàn tất** rồi mới đổi tiếp; không dùng một interval độc lập 1.500ms.
- Một timer, một transition owner; predecode ảnh, hủy pending request khi pause; offscreen/hidden/focus/gesture có pause phù hợp.
- `.activity-static-cta` là một link duy nhất ngoài các layer đang animate. Vị trí/opacity/scale giữ nguyên; href theo slide. Các CTA gốc làm layout slots và no-JS fallback.
- Carousel nghe `poet:hero-handoff`: giữ khi `start`, tiếp tục sau `complete`.
- Keyboard focus trong carousel chủ động tạm dừng autoplay để đọc; đây không phải lỗi mất animation.

### Press strip

- Data-driven qua `pressLogos` trong `v2/data/content.mjs`.
- Lặp Hoa Học Trò → Tiền Phong, card bằng nhau; desktop 160×56px, mobile 124×48px.
- Display width logo: Hoa Học Trò 56px, Tiền Phong 108px; mobile nhân 0.8.
- Track dịch bằng transform/translate3d, theo scroll progress qua vùng trung tâm 80% viewport, smoothing; full travel desktop 300px, mobile 240px.
- Dùng GSAP `quickTo` nếu có, rAF damping làm fallback. Không có autoplay marquee.
- Label giữ nguyên geometry/type. Track z-index 1, mask cùng background z-index 2, label z-index 3. Mobile label nằm trên hàng logo.
- Clone sequence đủ cả hai mép; clip section, không horizontal page overflow; có 2 link semantic riêng cho keyboard thay vì lặp tab stops.
- Khởi tạo sau `window.load` để tránh trường hợp module chạy trước khi GSAP deferred sẵn sàng.

## 6. Assets và các chỉnh sửa trước đó

### Logo báo chí đã có trong project

Hai file nguồn ban đầu được tìm thấy trong Downloads và **copy vào repo**, không tham chiếu Downloads ở runtime:

| Nguồn đã giữ | Bản dùng trên web | Crop |
| --- | --- | --- |
| `assets/press/originals/1630636423271.jpg` | `assets/press/hoa-hoc-tro.png` | từ 200×200, crop x14 y45, 172×111 |
| `assets/press/originals/tienphong_750x750.png` | `assets/press/tien-phong.png` | từ 750×750, crop x185 y321, 390×83 |

`assets/press/manifest.json` giữ source hashes và tọa độ crop. Đã đối chiếu pixel crop với source, không đổi màu/tỷ lệ logo. Không cần copy lại assets từ đường dẫn tạm của ChatGPT.

### Lịch sử giao diện đã duyệt

Đã có nhiều đợt chỉnh sign, vị trí mũi tên, loại bỏ bóng dưới bảng, nền thềm ngoài hồng nhạt, pop object theo chiều kim đồng hồ, hiệu ứng hover nổi object, layering slide/swing/bench/trees, bé mầm chạy route và tile glow. Giữ source hiện tại làm chuẩn; không áp dụng lại toàn bộ brief cũ như yêu cầu mới.

Logo chính/phụ, lettering Young Joy và photos đã được chuẩn hóa trong `assets/brand`, `assets/season-6`, `assets/editorial`, `assets/mascot`; tra `ASSET_STATUS.md` trước khi thay.

Video tham chiếu gốc từng được xem: `C:\Users\trang\Documents\Bandicam\bandicam 2026-10-18 19-40-38-680.mp4`. Các frame phân tích ở `../audit-work/v2-banner/video-reference/`. Link GiveNow/AUGE là tham chiếu chuyển động, không phải yêu cầu copy toàn bộ thương hiệu/layout của họ.

## 7. Các lệnh thao tác quan trọng

Các lệnh dưới đây chạy từ **DRAFT**, trừ khi có ghi khác. Dùng `npm.cmd` trong PowerShell để tránh alias/script execution policy của `npm.ps1`.

### Khởi động, build, mở trang

```powershell
Set-Location 'C:\Users\trang\Desktop\DRAFT'
npm.cmd run preview --prefix poet/v2
# Giữ terminal này chạy; Ctrl+C sẽ tắt server.

npm.cmd run build:site --prefix poet/v2
node --check poet/v2/world.js
node --check poet/v2/activity-carousel.js
node --check poet/v2/hero-debug.js
node --check poet/v2/tools/preview.mjs

Invoke-WebRequest -Uri 'http://127.0.0.1:8766/v2/' -Method Head -UseBasicParsing -TimeoutSec 5
Start-Process 'http://127.0.0.1:8766/v2/'
```

Lệnh đã dùng để chạy server nền (chỉ dùng nếu chưa có server):

```powershell
Start-Process -FilePath 'node.exe' -ArgumentList 'v2/tools/preview.mjs' -WorkingDirectory 'C:\Users\trang\Desktop\DRAFT\poet' -WindowStyle Hidden -RedirectStandardOutput 'C:\Users\trang\Desktop\DRAFT\audit-work\preview-server.log' -RedirectStandardError 'C:\Users\trang\Desktop\DRAFT\audit-work\preview-server-error.log' -PassThru
```

Lệnh nền đã được chấp thuận trong session; môi trường sandbox khác có thể cần quyền chạy background/GUI. Không dùng cửa sổ console hiện ra trừ khi người dùng cần.

### QA hiện hành sau lần sửa cuối

```powershell
node .audit-tools/intro-motion-policy-qa.cjs
node .audit-tools/v2-main-runtime-qa.cjs
node .audit-tools/join-wave-qa.cjs
node .audit-tools/join-wave-scroll-qa.cjs
node .audit-tools/join-wave-capture.cjs
```

`intro-motion-policy-qa.cjs --before` từng chạy để ghi lỗi cũ. **Không chạy lại `--before` rồi gọi kết quả đó là baseline trước sửa**, vì code hiện tại đã khác.

Các lệnh QA/chuẩn bị đã dùng ở giai đoạn trước:

```powershell
node .audit-tools/combined-flow-qa.cjs
node .audit-tools/banner-video-motion-qa.cjs
node .audit-tools/banner-static-cta-qa.cjs
node .audit-tools/press-strip-prepare.cjs
node .audit-tools/press-strip-qa.cjs
node .audit-tools/press-strip-debug.cjs
node .audit-tools/press-strip-followup.cjs
node .audit-tools/press-strip-motion-qa.cjs
node .audit-tools/hero-logo-intro-qa.cjs
```

**Không chạy lại `press-strip-prepare.cjs` tùy tiện:** script copy/crop nguồn và ghi đè baseline trước sửa. Các scripts lịch sử có thể còn giả định plain localhost sẽ honor reduced motion hoặc so hash của phiên bản cũ; phải đọc trước khi dùng. Không coi một failure do baseline/policy cũ là bằng chứng runtime mới hỏng.

### Git / đọc source

```powershell
git -c safe.directory=C:/Users/trang/Desktop/DRAFT/poet -C poet status --short
git -c safe.directory=C:/Users/trang/Desktop/DRAFT/poet -C poet branch --show-current
git -c safe.directory=C:/Users/trang/Desktop/DRAFT/poet -C poet rev-parse --show-toplevel
rg -n 'previewMotion|skipIntro|transitionToActivities|hero-handoff' poet/v2/world.js
rg -n 'final-motion-2' poet/v2/index.html poet/v2/site.js poet/v2/tools/build-site.mjs
```

Git dưới sandbox từng báo dubious ownership; dùng `-c safe.directory=...` theo từng lệnh thay vì thay global config. `Get-CimInstance Win32_Process` từng bị Access denied; không cần truy vấn đó chỉ để kiểm tra website có trả HTTP hay không.

### Những thử nghiệm không dùng làm kết luận thành công

- Playwright `recordVideo` không chạy vì thiếu `ffmpeg-win64.exe`; không cài thêm dependency vì task này. Đã dùng CDP screencast/live frames và contact sheet thay thế.
- `locator.click()` chờ element stable bị timeout vì sign có idle bounce liên tục. QA dùng bounding box hiện tại + mouse click thật, không ép timeline/progress để giả playback.
- Một số assertion ban đầu quá chặt: style rỗng tương đương null sau GSAP cleanup; autoplay có thể đang ở giữa transition khi chụp screenshot; keyboard focus phải pause carousel. Đã điều chỉnh kiểm tra tương ứng, không đổi production chỉ để ép test qua.
- Không báo “all checks passed” cho toàn bộ scripts lịch sử. Chỉ kết luận theo evidence của từng lần và source đang được test.

## 8. Evidence, kết quả và giới hạn

**Hai bộ kiểm tra sau cùng đã hoàn tất thành công:**

1. `../audit-work/intro-motion-policy/after.json`: localhost plain reduced-motion vẫn full; refresh phát lại; mobile full; explicit respect và origin public mô phỏng vẫn reduced. Không có page errors.
2. `../audit-work/v2-main/qa.json`: desktop 1440×900, mobile 390×844; dùng **URL trần `/v2/`** và browser báo reduced motion. Intro/assembly chạy, wheel và click có wave, đủ 4 slides autoplay, CTA còn một bản, press scroll hai chiều, nội dung dưới và footer còn nguyên. Browser nhận JS trùng hash file project; không page errors/overflow.

Evidence khác:

- `../audit-work/join-wave/`: runtime samples, ảnh desktop/mobile, `qa-desktop.json`, `qa-mobile.json`, `qa-keyboard.json`, contact sheet playback thật.
- `../audit-work/join-wave-scroll/qa.json`: wheel burst chỉ một owner, cuộn dưới Hero native, quay về kích hoạt lại, reduced-motion theo policy ở thời điểm test.
- `../audit-work/press-strip/`: 5 widths 1440/1280/768/390/360, label geometry baseline, crops, screenshots, motion samples, fallback test.
- `../audit-work/v2-banner/static-cta/`: position/opacity/transform/button identity và hrefs trong 4 slides.
- `../audit-work/preview-server.log`, `preview-server-error.log`: server nền hiện tại/lần khởi động gần nhất.

Browser QA dùng Microsoft Edge headless tại `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`, Playwright ở `../.audit-tools/node_modules`. Mobile là viewport/touch emulation, chưa phải máy điện thoại thật. Screencast không phải phép đo FPS của thiết bị yếu. Không thao tác submit donation, thanh toán hoặc dữ liệu quản trị trong QA.

`../.audit-tools/` và `../audit-work/` nằm **ngoài Git root poet**. Nếu chỉ chuyển repo sang máy khác, các helper/evidence đó không tự đi theo; runtime website không phụ thuộc chúng. Không dùng đường dẫn ngoài project làm asset production.

## 9. Skills / MCP và lịch sử audit môi trường

Theo `AGENTS.md` và báo cáo môi trường có sẵn:

- `.agents/skills/frontend-design` là skill Codex-compatible từ Anthropic skills, không chỉ là bản `.claude/skills`.
- `.agents/skills/web-design-guidelines` từ Vercel, cùng emil-design-eng / mobile-native / break-ui tạo workflow UI/UX; không tự nhận có một package riêng tên “UI/UX Design Skill” nếu chưa kiểm tra.
- `.claude/skills` dành cho Claude; không xóa, di chuyển hoặc duplicate tự động.
- `.taste-skill` là dữ liệu direction/QA, không phải runnable skill chỉ vì folder có tồn tại. `AGENTS.md` mới hơn ghi runnable Taste được discover qua `.agents/skills/design-taste-frontend` junction tái dùng nguồn Claude cache; junction phụ thuộc máy và version cache. Báo cáo audit cũ có chỗ ghi Taste chưa có, nên đọc cùng cập nhật mới ở AGENTS.
- Figma dùng connector đã có; không thêm MCP đăng ký trùng.
- Playwright MCP project-local ở `.design-tools/`, đăng ký trong `.codex/config.toml`; cần mở/trust đúng repo và phiên Codex mới để discover nếu đang mở parent DRAFT. Playwright library QA ở parent không tự đồng nghĩa MCP đã discover.
- REA từng là yêu cầu đầu lịch sử; không reinstall hay thay cấu hình REA trong các lần sửa animation gần đây. Nếu cần dùng lại, inspect trạng thái live thay vì suy ra chỉ từ tên folder.

Nguồn chi tiết: `docs/DESIGN_ENVIRONMENT_AUDIT.md`, `.design-tools/skills-sources.json`, `skills-lock.json`, `AGENTS.md`. Audit cũ mô tả stack ở thời điểm đó; `/v2/world.js` hiện đã dùng GSAP cục bộ nên không áp lại nhận định V2 chỉ dùng WAAPI của báo cáo cũ.

## 10. Cách tiếp tục từ đây

1. Đọc `AGENTS.md`, file này và source liên quan; xác nhận đang sửa repo `poet` trên branch `poet-redesign-v2`.
2. Kiểm tra server còn trả HTTP 200 trước khi cho rằng animation hỏng. Nếu connection refused, chạy `preview` và giữ process sống.
3. Mở **URL main không query, không hash**. Tab cũ cần Ctrl+Shift+R sau khi đổi asset revision. Localhost hiện phải có đầy đủ Intro/Hero dù OS báo reduce.
4. Nếu người dùng vẫn thấy mất animation: inspect URL/hash, `POETWorld.state`, GSAP/MotionPath loaded, visibility, master progress/paused, actual served JS và branch motion. Đừng vội thêm animation mới hoặc sửa thiết kế.
5. Giữ các thành phần đã duyệt; chỉ chỉnh yêu cầu tiếp theo. Đối chiếu tiếng Việt và typography logo/poem ở mobile.
6. Khi đổi template/data, chạy build. Khi đổi motion, kiểm tra playback thật và cleanup, không tạo “passing screenshots” bằng seek/progress setters.
7. Nếu được yêu cầu commit/push/deploy, review cả untracked files và những thay đổi legacy tồn tại từ trước; chỉ đưa đúng phạm vi được giao. Hiện chưa có commit/push/deploy mới để bàn giao.

**Không có redesign hoặc tính năng mới nào cần tự suy ra từ các brief cũ. Việc tiếp theo phụ thuộc phản hồi của người dùng sau khi xem bản localhost đã khôi phục animation.**

## 11. Cập nhật mới nhất — triển khai MASTER PROMPT POET V3 (20/10/2026)

Người dùng đã yêu cầu rõ **“start implementing it”** sau khi xác nhận lần trước chỉ thay Product Sans. Phạm vi hiện tại là **toàn bộ master V3**, không còn là font-only. Đã đọc toàn bộ master attachment `816865a2-c7c6-4951-ad07-5e3cce42699f/Pasted text.txt`, nội dung `Downloads/POET WEBSITE_UPDATE_1.md` và xem đủ 33 ảnh chú thích. AI Studio không truy cập được; dùng fallback nguồn local/ảnh người dùng mà brief cho phép. Không claim đã xem prototype live.

Chi tiết bàn giao: **`docs/V3_IMPLEMENTATION.md`**. Asset provenance mới: **`assets/editorial/v3-story-manifest.json`** và đầu **`ASSET_STATUS.md`**.

### Source precedence và thay đổi quan trọng

- Product Sans theo yêu cầu trực tiếp mới nhất, không quay lại GT trong brief cũ. Logo, font viết tay và tài sản mascot giữ nguyên.
- V3 mới nhất chủ động thay geometry/mascot/sign cũ: 9×9 grid, cell88, 32 tiles vòng ngoài; trường liền khối 3cells, cây ở góc gần trường, hai ô cách rồi nhà1cell; ba stalls khoảng2cells trên ba cạnh còn lại. Không còn benches hoặc Young Joy billboard cũ. Bảng **Have fun**, link thật `#hoat-dong`; giữ wave click/wheel.
- Bé Mầm **đứng ổn định**, chỉ thở nhẹ; đã gỡ hàm full-route loop. Bé Cúc lớn hơn, sway ngang nhẹ. Các yêu cầu running/Young Joy sign trong lịch sử đã được master mới thay thế; không tự khôi phục.
- Intro4glyphs/poem giữ choreography, không dùng seek/progress để tạo evidence. Master hiện khoảng10.90s do số object khác. Ambient13 owners, không có pathTimeline.
- Thumbnail giữ dissolve/scale/hold1.5s sau hiệu ứng và CTA đứng yên; thêm previous/next. Tên Young Joy Collection / Big Joy Pop-up; trạng thái “Sắp được bật mí”.
- Shared campaign/progress cho Home và Projects, có destination300em, timeframe09/2026–01/2027, narrative cuối đã duyệt, milestones4màu, donate + wall. Không dùng các số giả lập78.450.000/64%/248/14 làm live stats. Raised/remaining/counts vẫn chờ xác nhận.
- Completed projects có cover thật và routes `/v2/du-an/vet-nut/`, `/v2/du-an/go-ngai/`. Thêm `/v2/team/phan-ban/`. Dữ liệu trong `content.mjs`; template trong `site-templates.mjs`. Có intro xác thực/metrics/source links và slot gallery; bài dài/leaders chưa được bịa thay phần đang chờ.
- Business có hai nhánh đầy đủ; journey notes hidden default, hover/focus/tap/Escape; 10tiers preserved; chọn tier/sponsor tự điền form. Form chỉ tạo **bản nháp mailto có thể sửa và copy**, không submit backend, không tự gửi thư.
- Volunteer bỏ Điều hành listing card, config recruitment/video; giữ các thông tin chưa công bố thành pending. Footer contacts/sociallinks verified được đưa lên trên. Câu cảm ơn mới chỉ hiện trong nhánh payment API xác nhận success.

### Assets mới

Đã dùng Google Drive connector tìm đúng hai album user cung cấp. Hai ảnh gốc được tải read-only, xem thật và phân loại lịch sử POET: DSC03962.JPG (Vết Nứt) và IMG_4610.jpg (Final Trip). Bản WebP640/1280 ở `assets/editorial/story-*`. Không sửa/xóa ảnh gốc, không dùng đường dẫn tạm hoặc signed URLs trong runtime. Đây là lựa chọn editorial tạm, không claim POET đã duyệt final hoặc ảnh điểm trường Mùa6.

### Build, QA và bằng chứng

Chạy từ `poet`:

```powershell
npm.cmd run build:site --prefix v2
node v2/tools/board-playground.mjs --write
```

Build tạo8pages và kiểm tra tổng budget. Không có lệnh lint/test package sẵn; đã Node syntax-check các module/JS thay đổi. Không thêm dependency.

QA helpers chạy từ parent `DRAFT`:

```powershell
node .audit-tools/v3-browser-qa.cjs
node .audit-tools/v3-final-qa.cjs
node .audit-tools/v3-release-qa.cjs
node .audit-tools/v3-touch-qa.cjs
```

- `audit-work/v3/browser-qa.json`: 32route/viewport checks1440/1024/768/390; không overflow/ảnh hỏng được phát hiện/page errors; real playback samples và các thao tác chính.
- `final-qa.json`: source-served byte equality, no-store, fresh/returningrefresh, wheelwave, autoplay, scrollpress2chiều, shared progress, routes, donor modal Escape, mobile menu, 35internaltargets200; không pageerrors/localHTTPfailures.
- `release-qa.json`: geometry23458 trường /58658 nhà, 3stalls32tiles; targetHavefunmobile khoảng82×71px; carousel empty/one item smoke fixtures; **payment-success branch dùng status fixture**, không phải giao dịch thật.
- Screenshot cuối Home/Hero/About/Projects/Business/Sponsor/mobile nằm `audit-work/v3/`. Chụp sau cuộn thật để tải lazy images/reveal, quay về đầu trước fullpage. Không seek timeline hoặc gán progress.
- Không có ffmpeg cho Playwright recordVideo; không cài thêm. Đã kiểm tra natural playback qua các thời điểm và ảnh runtime; không gọi chuỗi ảnh đó là video.
- Explicit reduced-motion review dùng `?heroMotion=respect&carouselMotion=respect&pressMotion=respect`; public host tôn trọng OS. Default localhost giữ full-motion theo fix VSCode đã duyệt trước đó.

### Còn chờ / giới hạn

Campaign live totals, ảnh school Mùa6, bài dự án dài/final cover selection, profiles/quotes/member counts, videos/recruitment, sponsor entitlements/quy trình formal và PDFupdated vẫn chờ POET. Website hiển thị trung thực tình trạng này. Chỉ có intro/article skeleton có dữ liệu xác nhận; không gọi phần editorial chưa duyệt là hoàn tất nội dung.

Chưa test trên điện thoại vật lý; dùng Edge viewport/touch emulation. Không gửi email, submit checkout, thanh toán, sửa API/bank/QR, commit/push/deploy hoặc revert các thay đổi legacy tồn tại từ trước. Local preview vẫn là `http://127.0.0.1:8766/v2/`; serverroot `poet`, no-store. Nếu connectionrefused, chạy `npm.cmd run preview --prefix v2` và giữ process sống.

## 12. Campaign / tiến độ — follow-up theo prototype

Người dùng yêu cầu đưa section về đúng hai khung riêng như ảnh prototype, bỏ nền xanh bao toàn section, thay nội dung bên trái theo phần màu vàng trong ảnh doc mới, dùng hồng brand **#EF8A7D** cho thanh tiến độ và nút Ủng hộ ngay.

Đã sửa shared `campaign` / `fundraising` trong `v2/tools/site-templates.mjs` (Home và Projects): hai cột bằng nhau, panel trắng và panel progress nền mint/cream rất nhẹ như reference, padding32/radius24, footer hành động nằm đáy. Nội dung dùng đoạn mở đầu Hoàng Văn Thụ, đoạn fundraising tháng10/2026–01/2027 và đủ5 hoạt động theo ảnh mới; dữ liệu thêm vào `content.mjs`. Bỏ phụ đề Công Viên Niềm Vui riêng và thanh4màu; thay thanh liền hồng với số liệu pending trung thực. Giữ hai nhóm Cá nhân/Doanh nghiệp theo annotation trước; không lấy78.450.000/64%/248/14 từ mockup làm dữ liệu thật.

CSS chỉ scoped section này ở cuối `site.css`; style revision `campaign-prototype-2` trong builder. CTA detail từ Home mở current project, từ Projects xuống `#noi-dung-diem-truong`. Không sửa Intro/Hero/carousel hoặc payment runtime.

Build8pages thành công. `../.audit-tools/campaign-prototype-qa.cjs` kiểm tra Home/Projects ở1440/1024/768/390 (8views), đúng màu RGB239/138/125, cards bằng chiều cao desktop, không overflow/pageerrors, 5bullet, 2stats; donor modal và hai detail links hoạt động. Ảnh và report: `../audit-work/campaign-prototype/`.

## 13. Product Sans ONLY — quyết định typography dài hạn mới nhất

Yêu cầu mới nhất của người dùng: toàn bộ website chỉ dùng Product Sans, không còn display/handwriting font riêng. Điều này **ghi đè** mọi yêu cầu trước giữ Cool Crayon cho thơ Intro/sign. Không đổi logo/mascot/image artwork thành text.

Đã audit font metadata/cmap/licensing trước khi tích hợp. Báo cáo đầy đủ: **`docs/PRODUCT_SANS_TYPOGRAPHY.md`**. Bốn OTF hiện tại có internal family **SVN-Product Sans**, normal/italic400và700, không variable.12copies trong project/staging chỉ có4hashes, không Light300/Medium500/source masters. Cmap chứa đủ134chữ Việt precomposed, thiếu8combiningmarks; actual Edge shaping các câu mẫu NFC/NFD đều dùng glyph native, không fallback. Giấy phép nameID14 trỏ tới Google Product Sans restricted page; không có quyền nhúng/chỉnh sửa riêng được xác nhận. `fsType=0`không phải license. **Không tạo/chỉnh sửa/rename OTF hoặc fake300/500.**

Tích hợp CSS bằng các font có sẵn theo scope localuserrequest, không certify quyền publicweb. Shared **`assets/css/typography.css`** đăng ký4faces thật, familyprimaryProductSans+generic sans-serif, font-synthesis:none, tokens400/700 và semanticroles caption/UI hiệnresolve400thành thật, size12/14/16/24/48. `style.css` và `v2/v2.css` import shared sheet; V2site/world và legacy CSS dùng chung aliases. Bỏ duplicatefaces, GoogleFontsloaders, CoolCrayonpreload và mọi live family cũ. Code/pre/kbd/samp và form controls cũng dùngProductSans. Canvascard lấy family/weight tokens; resultconfetti không còn explicitserif. Trong `world.js` chỉ đổi font-readiness request CoolCrayon→ProductSans, không sửa timeline.

Không thay đổi numericfontsize/lineheight, componentdimensions, layoutCSS, geometry, background hoặc motionalgorithm. Browser reflow của chữ từng dùng font khác là hệ quả typography, không claim pixel-identical. OriginalOTFhashes giữ nguyên.

Validation:

- `npm.cmd run build:site --prefix v2` (từpoet) thành công8pages; Node syntaxcheckchangedJS. Style revision **product-sans-unified-1**.
- Helpers từDRAFT: `node .audit-tools/typography-specimen-qa.cjs before|after`, `node .audit-tools/typography-site-qa.cjs`, `node .audit-tools/typography-mobile-intro-qa.cjs`.
- Specimen200cases mỗi before/after:4faces×5sizes×5samples×2normalizations;0actualfallback/widthdifferences/inkheightproblems ởlineheight1.6. Screenshots đã xem ở12và48px cácfaces. Không suy ra mọiUnicode hoặc mọibrowser đều đượccover.
- Site32views (16routes×desktop/mobile): computedfamilyProductSans, font-synthesisnone, chỉ400/700; nooverflow/pageerrors/unexpectedfontrequests. CSScomparison bỏ fontproperties và resolve same-value size tokens xác nhận các layoutdeclarations còn lại unchanged. Generator/SVG unchanged, motion/donation/checkout sourcehashes preserved, worldchỉfontloadstring.
- RealIntro→tiles→Hero, wave, carouselNext, donationdialog và localcanvasfixture chạy; khôngseek/progresssetter, khôngsubmitpayment. Các icon/emoji có thể dùng glyphfallback hệ thống, khác với textViệt đã verify native.

Evidence: `../audit-work/typography/` gồmfont-audit.json,before/after-rendering.json,site-qa.json,mobile-intro-qa.json và screenshots. Chỉ cóEdgeWindowsavailable; Firefox/WebKit/Chrome riêng không cài, crossengine/iOSphysical chưatest. Không cài fontdependency/browsers mới, khôngdeploy, không tựsángtác fontLight hoặc coi GoogleSans là ProductSans.

## 14. Restore original prototype navigation + compact Home cards

Yêu cầu mới nhất trong attachment `b29ce8e9-a718-46b0-8c13-9517de79c904/Pasted text.txt`: khôi phục layout prototype, không redesign, chỉ nav và Home Season6 preview. Target cụ thể là ảnh có tên CLB + subtitle,3 supporting points và3 statistic cards. Đã tìm đúng file nguồn `C:/Users/trang/Pictures/Screenshots/Screenshot 2026-10-20 153818.png` (1350×643), bỏ12px black capture border khi đối chiếu1350×631. Các chỉ dẫn này thay thế lựa chọn minimal nav/2stats trước đó **chỉ ở Home preview**.

Đã khôi phục nav74px, logo chính đang dùng + “CLB Thiện Nguyện POET” + “Mùa6 · Công Viên Niềm Vui”, nhóm link ở giữa, partner dropdown viền vàng, CTA riêng136×36px. Giữ nguyên link/dropdown/mobile/focus/inert/donation handlers và footer. Không sửa animation.

Home dùng `homeCampaign`/`homeFundraising` riêng trong `site-templates.mjs`; `campaign(base,true)` và shared fundraiser của Projects giữ nguyên output. Hai card591.5×475px ở1350px, gap32/padding32/radius24; desktop1024–1440 giữ475px. Dưới hoặc bằng900px stack một cột. Copy ngắn đúng Hoàng Văn Thụ,3ý và timeline09/2026–01/2027; full approved text vẫn ởProjects. Card gây quỹ nềncoral rất nhẹ#FFF9F6, bar/CTA#EF8A7D, đủ3stats ngang.

Người dùng **cho phép dùng số liệu prototype làm provisional** khi thiếu số mới. Thêm riêng `homepageFundraisingPreview` trongcontent.mjs: raised78450000/individuals248/businesses14. Không sửa `season.*`null, paymentAPI hoặc dữ liệu thật; target121950000/300students giữ nguồn đã có. Tínhremaining43500000/64%rounded. Notehiểnthị rõ chưa xác nhận và badge64%*; không gọi live/trực tiếp. Confirmed finite field được ưu tiên nếu có sau này. Chỉ Home dùng preview; Projects vẫn pending.

CSS chỉ append rules scoped nav/Home modifier; toàn bộ CSS cũ byte-identical. Style/chrome cache revision `prototype-restoration-1`; motion revision không đổi. Dùng static Lucide0.468.0 SVGs +LICENSE local, không cài dependency. Bốn OTF và central font system giữ nguyênhash; ProductSans400/700, không tạo font.

Build8pages thành công. QA scripts từDRAFT: `node .audit-tools/layout-restoration-qa.cjs`, `layout-restoration-preserve.cjs`, `layout-restoration-motion.cjs`. Edge9widths1350/1440/1024/901/900/768/760/390/320: nooverflow/pageerrors,3points/3stats, drawer/dropdown/Escape/focus,donationdialog/detail/messagewall hoạt động. Full motion kiểm tra riêng Intro→Hero→pointerHavefun→wave→carouselNext; khôngsubmitpayment. Keyboard activation có sẵn intentionallyskipwave, không phải regression. Do sign auto-float, Playwright defaultclick stabilitywait không phù hợp; dùng actualpointercoordinate, không pause/seek runtime.

Preservation checks: ProjectmainHTML, Homeothersections, Intro/Hero markup,footer,world.js/css,hero.js,carousel,press-strip,site.js,typographyCSS không đổi so pre-taskbaseline. Report `docs/PROTOTYPE_LAYOUT_RESTORATION.md`; root `design-qa.md`; screenshots/QA `../audit-work/layout-restoration/`. Không claimpixel-perfect: officialflowerlogo/realProductSans/updatedcopy/coral/provisionalnote intentional; verticaloffset~2px/outlineheart minor. Physicalphones/Safari/Firefox chưa test. Preview `http://127.0.0.1:8766/v2/` giữ server chạy, khôngdeploy/commit/push.

## 15. Hero — nhẹ nét minh họa, thêm mây, xóa nút Play/Pause

Yêu cầu mới nhất attachment `6615d2f6-2b1b-464b-9623-e3172d9d7ba5/Pasted text.txt` và ảnh “Sân chơi bay giữa mây trời”: refine Hero hiện tại theo art direction nhưng **chọn texture nhẹ/sạch**, không repaint nặng hoặc thay cả cảnh thành raster. User explicit yêu cầu **xóa nút Play/Pause góc phải dưới**. Điều này ghi đè hướng dẫn cũ giữ nút Hero; không liên quan playback control của carousel.

Đã inspect camera/SVG generator và GSAP hooks trước khi sửa. Thêm `v2/tools/illustration-finish.mjs`: shared local SVG glaze/paper grain cực thưa,2cloud masses nền,16grass tufts/4daisies/3low shrubs. KhôngfeTurbulence/filterblur/raster/noiseoverlay toàncảnh hoặc package mới. Generator `board-playground.mjs` tích hợp các lớp này, nhẹ shaded walls/windows/roof edges, tán cây có nhánh/lá, flowerslớn hơnxíu, rimboardhighlight và soft radial contact shadows (thêm shadowBéMầm). Bỏ4hopscotchpolygons rốiởgiữasân. Giữ handwrittenHavefunarc nhưng nhỏ/nhạt hơn, cùngendpoint vàcuehooks. Stallplates25px cao,13pxProductSans tựnhiên, bỏtextLengthstretch cũ.

`world.css` scopedHero adds material rules; button CSS block bị xóa. `index.html` xóa thật button khỏiDOM; `world.js` bỏtogglequery/click/userPausedstate/nullrefs, không sửachoreography. Giữautomaticoffscreen/backgroundpause vàexplicitrespectreducedmode. NoalternativeUI injected. Builder tách **heroVersion=hero-illustrated-1** riêngworld.js/css đểrefreshcache, motion/sitecacheversion khác giữ nguyên.

Preserved: camera1530×838,board9×9/cell88/depth14,closed32tiles,routepath vàtilewrapperattributes byte-identical;50builditems và anchors, originalmascot/brand/fontassets. MainpostHeroHTML,nav/campaign/footer/carousel/pressruntime và4fontsha unchanged. Tree silhouette/grounddecoration là thayđổiđượcphép; không claim toànSVGunchanged. Masterduration **10.8952s**, toàn bộ recordedentryname/start/end,13ambienttimelines vẫn giốngbaseline.

Commands từpoet: `node v2/tools/board-playground.mjs --write`; `npm.cmd run build:site --prefix v2`; syntaxcheckworld/generator/newmodule. TừDRAFT: `node .audit-tools/hero-illustrated-qa.cjs`, `hero-illustrated-motion.cjs`, `hero-illustrated-mobile.cjs`. Build8pages pass;6viewports1672×941/1366×638/1024×768/768×1024/390×844/320×700, nooverflow/page/requesterrors; noHeroPausebutton,2clouds,zeroSVGfilters. RealIntro→Hero,hover,Havefunpointer/touch→wave,scrollwave,carousel anddestroy pass. Mobile390@2xfullplayback/poemfit andnoJSfallbackpass. IndicativeEdge120rAFframesbefore/aftermedian16.7ms,p9516.9/16.8ms,0frame>34ms; không suyra FPSmọidevice.

NativeSVG ~132KB/1067nodes so với103KB/778 trước, phần thêm static, không thêmimagedownload. Userreferencefile `C:/Users/trang/Downloads/Sân chơi bay giữa mây trời.png` giữ nguyên, chỉcopyvàoQA ngoàiwebsite. Source/render và before/after đã xemchung; intentionallycleaner/lighterthansource, khôngpixelclone. Report `docs/HERO_ILLUSTRATED_REFINEMENT.md`, `design-qa.md`addendum, evidence `../audit-work/hero-illustrated/`. Serverpreviewgiữchạy `http://127.0.0.1:8766/v2/`; khôngdeploy/commit/push.

## 16. User rejected illustrated Hero — reverted

User requested “CAN YOU TURN BACK I DON’T LIKE THIS VERSE”. Reverted the entire immediately preceding Hero illustration pass, including restoring its Play/Pause control. Restored exact pre-pass snapshots of v2/index.html, world.js, world.css, tools/board-playground.mjs and tools/build-site.mjs. Removed the now-unused illustration-finish.mjs module. All baseline hashes, including unrelated nav/campaign/carousel/press files, match the pre-refinement state. Earlier navigation/fundraising/Product Sans changes remain. Section15 and the illustration report are historical/rejected; do not reapply them. Removed current asset/QA claims for the rejected pass; audit screenshots remain outside the website for history.

## 18. Circular Hero shadows disabled

Latest user request: hide all circular ground shadows. Generator contact() now marks circular shadows with data-round-shadow; world.css hides those polygons. Building footprint and board shadows remain. Original object positions, SVG hit targets and animation wrappers remain intact. Hero cache revision is hero-no-round-shadows-1. Regenerated index.html and built all eight V2 pages successfully. Edge screenshots at 1440px and 390px confirm all 11 circular shadows hidden, no page errors or horizontal overflow. Evidence: ../audit-work/round-shadows/. No font, asset or unrelated animation changes.

## 17. Two stall redesigns + Bé Cúc size/elastic hover

New user brief attachment `1d43e897-dbf1-4eb6-876b-7904c5403498/Pasted text.txt`, plus frontal merchandise-booth reference. Scope only Community/YoungJoystalls and3BéCúc. Baseline is the restored Hero insection16; **do not reapply rejected clouds/grain/full-scene treatment**. HeroPlay/Pause stays as restored; this brief did not request its removal.

Updated `board-playground.mjs`: `serviceStall` renders Community folded yellow canopy/counter/flower emblem/supported noticeboard/brochure holder, and Young Joy coral/cream striped pitched canopy/scalloped inner valance/counter/connected rail/plain shirt+tote+folded shirt stock. Generic representative merchandise, no official product assets found, no new official branding invented. Existing BigJoy rendering/output stays byte-identical. Local+y faces inward (-u right / -v bottom); counters are inside, structural vertices/overhangs validated within176×88two-cell limits. Reverse winding for reflected local prism frames avoids wrong faces. Roof slope and hanger height were polished after real screenshots. Attached signage uses natural11.5pxProductSans fit, namescorrect. Stalls keep original anchors/151.36×55.44bases.

Three `figure()` images enlarged1.30uniformly, feet unchanged:75→97.5/72→93.6/74→96.2. Originalimagefiles/expressions/proportions andBéMầm unchanged. Each gets separate `flower-hover` parent around existing `character-body`idle; static `object-hit` referencesimageIDonly (no animated ancestor) so target stays atbase. GenericCSShoverlift excludesflowercharacters. No new buttonroles/tabstops/decorativeactions.

`world.js`: flower-owned map/tweens/listeners with existingAbortController. Enter75ms anticipation,220ms growovershoot1.205/y−10,300ms settle1.17/y−7; hold once. Exit300ms→1/y0; interruptionscontinuefromcurrentvaluesafterkill, no accumulation. Explicitreducedmodeimmediate1.035/y0; touchignored. Resetonpause/handoff/offscreen/reduced/cleanup; includedhoverwrappersinsnapshots. OriginalIntro/entrance/ambient/handoff timelines untouched. `world.css` adds locallyscopedbrandmaterials andwrapperrule. BuilderseparateheroVersion **hero-stalls-1** world.js/css; no site/carousel cache changes. `v2/index.html` regenerated, otherpagecontentidentical.

Build8pages andsyntaxchecks pass. Evidence `../audit-work/stalls-mascots/`: static5viewports1440×900/1366×638/1024×768/768×1024/390×844 nooverflow/errors/failedassets;45untargetedSVGobjectsbyte-identical,32tiles/50objects,exact1.30size/feet andsameartURLs; Intro/postHero/route/site source preserved. Actualmasterduration10.8952s/entrytimes/13ambientloops match baseline. All3hovers/hold/exit,6rapidreversals,pausereset,cleanup,reduced1.035,Havefun→wave/carouselpass. Touch390@2xnohover/nofakefocus,Havefunreachable;nativefontsizefitsnewsigns. Before/afteropened together in comparison.png, stall closeups/hover/mobile inspected. OnlyEdgeWindows/emulation, no physicalphone/Safari/Firefoxclaim.

Changedsourcefiles: generator,world.js,world.css,build-site.mjs; generatedv2index; docs/assetstatus/context/QA. No newassets/dependency/fontengine/paymentchange. Report `docs/HERO_STALLS_MASCOT_REFINEMENT.md`. Snapshotbeforefiles/hashesavailableforpreciseundo. Previewservercontinues `http://127.0.0.1:8766/v2/`.

## 19. Header wordmark, About photo hero and four-color fundraising

User explicitly confirmed the entire attachment d343c68f-9ad7-4821-8b61-05762f24135b after a scope clarification. Latest direct button request overrides the attachment's milestone-based CTA colors: navigation and fundraising donation buttons stay #EF8A7D, with white text and white hearts at every milestone.

Header now uses only a Product Sans Bold POET homepage link, individually colored P coral/O blue/E green/T yellow, with a fine outline on T. Footer/other branding stays unchanged. About reuses poet-team photograph as a responsive image hero, bottom-left exact headline and restrained dark gradient. Establishment/purpose paragraph and old caption moved below once; subsequent About sections are unchanged.

New shared v2/fundraising-progress.mjs calculates clamped percentage from amounts, provides milestone colors/tints and updates scoped card attributes/DOM/ARIA using MutationObserver. Null/missing amounts and invalid targets remain pending. One full-width saturated gradient is clipped to --progress over a pale full-width gradient. Fixed 25/50/75% boundaries; stage coral <25, yellow <50, green <75, blue >=75. Card tint/border/badge/icons/divider follow stage; buttons stay pink/white. 550ms clip/color transitions disabled by reduced-motion CSS. Home prototype figures remain visibly illustrative/unverified; actual season data and backend are untouched. No live-data connection invented.

Edited chrome.js, site.css, site.js, tools/site-templates.mjs, tools/build-site.mjs; new fundraising-progress.mjs. Eight static pages regenerated. Editorial cache header-about-funding-1; Hero/carousel revisions unchanged. No new assets/fonts/packages. Original scene, mascot/stalls, carousel and press-strip source hashes unchanged; generated Hero subtree identical. New report docs/HEADER_ABOUT_FUNDRAISING.md details files, logic, override, validation and limitations. Evidence/before snapshots: ../audit-work/header-about-fundraising/. Build and syntax checks pass. Edge responsive screenshots and all nine requested progress milestones/pixel samples pass; smooth actual transition and reduced mode verified. Not tested on physical devices or other engines. No payments/forms submitted. Preview remains http://127.0.0.1:8766/v2/ and /v2/team/.
