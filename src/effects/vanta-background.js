/**
 * Quiet Stacks Library — Vanta.NET Archival Constellation Background
 * Integrates Three.js and Vanta.NET to render an interactive, living
 * library reading room ambient background that reacts to reader cursor motions.
 */
import * as THREE from 'three';

// Ensure global THREE is available for Vanta WebGL renderer
if (typeof window !== 'undefined' && !window.THREE) {
  window.THREE = THREE;
}

let vantaInstance = null;

function getVantaNet() {
  if (typeof window !== 'undefined') {
    if (window.VANTA && typeof window.VANTA.NET === 'function') {
      return window.VANTA.NET;
    }
    if (typeof window._vantaEffect === 'function') {
      return window._vantaEffect;
    }
  }
  return null;
}

export function initVantaBackground() {
  const container = document.getElementById('vanta-background');
  if (!container) return null;

  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.style.display = 'none';
    return null;
  }

  // Prevent multiple initializations
  if (vantaInstance) return vantaInstance;

  const netInit = getVantaNet();
  if (!netInit) {
    return null;
  }

  // Detect dark theme
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  try {
    vantaInstance = netInit({
      el: container,
      THREE: THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 0.8,
      color: isDark ? 0xc6ac8f : 0x1b4332,           // Aged tan (dark) or forest green (light)
      backgroundColor: isDark ? 0x0a0908 : 0xfbf8f1, // Ink black (dark) or warm cream parchment (light)
      points: 9.0,
      maxDistance: 22.0,
      spacing: 17.0,
      showDots: true,
    });

    return vantaInstance;
  } catch (err) {
    console.warn('[Vanta] Could not initialize WebGL constellation background:', err);
    container.style.display = 'none';
    return null;
  }
}

export function destroyVantaBackground() {
  if (vantaInstance && typeof vantaInstance.destroy === 'function') {
    vantaInstance.destroy();
    vantaInstance = null;
  }
}
