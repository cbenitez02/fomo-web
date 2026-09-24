// @ts-nocheck
const SILVER = 'linear-gradient(115deg,#6e7277 0%,#f5f6f7 22%,#a4a8ad 40%,#ffffff 52%,#8b8f94 68%,#e4e5e7 84%,#72767b 100%)';
const SIDE = 'linear-gradient(180deg,#ffffff 0%,#b9bcc0 38%,#4f5358 60%,#d8dadc 100%)';
const RING = 'radial-gradient(closest-side, transparent 54%, #000 59%, #000 93%, transparent 100%)';

function linkEl(kind, L) {
  const e = document.createElement('div'); const s = e.style;
  s.position = 'absolute'; s.left = '0'; s.top = '0'; s.willChange = 'transform'; s.pointerEvents = 'none';
  let w, h;
  if (kind === 'face') { w = L * 1.62; h = L * 1.02; s.background = SILVER; s.webkitMaskImage = RING; s.maskImage = RING; }
  else { w = L * 1.55; h = Math.max(4, L * 0.32); s.background = SIDE; s.borderRadius = '99px'; s.zIndex = '1'; }
  s.width = w + 'px'; s.height = h + 'px'; e._w = w; e._h = h; return e;
}
let SID = 0;
const STARS = [{ n: 5, r: .42 }, { n: 4, r: .24 }, { n: 6, r: .5 }, { n: 8, r: .36, alt: .62 }];
function starSVG(v) {
  const S = STARS[v % STARS.length], id = 'st' + (SID++), pts = S.n * 2, R0 = 40;
  const P = []; for (let i = 0; i < pts; i++) {
    const a = -Math.PI / 2 + i * Math.PI / S.n;
    let rr = i % 2 === 0 ? R0 : R0 * S.r; if (S.alt && i % 4 === 2) rr = R0 * S.alt;
    P.push([rr * Math.cos(a), rr * Math.sin(a)]);
  }
  let facets = '';
  for (let i = 0; i < pts; i++) {
    const a = P[i], b = P[(i + 1) % pts];
    const mid = Math.atan2((a[1] + b[1]) / 2, (a[0] + b[0]) / 2);
    const light = 0.5 + 0.5 * Math.cos(mid - (-2.3));
    const g = Math.round(70 + light * 185);
    facets += `<path d="M0,0 L${a[0].toFixed(2)},${a[1].toFixed(2)} L${b[0].toFixed(2)},${b[1].toFixed(2)}Z" fill="rgb(${g},${g + 2},${g + 5})"/>`;
  }
  const outline = 'M' + P.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' L') + 'Z';
  return `<svg viewBox="-46 -58 92 104" width="100%" height="100%" style="overflow:visible;display:block"><defs>
<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient>
<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6e7277"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#55595e"/></linearGradient></defs>
<ellipse cx="0" cy="-49" rx="5" ry="7" fill="none" stroke="url(#${id}b)" stroke-width="2.6"/>
<g transform="translate(0,${S.n === 4 ? 2 : 4})">${facets}<path d="${outline}" fill="url(#${id}s)" stroke="#4a4e53" stroke-width=".8" stroke-linejoin="round"/>
<circle cx="-${R0 * .22}" cy="-${R0 * .3}" r="1.8" fill="#fff"/></g></svg>`;
}
function pendantEl(type, L, v) {
  const e = document.createElement('div'); const s = e.style;
  s.position = 'absolute'; s.left = '0'; s.top = '0'; s.transformOrigin = '50% 0'; s.willChange = 'transform';
  s.display = 'flex'; s.alignItems = 'center'; s.justifyContent = 'center'; s.color = '#0b0b0c'; s.zIndex = '2';
  let w, h;
  if (type === 'star') { const sz = [3.9, 3.4, 3.6, 4.2][(v || 0) % 4]; w = L * sz; h = L * sz * 1.13; s.filter = 'drop-shadow(0 6px 8px rgba(0,0,0,.35))'; e.innerHTML = starSVG(v || 0); }
  else if (type === 'ring') { w = h = L * 3.6; const m = 'radial-gradient(closest-side, transparent 64%, #000 68%, #000 94%, transparent 100%)'; s.background = SILVER; s.webkitMaskImage = m; s.maskImage = m; }
  else if (type === 'plaque') { w = L * 2.1; h = L * 5; s.background = SILVER; s.border = '1px solid #55595e'; s.writingMode = 'vertical-rl'; s.fontFamily = "'Archivo',sans-serif"; s.fontWeight = '900'; s.fontStretch = '125%'; s.fontSize = (L * 0.95) + 'px'; s.letterSpacing = '.02em'; e.textContent = 'FOMO'; }
  else if (type === 'disc') { w = h = L * 3; s.background = SILVER; s.borderRadius = '50%'; s.fontFamily = "'Space Mono',monospace"; s.fontWeight = '400'; s.fontSize = (L * 2.2) + 'px'; e.textContent = 'f'; }
  else { w = h = L * 3.2; const d = document.createElement('div'); d.style.cssText = `width:${L * 2.1}px;height:${L * 2.1}px;background:${SILVER};transform:rotate(45deg);border:1px solid #55595e`; e.appendChild(d); }
  s.width = w + 'px'; s.height = h + 'px'; e._w = w; e._h = h; return e;
}

