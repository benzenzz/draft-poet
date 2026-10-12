// Reusable site header: <site-header active="home|team|donate|partner" cta="support|contact">
// Page-specific mobile links can be passed as children:
//   <site-header active="home">
//     <a slot="extra-mobile" href="#hoat-dong">Hoạt động</a>
//   </site-header>
// Renders into light DOM (no shadow root) so existing app.js queries
// (.menu-toggle, #mobile-nav, .site-header) keep working unchanged.
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

  function navLink(href, label, isActive) {
    return '<a href="' + escapeHtml(href) + '"' + (isActive ? ' aria-current="page"' : '') + '>' + escapeHtml(label) + '</a>';
  }

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      var base = siteBase();
      var active = this.getAttribute('active') || '';
      var cta = this.getAttribute('cta') || 'support';

      var routes = {
        home: base + 'index.html',
        team: base + 'team/index.html',
        donate: base + 'ung-ho/index.html',
        partner: base + 'dong-hanh/index.html'
      };
      var logo = base + 'assets/logo/1555047679990943.jpg';

      var desktopNav =
        navLink(routes.home, 'Trang chủ', active === 'home') +
        navLink(routes.team, 'Team', active === 'team') +
        navLink(routes.donate, 'Ủng hộ', active === 'donate');

      // Collect page-specific extra mobile links before replacing children.
      var extras = Array.prototype.map.call(
        this.querySelectorAll('[slot="extra-mobile"]'),
        function (anchor) {
          return navLink(anchor.getAttribute('href') || '#', anchor.textContent.trim(), false);
        }
      ).join('');

      var mobileNav =
        navLink(routes.home, 'Trang chủ', active === 'home') +
        navLink(routes.team, 'Team', active === 'team') +
        navLink(routes.donate, 'Ủng hộ', active === 'donate') +
        navLink(routes.partner, 'Đồng hành', active === 'partner') +
        extras;

      var ctaButton = cta === 'contact'
        ? '<a class="button button-dark header-cta" href="#lien-he">Kết nối <span aria-hidden="true">↗</span></a>'
        : '<a class="button button-dark header-cta" href="' + escapeHtml(routes.partner) + '">Đồng hành <span aria-hidden="true">↗</span></a>';

      this.innerHTML =
        '<header class="site-header" id="top">' +
          '<div class="container header-inner">' +
            '<a class="brand" href="' + escapeHtml(routes.home) + '" aria-label="POET, về trang chủ">' +
              '<img class="brand-logo" src="' + escapeHtml(logo) + '" alt="" width="56" height="56">' +
              '<span class="brand-name">POET<small>TUỔI TRẺ · NHIỆT HUYẾT · NGHỆ THUẬT</small></span>' +
            '</a>' +
            '<nav class="desktop-nav" aria-label="Điều hướng chính">' + desktopNav + '</nav>' +
            ctaButton +
            '<button class="menu-toggle" type="button" aria-label="Mở menu" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button>' +
          '</div>' +
          '<nav class="mobile-nav" id="mobile-nav" aria-label="Điều hướng trên điện thoại" hidden>' + mobileNav + '</nav>' +
        '</header>';
    }
  }

  customElements.define('site-header', SiteHeader);
})();
