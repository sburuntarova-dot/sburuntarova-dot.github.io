// Closing block (her choice, 2026-11-06): the channels as the site's plain pills, no popover. Почта copies on click
// (Telegram is a plain link to her chat since 2026-11-10) — the label rolls to «Скопировано» (the roll lives in contact.css) and the pill's text box eases from the label's
// width to the message's and back, so the pill never sits half-empty.
(() => {
  const msg = () => (document.documentElement.lang === 'en' ? 'Copied!' : 'Скопировано');
  const live = document.querySelector('.clist .cpop__sr');
  const copyText = text => {
    if (navigator.clipboard && isSecureContext) return navigator.clipboard.writeText(text);
    const ta = Object.assign(document.createElement('textarea'), { value: text, readOnly: true });
    Object.assign(ta.style, { position: 'fixed', opacity: 0, left: '-9999px' });
    document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove();
    return ok ? Promise.resolve() : Promise.reject();
  };
  document.querySelectorAll('.clist [data-copy]').forEach(b => {
    const box = b.querySelector('.cpop__txt'), label = box.firstElementChild, done = box.lastElementChild;
    const fit = el => { box.style.width = el.scrollWidth + 'px'; };
    document.fonts.ready.then(() => fit(label));
    document.addEventListener('langchange', () => { b.classList.remove('is-done'); fit(label); });
    let t;
    b.addEventListener('click', async () => {
      try { await copyText(b.dataset.copy); } catch { return; }
      if (b.classList.contains('is-done')) { b.classList.remove('is-done'); void b.offsetWidth; }
      b.classList.add('is-done'); fit(done); if (live) live.textContent = msg();
      clearTimeout(t); t = setTimeout(() => { b.classList.remove('is-done'); fit(label); if (live) live.textContent = ''; }, 1400);
    });
  });
})();