class Rope {
  constructor(host, o) {
    this.host = host; this.L = o.L; this.pinB = !!o.b; this.maxY = o.maxY; this.dir = o.dir || 1; this.phase = Math.random() * 6;
    const n = o.n; this.pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n; let x, y;
      if (o.b) { x = o.a.x + (o.b.x - o.a.x) * t; y = o.a.y + (o.b.y - o.a.y) * t; }
      else { x = o.a.x; y = o.a.y + i * o.L; }
      const kick = o.b ? 0 : (o.kick || 0) * i;
      this.pts.push({ x, y, px: x - kick, py: y, pin: i === 0 || (o.b && i === n) });
    }
    this.links = [];
    for (let i = 0; i < n; i++) { const el = linkEl(i % 2 === 0 ? 'face' : 'side', o.L); host.appendChild(el); this.links.push(el); }
    if (o.pendant) { this.pend = pendantEl(o.pendant, o.L, o.pv); host.appendChild(this.pend); }
  }
  step(f) {
    const P = this.pts, L = this.L, n = P.length, R = 80;
    for (let i = 0; i < n; i++) {
      const p = P[i]; if (p.pin) continue;
      const vx = (p.x - p.px) * 0.975, vy = (p.y - p.py) * 0.975;
      p.px = p.x; p.py = p.y; p.x += vx + f.fx; p.y += vy + f.g + f.fy;
      if (f.m) { const dx = p.x - f.m.x, dy = p.y - f.m.y, d2 = dx * dx + dy * dy; if (d2 < R * R) { const fall = 1 - Math.sqrt(d2) / R; p.x += f.m.vx * 0.45 * fall; p.y += f.m.vy * 0.45 * fall; } }
    }
    for (let it = 0; it < 12; it++) {
      if (this.maxY) for (let i = 0; i < n; i++) { const p = P[i]; if (p.y > this.maxY) p.y = this.maxY; if (p.y < 10) p.y = 10; }
      for (let i = 0; i < n - 1; i++) {
        const a = P[i], b = P[i + 1]; const dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 0.001; const df = (d - L) / d;
        if (a.pin && b.pin) continue;
        if (a.pin) { b.x -= dx * df; b.y -= dy * df; }
        else if (b.pin) { a.x += dx * df; a.y += dy * df; }
        else { a.x += dx * df * 0.5; a.y += dy * df * 0.5; b.x -= dx * df * 0.5; b.y -= dy * df * 0.5; }
      }
    }
  }
  render() {
    const P = this.pts;
    for (let i = 0; i < this.links.length; i++) {
      const a = P[i], b = P[i + 1], el = this.links[i];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      el.style.transform = `translate(${(a.x + b.x) / 2 - el._w / 2}px,${(a.y + b.y) / 2 - el._h / 2}px) rotate(${ang}rad)`;
    }
    if (this.pend) {
      const l = P[P.length - 1], p = P[P.length - 2]; const ang = Math.atan2(l.y - p.y, l.x - p.x) - Math.PI / 2;
      this.pend.style.transform = `translate(${l.x - this.pend._w / 2}px,${l.y - 2}px) rotate(${ang}rad)`;
    }
  }
}

let RID = 0;
const ELL = (cy, rx, ry) => `M${-rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;
function ringEl(D, i) {
  const id = 'rg' + (RID++), kinds = ['band', 'word', 'thin', 'band', 'word', 'thin', 'band'], kind = kinds[i % 7];
  const e = document.createElement('div'); const s = e.style;
  s.position = 'absolute'; s.left = '0'; s.top = '0'; s.willChange = 'transform'; s.pointerEvents = 'none';
  s.width = s.height = D + 'px'; e._w = e._h = D; s.filter = 'drop-shadow(0 10px 10px rgba(0,0,0,.28))';
  if (kind === 'word') {
    e.innerHTML = `<svg viewBox="-60 -60 120 120" width="100%" height="100%" style="overflow:visible"><defs>
<linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3f4247"/><stop offset=".25" stop-color="#c9ccd0"/><stop offset=".45" stop-color="#6e7277"/><stop offset=".6" stop-color="#e6e7e9"/><stop offset=".8" stop-color="#7d8186"/><stop offset="1" stop-color="#34373b"/></linearGradient>
<path id="${id}p" d="M0,-36 a36,36 0 1,1 -0.01,0"/></defs>
<g data-r="w"><g data-r="side" transform="translate(0,3)"><text fill="#1d1e21" stroke="#1d1e21" stroke-width="1.4" style="font-family:'Archivo',sans-serif;font-weight:900;font-stretch:125%;font-size:25px;letter-spacing:1px"><textPath href="#${id}p" textLength="224" lengthAdjust="spacingAndGlyphs">FOMO <tspan fill="#7a0000" stroke="#7a0000">✦</tspan> FOMO <tspan fill="#7a0000" stroke="#7a0000">✦</tspan> </textPath></text></g>
<g data-r="rot"><text fill="url(#${id}t)" stroke="#1d1e21" stroke-width="1.5" paint-order="stroke" stroke-linejoin="round" style="font-family:'Archivo',sans-serif;font-weight:900;font-stretch:125%;font-size:25px;letter-spacing:1px"><textPath href="#${id}p" textLength="224" lengthAdjust="spacingAndGlyphs">FOMO <tspan fill="#D40000" stroke="#8a0000">✦</tspan> FOMO <tspan fill="#D40000" stroke="#8a0000">✦</tspan> </textPath></text></g></g></svg>`;
    e._word = { w: e.querySelector('[data-r="w"]'), rot: e.querySelector('[data-r="rot"]'), side: e.querySelector('[data-r="side"]') };
    return e;
  }
  e.innerHTML = `<svg viewBox="-60 -60 120 120" width="100%" height="100%" style="overflow:visible"><defs>
<linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d6166"/><stop offset=".18" stop-color="#e9eaec"/><stop offset=".32" stop-color="#8e9297"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".64" stop-color="#9da1a6"/><stop offset=".82" stop-color="#f1f2f3"/><stop offset="1" stop-color="#55595e"/></linearGradient>
<linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f8f9"/><stop offset=".35" stop-color="#9ea2a7"/><stop offset=".55" stop-color="#3f4247"/><stop offset=".8" stop-color="#b9bcc0"/><stop offset="1" stop-color="#6b6f74"/></linearGradient>
<linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2c30"/><stop offset=".6" stop-color="#8b8f94"/><stop offset="1" stop-color="#e8e9eb"/></linearGradient>
<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#d7dde3"/><stop offset=".55" stop-color="#8f99a3"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
<mask id="${id}m" maskUnits="userSpaceOnUse" x="-80" y="-80" width="160" height="160"><rect x="-80" y="-80" width="160" height="160" fill="#fff"/><path data-r="hole" fill="#000"/></mask>
<mask id="${id}c" maskUnits="userSpaceOnUse" x="-80" y="-80" width="160" height="160"><path data-r="holeW" fill="#fff"/><path data-r="holeB" fill="#000"/></mask>
</defs>
<g mask="url(#${id}m)"><path data-r="side" fill="url(#${id}s)"/><path data-r="face" fill="url(#${id}f)" fill-rule="evenodd"/></g>
<rect x="-60" y="-60" width="120" height="120" fill="url(#${id}w)" mask="url(#${id}c)"/>
<path data-r="hl" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>
${kind === 'gem' ? '<g data-r="gem"><path d="M-9,-4 L-5,-9 L5,-9 L9,-4 L0,8Z" fill="url(#' + id + 'g)" stroke="#6b7580" stroke-width=".6"/><path d="M-9,-4 L9,-4 M-5,-9 L-2,-4 L0,8 M5,-9 L2,-4 L0,8" fill="none" stroke="#7d8791" stroke-width=".5"/><path d="M-4,-3 L3,-7" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/><path d="M-7,-2 L-3,5 L3,5 L7,-2" fill="none" stroke="#9aa1a8" stroke-width="2.2"/></g>' : ''}
</svg>`;
  const q = n => e.querySelector('[data-r="' + n + '"]');
  e._p = { hole: q('hole'), holeW: q('holeW'), holeB: q('holeB'), side: q('side'), face: q('face'), hl: q('hl'), gem: q('gem'), fg: e.querySelector('#' + id + 'f') };
  e._geo = kind === 'thin' ? { R: 42, T: 4, W: 6 } : kind === 'gem' ? { R: 40, T: 5, W: 7 } : { R: 44, T: 8, W: 14 };
  return e;
}
function drawRing(el, spin) {
  if (el._word) {
    const t = 0.3 + 0.7 * Math.abs(Math.cos(spin)), dy = 7 * Math.sqrt(1 - t * t), rot = (spin * 40) % 360;
    el._word.w.setAttribute('transform', `scale(1,${t.toFixed(3)})`);
    el._word.rot.setAttribute('transform', `rotate(${rot})`);
    el._word.side.setAttribute('transform', `translate(0,${(dy / t).toFixed(2)}) rotate(${rot})`);
    return;
  }
  const { R, T, W } = el._geo, P = el._p, r = R - T;
  const t = 0.22 + 0.78 * Math.abs(Math.cos(spin)), dy = W * Math.sqrt(1 - t * t) * (Math.cos(spin * 0.5) > 0 ? 1 : 1);
  const cy = -dy / 2, Rt = R * t, rt = r * t;
  P.side.setAttribute('d', `M${-R},${cy} A${R},${Rt} 0 0 1 ${R},${cy} L${R},${cy + dy} A${R},${Rt} 0 0 1 ${-R},${cy + dy}Z`);
  P.face.setAttribute('d', ELL(cy, R, Rt) + ELL(cy, r, rt));
  P.hole.setAttribute('d', ELL(cy, r, rt));
  P.holeW.setAttribute('d', ELL(cy, r, rt));
  P.holeB.setAttribute('d', ELL(cy + dy, r, rt));
  const hr = R - T / 2, hy = cy, a0 = -2.5, a1 = -1.2;
  P.hl.setAttribute('d', `M${hr * Math.cos(a0)},${hy + hr * t * Math.sin(a0)} A${hr},${hr * t} 0 0 1 ${hr * Math.cos(a1)},${hy + hr * t * Math.sin(a1)}`);
  P.fg.setAttribute('gradientTransform', `rotate(${(spin * 57) % 360} .5 .5)`);
  if (P.gem) P.gem.setAttribute('transform', `translate(0,${cy - Rt - 4})`);
}
class Orbit {
  constructor(host, L, tilt, dir) {
    if (host.dataset.kind === 'rings') return this.initRings(host, L, tilt, dir);
    this.host = host; this.theta = 0; this.dir = dir; this.tilt = tilt * Math.PI / 180;
    const w = host.clientWidth, h = host.clientHeight;
    this.cx = w / 2; this.cy = h / 2; this.rx = w * 0.5 + L; this.ry = h * 0.56;
    const rx = this.rx, ry = this.ry;
    const per = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    let n = Math.round(per / (L * 1.02)); if (n % 2) n++;
    this.links = [];
    for (let i = 0; i < n; i++) { const el = linkEl(i % 2 === 0 ? 'face' : 'side', L); host.appendChild(el); this.links.push(el); }
    this.update(0);
  }
  initRings(host, L, tilt, dir) {
    this.host = host; this.theta = 0; this.dir = dir; this.tilt = tilt * Math.PI / 180; this.rings = true;
    const w = host.clientWidth, h = host.clientHeight;
    this.cx = w / 2; this.cy = h / 2; this.rx = w * 0.5; this.ry = h * 0.5;
    const D = Math.max(64, Math.min(150, w / 8));
    this.links = [];
    for (let i = 0; i < 6; i++) { const el = ringEl(D * (i === 1 || i === 4 ? 1.35 : i % 2 ? 0.82 : 1), i); el._spin = i * 0.9; host.appendChild(el); this.links.push(el); }
    this.update(0);
  }
  update(d) {
    if (this.rings) {
      this.theta += d * 1.4; const n = this.links.length, c = Math.cos(this.tilt), s = Math.sin(this.tilt);
      for (let i = 0; i < n; i++) {
        const el = this.links[i], a = this.theta + i * Math.PI * 2 / n;
        const x = this.rx * Math.cos(a), y = this.ry * Math.sin(a);
        const X = this.cx + x * c - y * s, Y = this.cy + x * s + y * c;
        el._spin += d * 3.5;
        const depth = Math.sin(a), sc = 0.72 + 0.38 * (depth + 1) / 2, z = depth > 0 ? 3 : 1;
        drawRing(el, el._spin);
        el.style.transform = `translate(${X - el._w / 2}px,${Y - el._h / 2}px) rotate(${Math.sin(a + i) * 0.5}rad) scale(${sc})`;
        if (el._z !== z) { el.style.zIndex = z; el.style.opacity = z === 3 ? '1' : '0.7'; el._z = z; }
      }
      return;
    }
    this.theta += d; const n = this.links.length, c = Math.cos(this.tilt), s = Math.sin(this.tilt);
    for (let i = 0; i < n; i++) {
      const a = this.theta + i * Math.PI * 2 / n, el = this.links[i];
      const x = this.rx * Math.cos(a), y = this.ry * Math.sin(a);
      const X = this.cx + x * c - y * s, Y = this.cy + x * s + y * c;
      const tx = -this.rx * Math.sin(a), ty = this.ry * Math.cos(a);
      const ang = Math.atan2(tx * s + ty * c, tx * c - ty * s);
      const depth = Math.sin(a), sc = 0.78 + 0.32 * (depth + 1) / 2, z = depth > 0 ? 3 : 1;
      el.style.transform = `translate(${X - el._w / 2}px,${Y - el._h / 2}px) rotate(${ang}rad) scale(${sc})`;
      if (el._z !== z) { el.style.zIndex = z; el.style.opacity = z === 3 ? '1' : '0.5'; el._z = z; }
    }
  }
}

function blobPath(T, V, k) {
  const cx = V.reduce((s, v) => s + v[0], 0) / V.length, cy = V.reduce((s, v) => s + v[1], 0) / V.length;
  const bow = (p, q) => { const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; return [(mx + (cx - mx) * k).toFixed(1), (my + (cy - my) * k).toFixed(1)]; };
  const n = T.length; let d = 'M' + V[n - 1][0] + ' ' + V[n - 1][1];
  for (let i = 0; i < n; i++) { const pv = V[(i - 1 + n) % n]; d += ' Q' + bow(pv, T[i]).join(' ') + ' ' + T[i][0] + ' ' + T[i][1] + ' Q' + bow(T[i], V[i]).join(' ') + ' ' + V[i][0] + ' ' + V[i][1]; }
  return d + 'Z';
}
function spark4(cx, cy, arms, vr, k) {
  const T = arms.map(([a, l]) => [+(cx + l * Math.cos(a * Math.PI / 180)).toFixed(1), +(cy + l * Math.sin(a * Math.PI / 180)).toFixed(1)]);
  const V = arms.map(([a], i) => { let b = arms[(i + 1) % arms.length][0]; if (b < a) b += 360; const m = (a + b) / 2 * Math.PI / 180; return [+(cx + vr * Math.cos(m)).toFixed(1), +(cy + vr * Math.sin(m)).toFixed(1)]; });
  return blobPath(T, V, k);
}
function star5(cx, cy, R, rot) {
  let d = ''; for (let i = 0; i < 10; i++) { const a = (rot - 90 + i * 36) * Math.PI / 180, r = i % 2 ? R * 0.42 : R; d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); }
  return d + 'Z';
}
function nested(cx, cy, R, rot, c, bg) {
  return [[1, c], [.8, bg], [.64, c], [.5, bg], [.34, c]].map(([s, col]) => `<path d="${star5(cx, cy, R * s, rot)}" fill="${col}"/>`).join('');
}
const SPARK = [
  { vb: [500, 460], h: [44, 96], w: 2, rot: 30, svg: (c) => {
    const outer = blobPath([[215, 62], [470, 80], [352, 352], [36, 388], [76, 212]], [[262, 138], [322, 222], [232, 298], [140, 262], [168, 182]], 0.12);
    const hole = blobPath([[222, 166], [306, 172], [262, 266], [160, 276], [174, 214]], [[240, 198], [262, 226], [228, 242], [196, 240], [206, 206]], 0.1);
    return `<path d="${outer} ${hole}" fill="${c}" fill-rule="evenodd" stroke="${c}" stroke-width="10" stroke-linejoin="round"/>`; } },
  { vb: [300, 460], h: [110, 190], w: 1, rot: 12, svg: (c) =>
    `<path d="M160 112 C140 140 128 162 131 196" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/><path d="M129 226 C118 270 130 312 143 346" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
