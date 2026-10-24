/* PASS 2: homepage intro → hero → first scroll handoff. GSAP core only (pinned CDN), no ScrollTrigger,
   no build step. Compare ?motion=off; force the full greeting with ?motion=replay.
   Content is visible by default; the head bootstrap has its own fail-open timer. */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.hasAttribute('data-opening-prototype')) return;

  // System motion tokens (seconds / GSAP eases). Nothing here knows about a season.
  const MOTION = { out: 'power3.out', hero: 'power4.out', move: 'power4.inOut' };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 980px)');

  const hero = document.querySelector('.hero');
  const header = document.querySelector('.site-header');
  const hello = hero?.querySelector('.hero-hello');
  const helloMark = hello?.querySelector('img');
  const helloText = hello?.querySelector('.hello-text');
  const lines = [...(hero?.querySelectorAll('.hero-title-line') || [])];
  const body = [...(hero?.querySelectorAll('.hero-lead, .hero-support, .hero-actions, .hero-proof') || [])];
  const art = hero?.querySelector('.hero-art');
  const frame = hero?.querySelector('#hero-reel');
  const topNote = hero?.querySelector('.note-top');
  const bottomNote = hero?.querySelector('.note-bottom');
  const seal = hero?.querySelector('.joy-seal');
  const sparks = [...(hero?.querySelectorAll('.hero-spark path') || [])];
  const underline = hero?.querySelector('.underline-doodle path');
  const disclaimer = hero?.querySelector('.visual-disclaimer');
  const SESSION_KEY = 'poetIntroPlayed';
  const masks = [];
  const touched = [header, hello, helloMark, helloText, ...lines, ...body, frame, topNote, bottomNote, seal, disclaimer, ...sparks, underline].filter(Boolean);
  let timeline;
  let watchdog;
  let finished = false;

  /* ---------- Hero → intro scroll scene ----------
     One rAF-throttled scroll handler drives the whole handoff from a single progress value p
     (0 = top of page, 1 = the ticker's own slot reaches its handoff Y). Every value is a pure function of
     scroll position, so the scene is deterministic and fully reversible.
       0–.20  hero readable; scrapbook pieces open outward; ticker straightens
       .20–.40 photo frame holds in view, straightens, grows; ticker rises and scales up
       .40–.60 settle: frame and ticker hold still
       .55–.80 frame finishes its role and leaves (moves first, fades last, behind the ticker)
       .60–.78 ticker (the carrier) shrinks to 1× and travels to its handoff Y
       .66–.84 intro rises in below the band, overlapping the photo's exit
               (label .66–.75 → heading .68–.78 → copy .72–.84)
       .78–1   ticker holds exactly at the handoff Y; route loop closes
       1       the ticker's own slot is at the handoff Y, so it rejoins the page with no jump
     The crayon route (<svg class="route-handoff" data-route-from data-route-from-mobile data-route-to>)
     is a secondary thread drawn by the same progress. Reduced motion: final static state. */
  const handoff = (() => {
    const svg = document.querySelector('.route-handoff');
    const path = svg?.querySelector('path');
    const main = svg?.parentElement;
    const ticker = document.querySelector('.ticker');
    const intro = document.querySelector('#gioi-thieu');
    const introKicker = intro?.querySelector('.section-kicker');
    const introHeading = intro?.querySelector('h2');
    const introCopy = intro?.querySelector('.intro-right');
    const fadeAway = [...(hero?.querySelectorAll('.hero-spark') || [])];
    const owned = [frame, topNote, bottomNote, seal, disclaimer, ticker, ...fadeAway].filter(Boolean);
    // Intro parts rise in (scrubbed) once the ticker is nearly at its handoff Y; no blank reserved space.
    // The intro starts rising in the lower half while the photo is still leaving the upper half (the band sits
    // between them), so the screen is never empty: photo anchors until ~.72, the heading from ~.75.
    const rises = [[introKicker, .66, .75], [introHeading, .68, .78], [introCopy, .72, .84]].filter(([element]) => element);
    const TICKER_PEAK = 1.6;
    let headingShown = false;
    let m = null;
    let routeStart = 0;
    let routeEnd = 1;
    let tick = 0;
    let started = false;

    const clamp = value => Math.min(1, Math.max(0, value));
    const span = (p, a, b) => clamp((p - a) / (b - a));
    const smooth = t => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * t;

    // Layout box relative to <main>, ignoring transforms (the scene moves these very elements).
    // SVG anchors have no offset* metrics, so they fall back to the visual rect.
    function box(element, base) {
      if (element instanceof HTMLElement) {
        let l = 0;
        let t = 0;
        let node = element;
        while (node && node !== main) { l += node.offsetLeft; t += node.offsetTop; node = node.offsetParent; }
        if (node === main) return { l, t, r: l + element.offsetWidth, b: t + element.offsetHeight, w: element.offsetWidth, h: element.offsetHeight };
      }
      const r = element.getBoundingClientRect();
      return { l: r.left - base.left, t: r.top - base.top, r: r.right - base.left, b: r.bottom - base.top, w: r.width, h: r.height };
    }

    function clearScene() {
      owned.forEach(element => { element.style.translate = ''; element.style.rotate = ''; element.style.scale = ''; element.style.opacity = ''; });
      rises.forEach(([element]) => { element.style.opacity = ''; element.style.translate = ''; });
    }

    function layout() {
      const isMobile = mobile.matches;
      const from = document.querySelector(isMobile ? svg.dataset.routeFromMobile : svg.dataset.routeFrom);
      const to = document.querySelector(svg.dataset.routeTo);
      const copy = hero.querySelector('.hero-copy');
      if (!from || !to || !copy || !art) return false;
      const base = main.getBoundingClientRect();
      const mainTop = base.top + scrollY;
      const f = box(from, base);
      const k = box(to, base);
      const heroBox = box(hero, base);

      // Route: desktop starts at the end of the underline and runs down the empty gutter between copy and
      // art, so it never crosses text. Mobile starts under the stacked scrapbook.
      const sx = isMobile ? f.l + f.w / 2 : f.r - 2;
      const sy = isMobile ? f.b + 18 : f.t + f.h * .55;
      const gx = (box(copy, base).r + box(art, base).l) / 2 - 10;
      // Land by circling the next section's label: an imperfect, overshooting crayon loop.
      const cx = k.l + k.w / 2;
      const cy = k.t + k.h / 2;
      // Side padding shrinks near the page edge (phone gutter) so the overshooting loop is never clipped.
      const rx = k.w / 2 + Math.max(8, Math.min(22, (k.l - 6) / 1.1 - k.w * .05));
      const ry = k.h / 2 + 14;
      const at = (deg, grow = 1) => {
        const a = deg * Math.PI / 180;
        return `${(cx + rx * grow * Math.cos(a)).toFixed(1)} ${(cy + ry * grow * Math.sin(a)).toFixed(1)}`;
      };
      const [ax, ay] = at(-25).split(' ').map(Number);
      const approach = `C ${isMobile ? sx : gx} ${k.t - 70}, ${ax - 40} ${ay - 80}, ${ax} ${ay}`;
      const lead = isMobile
        ? `M ${sx} ${sy} L ${sx} ${sy + 24} ${approach}`
        : `M ${sx} ${sy} C ${sx + 40} ${sy + 4}, ${gx} ${sy + 8}, ${gx} ${sy + 70} L ${gx} ${heroBox.b} ${approach}`;
      path.setAttribute('d', `${lead} A ${rx} ${ry} 0 1 1 ${at(160)} A ${(rx * 1.06).toFixed(1)} ${(ry * 1.1).toFixed(1)} 0 1 1 ${at(-8, 1.1)}`);
      const width = Math.ceil(base.width);
      const height = Math.ceil(k.b + 60);
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      // Scene metrics in document coordinates. Transform-free, so measuring never feeds back into itself.
      const tickerBox = ticker ? box(ticker, base) : null;
      const frameBox = box(frame, base);
      const leadBox = box(hero.querySelector('.hero-lead') || copy, base);
      const proofBox = box(hero.querySelector('.hero-proof') || copy, base);
      const tickerTop = tickerBox ? mainTop + tickerBox.t : null;
      const tickerH = tickerBox?.h || 0;
      // Handoff Y: band top at 18% of the viewport, never under the sticky header. The scene ends when the
      // ticker's own slot reaches it, so the held band and the page meet exactly there.
      const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().height || 0;
      const handoffY = Math.round(Math.max(innerHeight * .18, headerBottom + 16));
      const sceneEnd = Math.max(1, tickerTop != null ? tickerTop - handoffY : mainTop + k.t - innerHeight * .35);
      const copyBottom = mainTop + proofBox.b;
      m = {
        isMobile,
        sceneEnd,
        handoffY,
        // Mid-scene hold: mid-screen, or just below the hero copy as it stands at p = .40, whichever is lower,
        // so the band can hold still without ever riding over the CTAs.
        holdY: Math.max(innerHeight * .5 - tickerH / 2, copyBottom - .4 * sceneEnd + 24 + tickerH * (TICKER_PEAK - 1) / 2),
        vh: innerHeight,
        vw: base.width,
        tickerTop,
        tickerH,
        routeX: gx,
        frameCx: frameBox.l + frameBox.w / 2,
        frameCy: mainTop + frameBox.t + frameBox.h / 2,
        frameW: frameBox.w,
        frameH: frameBox.h,
        leadRight: leadBox.r,
        copyBottom,
      };
      // Desktop route shares the scene's progress, so its loop closes as the label enters.
      // Mobile keeps its own mapping: the loop closes as the label reaches ~62% of the viewport.
      routeStart = isMobile ? Math.max(0, mainTop + sy - innerHeight * .8) : 0;
      routeEnd = isMobile ? Math.max(routeStart + 1, mainTop + k.t - innerHeight * .62) : sceneEnd;
      return true;
    }

    // The heading's doodle wipe may already have run before it was seen; replay it as it rises in.
    function replayDoodles(element) {
      const doodles = [element, ...element.querySelectorAll('[data-doodle]')].filter(node => node.classList.contains('is-doodle-visible'));
      if (!doodles.length) return;
      doodles.forEach(node => node.classList.remove('is-doodle-visible'));
      void element.offsetWidth;
      doodles.forEach(node => node.classList.add('is-doodle-visible'));
    }

    function desktopScene(y) {
      const p = clamp(y / m.sceneEnd);

      // Scrapbook pieces open outward (0–.30) and leave (.25–.42): room for the frame to take over.
      const open = smooth(span(p, 0, .3));
      const leave = 1 - span(p, .25, .42);
      if (topNote) { topNote.style.translate = `${(24 * open).toFixed(1)}px ${(-36 * open).toFixed(1)}px`; topNote.style.opacity = leave; }
      if (bottomNote) { bottomNote.style.translate = `${(-28 * open).toFixed(1)}px ${(20 * open).toFixed(1)}px`; bottomNote.style.opacity = leave; }
      if (seal) { seal.style.translate = `${(34 * open).toFixed(1)}px ${(-14 * open).toFixed(1)}px`; seal.style.opacity = leave; }
      fadeAway.forEach(spark => { spark.style.opacity = leave; });
      if (disclaimer) disclaimer.style.opacity = 1 - span(p, .12, .22);

      // Photo frame: holds its place in the viewport from .12 to .55 (counter-scroll), straightens and grows
      // to the scene's anchor. It drifts toward the centre only as far as the hero copy and the route's
      // vertical line allow. Exit (.55–.80): it lifts away, shrinks and slides right first; opacity goes
      // last (.72–.80), when it is almost off screen, so it never ghosts over the ticker.
      const holdFrom = .12 * m.sceneEnd;
      const holdTo = .55 * m.sceneEnd;
      const held = Math.min(Math.max(0, y - holdFrom), holdTo - holdFrom);
      const grow = smooth(span(p, .12, .4));
      const exit = smooth(span(p, .55, .8));
      const half = (m.frameW * 1.12) / 2;
      const targetCx = Math.max(m.vw / 2, m.leadRight + half + 32, m.routeX + half + 28);
      const dx = Math.min(0, targetCx - m.frameCx) * grow + 40 * exit;
      // Gentle extra lift: the frame stays on screen long enough to bridge into the intro heading.
      frame.style.translate = `${dx.toFixed(1)}px ${(held - m.vh * .12 * exit).toFixed(1)}px`;
      frame.style.rotate = `${(2.5 * grow).toFixed(2)}deg`;
      frame.style.scale = (1 + .12 * grow - .2 * exit).toFixed(4);
      frame.style.opacity = 1 - span(p, .72, .8);

      // Ticker = transition carrier. Viewport target: its own slot (0–.20) → rise (.20–.40) → hold still at
      // holdY (.40–.60) → shrink to 1× and travel to the handoff Y (.60–.78) → hold there (.78–1). At p = 1 its
      // own slot is at the handoff Y, so it rejoins the page in place.
      if (ticker && m.tickerTop != null) {
        const natural = m.tickerTop - y;
        const rise = smooth(span(p, .2, .4));
        const settle = smooth(span(p, .6, .78));
        const scale = 1 + (TICKER_PEAK - 1) * (rise - settle);
        let target = natural;
        if (p > .2 && p <= .4) {
          // Never ride up over hero copy that is still on screen (keeps the CTAs readable and clickable).
          const belowCopy = m.copyBottom - y + 24 + (m.tickerH * (scale - 1)) / 2;
          target = Math.max(lerp(m.tickerTop - .2 * m.sceneEnd, m.holdY, rise), belowCopy);
        } else if (p > .4 && p <= .6) target = m.holdY;
        else if (p > .6 && p < 1) target = lerp(m.holdY, m.handoffY, settle);
        // Sideways drift only while the band is enlarged (its scale covers the edges); 0 at 1×.
        const drift = -60 * (scale - 1) / (TICKER_PEAK - 1);
        ticker.style.translate = `${drift.toFixed(1)}px ${(target - natural).toFixed(1)}px`;
        ticker.style.rotate = `${(1.2 * smooth(span(p, 0, .2))).toFixed(3)}deg`;
        ticker.style.scale = scale.toFixed(4);
      }

      // Intro rises in under the settled ticker: label → heading → copy, scrubbed with scroll.
      rises.forEach(([element, a, b]) => {
        const shown = smooth(span(p, a, b));
        element.style.opacity = shown.toFixed(3);
        element.style.translate = `0 ${(32 * (1 - shown)).toFixed(1)}px`;
      });
      if (introHeading) {
        const shown = span(p, .68, .78) > .3;
        if (shown && !headingShown) replayDoodles(introHeading);
        headingShown = shown;
      }
      return p;
    }

    function mobileScene(y) {
      // Phones keep the order and the carrier, without holds or sideways travel: the ticker straightens and
      // swells slightly as it crosses the screen; the frame straightens as it passes.
      if (ticker && m.tickerTop != null) {
        const q = clamp((m.vh - (m.tickerTop - y)) / (m.vh + m.tickerH));
        ticker.style.rotate = `${(1.2 * smooth(clamp(q * 2))).toFixed(3)}deg`;
        ticker.style.scale = (1 + .3 * Math.sin(Math.PI * q)).toFixed(4);
      }
      const settle = smooth(clamp((m.vh * .85 - (m.frameCy - y)) / (m.vh * .6)));
      frame.style.rotate = `${(2.5 * settle).toFixed(2)}deg`;
      frame.style.scale = (1 + .04 * settle).toFixed(4);
    }

    // DEV-ONLY preview diagnostics (?preview=gioi-thieu); remove with the preview mode.
    function previewDiag() {
      const start = m.isMobile ? routeStart : 0;
      const end = m.isMobile ? routeEnd : m.sceneEnd;
      document.body.dataset.previewDiag = `p ${clamp((scrollY - start) / (end - start)).toFixed(2)} · start ${Math.round(start)} · end ${Math.round(end)} · y ${Math.round(scrollY)} · ${m.isMobile ? 'mobile' : 'desktop'} · reduced ${reduced.matches}`;
    }

    function update() {
      tick = 0;
      if (!m) return;
      if (root.dataset.preview) previewDiag();
      if (reduced.matches) {
        path.style.strokeDashoffset = '0';
        return;
      }
      const y = scrollY;
      if (m.isMobile) mobileScene(y);
      else desktopScene(y);
      const progress = clamp((y - routeStart) / (routeEnd - routeStart));
      path.style.strokeDashoffset = (1 - progress).toFixed(4);
    }

    function refresh() {
      clearScene();
      headingShown = false;
      // SVG elements have no .hidden property; toggle the attribute itself.
      const ready = layout();
      svg.toggleAttribute('hidden', !ready);
      if (ready) update();
    }

    return function startHandoff() {
      if (started || !svg || !path || !main || !hero || !frame) return;
      started = true;
      let pending = 0;
      const schedule = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(refresh); };
      refresh();
      document.fonts?.ready.then(schedule);
      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(schedule);
        observer.observe(hero);
        if (intro) observer.observe(intro);
        // The sticky header compacts on scroll (.is-scrolled), shifting <main> and the ticker's slot.
        if (header) observer.observe(header);
      }
      addEventListener('resize', schedule);
      addEventListener('load', schedule, { once: true });
      reduced.addEventListener('change', schedule);
      addEventListener('scroll', () => { if (!tick) tick = requestAnimationFrame(update); }, { passive: true });
    };
  })();

  /* ---------- Opening: greeting → kicker → hero resolve ---------- */
  function unwrapLines() {
    masks.forEach(mask => mask.replaceWith(...mask.childNodes));
    masks.length = 0;
  }

  function finish(state = 'complete') {
    if (finished) return;
    finished = true;
    clearTimeout(window.poetOpeningSafety);
    clearTimeout(watchdog);
    timeline?.kill();
    // Clear only properties owned by the opening; keep image/layout custom properties.
    if (window.gsap) window.gsap.set(touched, {
      clearProps: 'transform,translate,scale,rotate,opacity,visibility,clipPath,strokeDashoffset'
    });
    unwrapLines();
    root.classList.remove('opening-pending', 'opening-playing');
    root.dataset.openingState = state;
    window.removeEventListener('scroll', skipOnScroll);
    window.removeEventListener('resize', skipOnResize);
    document.removeEventListener('focusin', skipOnFocus);
    handoff();
  }

  function skipOnScroll() { if (window.scrollY > 80) finish('skipped-scroll'); }
  function skipOnResize() { finish('skipped-resize'); }
  function skipOnFocus() { finish('skipped-focus'); }
  reduced.addEventListener('change', event => { if (event.matches) finish('reduced'); });
  window.addEventListener('pagehide', () => finish('pagehide'), { once: true });

  function initHomepageOpening() {
    if (finished || root.dataset.openingState === 'fallback') return finish('fallback');
    if (!hero || !hello || !helloText || !header || lines.length !== 3 || !frame || !underline || !window.gsap) return finish('fallback');
    if (reduced.matches || location.hash || window.scrollY > 80) return finish(reduced.matches ? 'reduced' : 'skipped-position');

    clearTimeout(window.poetOpeningSafety);
    clearTimeout(watchdog);
    const gsap = window.gsap;
    const isMobile = mobile.matches;
    let played = false;
    try {
      played = sessionStorage.getItem(SESSION_KEY) === '1';
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch { /* Private/storage-blocked browsing still gets a bounded sequence. */ }
    const repeat = played && new URLSearchParams(location.search).get('motion') !== 'replay';
    root.dataset.openingVariant = repeat ? 'repeat' : isMobile ? 'mobile' : 'desktop';

    lines.forEach(line => {
      const mask = document.createElement('span');
      mask.className = 'opening-line-mask';
      line.before(mask);
      mask.append(line);
      masks.push(mask);
    });
    root.classList.add('opening-playing');
    root.classList.remove('opening-pending');
    root.dataset.openingState = 'playing';

    const rect = hero.getBoundingClientRect();
    // Stacked artwork below the viewport stays in its normal final state on mobile.
    const artVisible = !isMobile || frame.getBoundingClientRect().top < innerHeight - 30;
    const artParts = artVisible ? [frame, topNote, bottomNote, seal, disclaimer].filter(Boolean) : [];
    const artSparks = artVisible ? sparks : [];

    gsap.set(lines, { yPercent: 110, rotation: .7 });
    // Accent-safe mask padding must not leak the top of a waiting line.
    gsap.set(masks, { clipPath: 'inset(0 0 100% 0)' });
    gsap.set(body, { y: isMobile ? 8 : 14, opacity: 0 });
    gsap.set(header, { y: -6, opacity: .2 });
    gsap.set(underline, { strokeDashoffset: 1, opacity: 0 });
    gsap.set(artSparks, { strokeDashoffset: 1, opacity: 0 });
    gsap.set(artParts, { opacity: 0 });
    if (!artVisible) gsap.set(sparks, { strokeDashoffset: 0 });

    timeline = gsap.timeline({ defaults: { ease: MOTION.out }, onComplete: () => finish() });
    // A small inspection API for the prototype; it never controls other site behavior.
    window.POETOpening = { timeline, finish, version: 'pass2', variant: root.dataset.openingVariant };

    if (repeat) {
      gsap.set(hello, { y: 6, opacity: 0 });
      timeline.to(hello, { y: 0, opacity: 1, duration: .25 }, 0);
    } else {
      // STATE 1 — the greeting is the whole first screen: measured at its final kicker slot,
      // then scaled up and centred, so the one element can travel home (no duplicate copy).
      const final = hello.getBoundingClientRect();
      const headerBottom = Math.max(0, header.getBoundingClientRect().bottom);
      const scale = Math.max(1, Math.min(isMobile ? 1.7 : 3.4, (rect.width * (isMobile ? .9 : .8)) / final.width));
      const x = rect.left + rect.width / 2 - (final.left + final.width / 2);
      const y = headerBottom + (innerHeight - headerBottom) * (isMobile ? .4 : .44) - (final.top + final.height / 2);
      gsap.set(hello, { x, y, scale, opacity: 1 });
      gsap.set(helloMark, { scale: .9, rotation: -8, opacity: 0 });
      gsap.set(helloText, { yPercent: 110 });
      timeline.to(helloMark, { scale: 1, rotation: 0, opacity: 1, duration: .42 }, .05);
      timeline.to(helloText, { yPercent: 0, duration: .5, ease: MOTION.hero }, .15);
      // STATE 2 — the world opens: the greeting moves into its zone while the hero assembles around it.
      timeline.to(hello, { x: 0, y: 0, scale: 1, duration: isMobile ? .55 : .7, ease: MOTION.move }, isMobile ? .6 : .78);
    }

    // STATE 3 — hero resolve: title, copy, scrapbook, then the crayon underline last.
    // Title lines wait until the travelling greeting has cleared them.
    const titleAt = repeat ? 0 : isMobile ? 1.0 : 1.12;
    const titleDuration = repeat ? .28 : isMobile ? .5 : .65;
    const lineStagger = repeat ? .04 : isMobile ? .07 : .09;
    const copyAt = repeat ? .06 : isMobile ? 1.12 : 1.28;
    const frameAt = repeat ? .04 : isMobile ? .95 : 1.0;
    const underlineAt = repeat ? .18 : isMobile ? 1.38 : 1.66;
    const endAt = repeat ? .55 : isMobile ? 1.85 : 2.25;

    timeline.to(header, { y: 0, opacity: 1, duration: repeat ? .2 : .45 }, repeat ? 0 : .15);
    masks.forEach((mask, index) => timeline.set(mask, { clipPath: 'inset(0)' }, titleAt + index * lineStagger));
    timeline.to(lines, { yPercent: 0, rotation: 0, duration: titleDuration, stagger: lineStagger, ease: MOTION.hero }, titleAt);
    timeline.to(body, { y: 0, opacity: 1, duration: repeat ? .25 : isMobile ? .42 : .5, stagger: repeat ? .025 : .08 }, copyAt);
    timeline.set(underline, { opacity: 1 }, underlineAt);
    timeline.to(underline, { strokeDashoffset: 0, duration: repeat ? .25 : isMobile ? .42 : .5 }, underlineAt);

    if (artVisible) {
      const distance = isMobile ? 13 : 26;
      timeline.fromTo(frame, { y: distance, rotation: -4, scale: .97 }, { y: 0, rotation: -2.5, scale: 1, opacity: 1, duration: repeat ? .34 : isMobile ? .6 : .8 }, frameAt);
      timeline.fromTo(topNote, { y: -distance * .5, rotation: 8 }, { y: 0, rotation: 5, opacity: 1, duration: repeat ? .25 : .48 }, frameAt + (repeat ? 0 : .18));
      timeline.fromTo(bottomNote, { x: -distance * .5, rotation: -7 }, { x: 0, rotation: -4, opacity: 1, duration: repeat ? .25 : .48 }, frameAt + (repeat ? .03 : .28));
      timeline.fromTo(seal, { scale: .94, rotation: 6 }, { scale: 1, rotation: 10, opacity: 1, duration: repeat ? .25 : .44 }, frameAt + (repeat ? .06 : .45));
      const sparksAt = repeat ? .2 : isMobile ? 1.35 : 1.85;
      timeline.set(artSparks, { opacity: 1 }, sparksAt);
      timeline.to(artSparks, { strokeDashoffset: 0, duration: repeat ? .2 : .38, stagger: isMobile ? 0 : .05 }, sparksAt);
      timeline.to(disclaimer, { opacity: 1, duration: .25 }, repeat ? .24 : isMobile ? 1.45 : 1.95);
    }
    timeline.call(() => {}, [], endAt);
    // Include library/font latency in the introduction budget, but never compress the greeting past
    // ~1.35× — below that it can no longer be read.
    const startup = (performance.now() - (window.poetOpeningStarted || performance.now())) / 1000;
    if (!repeat) timeline.timeScale(Math.min(1.35, Math.max(1, endAt / Math.max(.6, (isMobile ? 2.4 : 2.9) - startup))));
    root.dataset.openingDuration = timeline.duration().toFixed(2);
    root.dataset.openingRate = timeline.timeScale().toFixed(2);
    watchdog = setTimeout(() => finish('timeout'), (endAt / timeline.timeScale() + .5) * 1000);
    window.addEventListener('scroll', skipOnScroll, { passive: true });
    window.addEventListener('resize', skipOnResize, { once: true });
    document.addEventListener('focusin', skipOnFocus, { once: true });
  }

  if (reduced.matches || location.hash || root.dataset.preview || root.dataset.openingState === 'fallback') {
    finish(reduced.matches ? 'reduced' : root.dataset.openingState === 'fallback' ? 'fallback' : 'skipped-position');
    return;
  }

  // Async library loading never delays app.js, shared navigation or later sections.
  // If CDN loading fails/gets slow, stay in the readable static final state.
  // The greeting is measured in its final font. The font wait runs alongside the GSAP download and is
  // bounded, so it never adds a separate delay; the head bootstrap's 1.2s fail-open guard still applies.
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise(done => setTimeout(done, 700))]) : Promise.resolve();
  function start() {
    clearTimeout(watchdog);
    fontsReady.then(() => {
      try { initHomepageOpening(); }
      catch (error) {
        finish('fallback');
        console.warn('POET opening skipped:', error.message);
      }
    });
  }
  if (window.gsap) start();
  else {
    const loader = document.createElement('script');
    loader.src = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js';
    loader.async = true;
    loader.onload = start;
    loader.onerror = () => finish('fallback');
    document.head.append(loader);
    watchdog = setTimeout(() => finish('fallback'), 950);
  }
})();
