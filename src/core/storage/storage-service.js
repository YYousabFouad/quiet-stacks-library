import { LocalStorageDriver } from './local-storage-driver.js';
import { INITIAL_BOOKS } from '../../domain/seeds/books.seed.js';
import { INITIAL_MEMBERS } from '../../domain/seeds/members.seed.js';
import { INITIAL_LOANS } from '../../domain/seeds/loans.seed.js';
import { INITIAL_ACCOUNTS } from '../../domain/seeds/accounts.seed.js';
import { LITERARY_QUOTES } from '../../domain/seeds/quotes.seed.js';
import { isLoanOverdue } from '../../domain/models/loan.model.js';
import { createBookRecord } from '../../domain/models/book.model.js';
import { createMemberRecord } from '../../domain/models/member.model.js';

let storageService;

/**
 * Quiet Stacks Library — Storage Service
 * Manages localStorage persistence for Books, Members, Loans, Accounts, and Statistics.
 */

(function () {
  'use strict';
  const storageDriver = new LocalStorageDriver();

  // Storage Keys
  const STORAGE_KEYS = {
    VERSION: 'quiet_stacks_data_version',
    BOOKS: 'quiet_stacks_books',
    MEMBERS: 'quiet_stacks_members',
    LOANS: 'quiet_stacks_loans',
    STATISTICS: 'quiet_stacks_statistics',
    ACCOUNTS: 'quiet_stacks_accounts',
    CURRENT_USER: 'quiet_stacks_current_user'
  };

  const CURRENT_DATA_VERSION = '2.3';

  // Comprehensive Seed Dataset with Prices for Purchasing






  // Seed User Accounts with login credentials and their purchase/borrow histories


  // Helper Methods for Safe LocalStorage Handling
  function read(key, fallback = []) {
    try {
      return storageDriver.get(key, fallback);
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      storageDriver.set(key, value);
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
    }
  }

  function updateCollectionItem(key, id, updates) {
    const items = read(key, []);
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      write(key, items);
      return items[index];
    }
    return null;
  }

  function nextMemberId() {
    const usedIds = new Set(
      [...StorageService.getMembers(), ...StorageService.getAccounts()]
        .map((record) => Number(String(record.id || '').replace(/^M-/i, '')))
        .filter(Number.isInteger)
    );
    let nextNum = 1;
    while (usedIds.has(nextNum)) nextNum += 1;
    return 'M-' + String(nextNum).padStart(3, '0');
  }

  // Storage Service API Object
  const StorageService = {
    /**
     * Initializes default data in localStorage if keys are empty or on schema version upgrade.
     */
    init() {
      // Use read() helper to properly deserialize the JSON version string
      let storedVersion = read(STORAGE_KEYS.VERSION, null);
      if (!storedVersion) {
        // Fallback in case raw unquoted string was written
        storedVersion = storageDriver.getRaw(STORAGE_KEYS.VERSION);
      }

      const hasBooks = read(STORAGE_KEYS.BOOKS, null);
      const hasAccounts = read(STORAGE_KEYS.ACCOUNTS, null);

      if (storedVersion !== CURRENT_DATA_VERSION || !hasBooks || !hasAccounts) {
        this.resetDefaults();
      } else {
        this.recalculateStatistics();
      }
    },

    // ------------------------------------------------------------------------
    // Authentication & Account Management
    // ------------------------------------------------------------------------
    getAccounts() {
      return read(STORAGE_KEYS.ACCOUNTS, []);
    },

    getAccountByEmail(email) {
      if (!email) return null;
      const lower = email.trim().toLowerCase();
      return this.getAccounts().find((acc) => acc.email.toLowerCase() === lower) || null;
    },

    getAccountById(id) {
      if (!id) return null;
      return this.getAccounts().find((acc) => acc.id === id) || null;
    },

    getCurrentUser() {
      const user = read(STORAGE_KEYS.CURRENT_USER, null);
      if (user) {
        // Return latest updated account record from accounts collection
        const fresh = this.getAccountById(user.id);
        return fresh || user;
      }
      return null;
    },

    setCurrentUser(user) {
      write(STORAGE_KEYS.CURRENT_USER, user);
    },

    clearCurrentUser() {
      storageDriver.remove(STORAGE_KEYS.CURRENT_USER);
    },

    /**
     * Updates an account and synchronizes active session if the account matches the current user.
     */
    updateAccount(accountId, mutateFn) {
      const accounts = this.getAccounts();
      const index = accounts.findIndex((a) => a.id === accountId);
      if (index === -1) return null;

      mutateFn(accounts[index]);
      write(STORAGE_KEYS.ACCOUNTS, accounts);

      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === accountId) {
        this.setCurrentUser(accounts[index]);
      }
      return accounts[index];
    },

    /**
     * Helper to escape HTML characters in dynamic text across the application
     */
    escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    /**
     * Register a new user account (creates both account & member records)
     */
    register(userData) {
      const email = userData.email.trim().toLowerCase();
      const existing = this.getAccountByEmail(email);

      if (existing) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      // Reuse the first free ID so deleting a member cannot cause ID collisions.
      const memberId = nextMemberId();

      const newAccount = {
        id: memberId,
        name: userData.name.trim(),
        email: email,
        password: userData.password, // demo storage
        role: userData.role || 'member',
        membershipType: userData.membershipType || 'standard',
        status: 'active',
        borrowedBooks: [],
        purchasedBooks: [],
        createdAt: new Date().toISOString()
      };

      // Add to accounts
      const accounts = this.getAccounts();
      accounts.push(newAccount);
      write(STORAGE_KEYS.ACCOUNTS, accounts);

      // Add to members list
      this.addMember({
        id: memberId,
        name: newAccount.name,
        email: newAccount.email,
        membershipType: newAccount.membershipType,
        status: 'active',
        borrowedCount: 0
      });

      // Automatically set as active user
      this.setCurrentUser(newAccount);
      return { success: true, account: newAccount };
    },

    /**
     * Authenticate existing user
     */
    login(emailOrId, password) {
      if (!emailOrId || !password) {
        return { success: false, error: 'Please enter both email/ID and password.' };
      }

      const query = emailOrId.trim().toLowerCase();
      const accounts = this.getAccounts();

      const account = accounts.find((acc) => {
        return acc.email.toLowerCase() === query || acc.id.toLowerCase() === query;
      });

      if (!account) {
        return { success: false, error: 'No account found with this email or Member ID.' };
      }

      if (account.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      this.setCurrentUser(account);
      return { success: true, account };
    },

    logout() {
      this.clearCurrentUser();
      return true;
    },

    // ------------------------------------------------------------------------
    // Books Methods
    // ------------------------------------------------------------------------
    getBooks() {
      return read(STORAGE_KEYS.BOOKS, []);
    },

    getBookById(id) {
      return this.getBooks().find((b) => b.id === id) || null;
    },

    addBook(bookData) {
      const books = this.getBooks();
      const newBook = createBookRecord(bookData);
      books.unshift(newBook);
      write(STORAGE_KEYS.BOOKS, books);
      this.recalculateStatistics();
      return newBook;
    },

    updateBook(id, updates) {
      const updated = updateCollectionItem(STORAGE_KEYS.BOOKS, id, updates);
      if (updated) this.recalculateStatistics();
      return updated;
    },

    // ------------------------------------------------------------------------
    // Members Methods
    // ------------------------------------------------------------------------
    getMembers() {
      return read(STORAGE_KEYS.MEMBERS, []);
    },

    getMemberById(id) {
      return this.getMembers().find((m) => m.id === id) || null;
    },

    addMember(memberData) {
      const members = this.getMembers();
      const id = memberData.id || nextMemberId();

      const newMember = createMemberRecord(memberData, id);

      members.unshift(newMember);
      write(STORAGE_KEYS.MEMBERS, members);
      this.recalculateStatistics();
      return newMember;
    },

    updateMember(id, updates) {
      const updated = updateCollectionItem(STORAGE_KEYS.MEMBERS, id, updates);
      if (updated) this.recalculateStatistics();
      return updated;
    },

    // ------------------------------------------------------------------------
    // Loans Methods
    // ------------------------------------------------------------------------
    getLoans() {
      return read(STORAGE_KEYS.LOANS, []);
    },

    addLoan(loanData) {
      const loans = this.getLoans();
      const newLoan = {
        id: 'loan-' + Date.now(),
        bookId: loanData.bookId,
        bookTitle: loanData.bookTitle,
        memberId: loanData.memberId,
        memberName: loanData.memberName,
        borrowedDate: loanData.borrowedDate || 'Today',
        dueDate: loanData.dueDate || 'In 14 days',
        dueDateISO: loanData.dueDateISO || null,
        status: loanData.status || 'borrowed'
      };
      loans.unshift(newLoan);
      write(STORAGE_KEYS.LOANS, loans);

      // Update book status
      this.updateBook(loanData.bookId, { status: newLoan.status });

      // Update member borrowed count
      const member = this.getMemberById(loanData.memberId);
      if (member) {
        this.updateMember(loanData.memberId, { borrowedCount: (member.borrowedCount || 0) + 1 });
      }

      this.recalculateStatistics();
      return newLoan;
    },

    returnLoan(loanId) {
      const loans = this.getLoans();
      const loan = loans.find((l) => l.id === loanId);
      if (loan) {
        const updatedLoans = loans.filter((l) => l.id !== loanId);
        write(STORAGE_KEYS.LOANS, updatedLoans);

        // Update book status to available
        this.updateBook(loan.bookId, { status: 'available' });

        // Decrement member's borrowed count
        const member = this.getMemberById(loan.memberId);
        if (member && member.borrowedCount > 0) {
          this.updateMember(loan.memberId, { borrowedCount: member.borrowedCount - 1 });
        }

        // A loan may be returned from the staff table. Keep the member account in sync.
        const accounts = this.getAccounts();
        let accountsChanged = false;
        accounts.forEach((account) => {
          const borrowedBooks = account.borrowedBooks || [];
          const updatedBorrowedBooks = borrowedBooks.filter((book) => book.bookId !== loan.bookId);
          if (updatedBorrowedBooks.length !== borrowedBooks.length) {
            account.borrowedBooks = updatedBorrowedBooks;
            accountsChanged = true;
          }
        });
        if (accountsChanged) write(STORAGE_KEYS.ACCOUNTS, accounts);

        this.recalculateStatistics();
        return true;
      }
      return false;
    },

    // ------------------------------------------------------------------------
    // Statistics Calculation & Persistence
    // ------------------------------------------------------------------------
    recalculateStatistics(now = new Date()) {
      const books = this.getBooks();
      const loans = this.getLoans();

      let loansChanged = false;
      let booksChanged = false;
      loans.forEach((loan) => {
        if (!loan.dueDateISO) return;
        const status = isLoanOverdue(loan, now) ? 'overdue' : 'borrowed';
        if (loan.status !== status) {
          loan.status = status;
          loansChanged = true;
          const book = books.find((item) => item.id === loan.bookId);
          if (book && book.status !== status) {
            book.status = status;
            booksChanged = true;
          }
        }
      });
      if (loansChanged) write(STORAGE_KEYS.LOANS, loans);
      if (booksChanged) write(STORAGE_KEYS.BOOKS, books);

      // Loan records are the source of truth for each member's current count.
      const borrowedByMember = new Map();
      loans.forEach((loan) => {
        borrowedByMember.set(loan.memberId, (borrowedByMember.get(loan.memberId) || 0) + 1);
      });
      const members = this.getMembers();
      let membersChanged = false;
      members.forEach((member) => {
        const borrowedCount = borrowedByMember.get(member.id) || 0;
        if (member.borrowedCount !== borrowedCount) {
          member.borrowedCount = borrowedCount;
          membersChanged = true;
        }
      });
      if (membersChanged) write(STORAGE_KEYS.MEMBERS, members);

      const borrowedCount = loans.filter((l) => l.status === 'borrowed').length;
      const overdueCount = loans.filter((l) => l.status === 'overdue').length;

      const statistics = {
        totalBooks: books.length,
        totalMembers: members.length,
        borrowed: borrowedCount,
        overdue: overdueCount,
        lastUpdated: new Date().toISOString()
      };

      write(STORAGE_KEYS.STATISTICS, statistics);
      return statistics;
    },

    getStatistics() {
      return read(STORAGE_KEYS.STATISTICS, {
        totalBooks: 20,
        totalMembers: 8,
        borrowed: 6,
        overdue: 2
      });
    },

    // ------------------------------------------------------------------------
    // Literary Quotes
    // ------------------------------------------------------------------------
    getQuotes() {
      return LITERARY_QUOTES;
    },

    getRandomQuote() {
      const idx = Math.floor(Math.random() * LITERARY_QUOTES.length);
      return LITERARY_QUOTES[idx];
    },

    // ------------------------------------------------------------------------
    // Utility / Reset
    // ------------------------------------------------------------------------
    resetDefaults() {
      // Preserve active authenticated session if one exists
      const existingUser = this.getCurrentUser();

      write(STORAGE_KEYS.VERSION, CURRENT_DATA_VERSION);
      write(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
      write(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
      write(STORAGE_KEYS.LOANS, INITIAL_LOANS);
      write(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);

      if (existingUser) {
        const fresh = this.getAccountById(existingUser.id);
        write(STORAGE_KEYS.CURRENT_USER, fresh || existingUser);
      } else {
        write(STORAGE_KEYS.CURRENT_USER, null);
      }

      this.recalculateStatistics();
    }
  };



  // Auto-initialize storage on script load
  storageService = StorageService;
  StorageService.init();

})();

export { storageService as StorageService };
