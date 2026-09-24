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

/* ---------- Laufband für Praxisferien & Hinweise ----------
   Der Text steht in einer Google-Tabelle (Datei → Freigeben → Im Web veröffentlichen → CSV).
   Die Adresse des CSV-Links kommt hier hinein. Leer lassen = kein Laufband.
   Einfachste Nutzung: Text in Zelle A1 schreiben = Laufband an, Zelle leeren = Laufband aus.
   Optional (weitere Zeilen möglich): Spalte A = Text, B = Von, C = Bis
   (Datum als TT.MM.JJJJ oder JJJJ-MM-TT; "Von"/"Bis" dürfen leer bleiben). */
const LAUFBAND_CSV = "https://docs.google.com/spreadsheets/d/1-0pkiOZrhKh2bS8Csy2AUB_MSs2v6Adnt1IXYG9syDg/gviz/tq?tqx=out:csv&headers=0";

(function laufband() {
  if (!LAUFBAND_CSV) return;

  const heuteBerlin = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date()); // JJJJ-MM-TT
  const alsIso = (s) => {
    s = (s || "").trim();
    let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : "";
  };
  // Minimaler CSV-Leser (Anführungszeichen, Kommas und Zeilenumbrüche in Zellen)
  const csv = (text) => {
    const zeilen = []; let zeile = [], zelle = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { zelle += '"'; i++; } else q = false; } else zelle += c; }
      else if (c === '"') q = true;
      else if (c === ",") { zeile.push(zelle); zelle = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; zeile.push(zelle); zeilen.push(zeile); zeile = []; zelle = ""; }
      else zelle += c;
    }
    if (zelle || zeile.length) { zeile.push(zelle); zeilen.push(zeile); }
    return zeilen;
  };

  fetch(LAUFBAND_CSV, { cache: "no-store" })
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((text) => {
      const heute = heuteBerlin();
      const texte = csv(text)
        .filter(([t, von, bis]) => {
          if (!(t || "").trim()) return false;
          const v = alsIso(von), b = alsIso(bis);
          return (!v || v <= heute) && (!b || heute <= b);
        })
        .map(([t]) => t.trim());
      if (!texte.length) return;

      const band = document.createElement("div");
      band.className = "laufband";
      band.setAttribute("role", "region");
      band.setAttribute("aria-label", "Aktuelle Hinweise");
      const spur = document.createElement("div");
      spur.className = "laufband__spur";
      // Zweimal, damit die Schleife nahtlos läuft; die Kopie ist für Screenreader ausgeblendet
      [false, true].forEach((kopie) => {
        const p = document.createElement("p");
        if (kopie) p.setAttribute("aria-hidden", "true");
        p.textContent = texte.join("   ·   ") + "   ·   ";
        spur.appendChild(p);
      });
      // Geschwindigkeit ~ 60 px/s, unabhängig von der Textlänge
      band.appendChild(spur);
      const kopf = document.querySelector('.site-header');
      if (kopf) kopf.before(band); else document.body.prepend(band);
      spur.style.animationDuration = Math.max(15, spur.firstChild.scrollWidth / 60) + "s";
    })
    .catch(() => {}); // Tabelle nicht erreichbar: Seite bleibt einfach ohne Laufband
})();
