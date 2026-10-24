// Reusable image lightbox dialog: <site-lightbox label="Xem ảnh lớn"></site-lightbox>
// Renders into light DOM (no shadow root) so existing app.js selectors
// (#lightbox, .lightbox-close, [data-full]) keep working unchanged.
(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  class SiteLightbox extends HTMLElement {
    connectedCallback() {
      var label = this.getAttribute('label') || 'Xem ảnh lớn';
      this.innerHTML =
        '<dialog class="lightbox" id="lightbox" aria-label="' + escapeHtml(label) + '">' +
          '<button class="lightbox-close" type="button" aria-label="Đóng">×</button>' +
          '<img alt="">' +
          '<p></p>' +
        '</dialog>';
    }
  }

  customElements.define('site-lightbox', SiteLightbox);
})();
