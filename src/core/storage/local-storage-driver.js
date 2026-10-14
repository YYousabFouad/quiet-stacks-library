import { StorageDriver } from './storage-driver.js';

/** Safe JSON storage adapter. A failed write is surfaced to callers. */
export class LocalStorageDriver extends StorageDriver {
  constructor(storage = globalThis.localStorage) {
    super();
    this.storage = storage;
  }

  get(key, fallback = null) {
    try {
      const raw = this.storage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      console.error(`Unable to read ${key} from localStorage`, error);
      return fallback;
    }
  }

  getRaw(key) {
    try { return this.storage.getItem(key); }
    catch (error) {
      console.error(`Unable to read ${key} from localStorage`, error);
      return null;
    }
  }

  set(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Unable to write ${key} to localStorage`, error);
      return false;
    }
  }

  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Unable to remove ${key} from localStorage`, error);
      return false;
    }
  }
}
