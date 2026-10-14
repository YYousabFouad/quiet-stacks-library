import { JsonRepository } from './json.repository.js';
export class AccountRepository extends JsonRepository {
  constructor(driver) { super(driver, 'quiet_stacks_accounts'); }
}
