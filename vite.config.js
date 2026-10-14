import { defineConfig } from 'vite';

export default defineConfig({
  server: { open: '/' },
  build: {
    rollupOptions: {
      input: {
        auth: 'index.html',
        dashboard: 'dashboard.html',
        login: 'login.html',
        signup: 'signup.html'
      }
    }
  }
});
