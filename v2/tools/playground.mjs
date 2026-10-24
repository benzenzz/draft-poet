// POET v2 hero playground, isometric (after New materials/Board game track.png): platform, 16-tile serpentine path
// (G B Y C ×4 from start to end), cream curb, and objects built in the same projection. Prints the SVG and the
// bé Mầm anchor. Usage: node v2/tools/playground.mjs > out.txt, then paste the <svg> into v2/index.html and the
// "@@ mascot" --x/--y into the .mascot style.
const W = 560, CX = 790, CY = 300, A = Math.cos(Math.PI / 6), B = .5, BOARD_TH = 34, HS = W / 508; // HS: object heights scale with the board
const P = (u, v, h = 0) => [CX + (u - v) * W * A, CY + (u + v) * W * B - h * HS]; // u, v as fractions of W; h in px
const n = x => x.toFixed(1);
const pts = arr => arr.map(([u, v, h]) => P(u, v, h).map(n).join(',')).join(' ');
const poly = (cls, arr, extra = '') => `<polygon class="${cls}" points="${pts(arr)}"${extra}/>`;
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- Path centreline: five runs joined by four semicircular bends ----------
const R = .065, PW = .095, CURB = .014, GAP = .006;
const segs = [
  { t: 'L', a: [.24, .74], b: [.24, .30] },
  { t: 'A', c: [.305, .30], from: Math.PI, to: 2 * Math.PI },
  { t: 'L', a: [.37, .30], b: [.37, .70] },
  { t: 'A', c: [.435, .70], from: Math.PI, to: 0 },
  { t: 'L', a: [.50, .70], b: [.50, .30] },
  { t: 'A', c: [.565, .30], from: Math.PI, to: 2 * Math.PI },
  { t: 'L', a: [.63, .30], b: [.63, .70] },
  { t: 'A', c: [.695, .70], from: Math.PI, to: 0 },
  { t: 'L', a: [.76, .70], b: [.76, .26] },
];
const segLen = s => s.t === 'L' ? Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) : Math.abs(s.to - s.from) * R;
const TOTAL = segs.reduce((x, s) => x + segLen(s), 0);
function at(d) { // point and unit tangent at arc length d
  for (const s of segs) {
    const l = segLen(s);
    if (d <= l + 1e-9) {
      if (s.t === 'L') { const k = d / l; return { u: lerp(s.a[0], s.b[0], k), v: lerp(s.a[1], s.b[1], k), tu: (s.b[0] - s.a[0]) / l, tv: (s.b[1] - s.a[1]) / l }; }
      const dir = Math.sign(s.to - s.from), th = s.from + dir * d / R;
      return { u: s.c[0] + R * Math.cos(th), v: s.c[1] + R * Math.sin(th), tu: -Math.sin(th) * dir, tv: Math.cos(th) * dir };
    }
    d -= l;
  }
  const s = segs[segs.length - 1]; return { u: s.b[0], v: s.b[1], tu: 0, tv: -1 };
}
function ribbon(d0, d1, half) { // plane polygon covering arc length [d0, d1] at half-width `half`
  const L = [], Rr = [], steps = Math.max(4, Math.ceil((d1 - d0) / .004));
  for (let i = 0; i <= steps; i++) {
    const p = at(lerp(d0, d1, i / steps)), nu = -p.tv, nv = p.tu;
    L.push([p.u + nu * half, p.v + nv * half, 0]); Rr.push([p.u - nu * half, p.v - nv * half, 0]);
  }
  return [...L, ...Rr.reverse()];
}

// ---------- World ground: a wide grass island the board stands on (its top is at the board's base, GH) ----------
const GH = -BOARD_TH / HS, WORLD = [-1.05, 2.05], WORLD_TH = 40 / HS;
const [w0, w1] = WORLD;
const ground = `<g class="world-ground">` +
  poly('ground-left', [[w0, w1, GH], [w1, w1, GH], [w1, w1, GH - WORLD_TH], [w0, w1, GH - WORLD_TH]]) +
  poly('ground-right', [[w1, w0, GH], [w1, w1, GH], [w1, w1, GH - WORLD_TH], [w1, w0, GH - WORLD_TH]]) +
  poly('ground-top', [[w0, w0, GH], [w1, w0, GH], [w1, w1, GH], [w0, w1, GH]]) + `</g>\n`;