<path d="${spark4(168, 95, [[-40, 40], [18, 38], [148, 46], [236, 30]], 9, .5)}" fill="${c}"/>
<path d="${spark4(130, 210, [[-12, 56], [78, 44], [152, 48], [252, 32]], 11, .5)}" fill="${c}"/>
<path d="${spark4(146, 365, [[-38, 56], [62, 64], [178, 64], [256, 40]], 12, .5)}" fill="${c}"/>` },
  { vb: [360, 740], h: [120, 200], w: 1, rot: 10, svg: (c, ink, bg) =>
    `<path d="M150 190 L118 290" stroke="${c}" stroke-width="20" stroke-linecap="round"/><path d="M178 548 L222 520" stroke="${c}" stroke-width="12" stroke-linecap="round"/><path d="M212 430 L255 412" stroke="${c}" stroke-width="10" stroke-linecap="round"/>
${nested(122, 302, 84, 12, ink, bg)}${nested(218, 475, 112, -6, ink, bg)}${nested(188, 140, 112, -16, c, bg)}${nested(215, 362, 70, 8, c, bg)}${nested(190, 592, 56, -12, c, bg)}
<path d="${star5(186, 668, 26, 5)}" fill="${ink}"/><path d="${star5(230, 694, 17, -10)}" fill="${c}"/>` },
  { vb: [320, 560], h: [96, 160], w: 1, rot: 14, svg: (c) =>
    `<path d="M122 150 Q131 330 132 506 Q137 330 150 150Z" fill="${c}"/><path d="${spark4(136, 128, [[-80, 98], [4, 116], [152, 104], [204, 92]], 26, .32)}" fill="${c}" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>
