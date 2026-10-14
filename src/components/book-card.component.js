export function renderBookCard(book, { activeLoan, currentUser, escapeHtml, capitalize }) {
  const available = book.status === 'available';
  const overdue = book.status === 'overdue';
  const canReturn = Boolean(currentUser && activeLoan?.memberId === currentUser.id);
  const badgeClass = available ? 'badge-available' : overdue ? 'badge-overdue' : 'badge-borrowed';
  const actionLabel = available ? 'Borrow' : canReturn ? 'Return' : 'Unavailable';
  const action = available ? 'borrow' : canReturn ? 'return' : 'unavailable';

  return `
    <article class="book-card" data-book-id="${escapeHtml(book.id)}">
      <div class="book-card-header">
        <h3 class="book-title">${escapeHtml(book.title)}</h3>
        <p class="book-author">${escapeHtml(book.author)}</p>
      </div>
      <div class="book-meta">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <span class="book-category">${escapeHtml(book.categoryLabel || capitalize(book.category))}</span>
          <span class="book-price-tag">$${Number(book.price || 19.99).toFixed(2)}</span>
        </div>
        <span>ISBN ${escapeHtml(book.isbn)} &bull; ${escapeHtml(String(book.year))}</span>
      </div>
      <div class="book-card-footer">
        <span class="badge ${badgeClass}">${capitalize(book.status)}</span>
        <div class="card-actions">
          <button type="button" class="btn btn-sm btn-action-primary btn-book-action" data-action="${action}" data-id="${escapeHtml(book.id)}" ${!available && !canReturn ? 'disabled aria-disabled="true"' : ''}>${actionLabel}</button>
          <button type="button" class="btn btn-sm btn-action-buy btn-buy-book" data-id="${escapeHtml(book.id)}" title="Purchase a permanent personal copy">Buy</button>
          ${currentUser?.role === 'admin' ? `<button type="button" class="btn btn-sm btn-action-danger btn-delete-book" data-id="${escapeHtml(book.id)}">Delete</button>` : ''}
        </div>
      </div>
    </article>
  `;
}
