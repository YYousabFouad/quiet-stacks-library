export function setupBackToTop() {
  const button = document.getElementById('btn-back-to-top');
  const ring = document.getElementById('power-ring-circle');
  if (!button || !ring) return;

  const circumference = 2 * Math.PI * 23;
  ring.style.strokeDasharray = `${circumference} ${circumference}`;
  ring.style.strokeDashoffset = `${circumference}`;
  const update = () => {
    const top = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    button.classList.toggle('visible', top > 250);
    const progress = maxScroll > 0 ? Math.min(Math.max(top / maxScroll, 0), 1) : 0;
    ring.style.strokeDashoffset = `${circumference * (1 - progress)}`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
