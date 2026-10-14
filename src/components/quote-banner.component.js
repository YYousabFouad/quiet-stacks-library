export function setupQuoteBanner(quotes) {
  const text = document.getElementById('daily-quote-text');
  const author = document.getElementById('daily-quote-author');
  const source = document.getElementById('daily-quote-source');
  if (!text || !author || !source || !quotes.length) return;

  let index = 0;
  const display = (nextIndex, animate) => {
    index = ((nextIndex % quotes.length) + quotes.length) % quotes.length;
    const quote = quotes[index];
    const update = () => {
      text.textContent = `"${quote.text}"`;
      author.textContent = quote.author;
      source.textContent = quote.source;
      text.style.opacity = '1';
    };
    if (animate) {
      text.style.opacity = '0';
      setTimeout(update, 150);
    } else update();
  };

  display(0, false);
  document.getElementById('btn-next-quote')?.addEventListener('click', () => display(index + 1, true));
}
