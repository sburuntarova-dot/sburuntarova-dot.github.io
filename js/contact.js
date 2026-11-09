// Contact card stack — opens from the header Contact pill, the phone mail icon and Contact me (her ref: oimachi.co).
// 1 photo + name + status (no link — her note); 2 copy mail / Telegram; 3 LinkedIn, CV. Links live here in one place.
(() => {
  const LINKS = {
    mail: 'sburuntarova@gmail.com',
    tg: 'https://t.me/sashaskool', tgName: '@sashaskool',
    linkedin: '#',   // TODO: her LinkedIn URL
    cv: '#'          // TODO: her CV (PDF)
  };
  const TEXT = {
    en: { name: 'Sasha Buruntarova', status: 'Open to a new role', copy: 'Copy', done: 'Copied!', cv: 'CV', dialog: 'Contacts' },
    ru: { name: 'Саша Бурунтарова', status: 'Открыта к новой роли', copy: 'Скопировать', done: 'Copied!', cv: 'Резюме', dialog: 'Контакты' }
  };
  const en = document.documentElement.lang === 'en';
  const T = en ? TEXT.en : TEXT.ru;
  const base = new URL('..', document.currentScript.src).href;
  const ARROW = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3.5 8.5l5-5M4.5 3.5h4v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // service icons, 20 × 20, stroke 1.5 (as the header's mail icon)
  const ic = d => `<svg class="cpop__ic" viewBox="0 0 20 20" fill="none" aria-hidden="true">${d}</svg>`;
  const I = {
    mail: ic('<rect x="2.5" y="4.17" width="15" height="11.66" rx="1.67" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 5.83 10 10.83l7.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'),
    tg: ic('<path d="M17.5 3.33 2.5 9.17l5 1.66m10-7.5-2.5 13.34-7.5-5.83m10-7.51-10 7.51m0 0v4.16l2.5-2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'),
    in: ic('<rect x="2.5" y="2.5" width="15" height="15" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M6.67 9.17v4.16M6.67 6.67v.01M10 13.33V9.17m0 1.66c0-1 .83-1.66 1.67-1.66s1.66.66 1.66 1.66v2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'),
    cv: ic('<path d="M11.67 2.5H5.83c-.92 0-1.66.75-1.66 1.67v11.66c0 .92.74 1.67 1.66 1.67h8.34c.92 0 1.66-.75 1.66-1.67V6.67L11.67 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M11.67 2.5v4.17h4.16M7.5 10.83h5M7.5 13.33h3.33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>')
  };
  const CHECK = '<svg class="cpop__ok" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const COPY = '<svg class="cpop__cp" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 3.5v-.5a1 1 0 0 0-1-1H3.5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  // the copy row: the address and «Copied!» share one grid cell (the row keeps the address's width); the icon slot holds copy + check
  const row = (v, label, icon) => `<button class="cpop__row t-label" type="button" data-copy="${v}" aria-label="${T.copy}: ${v}">${icon}` +
    `<span class="cpop__txt"><span class="cpop__addr">${label}</span><span class="cpop__done" aria-hidden="true">${T.done}</span></span>` +
    `<span class="cpop__ico">${COPY}${CHECK}</span></button>`;
  const ext = 'target="_blank" rel="noopener"';

  const pop = document.createElement('div');
  pop.className = 'cpop'; pop.id = 'contact-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', en ? 'Contacts' : 'Контакты');
  pop.innerHTML = `
    <div class="cpop__card cpop__me" style="--i:0">
      <img src="${base}assets/img/hero-portrait-480.webp" alt="" width="80" height="80" loading="lazy">
      <span><span class="cpop__name">${T.name}</span><span class="cpop__status t-label"><span class="pill__dot" aria-hidden="true"></span>${T.status}</span></span>
    </div>
    <div class="cpop__card cpop__copy" style="--i:1">
      ${row(LINKS.mail, LINKS.mail, I.mail)}
      ${row(LINKS.tgName, LINKS.tgName, I.tg)}
    </div>
    <div class="cpop__card cpop__links" style="--i:2">
      <a class="cpop__link t-label" href="${LINKS.linkedin}" ${ext}><span class="cpop__lbl">${I.in}LinkedIn</span><span class="cpop__arrow">${ARROW}</span></a>
      <a class="cpop__link t-label" href="${LINKS.cv}" ${ext}><span class="cpop__lbl">${I.cv}${T.cv}</span><span class="cpop__arrow">${ARROW}</span></a>
    </div>`;
  const veil = document.createElement('div'); veil.className = 'cpop-veil';
  document.body.append(pop, veil);
  document.addEventListener('langchange', e => {
    const t = TEXT[e.detail.lang];
    pop.setAttribute('aria-label', t.dialog);
    pop.querySelector('.cpop__name').textContent = t.name;
    pop.querySelector('.cpop__status').lastChild.textContent = t.status;
    pop.querySelectorAll('.cpop__row').forEach(b => b.setAttribute('aria-label', `${t.copy}: ${b.dataset.copy}`));
    pop.querySelector('.cpop__links .cpop__link:last-child .cpop__lbl').lastChild.textContent = t.cv;
  });

  // the Telegram pills on the page get the real link too
  document.querySelectorAll('a.pill').forEach(a => { if (a.textContent.trim() === 'TG') a.href = LINKS.tg; });

  const triggers = [...document.querySelectorAll('a.pill--contact, a.icon-btn[href^="mailto"], a.pill--primary[href^="mailto"]')];
  let anchor = null;
  const u = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) / (innerWidth < 900 ? 390 : 1920) || 1;
  function place() {
    if (!anchor || innerWidth < 900) return;
    const r = anchor.getBoundingClientRect(), gap = 6 * u(), w = pop.offsetWidth, h = pop.offsetHeight;
    const left = Math.max(10, Math.min(r.right - w, innerWidth - w - 10));
    const up = r.bottom + gap + h > innerHeight && r.top - gap - h > 0;
    pop.classList.toggle('is-up', up);
    pop.style.left = left + 'px';
    pop.style.top = (up ? r.top - gap - h : r.bottom + gap) + 'px';
    // the stack unfolds out of its button: scale from the button's centre on the edge that touches it
    pop.style.transformOrigin = `${Math.round(r.left + r.width / 2 - left)}px ${up ? '100%' : '0'}`;
  }
  function open(a) {
    anchor = a; place();
    pop.classList.add('is-open'); veil.classList.add('is-open');
    triggers.forEach(t => t.setAttribute('aria-expanded', t === a));
  }
  function close() {
    if (!anchor) return;
    pop.classList.remove('is-open'); veil.classList.remove('is-open');
    triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
    anchor = null;
  }
  triggers.forEach(a => {
    a.setAttribute('aria-haspopup', 'dialog'); a.setAttribute('aria-controls', pop.id); a.setAttribute('aria-expanded', 'false');
    a.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); anchor === a ? close() : open(a); });
  });
  document.addEventListener('click', e => { if (anchor && !pop.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && anchor) { const a = anchor; close(); a.focus(); } });
  addEventListener('resize', place);

  // phone: the sheet follows a finger down and closes on a flick or past a third of its height (else springs back)
  let drag = null;
  pop.addEventListener('pointerdown', e => {
    if (innerWidth >= 900 || e.pointerType === 'mouse' || !anchor) return;
    drag = { y: e.clientY, t: performance.now(), dy: 0, on: false };
  });
  pop.addEventListener('pointermove', e => {
    if (!drag) return;
    const dy = e.clientY - drag.y;
    if (!drag.on) { if (Math.abs(dy) < 6) return; drag.on = true; pop.classList.add('is-dragging'); pop.setPointerCapture(e.pointerId); }
    drag.dy = dy > 0 ? dy : dy / 4;            // upward: resists (friction instead of a hard stop)
    pop.style.transform = `translateY(${drag.dy}px)`;
  });
  const endDrag = () => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.on) return;
    const v = d.dy / (performance.now() - d.t);
    pop.classList.remove('is-dragging');
    if (d.dy > pop.offsetHeight / 3 || v > 0.11) close();
    pop.style.transform = '';                  // CSS takes it from here: back to open, or on down to closed
    // a drag is not a tap: swallow the click that may follow on a card
    const swallow = ev => { ev.stopPropagation(); ev.preventDefault(); };
    pop.addEventListener('click', swallow, true);
    setTimeout(() => pop.removeEventListener('click', swallow, true), 0);
  };
  pop.addEventListener('pointerup', endDrag);
  pop.addEventListener('pointercancel', endDrag);
  // desktop: the stack hangs from its button — it closes when the page scrolls away
  addEventListener('scroll', () => { if (anchor && innerWidth >= 900) close(); }, { capture: true, passive: true });   // closed: nothing to read (innerWidth forced a layout on every scroll)

  // as at oimachi.co: the address itself turns into «Copied!» for a moment (the row keeps its width — no jump)
  function copyText(text) {
    if (navigator.clipboard && isSecureContext) return navigator.clipboard.writeText(text);
    // plain http (the LAN preview): the Clipboard API is off — the old textarea route
    const ta = Object.assign(document.createElement('textarea'), { value: text, readOnly: true });
    Object.assign(ta.style, { position: 'fixed', opacity: 0, left: '-9999px' });
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove();
    return ok ? Promise.resolve() : Promise.reject();
  }
  // copied: the address rolls up, «Copied!» rolls in, the copy icon becomes a check (no gradient — her note).
  // All CSS transitions → a second click mid-way retargets instead of restarting (her ref: interruptible animations).
  const live = Object.assign(document.createElement('span'), { className: 'cpop__sr' });
  live.setAttribute('aria-live', 'polite'); pop.appendChild(live);
  pop.querySelectorAll('[data-copy]').forEach(b => {
    let t;
    b.addEventListener('click', async () => {
      try { await copyText(b.dataset.copy); } catch { return; }
      if (b.classList.contains('is-done')) { b.classList.remove('is-done'); void b.offsetWidth; }   // again: replay the roll
      b.classList.add('is-done'); live.textContent = T.done;
      clearTimeout(t); t = setTimeout(() => { b.classList.remove('is-done'); live.textContent = ''; }, 1400);
    });
  });
})();
