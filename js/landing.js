/**
 * js/landing.js
 * GSAP Animations for Awwwards-style Landing Page
 */

document.addEventListener('DOMContentLoaded', () => {
  // Pastikan GSAP tersedia
  if (typeof gsap === 'undefined') return;

  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // 1. Mouse Move Parallax (Orbs & Floating Elements)
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      // Gerakkan Orbs dengan kecepatan berbeda
      gsap.to('.orb-1', { x: x * 2, y: y * 2, duration: 1, ease: 'power2.out' });
      gsap.to('.orb-2', { x: -x * 3, y: -y * 3, duration: 1, ease: 'power2.out' });
      
      // Sedikit gerakkan floating cards untuk efek 3D
      gsap.to('.float-card-1', { x: x * 1.5, y: y * 1.5, rotationY: x * 0.5, rotationX: -y * 0.5, duration: 1, ease: 'power2.out' });
      gsap.to('.float-card-2', { x: -x * 1, y: -y * 1, rotationY: x * 0.3, rotationX: -y * 0.3, duration: 1, ease: 'power2.out' });
    });
  }

  // 2. Initial Hero Animations
  const tlHero = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Sembunyikan elemen sebelum dianimasikan (CSS akan menanganinya, tapi pastikan)
  gsap.set('.hero-badge, .hero-title, .hero-desc, .hero-buttons, .float-ui-container', { opacity: 0 });
  gsap.set('.hero-title span', { opacity: 0, y: 30 });
  
  // Animasi berurutan
  tlHero
    .to('.hero-badge', { opacity: 1, y: 0, duration: 0.6, yFrom: 20 })
    .to('.hero-title span', { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, "-=0.3")
    .to('.hero-desc', { opacity: 1, y: 0, duration: 0.8, yFrom: 20 }, "-=0.5")
    .to('.hero-buttons', { opacity: 1, y: 0, duration: 0.8, yFrom: 20 }, "-=0.6")
    .to('.float-ui-container', { opacity: 1, scale: 1, duration: 1, scaleFrom: 0.9 }, "-=0.8");

  // 3. Continuous Floating Animation (Yoyo)
  gsap.to('.float-card-1', {
    y: "-=15",
    duration: 3,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });
  
  gsap.to('.float-card-2', {
    y: "+=12",
    duration: 3.5,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    delay: 0.5
  });

  gsap.to('.float-badge', {
    y: "-=8",
    rotation: 5,
    duration: 2.5,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    delay: 1
  });

  // 4. Scroll-Triggered Animations untuk bagian Fitur
  const fiturCards = document.querySelectorAll('.fitur-card');
  if (fiturCards.length > 0) {
    gsap.from(fiturCards, {
      scrollTrigger: {
        trigger: '#fitur',
        start: 'top 80%', // Animasi mulai saat bagian top #fitur mencapai 80% layar
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'back.out(1.2)'
    });
  }

  // 5. Parallax Scroll Effect
  gsap.to('.parallax-bg', {
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    },
    y: 150,
    ease: 'none'
  });
});
