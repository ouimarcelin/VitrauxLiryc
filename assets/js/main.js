(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // Menu mobile
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    var setOpen = function (open) {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    };
    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('nav-open'));
    });
    header.querySelectorAll('.mobile-menu a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  // En-tête plus opaque après défilement
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Année du pied de page
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Sujet pré-sélectionné dans le formulaire de contact (?sujet=protection)
  var subject = document.querySelector('#sujet');
  if (subject) {
    var wanted = new URLSearchParams(window.location.search).get('sujet');
    if (wanted && subject.querySelector('option[value="' + wanted + '"]')) subject.value = wanted;
  }

  // Carrousels horizontaux (boutons précédent / suivant + barre de progression)
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('.carousel__track');
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var progress = carousel.querySelector('[data-carousel-progress]');
    if (!track) return;
    var step = function () {
      var slide = track.querySelector(':scope > *');
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return slide ? slide.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };
    var update = function () {
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
      if (progress) {
        var visible = track.clientWidth / track.scrollWidth;
        var ratio = max > 0 ? track.scrollLeft / max : 1;
        progress.style.width = (visible + (1 - visible) * ratio) * 100 + '%';
      }
    };
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('keydown', function (e) {
      if (e.target !== track) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // Plombs des vitraux : même épaisseur en pixels que la bordure de l’arche (--lead)
  var vitraux = document.querySelectorAll('.vitrail-svg');
  if (vitraux.length) {
    var lead = parseFloat(getComputedStyle(root).getPropertyValue('--lead')) || 3;
    var fitStroke = function (svg) {
      var w = svg.clientWidth || svg.getBoundingClientRect().width;
      var vb = svg.viewBox && svg.viewBox.baseVal;
      if (w && vb && vb.width) svg.style.strokeWidth = (lead * vb.width / w).toFixed(3);
    };
    vitraux.forEach(fitStroke);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function (entries) { entries.forEach(function (e) { fitStroke(e.target); }); });
      vitraux.forEach(function (svg) { ro.observe(svg); });
    }
  }

  // Apparition au défilement
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  items.forEach(function (el) { observer.observe(el); });
})();