// ---------- Platform ----------
let svg = '';
svg += `<g class="platform">` +
  poly('board-left', [[0, 1, 0], [1, 1, 0], [1, 1, -BOARD_TH / HS], [0, 1, -BOARD_TH / HS]]) +
  poly('board-right', [[1, 0, 0], [1, 1, 0], [1, 1, -BOARD_TH / HS], [1, 0, -BOARD_TH / HS]]) +
  poly('board-top', [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]]) + `</g>\n`;

// ---------- Curb (cream trim, appears after the tiles) and the 16 tiles ----------
svg += `<g class="curb">${poly('curb-edge', ribbon(0, TOTAL, PW / 2 + CURB).map(([u, v]) => [u, v, -3]))}${poly('curb-top', ribbon(0, TOTAL, PW / 2 + CURB))}</g>\n`;
const ORDER = ['green', 'blue', 'yellow', 'coral'];
const tileMid = [];
for (let i = 0; i < 16; i++) {
  const d0 = i * TOTAL / 16 + GAP / 2, d1 = (i + 1) * TOTAL / 16 - GAP / 2, c = ORDER[i % 4];
  const top = ribbon(d0, d1, PW / 2), edge = top.map(([u, v]) => [u, v, -5]);
  const m = at((d0 + d1) / 2); tileMid.push(m);
  svg += `<g class="tile" data-i="${i}">${poly(`tile-edge t-${c}`, edge)}${poly(`tile-top t-${c}`, top)}</g>\n`;
}

// ---------- Object helpers (visible faces from the front corner: top, v = v1 face, u = u1 face) ----------
function box(cls, [u0, u1], [v0, v1], [h0, h1]) {
  return poly(cls + '-dd', [[u1, v0, h0], [u1, v1, h0], [u1, v1, h1], [u1, v0, h1]]) +
    poly(cls + '-d', [[u0, v1, h0], [u1, v1, h0], [u1, v1, h1], [u0, v1, h1]]) +
    poly(cls, [[u0, v0, h1], [u1, v0, h1], [u1, v1, h1], [u0, v1, h1]]);
}
const post = (cls, u, v, h0, h1, r = .007) => box(cls, [u - r, u + r], [v - r, v + r], [h0, h1]);
function contact(u, v, ru, rv) {
  const a = []; for (let i = 0; i < 24; i++) { const t = i / 24 * Math.PI * 2; a.push([u + ru * Math.cos(t), v + rv * Math.sin(t), 0]); }
  return poly('contact', a);
}
const sx = (u, v, h) => P(u, v, h).map(n).join('px ') + 'px'; // transform-origin in SVG user units
const objects = [];

// 1. Slide, left of the path's start: posts, platform, roof, ladder behind, chute toward the front.
{
  const u0 = .08, u1 = .16, v0 = .55, v1 = .63, PH = 88; let s = contact(.13, .71, .07, .14);
  const lv = v0 - .09;
  for (const lu of [u0 + .012, u1 - .012]) s += poly('o-green', [[lu - .004, v0, PH], [lu + .004, v0, PH], [lu + .004, lv, 0], [lu - .004, lv, 0]]);
  for (let i = 1; i < 5; i++) { const t = i / 5, h = lerp(PH, 0, t), v = lerp(v0, lv, t); s += poly('o-yellow', [[u0 + .012, v, h], [u1 - .012, v, h], [u1 - .012, v, h + 4], [u0 + .012, v, h + 4]]); }
  s += post('o-yellow', u0, v0, 0, PH + 46) + post('o-yellow', u1, v0, 0, PH + 46);
  s += box('o-green', [u0 - .004, u1 + .004], [v0 - .004, v1 + .004], [PH - 6, PH]);
  // Chute: a ribbon running +v from the platform's front edge down to the ground, with a raised outer lip.
  const C = []; for (let i = 0; i <= 16; i++) { const t = i / 16, e = t < .82 ? (1 - Math.cos(Math.PI * t / .82)) / 2 : 1; C.push([.12, lerp(v1, .87, t), lerp(PH, 4, e)]); }
  const cw = .022, lip = 8;
  s += poly('o-blue-dd', [...C.map(([u, v, h]) => [u + cw, v, h]), ...C.map(([u, v, h]) => [u + cw, v, h + lip]).reverse()]);
  s += poly('o-blue', [...C.map(([u, v, h]) => [u - cw, v, h]), ...C.map(([u, v, h]) => [u + cw, v, h]).reverse()]);
  s += post('o-yellow', u0, v1, 0, PH + 46) + post('o-yellow', u1, v1, 0, PH + 46);
  const rh = PH + 46, e = .012, apex = [(u0 + u1) / 2, (v0 + v1) / 2, rh + 30];
  const c = [[u0 - e, v0 - e, rh], [u1 + e, v0 - e, rh], [u1 + e, v1 + e, rh], [u0 - e, v1 + e, rh]];
  s += poly('o-coral-dd', [c[1], c[2], apex]) + poly('o-coral-d', [c[3], c[2], apex]);
  objects.push({ k: .12 + .71, name: 'slide', s, origin: sx(.12, .71, 0) });
}

