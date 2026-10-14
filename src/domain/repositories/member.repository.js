import { JsonRepository } from './json.repository.js';
export class MemberRepository extends JsonRepository {
  constructor(driver) { super(driver, 'quiet_stacks_members'); }
}
