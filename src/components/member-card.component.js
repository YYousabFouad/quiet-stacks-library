export function renderMemberCard(member, { escapeHtml, capitalize, currentUser }) {
  const badgeClass = member.status === 'active' ? 'badge-active' : 'badge-inactive';
  return `
    <article class="member-card" data-member-id="${escapeHtml(member.id)}">
      <div class="member-header">
        <h3 class="member-name">${escapeHtml(member.name)}</h3>
        <span class="badge ${badgeClass}">${capitalize(member.status)}</span>
      </div>
      <div class="member-meta">
        <span class="member-id">ID: ${escapeHtml(member.id)}</span>
        <span>${escapeHtml(member.email)}</span>
        <span class="member-borrowed-count">Borrowed: ${Number(member.borrowedCount || 0)}</span>
      </div>
      <div class="member-card-footer">
        <button type="button" class="btn btn-sm btn-action-ghost btn-view-member" data-id="${escapeHtml(member.id)}">View</button>
        ${currentUser?.role === 'admin' ? `<button type="button" class="btn btn-sm btn-action-danger btn-delete-member" data-id="${escapeHtml(member.id)}">Delete</button>` : ''}
      </div>
    </article>
  `;
}
