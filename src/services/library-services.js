import { BookRepository } from '../domain/repositories/book.repository.js';
import { MemberRepository } from '../domain/repositories/member.repository.js';
import { LoanRepository } from '../domain/repositories/loan.repository.js';
import { AccountRepository } from '../domain/repositories/account.repository.js';
import { LocalStorageDriver } from '../core/storage/local-storage-driver.js';
import { CatalogService } from './catalog.service.js';
import { LendingService } from './lending.service.js';
import { AuthService } from './auth.service.js';
import { StatsService } from './stats.service.js';
import { AccountsService } from './accounts.service.js';
import { QuotesService } from './quotes.service.js';
import { escapeHtml } from '../core/utils/html.js';

/** Application boundary over the established domain/storage implementation. */
export class LibraryServices {
  constructor(storage) {
    this.storage = storage;
    const driver = new LocalStorageDriver();
    this.repositories = {
      books: new BookRepository(driver),
      members: new MemberRepository(driver),
      loans: new LoanRepository(driver),
      accounts: new AccountRepository(driver)
    };
    this.catalog = new CatalogService(storage, this.repositories);
    this.lending = new LendingService(storage, this.repositories);
    this.auth = new AuthService(storage);
    this.stats = new StatsService(storage, this.repositories);
    this.accounts = new AccountsService(storage, this.repositories.accounts, this.repositories.books);
    this.quotes = new QuotesService(storage);
    this.escapeHtml = escapeHtml;
  }

}
