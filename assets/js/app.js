/**
 * Quiet Stacks Library — Application UI Controller
 * Binds LocalStorage Service to UI components, manages real-time filtering,
 * modal submissions, and dynamic state updates.
 */

(function () {
  'use strict';

  // DOM Elements Selection
  const elements = {
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
    statOverdue: document.querySelector('.stat-card:nth-child(4) .stat-value')
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
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--color-text-secondary); background: var(--color-bg-surface); border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
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

        let badgeClass = 'badge-available';
        let actionBtnText = 'Borrow';

        if (isBorrowed) {
          badgeClass = 'badge-borrowed';
          actionBtnText = 'Return';
        } else if (isOverdue) {
          badgeClass = 'badge-overdue';
          actionBtnText = 'Return';
        }

        return `
          <article class="book-card" data-book-id="${book.id}">
            <div class="book-card-header">
              <h3 class="book-title">${escapeHtml(book.title)}</h3>
              <p class="book-author">${escapeHtml(book.author)}</p>
            </div>
            <div class="book-meta">
              <span class="book-category">${escapeHtml(book.categoryLabel || capitalize(book.category))}</span>
              <span>ISBN ${escapeHtml(book.isbn)} &bull; ${escapeHtml(String(book.year))}</span>
            </div>
            <div class="book-card-footer">
              <span class="badge ${badgeClass}">${capitalize(book.status)}</span>
              <div class="card-actions">
                <button type="button" class="btn btn-sm btn-action-primary btn-book-action" data-action="${isAvailable ? 'borrow' : 'return'}" data-id="${book.id}">
                  ${actionBtnText}
                </button>
                <button type="button" class="btn btn-sm btn-action-danger btn-delete-book" data-id="${book.id}">
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
   * Refreshes all UI components in sync with localStorage
   */
  function renderAll() {
    renderBooks();
    renderMembers();
    renderLoans();
    renderStatistics();
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
          status: 'available'
        });

        // Reset and close modal
        elements.addBookForm.reset();
        window.location.hash = '';

        // Re-render UI
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

        // Reset and close modal
        elements.addMemberForm.reset();
        window.location.hash = '';

        // Re-render UI
        renderAll();
      });
    }
  }

  /**
   * Setup Delegated Click Actions (Borrow, Return, Delete)
   */
  function setupDelegatedActions() {
    // Books Grid Actions
    if (elements.booksGrid) {
      elements.booksGrid.addEventListener('click', function (e) {
        const target = e.target.closest('button');
        if (!target) return;

        const bookId = target.getAttribute('data-id');

        // Delete Book
        if (target.classList.contains('btn-delete-book')) {
          const book = window.LibraryStorage.getBookById(bookId);
          if (confirm(`Are you sure you want to remove "${book?.title || 'this book'}" from shelves?`)) {
            window.LibraryStorage.deleteBook(bookId);
            renderAll();
          }
          return;
        }

        // Borrow or Return Action
        if (target.classList.contains('btn-book-action')) {
          const action = target.getAttribute('data-action');
          const book = window.LibraryStorage.getBookById(bookId);

          if (action === 'borrow') {
            const members = window.LibraryStorage.getMembers().filter((m) => m.status === 'active');
            if (members.length === 0) {
              alert('No active members available to borrow books. Please add or activate a member first.');
              return;
            }

            const borrower = members[0]; // Assign to first active member
            window.LibraryStorage.addLoan({
              bookId: book.id,
              bookTitle: book.title,
              memberId: borrower.id,
              memberName: borrower.name,
              borrowedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              status: 'borrowed'
            });

            alert(`"${book.title}" was borrowed by ${borrower.name}.`);
            renderAll();
          } else if (action === 'return') {
            // Find loan related to this book
            const loans = window.LibraryStorage.getLoans();
            const loan = loans.find((l) => l.bookId === bookId);
            if (loan) {
              window.LibraryStorage.returnLoan(loan.id);
            } else {
              window.LibraryStorage.updateBook(bookId, { status: 'available' });
            }
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
            alert(`Member Details:\n\nName: ${member.name}\nID: ${member.id}\nEmail: ${member.email}\nMembership: ${capitalize(member.membershipType)}\nStatus: ${capitalize(member.status)}\nBorrowed Books: ${member.borrowedCount}`);
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

    /**
     * Activates a specific tab by section ID
     */
    function setActiveTab(sectionId) {
      navTabs.forEach((tab) => tab.classList.remove('active'));
      const activeTab = navMap.get(sectionId);
      if (activeTab) {
        activeTab.classList.add('active');
        // Ensure active tab is visible if navbar overflows horizontally on mobile
        activeTab.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      }
    }

    // Toggle shadow/border elevation when navbar sticks
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

    // Keep track of sections intersecting with the viewport
    const intersectingSections = new Set();

    const observerOptions = {
      root: null,
      // Accounts for top sticky nav (~70px) and bottom half viewport
      rootMargin: '-75px 0px -50% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingSections.add(entry.target.id);
        } else {
          intersectingSections.delete(entry.target.id);
        }
      });

      // Special check: if scrolled to the absolute bottom of page, activate the last section
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);
      if (isAtBottom && sections.length > 0) {
        setActiveTab(sections[sections.length - 1].id);
        return;
      }

      // If sections are intersecting, pick the first one matching document order
      if (intersectingSections.size > 0) {
        for (const section of sections) {
          if (intersectingSections.has(section.id)) {
            setActiveTab(section.id);
            break;
          }
        }
      }
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));

    // Handle scroll bottom boundary condition
    window.addEventListener('scroll', () => {
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);
      if (isAtBottom && sections.length > 0) {
        setActiveTab(sections[sections.length - 1].id);
      }
    }, { passive: true });

    // Smooth navigation clicking
    navTabs.forEach((tab) => {
      tab.addEventListener('click', function (e) {
        const hash = this.getAttribute('href');
        if (!hash || !hash.startsWith('#')) return;

        const targetId = hash.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: 'smooth' });
          setActiveTab(targetId);

          if (history.pushState) {
            history.pushState(null, '', hash);
          } else {
            window.location.hash = hash;
          }
        }
      });
    });

    // Check if initial URL contains a section hash
    if (window.location.hash) {
      const initialId = window.location.hash.substring(1);
      if (navMap.has(initialId)) {
        setActiveTab(initialId);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Application Bootstrap
  // --------------------------------------------------------------------------
  function init() {
    renderAll();
    setupFilters();
    setupForms();
    setupDelegatedActions();
    setupScrollSpy();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
