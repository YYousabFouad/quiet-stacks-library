/**
 * Quiet Stacks Library — Authentication Controller
 * Handles user login, registration, session management, tabs, and quick demo credentials.
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const alertBox = document.getElementById('auth-alert');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const panelLogin = document.getElementById('panel-login');
    const panelSignup = document.getElementById('panel-signup');
    const linkToSignup = document.getElementById('link-to-signup');
    const linkToLogin = document.getElementById('link-to-login');
    const sessionBanner = document.getElementById('auth-active-session-banner');

    function showAlert(message, type = 'error') {
      if (!alertBox) return;
      alertBox.textContent = message;
      alertBox.className = 'auth-alert visible ' + (type === 'success' ? 'auth-alert-success' : 'auth-alert-error');
    }

    function hideAlert() {
      if (!alertBox) return;
      alertBox.className = 'auth-alert';
      alertBox.textContent = '';
    }

    // ------------------------------------------------------------------------
    // Tabs Navigation (Log In vs Create Account)
    // ------------------------------------------------------------------------
    function switchTab(mode) {
      hideAlert();
      if (mode === 'signup') {
        if (tabSignup) {
          tabSignup.classList.add('active');
          tabSignup.setAttribute('aria-selected', 'true');
        }
        if (tabLogin) {
          tabLogin.classList.remove('active');
          tabLogin.setAttribute('aria-selected', 'false');
        }
        if (panelSignup) panelSignup.classList.add('active');
        if (panelLogin) panelLogin.classList.remove('active');
      } else {
        if (tabLogin) {
          tabLogin.classList.add('active');
          tabLogin.setAttribute('aria-selected', 'true');
        }
        if (tabSignup) {
          tabSignup.classList.remove('active');
          tabSignup.setAttribute('aria-selected', 'false');
        }
        if (panelLogin) panelLogin.classList.add('active');
        if (panelSignup) panelSignup.classList.remove('active');
      }
    }

    if (tabLogin) {
      tabLogin.addEventListener('click', () => switchTab('login'));
    }
    if (tabSignup) {
      tabSignup.addEventListener('click', () => switchTab('signup'));
    }
    if (linkToSignup) {
      linkToSignup.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab('signup');
      });
    }
    if (linkToLogin) {
      linkToLogin.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab('login');
      });
    }

    // Check initial hash or query parameter
    if (window.location.hash === '#signup') {
      switchTab('signup');
    }

    window.addEventListener('hashchange', function () {
      if (window.location.hash === '#signup') {
        switchTab('signup');
      } else if (window.location.hash === '#login') {
        switchTab('login');
      }
    });

    // Check query params for messages
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('msg') === 'auth_required') {
      showAlert('Please sign in or create an account to access the library dashboard, or continue as guest.', 'error');
    } else if (urlParams.get('msg') === 'logged_out') {
      showAlert('You have been logged out successfully.', 'success');
    }

    // ------------------------------------------------------------------------
    // Check if Already Logged In
    // ------------------------------------------------------------------------
    if (sessionBanner && window.LibraryStorage) {
      const currentUser = window.LibraryStorage.getCurrentUser();
      if (currentUser) {
        const roleLabel = currentUser.role === 'admin' ? 'Chief Librarian' : (currentUser.membershipType || 'Member');
        sessionBanner.style.display = 'flex';
        sessionBanner.innerHTML = `
          <div class="auth-session-banner-text">
            You are currently signed in as <strong>${escapeHtml(currentUser.name)}</strong> (${escapeHtml(roleLabel)}).
          </div>
          <div class="auth-session-banner-actions">
            <a href="dashboard.html" class="btn btn-sm btn-primary">Enter Library Dashboard &rarr;</a>
            <button type="button" class="btn btn-sm btn-secondary" id="btn-banner-logout">Sign Out / Switch Account</button>
          </div>
        `;

        const bannerLogout = sessionBanner.querySelector('#btn-banner-logout');
        if (bannerLogout) {
          bannerLogout.addEventListener('click', function () {
            window.LibraryStorage.logout();
            sessionBanner.style.display = 'none';
            showAlert('Signed out. You can now log in with another account.', 'success');
          });
        }
      }
    }

    // Target destination after successful auth
    const destinationUrl = urlParams.get('returnUrl') || 'dashboard.html';

    // ------------------------------------------------------------------------
    // Login Form Submission
    // ------------------------------------------------------------------------
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        hideAlert();

        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        const emailOrId = emailInput ? emailInput.value : '';
        const password = passInput ? passInput.value : '';

        const result = window.LibraryStorage.login(emailOrId, password);

        if (result.success) {
          showAlert(`Welcome back, ${result.account.name}! Redirecting to library dashboard...`, 'success');
          setTimeout(() => {
            window.location.href = destinationUrl;
          }, 700);
        } else {
          showAlert(result.error || 'Login failed. Please check your credentials.', 'error');
        }
      });

      // Quick Demo Accounts Fill Buttons
      document.querySelectorAll('.btn-fill-demo').forEach((btn) => {
        btn.addEventListener('click', function () {
          const email = this.getAttribute('data-email');
          const pass = this.getAttribute('data-pass');
          const emailInput = document.getElementById('login-email');
          const passInput = document.getElementById('login-password');
          if (emailInput && passInput) {
            emailInput.value = email;
            passInput.value = pass;
            hideAlert();
          }
        });
      });
    }

    // ------------------------------------------------------------------------
    // Signup Form Submission
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

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value : '';
        const confirmPassword = confirmPassInput ? confirmPassInput.value : '';
        const membershipType = typeSelect ? typeSelect.value : 'standard';

        if (!name || !email) {
          showAlert('Please fill in your name and email address.', 'error');
          return;
        }

        if (password.length < 6) {
          showAlert('Password must be at least 6 characters.', 'error');
          return;
        }

        if (password !== confirmPassword) {
          showAlert('Passwords do not match.', 'error');
          return;
        }

        const result = window.LibraryStorage.register({
          name,
          email,
          password,
          membershipType,
          role: 'member'
        });

        if (result.success) {
          showAlert(`Account created successfully! Welcome, ${result.account.name} (${result.account.id}). Redirecting...`, 'success');
          setTimeout(() => {
            window.location.href = destinationUrl;
          }, 900);
        } else {
          showAlert(result.error || 'Sign up failed.', 'error');
        }
      });
    }
  });

})();
