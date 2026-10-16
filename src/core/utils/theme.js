/**
 * Quiet Stacks Library — Theme Manager
 * Handles dark/light theme toggling and persistence.
 * The light theme is the default; the OS colour scheme no longer overrides it.
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

export function getCurrentTheme() {
  return getStoredTheme() || 'light';
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

  return theme;
}
