import { JsonRepository } from './json.repository.js';
export class BookRepository extends JsonRepository {
  constructor(driver) { super(driver, 'quiet_stacks_books'); }
}
