export function renderLoanRow(loan, { escapeHtml, capitalize }) {
  const badgeClass = loan.status === 'overdue' ? 'badge-overdue' : 'badge-borrowed';
  return `
    <tr data-loan-id="${escapeHtml(loan.id)}">
      <td class="book-title-cell">${escapeHtml(loan.bookTitle)}</td>
      <td>${escapeHtml(loan.memberName)}</td>
      <td>${escapeHtml(loan.borrowedDate)}</td>
      <td>${escapeHtml(loan.dueDate)}</td>
      <td><span class="badge ${badgeClass}">${capitalize(loan.status)}</span></td>
      <td><button type="button" class="btn btn-sm btn-action-primary btn-return-loan" data-id="${escapeHtml(loan.id)}">Return</button></td>
    </tr>
  `;
}
