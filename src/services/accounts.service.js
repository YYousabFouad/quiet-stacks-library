import { eventBus } from '../core/event-bus.js';
import { createPurchaseRecord } from '../domain/models/account.model.js';

export class AccountsService {
  constructor(storage, repository, books) {
    this.storage = storage;
    this.repository = repository;
    this.books = books;
  }

  byId(id) { return this.repository.findById(id); }

  purchase(bookId, accountId) {
    const book = this.books.findById(bookId);
    if (!book) return { success: false, error: 'Book not found' };
    const account = this.repository.findById(accountId);
    if (!account) return { success: false, error: 'Account not found' };
    const purchase = createPurchaseRecord(book);
    const updated = this.repository.update(accountId, {
      purchasedBooks: [...(account.purchasedBooks || []), purchase]
    });
    const result = { success: true, purchase, book, account: updated };
    if (result?.success) eventBus.emit('library:updated', { type: 'account:purchase', result });
    return result;
  }
}
