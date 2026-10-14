export class QuotesService {
  constructor(storage) { this.storage = storage; }
  all() { return this.storage.getQuotes(); }
}
