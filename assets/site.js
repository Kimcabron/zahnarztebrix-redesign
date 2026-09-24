const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu(restoreFocus = false) {
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Menü öffnen');
  if (restoreFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 801px)').addEventListener('change', () => closeMenu());

const gallery = document.querySelector('[data-gallery]');
if (gallery) {
  const slides = [
    { src: 'assets/room1.webp', srcset: 'assets/room1-640.webp 640w, assets/room1-960.webp 960w, assets/room1-1120.webp 1120w, assets/room1.webp 1400w', alt: 'Heller Behandlungsraum mit blauem Behandlungsstuhl', caption: 'Ein Blick in unseren Behandlungsraum' },
    { src: 'assets/room2.webp', srcset: 'assets/room2-640.webp 640w, assets/room2-960.webp 960w, assets/room2-1120.webp 1120w, assets/room2.webp 1400w', alt: 'Behandlungsraum mit rotem Behandlungsstuhl und Tageslicht', caption: 'Raum für Ihre Zahngesundheit' },
    { src: 'assets/waiting.webp', srcset: 'assets/waiting-400.webp 400w, assets/waiting.webp 791w', alt: 'Wartebereich mit Sitzplätzen und einer Spielecke', caption: 'Ankommen in unserer Praxis' }
  ];
  let current = 0;
  function showSlide(offset) {
    current = (current + offset + slides.length) % slides.length;
    const slide = slides[current];
    const img = gallery.querySelector('img');
    img.srcset = slide.srcset;
    img.src = slide.src;
    img.alt = slide.alt;
    gallery.querySelector('.gallery-caption').textContent = slide.caption;
    gallery.querySelector('.gallery-count').textContent = `0${current + 1} / 03`;
  }
  gallery.querySelector('[data-prev]').addEventListener('click', () => showSlide(-1));
  gallery.querySelector('[data-next]').addEventListener('click', () => showSlide(1));
  gallery.querySelector('.gallery-controls').hidden = false;
}