// 2. Swing, behind the first bend: A-frame legs, a beam along u, one seat on two ropes.
let swingSeatOrigin = '';
{
  const ua = .22, ub = .42, v = .12, H = 120; let s = contact(.32, .12, .11, .04);
  for (const u of [ua, ub]) {
    s += poly('o-green-d', [[u - .003, v - .05, 0], [u + .003, v - .05, 0], [u + .003, v, H], [u - .003, v, H]]);
  }
  s += box('o-coral', [ua - .01, ub + .01], [v - .006, v + .006], [H - 6, H]);
  let seat = '';
  for (const u of [.30, .34]) seat += poly('o-ink', [[u - .0015, v, H - 6], [u + .0015, v, H - 6], [u + .0015, v, 26], [u - .0015, v, 26]]);
  seat += box('o-yellow', [.293, .347], [v - .018, v + .018], [20, 26]);
  for (const u of [ua, ub]) s += poly('o-green', [[u - .003, v + .05, 0], [u + .003, v + .05, 0], [u + .003, v, H], [u - .003, v, H]]);
  swingSeatOrigin = sx(.32, v, H - 6);
  objects.push({ k: .32 + .12, name: 'swing', s: s + `<g class="swing-seat" style="transform-origin: ${swingSeatOrigin}">${seat}</g>`, origin: sx(.32, .12, 0) });
}

// 3. Seesaw, right of the path, beside the third bend: yellow pivot, blue plank along v, coral handles.
let plankOrigin = '';
{
  const u = .9, vc = .56, ph = 30, L = .13, tilt = 22; let s = contact(u, vc, .04, .14);
  s += poly('o-yellow-d', [[u - .02, vc, 0], [u + .02, vc, 0], [u, vc, ph]]);
  s += poly('o-yellow', [[u + .02, vc - .02, 0], [u + .02, vc + .02, 0], [u, vc, ph]]);
  const lo = [u, vc - L, ph - tilt], hi = [u, vc + L, ph + tilt], w = .018;
  let plank = poly('o-blue-dd', [[u + w, lo[1], lo[2]], [u + w, hi[1], hi[2]], [u + w, hi[1], hi[2] - 5], [u + w, lo[1], lo[2] - 5]]) +
    poly('o-blue', [[u - w, lo[1], lo[2]], [u + w, lo[1], lo[2]], [u + w, hi[1], hi[2]], [u - w, hi[1], hi[2]]]);
  for (const [p, k] of [[lo, 1], [hi, -1]]) {
    const hv = p[1] + k * .03, hh = p[2] + k * .03 / L * tilt;
    plank += poly('o-coral-d', [[u - .002, hv, hh], [u + .002, hv, hh], [u + .002, hv, hh + 16], [u - .002, hv, hh + 16]]);
    plank += poly('o-coral', [[u - .016, hv, hh + 16], [u + .016, hv, hh + 16], [u + .016, hv, hh + 19], [u - .016, hv, hh + 19]]);
  }
  plankOrigin = sx(u, vc, ph);
  objects.push({ k: u + vc, name: 'seesaw', s: s + `<g class="seesaw-plank" style="transform-origin: ${plankOrigin}">${plank}</g>`, origin: sx(u, vc, 0) });
}

