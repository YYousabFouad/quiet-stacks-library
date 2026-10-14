import { eventBus } from '../core/event-bus.js';

export class CatalogService {
  constructor(storage, repositories) {
    this.storage = storage;
    this.repositories = repositories;
  }

  books() { return this.repositories.books.all(); }
  members() { return this.repositories.members.all(); }
  bookById(id) { return this.repositories.books.findById(id); }
  memberById(id) { return this.repositories.members.findById(id); }

  deleteBook(id) {
    const removed = this.repositories.books.remove(id);
    if (!removed) return false;
    this.repositories.loans.all().filter((loan) => loan.bookId === id)
      .forEach((loan) => {
        this.repositories.loans.remove(loan.id);
        const member = this.repositories.members.findById(loan.memberId);
        if (member) this.repositories.members.update(member.id, {
          borrowedCount: Math.max(0, (member.borrowedCount || 0) - 1)
        });
      });
    this.repositories.accounts.all().forEach((account) => {
      const borrowedBooks = (account.borrowedBooks || []).filter((book) => book.bookId !== id);
      if (borrowedBooks.length !== (account.borrowedBooks || []).length) {
        this.repositories.accounts.update(account.id, { borrowedBooks });
      }
    });
    this.#publish('book:deleted', { id });
    return true;
  }

  deleteMember(id) {
    const removed = this.repositories.members.remove(id);
    if (!removed) return false;
    this.repositories.loans.all().filter((loan) => loan.memberId === id)
      .forEach((loan) => this.repositories.loans.remove(loan.id));
    this.repositories.accounts.remove(id);
    if (this.storage.getCurrentUser()?.id === id) this.storage.clearCurrentUser();
    this.#publish('member:deleted', { id });
    return true;
  }

  resetDefaults() {
    this.storage.resetDefaults();
    this.#publish('library:reset');
  }

  addBook(book) {
    const result = this.repositories.books.create(createBookRecord(book));
    this.#publish('book:created', { record: result });
    return result;
  }

  addMember(member) {
    const record = createMemberRecord(member, member.id || `M-${String(Date.now()).slice(-3)}`);
    const result = this.repositories.members.create(record);
    this.#publish('member:created', { record: result });
    return result;
  }

  #publish(type, detail = {}) { eventBus.emit('library:updated', { type, ...detail }); }
}

import { createBookRecord } from '../domain/models/book.model.js';
import { createMemberRecord } from '../domain/models/member.model.js';
