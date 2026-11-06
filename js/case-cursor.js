// Case covers on the home page: a small white label «Открыть кейс» rides with the cursor over the cover (her ref, 2026-11-06).
// Mouse only. It eases after the cursor (lerp), grows in on enter and shrinks out on leave; frames run only while it moves.
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const text = document.documentElement.lang === 'en' ? 'Open case' : 'Открыть кейс';
  document.querySelectorAll('.case-card').forEach(card => {
    const media = card.querySelector('.case-card__media'); if (!media) return;
    const tag = Object.assign(document.createElement('span'), { className: 'ccur t-label', textContent: text });
    tag.setAttribute('aria-hidden', 'true');
    media.appendChild(tag);
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, box = null;
    const frame = () => {
      x += (tx - x) * (reduce ? 1 : 0.2); y += (ty - y) * (reduce ? 1 : 0.2);
      tag.style.translate = `${x}px ${y}px`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(frame) : 0;
    };
    const aim = e => { tx = e.clientX - box.left; ty = e.clientY - box.top; if (!raf) raf = requestAnimationFrame(frame); };
    media.addEventListener('pointerenter', e => {
      box = media.getBoundingClientRect();
      x = tx = e.clientX - box.left; y = ty = e.clientY - box.top;   // appear right at the cursor, no fly-in from a corner
      tag.style.translate = `${x}px ${y}px`;
      tag.classList.add('is-on');
    });
    media.addEventListener('pointermove', e => { if (box) aim(e); });
    media.addEventListener('pointerleave', () => { tag.classList.remove('is-on'); box = null; });
    addEventListener('scroll', () => { if (box) box = media.getBoundingClientRect(); }, { passive: true });
  });
})();
