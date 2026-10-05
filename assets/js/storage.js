/**
 * Quiet Stacks Library — Storage Service
 * Manages localStorage persistence for Books, Members, Loans, Accounts, and Statistics.
 */

(function (window) {
  'use strict';

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

  const CURRENT_DATA_VERSION = '2.1';

  // Comprehensive Seed Dataset with Prices for Purchasing
  const INITIAL_BOOKS = [
    {
      id: 'book-1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'programming',
      categoryLabel: 'Programming',
      isbn: '978-0132350884',
      year: 2008,
      price: 28.50,
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
      price: 19.95,
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
      price: 16.99,
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
      price: 14.50,
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
      price: 32.00,
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
      price: 38.99,
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
      price: 29.95,
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
      price: 34.50,
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
      price: 18.00,
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
      price: 15.99,
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
      price: 13.95,
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
      price: 14.95,
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
      price: 11.99,
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
      price: 12.50,
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
      price: 16.50,
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
      price: 13.25,
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
      price: 9.99,
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
      price: 10.50,
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
      price: 21.99,
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
      price: 17.50,
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

  // Seed User Accounts with login credentials and their purchase/borrow histories
  const INITIAL_ACCOUNTS = [
    {
      id: 'M-001',
      name: 'John Smith',
      email: 'john@example.com',
      password: 'password123',
      role: 'member',
      membershipType: 'standard',
      status: 'active',
      borrowedBooks: [
        { bookId: 'book-1', title: 'Clean Code', borrowedDate: 'Sep 20', dueDate: 'Oct 04', status: 'borrowed' },
        { bookId: 'book-4', title: 'The Alchemist', borrowedDate: 'Sep 10', dueDate: 'Sep 24', status: 'overdue' }
      ],
      purchasedBooks: [
        {
          bookId: 'book-5',
          title: 'The Pragmatic Programmer',
          author: 'Andrew Hunt & David Thomas',
          price: 32.00,
          purchaseDate: 'Sep 15, 2026',
          invoiceNumber: 'INV-1001'
        }
      ]
    },
    {
      id: 'M-002',
      name: 'Sarah Ali',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'member',
      membershipType: 'student',
      status: 'active',
      borrowedBooks: [
        { bookId: 'book-2', title: 'JavaScript: The Good Parts', borrowedDate: 'Sep 18', dueDate: 'Oct 02', status: 'borrowed' }
      ],
      purchasedBooks: [
        {
          bookId: 'book-8',
          title: 'Structure and Interpretation of Computer Programs',
          author: 'Harold Abelson & Gerald Jay Sussman',
          price: 34.50,
          purchaseDate: 'Sep 12, 2026',
          invoiceNumber: 'INV-1002'
        }
      ]
    },
    {
      id: 'M-000',
      name: 'Chief Librarian',
      email: 'admin@quietstacks.com',
      password: 'admin123',
      role: 'admin',
      membershipType: 'faculty',
      status: 'active',
      borrowedBooks: [],
      purchasedBooks: [
        {
          bookId: 'book-3',
          title: 'Cosmos',
          author: 'Carl Sagan',
          price: 16.99,
          purchaseDate: 'Sep 01, 2026',
          invoiceNumber: 'INV-1000'
        }
      ]
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

      if (storedVersion !== CURRENT_DATA_VERSION || !localStorage.getItem(STORAGE_KEYS.BOOKS) || !localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
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
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
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

      // Generate member ID
      const members = this.getMembers();
      const nextNum = members.length + 1;
      const memberId = 'M-' + String(nextNum).padStart(3, '0');

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
      const newBook = {
        id: 'book-' + Date.now(),
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        category: bookData.category.toLowerCase(),
        categoryLabel: bookData.categoryLabel || bookData.category,
        isbn: bookData.isbn ? bookData.isbn.trim() : 'N/A',
        year: bookData.year ? parseInt(bookData.year, 10) : new Date().getFullYear(),
        price: bookData.price ? parseFloat(bookData.price) : 19.99,
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
    // User Borrow & Buy Actions
    // ------------------------------------------------------------------------

    /**
     * Borrows a book for a specific account
     */
    borrowBookForAccount(bookId, accountId) {
      const book = this.getBookById(bookId);
      if (!book) return { success: false, error: 'Book not found' };
      if (book.status !== 'available') return { success: false, error: 'Book is currently unavailable' };

      const account = this.getAccountById(accountId);
      if (!account) return { success: false, error: 'Account not found' };

      const borrowDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dueDateStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Create loan
      this.addLoan({
        bookId: book.id,
        bookTitle: book.title,
        memberId: account.id,
        memberName: account.name,
        borrowedDate: borrowDateStr,
        dueDate: dueDateStr,
        status: 'borrowed'
      });

      // Update account's borrowedBooks list
      const accounts = this.getAccounts();
      const accIndex = accounts.findIndex((a) => a.id === accountId);
      if (accIndex !== -1) {
        accounts[accIndex].borrowedBooks = accounts[accIndex].borrowedBooks || [];
        accounts[accIndex].borrowedBooks.push({
          bookId: book.id,
          title: book.title,
          author: book.author,
          borrowedDate: borrowDateStr,
          dueDate: dueDateStr,
          status: 'borrowed'
        });
        write(STORAGE_KEYS.ACCOUNTS, accounts);

        // Update active session if it matches
        const curr = this.getCurrentUser();
        if (curr && curr.id === accountId) {
          this.setCurrentUser(accounts[accIndex]);
        }
      }

      return { success: true, book, account };
    },

    /**
     * Returns a borrowed book for an account
     */
    returnBookForAccount(bookId, accountId) {
      const loans = this.getLoans();
      const loan = loans.find((l) => l.bookId === bookId && l.memberId === accountId);

      if (loan) {
        this.returnLoan(loan.id);
      } else {
        this.updateBook(bookId, { status: 'available' });
      }

      // Update account's borrowed list
      const accounts = this.getAccounts();
      const accIndex = accounts.findIndex((a) => a.id === accountId);
      if (accIndex !== -1 && accounts[accIndex].borrowedBooks) {
        accounts[accIndex].borrowedBooks = accounts[accIndex].borrowedBooks.filter((b) => b.bookId !== bookId);
        write(STORAGE_KEYS.ACCOUNTS, accounts);

        const curr = this.getCurrentUser();
        if (curr && curr.id === accountId) {
          this.setCurrentUser(accounts[accIndex]);
        }
      }

      return { success: true };
    },

    /**
     * Buys a book for an account (stores invoice and book in purchased list)
     */
    buyBookForAccount(bookId, accountId) {
      const book = this.getBookById(bookId);
      if (!book) return { success: false, error: 'Book not found' };

      const account = this.getAccountById(accountId);
      if (!account) return { success: false, error: 'Account not found' };

      const purchaseRecord = {
        bookId: book.id,
        title: book.title,
        author: book.author,
        price: book.price || 19.99,
        category: book.categoryLabel || book.category,
        purchaseDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000)
      };

      const accounts = this.getAccounts();
      const accIndex = accounts.findIndex((a) => a.id === accountId);
      if (accIndex !== -1) {
        accounts[accIndex].purchasedBooks = accounts[accIndex].purchasedBooks || [];
        accounts[accIndex].purchasedBooks.push(purchaseRecord);
        write(STORAGE_KEYS.ACCOUNTS, accounts);

        const curr = this.getCurrentUser();
        if (curr && curr.id === accountId) {
          this.setCurrentUser(accounts[accIndex]);
        }
      }

      return { success: true, purchase: purchaseRecord, book, account };
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
      const id = memberData.id || 'M-' + String(nextNum).padStart(3, '0');

      const newMember = {
        id: id,
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
      write(STORAGE_KEYS.VERSION, CURRENT_DATA_VERSION);
      write(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
      write(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
      write(STORAGE_KEYS.LOANS, INITIAL_LOANS);
      write(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
      // Set John Smith as default logged-in demo user for convenience
      write(STORAGE_KEYS.CURRENT_USER, INITIAL_ACCOUNTS[0]);
      this.recalculateStatistics();
    }
  };

  const LITERARY_QUOTES = [
    {
      text: "When you want something, all the universe conspires in helping you to achieve it.",
      author: "Paulo Coelho",
      source: "The Alchemist"
    },
    {
      text: "Somewhere, something incredible is waiting to be known.",
      author: "Carl Sagan",
      source: "Cosmos"
    },
    {
      text: "Truth can only be found in one place: the code.",
      author: "Robert C. Martin",
      source: "Clean Code"
    },
    {
      text: "Perhaps one did not want to be loved so much as to be understood.",
      author: "George Orwell",
      source: "1984"
    },
    {
      text: "You never really understand a person until you consider things from his point of view.",
      author: "Harper Lee",
      source: "To Kill a Mockingbird"
    },
    {
      text: "Don't live with broken windows. Fix bad designs, wrong decisions, and poor code when you see them.",
      author: "Andrew Hunt & David Thomas",
      source: "The Pragmatic Programmer"
    },
    {
      text: "The soul becomes dyed with the color of its thoughts.",
      author: "Marcus Aurelius",
      source: "Meditations"
    },
    {
      text: "Look up at the stars and not down at your feet. Try to make sense of what you see.",
      author: "Stephen Hawking",
      source: "A Brief History of Time"
    },
    {
      text: "There is always something left to love.",
      author: "Gabriel García Márquez",
      source: "One Hundred Years of Solitude"
    },
    {
      text: "The beginning is the most important part of the work.",
      author: "Plato",
      source: "The Republic"
    },
    {
      text: "Programs must be written for people to read, and only incidentally for machines to execute.",
      author: "Harold Abelson",
      source: "Structure and Interpretation of Computer Programs"
    }
  ];

  // Expose to global window
  window.LibraryStorage = StorageService;

  // Auto-initialize storage on script load
  StorageService.init();

})(window);
