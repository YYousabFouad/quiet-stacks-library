export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'assets/vendor/**']
  },
  {
    files: ['src/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly', document: 'readonly', localStorage: 'readonly',
        console: 'readonly', process: 'readonly', URLSearchParams: 'readonly', setTimeout: 'readonly',
        clearTimeout: 'readonly', requestAnimationFrame: 'readonly', globalThis: 'readonly',
        alert: 'readonly', confirm: 'readonly', IntersectionObserver: 'readonly',
        history: 'readonly', performance: 'readonly', URL: 'readonly',
        cancelAnimationFrame: 'readonly', getComputedStyle: 'readonly',
        NodeFilter: 'readonly', XMLSerializer: 'readonly', Image: 'readonly'
      }
    },
    rules: {
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-undef': 'error'
    }
  }
];
