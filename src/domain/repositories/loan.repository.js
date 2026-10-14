import { JsonRepository } from './json.repository.js';
export class LoanRepository extends JsonRepository {
  constructor(driver) { super(driver, 'quiet_stacks_loans'); }
}
