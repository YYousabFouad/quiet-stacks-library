/**
 * Quiet Stacks Library — Theme Manager
 * Handles dark/light theme toggling, persistence, and system preference detection.
 */

const THEME_KEY = 'quiet_stacks_theme';

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage unavailable — theme won't persist
  }
}

function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function getCurrentTheme() {
  return getStoredTheme() || getSystemTheme() || 'light';
}

export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  storeTheme(next);
  applyTheme(next);
  return next;
}

export function initTheme() {
  const theme = getCurrentTheme();
  applyTheme(theme);

  // Listen for system theme changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!getStoredTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  return theme;
}
