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
  const route = `./demo/index.html?request=${encodeURIComponent(tab.dataset.tour)}`;
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
