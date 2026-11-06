// Case pages: navigation follows the section on screen (sliding dot + colour wave); pictures fade in once decoded
// and the rest are fetched quietly after the page has loaded.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PALETTE = ['#F2A58E', '#EFA94A', '#E79AB4', '#7FB8EC', '#9C97EA', '#8CC56A', '#C08A5B'];   // as the headings on the home page

  /* ── the case always opens at its top — on a new visit AND on reload (browsers restore the old position on reload,
        so the page used to open on «01 Problem»). Only back/forward and #section links keep their place.
        Repeated once more after load (late layout), unless the visitor has already started scrolling. ── */
  const navEntry = performance.getEntriesByType?.('navigation')[0];
  if (!location.hash && navEntry?.type !== 'back_forward') {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    let touched = false;
    ['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => { touched = true; }, { once: true, passive: true }));
    const toTop = () => {
      if (touched) return;
      scrollTo({ top: 0, behavior: 'instant' });
      document.querySelector('.case-panel')?.scrollTo({ top: 0, behavior: 'instant' });   // desktop: the panel scrolls
      document.querySelector('.case-top')?.scrollIntoView({ block: 'start', behavior: 'instant' });   // also an outer frame (preview)
    };
    toTop();
    document.readyState === 'complete' ? setTimeout(toTop, 0) : addEventListener('load', () => setTimeout(toTop, 0), { once: true });
  }

  /* ── opening: the navigation rows come in one after another (motion.css §8, class set in <head>); the title and
        lead use the site's text entrance (motion.js, .wave-title) ── */
  setTimeout(() => document.documentElement.classList.remove('case-enter'), 1700);

  /* ── case headings stay still (her choice, 2026-10-23: a case is read, the page transition is the one moment).
        The only accent: one colour wave over the key words of the lead, once the page has opened ── */
  const leadHl = document.querySelector('.case-intro .t-lead .hl');
  if (leadHl && !reduce) {
    const chars = [...leadHl.textContent].map(ch => { const c = document.createElement('span'); c.textContent = ch; return c; });
    leadHl.setAttribute('aria-label', leadHl.textContent);
    leadHl.replaceChildren(...chars);
    const seed = Math.random() * PALETTE.length;
    chars.forEach((c, i) => {
      const col = PALETTE[Math.floor(seed + i / 3 + Math.random() * 0.9) % PALETTE.length];
      c.animate([{ color: col, offset: 0.25 }, { color: col, offset: 0.55 }],
        { duration: 900, delay: 550 + i * 30 + (Math.random() - 0.5) * 80, easing: 'ease-in-out' });
    });
  }

  /* ── desktop window (case.css): only the white panel scrolls. The wheel works anywhere on the page (header,
        navigation, margins) and the keyboard (space, arrows, Page Down) scrolls the panel from the start ── */
  const panel = document.querySelector('.case-panel');
  const desktop = matchMedia('(min-width: 900px)');
  if (panel) {
    addEventListener('wheel', e => {
      if (!desktop.matches || panel.contains(e.target) || e.ctrlKey) return;
      panel.scrollBy({ top: e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY, behavior: 'instant' });
    }, { passive: true });
    if (desktop.matches && !location.hash) panel.focus({ preventScroll: true });
  }

  /* ── smart header: hides while scrolling down (more room for the pictures), slides back on the slightest
        scroll up; over the page it gets a soft frosted bar so the pills stay readable on the white panel ── */
  const top = document.querySelector('.case-top');
  if (top) {
    let lastY = scrollY, ticking = false;
    const update = () => {
      ticking = false;
      const y = Math.max(0, scrollY), dy = y - lastY, h = top.offsetHeight;
      top.classList.toggle('is-stuck', y > 2);
      if (y <= h) top.classList.remove('is-hidden');                  // near the top: always there
      else if (dy > 6) top.classList.add('is-hidden');                 // scrolling down
      else if (dy < -6) top.classList.remove('is-hidden');             // any scroll up
      if (Math.abs(dy) > 6 || y <= h) lastY = y;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    top.addEventListener('focusin', () => top.classList.remove('is-hidden'));   // keyboard users always see it
  }

  /* ── case navigation: one dot slides to the section that crosses the middle of the screen; the section name
        moves right into place and a colour wave runs over its letters ── */
  const links = [...document.querySelectorAll('.case-nav__sections a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const dot = document.querySelector('.case-nav__dot');
  const nav = document.querySelector('.case-nav');
  let current = null;

  const letters = a => {
    if (a._letters) return a._letters;
    const name = a.querySelector('.case-nav__name');
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 1) return walk(n);
      const frag = document.createDocumentFragment();
      [...n.textContent].forEach(ch => { const s = document.createElement('span'); s.textContent = ch; frag.appendChild(s); });
      n.replaceWith(frag);
    });
    walk(name);
    return (a._letters = [...name.querySelectorAll('span:not(.sec-num)')]);
  };
  const wave = a => {
    const seed = Math.random() * PALETTE.length;
    letters(a).forEach((c, i) => {
      const col = PALETTE[Math.floor(seed + i / 3 + Math.random() * 0.9) % PALETTE.length];
      // no first/last keyframe: starts from and settles to the link's own colour (grey → ink)
      c.animate([{ color: col, offset: 0.25 }, { color: col, offset: 0.55 }],
        { duration: 900, delay: Math.max(0, i * 38 + (Math.random() - 0.5) * 120), easing: 'ease-in-out' });
    });
  };
  const placeDot = a => { if (dot) dot.style.setProperty('--dot-y', `${a.offsetTop + a.offsetHeight / 2 - dot.offsetHeight / 2}px`); };

  function setActive(id, animate = true) {
    const a = links.find(l => l.getAttribute('href') === `#${id}`);
    if (!a || a === current) return;
    current = a;
    links.forEach(l => l.classList.toggle('is-active', l === a));
    placeDot(a);
    if (animate && !reduce && nav?.offsetParent) wave(a);
  }

  if (sections.length) {
    // first position without animation (the page may open in the middle after a reload)
    nav?.classList.add('no-anim'); dot?.classList.add('no-anim');
    setActive(links.find(l => l.classList.contains('is-active'))?.getAttribute('href').slice(1) || sections[0].id, false);
    requestAnimationFrame(() => requestAnimationFrame(() => { nav?.classList.remove('no-anim'); dot?.classList.remove('no-anim'); }));

    let timer;
    const io = new IntersectionObserver(entries => {
      const hit = entries.filter(e => e.isIntersecting).pop();
      if (!hit) return;
      clearTimeout(timer);                       // fast scrolling through several sections → only the last one waves
      timer = setTimeout(() => setActive(hit.target.dataset.navFor || hit.target.id), 120);
    }, { rootMargin: '-45% 0px -54% 0px' });
    sections.forEach(s => io.observe(s));
    // the «next case» block at the very end still counts as the last section
    const next = document.querySelector('.case-next');
    if (next) { next.dataset.navFor = sections[sections.length - 1].id; io.observe(next); }
    addEventListener('resize', () => current && placeDot(current));
    document.fonts?.ready.then(() => current && placeDot(current));
  }

  /* ── pictures: grey slot until the image is decoded, then a short fade (no movement — «картинки подлетают») ── */
  const imgs = [...document.querySelectorAll('.case-media img')];
  imgs.forEach(img => {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('is-pending');
    const show = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => img.classList.remove('is-pending'));
    img.addEventListener('load', show, { once: true });
    img.addEventListener('error', () => img.classList.remove('is-pending'), { once: true });
  });

  /* ── after the page has loaded, fetch every remaining picture at low priority (the browser still picks the size
        for this screen from srcset): by the time the visitor scrolls, they are already there — as on the reference ── */
  const preload = () => imgs.forEach(img => { if (img.loading === 'lazy') { img.fetchPriority = 'low'; img.loading = 'eager'; } });
  document.readyState === 'complete' ? setTimeout(preload, 300) : addEventListener('load', () => setTimeout(preload, 300), { once: true });
})();
