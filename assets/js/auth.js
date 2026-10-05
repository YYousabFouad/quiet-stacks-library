/**
 * Quiet Stacks Library — Authentication Controller
 * Handles user login, registration, session management, and quick demo credentials.
 */

(function () {
  'use strict';

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const alertBox = document.getElementById('auth-alert');

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
    // Login Form Submission
    // ------------------------------------------------------------------------
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        hideAlert();

        const emailOrId = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const result = window.LibraryStorage.login(emailOrId, password);

        if (result.success) {
          showAlert(`Welcome back, ${result.account.name}! Redirecting...`, 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 800);
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

        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const membershipType = document.getElementById('signup-type').value;

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
            window.location.href = 'index.html';
          }, 1000);
        } else {
          showAlert(result.error || 'Sign up failed.', 'error');
        }
      });
    }
  });

})();
