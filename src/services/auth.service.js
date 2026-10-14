export class AuthService {
  constructor(storage) { this.storage = storage; }
  currentUser() { return this.storage.getCurrentUser(); }
  login(...args) { return this.storage.login(...args); }
  register(account) { return this.storage.register(account); }
  logout() { return this.storage.logout(); }
}
