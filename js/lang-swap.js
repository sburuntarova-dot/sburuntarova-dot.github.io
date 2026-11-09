// RU ⇄ EN without leaving the page (her ask, 2026-11-09, as on her refs: «ничего не меняется, только слова»).
// The two language versions of a page have the same markup, so: take both pristine documents, walk them side by side, and
// change in the live page only what differs — texts and attributes. Videos, scroll, animations and state stay untouched.
// Blocks that build their own text (gallery, contact stack, rotating words) listen for the `langchange` event.
(() => {
  const H = document.documentElement, cache = {};
  const load = u => cache[u] || (cache[u] = fetch(u).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(t => new DOMParser().parseFromString(t, 'text/html')).catch(e => { delete cache[u]; throw e; }));
  const kids = el => [...el.children].filter(c => c.tagName !== 'SCRIPT');
  const own = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('|');
  // live elements the scripts added (a nav dot, a label over a cover) are skipped: a pristine child pairs with the next live one of its kind
  const same = (live, k) => live.tagName === k.tagName && (!k.classList[0] || live.classList.contains(k.classList[0]));

  function swap(live, b) {
    live.innerHTML = b.innerHTML;
    live.removeAttribute('data-text');                        // the typing effect remembers its text there
    delete live._letters;
    if (live.hasAttribute('aria-label') && !b.hasAttribute('aria-label')) live.setAttribute('aria-label', live.textContent.trim());
    if (window.__addRoll) [live, ...live.querySelectorAll('*')].forEach(el => {
      if (el.matches('.pill, .lang__opt, a.tag, .case-nav__link')) window.__addRoll(el);
    });
  }
  function diff(a, b, live, ops) {
    new Set([...a.getAttributeNames(), ...b.getAttributeNames()]).forEach(n => {
      const v = b.getAttribute(n);
      if (a.getAttribute(n) !== v) ops.push(() => (v === null ? live.removeAttribute(n) : live.setAttribute(n, v)));
    });
    const ka = kids(a), kb = kids(b);
    if (ka.length !== kb.length || own(a) !== own(b) || ka.some((k, i) => k.tagName !== kb[i].tagName)) {
      if (a.innerHTML !== b.innerHTML) ops.push(() => swap(live, b));
      return;
    }
    const lk = kids(live);
    let at = 0;
    ka.forEach((k, i) => {
      while (at < lk.length && !same(lk[at], k)) at++;
      if (at < lk.length) diff(k, kb[i], lk[at++], ops);
    });
  }

  // the address of each version: the plain one shows the page we are on, whatever its language
  const urls = to => {
    const here = location.href.split('#')[0].split('?')[0];
    const target = new URL(to, location.href).href.split('#')[0];
    const toEn = H.lang !== 'en';
    return { target, current: toEn ? here : new URL(to === './' ? 'en' : 'en.html', location.href).href };
  };
  let busy = false;
  async function go(btn) {
    if (busy) return;
    busy = true;
    const to = btn.dataset.href, lang = H.lang === 'en' ? 'ru' : 'en';
    try {
      const { target, current } = urls(to);
      const [from, into] = await Promise.all([load(current), load(target)]);
      const ops = [];
      diff(from.body, into.body, document.body, ops);
      ops.forEach(f => f());
      H.lang = lang;
      document.title = into.title;
      const hero = document.querySelector('.hero__title');
      const shown = hero && [...hero.children].find(el => el.offsetParent);
      if (shown) hero.setAttribute('aria-label', shown.textContent.trim());
      document.querySelectorAll('.case-nav a').forEach(a => { delete a._letters; });
      document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    } catch (e) {
      location.href = to;                                     // no network or an unexpected page: the ordinary way
    }
    busy = false;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.lang__opt[data-href]');
    if (!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    go(b);
  }, true);

  // both versions are small: fetch them ahead, so the switch is instant
  const ahead = () => {
    const b = document.querySelector('.lang__opt[data-href]');
    if (!b) return;
    const { target, current } = urls(b.dataset.href);
    load(target).catch(() => {}); load(current).catch(() => {});
  };
  addEventListener('load', () => (window.requestIdleCallback ? requestIdleCallback(ahead, { timeout: 3000 }) : setTimeout(ahead, 1500)), { once: true });
})();
