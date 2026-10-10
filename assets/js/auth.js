/**
 * Quiet Stacks Library — High-Performance Archival Book Auth Controller
 * Hardware-accelerated 180° leaf turning physics, instant credential auto-fill,
 * and seamless cinematic zoom-out to the dashboard.
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const alertBox = document.getElementById('auth-alert');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const tabSlider = document.getElementById('book-tabs-slider');
    const turningLeaf = document.getElementById('book-turning-leaf');
    const underPage = document.getElementById('book-under-page');
    const linkToSignup = document.getElementById('link-to-signup');
    const linkToLogin = document.getElementById('link-to-login');
    const sessionBanner = document.getElementById('auth-active-session-banner');
    const authContainer = document.querySelector('.auth-container');
    const revealBackdrop = document.getElementById('dashboard-reveal-backdrop');

    // ------------------------------------------------------------------------
    // Alerts
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
    }

    function hideAlert() {
      if (!alertBox) return;
      alertBox.className = 'auth-alert';
      alertBox.textContent = '';
    }

    function shakeBook() {
      const target = document.querySelector('.library-book');
      if (!target) return;
      target.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-7px)' },
        { transform: 'translateX(7px)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0)' }
      ], {
        duration: 400,
        easing: 'ease-in-out'
      });
    }

    // ------------------------------------------------------------------------
    // Procedural Archival Paper Sound Synthesizer (Zero Assets, 100% Offline)
    // ------------------------------------------------------------------------
    let audioCtx = null;

    function playPaperTurnSound() {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtx) {
          audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const duration = 0.42;
        const bufferSize = Math.floor(audioCtx.sampleRate * duration);
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555;
          b1 = 0.99332 * b1 + white * 0.075;
          b2 = 0.96900 * b2 + white * 0.1538;
          data[i] = (b0 + b1 + b2 + white * 0.5) * 0.08;
        }

        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2100, audioCtx.currentTime + 0.14);
        filter.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + duration);
        filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.11, audioCtx.currentTime + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.03, audioCtx.currentTime + 0.22);
        gainNode.gain.exponentialRampToValueAtTime(0.07, audioCtx.currentTime + 0.32);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        noiseNode.start();
      } catch (_) {
        // Silently bypass if audio is restricted
      }
    }

    // ------------------------------------------------------------------------
    // Real-Book 180° Leaf Page-Turn Controller Across the Whole Book
    // ------------------------------------------------------------------------
    const pagesSpread = document.querySelector('.book-pages-spread');
    let currentMode =
      (turningLeaf && turningLeaf.classList.contains('leaf-turned-over')) ||
      (tabSignup && tabSignup.classList.contains('active')) ||
      (pagesSpread && pagesSpread.classList.contains('spread-turned-over'))
        ? 'signup'
        : 'login';

    if (pagesSpread && currentMode === 'signup') {
      pagesSpread.classList.add('spread-turned-over');
      if (turningLeaf) turningLeaf.classList.add('leaf-turned-over');
      if (underPage) underPage.classList.add('mobile-active');
    }

    // ------------------------------------------------------------------------
    // UI Navigation State Synchronizer
    // ------------------------------------------------------------------------
    function updateNavUI(mode) {
      const isSignup = mode === 'signup';
      currentMode = mode;
      hideAlert();

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

      if (tabSlider) {
        if (isSignup) {
          tabSlider.classList.add('pos-signup');
        } else {
          tabSlider.classList.remove('pos-signup');
        }
      }
    }

    // ------------------------------------------------------------------------
    // WebGL Page-Curl Engine Controller
    // ------------------------------------------------------------------------
    let curlEngine = null;
    if (typeof window.PageCurlEngine !== 'undefined') {
      curlEngine = new window.PageCurlEngine({
        getMode: () => currentMode,
        onNavigate: (mode) => updateNavUI(mode),
        onSound: () => playPaperTurnSound(),
      });
    }

    function turnPageTo(mode) {
      if (curlEngine && curlEngine.canAnimate && curlEngine.canAnimate()) {
        curlEngine.turnTo(mode);
      } else if (curlEngine) {
        curlEngine.turnTo(mode);
      } else {
        updateNavUI(mode);
        if (turningLeaf && pagesSpread) {
          const isSignup = mode === 'signup';
          pagesSpread.classList.toggle('spread-turned-over', isSignup);
          turningLeaf.classList.toggle('leaf-turned-over', isSignup);
          turningLeaf.classList.toggle('leaf-at-rest', !isSignup);
          if (underPage) underPage.classList.toggle('mobile-active', isSignup);
        }
      }

      if (window.matchMedia('(max-width: 680px)').matches) {
        const bookStage = document.querySelector('.book-stage');
        if (bookStage) {
          bookStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    // Arrow Left / Arrow Right to turn pages like a real book
    window.addEventListener('keydown', function (e) {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'select' || activeTag === 'textarea') {
        return;
      }
      if (e.key === 'ArrowRight' && currentMode === 'login') {
        turnPageTo('signup');
      } else if (e.key === 'ArrowLeft' && currentMode === 'signup') {
        turnPageTo('login');
      }
    });

    // Apple Books Touch Swipe Gestures for Mobile & Tablets
    const bookStageEl = document.querySelector('.book-stage');
    if (bookStageEl) {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;

      bookStageEl.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = performance.now();
        }
      }, { passive: true });

      bookStageEl.addEventListener('touchend', function (e) {
        if (e.changedTouches.length === 1) {
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
          const dt = performance.now() - touchStartTime;

          // Check if swipe is horizontal and deliberate, avoiding vertical scroll confusion
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 500) {
            const activeEl = document.activeElement;
            const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT' || activeEl.tagName === 'TEXTAREA');
            if (!isInput) {
              if (dx < 0 && currentMode === 'login') {
                turnPageTo('signup');
              } else if (dx > 0 && currentMode === 'signup') {
                turnPageTo('login');
              }
            }
          }
        }
      }, { passive: true });
    }

    if (tabLogin) tabLogin.addEventListener('click', () => turnPageTo('login'));
    if (tabSignup) tabSignup.addEventListener('click', () => turnPageTo('signup'));

    document.querySelectorAll('.turn-to-signup-link, #link-to-signup').forEach((el) => {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        turnPageTo('signup');
      });
    });

    document.querySelectorAll('.back-to-login-link, #link-to-login').forEach((el) => {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        turnPageTo('login');
      });
    });

    // Hash & Query routing
    if (window.location.hash === '#signup') {
      turnPageTo('signup');
    }

    window.addEventListener('hashchange', function () {
      if (window.location.hash === '#signup') {
        turnPageTo('signup');
      } else if (window.location.hash === '#login') {
        turnPageTo('login');
      }
    });

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

        // Reset all bars
        strengthBars.forEach((bar) => {
          bar.className = 'password-strength-bar';
        });

        if (val.length === 0) {
          if (strengthLabel) {
            strengthLabel.textContent = 'Minimum 6 characters';
            strengthLabel.style.color = 'var(--color-text-muted)';
          }
          return;
        }

        // If under minimum required length (6 chars), it is ALWAYS insufficient
        if (val.length < 6) {
          strengthBars[0].classList.add('weak');
          if (strengthLabel) {
            strengthLabel.textContent = `Too short (${val.length}/6 characters)`;
            strengthLabel.style.color = '#ef4444';
          }
          return;
        }

        // Evaluate complexity for passwords with length >= 6
        let criteriaMet = 0;
        if (/[a-z]/.test(val)) criteriaMet++;
        if (/[A-Z]/.test(val)) criteriaMet++;
        if (/[0-9]/.test(val)) criteriaMet++;
        if (/[^A-Za-z0-9]/.test(val)) criteriaMet++;
        if (val.length >= 10) criteriaMet++;

        if (criteriaMet <= 2) {
          // Weak (meets minimum length of 6, but lacks complexity)
          strengthBars[0].classList.add('weak');
          if (strengthLabel) {
            strengthLabel.textContent = 'Weak (mix numbers & uppercase)';
            strengthLabel.style.color = '#ef4444';
          }
        } else if (criteriaMet <= 3) {
          // Moderate (good mix of character types or length)
          strengthBars[0].classList.add('medium');
          strengthBars[1].classList.add('medium');
          if (strengthLabel) {
            strengthLabel.textContent = 'Moderate security';
            strengthLabel.style.color = '#f59e0b';
          }
        } else {
          // Strong (8+ chars with upper, lower, numbers, symbols)
          strengthBars[0].classList.add('strong');
          strengthBars[1].classList.add('strong');
          strengthBars[2].classList.add('strong');
          if (strengthLabel) {
            strengthLabel.textContent = 'Archival Strong';
            strengthLabel.style.color = '#10b981';
          }
        }
      });
    }

    // ------------------------------------------------------------------------
    // Instant Demo Account Auto-Fill
    // ------------------------------------------------------------------------
    document.querySelectorAll('.btn-fill-demo').forEach((btn) => {
      btn.addEventListener('click', function () {
        if (currentMode !== 'login') {
          turnPageTo('login');
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
          if (card) {
            card.animate([
              { backgroundColor: '#fef3c7' },
              { backgroundColor: '#faf6ed' }
            ], { duration: 400 });
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
            showAlert('Signed out successfully.', 'success');
          });
        }
      }
    }

    // Only accept a same-origin dashboard destination. A crafted returnUrl must
    // never send a user away from the library after authentication.
    const requestedDestination = urlParams.get('returnUrl');
    let destinationUrl = 'dashboard.html';
    if (requestedDestination) {
      try {
        const parsedDestination = new URL(requestedDestination, window.location.href);
        if (parsedDestination.origin === window.location.origin &&
            /(?:^|\/)dashboard\.html$/.test(parsedDestination.pathname)) {
          destinationUrl = parsedDestination.href;
        }
      } catch (_) {
        // Keep the safe default for malformed URLs.
      }
    }

    // ------------------------------------------------------------------------
    // Seamless Dashboard Zoom-Out
    // ------------------------------------------------------------------------
    function triggerDashboardZoomOut() {
      if (revealBackdrop) {
        revealBackdrop.classList.add('active');
      }

      if (authContainer) {
        authContainer.classList.add('zoom-out-active');
      }

      const shelfHeader = document.querySelector('.ambient-shelf-header');
      if (shelfHeader) {
        shelfHeader.style.opacity = '1';
      }

      setTimeout(() => {
        window.location.href = destinationUrl;
      }, 550);
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
          shakeBook();
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
            triggerDashboardZoomOut();
          } else {
            if (submitBtn) {
              submitBtn.classList.remove('loading');
              submitBtn.innerHTML = `<span>Open Reading Stack</span><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
            }
            shakeBook();
            showAlert(result.error || 'Authentication failed. Please verify credentials.', 'error');
          }
        }, 250);
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
          shakeBook();
          showAlert('Please provide your name and email address.', 'error');
          return;
        }

        if (password.length < 6) {
          shakeBook();
          showAlert('Password must contain at least 6 characters.', 'error');
          return;
        }

        if (password !== confirmPassword) {
          shakeBook();
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
            showAlert(`Card #${result.account.id} Inscribed! Welcome, ${result.account.name}.`, 'success');
            triggerDashboardZoomOut();
          } else {
            if (submitBtn) {
              submitBtn.classList.remove('loading');
              submitBtn.innerHTML = `<span>Inscribe Member Card</span><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
            }
            shakeBook();
            showAlert(result.error || 'Registration failed.', 'error');
          }
        }, 280);
      });
    }
  });
})();
