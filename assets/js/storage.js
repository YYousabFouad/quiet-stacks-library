/**
 * Quiet Stacks Library — Storage Service
 * Manages localStorage persistence for Books, Members, Loans, and Statistics.
 */

(function (window) {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    VERSION: 'quiet_stacks_data_version',
    BOOKS: 'quiet_stacks_books',
    MEMBERS: 'quiet_stacks_members',
    LOANS: 'quiet_stacks_loans',
    STATISTICS: 'quiet_stacks_statistics'
  };

  const CURRENT_DATA_VERSION = '2.0';

  // Comprehensive Seed Dataset for Realistic Testing
  const INITIAL_BOOKS = [
    {
      id: 'book-1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'programming',
      categoryLabel: 'Programming',
      isbn: '978-0132350884',
      year: 2008,
      status: 'borrowed'
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
    },
    {
      id: 'book-5',
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt & David Thomas',
      category: 'programming',
      categoryLabel: 'Programming',
      isbn: '978-0201616224',
      year: 1999,
      status: 'available'
    },
    {
      id: 'book-6',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      category: 'programming',
      categoryLabel: 'Programming',
      isbn: '978-0201633610',
      year: 1994,
      status: 'borrowed'
    },
    {
      id: 'book-7',
      title: 'Refactoring: Improving the Design of Existing Code',
      author: 'Martin Fowler',
      category: 'programming',
      categoryLabel: 'Programming',
      isbn: '978-0201485677',
      year: 1999,
      status: 'available'
    },
    {
      id: 'book-8',
      title: 'Structure and Interpretation of Computer Programs',
      author: 'Harold Abelson & Gerald Jay Sussman',
      category: 'programming',
      categoryLabel: 'Programming',
      isbn: '978-0262510875',
      year: 1996,
      status: 'available'
    },
    {
      id: 'book-9',
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      category: 'science',
      categoryLabel: 'Science',
      isbn: '978-0553380163',
      year: 1988,
      status: 'borrowed'
    },
    {
      id: 'book-10',
      title: 'The Selfish Gene',
      author: 'Richard Dawkins',
      category: 'science',
      categoryLabel: 'Science',
      isbn: '978-0199291151',
      year: 1976,
      status: 'available'
    },
    {
      id: 'book-11',
      title: 'Silent Spring',
      author: 'Rachel Carson',
      category: 'science',
      categoryLabel: 'Science',
      isbn: '978-0618249060',
      year: 1962,
      status: 'available'
    },
    {
      id: 'book-12',
      title: 'Astrophysics for People in a Hurry',
      author: 'Neil deGrasse Tyson',
      category: 'science',
      categoryLabel: 'Science',
      isbn: '978-0393609394',
      year: 2017,
      status: 'available'
    },
    {
      id: 'book-13',
      title: '1984',
      author: 'George Orwell',
      category: 'fiction',
      categoryLabel: 'Fiction',
      isbn: '978-0451524935',
      year: 1949,
      status: 'borrowed'
    },
    {
      id: 'book-14',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      category: 'fiction',
      categoryLabel: 'Fiction',
      isbn: '978-0060935467',
      year: 1960,
      status: 'available'
    },
    {
      id: 'book-15',
      title: 'One Hundred Years of Solitude',
      author: 'Gabriel García Márquez',
      category: 'fiction',
      categoryLabel: 'Fiction',
      isbn: '978-0060883287',
      year: 1967,
      status: 'overdue'
    },
    {
      id: 'book-16',
      title: 'Crime and Punishment',
      author: 'Fyodor Dostoevsky',
      category: 'fiction',
      categoryLabel: 'Fiction',
      isbn: '978-0143107637',
      year: 1866,
      status: 'available'
    },
    {
      id: 'book-17',
      title: 'Meditations',
      author: 'Marcus Aurelius',
      category: 'philosophy',
      categoryLabel: 'Philosophy',
      isbn: '978-0140449334',
      year: 180,
      status: 'available'
    },
    {
      id: 'book-18',
      title: 'The Republic',
      author: 'Plato',
      category: 'philosophy',
      categoryLabel: 'Philosophy',
      isbn: '978-0140455113',
      year: -375,
      status: 'available'
    },
    {
      id: 'book-19',
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      category: 'history',
      categoryLabel: 'History',
      isbn: '978-0062316097',
      year: 2014,
      status: 'borrowed'
    },
    {
      id: 'book-20',
      title: 'Guns, Germs, and Steel',
      author: 'Jared Diamond',
      category: 'history',
      categoryLabel: 'History',
      isbn: '978-0393317558',
      year: 1997,
      status: 'available'
    }
  ];

  const INITIAL_MEMBERS = [
    {
      id: 'M-001',
      name: 'John Smith',
      email: 'john@example.com',
      membershipType: 'standard',
      status: 'active',
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
    },
    {
      id: 'M-004',
      name: 'Elena Rostova',
      email: 'elena.r@example.com',
      membershipType: 'premium',
      status: 'active',
      borrowedCount: 1
    },
    {
      id: 'M-005',
      name: 'Marcus Vance',
      email: 'marcus.v@example.com',
      membershipType: 'standard',
      status: 'active',
      borrowedCount: 2
    },
    {
      id: 'M-006',
      name: 'Maya Lin',
      email: 'maya.lin@example.com',
      membershipType: 'student',
      status: 'active',
      borrowedCount: 1
    },
    {
      id: 'M-007',
      name: 'David Kim',
      email: 'david.kim@example.com',
      membershipType: 'standard',
      status: 'inactive',
      borrowedCount: 0
    },
    {
      id: 'M-008',
      name: 'Amina Diallo',
      email: 'amina.d@example.com',
      membershipType: 'faculty',
      status: 'active',
      borrowedCount: 1
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
      status: 'borrowed'
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
    },
    {
      id: 'loan-4',
      bookId: 'book-6',
      bookTitle: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      memberId: 'M-005',
      memberName: 'Marcus Vance',
      borrowedDate: 'Sep 22',
      dueDate: 'Oct 06',
      status: 'borrowed'
    },
    {
      id: 'loan-5',
      bookId: 'book-9',
      bookTitle: 'A Brief History of Time',
      memberId: 'M-006',
      memberName: 'Maya Lin',
      borrowedDate: 'Sep 19',
      dueDate: 'Oct 03',
      status: 'borrowed'
    },
    {
      id: 'loan-6',
      bookId: 'book-13',
      bookTitle: '1984',
      memberId: 'M-005',
      memberName: 'Marcus Vance',
      borrowedDate: 'Sep 25',
      dueDate: 'Oct 09',
      status: 'borrowed'
    },
    {
      id: 'loan-7',
      bookId: 'book-15',
      bookTitle: 'One Hundred Years of Solitude',
      memberId: 'M-004',
      memberName: 'Elena Rostova',
      borrowedDate: 'Aug 28',
      dueDate: 'Sep 11',
      status: 'overdue'
    },
    {
      id: 'loan-8',
      bookId: 'book-19',
      bookTitle: 'Sapiens: A Brief History of Humankind',
      memberId: 'M-008',
      memberName: 'Amina Diallo',
      borrowedDate: 'Sep 24',
      dueDate: 'Oct 08',
      status: 'borrowed'
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
     * Initializes default data in localStorage if keys are empty or on schema version upgrade.
     */
    init() {
      const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

      // If version is missing, old, or books are empty, seed the full dataset
      if (storedVersion !== CURRENT_DATA_VERSION || !localStorage.getItem(STORAGE_KEYS.BOOKS)) {
        this.resetDefaults();
      } else {
        this.recalculateStatistics();
      }
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
      books.unshift(newBook);
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

      // Remove related loans if any
      let loans = this.getLoans();
      const loan = loans.find((l) => l.bookId === id);
      if (loan) {
        this.returnLoan(loan.id);
      } else {
        this.recalculateStatistics();
      }

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

      members.unshift(newMember);
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
        totalBooks: 20,
        totalMembers: 8,
        borrowed: 6,
        overdue: 2
      });
    },

    // ------------------------------------------------------------------------
    // Utility / Reset
    // ------------------------------------------------------------------------
    resetDefaults() {
      write(STORAGE_KEYS.VERSION, CURRENT_DATA_VERSION);
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