// 4. Wheelbarrow, front right near the path's end: side-on along v, wheel at the front.
{
  const u0 = .86, u1 = .93, v0 = .17, v1 = .27, yb = 22, yt = 44; let s = contact(.895, .24, .05, .07);
  s += poly('o-blue-d', [[u0 + .006, v0, yt - 4], [u0 + .006, v0 - .06, yt + 6], [u0 + .006, v0 - .06, yt + 3], [u0 + .006, v0, yt - 7]]);
  s += poly('o-blue-d', [[u0 + .01, v0 + .01, 0], [u0 + .014, v0 + .01, 0], [u0 + .014, v0 + .01, yb], [u0 + .01, v0 + .01, yb]]);
  s += poly('o-coral-dd', [[u0, v0, yt], [u1, v0, yt], [u1, v1, yt], [u0, v1, yt]]);
  s += poly('o-soil', [[u0 + .006, v0 + .006, yt - 3], [u1 - .006, v0 + .006, yt - 3], [u1 - .006, v1 - .006, yt - 3], [u0 + .006, v1 - .006, yt - 3]]);
  const wc = [u1 - .01, v1 + .012, 15], ring = (r, cls) => { const p = []; for (let i = 0; i < 24; i++) { const t = i / 24 * Math.PI * 2; p.push([wc[0], wc[1] + r / W * Math.cos(t) * 1, wc[2] + r * Math.sin(t)]); } return poly(cls, p); };
  s += ring(15, 'o-green') + ring(6, 'o-yellow');
  s += poly('o-coral-d', [[u0, v1, yt], [u1, v1, yt], [u1 - .008, v1 - .02, yb], [u0 + .008, v1 - .02, yb]]);
  s += poly('o-coral', [[u1, v0, yt], [u1, v1, yt], [u1 - .008, v1 - .02, yb], [u1 - .008, v0 + .01, yb]]);
  s += poly('o-blue', [[u1 - .006, v0, yt - 4], [u1 - .006, v0 - .06, yt + 6], [u1 - .006, v0 - .06, yt + 3], [u1 - .006, v0, yt - 7]]);
  s += poly('o-blue', [[u1 - .012, v0 + .01, 0], [u1 - .008, v0 + .01, 0], [u1 - .008, v0 + .01, yb], [u1 - .012, v0 + .01, yb]]);
  objects.push({ k: .895 + .24, name: 'wheelbarrow', s, origin: sx(.895, .24, 0) });
}

// 5. Sandals, front left near the path's start: flat soles with a blue strap.
for (const [name, su, sv, rot] of [['sandal-a', .29, .9, -.5], ['sandal-b', .345, .925, .1]]) {
  const sole = [];
  for (let i = 0; i < 24; i++) { const t = i / 24 * Math.PI * 2, a = .012 * Math.cos(t) * (Math.sin(t) > 0 ? 1.15 : .9), b = .03 * Math.sin(t); sole.push([su + a * Math.cos(rot) - b * Math.sin(rot), sv + a * Math.sin(rot) + b * Math.cos(rot), 1]); }
  const tip = [su - .01 * Math.sin(rot), sv + .01 * Math.cos(rot), 2];
  let s = poly('o-yellow', sole);
  for (const k of [-1, 1]) s += poly('o-blue', [tip, [su + k * .011 * Math.cos(rot) + .004 * Math.sin(rot), sv + k * .011 * Math.sin(rot) - .004 * Math.cos(rot), 2], [su + k * .011 * Math.cos(rot) + .004 * Math.sin(rot), sv + k * .011 * Math.sin(rot) - .004 * Math.cos(rot) + .004, 3]]);
  objects.push({ k: su + sv, name, s, origin: sx(su, sv, 0) });
}

// ---------- Daisies (Bé Cúc) playing on the board: upright figures grounded on a contact mark ----------
function figure(name, file, iw, ih, u, v, h, base = 0) { // h: on-screen height in px
  const [x, y] = P(u, v, base), w = h * iw / ih;
  const mark = poly('contact', Array.from({ length: 24 }, (_, i) => { const t = i / 24 * Math.PI * 2; return [u + .028 * Math.cos(t), v + .012 * Math.sin(t), base]; }));
  return { k: u + v, name, origin: sx(u, v, base),
    s: mark + `<image href="../assets/mascot/be-cuc/${file}" x="${n(x - w / 2)}" y="${n(y - h)}" width="${n(w)}" height="${n(h)}"/>` };
}
const daisies = [
  figure('daisy-vui-tuoi', 'vui-tuoi.webp', 180, 200, .16, .2, 60),   // by the swing, waiting a turn
  figure('daisy-du-lich', 'du-lich.webp', 239, 200, .24, .64, 58),    // walking the path near its start
  figure('daisy-song-gio', 'song-gio.webp', 147, 200, .91, .38, 60),   // at the seesaw's far end, windblown
];
objects.push(...daisies);

