/* The Project → Case cover, live (source scene: reel/scenes/p2c-cover.html). Builds itself into every .p2cc box:
   a beige-grey gradient drifting, the constructor's steps rolling up in a loop with a dot that drops to the active
   word (a check and a double ring on «Готовый кейс»), the site's tablet with the step's screen sliding in, and a soft
   nod of the tablet on each change. One rAF loop per cover, only while it's on screen. Reduced motion: a still frame. */
(() => {
  const covers = [...document.querySelectorAll('.p2cc')];
  if (!covers.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SCREENS = ['scr-cover', 'scr-role', 'scr-idea', 'scr-process', 'scr-solution', 'scr-preview'];
  const WORDS = ['Материалы', 'О проекте', 'Идея', 'Процесс', 'Решение', 'Готовый кейс'];
  const N = SCREENS.length, STEP = 0.95, LAST = 2.0, MOVE = 0.4;     // one round = 5 × 0.95 + 2.0 = 6.75 s
  const ROUND = (N - 1) * STEP + LAST, DUR = ROUND * 2;
  const ROW = 82, ACTIVE_Y = 480, DIM = 0.2, DOT_X = 166;
  // soft fields (centre, size, drift); drawn as radial gradients, the blur is in the gradient itself
  const BLOBS = [
    { c: '207 197 188', o: 0.9,  x: 380,  y: 520, w: 1000, h: 820, ax: 180, ay: 90,  ph: 0 },
    { c: '233 229 224', o: 1,    x: 900,  y: 60,  w: 1100, h: 560, ax: 220, ay: 70,  ph: 1.3 },
    { c: '214 188 170', o: 0.85, x: 1380, y: 560, w: 760,  h: 860, ax: 150, ay: 140, ph: 2.6 },
    { c: '191 183 176', o: 0.6,  x: 160,  y: 860, w: 900,  h: 520, ax: 200, ay: 80,  ph: 4.0 },
    { c: '222 211 200', o: 0.9,  x: 1050, y: 880, w: 900,  h: 440, ax: 180, ay: 60,  ph: 5.1 }
  ];
  const COOL = [199, 205, 211], WARM = [221, 181, 156];              // the tint: «Материалы» → «Готовый кейс»
  const SOFT = 260;                                                  // how far a field fades out past its shape
  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const clamp = x => Math.max(0, Math.min(1, x));
  const el = (tag, cls, parent) => { const n = document.createElement(tag); if (cls) n.className = cls; parent.appendChild(n); return n; };
  const field = (parent, b) => {
    const d = el('div', 'p2cc__blob', parent);
    Object.assign(d.style, { left: `${b.x - b.w / 2 - SOFT}px`, top: `${b.y - b.h / 2 - SOFT}px`, width: `${b.w + SOFT * 2}px`, height: `${b.h + SOFT * 2}px` });
    return d;
  };
  const paint = (d, rgb, o) => { d.style.background = `radial-gradient(closest-side, rgb(${rgb} / ${o}) 0%, rgb(${rgb} / ${o * 0.75}) 40%, rgb(${rgb} / 0) 100%)`; };

  covers.forEach(root => {
    const base = root.dataset.base || '';
    const words = root.dataset.words ? root.dataset.words.split('|') : WORDS;   // the English pages pass their own
    const stage = el('div', 'p2cc__stage', root);
    const bg = el('div', '', stage);
    const blobs = BLOBS.map(b => { const d = field(bg, b); paint(d, b.c, b.o); return d; });
    const tint = field(bg, { x: 1250, y: 630, w: 1100, h: 900 });
    const steps = el('ol', 'p2cc__steps', stage);
    document.addEventListener('langchange', () => {
      const w = root.dataset.words ? root.dataset.words.split('|') : WORDS;
      [...steps.children].forEach((li, i) => { li.textContent = w[i % w.length]; });
    });
    steps.innerHTML = words.map(w => `<li>${w}</li>`).join('').repeat(3);   // three copies, so the loop has words above and below
    const lis = [...steps.children];
    const ring = el('span', 'p2cc__ring', stage), ring2 = el('span', 'p2cc__ring', stage);
    const dot = el('span', 'p2cc__dot', stage);
    dot.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.6 8.4l2.3 2.3 4.6-4.8"/></svg>';
    const tick = dot.querySelector('path');
    const pad = el('div', 'p2cc__pad', stage);
    const screen = el('div', 'p2cc__screen', pad);
    const shots = SCREENS.map(n => { const im = el('img', '', screen); im.alt = ''; im.decoding = 'async'; im.loading = 'lazy'; im.src = `${base}${n}.webp`; return im; });
    const bezel = el('img', '', pad); bezel.alt = ''; bezel.loading = 'lazy'; bezel.src = `${base}tablet-empty.webp`;

    // the 1560 × 878 stage covers the box (the home card is narrower: its sides are cut, as the safe zone allows)
    // sized from the observer's own entry (no forced layout) and only when the box really changed
    let k0 = 0;
    const fit = (w, h) => { const k = Math.max(w / 1560, h / 878); if (k !== k0) { k0 = k; stage.style.transform = `scale(${k})`; } };
    const r0 = root.getBoundingClientRect(); fit(r0.width, r0.height);
    new ResizeObserver(([e]) => fit(e.contentRect.width, e.contentRect.height)).observe(root);

    const seek = T => {
      const t = ((T % DUR) + DUR) % DUR, tr = t % ROUND, a = t / DUR * Math.PI * 2;
      // the fields drift and morph; integer multiples of a, so the loop closes
      blobs.forEach((d, i) => { const b = BLOBS[i]; d.style.transform = `translate(${(Math.sin(a + b.ph) * 1.8 + Math.sin(a * 3 + b.ph * 2) * 0.6) * b.ax}px, ${(Math.cos(a * 2 + b.ph) * 1.8 + Math.sin(a * 3 + b.ph) * 0.5) * b.ay}px) rotate(${Math.sin(a + b.ph) * 25}deg) scale(${1 + 0.22 * Math.sin(a * 2 + b.ph)}, ${1 - 0.15 * Math.sin(a * 2 + b.ph)})`; });
      // the step and how far into the move to it; the list loops (after «Готовый кейс» it rolls on into «Материалы»)
      let k = 0;
      for (let i = 0; i < N; i++) if (tr >= i * STEP) k = i;
      const dt = tr - k * STEP;
      const sc = ease(clamp(dt / MOVE)), pos = k - 1 + sc;
      const disp = ((pos % N) + N) % N + N;
      const w = pos < 0 ? -pos : pos / (N - 1);
      const z = ease(clamp((tr - (N - 1) * STEP - 0.15) / 0.5)) - ease(clamp((tr - (ROUND - 0.5)) / 0.5));
      paint(tint, COOL.map((c, j) => Math.round(c + (WARM[j] - c) * w)).join(' '), 0.55 + 0.35 * z);
      steps.style.transform = `translateY(${ACTIVE_Y - ROW / 2 - disp * ROW}px)`;
      // the loop's copies would fill the whole frame: words more than ~3 rows away melt out
      lis.forEach((li, i) => { const d = Math.abs(i - disp), near = Math.max(0, 1 - d), far = clamp(1 - (d - 2.5) / 1.5); li.style.color = `rgb(255 255 255 / ${(DIM + (1 - DIM) * near) * far})`; });
      // the dot: rides with the old word, a small wind-up, drops to the new one, overshoots and settles
      const oldY = ACTIVE_Y - sc * ROW, newY = ACTIVE_Y + (1 - sc) * ROW;
      const fall = clamp((dt - 0.16) / 0.26), f = fall * fall * fall;
      let dy = oldY + (newY - oldY) * f - 4 * Math.sin(Math.PI * clamp((dt - 0.02) / 0.16));
      if (dt > 0.42) dy = ACTIVE_Y + 6 * Math.sin(Math.PI * clamp((dt - 0.42) / 0.3));
      const fin = k === N - 1 ? ease(clamp((dt - 0.42) / 0.3)) : (k === 0 ? 1 - ease(clamp(dt / 0.2)) : 0);
      dot.style.transform = `translate(${DOT_X}px, ${dy}px) scale(${1 + 0.75 * fin})`;
      tick.style.strokeDashoffset = 12 * (1 - (k === N - 1 ? ease(clamp((dt - 0.6) / 0.3)) : fin));
      const u = clamp((dt - 0.42) / 0.6), u2 = k === N - 1 ? clamp((dt - 0.62) / 0.8) : 0;
      ring.style.transform = `translate(${DOT_X}px, ${ACTIVE_Y}px) scale(${1 + 2.2 * (1 - Math.pow(1 - u, 3))})`;
      ring.style.opacity = u > 0 && u < 1 ? 0.7 * (1 - u) : 0;
      ring2.style.transform = `translate(${DOT_X}px, ${ACTIVE_Y}px) scale(${1 + 3.4 * (1 - Math.pow(1 - u2, 3))})`;
      ring2.style.opacity = u2 > 0 && u2 < 1 ? 0.6 * (1 - u2) : 0;
      // the screen slides in from the right over the one before
      const prev = (k + N - 1) % N, p = ease(clamp(dt / 0.45));
      shots.forEach((im, i) => {
        im.style.opacity = i === k || (i === prev && p < 1) ? 1 : 0;
        im.style.zIndex = i === k ? 2 : 1;
        im.style.transform = i === k ? `translateX(${(1 - p) * 100}%)` : (i === prev ? `translateX(${-p * 30}%)` : 'none');
      });
      // the tablet stands still and nods softly on each change
      const nod = dt < 0.6 ? Math.pow(Math.sin(Math.PI * dt / 0.6), 2) : 0;
      pad.style.transform = `translateY(${nod * 10}px)`;
    };

    seek(1);                                    // «Материалы», settled
    if (reduce) return;
    let raf = 0, last = 0, clock = 1;
    const frame = now => { clock += Math.min(0.1, (now - last) / 1000); last = now; seek(clock); raf = requestAnimationFrame(frame); };
    new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf); raf = 0;
      if (e.isIntersecting) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }).observe(root);
  });
})();
