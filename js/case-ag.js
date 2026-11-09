/* Art Glück case — the catalog phone: five course cards go by, a beat, then a quick way back to the start; again while
   the phone is on screen. Reduced motion: it stays at the start. */
(() => {
  const fig = document.querySelector('.ag-phone');
  if (!fig || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const page = fig.querySelector('.ag-phone__page');
  const END = -(2790 - 780 - 579) / (2790 - 780) * 100;   // % of the page picture: the 5th card's bottom reaches the screen's bottom
  let anim = null;
  const run = () => {
    if (anim) { anim.play(); return; }
    anim = page.animate([
      { translate: '0 0', offset: 0 },
      { translate: '0 0', offset: 0.04, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' },   // starts almost at once
      { translate: `0 ${END}%`, offset: 0.62 },                                         // ~4 s for five cards
      { translate: `0 ${END}%`, offset: 0.72, easing: 'cubic-bezier(0.6, 0, 0.2, 1)' },
      { translate: '0 0', offset: 0.84 },                                               // quick way back
      { translate: '0 0', offset: 1 }
    ], { duration: 7000, iterations: Infinity });
  };
  new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); else if (anim) anim.pause(); }, { threshold: 0.15 }).observe(fig);
})();

/* the event banner: her event screens change by themselves every 4 s while it's on screen — the new one fades in over
   the old one (no blink), the indicator moves and fills, the caption names the event. Reduced motion: the first stays. */
(() => {
  const fig = document.querySelector('.ag-events');
  if (!fig) return;
  const slides = [...fig.querySelectorAll('.ag-events__screen > img')];
  const dots = [...fig.querySelectorAll('.ag-events__bar i')];
  const cap = fig.querySelector('.ag-events__cap');
  let caps = cap.dataset.caps.split('|');
  const SLIDE = 4000;
  fig.style.setProperty('--ag-slide', SLIDE + 'ms');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let cur = 0, timer = null;
  document.addEventListener('langchange', () => { caps = cap.dataset.caps.split('|'); cap.textContent = caps[cur]; });
  const show = i => {
    const old = slides[cur];
    slides.forEach(im => im.classList.remove('is-prev'));
    if (old !== slides[i]) { old.classList.add('is-prev'); setTimeout(() => old.classList.remove('is-prev'), 700); }
    slides.forEach((im, k) => im.classList.toggle('is-on', k === i));
    dots.forEach(d => d.classList.remove('is-on')); void fig.offsetWidth; dots[i].classList.add('is-on');
    cap.textContent = caps[i];
    cur = i;
  };
  new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting) { show(cur); timer = setInterval(() => show((cur + 1) % slides.length), SLIDE); }
  }, { threshold: 0.3 }).observe(fig);
})();

/* the InDesign landing: the whole page goes by top to bottom, a beat, then a quick way back; while it's on screen */
(() => {
  const fig = document.querySelector('.ag-page');
  if (!fig || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const page = fig.querySelector('.ag-page__screen img');
  const screen = fig.querySelector('.ag-page__screen');
  let anim = null;
  const run = () => {
    if (anim) { anim.play(); return; }
    const end = -(1 - screen.clientHeight / page.offsetHeight) * 100;   // % of the page picture: its bottom reaches the screen's bottom
    anim = page.animate([
      { translate: '0 0', offset: 0 },
      { translate: '0 0', offset: 0.03, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' },
      { translate: `0 ${end}%`, offset: 0.8 },
      { translate: `0 ${end}%`, offset: 0.87, easing: 'cubic-bezier(0.6, 0, 0.2, 1)' },
      { translate: '0 0', offset: 0.96 },
      { translate: '0 0', offset: 1 }
    ], { duration: 12000, iterations: Infinity });
  };
  const start = () => (page.complete && page.offsetHeight ? run() : page.addEventListener('load', run, { once: true }));
  new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else if (anim) anim.pause(); }, { threshold: 0.15 }).observe(fig);
})();
