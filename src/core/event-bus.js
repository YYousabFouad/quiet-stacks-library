/** Small in-process pub/sub channel for decoupled application updates. */
export class EventBus {
  #listeners = new Map();

  on(eventName, listener) {
    const listeners = this.#listeners.get(eventName) || new Set();
    listeners.add(listener);
    this.#listeners.set(eventName, listeners);
    return () => listeners.delete(listener);
  }

  emit(eventName, detail) {
    this.#listeners.get(eventName)?.forEach((listener) => listener(detail));
  }
}

export const eventBus = new EventBus();