// Back-to-front by u + v. Each object is a group the intro can lift from its ground point.
objects.sort((a, b) => a.k - b.k);
const opens = { slide: 0, swing: -.3, 'sandal-a': -1, 'sandal-b': -1, seesaw: 1, wheelbarrow: 1 };
for (const o of objects) svg += `<g class="obj" data-obj="${o.name}" data-open="${opens[o.name] ?? 0}" style="transform-origin: ${o.origin}">${o.s}</g>\n`;

// ---------- Surrounding world (on the ground plane, GH): schools, trees, booths, signs ----------
// `ring` orders the later secondary build outward from the playground.
const world = []; // { k, layer: 'back' | 'front', name, ring, s, origin }
const add = (layer, name, ring, u, v, s) => world.push({ k: u + v, layer, name, ring, s, origin: sx(u, v, GH) });
const gpoly = (cls, arr) => poly(cls, arr.map(([u, v, h]) => [u, v, GH + h]));
const gbox = (cls, us, vs, [h0, h1]) => box(cls, us, vs, [GH + h0, GH + h1]);
const gcontact = (u, v, ru, rv) => poly('contact', Array.from({ length: 24 }, (_, i) => { const t = i / 24 * Math.PI * 2; return [u + ru * Math.cos(t), v + rv * Math.sin(t), GH]; }));
// Lettering painted onto a face in the u–h plane at v = vf: the image's rectangle maps exactly onto the parallelogram.
function paint(href, iw, ih, ua, ub, vf, htop) {
  const hbot = htop - (ub - ua) * W / HS * ih / iw;
  const [ox, oy] = P(ua, vf, GH + htop), [ux, uy] = P(ub, vf, GH + htop), [hx, hy] = P(ua, vf, GH + hbot);
  return { hbot, s: `<image href="${href}" width="${iw}" height="${ih}" transform="matrix(${[(ux - ox) / iw, (uy - oy) / iw, (hx - ox) / ih, (hy - oy) / ih, ox, oy].map(x => x.toFixed(4)).join(' ')})"/>` };
}

function tree(layer, name, ring, u, v, size = 1) {
  const r = 26 * size, th = 22 * size;
  let s = gcontact(u, v, .035 * size, .02 * size) + gbox('w-trunk', [u - .006, u + .006], [v - .006, v + .006], [0, th]);
  const [cx, cy] = P(u, v, GH + th + r * .8);
  s += `<circle class="w-leaf" cx="${n(cx)}" cy="${n(cy)}" r="${n(r * HS)}"/>` +
    `<path class="w-leaf-d" d="M${n(cx - r * HS)} ${n(cy)} a${n(r * HS)} ${n(r * HS)} 0 0 0 ${n(2 * r * HS)} 0 a${n(r * HS)} ${n(r * .55 * HS)} 0 0 1 ${n(-2 * r * HS)} 0Z"/>`;
  add(layer, name, ring, u, v, s);
}

function school(name, ring, u0, u1, v0, v1, roof, flag = false) {
  const H = 58, RH = 26, o = .02, vm = (v0 + v1) / 2;
  let s = gcontact((u0 + u1) / 2, (v0 + v1) / 2, (u1 - u0) * .62, (v1 - v0) * .62);
  s += gbox('w-wall', [u0, u1], [v0, v1], [0, H]);
  s += gpoly('w-band', [[u0, v1, H - 12], [u1, v1, H - 12], [u1, v1, H - 6], [u0, v1, H - 6]]);
  const nWin = 4, span = (u1 - u0) / (nWin + 1);
  for (let i = 1; i <= nWin; i++) { const uc = u0 + span * i, half = span * .28;
    if (i === 2) s += gpoly('w-door', [[uc - half, v1, 0], [uc + half, v1, 0], [uc + half, v1, 26], [uc - half, v1, 26]]);
    else s += gpoly('w-window', [[uc - half, v1, 20], [uc + half, v1, 20], [uc + half, v1, 38], [uc - half, v1, 38]]); }
  s += gpoly('w-window', [[u1, v0 + .04, 20], [u1, v1 - .04, 20], [u1, v1 - .04, 38], [u1, v0 + .04, 38]]);
  // Gable roof, ridge along u: the front plane and the right gable end are visible.
  s += gpoly(`w-roof-${roof}`, [[u0 - o, v1 + o, H], [u1 + o, v1 + o, H], [u1 + o, vm, H + RH], [u0 - o, vm, H + RH]]);
  s += gpoly('w-wall-dd', [[u1, v0, H], [u1, v1, H], [u1, vm, H + RH]]);
  s += gpoly(`w-roof-${roof}-d`, [[u1 + o, v1 + o, H], [u1 + o, vm, H + RH], [u1 + o, vm, H + RH - 4], [u1 + o, v1 + o, H - 4]]);
  if (flag) { const fu = u0 + .03, fv = vm;
    s += gpoly('o-ink', [[fu - .002, fv, H + RH - 6], [fu + .002, fv, H + RH - 6], [fu + .002, fv, H + RH + 34], [fu - .002, fv, H + RH + 34]]);
    s += gpoly('o-coral', [[fu, fv, H + RH + 34], [fu + .06, fv, H + RH + 28], [fu, fv, H + RH + 22]]); }
  add('back', name, ring, (u0 + u1) / 2, (v0 + v1) / 2, s);
}

