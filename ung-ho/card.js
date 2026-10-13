// POET thank-you card: drawn on <canvas> 1080x1350, no library.
window.POETCard = (() => {
  const CFG = (window.POET_DONATE_CONFIG && window.POET_DONATE_CONFIG.card) || {};
  const SLOGAN = CFG.slogan || 'Tuổi trẻ · Nhiệt huyết · Nghệ thuật';
  const SITE = CFG.siteLabel || 'maiphh.github.io/poet';
  const SHARE_URL = CFG.shareUrl || 'https://maiphh.github.io/poet/ung-ho/';

  // Name rule enforced HERE, not in the UI: anonymous never shows a name.
  function cardName(d) {
    if (!d || d.anonymous) return 'Một nhà hảo tâm';
    const n = String(d.displayName || '').trim();
    return n || 'Một nhà hảo tâm';
  }

  function wrap(c, text, x, y, maxW, lh, maxLines) {
    const words = text.split(' ');
    let line = '';
    let lines = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (c.measureText(test).width > maxW && line) {
        lines++;
        if (lines >= maxLines) { line += '…'; break; }
        c.fillText(line, x, y);
        y += lh;
        line = words[i];
      } else {
        line = test;
      }
    }
    c.fillText(line, x, y);
  }

  async function draw(canvas, d) {
    if (document.fonts && document.fonts.ready) {
      try {
        await Promise.all([
          document.fonts.load('800 92px "Baloo 2"'),
          document.fonts.load('46px Itim'),
          document.fonts.load('800 34px Nunito'),
        ]);
      } catch { /* draw with fallback fonts */ }
      await document.fonts.ready;
    }
    const c = canvas.getContext('2d');
    const W = 1080;
    const H = 1350;
    const name = cardName(d);
    const amt = Math.max(0, Number(d.amount) || 0);
    const when = d.paidAt || d.createdAt ? new Date(d.paidAt || d.createdAt) : new Date();
    const date = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .format(Number.isNaN(when.getTime()) ? new Date() : when);

    // The letter IS the canvas (no outer frame), so it reads large on phones.
    const rr = (x, y, w, h, r) => {
      c.beginPath();
      if (c.roundRect) c.roundRect(x, y, w, h, r);
      else c.rect(x, y, w, h);
    };
    c.clearRect(0, 0, W, H);
    c.fillStyle = '#fffaf1';
    c.fillRect(0, 0, W, H);
    c.strokeStyle = '#e2cfb1';
    c.lineWidth = 5;
    c.setLineDash([18, 14]);
    rr(36, 36, W - 72, H - 72, 40); c.stroke();
    c.setLineDash([]);
    c.textAlign = 'left';
    c.font = '72px serif';
    [['✿', 100, 140, '#ff8a76'], ['✦', 980, 140, '#f6c43f'], ['❀', 980, 1250, '#f3a9c4'], ['♥', 100, 1250, '#ff8a76']]
      .forEach(([s, x, y, col]) => { c.fillStyle = col; c.fillText(s, x - 36, y); });

    c.textAlign = 'center';
    c.fillStyle = '#3a9e74'; c.font = '800 44px Nunito';
    c.fillText('THƯ CẢM ƠN · POET', 540, 150);
    c.fillStyle = '#4a3324'; c.font = '60px Itim';
    c.fillText('Thân gửi', 540, 280);
    c.font = `800 ${name.length > 14 ? 104 : 140}px "Baloo 2"`; c.fillStyle = '#2f2219';
    c.fillText(name, 540, 430, 940);
    c.fillStyle = '#f6c43f'; c.fillRect(240, 462, 600, 18);
    c.fillStyle = '#7a5b45'; c.font = '700 48px Nunito';
    c.fillText('đã gửi tặng các em nhỏ vùng cao', 540, 570, 940);
    c.fillStyle = '#8a6bd1'; c.font = '800 156px "Baloo 2"';
    c.fillText(new Intl.NumberFormat('vi-VN').format(amt) + ' đ', 540, 740, 960);
    if (d.message) {
      c.fillStyle = '#4a3324'; c.font = '60px Itim';
      wrap(c, '“' + d.message + '”', 540, 870, 900, 76, 3);
    }
    c.fillStyle = '#7a5b45'; c.font = '700 40px Nunito';
    c.fillText('Ngày ' + date, 540, 1130);
    c.fillStyle = '#ff8a76'; c.font = '800 52px "Baloo 2"';
    c.fillText(SLOGAN, 540, 1210, 900);
    c.fillStyle = '#7a5b45'; c.font = '700 34px Nunito';
    c.fillText(SITE, 540, 1262);
  }

  const fileName = () => 'poet-cam-on-' + new Date().toISOString().slice(0, 10) + '.png';
  const toBlob = (canvas) => new Promise((r) => canvas.toBlob(r, 'image/png'));

  const SHARE_TEXT = 'Mình vừa gửi quà cho các em nhỏ vùng cao cùng POET 💛 Cùng mình ủng hộ nhé: ' + SHARE_URL;

  function bind(canvas, els) {
    const toast = (t) => { if (els.toast) els.toast.textContent = t; };
    const fileOf = async () => new File([await toBlob(canvas)], fileName(), { type: 'image/png' });
    els.save.addEventListener('click', async () => {
      const blob = await toBlob(canvas);
      const file = new File([blob], fileName(), { type: 'image/png' });
      // iOS Safari ignores <a download>; its share sheet offers "Lưu hình ảnh".
      if (/iP(hone|ad|od)/.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return; } catch { /* fall through */ }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Đã lưu ảnh ✓');
    });
    // Phones: share sheet with the letter PNG + message + link (pick Facebook there).
    // Desktop: Facebook's sharer only takes a URL; the og: tags on ung-ho/ give the preview.
    els.fb.addEventListener('click', async () => {
      let file = null;
      try { file = await fileOf(); } catch { /* ignore */ }
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Thư cảm ơn POET', text: SHARE_TEXT, url: SHARE_URL });
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
      }
      const url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(SHARE_URL);
      const w = window.open(url, '_blank', 'noopener,width=640,height=560');
      if (!w) location.href = url;
    });
  }

  return { draw, bind, cardName };
})();
