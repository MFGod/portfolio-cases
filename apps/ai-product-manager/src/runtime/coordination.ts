export type Coordination = {
  exclusive<T>(name: string, action: () => T | Promise<T>): Promise<T>;
  ifAvailable<T>(name: string, action: () => T | Promise<T>): Promise<T | undefined>;
  subscribe(listener: () => void): () => void;
};

export function browserCoordination(slug: string): Coordination {
  function locks() {
    if (!globalThis.navigator?.locks)
      throw new Error('Не удалось открыть хранилище. Откройте сайт в актуальной версии браузера.');
    return navigator.locks;
  }
  return {
    async exclusive<T>(name: string, action: () => T | Promise<T>): Promise<T> {
      return await locks().request(`${slug}:${name}`, action);
    },
    async ifAvailable<T>(name: string, action: () => T | Promise<T>): Promise<T | undefined> {
      return await locks().request(`${slug}:${name}`, { ifAvailable: true }, (lock) =>
        lock ? action() : undefined,
      );
    },
    subscribe(listener) {
      const handle = (event: StorageEvent) => {
        if (event.key === `${slug}:workspace` || event.key === null) listener();
      };
      globalThis.addEventListener('storage', handle);
      return () => globalThis.removeEventListener('storage', handle);
    },
  };
}
