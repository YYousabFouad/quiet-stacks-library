import { eventBus } from '../core/event-bus.js';
import { canBorrow, getLoanDates, isLoanOverdue } from '../domain/models/loan.model.js';

export class LendingService {
  constructor(storage, repositories) {
    this.storage = storage;
    this.repositories = repositories;
    this.repository = repositories.loans;
  }

  loans() {
    return this.repository.all().map((loan) => ({
      ...loan,
      status: isLoanOverdue(loan) ? 'overdue' : loan.status
    }));
  }
  dates(durationDays) { return getLoanDates(durationDays); }

  addLoan(loan, eventType = 'loan:created') {
    const book = this.repositories.books.findById(loan.bookId);
    if (!book) return { success: false, error: 'Book not found' };
    if (book.status !== 'available') return { success: false, error: 'Book is currently unavailable' };
    const record = this.repository.create({
      ...loan,
      id: loan.id || `loan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      borrowedDate: loan.borrowedDate || this.dates().borrowedDate,
      dueDate: loan.dueDate || this.dates().dueDate,
      status: loan.status || 'borrowed'
    });
    this.repositories.books.update(book.id, { status: record.status });
    const member = this.repositories.members.findById(loan.memberId);
    if (member) this.repositories.members.update(member.id, { borrowedCount: (member.borrowedCount || 0) + 1 });
    const account = this.repositories.accounts.findById(loan.memberId);
    if (account) {
      this.repositories.accounts.update(account.id, {
        borrowedBooks: [...(account.borrowedBooks || []), {
          bookId: book.id, title: book.title, author: book.author,
          borrowedDate: record.borrowedDate, dueDate: record.dueDate,
          dueDateISO: record.dueDateISO, status: record.status
        }]
      });
    }
    this.#refreshStatistics();
    return this.#publish(() => ({ success: true, loan: record }), eventType);
  }

  borrow(bookId, accountId) {
    const book = this.repositories.books.findById(bookId);
    const account = this.repositories.accounts.findById(accountId);
    if (!book) return { success: false, error: 'Book not found' };
    if (!account) return { success: false, error: 'Account not found' };
    if (!canBorrow(account, this.loans().filter((loan) => loan.memberId === accountId).length)) {
      return { success: false, error: 'Your membership borrowing limit has been reached' };
    }
    const dates = this.dates(14);
    return this.addLoan({
      bookId, bookTitle: book.title, memberId: account.id,
      memberName: account.name, ...dates, status: 'borrowed'
    }, 'loan:borrowed');
  }

  return(bookId, accountId) {
    const loan = this.loans().find((item) => item.bookId === bookId && item.memberId === accountId);
    if (!loan) return { success: false, error: 'Loan not found' };
    return this.returnLoan(loan.id);
  }

  returnLoan(loanId) {
    const loan = this.repository.findById(loanId);
    if (!loan) return false;
    this.repository.remove(loanId);
    this.repositories.books.update(loan.bookId, { status: 'available' });
    const member = this.repositories.members.findById(loan.memberId);
    if (member) this.repositories.members.update(member.id, { borrowedCount: Math.max(0, (member.borrowedCount || 0) - 1) });
    this.repositories.accounts.all().forEach((account) => {
      const borrowedBooks = (account.borrowedBooks || []).filter((book) => book.bookId !== loan.bookId);
      if (borrowedBooks.length !== (account.borrowedBooks || []).length) {
        this.repositories.accounts.update(account.id, { borrowedBooks });
      }
    });
    this.#refreshStatistics();
    this.#publish(() => true, 'loan:returned');
    return true;
  }

  #refreshStatistics() { this.storage.recalculateStatistics(); }

  #publish(operation, type) {
    const result = operation();
    if (result?.success !== false) eventBus.emit('library:updated', { type, result });
    return result;
  }
}
