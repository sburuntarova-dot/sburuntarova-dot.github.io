// «Наверх» arrow button: launch on click, one hop the first time the footer shows (main.js does the scroll itself)
(() => {
  const b = document.querySelector('.up-btn'); if (!b) return;
  b.addEventListener('click', () => {
    b.classList.add('is-launch');
    setTimeout(() => { b.classList.add('is-reset'); b.classList.remove('is-launch'); b.blur();
      requestAnimationFrame(() => requestAnimationFrame(() => b.classList.remove('is-reset'))); }, 900);
  });
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); setTimeout(() => b.classList.add('is-hint'), 400); } }, { threshold: 1 });
  io.observe(b);
  b.addEventListener('animationend', () => b.classList.remove('is-hint'));
})();
