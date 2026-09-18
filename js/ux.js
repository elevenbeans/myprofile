export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function revealAll() {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

export function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  targets.forEach((el, index) => {
    el.style.setProperty('--reveal-delay', Math.min(index * 40, 120) + 'ms');
  });
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  targets.forEach((el) => observer.observe(el));
}

export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0;
    bar.style.transform = 'scaleX(' + ratio + ')';
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

export function initBackToTop() {
  const button = document.querySelector('.back-to-top');
  if (!button) return;
  const onScroll = () => {
    button.classList.toggle('visible', window.scrollY > window.innerHeight * 1.5);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
}
