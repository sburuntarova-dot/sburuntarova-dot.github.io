/* Project → Case: «How it works». The step whose screen crosses the middle of the window lights its caption and its
   square on the right (the caption column is sticky, case-p2c.css). Phone: captions sit under each screen instead. */
(() => {
  const flow = document.querySelector('.p2c-flow');
  if (!flow) return;
  const frames = [...flow.querySelectorAll('.p2c-flow__frame')];
  const caps = [...flow.querySelectorAll('.p2c-flow__cap')];
  const dots = [...flow.querySelectorAll('.p2c-flow__dots i')];
  const show = i => {
    caps.forEach((c, k) => { c.classList.toggle('is-on', k === i); c.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
  };
  show(0);
  // a thin band across the middle of the screen: whichever frame is in it is the current step
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) show(frames.indexOf(e.target)); });
  }, { rootMargin: '-48% 0px -48% 0px' });
  frames.forEach(f => io.observe(f));
})();

/* switch the shown picture in a stack: the old one is kept under the new one until the new one has faded in */
const p2cSwap = (imgs, i) => {
  const old = imgs.find(im => im.classList.contains('is-on'));
  imgs.forEach(im => im.classList.remove('is-prev'));
  if (old && old !== imgs[i]) { old.classList.add('is-prev'); setTimeout(() => old.classList.remove('is-prev'), 700); }
  imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
};

/* phone: the switch under a tablet scrolls sideways — keep the current option in view (only the row moves, not the page) */
const p2cKeepInView = opt => {
  const bar = opt && opt.parentElement;
  if (!bar || bar.scrollWidth <= bar.clientWidth) return;
  bar.scrollTo({ left: opt.offsetLeft - (bar.clientWidth - opt.offsetWidth) / 2, behavior: 'smooth' });
};

/* Cards on the sheets: their contents rise in one after another when the card reaches the screen; the drawn
   mobile question types its answer. Reduced motion: everything is simply there. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = [...document.querySelectorAll('.p2c-stage, .p2c-block:not(.p2c-block--dashed)')];
  const parts = '.p2c-window, .p2c-device, .p2c-shot, .p2c-tab, .p2c-quote, .p2c-variant, .p2c-note';
  cards.forEach(card => {
    card.classList.add('p2c-anim');
    card.querySelectorAll(parts).forEach((el, k) => { el.classList.add('p2c-rise'); el.style.setProperty('--k', k); });
  });
  const type = el => {
    const text = el.dataset.text || (el.dataset.text = el.textContent);
    el.textContent = ''; el.classList.add('is-typing');
    let i = 0;
    const tick = () => { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, 7 + Math.random() * 12); else setTimeout(() => el.classList.remove('is-typing'), 1500); };
    setTimeout(tick, 400);
  };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in'); io.unobserve(e.target);
    e.target.querySelectorAll('.p2c-mq__answer, .p2c-shot__answer').forEach(type);
  }), { threshold: 0.25 });
  cards.forEach(c => io.observe(c));
})();

/* «Подачи»: the shown layout's page scrolls by itself inside the tablet (smoothly, by translate), then the next layout
   comes in. The visitor can scroll it by hand (wheel / finger): the page then becomes a real scroll box at the same spot
   and auto-scroll waits 3.5 s after the last touch. The switch
   under the tablet picks a layout. Runs only while the block is on screen; reduced motion: no auto-scroll. */
(() => {
  const box = document.querySelector('.p2c-layouts');
  if (!box) return;
  const frameEl = box.querySelector('.p2c-scroll');
  const screen = box.querySelector('.p2c-scroll__screen');
  const pages = [...screen.querySelectorAll('img')];
  const opts = [...box.querySelectorAll('.p2c-seg__opt')];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED = 0.09;                       // share of the screen height per second
  let cur = 0, visible = false, raf = 0, last = 0, hold = 0, pos = 0, hand = false, handUntil = 0;
  const page = () => pages[cur];
  const end = () => Math.max(0, page().offsetHeight - screen.clientHeight);
  const toAuto = () => { hand = false; frameEl.classList.remove('is-hand'); pos = screen.scrollTop; screen.scrollTop = 0; page().style.translate = `0 ${-pos}px`; };
  const toHand = () => {
    handUntil = performance.now() + 3500;
    if (hand) return;
    hand = true; frameEl.classList.add('is-hand'); page().style.translate = ''; screen.scrollTop = pos;
  };
  const show = i => {
    page().style.translate = '';
    cur = i; pos = 0; hold = 450; screen.scrollTop = 0; page().style.translate = '0 0';
    p2cSwap(pages, i);
    opts.forEach((o, k) => o.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
    p2cKeepInView(opts[i]);
  };
  const frame = t => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(t - last, 64) : 0; last = t;
    if (hand) { box.style.setProperty('--p', end() ? (screen.scrollTop / end()).toFixed(3) : 1); if (t > handUntil && !still) toAuto(); return; }
    if (!visible || still) return;
    if (hold > 0) { hold -= dt; return; }
    if (pos >= end() - 0.5) { show((cur + 1) % pages.length); hold = 900; return; }
    pos = Math.min(end(), pos + SPEED * screen.clientHeight * dt / 1000);
    page().style.translate = `0 ${-pos}px`;
    box.style.setProperty('--p', end() ? (pos / end()).toFixed(3) : 1);
  };
  ['wheel', 'touchstart', 'pointerdown'].forEach(ev => screen.addEventListener(ev, toHand, { passive: true }));
  screen.addEventListener('scroll', () => { if (hand) { handUntil = performance.now() + 3500; pos = screen.scrollTop; } }, { passive: true });
  opts.forEach((o, k) => o.addEventListener('click', () => { hand = false; frameEl.classList.remove('is-hand'); show(k); hold = 600; }));
  // off screen the loop stops completely (no work at all), on screen it runs again
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = 0; if (visible && !raf) raf = requestAnimationFrame(frame); else if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; } }, { threshold: 0.15 }).observe(box);
})();

