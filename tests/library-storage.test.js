import { beforeEach, describe, expect, it } from 'vitest';
import { StorageService } from '../src/core/storage/storage-service.js';
import { BORROW_LIMITS, canBorrow, getLoanDates } from '../src/domain/models/loan.model.js';
import { LibraryServices } from '../src/services/library-services.js';
import { eventBus } from '../src/core/event-bus.js';

const library = new LibraryServices(StorageService);
describe('lending rules', () => {
  beforeEach(() => StorageService.resetDefaults());

  it('marks a borrowed title unavailable and keeps account and member counts in sync', () => {
    const account = library.accounts.byId('M-001');
    const firstLoan = library.lending.loans().find((loan) => loan.memberId === account.id);
    library.lending.returnLoan(firstLoan.id);

    let emittedEvent;
    const unsubscribe = eventBus.on('library:updated', (event) => { emittedEvent = event; });
    const result = library.lending.borrow('book-8', account.id);
    unsubscribe();

    expect(result.success).toBe(true);
    expect(emittedEvent.type).toBe('loan:borrowed');
    expect(library.catalog.bookById('book-8').status).toBe('borrowed');
    expect(library.catalog.members().find((member) => member.id === account.id).borrowedCount).toBe(3);
    expect(library.accounts.byId(account.id).borrowedBooks).toEqual(
      expect.arrayContaining([expect.objectContaining({ bookId: 'book-8', status: 'borrowed' })])
    );
  });

  it('enforces per-membership borrowing limits', () => {
    expect(canBorrow({ membershipType: 'standard' }, BORROW_LIMITS.standard)).toBe(false);
    expect(library.lending.borrow('book-8', 'M-001').success).toBe(false);
    expect(library.lending.borrow('book-8', 'M-002').success).toBe(true);
  });

  it('calculates a 14-day due date from the supplied date', () => {
    const dates = getLoanDates(14, new Date('2026-10-01T12:00:00Z'));
    expect(dates.borrowedDate).toBe('Oct 1');
    expect(dates.dueDate).toBe('Oct 15');
    expect(dates.dueDateISO).toBe('2026-10-15T12:00:00.000Z');
  });

  it('marks a loan overdue when its due timestamp has passed', () => {
    StorageService.addLoan({
      bookId: 'book-8', bookTitle: 'SICP', memberId: 'M-001', memberName: 'John Smith',
      dueDate: 'Oct 10', dueDateISO: '2026-10-10T12:00:00.000Z'
    });

    const stats = StorageService.recalculateStatistics(new Date('2026-10-11T12:00:00.000Z'));

    expect(StorageService.getLoans().find((loan) => loan.bookId === 'book-8').status).toBe('overdue');
    expect(StorageService.getBookById('book-8').status).toBe('overdue');
    expect(stats.overdue).toBe(6);
  });

  it('records purchases with an invoice, timestamp and catalog price', () => {
    const result = library.accounts.purchase('book-8', 'M-001');

    expect(result.success).toBe(true);
    expect(result.purchase.price).toBe(34.5);
    expect(result.purchase.invoiceNumber).toMatch(/^INV-\d{4}$/);
    expect(Number.isNaN(Date.parse(result.purchase.purchaseDate))).toBe(false);
    expect(library.accounts.byId('M-001').purchasedBooks).toContainEqual(result.purchase);
  });
});
