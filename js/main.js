// Portfolio — home page behaviour.
// Gallery data mirrors the Figma frames: «03b — Gallery» (Соцсети) and «Gallery state — Реклама (Desktop)» 449:12137,
// desktop 5 columns; mobile «03b / Gallery» — 2 columns, 8 works + «Показать ещё».

const mqMobile = window.matchMedia('(max-width: 899px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── gallery data ──────────────────────────────────────────────────── */
const CATEGORIES = {
  social: {
    label: 'Соцсети',
    works: {
      may:       { img: 'social-01', title: 'Майская распродажа −50%', type: 'Пост' },
      corona:    { img: 'social-02', title: 'Анонс курса по Corona', type: 'Пост' },
      cartelle:  { img: 'social-03', mImg: 'm-cartelle', title: 'Интервью с Cartelle Design', type: 'Обложка' },
      hongkun:   { img: 'social-04', title: 'Разбор Hongkun Art Gallery', type: 'Рилс' },
      ipad:      { img: 'social-05', title: 'Зачем архитектору iPad', type: 'Пост' },
      skills:    { img: 'social-06', mImg: 'm-skills', title: 'Карта навыков дизайнера', type: 'Пост' },
      hiring:    { img: 'social-07', title: 'Вакансия «We Are Hiring»', type: 'Сторис' },
      portfolio: { img: 'social-08', title: 'Курс «Портфолио мечты»', type: 'Пост' },
      antique:   { img: 'social-09', title: 'Античность в цифре', type: 'Пост' },
      ai:        { img: 'social-10', title: 'Два новых курса по нейросетям', type: 'Сторис' },
    },
    // [column width (3 = wide, 2 = narrow), [work, aspect ratio]…]
    desktop: [
      ['3', [['may', '467/584'], ['corona', '1/1']]],
      ['3', [['cartelle', '467/263'], ['hongkun', '467/584']]],
      ['2', [['ipad', '308/385'], ['skills', '1/1']]],
      ['2', [['hiring', '308/548'], ['portfolio', '1/1']]],
      ['2', [['antique', '308/385'], ['ai', '308/548']]],
    ],
    mobile: [
      [['may', '184.5/231'], ['hongkun', '184.5/231'], ['skills', '184.5/185'], ['antique', '184.5/231'], ['portfolio', '1/1', true]],
      [['corona', '184.5/185'], ['cartelle', '184.5/104'], ['ipad', '184.5/231'], ['hiring', '184.5/328'], ['ai', '308/548', true]],
    ],
  },
  ads: {
    label: 'Реклама',
    works: {
      school:    { img: 'ad-01', title: 'Распродажа Back to School', type: 'Баннер' },
      revit:     { img: 'ad-02', title: 'Скидка на Revit', type: 'Креатив' },
      teaser:    { img: 'ad-03', title: 'Тизер распродажи', type: 'Моушн' },
      blender:   { img: 'ad-04', title: 'Промо курса по Blender', type: 'Моушн' },
      stream:    { img: 'ad-05', title: 'Анонс нового потока', type: 'Моушн' },
      target:    { img: 'ad-06', title: 'Креатив для таргета', type: 'Креатив' },
      yandex:    { img: 'ad-07', title: 'Реклама в Яндексе', type: 'Баннер' },
      webinar:   { img: 'ad-08', title: 'Вебинар по нейросетям', type: 'Обложка' },
      telegram:  { img: 'ad-09', title: 'Промо в Telegram', type: 'Креатив' },
      sale40:    { img: 'ad-10', title: 'Скидка 40% на курсы', type: 'Креатив' },
      newyear:   { img: 'ad-11', title: 'Новогодняя акция', type: 'Моушн' },
      marathon:  { img: 'ad-12', title: 'Промо марафона', type: 'Креатив' },
    },
    desktop: [
      ['3', [['school', '467/263'], ['revit', '1/1'], ['teaser', '467/263']]],
      ['2', [['blender', '308/548'], ['stream', '1/1']]],
      ['3', [['target', '467/584'], ['yandex', '1/1']]],
      ['2', [['webinar', '308/205'], ['telegram', '308/385'], ['sale40', '308/205']]],
      ['2', [['newyear', '308/548'], ['marathon', '308/385']]],
    ],
    // no mobile frame for «Реклама» yet: same system as «Соцсети» — desktop order, two columns, 8 + «Показать ещё»
    mobile: [
      [['school', '467/263'], ['blender', '308/548'], ['webinar', '308/205'], ['yandex', '1/1'], ['newyear', '308/548', true], ['sale40', '308/205', true]],
      [['revit', '1/1'], ['target', '467/584'], ['telegram', '308/385'], ['stream', '1/1'], ['teaser', '467/263', true], ['marathon', '308/385', true]],
    ],
  },
};

/* ── English pages (<html lang="en">): the gallery's labels and captions ── */
const EN = document.documentElement.lang === 'en';
const applyGalleryLang = (() => {
  const T = {
    social: 'Social', ads: 'Ads',
    may: ['May sale −50%', 'Post'], corona: ['Corona course launch', 'Post'], cartelle: ['Interview with Cartelle Design', 'Cover'],
    hongkun: ['Hongkun Art Gallery breakdown', 'Reel'], ipad: ['Why architects need an iPad', 'Post'], skills: ['Designer skills map', 'Post'],
    hiring: ['“We Are Hiring” job post', 'Story'], portfolio: ['“Dream Portfolio” course', 'Post'], antique: ['Antiquity, digitised', 'Post'],
    ai: ['Two new AI courses', 'Story'], school: ['Back to School sale', 'Banner'], revit: ['Revit discount', 'Creative'],
    teaser: ['Sale teaser', 'Motion'], blender: ['Blender course promo', 'Motion'], stream: ['New cohort announcement', 'Motion'],
    target: ['Paid social creative', 'Creative'], yandex: ['Yandex ad', 'Banner'], webinar: ['AI webinar', 'Cover'],
    telegram: ['Telegram promo', 'Creative'], sale40: ['40% off courses', 'Creative'], newyear: ['New Year offer', 'Motion'],
    marathon: ['Marathon promo', 'Creative'],
  };
  Object.values(CATEGORIES).forEach(c => { c.labelRu = c.label; Object.values(c.works).forEach(w => { w.ru = [w.title, w.type]; }); });
  return en => Object.entries(CATEGORIES).forEach(([k, c]) => {
    c.label = en && T[k] || c.labelRu;
    Object.entries(c.works).forEach(([id, w]) => { [w.title, w.type] = en && T[id] || w.ru; });
  });
})();
applyGalleryLang(EN);

/* ── RU / EN switch: each button with data-href leads to the same page in the other language ── */
document.querySelectorAll('.lang__opt[data-href]').forEach(b => b.addEventListener('click', () => { location.href = b.dataset.href; }));

function item(w, ar, mobile, extra) {
  const name = (mobile && w.mImg) || w.img;
  const fig = document.createElement('figure');
  fig.className = 'g-item';
  fig._w = w;
  fig.style.setProperty('--ar', ar);
  if (extra) fig.dataset.extra = '';
  fig.innerHTML =
    `<div class="g-item__img"><img src="assets/gallery/${name}-960.webp" ` +
    `srcset="assets/gallery/${name}-480.webp 480w, assets/gallery/${name}-960.webp 960w" ` +
    `sizes="${mobile ? '48vw' : '25vw'}" alt="${w.title}" loading="lazy" decoding="async"></div>` +
    `<figcaption class="t-caption">${w.title} <span class="g-item__type">/ ${w.type}</span></figcaption>`;
  // the work (picture + caption) appears only when the picture is decoded — no caption-first pop-in
  fig.classList.add('is-loading');
  const img = fig.querySelector('img');
  const ready = () => (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => fig.classList.remove('is-loading'));
  img.complete && img.naturalWidth ? ready() : img.addEventListener('load', ready, { once: true });
  img.addEventListener('error', () => fig.classList.remove('is-loading'), { once: true });
  return fig;
}

const grids = document.getElementById('gallery-grids');
const more = document.getElementById('gallery-more');
const filter = document.getElementById('gallery-filter');
const built = {};

// each category is built once (desktop + mobile columns) and then only shown / hidden: no re-render, no re-decode
function buildCategory(key) {
  const cat = CATEGORIES[key];
  const grid = document.createElement('div');
  grid.className = 'gallery__grid';
  grid.dataset.cat = key;
  cat.desktop.forEach(([cls, items]) => {
    const col = document.createElement('div');
    col.className = `gallery__col gallery__col--${cls}`;
    items.forEach(([k, ar]) => col.appendChild(item(cat.works[k], ar, false)));
    grid.appendChild(col);
  });
  cat.mobile.forEach(items => {
    const col = document.createElement('div');
    col.className = 'gallery__col gallery__col--m';
    items.forEach(([k, ar, extra]) => col.appendChild(item(cat.works[k], ar, true, extra)));
    grid.appendChild(col);
  });
  grids.appendChild(grid);
  return (built[key] = grid);
}

function show(key) {
  Object.keys(CATEGORIES).forEach(k => { if (built[k]) built[k].hidden = k !== key; });
  (built[key] || buildCategory(key)).hidden = false;
  if (more) more.hidden = built[key].querySelectorAll('[data-extra]:not(.is-shown)').length === 0;
  const keys = Object.keys(CATEGORIES);
  filter.querySelectorAll('button').forEach((b, i) => {
    const k = b.dataset.cat, on = k === key;
    b.setAttribute('aria-pressed', on);
    const n = Object.keys(CATEGORIES[k].works).length;
    b.textContent = CATEGORIES[k].label + (on ? ` (${n})` : '') + (i < keys.length - 1 ? ',' : '');   // as in Figma
  });
}

// after the page has loaded, fetch every gallery picture of this breakpoint (both categories) — the gallery is
// ready before the visitor scrolls to it and switching categories is instant (≈2 MB of WebP in total)
function preloadGallery() {
  const go = () => Object.keys(CATEGORIES).forEach(k => {
    const g = built[k] || buildCategory(k);
    if (k !== active) g.hidden = true;
    g.querySelectorAll(mqMobile.matches ? '.gallery__col--m img' : '.gallery__col--3 img, .gallery__col--2 img')
      .forEach(img => { img.loading = 'eager'; img.fetchPriority = 'low'; });
  });
  // when the browser is idle (not in the middle of the visitor's first fast scroll — decoding ≈2 MB then made it stutter)
  // …and not while the page is moving: wait for 700 ms without scrolling, then the browser's next idle moment
  let lastScroll = 0;
  addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });
  const later = () => {
    const quiet = performance.now() - lastScroll;
    if (quiet < 700) { setTimeout(later, 700 - quiet + 50); return; }
    window.requestIdleCallback ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 200);
  };
  document.readyState === 'complete' ? later() : addEventListener('load', later, { once: true });
}
let active = 'social';

