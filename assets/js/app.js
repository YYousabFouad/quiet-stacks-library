/**
 * Quiet Stacks Library — Application UI Controller
 * Binds LocalStorage Service to UI components, manages real-time filtering,
 * user authentication sessions, buy/borrow interactions, and modal dialogs.
 */

(function () {
  'use strict';

  // DOM Elements Selection
  const elements = {
    // Navigation & Session
    userSessionBar: document.getElementById('user-session-bar'),
    stickyNavBar: document.querySelector('.sticky-nav-bar'),

    // Books Elements
    booksGrid: document.querySelector('.books-grid'),
    bookSearchInput: document.querySelector('#books .input-search'),
    bookCategorySelect: document.querySelector('#books .select-filter'),
    addBookForm: document.querySelector('#modal-add-book form'),

    // Members Elements
    membersGrid: document.querySelector('.members-grid'),
    memberSearchInput: document.querySelector('#members .input-search'),
    addMemberForm: document.querySelector('#modal-add-member form'),

    // Loans Elements
    loansTableBody: document.querySelector('.loans-table tbody'),

    // Statistics Elements
    statTotalBooks: document.querySelector('.stat-card:nth-child(1) .stat-value'),
    statMembers: document.querySelector('.stat-card:nth-child(2) .stat-value'),
    statBorrowed: document.querySelector('.stat-card:nth-child(3) .stat-value'),
    statOverdue: document.querySelector('.stat-card:nth-child(4) .stat-value'),

    // My Account Modal Elements
    profileSummary: document.getElementById('account-profile-summary'),
    userBorrowedCount: document.getElementById('user-borrowed-count'),
    userPurchasedCount: document.getElementById('user-purchased-count'),
    accountBorrowedContent: document.getElementById('account-tab-borrowed-content'),
    accountPurchasedContent: document.getElementById('account-tab-purchased-content'),
    tabBtnBorrowed: document.getElementById('btn-tab-borrowed'),
    tabBtnPurchased: document.getElementById('btn-tab-purchased')
  };

  /**
   * Capitalizes strings for presentation
   */
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Helper to escape HTML characters in dynamic text
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // --------------------------------------------------------------------------
  // Render Functions
  // --------------------------------------------------------------------------

  /**
   * Renders User Session Controls in the Navbar
   */
  function renderUserSession() {
    const sessionBar = elements.userSessionBar || document.getElementById('user-session-bar');
    if (!sessionBar) return;

    const currentUser = window.LibraryStorage.getCurrentUser();

    if (currentUser) {
      const roleLabel = currentUser.role === 'admin' ? 'Chief Librarian' : capitalize(currentUser.membershipType || 'Member');
      sessionBar.innerHTML = `
        <a href="#modal-my-account" class="user-badge" id="btn-open-account" title="View my borrowed and purchased books">
          <svg class="user-avatar-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          <span>${escapeHtml(currentUser.name)} (${escapeHtml(roleLabel)})</span>
        </a>
        <button type="button" class="btn btn-sm btn-action-ghost" id="btn-logout" title="Sign out of account">
          Log Out
        </button>
      `;

      // Wire logout button
      const logoutBtn = sessionBar.querySelector('#btn-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
          window.LibraryStorage.logout();
          window.location.href = 'index.html?msg=logged_out';
        });
      }
    } else {
      sessionBar.innerHTML = `
        <a href="index.html#login" class="btn btn-sm btn-secondary">Log In</a>
        <a href="index.html#signup" class="btn btn-sm btn-primary">Sign Up</a>
      `;
    }
  }

  /**
   * Renders the Statistics counters from storage
   */
  function renderStatistics() {
    const stats = window.LibraryStorage.getStatistics();
    if (elements.statTotalBooks) elements.statTotalBooks.textContent = stats.totalBooks;
    if (elements.statMembers) elements.statMembers.textContent = stats.totalMembers;
    if (elements.statBorrowed) elements.statBorrowed.textContent = stats.borrowed;
    if (elements.statOverdue) elements.statOverdue.textContent = stats.overdue;
  }

  /**
   * Renders the Books Grid, respecting active search and category filters
   */
  function renderBooks() {
    if (!elements.booksGrid) return;

    const searchTerm = (elements.bookSearchInput ? elements.bookSearchInput.value : '').toLowerCase().trim();
    const selectedCategory = (elements.bookCategorySelect ? elements.bookCategorySelect.value : '').toLowerCase().trim();

    const allBooks = window.LibraryStorage.getBooks();
    const activeLoans = window.LibraryStorage.getLoans();
    const currentUser = window.LibraryStorage.getCurrentUser();

    const filtered = allBooks.filter((book) => {
      const matchesSearch =
        !searchTerm ||
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        (book.isbn && book.isbn.toLowerCase().includes(searchTerm));

      const matchesCategory =
        !selectedCategory || book.category.toLowerCase() === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
      elements.booksGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; color: var(--color-text-secondary); background: var(--color-bg-surface); border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
          No books found matching your criteria.
        </div>
      `;
      return;
    }

    elements.booksGrid.innerHTML = filtered
      .map((book) => {
        const isAvailable = book.status === 'available';
        const isBorrowed = book.status === 'borrowed';
        const isOverdue = book.status === 'overdue';
        const activeLoan = (isBorrowed || isOverdue)
          ? activeLoans.find((loan) => loan.bookId === book.id)
          : null;
        const canReturn = Boolean(currentUser && activeLoan && activeLoan.memberId === currentUser.id);

        let badgeClass = 'badge-available';
        let actionBtnText = 'Borrow';

        if (isBorrowed) {
          badgeClass = 'badge-borrowed';
          actionBtnText = 'Return';
        } else if (isOverdue) {
          badgeClass = 'badge-overdue';
          actionBtnText = canReturn ? 'Return' : 'Unavailable';
        } else if (isBorrowed) {
          actionBtnText = canReturn ? 'Return' : 'Unavailable';
        }

        const priceDisplay = (book.price || 19.99).toFixed(2);

        return `
          <article class="book-card" data-book-id="${book.id}">
            <div class="book-card-header">
              <h3 class="book-title">${escapeHtml(book.title)}</h3>
              <p class="book-author">${escapeHtml(book.author)}</p>
            </div>
            <div class="book-meta">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span class="book-category">${escapeHtml(book.categoryLabel || capitalize(book.category))}</span>
                <span class="book-price-tag">$${priceDisplay}</span>
              </div>
              <span>ISBN ${escapeHtml(book.isbn)} &bull; ${escapeHtml(String(book.year))}</span>
            </div>
            <div class="book-card-footer">
              <span class="badge ${badgeClass}">${capitalize(book.status)}</span>
              <div class="card-actions">
                <button type="button" class="btn btn-sm btn-action-primary btn-book-action" data-action="${isAvailable ? 'borrow' : (canReturn ? 'return' : 'unavailable')}" data-id="${escapeHtml(book.id)}" ${!isAvailable && !canReturn ? 'disabled aria-disabled="true"' : ''}>
                  ${actionBtnText}
                </button>
                <button type="button" class="btn btn-sm btn-action-buy btn-buy-book" data-id="${escapeHtml(book.id)}" title="Purchase a permanent personal copy">
                  Buy
                </button>
                <button type="button" class="btn btn-sm btn-action-danger btn-delete-book" data-id="${escapeHtml(book.id)}">
                  Delete
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  /**
   * Renders the Members Grid, respecting the search query
   */
  function renderMembers() {
    if (!elements.membersGrid) return;

    const searchTerm = (elements.memberSearchInput ? elements.memberSearchInput.value : '').toLowerCase().trim();
    const allMembers = window.LibraryStorage.getMembers();

    const filtered = allMembers.filter((member) => {
      return (
        !searchTerm ||
        member.name.toLowerCase().includes(searchTerm) ||
        member.id.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm)
      );
    });

    if (filtered.length === 0) {
      elements.membersGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--color-text-secondary); background: var(--color-bg-surface); border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
          No members found matching your search.
        </div>
      `;
      return;
    }

    elements.membersGrid.innerHTML = filtered
      .map((member) => {
        const badgeClass = member.status === 'active' ? 'badge-active' : 'badge-inactive';

        return `
          <article class="member-card" data-member-id="${member.id}">
            <div class="member-header">
              <h3 class="member-name">${escapeHtml(member.name)}</h3>
              <span class="badge ${badgeClass}">${capitalize(member.status)}</span>
            </div>
            <div class="member-meta">
              <span class="member-id">ID: ${escapeHtml(member.id)}</span>
              <span>${escapeHtml(member.email)}</span>
              <span class="member-borrowed-count">Borrowed: ${member.borrowedCount || 0}</span>
            </div>
            <div class="member-card-footer">
              <button type="button" class="btn btn-sm btn-action-ghost btn-view-member" data-id="${member.id}">View</button>
              <button type="button" class="btn btn-sm btn-action-danger btn-delete-member" data-id="${member.id}">Delete</button>
            </div>
          </article>
        `;
      })
      .join('');
  }

  /**
   * Renders the Loans Table
   */
  function renderLoans() {
    if (!elements.loansTableBody) return;

    const loans = window.LibraryStorage.getLoans();

    if (loans.length === 0) {
      elements.loansTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">
            No active loans recorded.
          </td>
        </tr>
      `;
      return;
    }

    elements.loansTableBody.innerHTML = loans
      .map((loan) => {
        const badgeClass = loan.status === 'overdue' ? 'badge-overdue' : 'badge-borrowed';

        return `
          <tr data-loan-id="${loan.id}">
            <td class="book-title-cell">${escapeHtml(loan.bookTitle)}</td>
            <td>${escapeHtml(loan.memberName)}</td>
            <td>${escapeHtml(loan.borrowedDate)}</td>
            <td>${escapeHtml(loan.dueDate)}</td>
            <td><span class="badge ${badgeClass}">${capitalize(loan.status)}</span></td>
            <td>
              <button type="button" class="btn btn-sm btn-action-primary btn-return-loan" data-id="${loan.id}">
                Return
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  /**
   * Renders the Logged-in User Account Profile & Lists
   */
  function renderMyAccountModal() {
    const profileSummary = document.getElementById('account-profile-summary');
    const borrowedCountSpan = document.getElementById('user-borrowed-count');
    const purchasedCountSpan = document.getElementById('user-purchased-count');
    const borrowedListContainer = document.getElementById('account-tab-borrowed-content');
    const purchasedListContainer = document.getElementById('account-tab-purchased-content');

    const currentUser = window.LibraryStorage.getCurrentUser();
    if (!currentUser) return;

    // Refresh user from storage
    const freshUser = window.LibraryStorage.getAccountById(currentUser.id) || currentUser;

    const borrowedList = freshUser.borrowedBooks || [];
    const purchasedList = freshUser.purchasedBooks || [];

    if (borrowedCountSpan) borrowedCountSpan.textContent = borrowedList.length;
    if (purchasedCountSpan) purchasedCountSpan.textContent = purchasedList.length;

    if (profileSummary) {
      profileSummary.innerHTML = `
        <div class="account-info-item">
          <span class="account-info-label">Member Name</span>
          <span class="account-info-val">${escapeHtml(freshUser.name)}</span>
        </div>
        <div class="account-info-item">
          <span class="account-info-label">Member ID</span>
          <span class="account-info-val">${escapeHtml(freshUser.id)}</span>
        </div>
        <div class="account-info-item">
          <span class="account-info-label">Email Address</span>
          <span class="account-info-val">${escapeHtml(freshUser.email)}</span>
        </div>
        <div class="account-info-item">
          <span class="account-info-label">Membership Tier</span>
          <span class="account-info-val">${capitalize(freshUser.membershipType || 'standard')}</span>
        </div>
      `;
    }

    // Render Borrowed Books list
    if (borrowedListContainer) {
      if (borrowedList.length === 0) {
        borrowedListContainer.innerHTML = `
          <div class="account-empty-state">
            You do not currently have any borrowed books. Browse the shelves and click "Borrow" to add to your stack.
          </div>
        `;
      } else {
        borrowedListContainer.innerHTML = borrowedList
          .map((b) => {
            const isOverdue = b.status === 'overdue';
            const badgeClass = isOverdue ? 'badge-overdue' : 'badge-borrowed';

            return `
              <div class="account-item-card">
                <div>
                  <strong style="font-size: var(--text-sm);">${escapeHtml(b.title)}</strong>
                  <div style="color: var(--color-text-muted); margin-top: 2px;">
                    Borrowed: ${escapeHtml(b.borrowedDate)} &bull; Due: ${escapeHtml(b.dueDate)}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge ${badgeClass}">${capitalize(b.status)}</span>
                  <button type="button" class="btn btn-sm btn-action-primary btn-account-return" data-id="${b.bookId}">
                    Return
                  </button>
                </div>
              </div>
            `;
          })
          .join('');
      }
    }

    // Render Purchased Books list
    if (purchasedListContainer) {
      if (purchasedList.length === 0) {
        purchasedListContainer.innerHTML = `
          <div class="account-empty-state">
            You haven't purchased any book copies yet. Click "Buy" on any title to own a copy.
          </div>
        `;
      } else {
        purchasedListContainer.innerHTML = purchasedList
          .map((p) => {
            return `
              <div class="account-item-card">
                <div>
                  <strong style="font-size: var(--text-sm);">${escapeHtml(p.title)}</strong>
                  <div style="color: var(--color-text-muted); margin-top: 2px;">
                    Invoice: <span style="font-family: monospace;">${escapeHtml(p.invoiceNumber)}</span> &bull; Purchased: ${escapeHtml(p.purchaseDate)}
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-weight: 700; color: var(--color-primary);">$${(p.price || 19.99).toFixed(2)}</span>
                  <div style="color: #2e7d32; font-size: 11px; font-weight: 600;">Owned</div>
                </div>
              </div>
            `;
          })
          .join('');
      }
    }
  }

  /**
   * Refreshes all UI components in sync with localStorage
   */
  function renderAll() {
    renderUserSession();
    renderBooks();
    renderMembers();
    renderLoans();
    renderStatistics();
    renderMyAccountModal();
  }

  // --------------------------------------------------------------------------
  // Event Listeners & Actions
  // --------------------------------------------------------------------------

  /**
   * Setup Real-time Search and Filter Inputs
   */
  function setupFilters() {
    if (elements.bookSearchInput) {
      elements.bookSearchInput.addEventListener('input', renderBooks);
    }
    if (elements.bookCategorySelect) {
      elements.bookCategorySelect.addEventListener('change', renderBooks);
    }
    if (elements.memberSearchInput) {
      elements.memberSearchInput.addEventListener('input', renderMembers);
    }
  }

  /**
   * Setup Modal Form Submissions
   */
  function setupForms() {
    // Add Book Form
    if (elements.addBookForm) {
      elements.addBookForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('book-title-input').value;
        const author = document.getElementById('book-author-input').value;
        const categorySelect = document.getElementById('book-category-input');
        const category = categorySelect.value;
        const categoryLabel = categorySelect.options[categorySelect.selectedIndex]?.text || category;
        const isbn = document.getElementById('book-isbn-input').value;
        const year = document.getElementById('book-year-input').value;

        if (!title || !author || !category) {
          alert('Please fill in all required fields.');
          return;
        }

        window.LibraryStorage.addBook({
          title,
          author,
          category,
          categoryLabel,
          isbn,
          year,
          price: 19.99,
          status: 'available'
        });

        // Reset and close modal
        elements.addBookForm.reset();
        window.location.hash = '';

        renderAll();
      });
    }

    // Add Member Form
    if (elements.addMemberForm) {
      elements.addMemberForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('member-name-input').value;
        const email = document.getElementById('member-email-input').value;
        const typeSelect = document.getElementById('member-type-input');
        const membershipType = typeSelect.value;

        if (!name || !email || !membershipType) {
          alert('Please fill in all required fields.');
          return;
        }

        window.LibraryStorage.addMember({
          name,
          email,
          membershipType,
          status: 'active',
          borrowedCount: 0
        });

        elements.addMemberForm.reset();
        window.location.hash = '';

        renderAll();
      });
    }

    // Account Modal Tabs Toggle
    const btnBorrowed = document.getElementById('btn-tab-borrowed');
    const btnPurchased = document.getElementById('btn-tab-purchased');
    const borrowedContent = document.getElementById('account-tab-borrowed-content');
    const purchasedContent = document.getElementById('account-tab-purchased-content');

    if (btnBorrowed && btnPurchased && borrowedContent && purchasedContent) {
      btnBorrowed.addEventListener('click', function () {
        btnBorrowed.classList.add('active');
        btnPurchased.classList.remove('active');
        borrowedContent.style.display = 'flex';
        purchasedContent.style.display = 'none';
      });

      btnPurchased.addEventListener('click', function () {
        btnPurchased.classList.add('active');
        btnBorrowed.classList.remove('active');
        purchasedContent.style.display = 'flex';
        borrowedContent.style.display = 'none';
      });
    }

    // Return button inside My Account modal
    if (borrowedContent) {
      borrowedContent.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-account-return');
        if (!btn) return;

        const bookId = btn.getAttribute('data-id');
        const currentUser = window.LibraryStorage.getCurrentUser();
        if (currentUser) {
          window.LibraryStorage.returnBookForAccount(bookId, currentUser.id);
          renderAll();
        }
      });
    }
  }

  /**
   * Setup Delegated Click Actions (Borrow, Buy, Return, Delete)
   */
  function setupDelegatedActions() {
    // Books Grid Actions
    if (elements.booksGrid) {
      elements.booksGrid.addEventListener('click', function (e) {
        const target = e.target.closest('button');
        if (!target) return;

        const bookId = target.getAttribute('data-id');
        const book = window.LibraryStorage.getBookById(bookId);
        if (!book) return;

        // Delete Book
        if (target.classList.contains('btn-delete-book')) {
          if (confirm(`Are you sure you want to remove "${book.title}" from shelves?`)) {
            window.LibraryStorage.deleteBook(bookId);
            renderAll();
          }
          return;
        }

        // Buy Book
        if (target.classList.contains('btn-buy-book')) {
          const currentUser = window.LibraryStorage.getCurrentUser();
          if (!currentUser) {
            if (confirm(`You need a member account to purchase "${book.title}". Go to Log In page now?`)) {
              window.location.href = 'index.html#login';
            }
            return;
          }

          const price = (book.price || 19.99).toFixed(2);
          if (confirm(`Purchase "${book.title}" for $${price}?\n\nThis copy will be permanently assigned to your account.`)) {
            const res = window.LibraryStorage.buyBookForAccount(bookId, currentUser.id);
            if (res.success) {
              alert(`🎉 Purchase Confirmed!\n\nThank you, ${currentUser.name}!\nTitle: ${book.title}\nTotal: $${price}\nInvoice: ${res.purchase.invoiceNumber}\n\nYou can view your purchased receipt under "My Account".`);
              renderAll();
            } else {
              alert(res.error || 'Failed to complete purchase.');
            }
          }
          return;
        }

        // Borrow or Return Action
        if (target.classList.contains('btn-book-action')) {
          const action = target.getAttribute('data-action');
          const currentUser = window.LibraryStorage.getCurrentUser();

          if (action === 'borrow') {
            if (!currentUser) {
              if (confirm(`You are not logged in. Sign in to borrow "${book.title}", or borrow as a sample member? Click OK to Sign In, or Cancel to borrow as a sample member.`)) {
                window.location.href = 'index.html#login';
                return;
              }

              // Guest fallback: pick first active member
              const members = window.LibraryStorage.getMembers().filter((m) => m.status === 'active');
              if (members.length === 0) {
                alert('No active members available.');
                return;
              }
              const borrower = members[0];
              window.LibraryStorage.addLoan({
                bookId: book.id,
                bookTitle: book.title,
                memberId: borrower.id,
                memberName: borrower.name,
                borrowedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                status: 'borrowed'
              });
              alert(`"${book.title}" borrowed by sample member ${borrower.name}.`);
            } else {
              // Borrow for logged-in user
              const res = window.LibraryStorage.borrowBookForAccount(bookId, currentUser.id);
              if (res.success) {
                alert(`📚 Borrowed Successfully!\n\n"${book.title}" is now borrowed by ${currentUser.name} (${currentUser.id}).\nDue Date: In 14 days.\nManage your active loans anytime under "My Account".`);
              } else {
                alert(res.error || 'Unable to borrow book.');
              }
            }
            renderAll();
          } else if (action === 'return') {
            const loan = window.LibraryStorage.getLoans().find((item) => item.bookId === bookId);
            if (!currentUser || !loan || loan.memberId !== currentUser.id) {
              alert('Only the member who borrowed this book can return it from their book card.');
              return;
            }
            window.LibraryStorage.returnBookForAccount(bookId, currentUser.id);
            alert(`"${book.title}" was returned to shelves.`);
            renderAll();
          }
        }
      });
    }

    // Members Grid Actions
    if (elements.membersGrid) {
      elements.membersGrid.addEventListener('click', function (e) {
        const target = e.target.closest('button');
        if (!target) return;

        const memberId = target.getAttribute('data-id');

        if (target.classList.contains('btn-delete-member')) {
          const member = window.LibraryStorage.getMemberById(memberId);
          if (confirm(`Remove member "${member?.name || memberId}"?`)) {
            window.LibraryStorage.deleteMember(memberId);
            renderAll();
          }
        } else if (target.classList.contains('btn-view-member')) {
          const member = window.LibraryStorage.getMemberById(memberId);
          if (member) {
            const memberLoans = window.LibraryStorage.getLoans().filter((l) => l.memberId === memberId);
            const loanTitles = memberLoans.length > 0 ? memberLoans.map((l) => `  • ${l.bookTitle} (Due: ${l.dueDate}, ${capitalize(l.status)})`).join('\n') : '  None';
            alert(`Member Profile:\n\nName: ${member.name}\nID: ${member.id}\nEmail: ${member.email}\nMembership: ${capitalize(member.membershipType)}\nStatus: ${capitalize(member.status)}\n\nCurrently Borrowed (${member.borrowedCount}):\n${loanTitles}`);
          }
        }
      });
    }

    // Loans Table Actions
    if (elements.loansTableBody) {
      elements.loansTableBody.addEventListener('click', function (e) {
        const target = e.target.closest('.btn-return-loan');
        if (!target) return;

        const loanId = target.getAttribute('data-id');
        window.LibraryStorage.returnLoan(loanId);
        renderAll();
      });
    }

    // Reset Demo Data Button
    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (confirm('Restore full sample library dataset (20 books, 8 members, 8 loans, demo accounts)?')) {
          window.LibraryStorage.resetDefaults();
          renderAll();
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // Sticky Navbar & ScrollSpy (IntersectionObserver)
  // --------------------------------------------------------------------------

  /**
   * Sets up sticky navbar elevation and scroll-driven active tab synchronization
   */
  function setupScrollSpy() {
    const stickyNavBar = document.querySelector('.sticky-nav-bar');
    const sections = Array.from(document.querySelectorAll('.dashboard-section'));
    const navTabs = Array.from(document.querySelectorAll('.nav-tab-item'));

    if (!sections.length || !navTabs.length) return;

    // Map section IDs to their corresponding nav items
    const navMap = new Map();
    navTabs.forEach((tab) => {
      const hash = tab.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        const id = hash.substring(1);
        navMap.set(id, tab);
      }
    });

    let currentActiveId = null;
    let isClickScrolling = false;
    let clickScrollTimeout = null;

    /**
     * Activates a specific tab by section ID without jittering or vertical shifts
     */
    function setActiveTab(sectionId) {
      if (!sectionId || currentActiveId === sectionId) return;
      currentActiveId = sectionId;

      navTabs.forEach((tab) => tab.classList.remove('active'));
      const activeTab = navMap.get(sectionId);
      if (activeTab) {
        activeTab.classList.add('active');

        // Smoothly scroll only the horizontal tab container if it overflows (mobile),
        // avoiding window-level scrollIntoView which causes vertical page jitter.
        const navContainer = activeTab.closest('.nav-tabs');
        if (navContainer && navContainer.scrollWidth > navContainer.clientWidth) {
          const tabLeft = activeTab.offsetLeft;
          const tabWidth = activeTab.offsetWidth;
          const containerWidth = navContainer.offsetWidth;
          navContainer.scrollTo({
            left: tabLeft - (containerWidth / 2) + (tabWidth / 2),
            behavior: 'smooth'
          });
        }
      }
    }

    if (stickyNavBar) {
      const handleStickyShadow = () => {
        if (window.scrollY > 40) {
          stickyNavBar.classList.add('is-stuck');
        } else {
          stickyNavBar.classList.remove('is-stuck');
        }
      };

      window.addEventListener('scroll', handleStickyShadow, { passive: true });
      handleStickyShadow();
    }

    const intersectingSections = new Set();

    const observerOptions = {
      root: null,
      // Observation zone: from below sticky navbar (~75px) down to mid-viewport
      rootMargin: '-75px 0px -50% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    };

    function updateActiveSection() {
      if (isClickScrolling) return;

      // Scrolled near top: activate the first section
      if (window.scrollY < 80 && sections.length > 0) {
        setActiveTab(sections[0].id);
        return;
      }

      // Scrolled near absolute bottom: activate the last section
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 50);
      if (isAtBottom && sections.length > 0) {
        setActiveTab(sections[sections.length - 1].id);
        return;
      }

      // Pick the last intersecting section in DOM order (the section scrolled into)
      if (intersectingSections.size > 0) {
        for (let i = sections.length - 1; i >= 0; i--) {
          if (intersectingSections.has(sections[i].id)) {
            setActiveTab(sections[i].id);
            return;
          }
        }
      }
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingSections.add(entry.target.id);
        } else {
          intersectingSections.delete(entry.target.id);
        }
      });

      updateActiveSection();
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));

    // Handle top and bottom boundary scroll checks
    window.addEventListener('scroll', () => {
      if (isClickScrolling) return;
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 50);
      const isAtTop = window.scrollY < 80;
      if (isAtBottom || isAtTop) {
        updateActiveSection();
      }
    }, { passive: true });

    // Cancel programmatic lock if user interrupts smooth scroll
    const cancelClickScroll = () => {
      if (isClickScrolling) {
        isClickScrolling = false;
        clearTimeout(clickScrollTimeout);
      }
    };
    window.addEventListener('wheel', cancelClickScroll, { passive: true });
    window.addEventListener('touchstart', cancelClickScroll, { passive: true });

    // Smooth navigation clicking
    navTabs.forEach((tab) => {
      tab.addEventListener('click', function (e) {
        const hash = this.getAttribute('href');
        if (!hash || !hash.startsWith('#')) return;

        const targetId = hash.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          e.preventDefault();

          // Lock observer while smooth scrolling to clicked section
          isClickScrolling = true;
          clearTimeout(clickScrollTimeout);
          setActiveTab(targetId);

          targetSection.scrollIntoView({ behavior: 'smooth' });

          if (history.pushState) {
            history.pushState(null, '', hash);
          } else {
            window.location.hash = hash;
          }

          const unlock = () => {
            isClickScrolling = false;
            window.removeEventListener('scrollend', unlock);
          };

          if ('onscrollend' in window) {
            window.addEventListener('scrollend', unlock, { once: true });
          }
          clickScrollTimeout = setTimeout(unlock, 800);
        }
      });
    });

    if (window.location.hash) {
      const initialId = window.location.hash.substring(1);
      if (navMap.has(initialId)) {
        setActiveTab(initialId);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Daily Literary Quote Banner
  // --------------------------------------------------------------------------
  let currentQuoteIndex = 0;

  function displayQuote(index, animate = false) {
    const textEl = document.getElementById('daily-quote-text');
    const authorEl = document.getElementById('daily-quote-author');
    const sourceEl = document.getElementById('daily-quote-source');
    if (!textEl || !authorEl || !sourceEl) return;

    const quotes = window.LibraryStorage.getQuotes ? window.LibraryStorage.getQuotes() : [];
    if (!quotes || quotes.length === 0) return;

    currentQuoteIndex = ((index % quotes.length) + quotes.length) % quotes.length;
    const q = quotes[currentQuoteIndex];

    if (animate) {
      textEl.style.opacity = '0';
      setTimeout(() => {
        textEl.textContent = `"${q.text}"`;
        authorEl.textContent = q.author;
        sourceEl.textContent = q.source;
        textEl.style.opacity = '1';
      }, 150);
    } else {
      textEl.textContent = `"${q.text}"`;
      authorEl.textContent = q.author;
      sourceEl.textContent = q.source;
    }
  }

  function setupQuoteBanner() {
    displayQuote(0);

    const btnNext = document.getElementById('btn-next-quote');
    if (btnNext) {
      btnNext.addEventListener('click', function () {
        displayQuote(currentQuoteIndex + 1, true);
      });
    }
  }

  // --------------------------------------------------------------------------
  // Back to Top Button & Animated Power Ring
  // --------------------------------------------------------------------------
  function setupBackToTop() {
    const btn = document.getElementById('btn-back-to-top');
    const ringCircle = document.getElementById('power-ring-circle');
    if (!btn || !ringCircle) return;

    // Radius 23 => circumference ≈ 144.51
    const circumference = 2 * Math.PI * 23;
    ringCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    ringCircle.style.strokeDashoffset = `${circumference}`;

    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollTop > 250) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }

      if (scrollHeight > 0) {
        const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
        const offset = circumference - (progress * circumference);
        ringCircle.style.strokeDashoffset = `${offset}`;
      }
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --------------------------------------------------------------------------
  // Application Bootstrap
  // --------------------------------------------------------------------------
  function init() {
    // Auth route guard for the library dashboard
    const currentUser = window.LibraryStorage ? window.LibraryStorage.getCurrentUser() : null;
    const urlParams = new URLSearchParams(window.location.search);
    const isGuest = urlParams.get('guest') === 'true';

    // If neither authenticated nor explicit guest mode, redirect to starter login/sign up page
    if (!currentUser && !isGuest) {
      window.location.replace('index.html?msg=auth_required');
      return;
    }

    renderAll();
    setupFilters();
    setupForms();
    setupDelegatedActions();
    setupScrollSpy();
    setupQuoteBanner();
    setupBackToTop();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
