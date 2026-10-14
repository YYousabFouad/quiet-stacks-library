import { isLoanOverdue } from '../domain/models/loan.model.js';

export class StatsService {
  constructor(storage, repositories) { this.storage = storage; this.repositories = repositories; }
  statistics() {
    const books = this.repositories.books.all();
    const members = this.repositories.members.all();
    const loans = this.repositories.loans.all();
    const overdue = loans.filter((loan) => loan.status === 'overdue' || isLoanOverdue(loan)).length;
    return {
      totalBooks: books.length,
      totalMembers: members.length,
      borrowed: loans.length - overdue,
      overdue
    };
  }
}
