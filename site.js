const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    menuButton.focus();
  }
});
const tourTabs = [...document.querySelectorAll('[data-tour]')];
function selectTour(tab, moveFocus = false) {
  tourTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#tour-panel').setAttribute('aria-labelledby', tab.id);
  for (const field of ['quote', 'title', 'body', 'note']) {
    document.querySelector(`#tour-${field}`).textContent = tab.dataset[field];
  }
  const page = document.documentElement.lang === 'ko' ? 'ko.html' : 'index.html';
  const route = `./demo/${page}?request=${encodeURIComponent(tab.dataset.tour)}`;
  document.querySelector('#demo-frame').src = route;
  document.querySelector('#tour-open').href = route;
  if (moveFocus) tab.focus();
}
tourTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTour(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tourTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tourTabs.length) % tourTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tourTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTour(tourTabs[next], true); }
  });
});

const gallery = document.querySelector('.hero-gallery');
if (gallery) {
  const slides = [...gallery.querySelectorAll('.gallery-slide')];
  const dots = [...gallery.querySelectorAll('[data-slide]')];
  let active = 0;
  let pointerStart;
  function showSlide(index) {
    active = (index + slides.length) % slides.length;
    gallery.querySelector('.gallery-track').style.transform = `translateX(-${active * 100}%)`;
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', String(i !== active));
      slide.inert = i !== active;
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
    gallery.querySelector('.gallery-status').textContent = `${active + 1} / ${slides.length}`;
  }
  gallery.querySelector('.gallery-prev').addEventListener('click', () => showSlide(active - 1));
  gallery.querySelector('.gallery-next').addEventListener('click', () => showSlide(active + 1));
  dots.forEach(dot => dot.addEventListener('click', () => showSlide(Number(dot.dataset.slide))));
  gallery.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') showSlide(active - 1);
    if (event.key === 'ArrowRight') showSlide(active + 1);
    if (event.key === 'Home') showSlide(0);
    if (event.key === 'End') showSlide(slides.length - 1);
  });
  const window = gallery.querySelector('.gallery-window');
  window.addEventListener('pointerdown', event => {
    pointerStart = {x: event.clientX, y: event.clientY};
    window.setPointerCapture(event.pointerId);
  });
  window.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) showSlide(active + (dx < 0 ? 1 : -1));
    pointerStart = null;
  });
  window.addEventListener('pointercancel', () => { pointerStart = null; });
  showSlide(0);
}
