/** Seed records for the Quiet Stacks local demo dataset. */
export const INITIAL_ACCOUNTS = [
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
        { bookId: 'book-4', title: 'The Alchemist', borrowedDate: 'Sep 10', dueDate: 'Sep 24', status: 'overdue' },
        { bookId: 'book-16', title: 'Crime and Punishment', borrowedDate: 'Sep 27', dueDate: 'Oct 11', status: 'borrowed' }
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
        { bookId: 'book-2', title: 'JavaScript: The Good Parts', borrowedDate: 'Sep 18', dueDate: 'Oct 02', status: 'borrowed' },
        { bookId: 'book-5', title: 'The Pragmatic Programmer', borrowedDate: 'Sep 28', dueDate: 'Oct 12', status: 'borrowed' },
        { bookId: 'book-20', title: 'Guns, Germs, and Steel', borrowedDate: 'Sep 05', dueDate: 'Sep 19', status: 'overdue' }
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
