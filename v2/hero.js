/* POET v2 hero: intro build (Web Animations API) + scroll handoff (one rAF loop). No dependencies.
   Content is final in CSS; the intro only animates *from* offset states (fill: backwards), so a failed or
   skipped script leaves the resolved hero. Spec: docs/HERO_SPEC.md. */
(() => {
  'use strict';
  const root = document.documentElement;
  const wrap = document.querySelector('.hero-wrap');
  const hero = wrap?.querySelector('.hero');
  const mascot = hero?.querySelector('.mascot');
  const slot = document.querySelector('.mascot-slot');
  if (!hero || !mascot || !slot) return root.classList.remove('intro-pending');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ENTER = 'cubic-bezier(.23, 1, .32, 1)';
  const clamp = v => Math.min(1, Math.max(0, v));
  const span = (p, a, b) => clamp((p - a) / (b - a));
  const smooth = t => t * t * (3 - 2 * t);
  const inOut = t => (t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const q = selector => hero.querySelector(selector);

  /* ---------- Intro: greeting → platform → path → curb → objects → bé Mầm → resolve ----------
     Times in ms from script start (docs/HERO_SPEC.md). Everything is still between phases. */
  function intro() {
    clearTimeout(window.poetIntroSafety);
    if (!root.classList.contains('intro-pending')) return;
    if (scrollY > 4 || !hero.animate) return root.classList.remove('intro-pending');

    const anims = [];
    const play = (element, frames, delay, duration, easing = ENTER) => {
      if (element) anims.push(element.animate(frames, { delay, duration, easing, fill: 'backwards' }));
    };
    const FALL = 'cubic-bezier(.55, 0, 1, .45)'; // accelerating, like gravity
    const HEAVY = 'cubic-bezier(.2, .9, .25, 1)';

    // 0. The greeting holds, then lifts away while a shadow spreads where the platform will stand.
    play(q('.hero-greeting'), [
      { transform: 'none', opacity: 1 },
      { transform: 'none', opacity: 1, offset: .69 },
      { transform: 'translateY(-24px)', opacity: 0 },
    ], 0, 1300, 'ease-out');
    play(q('.platform-shadow'), [{ opacity: 0 }, { opacity: 1 }], 700, 600, 'ease-out');

    // 1. The platform rises into place with weight: about 1% compression, no overshoot.
    play(q('.platform'), [
      { transform: 'translateY(40px)', opacity: 0 },
      { opacity: 1, offset: .3 },
      { transform: 'translateY(0) scaleY(.99)', offset: .85 },
      { transform: 'none', opacity: 1 },
    ], 1200, 650, HEAVY);

    // 2. Tiles fall in path order, four groups of G B Y C: fall, land, dip and compress, settle.
    hero.querySelectorAll('.tile').forEach((tile, i) => {
      const delay = 2000 + Math.floor(i / 4) * 560 + (i % 4) * 80;
      play(tile, [
        { transform: 'translateY(-120px)', opacity: 0, easing: FALL },
        { opacity: 1, offset: .25, easing: FALL },
        { transform: 'translateY(0)', offset: .66, easing: ENTER },
        { transform: 'translateY(2px) scaleY(.97)', offset: .82, easing: ENTER },
        { transform: 'none', opacity: 1 },
      ], delay, 360, 'linear');
    });

    // 3. The cream curb is fitted last, then a short hold: "this is the path".
    play(q('.curb'), [{ opacity: 0 }, { opacity: 1 }], 4300, 300, 'ease-out');

    // 4. Objects grow out of the platform at their ground points, each with its own weight.
    const rise = (name, delay, duration, settle) => play(q(`[data-obj="${name}"]`), [
      { transform: 'translateY(16px) scaleY(.6)', opacity: 0 },
      { opacity: 1, offset: .3 },
      ...settle,
      { transform: 'none', opacity: 1 },
    ], delay, duration);
    rise('slide', 4700, 600, [{ transform: 'scaleY(1.01)', offset: .8 }]);
    play(q('[data-obj="seesaw"]'), [
      { transform: 'scale(.9)', opacity: 0 },
      { opacity: 1, offset: .4 },
      { transform: 'scale(1.02)', offset: .7 },
      { transform: 'none', opacity: 1 },
    ], 4950, 420);
    play(q('.seesaw-plank'), [{ transform: 'rotate(-9deg)' }, { transform: 'none' }], 5250, 420, 'cubic-bezier(.77, 0, .175, 1)');
    rise('swing', 5150, 420, []);
    play(q('.swing-seat'), [
      { transform: 'rotate(6deg)' },
      { transform: 'rotate(-3deg)', offset: .4 },
      { transform: 'rotate(1.2deg)', offset: .72 },
      { transform: 'none' },
    ], 5450, 900, 'ease-in-out');
    play(q('[data-obj="wheelbarrow"]'), [
      { transform: 'translateY(-12px)', opacity: 0 },
      { opacity: 1, offset: .35 },
      { transform: 'translateY(0) rotate(3deg)', offset: .6 },
      { transform: 'rotate(-1deg)', offset: .82 },
      { transform: 'none', opacity: 1 },
    ], 5350, 380);
    [['sandal-a', 5500], ['sandal-b', 5560]].forEach(([name, delay]) => play(q(`[data-obj="${name}"]`), [
      { transform: 'scale(.85)', opacity: 0 },
      { opacity: 1, offset: .5 },
      { transform: 'scale(1.04)', offset: .7 },
      { transform: 'none', opacity: 1 },
    ], delay, 220));

    // 5. Bé Mầm comes up from behind the front tile, hops, lands (cut to standing), reacts once, settles.
    const LAND = .72;
    play(mascot, [
      { transform: 'translateY(45%)', clipPath: 'inset(0 0 45% 0)', opacity: 0 },
      { opacity: 1, offset: .08 },
      { transform: 'translateY(-18px)', clipPath: 'inset(0 0 0 0)', offset: .5 },
      { transform: 'translateY(0)', offset: LAND, easing: FALL },
      { transform: 'scaleY(.94) rotate(-2deg)', offset: .86 },
      { transform: 'none', clipPath: 'inset(0 0 0 0)' },
    ], 6000, 600);
    play(q('.pose-jump'), [{ opacity: 1 }, { opacity: 1, offset: LAND }, { opacity: 0, offset: LAND }, { opacity: 0 }], 6000, 600, 'linear');
    play(q('.pose-hop'), [{ opacity: 0 }, { opacity: 0, offset: LAND }, { opacity: 1, offset: LAND }, { opacity: 1 }], 6000, 600, 'linear');

    // 6. Resolve: headline wiped in, then sentence and action; navigation. Then stillness until scroll.
    play(q('.bar'), [{ opacity: 0 }, { opacity: 1 }], 6600, 300, 'ease');
    play(q('.hero h1'), [{ clipPath: 'inset(0 100% 0 0)', opacity: 1 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }], 6600, 600);
    play(q('.hero-support'), [{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 6670, 440);
    play(q('.hero-cta'), [{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 6740, 440);

    // Repeat visits in the same session get the short version (~0.8s).
    try {
      if (sessionStorage.getItem('poetV2Intro')) anims.forEach(a => { a.playbackRate = 9; });
      sessionStorage.setItem('poetV2Intro', '1');
    } catch { /* storage blocked: play the full intro */ }
    root.classList.remove('intro-pending'); // fill: backwards now holds the start states

    // Any intent to move on resolves the intro at once.
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    const skip = () => anims.forEach(a => a.finish());
    const onScroll = () => { if (scrollY > 4) skip(); };
    events.forEach(type => addEventListener(type, skip, { passive: true }));
    addEventListener('scroll', onScroll, { passive: true });
    Promise.all(anims.map(a => a.finished)).catch(() => {}).finally(() => {
      events.forEach(type => removeEventListener(type, skip));
      removeEventListener('scroll', onScroll);
    });
  }

  /* ---------- E. Scroll handoff: bé Mầm leads into Section 01 ----------
     Every value is a pure function of scrollY and measured constants, so reverse scroll is exact.
     Measured only on load, font load and resize, never during scroll. */
  const openers = [...hero.querySelectorAll('[data-open]')];
  let m = null;
  let tick = 0;

  function measure() {
    mascot.style.translate = '';
    mascot.style.scale = '';
    openers.forEach(o => { o.style.translate = ''; });
    const y = scrollY;
    // Layout offsets ignore transforms, so a running intro cannot skew the measurement.
    let x = 0, top = 0, node = mascot;
    while (node && node !== hero) { x += node.offsetLeft; top += node.offsetTop; node = node.offsetParent; }
    const wrapTop = wrap.getBoundingClientRect().top + y;
    const s = slot.getBoundingClientRect();
    const slotTop = s.top + y;
    m = {
      x, top,
      wrapTop,
      pinEnd: wrapTop + wrap.offsetHeight - hero.offsetHeight,
      slotX: s.left,
      slotTop,
      // Where the slot sits on screen at p = 1: the landing point is fixed in screen space, so the path is one arc.
      landY: innerHeight * .7 - s.height,
      vh: innerHeight,
      // Handoff ends when the landing slot's feet reach 70% of the viewport.
      end: Math.max(1, slotTop + s.height - innerHeight * .7),
    };
  }

  // The hero's top edge on screen: before, during and after its sticky pin (or plain flow on phones).
  const heroTop = y => Math.max(m.wrapTop - y, Math.min(0, m.pinEnd - y));

  function update() {
    tick = 0;
    if (!m) return;
    if (reduced.matches) {
      mascot.style.visibility = '';
      slot.style.visibility = '';
      return;
    }
    const y = scrollY;
    const p = clamp(y / m.end);
    const done = p >= 1;
    mascot.style.visibility = done ? 'hidden' : '';
    slot.style.visibility = done ? 'visible' : '';

    // anticipate (crouch) → one jump arc → land on a fixed screen point beside the Section 01 heading.
    // Aiming at the moving slot made the path dip below the fold and climb back; the fixed point equals the slot at p = 1.
    const naturalY = heroTop(y) + m.top;
    const jump = span(p, .15, .98);
    const t = inOut(jump);
    const lift = -Math.sin(Math.PI * jump) * Math.min(m.vh * .18, 150);
    const dx = (m.slotX - m.x) * t;
    const dy = (m.landY - naturalY) * t + lift;
    const crouch = .06 * span(p, .03, .15) * (p < .15 ? 1 : 0);
    const landing = .03 * Math.sin(Math.PI * span(p, .98, 1));
    mascot.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    mascot.style.scale = `1 ${(1 - crouch - landing).toFixed(4)}`;
    mascot.classList.toggle('is-jumping', p > .15 && p < .98);
    mascot.classList.toggle('is-landed', p >= .98);

    // The playground opens to let the guide through.
    const open = smooth(span(p, .2, .7)) * 15;
    openers.forEach(o => { o.style.translate = `${(+o.dataset.open * open).toFixed(2)}vw 0`; });
  }

  let pending = 0;
  const refresh = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(() => { measure(); update(); }); };

  intro();
  refresh();
  document.fonts?.ready.then(refresh);
  addEventListener('load', refresh, { once: true });
  addEventListener('resize', refresh);
  reduced.addEventListener('change', refresh);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(refresh);
    observer.observe(wrap);
    observer.observe(slot.closest('section'));
  }
  addEventListener('scroll', () => { if (!tick) tick = requestAnimationFrame(update); }, { passive: true });
})();