/* «Обзор» and the hard states in «Решения»: the constructor plays in the tablet by itself, a screen every 2.8 s, while the block is on screen; the
   switch under it jumps to a step (and the play goes on from there) */
document.querySelectorAll('.p2c-live').forEach(box => {
  const shots = [...box.querySelectorAll('.p2c-scroll__screen img')];
  const opts = [...box.querySelectorAll('.p2c-seg__opt')];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, timer = null, visible = false;
  const show = i => { cur = i; p2cSwap(shots, i); opts.forEach((o, k) => o.setAttribute('aria-pressed', k === i ? 'true' : 'false')); p2cKeepInView(opts[i]); };
  const play = () => { clearInterval(timer); if (visible && !still) timer = setInterval(() => show((cur + 1) % shots.length), 2800); };
  opts.forEach((o, k) => o.addEventListener('click', () => { show(k); play(); }));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; play(); }, { threshold: 0.3 }).observe(box);
});

/* «Solution»: on both devices the tools get picked one by one — 3ds Max, Corona Renderer, Photoshop — then a pause and
   again from the empty question, while the pair is on screen. Reduced motion: the finished choice stays. */
(() => {
  const row = document.querySelector('.p2c-tools');
  if (!row) return;
  const sets = [...row.querySelectorAll('.p2c-scroll__screen, .p2c-shot--stack')].map(b => [...b.querySelectorAll('img')]);
  const show = k => sets.forEach(imgs => imgs.forEach((im, j) => im.classList.toggle('is-on', j <= k)));   // states pile up: no gap
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { show(3); return; }
  const STEPS = [900, 650, 650, 2200];        // how long each state stays: empty, 1, 2, 3 picked
  let k = 0, timer = null;
  const next = () => { k = (k + 1) % 4; show(k); timer = setTimeout(next, STEPS[k]); };
  new IntersectionObserver(([e]) => {
    clearTimeout(timer);
    if (e.isIntersecting) { k = 0; show(0); timer = setTimeout(next, STEPS[0]); }
  }, { threshold: 0.3 }).observe(row);
})();

/* phone: progress segments inside every card with a switch — they mirror the switch (so autoplay stays as it is);
   tap a segment = that option, swipe the card = next / previous */
document.querySelectorAll('.p2c-stage--scroll').forEach(stage => {
  const opts = [...stage.querySelectorAll(':scope > .p2c-seg .p2c-seg__opt')];
  if (!opts.length) return;
  const prog = document.createElement('div');
  prog.className = 'p2c-prog';
  prog.innerHTML = opts.map(o => `<button type="button" aria-label="${o.childNodes[0].textContent.trim()}"><i></i></button>`).join('');
  stage.appendChild(prog);
  const segs = [...prog.children];
  const cur = () => Math.max(0, opts.findIndex(o => o.getAttribute('aria-pressed') === 'true'));
  const sync = () => {
    const i = cur();
    segs.forEach((g, k) => { g.classList.toggle('is-done', k < i); g.classList.remove('is-on'); });
    void prog.offsetWidth;                      // restart the fill of the current one
    segs[i].classList.add('is-on');
    stage.style.setProperty('--p', 0);
  };
  sync();
  new MutationObserver(sync).observe(stage.querySelector(':scope > .p2c-seg'), { subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
  segs.forEach((g, k) => g.addEventListener('click', () => opts[k].click()));
  const go = d => opts[(cur() + d + opts.length) % opts.length].click();
  let x0 = null, y0 = null;
  stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });
});

/* the cover: the steps roll up one by one (0.85 s each), each with its own screen on the right; «Готовый кейс» holds with the finished case, then
   back to «Материалы»; only while the cover is on screen. Reduced motion: it stands on «Готовый кейс». */
(() => {
  const cover = document.querySelector('.p2c-cover');
  if (!cover) return;
  const list = cover.querySelector('.p2c-cover__list');
  const items = [...list.children];
  const last = items.length - 1;
  const pics = [...cover.querySelectorAll('.p2c-cover__pics img')];
  const show = i => {
    list.style.setProperty('--i', i);
    items.forEach((li, k) => li.classList.toggle('is-on', k === i));
    p2cSwap(pics, i);
  };
  show(last);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = last, timer = null;
  // after «Готовый кейс» the column jumps back to «Материалы» unseen (no rewind through all the steps)
  const tick = () => {
    if (i === last) { list.classList.add('no-anim'); i = 0; show(i); void list.offsetWidth; list.classList.remove('no-anim'); }
    else { i += 1; show(i); }
    timer = setTimeout(tick, i === last ? 1800 : 850);
  };
  new IntersectionObserver(([e]) => {
    clearTimeout(timer);
    if (e.isIntersecting) timer = setTimeout(tick, 700);
  }, { threshold: 0.3 }).observe(cover);
})();