<path d="M219 258 Q224 360 222 442 Q227 360 235 258Z" fill="${c}"/><path d="${spark4(228, 246, [[-72, 48], [8, 44], [44, 44], [168, 58]], 12, .3)}" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>` },
  { vb: [200, 300], h: [26, 76], w: 3, rot: 20, svg: (c) => `<path d="${spark4(100, 150, [[-90, 145], [0, 95], [90, 145], [180, 95]], 9, .12)}" fill="${c}"/>` }
];
const SPARK_BAG = SPARK.flatMap((s, i) => Array(s.w).fill(i));

export function fillMarquee(el) {
  const parent = el.parentElement;
  const spans = [...el.children].filter((n) => n.tagName === 'SPAN');
  if (!spans.length) return 0;
  if (!el._mqUnit) el._mqUnit = spans[0].innerHTML;
  const unit = el._mqUnit;
  const a = spans[0];
  a.innerHTML = unit;
  const min = parent?.clientWidth || 0;
  if (a.offsetWidth > 0 && min > 0) {
    let guard = 0;
    while (a.offsetWidth < min && guard++ < 48) a.insertAdjacentHTML('beforeend', unit);
  }
  let b = spans[1];
  if (!b) {
    b = a.cloneNode(true);
    b.setAttribute('aria-hidden', 'true');
    el.appendChild(b);
  } else {
    b.innerHTML = a.innerHTML;
    b.setAttribute('aria-hidden', 'true');
  }
  [...el.children].forEach((n, i) => { if (i > 1) n.remove(); });
  return el.scrollWidth / 2;
}

function wrapMarqueeX(x, half) {
  if (!half) return x;
  while (x <= -half) x += half;
  while (x > 0) x -= half;
  return x;
}

export function sparkLayer(host, seed, red) {
  let s = seed * 9301 + 49297; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const hr = host.getBoundingClientRect(), w = hr.width, h = hr.height;
  const skip = el => el.closest('[data-chains],[data-cross],[data-orbit],[data-sparkles]');
  const obs = [];
  host.querySelectorAll('*').forEach(el => {
    if (skip(el)) return;
    const tag = el.tagName, cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const hasBg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none' || parseFloat(cs.borderTopWidth) > 0;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!(hasBg || hasText || /^(IMAGE-SLOT|IMG|SVG|BUTTON|ARTICLE|A)$/.test(tag))) return;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    if (r.width > w * 0.98 && r.height > h * 0.9) return;
    const mv = el.closest('[data-speed],[data-x]'); let px = 0, py = 0;
    if (mv && host.contains(mv)) { const vh = window.innerHeight; py = Math.abs(parseFloat(mv.dataset.speed || 0)) * vh * 0.7; px = Math.abs(parseFloat(mv.dataset.x || 0)) * vh * 0.7; }
    obs.push([r.left - hr.left - px, r.top - hr.top - py, r.right - hr.left + px, r.bottom - hr.top + py]);
  });
  const layer = document.createElement('div'); layer.setAttribute('data-sparkles', '');
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:-1;overflow:hidden';
  const dark = getComputedStyle(host).backgroundColor === 'rgb(11, 11, 12)', ink = dark ? '#f3f3f1' : '#0b0b0c', bg = dark ? '#0b0b0c' : '#f3f3f1';
  const ORDER = [0, 3, 0, 4, 0, 1], n = host.dataset.screenLabel === 'Anillos' ? 0 : h > 700 ? 3 : 2;
  const corners = [[0, 0], [1, 1], [1, 0], [0, 1]], used = new Set();
  const area = b => obs.reduce((t, q) => t + Math.max(0, Math.min(b[2], q[2]) - Math.max(b[0], q[0])) * Math.max(0, Math.min(b[3], q[3]) - Math.max(b[1], q[1])), 0);
  for (let j = 0; j < n; j++) {
    const S = SPARK[ORDER[(seed * 2 + j) % ORDER.length]], single = S.vb[0] / S.vb[1] > 0.6;
    let sh = Math.min(h * (single ? 0.42 : 0.62), single ? 280 : 440) * (0.8 + rnd() * 0.2), sw = sh * S.vb[0] / S.vb[1];
    if (sw > w * 0.42) { sw = w * 0.42; sh = sw * S.vb[1] / S.vb[0]; }
    let best = null;
    const pref = [[1, 0], [1, 1], [0, 1], [0, 0]];
    for (let k = 1; k >= 0.5 && !best; k *= 0.85) {
      const hh = sh * k, ww = sw * k;
      for (const c of pref) {
        const ci = corners.findIndex(q => q[0] === c[0] && q[1] === c[1]);
        if (used.has(ci)) continue;
        const x = c[0] ? w - ww * 0.72 : -ww * 0.28, y = c[1] ? h - hh * 0.88 : -hh * 0.12;
        const vis = [Math.max(0, x), Math.max(0, y), Math.min(w, x + ww), Math.min(h, y + hh)];
        const va = Math.max(1, (vis[2] - vis[0]) * (vis[3] - vis[1])), ov = area([x - 12, y - 12, x + ww + 12, y + hh + 12]);
        const lim = (c[0] === 0 && c[1] === 0) ? 0 : va * 0.03;
        if (ov <= lim) { best = { x, y, c, ci }; sh = hh; sw = ww; break; }
      }
    }
    if (!best) continue; used.add(best.ci);
    const flip = best.c[0] === 1, tilt = (flip ? -1 : 1) * (6 + rnd() * S.rot);
    const o = document.createElement('div');
    o.style.cssText = `position:absolute;left:${best.x.toFixed(0)}px;top:${best.y.toFixed(0)}px;width:${sw.toFixed(0)}px;height:${sh.toFixed(0)}px;transform:rotate(${tilt.toFixed(0)}deg)${flip ? ' scaleX(-1)' : ''}`;
    o.innerHTML = `<svg viewBox="0 0 ${S.vb[0]} ${S.vb[1]}" width="100%" height="100%" style="display:block;overflow:visible">${S.svg(red, ink, bg)}</svg>`;
    layer.appendChild(o);
  }
  const heroL = host.querySelectorAll('[data-intro][data-speed]');
  const heroSlogan = heroL.length ? [...host.querySelectorAll('[data-intro]')].find(el => !el.dataset.speed) : null;
  const head = heroL.length ? heroSlogan : (seed % 2 === 0 ? host.querySelector('h1,h2') : null);
  if (head && !head.closest('[data-sparkles]')) {
    const r = head.getBoundingClientRect(), S = SPARK[0];
    const range = document.createRange(); range.selectNodeContents(head); const tr = range.getBoundingClientRect();
    const tw = Math.min(r.width, tr.width || r.width), tl = heroL.length ? r.left : tr.left || r.left;
    const sh = heroL.length ? Math.min(Math.max(150, h * 0.32), 300) : Math.min(r.height * 1.25, 360), sw = sh * S.vb[0] / S.vb[1];
    const x = (heroL.length ? r.left - sw * 0.42 : tl + tw - sw * 0.55) - hr.left, y = r.top - hr.top - sh * (heroL.length ? 0.28 : 0.3);
    const o = document.createElement('div');
    o.style.cssText = `position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${sw.toFixed(0)}px;height:${sh.toFixed(0)}px;transform:rotate(${(-12 + rnd() * 24).toFixed(0)}deg)`;
    o.innerHTML = `<svg viewBox="0 0 ${S.vb[0]} ${S.vb[1]}" width="100%" height="100%" style="display:block;overflow:visible">${S.svg(red, ink, bg)}</svg>`;
    layer.appendChild(o);
  }
  host.appendChild(layer);
}
const HANG = {
  hero: [{ x: .05, n: 6, p: 'star', v: 0 }, { x: .3, n: 4, p: 'plaque' }, { x: .52, n: 5, p: 'star', v: 1 }, { x: .74, n: 4, p: 'star', v: 2 }, { x: .96, n: 6, p: 'star', v: 3 }],
  feat: [{ x: .18, n: 7, p: 'star', v: 0 }, { x: .8, n: 5, p: 'plaque' }],
  contact: [{ x: .08, n: 5, p: 'star', v: 2 }, { x: .36, n: 7, p: 'plaque' }, { x: .62, n: 4, p: 'star', v: 1 }, { x: .9, n: 6, p: 'star', v: 3 }]
};

export class FomoRuntime {
  constructor(api) {
    this.api = api;
    this.props = {
      intensity: api.intensity ?? 8,
      chains: api.chains !== false,
      sparkles: api.sparkles !== false,
      lookWords: api.lookWords ?? 'BOOK, FOMO, NOCHE, DIVA, TOTAL',
    };
    this.rootRef = { get current() { return api.root(); } };
    this.rotRef = { get current() { return api.rot(); } };
    this.hTrack = { get current() { return api.track(); } };
    this.hBar = { get current() { return api.bar(); } };
    this.cdRef = { get current() { return api.cd(); } };
    this.state = { mobile: typeof window !== 'undefined' && window.innerWidth < 720 };
  }
  start() { this.componentDidMount(); }
  stop() { this.componentWillUnmount(); }

  componentDidMount() {
    this.reduced = this.api.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reduced) this.props.chains = false;
    this.k = this.reduced ? 0 : (this.props.intensity ?? 8) / 8;
    this.mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, has: false };
    this.onMove = e => { const m = this.mouse; if (m.has) { m.vx = e.clientX - m.x; m.vy = e.clientY - m.y; } m.x = e.clientX; m.y = e.clientY; m.has = true; };
    this.onResize = () => {
      const mob = window.innerWidth < 720;
      if (mob !== this.state.mobile) {
        this.state.mobile = mob;
        this.api.onMobile?.(mob);
      }
      clearTimeout(this.rt); this.rt = setTimeout(() => this.build(), 160);
    };
    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('resize', this.onResize);
    this.lastY = window.scrollY; this.sv = 0; this.ropes = []; this.orbits = []; this.px = []; this.mq = [];
    this.build();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { if (!this.dead) this.build(); });
    this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop);
    this.tick(); this.iv = setInterval(() => this.tick(), 1000);
    this.intro();
    this.startRotator();
    if (this.reduced) return;
    this.rootRef.current && this.rootRef.current.querySelectorAll('[data-shine]').forEach(el => {
      const card = el.dataset.shine === 'card';
      el.animate(card ? [{ backgroundPosition: '150% 0, 0 0' }, { backgroundPosition: '-50% 0, 0 0' }] : [{ backgroundPosition: '150% 0' }, { backgroundPosition: '-50% 0' }],
        { duration: 2600, delay: +(el.dataset.shineDelay || (card ? 0 : 120)), iterations: Infinity, easing: 'cubic-bezier(.45,0,.2,1)' });
    });
  }
  startRotator() {
    const box = this.rotRef.current; if (!box) return;
    const words = (this.props.lookWords ?? 'BOOK, FOMO, NOCHE, DIVA, TOTAL').split(',').map(s => s.trim()).filter(Boolean);
    let i = 0; const inner = box.firstElementChild;
    const fit = () => { box.style.width = inner.getBoundingClientRect().width + 'px'; };
    fit();
    this.rotIv = setInterval(async () => {
      i = (i + 1) % words.length;
      await inner.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-110%)', opacity: 0 }], { duration: 260, easing: 'cubic-bezier(.6,0,.8,.4)', fill: 'forwards' }).finished;
      inner.textContent = words[i]; fit();
      inner.animate([{ transform: 'translateY(110%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.9,.2,1.15)', fill: 'forwards' });
    }, 2200);
  }
  componentWillUnmount() {
    clearInterval(this.rotIv);
    this.dead = true; cancelAnimationFrame(this.raf); clearInterval(this.iv);
    window.removeEventListener('pointermove', this.onMove); window.removeEventListener('resize', this.onResize);
    if (this.io) this.io.disconnect();
  }
  componentDidUpdate(prev) {
    if (prev.intensity !== this.props.intensity) this.k = (this.props.intensity ?? 8) / 8;
    if (prev.chains !== this.props.chains) this.applyChainVis();
    if (prev.sparkles !== this.props.sparkles) this.buildSparkles();
  }
  buildSparkles() {
    const R = this.rootRef.current; if (!R) return;
    R.querySelectorAll('[data-sparkles]').forEach(l => l.remove());
    if (this.props.sparkles === false || this.reduced) return;
    const saved = [];
    R.querySelectorAll('[data-speed],[data-x],[data-rot]').forEach(el => { saved.push([el, el.style.transform]); el.style.transform = 'none'; });
    [...R.children].filter(el => el.tagName === 'SECTION' && !/^Banda/.test(el.dataset.screenLabel || '')).forEach((sec, i) => {
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative'; sec.style.isolation = 'isolate';
      sparkLayer(sec, i + 3, '#D40000');
    });
    saved.forEach(([el, t]) => el.style.transform = t);
  }
  applyChainVis() {
    const R = this.rootRef.current; if (!R) return;
    const off = this.props.chains === false;
    R.querySelectorAll('[data-chains],[data-cross],[data-orbit]').forEach(h => h.style.display = off ? 'none' : '');
  }
  tick() {
    const el = this.cdRef.current; if (!el) return;
    const now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
    let s = Math.max(0, Math.floor((end - now) / 1000)); const p = v => String(v).padStart(2, '0');
    el.textContent = `${p(Math.floor(s / 3600))}:${p(Math.floor(s % 3600 / 60))}:${p(s % 60)}`;
  }
  intro() {
    if (this.reduced) return;
    const R = this.rootRef.current; if (!R) return;
    R.querySelectorAll('[data-intro]').forEach((el, i) => {
      el.animate([{ translate: '0 70%', opacity: 0, filter: 'blur(8px)' }, { translate: '0 0', opacity: 1, filter: 'blur(0)' }], { duration: 1100, delay: 120 + i * 110, easing: 'cubic-bezier(.2,.8,.1,1)', fill: 'backwards' });
    });
    const vh = window.innerHeight;
    this.reveals = [];
    R.querySelectorAll('[data-reveal]').forEach(el => { if (el.getBoundingClientRect().top > vh * 0.9) { el.style.clipPath = 'inset(0 0 100% 0)'; this.reveals.push(el); } });
  }
  build() {
    const R = this.rootRef.current; if (!R) return;
    const L = Math.max(11, Math.min(18, window.innerWidth / 85));
    this.ropes = []; this.orbits = [];
    R.querySelectorAll('[data-chains]').forEach(host => {
      host.innerHTML = ''; const w = host.clientWidth; const cfg = HANG[host.dataset.chains] || [];
      cfg.forEach((c, i) => this.ropes.push(new Rope(host, { a: { x: c.x * w, y: -4 }, n: c.n, L, pendant: c.p, pv: c.v, dir: i % 2 ? 1 : -1, kick: (Math.random() - .5) * 3 })));
    });
    R.querySelectorAll('[data-cross]').forEach((host, i) => {
      host.innerHTML = ''; const w = host.clientWidth, h = host.clientHeight; const [ya, yb] = host.dataset.cross.split(',').map(Number);
      const a = { x: -30, y: h * ya }, b = { x: w + 30, y: h * yb }; const span = Math.hypot(b.x - a.x, b.y - a.y);
      const cn = Math.max(4, Math.floor(span / L)); this.ropes.push(new Rope(host, { a, b, n: cn, L: span / cn * 1.004, dir: i % 2 ? 1 : -1, maxY: h - 14 }));
    });
    R.querySelectorAll('[data-orbit]').forEach((host, i) => { host.innerHTML = ''; this.orbits.push(new Orbit(host, L * 0.9, parseFloat(host.dataset.orbit), i % 2 ? -1 : 1)); });
    for (let s = 0; s < 90; s++) this.ropes.forEach(r => r.step({ fx: 0, fy: 0, g: r.pinB ? 0.05 : 0.35 }));
    this.ropes.forEach(r => r.render());
    this.buildSparkles();
    clearTimeout(this.spT); this.spT = setTimeout(() => { if (!this.dead) this.buildSparkles(); }, 1900);
    this.px = [...R.querySelectorAll('[data-speed],[data-rot],[data-x]')];
    this.mq = [...R.querySelectorAll('[data-marquee]')].map(el => {
      const half = fillMarquee(el);
      return { el, x: wrapMarqueeX(el._mx || 0, half), speed: parseFloat(el.dataset.marquee), half };
    });
    this.applyChainVis();
  }
  loop(t) {
    this.raf = requestAnimationFrame(this.loop);
    const k = this.k, vh = window.innerHeight, y = window.scrollY;
    const raw = Math.max(-90, Math.min(90, y - this.lastY)); this.lastY = y;
    this.sv += (raw - this.sv) * 0.25; const sv = this.sv;
    const pr = this.px.map(el => el.getBoundingClientRect());
    const rr = this.ropes.map(r => r.host.getBoundingClientRect());
    const orr = this.orbits.map(o => o.host.getBoundingClientRect());
    if (this.reveals && this.reveals.length) {
      this.reveals = this.reveals.filter(el => {
        if (el.getBoundingClientRect().top > vh * 0.88) return true;
        el.style.clipPath = '';
        el.animate([{ clipPath: 'inset(0 0 100% 0)', translate: '0 30px' }, { clipPath: 'inset(0 0 0% 0)', translate: '0 0' }], { duration: 900, easing: 'cubic-bezier(.7,0,.2,1)' });
        return false;
      });
    }
    this.px.forEach((el, i) => {
      const r = pr[i]; const off = r.top + r.height / 2 - (el._ty || 0) - vh / 2;
      const ty = -off * parseFloat(el.dataset.speed || 0) * k;
      const tx = off * parseFloat(el.dataset.x || 0) * k;
      const rot = off * parseFloat(el.dataset.rot || 0) * 0.25 * k;
      el._ty = ty; el.style.transform = `translate3d(${tx}px,${ty}px,0) rotate(${rot}deg)`;
    });
    const off = this.props.chains === false, m = this.mouse;
    if (!off) {
      this.ropes.forEach((rope, i) => {
        const r = rr[i]; if (r.bottom < -200 || r.top > vh + 200) return;
        const wind = Math.sin(t * 0.0011 + rope.phase) * 0.05;
        rope.step({ g: rope.pinB ? 0.05 : 0.35, fx: (sv * 0.05 * rope.dir + wind) * k, fy: sv * (rope.pinB ? 0.03 : 0.025) * k, m: m.has ? { x: m.x - r.left, y: m.y - r.top, vx: m.vx * k, vy: m.vy * k } : null });
        rope.render();
      });
      this.orbits.forEach((o, i) => { const r = orr[i]; if (r.bottom < 0 || r.top > vh) return; o.update(0.004 * k * o.dir); });
    }
    m.vx *= 0.6; m.vy *= 0.6;
    this.mq.forEach(q => {
      if (!q.half) return;
      q.x = wrapMarqueeX(q.x - q.speed * (1 + Math.abs(sv) * 0.12) * k, q.half);
      q.el._mx = q.x; q.el.style.transform = `translate3d(${q.x}px,0,0)`;
    });
    const tr = this.hTrack.current, bar = this.hBar.current;
    if (tr && bar) { const max = tr.scrollWidth - tr.clientWidth, vis = tr.clientWidth / tr.scrollWidth; const p = max > 0 ? tr.scrollLeft / max : 0; bar.style.width = (vis * 100) + '%'; bar.style.left = (p * (1 - vis) * 100) + '%'; }
  }
  slide(d) {
    const tr = this.hTrack.current; if (!tr) return;
    const kids = [...tr.children], base = kids[0].offsetLeft, pos = kids.map(k => k.offsetLeft - base);
    const cur = tr.scrollLeft, max = tr.scrollWidth - tr.clientWidth;
    let target = d > 0 ? pos.find(p => p > cur + 4) : [...pos].reverse().find(p => p < cur - 4);
    if (target == null) target = d > 0 ? max : 0;
    tr.scrollTo({ left: Math.min(max, target), behavior: 'smooth' });
  }
  dragStart(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const tr = this.hTrack.current; if (!tr) return;
    const x0 = e.clientX, s0 = tr.scrollLeft; let moved = false;
    const mv = ev => { const dx = ev.clientX - x0; if (Math.abs(dx) > 4 && !moved) { moved = true; tr.style.scrollSnapType = 'none'; tr.style.cursor = 'grabbing'; } if (moved) tr.scrollLeft = s0 - dx; };
    const up = () => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
      tr.style.cursor = 'grab';
      if (moved) { const sl = tr.scrollLeft; tr.style.scrollSnapType = ''; tr.scrollLeft = sl; const block = ev => { ev.preventDefault(); ev.stopPropagation(); tr.removeEventListener('click', block, true); }; tr.addEventListener('click', block, true); setTimeout(() => tr.removeEventListener('click', block, true), 50); }
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  }}