function booth(name, ring, u, v, stripe, extra = '') {
  const d = .055, u0 = u - d, u1 = u + d, v0 = v - d, v1 = v + d;
  let s = gcontact(u, v, .08, .07);
  for (const [pu, pv] of [[u0, v0], [u1, v0]]) s += gbox('w-post', [pu - .004, pu + .004], [pv - .004, pv + .004], [0, 62]);
  s += gbox('w-counter', [u0, u1], [v0, v1], [0, 24]);
  s += gpoly(`w-stripe-${stripe}`, [[u0, v1, 24], [u1, v1, 24], [u1, v1, 30], [u0, v1, 30]]);
  for (const [pu, pv] of [[u0, v1], [u1, v1]]) s += gbox('w-post', [pu - .004, pu + .004], [pv - .004, pv + .004], [24, 56]);
  // Striped awning sloping toward the front, with a front valance.
  const N = 6;
  for (let i = 0; i < N; i++) { const a = lerp(u0 - .01, u1 + .01, i / N), b = lerp(u0 - .01, u1 + .01, (i + 1) / N), cls = i % 2 ? 'w-cream' : `w-stripe-${stripe}`;
    s += gpoly(cls, [[a, v0 - .01, 66], [b, v0 - .01, 66], [b, v1 + .02, 54], [a, v1 + .02, 54]]);
    s += gpoly(cls + '-d', [[a, v1 + .02, 54], [b, v1 + .02, 54], [b, v1 + .02, 46], [a, v1 + .02, 46]]); }
  s += gpoly(`w-stripe-${stripe}-dd`, [[u1 + .01, v0 - .01, 66], [u1 + .01, v1 + .02, 54], [u1 + .01, v1 + .02, 46], [u1 + .01, v0 - .01, 58]]);
  add('front', name, ring, u, v, s + extra);
}

// Signs (lettering from the staged typo assets, painted onto their faces).
function pylon(name, ring, u0, u1, v0, v1) { // "Công Viên Niềm Vui": a tall totem
  const cv = paint('../assets/season-6/lettering/cong-vien-niem-vui.webp', 214, 360, u0 + .012, u1 - .012, v1 + .001, 142);
  const top = 150;
  let s = gcontact((u0 + u1) / 2, (v0 + v1) / 2, .05, .03);
  s += gbox('w-base', [u0 - .012, u1 + .012], [v0 - .012, v1 + .012], [0, 8]);
  s += gbox('w-sign', [u0, u1], [v0, v1], [8, top]);
  s += cv.s;
  s += gbox('o-coral', [u0 - .008, u1 + .008], [v0 - .008, v1 + .008], [top, top + 8]);
  add('front', name, ring, (u0 + u1) / 2, (v0 + v1) / 2, s);
}
function billboard(name, ring, u0, u1, v) { // "Big Joy Little Joy": a wide board on two posts
  const top = 168, bj = paint('../assets/season-6/lettering/big-joy-little-joy.webp', 520, 233, u0 + .02, u1 - .02, v + .006, top - 10);
  const bottom = bj.hbot - 10;
  let s = gcontact((u0 + u1) / 2, v, (u1 - u0) * .5, .03);
  for (const pu of [u0 + .05, u1 - .05]) s += gbox('w-post', [pu - .006, pu + .006], [v - .006, v + .006], [0, bottom]);
  s += gbox('w-frame', [u0, u1], [v - .004, v + .004], [bottom, top]);
  s += gpoly('w-sign', [[u0 + .008, v + .005, bottom + 4], [u1 - .008, v + .005, bottom + 4], [u1 - .008, v + .005, top - 4], [u0 + .008, v + .005, top - 4]]);
  s += bj.s;
  add('back', name, ring, (u0 + u1) / 2, v, s);
}
function arch(u0, u1, v) { // "Dân chơi" banner on two pillars, in front of a booth
  const dc = paint('../assets/season-6/lettering/dan-choi-young-joy.webp', 460, 228, u0 + .016, u1 - .016, v + .006, 104);
  const bottom = dc.hbot - 6;
  let s = '';
  for (const pu of [u0, u1]) s += gbox('o-green', [pu - .007, pu + .007], [v - .007, v + .007], [0, 110]);
  s += gbox('w-frame', [u0 - .006, u1 + .006], [v - .004, v + .004], [bottom, 112]);
  s += gpoly('w-sign', [[u0 + .006, v + .005, bottom + 3], [u1 - .006, v + .005, bottom + 3], [u1 - .006, v + .005, 109], [u0 + .006, v + .005, 109]]);
  return s + dc.s;
}

