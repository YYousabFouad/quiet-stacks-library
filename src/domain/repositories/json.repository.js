/** Generic collection repository; domain services depend on this contract. */
export class JsonRepository {
  constructor(driver, key) {
    this.driver = driver;
    this.key = key;
  }

  all() { return this.driver.get(this.key, []); }
  findById(id) { return this.all().find((record) => record.id === id) || null; }
  saveAll(records) { return this.driver.set(this.key, records); }

  create(record) {
    const records = this.all();
    records.unshift(record);
    this.saveAll(records);
    return record;
  }

  update(id, updates) {
    const records = this.all();
    const index = records.findIndex((record) => record.id === id);
    if (index < 0) return null;
    records[index] = { ...records[index], ...updates };
    this.saveAll(records);
    return records[index];
  }

  remove(id) {
    const records = this.all();
    const remaining = records.filter((record) => record.id !== id);
    if (remaining.length === records.length) return false;
    this.saveAll(remaining);
    return true;
  }
}
