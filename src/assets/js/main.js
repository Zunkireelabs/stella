document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;

  gsap.from('#hero-headline', { duration: 1, y: 40, opacity: 0, ease: 'power3.out' });
  gsap.from('#hero-sub',      { duration: 1, y: 30, opacity: 0, ease: 'power3.out', delay: 0.25 });
  gsap.from('#hero-cta',      { duration: 0.8, y: 20, opacity: 0, ease: 'power3.out', delay: 0.5 });
});