// Back (behind the board's top edges): schools, trees between them, the billboard.
tree('back', 'tree-back-1', 3, -.55, -.12, .95);
school('school-a', 3, -.38, -.06, -.3, -.08, 'coral', true);
tree('back', 'tree-back-2', 3, -.12, -.45, 1.05);
school('school-b', 3, .1, .42, -.52, -.3, 'green');
tree('back', 'tree-back-3', 3, .55, -.5, .9);
billboard('sign-big-joy', 4, .68, 1.02, -.3);
tree('back', 'tree-back-4', 2, 1.06, -.12, .85);
// Right (beyond the board's right edge): three pop-up booths, a tree between them, the "Dân chơi" arch on the third.
booth('booth-1', 2, 1.18, .02, 'coral', '');
tree('front', 'tree-right-1', 2, 1.4, .2, .8);
booth('booth-2', 2, 1.2, .32, 'blue', '');
booth('booth-3', 2, 1.22, .64, 'yellow', arch(1.14, 1.3, .64 + .1));
world.push({ ...figure('daisy-enjoy', 'enjoy.webp', 183, 200, 1.17, .14, 58, GH), layer: 'front', ring: 2 }); // sipping at booth 1
// Front left: the park-name pylon at the entrance, trees around it, a bush at the front.
tree('front', 'tree-front-1', 2, .0, 1.16, .9);
pylon('sign-cong-vien', 2, .2, .31, 1.21, 1.25);
tree('front', 'tree-front-2', 2, .56, 1.34, .8);
tree('front', 'bush-front', 2, .8, 1.32, .5);

const worldSvg = layer => world.filter(o => o.layer === layer).sort((a, b) => a.k - b.k)
  .map(o => `<g class="world-obj" data-obj="${o.name}" data-ring="${o.ring}" style="transform-origin: ${o.origin}">${o.s}</g>\n`).join('');
svg = ground + worldSvg('back') + svg + worldSvg('front');

// ---------- bé Mầm: on the tile closest to the viewer (largest u + v on the centreline) ----------
let best = 0, bestD = 0;
for (let d = 0; d <= TOTAL; d += .002) { const p = at(d); if (p.u + p.v > best) { best = p.u + p.v; bestD = d; } }
const mp = at(bestD), tileIndex = Math.floor(bestD / (TOTAL / 16));
const [mx, my] = P(mp.u, mp.v, 0);
const out = `<svg class="playground" viewBox="0 0 1440 900" aria-hidden="true">\n<defs><filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="6"/><feDisplacementMap in="SourceGraphic" scale="2"/></filter></defs>\n${svg}</svg>`;
console.log(out);
console.log(`\n@@ mascot --x: ${n(mx / 14.4)}%; --y: ${n(my / 9)}%  (screen ${n(mx)}, ${n(my)}) on tile ${tileIndex + 1} (${ORDER[tileIndex % 4]})`);
console.log(`@@ board: left ${n(P(0, 1)[0])},${n(P(0, 1)[1])} top ${n(P(0, 0)[0])},${n(P(0, 0)[1])} right ${n(P(1, 0)[0])},${n(P(1, 0)[1])} bottom ${n(P(1, 1)[0])},${n(P(1, 1)[1] + BOARD_TH)}`);
