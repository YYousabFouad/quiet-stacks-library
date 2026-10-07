/**
 * Quiet Stacks Library — Archival Book Authentication Controller
 * Orchestrates 3D open book page-turning physics, interactive folio tabs,
 * instant credential stamps, and the cinematic zoom-out transition to the dashboard.
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --------------------------------------------------------------------------
  // 1. Ambient Sunlight & Floating Paper Motes Particles
  // --------------------------------------------------------------------------
  function initAmbientParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particleCount = 22;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.35 + 0.1,
        speedY: Math.random() * 0.25 + 0.08,
        speedX: (Math.random() - 0.5) * 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: Math.random() > 0.5 ? '176, 125, 26' : '100, 120, 110' // Amber or Sage
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed * 0.05) * 0.005;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.08, Math.min(0.45, p.alpha))})`;
        ctx.fill();
      });

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // --------------------------------------------------------------------------
  // 2. Main Authentication Orchestrator
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    initAmbientParticles();

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const alertBox = document.getElementById('auth-alert');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const tabSlider = document.getElementById('book-tabs-slider');
    const panelLogin = document.getElementById('panel-login');
    const panelSignup = document.getElementById('panel-signup');
    const pageWrapper = document.getElementById('page-turn-wrapper');
    const linkToSignup = document.getElementById('link-to-signup');
    const linkToLogin = document.getElementById('link-to-login');
    const sessionBanner = document.getElementById('auth-active-session-banner');
    const authContainer = document.querySelector('.auth-container');
    const revealBackdrop = document.getElementById('dashboard-reveal-backdrop');

    // ------------------------------------------------------------------------
    // Initial Page Entrance Orchestration
    // ------------------------------------------------------------------------
    if (window.anime) {
      window.anime.timeline({ easing: 'easeOutCubic' })
        .add({
          targets: '.auth-brand-badge',
          opacity: [0, 1],
          translateY: [-10, 0],
          duration: 500
        })
        .add({
          targets: ['.auth-crest-icon', '.auth-brand-title', '.auth-brand-subtitle'],
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 600,
          delay: window.anime.stagger(70)
        }, '-=350')
        .add({
          targets: '.library-book',
          opacity: [0, 1],
          scale: [0.96, 1],
          translateY: [20, 0],
          duration: 750,
          easing: 'easeOutBack'
        }, '-=300')
        .add({
          targets: '.book-ribbon-bookmark',
          translateY: [-20, 0],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .8)'
        }, '-=400');
    }

    // ------------------------------------------------------------------------
    // Alerts (with icons and animated slide)
    // ------------------------------------------------------------------------
    function showAlert(message, type = 'error') {
      if (!alertBox) return;
      const isSuccess = type === 'success';

      const iconSvg = isSuccess
        ? `<svg class="auth-alert-icon" viewBox="0 0 20 20" fill="currentColor">
             <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
           </svg>`
        : `<svg class="auth-alert-icon" viewBox="0 0 20 20" fill="currentColor">
             <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
           </svg>`;

      alertBox.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
      alertBox.className = 'auth-alert visible ' + (isSuccess ? 'auth-alert-success' : 'auth-alert-error');

      if (window.anime) {
        window.anime({
          targets: alertBox,
          opacity: [0, 1],
          translateY: [-6, 0],
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
    }

    function hideAlert() {
      if (!alertBox) return;
      alertBox.className = 'auth-alert';
      alertBox.textContent = '';
    }

    function shakeCard() {
      const target = document.querySelector('.library-book');
      if (!target || !window.anime) return;
      window.anime({
        targets: target,
        translateX: [-8, 8, -6, 6, -3, 3, 0],
        duration: 450,
        easing: 'easeInOutSine'
      });
    }

    // ------------------------------------------------------------------------
    // 3D Animated Book Page-Turn Logic
    // ------------------------------------------------------------------------
    let currentMode = 'login';

    function switchPage(mode) {
      if (mode === currentMode) return;
      hideAlert();

      const isSignup = mode === 'signup';
      currentMode = mode;

      // Update Tab Buttons
      if (tabLogin && tabSignup) {
        if (isSignup) {
          tabSignup.classList.add('active');
          tabSignup.setAttribute('aria-selected', 'true');
          tabLogin.classList.remove('active');
          tabLogin.setAttribute('aria-selected', 'false');
        } else {
          tabLogin.classList.add('active');
          tabLogin.setAttribute('aria-selected', 'true');
          tabSignup.classList.remove('active');
          tabSignup.setAttribute('aria-selected', 'false');
        }
      }

      // Move slider
      if (tabSlider) {
        if (isSignup) {
          tabSlider.classList.add('pos-signup');
        } else {
          tabSlider.classList.remove('pos-signup');
        }
      }

      const outgoingPanel = isSignup ? panelLogin : panelSignup;
      const incomingPanel = isSignup ? panelSignup : panelLogin;

      if (!outgoingPanel || !incomingPanel) return;

      if (window.anime && pageWrapper) {
        // 3D Leaf Turn Sequence with Paper Lighting
        window.anime.timeline({ easing: 'easeInOutQuad' })
          .add({
            targets: outgoingPanel,
            opacity: [1, 0],
            rotateY: isSignup ? [0, -35] : [0, 35],
            translateX: isSignup ? [0, -20] : [0, 20],
            duration: 220,
            complete: () => {
              outgoingPanel.classList.remove('active');
              incomingPanel.classList.add('active');
            }
          })
          .add({
            targets: incomingPanel,
            opacity: [0, 1],
            rotateY: isSignup ? [35, 0] : [-35, 0],
            translateX: isSignup ? [20, 0] : [-20, 0],
            duration: 350,
            easing: 'easeOutCubic'
          })
          .add({
            targets: incomingPanel.querySelectorAll('.auth-form-group, .auth-btn-submit'),
            opacity: [0, 1],
            translateY: [10, 0],
            delay: window.anime.stagger(35),
            duration: 300
          }, '-=200');
      } else {
        outgoingPanel.classList.remove('active');
        incomingPanel.classList.add('active');
      }
    }

    if (tabLogin) tabLogin.addEventListener('click', () => switchPage('login'));
    if (tabSignup) tabSignup.addEventListener('click', () => switchPage('signup'));

    if (linkToSignup) {
      linkToSignup.addEventListener('click', function (e) {
        e.preventDefault();
        switchPage('signup');
      });
    }
    if (linkToLogin) {
      linkToLogin.addEventListener('click', function (e) {
        e.preventDefault();
        switchPage('login');
      });
    }

    // Initial query/hash routing
    if (window.location.hash === '#signup') {
      switchPage('signup');
    }

    window.addEventListener('hashchange', function () {
      if (window.location.hash === '#signup') {
        switchPage('signup');
      } else if (window.location.hash === '#login') {
        switchPage('login');
      }
    });

    // Check query params for messages
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('msg') === 'auth_required') {
      showAlert('Please sign in or register to access library stacks, or proceed as guest.', 'error');
    } else if (urlParams.get('msg') === 'logged_out') {
      showAlert('Signed out cleanly. Reading stack preserved.', 'success');
    }

    // ------------------------------------------------------------------------
    // Password Show/Hide Toggles
    // ------------------------------------------------------------------------
    document.querySelectorAll('.btn-password-toggle').forEach((btn) => {
      btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        if (window.anime) {
          window.anime({
            targets: this,
            scale: [0.8, 1.15, 1],
            duration: 280,
            easing: 'easeOutElastic(1, .8)'
          });
        }

        this.innerHTML = isPassword
          ? `<svg viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
               <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.11 2.454-.303z" />
             </svg>`
          : `<svg viewBox="0 0 20 20" fill="currentColor">
               <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
               <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
             </svg>`;
      });
    });

    // ------------------------------------------------------------------------
    // Password Strength Meter
    // ------------------------------------------------------------------------
    const signupPassInput = document.getElementById('signup-password');
    const strengthBars = document.querySelectorAll('.password-strength-bar');
    const strengthLabel = document.getElementById('password-strength-text');

    if (signupPassInput && strengthBars.length) {
      signupPassInput.addEventListener('input', function () {
        const val = this.value;
        let score = 0;

        if (val.length >= 6) score++;
        if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
        if (val.length >= 10 || /[^A-Za-z0-9]/.test(val)) score++;

        strengthBars.forEach((bar, idx) => {
          bar.className = 'password-strength-bar';
          if (val.length === 0) return;

          if (score === 1 && idx === 0) {
            bar.classList.add('weak');
          } else if (score === 2 && idx <= 1) {
            bar.classList.add('medium');
          } else if (score === 3) {
            bar.classList.add('strong');
          }
        });

        if (strengthLabel) {
          if (val.length === 0) {
            strengthLabel.textContent = 'Minimum 6 characters';
            strengthLabel.style.color = 'var(--color-text-muted)';
          } else if (score === 1) {
            strengthLabel.textContent = 'Weak (mix numbers & uppercase)';
            strengthLabel.style.color = '#ef4444';
          } else if (score === 2) {
            strengthLabel.textContent = 'Moderate security';
            strengthLabel.style.color = '#f59e0b';
          } else {
            strengthLabel.textContent = 'Archival Strong';
            strengthLabel.style.color = '#10b981';
          }
        }
      });
    }

    // ------------------------------------------------------------------------
    // Instant Demo Account Auto-Fill with Ink-Stamp Pulse
    // ------------------------------------------------------------------------
    document.querySelectorAll('.btn-fill-demo').forEach((btn) => {
      btn.addEventListener('click', function () {
        // If on signup page, switch to login first!
        if (currentMode !== 'login') {
          switchPage('login');
        }

        const email = this.getAttribute('data-email');
        const pass = this.getAttribute('data-pass');
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');

        if (emailInput && passInput) {
          emailInput.value = email;
          passInput.value = pass;
          hideAlert();

          const card = this.closest('.demo-account-card');
          if (card && window.anime) {
            window.anime({
              targets: card,
              backgroundColor: ['#fef3c7', '#faf6ed'],
              scale: [0.98, 1],
              duration: 500,
              easing: 'easeOutQuad'
            });
          }

          const submitBtn = document.querySelector('#login-form .auth-btn-submit');
          if (submitBtn && window.anime) {
            window.anime({
              targets: submitBtn,
              scale: [1, 1.03, 1],
              duration: 350
            });
          }

          showAlert(`Loaded credentials for ${this.getAttribute('data-name') || 'Patron'}. Click "Open Reading Stack" to enter!`, 'success');
        }
      });
    });

    // ------------------------------------------------------------------------
    // Active Session Banner
    // ------------------------------------------------------------------------
    if (sessionBanner && window.LibraryStorage) {
      const currentUser = window.LibraryStorage.getCurrentUser();
      if (currentUser) {
        const roleLabel = currentUser.role === 'admin' ? 'Chief Librarian' : (currentUser.membershipType || 'Member');
        sessionBanner.style.display = 'flex';
        sessionBanner.innerHTML = `
          <div class="auth-session-banner-text">
            Active session: <strong>${escapeHtml(currentUser.name)}</strong> (${escapeHtml(roleLabel)}).
          </div>
          <div class="auth-session-banner-actions">
            <a href="dashboard.html" class="btn btn-sm btn-primary">Enter Dashboard &rarr;</a>
            <button type="button" class="btn btn-sm btn-secondary" id="btn-banner-logout">Sign Out</button>
          </div>
        `;

        const bannerLogout = sessionBanner.querySelector('#btn-banner-logout');
        if (bannerLogout) {
          bannerLogout.addEventListener('click', function () {
            window.LibraryStorage.logout();
            sessionBanner.style.display = 'none';
            showAlert('Signed out successfully. Choose a new card or register.', 'success');
          });
        }
      }
    }

    // Destination target
    const destinationUrl = urlParams.get('returnUrl') || 'dashboard.html';

    // ------------------------------------------------------------------------
    // Cinematic Zoom-Out to Dashboard Orchestrator
    // ------------------------------------------------------------------------
    function triggerDashboardZoomOut(welcomeName, cardId) {
      if (revealBackdrop) {
        revealBackdrop.classList.add('active');
      }

      if (authContainer) {
        authContainer.classList.add('zoom-out-active');
      }

      if (window.anime) {
        window.anime.timeline({ easing: 'easeInOutQuad' })
          .add({
            targets: '.library-book',
            scale: [1, 0.88],
            rotateX: [0, 8],
            boxShadow: '0 40px 80px rgba(27,67,50,0.4)',
            duration: 500
          })
          .add({
            targets: authContainer,
            scale: [1, 0.65],
            translateY: [0, 60],
            opacity: [1, 0],
            duration: 650
          }, '-=300')
          .add({
            targets: '.ambient-shelf-header',
            opacity: [0.22, 1],
            scale: [1, 1.05],
            duration: 600
          }, '-=500');
      }

      setTimeout(() => {
        window.location.href = destinationUrl;
      }, 750);
    }

    // ------------------------------------------------------------------------
    // Login Submission Handler
    // ------------------------------------------------------------------------
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        hideAlert();

        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        const submitBtn = loginForm.querySelector('.auth-btn-submit');

        const emailOrId = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value : '';

        if (!emailOrId || !password) {
          shakeCard();
          showAlert('Please enter both your email / Member ID and password.', 'error');
          return;
        }

        if (submitBtn) {
          submitBtn.classList.add('loading');
          submitBtn.innerHTML = `<span class="auth-btn-spinner"></span> <span>Locating Volume...</span>`;
        }

        setTimeout(() => {
          const result = window.LibraryStorage.login(emailOrId, password);

          if (result.success) {
            showAlert(`Access Granted. Welcome back, ${result.account.name}! Opening stacks...`, 'success');
            triggerDashboardZoomOut(result.account.name, result.account.id);
          } else {
            if (submitBtn) {
              submitBtn.classList.remove('loading');
              submitBtn.innerHTML = `<span>Open Reading Stack</span><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
            }
            shakeCard();
            showAlert(result.error || 'Authentication failed. Please verify credentials.', 'error');
          }
        }, 320);
      });
    }

    // ------------------------------------------------------------------------
    // Signup Submission Handler
    // ------------------------------------------------------------------------
    if (signupForm) {
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        hideAlert();

        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passInput = document.getElementById('signup-password');
        const confirmPassInput = document.getElementById('signup-confirm-password');
        const typeSelect = document.getElementById('signup-type');
        const submitBtn = signupForm.querySelector('.auth-btn-submit');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value : '';
        const confirmPassword = confirmPassInput ? confirmPassInput.value : '';
        const membershipType = typeSelect ? typeSelect.value : 'standard';

        if (!name || !email) {
          shakeCard();
          showAlert('Please provide your name and email address.', 'error');
          return;
        }

        if (password.length < 6) {
          shakeCard();
          showAlert('Password must contain at least 6 characters.', 'error');
          return;
        }

        if (password !== confirmPassword) {
          shakeCard();
          showAlert('Passwords do not match. Please re-enter.', 'error');
          return;
        }

        if (submitBtn) {
          submitBtn.classList.add('loading');
          submitBtn.innerHTML = `<span class="auth-btn-spinner"></span> <span>Inscribing Ledger...</span>`;
        }

        setTimeout(() => {
          const result = window.LibraryStorage.register({
            name,
            email,
            password,
            membershipType,
            role: 'member'
          });

          if (result.success) {
            showAlert(`Card #${result.account.id} Inscribed! Welcome to Quiet Stacks, ${result.account.name}.`, 'success');
            triggerDashboardZoomOut(result.account.name, result.account.id);
          } else {
            if (submitBtn) {
              submitBtn.classList.remove('loading');
              submitBtn.innerHTML = `<span>Inscribe Member Card</span><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
            }
            shakeCard();
            showAlert(result.error || 'Registration failed.', 'error');
          }
        }, 360);
      });
    }
  });
})();
