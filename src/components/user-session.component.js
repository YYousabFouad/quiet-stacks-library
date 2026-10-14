export function renderUserSession(sessionBar, currentUser, { escapeHtml, capitalize, onLogout }) {
  if (!sessionBar) return;
  if (!currentUser) {
    sessionBar.innerHTML = `
      <a href="index.html#login" class="btn btn-sm btn-secondary">Log In</a>
      <a href="index.html#signup" class="btn btn-sm btn-primary">Sign Up</a>
    `;
    return;
  }

  const role = currentUser.role === 'admin'
    ? 'Chief Librarian'
    : capitalize(currentUser.membershipType || 'Member');
  sessionBar.innerHTML = `
    <a href="#modal-my-account" class="user-badge" id="btn-open-account" title="View my borrowed and purchased books">
      <svg class="user-avatar-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
      </svg>
      <span>${escapeHtml(currentUser.name)} (${escapeHtml(role)})</span>
    </a>
    <button type="button" class="btn btn-sm btn-action-ghost" id="btn-logout" title="Sign out of account">Log Out</button>
  `;
  sessionBar.querySelector('#btn-logout')?.addEventListener('click', onLogout);
}
