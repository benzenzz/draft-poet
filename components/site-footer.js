// Reusable site footer: <site-footer></site-footer>
// Use variant="partner" on the Đồng hành page to keep its Little Joy copy.
// Renders into light DOM (no shadow root) so existing app.js selectors
// (.footer-main > div) and CSS keep working unchanged.
(function () {
  function siteBase() {
    var script = document.querySelector('script[src*="components/"]');
    if (script) {
      var src = script.getAttribute('src') || '';
      var i = src.indexOf('components/');
      if (i >= 0) return src.slice(0, i); // '' at root, '../' one level down, ...
    }
    return '';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  class SiteFooter extends HTMLElement {
    connectedCallback() {
      var base = siteBase();
      var isPartner = this.getAttribute('variant') === 'partner';

      var home = base + 'index.html';
      var team = base + 'team/index.html';
      var donate = base + 'ung-ho/index.html';
      var partner = base + 'dong-hanh/index.html';
      var logo = base + 'assets/logo/1555047679990943.jpg';
      var pdf = base + 'docs/quyen-loi-big-joy-little-joy.pdf';

      var tagline = isPartner
        ? 'Tổ chức thiện nguyện của người trẻ.<br>Little Joy là lời mời đồng hành trong POET Big Joy.'
        : 'Tổ chức thiện nguyện của người trẻ.<br>Niềm vui nhỏ. Có mặt thật.';

      var exploreLinks = isPartner
        ? '<a href="' + escapeHtml(home) + '">Trang chủ</a>' +
          '<a href="' + escapeHtml(team) + '">Team</a>' +
          '<a href="' + escapeHtml(donate) + '">Ủng hộ</a>' +
          '<a href="#hanh-trinh">Ba chặng</a>' +
          '<a href="#ugc">TikTok &amp; UGC</a>' +
          '<a href="#goi-tai-tro">10 gói Little Joy</a>'
        : '<a href="' + escapeHtml(home) + '#gioi-thieu">Giới thiệu</a>' +
          '<a href="' + escapeHtml(home) + '#hoat-dong">Hoạt động</a>' +
          '<a href="' + escapeHtml(home) + '#ky-niem">Kỷ niệm</a>' +
          '<a href="' + escapeHtml(team) + '">Team</a>' +
          '<a href="' + escapeHtml(donate) + '">Ủng hộ</a>' +
          '<a href="' + escapeHtml(partner) + '">Đồng hành</a>';

      var bottomNote = isPartner ? '© 2026 POET · LITTLE JOY' : '© 2026 POET';
      var pdfLabel = isPartner ? 'Bảng quyền lợi (PDF) ↗' : 'Bảng quyền lợi Little Joy (PDF) ↗';

      this.innerHTML =
        '<footer class="footer">' +
          '<div class="container footer-main">' +
            '<div>' +
              '<a class="brand footer-brand" href="' + escapeHtml(home) + '" aria-label="POET, về trang chủ">' +
                '<img class="brand-logo" src="' + escapeHtml(logo) + '" alt="" width="72" height="72">' +
                '<span class="brand-name">POET<small>TUỔI TRẺ · NHIỆT HUYẾT · NGHỆ THUẬT</small></span>' +
              '</a>' +
              '<p>' + tagline + '</p>' +
            '</div>' +
            '<div class="footer-links">' +
              '<span>KHÁM PHÁ</span>' + exploreLinks +
            '</div>' +
            '<div class="footer-links">' +
              '<span>KẾT NỐI</span>' +
              '<a href="https://www.facebook.com/poetorganization" target="_blank" rel="noopener noreferrer">Facebook POET ↗</a>' +
              '<a href="mailto:poet.npo@gmail.com">poet.npo@gmail.com</a>' +
              '<a href="' + escapeHtml(pdf) + '" target="_blank" rel="noopener">' + pdfLabel + '</a>' +
            '</div>' +
          '</div>' +
          '<div class="container footer-bottom"><span>' + bottomNote + '</span><a href="#top">Lên đầu trang ↑</a></div>' +
        '</footer>';
    }
  }

  customElements.define('site-footer', SiteFooter);
})();
