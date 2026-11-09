// Motion layer for the home page (experiment): scroll reveal, gallery switch stagger. Loaded after main.js.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

  /* ── scroll reveal: titles and cards, siblings 60ms apart, once ── */
  const groups = [
    ['.about__card', '.about__photo'],
    ['.exp__cards > .job'], ['.exp__m'],
    ['.contact .pill-row'],
  ];
  // The page may live inside an iframe (the claude.ai preview) whose own height is the whole page — then
  // innerHeight can't tell what's on screen. IntersectionObserver with the implicit root measures against the
  // real top-level viewport, so its FIRST answer decides: visible at load → shown at once, otherwise → animated in.
  const seen = new WeakSet();
  const io = new IntersectionObserver(entries => {
    answered = true;
    entries.forEach(e => {
      const first = !seen.has(e.target); seen.add(e.target);
      if (!e.isIntersecting) return;
      if (first && performance.now() < loadedAt + 400) {          // already on screen when the page opened
        e.target.style.transition = 'none';
        e.target.classList.add('is-in');
        e.target.offsetHeight; e.target.style.transition = '';
      } else e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  const loadedAt = performance.now();
  // safety net: if the observer never answers (some embedded/hidden contexts), never leave content invisible
  let answered = false;
  setTimeout(() => { if (!answered) document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in')); }, 2500);
  const watch = (el, delay) => {
    el.classList.add('reveal');
    el.style.setProperty('--d', `${delay}ms`);
    io.observe(el);
  };
  groups.forEach(sel => {
    const els = sel.flatMap(s => [...document.querySelectorAll(s)]);
    els.forEach((el, i) => watch(el, reduce ? 0 : i * 60));
  });

  /* gallery items have NO scroll entrance (as in the Codrops ref): their pictures are preloaded, so they are simply
     there. A rise-on-scroll stacked on top of the load fade read as pictures «flying in» (her note, 2026-10-22). */

  /* ── category switch, as in Codrops «Grid Layout Transition — Filter + Stagger» (GSAP Flip):
        every card flies from its old place and size to the new one (slot n → slot n), 1s expo.inOut,
        random stagger 0.3s; the grid blurs and brightens mid-way, which hides the picture swap.
        Cards without a pair (12 vs 10) scale in / out. Images are preloaded, so nothing pops in. ── */
  if (window.gsap && window.Flip && !reduce) {
    gsap.registerPlugin(Flip);
    let busy = false;
    const visibleItems = grid => [...grid.querySelectorAll('.gallery__col')]
      .filter(c => c.offsetParent)                                  // desktop or mobile columns, whichever is on screen
      .flatMap(c => [...c.querySelectorAll('.g-item')].filter(it => it.offsetParent));
    window.galleryTransition = (key, show) => {
      if (busy) return;
      busy = true;
      const grids = document.getElementById('gallery-grids');
      const h0 = grids.offsetHeight;                                // lock the height so the next section doesn't jump
      // a filter makes the element the containing block of absolutely positioned children — set it BEFORE Flip measures,
      // otherwise the cards get positions relative to the page and fly in from far away
      gsap.set(grids, { position: 'relative', filter: 'blur(0px) brightness(100%)', willChange: 'filter' });
      const oldGrid = grids.querySelector('.gallery__grid:not([hidden])');
      const oldItems = visibleItems(oldGrid);
      oldItems.forEach((it, i) => it.dataset.flipId = 'slot-' + i);
      const state = Flip.getState(oldItems);
      show(key);                                                    // swap the grids (main.js)
      const newGrid = grids.querySelector('.gallery__grid:not([hidden])');
      const h1 = grids.offsetHeight;                                // natural height of the new category
      gsap.set(grids, { height: h0, overflow: 'hidden' });
      // old works stay on top for a moment and dissolve while the new ones fade in under the blur — no hard swap
      oldGrid.hidden = false;
      gsap.set(oldGrid, { position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 2, pointerEvents: 'none' });
      gsap.to(oldGrid, { opacity: 0, duration: 0.5, ease: 'power2.out',
        onComplete: () => { oldGrid.hidden = true; gsap.set(oldGrid, { clearProps: 'position,top,left,width,zIndex,pointerEvents,opacity' }); } });
      const newItems = visibleItems(newGrid);
      newItems.forEach((it, i) => { it.dataset.flipId = 'slot-' + i; it.classList.add('is-in'); it.classList.remove('reveal'); });
      const flipDuration = 1, staggerAmount = 0.3, total = flipDuration + staggerAmount;   // 2026-11-05: the faster 0.6 + 0.15 tried and dropped — her «было лучше»
      const tl = Flip.from(state, {
        targets: newItems,
        absolute: true,
        duration: flipDuration,
        ease: 'expo.inOut',
        stagger: { amount: staggerAmount, from: 'random' },
        onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out', delay: 0.4 }),
        onComplete: () => { busy = false; newItems.forEach(it => it.removeAttribute('data-flip-id')); gsap.set(grids, { clearProps: 'height,overflow' }); },
      });
      tl.from(newItems, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0);
      tl.to(grids, { height: h1, duration: total, ease: 'expo.inOut' }, 0);   // the section below follows smoothly
      tl.to(grids, {
        duration: total,
        keyframes: [
          { filter: 'blur(8px) brightness(108%)', duration: total * 0.5, ease: 'power2.in' },   // demo uses 200% on a dark page; on our light page that washes everything out
          { filter: 'blur(0px) brightness(100%)', duration: total * 0.5, ease: 'power2' },
        ],
        clearProps: 'filter,willChange,position',
      }, 0);
    };
  }

  /* «Показать ещё»: the newly shown works come in the same way */
  document.getElementById('gallery-more')?.addEventListener('click', () => {
    if (reduce) return;
    document.querySelectorAll('.gallery__grid:not([hidden]) [data-extra].is-shown').forEach((it, i) =>
      it.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
        { duration: 400, easing: EASE_OUT, delay: i * 60, fill: 'backwards' }));
  });

  /* ── hero title appears letter by letter; the important words (.hl) appear in colour and settle to ink.
        Ref: Twelve Labs «See differently» — soft colours in small patches travelling left → right. ── */
  const PALETTE = ['#F2A58E', '#EFA94A', '#E79AB4', '#7FB8EC', '#9C97EA', '#8CC56A', '#C08A5B'];
  const ink = getComputedStyle(document.body).color;

  // split every text node under root into per-letter spans (words kept unbreakable); remembers which letters are .hl
  function split(root) {
    const out = [];
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 1) { walk(n); return; }
      if (n.nodeType !== 3 || !n.textContent) return;
      const hl = !!n.parentElement.closest('.hl');
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const w = document.createElement('span'); w.className = 'w'; w._hl = hl;
        [...part].forEach(ch => { const c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; c._hl = hl; w.appendChild(c); out.push(c); });
        frag.appendChild(w);
      });
      n.replaceWith(frag);
    });
    walk(root);
    return out;
  }
  const colourFor = (seed, i) => PALETTE[Math.floor(seed + i / 3 + Math.random() * 0.9) % PALETTE.length];

  /* ── text entrance «В» (her pick on the test page, 2026-10-23): every line rises out of an invisible mask at its
        own baseline — 420 ms, lines 60 ms apart — then a colour wave runs over the important words (.hl).
        The mask is a clip-path on each word that moves together with it, so the markup stays as it is
        (no wrappers: .hl and the hover wave keep working). ── */
  const words = cs => [...new Set(cs.map(c => c.parentElement))];
  const MASK_FROM = 'inset(-0.25em -0.15em 100% -0.15em)', MASK_TO = 'inset(-0.25em -0.15em -0.3em -0.15em)';   // room for accents and descenders
  function riseIn(cs, start = 0) {
    const ws = words(cs).filter(w => w.offsetParent);              // skip the hidden (desktop/mobile) wording
    let line = -1, lastTop = -1e9;
    const tops = ws.map(w => w.getBoundingClientRect().top);   // read every position first, then start the animations (no read/write ping-pong)
    ws.forEach((w, k) => {
      const top = tops[k];
      if (top > lastTop + 4) { line++; lastTop = top; }
      w.animate([{ transform: 'translateY(100%)', clipPath: MASK_FROM }, { transform: 'none', clipPath: MASK_TO }],
        { duration: 420, delay: start + line * 60, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' });
    });
    const seed = Math.random() * PALETTE.length;
    cs.filter(c => c._hl && c.offsetParent).forEach((c, i) => c.animate(
      [{ color: ink }, { color: colourFor(seed, i), offset: 0.25 }, { color: colourFor(seed, i), offset: 0.55 }, { color: ink }],
      { duration: 900, delay: Math.max(0, start + 320 + i * 30 + (Math.random() - 0.5) * 80), easing: 'ease-in-out' }));
  }

  const title = document.querySelector('.hero__title');
  const variant = title && [...title.children].find(el => el.offsetParent);   // desktop or mobile wording
  if (variant && !reduce) {
    title.setAttribute('aria-label', variant.textContent.trim());
    const chars = [...variant.querySelectorAll('.line > span')].flatMap(line => split(line));
    document.documentElement.classList.remove('wave-pending');
    riseIn(chars, 150);

    // mouse hover over the important words: the colour wave runs again (letters stay visible)
    const hl = variant.querySelector('.hl');
    if (hl && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let last = performance.now();
      hl.addEventListener('mouseenter', () => {
        const t = performance.now(); if (t - last < 1800) return; last = t;
        const s = Math.random() * PALETTE.length;
        [...hl.querySelectorAll('.ch')].forEach((c, i) => c.animate(
          [{ color: ink }, { color: colourFor(s, i), offset: 0.25 }, { color: colourFor(s, i), offset: 0.55 }, { color: ink }],
          { duration: 900, delay: Math.max(0, i * 38 + (Math.random() - 0.5) * 120), easing: 'ease-in-out' }));
      });
    }
  } else document.documentElement.classList.remove('wave-pending');

  /* ── section headings: the same entrance «Г» as the hero, played once, just before the heading scrolls in. Gallery filter: the selected category is the colour part,
        and a new wave runs on it every time the category changes. ── */
  const letters = el => { if (!el._letters || !el.contains(el._letters[0])) el._letters = split(el); return el._letters; };
  function colourWave(el) {
    if (reduce) return;
    const s = Math.random() * PALETTE.length;
    letters(el).forEach((c, i) => c.animate(
      [{ color: ink }, { color: colourFor(s, i), offset: 0.25 }, { color: colourFor(s, i), offset: 0.55 }, { color: ink }],
      { duration: 900, delay: Math.max(0, i * 38 + (Math.random() - 0.5) * 120), easing: 'ease-in-out' }));
  }
  function appear(el) {
    if (el.id === 'gallery-filter') el.querySelectorAll('button').forEach(b => b.classList.toggle('hl', b.getAttribute('aria-pressed') === 'true'));
    el.classList.remove('wave-wait');
    riseIn(letters(el));
  }
  // the closing line is left out: it is simply always there (her note, 2026-11-06 — with fast scrolling it came late,
  // «мы уже в разделе и нет текста»); its retyped word below still plays
  const titles = [...document.querySelectorAll('.wave-title')].filter(t => t.id !== 'contact-title');
  if (!reduce && titles.length) {
    let answeredT = false;
    // one heading at a time: when two reach the screen together (a phone often shows two), the lower one waits until
    // the upper one has played — two waves at once looked like blinking (her note, 29.10)
    // Only a heading that is still on screen makes the next one wait: fast scrolling used to stack every passed heading
    // into the queue, so the closing line came seconds late (her note, 2026-11-06: «появляется поздно»).
    let prev = null;
    const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
    const queue = el => {
      const now = performance.now();
      const at = prev && prev.at + 500 > now && onScreen(prev.el) ? prev.at + 500 : now;
      prev = { el, at };
      if (at === now) appear(el); else setTimeout(() => appear(el), at - now);
    };
    const tio = new IntersectionObserver(entries => {
      answeredT = true;
      entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        .forEach(e => { queue(e.target); tio.unobserve(e.target); });
    }, { rootMargin: '0px 0px 5% 0px', threshold: 0 });   // starts as the heading reaches the screen, never late
    titles.forEach(t => { t.classList.add('wave-wait'); t.setAttribute('aria-label', t.textContent.trim()); tio.observe(t); });
    setTimeout(() => { if (!answeredT) titles.forEach(t => t.classList.remove('wave-wait')); }, 2500);   // never leave text hidden

    // hover (mouse only): the important words shimmer again
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.wave-title .hl').forEach(hl => {
        let last = 0;
        hl.addEventListener('mouseenter', () => {
          const t = performance.now(); if (t - last < 1800 || hl.closest('.wave-wait')) return; last = t;
          colourWave(hl);
        });
      });
    }
    // gallery filter: wave over the newly selected category (main.js has just rewritten the button text)
    const filterEl = document.getElementById('gallery-filter');
    filterEl?.addEventListener('click', e => {
      const b = e.target.closest('button[data-cat]');
      if (!b) return;
      // the first switch builds and lays out a whole new grid: the page can stall for a moment, and a wave started then
      // would play out unseen (her note: «в первый раз не горит»). Wait until frames come at a normal pace again.
      setTimeout(() => {
        const t0 = performance.now(); let prev = t0;
        const go = now => {
          if (now - prev > 40 && now - t0 < 1500) { prev = now; requestAnimationFrame(go); return; }
          if (now - t0 < 50) { prev = now; requestAnimationFrame(go); return; }   // at least a couple of frames
          const on = filterEl.querySelector('[aria-pressed="true"]'); if (on) colourWave(on);
        };
        requestAnimationFrame(go);
      }, 230);
    });
  }

  /* ── the closing line «Открыта к [новой роли / команде / проекту]. Делаю дизайн, который помогает бизнесу расти.»: after
        the heading has come in, the word is retyped every few seconds — the old one is erased letter by letter from the
        end, the new one typed, each new letter lights up in our palette and settles to ink. The word is plain inline
        text, so the full stop always follows it: no gaps, nothing clipped. Only while the line is on screen;
        reduced motion: «новой роли» stays. ── */
  let seek = document.querySelector('.seek[data-words]');
  if (seek && !reduce) {
    let words = seek.dataset.words.split('|');
    let cur = 0, timer = null, running = false;
    const wait = ms => new Promise(r => { timer = setTimeout(r, ms); });
    const letter = ch => { const c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; return c; };
    async function cycle() {
      if (running) return; running = true;
      seek.textContent = '';                                  // take the word over from the heading's own split
      [...words[cur]].forEach(ch => seek.appendChild(letter(ch)));
      while (running) {
        await wait(1500);   // how long a word stays
        if (!running) break;
        seek.classList.add('is-typing');
        while (seek.lastChild && running) { seek.lastChild.remove(); await wait(24); }
        cur = (cur + 1) % words.length;
        await wait(80);
        const s0 = Math.random() * PALETTE.length;
        for (const [i, ch] of [...words[cur]].entries()) {
          if (!running) break;
          const c = letter(ch); seek.appendChild(c);
          if (ch.trim()) c.animate([{ color: colourFor(s0, i) }, { color: colourFor(s0, i), offset: 0.3 }, { color: ink }], { duration: 900, easing: 'ease-out' });
          await wait(40);
        }
        seek.classList.remove('is-typing');
      }
    }
    const stop = () => { running = false; clearTimeout(timer); seek.classList.remove('is-typing'); seek.textContent = words[cur]; };
    const title = seek.closest('h2');
    document.addEventListener('langchange', () => {   // the heading's text was replaced: take the new word list and go on
      running = false; clearTimeout(timer);            // the old loop stays parked on its cleared timer and never resumes
      seek = title.querySelector('.seek[data-words]');
      words = seek.dataset.words.split('|'); cur = 0;
      const r = title.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) setTimeout(cycle, 300);
    });
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { stop(); return; }
      // wait until the heading has had its own entrance (wave-title), then start
      setTimeout(cycle, title.classList.contains('wave-wait') ? 900 : 300);
    }, { threshold: 0.5 }).observe(title);
  }

  /* ── rolling button labels (styles in motion.css §6) ── */
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduce) {
    const addRoll = btn => {
      const node = [...btn.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      if (!node) return;
      const label = node.textContent.trim();
      const roll = document.createElement('span');
      roll.className = 'roll';
      roll.innerHTML = `<span class="roll__default"></span><span class="roll__hover" aria-hidden="true"><span></span><span class="roll__accent"></span></span>`;
      roll.querySelector('.roll__default').textContent = label;
      roll.querySelectorAll('.roll__hover > span').forEach(s => s.textContent = label);
      node.replaceWith(roll);
      btn.classList.add('has-roll');
    };
    document.querySelectorAll('.pill, .lang__opt, a.tag, .case-nav__link').forEach(addRoll);
    window.__addRoll = addRoll;                   // lang-swap.js: a label whose text was replaced rolls again
  }

  /* ── touch screens (no hover): 1) the same roll plays on tap; 2) the main buttons (contact row) roll once,
        one after another, when they scroll into view. After the roll the label snaps back invisibly
        (both faces show the same ink text), so it never rolls twice. ── */
  function playRoll(btn) {
    if (!btn.classList.contains('has-roll') || btn._rolling) return;
    btn._rolling = true;
    btn.classList.add('is-tap');
    setTimeout(() => {
      btn.classList.add('roll-reset');            // no transitions for one frame → silent snap back
      btn.classList.remove('is-tap');
      btn.offsetHeight;
      btn.classList.remove('roll-reset');
      btn._rolling = false;
    }, 1000);
  }
  if (!reduce && !finePointer) {
    document.addEventListener('pointerdown', e => { const b = e.target.closest('.has-roll'); if (b) playRoll(b); });
    // links that leave the page wait a moment, so the roll is seen before the browser switches
    document.addEventListener('click', e => {
      const a = e.target.closest('a.has-roll');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (e.defaultPrevented || a._delayed) return;
      e.preventDefault();
      // in-page links (Cases, About): let the roll play, then glide to the section — otherwise the jump hides it
      if (href.startsWith('#')) {
        a._delayed = true;
        setTimeout(() => { a._delayed = false; document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 450);
        return;
      }
      a._delayed = true;
      setTimeout(() => { a._delayed = false; a.target === '_blank' ? window.open(a.href, '_blank', 'noopener') : (location.href = a.href); }, 220);
    });
    const main = [...document.querySelectorAll('.contact .pill-row .has-roll')];
    const bio = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      bio.disconnect();
      main.forEach((b, i) => setTimeout(() => playRoll(b), 500 + i * 140));
    }), { threshold: 1 });
    if (main[0]) bio.observe(main[0]);
  }

  /* ── page → page (motion.css §7): a header that is scrolled away (or hidden by the smart header) is left out of
        the transition, otherwise it would pop in at the top of the old page before the new one arrives ── */
  addEventListener('pageswap', e => {
    if (!e.viewTransition) return;
    const h = document.querySelector('.header');
    if (h && (h.getBoundingClientRect().bottom <= 0 || h.classList.contains('is-hidden'))) h.style.viewTransitionName = 'none';
  });
  addEventListener('pageshow', () => { const h = document.querySelector('.header'); if (h) h.style.viewTransitionName = ''; });

  /* ── case covers: wait until the picture (or the video's first frame) is decoded, then fade it in from scale 1.12 ── */
  const cards = [...document.querySelectorAll('.work__grid > .case-card')];
  const ready = media => {
    const img = media.querySelector('img'), vid = media.querySelector('video');
    if (img) { img.loading = 'eager'; return (img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; })).then(() => img.decode?.().catch(() => {})); }
    if (vid?.poster) { const p = new Image(); p.src = vid.poster; return p.decode().catch(() => {}); }
    return Promise.resolve();
  };
  if (!reduce) {
    const loadedAtC = performance.now(), seenC = new WeakSet();
    cards.forEach((card, i) => { card.classList.add('reveal'); card.style.setProperty('--d', `${i * 120}ms`); card._ready = ready(card.querySelector('.case-card__media')); });
    let answeredC = false;
    const cio = new IntersectionObserver(entries => { answeredC = true; entries.forEach(e => {
      const first = !seenC.has(e.target); seenC.add(e.target);
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const card = e.target, media = card.querySelector('.case-card__media'), pic = media.firstElementChild;
      if (first && performance.now() < loadedAtC + 400) { card.classList.add('is-in'); return; }   // on screen at load
      const delay = parseFloat(card.style.getPropertyValue('--d')) || 0;
      card._ready.then(() => {
        card.classList.add('is-in');
        media.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay, easing: EASE_OUT, fill: 'backwards' });
        pic.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 900, delay, easing: EASE_OUT, fill: 'backwards' });   // was 1.6 s
      });
    }); }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    cards.forEach(c => cio.observe(c));
    setTimeout(() => { if (!answeredC) cards.forEach(c => c.classList.add('is-in')); }, 2500);   // observer silent → never leave covers hidden
  }
})();
