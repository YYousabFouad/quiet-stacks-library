/**
 * Quiet Stacks Library — Storage Service
 * Manages localStorage persistence for Books, Members, Loans, and Statistics.
 */

(function (window) {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    BOOKS: 'quiet_stacks_books',
    MEMBERS: 'quiet_stacks_members',
    LOANS: 'quiet_stacks_loans',
    STATISTICS: 'quiet_stacks_statistics'
  };

  // Seed / Initial Data based on Figma Design
  const INITIAL_BOOKS = [
    {
      id: 'book-1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'programming',
      categoryLabel: 'Programming',
      isbn: '978-0132350884',
      year: 2008,
      status: 'available' // 'available' | 'borrowed' | 'overdue'
    },
    {
      id: 'book-2',
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      category: 'programming',
      categoryLabel: 'Programming',
      isbn: '978-0596517748',
      year: 2008,
      status: 'borrowed'
    },
    {
      id: 'book-3',
      title: 'Cosmos',
      author: 'Carl Sagan',
      category: 'science',
      categoryLabel: 'Science',
      isbn: '978-0345331359',
      year: 1980,
      status: 'available'
    },
    {
      id: 'book-4',
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      category: 'fiction',
      categoryLabel: 'Fiction',
      isbn: '978-0062315007',
      year: 1988,
      status: 'overdue'
    }
  ];

  const INITIAL_MEMBERS = [
    {
      id: 'M-001',
      name: 'John Smith',
      email: 'john@example.com',
      membershipType: 'standard',
      status: 'active', // 'active' | 'inactive'
      borrowedCount: 2
    },
    {
      id: 'M-002',
      name: 'Sarah Ali',
      email: 'sarah@example.com',
      membershipType: 'student',
      status: 'active',
      borrowedCount: 1
    },
    {
      id: 'M-003',
      name: 'Omar Hassan',
      email: 'omar@example.com',
      membershipType: 'faculty',
      status: 'inactive',
      borrowedCount: 0
    }
  ];

  const INITIAL_LOANS = [
    {
      id: 'loan-1',
      bookId: 'book-1',
      bookTitle: 'Clean Code',
      memberId: 'M-001',
      memberName: 'John Smith',
      borrowedDate: 'Sep 20',
      dueDate: 'Oct 04',
      status: 'borrowed' // 'borrowed' | 'overdue' | 'returned'
    },
    {
      id: 'loan-2',
      bookId: 'book-2',
      bookTitle: 'JavaScript: The Good Parts',
      memberId: 'M-002',
      memberName: 'Sarah Ali',
      borrowedDate: 'Sep 18',
      dueDate: 'Oct 02',
      status: 'borrowed'
    },
    {
      id: 'loan-3',
      bookId: 'book-4',
      bookTitle: 'The Alchemist',
      memberId: 'M-001',
      memberName: 'John Smith',
      borrowedDate: 'Sep 10',
      dueDate: 'Sep 24',
      status: 'overdue'
    }
  ];

  // Helper Methods for Safe LocalStorage Handling
  function read(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
    }
  }

  // Storage Service API Object
  const StorageService = {
    /**
     * Initializes default data in localStorage if keys are empty.
     */
    init() {
      if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
        write(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
        write(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.LOANS)) {
        write(STORAGE_KEYS.LOANS, INITIAL_LOANS);
      }
      this.recalculateStatistics();
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
      const newBook = {
        id: 'book-' + Date.now(),
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        category: bookData.category.toLowerCase(),
        categoryLabel: bookData.categoryLabel || bookData.category,
        isbn: bookData.isbn ? bookData.isbn.trim() : 'N/A',
        year: bookData.year ? parseInt(bookData.year, 10) : new Date().getFullYear(),
        status: bookData.status || 'available'
      };
      books.push(newBook);
      write(STORAGE_KEYS.BOOKS, books);
      this.recalculateStatistics();
      return newBook;
    },

    updateBook(id, updates) {
      const books = this.getBooks();
      const index = books.findIndex((b) => b.id === id);
      if (index !== -1) {
        books[index] = { ...books[index], ...updates };
        write(STORAGE_KEYS.BOOKS, books);
        this.recalculateStatistics();
        return books[index];
      }
      return null;
    },

    deleteBook(id) {
      let books = this.getBooks();
      books = books.filter((b) => b.id !== id);
      write(STORAGE_KEYS.BOOKS, books);
      this.recalculateStatistics();
      return true;
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
      // Generate Next sequential Member ID: e.g. M-004
      const nextNum = members.length + 1;
      const id = 'M-' + String(nextNum).padStart(3, '0');

      const newMember = {
        id: memberData.id || id,
        name: memberData.name.trim(),
        email: memberData.email.trim(),
        membershipType: memberData.membershipType || 'standard',
        status: memberData.status || 'active',
        borrowedCount: memberData.borrowedCount || 0
      };

      members.push(newMember);
      write(STORAGE_KEYS.MEMBERS, members);
      this.recalculateStatistics();
      return newMember;
    },

    updateMember(id, updates) {
      const members = this.getMembers();
      const index = members.findIndex((m) => m.id === id);
      if (index !== -1) {
        members[index] = { ...members[index], ...updates };
        write(STORAGE_KEYS.MEMBERS, members);
        this.recalculateStatistics();
        return members[index];
      }
      return null;
    },

    deleteMember(id) {
      let members = this.getMembers();
      members = members.filter((m) => m.id !== id);
      write(STORAGE_KEYS.MEMBERS, members);
      this.recalculateStatistics();
      return true;
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
        status: loanData.status || 'borrowed'
      };
      loans.push(newLoan);
      write(STORAGE_KEYS.LOANS, loans);

      // Update book status
      this.updateBook(loanData.bookId, { status: newLoan.status });

      // Update member count
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
        // Remove from active loans list or mark returned
        const updatedLoans = loans.filter((l) => l.id !== loanId);
        write(STORAGE_KEYS.LOANS, updatedLoans);

        // Update book status to available
        this.updateBook(loan.bookId, { status: 'available' });

        // Decrement member's borrowed count
        const member = this.getMemberById(loan.memberId);
        if (member && member.borrowedCount > 0) {
          this.updateMember(loan.memberId, { borrowedCount: member.borrowedCount - 1 });
        }

        this.recalculateStatistics();
        return true;
      }
      return false;
    },

    // ------------------------------------------------------------------------
    // Statistics Calculation & Persistence
    // ------------------------------------------------------------------------
    recalculateStatistics() {
      const books = this.getBooks();
      const members = this.getMembers();
      const loans = this.getLoans();

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
        totalBooks: 4,
        totalMembers: 3,
        borrowed: 2,
        overdue: 2
      });
    },

    // ------------------------------------------------------------------------
    // Utility / Reset
    // ------------------------------------------------------------------------
    resetDefaults() {
      write(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
      write(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
      write(STORAGE_KEYS.LOANS, INITIAL_LOANS);
      this.recalculateStatistics();
    }
  };

  // Expose to global window
  window.LibraryStorage = StorageService;

  // Auto-initialize storage on script load
  StorageService.init();

})(window);
