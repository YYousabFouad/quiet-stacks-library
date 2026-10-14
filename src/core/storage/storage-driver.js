/** Persistence boundary consumed by repositories. */
export class StorageDriver {
  get() { throw new Error('StorageDriver.get must be implemented'); }
  set() { throw new Error('StorageDriver.set must be implemented'); }
  remove() { throw new Error('StorageDriver.remove must be implemented'); }
}