if (grids && filter) {
  show('social');
  preloadGallery();
  filter.addEventListener('click', e => {
    const b = e.target.closest('button[data-cat]');
    if (!b || b.getAttribute('aria-pressed') === 'true') return;
    active = b.dataset.cat;
    // the motion layer (motion.js) can take over the switch with its own layout transition
    if (window.galleryTransition && !reduceMotion) { window.galleryTransition(b.dataset.cat, show); return; }
    if (reduceMotion) { show(b.dataset.cat); return; }
    grids.classList.add('is-switching');
    setTimeout(() => { show(b.dataset.cat); requestAnimationFrame(() => grids.classList.remove('is-switching')); }, 200);
  });
  more?.addEventListener('click', () => {
    grids.querySelectorAll('.gallery__grid:not([hidden]) [data-extra]').forEach(el => el.classList.add('is-shown'));
    more.hidden = true;
  });
  document.addEventListener('langchange', e => {
    applyGalleryLang(e.detail.lang === 'en');
    grids.querySelectorAll('.g-item').forEach(f => {
      const w = f._w;
      f.querySelector('img').alt = w.title;
      f.querySelector('figcaption').innerHTML = `${w.title} <span class="g-item__type">/ ${w.type}</span>`;
    });
    show(active);
  });
}

/* ── videos: right source per breakpoint, play only while visible ─── */
function setupVideos() {
  const videos = [...document.querySelectorAll('video[data-autoplay]')];
  const mobile = mqMobile.matches;
  videos.forEach(v => {
    if (v.dataset.ready) return;                   // the hero showreel is set up inline, right after its tag
    const base = mobile ? v.dataset.srcMobile : v.dataset.srcDesktop;
    if (mobile && v.dataset.posterMobile) v.poster = v.dataset.posterMobile;
    // H.264 first: decoded by the video chip almost everywhere (VP9 often falls back to the CPU and stutters while scrolling)
    v.innerHTML = `<source src="${base}.mp4" type="video/mp4"><source src="${base}.webm" type="video/webm">`;
    v.muted = true;
  });
  if (reduceMotion) return;                        // posters only
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        if (target.preload === 'none') { target.preload = 'auto'; target.load(); }
        target.play().catch(() => {});
      } else target.pause();
    });
  }, { rootMargin: '200px 0px' });
  videos.forEach(v => io.observe(v));
}
setupVideos();

/* «Наверх»: back to the top of whatever scrolls — the page, or the case panel on desktop case pages */
document.querySelectorAll('.footer__up').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const panel = a.closest('.case-panel');
  const box = panel && panel.scrollHeight > panel.clientHeight ? panel : window;
  box.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
}));
