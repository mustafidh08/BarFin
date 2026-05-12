/**
 * js/landing.js
 * Premium Animations for KeuanganSyariah Landing Page
 * Uses GSAP for hero + CSS/IntersectionObserver for scroll reveals (more robust)
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. HERO ANIMATIONS (GSAP) ───────────────────────────
  if (typeof gsap !== 'undefined') {
    try {
      // Register ScrollTrigger jika tersedia
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }

      // Set initial state
      gsap.set('.hero-badge', { opacity: 0, y: 20 });
      gsap.set('.hero-title span', { opacity: 0, y: 30 });
      gsap.set('.hero-desc', { opacity: 0, y: 20 });
      gsap.set('.hero-buttons', { opacity: 0, y: 20 });
      gsap.set('.float-ui-container', { opacity: 0, scale: 0.9 });

      // Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.6 })
        .to('.hero-title span', { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, '-=0.3')
        .to('.hero-desc', { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
        .to('.hero-buttons', { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .to('.float-ui-container', { opacity: 1, scale: 1, duration: 0.9 }, '-=0.6');

      // Continuous floating for cards
      gsap.to('.float-card-1', { y: '-=15', duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.float-card-2', { y: '+=12', duration: 3.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.5 });
      gsap.to('.float-badge', { y: '-=8', rotation: 5, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1 });

      // Mouse parallax on hero
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
          const x = (e.clientX / window.innerWidth - 0.5) * 20;
          const y = (e.clientY / window.innerHeight - 0.5) * 20;
          gsap.to('.orb-1', { x: x * 2, y: y * 2, duration: 1.2, ease: 'power2.out' });
          gsap.to('.orb-2', { x: -x * 3, y: -y * 3, duration: 1.2, ease: 'power2.out' });
          gsap.to('.float-card-1', { x: x * 1.2, y: y * 1.2, rotationY: x * 0.3, rotationX: -y * 0.3, duration: 1.2, ease: 'power2.out' });
          gsap.to('.float-card-2', { x: -x * 0.8, y: -y * 0.8, duration: 1.2, ease: 'power2.out' });
        });
      }

      // Parallax on scroll for orbs
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.to('.parallax-bg', {
          scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true },
          y: 150, ease: 'none'
        });
      }
    } catch (e) {
      console.warn('GSAP animation error:', e);
    }
  }

  // ─── 2. SCROLL REVEAL (CSS + IntersectionObserver) ────────
  // Ini JAUH lebih reliable daripada gsap.from() + ScrollTrigger
  // Karena tidak ada risiko elemen "stuck di opacity:0"

  const revealElements = document.querySelectorAll('.fitur-card, .reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Tambahkan delay stagger berdasarkan index
          const card = entry.target;
          const siblings = Array.from(card.parentElement?.children || []);
          const siblingIndex = siblings.indexOf(card);
          
          setTimeout(() => {
            card.classList.add('revealed');
          }, siblingIndex * 100); // 100ms stagger

          observer.unobserve(card);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    revealElements.forEach(el => {
      el.classList.add('reveal-hidden');
      observer.observe(el);
    });
  } else {
    // Fallback: langsung tampilkan semua
    revealElements.forEach(el => el.classList.add('revealed'));
  }
});
