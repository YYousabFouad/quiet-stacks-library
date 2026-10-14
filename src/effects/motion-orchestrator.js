/**
 * Quiet Stacks Library — Motion Orchestrator (Anime.js)
 * Coordinates cinematic entrance, staggered form field reveals,
 * micro-interactions, spring tab transitions, and the dashboard zoom-out.
 */
import anime from 'animejs';

export function animatePageEntrance() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tl = anime.timeline({ easing: 'easeOutCubic' });

  tl.add({
    targets: '.auth-brand-badge',
    opacity: [0, 1],
    translateY: [-12, 0],
    duration: 500,
  })
    .add(
      {
        targets: ['.auth-crest-icon', '.auth-brand-title', '.auth-brand-subtitle'],
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 600,
        delay: anime.stagger(60),
      },
      '-=300'
    )
    .add(
      {
        targets: '.library-book',
        opacity: [0, 1],
        scale: [0.96, 1],
        translateY: [16, 0],
        duration: 700,
        easing: 'easeOutQuint',
      },
      '-=400'
    )
    .add(
      {
        targets: '.book-tab-nav',
        opacity: [0, 1],
        translateY: [-8, 0],
        duration: 450,
      },
      '-=450'
    );
}

export function animateIncomingFields(containerEl) {
  if (!containerEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = containerEl.querySelectorAll('.auth-form-group, .auth-btn-submit, .auth-title, .auth-subtitle');
  if (!targets.length) return;

  anime({
    targets,
    opacity: [0, 1],
    translateY: [12, 0],
    delay: anime.stagger(40, { start: 220 }),
    duration: 480,
    easing: 'easeOutCubic',
  });
}

export function animateCardShake(targetEl = document.querySelector('.library-book')) {
  if (!targetEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  anime({
    targets: targetEl,
    translateX: [-8, 8, -6, 6, -3, 3, 0],
    duration: 420,
    easing: 'easeInOutSine',
  });
}

export function animateAlertEntrance(alertEl) {
  if (!alertEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  anime({
    targets: alertEl,
    opacity: [0, 1],
    translateY: [-8, 0],
    duration: 320,
    easing: 'easeOutQuad',
  });
}

export function animateCornerFlutter(cornerEl) {
  if (!cornerEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  anime({
    targets: cornerEl,
    scale: [1, 1.25, 1.15],
    rotate: [0, -6, 0],
    duration: 380,
    easing: 'easeOutElastic(1, .6)',
  });
}

export function animateDemoAccountFill(cardEl, submitBtn) {
  if (cardEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    anime({
      targets: cardEl,
      backgroundColor: ['#fef3c7', '#faf6ed'],
      scale: [0.98, 1],
      duration: 450,
      easing: 'easeOutQuad',
    });
  }

  if (submitBtn && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    anime({
      targets: submitBtn,
      scale: [1, 1.03, 1],
      duration: 320,
      easing: 'easeOutQuad',
    });
  }
}

export function animateDashboardZoomOut(authContainer, backdropEl, onComplete) {
  if (backdropEl) {
    backdropEl.classList.add('active');
    backdropEl.style.opacity = '1';
  }

  if (authContainer) {
    authContainer.classList.add('zoom-out-active');
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  anime.timeline({ easing: 'easeInOutQuad' })
    .add({
      targets: '.library-book',
      scale: [1, 0.82],
      rotateX: [0, 8],
      boxShadow: '0 40px 80px rgba(27,67,50,0.3)',
      opacity: [1, 0],
      duration: 850,
    })
    .add(
      {
        targets: '.dashboard-reveal-banner',
        opacity: [0, 1],
        scale: [0.94, 1],
        translateY: [20, 0],
        duration: 700,
        complete: () => {
          if (typeof onComplete === 'function') onComplete();
        },
      },
      '-=500'
    );
}
